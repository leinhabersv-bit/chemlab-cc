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
      className={`fixed bottom-0 left-0 right-0 z-30 bg-bench-950/95 border-t border-bench-800 transition-all duration-300 shadow-2xl flex flex-col ${
        isOpen ? "h-[360px] sm:h-[420px]" : "h-11"
      }`}
    >
      {/* Notebook Handle / Bar */}
      <div className="h-11 px-4 bg-bench-900 border-b border-bench-800 flex items-center justify-between font-mono text-xs select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className="flex items-center gap-2 text-instrument-amber font-bold hover:text-amber-400"
          >
            <span>📓</span>
            <span>LABORATORY NOTEBOOK & OBSERVATIONS</span>
            <span>{isOpen ? "▼" : "▲"}</span>
          </button>

          {/* Quick Metrics ticker when closed */}
          {!isOpen && (
            <div className="hidden md:flex items-center gap-4 text-[11px] text-enamel-400">
              <span>Hardness: <strong className="text-white">{hardness.v2Concordant ? `${totalHardnessCalc.toFixed(1)} ppm` : "Pending"}</strong></span>
              <span>Chloride: <strong className="text-white">{chloride.vEquivalence ? `${chlorideCalc.toFixed(1)} ppm` : "Pending"}</strong></span>
              <span>TDS: <strong className="text-white">{tdsCalc.toFixed(1)} ppm</strong></span>
              <span>pH: <strong className="text-white">{samplePh.toFixed(2)}</strong></span>
            </div>
          )}
        </div>

        {isOpen && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab("tables")}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === "tables" ? "bg-bench-800 text-instrument-amber font-bold border border-bench-700" : "text-enamel-400 hover:text-white"
              }`}
            >
              Observation Tables
            </button>
            <button
              onClick={() => setActiveTab("curves")}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === "curves" ? "bg-bench-800 text-instrument-amber font-bold border border-bench-700" : "text-enamel-400 hover:text-white"
              }`}
            >
              Plots & Curves
            </button>
            <button
              onClick={() => setActiveTab("calculations")}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === "calculations" ? "bg-bench-800 text-instrument-amber font-bold border border-bench-700" : "text-enamel-400 hover:text-white"
              }`}
            >
              Calculation Grader
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === "report" ? "bg-emerald-950 text-instrument-phosphor font-bold border border-emerald-800" : "text-enamel-400 hover:text-white"
              }`}
            >
              BIS Compliance Report
            </button>
            <button
              onClick={onToggle}
              className="ml-2 text-enamel-500 hover:text-white text-xs px-2"
            >
              ✕ Minimize
            </button>
          </div>
        )}
      </div>

      {/* Notebook Content Workspace (Scientific Graph Paper Grid Texture) */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-bench-950 bg-notebook-grid font-mono text-xs text-enamel-200">
          {activeTab === "tables" && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Hardness Observation Table */}
              <div className="bg-bench-900 border border-bench-750 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-bench-800">
                  <span className="font-bold text-white text-sm">
                    TABLE 1.1: Concordant Titration Data (Standardization & Sample Hardness)
                  </span>
                  <span className="text-[10px] text-enamel-400">Tolerance: ±0.1 mL</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {/* Standardization Trials (V1) */}
                  <div className="bg-bench-950 p-3 rounded-xl border border-bench-800">
                    <div className="text-[11px] font-bold text-instrument-amber mb-2">
                      Titration I: Standardization of EDTA (V₁)
                    </div>
                    {hardness.trialsV1.length === 0 ? (
                      <div className="text-[11px] text-enamel-500 py-3 text-center">No trials recorded yet.</div>
                    ) : (
                      <table className="w-full text-center text-[11px]">
                        <thead>
                          <tr className="border-b border-bench-800 text-enamel-400">
                            <th className="py-1">Trial #</th>
                            <th className="py-1">Titre (mL)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hardness.trialsV1.map((vol: number, idx: number) => (
                            <tr key={idx} className="border-b border-bench-900">
                              <td className="py-1">#{idx + 1}</td>
                              <td className="py-1 font-bold text-white">{vol.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    <div className="mt-2 text-[10px] text-enamel-400 flex justify-between border-t border-bench-800 pt-1.5">
                      <span>Concordant V₁:</span>
                      <strong className="text-instrument-phosphor">{hardness.v1Concordant ? `${hardness.v1Concordant.toFixed(2)} mL` : "Pending"}</strong>
                    </div>
                  </div>

                  {/* Sample Hardness Trials (V2) */}
                  <div className="bg-bench-950 p-3 rounded-xl border border-bench-800">
                    <div className="text-[11px] font-bold text-instrument-amber mb-2">
                      Titration II: Water Sample Hardness (V₂)
                    </div>
                    {hardness.trialsV2.length === 0 ? (
                      <div className="text-[11px] text-enamel-500 py-3 text-center">No trials recorded yet.</div>
                    ) : (
                      <table className="w-full text-center text-[11px]">
                        <thead>
                          <tr className="border-b border-bench-800 text-enamel-400">
                            <th className="py-1">Trial #</th>
                            <th className="py-1">Titre (mL)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hardness.trialsV2.map((vol: number, idx: number) => (
                            <tr key={idx} className="border-b border-bench-900">
                              <td className="py-1">#{idx + 1}</td>
                              <td className="py-1 font-bold text-white">{vol.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    <div className="mt-2 text-[10px] text-enamel-400 flex justify-between border-t border-bench-800 pt-1.5">
                      <span>Concordant V₂:</span>
                      <strong className="text-instrument-phosphor">{hardness.v2Concordant ? `${hardness.v2Concordant.toFixed(2)} mL` : "Pending"}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chloride & Sulfate Observation Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-bench-900 border border-bench-750 p-4 rounded-xl">
                  <span className="font-bold text-white text-xs block mb-2">TABLE 1.2: Conductometric Chloride Data</span>
                  <div className="flex justify-between text-[11px] py-1 border-b border-bench-800">
                    <span className="text-enamel-400">AgNO₃ Equivalence Vol (V_eq):</span>
                    <strong className="text-instrument-sky">{chloride.vEquivalence ? `${chloride.vEquivalence.toFixed(2)} mL` : "Pending titration"}</strong>
                  </div>
                  <div className="flex justify-between text-[11px] py-1">
                    <span className="text-enamel-400">Calculated Chloride Content:</span>
                    <strong className="text-instrument-phosphor">{chloride.vEquivalence ? `${chlorideCalc.toFixed(1)} ppm` : "Pending"}</strong>
                  </div>
                </div>

                <div className="bg-bench-900 border border-bench-750 p-4 rounded-xl">
                  <span className="font-bold text-white text-xs block mb-2">TABLE 1.3: Sulfate Nephelometry Data</span>
                  <div className="flex justify-between text-[11px] py-1 border-b border-bench-800">
                    <span className="text-enamel-400">Zero Air Calibration:</span>
                    <strong className={sulfate.isZeroCalibrated ? "text-instrument-phosphor" : "text-instrument-amber"}>
                      {sulfate.isZeroCalibrated ? "VERIFIED (0.0 NTU)" : "PENDING ADJUST"}
                    </strong>
                  </div>
                  <div className="flex justify-between text-[11px] py-1">
                    <span className="text-enamel-400">Unknown Sample Turbidity:</span>
                    <strong className="text-instrument-sky">{sulfate.unknownNtu ? `${sulfate.unknownNtu.toFixed(1)} NTU` : "Pending"}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "curves" && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="bg-bench-900 border border-bench-750 p-4 rounded-2xl shadow-xl">
                <span className="font-bold text-white text-sm block mb-1">
                  GRAPH 1.1: Sulfate Nephelometer Calibration Curve (Turbidity NTU vs. Concentration mg/L)
                </span>
                <span className="text-[10px] text-enamel-400 block mb-3">
                  Linear Regression: y = 0.88x + 2.1 (R² = 0.998)
                </span>
                {/* SVG Curve Plot */}
                <div className="w-full h-44 bg-bench-950 rounded-xl border border-bench-800 p-2 flex items-center justify-center">
                  <svg viewBox="0 0 400 140" className="w-full h-full overflow-visible font-mono text-[8px]">
                    {/* Axes */}
                    <line x1="40" y1="120" x2="380" y2="120" stroke="#475569" strokeWidth="1" />
                    <line x1="40" y1="20" x2="40" y2="120" stroke="#475569" strokeWidth="1" />
                    {/* Linear Regression Line */}
                    <line x1="40" y1="118" x2="360" y2="28" stroke="#f59e0b" strokeWidth="2" />
                    {/* Standard Data Points */}
                    {[0, 50, 100, 150, 200, 250].map((ppm, i) => {
                      const cx = 40 + (ppm / 250) * 320;
                      const cy = 118 - (ppm / 250) * 90;
                      return (
                        <g key={i}>
                          <circle cx={cx} cy={cy} r="3.5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
                          <text x={cx} y="132" fill="#94a3b8" textAnchor="middle">{ppm}</text>
                        </g>
                      );
                    })}
                    {/* Unknown Sample Point */}
                    <circle cx="264" cy="55" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" className="animate-ping" />
                    <text x="274" y="52" fill="#ef4444" fontWeight="bold">Sample (175 NTU)</text>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {activeTab === "calculations" && (
            <div className="max-w-3xl mx-auto">
              <CalculationWorkbench />
            </div>
          )}

          {activeTab === "report" && (
            <div className="max-w-4xl mx-auto">
              <Exp1Report
                results={{
                  totalHardnessPpm: totalHardnessCalc,
                  chloridePpm: chlorideCalc,
                  sulfatePpm: sulfateCalc,
                  tdsPpm: tdsCalc,
                  ph: samplePh,
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
