"use client";

import React, { useState } from "react";
import { Exp1Subpart } from "@/types/workbench";
import { SimulationContext } from "@/lib/simulation/types";

interface ContextualInspectorProps {
  subpart: Exp1Subpart;
  simulationState: SimulationContext;
  isOpen: boolean;
  onToggle: () => void;
}

export const ContextualInspector: React.FC<ContextualInspectorProps> = ({
  subpart,
  simulationState,
  isOpen,
  onToggle,
}) => {
  const [showTheory, setShowTheory] = useState<boolean>(false);

  const hardness = simulationState.hardness;

  return (
    <aside
      className={`absolute lg:static inset-y-0 right-0 z-20 w-80 max-w-[85vw] bg-bench-950/95 lg:bg-bench-950/90 backdrop-blur-md border-l border-bench-800 flex flex-col transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Inspector Header */}
      <div className="p-3 border-b border-bench-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-instrument-sky" />
          <h3 className="text-xs font-mono font-bold text-white tracking-wider">
            CONTEXTUAL INSPECTOR
          </h3>
        </div>
        <button
          onClick={onToggle}
          className="lg:hidden text-enamel-400 hover:text-white text-xs font-mono p-1"
        >
          ✕ Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs text-enamel-200">
        {/* Procedural Warning Alert (if any) */}
        {simulationState.proceduralWarning && (
          <div className="p-3 bg-amber-950 border border-instrument-amber rounded-xl text-amber-200 text-xs font-sans shadow-lg flex items-start gap-2.5">
            <span className="text-instrument-amber text-base">⚠️</span>
            <div>
              <strong className="block font-mono text-[11px] text-instrument-amber mb-0.5">
                PROCEDURAL SAFEGUARD:
              </strong>
              {simulationState.proceduralWarning}
            </div>
          </div>
        )}

        {/* Current Active Step Guidance */}
        <div className="bg-bench-900 border border-bench-750 rounded-xl p-3.5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-instrument-amber uppercase font-bold tracking-wider">
              CURRENT OBJECTIVE:
            </span>
            <span className="text-[10px] text-enamel-500">Subpart {subpart.toUpperCase()}</span>
          </div>
          <p className="text-xs text-enamel-200 font-sans leading-relaxed">
            {simulationState.activeHint}
          </p>
        </div>

        {/* Dynamic Chemical Reaction Card */}
        <div className="bg-bench-900 border border-bench-750 rounded-xl p-3.5 space-y-2.5 shadow-sm">
          <span className="text-[10px] text-instrument-phosphor uppercase font-bold tracking-wider block">
            ACTIVE CHEMICAL EQUATION:
          </span>

          {subpart === "hardness" && (
            <div className="space-y-2 text-[11px] font-mono text-enamel-200">
              <div className="p-2.5 bg-bench-950 rounded-lg border border-bench-800">
                <span className="text-enamel-500 block text-[9px]">COMPLEXATION WITH INDICATOR:</span>
                <span className="text-rose-300">Ca²⁺/Mg²⁺ + EBT → [Ca/Mg–EBT]</span>
                <span className="text-[9px] text-rose-400 block mt-0.5">(Wine Red, Unstable)</span>
              </div>

              <div className="p-2.5 bg-bench-950 rounded-lg border border-bench-800">
                <span className="text-enamel-500 block text-[9px]">DISPLACEMENT BY EDTA:</span>
                <span className="text-instrument-sky">[Ca/Mg–EBT] + EDTA → [Ca/Mg–EDTA] + EBT</span>
                <span className="text-[9px] text-instrument-sky block mt-0.5">(Colorless Stable Chelate + Steel Blue Free Indicator)</span>
              </div>
            </div>
          )}

          {subpart === "chloride" && (
            <div className="p-2.5 bg-bench-950 rounded-lg border border-bench-800 text-[11px] font-mono">
              <span className="text-enamel-500 block text-[9px]">PRECIPITATION REACTION:</span>
              <span className="text-sky-300">Cl⁻(aq) + Ag⁺(aq) + NO₃⁻(aq) → AgCl(s)↓ + NO₃⁻(aq)</span>
              <span className="text-[9px] text-enamel-400 block mt-1">
                Ksp(AgCl) = 1.8 × 10⁻¹⁰. Conductance drops as Cl⁻ is replaced by NO₃⁻.
              </span>
            </div>
          )}

          {subpart === "sulfate" && (
            <div className="p-2.5 bg-bench-950 rounded-lg border border-bench-800 text-[11px] font-mono">
              <span className="text-enamel-500 block text-[9px]">COLLOIDAL TURBIDITY:</span>
              <span className="text-instrument-amber">BaCl₂ + SO₄²⁻ → BaSO₄(s)↓ + 2 Cl⁻</span>
              <span className="text-[9px] text-enamel-400 block mt-1">
                Suspension stabilized by conditioning reagent for 90° nephelometric scattering.
              </span>
            </div>
          )}

          {subpart === "tds" && (
            <div className="p-2.5 bg-bench-950 rounded-lg border border-bench-800 text-[11px] font-mono">
              <span className="text-enamel-500 block text-[9px]">EMPIRICAL RELATION:</span>
              <span className="text-instrument-sky">TDS (mg/L) = kₑ × EC (µS/cm)</span>
              <span className="text-[9px] text-enamel-400 block mt-1">
                kₑ = 0.70 (standard factor for natural waters, range 0.55–0.85).
              </span>
            </div>
          )}

          {subpart === "ph" && (
            <div className="p-2.5 bg-bench-950 rounded-lg border border-bench-800 text-[11px] font-mono">
              <span className="text-enamel-500 block text-[9px]">NERNSTIAN POTENTIAL:</span>
              <span className="text-instrument-sky">E = E° - (2.303 RT / F) × pH</span>
              <span className="text-[9px] text-enamel-400 block mt-1">
                Slope = 59.16 mV / pH unit at 25°C.
              </span>
            </div>
          )}
        </div>

        {/* Species Breakdown HUD (for Hardness) */}
        {subpart === "hardness" && hardness.sampleVolumeMl > 0 && (
          <div className="bg-bench-900 border border-bench-750 rounded-xl p-3.5 space-y-2 shadow-sm">
            <span className="text-[10px] text-enamel-400 uppercase font-bold tracking-wider block">
              SPECIES EQUILIBRIUM:
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center">
                <span>Free Ca²⁺/Mg²⁺:</span>
                <span className="font-bold text-white">
                  {Math.max(0, 100 - (hardness.buretteReadingMl / 16.8) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-bench-950 h-1.5 rounded-full overflow-hidden border border-bench-800">
                <div
                  className="bg-instrument-amber h-full transition-all"
                  style={{
                    width: `${Math.max(0, 100 - (hardness.buretteReadingMl / 16.8) * 100)}%`,
                  }}
                />
              </div>

              <div className="flex justify-between items-center pt-1">
                <span>[M-EDTA] Chelate:</span>
                <span className="font-bold text-instrument-sky">
                  {Math.min(100, (hardness.buretteReadingMl / 16.8) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-bench-950 h-1.5 rounded-full overflow-hidden border border-bench-800">
                <div
                  className="bg-instrument-sky h-full transition-all"
                  style={{
                    width: `${Math.min(100, (hardness.buretteReadingMl / 16.8) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Expandable Theory Accordion */}
        <div className="bg-bench-900 border border-bench-750 rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => setShowTheory(!showTheory)}
            className="w-full p-3 text-left font-mono text-xs flex items-center justify-between text-enamel-200 hover:text-white hover:bg-bench-850"
          >
            <span className="font-bold">📘 Scientific Theory & Principles</span>
            <span>{showTheory ? "▲" : "▼"}</span>
          </button>
          {showTheory && (
            <div className="p-3.5 pt-1 text-[11px] font-sans text-enamel-400 leading-relaxed space-y-2 border-t border-bench-800">
              <p>
                Hardness in water is primarily caused by dissolved divalent cations (Ca²⁺ and Mg²⁺). Temporary hardness is caused by bicarbonates removable by boiling, whereas permanent hardness is caused by chlorides and sulfates.
              </p>
              <p>
                Ethylenediaminetetraacetic acid (EDTA) is a hexadentate chelating agent providing six electron-pair donor atoms (four carboxylate and two amino nitrogens) that wrap octahedral coordination complexes around Ca²⁺ and Mg²⁺ in a 1:1 stoichiometric ratio at basic pH ≈ 10.
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
