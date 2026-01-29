import mammoth from "mammoth";
// @ts-expect-error this library does not export types
import pdfParse from "pdf-parse-fixed";

export async function extractTextFromDocument(
  buffer: ArrayBuffer,
  mimeType: string,
): Promise<string> {
  const nodeBuffer = Buffer.from(buffer);

  switch (mimeType) {
    case "application/pdf": {
      const data = await pdfParse(nodeBuffer);
      return data.text;
    }

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      const result = await mammoth.extractRawText({ buffer: nodeBuffer });
      return result.value;
    }

    case "text/plain": {
      return nodeBuffer.toString("utf-8");
    }

    default:
      throw new Error(`Unsupported mime type: ${mimeType}`);
  }
}
