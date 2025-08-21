import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY!,
});

export async function getChatResponse(content: string): Promise<string> {
  try {
    const response = await cohere.v2.chat({
      model: "command-a-03-2025",
      messages: [
        {
          role: "user",
          content,
        },
      ],
    });

    if (!response || !response.message || !response.message.content) {
      throw new Error("Invalid response from chat model");
    }

    if (response.message.content[0].type === "text") {
      return response.message.content[0].text || "No response from chat model";
    }

    return "No response from chat model";
  } catch (err) {
    console.error("Cohere chat error:", err);
    throw new Error("Failed to get chat response");
  }
}
