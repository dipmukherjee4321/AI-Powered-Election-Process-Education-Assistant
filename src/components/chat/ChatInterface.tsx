"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { Send, Bot, User, Loader2, Mic, MicOff } from "lucide-react";
import { useChat } from "@/hooks/useChat";

type Mode = "simple" | "detailed" | "exam";

export default function ChatInterface() {
  const { messages, isLoading, sendMessage } = useChat([
    { id: "1", role: "assistant", content: "Hello! I am your AI Election Assistant. Ask me anything about how elections work!" }
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("detailed");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => setInput(prev => prev + " " + e.results[0][0].transcript);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input, mode);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto glass rounded-2xl overflow-hidden shadow-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-surface-dark/10 bg-surface/50">
        <div className="flex items-center gap-2">
          <Bot className="text-primary h-6 w-6" />
          <h2 className="font-semibold text-lg">AI Tutor</h2>
        </div>
        <div className="flex bg-background/80 rounded-lg p-1">
          {(["simple", "detailed", "exam"] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
                mode === m ? "bg-primary text-white shadow" : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
              msg.role === "assistant" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
            }`}>
              {msg.role === "assistant" ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === "user" ? "bg-secondary text-white rounded-tr-none" : "bg-surface dark:bg-surface-dark rounded-tl-none shadow-sm border border-surface-dark/10"
            }`}>
              <div className={`prose prose-sm max-w-none ${msg.role === "user" ? "text-white" : "dark:prose-invert"}`}>
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center"><Bot size={20} /></div>
            <div className="bg-surface p-4 rounded-2xl rounded-tl-none shadow-sm"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-surface/50 border-t border-surface-dark/10">
        <form onSubmit={onSubmit} className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-3 rounded-xl transition-all ${isListening ? "bg-red-500 text-white animate-pulse" : "bg-surface border border-surface-dark/20 text-foreground/70"}`}
          >
            {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask in ${mode} mode...`}
            className="flex-1 px-4 py-3 rounded-xl border border-surface-dark/20 bg-background focus:ring-2 focus:ring-primary/50"
          />
          <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-2 p-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
