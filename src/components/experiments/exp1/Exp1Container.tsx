"use client";

import React, { useState } from "react";
import { PartAHardnessSim } from "./PartAHardnessSim";
import { PartBChlorideSim } from "./PartBChlorideSim";
import { PartCSulfateSim } from "./PartCSulfateSim";
import { PartDTdsSim } from "./PartDTdsSim";
import { PartEPalmPhSim } from "./PartEPalmPhSim";
import { Exp1Report } from "./Exp1Report";

interface Exp1ContainerProps {
  mode: "demo" | "practice" | "calculations" | "report";
}

export const Exp1Container: React.FC<Exp1ContainerProps> = ({ mode }) => {
  const [activeSubpart, setActiveSubpart] = useState<"A" | "B" | "C" | "D" | "E" | "report">("A");

  // Global shared state for water sample results across all 5 modalities
  const [measurements, setMeasurements] = useState({
    hardnessPpm: 420.0,
    chloridePpm: 212.7,
    tdsPpm: 476.0,
    sulfatePpm: 175.0,
    ph: 7.42,
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Subpart Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 font-mono text-xs">
        <button
          onClick={() => setActiveSubpart("A")}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubpart === "A"
              ? "bg-cyan-600 text-white font-bold shadow-sm"
              : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <span>Part A</span>
          <span className="text-[10px] opacity-80">EDTA Hardness</span>
        </button>

        <button
          onClick={() => setActiveSubpart("B")}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubpart === "B"
              ? "bg-cyan-600 text-white font-bold shadow-sm"
              : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <span>Part B</span>
          <span className="text-[10px] opacity-80">Chloride Conductometry</span>
        </button>

        <button
          onClick={() => setActiveSubpart("C")}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubpart === "C"
              ? "bg-cyan-600 text-white font-bold shadow-sm"
              : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <span>Part C</span>
          <span className="text-[10px] opacity-80">Sulfate Nephelometry</span>
        </button>

        <button
          onClick={() => setActiveSubpart("D")}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubpart === "D"
              ? "bg-cyan-600 text-white font-bold shadow-sm"
              : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <span>Part D</span>
          <span className="text-[10px] opacity-80">TDS Estimation</span>
        </button>

        <button
          onClick={() => setActiveSubpart("E")}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubpart === "E"
              ? "bg-cyan-600 text-white font-bold shadow-sm"
              : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <span>Part E</span>
          <span className="text-[10px] opacity-80">pH Measurement</span>
        </button>

        <button
          onClick={() => setActiveSubpart("report")}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ml-auto ${
            activeSubpart === "report"
              ? "bg-emerald-600 text-white font-bold shadow-sm"
              : "bg-slate-800/80 text-emerald-400 hover:bg-slate-700 border border-emerald-800/50"
          }`}
        >
          <span>📊 Final CPCB Report</span>
        </button>
      </div>

      {/* Render Active Subpart Simulator */}
      {activeSubpart === "A" && (
        <PartAHardnessSim
          onResultsGenerated={(res) =>
            setMeasurements((prev) => ({ ...prev, hardnessPpm: res.totalHardnessPpm }))
          }
        />
      )}

      {activeSubpart === "B" && (
        <PartBChlorideSim
          onResultsGenerated={(res) =>
            setMeasurements((prev) => ({ ...prev, chloridePpm: res.chloridePpm }))
          }
        />
      )}

      {activeSubpart === "C" && (
        <PartCSulfateSim
          onResultsGenerated={(res) =>
            setMeasurements((prev) => ({ ...prev, sulfatePpm: res.unknownPpm }))
          }
        />
      )}

      {activeSubpart === "D" && (
        <PartDTdsSim
          onResultsGenerated={(res) =>
            setMeasurements((prev) => ({ ...prev, tdsPpm: res.tdsPpm }))
          }
        />
      )}

      {activeSubpart === "E" && (
        <PartEPalmPhSim
          onResultsGenerated={(res) =>
            setMeasurements((prev) => ({ ...prev, ph: res.ph }))
          }
        />
      )}

      {activeSubpart === "report" && <Exp1Report measurements={measurements} />}
    </div>
  );
};

