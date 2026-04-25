import VotingSimulator from "@/components/voting/VotingSimulator";

export const metadata = {
  title: "Simulated Voting - ElectAI",
  description: "Experience a secure, simulated voting environment.",
};

export default function VotePage() {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Voting Experience Demo</h1>
        <p className="text-foreground/70">
          Walk through the exact steps of casting a secure ballot. This simulation demonstrates authentication, selection, verification, and tabulation.
        </p>
      </div>
      
      <VotingSimulator />
    </div>
  );
}
