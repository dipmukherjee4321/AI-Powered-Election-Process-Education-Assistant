"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

type Difficulty = "easy" | "medium" | "hard";

export default function QuizComponent() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const startQuiz = async () => {
    setIsLoading(true);
    setError("");
    setQuestions([]);
    setCurrentIdx(0);
    
    // Save previous score for adaptation before resetting
    const previousScore = isFinished ? score : undefined;
    const previousDifficulty = isFinished ? difficulty : undefined;
    
    setScore(0);
    setIsFinished(false);
    setSelectedOption(null);
    setIsAnswered(false);

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          difficulty,
          ...(previousScore !== undefined && { previousScore, previousDifficulty })
        })
      });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setQuestions(data.questions);
    } catch (err) {
      console.error("Quiz Error:", err);
      // Hard fallback if the API fails entirely (e.g. network failure)
      const mockQuestions = [
        {
          question: "(Offline Mock) What is the primary purpose of a democratic election?",
          options: ["To choose leaders by popular vote", "To pass laws directly", "To appoint judges", "To collect taxes"],
          correctAnswer: "To choose leaders by popular vote",
          explanation: "(Mock Mode) Elections allow citizens to choose their representatives."
        },
        {
          question: "(Offline Mock) At what age can citizens generally vote in most democracies?",
          options: ["16", "18", "21", "25"],
          correctAnswer: "18",
          explanation: "(Mock Mode) 18 is the standard voting age in most democratic nations."
        }
      ];
      setQuestions(mockQuestions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);
    if (opt === questions[currentIdx].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      // PERSISTENCE: Save Quiz Results
      if (auth.currentUser) {
        addDoc(collection(db, "results"), {
          userId: auth.currentUser.uid,
          score: score,
          total: questions.length,
          difficulty,
          timestamp: serverTimestamp()
        }).catch(e => console.warn("Firestore error:", e));
      }
    }
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
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <button
          onClick={startQuiz}
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
            onClick={() => setQuestions([])}
            className="flex items-center justify-center w-full py-3 bg-surface border border-surface-dark/10 rounded-xl font-medium hover:bg-surface-dark/5 transition-colors"
          >
            <RefreshCw className="mr-2 h-5 w-5" /> Try Another Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

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

      {/* Question */}
      <h3 className="text-2xl font-bold mb-6 leading-relaxed">{currentQ.question}</h3>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {currentQ.options.map((opt, idx) => {
          let stateClass = "bg-surface hover:border-primary/50 cursor-pointer border-transparent";
          if (isAnswered) {
            if (opt === currentQ.correctAnswer) {
              stateClass = "bg-green-500/10 border-green-500 text-green-700 dark:text-green-400";
            } else if (opt === selectedOption) {
              stateClass = "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400";
            } else {
              stateClass = "bg-surface opacity-50 cursor-not-allowed border-transparent";
            }
          }

          return (
            <div
              key={idx}
              onClick={() => handleSelect(opt)}
              className={`p-4 rounded-xl border-2 transition-all flex justify-between items-center ${stateClass}`}
            >
              <span className="font-medium">{opt}</span>
              {isAnswered && opt === currentQ.correctAnswer && <CheckCircle2 className="text-green-500 h-5 w-5" />}
              {isAnswered && opt === selectedOption && opt !== currentQ.correctAnswer && <XCircle className="text-red-500 h-5 w-5" />}
            </div>
          );
        })}
      </div>

      {/* Explanation & Next */}
      {isAnswered && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6 animate-in slide-in-from-bottom-2 fade-in">
          <h4 className="font-semibold text-primary mb-1">Explanation:</h4>
          <p className="text-foreground/80">{currentQ.explanation}</p>
        </div>
      )}

      <div className="flex justify-end">
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

// Extracted SVG to avoid lucide-react missing icon issue if not present
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
