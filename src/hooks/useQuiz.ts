/**
 * useQuiz Hook
 * Manages quiz state, question navigation, scoring, and persistence.
 */

import { useState, useCallback } from "react";
import { aiService } from "@/services/ai.service";
import { storageService } from "@/services/storage.service";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type Difficulty = "easy" | "medium" | "hard";

export const useQuiz = () => {
  const { user } = useAuth();
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const startQuiz = useCallback(async (prevScore?: number, prevDifficulty?: string) => {
    setIsLoading(true);
    setQuestions([]);
    setCurrentIdx(0);
    setScore(0);
    setIsFinished(false);

    try {
      const data = await aiService.generateQuiz(difficulty, prevScore, prevDifficulty);
      setQuestions(data.questions);
    } catch (err) {
      toast.error("Failed to generate quiz. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, [difficulty]);

  const submitAnswer = useCallback((selectedOption: string) => {
    const currentQ = questions[currentIdx];
    const isCorrect = selectedOption === currentQ.correctAnswer;
    
    if (isCorrect) {
      setScore(s => s + 1);
    }
    
    return isCorrect;
  }, [questions, currentIdx]);

  const nextQuestion = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      setIsFinished(true);
      if (user) {
        storageService.saveQuizResult(user.uid, {
          score,
          total: questions.length,
          difficulty,
          accuracy: (score / questions.length) * 100
        }).catch(err => console.warn("Result persistence failed:", err));
      }
    }
  }, [currentIdx, questions, user, score, difficulty]);

  return {
    questions,
    currentIdx,
    score,
    isLoading,
    isFinished,
    difficulty,
    setDifficulty,
    startQuiz,
    submitAnswer,
    nextQuestion,
    resetQuiz: () => setQuestions([])
  };
};
