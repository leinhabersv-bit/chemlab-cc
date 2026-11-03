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
      className={`absolute lg:static inset-y-0 left-0 z-20 w-72 max-w-[85vw] bg-slate-950/95 lg:bg-slate-950/80 backdrop-blur-md border-r border-slate-800 flex flex-col transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Drawer Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-mono text-xs">🧰</span>
          <h3 className="text-xs font-mono font-bold text-slate-200 tracking-wider">
            REAGENTS & TOOLS
          </h3>
        </div>
        <button
          onClick={onToggle}
          className="lg:hidden text-slate-400 hover:text-slate-200 text-xs font-mono p-1"
        >
          ✕ Close
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1.5 bg-slate-900 border-b border-slate-800 text-xs font-mono">
        <button
          onClick={() => setActiveTab("reagents")}
          className={`py-1 rounded text-center transition-all ${
            activeTab === "reagents" ? "bg-cyan-950 text-cyan-300 font-bold border border-cyan-800" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Reagents
        </button>
        <button
          onClick={() => setActiveTab("glassware")}
          className={`py-1 rounded text-center transition-all ${
            activeTab === "glassware" ? "bg-cyan-950 text-cyan-300 font-bold border border-cyan-800" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Pipettes & Tools
        </button>
      </div>

      {/* Drawer Body - Contextual according to Subpart */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
        {subpart === "hardness" && (
          <>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              ACTIVE TITRATION VESSEL ACTIONS:
            </div>

            {/* Action 1: Pipette 20 mL Sample */}
            <button
              onClick={() => onAction("HARDNESS_PIPETTE_SAMPLE")}
              disabled={hardness.sampleVolumeMl > 0}
              className={`w-full p-2.5 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                hardness.sampleVolumeMl === 0
                  ? "bg-cyan-950/70 border-cyan-500/80 hover:bg-cyan-900/80 text-cyan-200 ring-1 ring-cyan-500/50 shadow"
                  : "bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">
                  {hardness.mode === "standardization" ? "Std Hard Water (1000 ppm)" : "Sample Water"}
                </span>
                <span className="text-[10px] text-cyan-400">20.0 mL</span>
              </div>
              <div className="text-[10px] text-slate-400 font-sans">
                {hardness.sampleVolumeMl > 0 ? "✓ 20.0 mL Pipetted into Flask" : "Pipette into Conical Flask"}
              </div>
            </button>

            {/* Action 2: Add 5 mL Ammonia Buffer */}
            <button
              onClick={() => onAction("HARDNESS_ADD_BUFFER")}
              disabled={hardness.hasAmmoniaBuffer || hardness.sampleVolumeMl === 0}
              className={`w-full p-2.5 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                hardness.sampleVolumeMl > 0 && !hardness.hasAmmoniaBuffer
                  ? "bg-amber-950/70 border-amber-500/80 hover:bg-amber-900/80 text-amber-200 ring-1 ring-amber-500/50 shadow"
                  : "bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">Ammonia Buffer (NH₄OH–NH₄Cl)</span>
                <span className="text-[10px] text-amber-400">5.0 mL</span>
              </div>
              <div className="text-[10px] text-slate-400 font-sans">
                {hardness.hasAmmoniaBuffer ? "✓ Buffer Added (pH stabilized at 10)" : "Dispense 5 mL Buffer to maintain pH 10"}
              </div>
            </button>

            {/* Action 3: Add 3 Drops EBT Indicator */}
            <button
              onClick={() => onAction("HARDNESS_ADD_INDICATOR")}
              disabled={hardness.hasEbtIndicator || !hardness.hasAmmoniaBuffer}
              className={`w-full p-2.5 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                hardness.hasAmmoniaBuffer && !hardness.hasEbtIndicator
                  ? "bg-rose-950/70 border-rose-500/80 hover:bg-rose-900/80 text-rose-200 ring-1 ring-rose-500/50 shadow"
                  : "bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">EBT Indicator (0.5% in EtOH)</span>
                <span className="text-[10px] text-rose-400">3 Drops</span>
              </div>
              <div className="text-[10px] text-slate-400 font-sans">
                {hardness.hasEbtIndicator ? "✓ Indicator Added (Wine Red Complex)" : "Dispense 3 drops into Flask"}
              </div>
            </button>

            {/* Titration Mode Selector Switch */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                TITRATION STAGE:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onAction("HARDNESS_SET_MODE", "standardization")}
                  className={`p-2 rounded text-left transition-all ${
                    hardness.mode === "standardization"
                      ? "bg-cyan-950 border border-cyan-600 text-cyan-200 font-bold"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="text-xs">Titration I</div>
                  <div className="text-[9px] text-slate-400 font-sans">EDTA Standardization</div>
                </button>
                <button
                  onClick={() => onAction("HARDNESS_SET_MODE", "sample")}
                  className={`p-2 rounded text-left transition-all ${
                    hardness.mode === "sample"
                      ? "bg-cyan-950 border border-cyan-600 text-cyan-200 font-bold"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="text-xs">Titration II</div>
                  <div className="text-[9px] text-slate-400 font-sans">Sample Hardness</div>
                </button>
              </div>
            </div>
          </>
        )}

        {subpart === "chloride" && (
          <>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              CHLORIDE PRECIPITATION SETUP:
            </div>
            <button
              onClick={() => onAction("CHLORIDE_PREPARE_SAMPLE")}
              disabled={simulationState.chloride.sampleVolumeMl > 0}
              className="w-full p-2.5 rounded-lg border bg-slate-900 hover:bg-slate-850 border-slate-800 text-cyan-300 text-left"
            >
              <div className="font-bold">20 mL Chloride Sample + 10 mL DI H₂O</div>
              <div className="text-[10px] text-slate-400">Load into 100 mL Beaker</div>
            </button>
            <button
              onClick={() => onAction("CHLORIDE_DIP_PROBE")}
              disabled={simulationState.chloride.isProbeDipped || simulationState.chloride.sampleVolumeMl === 0}
              className="w-full p-2.5 rounded-lg border bg-slate-900 hover:bg-slate-850 border-slate-800 text-emerald-300 text-left"
            >
              <div className="font-bold">Dip Pt Conductivity Probe</div>
              <div className="text-[10px] text-slate-400">Immerse cell in solution</div>
            </button>
          </>
        )}

        {subpart === "sulfate" && (
          <>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              TURBIDITY STANDARDS RACK:
            </div>
            <button
              onClick={() => onAction("SULFATE_ZERO_CALIBRATE")}
              className="w-full p-2 rounded border bg-amber-950/60 border-amber-800 text-amber-200 text-left"
            >
              <div className="font-bold">Zero Set with Blank (Flask 1)</div>
              <div className="text-[10px] text-slate-400">Calibrate detector to 0.0 NTU</div>
            </button>
            <div className="space-y-1 pt-1">
              {[2, 3, 4, 5, 6].map((id) => (
                <button
                  key={id}
                  onClick={() => onAction("SULFATE_MEASURE_FLASK", id)}
                  className="w-full p-1.5 rounded border bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300 text-left flex justify-between"
                >
                  <span>Flask {id} ({(id - 1) * 50} ppm)</span>
                  <span className="text-cyan-400">
                    {simulationState.sulfate.measuredTurbidityNtu[id] !== undefined
                      ? `${simulationState.sulfate.measuredTurbidityNtu[id]} NTU`
                      : "Measure"}
                  </span>
                </button>
              ))}
              <button
                onClick={() => onAction("SULFATE_MEASURE_UNKNOWN")}
                className="w-full p-2 rounded border bg-cyan-950/60 border-cyan-800 text-cyan-200 text-left mt-2"
              >
                <div className="font-bold">Measure Unknown Sample (Flask 7)</div>
                <div className="text-[10px] text-slate-400">Interpolate on calibration curve</div>
              </button>
            </div>
          </>
        )}

        {subpart === "tds" && (
          <>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              TDS PROBE CONTROL:
            </div>
            <button
              onClick={() => onAction("TDS_DIP_PROBE", !simulationState.tds.isProbeDipped)}
              className="w-full p-2.5 rounded border bg-slate-900 border-slate-800 text-cyan-300 text-left"
            >
              <div className="font-bold">
                {simulationState.tds.isProbeDipped ? "Withdraw EC Probe" : "Dip EC Probe into Water Sample"}
              </div>
              <div className="text-[10px] text-slate-400">Stabilizes conductivity reading at 25°C</div>
            </button>
          </>
        )}

        {subpart === "ph" && (
          <>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              pH ELECTRODE BEAKERS:
            </div>
            {(["buffer4", "buffer7", "buffer9", "sample"] as const).map((sol) => (
              <button
                key={sol}
                onClick={() => onAction("PH_SET_ELECTRODE", sol)}
                className={`w-full p-2 rounded border text-left transition-all ${
                  simulationState.ph.electrodeState === sol
                    ? "bg-cyan-950 border-cyan-500 text-cyan-200 font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850"
                }`}
              >
                <div className="capitalize">{sol === "sample" ? "Unknown Water Sample" : `Buffer pH ${sol.replace("buffer", "")}`}</div>
                <div className="text-[10px] text-slate-400">
                  {sol === "sample" ? "Measure Potability pH" : "Calibrate Electrode"}
                </div>
              </button>
            ))}
          </>
        )}
      </div>

      {/* Drawer Footer Reset */}
      <div className="p-3 border-t border-slate-800 flex justify-between items-center text-xs font-mono">
        <button
          onClick={() => onAction("RESET_SUBPART")}
          className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
        >
          <span>↺</span>
          <span>Reset Bench</span>
        </button>
        <span className="text-[10px] text-slate-500">BCHY101P</span>
      </div>
    </aside>
  );
};
