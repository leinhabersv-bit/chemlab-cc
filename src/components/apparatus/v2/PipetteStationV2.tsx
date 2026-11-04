"use client";

import React, { useState } from "react";

interface PipetteStationV2Props {
  volumeAspirated: number; // 0 to 20 mL
  isFilled: boolean;
  isTransferring: boolean;
  sampleName: string;
  onAspirate: () => void;
  onTransfer: () => void;
  disabled?: boolean;
}

export const PipetteStationV2: React.FC<PipetteStationV2Props> = ({
  volumeAspirated,
  isFilled,
  isTransferring,
  sampleName,
  onAspirate,
  onTransfer,
  disabled = false,
}) => {
  const [bulbPressed, setBulbPressed] = useState(false);

  // Height percentage in pipette stem (0 to 100%)
  const fillPct = (volumeAspirated / 20) * 100;

  return (
    <div className="flex flex-col items-center bg-bench-900 border border-bench-750 p-4 rounded-2xl shadow-xl font-mono text-xs max-w-xs">
      <div className="flex items-center justify-between w-full pb-2 border-b border-bench-800 text-[11px]">
        <div className="flex items-center gap-1.5 text-enamel-200 font-bold">
          <span className="w-2 h-2 rounded-full bg-instrument-amber" />
          <span>CLASS-A BULB PIPETTE</span>
        </div>
        <span className="text-enamel-400">20.0 mL ± 0.03</span>
      </div>

      {/* Pipette Graphic SVG with Bulb Filler & Fluid Column */}
      <div className="relative py-4 flex justify-center items-center w-full h-56">
        <svg width="80" height="220" viewBox="0 0 80 220" className="overflow-visible">
          <defs>
            <linearGradient id="glassStem" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.25)" />
            </linearGradient>
            <linearGradient id="pipetteSampleLiquid" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.7)" />
              <stop offset="100%" stopColor="rgba(14, 165, 233, 0.9)" />
            </linearGradient>
          </defs>

          {/* Rubber Pipette Filler Bulb (Top) */}
          <g
            transform={bulbPressed ? "scale(0.95 0.9) translate(2, 4)" : ""}
            className="cursor-pointer transition-transform"
            onClick={!disabled && !isFilled ? onAspirate : undefined}
          >
            <ellipse cx="40" cy="22" rx="14" ry="16" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
            <rect x="36" y="36" width="8" height="8" rx="2" fill="#991b1b" />
            <text x="40" y="25" fill="#fecaca" fontSize="7" fontWeight="bold" textAnchor="middle">
              ASP
            </text>
          </g>

          {/* Upper Pipette Stem (Glass) */}
          <rect x="37" y="44" width="6" height="50" fill="url(#glassStem)" stroke="#94a3b8" strokeWidth="1" />

          {/* Calibrated Meniscus Ring Mark (20 mL ring) */}
          <line x1="35" y1="70" x2="45" y2="70" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="1 1" />
          <text x="48" y="72" fill="#f59e0b" fontSize="6" fontFamily="monospace">
            20mL
          </text>

          {/* Central Volumetric Bulb */}
          <ellipse cx="40" cy="115" rx="16" ry="24" fill="url(#glassStem)" stroke="#94a3b8" strokeWidth="1.2" />

          {/* Lower Delivery Stem & Tapered Tip */}
          <rect x="37" y="139" width="6" height="60" fill="url(#glassStem)" stroke="#94a3b8" strokeWidth="1" />
          <polygon points="37,199 43,199 41,215 39,215" fill="url(#glassStem)" stroke="#94a3b8" strokeWidth="1" />

          {/* Liquid Column inside Pipette */}
          {volumeAspirated > 0 && (
            <g className="transition-all duration-300">
              {/* Lower stem liquid */}
              <rect
                x="38"
                y={Math.max(139, 215 - (volumeAspirated / 20) * 145)}
                width="4"
                height={Math.min(76, (volumeAspirated / 20) * 145)}
                fill="url(#pipetteSampleLiquid)"
              />
              {/* Bulb liquid fill */}
              {volumeAspirated >= 5 && (
                <ellipse
                  cx="40"
                  cy="115"
                  rx={Math.min(15, (volumeAspirated / 20) * 15)}
                  ry={Math.min(23, ((volumeAspirated - 5) / 15) * 23)}
                  fill="url(#pipetteSampleLiquid)"
                />
              )}
              {/* Upper stem liquid up to 20mL line */}
              {volumeAspirated >= 18 && (
                <rect
                  x="38"
                  y={Math.max(70, 94 - ((volumeAspirated - 18) / 2) * 24)}
                  width="4"
                  height={Math.min(24, ((volumeAspirated - 18) / 2) * 24)}
                  fill="url(#pipetteSampleLiquid)"
                />
              )}
              {/* Meniscus surface */}
              <ellipse
                cx="40"
                cy={volumeAspirated >= 18 ? 70 : 115}
                rx={volumeAspirated >= 18 ? 2 : 12}
                ry="1"
                fill="#e0f2fe"
              />
            </g>
          )}

          {/* Droplet dripping during transfer */}
          {isTransferring && (
            <circle cx="40" cy="225" r="2.5" fill="#38bdf8" className="animate-drop-fall" />
          )}
        </svg>
      </div>

      {/* Pipette Manipulation Controls */}
      <div className="w-full flex flex-col gap-2 pt-2 border-t border-bench-800">
        <div className="flex items-center justify-between text-[10px] text-enamel-400">
          <span>STATUS:</span>
          <span className={isFilled ? "text-instrument-phosphor font-bold" : "text-enamel-400"}>
            {isFilled ? "FILLED (20.00 mL)" : "EMPTY"}
          </span>
        </div>

        {!isFilled ? (
          <button
            onClick={() => {
              setBulbPressed(true);
              setTimeout(() => setBulbPressed(false), 200);
              onAspirate();
            }}
            disabled={disabled}
            className={`w-full py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow ${
              disabled
                ? "bg-bench-850 text-enamel-500 cursor-not-allowed border border-bench-800"
                : "bg-instrument-amber hover:bg-amber-500 text-slate-950 active:scale-95 shadow-amber-950/40"
            }`}
          >
            <span>Aspirate 20.0 mL {sampleName}</span>
          </button>
        ) : (
          <button
            onClick={onTransfer}
            disabled={disabled || isTransferring}
            className="w-full py-2.5 px-3 rounded-xl font-bold bg-instrument-sky hover:bg-sky-400 text-slate-950 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sky-950/40"
          >
            <span>{isTransferring ? "Transferring into Flask..." : "Transfer Aliquot into Flask"}</span>
          </button>
        )}
      </div>
    </div>
  );
};
