"use server";

import { auth } from "@/auth";
import { MessageRole } from "@prisma/client";

import { getChatResponse } from "@/lib/chat";
import { generateQueryEmbeddings } from "@/lib/embedding";
import prisma from "@/lib/prisma";

export async function createEmptyChat(title: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const chat = await prisma.chat.create({
    data: {
      userId: session.user.id,
      title: title.slice(0, 50),
    },
  });

  return {
    id: chat.id,
    title: chat.title,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    userId: chat.userId,
    documentIds: [],
  };
}

export async function deleteChat(chatId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const chat = await prisma.chat.findUnique({
    where: { id: chatId, userId: session.user.id },
  });

  if (!chat) throw new Error("Chat not found");

  await prisma.chat.delete({
    where: { id: chatId },
  });

  return { success: true };
}

export async function renameChat(chatId: string, newTitle: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const chat = await prisma.chat.findUnique({
    where: { id: chatId, userId: session.user.id },
  });

  if (!chat) throw new Error("Chat not found");

  const updatedChat = await prisma.chat.update({
    where: { id: chatId },
    data: { title: newTitle.slice(0, 50) },
    include: { documents: { include: { document: true } } },
  });

  return {
    id: updatedChat.id,
    title: updatedChat.title,
    createdAt: updatedChat.createdAt,
    updatedAt: updatedChat.updatedAt,
    userId: updatedChat.userId,
    documentIds: updatedChat.documents.map((doc) => doc.document.id),
  };
}

export async function queryDocuments(
  query: string,
  documentIds?: string[],
  chatId?: string,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const chat = chatId
    ? await prisma.chat.findUnique({
        where: { id: chatId },
        select: {
          id: true,
          userId: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          documents: {
            select: {
              documentId: true,
            },
          },
        },
      })
    : await prisma.chat.create({
        data: {
          userId: session.user.id,
          title: query.slice(0, 50),
          documents:
            documentIds && documentIds.length > 0
              ? {
                  create: documentIds.map((id) => ({
                    document: { connect: { id } },
                  })),
                }
              : undefined,
        },
        select: {
          id: true,
          userId: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          documents: {
            select: {
              documentId: true,
            },
          },
        },
      });

  if (!chat) throw new Error("Chat not found");

  const normalizedChat = {
    ...chat,
    documentIds: chat.documents.map((d) => d.documentId),
  };

  if (chatId && documentIds && documentIds.length > 0) {
    const existingIds = new Set(chat.documents.map((d) => d.documentId));

    const newDocumentIds = documentIds.filter((id) => !existingIds.has(id));

    if (newDocumentIds.length > 0) {
      await prisma.chatDocument.createMany({
        data: newDocumentIds.map((id) => ({
          chatId: chat.id,
          documentId: id,
        })),
        skipDuplicates: true,
      });
    }
  }

  await prisma.message.create({
    data: {
      chatId: chat.id,
      role: MessageRole.user,
      content: query,
    },
  });

  const queryEmbedding = await generateQueryEmbeddings(query);

  let filterClause = "";
  const params: (string | number[])[] = [queryEmbedding, session.user.id];

  if (documentIds && documentIds.length > 0) {
    const placeholders = documentIds.map((_, i) => `$${i + 3}`).join(", ");
    filterClause = `AND c."documentId" IN (${placeholders})`;
    params.push(...documentIds);
  }

  type QueryResult = {
    id: string;
    content: string;
    documentId: string;
    similarity: number;
    fileName: string;
  };

  const results = await prisma.$queryRawUnsafe<QueryResult[]>(
    `
    SELECT c.id, c.content, c."documentId", 
           1 - (c.embedding <=> $1::vector) AS similarity,
           d."fileName"
    FROM "DocumentChunk" c
    JOIN "Document" d ON c."documentId" = d.id
    WHERE d."userId" = $2
    ${filterClause}
    ORDER BY c.embedding <-> $1::vector
    LIMIT 5;
  `,
    ...params,
  );

  const context = results
    .map((r) => `From ${r.fileName}:\n${r.content}`)
    .join("\n\n");

  const chatResponse = await getChatResponse(
    `Use ONLY the following context to answer the question. If the answer is not present, say "I don't know".\n\nContext:\n${context}\n\nQuestion: ${query}`,
  );

  await prisma.message.create({
    data: {
      chatId: chat.id,
      role: MessageRole.assistant,
      content: chatResponse,
    },
  });

  return {
    chat: normalizedChat,
    answer: chatResponse,
    sources: results.map((r) => ({
      chunkId: r.id,
      fileName: r.fileName,
      similarity: r.similarity,
    })),
  };
}

export async function getUserChats() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const chats = await prisma.chat.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      documents: {
        select: {
          documentId: true,
        },
      },
    },
  });

  return chats.map((chat) => ({
    id: chat.id,
    title: chat.title,
    userId: chat.userId,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    documentIds: chat.documents.map((d) => d.documentId),
  }));
}

export async function getChatMessages(chatId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const chat = await prisma.chat.findUnique({
    where: { id: chatId, userId: session.user.id },
  });
  if (!chat) throw new Error("Chat not found");

  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
  });

  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    createdAt: msg.createdAt,
  }));
}
