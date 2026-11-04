import { describe, it, expect } from "vitest";
import {
  createEdta,
  edtaReducer,
  nextDemoCommand,
  observe,
  reading,
  result,
  volume,
  concordant,
  type EdtaState,
  type EdtaCommand,
} from "./edta";

const fixture = () => createEdta({ edtaMgPerMl: 1, unknownMgPerMl: 0.42 });
function prepare(s = fixture()) {
  const commands: EdtaCommand[] = [
    { type: "inspect" },
    { type: "position" },
    { type: "rinse", vessel: "burette" },
    { type: "rinse", vessel: "pipette" },
    { type: "transfer", from: "edta", to: "burette", volumeMl: 50 },
    { type: "purge" },
    { type: "read-initial" },
    { type: "transfer", from: s.sample, to: "pipette", volumeMl: 20 },
    { type: "transfer", from: "pipette", to: "flask", volumeMl: 20 },
    { type: "transfer", from: "buffer", to: "flask", volumeMl: 4 },
    ...Array.from({ length: 3 }, (): EdtaCommand => ({
      type: "transfer",
      from: "indicator",
      to: "flask",
      volumeMl: 0.05,
    })),
    { type: "stir", on: true },
  ];
  for (const c of commands) {
    s = edtaReducer(s, c);
    expect(s.warning).toBeNull();
  }
  return s;
}
function runDemo(s: EdtaState) {
  const log: EdtaCommand[] = [];
  for (let i = 0; i < 2000; i++) {
    const c = nextDemoCommand(s);
    if (!c) return { s, log };
    log.push(c);
    s = edtaReducer(s, c);
    expect(s.warning).toBeNull();
  }
  throw new Error("Demonstration failed to finish");
}
const total = (s: EdtaState) =>
  Object.values(s.vessels).reduce((n, v) => n + volume(v), 0);
describe("EDTA physical workflow", () => {
  it("standardizes twice, measures unknown twice, and derives the 420 ppm fixture", () => {
    const { s } = runDemo(fixture());
    expect(s.trials.map((t) => t.titreMl)).toEqual([20, 20, 8.4, 8.4]);
    expect(
      s.trials.every(
        (t) => t.initialMl === 0.5 && t.drops === 3 && t.bufferMl === 4,
      ),
    ).toBe(true);
    expect(result(s)).toBeCloseTo(420, 8);
    expect(total(s)).toBeCloseTo(total(fixture()), 6);
  });
  it("conserves every reagent across transfers, rinsing, flow and waste", () => {
    let s = fixture();
    const initial = structuredClone(s);
    for (let i = 0; i < 2000; i++) {
      const c = nextDemoCommand(s);
      if (!c) break;
      s = edtaReducer(s, c);
      for (const reagent of Object.keys(
        s.vessels.flask.contents,
      ) as (keyof typeof s.vessels.flask.contents)[]) {
        const sum = (state: EdtaState) =>
          Object.values(state.vessels).reduce(
            (n, v) => n + v.contents[reagent],
            0,
          );
        expect(sum(s)).toBeCloseTo(sum(initial), 5);
      }
      for (const v of Object.values(s.vessels)) {
        expect(volume(v)).toBeGreaterThanOrEqual(0);
        expect(volume(v)).toBeLessThanOrEqual(v.capacityMl + 1e-7);
      }
    }
  });
  it("replays identically and derives different results from different seeds", () => {
    const a = runDemo(createEdta({ seed: 17 }));
    const replay = a.log.reduce(edtaReducer, createEdta({ seed: 17 }));
    expect(replay).toEqual(a.s);
    expect(createEdta({ seed: 17 })).toEqual(createEdta({ seed: 17 }));
    expect(result(runDemo(createEdta({ seed: 18 })).s)).not.toEqual(
      result(a.s),
    );
  });
  it("rejects early readings, missing preparation, wrong transfers and invalid quantities", () => {
    expect(
      edtaReducer(fixture(), { type: "record", finalMl: 0 }).trials,
    ).toHaveLength(0);
    expect(
      edtaReducer(fixture(), { type: "sample", sample: "unknown" }).warning,
    ).toContain("Standardize");
    const s = prepare();
    for (const volumeMl of [-1, NaN, Infinity, 0, 51]) {
      const n = edtaReducer(s, {
        type: "transfer",
        from: "standard",
        to: "flask",
        volumeMl,
      });
      expect(n.warning).not.toBeNull();
      expect(n.vessels).toEqual(s.vessels);
    }
    expect(
      edtaReducer(s, {
        type: "transfer",
        from: "buffer",
        to: "flask",
        volumeMl: 4,
      }).warning,
    ).not.toBeNull();
    expect(
      edtaReducer(s, {
        type: "transfer",
        from: "indicator",
        to: "flask",
        volumeMl: 0.05,
      }).warning,
    ).not.toBeNull();
    expect(
      edtaReducer(s, { type: "record", finalMl: reading(s) }).warning,
    ).not.toBeNull();
  });
  it("requires mixing and closes at depletion without creating liquid", () => {
    let s = prepare();
    s = edtaReducer(s, { type: "stir", on: false });
    expect(edtaReducer(s, { type: "drop" }).warning).not.toBeNull();
    s = edtaReducer(s, { type: "stir", on: true });
    s = edtaReducer(s, { type: "valve", openness: 1 });
    for (let i = 0; i < 25; i++)
      s = edtaReducer(s, { type: "advance", seconds: 1 });
    expect(reading(s)).toBe(50);
    expect(s.valve).toBe(0);
    expect(s.vessels.flask.contents.edta).toBe(49.5);
    expect(total(s)).toBeCloseTo(total(fixture()), 7);
  });
  it("rejects overshoot, open-valve records, nonfinite reads and duplicate records", () => {
    let s = prepare();
    s = edtaReducer(s, { type: "valve", openness: 1 });
    for (let i = 0; i < 10; i++)
      s = edtaReducer(s, { type: "advance", seconds: 1 });
    expect(observe(s).colour).toBe("steel blue");
    expect(
      edtaReducer(s, { type: "record", finalMl: reading(s) }).warning,
    ).not.toBeNull();
    s = edtaReducer(s, { type: "valve", openness: 0 });
    expect(
      edtaReducer(s, { type: "record", finalMl: NaN }).warning,
    ).not.toBeNull();
    const accepted = edtaReducer(s, { type: "record", finalMl: reading(s) });
    expect(accepted.trials).toHaveLength(1);
    expect(
      edtaReducer(accepted, { type: "record", finalMl: reading(s) }).trials,
    ).toHaveLength(1);
    for (let i = 0; i < 3; i++) s = edtaReducer(s, { type: "drop" });
    expect(
      edtaReducer(s, { type: "record", finalMl: reading(s) }).warning,
    ).toContain("overshot");
  });
  it("checks the numerical difference of the last two readings at configurable tolerance", () => {
    const s = runDemo(fixture()).s;
    s.trials[1] = { ...s.trials[1], titreMl: 20.3 };
    expect(concordant(s, "standard")).toBeNull();
    s.config.concordanceMl = 0.3;
    expect(concordant(s, "standard")).toBeCloseTo(20.15);
  });
  it("uses elapsed flow time and openness and rejects impossible time steps", () => {
    let s = prepare();
    s = edtaReducer(s, { type: "valve", openness: 0.25 });
    s = edtaReducer(s, { type: "advance", seconds: 0.5 });
    expect(s.vessels.flask.contents.edta).toBe(0.25);
    for (const seconds of [-1, NaN, Infinity, 2])
      expect(
        edtaReducer(s, { type: "advance", seconds }).warning,
      ).not.toBeNull();
    expect(
      edtaReducer(s, { type: "valve", openness: 2 }).warning,
    ).not.toBeNull();
  });
});
