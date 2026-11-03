"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExperimentMetadata } from "@/types/experiment";
import { LearnSection } from "./LearnSection";
import { ReviewSection } from "./ReviewSection";
import { CalculationWorkbench } from "./CalculationWorkbench";
import { Exp1Demo } from "../experiments/exp1/Exp1Demo";
import { Exp1Container } from "../experiments/exp1/Exp1Container";

interface ExperimentShellProps {
  experiment: ExperimentMetadata;
}

export type ExperimentTab = "learn" | "demo" | "practice" | "calculations" | "review";

export const ExperimentShell: React.FC<ExperimentShellProps> = ({ experiment }) => {
  const [activeTab, setActiveTab] = useState<ExperimentTab>("learn");

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Breadcrumb & Metadata Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link href="/" className="hover:text-cyan-400 transition-colors">
            Experiment Library
          </Link>
          <span>/</span>
          <span className="text-slate-300">Exp {experiment.number}</span>
          <span>/</span>
          <span className="text-cyan-400 uppercase font-semibold">{activeTab}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                {experiment.category}
              </span>
              <span className="text-xs font-mono text-slate-400">
                BCHY101P Engineering Chemistry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              {experiment.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {experiment.subtitle}
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
                experiment.status === "ready"
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/80 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  : "bg-amber-950/80 text-amber-300 border-amber-700/80"
              }`}
            >
              {experiment.status === "ready" ? "● Interactive Simulator Ready" : "○ Specification Ready (Phase 2/3)"}
            </span>
          </div>
        </div>
      </div>

      {/* Main 5-Section Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 font-mono text-xs overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("learn")}
          className={`px-4 py-2.5 rounded-t-lg transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "learn"
              ? "border-cyan-400 text-cyan-300 bg-slate-900/90 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
          }`}
        >
          <span>📖</span>
          <span>1. Learn & Principle</span>
        </button>

        <button
          onClick={() => setActiveTab("demo")}
          className={`px-4 py-2.5 rounded-t-lg transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "demo"
              ? "border-cyan-400 text-cyan-300 bg-slate-900/90 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
          }`}
        >
          <span>🎬</span>
          <span>2. Demonstration</span>
        </button>

        <button
          onClick={() => setActiveTab("practice")}
          className={`px-4 py-2.5 rounded-t-lg transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "practice"
              ? "border-cyan-400 text-cyan-300 bg-slate-900/90 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
          }`}
        >
          <span>🧪</span>
          <span>3. Hands-on Practice</span>
        </button>

        <button
          onClick={() => setActiveTab("calculations")}
          className={`px-4 py-2.5 rounded-t-lg transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "calculations"
              ? "border-cyan-400 text-cyan-300 bg-slate-900/90 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
          }`}
        >
          <span>📐</span>
          <span>4. Calculations & Grader</span>
        </button>

        <button
          onClick={() => setActiveTab("review")}
          className={`px-4 py-2.5 rounded-t-lg transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "review"
              ? "border-cyan-400 text-cyan-300 bg-slate-900/90 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
          }`}
        >
          <span>📝</span>
          <span>5. Quiz & Review</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-2">
        {activeTab === "learn" && <LearnSection experiment={experiment} />}

        {activeTab === "demo" && (
          experiment.id === "exp-1" ? (
            <Exp1Demo />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 font-mono text-sm space-y-3">
              <div className="text-3xl">⚙️</div>
              <div className="text-slate-200 font-bold text-base">
                Demonstration Simulation Scheduled
              </div>
              <p className="max-w-md mx-auto text-xs text-slate-400">
                Interactive demonstration for Experiment {experiment.number} ({experiment.shortTitle}) is documented in the Phase 2/3 roadmap. See Learn tab for full protocol and equations.
              </p>
            </div>
          )
        )}

        {activeTab === "practice" && (
          experiment.id === "exp-1" ? (
            <Exp1Container mode="practice" />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 font-mono text-sm space-y-3">
              <div className="text-3xl">🧪</div>
              <div className="text-slate-200 font-bold text-base">
                Practice Simulator Scheduled
              </div>
              <p className="max-w-md mx-auto text-xs text-slate-400">
                Practice workbench for Experiment {experiment.number} ({experiment.shortTitle}) is part of Phase 2/3 delivery. The structured scientific specifications are complete and verified.
              </p>
            </div>
          )
        )}

        {activeTab === "calculations" && <CalculationWorkbench />}

        {activeTab === "review" && <ReviewSection experiment={experiment} />}
      </div>
    </div>
  );
};

