/**
 * useChat Hook
 * Manages chat state, AI streaming simulation, and persistence logic.
 */

import { useState, useCallback } from "react";
import { aiService } from "@/services/ai.service";
import { ChatMode, ChatMessage } from "@/types";
import { storageService } from "@/services/storage.service";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export const useChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your AI Election Assistant. Ask me anything about how elections work!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>("detailed");

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMsg: ChatMessage = { role: "user", content: content.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const aiResponse = await aiService.fetchChatResponse(
          [...messages, userMsg],
          mode,
        );

        // ⚡ Typewriter Effect Simulation
        const words = aiResponse.split(" ");
        let currentText = "";

        // Initial empty response entry
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
        setIsLoading(false);

        for (let i = 0; i < words.length; i++) {
          currentText += (i === 0 ? "" : " ") + words[i];
          const textToDisplay = currentText;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].content = textToDisplay;
            return updated;
          });
          await new Promise((r) => setTimeout(r, 15 + Math.random() * 20));
        }

        // ☁️ Persistence
        if (user) {
          storageService
            .saveChatSession(user.uid, userMsg.content, aiResponse, mode)
            .catch((err) =>
              console.warn("Background persistence failed:", err),
            );
        }
      } catch (error) {
        console.error("Chat hook error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to get AI response";
        toast.error(errorMessage);
        setIsLoading(false);
      }
    },
    [messages, mode, user, isLoading],
  );

  return {
    messages,
    isLoading,
    mode,
    setMode,
    sendMessage,
  };
};
