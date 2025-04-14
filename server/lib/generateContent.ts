import OpenAI from "openai";

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Validates that the OpenAI API key is present
 */
function validateApiKey(): void {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }
}

/**
 * Generates content based on a prompt using OpenAI
 * @param prompt - The prompt to send to OpenAI
 * @returns The generated content
 */
export async function generateContent(prompt: string): Promise<string> {
  try {
    validateApiKey();

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer and career coach. Your task is to help users create professional, concise, and impactful resume content. Focus on achievements and skills that employers value."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "";
  } catch (error: any) {
    console.error("Error generating content with OpenAI:", error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}