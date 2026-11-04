import { Exp1Subpart } from "@/types/workbench";

export type HardnessPhase =
  | "FLASK_EMPTY"
  | "SAMPLE_ADDED"
  | "BUFFER_ADDED"
  | "INDICATOR_ADDED"
  | "TITRATING"
  | "ENDPOINT_REACHED"
  | "TRIAL_COMPLETED";

export type ChloridePhase =
  | "BEAKER_EMPTY"
  | "SAMPLE_ADDED"
  | "PROBE_INSERTED"
  | "TITRATING"
  | "EQUIVALENCE_REACHED"
  | "TRIAL_COMPLETED";

export type SulfatePhase =
  | "PREPARING_STANDARDS"
  | "CALIBRATING_BLANK"
  | "MEASURING_STANDARDS"
  | "MEASURING_UNKNOWN"
  | "ANALYSIS_COMPLETE";

export type TdsPhase = "PROBE_AIR" | "PROBE_IMMERSED" | "MEASURED";

export type PhPhase =
  | "ELECTRODE_AIR"
  | "CALIBRATING_BUFFER"
  | "RINSING"
  | "MEASURING_SAMPLE"
  | "MEASURED";

export interface SimulationContext {
  subpart: Exp1Subpart;
  
  // Hardness State
  hardness: {
    phase: HardnessPhase;
    mode: "standardization" | "sample";
    trialIndex: number;
    sampleVolumeMl: number;
    hasAmmoniaBuffer: boolean;
    hasEbtIndicator: boolean;
    buretteReadingMl: number;
    trueEndpointMl: number;
    isStirring: boolean;
    liquidVolumeMl: number;
    liquidColor: string;
    reactionProgressPercent: number;
    v1Concordant: number | null;
    v2Concordant: number | null;
    trialsV1: number[];
    trialsV2: number[];
  };

  // Chloride State
  chloride: {
    phase: ChloridePhase;
    sampleVolumeMl: number;
    dilutionWaterMl: number;
    isProbeDipped: boolean;
    isStirring: boolean;
    buretteReadingMl: number;
    trueEquivalenceMl: number;
    precipitateTurbidity: number; // 0 to 1
    conductanceMhos: number;
    dataPoints: { volume: number; conductance: number }[];
    vEquivalence: number | null;
  };

  // Sulfate State
  sulfate: {
    phase: SulfatePhase;
    selectedFlaskId: number;
    isZeroCalibrated: boolean;
    trueUnknownPpm: number;
    measuredTurbidityNtu: Record<number, number>; // flaskId -> NTU
    unknownNtu: number | null;
    calculatedPpm: number | null;
  };

  // TDS State
  tds: {
    phase: TdsPhase;
    isProbeDipped: boolean;
    keFactor: number;
    rawEcMicroSiemens: number;
    measuredTdsPpm: number | null;
  };

  // pH State
  ph: {
    phase: PhPhase;
    electrodeState: "air" | "rinse" | "buffer4" | "buffer7" | "buffer9" | "sample";
    calibratedPoints: number[];
    trueSamplePh: number;
    measuredPh: number | null;
    temperatureC: number;
  };

  // Universal Flags
  isPaused: boolean;
  proceduralWarning: string | null;
  activeHint: string;
}

