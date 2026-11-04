import { it, expect } from "vitest";
import {
  createEdta,
  edtaReducer,
  nextDemoCommand,
  type EdtaState,
} from "./edta";
it("demo recovers an overshot practice trial instead of repeating rejected recordings", () => {
  let s: EdtaState = createEdta({ edtaMgPerMl: 1, unknownMgPerMl: 0.42 });
  for (let i = 0; i < 500; i++) {
    const c = nextDemoCommand(s);
    if (c?.type === "record") break;
    if (c) s = edtaReducer(s, c);
  }
  for (let i = 0; i < 4; i++) s = edtaReducer(s, { type: "drop" });
  expect(nextDemoCommand(s)?.type).toBe("clean");
});
it("moving the flask closes flow and discarded glassware must be rinsed again", () => {
  let s = createEdta({ edtaMgPerMl: 1 });
  for (let i = 0; i < 100; i++) {
    const c = nextDemoCommand(s);
    if (c) s = edtaReducer(s, c);
    if (s.valve > 0) break;
  }
  s = edtaReducer(s, { type: "position", underBurette: false });
  expect(s.valve).toBe(0);
  expect(s.stirring).toBe(false);
  expect(
    edtaReducer(s, { type: "advance", seconds: 1 }).warning,
  ).not.toBeNull();
  s = edtaReducer(s, { type: "discard" });
  expect(s.flaskClean).toBe(false);
  s = edtaReducer(s, { type: "position" });
  s = edtaReducer(s, {
    type: "transfer",
    from: "standard",
    to: "pipette",
    volumeMl: 20,
  });
  expect(
    edtaReducer(s, {
      type: "transfer",
      from: "pipette",
      to: "flask",
      volumeMl: 20,
    }).warning,
  ).not.toBeNull();
  const water = s.vessels.water.contents.water;
  s = edtaReducer(s, { type: "clean" });
  expect(s.flaskClean).toBe(true);
  expect(s.vessels.water.contents.water).toBe(water - 10);
});
