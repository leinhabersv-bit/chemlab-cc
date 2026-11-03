"use client";

import React, { useState } from "react";
import { ConductivityMeter } from "@/components/apparatus/ConductivityMeter";
import { calculateTds } from "@/lib/science/water-analysis";
import { defaultPRNG } from "@/lib/prng";

interface PartDTdsSimProps {
  onResultsGenerated?: (results: { electricalConductivity: number; tdsPpm: number }) => void;
}

export const PartDTdsSim: React.FC<PartDTdsSimProps> = ({ onResultsGenerated }) => {
  // Underlying physical EC of the given water sample (~680 µS/cm -> TDS ~ 476 mg/L)
  const [trueEc] = useState(() => defaultPRNG.addRelativeNoise(680, 0.02, 640, 720));
  const [keFactor, setKeFactor] = useState<number>(0.70);
  const [isDipped, setIsDipped] = useState<boolean>(true);
  const [isPowered, setIsPowered] = useState<boolean>(true);

  const recordedEc = Number(trueEc.toFixed(1));
  const calc = calculateTds({ electricalConductivityMicroSiemens: recordedEc, keConstant: keFactor });

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
            PART D: TOTAL DISSOLVED SOLIDS (TDS) ESTIMATION
          </span>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            Empirical Relation: TDS (mg/L) = kₑ × EC (µS/cm)
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Immerse the conductivity cell into the water sample at 25°C. Multiply the recorded electrical conductivity (µS/cm) by kₑ = 0.70.
          </p>
        </div>

        <button
          onClick={() => onResultsGenerated?.({ electricalConductivity: recordedEc, tdsPpm: calc.tdsMgPerLiter })}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all font-mono"
        >
          ✓ Record TDS Value ({calc.tdsMgPerLiter.toFixed(1)} mg/L)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Meter */}
        <div className="md:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              EC PROBE BENCH
            </span>
            <button
              onClick={() => setIsDipped(!isDipped)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline"
            >
              {isDipped ? "Withdraw Probe" : "Dip Probe into Sample"}
            </button>
          </div>

          <ConductivityMeter
            readingValue={isDipped ? recordedEc : 0}
            unit="µS/cm"
            cellConstant={1.0}
            isPowered={isPowered}
            isProbeDipped={isDipped}
            onTogglePower={() => setIsPowered(!isPowered)}
          />

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 space-y-2">
            <div className="font-semibold text-slate-200">Adjust kₑ Constant Factor (0.55 – 0.85):</div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.55"
                max="0.85"
                step="0.01"
                value={keFactor}
                onChange={(e) => setKeFactor(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <span className="font-bold text-cyan-400 min-w-[40px] text-right">{keFactor.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-slate-400">
              *Standard Indian natural waters convention defaults to kₑ = 0.70 (midpoint of 0.55 and 0.85).
            </p>
          </div>
        </div>

        {/* Right: Calculations & Standards Explanation */}
        <div className="md:col-span-6 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-xs font-mono text-slate-300 space-y-3">
            <h4 className="text-sm font-bold text-slate-100 font-sans border-b border-slate-800 pb-2">
              TDS Estimation Calculation
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span>Recorded Electrical Conductivity (EC):</span>
                <strong className="text-cyan-400">{recordedEc.toFixed(1)} µS/cm</strong>
              </div>
              <div className="flex justify-between">
                <span>Proportionality Constant (kₑ):</span>
                <strong className="text-slate-200">{keFactor.toFixed(2)}</strong>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
                <span className="text-slate-400 font-bold">Total Dissolved Solids:</span>
                <strong className="text-emerald-400 font-mono text-base">
                  {calc.tdsMgPerLiter.toFixed(1)} mg/L (ppm)
                </strong>
              </div>
            </div>
          </div>

          <div className="bg-lab-900/90 border border-slate-800 rounded-xl p-5 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-slate-200">Scientific Note on TDS vs Conductivity:</h4>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Total Dissolved Solids (TDS) comprises inorganic salts (principally calcium, magnesium, potassium, sodium, bicarbonates, chlorides, and sulfates) and small amounts of organic matter dissolved in water. Since dissolved mineral salts dissociate into ions that conduct electrical current, specific electrical conductivity provides a rapid, non-destructive proxy for gravimetric evaporation methods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

