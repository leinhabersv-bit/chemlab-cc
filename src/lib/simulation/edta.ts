import { PRNG } from "../prng";

export type Reagent =
  "standard" | "unknown" | "edta" | "buffer" | "indicator" | "water";
export type VesselId = Reagent | "pipette" | "burette" | "flask" | "waste";
export interface Vessel {
  capacityMl: number;
  contents: Record<Reagent, number>;
}
export interface Trial {
  sample: "standard" | "unknown";
  initialMl: number;
  finalMl: number;
  titreMl: number;
  bufferMl: number;
  drops: number;
}
export interface EdtaConfig {
  seed: number;
  edtaMgPerMl: number;
  unknownMgPerMl: number;
  concordanceMl: number;
  excessLimitMl: number;
}
export interface EdtaState {
  config: EdtaConfig;
  vessels: Record<VesselId, Vessel>;
  inspected: boolean;
  buretteRinsed: boolean;
  pipetteRinsed: boolean;
  tipClear: boolean;
  positioned: boolean;
  sample: "standard" | "unknown";
  initialMl: number | null;
  valve: number;
  stirring: boolean;
  recorded: boolean;
  flaskClean: boolean;
  trials: Trial[];
  warning: string | null;
  errors: number;
  commands: number;
}
export type EdtaCommand =
  | { type: "inspect" }
  | { type: "position"; underBurette?: boolean }
  | { type: "restart"; seed: number }
  | { type: "rinse"; vessel: "burette" | "pipette" }
  | { type: "transfer"; from: VesselId; to: VesselId; volumeMl: number }
  | { type: "purge" }
  | { type: "read-initial" }
  | { type: "stir"; on: boolean }
  | { type: "valve"; openness: number }
  | { type: "advance"; seconds: number }
  | { type: "drop" }
  | { type: "record"; finalMl: number }
  | { type: "clean" }
  | { type: "discard" }
  | { type: "sample"; sample: "standard" | "unknown" };
const reagents: Reagent[] = [
  "standard",
  "unknown",
  "edta",
  "buffer",
  "indicator",
  "water",
];
const empty = (): Record<Reagent, number> => ({
  standard: 0,
  unknown: 0,
  edta: 0,
  buffer: 0,
  indicator: 0,
  water: 0,
});
export const volume = (v: Vessel) =>
  Object.values(v.contents).reduce((a, b) => a + b, 0);
export const reading = (s: EdtaState) => 50 - volume(s.vessels.burette);
const round = (n: number) => Math.round(n * 1e8) / 1e8;
export function createEdta(overrides: Partial<EdtaConfig> = {}): EdtaState {
  const seed = overrides.seed ?? 2026;
  const rng = new PRNG(seed);
  const config = {
    seed,
    edtaMgPerMl: 0.98 + rng.next() * 0.04,
    unknownMgPerMl: 0.3 + rng.next() * 0.3,
    concordanceMl: 0.1,
    excessLimitMl: 0.1,
    ...overrides,
  };
  if (
    ![
      config.edtaMgPerMl,
      config.unknownMgPerMl,
      config.concordanceMl,
      config.excessLimitMl,
    ].every((x) => Number.isFinite(x) && x > 0)
  )
    throw new Error("Invalid laboratory configuration");
  const vessel = (capacityMl: number, reagent?: Reagent): Vessel => ({
    capacityMl,
    contents: { ...empty(), ...(reagent ? { [reagent]: capacityMl } : {}) },
  });
  return {
    config,
    vessels: {
      standard: vessel(500, "standard"),
      unknown: vessel(500, "unknown"),
      edta: vessel(1000, "edta"),
      buffer: vessel(100, "buffer"),
      indicator: vessel(10, "indicator"),
      water: vessel(1000, "water"),
      pipette: vessel(20),
      burette: vessel(50),
      flask: vessel(250),
      waste: vessel(5000),
    },
    inspected: false,
    buretteRinsed: false,
    pipetteRinsed: false,
    tipClear: false,
    positioned: false,
    sample: "standard",
    initialMl: null,
    valve: 0,
    stirring: false,
    recorded: false,
    flaskClean: true,
    trials: [],
    warning: null,
    errors: 0,
    commands: 0,
  };
}
export function observe(s: EdtaState) {
  const c = s.vessels.flask.contents;
  const metalMg = c.standard + c.unknown * s.config.unknownMgPerMl;
  const capacityMg = c.edta * s.config.edtaMgPerMl;
  const boundMg = Math.min(metalMg, capacityMg);
  const ratio = metalMg > 0 ? capacityMg / metalMg : 0;
  const conditioned = c[s.sample] === 20 && c.buffer >= 3 && c.buffer <= 5;
  const ready = conditioned && Math.abs(c.indicator - 0.15) < 1e-7;
  const colour =
    c.indicator === 0
      ? "clear"
      : !conditioned
        ? "unconditioned"
        : ratio >= 1 - 1e-9
          ? "steel blue"
          : ratio >= 0.9
            ? "violet"
            : "wine red";
  const colourHex = {
    clear: "#b9dfe1",
    unconditioned: "#866290",
    "steel blue": "#327ca2",
    violet: "#826091",
    "wine red": "#9a294b",
  }[colour];
  return {
    metalMg,
    boundMg,
    freeMetalMg: Math.max(0, metalMg - boundMg),
    excessMl: Math.max(0, c.edta - metalMg / s.config.edtaMgPerMl),
    ready,
    colour,
    colourHex,
    drops: Math.round(c.indicator / 0.05),
  };
}
export function concordant(
  s: EdtaState,
  sample: Trial["sample"],
): number | null {
  const t = s.trials.filter((t) => t.sample === sample).slice(-2);
  return t.length === 2 &&
    Math.abs(t[0].titreMl - t[1].titreMl) <= s.config.concordanceMl + 1e-8
    ? (t[0].titreMl + t[1].titreMl) / 2
    : null;
}
export function result(s: EdtaState): number | null {
  const a = concordant(s, "standard"),
    b = concordant(s, "unknown");
  return a !== null && b !== null ? (b / a) * 1000 : null;
}
function move(
  s: EdtaState,
  from: VesselId,
  to: VesselId,
  ml: number,
): EdtaState {
  const a = s.vessels[from],
    b = s.vessels[to],
    total = volume(a);
  if (
    !Number.isFinite(ml) ||
    ml <= 0 ||
    from === to ||
    total + 1e-8 < ml ||
    volume(b) + ml > b.capacityMl + 1e-8
  )
    return reject(s, "Transfer exceeds available liquid or vessel capacity.");
  const ac = { ...a.contents },
    bc = { ...b.contents };
  for (const r of reagents) {
    const amount = (a.contents[r] / total) * ml;
    ac[r] = round(ac[r] - amount);
    bc[r] = round(bc[r] + amount);
  }
  return {
    ...s,
    vessels: {
      ...s.vessels,
      [from]: { ...a, contents: ac },
      [to]: { ...b, contents: bc },
    },
  };
}
function reject(s: EdtaState, warning: string): EdtaState {
  return { ...s, warning, errors: s.errors + 1 };
}
export function edtaReducer(
  previous: EdtaState,
  command: EdtaCommand,
): EdtaState {
  let s: EdtaState = {
    ...previous,
    warning: null,
    commands: previous.commands + 1,
  };
  const c = s.vessels.flask.contents;
  switch (command.type) {
    case "restart":
      return Number.isSafeInteger(command.seed)
        ? createEdta({ seed: command.seed })
        : reject(s, "A whole-number seed is required.");
    case "inspect":
      return { ...s, inspected: true };
    case "position":
      if (command.underBurette === false)
        return { ...s, positioned: false, valve: 0, stirring: false };
      return s.inspected
        ? { ...s, positioned: true }
        : reject(s, "Inspect the clean apparatus first.");
    case "rinse": {
      if (
        !s.inspected ||
        s.valve ||
        (command.vessel === "burette" && s.initialMl !== null) ||
        volume(s.vessels[command.vessel]) > 0 ||
        (command.vessel === "pipette" && volume(s.vessels.flask) > 0)
      )
        return reject(
          s,
          "Close the valve and rinse empty apparatus before a trial.",
        );
      s = move(s, command.vessel === "burette" ? "edta" : s.sample, "waste", 2);
      return s.warning
        ? s
        : {
            ...s,
            [command.vessel === "burette" ? "buretteRinsed" : "pipetteRinsed"]:
              true,
          };
    }
    case "transfer": {
      const { from, to, volumeMl: ml } = command;
      if (!s.inspected || s.valve || s.recorded)
        return reject(
          s,
          "Prepare the apparatus with the stopcock closed. Clean the flask after recording.",
        );
      let valid = false;
      if (from === "edta" && to === "burette")
        valid = s.buretteRinsed && s.initialMl === null;
      if (from === s.sample && to === "pipette")
        valid =
          s.pipetteRinsed &&
          volume(s.vessels.pipette) === 0 &&
          ml === 20 &&
          c[s.sample] === 0;
      if (from === "pipette" && to === "flask")
        valid =
          s.positioned &&
          s.flaskClean &&
          c[s.sample] === 0 &&
          ml === 20 &&
          s.vessels.pipette.contents[s.sample] === 20;
      if (from === "buffer" && to === "flask")
        valid =
          c[s.sample] === 20 &&
          c.edta === 0 &&
          c.buffer === 0 &&
          ml >= 3 &&
          ml <= 5;
      if (from === "indicator" && to === "flask")
        valid =
          c.buffer >= 3 &&
          c.buffer <= 5 &&
          c.edta === 0 &&
          c.indicator < 0.15 - 1e-8 &&
          ml === 0.05;
      if (!valid)
        return reject(
          s,
          "Invalid transfer. Use the conditioned pipette for 20 mL, 3–5 mL buffer, then three individual indicator drops.",
        );
      const next = move(s, from, to, ml);
      return next.warning
        ? next
        : {
            ...next,
            tipClear: to === "burette" ? false : s.tipClear,
            flaskClean: to === "flask" ? false : s.flaskClean,
          };
    }
    case "purge": {
      if (!s.buretteRinsed || s.initialMl !== null || s.valve)
        return reject(
          s,
          "Fill the rinsed burette and purge before reading the initial level.",
        );
      s = move(s, "burette", "waste", 0.5);
      return s.warning ? s : { ...s, tipClear: true };
    }
    case "read-initial":
      return s.tipClear &&
        s.initialMl === null &&
        s.valve === 0 &&
        volume(s.vessels.burette) > 0 &&
        c.edta === 0
        ? { ...s, initialMl: reading(s) }
        : reject(
            s,
            "Purge the burette tip and close the valve before the initial reading.",
          );
    case "stir":
      return { ...s, stirring: command.on, valve: command.on ? s.valve : 0 };
    case "valve":
      if (
        !Number.isFinite(command.openness) ||
        command.openness < 0 ||
        command.openness > 1
      )
        return reject(s, "Valve openness must be between 0 and 1.");
      if (
        command.openness > 0 &&
        (!s.positioned ||
          s.initialMl === null ||
          !observe(s).ready ||
          s.recorded ||
          !s.stirring)
      )
        return reject(
          s,
          "Prepare the flask, read the burette and start mixing before opening the stopcock.",
        );
      return { ...s, valve: command.openness };
    case "drop":
    case "advance": {
      if (
        command.type === "advance" &&
        (!Number.isFinite(command.seconds) ||
          command.seconds <= 0 ||
          command.seconds > 1)
      )
        return reject(
          s,
          "Flow steps must be greater than zero and at most one second.",
        );
      if (
        !s.positioned ||
        s.initialMl === null ||
        !observe(s).ready ||
        !s.stirring ||
        s.recorded
      )
        return reject(s, "Complete preparation and mix before titrating.");
      if (command.type === "drop" && s.valve !== 0)
        return reject(s, "Close continuous flow before adding a single drop.");
      const requested =
        command.type === "drop" ? 0.05 : s.valve * command.seconds * 2;
      if (requested === 0) return s;
      const ml = Math.min(
        requested,
        volume(s.vessels.burette),
        s.vessels.flask.capacityMl - volume(s.vessels.flask),
      );
      if (ml <= 0)
        return {
          ...reject(
            s,
            "Burette empty or flask full. Close and restart this trial.",
          ),
          valve: 0,
        };
      s = move(s, "burette", "flask", ml);
      return { ...s, valve: volume(s.vessels.burette) <= 1e-8 ? 0 : s.valve };
    }
    case "record": {
      const o = observe(s);
      if (
        s.recorded ||
        s.valve !== 0 ||
        s.initialMl === null ||
        !s.stirring ||
        !o.ready ||
        o.colour !== "steel blue"
      )
        return reject(
          s,
          "A mixed steel-blue endpoint and closed stopcock are required.",
        );
      if (o.excessMl > s.config.excessLimitMl + 1e-8)
        return reject(
          s,
          "Endpoint overshot. Clean the flask and repeat, using drops near violet.",
        );
      if (
        !Number.isFinite(command.finalMl) ||
        Math.abs(command.finalMl - reading(s)) > 0.025
      )
        return reject(
          s,
          "Read the bottom of the meniscus to two decimal places.",
        );
      const initialMl = Number(s.initialMl.toFixed(2)),
        finalMl = Number(command.finalMl.toFixed(2));
      const trial = {
        sample: s.sample,
        initialMl,
        finalMl,
        titreMl: round(finalMl - initialMl),
        bufferMl: c.buffer,
        drops: o.drops,
      };
      return { ...s, recorded: true, trials: [...s.trials, trial] };
    }
    case "discard": {
      if (s.valve)
        return reject(s, "Close the stopcock before emptying the flask.");
      if (volume(s.vessels.flask) > 0)
        s = move(s, "flask", "waste", volume(s.vessels.flask));
      return s.warning
        ? s
        : {
            ...s,
            initialMl: null,
            recorded: false,
            stirring: false,
            flaskClean: false,
          };
    }
    case "clean": {
      if (s.valve)
        return reject(s, "Close the stopcock before removing the flask.");
      if (volume(s.vessels.flask) > 0)
        s = move(s, "flask", "waste", volume(s.vessels.flask));
      if (volume(s.vessels.pipette) > 0)
        s = move(s, "pipette", "waste", volume(s.vessels.pipette));
      s = move(s, "water", "waste", 10);
      return s.warning
        ? s
        : {
            ...s,
            initialMl: null,
            recorded: false,
            stirring: false,
            flaskClean: true,
          };
    }
    case "sample":
      if (
        s.valve ||
        volume(s.vessels.flask) > 0 ||
        volume(s.vessels.pipette) > 0 ||
        s.initialMl !== null
      )
        return reject(
          s,
          "Clean the flask and empty the pipette before changing samples.",
        );
      if (command.sample === "unknown" && concordant(s, "standard") === null)
        return reject(s, "Standardize EDTA with two concordant trials first.");
      return { ...s, sample: command.sample, pipetteRinsed: false };
  }
}

/** The demonstration sees colour and glassware readings, never a hidden endpoint. */
export function nextDemoCommand(s: EdtaState): EdtaCommand | null {
  if (result(s) !== null) return null;
  if (
    observe(s).excessMl > s.config.excessLimitMl + 1e-8 ||
    (s.initialMl !== null &&
      volume(s.vessels.burette) < 0.05 &&
      observe(s).colour !== "steel blue")
  )
    return s.valve > 0 ? { type: "valve", openness: 0 } : { type: "clean" };
  if (!s.inspected) return { type: "inspect" };
  if (!s.flaskClean && volume(s.vessels.flask) === 0) return { type: "clean" };
  if (!s.positioned) return { type: "position" };
  if (!s.buretteRinsed) return { type: "rinse", vessel: "burette" };
  if (s.recorded) return { type: "clean" };
  if (concordant(s, "standard") !== null && s.sample === "standard")
    return { type: "sample", sample: "unknown" };
  if (!s.pipetteRinsed) return { type: "rinse", vessel: "pipette" };
  if (s.initialMl === null) {
    if (volume(s.vessels.burette) < 45)
      return {
        type: "transfer",
        from: "edta",
        to: "burette",
        volumeMl: 50 - volume(s.vessels.burette),
      };
    if (!s.tipClear) return { type: "purge" };
    return { type: "read-initial" };
  }
  const c = s.vessels.flask.contents;
  if (c[s.sample] === 0)
    return volume(s.vessels.pipette) === 0
      ? { type: "transfer", from: s.sample, to: "pipette", volumeMl: 20 }
      : { type: "transfer", from: "pipette", to: "flask", volumeMl: 20 };
  if (c.buffer === 0)
    return { type: "transfer", from: "buffer", to: "flask", volumeMl: 4 };
  if (c.indicator < 0.15 - 1e-8)
    return { type: "transfer", from: "indicator", to: "flask", volumeMl: 0.05 };
  if (!s.stirring) return { type: "stir", on: true };
  const o = observe(s);
  if (o.colour === "steel blue")
    return s.valve > 0
      ? { type: "valve", openness: 0 }
      : { type: "record", finalMl: Number(reading(s).toFixed(2)) };
  if (o.colour === "violet")
    return s.valve > 0 ? { type: "valve", openness: 0 } : { type: "drop" };
  return s.valve === 0
    ? { type: "valve", openness: 0.5 }
    : { type: "advance", seconds: 0.5 };
}
