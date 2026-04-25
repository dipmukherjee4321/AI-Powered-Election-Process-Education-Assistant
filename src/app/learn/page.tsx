import Timeline from "@/components/learning/Timeline";

export const metadata = {
  title: "Interactive Learning - ElectAI",
  description: "Step-by-step visual timeline of the democratic election process.",
};

export default function LearnPage() {
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
    </div>
  );
}
