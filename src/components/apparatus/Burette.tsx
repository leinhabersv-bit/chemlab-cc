"use client";

import React from "react";

interface BuretteProps {
  volumeDispensed: number; // in mL, 0 to 50
  maxVolume?: number; // default 50 mL
  titrantName?: string;
  isDispensing?: boolean;
  onDispenseDrop?: () => void;
  onDispenseFast?: () => void;
  onRefill?: () => void;
  readOnly?: boolean;
  className?: string;
}

export const Burette: React.FC<BuretteProps> = ({
  volumeDispensed,
  maxVolume = 50,
  titrantName = "0.01 N EDTA",
  isDispensing = false,
  onDispenseDrop,
  onDispenseFast,
  onRefill,
  readOnly = false,
  className = "",
}) => {
  const clampedVol = Math.min(Math.max(volumeDispensed, 0), maxVolume);
  // Glass column height = 280px. Liquid level drops from top (0 mL) to bottom (50 mL)
  const liquidLevelHeight = ((maxVolume - clampedVol) / maxVolume) * 280;

  return (
    <div className={`flex flex-col items-center bg-lab-900/60 p-4 rounded-xl border border-lab-700/60 shadow-lg text-slate-100 ${className}`}>
      <div className="flex items-center justify-between w-full mb-2 text-xs font-mono text-slate-400">
        <span className="font-semibold text-cyan-400">BURETTE (50 mL)</span>
        <span className="bg-lab-800 px-2 py-0.5 rounded border border-lab-700 text-slate-300">
          Reading: <strong className="text-emerald-400 font-mono text-sm">{clampedVol.toFixed(2)}</strong> mL
        </span>
      </div>

      <div className="text-[11px] text-slate-400 mb-2 truncate max-w-[200px]" title={titrantName}>
        Titrant: <span className="text-cyan-300">{titrantName}</span>
      </div>

      {/* Burette Graphic */}
      <div className="relative w-36 h-[380px] flex justify-center">
        {/* Support Stand */}
        <div className="absolute right-6 top-4 bottom-0 w-2.5 bg-slate-700 rounded-sm border-r border-slate-600" />
        <div className="absolute right-4 bottom-0 w-20 h-3 bg-slate-800 rounded border border-slate-600" />
        {/* Clamps */}
        <div className="absolute right-6 top-20 w-12 h-3.5 bg-slate-600 rounded-sm shadow-sm" />
        <div className="absolute right-6 top-52 w-12 h-3.5 bg-slate-600 rounded-sm shadow-sm" />

        {/* Burette Glass Column */}
        <svg
          viewBox="0 0 80 360"
          className="w-20 h-[360px] overflow-visible drop-shadow-md z-10"
        >
          <defs>
            <linearGradient id="glassReflect" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="25%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="75%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
            </linearGradient>
            <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.45)" />
              <stop offset="50%" stopColor="rgba(14, 165, 233, 0.6)" />
              <stop offset="100%" stopColor="rgba(2, 132, 199, 0.45)" />
            </linearGradient>
          </defs>

          {/* Top Funnel Lip */}
          <path d="M 30 10 L 50 10 L 46 25 L 34 25 Z" fill="rgba(255,255,255,0.15)" stroke="rgba(203,213,225,0.6)" strokeWidth="1.2" />

          {/* Main Glass Tube Outer */}
          <rect
            x="33"
            y="25"
            width="14"
            height="270"
            rx="2"
            fill="rgba(15, 23, 42, 0.5)"
            stroke="rgba(203,213,225,0.7)"
            strokeWidth="1.2"
          />

          {/* Liquid Fill Inside Column */}
          <rect
            x="34"
            y={295 - liquidLevelHeight}
            width="12"
            height={liquidLevelHeight}
            fill="url(#liquidGrad)"
            className="transition-all duration-300"
          />

          {/* Meniscus Curve at top of liquid */}
          {liquidLevelHeight > 5 && (
            <ellipse
              cx="40"
              cy={295 - liquidLevelHeight}
              rx="6"
              ry="2"
              fill="rgba(186, 230, 253, 0.9)"
              stroke="rgba(56, 189, 248, 1)"
              strokeWidth="0.8"
            />
          )}

          {/* Graduations */}
          {Array.from({ length: 11 }).map((_, i) => {
            const markVol = i * 5;
            const y = 25 + (markVol / 50) * 270;
            return (
              <g key={i}>
                <line x1="33" y1={y} x2="40" y2={y} stroke="rgba(226,232,240,0.8)" strokeWidth="1" />
                <text x="24" y={y + 3} fill="rgba(203,213,225,0.8)" fontSize="6" fontFamily="monospace" textAnchor="end">
                  {markVol}
                </text>
              </g>
            );
          })}

          {/* Glass reflection overlay */}
          <rect x="33" y="25" width="14" height="270" fill="url(#glassReflect)" />

          {/* Stopcock valve assembly */}
          <rect x="36" y="295" width="8" height="20" fill="rgba(203,213,225,0.5)" stroke="rgba(148,163,184,0.8)" strokeWidth="1" />
          <circle cx="40" cy="305" r="5" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" />
          {/* Stopcock handle */}
          <rect
            x="32"
            y="303"
            width="16"
            height="4"
            rx="1"
            fill="#d97706"
            transform={isDispensing ? "rotate(90 40 305)" : "rotate(0 40 305)"}
            className="transition-transform duration-200"
          />

          {/* Burette Jet Tip */}
          <path d="M 37 315 L 43 315 L 41 340 L 39 340 Z" fill="rgba(255,255,255,0.3)" stroke="rgba(203,213,225,0.7)" strokeWidth="1" />

          {/* Falling Droplet Animation when Dispensing */}
          {isDispensing && (
            <circle
              cx="40"
              cy="348"
              r="2.5"
              fill="rgba(56, 189, 248, 0.95)"
              className="animate-drop-fall"
            />
          )}
        </svg>
      </div>

      {/* Control Buttons */}
      {!readOnly && (
        <div className="flex flex-col gap-2 w-full mt-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onDispenseDrop}
              className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-xs font-semibold text-white rounded shadow transition-all flex items-center justify-center gap-1"
              title="Dispense single drop (~0.05 mL)"
            >
              💧 Drop (0.05 mL)
            </button>
            <button
              onClick={onDispenseFast}
              className="px-2.5 py-1.5 bg-sky-700 hover:bg-sky-600 active:scale-95 text-xs font-semibold text-white rounded shadow transition-all flex items-center justify-center gap-1"
              title="Dispense 1.0 mL rapidly"
            >
              ⚡ Fast (1.0 mL)
            </button>
          </div>
          <button
            onClick={onRefill}
            className="w-full py-1 text-slate-400 hover:text-slate-200 bg-lab-800/80 hover:bg-lab-700 border border-lab-700 rounded text-[11px] font-mono transition-colors"
          >
            ↺ Refill to 0.00 mL
          </button>
        </div>
      )}
    </div>
  );
};
