"use client";

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Question } from "@/types";

interface QuizCardProps {
  question: Question;
  selectedOption: string | null;
  isAnswered: boolean;
  onSelect: (opt: string) => void;
}

const QuizCard = ({
  question,
  selectedOption,
  isAnswered,
  onSelect,
}: QuizCardProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold leading-relaxed">
        {question.question}
      </h3>

      <div className="space-y-3">
        {question.options.map((opt, idx) => {
          let stateClass =
            "bg-surface hover:border-primary/50 cursor-pointer border-transparent";
          if (isAnswered) {
            if (opt === question.correctAnswer) {
              stateClass =
                "bg-green-500/10 border-green-500 text-green-700 dark:text-green-400";
            } else if (opt === selectedOption) {
              stateClass =
                "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400";
            } else {
              stateClass =
                "bg-surface opacity-50 cursor-not-allowed border-transparent";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => onSelect(opt)}
              disabled={isAnswered}
              aria-pressed={selectedOption === opt}
              className={`p-4 rounded-xl border-2 transition-all flex justify-between items-center w-full text-left ${stateClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
            >
              <span className="font-medium">{opt}</span>
              {isAnswered && opt === question.correctAnswer && (
                <CheckCircle2 className="text-green-500 h-5 w-5" />
              )}
              {isAnswered &&
                opt === selectedOption &&
                opt !== question.correctAnswer && (
                  <XCircle className="text-red-500 h-5 w-5" />
                )}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 animate-in slide-in-from-bottom-2 fade-in" aria-live="polite">
          <h4 className="font-semibold text-primary mb-1">Explanation:</h4>
          <p className="text-foreground/80">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(QuizCard);
