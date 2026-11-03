"use client";

import React from "react";
import { Exp1Subpart } from "@/types/workbench";
import { SimulationContext } from "@/lib/simulation/types";
import { BuretteStandV2 } from "../apparatus/v2/BuretteStandV2";
import { FlaskStirrerV2 } from "../apparatus/v2/FlaskStirrerV2";
import { ConductivityMeter } from "../apparatus/ConductivityMeter";
import { Nephelometer } from "../apparatus/Nephelometer";
import { PHMeter } from "../apparatus/PHMeter";

interface LabBenchProps {
  subpart: Exp1Subpart;
  simulationState: SimulationContext;
  onAction: (actionType: string, payload?: any) => void;
  className?: string;
}

export const LabBench: React.FC<LabBenchProps> = ({
  subpart,
  simulationState,
  onAction,
  className = "",
}) => {
  const hardness = simulationState.hardness;
  const chloride = simulationState.chloride;
  const sulfate = simulationState.sulfate;
  const tds = simulationState.tds;
  const ph = simulationState.ph;

  return (
    <div
      className={`relative w-full flex-1 min-h-[520px] lg:min-h-[600px] bg-gradient-to-b from-slate-950 via-slate-900 to-lab-950 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center overflow-hidden shadow-2xl ${className}`}
    >
      {/* Bench Texture & Grid Line Markings */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />

      {/* Bench Surface Edge & Shadow */}
      <div className="absolute bottom-6 left-8 right-8 h-3.5 bg-slate-900 rounded-lg border-t border-slate-700/60 shadow-2xl" />

      {/* Top Floating Stage Title */}
      <div className="absolute top-4 left-6 flex items-center gap-2 font-mono text-xs z-10">
        <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-bold tracking-wider">
          BENCH WORKSPACE
        </span>
        <span className="text-slate-400 text-[11px]">
          {subpart === "hardness" && (hardness.mode === "standardization" ? "Titration I: Standardization of EDTA" : "Titration II: Sample Hardness")}
          {subpart === "chloride" && "Conductometric Chloride Precipitation (AgNO₃)"}
          {subpart === "sulfate" && "Sulfate Turbidity & Nephelometric Calibration"}
          {subpart === "tds" && "Electrical Conductivity & TDS Determination"}
          {subpart === "ph" && "Potentiometric pH Measurement & Buffer Calibration"}
        </span>
      </div>

      {/* CENTERPIECE 1: HARDNESS TITRATION BENCH (Burette directly over Flask & Stirrer) */}
      {subpart === "hardness" && (
        <div className="relative z-10 flex flex-col items-center gap-0 mt-4">
          {/* Burette Assembly Clamped Above */}
          <div className="relative z-20">
            <BuretteStandV2
              volumeDispensed={hardness.buretteReadingMl}
              maxVolume={50}
              titrantName="0.01 N EDTA Solution"
              isDispensing={hardness.phase === "TITRATING"}
              onDispenseAmount={(amt) => onAction("HARDNESS_DISPENSE_EDTA", amt)}
            />
          </div>

          {/* Magnetic Stirrer and Flask Positioned Directly Underneath Tip */}
          <div className="relative z-10 -mt-16">
            <FlaskStirrerV2
              fillVolumeMl={hardness.liquidVolumeMl}
              liquidColor={hardness.liquidColor}
              isStirring={hardness.isStirring}
              isReceivingStream={hardness.phase === "TITRATING"}
              onToggleStirrer={() => onAction("HARDNESS_TOGGLE_STIRRER")}
            />
          </div>

          {/* Quick Record Reading Button floating at the flask base */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => onAction("HARDNESS_RECORD_TRIAL")}
              disabled={hardness.buretteReadingMl === 0}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold shadow-lg transition-all flex items-center gap-2 ${
                hardness.buretteReadingMl > 0
                  ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/50 scale-100 hover:scale-105"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <span>📝</span>
              <span>Record Titre Reading: {hardness.buretteReadingMl.toFixed(2)} mL</span>
            </button>
          </div>
        </div>
      )}

      {/* CENTERPIECE 2: CHLORIDE CONDUCTOMETRY BENCH */}
      {subpart === "chloride" && (
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-around gap-8 w-full max-w-4xl px-4">
          {/* Burette with AgNO3 */}
          <div className="flex flex-col items-center">
            <BuretteStandV2
              volumeDispensed={chloride.buretteReadingMl}
              maxVolume={25}
              titrantName="0.01 N AgNO3 Solution"
              onDispenseAmount={(amt) => onAction("CHLORIDE_DISPENSE_AGNO3", amt)}
            />
          </div>

          {/* Beaker with Pt Electrode & Digital Conductometer */}
          <div className="flex flex-col items-center gap-4">
            <ConductivityMeter
              readingValue={chloride.conductanceMhos}
              unit="mS/cm"
              cellConstant={1.0}
              isPowered={true}
              isProbeDipped={chloride.isProbeDipped}
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => onAction("CHLORIDE_DISPENSE_AGNO3", 1.0)}
                disabled={chloride.buretteReadingMl >= 20 || !chloride.isProbeDipped}
                className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all shadow ${
                  chloride.isProbeDipped && chloride.buretteReadingMl < 20
                    ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                + Add 1.0 mL AgNO₃ Titrant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CENTERPIECE 3: SULFATE NEPHELOMETER BENCH */}
      {subpart === "sulfate" && (
        <div className="relative z-10 flex flex-col items-center gap-6 max-w-xl w-full">
          <Nephelometer
            turbidityNtu={
              sulfate.selectedFlaskId === 7
                ? sulfate.unknownNtu ?? 0.0
                : sulfate.measuredTurbidityNtu[sulfate.selectedFlaskId] ?? 0.0
            }
            sampleLabel={
              sulfate.selectedFlaskId === 7
                ? "Flask 7 (Unknown Water Sample)"
                : `Flask ${sulfate.selectedFlaskId} (${(sulfate.selectedFlaskId - 1) * 50} ppm)`
            }
            isCalibrated={sulfate.isZeroCalibrated}
            onZeroAdjust={() => onAction("SULFATE_ZERO_CALIBRATE")}
          />

          <div className="flex items-center gap-3">
            <button
              onClick={() => onAction("SULFATE_MEASURE_UNKNOWN")}
              disabled={!sulfate.isZeroCalibrated}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
                sulfate.isZeroCalibrated
                  ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              📊 Measure Unknown Water Sample
            </button>
          </div>
        </div>
      )}

      {/* CENTERPIECE 4: TDS ESTIMATION BENCH */}
      {subpart === "tds" && (
        <div className="relative z-10 flex flex-col items-center gap-6 max-w-xl w-full">
          <ConductivityMeter
            readingValue={tds.isProbeDipped ? tds.rawEcMicroSiemens : 0}
            unit="µS/cm"
            cellConstant={1.0}
            isPowered={true}
            isProbeDipped={tds.isProbeDipped}
            onTogglePower={() => onAction("TDS_DIP_PROBE", !tds.isProbeDipped)}
          />

          <div className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-2 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span>Proportionality Constant kₑ:</span>
              <strong className="text-cyan-400 text-sm">{tds.keFactor.toFixed(2)}</strong>
            </div>
            <input
              type="range"
              min="0.55"
              max="0.85"
              step="0.01"
              value={tds.keFactor}
              onChange={(e) => onAction("TDS_SET_KE", parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.55 (Low salinity)</span>
              <span className="text-cyan-400 font-bold">0.70 (Standard Natural Waters)</span>
              <span>0.85 (High sulfate/salt)</span>
            </div>
          </div>
        </div>
      )}

      {/* CENTERPIECE 5: pH MEASUREMENT BENCH */}
      {subpart === "ph" && (
        <div className="relative z-10 flex flex-col items-center gap-6 max-w-xl w-full">
          <PHMeter
            phValue={ph.measuredPh ?? 0.0}
            temperatureC={ph.temperatureC}
            isCalibrated={ph.calibratedPoints.length >= 2}
            calibrationPoints={ph.calibratedPoints}
            onCalibratePoint={(pt) => onAction("PH_CALIBRATE_POINT", pt)}
          />

          <div className="flex items-center gap-2">
            {(["buffer4", "buffer7", "buffer9", "sample"] as const).map((tgt) => (
              <button
                key={tgt}
                onClick={() => onAction("PH_SET_ELECTRODE", tgt)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${
                  ph.electrodeState === tgt
                    ? "bg-cyan-600 text-white font-bold shadow-md"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                }`}
              >
                {tgt === "sample" ? "Water Sample" : `Buffer ${tgt.replace("buffer", "")}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
