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
