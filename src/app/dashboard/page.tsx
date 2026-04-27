"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DatabaseService } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { Terminal, Send, BarChart3, Users, Trophy } from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [command, setCommand] = useState("");
  const [stats, setStats] = useState({
    totalVotes: 1450,
    activeLearners: 1,
    avgQuizScore: 4.2
  });

  // 1. Route Protection
  useEffect(() => {
    if (!loading && !user) {
      toast.error("Unauthorized. Please log in first.");
      router.replace("/login");
    }
  }, [user, loading, router]);

  // 2. Real-time Data Synchronization
  useEffect(() => {
    if (!user) return;
    const unsubscribe = DatabaseService.subscribeToStats(setStats);
    return () => unsubscribe();
  }, [user]);

  // 3. Command System
  const executeCommand = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cmd = command.toLowerCase().trim();
    if (!cmd) return;

    setCommand("");

    if (["logout", "sign out", "exit"].includes(cmd)) {
      toast.loading("Logging out...");
      await logout();
      router.push("/login");
    } else {
      toast.error(`Unknown command: "${cmd}"`);
    }
  }, [command, logout, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-foreground/60 font-medium">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="glass p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-b-4 border-b-primary shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Hello, {user.email?.split('@')[0]}</h1>
          <p className="text-foreground/70">Accessing secure election education metrics.</p>
        </div>
        
        <div className="w-full md:w-96 bg-surface/50 p-4 rounded-xl border border-surface-dark/10">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-2">
            <Terminal className="w-4 h-4" /> CLI Console
          </label>
          <form onSubmit={executeCommand} className="relative">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Type 'logout' to exit..."
              className="w-full pl-4 pr-10 py-2.5 bg-background border border-surface-dark/20 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all font-mono text-sm"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:bg-primary/10 rounded-md">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Mock Votes" value={stats.totalVotes.toLocaleString()} icon={<BarChart3 />} color="blue" />
        <StatCard title="Active Learners" value={stats.activeLearners} icon={<Users />} color="orange" />
        <StatCard title="Avg Quiz Score" value={`${stats.avgQuizScore}/5`} icon={<Trophy />} color="green" />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: any; icon: any; color: string }) {
  const colors: any = {
    blue: "border-l-blue-500 bg-blue-500/10 text-blue-500",
    orange: "border-l-orange-500 bg-orange-500/10 text-orange-500",
    green: "border-l-green-500 bg-green-500/10 text-green-500",
  };
  
  return (
    <div className={`glass p-6 rounded-2xl flex items-center justify-between border-l-4 ${colors[color].split(' ')[0]}`}>
      <div>
        <p className="text-foreground/60 text-sm font-semibold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-4xl font-extrabold">{value}</h3>
      </div>
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colors[color].split(' ').slice(1).join(' ')}`}>
        {icon}
      </div>
    </div>
  );
}
