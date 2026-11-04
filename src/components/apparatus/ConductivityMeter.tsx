"use client";

import React from "react";
import { labAudio } from "@/lib/audio/lab-audio";

interface ConductivityMeterProps {
  readingValue: number; // in µS/cm or mS/cm
  unit?: "µS/cm" | "mS/cm" | "mhos";
  cellConstant?: number; // e.g. 1.0 cm^-1
  isPowered?: boolean;
  isProbeDipped?: boolean;
  onTogglePower?: () => void;
  onCalibrate?: () => void;
  className?: string;
}

export const ConductivityMeter: React.FC<ConductivityMeterProps> = ({
  readingValue,
  unit = "µS/cm",
  cellConstant = 1.0,
  isPowered = true,
  isProbeDipped = true,
  onTogglePower,
  onCalibrate,
  className = "",
}) => {
  return (
    <div className={`flex flex-col bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-xl text-slate-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isPowered ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-slate-600"}`} />
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200">DIGITAL CONDUCTOMETER</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          Cell Const k = {cellConstant.toFixed(1)} cm⁻¹
        </span>
      </div>

      {/* Main Digital Display Screen */}
      <div className="relative bg-black rounded-lg p-3 border-2 border-slate-700 shadow-inner flex flex-col items-center justify-center min-h-[90px]">
        {isPowered ? (
          isProbeDipped ? (
            <div className="flex flex-col items-center">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-extrabold tracking-widest text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]">
                  {readingValue.toFixed(unit === "mS/cm" || unit === "mhos" ? 3 : 1)}
                </span>
                <span className="font-mono text-sm font-semibold text-emerald-300">{unit}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-slate-400">
                <span>TEMP: 25.0°C</span>
                <span className="text-emerald-500">ATC: ACTIVE</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-amber-400 font-mono text-xs">
              <span className="text-lg">⚠️ PROBE OPEN</span>
              <span className="text-[10px] text-slate-500">Immerse conductivity probe in analyte</span>
            </div>
          )
        ) : (
          <span className="font-mono text-xs text-slate-600 tracking-wider">SYSTEM OFF</span>
        )}
      </div>

      {/* Hardware Details & Controls */}
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <button
          onClick={() => {
            labAudio.playBeep(isPowered ? 600 : 1200);
            onTogglePower?.();
          }}
          className={`py-1.5 px-3 rounded font-mono font-medium transition-all ${
            isPowered
              ? "bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60"
              : "bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60"
          }`}
        >
          {isPowered ? "Power OFF" : "Power ON"}
        </button>

        {onCalibrate && (
          <button
            onClick={() => {
              labAudio.playBeep(1800);
              onCalibrate?.();
            }}
            className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded font-mono text-slate-300 transition-colors"
          >
            Calibrate (0.1M KCl)
          </button>
        )}
      </div>

      {/* Simulated Probe Graphic representation */}
      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Probe: {isProbeDipped ? "Immersed in solution" : "Air (Dry)"}</span>
        <span className="text-cyan-400">Pt Electrodes (Coated)</span>
      </div>
    </div>
  );
};

