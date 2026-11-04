"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EXPERIMENTS_REGISTRY } from "@/data/experiments-registry";
import { ExperimentMetadata } from "@/types/experiment";

export default function HomePage() {
  const [activePreviewModality, setActivePreviewModality] = useState<"hardness" | "chloride" | "sulfate" | "tds" | "ph">("hardness");
  const [stirrerActive, setStirrerActive] = useState<boolean>(true);
  const [colorStage, setColorStage] = useState<"winered" | "purple" | "blue">("winered");

  // Group experiments into the 4 physical laboratory bays
  const bays = [
    {
      id: "bay-1",
      code: "BAY A // METROLOGY",
      title: "Environmental & Analytical Metrology",
      description: "Quantitative chelatometry, argentometric conductometry, nephelometric turbidimetry, and potentiometric water quality analysis.",
      experiments: EXPERIMENTS_REGISTRY.filter((e) => e.number === 1),
    },
    {
      id: "bay-2",
      code: "BAY B // NANOMATERIALS",
      title: "Nanomaterials & Crystal Engineering",
      description: "Eggshell hydroxyapatite biowaste valorization, cuprous oxide nanostructures, and sol-gel aluminum-doped zinc oxide synthesis.",
      experiments: EXPERIMENTS_REGISTRY.filter((e) => [2, 7, 8].includes(e.number)),
    },
    {
      id: "bay-3",
      code: "BAY C // PHOTOVOLTAICS & ENERGY",
      title: "Photovoltaic & Energy Conversion",
      description: "Natural anthocyanin dye-sensitized solar cells, magnesium-air saline emergency batteries, and lithium-ion state-of-charge characterization.",
      experiments: EXPERIMENTS_REGISTRY.filter((e) => [3, 6, 10].includes(e.number)),
    },
    {
      id: "bay-4",
      code: "BAY D // KINETICS & ELECTROCHEM",
      title: "Chemical Kinetics & Thermodynamics",
      description: "Zinc-copper galvanic cell thermodynamics, acid-catalyzed ester hydrolysis kinetics, and Rhodamine B heterogeneous UV/H2O2 photocatalysis.",
      experiments: EXPERIMENTS_REGISTRY.filter((e) => [4, 5, 9].includes(e.number)),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-12 font-sans text-enamel-100">
      {/* 1. ATRIUM STATUS BAR: Scientific Instrumentation Facility */}
      <section className="bg-bench-900 border border-bench-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-instrument-phosphor animate-pulse" />
            <span className="font-bold text-white tracking-wide">DIGITAL TWIN ATRIUM</span>
          </div>
          <span className="text-bench-600 hidden sm:inline">|</span>
          <span className="text-enamel-400">VIT CHENNAI • SAS CHEMISTRY</span>
          <span className="text-bench-600 hidden sm:inline">|</span>
          <span className="text-instrument-amber">BCHY101P CURRICULUM (2026–27)</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-enamel-400">
          <div className="bg-bench-850 px-2.5 py-1 rounded border border-bench-750 flex items-center gap-1.5">
            <span className="text-enamel-500">STANDARDS:</span>
            <span className="text-enamel-200 font-bold">ASTM E288 / BIS 10500</span>
          </div>
          <div className="bg-bench-850 px-2.5 py-1 rounded border border-bench-750 flex items-center gap-1.5">
            <span className="text-enamel-500">STATIONS:</span>
            <span className="text-instrument-phosphor font-bold">1 ACTIVE // 9 SPEC</span>
          </div>
        </div>
      </section>

      {/* 2. CENTERPIECE: INTERACTIVE DIGITAL TWIN WORKBENCH CONSOLE */}
      <section className="relative rounded-3xl bg-bench-900 border border-bench-750 overflow-hidden shadow-2xl">
        {/* Subtle benchtop grid texture overlay */}
        <div className="absolute inset-0 bg-bench-grid opacity-30 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10">
          {/* Left Column: Workstation Control Deck & Specifications */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-0.5 rounded bg-emerald-950/80 text-instrument-phosphor border border-emerald-800 font-bold">
                  ● ACTIVE DIGITAL TWIN
                </span>
                <span className="text-enamel-400">STATION // 01-BCHY101P</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans">
                Comprehensive Water Quality & Metrology Workstation
              </h1>

              <p className="text-sm text-enamel-300 leading-relaxed font-sans">
                A multi-instrument virtual wet-laboratory executing simultaneous chelatometric hardness titration, conductometric chloride determination, sulfate turbidimetry, and potentiometric pH analysis according to BIS 10500:2012 specifications.
              </p>
            </div>

            {/* Interactive Modality Selector */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="text-[11px] font-mono text-enamel-400 flex items-center justify-between">
                <span>SELECT APPARATUS CONFIGURATION:</span>
                <span className="text-instrument-amber font-bold">Class-A Glassware Calibrated</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
                {[
                  { id: "hardness", label: "Hardness Titration", sub: "EDTA / EBT" },
                  { id: "chloride", label: "Chloride Cond.", sub: "AgNO₃ Cell" },
                  { id: "sulfate", label: "Sulfate Turbidity", sub: "Nephelometer" },
                  { id: "tds", label: "Total Solids", sub: "kₑ = 0.70" },
                  { id: "ph", label: "Potentiometric pH", sub: "Glass Elect." },
                ].map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => setActivePreviewModality(mod.id as any)}
                    className={`p-2 rounded-xl text-left border transition-all flex flex-col ${
                      activePreviewModality === mod.id
                        ? "bg-bench-800 border-instrument-amber text-white shadow-md ring-1 ring-instrument-amber/30"
                        : "bg-bench-850 border-bench-700 text-enamel-400 hover:text-enamel-200 hover:border-bench-650"
                    }`}
                  >
                    <span className="font-bold text-[11px] truncate">{mod.label}</span>
                    <span className="text-[9px] text-enamel-500 font-sans">{mod.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Workstation Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-bench-800">
              <Link
                href="/experiments/exp-1"
                className="px-6 py-3.5 rounded-xl bg-instrument-amber hover:bg-amber-500 text-slate-950 font-mono font-bold text-xs sm:text-sm shadow-xl shadow-amber-950/50 transition-all flex items-center gap-2.5 active:scale-95"
              >
                <span>Deploy Station 01 Digital Twin</span>
                <span className="text-base">→</span>
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  href="/experiments/exp-1"
                  className="px-4 py-3 rounded-xl bg-bench-850 hover:bg-bench-800 border border-bench-700 text-enamel-200 font-mono text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Guided Demo Mode</span>
                </Link>
                <a
                  href="https://cpcb.nic.in/wqstandards/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-xl bg-bench-850 hover:bg-bench-800 border border-bench-700 text-enamel-400 hover:text-white font-mono text-xs transition-colors"
                >
                  BIS 10500 Standards ↗
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Physical Apparatus Schematic & Live Simulation Preview */}
          <div className="lg:col-span-5 bg-bench-950 border border-bench-700 rounded-2xl p-5 flex flex-col justify-between shadow-inner relative overflow-hidden">
            {/* Console Header */}
            <div className="flex items-center justify-between pb-3 border-b border-bench-800 font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-instrument-phosphor animate-ping" />
                <span className="text-white font-bold">BENCHTOP SCHEMATIC</span>
              </div>
              <span className="text-enamel-400">STATION // PREVIEW</span>
            </div>

            {/* Interactive Apparatus Visualizer */}
            <div className="py-6 flex flex-col items-center justify-center relative min-h-[260px]">
              {activePreviewModality === "hardness" && (
                <div className="flex flex-col items-center gap-1">
                  {/* Burette Column */}
                  <div className="w-4 h-28 rounded-t bg-slate-900 border border-slate-600 relative overflow-hidden flex flex-col justify-end">
                    <div className="w-full h-16 bg-sky-400/40 border-t border-sky-300 relative transition-all duration-300">
                      <div className="w-full h-1 bg-sky-200/80 rounded-full" />
                    </div>
                  </div>
                  {/* Stopcock Key */}
                  <div className="w-8 h-2 rounded bg-instrument-amber border border-amber-600 shadow" />
                  {/* Dripping stream */}
                  <div className="w-0.5 h-6 bg-sky-400/60 animate-pulse" />

                  {/* 250mL Flask on Magnetic Stirrer */}
                  <div className="relative -mt-1 flex flex-col items-center">
                    <div className="w-24 h-20 relative flex flex-col justify-end items-center">
                      {/* Flask glass outline */}
                      <svg width="96" height="80" viewBox="0 0 96 80" className="absolute inset-0">
                        <polygon
                          points="36,4 60,4 60,20 88,72 8,72 36,20"
                          fill="rgba(255,255,255,0.03)"
                          stroke="#94a3b8"
                          strokeWidth="1.5"
                        />
                      </svg>
                      {/* Liquid with Stoichiometric Color */}
                      <div
                        className={`w-16 h-8 rounded-b-xl transition-all duration-500 mb-2 flex items-center justify-center ${
                          colorStage === "winered"
                            ? "bg-rose-900/80 shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                            : colorStage === "purple"
                            ? "bg-purple-900/80 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                            : "bg-sky-600/80 shadow-[0_0_15px_rgba(2,132,199,0.5)]"
                        }`}
                      >
                        {stirrerActive && (
                          <div className="w-3 h-1 bg-white/70 rounded-full animate-stir" />
                        )}
                      </div>
                    </div>

                    {/* Magnetic Stirrer Base with RPM Controller */}
                    <div className="w-32 py-2 px-3 rounded-lg bg-bench-850 border border-bench-700 flex items-center justify-between font-mono text-[10px]">
                      <span className="text-enamel-400">STIRRER:</span>
                      <button
                        onClick={() => setStirrerActive(!stirrerActive)}
                        className={`px-2 py-0.5 rounded font-bold ${
                          stirrerActive ? "bg-instrument-phosphor text-slate-950" : "bg-bench-750 text-enamel-400"
                        }`}
                      >
                        {stirrerActive ? "600 RPM" : "OFF"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewModality === "chloride" && (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-44 p-4 rounded-xl bg-bench-900 border border-bench-700 shadow-xl flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-enamel-400">DIGITAL CONDUCTOMETER</span>
                    <div className="bg-black/90 px-4 py-2 rounded-lg border border-bench-750 font-mono text-lg font-bold text-instrument-phosphor led-glow-green">
                      212.7 µS/cm
                    </div>
                    <span className="text-[9px] text-enamel-500 font-mono">Cell Const k = 1.0 cm⁻¹</span>
                  </div>
                </div>
              )}

              {activePreviewModality === "sulfate" && (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-44 p-4 rounded-xl bg-bench-900 border border-bench-700 shadow-xl flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-enamel-400">DIGITAL NEPHELOMETER</span>
                    <div className="bg-black/90 px-4 py-2 rounded-lg border border-bench-750 font-mono text-lg font-bold text-instrument-sky">
                      175.4 NTU
                    </div>
                    <span className="text-[9px] text-enamel-500 font-mono">BaSO₄ Colloidal Suspension</span>
                  </div>
                </div>
              )}

              {activePreviewModality === "tds" && (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-44 p-4 rounded-xl bg-bench-900 border border-bench-700 shadow-xl flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-enamel-400">TOTAL DISSOLVED SOLIDS</span>
                    <div className="bg-black/90 px-4 py-2 rounded-lg border border-bench-750 font-mono text-lg font-bold text-instrument-amber led-glow-amber">
                      455.0 mg/L
                    </div>
                    <span className="text-[9px] text-enamel-500 font-mono">BIS Limit: 500 mg/L</span>
                  </div>
                </div>
              )}

              {activePreviewModality === "ph" && (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-44 p-4 rounded-xl bg-bench-900 border border-bench-700 shadow-xl flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-enamel-400">BENCHTOP pH METER</span>
                    <div className="bg-black/90 px-4 py-2 rounded-lg border border-bench-750 font-mono text-lg font-bold text-emerald-400 led-glow-green">
                      7.84 pH
                    </div>
                    <span className="text-[9px] text-enamel-500 font-mono">Temp: 25.0 °C (ATC)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Color Swatch Tester (Interactive Stoichiometry) */}
            <div className="pt-3 border-t border-bench-800 flex items-center justify-between font-mono text-[10px]">
              <span className="text-enamel-400">EQUILIBRIUM:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setColorStage("winered")}
                  className={`px-2 py-0.5 rounded text-[9px] ${
                    colorStage === "winered" ? "bg-rose-950 text-rose-300 border border-rose-700 font-bold" : "text-enamel-500"
                  }`}
                >
                  [Ca-EBT] Wine
                </button>
                <button
                  onClick={() => setColorStage("purple")}
                  className={`px-2 py-0.5 rounded text-[9px] ${
                    colorStage === "purple" ? "bg-purple-950 text-purple-300 border border-purple-700 font-bold" : "text-enamel-500"
                  }`}
                >
                  Transitional
                </button>
                <button
                  onClick={() => setColorStage("blue")}
                  className={`px-2 py-0.5 rounded text-[9px] ${
                    colorStage === "blue" ? "bg-sky-950 text-sky-300 border border-sky-700 font-bold" : "text-enamel-500"
                  }`}
                >
                  [Free EBT] Blue
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SYLLABUS DIRECTORY: THE 4 PHYSICAL LABORATORY BAYS */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-bench-800 pb-4">
          <div>
            <div className="font-mono text-xs text-instrument-amber font-bold tracking-wider">
              FACILITY DIRECTORY // 10 EXPERIMENT STATIONS
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-sans mt-1">
              BCHY101P Engineering Chemistry Syllabus Bays
            </h2>
          </div>
          <p className="text-xs text-enamel-400 font-mono max-w-md">
            All 10 stations mapped directly to the 51-page VIT Chennai Lab Manual. Station 1 is active for hands-on simulation; Stations 2–10 provide curriculum specifications.
          </p>
        </div>

        {/* 4 Laboratory Bays */}
        <div className="flex flex-col gap-10">
          {bays.map((bay) => (
            <div key={bay.id} className="flex flex-col gap-4">
              {/* Bay Header */}
              <div className="flex items-center justify-between bg-bench-900/60 p-3.5 rounded-xl border border-bench-800 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-bench-800 text-enamel-200 border border-bench-700 font-bold">
                    {bay.code}
                  </span>
                  <span className="font-bold text-white text-sm font-sans">{bay.title}</span>
                </div>
                <span className="text-[11px] text-enamel-400 hidden md:inline">{bay.description}</span>
              </div>

              {/* Station Instrument Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {bay.experiments.map((exp) => (
                  <div
                    key={exp.id}
                    className="group bg-bench-900 border border-bench-750 hover:border-bench-600 rounded-2xl p-5 flex flex-col justify-between gap-5 transition-all shadow-md hover:shadow-xl relative overflow-hidden"
                  >
                    <div className="flex flex-col gap-3">
                      {/* Station ID Bar */}
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-instrument-amber font-bold">
                          STATION {exp.number.toString().padStart(2, "0")}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          exp.id === "exp-1"
                            ? "bg-emerald-950 text-instrument-phosphor border border-emerald-800"
                            : "bg-bench-850 text-enamel-400 border border-bench-700"
                        }`}>
                          {exp.id === "exp-1" ? "● ACTIVE DIGITAL TWIN" : "BLUEPRINT SPEC"}
                        </span>
                      </div>

                      {/* Station Title */}
                      <h3 className="text-base font-bold text-white group-hover:text-instrument-amber transition-colors leading-snug font-sans">
                        {exp.title}
                      </h3>

                      {/* Aim / Abstract */}
                      <p className="text-xs text-enamel-400 font-sans line-clamp-3 leading-relaxed">
                        {exp.aim}
                      </p>

                      {/* Equipment Manifest Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {exp.apparatus.slice(0, 3).map((app, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-bench-850 text-enamel-300 border border-bench-750 truncate max-w-[190px]"
                          >
                            {app.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-4 border-t border-bench-800 flex items-center justify-between font-mono text-xs">
                      <span className="text-[10px] text-enamel-500">
                        Manual pp. {exp.source.pageStart}–{exp.source.pageEnd}
                      </span>

                      <Link
                        href={`/experiments/${exp.id}`}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                          exp.id === "exp-1"
                            ? "bg-instrument-amber hover:bg-amber-500 text-slate-950 shadow"
                            : "bg-bench-800 hover:bg-bench-750 text-enamel-200 border border-bench-700"
                        }`}
                      >
                        <span>{exp.id === "exp-1" ? "Enter Workstation" : "View Blueprint"}</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SCIENTIFIC FIDELITY & PEDAGOGICAL INTEGRITY DOSSIER */}
      <section className="bg-bench-900 border border-bench-750 rounded-2xl p-6 sm:p-8 flex flex-col gap-4 font-mono text-xs">
        <div className="flex items-center gap-2 text-instrument-amber font-bold">
          <span>🛡️</span>
          <span>SCIENTIFIC SIMULATION MODEL INTEGRITY (ZERO FABRICATED METRICS)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] text-enamel-400 leading-relaxed font-sans pt-2">
          <div className="flex flex-col gap-1.5 bg-bench-950 p-4 rounded-xl border border-bench-800">
            <span className="font-bold font-mono text-white text-xs">1. Deterministic Equilibrium Engines</span>
            <p>
              Chelatometric titration curves, EDTA metal-ligand coordination constants, and ionic dissociation curves ([Ca-EBT]²⁺ → [Ca-EDTA]²⁻) are solved dynamically by unit-validated chemical equilibrium models.
            </p>
          </div>
          <div className="flex flex-col gap-1.5 bg-bench-950 p-4 rounded-xl border border-bench-800">
            <span className="font-bold font-mono text-white text-xs">2. Physical Volumetric Meniscus</span>
            <p>
              Direct apparatus manipulation enforces Class-A volumetric constraints (ASTM E288), progressive stopcock flow dynamics, continuous fluid levels, and real-time droplet generation.
            </p>
          </div>
          <div className="flex flex-col gap-1.5 bg-bench-950 p-4 rounded-xl border border-bench-800">
            <span className="font-bold font-mono text-white text-xs">3. Tolerance-Aware Educational Grading</span>
            <p>
              Observation tables and student calculations are evaluated against stoichiometric truth models with rigorous tolerance brackets (±1.5% for concordance, ±2% for ppm concentrations).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
