/**
 * AI Service
 * Handles all interactions with the backend AI routes.
 * Decouples business logic from UI components.
 */

import { ChatMessage, ChatMode } from "@/types";

export const aiService = {
  /**
   * Sends a chat message to the Gemini-powered backend
   */
  async fetchChatResponse(
    messages: ChatMessage[],
    mode: ChatMode,
  ): Promise<string> {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, mode }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch AI response");
    }

    const data = await response.json();
    return data.response;
  },

  /**
   * Generates a new quiz based on difficulty and past performance
   */
  async generateQuiz(
    difficulty: string,
    previousScore?: number,
    previousDifficulty?: string,
  ) {
    const response = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        difficulty,
        ...(previousScore !== undefined && {
          previousScore,
          previousDifficulty,
        }),
      }),
    });

    if (!response.ok) {
      throw new Error("Quiz generation failed");
    }

    return response.json();
  },
};
