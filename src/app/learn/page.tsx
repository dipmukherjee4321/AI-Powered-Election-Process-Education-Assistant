"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Timeline from "@/components/learning/Timeline";

const ChatInterface = dynamic(() => import("@/components/chat/ChatInterface"), {
  loading: () => <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>
});
const QuizComponent = dynamic(() => import("@/components/quiz/QuizComponent"), {
  loading: () => <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>
});

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "quiz">("chat");

  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          The Election Journey
        </h1>
        <p className="text-lg text-foreground/80">
          Understand how an election unfolds from the initial announcement to the final declaration of results. Click on each stage to learn what happens behind the scenes.
        </p>
      </div>
      
      <Timeline />

      <div className="pt-16 border-t border-surface-dark/10">
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 bg-surface border border-surface-dark/20 rounded-2xl shadow-inner">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                activeTab === "chat" ? "bg-primary text-white shadow-lg" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              AI Tutor
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                activeTab === "quiz" ? "bg-primary text-white shadow-lg" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Knowledge Quiz
            </button>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === "chat" ? <ChatInterface /> : <QuizComponent />}
        </div>
      </div>
    </div>
  );
}
