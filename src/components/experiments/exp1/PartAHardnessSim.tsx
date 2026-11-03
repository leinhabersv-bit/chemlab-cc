"use client";

import React, { useState } from "react";
import { Burette } from "@/components/apparatus/Burette";
import { ConicalFlask } from "@/components/apparatus/ConicalFlask";
import { calculateTotalHardness } from "@/lib/science/water-analysis";
import { defaultPRNG } from "@/lib/prng";

interface PartAHardnessSimProps {
  onResultsGenerated?: (results: { v1: number; v2: number; totalHardnessPpm: number }) => void;
}

export const PartAHardnessSim: React.FC<PartAHardnessSimProps> = ({ onResultsGenerated }) => {
  // Mode: "standardization" (Titration I) or "sample" (Titration II)
  const [stage, setStage] = useState<"standardization" | "sample">("standardization");
  
  // Trial tracking
  const [trialNumber, setTrialNumber] = useState<number>(1);
  const [buretteVolume, setBuretteVolume] = useState<number>(0);
  const [isStirring, setIsStirring] = useState<boolean>(true);
  const [isDispensing, setIsDispensing] = useState<boolean>(false);

  // Targets for this simulation run (with realistic physical jitter)
  // Standard hard water consumes ~20.0 mL of ~0.01M EDTA (V1)
  const [trueV1] = useState(() => defaultPRNG.addRelativeNoise(20.0, 0.01, 19.4, 20.6));
  // Unknown water sample consumes ~8.4 mL (V2) -> Hardness ~ 420 ppm
  const [trueV2] = useState(() => defaultPRNG.addRelativeNoise(8.4, 0.015, 8.0, 8.8));

  // Recorded values
  const [v1Trials, setV1Trials] = useState<number[]>([]);
  const [v2Trials, setV2Trials] = useState<number[]>([]);
  const [concordantV1, setConcordantV1] = useState<number | null>(null);
  const [concordantV2, setConcordantV2] = useState<number | null>(null);

  const currentEndpoint = stage === "standardization" ? trueV1 : trueV2;

  // Calculate liquid color transition from wine red to steel blue:
  // Before endpoint: Wine Red (rgb 114, 47, 55)
  // Near endpoint (within 0.3 mL): Transition Violet (rgb 110, 60, 120)
  // Past endpoint: Steel Blue (rgb 70, 130, 180)
  const getFlaskColor = (vol: number, endpoint: number): string => {
    const diff = vol - endpoint;
    if (diff < -0.3) {
      return "rgba(114, 47, 55, 0.9)"; // Wine red
    } else if (diff <= 0.05) {
      // Transitioning
      const progress = (diff + 0.3) / 0.35;
      const r = Math.round(114 + (70 - 114) * progress);
      const g = Math.round(47 + (130 - 47) * progress);
      const b = Math.round(55 + (180 - 55) * progress);
      return `rgba(${r}, ${g}, ${b}, 0.92)`;
    } else {
      return "rgba(70, 130, 180, 0.92)"; // Steel blue
    }
  };

  const isEndpointReached = buretteVolume >= currentEndpoint;
  const flaskColor = getFlaskColor(buretteVolume, currentEndpoint);

  const handleDispense = (amount: number) => {
    setIsDispensing(true);
    setBuretteVolume((prev) => Math.min(prev + amount, 50));
    setTimeout(() => setIsDispensing(false), 400);
  };

  const handleRecordTrial = () => {
    const recordedVol = Number(buretteVolume.toFixed(2));
    if (stage === "standardization") {
      const updated = [...v1Trials, recordedVol];
      setV1Trials(updated);
      if (updated.length >= 2) {
        // Average or concordant
        const conc = updated[updated.length - 1];
        setConcordantV1(conc);
      }
    } else {
      const updated = [...v2Trials, recordedVol];
      setV2Trials(updated);
      if (updated.length >= 2) {
        const conc = updated[updated.length - 1];
        setConcordantV2(conc);
        if (concordantV1) {
          const calc = calculateTotalHardness({ v1Concordant: concordantV1, v2Concordant: conc });
          onResultsGenerated?.({
            v1: concordantV1,
            v2: conc,
            totalHardnessPpm: calc.totalHardnessPpm,
          });
        }
      }
    }

    // Reset burette for next trial or stage
    setBuretteVolume(0);
    setTrialNumber((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stage Navigation & Instructions Banner */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
              {stage === "standardization" ? "TITRATION I: STANDARDIZATION" : "TITRATION II: SAMPLE ESTIMATION"}
            </span>
            <span className="text-xs text-slate-400">Trial #{trialNumber}</span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            {stage === "standardization"
              ? "Standard Hard Water (20 mL) vs EDTA"
              : "Sample Hard Water (20 mL) vs Standardized EDTA"}
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            {stage === "standardization"
              ? "Dispense EDTA from burette until the wine-red solution turns to sharp steel blue (concordant V1)."
              : "Titrate 20 mL of the unknown hard water sample to determine volume V2 consumed."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {stage === "standardization" && concordantV1 && (
            <button
              onClick={() => {
                setStage("sample");
                setBuretteVolume(0);
                setTrialNumber(1);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
            >
              Proceed to Titration II (Sample) →
            </button>
          )}

          {stage === "sample" && (
            <button
              onClick={() => {
                setStage("standardization");
                setBuretteVolume(0);
                setTrialNumber(1);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono transition-all"
            >
              ← Back to Standardization
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Apparatus Workbench */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Side: Apparatus Setup (Burette + Flask) */}
        <div className="md:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-around gap-6 relative shadow-inner">
          <div className="absolute top-3 left-4 text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
            SIMULATED TITRATION APPARATUS
          </div>

          {/* Burette Component */}
          <Burette
            volumeDispensed={buretteVolume}
            titrantName="0.01 N EDTA Solution"
            isDispensing={isDispensing}
            onDispenseDrop={() => handleDispense(0.05)}
            onDispenseFast={() => handleDispense(1.0)}
            onRefill={() => setBuretteVolume(0)}
          />

          {/* Conical Flask Component */}
          <div className="flex flex-col items-center">
            <ConicalFlask
              fillPercentage={35 + (buretteVolume / 50) * 30}
              volumeDisplayMl={20 + (stage === "standardization" ? 4 : 5) + buretteVolume}
              liquidName={
                stage === "standardization"
                  ? "20 mL Std Hard Water + Buffer + EBT"
                  : "20 mL Sample Water + Buffer + EBT"
              }
              liquidColor={flaskColor}
              isStirring={isStirring}
              onToggleStirrer={() => setIsStirring(!isStirring)}
            />

            {/* Live Indicator Status pill */}
            <div className="mt-3 flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full border border-slate-600 shadow-sm transition-colors duration-300"
                style={{ backgroundColor: flaskColor }}
              />
              <span className="text-xs font-mono text-slate-300">
                {isEndpointReached ? (
                  <strong className="text-cyan-400">Endpoint Reached (Steel Blue)</strong>
                ) : buretteVolume >= currentEndpoint - 0.5 ? (
                  <strong className="text-purple-300">Near Endpoint (Violet)</strong>
                ) : (
                  <span className="text-rose-400">Pre-Endpoint (Wine Red)</span>
                )}
              </span>
            </div>

            {/* Trial Record Button */}
            <button
              onClick={handleRecordTrial}
              disabled={buretteVolume === 0}
              className={`mt-4 px-4 py-2 rounded-lg font-mono text-xs font-semibold shadow-md transition-all ${
                buretteVolume > 0
                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              📝 Record Reading: {buretteVolume.toFixed(2)} mL
            </button>
          </div>
        </div>

        {/* Right Side: Observation Tables & Live Physical Calculations */}
        <div className="md:col-span-5 flex flex-col gap-4">
          {/* Titration I Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-mono font-bold text-slate-200">
                TABLE 1: STANDARDIZATION OF EDTA
              </h4>
              {concordantV1 && (
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  V1 = {concordantV1.toFixed(2)} mL
                </span>
              )}
            </div>
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="py-1">Trial</th>
                  <th className="py-1">Vol Sample (mL)</th>
                  <th className="py-1">Vol EDTA (mL)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {v1Trials.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-2 text-center text-slate-500">
                      No trials recorded yet.
                    </td>
                  </tr>
                ) : (
                  v1Trials.map((vol, i) => (
                    <tr key={i}>
                      <td className="py-1">#{i + 1}</td>
                      <td className="py-1">20.0</td>
                      <td className="py-1 font-semibold text-cyan-300">{vol.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Titration II Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-mono font-bold text-slate-200">
                TABLE 2: ESTIMATION OF TOTAL HARDNESS
              </h4>
              {concordantV2 && (
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  V2 = {concordantV2.toFixed(2)} mL
                </span>
              )}
            </div>
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="py-1">Trial</th>
                  <th className="py-1">Vol Sample (mL)</th>
                  <th className="py-1">Vol EDTA (mL)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {v2Trials.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-2 text-center text-slate-500">
                      Complete Titration I first, then record sample trials.
                    </td>
                  </tr>
                ) : (
                  v2Trials.map((vol, i) => (
                    <tr key={i}>
                      <td className="py-1">#{i + 1}</td>
                      <td className="py-1">20.0</td>
                      <td className="py-1 font-semibold text-cyan-300">{vol.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Live Scientific Calculation Summary Box */}
          <div className="bg-lab-900/90 border border-cyan-800/60 rounded-xl p-4 text-xs font-mono text-slate-300">
            <div className="font-bold text-cyan-400 mb-2 border-b border-lab-700 pb-1">
              SCIENTIFIC CALCULATIONS
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div>
                1 mL EDTA = 20 / V1 mg CaCO3 ={" "}
                <span className="text-emerald-300 font-bold">
                  {concordantV1 ? (20 / concordantV1).toFixed(4) : "—"}
                </span>{" "}
                mg
              </div>
              <div>
                Total Hardness = (V2 / V1) × 1000 ppm
              </div>
              <div className="pt-2 border-t border-lab-800 flex items-center justify-between">
                <span className="text-slate-400">TOTAL HARDNESS:</span>
                <span className="text-sm font-bold text-emerald-400">
                  {concordantV1 && concordantV2
                    ? `${((concordantV2 / concordantV1) * 1000).toFixed(1)} ppm`
                    : "Pending measurements"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
