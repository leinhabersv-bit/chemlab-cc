import { describe, it, expect } from "vitest";
import {
  calculateTotalHardness,
  calculateChlorideContent,
  calculateTds,
  calculateSulfateNephelometry,
  generateWaterQualityReport,
} from "./water-analysis";

describe("Water Analysis Calculations (BCHY101P Manual pp. 4-13)", () => {
  describe("Part A: Total Hardness via EDTA Titration", () => {
    it("calculates total hardness accurately from concordant titre values", () => {
      // Standard hard water: 20 mL consumed 20.0 mL EDTA -> V1 = 20.0 mL
      // Unknown sample: 20 mL consumed 8.4 mL EDTA -> V2 = 8.4 mL
      // Total Hardness = (8.4 / 20.0) * 1000 = 420 ppm
      const result = calculateTotalHardness({ v1Concordant: 20.0, v2Concordant: 8.4 });
      expect(result.edtaEquivalenceMgPerMl).toBeCloseTo(1.0, 4);
      expect(result.totalHardnessPpm).toBeCloseTo(420, 2);
    });

    it("throws error for zero or negative V1", () => {
      expect(() => calculateTotalHardness({ v1Concordant: 0, v2Concordant: 10 })).toThrow();
      expect(() => calculateTotalHardness({ v1Concordant: -5, v2Concordant: 10 })).toThrow();
    });
  });

  describe("Part B: Conductometric Chloride Estimation", () => {
    it("computes chloride normality, strength, and grams in 100 mL correctly", () => {
      // V1 = 12.0 mL of 0.01 N AgNO3 titrated against 20 mL chloride sample
      // N2 = (12.0 * 0.01) / 20 = 0.006 N
      // Strength = 0.006 * 35.453 = 0.212718 g/L
      // In 100 mL = 0.212718 * 0.1 = 0.0212718 g
      // In ppm = 212.718 mg/L
      const result = calculateChlorideContent({ vAgNo3Equivalence: 12.0 });
      expect(result.normalitySample).toBeCloseTo(0.006, 5);
      expect(result.strengthGramsPerLiter).toBeCloseTo(0.2127, 4);
      expect(result.chlorideIn100MlGrams).toBeCloseTo(0.02127, 4);
      expect(result.chloridePpm).toBeCloseTo(212.718, 2);
    });
  });

  describe("Part D: Total Dissolved Solids (TDS)", () => {
    it("computes TDS using default ke = 0.70", () => {
      // EC = 650 µS/cm -> TDS = 0.7 * 650 = 455 mg/L
      const result = calculateTds({ electricalConductivityMicroSiemens: 650 });
      expect(result.tdsMgPerLiter).toBeCloseTo(455, 4);
      expect(result.keUsed).toBe(0.7);
    });
  });

  describe("Part C: Nephelometric Sulfate Calibration", () => {
    it("computes linear regression line and unknown sulfate concentration", () => {
      const standards = [
        { concentrationPpm: 50, turbidityNtu: 25 },
        { concentrationPpm: 100, turbidityNtu: 50 },
        { concentrationPpm: 150, turbidityNtu: 75 },
        { concentrationPpm: 200, turbidityNtu: 100 },
        { concentrationPpm: 250, turbidityNtu: 125 },
      ];
      // Slope should be 0.5 NTU/ppm, intercept = 0
      // For unknown NTU = 80 -> [SO4] = 80 / 0.5 = 160 ppm
      const result = calculateSulfateNephelometry(standards, 80);
      expect(result.slope).toBeCloseTo(0.5, 3);
      expect(result.intercept).toBeCloseTo(0.0, 3);
      expect(result.rSquared).toBeCloseTo(1.0, 3);
      expect(result.unknownConcentrationPpm).toBeCloseTo(160, 2);
    });
  });

  describe("BIS 10500:2012 Compliance Report", () => {
    it("classifies acceptable, permissible, and exceeded parameters correctly", () => {
      const report = generateWaterQualityReport({
        hardnessPpm: 180, // <= 200: acceptable
        chloridePpm: 320, // > 250, <= 1000: permissible
        tdsPpm: 2200, // > 2000: exceeded
        sulfatePpm: 150, // <= 200: acceptable
        ph: 7.4, // between 6.5 and 8.5: acceptable
      });

      const hardness = report.find((r) => r.key === "hardness");
      const chloride = report.find((r) => r.key === "chloride");
      const tds = report.find((r) => r.key === "tds");
      const ph = report.find((r) => r.key === "ph");

      expect(hardness?.complianceStatus).toBe("acceptable");
      expect(chloride?.complianceStatus).toBe("permissible");
      expect(tds?.complianceStatus).toBe("exceeded");
      expect(ph?.complianceStatus).toBe("acceptable");
    });
  });
});
