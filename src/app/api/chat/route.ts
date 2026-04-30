import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini";
import { z } from "zod";

const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z
          .string()
          .min(1, "Message content cannot be empty")
          .max(2000, "Message too long"),
      }),
    )
    .min(1),
  mode: z.enum(["simple", "detailed", "exam"]).default("detailed"),
});

const getSystemPrompt = (mode: string) => {
  const base = `You are the ElectAI Assistant, a neutral and authoritative expert on democratic election processes.
  CRITICAL RULES:
  1. NEUTRALITY: Never discuss specific political parties, current candidates, or partisan politics.
  2. GROUNDING: Only provide information based on general democratic principles and official election procedures.
  3. FORMATTING: Use Markdown (bolding, lists) for readability. Avoid raw HTML.

  CURRENT MODE: ${mode.toUpperCase()}
  `;

  switch (mode) {
    case "simple":
      return (
        base +
        "TASK: Explain concepts to a 10-year-old. Use common analogies (e.g., choosing a class representative). Be encouraging and very brief."
      );
    case "exam":
      return (
        base +
        "TASK: Act as a strict exam tutor. Focus on definitions, legal requirements (like voting age), and sequence of events. Use concise bullet points."
      );
    case "detailed":
    default:
      return (
        base +
        "TASK: Provide a deep-dive academic explanation. Include historical evolution of voting rights, the role of independent commissions, and technical safeguards."
      );
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Input Validation (Security)
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      console.warn(
        "Security Alert: Invalid chat payload received.",
        parsed.error.format(),
      );
      return NextResponse.json(
        {
          error: "Invalid input.",
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const { messages, mode } = parsed.data;
    const systemInstruction = getSystemPrompt(mode);

    const conversation = messages
      .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
      .join("\n");
    const fullPrompt = `${systemInstruction}\n\nConversation History:\n${conversation}\nAI:`;

    // 2. Generation with hardened fallback
    try {
      const result = await model.generateContent(fullPrompt);
      const text = result.response.text();

      if (!text) throw new Error("AI returned an empty response.");

      return NextResponse.json({ response: text });
    } catch (apiError) {
      console.error(
        "Gemini API Error:",
        apiError instanceof Error ? apiError.message : String(apiError),
      );
      return NextResponse.json({
        response:
          "I'm sorry, I'm having trouble connecting to my AI core. Please try again in a moment.",
      });
    }
  } catch (error) {
    console.error(
      "Fatal Chat API Error:",
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "A security or network exception occurred.",
      },
      { status: 500 },
    );
  }
}
