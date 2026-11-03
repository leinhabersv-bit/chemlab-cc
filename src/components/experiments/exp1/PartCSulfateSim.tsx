"use client";

import React, { useState } from "react";
import { Nephelometer } from "@/components/apparatus/Nephelometer";
import { calculateSulfateNephelometry, SulfateDataPoint } from "@/lib/science/water-analysis";
import { defaultPRNG } from "@/lib/prng";

interface PartCSulfateSimProps {
  onResultsGenerated?: (results: {
    slope: number;
    intercept: number;
    unknownNtu: number;
    unknownPpm: number;
  }) => void;
}

interface StandardFlask {
  id: number;
  label: string;
  nominalPpm: number;
  aliquotMl: number; // Volume of 1420 ppm Na2SO4 stock diluted to 100 mL
  turbidityNtu: number | null;
}

export const PartCSulfateSim: React.FC<PartCSulfateSimProps> = ({ onResultsGenerated }) => {
  // True unknown sulfate concentration in water sample (~175 ppm)
  const [trueUnknownPpm] = useState(() => defaultPRNG.addRelativeNoise(175, 0.02, 160, 190));
  
  // Calibration slope ~ 0.52 NTU per ppm, intercept ~ 1.5 NTU
  const [trueSlope] = useState(() => defaultPRNG.addRelativeNoise(0.52, 0.01));
  const [trueIntercept] = useState(() => defaultPRNG.addRelativeNoise(1.5, 0.05));

  const [flasks, setFlasks] = useState<StandardFlask[]>([
    { id: 1, label: "Flask 1 (Blank)", nominalPpm: 0, aliquotMl: 0, turbidityNtu: null },
    { id: 2, label: "Flask 2 (50 ppm)", nominalPpm: 50, aliquotMl: 3.5, turbidityNtu: null },
    { id: 3, label: "Flask 3 (100 ppm)", nominalPpm: 100, aliquotMl: 7.0, turbidityNtu: null },
    { id: 4, label: "Flask 4 (150 ppm)", nominalPpm: 150, aliquotMl: 10.5, turbidityNtu: null },
    { id: 5, label: "Flask 5 (200 ppm)", nominalPpm: 200, aliquotMl: 14.0, turbidityNtu: null },
    { id: 6, label: "Flask 6 (250 ppm)", nominalPpm: 250, aliquotMl: 17.5, turbidityNtu: null },
  ]);

  const [unknownNtu, setUnknownNtu] = useState<number | null>(null);
  const [selectedFlaskId, setSelectedFlaskId] = useState<number>(1);
  const [isCalibrated, setIsCalibrated] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Compute physical NTU for a given concentration
  const getExpectedNtu = (ppm: number): number => {
    if (ppm === 0) return 0.0;
    const raw = trueSlope * ppm + trueIntercept;
    return Number(defaultPRNG.addRelativeNoise(raw, 0.015, 0).toFixed(1));
  };

  const handleZeroAdjust = () => {
    setIsCalibrated(true);
    setFlasks((prev) =>
      prev.map((f) => (f.id === 1 ? { ...f, turbidityNtu: 0.0 } : f))
    );
  };

  const handleMeasureFlask = (flaskId: number) => {
    if (flaskId === 1) {
      handleZeroAdjust();
      return;
    }
    const flask = flasks.find((f) => f.id === flaskId);
    if (!flask) return;

    const ntu = getExpectedNtu(flask.nominalPpm);
    setFlasks((prev) =>
      prev.map((f) => (f.id === flaskId ? { ...f, turbidityNtu: ntu } : f))
    );
  };

  const handleMeasureUnknown = () => {
    const ntu = getExpectedNtu(trueUnknownPpm);
    setUnknownNtu(ntu);

    // If we have at least 3 standards measured, compute calibration
    const validStandards: SulfateDataPoint[] = flasks
      .filter((f) => f.nominalPpm > 0 && f.turbidityNtu !== null)
      .map((f) => ({ concentrationPpm: f.nominalPpm, turbidityNtu: f.turbidityNtu! }));

    if (validStandards.length >= 3) {
      const calc = calculateSulfateNephelometry(validStandards, ntu);
      onResultsGenerated?.({
        slope: calc.slope,
        intercept: calc.intercept,
        unknownNtu: ntu,
        unknownPpm: calc.unknownConcentrationPpm,
      });
    }
  };

  // Regression line calculation
  const validStandards: SulfateDataPoint[] = flasks
    .filter((f) => f.nominalPpm > 0 && f.turbidityNtu !== null)
    .map((f) => ({ concentrationPpm: f.nominalPpm, turbidityNtu: f.turbidityNtu! }));

  const regressionResult =
    validStandards.length >= 3 && unknownNtu !== null
      ? calculateSulfateNephelometry(validStandards, unknownNtu)
      : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
            PART C: NEPHELOMETRIC TURBIDITY ESTIMATION
          </span>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            Sulfate Precipitation: BaCl₂ + SO₄²⁻ → BaSO₄(s)↓ + 2 Cl⁻
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Calibrate with blank (Flask 1) to 0 NTU, then measure turbidity of standard solutions (50 to 250 ppm) and the unknown water sample to establish the calibration plot.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Quick measure all standards for student efficiency
              flasks.forEach((f) => handleMeasureFlask(f.id));
              handleMeasureUnknown();
            }}
            className="px-3 py-1.5 bg-lab-800 hover:bg-lab-700 border border-lab-700 text-slate-300 rounded-lg text-xs font-mono transition-all"
          >
            ⚡ Auto-Measure All
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Standard Preparation Rack & Instrument */}
        <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-inner">
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60 w-fit">
            NEPHELOMETRY WORKBENCH
          </span>

          <Nephelometer
            turbidityNtu={
              selectedFlaskId === 7
                ? unknownNtu ?? 0.0
                : flasks.find((f) => f.id === selectedFlaskId)?.turbidityNtu ?? 0.0
            }
            sampleLabel={
              selectedFlaskId === 7
                ? "Flask 7 (Unknown Water Sample)"
                : flasks.find((f) => f.id === selectedFlaskId)?.label
            }
            isCalibrated={isCalibrated}
            onZeroAdjust={handleZeroAdjust}
          />

          {/* Flask Selection Rack */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="text-xs font-mono font-bold text-slate-300 mb-2">
              SELECT FLASK TO LOAD INTO CUVETTE WELL:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {flasks.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedFlaskId(f.id);
                    handleMeasureFlask(f.id);
                  }}
                  className={`p-2 rounded border text-left transition-all ${
                    selectedFlaskId === f.id
                      ? "bg-amber-950/80 border-amber-600 text-amber-200"
                      : "bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="font-semibold">{f.label}</div>
                  <div className="text-[10px] text-slate-400">
                    {f.turbidityNtu !== null ? `${f.turbidityNtu.toFixed(1)} NTU` : "Not measured"}
                  </div>
                </button>
              ))}

              {/* Unknown Flask Button */}
              <button
                onClick={() => {
                  setSelectedFlaskId(7);
                  handleMeasureUnknown();
                }}
                className={`p-2 rounded border text-left col-span-2 transition-all ${
                  selectedFlaskId === 7
                    ? "bg-cyan-950/80 border-cyan-500 text-cyan-200"
                    : "bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300"
                }`}
              >
                <div className="font-semibold">Flask 7: Unknown Water Sample</div>
                <div className="text-[10px] text-cyan-400">
                  {unknownNtu !== null ? `${unknownNtu.toFixed(1)} NTU` : "Click to load and measure unknown"}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Center: Live Calibration Curve */}
        <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-200">
              CALIBRATION PLOT: TURBIDITY VS [SO₄²⁻]
            </span>
            {regressionResult && (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                R² = {regressionResult.rSquared.toFixed(4)}
              </span>
            )}
          </div>

          <div className="w-full h-64 bg-slate-900 rounded-xl p-2 border border-slate-800 relative">
            <svg viewBox="0 0 300 220" className="w-full h-full overflow-visible">
              {/* Axes */}
              <line x1="40" y1="190" x2="280" y2="190" stroke="#475569" strokeWidth="1.5" />
              <line x1="40" y1="20" x2="40" y2="190" stroke="#475569" strokeWidth="1.5" />

              <text x="160" y="212" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">
                Sulfate Concentration (ppm)
              </text>
              <text x="-105" y="16" fill="#94a3b8" fontSize="10" fontFamily="monospace" transform="rotate(-90)" textAnchor="middle">
                Turbidity (NTU)
              </text>

              {/* Ticks */}
              {[0, 50, 100, 150, 200, 250].map((c) => {
                const x = 40 + (c / 250) * 230;
                return (
                  <g key={c}>
                    <line x1={x} y1="190" x2={x} y2="195" stroke="#64748b" />
                    <text x={x} y="206" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
                      {c}
                    </text>
                  </g>
                );
              })}

              {[0, 40, 80, 120, 160].map((t) => {
                const y = 190 - (t / 160) * 160;
                return (
                  <g key={t}>
                    <line x1="35" y1={y} x2="40" y2={y} stroke="#64748b" />
                    <text x="32" y={y + 3} fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="end">
                      {t}
                    </text>
                  </g>
                );
              })}

              {/* Regression Line */}
              {regressionResult && (
                <line
                  x1={40}
                  y1={190 - (regressionResult.intercept / 160) * 160}
                  x2={40 + 230}
                  y2={190 - ((regressionResult.slope * 250 + regressionResult.intercept) / 160) * 160}
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
              )}

              {/* Plotted Standards */}
              {flasks
                .filter((f) => f.turbidityNtu !== null)
                .map((f, i) => {
                  const cx = 40 + (f.nominalPpm / 250) * 230;
                  const cy = 190 - (f.turbidityNtu! / 160) * 160;
                  return (
                    <circle
                      key={i}
                      cx={cx}
                      cy={cy}
                      r="4"
                      fill="#f59e0b"
                      stroke="#b45309"
                      strokeWidth="1.2"
                    />
                  );
                })}

              {/* Unknown Interpolation lines */}
              {regressionResult && unknownNtu !== null && (
                <g>
                  {/* Horizontal line from Y to curve */}
                  <line
                    x1="40"
                    y1={190 - (unknownNtu / 160) * 160}
                    x2={40 + (regressionResult.unknownConcentrationPpm / 250) * 230}
                    y2={190 - (unknownNtu / 160) * 160}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                  {/* Vertical line down to X */}
                  <line
                    x1={40 + (regressionResult.unknownConcentrationPpm / 250) * 230}
                    y1={190 - (unknownNtu / 160) * 160}
                    x2={40 + (regressionResult.unknownConcentrationPpm / 250) * 230}
                    y2="190"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                  <circle
                    cx={40 + (regressionResult.unknownConcentrationPpm / 250) * 230}
                    cy={190 - (unknownNtu / 160) * 160}
                    r="5"
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </g>
              )}
            </svg>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            {regressionResult ? (
              <span className="text-emerald-400">
                Fit equation: NTU = {regressionResult.slope.toFixed(3)} × [SO₄²⁻] +{" "}
                {regressionResult.intercept.toFixed(2)}
              </span>
            ) : (
              <span>Measure all 5 standards and unknown to build the linear calibration line.</span>
            )}
          </div>
        </div>

        {/* Right: Tabulation & Calculation */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <h4 className="text-xs font-mono font-bold text-slate-200 mb-2">
              CALIBRATION TABLE
            </h4>
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="py-1">Std (ppm)</th>
                  <th className="py-1">Turbidity (NTU)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {flasks.map((f) => (
                  <tr key={f.id}>
                    <td className="py-1">{f.nominalPpm}</td>
                    <td className="py-1 font-semibold text-amber-300">
                      {f.turbidityNtu !== null ? f.turbidityNtu.toFixed(1) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Scientific Calculation Card */}
          <div className="bg-lab-900/90 border border-cyan-800/60 rounded-xl p-4 text-xs font-mono text-slate-300 space-y-1.5">
            <div className="font-bold text-cyan-400 border-b border-lab-700 pb-1">
              SULFATE CONTENT
            </div>
            <div>
              Unknown Turbidity ={" "}
              <span className="text-amber-300 font-bold">
                {unknownNtu !== null ? `${unknownNtu.toFixed(1)} NTU` : "—"}
              </span>
            </div>
            <div>
              Calibration Slope m ={" "}
              <span className="text-cyan-300">
                {regressionResult ? regressionResult.slope.toFixed(4) : "—"}
              </span>
            </div>
            <div>
              Intercept c ={" "}
              <span className="text-cyan-300">
                {regressionResult ? regressionResult.intercept.toFixed(2) : "—"}
              </span>
            </div>
            <div className="pt-2 border-t border-lab-800 flex items-center justify-between">
              <span className="text-slate-400">SULFATE (PPM):</span>
              <span className="text-sm font-bold text-emerald-400">
                {regressionResult
                  ? `${regressionResult.unknownConcentrationPpm.toFixed(1)} ppm`
                  : "Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
