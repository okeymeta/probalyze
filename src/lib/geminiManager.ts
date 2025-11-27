import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

// Lazy initialization to avoid errors when key is missing
let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiClient && apiKey) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export async function generateMarketDescription(
  marketTitle: string,
  category: string
): Promise<string> {
  const client = getAiClient();
  
  if (!client) {
    throw new Error("Gemini API key not configured");
  }

  const prompt = `You are a prediction market expert. Generate a compelling, realistic market description for a prediction market.

Market Title: ${marketTitle}
Category: ${category}

Requirements:
- 2-3 sentences maximum
- Professional and engaging tone
- Include specific details about what traders are betting on
- Mention key factors that might influence the outcome
- Make it sound real and relevant to current events
- NO promotional language
- Start directly with the description (no "Description:" prefix)

Generate only the description text:`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to generate description. Please try again.";
  } catch (error) {
    throw new Error(`Failed to generate description: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
