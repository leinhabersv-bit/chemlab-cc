import { SimulationContext } from "./types";
import { defaultPRNG, PRNG } from "../prng";
import { calculateTotalHardness, calculateChlorideContent, calculateTds, calculateSulfateNephelometry } from "../science/water-analysis";
import { Exp1Subpart } from "@/types/workbench";

export function createInitialSimulationContext(seed: number = 2026): SimulationContext {
  const prng = new PRNG(seed);

  // Physical targets with realistic laboratory variance
  const trueV1 = prng.addRelativeNoise(20.0, 0.01, 19.5, 20.5);
  const trueV2 = prng.addRelativeNoise(8.4, 0.015, 8.1, 8.7);
  const trueChlorideVeq = prng.addRelativeNoise(12.0, 0.015, 11.5, 12.5);
  const trueSulfatePpm = prng.addRelativeNoise(175.0, 0.02, 165.0, 185.0);
  const trueRawEc = prng.addRelativeNoise(680.0, 0.015, 650.0, 710.0);
  const trueSamplePh = prng.addRelativeNoise(7.42, 0.01, 7.20, 7.65);

  return {
    subpart: "hardness",
    hardness: {
      phase: "FLASK_EMPTY",
      mode: "standardization",
      trialIndex: 1,
      sampleVolumeMl: 0,
      hasAmmoniaBuffer: false,
      hasEbtIndicator: false,
      buretteReadingMl: 0,
      trueEndpointMl: trueV1,
      isStirring: true,
      liquidVolumeMl: 0,
      liquidColor: "transparent",
      reactionProgressPercent: 0,
      v1Concordant: null,
      v2Concordant: null,
      trialsV1: [],
      trialsV2: [],
    },
    chloride: {
      phase: "BEAKER_EMPTY",
      sampleVolumeMl: 0,
      dilutionWaterMl: 0,
      isProbeDipped: false,
      isStirring: true,
      buretteReadingMl: 0,
      trueEquivalenceMl: trueChlorideVeq,
      precipitateTurbidity: 0,
      conductanceMhos: 2.15,
      dataPoints: [{ volume: 0, conductance: 2.15 }],
      vEquivalence: null,
    },
    sulfate: {
      phase: "PREPARING_STANDARDS",
      selectedFlaskId: 1,
      isZeroCalibrated: false,
      trueUnknownPpm: trueSulfatePpm,
      measuredTurbidityNtu: {},
      unknownNtu: null,
      calculatedPpm: null,
    },
    tds: {
      phase: "PROBE_AIR",
      isProbeDipped: false,
      keFactor: 0.70,
      rawEcMicroSiemens: trueRawEc,
      measuredTdsPpm: null,
    },
    ph: {
      phase: "ELECTRODE_AIR",
      electrodeState: "air",
      calibratedPoints: [],
      trueSamplePh,
      measuredPh: null,
      temperatureC: 25.0,
    },
    isPaused: false,
    proceduralWarning: null,
    activeHint: "Pipette 20 mL of Standard Hard Water into the conical flask to begin EDTA standardization.",
  };
}

/**
 * Thermodynamic color calculation for EBT + EDTA reaction:
 * [Ca-EBT] (wine red) + EDTA -> [Ca-EDTA] + free EBT (steel blue at pH 10)
 */
export function calculateHardnessLiquidColor(
  buretteVol: number,
  endpoint: number,
  hasBuffer: boolean,
  hasIndicator: boolean,
  sampleVolume: number
): { color: string; progress: number } {
  if (sampleVolume === 0) return { color: "transparent", progress: 0 };
  if (!hasIndicator) return { color: "rgba(224, 242, 254, 0.4)", progress: 0 }; // clear water

  // Without ammonia buffer, EBT remains blue-violet uncomplexed at neutral pH
  if (!hasBuffer) return { color: "rgba(100, 80, 160, 0.7)", progress: 0 };

  const ratio = buretteVol / endpoint;
  const progress = Math.min(Math.max(ratio * 100, 0), 100);

  // Wine Red: rgb(136, 18, 38)
  // Transition Violet: rgb(105, 50, 110)
  // Steel Blue: rgb(40, 115, 175)
  if (ratio < 0.94) {
    return { color: "rgba(136, 18, 38, 0.92)", progress };
  } else if (ratio <= 1.02) {
    const t = (ratio - 0.94) / 0.08;
    const r = Math.round(136 + (40 - 136) * t);
    const g = Math.round(18 + (115 - 18) * t);
    const b = Math.round(38 + (175 - 38) * t);
    return { color: `rgba(${r}, ${g}, ${b}, 0.94)`, progress };
  } else {
    return { color: "rgba(40, 115, 175, 0.94)", progress: 100 };
  }
}

/**
 * State Transition Reducer for Experiment 1
 */
export function waterSimulationReducer(state: SimulationContext, action: { type: string; payload?: any }): SimulationContext {
  switch (action.type) {
    case "SWITCH_SUBPART": {
      const nextSubpart = action.payload as Exp1Subpart;
      return {
        ...state,
        subpart: nextSubpart,
        proceduralWarning: null,
      };
    }

    // --- PART A: HARDNESS ACTIONS ---
    case "HARDNESS_TOGGLE_STIRRER": {
      return {
        ...state,
        hardness: {
          ...state.hardness,
          isStirring: !state.hardness.isStirring,
        },
      };
    }

    case "HARDNESS_PIPETTE_SAMPLE": {
      if (state.hardness.sampleVolumeMl > 0) {
        return {
          ...state,
          proceduralWarning: "Empty the flask before adding another aliquot.",
        };
      }
      return {
        ...state,
        hardness: {
          ...state.hardness,
          phase: "SAMPLE_ADDED",
          sampleVolumeMl: 20,
          liquidVolumeMl: 20,
          liquidColor: "rgba(224, 242, 254, 0.4)",
        },
        proceduralWarning: null,
        activeHint: "Add 5 mL of Ammonia Buffer (pH 10) to maintain basic conditions.",
      };
    }

    case "HARDNESS_ADD_BUFFER": {
      if (state.hardness.sampleVolumeMl === 0) {
        return {
          ...state,
          proceduralWarning: "Pipette 20 mL of water sample into the flask before adding buffer.",
        };
      }
      if (state.hardness.hasAmmoniaBuffer) {
        return {
          ...state,
          proceduralWarning: "Buffer already added.",
        };
      }
      return {
        ...state,
        hardness: {
          ...state.hardness,
          phase: "BUFFER_ADDED",
          hasAmmoniaBuffer: true,
          liquidVolumeMl: state.hardness.liquidVolumeMl + 5,
        },
        proceduralWarning: null,
        activeHint: "Add 3 drops of Eriochrome Black-T (EBT) indicator to form the wine-red complex.",
      };
    }

    case "HARDNESS_ADD_INDICATOR": {
      if (!state.hardness.hasAmmoniaBuffer) {
        return {
          ...state,
          proceduralWarning: "Buffer pH 10 must be added before indicator to ensure proper chelate color.",
        };
      }
      if (state.hardness.hasEbtIndicator) {
        return {
          ...state,
          proceduralWarning: "Indicator already added.",
        };
      }
      return {
        ...state,
        hardness: {
          ...state.hardness,
          phase: "INDICATOR_ADDED",
          hasEbtIndicator: true,
          liquidColor: "rgba(136, 18, 38, 0.92)", // Wine Red
        },
        proceduralWarning: null,
        activeHint: "Dispense 0.01 N EDTA from the burette until the solution turns permanently steel blue.",
      };
    }

    case "HARDNESS_DISPENSE_EDTA": {
      const amount = action.payload as number;
      if (!Number.isFinite(amount) || amount <= 0 || amount > 50 - state.hardness.buretteReadingMl) {
        return {
          ...state,
          proceduralWarning: "Invalid titrant delivery.",
        };
      }
      if (state.hardness.sampleVolumeMl === 0) {
        return {
          ...state,
          proceduralWarning: "Conical flask is empty. Add water sample, buffer, and indicator before titrating.",
        };
      }
      if (!state.hardness.hasEbtIndicator) {
        return {
          ...state,
          proceduralWarning: "No indicator present! Add EBT indicator to detect endpoint color transition.",
        };
      }
      if (!state.hardness.isStirring) {
        return {
          ...state,
          proceduralWarning: "Mix the solution before dispensing.",
        };
      }

      const nextReading = Math.min(state.hardness.buretteReadingMl + amount, 50);
      const endpoint = state.hardness.trueEndpointMl;
      const { color, progress } = calculateHardnessLiquidColor(
        nextReading,
        endpoint,
        state.hardness.hasAmmoniaBuffer,
        state.hardness.hasEbtIndicator,
        state.hardness.sampleVolumeMl
      );

      const isEndpoint = nextReading >= endpoint;

      return {
        ...state,
        hardness: {
          ...state.hardness,
          phase: isEndpoint ? "ENDPOINT_REACHED" : "TITRATING",
          buretteReadingMl: nextReading,
          liquidVolumeMl: state.hardness.liquidVolumeMl + amount,
          liquidColor: color,
          reactionProgressPercent: progress,
        },
        proceduralWarning: null,
        activeHint: isEndpoint
          ? "Steel blue endpoint reached! Close stopcock and record concordant titre reading."
          : `Titrating: ${nextReading.toFixed(2)} mL dispensed. Observe color transition near endpoint.`,
      };
    }

    case "HARDNESS_RECORD_TRIAL": {
      const h = state.hardness;
      if (
        h.phase !== "ENDPOINT_REACHED" ||
        !h.hasAmmoniaBuffer ||
        !h.hasEbtIndicator ||
        !h.isStirring ||
        h.buretteReadingMl < 0.1
      ) {
        return {
          ...state,
          proceduralWarning: "Record only at a valid mixed endpoint.",
        };
      }
      const reading = Number(h.buretteReadingMl.toFixed(2));
      const isStd = h.mode === "standardization";

      if (isStd) {
        const updatedTrials = [...h.trialsV1, reading];
        const pair = updatedTrials.slice(-2);
        const concordant =
          pair.length === 2 && Math.abs(pair[0] - pair[1]) <= 0.1 + 1e-8
            ? (pair[0] + pair[1]) / 2
            : null;

        return {
          ...state,
          hardness: {
            ...h,
            phase: "TRIAL_COMPLETED",
            trialsV1: updatedTrials,
            v1Concordant: concordant,
            trialIndex: h.trialIndex + 1,
            buretteReadingMl: 0,
            liquidVolumeMl: 0,
            liquidColor: "transparent",
            sampleVolumeMl: 0,
            hasAmmoniaBuffer: false,
            hasEbtIndicator: false,
          },
          proceduralWarning: null,
          activeHint: concordant
            ? `V1 concordant reading established at ${concordant.toFixed(2)} mL! You can now switch to Sample Titration.`
            : "Trial 1 recorded. Repeat titration to verify concordant titre value.",
        };
      } else {
        const updatedTrials = [...h.trialsV2, reading];
        const pair = updatedTrials.slice(-2);
        const concordant =
          pair.length === 2 && Math.abs(pair[0] - pair[1]) <= 0.1 + 1e-8
            ? (pair[0] + pair[1]) / 2
            : null;

        return {
          ...state,
          hardness: {
            ...h,
            phase: "TRIAL_COMPLETED",
            trialsV2: updatedTrials,
            v2Concordant: concordant,
            trialIndex: h.trialIndex + 1,
            buretteReadingMl: 0,
            liquidVolumeMl: 0,
            liquidColor: "transparent",
            sampleVolumeMl: 0,
            hasAmmoniaBuffer: false,
            hasEbtIndicator: false,
          },
          proceduralWarning: null,
          activeHint: concordant
            ? `V2 concordant reading established at ${concordant.toFixed(2)} mL! Calculations are now unlocked.`
            : "Trial 1 for sample recorded. Repeat titration to establish concordant value.",
        };
      }
    }

    case "HARDNESS_SET_MODE": {
      const nextMode = action.payload as "standardization" | "sample";
      if (nextMode === "sample" && state.hardness.v1Concordant === null) {
        return {
          ...state,
          proceduralWarning: "Complete concordant standard trials first.",
        };
      }
      const trueTarget = nextMode === "standardization" ? 20.0 : 8.4;
      return {
        ...state,
        hardness: {
          ...state.hardness,
          mode: nextMode,
          phase: "FLASK_EMPTY",
          trialIndex: 1,
          sampleVolumeMl: 0,
          hasAmmoniaBuffer: false,
          hasEbtIndicator: false,
          buretteReadingMl: 0,
          trueEndpointMl: defaultPRNG.addRelativeNoise(trueTarget, 0.015),
          liquidVolumeMl: 0,
          liquidColor: "transparent",
          reactionProgressPercent: 0,
        },
        proceduralWarning: null,
        activeHint: `Switched to ${nextMode === "standardization" ? "Standard Hard Water (V1)" : "Sample Hard Water (V2)"}. Pipette 20 mL into flask.`,
      };
    }

    // --- PART B: CHLORIDE ACTIONS ---
    case "CHLORIDE_PREPARE_SAMPLE": {
      return {
        ...state,
        chloride: {
          ...state.chloride,
          phase: "SAMPLE_ADDED",
          sampleVolumeMl: 20,
          dilutionWaterMl: 10,
        },
        proceduralWarning: null,
        activeHint: "Dip the conductivity cell into the 100 mL beaker and turn on the magnetic stirrer.",
      };
    }

    case "CHLORIDE_DIP_PROBE": {
      return {
        ...state,
        chloride: {
          ...state.chloride,
          phase: "PROBE_INSERTED",
          isProbeDipped: true,
        },
        proceduralWarning: null,
        activeHint: "Record 0th reading (0 mL AgNO3), then dispense 0.01 N AgNO3 in 1.0 mL increments.",
      };
    }

    case "CHLORIDE_DISPENSE_AGNO3": {
      const amount = action.payload as number;
      const nextVol = Number((state.chloride.buretteReadingMl + amount).toFixed(1));
      const trueVeq = state.chloride.trueEquivalenceMl;

      // Conductance calculation: pre-equivalence slow decline, post-equivalence steep rise
      let cond = 2.15;
      if (nextVol <= trueVeq) {
        cond = 2.15 - 0.015 * nextVol;
      } else {
        const atVeq = 2.15 - 0.015 * trueVeq;
        cond = atVeq + 0.085 * (nextVol - trueVeq);
      }
      cond = Number((cond + defaultPRNG.nextGaussian(0, 0.005)).toFixed(3));

      // Precipitate cloudiness increases with volume until equivalence
      const turbidityFraction = Math.min(nextVol / trueVeq, 1.0) * 0.8;

      const updatedPoints = [...state.chloride.dataPoints, { volume: nextVol, conductance: cond }];

      // Check if enough points to compute intersection
      let vEq: number | null = null;
      if (nextVol >= 16) {
        vEq = Number(trueVeq.toFixed(2));
      }

      return {
        ...state,
        chloride: {
          ...state.chloride,
          phase: vEq ? "EQUIVALENCE_REACHED" : "TITRATING",
          buretteReadingMl: nextVol,
          conductanceMhos: cond,
          precipitateTurbidity: turbidityFraction,
          dataPoints: updatedPoints,
          vEquivalence: vEq,
        },
        proceduralWarning: null,
        activeHint: vEq
          ? `Precipitation complete! Equivalence intersection established at ${vEq} mL.`
          : `Conductance: ${cond} mS/cm. Continue 1.0 mL additions past equivalence (~16 mL).`,
      };
    }

    // --- PART C: SULFATE ACTIONS ---
    case "SULFATE_ZERO_CALIBRATE": {
      return {
        ...state,
        sulfate: {
          ...state.sulfate,
          isZeroCalibrated: true,
          measuredTurbidityNtu: { ...state.sulfate.measuredTurbidityNtu, 1: 0.0 },
        },
        proceduralWarning: null,
        activeHint: "Zero calibration locked at 0.0 NTU with blank. Now measure standard flasks 2–6.",
      };
    }

    case "SULFATE_MEASURE_FLASK": {
      const flaskId = action.payload as number;
      if (!state.sulfate.isZeroCalibrated && flaskId !== 1) {
        return {
          ...state,
          proceduralWarning: "Calibrate zero using Blank (Flask 1) before measuring standards.",
        };
      }

      const nominalPpms: Record<number, number> = { 1: 0, 2: 50, 3: 100, 4: 150, 5: 200, 6: 250 };
      const ppm = nominalPpms[flaskId] ?? 0;
      const slope = 0.52;
      const ntu = ppm === 0 ? 0.0 : Number((slope * ppm + 1.5 + defaultPRNG.nextGaussian(0, 0.5)).toFixed(1));

      return {
        ...state,
        sulfate: {
          ...state.sulfate,
          selectedFlaskId: flaskId,
          measuredTurbidityNtu: {
            ...state.sulfate.measuredTurbidityNtu,
            [flaskId]: ntu,
          },
        },
        proceduralWarning: null,
        activeHint: `Flask ${flaskId} measured: ${ntu} NTU.`,
      };
    }

    case "SULFATE_MEASURE_UNKNOWN": {
      if (!state.sulfate.isZeroCalibrated) {
        return {
          ...state,
          proceduralWarning: "Calibrate zero using Blank (Flask 1) before measuring unknown.",
        };
      }

      const slope = 0.52;
      const ntu = Number((slope * state.sulfate.trueUnknownPpm + 1.5 + defaultPRNG.nextGaussian(0, 0.5)).toFixed(1));
      const calcPpm = Number(((ntu - 1.5) / slope).toFixed(1));

      return {
        ...state,
        sulfate: {
          ...state.sulfate,
          selectedFlaskId: 7,
          unknownNtu: ntu,
          calculatedPpm: calcPpm,
          phase: "ANALYSIS_COMPLETE",
        },
        proceduralWarning: null,
        activeHint: `Unknown water sample measured: ${ntu} NTU (${calcPpm} ppm SO4 2-).`,
      };
    }

    // --- PART D: TDS ACTIONS ---
    case "TDS_DIP_PROBE": {
      const isDipped = action.payload as boolean;
      return {
        ...state,
        tds: {
          ...state.tds,
          isProbeDipped: isDipped,
          phase: isDipped ? "PROBE_IMMERSED" : "PROBE_AIR",
        },
        proceduralWarning: null,
        activeHint: isDipped
          ? `EC Probe stabilized at ${state.tds.rawEcMicroSiemens.toFixed(1)} µS/cm.`
          : "Probe withdrawn from solution.",
      };
    }

    case "TDS_SET_KE": {
      const factor = action.payload as number;
      const calc = state.tds.rawEcMicroSiemens * factor;
      return {
        ...state,
        tds: {
          ...state.tds,
          keFactor: factor,
          measuredTdsPpm: Number(calc.toFixed(1)),
        },
      };
    }

    // --- PART E: PH ACTIONS ---
    case "PH_SET_ELECTRODE": {
      const target = action.payload as "air" | "rinse" | "buffer4" | "buffer7" | "buffer9" | "sample";
      let measured: number | null = null;
      if (target === "sample") {
        measured = Number(state.ph.trueSamplePh.toFixed(2));
      } else if (target === "buffer4") {
        measured = 4.01;
      } else if (target === "buffer7") {
        measured = 7.00;
      } else if (target === "buffer9") {
        measured = 9.20;
      }

      return {
        ...state,
        ph: {
          ...state.ph,
          electrodeState: target,
          measuredPh: measured,
          phase: target === "sample" ? "MEASURED" : "ELECTRODE_AIR",
        },
        activeHint: `Electrode immersed in ${target}.`,
      };
    }

    case "PH_CALIBRATE_POINT": {
      const point = action.payload as number;
      const updated = state.ph.calibratedPoints.includes(point)
        ? state.ph.calibratedPoints
        : [...state.ph.calibratedPoints, point];
      return {
        ...state,
        ph: {
          ...state.ph,
          calibratedPoints: updated,
        },
        activeHint: `Calibration point pH ${point.toFixed(2)} stored in meter memory.`,
      };
    }

    case "RESET_SUBPART": {
      const fresh = createInitialSimulationContext();
      return {
        ...fresh,
        subpart: state.subpart,
      };
    }

    default:
      return state;
  }
}

