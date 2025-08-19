"use server";

import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getSignedUploadUrl(
  fileName: string
): Promise<{ signedUrl: string; path: string; documentId: string }> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const documentId = randomUUID();
  const storagePath = `documents/${session.user.id}/${documentId}/${fileName}`;

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
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const doc = await prisma.document.create({
    data: {
      id: documentId,
      userId: session.user.id,
      fileName: file.name,
      storagePath: path,
      mimeType: file.type,
      size: file.size,
      status: "ready",
    },
  });

  return doc;
}

export async function getUserDocuments() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const docs = await prisma.document.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  const docsWithUrls = await Promise.all(
    docs.map(async (doc) => {
      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(doc.storagePath, 60 * 60);

      if (error) throw error;

      return {
        ...doc,
        url: data.signedUrl,
      };
    })
  );

  return docsWithUrls;
}

export async function toggleStar(documentId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId: session.user.id, deletedAt: null },
  });
  if (!doc) throw new Error("Document not found");

  return prisma.document.update({
    where: { id: documentId },
    data: { isStarred: !doc.isStarred },
  });
}

export async function softDeleteDocument(documentId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;
  return prisma.document.updateMany({
    where: { id: documentId, userId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
}


export async function getDocumentWithUrl(documentId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!doc) throw new Error("Document not found");

  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(doc.storagePath, 60 * 60); // 1 hour

  if (error || !data) throw error ?? new Error("Failed to generate signed URL");

  return {
    ...doc,
    url: data.signedUrl,
  };
}