"use client";

import React from "react";
import { labAudio } from "@/lib/audio/lab-audio";

interface BenchtopReagentRackProps {
  sampleAdded: boolean;
  bufferAdded: boolean;
  indicatorAdded: boolean;
  onAddSample: () => void;
  onAddBuffer: () => void;
  onAddIndicator: () => void;
  disabled?: boolean;
}

export const BenchtopReagentRack: React.FC<BenchtopReagentRackProps> = ({
  sampleAdded,
  bufferAdded,
  indicatorAdded,
  onAddSample,
  onAddBuffer,
  onAddIndicator,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-2 p-3 bg-bench-900 border border-bench-750 rounded-2xl shadow-xl font-mono text-xs max-w-sm">
      <div className="flex items-center justify-between pb-1.5 border-b border-bench-800 text-[10px]">
        <div className="flex items-center gap-1.5 text-enamel-200 font-bold">
          <span className="w-2 h-2 rounded-full bg-instrument-amber" />
          <span>BENCHTOP REAGENT RACK</span>
        </div>
        <span className="text-enamel-500">CLASS-A CHEMICALS</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* 1. Volumetric Standard Hard Water Flask */}
        <button
          onClick={() => {
            if (!sampleAdded && !disabled) {
              labAudio.playGlassClink();
              labAudio.playSuction();
              onAddSample();
            }
          }}
          disabled={sampleAdded || disabled}
          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
            sampleAdded
              ? "bg-bench-950/60 border-bench-800 text-enamel-500 cursor-not-allowed opacity-60"
              : "bg-bench-850 hover:bg-bench-800 border-bench-700 text-enamel-100 hover:border-instrument-amber active:scale-95 shadow-md"
          }`}
          title="250 mL Volumetric Flask: Standard Hard Water (1000 ppm CaCO3)"
        >
          {/* Flask SVG Graphic */}
          <svg width="36" height="48" viewBox="0 0 36 48" className="overflow-visible">
            {/* Ground glass stopper */}
            <rect x="14" y="2" width="8" height="6" rx="1" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />
            {/* Neck */}
            <rect x="15" y="8" width="6" height="16" fill="rgba(255,255,255,0.15)" stroke="#94a3b8" strokeWidth="1" />
            <line x1="14" y1="16" x2="22" y2="16" stroke="#f59e0b" strokeWidth="1" />
            {/* Bulb body */}
            <polygon points="15,24 21,24 32,44 4,44" fill="rgba(56, 189, 248, 0.4)" stroke="#94a3b8" strokeWidth="1" />
          </svg>
          <span className="font-bold text-[10px] leading-tight">Std Hard Water</span>
          <span className="text-[9px] text-instrument-sky">20 mL Aliquot</span>
          <span className="text-[8px] text-enamel-400">
            {sampleAdded ? "✓ Added" : "Click to Pipette"}
          </span>
        </button>

        {/* 2. Ammonia-Ammonium Chloride Buffer Bottle */}
        <button
          onClick={() => {
            if (!bufferAdded && sampleAdded && !disabled) {
              labAudio.playDrop();
              onAddBuffer();
            }
          }}
          disabled={!sampleAdded || bufferAdded || disabled}
          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
            bufferAdded
              ? "bg-bench-950/60 border-bench-800 text-enamel-500 cursor-not-allowed opacity-60"
              : sampleAdded
              ? "bg-bench-850 hover:bg-bench-800 border-bench-700 text-enamel-100 hover:border-instrument-amber active:scale-95 shadow-md"
              : "bg-bench-950/40 border-bench-850 text-enamel-600 cursor-not-allowed"
          }`}
          title="NH4OH / NH4Cl Buffer Solution (pH 10.0)"
        >
          {/* Reagent Bottle SVG Graphic */}
          <svg width="36" height="48" viewBox="0 0 36 48" className="overflow-visible">
            {/* Screw Cap */}
            <rect x="13" y="4" width="10" height="7" rx="1.5" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="0.8" />
            {/* Bottle body */}
            <rect x="8" y="12" width="20" height="32" rx="3" fill="rgba(255,255,255,0.18)" stroke="#94a3b8" strokeWidth="1" />
            <rect x="10" y="20" width="16" height="22" rx="2" fill="rgba(245, 158, 11, 0.4)" />
            {/* Label */}
            <rect x="11" y="24" width="14" height="12" fill="#ffffff" opacity="0.9" rx="1" />
            <text x="18" y="32" fill="#0f172a" fontSize="5" fontWeight="bold" textAnchor="middle">pH 10</text>
          </svg>
          <span className="font-bold text-[10px] leading-tight">Ammonia Buffer</span>
          <span className="text-[9px] text-instrument-amber">pH ≈ 10.0</span>
          <span className="text-[8px] text-enamel-400">
            {bufferAdded ? "✓ Added" : "Dispense 5 mL"}
          </span>
        </button>

        {/* 3. Eriochrome Black-T (EBT) Dropper Bottle */}
        <button
          onClick={() => {
            if (!indicatorAdded && bufferAdded && !disabled) {
              labAudio.playDrop();
              setTimeout(() => labAudio.playDrop(), 100);
              setTimeout(() => labAudio.playDrop(), 200);
              onAddIndicator();
            }
          }}
          disabled={!bufferAdded || indicatorAdded || disabled}
          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
            indicatorAdded
              ? "bg-bench-950/60 border-bench-800 text-enamel-500 cursor-not-allowed opacity-60"
              : bufferAdded
              ? "bg-bench-850 hover:bg-bench-800 border-bench-700 text-enamel-100 hover:border-rose-500 active:scale-95 shadow-md"
              : "bg-bench-950/40 border-bench-850 text-enamel-600 cursor-not-allowed"
          }`}
          title="Amber Glass Dropper Bottle: EBT Indicator (0.5% in ethanol)"
        >
          {/* Amber Dropper Bottle SVG */}
          <svg width="36" height="48" viewBox="0 0 36 48" className="overflow-visible">
            {/* Rubber Dropper Teat */}
            <ellipse cx="18" cy="4" rx="4" ry="4" fill="#1e293b" stroke="#0f172a" strokeWidth="0.8" />
            {/* Dropper Cap */}
            <rect x="14" y="8" width="8" height="5" fill="#475569" />
            {/* Amber Glass Body */}
            <rect x="9" y="14" width="18" height="30" rx="3" fill="#78350f" stroke="#b45309" strokeWidth="1" />
            {/* Wine Red Indicator Liquid Inside */}
            <rect x="11" y="24" width="14" height="18" rx="2" fill="#881337" opacity="0.9" />
            <text x="18" y="34" fill="#fecdd3" fontSize="5" fontWeight="bold" textAnchor="middle">EBT</text>
          </svg>
          <span className="font-bold text-[10px] leading-tight">EBT Indicator</span>
          <span className="text-[9px] text-rose-400">3 Drops</span>
          <span className="text-[8px] text-enamel-400">
            {indicatorAdded ? "✓ Added" : "Dispense Drops"}
          </span>
        </button>
      </div>
    </div>
  );
};

