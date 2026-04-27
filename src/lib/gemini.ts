import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  // We log a warning instead of throwing to avoid breaking the build immediately 
  // without the key during initial development, but the API calls will fail.
  console.warn("Missing GEMINI_API_KEY environment variable. AI features will not work.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : (null as any);

export async function generateContent(prompt: string, history: any[] = []) {
  try {
    if (!model) throw new Error("AI core not initialized.");
    
    // Memory Management: Keep only the last 10 messages for context stability
    const contextHistory = (history || []).slice(-10);
    
    const result = await model.generateContent([
      ...contextHistory.map(h => `${h.role}: ${h.content}`),
      `User: ${prompt}`
    ].join("\n"));
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw new Error("Failed to generate AI response.");
  }
}
