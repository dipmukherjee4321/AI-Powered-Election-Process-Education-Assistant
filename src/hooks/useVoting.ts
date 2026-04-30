import { useState, useCallback, useMemo } from "react";
import { Candidate, VotingStep } from "@/types";

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: "c1",
    name: "Alex Chen",
    party: "Progressive Alliance",
    color: "bg-blue-500",
    votes: 145,
  },
  {
    id: "c2",
    name: "Sarah Jenkins",
    party: "Conservative Front",
    color: "bg-red-500",
    votes: 132,
  },
  {
    id: "c3",
    name: "Marcus Johnson",
    party: "Green Future Party",
    color: "bg-green-500",
    votes: 89,
  },
  {
    id: "c4",
    name: "Priya Patel",
    party: "Independent",
    color: "bg-purple-500",
    votes: 45,
  },
];

export const useVoting = () => {
  const [step, setStep] = useState<VotingStep>("auth");
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null,
  );
  const [isCasting, setIsCasting] = useState(false);
  const [voterId, setVoterId] = useState("");
  const [authError, setAuthError] = useState("");

  const totalVotes = useMemo(() => {
    return candidates.reduce((sum, c) => sum + c.votes, 0);
  }, [candidates]);

  const handleAuth = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (voterId.length < 5) {
        setAuthError("Invalid Voter ID format.");
        return;
      }
      setStep("ballot");
    },
    [voterId],
  );

  const handleVote = useCallback(() => {
    if (!selectedCandidate) return;
    setIsCasting(true);

    // Simulate network request & security checks
    setTimeout(() => {
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === selectedCandidate ? { ...c, votes: c.votes + 1 } : c,
        ),
      );
      setIsCasting(false);
      setStep("results");
    }, 1500);
  }, [selectedCandidate]);

  const resetSimulation = useCallback(() => {
    setStep("auth");
    setSelectedCandidate(null);
    setVoterId("");
    setAuthError("");
  }, []);

  return {
    step,
    setStep,
    candidates,
    selectedCandidate,
    setSelectedCandidate,
    isCasting,
    voterId,
    setVoterId,
    authError,
    setAuthError,
    totalVotes,
    handleAuth,
    handleVote,
    resetSimulation,
  };
};
