import { GoogleGenAI } from "@google/genai";

// Get API key from environment - Try both Vite and direct env vars
const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || 
               (import.meta.env.VITE_GOOGLE_API_KEY as string) || 
               (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY) || 
               '';

// Log for debugging
if (typeof window !== 'undefined') {
  console.log('🔍 Gemini API Key Status:', apiKey ? '✅ Loaded' : '❌ Not found');
}

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
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    return response.text || "Unable to generate description. Please try again.";
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(`Failed to generate description: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
