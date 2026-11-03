"use client";

import React from "react";
import { ExperimentMetadata } from "@/types/experiment";

interface LearnSectionProps {
  experiment: ExperimentMetadata;
}

export const LearnSection: React.FC<LearnSectionProps> = ({ experiment }) => {
  return (
    <div className="flex flex-col gap-6 text-slate-100">
      {/* Aim & Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
            EXPERIMENT {experiment.number}
          </span>
          <span className="text-xs font-mono text-slate-400">
            Source: Manual Pages {experiment.source.pageStart}–{experiment.source.pageEnd}
          </span>
        </div>

        <h2 className="text-xl font-bold text-slate-100">
          {experiment.title}
        </h2>

        <p className="text-sm text-slate-300 leading-relaxed font-sans">
          {experiment.aim}
        </p>

        {/* Learning Outcomes */}
        <div className="mt-3 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-mono font-bold text-slate-300 mb-2 uppercase tracking-wider">
            Student Learning Outcomes:
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-sans text-slate-300">
            {experiment.learningOutcomes.map((outcome, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-cyan-400 font-bold font-mono">0{idx + 1}.</span>
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Subparts / Principles Breakdown */}
      {experiment.subparts && experiment.subparts.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider">
            Chemical Principles & Reactions:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experiment.subparts.map((sp) => (
              <div key={sp.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                <h4 className="text-sm font-bold text-cyan-300">{sp.title}</h4>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">{sp.description}</p>
                <div className="mt-2 p-2.5 bg-slate-900/90 rounded border border-slate-800 text-[11px] font-mono text-emerald-300 leading-relaxed">
                  {sp.principle}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Chemical Equations & Documented Errata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-3">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            Verified Reaction Equations:
          </h3>
          <ul className="space-y-2 text-xs font-mono">
            {experiment.source.verifiedEquations.map((eq, i) => (
              <li key={i} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-cyan-200">
                {eq}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-3">
          <h3 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>⚠️</span> Documented Inconsistencies & Errata:
          </h3>
          {experiment.source.inconsistenciesNoted.length === 0 ? (
            <p className="text-xs font-mono text-slate-500">
              No scientific inconsistencies detected in manual source text.
            </p>
          ) : (
            <ul className="space-y-2 text-xs font-sans text-slate-300">
              {experiment.source.inconsistenciesNoted.map((inc, i) => (
                <li key={i} className="p-2.5 bg-amber-950/30 rounded-lg border border-amber-900/40 text-amber-200/90 leading-relaxed text-[11px]">
                  {inc}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Apparatus & Reagents Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-3">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            Required Apparatus:
          </h3>
          <div className="divide-y divide-slate-800 text-xs font-mono">
            {experiment.apparatus.map((app) => (
              <div key={app.id} className="py-2 flex items-center justify-between">
                <span className="font-semibold text-slate-200">{app.name}</span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {app.specification}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-3">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            Reagents & Solutions:
          </h3>
          <div className="divide-y divide-slate-800 text-xs font-mono">
            {experiment.chemicals.map((chem) => (
              <div key={chem.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">{chem.name}</div>
                  <div className="text-[10px] text-cyan-400">{chem.formula}</div>
                </div>
                {chem.concentration && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
                    {chem.concentration}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
