import Link from "next/link";
import dynamic from "next/dynamic";

const BookOpen = dynamic(() => import("lucide-react").then((mod) => mod.BookOpen), { ssr: true });
const Brain = dynamic(() => import("lucide-react").then((mod) => mod.Brain), { ssr: true });
const ListChecks = dynamic(() => import("lucide-react").then((mod) => mod.ListChecks), { ssr: true });
const Vote = dynamic(() => import("lucide-react").then((mod) => mod.Vote), { ssr: true });
const ChevronRight = dynamic(() => import("lucide-react").then((mod) => mod.ChevronRight), { ssr: true });


export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-12">
      {/* Hero Section */}
      <section className="text-center max-w-3xl space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Demystify the Election Process
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
          Your AI-powered guide to understanding how democracy works. From nominations to results, learn at your own pace with interactive modules.
        </p>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        {/* Module 1 */}
        <Link href="/learn" className="group glass rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20">
          <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
            <BookOpen className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Interactive Learning</h2>
          <p className="text-foreground/70 mb-4 line-clamp-2">
            Explore the step-by-step election timeline with animated visualizations and micro-explanations.
          </p>
          <div className="flex items-center text-primary font-medium">
            Start Learning <ChevronRight className="ml-1 h-4 w-4" />
          </div>
        </Link>

        {/* Module 2 */}
        <Link href="/chat" className="group glass rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-secondary/20">
          <div className="bg-secondary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
            <Brain className="h-7 w-7 text-secondary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">AI Tutor</h2>
          <p className="text-foreground/70 mb-4 line-clamp-2">
            Ask any questions about elections. Choose from Simple, Detailed, or Exam modes. Multi-language supported.
          </p>
          <div className="flex items-center text-secondary font-medium">
            Chat Now <ChevronRight className="ml-1 h-4 w-4" />
          </div>
        </Link>

        {/* Module 3 */}
        <Link href="/quiz" className="group glass rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/20">
          <div className="bg-green-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
            <ListChecks className="h-7 w-7 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Adaptive Quiz</h2>
          <p className="text-foreground/70 mb-4 line-clamp-2">
            Test your knowledge with AI-generated quizzes that adapt to your skill level and track your progress.
          </p>
          <div className="flex items-center text-green-500 font-medium">
            Take a Quiz <ChevronRight className="ml-1 h-4 w-4" />
          </div>
        </Link>

        {/* Module 4 */}
        <Link href="/vote" className="group glass rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/20">
          <div className="bg-orange-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
            <Vote className="h-7 w-7 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Simulated Voting</h2>
          <p className="text-foreground/70 mb-4 line-clamp-2">
            Experience a secure, simulated voting environment with mock candidates and real-time result visualization.
          </p>
          <div className="flex items-center text-orange-500 font-medium">
            Try Demo <ChevronRight className="ml-1 h-4 w-4" />
          </div>
        </Link>
      </section>
    </div>
  );
}
