"use client";

import { useState, useCallback } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useQuiz, Difficulty } from "@/hooks/useQuiz";
import QuizCard from "./QuizCard";

export default function QuizComponent() {
  const {
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
    resetQuiz
  } = useQuiz();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleStart = () => startQuiz();

  const handleSelect = useCallback((opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);
    submitAnswer(opt);
  }, [isAnswered, submitAnswer]);

  const handleNext = () => {
    nextQuestion();
    setSelectedOption(null);
    setIsAnswered(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-foreground/70">AI is generating your quiz...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 max-w-xl mx-auto text-center space-y-6">
        <h2 className="text-2xl font-bold">Ready to test your knowledge?</h2>
        <p className="text-foreground/70">Select a difficulty level and let AI generate a unique quiz for you.</p>
        
        <div className="flex justify-center gap-4 py-4">
          {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-6 py-2 rounded-full capitalize font-medium transition-all ${
                difficulty === d ? "bg-primary text-white shadow-md shadow-primary/20 scale-105" : "bg-surface text-foreground/70 hover:bg-surface-dark/5"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        
        <button
          onClick={handleStart}
          className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors"
        >
          Generate & Start Quiz
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="glass rounded-2xl p-8 max-w-xl mx-auto text-center space-y-6">
        <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrophyIcon className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold">Quiz Complete!</h2>
        <p className="text-xl">
          You scored <span className="font-bold text-primary">{score}</span> out of {questions.length}
        </p>
        <div className="pt-4 border-t border-surface-dark/10">
          <p className="text-foreground/70 mb-6">
            {score === questions.length ? "Perfect! You're an election expert." : 
             score > questions.length / 2 ? "Great job! Keep learning to master the process." :
             "Good effort! Review the Learn module to improve your score."}
          </p>
          <button
            onClick={resetQuiz}
            className="flex items-center justify-center w-full py-3 bg-surface border border-surface-dark/10 rounded-xl font-medium hover:bg-surface-dark/5 transition-colors"
          >
            <RefreshCw className="mr-2 h-5 w-5" /> Try Another Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 md:p-10 max-w-3xl mx-auto relative overflow-hidden">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-foreground/60 mb-2">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span>Score: {score}</span>
        </div>
        <div className="w-full bg-surface-dark/10 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500" 
            style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <QuizCard 
        question={questions[currentIdx]}
        selectedOption={selectedOption}
        isAnswered={isAnswered}
        onSelect={handleSelect}
      />

      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentIdx === questions.length - 1 ? "Finish Quiz" : "Next Question"}
        </button>
      </div>
    </div>
  );
}

function TrophyIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
