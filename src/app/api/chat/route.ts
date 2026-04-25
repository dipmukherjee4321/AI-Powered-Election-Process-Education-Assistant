import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini";
import { z } from "zod";

const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1, "Message content cannot be empty").max(2000, "Message too long")
  })).min(1),
  mode: z.enum(["simple", "detailed", "exam"]).default("detailed")
});

const getSystemPrompt = (mode: string) => {
  const base = "You are an AI Election Process Education Assistant. Your goal is to help users understand elections securely and accurately. Do not output HTML, only plain text or markdown. ";
  switch (mode) {
    case "simple":
      return base + "Explain concepts very simply, as if to a 10-year-old. Use analogies. Keep it brief.";
    case "exam":
      return base + "Act as an exam tutor. Provide short, concise answers structured with bullet points. Highlight key terms.";
    case "detailed":
    default:
      return base + "Provide a comprehensive and detailed explanation. Cover historical context, steps, and nuances if applicable.";
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. Input Validation (Security)
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      console.warn("Security Alert: Invalid chat payload received.", parsed.error.format());
      return NextResponse.json({ 
        error: "Invalid input.", 
        details: parsed.error.format() 
      }, { status: 400 });
    }
    
    const { messages, mode } = parsed.data;
    const systemInstruction = getSystemPrompt(mode);
    
    const conversation = messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join("\n");
    const fullPrompt = `${systemInstruction}\n\nConversation History:\n${conversation}\nAI:`;

    // 2. Generation with hardened fallback
    try {
      const result = await model.generateContent(fullPrompt);
      const text = result.response.text();
      
      if (!text) throw new Error("AI returned an empty response.");

      return NextResponse.json({ response: text });
    } catch (apiError: any) {
      console.error("Gemini API Error:", apiError.message);
      return NextResponse.json({ 
        response: "I'm sorry, I'm having trouble connecting to my AI core. Please try again in a moment." 
      });
    }
  } catch (error: any) {
    console.error("Fatal Chat API Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: "A security or network exception occurred." 
    }, { status: 500 });
  }
}

