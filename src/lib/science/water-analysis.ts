/**
 * Scientific Calculation and Validation Engine for Experiment 1:
 * Comprehensive Water Analysis (BCHY101P Manual pp. 4-13)
 */

export interface HardnessCalculationInput {
  v1Concordant: number; // Volume of EDTA for 20 mL standard hard water (mL)
  v2Concordant: number; // Volume of EDTA for 20 mL sample hard water (mL)
}

export interface HardnessCalculationResult {
  edtaEquivalenceMgPerMl: number; // mg of CaCO3 per mL of EDTA
  totalHardnessPpm: number; // ppm (mg/L) of CaCO3
  formulaUsed: string;
}

export function calculateTotalHardness(input: HardnessCalculationInput): HardnessCalculationResult {
  const { v1Concordant, v2Concordant } = input;
  if (v1Concordant <= 0) {
    throw new Error("V1 (concordant EDTA volume for standard hard water) must be positive.");
  }
  if (v2Concordant < 0) {
    throw new Error("V2 (concordant EDTA volume for sample) cannot be negative.");
  }

  // 20 mg of standard CaCO3 consumes V1 mL of EDTA
  // 1 mL EDTA = 20 / V1 mg CaCO3
  const edtaEquivalenceMgPerMl = 20 / v1Concordant;

  // Total Hardness = (V2 / V1) * 1000 ppm
  const totalHardnessPpm = (v2Concordant / v1Concordant) * 1000;

  return {
    edtaEquivalenceMgPerMl,
    totalHardnessPpm,
    formulaUsed: "Total Hardness (ppm) = (V2 / V1) * 1000",
  };
}

export interface ChlorideCalculationInput {
  vAgNo3Equivalence: number; // Volume of AgNO3 from graph intersection (mL)
  normalityAgNo3?: number; // Default 0.01 N as per manual p. 9
  volumeSample?: number; // Default 20 mL as per manual p. 9
}

export interface ChlorideCalculationResult {
  normalitySample: number; // N2 = (V1 * N1) / V2
  strengthGramsPerLiter: number; // g/L = N2 * 35.453
  chlorideIn100MlGrams: number; // g in 100 mL = (Strength * 100) / 1000
  chloridePpm: number; // mg/L = N2 * 35453
  formulaUsed: string;
}

export function calculateChlorideContent(input: ChlorideCalculationInput): ChlorideCalculationResult {
  const { vAgNo3Equivalence, normalityAgNo3 = 0.01, volumeSample = 20 } = input;
  if (vAgNo3Equivalence < 0) {
    throw new Error("Volume of AgNO3 cannot be negative.");
  }
  if (volumeSample <= 0) {
    throw new Error("Sample volume must be positive.");
  }

  const normalitySample = (vAgNo3Equivalence * normalityAgNo3) / volumeSample;
  const strengthGramsPerLiter = normalitySample * 35.453;
  const chlorideIn100MlGrams = (strengthGramsPerLiter * 100) / 1000;
  const chloridePpm = strengthGramsPerLiter * 1000;

  return {
    normalitySample,
    strengthGramsPerLiter,
    chlorideIn100MlGrams,
    chloridePpm,
    formulaUsed: "N2 = (V1 * N1) / V2; Amount in 100 mL = (Strength * 35.453 * 100) / 1000 g",
  };
}

export interface TdsCalculationInput {
  electricalConductivityMicroSiemens: number; // EC in µS/cm
  keConstant?: number; // Proportionality constant, manual default 0.70
}

export interface TdsCalculationResult {
  tdsMgPerLiter: number; // mg/L or ppm
  keUsed: number;
  formulaUsed: string;
}

export function calculateTds(input: TdsCalculationInput): TdsCalculationResult {
  const { electricalConductivityMicroSiemens, keConstant = 0.70 } = input;
  if (electricalConductivityMicroSiemens < 0) {
    throw new Error("Electrical conductivity cannot be negative.");
  }
  const tdsMgPerLiter = keConstant * electricalConductivityMicroSiemens;
  return {
    tdsMgPerLiter,
    keUsed: keConstant,
    formulaUsed: "TDS (mg/L) = ke * EC (µS/cm)",
  };
}

export interface SulfateDataPoint {
  concentrationPpm: number; // ppm
  turbidityNtu: number; // NTU
}

export interface SulfateCalculationResult {
  slope: number; // NTU per ppm
  intercept: number; // NTU
  rSquared: number;
  unknownConcentrationPpm: number;
  formulaUsed: string;
}

export function calculateSulfateNephelometry(
  standards: SulfateDataPoint[],
  unknownNtu: number
): SulfateCalculationResult {
  if (standards.length < 2) {
    throw new Error("At least 2 standards required for linear regression.");
  }

  // Ordinary least squares linear regression: y = m*x + c
  const n = standards.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const pt of standards) {
    sumX += pt.concentrationPpm;
    sumY += pt.turbidityNtu;
    sumXY += pt.concentrationPpm * pt.turbidityNtu;
    sumX2 += pt.concentrationPpm * pt.concentrationPpm;
    sumY2 += pt.turbidityNtu * pt.turbidityNtu;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (Math.abs(denominator) < 1e-12) {
    throw new Error("Ill-conditioned dataset: standard concentrations cannot be identical.");
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Correlation coefficient squared (R^2)
  const numeratorR = n * sumXY - sumX * sumY;
  const denominatorR = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  const rSquared = denominatorR > 0 ? Math.pow(numeratorR / denominatorR, 2) : 1;

  // Unknown concentration by inverse linear interpolation
  const unknownConcentrationPpm = slope !== 0 ? (unknownNtu - intercept) / slope : 0;

  return {
    slope,
    intercept,
    rSquared,
    unknownConcentrationPpm: Math.max(0, unknownConcentrationPpm),
    formulaUsed: "Turbidity (NTU) = m * [SO4] + c; [SO4] = (NTU - c) / m",
  };
}

export interface BisWaterQualityStandard {
  parameter: string;
  unit: string;
  acceptableLimit: number;
  permissibleLimit: number;
}

export const BIS_10500_STANDARDS: Record<string, BisWaterQualityStandard> = {
  hardness: {
    parameter: "Total Hardness (as CaCO3)",
    unit: "ppm (mg/L)",
    acceptableLimit: 200,
    permissibleLimit: 600,
  },
  chloride: {
    parameter: "Chloride (as Cl-)",
    unit: "ppm (mg/L)",
    acceptableLimit: 250,
    permissibleLimit: 1000,
  },
  tds: {
    parameter: "Total Dissolved Solids (TDS)",
    unit: "ppm (mg/L)",
    acceptableLimit: 500,
    permissibleLimit: 2000,
  },
  sulfate: {
    parameter: "Sulfate (as SO4 2-)",
    unit: "ppm (mg/L)",
    acceptableLimit: 200,
    permissibleLimit: 400,
  },
  ph: {
    parameter: "pH value",
    unit: "pH units",
    acceptableLimit: 8.5, // Upper acceptable
    permissibleLimit: 8.5,
  },
};

export interface QualityReportItem {
  key: string;
  parameter: string;
  recordedValue: number;
  recommendedValue: number;
  permissibleValue: number;
  unit: string;
  deviationPercent: number;
  complianceStatus: "acceptable" | "permissible" | "exceeded";
}

export function generateWaterQualityReport(measurements: {
  hardnessPpm: number;
  chloridePpm: number;
  tdsPpm: number;
  sulfatePpm: number;
  ph: number;
}): QualityReportItem[] {
  const keys = ["hardness", "chloride", "tds", "sulfate", "ph"] as const;
  return keys.map((key) => {
    const std = BIS_10500_STANDARDS[key];
    const val =
      key === "hardness"
        ? measurements.hardnessPpm
        : key === "chloride"
        ? measurements.chloridePpm
        : key === "tds"
        ? measurements.tdsPpm
        : key === "sulfate"
        ? measurements.sulfatePpm
        : measurements.ph;

    // For pH, acceptable range is 6.5 to 8.5
    let deviation = 0;
    let status: "acceptable" | "permissible" | "exceeded" = "acceptable";

    if (key === "ph") {
      if (val < 6.5) {
        deviation = ((val - 6.5) / 6.5) * 100;
        status = "exceeded";
      } else if (val > 8.5) {
        deviation = ((val - 8.5) / 8.5) * 100;
        status = "exceeded";
      } else {
        deviation = 0;
        status = "acceptable";
      }
    } else {
      deviation = ((val - std.acceptableLimit) / std.acceptableLimit) * 100;
      if (val <= std.acceptableLimit) {
        status = "acceptable";
      } else if (val <= std.permissibleLimit) {
        status = "permissible";
      } else {
        status = "exceeded";
      }
    }

    return {
      key,
      parameter: std.parameter,
      recordedValue: Number(val.toFixed(2)),
      recommendedValue: std.acceptableLimit,
      permissibleValue: std.permissibleLimit,
      unit: std.unit,
      deviationPercent: Number(deviation.toFixed(1)),
      complianceStatus: status,
    };
  });
}

