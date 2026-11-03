"use client";

import React, { useState, useReducer } from "react";
import Link from "next/link";
import { ExperimentMetadata } from "@/types/experiment";
import { Exp1Subpart, LabMode } from "@/types/workbench";
import { createInitialSimulationContext, waterSimulationReducer } from "@/lib/simulation/water-fsm";
import { LabBench } from "./LabBench";
import { EquipmentDrawer } from "./EquipmentDrawer";
import { ContextualInspector } from "./ContextualInspector";
import { ObservationNotebook } from "./ObservationNotebook";
import { Exp1Demo } from "../experiments/exp1/Exp1Demo";

interface LabWorkspaceProps {
  experiment: ExperimentMetadata;
}

export const LabWorkspace: React.FC<LabWorkspaceProps> = ({ experiment }) => {
  const [mode, setMode] = useState<LabMode>("practice");
  const [subpart, setSubpart] = useState<Exp1Subpart>("hardness");

  // Authoritative simulation context managed by FSM
  const [simulationState, dispatch] = useReducer(
    waterSimulationReducer,
    2026,
    createInitialSimulationContext
  );

  // UI Drawers & Panels state (on compact viewports, inspector starts closed to give full focus to bench)
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState<boolean>(false);

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => {
      const next = !prev;
      if (next && typeof window !== "undefined" && window.innerWidth < 1024) {
        setIsInspectorOpen(false);
      }
      return next;
    });
  };

  const toggleInspector = () => {
    setIsInspectorOpen((prev) => {
      const next = !prev;
      if (next && typeof window !== "undefined" && window.innerWidth < 1024) {
        setIsDrawerOpen(false);
      }
      return next;
    });
  };

  const handleAction = (type: string, payload?: any) => {
    dispatch({ type, payload });
  };

  const handleSwitchSubpart = (sp: Exp1Subpart) => {
    setSubpart(sp);
    dispatch({ type: "SWITCH_SUBPART", payload: sp });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* 1. TOP LAB BAR */}
      <header className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between font-mono text-xs z-30 shrink-0">
        {/* Left: Experiment Title & Exit */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
            title="Return to Experiment Library"
          >
            ← Exit
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100">{experiment.shortTitle}</span>
              <span className="hidden sm:inline-block text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800">
                EXP {experiment.number}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 hidden md:inline">
              BCHY101P • pp. {experiment.source.pageStart}–{experiment.source.pageEnd}
            </span>
          </div>
        </div>

        {/* Center: Subpart Selector Navigation */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          {(["hardness", "chloride", "sulfate", "tds", "ph"] as const).map((sp) => (
            <button
              key={sp}
              onClick={() => handleSwitchSubpart(sp)}
              className={`px-3 py-1 rounded-lg transition-all capitalize ${
                subpart === sp
                  ? "bg-cyan-600 text-white font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {sp}
            </button>
          ))}
        </div>

        {/* Right: Mode Switch & Panel Toggles */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setMode("practice")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                mode === "practice" ? "bg-cyan-950 border border-cyan-600 text-cyan-300" : "text-slate-400 hover:text-white"
              }`}
            >
              🧪 Practice
            </button>
            <button
              onClick={() => setMode("demo")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                mode === "demo" ? "bg-cyan-950 border border-cyan-600 text-cyan-300" : "text-slate-400 hover:text-white"
              }`}
            >
              🎬 Demo
            </button>
          </div>

          {/* Drawer Toggles for Mobile / Responsive */}
          <button
            onClick={toggleDrawer}
            className={`p-1.5 rounded-lg border text-xs lg:hidden ${
              isDrawerOpen ? "bg-cyan-950 border-cyan-600 text-cyan-300" : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
            title="Toggle Reagents & Tools Drawer"
          >
            🧰
          </button>

          <button
            onClick={toggleInspector}
            className={`p-1.5 rounded-lg border text-xs lg:hidden ${
              isInspectorOpen ? "bg-cyan-950 border-cyan-600 text-cyan-300" : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
            title="Toggle Contextual Inspector"
          >
            🔬
          </button>

          {/* Notebook Toggle Button */}
          <button
            onClick={() => setIsNotebookOpen(!isNotebookOpen)}
            className={`px-3 py-1 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-all ${
              isNotebookOpen
                ? "bg-amber-950/80 border-amber-600 text-amber-300"
                : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
            }`}
          >
            <span>📓</span>
            <span className="hidden sm:inline">Notebook</span>
          </button>
        </div>
      </header>

      {/* Subpart mobile row */}
      <div className="lg:hidden flex items-center gap-1 bg-slate-900 border-b border-slate-800 px-3 py-1 overflow-x-auto text-[11px] font-mono shrink-0">
        {(["hardness", "chloride", "sulfate", "tds", "ph"] as const).map((sp) => (
          <button
            key={sp}
            onClick={() => handleSwitchSubpart(sp)}
            className={`px-2.5 py-1 rounded capitalize whitespace-nowrap ${
              subpart === sp ? "bg-cyan-600 text-white font-bold" : "text-slate-400"
            }`}
          >
            {sp}
          </button>
        ))}
      </div>

      {/* 2. MAIN THREE-PANE LABORATORY WORKSPACE */}
      <div className="flex-1 relative flex overflow-hidden">
        {mode === "practice" ? (
          <>
            {/* Left Equipment Drawer */}
            <EquipmentDrawer
              subpart={subpart}
              simulationState={simulationState}
              onAction={handleAction}
              isOpen={isDrawerOpen}
              onToggle={toggleDrawer}
            />

            {/* Center Stage: Physical Lab Bench */}
            <main className="flex-1 flex flex-col p-3 sm:p-4 overflow-y-auto pb-16">
              <LabBench
                subpart={subpart}
                simulationState={simulationState}
                onAction={handleAction}
              />
            </main>

            {/* Right Contextual Inspector */}
            <ContextualInspector
              subpart={subpart}
              simulationState={simulationState}
              isOpen={isInspectorOpen}
              onToggle={toggleInspector}
            />
          </>
        ) : (
          /* Guided Demonstration Mode */
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-16">
            <Exp1Demo />
          </main>
        )}
      </div>

      {/* 3. BOTTOM COLLAPSIBLE OBSERVATION NOTEBOOK */}
      <ObservationNotebook
        subpart={subpart}
        simulationState={simulationState}
        isOpen={isNotebookOpen}
        onToggle={() => setIsNotebookOpen(!isNotebookOpen)}
      />
    </div>
  );
};
