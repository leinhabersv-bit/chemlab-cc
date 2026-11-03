"use client";

import React from "react";
import Link from "next/link";

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center text-white font-mono font-black text-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
            ⚗️
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                CHEMLAB CC
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                v1.0
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">
              VIT CHENNAI • BCHY101P 2026–27
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono">
          <Link href="/" className="text-slate-300 hover:text-cyan-400 transition-colors">
            Experiments (10)
          </Link>
          <Link href="/experiments/exp-1" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Exp 1 (Water Analysis)
          </Link>
          <a
            href="https://cpcb.nic.in/wqstandards/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            CPCB / BIS Standards ↗
          </a>
        </nav>

        {/* Right Badges */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2.5 py-1 rounded-full">
            ● Phase 1 Active
          </span>
        </div>
      </div>
    </header>
  );
};
