"use client";

import React, { useState } from "react";
import { Exp1Subpart } from "@/types/workbench";
import { SimulationContext } from "@/lib/simulation/types";

interface EquipmentDrawerProps {
  subpart: Exp1Subpart;
  simulationState: SimulationContext;
  onAction: (actionType: string, payload?: any) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const EquipmentDrawer: React.FC<EquipmentDrawerProps> = ({
  subpart,
  simulationState,
  onAction,
  isOpen,
  onToggle,
}) => {
  const [activeTab, setActiveTab] = useState<"glassware" | "reagents">("reagents");

  const hardness = simulationState.hardness;

  return (
    <aside
      className={`absolute lg:static inset-y-0 left-0 z-20 w-72 max-w-[85vw] bg-bench-950/95 lg:bg-bench-950/90 backdrop-blur-md border-r border-bench-800 flex flex-col transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Drawer Header */}
      <div className="p-3 border-b border-bench-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-instrument-amber" />
          <h3 className="text-xs font-mono font-bold text-white tracking-wider">
            REAGENTS & TOOLS
          </h3>
        </div>
        <button
          onClick={onToggle}
          className="lg:hidden text-enamel-400 hover:text-white text-xs font-mono p-1"
        >
          ✕ Close
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1.5 bg-bench-900 border-b border-bench-800 text-xs font-mono">
        <button
          onClick={() => setActiveTab("reagents")}
          className={`py-1 rounded-md text-center transition-all ${
            activeTab === "reagents" ? "bg-bench-800 text-instrument-amber font-bold border border-bench-700" : "text-enamel-400 hover:text-white"
          }`}
        >
          Reagents
        </button>
        <button
          onClick={() => setActiveTab("glassware")}
          className={`py-1 rounded-md text-center transition-all ${
            activeTab === "glassware" ? "bg-bench-800 text-instrument-amber font-bold border border-bench-700" : "text-enamel-400 hover:text-white"
          }`}
        >
          Pipettes & Tools
        </button>
      </div>

      {/* Drawer Body - Contextual according to Subpart */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
        {subpart === "hardness" && (
          <>
            <div className="text-[10px] text-enamel-500 uppercase tracking-wider font-semibold">
              ACTIVE TITRATION VESSEL ACTIONS:
            </div>

            {/* Action 1: Pipette 20 mL Sample */}
            <button
              onClick={() => onAction("HARDNESS_PIPETTE_SAMPLE")}
              disabled={hardness.sampleVolumeMl > 0}
              className={`w-full p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                hardness.sampleVolumeMl === 0
                  ? "bg-bench-900 border-instrument-amber/60 hover:bg-bench-850 text-enamel-100 ring-1 ring-instrument-amber/30 shadow"
                  : "bg-bench-900/40 border-bench-800 text-enamel-500 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">
                  {hardness.mode === "standardization" ? "Std Hard Water (1000 ppm)" : "Sample Water"}
                </span>
                <span className="text-[10px] text-instrument-amber">20.0 mL</span>
              </div>
              <div className="text-[10px] text-enamel-400 font-sans">
                {hardness.sampleVolumeMl > 0 ? "✓ 20.0 mL Pipetted into Flask" : "Pipette into Conical Flask"}
              </div>
            </button>

            {/* Action 2: Add 5 mL Ammonia Buffer */}
            <button
              onClick={() => onAction("HARDNESS_ADD_BUFFER")}
              disabled={hardness.hasAmmoniaBuffer || hardness.sampleVolumeMl === 0}
              className={`w-full p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                hardness.sampleVolumeMl > 0 && !hardness.hasAmmoniaBuffer
                  ? "bg-bench-900 border-instrument-amber/60 hover:bg-bench-850 text-enamel-100 ring-1 ring-instrument-amber/30 shadow"
                  : "bg-bench-900/40 border-bench-800 text-enamel-500 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">Ammonia Buffer (NH₄OH–NH₄Cl)</span>
                <span className="text-[10px] text-instrument-amber">5.0 mL</span>
              </div>
              <div className="text-[10px] text-enamel-400 font-sans">
                {hardness.hasAmmoniaBuffer ? "✓ Buffer Added (pH stabilized at 10)" : "Dispense 5 mL Buffer to maintain pH 10"}
              </div>
            </button>

            {/* Action 3: Add 3 Drops EBT Indicator */}
            <button
              onClick={() => onAction("HARDNESS_ADD_INDICATOR")}
              disabled={hardness.hasEbtIndicator || !hardness.hasAmmoniaBuffer}
              className={`w-full p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                hardness.hasAmmoniaBuffer && !hardness.hasEbtIndicator
                  ? "bg-rose-950/70 border-rose-500/80 hover:bg-rose-900/80 text-rose-200 ring-1 ring-rose-500/50 shadow"
                  : "bg-bench-900/40 border-bench-800 text-enamel-500 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">EBT Indicator (0.5% in EtOH)</span>
                <span className="text-[10px] text-rose-400">3 Drops</span>
              </div>
              <div className="text-[10px] text-enamel-400 font-sans">
                {hardness.hasEbtIndicator ? "✓ Indicator Added (Wine Red Complex)" : "Dispense 3 drops into Flask"}
              </div>
            </button>

            {/* Titration Mode Selector Switch */}
            <div className="pt-3 border-t border-bench-800 flex flex-col gap-2">
              <span className="text-[10px] text-enamel-500 uppercase tracking-wider font-semibold">
                TITRATION STAGE:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onAction("HARDNESS_SET_MODE", "standardization")}
                  className={`p-2 rounded-lg border text-left flex flex-col ${
                    hardness.mode === "standardization"
                      ? "bg-bench-850 border-instrument-amber text-white font-bold"
                      : "bg-bench-900 border-bench-800 text-enamel-400 hover:text-white"
                  }`}
                >
                  <span className="text-[11px]">Titration I</span>
                  <span className="text-[9px] text-enamel-500 font-sans">Standardization (V₁)</span>
                </button>
                <button
                  onClick={() => onAction("HARDNESS_SET_MODE", "sample")}
                  className={`p-2 rounded-lg border text-left flex flex-col ${
                    hardness.mode === "sample"
                      ? "bg-bench-850 border-instrument-amber text-white font-bold"
                      : "bg-bench-900 border-bench-800 text-enamel-400 hover:text-white"
                  }`}
                >
                  <span className="text-[11px]">Titration II</span>
                  <span className="text-[9px] text-enamel-500 font-sans">Sample Hardness (V₂)</span>
                </button>
              </div>
            </div>

            {/* Reset Titration Flask Button */}
            <div className="pt-2">
              <button
                onClick={() => onAction("HARDNESS_RESET_TRIAL")}
                className="w-full py-2 px-3 rounded-lg bg-bench-900 hover:bg-bench-850 border border-bench-800 text-enamel-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <span>⟲</span>
                <span>Rinse & Refill Flask (Next Trial)</span>
              </button>
            </div>
          </>
        )}

        {/* Subpart 2: Chloride Conductometry Reagents */}
        {subpart === "chloride" && (
          <div className="flex flex-col gap-3">
            <div className="text-[10px] text-enamel-500 uppercase tracking-wider font-semibold">
              CHLORIDE CONDUCTOMETRY REAGENTS:
            </div>
            <button
              onClick={() => onAction("CHLORIDE_DIP_PROBE", !simulationState.chloride.isProbeDipped)}
              className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                simulationState.chloride.isProbeDipped
                  ? "bg-emerald-950 border-emerald-700 text-emerald-200"
                  : "bg-bench-900 border-bench-800 text-enamel-300"
              }`}
            >
              <div className="flex justify-between font-bold">
                <span>Conductivity Cell (k = 1.0 cm⁻¹)</span>
                <span>{simulationState.chloride.isProbeDipped ? "DIPPED" : "OUT"}</span>
              </div>
              <span className="text-[10px] text-enamel-400 font-sans">
                {simulationState.chloride.isProbeDipped ? "Cell immersed in water sample" : "Click to immerse cell into beaker"}
              </span>
            </button>
          </div>
        )}

        {/* Subpart 3: Sulfate Turbidimetry Reagents */}
        {subpart === "sulfate" && (
          <div className="flex flex-col gap-3">
            <div className="text-[10px] text-enamel-500 uppercase tracking-wider font-semibold">
              STANDARD FLASK SELECTOR:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((id) => (
                <button
                  key={id}
                  onClick={() => onAction("SULFATE_SELECT_FLASK", id)}
                  className={`p-2 rounded-lg border text-left text-[11px] ${
                    simulationState.sulfate.selectedFlaskId === id
                      ? "bg-bench-850 border-instrument-amber text-white font-bold"
                      : "bg-bench-900 border-bench-800 text-enamel-400"
                  }`}
                >
                  {id === 7 ? "Flask 7 (Unknown)" : `Flask ${id} (${(id - 1) * 50} ppm)`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subpart 4: TDS Reagents */}
        {subpart === "tds" && (
          <div className="flex flex-col gap-3">
            <div className="text-[10px] text-enamel-500 uppercase tracking-wider font-semibold">
              TDS CELL STATUS:
            </div>
            <button
              onClick={() => onAction("TDS_DIP_PROBE", !simulationState.tds.isProbeDipped)}
              className={`w-full p-2.5 rounded-xl border text-left ${
                simulationState.tds.isProbeDipped
                  ? "bg-emerald-950 border-emerald-700 text-emerald-200"
                  : "bg-bench-900 border-bench-800 text-enamel-300"
              }`}
            >
              <div className="flex justify-between font-bold">
                <span>Conductivity Probe (25.0 °C)</span>
                <span>{simulationState.tds.isProbeDipped ? "DIPPED" : "OUT"}</span>
              </div>
            </button>
          </div>
        )}

        {/* Subpart 5: pH Reagents */}
        {subpart === "ph" && (
          <div className="flex flex-col gap-3">
            <div className="text-[10px] text-enamel-500 uppercase tracking-wider font-semibold">
              CALIBRATION BUFFERS:
            </div>
            {(["buffer4", "buffer7", "buffer9"] as const).map((b) => (
              <button
                key={b}
                onClick={() => onAction("PH_CALIBRATE_POINT", b === "buffer4" ? 4.0 : b === "buffer7" ? 7.0 : 9.2)}
                className="w-full p-2 rounded-lg bg-bench-900 border border-bench-800 text-enamel-300 text-left hover:border-bench-700"
              >
                Standard {b.replace("buffer", "pH ")} Buffer
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
