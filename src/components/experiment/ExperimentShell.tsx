"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExperimentMetadata } from "@/types/experiment";
import { LearnSection } from "./LearnSection";
import { ReviewSection } from "./ReviewSection";
import { CalculationWorkbench } from "./CalculationWorkbench";

interface ExperimentShellProps {
  experiment: ExperimentMetadata;
}

export type ExperimentTab = "blueprint" | "learn" | "calculations" | "review";

export const ExperimentShell: React.FC<ExperimentShellProps> = ({ experiment }) => {
  const [activeTab, setActiveTab] = useState<ExperimentTab>("blueprint");

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans text-enamel-100">
      {/* Top Breadcrumb & Metadata Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-mono text-enamel-400">
          <Link href="/" className="hover:text-instrument-amber transition-colors">
            Laboratory Atrium
          </Link>
          <span>/</span>
          <span className="text-white font-bold">Station {experiment.number.toString().padStart(2, "0")}</span>
          <span>/</span>
          <span className="text-instrument-amber uppercase font-semibold">{activeTab}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-bench-850 text-instrument-amber border border-bench-700">
                {experiment.category}
              </span>
              <span className="text-xs font-mono text-enamel-400">
                BCHY101P • pp. {experiment.source.pageStart}–{experiment.source.pageEnd}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              {experiment.title}
            </h1>
            <p className="text-xs sm:text-sm text-enamel-300 mt-1">
              {experiment.subtitle}
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border bg-bench-900 text-instrument-amber border-bench-750 shadow-md">
              SPECIFICATION VALIDATED (PHASE 2/3)
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-bench-800 font-mono text-xs overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("blueprint")}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "blueprint"
              ? "border-instrument-amber text-instrument-amber bg-bench-900 font-bold"
              : "border-transparent text-enamel-400 hover:text-white hover:bg-bench-900/50"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-instrument-amber" />
          <span>1. Station Blueprint & Protocol</span>
        </button>

        <button
          onClick={() => setActiveTab("learn")}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "learn"
              ? "border-instrument-amber text-instrument-amber bg-bench-900 font-bold"
              : "border-transparent text-enamel-400 hover:text-white hover:bg-bench-900/50"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-instrument-sky" />
          <span>2. Scientific Theory & Equations</span>
        </button>

        <button
          onClick={() => setActiveTab("calculations")}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "calculations"
              ? "border-instrument-amber text-instrument-amber bg-bench-900 font-bold"
              : "border-transparent text-enamel-400 hover:text-white hover:bg-bench-900/50"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>3. Calculations & Formulas</span>
        </button>

        <button
          onClick={() => setActiveTab("review")}
          className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "review"
              ? "border-instrument-amber text-instrument-amber bg-bench-900 font-bold"
              : "border-transparent text-enamel-400 hover:text-white hover:bg-bench-900/50"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          <span>4. Viva Voce & Review</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-2">
        {activeTab === "blueprint" && (
          <div className="flex flex-col gap-6">
            {/* Station Status Banner */}
            <div className="bg-bench-900 border border-bench-750 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 font-mono text-xs text-instrument-amber font-bold">
                  <span>STATION BLUEPRINT SPECIFICATION // BCHY101P</span>
                </div>
                <h3 className="text-lg font-bold text-white font-sans">
                  Syllabus Protocol & Characterization Architecture
                </h3>
                <p className="text-xs text-enamel-400 font-sans max-w-2xl leading-relaxed">
                  The complete chemical procedure, apparatus specifications, safety data, and mathematical models have been mapped from pages {experiment.source.pageStart}–{experiment.source.pageEnd} of the VIT Chennai Lab Manual. Interactive physics engine deployment is scheduled for Phase 2/3.
                </p>
              </div>

              <Link
                href="/experiments/exp-1"
                className="px-4 py-2.5 rounded-xl bg-bench-800 hover:bg-bench-750 border border-bench-700 text-instrument-amber font-mono font-bold text-xs shrink-0 transition-all flex items-center gap-2"
              >
                <span>Launch Station 01 Digital Twin</span>
                <span>→</span>
              </Link>
            </div>

            {/* Apparatus & Chemical Reagents Specification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Apparatus Manifest */}
              <div className="bg-bench-900 border border-bench-750 rounded-2xl p-5 flex flex-col gap-3 font-mono text-xs">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  APPARATUS & INSTRUMENT MANIFEST:
                </span>
                <ul className="space-y-2 text-enamel-300">
                  {experiment.apparatus.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-bench-950 p-2.5 rounded-lg border border-bench-800">
                      <span className="text-instrument-amber">▫</span>
                      <span>{item.name} {item.specification ? `(${item.specification})` : ""}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Chemical Reagents Manifest */}
              <div className="bg-bench-900 border border-bench-750 rounded-2xl p-5 flex flex-col gap-3 font-mono text-xs">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  CHEMICAL REAGENTS & SOLVENTS:
                </span>
                <ul className="space-y-2 text-enamel-300">
                  {experiment.chemicals.map((chem, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-bench-950 p-2.5 rounded-lg border border-bench-800">
                      <span className="text-instrument-phosphor">▫</span>
                      <span>{chem.name} {chem.formula ? `(${chem.formula})` : ""}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Learning Outcomes & Competencies */}
            <div className="bg-bench-900 border border-bench-750 rounded-2xl p-5 flex flex-col gap-3 font-mono text-xs">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                SYLLABUS LEARNING OUTCOMES:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-enamel-300 font-sans text-xs">
                {experiment.learningOutcomes.map((lo, idx) => (
                  <div key={idx} className="bg-bench-950 p-3 rounded-lg border border-bench-800 flex items-start gap-2.5">
                    <span className="font-mono text-instrument-amber font-bold">{idx + 1}.</span>
                    <span className="leading-relaxed">{lo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "learn" && <LearnSection experiment={experiment} />}
        {activeTab === "calculations" && <CalculationWorkbench />}
        {activeTab === "review" && <ReviewSection experiment={experiment} />}
      </div>
    </div>
  );
};
