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
import { DemoController } from "./DemoController";

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
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-bench-950 text-enamel-100 font-sans">
      {/* 1. TOP LAB BAR */}
      <header className="h-14 px-4 bg-bench-900 border-b border-bench-800 flex items-center justify-between font-mono text-xs z-30 shrink-0">
        {/* Left: Experiment Title & Exit */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-enamel-400 hover:text-white p-1 rounded-lg hover:bg-bench-850 transition-colors"
            title="Return to Experiment Library"
          >
            ← Atrium
          </Link>
          <div className="h-4 w-px bg-bench-800" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{experiment.shortTitle}</span>
              <span className="hidden sm:inline-block text-[10px] text-instrument-amber bg-bench-850 px-1.5 py-0.2 rounded border border-bench-700">
                STATION {experiment.number.toString().padStart(2, "0")}
              </span>
            </div>
            <span className="text-[10px] text-enamel-500 hidden md:inline">
              BCHY101P • pp. {experiment.source.pageStart}–{experiment.source.pageEnd}
            </span>
          </div>
        </div>

        {/* Center: Subpart Selector Navigation */}
        <div className="hidden lg:flex items-center gap-1 bg-bench-950 p-1 rounded-xl border border-bench-800">
          {(["hardness", "chloride", "sulfate", "tds", "ph"] as const).map((sp) => (
            <button
              key={sp}
              onClick={() => handleSwitchSubpart(sp)}
              className={`px-3 py-1 rounded-lg transition-all capitalize ${
                subpart === sp
                  ? "bg-instrument-amber text-slate-950 font-bold shadow-sm"
                  : "text-enamel-400 hover:text-white"
              }`}
            >
              {sp}
            </button>
          ))}
        </div>

        {/* Right: Mode Switch & Panel Toggles */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-bench-950 p-0.5 rounded-lg border border-bench-800">
            <button
              onClick={() => setMode("practice")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                mode === "practice" ? "bg-bench-800 border border-bench-700 text-instrument-amber font-bold" : "text-enamel-400 hover:text-white"
              }`}
            >
              Practice
            </button>
            <button
              onClick={() => setMode("demo")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                mode === "demo" ? "bg-bench-800 border border-bench-700 text-instrument-phosphor font-bold" : "text-enamel-400 hover:text-white"
              }`}
            >
              Demo
            </button>
          </div>

          {/* Drawer Toggles for Mobile / Responsive */}
          <button
            onClick={toggleDrawer}
            className={`p-1.5 rounded-lg border text-xs lg:hidden ${
              isDrawerOpen ? "bg-bench-800 border-bench-700 text-instrument-amber" : "bg-bench-900 border-bench-800 text-enamel-400"
            }`}
            title="Toggle Reagents & Tools Drawer"
          >
            Reagents
          </button>

          <button
            onClick={toggleInspector}
            className={`p-1.5 rounded-lg border text-xs lg:hidden ${
              isInspectorOpen ? "bg-bench-800 border-bench-700 text-instrument-sky" : "bg-bench-900 border-bench-800 text-enamel-400"
            }`}
            title="Toggle Contextual Inspector"
          >
            Inspector
          </button>

          {/* Notebook Toggle Button */}
          <button
            onClick={() => setIsNotebookOpen(!isNotebookOpen)}
            className={`px-3 py-1 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-all ${
              isNotebookOpen
                ? "bg-amber-950 border-amber-700 text-instrument-amber font-bold"
                : "bg-bench-850 hover:bg-bench-800 border-bench-750 text-enamel-300"
            }`}
          >
            <span>📓</span>
            <span className="hidden sm:inline">Notebook</span>
          </button>
        </div>
      </header>

      {/* Subpart mobile row */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto p-2 bg-bench-900 border-b border-bench-800 font-mono text-xs shrink-0">
        {(["hardness", "chloride", "sulfate", "tds", "ph"] as const).map((sp) => (
          <button
            key={sp}
            onClick={() => handleSwitchSubpart(sp)}
            className={`px-2.5 py-1 rounded capitalize whitespace-nowrap ${
              subpart === sp ? "bg-instrument-amber text-slate-950 font-bold" : "text-enamel-400"
            }`}
          >
            {sp}
          </button>
        ))}
      </div>

      {/* 2. MAIN THREE-PANE LABORATORY WORKSPACE (Unified for Practice & Demo) */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Left Equipment Drawer */}
        <EquipmentDrawer
          subpart={subpart}
          simulationState={simulationState}
          onAction={handleAction}
          isOpen={isDrawerOpen}
          onToggle={toggleDrawer}
        />

        {/* Center Stage: Physical Lab Bench */}
        <main className="flex-1 flex flex-col p-3 sm:p-4 overflow-y-auto pb-16 gap-3">
          {/* If Demo Mode, display Demo Controller at the top of the bench */}
          {mode === "demo" && (
            <DemoController
              subpart={subpart}
              simulationState={simulationState}
              onAction={handleAction}
              onSwitchSubpart={handleSwitchSubpart}
            />
          )}

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
