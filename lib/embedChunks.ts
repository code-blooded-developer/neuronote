import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY!,
});

export async function getDocEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await cohere.v2.embed({
      texts,
      model: "embed-v4.0",
      inputType: "search_document",
      embeddingTypes: ["float"],
    });

    return response.embeddings.float || [];
  } catch (err) {
    console.error("Cohere embedding error:", err);
    return [];
  }
}
