"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EXPERIMENTS_REGISTRY } from "@/data/experiments-registry";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [stationMenuOpen, setStationMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-bench-950/95 backdrop-blur-md border-b border-bench-800 text-enamel-100 font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand: Scientific Digital Twin Console */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Precision Reticle / Optical Calibration Mark Logo (No emojis!) */}
            <div className="w-9 h-9 rounded-lg bg-bench-900 border border-bench-700 flex items-center justify-center text-enamel-200 group-hover:border-instrument-amber transition-colors shadow-inner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="12" cy="12" r="9" strokeOpacity="0.4" />
                <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
                <circle cx="12" cy="12" r="3" className="fill-instrument-amber/20 stroke-instrument-amber" />
              </svg>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-sm text-enamel-50 group-hover:text-instrument-amber transition-colors">
                  CHEMLAB CC
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-bench-850 text-enamel-300 border border-bench-700">
                  DIGITAL TWIN
                </span>
              </div>
              <span className="text-[10px] text-enamel-400 tracking-wider">
                BCHY101P • VIT CHENNAI (2026–27)
              </span>
            </div>
          </Link>

          {/* Environmental Telemetry Sensors */}
          <div className="hidden xl:flex items-center gap-4 pl-4 ml-4 border-l border-bench-800 text-[11px] text-enamel-400">
            <div className="flex items-center gap-1.5">
              <span className="text-enamel-500">ATM:</span>
              <span className="text-enamel-200 font-bold">101.32 kPa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-enamel-500">TEMP:</span>
              <span className="text-enamel-200 font-bold">298.15 K</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-enamel-500">RH:</span>
              <span className="text-enamel-200 font-bold">48.2%</span>
            </div>
          </div>
        </div>

        {/* Center / Navigation Links */}
        <nav className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              pathname === "/" ? "bg-bench-850 text-white font-bold border border-bench-700" : "text-enamel-300 hover:text-white"
            }`}
          >
            Laboratory Atrium
          </Link>

          {/* Quick Station Dropdown */}
          <div className="relative">
            <button
              onClick={() => setStationMenuOpen(!stationMenuOpen)}
              className="px-3 py-1.5 rounded-md bg-bench-900 border border-bench-800 text-enamel-200 hover:text-white hover:border-bench-700 transition-all flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-instrument-phosphor animate-pulse" />
              <span>Stations (10)</span>
              <span className="text-[9px] text-enamel-400">▼</span>
            </button>

            {stationMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setStationMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-80 bg-bench-900 border border-bench-700 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 max-h-[75vh] overflow-y-auto">
                  <div className="px-3 py-2 border-b border-bench-800 text-[10px] text-enamel-400 flex items-center justify-between">
                    <span>SELECT LABORATORY STATION</span>
                    <span className="text-instrument-phosphor font-bold">1 ACTIVE // 9 PREVIEW</span>
                  </div>
                  {EXPERIMENTS_REGISTRY.map((exp) => (
                    <Link
                      key={exp.id}
                      href={`/experiments/${exp.id}`}
                      onClick={() => setStationMenuOpen(false)}
                      className={`px-3 py-2 rounded-lg text-left transition-colors flex items-center justify-between text-[11px] ${
                        pathname === `/experiments/${exp.id}`
                          ? "bg-bench-800 text-instrument-amber font-bold border border-bench-700"
                          : "text-enamel-300 hover:bg-bench-850 hover:text-white"
                      }`}
                    >
                      <div className="flex flex-col truncate pr-2">
                        <span className="truncate">STATION {exp.number.toString().padStart(2, "0")}: {exp.shortTitle}</span>
                        <span className="text-[9px] text-enamel-500 font-sans truncate">{exp.category}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                        exp.id === "exp-1"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-bench-850 text-enamel-400 border border-bench-750"
                      }`}>
                        {exp.id === "exp-1" ? "ONLINE" : "SPEC"}
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          <Link
            href="/experiments/exp-1"
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-bench-800 hover:bg-bench-750 border border-bench-700 text-instrument-amber font-bold shadow-sm transition-all"
          >
            <span>Station 01: Water Analysis</span>
            <span className="text-xs">→</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
