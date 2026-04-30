import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { aiService } from "./ai.service";

// Mock global fetch
global.fetch = vi.fn();

describe("aiService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("fetchChatResponse should return response on success", async () => {
    const mockResponse = { response: "AI Answer" };
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await aiService.fetchChatResponse(
      [{ role: "user", content: "Hi" }],
      "simple",
    );
    expect(result).toBe("AI Answer");
    expect(fetch).toHaveBeenCalledWith("/api/chat", expect.any(Object));
  });

  it("fetchChatResponse should throw error on API failure", async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Rate limit exceeded" }),
    });

    await expect(aiService.fetchChatResponse([], "detailed")).rejects.toThrow(
      "Rate limit exceeded",
    );
  });

  it("generateQuiz should return questions on success", async () => {
    const mockQuiz = {
      questions: [
        { question: "Q1", options: [], correctAnswer: "A", explanation: "E" },
      ],
    };
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuiz,
    });

    const result = await aiService.generateQuiz("easy");
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].question).toBe("Q1");
  });
});
