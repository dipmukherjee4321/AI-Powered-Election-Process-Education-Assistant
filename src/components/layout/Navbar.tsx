import Link from "next/link";
import { Vote, BookOpen, Brain, ListChecks } from "lucide-react";
import AuthButton from "@/components/auth/AuthButton";

export default function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50 w-full glass bg-surface/80 backdrop-blur-md border-b border-surface-dark/10 dark:border-surface-light/10"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center space-x-2"
          aria-label="ElectAI Home"
        >
          <Vote className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
            ElectAI
          </span>
        </Link>
        <div className="flex items-center space-x-4" role="menubar">
          <Link
            href="/learn"
            className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors"
            role="menuitem"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline-block">Learn</span>
          </Link>
          <Link
            href="/chat"
            className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors"
            role="menuitem"
          >
            <Brain className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline-block">AI Tutor</span>
          </Link>
          <Link
            href="/quiz"
            className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors"
            role="menuitem"
          >
            <ListChecks className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline-block">Quiz</span>
          </Link>
          <Link
            href="/vote"
            className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors"
            role="menuitem"
          >
            <Vote className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline-block">Vote Simulator</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors border-l pl-4 border-surface-dark/10"
            role="menuitem"
          >
            <span className="hidden sm:inline-block">Analytics</span>
          </Link>
          <div role="none">
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
