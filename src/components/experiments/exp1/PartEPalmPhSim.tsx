"use client";

import React, { useState } from "react";
import { PHMeter } from "@/components/apparatus/PHMeter";
import { defaultPRNG } from "@/lib/prng";

interface PartEPalmPhSimProps {
  onResultsGenerated?: (results: { ph: number }) => void;
}

export const PartEPalmPhSim: React.FC<PartEPalmPhSimProps> = ({ onResultsGenerated }) => {
  // Underlying true pH of the unknown water sample (~7.42)
  const [truePh] = useState(() => defaultPRNG.addRelativeNoise(7.42, 0.01, 7.1, 7.8));
  const [calibratedPoints, setCalibratedPoints] = useState<number[]>([]);
  const [measuredPh, setMeasuredPh] = useState<number | null>(null);
  const [activeSolution, setActiveSolution] = useState<"air" | "buffer4" | "buffer7" | "buffer9" | "sample">("air");

  const isFullyCalibrated = calibratedPoints.length >= 2;

  const handleCalibrate = (point: number) => {
    if (!calibratedPoints.includes(point)) {
      setCalibratedPoints((prev) => [...prev, point]);
    }
  };

  const handleDipSolution = (solution: "air" | "buffer4" | "buffer7" | "buffer9" | "sample") => {
    setActiveSolution(solution);
    if (solution === "sample") {
      const ph = Number(truePh.toFixed(2));
      setMeasuredPh(ph);
      onResultsGenerated?.({ ph });
    }
  };

  const currentDisplayPh =
    activeSolution === "air"
      ? 0.0
      : activeSolution === "buffer4"
      ? 4.01
      : activeSolution === "buffer7"
      ? 7.00
      : activeSolution === "buffer9"
      ? 9.20
      : measuredPh ?? Number(truePh.toFixed(2));

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
            PART E: POTENTIOMETRIC pH MEASUREMENT
          </span>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            Glass-Reference Combination Electrode & Automatic Temperature Compensation (ATC)
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Perform a standard buffer calibration with pH 4.01, 7.00, or 9.20 buffers, rinse with deionized water, and measure the water sample at 25°C.
          </p>
        </div>

        {measuredPh !== null && (
          <span className="px-3 py-1.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg text-xs font-mono font-bold">
            ✓ Recorded pH: {measuredPh.toFixed(2)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: pH Meter */}
        <div className="md:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              BENCHTOP INSTRUMENT
            </span>
            <span className="text-xs font-mono text-slate-400">
              Sensor: Combination Glass/Ag-AgCl
            </span>
          </div>

          <PHMeter
            phValue={currentDisplayPh}
            temperatureC={25.0}
            isCalibrated={isFullyCalibrated}
            calibrationPoints={calibratedPoints}
            onCalibratePoint={handleCalibrate}
          />

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono">
            <span className="text-slate-400">Current Electrode Immersion: </span>
            <span className="text-cyan-300 font-bold uppercase">{activeSolution}</span>
          </div>
        </div>

        {/* Right: Chemical Solutions Rack */}
        <div className="md:col-span-6 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-xs font-mono text-slate-300 space-y-3">
            <h4 className="text-sm font-bold text-slate-100 font-sans border-b border-slate-800 pb-2">
              Electrode Immersion & Calibration Rack
            </h4>
            <p className="text-[11px] text-slate-400">
              Select a standard buffer or water sample beaker to dip the combination electrode:
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => {
                  handleDipSolution("buffer4");
                  handleCalibrate(4.01);
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  activeSolution === "buffer4"
                    ? "bg-amber-950/80 border-amber-600 text-amber-200"
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                }`}
              >
                <div className="font-bold">Buffer pH 4.01</div>
                <div className="text-[10px] text-slate-400">Potassium Hydrogen Phthalate</div>
              </button>

              <button
                onClick={() => {
                  handleDipSolution("buffer7");
                  handleCalibrate(7.00);
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  activeSolution === "buffer7"
                    ? "bg-emerald-950/80 border-emerald-600 text-emerald-200"
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                }`}
              >
                <div className="font-bold">Buffer pH 7.00</div>
                <div className="text-[10px] text-slate-400">Phosphate Buffer</div>
              </button>

              <button
                onClick={() => {
                  handleDipSolution("buffer9");
                  handleCalibrate(9.20);
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  activeSolution === "buffer9"
                    ? "bg-purple-950/80 border-purple-600 text-purple-200"
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                }`}
              >
                <div className="font-bold">Buffer pH 9.20</div>
                <div className="text-[10px] text-slate-400">Sodium Borate (Borax)</div>
              </button>

              <button
                onClick={() => handleDipSolution("sample")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  activeSolution === "sample"
                    ? "bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-lg ring-1 ring-cyan-500"
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                }`}
              >
                <div className="font-bold text-cyan-300">Unknown Water Sample</div>
                <div className="text-[10px] text-slate-400">Test Potability pH</div>
              </button>
            </div>
          </div>

          <div className="bg-lab-900/90 border border-slate-800 rounded-xl p-5 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-slate-200">BIS 10500:2012 Drinking Water Specification:</h4>
            <p className="text-[11px] leading-relaxed text-slate-400">
              The acceptable pH range for drinking water is <strong>6.5 to 8.5</strong>. Water with pH below 6.5 is corrosive and can leach toxic metals from distribution piping; water with pH above 8.5 causes incrustation, bitter taste, and diminishes chlorine disinfection efficiency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
