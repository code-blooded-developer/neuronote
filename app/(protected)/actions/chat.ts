import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getQueryEmbeddings } from "@/lib/embedding";
import { getChatResponse } from "@/lib/chat";

export async function queryDocuments(
  query: string,
  documentIds?: string[],
  chatId?: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const chat = chatId
    ? await prisma.chat.findUnique({ where: { id: chatId } })
    : await prisma.chat.create({
        data: {
          userId: session.user.id,
          title: query.slice(0, 50),
        },
      });

  if (!chat) throw new Error("Chat not found");

  await prisma.message.create({
    data: {
      chatId: chat.id,
      role: "user",
      content: query,
    },
  });

  const queryEmbedding = await getQueryEmbeddings(query);

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
    ...params
  );

  const context = results
    .map((r) => `From ${r.fileName}:\n${r.content}`)
    .join("\n\n");

  const chatResponse = await getChatResponse(
    `Use ONLY the following context to answer the question. If the answer is not present, say "I don't know".\n\nContext:\n${context}\n\nQuestion: ${query}`
  );

  await prisma.message.create({
    data: {
      chatId: chat.id,
      role: "assistant",
      content: chatResponse,
    },
  });

  return {
    chatId: chat.id,
    answer: chatResponse,
    sources: results.map((r) => ({
      chunkId: r.id,
      fileName: r.fileName,
      similarity: r.similarity,
    })),
  };
}
