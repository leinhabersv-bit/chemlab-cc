import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950 text-slate-400 text-xs font-mono py-10 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <div className="text-slate-200 font-bold">
            CHEMLAB CC — Open-Source Virtual Chemistry Laboratory
          </div>
          <div className="text-[11px] text-slate-500">
            Division of Chemistry, School of Advanced Sciences, Vellore Institute of Technology, Chennai Campus.
          </div>
          <div className="text-[11px] text-amber-500/90 mt-1">
            ⚠️ NOTICE: All simulations are mathematical educational models. Virtual readings do not substitute for actual certified laboratory measurements.
          </div>
        </div>

        <div className="flex items-center gap-6 text-[11px]">
          <span>Syllabus: BCHY101P (2026–27)</span>
          <span>•</span>
          <span>Next.js App Router</span>
          <span>•</span>
          <span>Vercel Ready</span>
        </div>
      </div>
    </footer>
  );
};
