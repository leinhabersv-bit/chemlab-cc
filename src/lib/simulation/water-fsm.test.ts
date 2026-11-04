import { describe, it, expect } from "vitest";
import {
  createInitialSimulationContext,
  waterSimulationReducer,
  calculateHardnessLiquidColor,
} from "./water-fsm";

describe("Authoritative Simulation Engine & FSM (Experiment 1)", () => {
  it("initializes with physical targets and empty apparatus state", () => {
    const ctx = createInitialSimulationContext(2026);
    expect(ctx.subpart).toBe("hardness");
    expect(ctx.hardness.phase).toBe("FLASK_EMPTY");
    expect(ctx.hardness.liquidVolumeMl).toBe(0);
    expect(ctx.hardness.trueEndpointMl).toBeGreaterThan(19.0);
    expect(ctx.hardness.trueEndpointMl).toBeLessThan(21.0);
  });

  describe("Procedural Safeguards & Validations", () => {
    it("blocks dispensing when flask is empty", () => {
      const initial = createInitialSimulationContext();
      const updated = waterSimulationReducer(initial, {
        type: "HARDNESS_DISPENSE_EDTA",
        payload: 1.0,
      });
      expect(updated.proceduralWarning).toContain("Conical flask is empty");
      expect(updated.hardness.buretteReadingMl).toBe(0);
    });

    it("blocks dispensing when indicator is missing", () => {
      let state = createInitialSimulationContext();
      state = waterSimulationReducer(state, { type: "HARDNESS_PIPETTE_SAMPLE" });
      state = waterSimulationReducer(state, { type: "HARDNESS_ADD_BUFFER" });
      // Indicator not added!
      state = waterSimulationReducer(state, {
        type: "HARDNESS_DISPENSE_EDTA",
        payload: 1.0,
      });
      expect(state.proceduralWarning).toContain("No indicator present");
      expect(state.hardness.buretteReadingMl).toBe(0);
    });

    it("requires blank calibration before measuring standards in sulfate nephelometry", () => {
      let state = createInitialSimulationContext();
      state = waterSimulationReducer(state, { type: "SWITCH_SUBPART", payload: "sulfate" });
      state = waterSimulationReducer(state, {
        type: "SULFATE_MEASURE_FLASK",
        payload: 2, // Standard 50 ppm
      });
      expect(state.proceduralWarning).toContain("Calibrate zero using Blank");
      expect(state.sulfate.measuredTurbidityNtu[2]).toBeUndefined();
    });
  });

  describe("Continuous Chelation & Color Transition", () => {
    it("calculates smooth sigmoidal color transition across endpoint", () => {
      const endpoint = 20.0;
      // Well before endpoint -> Wine red
      const pre = calculateHardnessLiquidColor(10.0, endpoint, true, true, 20);
      expect(pre.color).toBe("rgba(136, 18, 38, 0.92)");
      expect(pre.progress).toBe(50);

      // Past endpoint -> Steel blue
      const post = calculateHardnessLiquidColor(20.5, endpoint, true, true, 20);
      expect(post.color).toBe("rgba(40, 115, 175, 0.94)");
      expect(post.progress).toBe(100);
    });

    it("executes full titration progression and records concordant trial", () => {
      let state = createInitialSimulationContext();
      state = waterSimulationReducer(state, { type: "HARDNESS_PIPETTE_SAMPLE" });
      state = waterSimulationReducer(state, { type: "HARDNESS_ADD_BUFFER" });
      state = waterSimulationReducer(state, { type: "HARDNESS_ADD_INDICATOR" });

      // Dispense the seeded endpoint for this reducer fixture.
      const endpoint = state.hardness.trueEndpointMl;
      state = waterSimulationReducer(state, {
        type: "HARDNESS_DISPENSE_EDTA",
        payload: endpoint,
      });

      expect(state.hardness.phase).toBe("ENDPOINT_REACHED");
      expect(state.hardness.liquidColor).toMatch(/rgba\(\d+,\s*\d+,\s*\d+,\s*0\.94\)/);

      // Record reading for trial 1
      state = waterSimulationReducer(state, { type: "HARDNESS_RECORD_TRIAL" });
      expect(state.hardness.trialsV1).toHaveLength(1);
      expect(state.hardness.trialsV1[0]).toBe(Number(endpoint.toFixed(2)));
      expect(state.hardness.liquidVolumeMl).toBe(0); // Reset for trial 2
    });
  });

  describe("Chloride Conductometric Simulation", () => {
    it("accumulates conductance points and detects equivalence", () => {
      let state = createInitialSimulationContext();
      state = waterSimulationReducer(state, { type: "SWITCH_SUBPART", payload: "chloride" });
      state = waterSimulationReducer(state, { type: "CHLORIDE_PREPARE_SAMPLE" });
      state = waterSimulationReducer(state, { type: "CHLORIDE_DIP_PROBE" });

      // Add 16 mL of AgNO3 in 1.0 mL steps
      for (let i = 0; i < 16; i++) {
        state = waterSimulationReducer(state, {
          type: "CHLORIDE_DISPENSE_AGNO3",
          payload: 1.0,
        });
      }

      expect(state.chloride.dataPoints.length).toBeGreaterThan(15);
      expect(state.chloride.vEquivalence).not.toBeNull();
      expect(state.chloride.vEquivalence).toBeCloseTo(12.0, 0);
    });
  });
});
