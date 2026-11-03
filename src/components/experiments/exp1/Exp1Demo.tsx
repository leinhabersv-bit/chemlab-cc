"use client";

import React, { useState, useEffect } from "react";
import { Burette } from "@/components/apparatus/Burette";
import { ConicalFlask } from "@/components/apparatus/ConicalFlask";
import { ConductivityMeter } from "@/components/apparatus/ConductivityMeter";
import { Nephelometer } from "@/components/apparatus/Nephelometer";
import { PHMeter } from "@/components/apparatus/PHMeter";

interface DemoStep {
  stepNumber: number;
  title: string;
  subpart: "A (EDTA)" | "B (Chloride)" | "C (Sulfate)" | "D (TDS)" | "E (pH)";
  description: string;
  apparatusFocus: "burette" | "flask" | "cond" | "nephelo" | "ph";
  flaskColor: string;
  buretteVol: number;
  conductance: number;
  turbidity: number;
  ph: number;
}

const DEMO_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    title: "Part A: Pipetting Standard Hard Water",
    subpart: "A (EDTA)",
    description: "20 mL of standard hard water (1 mg/mL CaCO3 equivalents) is pipetted into a clean 250 mL conical flask. 5 mL of NH4OH-NH4Cl buffer is added to stabilize the solution at pH 10.",
    apparatusFocus: "flask",
    flaskColor: "rgba(224, 242, 254, 0.5)",
    buretteVol: 0,
    conductance: 2.15,
    turbidity: 0,
    ph: 10.0,
  },
  {
    stepNumber: 2,
    title: "Part A: Adding EBT Indicator",
    subpart: "A (EDTA)",
    description: "3 drops of Eriochrome Black-T (EBT) indicator are added. Ca2+ and Mg2+ form an unstable [M-EBT] chelate complex, imparting an intense wine-red coloration.",
    apparatusFocus: "flask",
    flaskColor: "rgba(114, 47, 55, 0.9)",
    buretteVol: 0,
    conductance: 2.15,
    turbidity: 0,
    ph: 10.0,
  },
  {
    stepNumber: 3,
    title: "Part A: Dropwise Titration to Endpoint",
    subpart: "A (EDTA)",
    description: "Standard 0.01 N EDTA is added dropwise from the burette. EDTA displaces the indicator to form a colorless, thermodynamically stable [M-EDTA] complex. Free EBT is released, turning the solution steel blue at V1 = 20.0 mL.",
    apparatusFocus: "burette",
    flaskColor: "rgba(70, 130, 180, 0.92)",
    buretteVol: 20.0,
    conductance: 2.15,
    turbidity: 0,
    ph: 10.0,
  },
  {
    stepNumber: 4,
    title: "Part B: Conductometric Precipitation of Chloride",
    subpart: "B (Chloride)",
    description: "20 mL unknown chloride solution is stirred in a beaker with a conductivity probe. 0.01 N AgNO3 is added in 1.0 mL increments. Cl- is removed as insoluble AgCl precipitate; conductance decreases slightly, then shoots up past equivalence (~12 mL) due to unreacted Ag+ and NO3-.",
    apparatusFocus: "cond",
    flaskColor: "rgba(241, 245, 249, 0.8)",
    buretteVol: 12.0,
    conductance: 1.97,
    turbidity: 0,
    ph: 7.2,
  },
  {
    stepNumber: 5,
    title: "Part C: Barium Sulfate Turbidity (Nephelometry)",
    subpart: "C (Sulfate)",
    description: "Sulfate is precipitated as colloidal BaSO4 using 0.6 g BaCl2 and conditioning reagent (glycerol/alcohol). The nephelometer measures light scattered at 90° against a 5-point calibration curve (50 to 250 ppm).",
    apparatusFocus: "nephelo",
    flaskColor: "rgba(255, 255, 255, 0.7)",
    buretteVol: 0,
    conductance: 1.97,
    turbidity: 92.5,
    ph: 7.2,
  },
  {
    stepNumber: 6,
    title: "Part D & E: TDS and pH Determination",
    subpart: "D (TDS)",
    description: "Electrical conductivity of the raw water sample (680 µS/cm) is multiplied by ke = 0.70 to yield TDS = 476 mg/L. A calibrated glass combination electrode measures the sample pH = 7.42 at 25°C.",
    apparatusFocus: "ph",
    flaskColor: "rgba(224, 242, 254, 0.7)",
    buretteVol: 0,
    conductance: 680,
    turbidity: 92.5,
    ph: 7.42,
  },
];

export const Exp1Demo: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const step = DEMO_STEPS[currentStepIndex];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= DEMO_STEPS.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 4000 / playbackSpeed);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, playbackSpeed]);

  return (
    <div className="flex flex-col gap-6">
      {/* Playback Control Bar */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-semibold shadow-md transition-all flex items-center gap-2 ${
              isPlaying
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {isPlaying ? "⏸ Pause Demo" : "▶ Play Guided Demo"}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(0);
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono transition-all"
          >
            ↺ Replay from Start
          </button>
        </div>

        {/* Step Navigation & Speed Selector */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentStepIndex((p) => Math.max(p - 1, 0))}
              disabled={currentStepIndex === 0}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded border border-slate-700 text-slate-300"
            >
              ◀ Prev
            </button>
            <span className="text-slate-400">
              Step <strong className="text-cyan-400">{currentStepIndex + 1}</strong> of {DEMO_STEPS.length}
            </span>
            <button
              onClick={() => setCurrentStepIndex((p) => Math.min(p + 1, DEMO_STEPS.length - 1))}
              disabled={currentStepIndex === DEMO_STEPS.length - 1}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded border border-slate-700 text-slate-300"
            >
              Next ▶
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded border border-slate-700">
            <span className="text-[10px] text-slate-400">Speed:</span>
            {[1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  playbackSpeed === s ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Guided Animation Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Animated Apparatus Stage */}
        <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-around gap-6 shadow-inner relative min-h-[420px]">
          <div className="absolute top-3 left-4 text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
            ANIMATED DEMONSTRATION STAGE
          </div>

          {step.apparatusFocus === "burette" || step.apparatusFocus === "flask" ? (
            <>
              <Burette
                volumeDispensed={step.buretteVol}
                titrantName="0.01 N EDTA"
                isDispensing={isPlaying}
                readOnly
              />
              <ConicalFlask
                fillPercentage={45}
                liquidColor={step.flaskColor}
                liquidName="Reaction Mixture"
                volumeDisplayMl={25 + step.buretteVol}
                isStirring={true}
              />
            </>
          ) : step.apparatusFocus === "cond" ? (
            <ConductivityMeter
              readingValue={step.conductance}
              unit="mS/cm"
              isPowered={true}
              isProbeDipped={true}
            />
          ) : step.apparatusFocus === "nephelo" ? (
            <Nephelometer
              turbidityNtu={step.turbidity}
              sampleLabel="Unknown Sulfate Sample"
              isCalibrated={true}
            />
          ) : (
            <PHMeter
              phValue={step.ph}
              temperatureC={25.0}
              isCalibrated={true}
            />
          )}
        </div>

        {/* Narrative & Scientific Insights */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                {step.subpart}
              </span>
              <span className="text-xs font-mono text-slate-400">Step {step.stepNumber}</span>
            </div>

            <h3 className="text-lg font-bold text-slate-100">
              {step.title}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {step.description}
            </p>

            <div className="mt-2 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex flex-col gap-1">
              <div className="text-slate-300 font-semibold">Key Chemical Principle:</div>
              {step.stepNumber <= 3 && (
                <span>
                  [Ca/Mg–EBT] (wine red) + EDTA → [Ca/Mg–EDTA] (colorless) + EBT (steel blue)
                </span>
              )}
              {step.stepNumber === 4 && (
                <span>
                  Cl⁻ + Ag⁺ → AgCl(s)↓. Conductance minimum indicates exact stoichiometric equivalence.
                </span>
              )}
              {step.stepNumber === 5 && (
                <span>
                  BaCl₂ + SO₄²⁻ → BaSO₄(s)↓. 90° light scattering directly proportional to concentration.
                </span>
              )}
              {step.stepNumber === 6 && (
                <span>
                  TDS = 0.70 × EC. Combination glass electrode measures hydronium ion activity.
                </span>
              )}
            </div>
          </div>

          {/* Demonstration Progress Roadmap */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 text-xs font-mono">
            <span className="text-slate-400 text-[10px] font-bold">PROCEDURAL SEQUENCE:</span>
            <div className="space-y-1.5">
              {DEMO_STEPS.map((s, idx) => (
                <button
                  key={s.stepNumber}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`w-full text-left p-2 rounded transition-all flex items-center justify-between text-xs ${
                    currentStepIndex === idx
                      ? "bg-cyan-950 text-cyan-200 border border-cyan-700 font-bold"
                      : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <span className="truncate">{s.title}</span>
                  <span className="text-[10px]">{s.subpart}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
