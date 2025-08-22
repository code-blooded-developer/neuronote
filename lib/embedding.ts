import { CohereClient } from "cohere-ai";

import { EmbeddingType } from "../types/document";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY!,
});

async function generateEmbeddings(
  input: string | string[],
  type: EmbeddingType = "document"
): Promise<number[] | number[][]> {
  try {
    const texts = Array.isArray(input) ? input : [input];

    const response = await cohere.v2.embed({
      texts,
      model: "embed-v4.0",
      inputType: type === "document" ? "search_document" : "search_query",
      embeddingTypes: ["float"],
    });

    const embeddings = response.embeddings.float || [];

    return Array.isArray(input) ? embeddings : embeddings[0] || [];
  } catch (err) {
    console.error("Cohere embedding error:", err);
    return Array.isArray(input) ? [] : [];
  }
}

export async function generateDocumentEmbeddings(
  texts: string[]
): Promise<number[][]> {
  return generateEmbeddings(texts, "document") as Promise<number[][]>;
}

export async function generateQueryEmbeddings(
  query: string
): Promise<number[]> {
  return generateEmbeddings(query, "query") as Promise<number[]>;
}
