"use client";

import { useState } from "react";
import { Check, ShieldCheck, Lock, AlertCircle } from "lucide-react";

type Candidate = {
  id: string;
  name: string;
  party: string;
  color: string;
  votes: number;
};

const INITIAL_CANDIDATES: Candidate[] = [
  { id: "c1", name: "Alex Chen", party: "Progressive Alliance", color: "bg-blue-500", votes: 145 },
  { id: "c2", name: "Sarah Jenkins", party: "Conservative Front", color: "bg-red-500", votes: 132 },
  { id: "c3", name: "Marcus Johnson", party: "Green Future Party", color: "bg-green-500", votes: 89 },
  { id: "c4", name: "Priya Patel", party: "Independent", color: "bg-purple-500", votes: 45 },
];

export default function VotingSimulator() {
  const [step, setStep] = useState<"auth" | "ballot" | "confirm" | "results">("auth");
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isCasting, setIsCasting] = useState(false);
  const [voterId, setVoterId] = useState("");
  const [authError, setAuthError] = useState("");

  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (voterId.length < 5) {
      setAuthError("Invalid Voter ID format.");
      return;
    }
    setStep("ballot");
  };

  const handleVote = () => {
    if (!selectedCandidate) return;
    setIsCasting(true);
    
    // Simulate network request & security checks
    setTimeout(() => {
      setCandidates(prev => prev.map(c => 
        c.id === selectedCandidate ? { ...c, votes: c.votes + 1 } : c
      ));
      setIsCasting(false);
      setStep("results");
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Steps Indicator */}
      <div className="flex justify-between items-center mb-10 px-4">
        {["Authentication", "Ballot", "Confirmation", "Results"].map((label, idx) => {
          const stepNames = ["auth", "ballot", "confirm", "results"];
          const currentIdx = stepNames.indexOf(step);
          const isActive = currentIdx === idx;
          const isPast = currentIdx > idx;
          
          return (
            <div key={label} className="flex flex-col items-center relative z-10 w-1/4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-colors ${
                isActive ? "bg-primary text-white ring-4 ring-primary/20" : 
                isPast ? "bg-green-500 text-white" : "bg-surface-dark/10 text-foreground/50"
              }`}>
                {isPast ? <Check size={16} /> : idx + 1}
              </div>
              <span className={`text-xs md:text-sm font-medium ${isActive ? "text-primary" : "text-foreground/60"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Auth */}
      {step === "auth" && (
        <div className="glass rounded-2xl p-8 text-center animate-in fade-in slide-in-from-bottom-4">
          <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Voter Authentication</h2>
          <p className="text-foreground/70 mb-8 max-w-md mx-auto">
            In a real election, your identity is verified to prevent fraud. Enter a mock Voter ID (at least 5 characters) to proceed.
          </p>
          <form onSubmit={handleAuth} className="max-w-sm mx-auto space-y-4">
            <div>
              <input
                type="text"
                placeholder="Enter Mock Voter ID"
                value={voterId}
                onChange={(e) => {
                  setVoterId(e.target.value);
                  setAuthError("");
                }}
                className="w-full px-4 py-3 rounded-xl border border-surface-dark/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-center uppercase tracking-wider"
              />
              {authError && <p className="text-red-500 text-sm mt-2">{authError}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors"
            >
              Verify Identity
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Ballot */}
      {step === "ballot" && (
        <div className="glass rounded-2xl p-8 animate-in fade-in slide-in-from-right-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Lock className="mr-2 h-6 w-6 text-primary" /> Secure Digital Ballot
          </h2>
          <div className="space-y-4 mb-8" role="radiogroup" aria-labelledby="ballot-heading">
            <h2 id="ballot-heading" className="sr-only">Select a Candidate</h2>
            {candidates.map(candidate => (
              <button 
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate.id)}
                role="radio"
                aria-checked={selectedCandidate === candidate.id}
                tabIndex={0}
                className={`w-full text-left p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                  selectedCandidate === candidate.id 
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10" 
                    : "border-surface-dark/10 hover:border-primary/40 bg-surface"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-12 rounded-full ${candidate.color}`} aria-hidden="true" />
                  <div>
                    <h3 className="font-bold text-lg">{candidate.name}</h3>
                    <p className="text-foreground/60 text-sm">{candidate.party}</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedCandidate === candidate.id ? "border-primary" : "border-surface-dark/20"
                }`} aria-hidden="true">
                  {selectedCandidate === candidate.id && <div className="w-3 h-3 bg-primary rounded-full" />}
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-surface-dark/10">
            <p className="text-sm text-foreground/60 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" /> Choose carefully.
            </p>
            <button
              onClick={() => setStep("confirm")}
              disabled={!selectedCandidate}
              className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              Review Selection
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === "confirm" && (
        <div className="glass rounded-2xl p-8 text-center animate-in fade-in zoom-in-95">
          <h2 className="text-2xl font-bold mb-2 text-red-500">Confirm Your Vote</h2>
          <p className="text-foreground/70 mb-8">
            Once cast, your vote cannot be changed. This ensures the integrity of the election process.
          </p>
          
          <div className="max-w-sm mx-auto bg-surface p-6 rounded-xl border border-surface-dark/10 mb-8 shadow-inner">
            <p className="text-sm text-foreground/60 uppercase tracking-widest mb-2">You selected:</p>
            <h3 className="text-2xl font-bold">
              {candidates.find(c => c.id === selectedCandidate)?.name}
            </h3>
            <p className="text-primary font-medium">
              {candidates.find(c => c.id === selectedCandidate)?.party}
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setStep("ballot")}
              disabled={isCasting}
              className="px-6 py-3 bg-surface border border-surface-dark/20 text-foreground rounded-xl font-bold hover:bg-surface-dark/5 transition-colors disabled:opacity-50"
            >
              Go Back
            </button>
            <button
              onClick={handleVote}
              disabled={isCasting}
              className="px-8 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center"
            >
              {isCasting ? (
                <span className="animate-pulse">Casting securely...</span>
              ) : "Cast Vote"}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === "results" && (
        <div className="glass rounded-2xl p-8 animate-in fade-in slide-in-from-bottom-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-500 mb-4">
              <Check size={32} />
            </div>
            <h2 className="text-3xl font-bold">Vote Recorded</h2>
            <p className="text-foreground/70">Your vote has been securely encrypted and tabulated.</p>
          </div>

          <div className="space-y-6">
            <h3 className="font-bold text-xl mb-4 border-b border-surface-dark/10 pb-2">Current Standings</h3>
            {/* Sort candidates by votes */}
            {[...candidates].sort((a, b) => b.votes - a.votes).map(candidate => {
              const percentage = ((candidate.votes / totalVotes) * 100).toFixed(1);
              return (
                <div key={candidate.id}>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span>{candidate.name} <span className="text-foreground/50 font-normal">({candidate.party})</span></span>
                    <span>{percentage}% ({candidate.votes})</span>
                  </div>
                  <div className="w-full bg-surface-dark/10 rounded-full h-3 overflow-hidden flex">
                    <div 
                      className={`h-full ${candidate.color} transition-all duration-1000 ease-out`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 text-center">
             <button
              onClick={() => {
                setStep("auth");
                setSelectedCandidate(null);
                setVoterId("");
              }}
              className="px-6 py-2 text-primary font-medium hover:underline"
            >
              Reset Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
