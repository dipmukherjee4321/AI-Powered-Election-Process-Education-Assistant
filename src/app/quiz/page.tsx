import QuizComponent from "@/components/quiz/QuizComponent";

export const metadata = {
  title: "Adaptive Quiz - ElectAI",
  description: "Test your knowledge about the election process with AI-generated quizzes.",
};

export default function QuizPage() {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Check</h1>
        <p className="text-foreground/70">
          Our AI dynamically generates questions based on your selected difficulty. Challenge yourself and see how much you've learned.
        </p>
      </div>
      
      <QuizComponent />
    </div>
  );
}
