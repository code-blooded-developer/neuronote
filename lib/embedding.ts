import { CohereClient } from "cohere-ai";

import { EmbeddingType } from "../types/document";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY!,
});

async function generateEmbeddings(
  input: string | string[],
  type: EmbeddingType = "document",
): Promise<number[] | number[][]> {
  try {
    const texts = Array.isArray(input) ? input : [input];
    const BATCH_SIZE = 96; // Cohere's limit

    // If input is small enough, process normally
    if (texts.length <= BATCH_SIZE) {
      const response = await cohere.v2.embed({
        texts,
        model: "embed-v4.0",
        inputType: type === "document" ? "search_document" : "search_query",
        embeddingTypes: ["float"],
      });

      const embeddings = response.embeddings.float || [];
      return Array.isArray(input) ? embeddings : embeddings[0] || [];
    }

    // Process in batches for large inputs
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);

      const response = await cohere.v2.embed({
        texts: batch,
        model: "embed-v4.0",
        inputType: type === "document" ? "search_document" : "search_query",
        embeddingTypes: ["float"],
      });

      const batchEmbeddings = response.embeddings.float || [];
      allEmbeddings.push(...batchEmbeddings);

      // Optional: Add a small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < texts.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return Array.isArray(input) ? allEmbeddings : allEmbeddings[0] || [];
  } catch (err) {
    console.error("Cohere embedding error:", err);
    return Array.isArray(input) ? [] : [];
  }
}

export async function generateDocumentEmbeddings(
  texts: string[],
): Promise<number[][]> {
  return generateEmbeddings(texts, "document") as Promise<number[][]>;
}

export async function generateQueryEmbeddings(
  query: string,
): Promise<number[]> {
  return generateEmbeddings(query, "query") as Promise<number[]>;
}
