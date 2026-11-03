"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EXPERIMENTS_REGISTRY } from "@/data/experiments-registry";
import { ExperimentMetadata } from "@/types/experiment";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    "Analytical & Environmental",
    "Nanomaterials & Synthesis",
    "Energy & Electrochemistry",
    "Kinetics & Dynamics",
  ];

  const filteredExperiments = EXPERIMENTS_REGISTRY.filter((exp) => {
    const matchesCategory =
      selectedCategory === "All" || exp.category === selectedCategory;
    const matchesSearch =
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.aim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.shortTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-10">
      {/* Editorial Laboratory Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-lab-950 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-800/80 tracking-wide">
              BCHY101P ENGINEERING CHEMISTRY LAB (2026–27)
            </span>
            <span className="text-xs font-mono text-slate-400">VIT CHENNAI</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Scientific Simulation Engine & Virtual Laboratory
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            Rigorous, unit-aware virtual laboratory environment based directly on the 51-page VIT Chennai Engineering Chemistry Lab Manual. Perform guided demonstrations, interactive wet-lab practice, live observation logging, and tolerance-aware grading.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/experiments/exp-1"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-mono font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
            >
              <span>🧪 Launch Experiment 1: Water Analysis</span>
              <span>→</span>
            </Link>

            <a
              href="https://cpcb.nic.in/wqstandards/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs transition-colors"
            >
              CPCB / BIS 10500 Standards ↗
            </a>
          </div>
        </div>

        {/* Vital Metrics Grid */}
        <div className="mt-8 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <div className="text-2xl font-extrabold text-cyan-400">10 / 10</div>
            <div className="text-slate-400 text-[11px]">Syllabus Experiments</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-400">51 Pages</div>
            <div className="text-slate-400 text-[11px]">Source Manual Mapped</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-amber-400">5 Modalities</div>
            <div className="text-slate-400 text-[11px]">Part A–E in Exp 1</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-purple-400">0% Fake</div>
            <div className="text-slate-400 text-[11px]">Physical Models Only</div>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 font-mono text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-cyan-600 text-white font-bold shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experiments, reagents, aim..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none font-mono"
          />
        </div>
      </section>

      {/* Experiments Catalog Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperiments.map((exp) => (
          <ExperimentCard key={exp.id} experiment={exp} />
        ))}
      </section>
    </div>
  );
}

function ExperimentCard({ experiment }: { experiment: ExperimentMetadata }) {
  const isReady = experiment.status === "ready";

  return (
    <div
      className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
        isReady
          ? "bg-slate-900/90 border-cyan-500/40 hover:border-cyan-400 shadow-lg shadow-cyan-950/20"
          : "bg-slate-950/80 border-slate-800/80 hover:border-slate-700 opacity-90"
      }`}
    >
      <div className="flex flex-col gap-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-cyan-400">
            EXP {experiment.number.toString().padStart(2, "0")}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
              isReady
                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                : "bg-amber-950 text-amber-300 border border-amber-800"
            }`}
          >
            {isReady ? "Interactive Simulator Ready" : "Phase 2/3 Roadmap"}
          </span>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
            {experiment.title}
          </h3>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Manual Pages {experiment.source.pageStart}–{experiment.source.pageEnd} • {experiment.category}
          </p>
        </div>

        <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans">
          {experiment.aim}
        </p>

        {/* Subparts Chips */}
        {experiment.subparts && experiment.subparts.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {experiment.subparts.map((sp) => (
              <span
                key={sp.id}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400"
              >
                {sp.id.toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-500">
          {experiment.apparatus.length} Apparatus Items
        </span>

        <Link
          href={`/experiments/${experiment.id}`}
          className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
            isReady
              ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-900/30"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
          }`}
        >
          <span>{isReady ? "Launch Lab" : "View Spec & Learn"}</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}

