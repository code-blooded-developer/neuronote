import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function createTextChunks(
  text: string,
  chunkSize = 1000,
  chunkOverlap = 200,
): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });

  const docs = await splitter.splitText(text);
  return docs;
}
