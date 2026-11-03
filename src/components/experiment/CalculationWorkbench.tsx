"use client";

import React, { useState } from "react";
import {
  calculateTotalHardness,
  calculateChlorideContent,
  calculateTds,
} from "@/lib/science/water-analysis";

export const CalculationWorkbench: React.FC = () => {
  // Hardness Inputs
  const [v1Input, setV1Input] = useState<string>("20.0");
  const [v2Input, setV2Input] = useState<string>("8.4");
  const [studentHardnessPpm, setStudentHardnessPpm] = useState<string>("");

  // Chloride Inputs
  const [vAgNo3Input, setVAgNo3Input] = useState<string>("12.0");
  const [studentChloridePpm, setStudentChloridePpm] = useState<string>("");

  // TDS Inputs
  const [ecInput, setEcInput] = useState<string>("680");
  const [studentTds, setStudentTds] = useState<string>("");

  const [evaluation, setEvaluation] = useState<{
    hardnessError?: number;
    hardnessMarks?: number;
    chlorideError?: number;
    chlorideMarks?: number;
    tdsError?: number;
    tdsMarks?: number;
  }>({});

  const handleEvaluate = () => {
    const v1 = parseFloat(v1Input) || 20.0;
    const v2 = parseFloat(v2Input) || 8.4;
    const vAg = parseFloat(vAgNo3Input) || 12.0;
    const ec = parseFloat(ecInput) || 680;

    const trueHardness = calculateTotalHardness({ v1Concordant: v1, v2Concordant: v2 }).totalHardnessPpm;
    const trueChloride = calculateChlorideContent({ vAgNo3Equivalence: vAg }).chloridePpm;
    const trueTds = calculateTds({ electricalConductivityMicroSiemens: ec }).tdsMgPerLiter;

    const sHardness = parseFloat(studentHardnessPpm) || 0;
    const sChloride = parseFloat(studentChloridePpm) || 0;
    const sTds = parseFloat(studentTds) || 0;

    const hErr = Math.abs((sHardness - trueHardness) / trueHardness) * 100;
    const cErr = Math.abs((sChloride - trueChloride) / trueChloride) * 100;
    const tErr = Math.abs((sTds - trueTds) / trueTds) * 100;

    // Titration rubric (p. 2): <=2%: 10M, <=3%: 9M, <=4%: 8M, >4%: 5M
    const getTitrationMarks = (err: number) => (err <= 2 ? 10 : err <= 3 ? 9 : err <= 4 ? 8 : 5);
    // Instrument rubric (p. 2): <=3%: 10M, <=4%: 9M, <=5%: 8M, >5%: 5M
    const getInstrumentMarks = (err: number) => (err <= 3 ? 10 : err <= 4 ? 9 : err <= 5 ? 8 : 5);

    setEvaluation({
      hardnessError: Number(hErr.toFixed(2)),
      hardnessMarks: getTitrationMarks(hErr),
      chlorideError: Number(cErr.toFixed(2)),
      chlorideMarks: getInstrumentMarks(cErr),
      tdsError: Number(tErr.toFixed(2)),
      tdsMarks: getInstrumentMarks(tErr),
    });
  };

  return (
    <div className="flex flex-col gap-6 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
            INTERACTIVE CALCULATION WORKBENCH
          </span>
          <span className="text-xs font-mono text-slate-400">Tolerance & Error Grader</span>
        </div>
        <h3 className="text-base font-bold text-slate-100">
          Independent Calculation Validator
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          Enter your observed titre volumes and instrument readings below. CHEMLAB CC checks your mathematical accuracy and awards marks per the official VIT rubric.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module 1: Hardness */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="border-b border-slate-800 pb-2">
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase">1. EDTA Hardness</h4>
            <span className="text-[10px] text-slate-400">Formula: (V2 / V1) × 1000 ppm</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">V1 Std Hard Water (mL):</label>
              <input
                type="number"
                value={v1Input}
                onChange={(e) => setV1Input(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-cyan-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">V2 Sample Water (mL):</label>
              <input
                type="number"
                value={v2Input}
                onChange={(e) => setV2Input(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-cyan-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Your Total Hardness (ppm):</label>
              <input
                type="number"
                value={studentHardnessPpm}
                placeholder="e.g. 420.0"
                onChange={(e) => setStudentHardnessPpm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-emerald-300 font-bold"
              />
            </div>

            {evaluation.hardnessMarks !== undefined && (
              <div className="mt-2 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
                <div className="flex justify-between">
                  <span>Relative Error:</span>
                  <strong className={evaluation.hardnessError! <= 2 ? "text-emerald-400" : "text-amber-400"}>
                    {evaluation.hardnessError}%
                  </strong>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Awarded Marks:</span>
                  <strong className="text-cyan-400">{evaluation.hardnessMarks} / 10</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Module 2: Chloride */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="border-b border-slate-800 pb-2">
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase">2. Chloride Content</h4>
            <span className="text-[10px] text-slate-400">N2 = (V1·0.01)/20; ppm = N2·35453</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">V_eq from Graph (mL):</label>
              <input
                type="number"
                value={vAgNo3Input}
                onChange={(e) => setVAgNo3Input(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-cyan-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Your Chloride (ppm):</label>
              <input
                type="number"
                value={studentChloridePpm}
                placeholder="e.g. 212.7"
                onChange={(e) => setStudentChloridePpm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-emerald-300 font-bold"
              />
            </div>

            {evaluation.chlorideMarks !== undefined && (
              <div className="mt-2 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
                <div className="flex justify-between">
                  <span>Relative Error:</span>
                  <strong className={evaluation.chlorideError! <= 3 ? "text-emerald-400" : "text-amber-400"}>
                    {evaluation.chlorideError}%
                  </strong>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Awarded Marks:</span>
                  <strong className="text-cyan-400">{evaluation.chlorideMarks} / 10</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Module 3: TDS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="border-b border-slate-800 pb-2">
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase">3. TDS Estimation</h4>
            <span className="text-[10px] text-slate-400">Formula: TDS = 0.70 × EC</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Electrical Cond. (µS/cm):</label>
              <input
                type="number"
                value={ecInput}
                onChange={(e) => setEcInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-cyan-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Your TDS (mg/L):</label>
              <input
                type="number"
                value={studentTds}
                placeholder="e.g. 476.0"
                onChange={(e) => setStudentTds(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-emerald-300 font-bold"
              />
            </div>

            {evaluation.tdsMarks !== undefined && (
              <div className="mt-2 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
                <div className="flex justify-between">
                  <span>Relative Error:</span>
                  <strong className={evaluation.tdsError! <= 3 ? "text-emerald-400" : "text-amber-400"}>
                    {evaluation.tdsError}%
                  </strong>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Awarded Marks:</span>
                  <strong className="text-cyan-400">{evaluation.tdsMarks} / 10</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={handleEvaluate}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold shadow-lg transition-all"
        >
          🔍 Evaluate Calculation Accuracy & Grade Results
        </button>
      </div>
    </div>
  );
};

