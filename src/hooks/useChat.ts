import { useState, useCallback } from "react";
import { AIService, DatabaseService } from "@/services";
import { trackEvent, AnalyticsEvents } from "@/lib/analytics";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function useChat(initialMessages: Message[] = []) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string, mode: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: content.trim() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Background track & persist
    trackEvent(AnalyticsEvents.CHAT_MESSAGE_SENT, { mode, length: content.length });
    DatabaseService.saveChat(content, "user", mode).catch(console.warn);

    try {
      const data = await AIService.sendChatMessage([...messages, userMsg], mode);
      const aiResponse = data.response;
      
      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: aiMsgId, role: "assistant", content: "" }]);
      setIsLoading(false);

      // Simulate typing effect
      let currentText = "";
      const words = aiResponse.split(" ");
      for (let i = 0; i < words.length; i++) {
        currentText += (i === 0 ? "" : " ") + words[i];
        const currentVal = currentText;
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: currentVal } : m));
        await new Promise(r => setTimeout(r, 15 + Math.random() * 25));
      }

      DatabaseService.saveChat(aiResponse, "assistant", mode).catch(console.warn);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: "assistant", 
        content: "Sorry, I had trouble connecting. Please try again." 
      }]);
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  return { messages, isLoading, sendMessage };
}
