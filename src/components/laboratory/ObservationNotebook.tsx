"use client";

import React, { useState } from "react";
import { Exp1Subpart } from "@/types/workbench";
import { SimulationContext } from "@/lib/simulation/types";
import {
  calculateTotalHardness,
  calculateChlorideContent,
  calculateTds,
  calculateSulfateNephelometry,
} from "@/lib/science/water-analysis";
import { Exp1Report } from "../experiments/exp1/Exp1Report";
import { CalculationWorkbench } from "../experiment/CalculationWorkbench";

interface ObservationNotebookProps {
  subpart: Exp1Subpart;
  simulationState: SimulationContext;
  isOpen: boolean;
  onToggle: () => void;
}

export const ObservationNotebook: React.FC<ObservationNotebookProps> = ({
  subpart,
  simulationState,
  isOpen,
  onToggle,
}) => {
  const [activeTab, setActiveTab] = useState<"tables" | "curves" | "calculations" | "report">("tables");

  const hardness = simulationState.hardness;
  const chloride = simulationState.chloride;
  const sulfate = simulationState.sulfate;
  const tds = simulationState.tds;
  const ph = simulationState.ph;

  // Compute live analytical results
  const totalHardnessCalc =
    hardness.v1Concordant && hardness.v2Concordant
      ? calculateTotalHardness({ v1Concordant: hardness.v1Concordant, v2Concordant: hardness.v2Concordant }).totalHardnessPpm
      : 420.0;

  const chlorideCalc = chloride.vEquivalence
    ? calculateChlorideContent({ vAgNo3Equivalence: chloride.vEquivalence }).chloridePpm
    : 212.7;

  const tdsCalc = tds.measuredTdsPpm ?? Number((tds.rawEcMicroSiemens * tds.keFactor).toFixed(1));
  const sulfateCalc = sulfate.calculatedPpm ?? 175.0;
  const samplePh = ph.measuredPh ?? Number(ph.trueSamplePh.toFixed(2));

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 border-t border-slate-800 transition-all duration-300 shadow-2xl flex flex-col ${
        isOpen ? "h-[360px] sm:h-[420px]" : "h-11"
      }`}
    >
      {/* Notebook Handle / Bar */}
      <div className="h-11 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between font-mono text-xs select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className="flex items-center gap-2 text-cyan-400 font-bold hover:text-cyan-300"
          >
            <span>📓</span>
            <span>LABORATORY NOTEBOOK & OBSERVATIONS</span>
            <span>{isOpen ? "▼" : "▲"}</span>
          </button>

          {/* Quick Metrics ticker when closed */}
          {!isOpen && (
            <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-400">
              <span>Hardness: <strong className="text-cyan-300">{hardness.v2Concordant ? `${totalHardnessCalc.toFixed(1)} ppm` : "Pending"}</strong></span>
              <span>Chloride: <strong className="text-cyan-300">{chloride.vEquivalence ? `${chlorideCalc.toFixed(1)} ppm` : "Pending"}</strong></span>
              <span>TDS: <strong className="text-cyan-300">{tdsCalc.toFixed(1)} ppm</strong></span>
              <span>pH: <strong className="text-cyan-300">{samplePh.toFixed(2)}</strong></span>
            </div>
          )}
        </div>

        {isOpen && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab("tables")}
              className={`px-3 py-1 rounded transition-all ${
                activeTab === "tables" ? "bg-cyan-950 text-cyan-300 font-bold border border-cyan-800" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Observation Tables
            </button>
            <button
              onClick={() => setActiveTab("curves")}
              className={`px-3 py-1 rounded transition-all ${
                activeTab === "curves" ? "bg-cyan-950 text-cyan-300 font-bold border border-cyan-800" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Plots & Curves
            </button>
            <button
              onClick={() => setActiveTab("calculations")}
              className={`px-3 py-1 rounded transition-all ${
                activeTab === "calculations" ? "bg-cyan-950 text-cyan-300 font-bold border border-cyan-800" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Calculation Grader
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`px-3 py-1 rounded transition-all ${
                activeTab === "report" ? "bg-emerald-950 text-emerald-300 font-bold border border-emerald-800" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              BIS Compliance Report
            </button>
            <button
              onClick={onToggle}
              className="ml-2 text-slate-500 hover:text-slate-300 text-xs px-2"
            >
              ✕ Minimize
            </button>
          </div>
        )}
      </div>

      {/* Notebook Body */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 text-slate-200 font-mono text-xs">
          {activeTab === "tables" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Hardness Titration Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <h4 className="font-bold text-cyan-400">TABLE 1 & 2: EDTA HARDNESS</h4>
                  <span className="text-[10px] text-slate-400">CaCO₃ eq.</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Titration I (Std V1):</span>
                    <strong className="text-cyan-300">{hardness.v1Concordant ? `${hardness.v1Concordant.toFixed(2)} mL` : "Pending"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Titration II (Sample V2):</span>
                    <strong className="text-cyan-300">{hardness.v2Concordant ? `${hardness.v2Concordant.toFixed(2)} mL` : "Pending"}</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
                    <span>Total Hardness:</span>
                    <span className="text-emerald-400">{hardness.v2Concordant ? `${totalHardnessCalc.toFixed(1)} ppm` : "—"}</span>
                  </div>
                </div>
              </div>

              {/* Chloride Conductometry Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <h4 className="font-bold text-cyan-400">TABLE 3: CHLORIDE CONTENT</h4>
                  <span className="text-[10px] text-slate-400">AgNO₃ vs Cl⁻</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Equivalence V_eq:</span>
                    <strong className="text-cyan-300">{chloride.vEquivalence ? `${chloride.vEquivalence.toFixed(2)} mL` : "Pending"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Points Logged:</span>
                    <span className="text-slate-300">{chloride.dataPoints.length}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
                    <span>Chloride (ppm):</span>
                    <span className="text-emerald-400">{chloride.vEquivalence ? `${chlorideCalc.toFixed(1)} ppm` : "—"}</span>
                  </div>
                </div>
              </div>

              {/* Sulfate Nephelometry & TDS Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <h4 className="font-bold text-cyan-400">TABLE 4 & 5: SULFATE & TDS</h4>
                  <span className="text-[10px] text-slate-400">NTU & EC</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Unknown Turbidity:</span>
                    <strong className="text-amber-300">{sulfate.unknownNtu !== null ? `${sulfate.unknownNtu.toFixed(1)} NTU` : "Pending"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Electrical Conductivity:</span>
                    <span className="text-cyan-300">{tds.rawEcMicroSiemens.toFixed(1)} µS/cm</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
                    <span>TDS (ke = {tds.keFactor}):</span>
                    <span className="text-emerald-400">{tdsCalc.toFixed(1)} mg/L</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "curves" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Conductometric Titration Curve */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                <h4 className="font-bold text-cyan-400 text-xs">AgNO₃ Conductometric Precipitation Curve</h4>
                <div className="w-full h-48 bg-slate-950 rounded-lg p-2 border border-slate-800">
                  <svg viewBox="0 0 300 180" className="w-full h-full">
                    <line x1="30" y1="150" x2="280" y2="150" stroke="#475569" strokeWidth="1" />
                    <line x1="30" y1="20" x2="30" y2="150" stroke="#475569" strokeWidth="1" />
                    <text x="155" y="170" fill="#94a3b8" fontSize="8" textAnchor="middle">Volume AgNO3 (mL)</text>
                    <text x="-85" y="15" fill="#94a3b8" fontSize="8" transform="rotate(-90)" textAnchor="middle">Conductance (mS/cm)</text>

                    {chloride.dataPoints.map((pt, i) => {
                      const cx = 30 + (pt.volume / 20) * 240;
                      const cy = 150 - ((pt.conductance - 1.8) / 1.0) * 120;
                      return <circle key={i} cx={cx} cy={cy} r="2.5" fill="#38bdf8" />;
                    })}
                    {chloride.dataPoints.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        points={chloride.dataPoints
                          .map((p) => `${30 + (p.volume / 20) * 240},${150 - ((p.conductance - 1.8) / 1.0) * 120}`)
                          .join(" ")}
                      />
                    )}
                  </svg>
                </div>
              </div>

              {/* Sulfate Nephelometry Calibration Curve */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                <h4 className="font-bold text-cyan-400 text-xs">Sulfate Nephelometry Calibration Curve</h4>
                <div className="w-full h-48 bg-slate-950 rounded-lg p-2 border border-slate-800">
                  <svg viewBox="0 0 300 180" className="w-full h-full">
                    <line x1="30" y1="150" x2="280" y2="150" stroke="#475569" strokeWidth="1" />
                    <line x1="30" y1="20" x2="30" y2="150" stroke="#475569" strokeWidth="1" />
                    <text x="155" y="170" fill="#94a3b8" fontSize="8" textAnchor="middle">Sulfate Conc. (ppm)</text>
                    <text x="-85" y="15" fill="#94a3b8" fontSize="8" transform="rotate(-90)" textAnchor="middle">Turbidity (NTU)</text>
                    {/* Standard points */}
                    {[0, 50, 100, 150, 200, 250].map((ppm) => {
                      const ntu = ppm * 0.52 + 1.5;
                      const cx = 30 + (ppm / 250) * 240;
                      const cy = 150 - (ntu / 150) * 120;
                      return <circle key={ppm} cx={cx} cy={cy} r="3" fill="#f59e0b" />;
                    })}
                    <line x1="30" y1={150 - (1.5 / 150) * 120} x2="270" y2={150 - (131.5 / 150) * 120} stroke="#38bdf8" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {activeTab === "calculations" && <CalculationWorkbench />}

          {activeTab === "report" && (
            <Exp1Report
              measurements={{
                hardnessPpm: totalHardnessCalc,
                chloridePpm: chlorideCalc,
                tdsPpm: tdsCalc,
                sulfatePpm: sulfateCalc,
                ph: samplePh,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
