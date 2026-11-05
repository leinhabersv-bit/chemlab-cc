"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { observe, reading, volume, type EdtaState } from "@/lib/simulation/edta";

interface LiveReactionHUDProps {
  s: EdtaState;
  activeTool: "bench" | "burette" | "pipette" | "buffer" | "indicator" | "flask";
}

interface StepChemistry {
  stage: string;
  subhead: string;
  actionText: string;
  reactionEquation: string;
  scientificExplanation: string;
  keyRule: string;
  statusBadge: {
    label: string;
    bg: string;
    text: string;
  };
}

export const LiveReactionHUD: React.FC<LiveReactionHUDProps> = ({ s, activeTool }) => {
  const obs = observe(s);
  const buretteVal = reading(s);
  const flaskContents = s.vessels.flask.contents;
  const flaskVol = volume(s.vessels.flask);

  const getActiveChemistry = (): StepChemistry => {
    // 1. Initial Glassware inspection / Positioning
    if (!s.inspected || !s.positioned) {
      return {
        stage: "STAGE 0: APPARATUS SETUP",
        subhead: "Bench Assembly & Glassware Verification",
        actionText: !s.inspected ? "Inspect clean borosilicate glassware" : "Align Erlenmeyer flask under burette tip",
        reactionEquation: "\\text{Glassware Verification: } \\text{Grade A Volumetric Tolerances}",
        scientificExplanation:
          "Titrimetric accuracy requires clean glassware free of grease films. Droplets adhering to burette walls create meniscus distortion and systematic volume errors.",
        keyRule: "Inspect for unbroken meniscus lines and secure clamp positioning.",
        statusBadge: { label: "PREPARATION", bg: "bg-bench-800", text: "text-enamel-300" },
      };
    }

    // 2. Pipette conditioning & sample transfer
    if (flaskContents[s.sample] < 20) {
      if (volume(s.vessels.pipette) === 0) {
        return {
          stage: "STAGE 1: SAMPLE ALIQUOTING",
          subhead: `Aspirating 20.0 mL of ${s.sample.toUpperCase()} Water`,
          actionText: s.pipetteRinsed ? "Aspirate exactly 20.00 mL with volumetric pipette" : "Condition pipette with sample water",
          reactionEquation: "\\text{Ca}^{2+}\\text{(aq)} + \\text{Mg}^{2+}\\text{(aq)} \\quad [\\text{Dissolved Hardness Ions}]",
          scientificExplanation:
            `Conditioning with ${s.sample} water prevents residual wash droplets from diluting the aliquot. Volumetric pipettes deliver an exact 20.00 mL sample with ±0.03 mL precision.`,
          keyRule: "Touch pipette tip to side of receiving flask for 3 seconds after drainage.",
          statusBadge: { label: "PIPETTING", bg: "bg-sky-950", text: "text-instrument-sky" },
        };
      }
      return {
        stage: "STAGE 1: SAMPLE ALIQUOTING",
        subhead: "Dispensing 20.00 mL Sample Aliquot into Reaction Flask",
        actionText: "Transfer aliquot from pipette into 250 mL conical flask",
        reactionEquation: "\\text{Aliquot: } 20.00\\text{ mL } \\equiv \\text{Measured Hardness Sample}",
        scientificExplanation:
          "The aliquot provides a known liquid volume for titrimetric stoichiometric calculation. The calcium and magnesium ions remain uncomplexed in neutral solution.",
        keyRule: "Ensure entire 20.0 mL drains into flask. Never blow out the last drop held by capillarity.",
        statusBadge: { label: "TRANSFERRING", bg: "bg-sky-950", text: "text-instrument-sky" },
      };
    }

    // 3. Ammonia Buffer Addition (pH 10)
    if (flaskContents.buffer < 3) {
      return {
        stage: "STAGE 2: pH BUFFERING",
        subhead: "Addition of 4.0 mL NH₃–NH₄Cl Buffer Solution",
        actionText: "Add 4.0 mL Ammonia-Ammonium Chloride buffer to maintain pH ≈ 10",
        reactionEquation: "\\text{NH}_3 + \\text{H}_2\\text{O} \\rightleftharpoons \\text{NH}_4^+ + \\text{OH}^- \\quad (\\text{pH} \\approx 10.0)",
        scientificExplanation:
          "The EDTA chelation of Ca²⁺ and Mg²⁺ is pH-dependent. At pH 10, the EDTA anion (Y⁴⁻) is sufficiently deprotonated to form stable complexes, while Ca(OH)₂ precipitation is prevented.",
        keyRule: "Buffer must be added before indicator to ensure correct alkaline medium.",
        statusBadge: { label: "BUFFERING (pH 10)", bg: "bg-amber-950", text: "text-instrument-amber" },
      };
    }

    // 4. Indicator Addition (EBT)
    if (flaskContents.indicator < 0.1) {
      return {
        stage: "STAGE 3: INDICATOR INTRODUCTION",
        subhead: "Adding 3 Drops of Eriochrome Black T (EBT)",
        actionText: "Add 3 drops of 0.5% alcoholic EBT indicator",
        reactionEquation: "\\text{M}^{2+} + \\text{HIn}^{2-}\\text{ (blue)} \\xrightarrow{\\text{pH 10}} [\\text{M-In}]^-\\text{ (wine-red)} + \\text{H}^+",
        scientificExplanation:
          "EBT behaves as a metallochromic indicator. In buffered alkaline solution (pH 10), free EBT is sky-blue. When mixed with Ca²⁺/Mg²⁺, it forms a wine-red metal-indicator chelate complex.",
        keyRule: "Excess indicator obscures the subtle endpoint. Exactly 3 drops give optimal visual contrast.",
        statusBadge: { label: "COMPLEXING EBT", bg: "bg-rose-950", text: "text-rose-400" },
      };
    }

    // 5. Titration Progress & Endpoint Detection
    if (obs.colour === "steel blue") {
      return {
        stage: "STAGE 4: EQUIVALENCE POINT",
        subhead: "Stoichiometric Endpoint Confirmed (Pure Steel-Blue)",
        actionText: "Titration complete — record final meniscus reading and evaluate concordancy",
        reactionEquation: "[\\text{M-In}]^-\\text{ (wine-red)} + \\text{H}_2\\text{Y}^{2-} \\rightarrow [\\text{M-Y}]^{2-} + \\text{HIn}^{2-}\\text{ (steel-blue)} + \\text{H}^+",
        scientificExplanation:
          "Every trace of Ca²⁺ and Mg²⁺ has been extracted from the indicator by EDTA due to EDTA's far greater formation constant (log Kf = 10.7 vs 5.4). The liberated free indicator imparts pure steel-blue.",
        keyRule: "Record meniscus immediately with stopcock closed to 0.01 mL accuracy.",
        statusBadge: { label: "ENDPOINT REACHED ✓", bg: "bg-emerald-950", text: "text-instrument-phosphor" },
      };
    }

    if (obs.colour === "violet") {
      return {
        stage: "STAGE 4: NEAR ENDPOINT",
        subhead: "Transitional Violet Phase (~90–99% Titration)",
        actionText: "Crucial stage: close stopcock and titrate drop-by-drop with vigorous stirring",
        reactionEquation: "\\text{Partial Displacement: } [\\text{M-In}]^- \\gg [\\text{M-Y}]^{2-} + \\text{HIn}^{2-}\\text{ (mixed violet)}",
        scientificExplanation:
          "As EDTA binds the remaining free metal ions, the proportion of liberated blue indicator increases, mixing with remaining wine-red chelate to appear violet. The endpoint is 1–2 drops away.",
        keyRule: "Switch to single-drop additions. Stir 3 seconds between drops to observe complete mixing.",
        statusBadge: { label: "CRITICAL TRANSITION", bg: "bg-purple-950", text: "text-purple-300" },
      };
    }

    // Active titration in progress
    return {
      stage: "STAGE 4: ACTIVE TITRATION",
      subhead: "Disodium EDTA Addition into Stirring Sample",
      actionText: "Disodium EDTA chelation of divalent cations (Ca²⁺ and Mg²⁺)",
      reactionEquation: "\\text{Ca}^{2+} + \\text{H}_2\\text{Y}^{2-} \\rightarrow [\\text{Ca-Y}]^{2-} + 2\\text{H}^+ \\quad (\\log K_f = 10.7)",
      scientificExplanation:
        "Disodium EDTA functions as a hexadentate chelating ligand, wrapping divalent metal ions in an octahedral cage. Uncomplexed metal is progressively consumed while indicator remains wine-red.",
      keyRule: "Maintain continuous stirring so titrant is instantly homogenized throughout the solution.",
      statusBadge: { label: "TITRATING", bg: "bg-blue-950", text: "text-instrument-sky" },
    };
  };

  const chem = getActiveChemistry();

  return (
    <div className="w-full bg-bench-900/90 backdrop-blur-md rounded-2xl border border-bench-800 p-3 sm:p-4 shadow-xl overflow-hidden font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-bench-800/80">
        <div className="flex items-center gap-2.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border border-white/10 ${chem.statusBadge.bg} ${chem.statusBadge.text}`}
          >
            {chem.statusBadge.label}
          </span>
          <span className="text-xs font-mono text-enamel-400 font-semibold tracking-wide">
            {chem.stage}
          </span>
        </div>

        {/* Live Reaction Progress Telemetry */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-enamel-400">Delivered EDTA:</span>
            <strong className="text-instrument-amber font-bold">{buretteVal.toFixed(2)} mL</strong>
          </div>
          <div className="h-3 w-px bg-bench-750" />
          <div className="flex items-center gap-1.5">
            <span className="text-enamel-400">Flask Volume:</span>
            <strong className="text-white font-bold">{flaskVol.toFixed(1)} mL</strong>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={chem.stage + chem.actionText}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="mt-3 flex flex-col gap-2.5"
        >
          {/* Main Action & Scientific Subheading */}
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>{chem.subhead}</span>
            </h3>
            <p className="text-xs sm:text-sm text-enamel-300 mt-0.5 font-sans leading-relaxed">
              {chem.scientificExplanation}
            </p>
          </div>

          {/* Molecular Reaction Equation Banner */}
          <div className="bg-bench-950/80 rounded-xl px-3 py-2 border border-bench-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-instrument-amber font-bold text-[10px] uppercase tracking-wider">
                MOLECULAR EVENT:
              </span>
              <span className="text-instrument-sky text-[11px] sm:text-xs">
                {chem.reactionEquation}
              </span>
            </div>
            <div className="text-[10px] text-enamel-400 flex items-center gap-1 shrink-0">
              <span className="text-instrument-phosphor">●</span>
              <span>{chem.keyRule}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
