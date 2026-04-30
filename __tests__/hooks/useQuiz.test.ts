import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useQuiz } from "@/hooks/useQuiz";
import { aiService } from "@/services/ai.service";
import { storageService } from "@/services/storage.service";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

// Mock dependencies
vi.mock("@/services/ai.service", () => ({
  aiService: {
    generateQuiz: vi.fn(),
  },
}));

vi.mock("@/services/storage.service", () => ({
  storageService: {
    saveQuizResult: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
  },
}));

describe("useQuiz hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: { uid: "test-user-id" } });
  });

  const mockQuestions = [
    {
      question: "Q1",
      options: ["A", "B", "C"],
      correctAnswer: "A",
      explanation: "Exp 1",
    },
    {
      question: "Q2",
      options: ["X", "Y", "Z"],
      correctAnswer: "Y",
      explanation: "Exp 2",
    },
  ];

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useQuiz());

    expect(result.current.questions).toEqual([]);
    expect(result.current.currentIdx).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFinished).toBe(false);
    expect(result.current.difficulty).toBe("easy");
  });

  it("should handle setDifficulty", () => {
    const { result } = renderHook(() => useQuiz());

    act(() => {
      result.current.setDifficulty("hard");
    });

    expect(result.current.difficulty).toBe("hard");
  });

  it("should fetch questions on startQuiz", async () => {
    (aiService.generateQuiz as any).mockResolvedValue({ questions: mockQuestions });

    const { result } = renderHook(() => useQuiz());

    await act(async () => {
      await result.current.startQuiz();
    });

    expect(result.current.questions).toEqual(mockQuestions);
    expect(result.current.isLoading).toBe(false);
    expect(aiService.generateQuiz).toHaveBeenCalledWith("easy", undefined, undefined);
  });

  it("should handle error during startQuiz", async () => {
    (aiService.generateQuiz as any).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useQuiz());

    await act(async () => {
      await result.current.startQuiz();
    });

    expect(toast.error).toHaveBeenCalledWith("Failed to generate quiz. Try again.");
    expect(result.current.isLoading).toBe(false);
  });

  it("should process correct and incorrect answers", async () => {
    (aiService.generateQuiz as any).mockResolvedValue({ questions: mockQuestions });
    const { result } = renderHook(() => useQuiz());

    await act(async () => {
      await result.current.startQuiz();
    });

    // Correct answer
    act(() => {
      result.current.submitAnswer("A");
    });
    expect(result.current.score).toBe(1);

    // Go to next question
    act(() => {
      result.current.nextQuestion();
    });
    expect(result.current.currentIdx).toBe(1);
    expect(result.current.isFinished).toBe(false);

    // Incorrect answer on last question
    act(() => {
      result.current.submitAnswer("X"); // correct is Y
    });
    expect(result.current.score).toBe(1);

    // Finish quiz
    act(() => {
      result.current.nextQuestion();
    });
    expect(result.current.isFinished).toBe(true);

    // Assert persistence
    expect(storageService.saveQuizResult).toHaveBeenCalledWith("test-user-id", {
      score: 1,
      total: 2,
      difficulty: "easy",
      accuracy: 50,
    });
  });

  it("should reset the quiz properly", async () => {
    (aiService.generateQuiz as any).mockResolvedValue({ questions: mockQuestions });
    const { result } = renderHook(() => useQuiz());

    await act(async () => {
      await result.current.startQuiz();
    });

    act(() => {
      result.current.submitAnswer("A");
      result.current.nextQuestion();
    });

    act(() => {
      result.current.resetQuiz();
    });

    expect(result.current.questions).toEqual([]);
    expect(result.current.currentIdx).toBe(1);
    expect(result.current.score).toBe(1);
    expect(result.current.isFinished).toBe(false);
  });
});
