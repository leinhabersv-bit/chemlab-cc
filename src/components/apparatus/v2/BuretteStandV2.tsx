"use client";

import React, { useRef, useState, useEffect } from "react";
import { labAudio } from "@/lib/audio/lab-audio";

interface BuretteStandV2Props {
  volumeDispensed: number; // in mL, 0 to 50
  maxVolume?: number;
  titrantName?: string;
  isDispensing?: boolean;
  onDispenseAmount: (amount: number) => void;
  onRefill?: () => void;
  readOnly?: boolean;
  className?: string;
}

export const BuretteStandV2: React.FC<BuretteStandV2Props> = ({
  volumeDispensed,
  maxVolume = 50,
  titrantName = "0.01 N EDTA",
  isDispensing = false,
  onDispenseAmount,
  onRefill,
  readOnly = false,
  className = "",
}) => {
  const [isHoldingStopcock, setIsHoldingStopcock] = useState<boolean>(false);
  const [flowRate, setFlowRate] = useState<number>(0.2); // mL per tick
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clampedVol = Math.min(Math.max(volumeDispensed, 0), maxVolume);
  // Column height in SVG coords: 320px
  const columnLiquidHeight = ((maxVolume - clampedVol) / maxVolume) * 260;

  // Handle continuous dispensing on mouse down / touch start
  useEffect(() => {
    if (isHoldingStopcock && !readOnly) {
      holdIntervalRef.current = setInterval(() => {
        onDispenseAmount(flowRate);
        labAudio.playDrop();
      }, 100);
    } else {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
      }
    }
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, [isHoldingStopcock, flowRate, readOnly, onDispenseAmount]);

  const stopcockAngle = isHoldingStopcock || isDispensing ? 90 : 0;

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Top Reading HUD */}
      <div className="flex items-center gap-2 mb-2 px-3.5 py-1.5 bg-bench-900 border border-bench-750 rounded-xl shadow-md font-mono text-xs">
        <span className="text-enamel-400">Burette:</span>
        <strong className="text-instrument-sky text-sm font-bold">{clampedVol.toFixed(2)} mL</strong>
        <span className="text-[10px] text-enamel-500">/ {maxVolume} mL</span>
      </div>

      {/* SVG Stand + Burette Assembly */}
      <div className="relative w-44 h-[440px] flex justify-center">
        <svg viewBox="0 0 160 440" className="w-full h-full overflow-visible drop-shadow-xl">
          <defs>
            {/* Cast iron stand gradient */}
            <linearGradient id="ironStand" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Steel rod reflection */}
            <linearGradient id="steelRod" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="40%" stopColor="#cbd5e1" />
              <stop offset="60%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            {/* Glass tube gradient */}
            <linearGradient id="buretteGlass" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="15%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="85%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.35)" />
            </linearGradient>

            {/* Liquid fill */}
            <linearGradient id="buretteLiquid" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.55)" />
              <stop offset="50%" stopColor="rgba(14, 165, 233, 0.75)" />
              <stop offset="100%" stopColor="rgba(2, 132, 199, 0.55)" />
            </linearGradient>
          </defs>

          {/* Heavy Cast-Iron Retort Base (Left-aligned) */}
          <rect x="10" y="415" width="140" height="18" rx="4" fill="url(#ironStand)" stroke="#475569" strokeWidth="1.5" />
          <line x1="20" y1="418" x2="140" y2="418" stroke="#64748b" strokeWidth="0.8" opacity="0.6" />

          {/* Heavy Vertical Steel Rod */}
          <rect x="25" y="15" width="8" height="400" rx="2" fill="url(#steelRod)" stroke="#475569" strokeWidth="1" />

          {/* Horizontal Clamps holding the Burette */}
          {/* Clamp 1 (Top) */}
          <rect x="29" y="80" width="45" height="6" rx="1.5" fill="#475569" stroke="#334155" strokeWidth="1" />
          <rect x="68" y="76" width="12" height="14" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1" />

          {/* Clamp 2 (Bottom) */}
          <rect x="29" y="220" width="45" height="6" rx="1.5" fill="#475569" stroke="#334155" strokeWidth="1" />
          <rect x="68" y="216" width="12" height="14" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1" />

          {/* Burette Glass Body */}
          {/* Top funnel lip */}
          <path d="M 64 25 L 84 25 L 78 38 L 70 38 Z" fill="rgba(255,255,255,0.18)" stroke="#cbd5e1" strokeWidth="1" />

          {/* Main Graduated Tube */}
          <rect
            x="69"
            y="38"
            width="10"
            height="260"
            rx="1.5"
            fill="rgba(15, 23, 42, 0.45)"
            stroke="#94a3b8"
            strokeWidth="1.2"
          />

          {/* Liquid Column */}
          <rect
            x="70"
            y={298 - columnLiquidHeight}
            width="8"
            height={columnLiquidHeight}
            fill="url(#buretteLiquid)"
            className="transition-all duration-150"
          />

          {/* Liquid Meniscus Curve */}
          {columnLiquidHeight > 4 && (
            <ellipse
              cx="74"
              cy={298 - columnLiquidHeight}
              rx="4"
              ry="1.5"
              fill="rgba(186, 230, 253, 0.95)"
              stroke="#38bdf8"
              strokeWidth="0.8"
            />
          )}

          {/* Glass Glare */}
          <rect x="69" y="38" width="10" height="260" fill="url(#buretteGlass)" />

          {/* Graduation Markings */}
          {Array.from({ length: 11 }).map((_, i) => {
            const mark = i * 5;
            const y = 38 + (mark / 50) * 260;
            return (
              <g key={i}>
                <line x1="69" y1={y} x2="74" y2={y} stroke="#f1f5f9" strokeWidth="0.9" />
                <text x="63" y={y + 2.5} fill="#94a3b8" fontSize="6" fontFamily="monospace" textAnchor="end">
                  {mark}
                </text>
              </g>
            );
          })}

          {/* Glass Stopcock Barrel */}
          <rect x="71" y="298" width="6" height="22" fill="#cbd5e1" opacity="0.6" stroke="#94a3b8" strokeWidth="0.8" />
          
          {/* Rotary Stopcock Key (Interactive Handle) */}
          <g
            transform={`translate(74, 309) rotate(${stopcockAngle})`}
            className="transition-transform duration-200"
          >
            <rect x="-10" y="-3" width="20" height="6" rx="2" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="2.5" fill="#d97706" />
          </g>

          {/* Burette Jet Tip */}
          <path d="M 72 320 L 76 320 L 75 348 L 73 348 Z" fill="rgba(255,255,255,0.4)" stroke="#94a3b8" strokeWidth="1" />

          {/* Dynamic Falling Stream / Droplets when Dispensing */}
          {(isHoldingStopcock || isDispensing) && (
            <g>
              {/* Continuous micro-stream from tip downwards */}
              <line
                x1="74"
                y1="348"
                x2="74"
                y2="400"
                stroke="rgba(56, 189, 248, 0.85)"
                strokeWidth="1.6"
                strokeDasharray="4,2"
                className="animate-pulse"
              />
              <circle cx="74" cy="405" r="2.2" fill="#38bdf8" />
            </g>
          )}
        </svg>
      </div>

      {/* Stopcock Physical Action Controller */}
      {!readOnly && (
        <div className="flex flex-col gap-2 w-full max-w-[210px] mt-2 bg-bench-900 p-3 rounded-2xl border border-bench-750 shadow-xl">
          <div className="flex items-center justify-between text-[10px] font-mono text-enamel-400">
            <span>STOPCOCK VALVE:</span>
            <span className={isHoldingStopcock ? "text-instrument-amber font-bold animate-pulse" : "text-enamel-500"}>
              {isHoldingStopcock ? "FLOWING..." : "CLOSED"}
            </span>
          </div>

          {/* Hold to Stream Primary Interaction */}
          <button
            onMouseDown={() => {
              labAudio.playStopcockClick();
              setIsHoldingStopcock(true);
            }}
            onMouseUp={() => setIsHoldingStopcock(false)}
            onMouseLeave={() => setIsHoldingStopcock(false)}
            onTouchStart={() => {
              labAudio.playStopcockClick();
              setIsHoldingStopcock(true);
            }}
            onTouchEnd={() => setIsHoldingStopcock(false)}
            className={`w-full py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow ${
              isHoldingStopcock
                ? "bg-instrument-amber text-slate-950 scale-[0.98] ring-2 ring-amber-400"
                : "bg-bench-800 hover:bg-bench-750 border border-bench-700 text-instrument-amber active:scale-95"
            }`}
          >
            <span>{isHoldingStopcock ? "Dispensing Titrant..." : "Press & Hold Stopcock"}</span>
          </button>

          {/* Quick Drop & Flow Slider */}
          <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-bench-800">
            <button
              onClick={() => {
                labAudio.playStopcockClick();
                labAudio.playDrop();
                onDispenseAmount(0.05);
              }}
              className="py-1.5 px-2 bg-bench-850 hover:bg-bench-800 text-enamel-200 border border-bench-750 rounded-lg text-[10px] font-mono transition-colors active:scale-95"
              title="Dispense exact single drop (0.05 mL)"
            >
              +0.05 mL Drop
            </button>
            <button
              onClick={() => {
                labAudio.playStopcockClick();
                labAudio.playDrop();
                onDispenseAmount(1.0);
              }}
              className="py-1.5 px-2 bg-bench-850 hover:bg-bench-800 text-enamel-200 border border-bench-750 rounded-lg text-[10px] font-mono transition-colors active:scale-95"
              title="Dispense 1.0 mL aliquot"
            >
              +1.0 mL Rapid
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-enamel-400 pt-1">
            <span>Rate:</span>
            <div className="flex items-center gap-1">
              {[0.1, 0.2, 0.5].map((r) => (
                <button
                  key={r}
                  onClick={() => setFlowRate(r)}
                  className={`px-1.5 py-0.5 rounded text-[9px] ${
                    flowRate === r ? "bg-bench-800 border border-instrument-amber text-instrument-amber font-bold" : "text-enamel-500 hover:text-enamel-300"
                  }`}
                >
                  {r}mL
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

