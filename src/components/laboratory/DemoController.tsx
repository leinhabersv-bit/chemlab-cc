"use client";

import React, { useEffect, useState, useRef } from "react";
import { Exp1Subpart } from "@/types/workbench";
import { SimulationContext } from "@/lib/simulation/types";

interface DemoControllerProps {
  subpart: Exp1Subpart;
  simulationState: SimulationContext;
  onAction: (actionType: string, payload?: any) => void;
  onSwitchSubpart: (sp: Exp1Subpart) => void;
}

interface DemoStep {
  id: number;
  title: string;
  chemicalPrinciple: string;
  actionName: string;
  execute: () => void;
}

export const DemoController: React.FC<DemoControllerProps> = ({
  subpart,
  simulationState,
  onAction,
  onSwitchSubpart,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x or 2x
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hardness = simulationState.hardness;

  const demoSteps: DemoStep[] = [
    {
      id: 1,
      title: "1. Pipette 20.0 mL of Standard Hard Water",
      chemicalPrinciple:
        "Volumetric Class-A bulb pipette transfers exactly 20.0 mL (±0.03 mL) of water containing Ca²⁺ and Mg²⁺ cations into the 250 mL conical flask.",
      actionName: "Pipetting Sample",
      execute: () => onAction("HARDNESS_PIPETTE_SAMPLE"),
    },
    {
      id: 2,
      title: "2. Add 2.0 mL Ammonia-Ammonium Chloride Buffer (pH 10)",
      chemicalPrinciple:
        "NH₄OH/NH₄Cl buffer fixes the reaction medium at basic pH ≈ 10.0. Basic pH is essential because EDTA exists as fully ionized Y⁴⁻ and the conditional stability constant of Ca-EDTA is maximized.",
      actionName: "Adding Buffer",
      execute: () => onAction("HARDNESS_ADD_BUFFER"),
    },
    {
      id: 3,
      title: "3. Add 2 drops of Eriochrome Black-T (EBT) Indicator",
      chemicalPrinciple:
        "EBT binds free Mg²⁺ to form the unstable wine-red coordination complex [Mg-EBT]⁻. The solution turns wine-red, signaling that metal ions are ready for EDTA chelation.",
      actionName: "Adding EBT Indicator",
      execute: () => onAction("HARDNESS_ADD_INDICATOR"),
    },
    {
      id: 4,
      title: "4. Activate Magnetic Stirrer & Stream 0.01 N EDTA Titrant",
      chemicalPrinciple:
        "Hexadentate EDTA (H₂Y²⁻) chelates Ca²⁺ first (log K = 10.7), then Mg²⁺ (log K = 8.7). Magnetic stirring at 600 RPM ensures instantaneous mixing without local concentration gradients.",
      actionName: "Titrating with EDTA",
      execute: () => {
        if (!hardness.isStirring) onAction("HARDNESS_TOGGLE_STIRRER");
        onAction("HARDNESS_DISPENSE_EDTA", 10.0);
      },
    },
    {
      id: 5,
      title: "5. Reach Equivalence Point & Observe Color Transition",
      chemicalPrinciple:
        "At V_E ≈ 16.8 mL, EDTA displaces EBT from [Mg-EBT]⁻ to form colorless [Mg-EDTA]²⁻. Unbound indicator HD²⁻ is liberated, producing an unmistakable sharp color change to pure steel blue.",
      actionName: "Endpoint Reached",
      execute: () => {
        onAction("HARDNESS_DISPENSE_EDTA", 6.8);
      },
    },
    {
      id: 6,
      title: "6. Log Concordant Titre Reading into Observation Notebook",
      chemicalPrinciple:
        "Titre volume V = 16.80 mL is recorded. Stoichiometric calculation N₁V₁ = N₂V₂ gives EDTA normality N = 0.0119 N, and Total Hardness = 420.0 mg/L as CaCO₃.",
      actionName: "Logging Reading",
      execute: () => onAction("HARDNESS_RECORD_TRIAL"),
    },
  ];

  const currentStep = demoSteps[currentStepIndex];

  // Automated step sequencer
  useEffect(() => {
    if (isPlaying) {
      const stepDuration = (4000 / playbackSpeed);
      timerRef.current = setTimeout(() => {
        if (currentStepIndex < demoSteps.length - 1) {
          demoSteps[currentStepIndex].execute();
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          demoSteps[currentStepIndex].execute();
          setIsPlaying(false);
        }
      }, stepDuration);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, playbackSpeed]);

  const handlePlayPause = () => {
    if (!isPlaying) {
      // If at end, loop to beginning
      if (currentStepIndex >= demoSteps.length - 1) {
        onAction("RESET_EXPERIMENT");
        setCurrentStepIndex(0);
      }
      currentStep.execute();
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < demoSteps.length - 1) {
      demoSteps[currentStepIndex].execute();
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    onAction("RESET_EXPERIMENT");
    setCurrentStepIndex(0);
  };

  return (
    <div className="w-full bg-bench-900 border border-bench-750 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 font-mono text-xs">
      {/* Top Header & Timeline Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-bench-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-instrument-amber animate-pulse" />
          <span className="font-bold text-white tracking-wide">
            AUTOMATED GUIDED DEMONSTRATION
          </span>
          <span className="text-[10px] text-enamel-400 bg-bench-850 px-2 py-0.5 rounded border border-bench-700">
            STEP {currentStep.id} OF {demoSteps.length}
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-1.5 px-2.5 rounded-lg bg-bench-850 hover:bg-bench-800 border border-bench-700 text-enamel-300 hover:text-white transition-colors"
            title="Reset to beginning"
          >
            ⟲ Reset
          </button>

          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="p-1.5 px-2.5 rounded-lg bg-bench-850 hover:bg-bench-800 border border-bench-700 text-enamel-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ⏮ Prev
          </button>

          <button
            onClick={handlePlayPause}
            className={`p-1.5 px-4 rounded-lg font-bold flex items-center gap-1.5 shadow transition-all ${
              isPlaying
                ? "bg-instrument-amber text-slate-950 hover:bg-amber-400"
                : "bg-instrument-phosphor text-slate-950 hover:bg-emerald-400"
            }`}
          >
            <span>{isPlaying ? "⏸ Pause Demo" : "▶ Play Demo"}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentStepIndex === demoSteps.length - 1}
            className="p-1.5 px-2.5 rounded-lg bg-bench-850 hover:bg-bench-800 border border-bench-700 text-enamel-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next ⏭
          </button>

          {/* Speed Toggle */}
          <button
            onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 2 : 1)}
            className="p-1.5 px-2 rounded-lg bg-bench-850 border border-bench-700 text-instrument-sky font-bold text-[10px]"
            title="Playback Speed"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>

      {/* Step Description & Pedagogical Callout */}
      <div className="bg-bench-950 p-3.5 rounded-xl border border-bench-800 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-white font-bold text-xs sm:text-sm">
          <span>{currentStep.title}</span>
          <span className="text-[10px] text-instrument-phosphor font-mono uppercase bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            {currentStep.actionName}
          </span>
        </div>
        <p className="text-xs text-enamel-300 font-sans leading-relaxed">
          {currentStep.chemicalPrinciple}
        </p>
      </div>

      {/* Timeline Progress Bar */}
      <div className="w-full bg-bench-950 h-1.5 rounded-full overflow-hidden border border-bench-800">
        <div
          className="bg-instrument-amber h-full transition-all duration-300"
          style={{ width: `${((currentStepIndex + 1) / demoSteps.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
