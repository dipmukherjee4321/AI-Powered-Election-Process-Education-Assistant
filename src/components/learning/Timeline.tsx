"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  FileSignature,
  Users,
  Vote,
  Calculator,
  Trophy,
  ChevronRight,
} from "lucide-react";

const STAGES = [
  {
    id: "announcement",
    title: "Announcement",
    icon: Megaphone,
    color: "bg-blue-500",
    description:
      "The Election Commission officially announces the dates for polling and counting. The Model Code of Conduct comes into effect immediately.",
    details: [
      "Press conference held by the Election Commission.",
      "Guidelines issued to all political parties.",
      "Restrictions on government announcements to ensure a level playing field.",
    ],
  },
  {
    id: "nomination",
    title: "Nomination",
    icon: FileSignature,
    color: "bg-purple-500",
    description:
      "Candidates file their nomination papers along with an affidavit detailing their assets, liabilities, and criminal records (if any).",
    details: [
      "Filing of papers before the Returning Officer.",
      "Scrutiny of nominations to check for validity.",
      "Option for candidates to withdraw their names.",
    ],
  },
  {
    id: "campaigning",
    title: "Campaigning",
    icon: Users,
    color: "bg-orange-500",
    description:
      "Political parties and candidates reach out to voters through rallies, manifestos, and advertisements.",
    details: [
      "Public meetings, rallies, and door-to-door visits.",
      "Distribution of party manifestos outlining promises.",
      "Campaigning officially stops 48 hours before voting begins.",
    ],
  },
  {
    id: "voting",
    title: "Voting Day",
    icon: Vote,
    color: "bg-green-500",
    description:
      "Citizens cast their votes secretly at designated polling booths using EVMs or ballot papers.",
    details: [
      "Voters verify identity using a Voter ID card.",
      "Indelible ink is applied to the finger to prevent double voting.",
      "EVMs (Electronic Voting Machines) are sealed after polling.",
    ],
  },
  {
    id: "counting",
    title: "Counting",
    icon: Calculator,
    color: "bg-yellow-500",
    description:
      "Votes are counted under the strict supervision of the Election Commission and candidate representatives.",
    details: [
      "EVMs are opened in secure counting centers.",
      "VVPAT (Voter Verifiable Paper Audit Trail) slips may be tallied in specific cases.",
      "Trends are released progressively.",
    ],
  },
  {
    id: "results",
    title: "Results",
    icon: Trophy,
    color: "bg-red-500",
    description:
      "Final results are declared. The candidate with the highest number of valid votes in a constituency is elected.",
    details: [
      "Returning Officer gives the winning certificate.",
      "The party or coalition with a majority forms the government.",
      "Elected representatives take their oaths.",
    ],
  },
];

export default function Timeline() {
  const [activeStage, setActiveStage] = useState(0);

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Visual Timeline Bar */}
      <div
        className="relative flex justify-between items-center mb-16 before:absolute before:inset-0 before:top-1/2 before:-translate-y-1/2 before:h-1 before:bg-surface-dark/10 dark:before:bg-surface-light/10 before:-z-10"
        role="tablist"
        aria-label="Election Stages"
      >
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = idx === activeStage;
          const isPast = idx < activeStage;

          return (
            <button
              key={stage.id}
              className="flex flex-col items-center cursor-pointer relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
              onClick={() => setActiveStage(idx)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${stage.id}`}
              id={`tab-${stage.id}`}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                  backgroundColor:
                    isActive || isPast
                      ? "var(--color-primary)"
                      : "var(--color-surface)",
                  color:
                    isActive || isPast ? "#fff" : "var(--color-foreground)",
                }}
                className={`w-12 h-12 rounded-full border-4 border-background flex items-center justify-center transition-colors shadow-sm
                  ${!isActive && !isPast && "bg-surface dark:bg-surface-dark text-foreground/50 border-surface-dark/20"}
                `}
              >
                <Icon size={20} />
              </motion.div>
              <div
                className={`absolute top-14 text-sm font-medium whitespace-nowrap transition-colors
                ${isActive ? "text-primary font-bold" : "text-foreground/60 group-hover:text-foreground"}
              `}
              >
                {stage.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="mt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl p-8 border border-surface-dark/10 shadow-lg relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            role="tabpanel"
            id={`panel-${STAGES[activeStage].id}`}
            aria-labelledby={`tab-${STAGES[activeStage].id}`}
            tabIndex={0}
          >
            {/* Background accent */}
            <div
              className={`absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-10 blur-3xl ${STAGES[activeStage].color}`}
            />

            <div className="flex items-start gap-6 relative z-10">
              <div
                className={`p-4 rounded-xl text-white shadow-md ${STAGES[activeStage].color}`}
              >
                {(() => {
                  const Icon = STAGES[activeStage].icon;
                  return <Icon size={32} />;
                })()}
              </div>

              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-4">
                  {STAGES[activeStage].title}
                </h3>
                <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
                  {STAGES[activeStage].description}
                </p>

                <div className="bg-background/50 rounded-xl p-5 border border-surface-dark/5 dark:border-surface-light/5">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-primary mb-3">
                    Key Activities
                  </h4>
                  <ul className="space-y-3">
                    {STAGES[activeStage].details.map((detail, idx) => (
                      <li key={idx} className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-primary shrink-0 mr-2 opacity-70" />
                        <span className="text-foreground/90">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Navigation buttons inside card */}
            <div className="flex justify-between mt-8 pt-6 border-t border-surface-dark/10 dark:border-surface-light/10">
              <button
                onClick={() => setActiveStage(Math.max(0, activeStage - 1))}
                disabled={activeStage === 0}
                className="px-4 py-2 rounded-lg font-medium text-foreground/70 hover:bg-surface/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Previous Stage
              </button>
              <button
                onClick={() =>
                  setActiveStage(Math.min(STAGES.length - 1, activeStage + 1))
                }
                disabled={activeStage === STAGES.length - 1}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium shadow hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {activeStage === STAGES.length - 1 ? "Finish" : "Next Stage"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
