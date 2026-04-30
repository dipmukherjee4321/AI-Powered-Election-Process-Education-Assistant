/**
 * Core Domain Types
 * Single source of truth for all domain entities across the application.
 */

// --- Chat Models ---
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type ChatMode = "simple" | "detailed" | "exam";

// --- Quiz Models ---
export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export type Difficulty = "easy" | "medium" | "hard";

// --- Voting Models ---
export interface Candidate {
  id: string;
  name: string;
  party: string;
  color: string;
  votes: number;
}

export type VotingStep = "auth" | "ballot" | "confirm" | "results";

// --- API Models ---
export interface APIErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}

export interface QuizAPIResponse {
  questions: Question[];
  fallback?: boolean;
}
