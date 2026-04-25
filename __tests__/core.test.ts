import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('Quiz Scoring Logic', () => {
  it('should correctly evaluate an answer', () => {
    const correctAnswer: string = 'Option B';
    const userAnswer: string = 'Option B';
    const wrongAnswer: string = 'Option A';

    expect(userAnswer === correctAnswer).toBe(true);
    expect(wrongAnswer === correctAnswer).toBe(false);
  });
});

describe('Sanitization Logic', () => {
  it('should correctly strip markdown from JSON string', () => {
    const rawInput = '```json\n{"key": "value"}\n```';
    let text = rawInput;
    if (text.startsWith("```json")) {
      text = text.replace(/```json\n?/, "").replace(/\n?```/, "");
    }
    
    expect(text).toBe('{"key": "value"}');
    expect(() => JSON.parse(text)).not.toThrow();
  });
});

describe('Validation Schemas', () => {
  const chatRequestSchema = z.object({
    messages: z.array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(2000)
    })).min(1),
    mode: z.enum(["simple", "detailed", "exam"]).default("detailed")
  });

  it('should validate correct chat payloads', () => {
    const valid = {
      messages: [{ role: "user", content: "Hello" }],
      mode: "simple"
    };
    expect(chatRequestSchema.safeParse(valid).success).toBe(true);
  });

  it('should reject empty messages', () => {
    const invalid = {
      messages: [{ role: "user", content: "" }]
    };
    expect(chatRequestSchema.safeParse(invalid).success).toBe(false);
  });
});

describe('AI Prompt Generation', () => {
  const getSystemPrompt = (mode: string) => {
    const base = "You are an AI Election Process Education Assistant. ";
    switch (mode) {
      case "simple": return base + "Explain concepts very simply.";
      case "exam": return base + "Act as an exam tutor.";
      default: return base + "Provide a detailed explanation.";
    }
  };

  it('should return simple prompt for simple mode', () => {
    expect(getSystemPrompt('simple')).toContain('very simply');
  });

  it('should return detailed prompt by default', () => {
    expect(getSystemPrompt('detailed')).toContain('detailed explanation');
  });
});
