import { describe, expect, it } from "vitest";
import {
  createInitialSimulationContext,
  waterSimulationReducer,
} from "./water-fsm";

describe("legacy reducer safety at the original command boundary", () => {
  it("rejects premature recording and toggles the actual stirrer state", () => {
    let s = createInitialSimulationContext();
    s = waterSimulationReducer(s, { type: "HARDNESS_RECORD_TRIAL" });
    expect(s.hardness.trialsV1).toEqual([]);
    expect(s.proceduralWarning).toContain("valid mixed endpoint");
    s = waterSimulationReducer(s, { type: "HARDNESS_TOGGLE_STIRRER" });
    expect(s.hardness.isStirring).toBe(false);
  });
  it("compares numbers before declaring concordance", () => {
    let s = createInitialSimulationContext();
    s = {
      ...s,
      hardness: {
        ...s.hardness,
        trueEndpointMl: 20,
        buretteReadingMl: 20,
        sampleVolumeMl: 20,
        hasAmmoniaBuffer: true,
        hasEbtIndicator: true,
        phase: "ENDPOINT_REACHED",
        trialsV1: [19.7],
      },
    };
    s = waterSimulationReducer(s, { type: "HARDNESS_RECORD_TRIAL" });
    expect(s.hardness.v1Concordant).toBeNull();
  });
  it("rejects negative and overflowing deliveries without changing the liquid", () => {
    let s = createInitialSimulationContext();
    for (const type of [
      "HARDNESS_PIPETTE_SAMPLE",
      "HARDNESS_ADD_BUFFER",
      "HARDNESS_ADD_INDICATOR",
    ])
      s = waterSimulationReducer(s, { type });
    for (const payload of [-1, Infinity, NaN, 51]) {
      const n = waterSimulationReducer(s, {
        type: "HARDNESS_DISPENSE_EDTA",
        payload,
      });
      expect(n.hardness).toEqual(s.hardness);
      expect(n.proceduralWarning).not.toBeNull();
    }
  });
});
