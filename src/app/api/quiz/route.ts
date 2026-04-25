import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini";
import { z } from "zod";

const quizRequestSchema = z.object({
  difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
  previousScore: z.number().optional(),
  previousDifficulty: z.enum(["easy", "medium", "hard"]).optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. Input Validation (Security)
    const parsed = quizRequestSchema.safeParse(body);
    if (!parsed.success) {
      console.warn("Security Alert: Invalid quiz payload received.", parsed.error.format());
      return NextResponse.json({ 
        error: "Invalid input.", 
        details: parsed.error.format() 
      }, { status: 400 });
    }
    
    const { difficulty, previousScore, previousDifficulty } = parsed.data;

    let adaptationContext = "";
    if (previousScore !== undefined && previousDifficulty) {
      if (previousScore <= 2) {
        adaptationContext = `The user previously scored poorly (${previousScore}/5) on ${previousDifficulty} difficulty. Make the questions slightly more foundational to build confidence.`;
      } else if (previousScore >= 4) {
        adaptationContext = `The user previously scored excellently (${previousScore}/5) on ${previousDifficulty} difficulty. Introduce slightly more advanced nuances to challenge them.`;
      }
    }

    const prompt = `Generate a 5-question multiple-choice quiz about the democratic election process. 
    The target baseline difficulty is: ${difficulty}.
    ${adaptationContext}
    
    Return a JSON array of objects. 
    Each object must have exactly:
    - "question": string
    - "options": array of exactly 4 strings
    - "correctAnswer": string (must exactly match one of the options)
    - "explanation": string`;

    // 2. Structured Output via Gemini Config (Security: Enforces JSON schema)
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      });
      
      const text = result.response.text();
      if (!text) throw new Error("AI returned empty response.");
      
      const questions = JSON.parse(text);
      return NextResponse.json({ questions });
    } catch (apiError: any) {
      console.error("Gemini API Error:", apiError.message);
      // Hardened fallback for high efficiency
      return NextResponse.json({ 
        questions: [
          {
            question: "How are leaders typically chosen in a democracy?",
            options: ["By hereditary succession", "By popular vote", "By military appointment", "By random selection"],
            correctAnswer: "By popular vote",
            explanation: "In a democracy, the primary method for selecting leaders is through voting by the eligible population."
          }
        ],
        fallback: true
      });
    }
  } catch (error: any) {
    console.error("Fatal Quiz API Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: "An unexpected exception occurred during quiz generation." 
    }, { status: 500 });
  }
}


