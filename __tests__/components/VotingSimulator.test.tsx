import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import VotingSimulator from "@/components/voting/VotingSimulator";
import { useVoting } from "@/hooks/useVoting";
import { useAuth } from "@/context/AuthContext";

// Mock dependencies
vi.mock("@/hooks/useVoting", () => ({
  useVoting: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("VotingSimulator Component", () => {
  const mockSubmitVote = vi.fn();
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as any).mockReturnValue({
      user: { uid: "test-user-id" },
    });

    (useVoting as any).mockReturnValue({
      candidates: [
        { id: "1", name: "Alice", party: "Party A", votes: 10, color: "bg-blue-500", platform: ["Platform A"] },
        { id: "2", name: "Bob", party: "Party B", votes: 5, color: "bg-red-500", platform: ["Platform B"] },
      ],
      step: "auth",
      selectedCandidate: null,
      isSubmitting: false,
      hasVoted: false,
      totalVotes: 15,
      setSelectedCandidate: vi.fn(),
      submitVote: mockSubmitVote,
      resetSimulation: mockReset,
    });
  });

  it("should render auth step initially", () => {
    render(<VotingSimulator />);
    expect(screen.getByText(/Voter Authentication/i)).toBeInTheDocument();
  });

  it("should display candidates in voting step", () => {
    (useVoting as any).mockReturnValue({
      candidates: [
        { id: "1", name: "Alice", party: "Party A", votes: 10, color: "bg-blue-500", platform: ["Platform A"] },
      ],
      step: "ballot",
      selectedCandidate: null,
      isSubmitting: false,
      hasVoted: false,
      totalVotes: 10,
      setSelectedCandidate: vi.fn(),
      submitVote: mockSubmitVote,
      resetSimulation: mockReset,
    });

    render(<VotingSimulator />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Party A")).toBeInTheDocument();
  });

  it("should render results step", () => {
    (useVoting as any).mockReturnValue({
      candidates: [
        { id: "1", name: "Alice", party: "Party A", votes: 10, color: "bg-blue-500", platform: ["Platform A"] },
      ],
      step: "results",
      selectedCandidate: null,
      isSubmitting: false,
      hasVoted: true,
      totalVotes: 10,
      setSelectedCandidate: vi.fn(),
      submitVote: mockSubmitVote,
      resetSimulation: mockReset,
    });

    render(<VotingSimulator />);
    expect(screen.getByText(/Vote Recorded/i)).toBeInTheDocument();
    expect(screen.getByText("100.0% (10)")).toBeInTheDocument();
  });
});
