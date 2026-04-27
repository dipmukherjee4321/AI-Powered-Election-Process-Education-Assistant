"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { Send, Bot, User, Loader2, Mic, MicOff } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { trackEvent, AnalyticsEvents } from "@/lib/analytics";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Mode = "simple" | "detailed" | "exam";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "Hello! I am your AI Election Assistant. Ask me anything about how elections work!" }
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("detailed");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Web Speech API Integration
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + " " + transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    
    // Track user message sent
    trackEvent(AnalyticsEvents.CHAT_MESSAGE_SENT, {
      mode,
      message_length: userMsg.content.length,
      is_authenticated: !!auth.currentUser
    });

    try {
      // PERSISTENCE: Save User Message
      if (auth.currentUser) {
        addDoc(collection(db, "chats"), {
          userId: auth.currentUser.uid,
          role: "user",
          content: userMsg.content,
          mode,
          timestamp: serverTimestamp()
        }).catch(e => console.warn("Firestore error:", e));
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], mode })
      });

      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      const aiResponse = data.response;
      
      // 4. Efficiency: Typwriter effect simulation
      let currentText = "";
      const words = aiResponse.split(" ");
      const aiMsgId = (Date.now() + 1).toString();
      
      // Initial empty message
      setMessages(prev => [...prev, { id: aiMsgId, role: "assistant", content: "" }]);
      setIsLoading(false); // Stop loader as we start typing

      for (let i = 0; i < words.length; i++) {
        currentText += (i === 0 ? "" : " ") + words[i];
        const displayPath = currentText; // local copy for loop closure
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: displayPath } : m));
        // Natural typing delay (15-40ms per word)
        await new Promise(r => setTimeout(r, 15 + Math.random() * 25));
      }

      // PERSISTENCE: Save AI Response
      if (auth.currentUser) {
        addDoc(collection(db, "chats"), {
          userId: auth.currentUser.uid,
          role: "assistant",
          content: aiResponse,
          mode,
          timestamp: serverTimestamp()
        }).catch(e => console.warn("Firestore error:", e));
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again or check your internet connection." 
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsLoading(false);
    }
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
          {(["simple", "detailed", "exam"] as Mode[]).map(m => (
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
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-6" 
        aria-live="polite" 
        aria-atomic="false"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
              msg.role === "assistant" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
            }`} aria-hidden="true">
              {msg.role === "assistant" ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === "user" 
                ? "bg-secondary text-white rounded-tr-none" 
                : "bg-surface dark:bg-surface-dark border border-surface-dark/10 dark:border-surface-light/10 rounded-tl-none shadow-sm"
            }`}>
              <div className={`prose prose-sm max-w-none ${msg.role === "user" ? "text-white" : "dark:prose-invert"}`}>
                {/* Security: rehypeSanitize prevents XSS from AI Markdown output */}
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
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
            onClick={startListening}
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
