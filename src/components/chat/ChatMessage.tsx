"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { Bot, User } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/services/ai.service";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex gap-4 ${!isAssistant ? "flex-row-reverse" : ""}`}>
      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
        isAssistant ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
      }`} aria-hidden="true">
        {isAssistant ? <Bot size={20} /> : <User size={20} />}
      </div>
      <div className={`max-w-[80%] rounded-2xl p-4 ${
        !isAssistant 
          ? "bg-secondary text-white rounded-tr-none" 
          : "bg-surface dark:bg-surface-dark border border-surface-dark/10 dark:border-surface-light/10 rounded-tl-none shadow-sm"
      }`}>
        <div className={`prose prose-sm max-w-none ${!isAssistant ? "text-white" : "dark:prose-invert"}`}>
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatMessage);
