"use client";

import React from "react";
import { Exp1Subpart } from "@/types/workbench";
import { SimulationContext } from "@/lib/simulation/types";

interface LiveCurveMonitorProps {
  subpart: Exp1Subpart;
  simulationState: SimulationContext;
  className?: string;
}

export const LiveCurveMonitor: React.FC<LiveCurveMonitorProps> = ({
  subpart,
  simulationState,
  className = "",
}) => {
  const hardness = simulationState.hardness;
  const chloride = simulationState.chloride;

  return (
    <div
      className={`bg-bench-900 border border-bench-750 rounded-2xl p-3.5 shadow-xl font-mono text-xs max-w-sm w-full flex flex-col gap-2 ${className}`}
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-bench-800 text-[10px]">
        <div className="flex items-center gap-1.5 text-enamel-200 font-bold">
          <span className="w-2 h-2 rounded-full bg-instrument-phosphor animate-pulse" />
          <span>LIVE METRIC TELEMETRY</span>
        </div>
        <span className="text-instrument-amber font-bold">
          {subpart === "hardness" && "pCa vs V_EDTA"}
          {subpart === "chloride" && "Conductance vs V_AgNO₃"}
          {subpart === "sulfate" && "Turbidity (NTU)"}
          {subpart === "tds" && "EC vs TDS (mg/L)"}
          {subpart === "ph" && "Nernst Potential (mV)"}
        </span>
      </div>

      {/* Hardness Live Titration Curve Plot */}
      {subpart === "hardness" && (
        <div className="flex flex-col gap-2">
          <div className="w-full h-32 bg-bench-950 rounded-xl border border-bench-800 p-2 relative flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 240 100" className="w-full h-full overflow-visible text-[7px]">
              {/* Grid Lines */}
              <line x1="25" y1="85" x2="230" y2="85" stroke="#334155" strokeWidth="0.8" />
              <line x1="25" y1="15" x2="25" y2="85" stroke="#334155" strokeWidth="0.8" />

              {/* Equivalence Vertical Marker (V_eq = 16.8 mL, SVG x = 25 + (16.8/30)*205 = 140) */}
              <line x1="140" y1="15" x2="140" y2="85" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              <text x="142" y="24" fill="#f59e0b" fontSize="6">V_eq (16.8 mL)</text>

              {/* Theoretical Sigmoidal Titration Curve (pCa) */}
              <path
                d="M 25 80 C 70 78, 120 74, 135 68 C 138 64, 142 32, 145 28 C 160 25, 200 24, 230 23"
                fill="none"
                stroke="#475569"
                strokeWidth="1.2"
              />

              {/* Live Real-time Trajectory */}
              {hardness.buretteReadingMl > 0 && (
                <path
                  d={`M 25 80 L ${Math.min(
                    230,
                    25 + (hardness.buretteReadingMl / 30) * 205
                  )} ${
                    hardness.buretteReadingMl < 16.0
                      ? 80 - (hardness.buretteReadingMl / 16.0) * 12
                      : hardness.buretteReadingMl < 17.5
                      ? 68 - ((hardness.buretteReadingMl - 16.0) / 1.5) * 40
                      : 25 - ((hardness.buretteReadingMl - 17.5) / 12.5) * 2
                  }`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
              )}

              {/* Live Tracking Indicator Dot */}
              <circle
                cx={Math.min(230, 25 + (hardness.buretteReadingMl / 30) * 205)}
                cy={
                  hardness.buretteReadingMl < 16.0
                    ? 80 - (hardness.buretteReadingMl / 16.0) * 12
                    : hardness.buretteReadingMl < 17.5
                    ? 68 - ((hardness.buretteReadingMl - 16.0) / 1.5) * 40
                    : 25 - ((hardness.buretteReadingMl - 17.5) / 12.5) * 2
                }
                r="3.5"
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="1"
              />

              {/* Axis labels */}
              <text x="25" y="94" fill="#64748b">0</text>
              <text x="140" y="94" fill="#64748b" textAnchor="middle">16.8</text>
              <text x="230" y="94" fill="#64748b" textAnchor="end">30 mL</text>
              <text x="18" y="20" fill="#64748b" textAnchor="end">pCa</text>
            </svg>
          </div>

          <div className="flex items-center justify-between text-[10px] text-enamel-400 px-1">
            <span>Current Titrant Dispensed:</span>
            <strong className="text-white text-xs">{hardness.buretteReadingMl.toFixed(2)} mL</strong>
          </div>
        </div>
      )}

      {/* Chloride Live Conductometric V-Curve */}
      {subpart === "chloride" && (
        <div className="flex flex-col gap-2">
          <div className="w-full h-32 bg-bench-950 rounded-xl border border-bench-800 p-2 relative flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 240 100" className="w-full h-full overflow-visible text-[7px]">
              {/* Axes */}
              <line x1="25" y1="85" x2="230" y2="85" stroke="#334155" strokeWidth="0.8" />
              <line x1="25" y1="15" x2="25" y2="85" stroke="#334155" strokeWidth="0.8" />

              {/* Classic V-shaped conductometric curve */}
              <path
                d="M 25 35 L 128 75 L 230 20"
                fill="none"
                stroke="#475569"
                strokeWidth="1.2"
                strokeDasharray="2 2"
              />

              {/* Equivalence Point V_eq (x = 128) */}
              <line x1="128" y1="15" x2="128" y2="85" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              <text x="130" y="24" fill="#f59e0b" fontSize="6">V_eq (12.0 mL)</text>

              {/* Live Dot */}
              <circle
                cx={Math.min(230, 25 + (chloride.buretteReadingMl / 25) * 205)}
                cy={
                  chloride.buretteReadingMl <= 12.0
                    ? 35 + (chloride.buretteReadingMl / 12.0) * 40
                    : 75 - ((chloride.buretteReadingMl - 12.0) / 13.0) * 55
                }
                r="3.5"
                fill="#22c55e"
                stroke="#ffffff"
                strokeWidth="1"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[10px] text-enamel-400 px-1">
            <span>Conductance:</span>
            <strong className="text-instrument-phosphor text-xs">{chloride.conductanceMhos.toFixed(2)} mS/cm</strong>
          </div>
        </div>
      )}

      {/* Sulfate Nephelometry Telemetry */}
      {subpart === "sulfate" && (
        <div className="flex flex-col gap-1.5 text-[11px] p-2 bg-bench-950 rounded-xl border border-bench-800">
          <div className="flex justify-between">
            <span className="text-enamel-400">Zero Air Calibration:</span>
            <span className={simulationState.sulfate.isZeroCalibrated ? "text-instrument-phosphor font-bold" : "text-instrument-amber"}>
              {simulationState.sulfate.isZeroCalibrated ? "0.0 NTU (LOCKED)" : "PENDING"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-enamel-400">Sample Optical Scatter (90°):</span>
            <span className="text-white font-bold">
              {simulationState.sulfate.unknownNtu ? `${simulationState.sulfate.unknownNtu.toFixed(1)} NTU` : "Ready"}
            </span>
          </div>
        </div>
      )}

      {/* TDS Telemetry */}
      {subpart === "tds" && (
        <div className="flex flex-col gap-1.5 text-[11px] p-2 bg-bench-950 rounded-xl border border-bench-800">
          <div className="flex justify-between">
            <span className="text-enamel-400">Electrical Conductivity:</span>
            <span className="text-instrument-sky font-bold">
              {simulationState.tds.isProbeDipped ? `${simulationState.tds.rawEcMicroSiemens.toFixed(1)} µS/cm` : "0.0 µS/cm"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-enamel-400">Calculated TDS:</span>
            <span className="text-instrument-amber font-bold">
              {simulationState.tds.isProbeDipped
                ? `${(simulationState.tds.rawEcMicroSiemens * simulationState.tds.keFactor).toFixed(1)} mg/L`
                : "0.0 mg/L"}
            </span>
          </div>
        </div>
      )}

      {/* pH Telemetry */}
      {subpart === "ph" && (
        <div className="flex flex-col gap-1.5 text-[11px] p-2 bg-bench-950 rounded-xl border border-bench-800">
          <div className="flex justify-between">
            <span className="text-enamel-400">Electrode Potential:</span>
            <span className="text-instrument-phosphor font-bold">
              {simulationState.ph.measuredPh
                ? `${((7.0 - simulationState.ph.measuredPh) * 59.16).toFixed(1)} mV`
                : "0.0 mV"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-enamel-400">Nernst Temperature:</span>
            <span className="text-white font-bold">298.15 K (25.0 °C ATC)</span>
          </div>
        </div>
      )}
    </div>
  );
};

