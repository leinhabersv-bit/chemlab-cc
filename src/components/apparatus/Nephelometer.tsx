"use client";

import React from "react";
import { labAudio } from "@/lib/audio/lab-audio";

interface NephelometerProps {
  turbidityNtu: number;
  sampleLabel?: string;
  isCalibrated?: boolean;
  isLampOn?: boolean;
  hasCuvetteLoaded?: boolean;
  onZeroAdjust?: () => void;
  onToggleLamp?: () => void;
  className?: string;
}

export const Nephelometer: React.FC<NephelometerProps> = ({
  turbidityNtu,
  sampleLabel = "Standard 1 (50 ppm)",
  isCalibrated = true,
  isLampOn = true,
  hasCuvetteLoaded = true,
  onZeroAdjust,
  onToggleLamp,
  className = "",
}) => {
  return (
    <div className={`flex flex-col bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-xl text-slate-100 ${className}`}>
      {/* Instrument Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isLampOn ? "bg-amber-400 shadow-[0_0_8px_#f59e0b]" : "bg-slate-600"}`} />
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200">DIGITAL NEPHELOMETER</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          90° SCATTERING
        </span>
      </div>

      {/* Optical Well Graphic & Cuvette indicator */}
      <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 mb-3">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-10 border-2 border-slate-600 rounded bg-slate-800 flex items-center justify-center">
            {hasCuvetteLoaded ? (
              <div className="w-5 h-8 bg-sky-500/30 border border-sky-400/50 rounded-sm flex items-center justify-center">
                <span className="text-[9px] font-mono text-sky-200">CUV</span>
              </div>
            ) : (
              <span className="text-[8px] text-slate-500 font-mono">EMPTY</span>
            )}
          </div>
          <div className="flex flex-col text-xs font-mono">
            <span className="text-slate-400 text-[10px]">CURRENT SAMPLE:</span>
            <span className="text-cyan-300 font-semibold">{sampleLabel}</span>
          </div>
        </div>

        <div className="text-[10px] font-mono text-right">
          <span className={isCalibrated ? "text-emerald-400" : "text-amber-400"}>
            {isCalibrated ? "✓ ZERO CALIBRATED" : "⚠️ NEEDS BLANK CAL"}
          </span>
        </div>
      </div>

      {/* Main Digital Display */}
      <div className="relative bg-black rounded-lg p-3 border-2 border-slate-700 shadow-inner flex flex-col items-center justify-center min-h-[90px]">
        {isLampOn ? (
          hasCuvetteLoaded ? (
            <div className="flex flex-col items-center">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-extrabold tracking-widest text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]">
                  {turbidityNtu.toFixed(1)}
                </span>
                <span className="font-mono text-sm font-semibold text-amber-300">NTU</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-1">
                Tungsten Lamp 860 nm | Range 0–1000 NTU
              </span>
            </div>
          ) : (
            <span className="font-mono text-xs text-amber-400">INSERT CUVETTE</span>
          )
        ) : (
          <span className="font-mono text-xs text-slate-600">LAMP OFF</span>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        {onZeroAdjust && (
          <button
            onClick={() => {
              labAudio.playBeep(1400);
              onZeroAdjust();
            }}
            className="py-1.5 px-3 bg-amber-950/60 hover:bg-amber-900 border border-amber-800/80 text-amber-300 rounded font-mono transition-colors active:scale-95"
          >
            Zero Set (Blank)
          </button>
        )}
        {onToggleLamp && (
          <button
            onClick={() => {
              labAudio.playStopcockClick();
              onToggleLamp();
            }}
            className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded font-mono text-slate-300 transition-colors active:scale-95"
          >
            {isLampOn ? "Tungsten Lamp OFF" : "Tungsten Lamp ON"}
          </button>
        )}
      </div>
    </div>
  );
};

