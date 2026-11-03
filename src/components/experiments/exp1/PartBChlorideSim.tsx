"use client";

import React, { useState } from "react";
import { Burette } from "@/components/apparatus/Burette";
import { ConductivityMeter } from "@/components/apparatus/ConductivityMeter";
import { calculateChlorideContent } from "@/lib/science/water-analysis";
import { defaultPRNG } from "@/lib/prng";

interface DataPoint {
  volumeAdded: number; // mL
  conductance: number; // mS/cm or mhos
}

interface PartBChlorideSimProps {
  onResultsGenerated?: (results: {
    vEquivalence: number;
    normality: number;
    strengthGramsPerLiter: number;
    chloridePpm: number;
  }) => void;
}

export const PartBChlorideSim: React.FC<PartBChlorideSimProps> = ({ onResultsGenerated }) => {
  // Underlying true equivalence point for this sample (~12.0 mL of 0.01 N AgNO3 for 20 mL sample)
  const [trueVeq] = useState(() => defaultPRNG.addRelativeNoise(12.0, 0.015, 11.4, 12.6));
  
  const [buretteVolume, setBuretteVolume] = useState<number>(0);
  const [history, setHistory] = useState<DataPoint[]>([
    { volumeAdded: 0, conductance: 2.15 },
  ]);
  const [isStirring, setIsStirring] = useState<boolean>(true);
  const [isDispensing, setIsDispensing] = useState<boolean>(false);

  // Compute physical conductance based on precipitation dynamics:
  // Initial conductance = ~2.15 mS/cm
  // Pre-equivalence slope = -0.015 mS/(cm·mL)
  // Post-equivalence slope = +0.085 mS/(cm·mL)
  const calculateConductance = (vol: number): number => {
    let cond = 2.15;
    if (vol <= trueVeq) {
      cond = 2.15 - 0.015 * vol;
    } else {
      const atVeq = 2.15 - 0.015 * trueVeq;
      cond = atVeq + 0.085 * (vol - trueVeq);
    }
    // Add tiny instrument noise
    return Number((cond + defaultPRNG.nextGaussian(0, 0.005)).toFixed(3));
  };

  const currentConductance = calculateConductance(buretteVolume);

  const handleAddOneMl = () => {
    if (buretteVolume >= 20) return;
    setIsDispensing(true);
    const newVol = Number((buretteVolume + 1.0).toFixed(1));
    const newCond = calculateConductance(newVol);
    setBuretteVolume(newVol);
    setHistory((prev) => [...prev, { volumeAdded: newVol, conductance: newCond }]);
    setTimeout(() => setIsDispensing(false), 300);
  };

  const handleReset = () => {
    setBuretteVolume(0);
    setHistory([{ volumeAdded: 0, conductance: 2.15 }]);
  };

  // Perform two-line intersection to find experimental equivalence point:
  const prePoints = history.filter((p) => p.volumeAdded <= 10);
  const postPoints = history.filter((p) => p.volumeAdded >= 14);

  let experimentalVeq: number | null = null;
  if (prePoints.length >= 3 && postPoints.length >= 3) {
    // Linear regression on pre points: y = m1*x + c1
    const n1 = prePoints.length;
    let sX1 = 0, sY1 = 0, sXY1 = 0, sX21 = 0;
    prePoints.forEach((p) => {
      sX1 += p.volumeAdded; sY1 += p.conductance;
      sXY1 += p.volumeAdded * p.conductance; sX21 += p.volumeAdded * p.volumeAdded;
    });
    const m1 = (n1 * sXY1 - sX1 * sY1) / (n1 * sX21 - sX1 * sX1);
    const c1 = (sY1 - m1 * sX1) / n1;

    // Linear regression on post points: y = m2*x + c2
    const n2 = postPoints.length;
    let sX2 = 0, sY2 = 0, sXY2 = 0, sX22 = 0;
    postPoints.forEach((p) => {
      sX2 += p.volumeAdded; sY2 += p.conductance;
      sXY2 += p.volumeAdded * p.conductance; sX22 += p.volumeAdded * p.volumeAdded;
    });
    const m2 = (n2 * sXY2 - sX2 * sY2) / (n2 * sX22 - sX2 * sX2);
    const c2 = (sY2 - m2 * sX2) / n2;

    if (Math.abs(m1 - m2) > 0.01) {
      experimentalVeq = Number(((c2 - c1) / (m1 - m2)).toFixed(2));
    }
  }

  const calcResults = experimentalVeq
    ? calculateChlorideContent({ vAgNo3Equivalence: experimentalVeq })
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
            PART B: CONDUCTOMETRIC PRECIPITATION TITRATION
          </span>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            Chloride Precipitation: Cl⁻ + Ag⁺ → AgCl(s)↓
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Add 0.01 N AgNO3 in 1.0 mL increments with continuous magnetic stirring. Observe initial slow drop in conductance followed by sharp increase past the equivalence point.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddOneMl}
            disabled={buretteVolume >= 20}
            className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 ${
              buretteVolume < 20
                ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            ➕ Add 1.0 mL AgNO3 ({buretteVolume.toFixed(1)} / 20 mL)
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono transition-all"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Main Grid: Workbench + Live Graph + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Apparatus Setup */}
        <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              TITRATION WORKBENCH
            </span>
            <span className="text-xs font-mono text-slate-400">
              Beaker: 20 mL Chloride + 10 mL DI Water
            </span>
          </div>

          <div className="flex items-center justify-around gap-4">
            <Burette
              volumeDispensed={buretteVolume}
              maxVolume={25}
              titrantName="0.01 N AgNO3"
              isDispensing={isDispensing}
              readOnly
            />

            <ConductivityMeter
              readingValue={currentConductance}
              unit="mS/cm"
              cellConstant={1.0}
              isPowered={true}
              isProbeDipped={true}
            />
          </div>

          {/* Magnetic Stirrer status and Beaker graphic */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isStirring ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
              <span className="text-slate-300">Magnetic Stirrer: {isStirring ? "RUNNING (400 rpm)" : "OFF"}</span>
            </div>
            <button
              onClick={() => setIsStirring(!isStirring)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 underline"
            >
              Toggle
            </button>
          </div>
        </div>

        {/* Center: Live Titration Curve (Conductance vs Volume AgNO3) */}
        <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-200">
              TITRATION PLOT: CONDUCTANCE VS VOL AgNO3
            </span>
            {experimentalVeq && (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                V_eq = {experimentalVeq.toFixed(2)} mL
              </span>
            )}
          </div>

          {/* SVG Plot for Conductance vs Volume */}
          <div className="w-full h-64 bg-slate-900 rounded-xl p-2 border border-slate-800 relative">
            <svg viewBox="0 0 300 220" className="w-full h-full overflow-visible">
              {/* Axes */}
              <line x1="40" y1="190" x2="280" y2="190" stroke="#475569" strokeWidth="1.5" />
              <line x1="40" y1="20" x2="40" y2="190" stroke="#475569" strokeWidth="1.5" />

              {/* Axis Labels */}
              <text x="160" y="212" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">
                Volume of AgNO3 added (mL)
              </text>
              <text x="-105" y="16" fill="#94a3b8" fontSize="10" fontFamily="monospace" transform="rotate(-90)" textAnchor="middle">
                Conductance (mS/cm)
              </text>

              {/* Grid Lines & Ticks */}
              {[0, 5, 10, 15, 20].map((v) => {
                const x = 40 + (v / 20) * 230;
                return (
                  <g key={v}>
                    <line x1={x} y1="190" x2={x} y2="195" stroke="#64748b" />
                    <text x={x} y="206" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
                      {v}
                    </text>
                  </g>
                );
              })}

              {[1.8, 2.0, 2.2, 2.4, 2.6, 2.8].map((c) => {
                const y = 190 - ((c - 1.8) / 1.0) * 160;
                return (
                  <g key={c}>
                    <line x1="35" y1={y} x2="40" y2={y} stroke="#64748b" />
                    <text x="32" y={y + 3} fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="end">
                      {c.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Plotted Data Points */}
              {history.map((pt, i) => {
                const cx = 40 + (pt.volumeAdded / 20) * 230;
                const cy = 190 - ((pt.conductance - 1.8) / 1.0) * 160;
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="3.5"
                    fill="#38bdf8"
                    stroke="#0284c7"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Connecting Line */}
              {history.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  strokeDasharray="2,2"
                  points={history
                    .map((pt) => {
                      const x = 40 + (pt.volumeAdded / 20) * 230;
                      const y = 190 - ((pt.conductance - 1.8) / 1.0) * 160;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                />
              )}

              {/* Intersection vertical cursor if computed */}
              {experimentalVeq && (
                <g>
                  <line
                    x1={40 + (experimentalVeq / 20) * 230}
                    y1="20"
                    x2={40 + (experimentalVeq / 20) * 230}
                    y2="190"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="4,3"
                  />
                  <text
                    x={40 + (experimentalVeq / 20) * 230}
                    y="35"
                    fill="#10b981"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    V_eq ({experimentalVeq} mL)
                  </text>
                </g>
              )}
            </svg>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            {history.length < 15 ? (
              <span>Continue additions up to 18–20 mL to construct the complete V-shape curve.</span>
            ) : (
              <span className="text-emerald-400">✓ Equivalence intersection successfully detected.</span>
            )}
          </div>
        </div>

        {/* Right: Data Table & Calculations */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 max-h-56 overflow-y-auto">
            <h4 className="text-xs font-mono font-bold text-slate-200 mb-2">
              OBSERVATION DATA
            </h4>
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="py-1">Vol (mL)</th>
                  <th className="py-1">Cond (mS/cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {history.map((pt, idx) => (
                  <tr key={idx}>
                    <td className="py-0.5">{pt.volumeAdded.toFixed(1)}</td>
                    <td className="py-0.5 font-semibold text-cyan-300">{pt.conductance.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Scientific Calculation Card */}
          <div className="bg-lab-900/90 border border-cyan-800/60 rounded-xl p-4 text-xs font-mono text-slate-300 space-y-1.5">
            <div className="font-bold text-cyan-400 border-b border-lab-700 pb-1">
              CHLORIDE ESTIMATION
            </div>
            <div>
              V_eq (Intersection) ={" "}
              <span className="text-emerald-400 font-bold">
                {experimentalVeq ? `${experimentalVeq.toFixed(2)} mL` : "—"}
              </span>
            </div>
            <div>
              Normality N2 = (V1 × 0.01) / 20 ={" "}
              <span className="text-emerald-300">
                {calcResults ? calcResults.normalitySample.toFixed(5) : "—"}
              </span>{" "}
              N
            </div>
            <div>
              Strength = N2 × 35.453 ={" "}
              <span className="text-emerald-300">
                {calcResults ? calcResults.strengthGramsPerLiter.toFixed(4) : "—"}
              </span>{" "}
              g/L
            </div>
            <div className="pt-2 border-t border-lab-800 flex items-center justify-between">
              <span className="text-slate-400">CHLORIDE (PPM):</span>
              <span className="text-sm font-bold text-emerald-400">
                {calcResults ? `${calcResults.chloridePpm.toFixed(1)} ppm` : "Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

