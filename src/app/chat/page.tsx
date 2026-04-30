import ChatInterface from "@/components/chat/ChatInterface";

export const metadata = {
  title: "AI Tutor - ElectAI",
  description: "Chat with our AI tutor to learn about the election process.",
};

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          AI Election Tutor
        </h1>
        <p className="text-foreground/70">
          Ask questions, clarify doubts, and explore the democratic process.
          Switch modes to tailor the learning experience to your needs.
        </p>
      </div>

      <ChatInterface />
    </div>
  );
}
