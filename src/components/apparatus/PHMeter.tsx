"use client";

import React from "react";
import { labAudio } from "@/lib/audio/lab-audio";

interface PHMeterProps {
  phValue: number;
  temperatureC?: number;
  isCalibrated?: boolean;
  calibrationPoints?: number[]; // e.g. [4.01, 7.00, 9.20]
  onCalibratePoint?: (point: number) => void;
  className?: string;
}

export const PHMeter: React.FC<PHMeterProps> = ({
  phValue,
  temperatureC = 25.0,
  isCalibrated = true,
  calibrationPoints = [],
  onCalibratePoint,
  className = "",
}) => {
  return (
    <div className={`flex flex-col bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-xl text-slate-100 ${className}`}>
      {/* Instrument Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200">DIGITAL BENCHTOP pH METER</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          ATC: {temperatureC.toFixed(1)}°C
        </span>
      </div>

      {/* Main Digital Display */}
      <div className="relative bg-black rounded-lg p-3 border-2 border-slate-700 shadow-inner flex flex-col items-center justify-center min-h-[90px]">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-extrabold tracking-widest text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">
            {phValue.toFixed(2)}
          </span>
          <span className="font-mono text-sm font-semibold text-cyan-300">pH</span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-slate-400">
          <span>SLOPE: 99.2%</span>
          <span className={isCalibrated ? "text-emerald-400" : "text-amber-400"}>
            {isCalibrated ? "✓ CALIBRATED" : "⚠️ UNCALIBRATED"}
          </span>
        </div>
      </div>

      {/* Buffer Calibration Controls */}
      {onCalibratePoint && (
        <div className="mt-3 pt-2 border-t border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 mb-1.5 flex justify-between">
            <span>BUFFER STANDARDS (25°C):</span>
            <span className="text-cyan-400">3-POINT CAL</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[4.01, 7.0, 9.2].map((point) => {
              const isDone = calibrationPoints.includes(point);
              return (
                <button
                  key={point}
                  onClick={() => {
                    labAudio.playBeep(Math.round(800 + point * 120));
                    onCalibratePoint(point);
                  }}
                  className={`py-1 px-1.5 rounded font-mono text-xs font-medium transition-all active:scale-95 ${
                    isDone
                      ? "bg-emerald-950/80 border border-emerald-600 text-emerald-300"
                      : "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
                  }`}
                >
                  {isDone ? `✓ pH ${point}` : `Cal ${point}`}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

