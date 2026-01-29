"use server";

import { auth } from "@/auth";
import { DocumentStatus } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

import { createTextChunks } from "@/lib/chunking";
import { generateDocumentEmbeddings } from "@/lib/embedding";
import { extractTextFromDocument } from "@/lib/parsing";
import prisma from "@/lib/prisma";

import { Document } from "@/types/document";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

async function getSignedUrl(storagePath: string, expiresIn = 60 * 60) {
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data) throw error ?? new Error("Failed to generate signed URL");
  return data.signedUrl;
}

async function attachUrl(doc: Omit<Document, "url">) {
  return {
    ...doc,
    url: await getSignedUrl(doc.storagePath),
  };
}

export async function getSignedUploadUrl(
  fileName: string,
): Promise<{ signedUrl: string; path: string; documentId: string }> {
  const user = await requireUser();

  const documentId = randomUUID();
  const storagePath = `documents/${user.id}/${documentId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUploadUrl(storagePath);

  if (error) throw error;

  return { signedUrl: data.signedUrl, path: storagePath, documentId };
}

export async function createDocumentEntry(
  documentId: string,
  path: string,
  file: { name: string; type: string; size: number },
) {
  const user = await requireUser();

  const doc = await prisma.document.create({
    data: {
      id: documentId,
      userId: user.id,
      fileName: file.name,
      storagePath: path,
      mimeType: file.type,
      size: file.size,
      status: DocumentStatus.processing,
    },
  });

  processDocumentContent(doc);

  return attachUrl(doc);
}

export async function getUserDocuments() {
  const user = await requireUser();

  const docs = await prisma.document.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return Promise.all(docs.map(attachUrl));
}

export async function toggleStar(documentId: string) {
  const user = await requireUser();

  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId: user.id, deletedAt: null },
  });
  if (!doc) throw new Error("Document not found");

  return prisma.document.update({
    where: { id: documentId },
    data: { isStarred: !doc.isStarred },
  });
}

export async function trashDocument(documentId: string) {
  const user = await requireUser();

  return prisma.document.updateMany({
    where: { id: documentId, userId: user.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });
}

export async function purgeDocument(documentId: string) {
  const user = await requireUser();

  // First, verify the document exists and belongs to the user
  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId: user.id },
  });

  if (!doc) {
    throw new Error("Document not found or access denied");
  }

  try {
    // Use a transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // 1. Delete messages from chats that use this document
      await tx.message.deleteMany({
        where: {
          chat: {
            documents: {
              some: { documentId },
            },
          },
        },
      });

      // 2. Delete chat-document associations
      await tx.chatDocument.deleteMany({
        where: { documentId },
      });

      // 3. Delete chats that no longer have any documents (optional - you might want to keep empty chats)
      await tx.chat.deleteMany({
        where: {
          userId: user.id,
          documents: { none: {} }, // chats with no documents
        },
      });

      // 4. Delete document chunks
      await tx.documentChunk.deleteMany({
        where: { documentId },
      });

      // 5. Remove document-tag associations (many-to-many relationship)
      await tx.document.update({
        where: { id: documentId },
        data: {
          tags: {
            set: [], // Remove all tag associations
          },
        },
      });

      // 6. Finally, delete the document record
      await tx.document.delete({
        where: { id: documentId },
      });
    });

    // 7. Delete file from Supabase storage (outside transaction as it's external)
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([doc.storagePath]);

    if (storageError) {
      console.error("Failed to delete file from storage:", storageError);
    }

    return {
      success: true,
      message: "Document and all related data permanently deleted",
    };
  } catch (error) {
    console.error("Hard delete failed:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to delete document: ${error.message}`
        : "Failed to delete document",
    );
  }
}

export async function getDocumentWithUrl(documentId: string) {
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) throw new Error("Document not found");

  return attachUrl(doc);
}

export async function processDocumentContent(doc: Document) {
  try {
    const { data, error } = await supabase.storage
      .from("documents")
      .download(doc.storagePath);

    if (error || !data) {
      throw new Error(
        `File download failed: ${error?.message || "Unknown error"}`,
      );
    }

    const buffer = await data.arrayBuffer();
    const text = await extractTextFromDocument(buffer, doc.mimeType);

    if (!text || text.trim().length === 0) {
      throw new Error("Document text extraction resulted in empty content");
    }

    const chunks = await createTextChunks(text);

    if (!chunks || chunks.length === 0) {
      throw new Error("Text chunking resulted in no chunks");
    }

    const embeddings = await generateDocumentEmbeddings(chunks);

    if (!embeddings || embeddings.length !== chunks.length) {
      throw new Error("Vector embedding generation failed or length mismatch");
    }

    await prisma.$transaction(
      chunks.map(
        (chunk, i) =>
          prisma.$executeRaw`
      INSERT INTO "DocumentChunk" ("id", "documentId", "content", "embedding", "createdAt")
      VALUES (${crypto.randomUUID()}, ${doc.id}, ${chunk}, ${
        embeddings[i]
      }, NOW())
    `,
      ),
    );

    await prisma.document.update({
      where: { id: doc.id },
      data: { status: DocumentStatus.ready },
    });

    return { success: true, chunks: chunks.length };
  } catch (err) {
    console.error("Document processing failed:", err);

    await prisma.document.update({
      where: { id: doc.id },
      data: { status: DocumentStatus.error },
    });

    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to process document",
    };
  }
}

export async function retryDocumentProcessing(documentId: string) {
  const user = await requireUser();

  const doc = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId: user.id,
      deletedAt: null,
      status: { in: [DocumentStatus.error] },
    },
  });

  if (!doc) {
    throw new Error("Document not found or cannot be retried");
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { status: DocumentStatus.processing },
  });

  await prisma.documentChunk.deleteMany({
    where: { documentId },
  });

  return processDocumentContent(doc);
}

export async function getUserReadyDocuments() {
  const user = await requireUser();

  const docs = await prisma.document.findMany({
    where: {
      userId: user.id,
      status: DocumentStatus.ready,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  return docs;
}
