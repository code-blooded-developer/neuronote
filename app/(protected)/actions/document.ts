"use server";

import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { DocumentStatus } from "@prisma/client";

import { Document } from "@/lib/validation";
import { parseDocument } from "@/lib/parseDocument";
import { splitTextWithLangchain } from "@/lib/chunkText";
import { getDocEmbeddings } from "@/lib/embedChunks";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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
  fileName: string
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
  file: { name: string; type: string; size: number }
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

  parseAndStoreChunks(doc);

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

export async function softDeleteDocument(documentId: string) {
  const user = await requireUser();

  return prisma.document.updateMany({
    where: { id: documentId, userId: user.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });
}

export async function getDocumentWithUrl(documentId: string) {
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) throw new Error("Document not found");

  return attachUrl(doc);
}

export async function parseAndStoreChunks(doc: Omit<Document, "url">) {
  try {
    const { data, error } = await supabase.storage
      .from("documents")
      .download(doc.storagePath);

    if (error || !data) throw error || new Error("File download failed");

    const buffer = await data.arrayBuffer();
    const text = await parseDocument(buffer, doc.mimeType);

    const chunks = await splitTextWithLangchain(text);

    const embeddings = await getDocEmbeddings(chunks);

    await prisma.$transaction(
      chunks.map((chunk, i) =>
        prisma.documentChunk.create({
          data: {
            documentId: doc.id,
            content: chunk,
            embedding: embeddings[i],
          },
        })
      )
    );

    await prisma.document.update({
      where: { id: doc.id },
      data: { status: DocumentStatus.ready },
    });

    return { success: true, chunks: chunks.length };
  } catch (err) {
    console.error("Parsing failed:", err);

    await prisma.document.update({
      where: { id: doc.id },
      data: { status: DocumentStatus.error },
    });

    return { success: false, error: "Failed to parse document" };
  }
}
