"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2, Mic, MicOff } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useVoice } from "@/hooks/useVoice";
import ChatMessage from "./ChatMessage";

export default function ChatInterface() {
  const { messages, isLoading, mode, setMode, sendMessage } = useChat();
  const { isListening, startListening } = useVoice();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const handleVoiceInput = () => {
    startListening((transcript) => setInput(prev => prev + " " + transcript));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto glass rounded-2xl overflow-hidden shadow-xl" role="region" aria-label="AI Chat Interface">
      {/* Header & Mode Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-surface-dark/10 dark:border-surface-light/10 bg-surface/50">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <Bot className="text-primary h-6 w-6" aria-hidden="true" />
          <h2 className="font-semibold text-lg">AI Tutor</h2>
        </div>
        <div className="flex bg-background/80 rounded-lg p-1" role="group" aria-label="Learning Mode Selection">
          {(["simple", "detailed", "exam"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                mode === m ? "bg-primary text-white shadow" : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" aria-live="polite">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} />
        ))}
        {isLoading && (
          <div className="flex gap-4" aria-label="AI is typing">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div className="bg-surface dark:bg-surface-dark rounded-2xl rounded-tl-none p-4 border border-surface-dark/10 shadow-sm flex items-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface/50 border-t border-surface-dark/10 dark:border-surface-light/10">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={handleVoiceInput}
            aria-label={isListening ? "Listening..." : "Start voice input"}
            className={`p-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
              isListening ? "bg-red-500 text-white animate-pulse" : "bg-surface border border-surface-dark/20 text-foreground/70 hover:bg-surface-dark/10"
            }`}
          >
            {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about elections in ${mode} mode...`}
            aria-label="Chat input"
            className="flex-1 pl-4 pr-12 py-3 rounded-xl border border-surface-dark/20 dark:border-surface-light/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            disabled={isLoading}
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
