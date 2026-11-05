"use client";

import { useEffect, useReducer, useState } from "react";
import Link from "next/link";
import { ProcedureGuide } from "./ProcedureGuide";
import {
  concordant,
  createEdta,
  edtaReducer,
  nextDemoCommand,
  observe,
  reading,
  result,
  volume,
  type EdtaCommand,
  type EdtaState,
} from "@/lib/simulation/edta";
import "./edta.css";
import "./workbench.css";
import { HandsOnBench } from "./HandsOnBench";

type Tool = "bench" | "burette" | "pipette" | "buffer" | "indicator" | "flask";
type Mode = "practice" | "demo" | "challenge";
function demoExplanation(s: EdtaState): string {
  const command = nextDemoCommand(s);
  if (!command)
    return "The standard tells us how much hardness each mL of EDTA can bind. Comparing the unknown and standard titres gives hardness as CaCO₃.";
  switch (command.type) {
    case "rinse":
      return command.vessel === "burette"
        ? "Rinsing with EDTA removes residual water that could dilute the titrant and change how much is needed."
        : "Rinsing with the selected water sample prevents residual water or the previous sample from changing the aliquot's concentration.";
    case "transfer":
      if (command.from === "buffer")
        return "The ammonia buffer keeps the solution near pH 10. This supports EDTA complex formation and the indicator's red-to-blue endpoint.";
      if (command.from === "indicator")
        return "EBT is the colour indicator. It forms a wine-red complex with hardness ions. When EDTA binds those ions, the released indicator is blue.";
      if (command.to === "burette")
        return "The burette delivers measurable amounts of EDTA. We find the delivered volume by subtracting the initial reading from the final reading.";
      return s.sample === "standard"
        ? "This 20 mL standard contains 20 mg of CaCO₃-equivalent hardness. Its known amount lets us determine the EDTA's actual binding strength."
        : "We use the same 20 mL aliquot for the unknown. Equal sample volumes let us calculate hardness from the ratio of the two titres.";
    case "purge":
      return "An air bubble can make the burette reading change while liquid only fills the tip. Clearing it ensures the measured delivery reaches the flask.";
    case "read-initial":
      return "The initial reading need not be zero. The titre is final minus initial, so liquid drained while clearing the tip is not counted.";
    case "stir":
      return "Stirring spreads each EDTA addition through the sample. Judge the colour of the mixed solution, not a local blue streak.";
    case "valve":
    case "advance":
    case "drop":
      return observe(s).colour === "wine red"
        ? "EDTA binds calcium and magnesium ions. As titration proceeds, less metal remains available to hold the indicator in its wine-red complex."
        : "Near the endpoint, a small EDTA addition can complete the colour change. Single drops help avoid excess titrant and an overestimated hardness.";
    case "record":
      return "The mixed steel-blue colour signals the endpoint. Record the meniscus with the valve closed, then repeat to check that the titres agree.";
    case "discard":
    case "clean":
      return "Emptying and rinsing removes the previous reaction mixture. A fresh aliquot makes the next trial an independent check.";
    case "sample":
      return "Concordant standard trials establish the EDTA factor. We can now use that measured factor to determine the unknown water's hardness.";
    default:
      return "Clean glassware prevents contamination. Positioning the flask beneath the burette ensures the titrant enters the sample.";
  }
}

function hint(s: EdtaState): string {
  if (result(s) !== null)
    return "Analysis complete. Review the accepted readings and download your observation report.";
  const c = nextDemoCommand(s);
  if (!c) return "Experiment complete.";
  switch (c.type) {
    case "restart":
      return "Prepare the new sample.";
    case "inspect":
      return "Inspect the glassware: a clean 250 mL flask, 20 mL pipette and 50 mL burette.";
    case "position":
      return "Place the flask under the burette tip, on the magnetic stirrer.";
    case "rinse":
      return `Select the ${c.vessel} and condition it with a small portion of ${c.vessel === "burette" ? "EDTA" : "the water sample"}.`;
    case "transfer":
      return c.to === "burette"
        ? "Fill the conditioned burette with EDTA."
        : c.to === "pipette"
          ? "Select the pipette and aspirate a 20 mL aliquot."
          : c.from === "pipette"
            ? "Move the filled pipette over the flask and transfer the aliquot."
            : c.from === "buffer"
              ? "Select the buffer bottle, then the flask to deliver 4 mL at pH 10."
              : "Select the EBT dropper, then the flask. Add three drops, one at a time.";
    case "purge":
      return "Drain 0.50 mL to waste to clear the burette tip of air bubbles.";
    case "read-initial":
      return "Read the bottom of the burette meniscus. Record the initial level before titrating.";
    case "stir":
      return "Start the stirrer to mix the buffered, wine-red solution.";
    case "valve":
      return c.openness === 0
        ? "Close the stopcock. Use single drops as violet approaches steel blue."
        : "Open the stopcock gently. Watch the flask colour as EDTA binds calcium and magnesium.";
    case "advance":
      return "Watch the flask. Slow to single drops when the solution turns violet.";
    case "drop":
      return "Add one drop at a time. Stop at the first mixed steel-blue endpoint.";
    case "record":
      return "Close the stopcock. Read the final meniscus and record this trial.";
    case "discard":
    case "clean":
      return "Empty and rinse the flask before the next trial. Keep your recorded observations.";
    case "sample":
      return "Standardization is concordant. Change to the unknown sample and condition the pipette again.";
  }
}

function report(s: EdtaState) {
  const v1 = concordant(s, "standard"),
    v2 = concordant(s, "unknown");
  return [
    "CHEMLAB CC — EDTA hardness observation report",
    "Simulated observations; not physical laboratory measurements.",
    `Seed: ${s.config.seed}`,
    "Aliquots: 20.00 mL; standard: 1 mg/mL as CaCO3; buffer: pH approximately 10; EBT: 3 drops.",
    `Concordance policy: last two valid titres within ${s.config.concordanceMl.toFixed(2)} mL.`,
    "",
    "Sample,Trial,Initial (mL),Final (mL),Titre (mL),Buffer (mL),EBT drops",
    ...s.trials.map(
      (t, i) =>
        `${t.sample},${i + 1},${t.initialMl.toFixed(2)},${t.finalMl.toFixed(2)},${t.titreMl.toFixed(2)},${t.bufferMl},${t.drops}`,
    ),
    "",
    `V1: ${v1?.toFixed(3) ?? "pending"} mL`,
    `V2: ${v2?.toFixed(3) ?? "pending"} mL`,
    `EDTA factor: ${v1 ? (20 / v1).toFixed(5) : "pending"} mg CaCO3/mL`,
    `Hardness = V2 / V1 × 1000 = ${result(s)?.toFixed(1) ?? "pending"} ppm as CaCO3`,
    `Rejected actions: ${s.errors}`,
    "",
    "Reference: BCHY101P manual, physical PDF pages 4–6.",
    "EDTA normality nomenclature is ambiguous in the manual; calculations use the measured standardization factor.",
    "Model: ideal stoichiometric binding, qualitative EBT colour and conditioned buffer; no full equilibrium or uncertainty model.",
  ].join("\n");
}

export function EdtaLab() {
  const [s, dispatch] = useReducer(edtaReducer, undefined, () => createEdta());
  const [tool, setTool] = useState<Tool>("bench");
  const [mode, setMode] = useState<Mode>("practice");
  const [playing, setPlaying] = useState(false);
  const [notebook, setNotebook] = useState(false);
  const [finalReading, setFinalReading] = useState("");
  const [showHint, setShowHint] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const o = observe(s),
    ppm = result(s),
    c = s.vessels.flask.contents;
  const v1 = concordant(s, "standard"),
    v2 = concordant(s, "unknown");
  const send = (command: EdtaCommand) => {
    if (mode !== "demo") dispatch(command);
  };

  useEffect(() => {
    if (mode !== "demo" || !playing) return;
    const command = nextDemoCommand(s);
    // Give the main teaching moments reading time; chemistry still uses the same commands.
    const teachingMoment =
      command?.type === "record" ||
      command?.type === "sample" ||
      (command?.type === "transfer" &&
        (command.from === "buffer" ||
          (command.from === "indicator" &&
            s.vessels.flask.contents.indicator === 0)));
    const timer = window.setTimeout(
      () => {
        if (command) {
          const next = edtaReducer(s, command);
          dispatch(command);
          if (next.warning) setPlaying(false);
        } else setPlaying(false);
      },
      teachingMoment
        ? 4500
        : command?.type === "advance"
          ? 500
          : command?.type === "drop"
            ? 750
            : 2000,
    );
    return () => clearTimeout(timer);
  }, [mode, playing, s]);

  useEffect(() => {
    if (mode === "demo" || s.valve === 0) return;
    let frame = 0,
      previous = performance.now();
    const flow = (now: number) => {
      const seconds = Math.min((now - previous) / 1000, 0.1);
      previous = now;
      if (seconds > 0) dispatch({ type: "advance", seconds });
      frame = requestAnimationFrame(flow);
    };
    frame = requestAnimationFrame(flow);
    const stop = () => dispatch({ type: "valve", openness: 0 });
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", stop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", stop);
    };
  }, [mode, s.valve]);

  const changeMode = (next: Mode) => {
    dispatch({ type: "valve", openness: 0 });
    setPlaying(false);
    setMode(next);
    setShowHint(next !== "challenge");
  };
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([report(s)], { type: "text/plain;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "CHEMLAB-EDTA-observations.txt";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="edta-lab">
      <header className="edta-header">
        <Link href="/" className="edta-brand">
          CC<span>CHEMLAB / CHENNAI</span>
        </Link>
        <span className="edta-course">BCHY101P · WATER ANALYSIS / 01A</span>
        <div className="edta-header-actions">
          <button
            aria-expanded={guideOpen}
            aria-controls="detailed-procedure"
            onClick={() => setGuideOpen(!guideOpen)}
          >
            Procedure & theory
          </button>
          <button onClick={() => setNotebook(!notebook)}>
            Notebook <span className="edta-count">{s.trials.length}</span>
          </button>
        </div>
      </header>
      <div className="edta-title">
        <div>
          <p className="edta-eyebrow">THE WATER LAB</p>
          <h1>A change you can measure.</h1>
          <p>Determine water hardness through EDTA complexometric titration.</p>
        </div>
        <div className="edta-modes" aria-label="Learning mode">
          {(["practice", "demo", "challenge"] as const).map((m) => (
            <button
              key={m}
              aria-pressed={mode === m}
              onClick={() => changeMode(m)}
            >
              {m === "demo" ? "Demonstration" : m}
            </button>
          ))}
        </div>
      </div>
      <section className="edta-session-strip" aria-label="Experiment progress">
        <span>
          <i />
          {mode === "demo"
            ? "Guided demonstration"
            : mode === "challenge"
              ? "Independent practice"
              : "Hands-on laboratory"}
        </span>
        <span>
          01 /{" "}
          {s.sample === "standard" ? "Standardization" : "Unknown analysis"}
        </span>
        <span>{s.trials.length} accepted trials</span>
        <button
          onClick={() => {
            setGuideOpen(true);
            setTimeout(
              () =>
                document.getElementById("detailed-procedure")?.scrollIntoView({
                  behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)",
                  ).matches
                    ? "instant"
                    : "smooth",
                }),
              30,
            );
          }}
        >
          View detailed procedure &darr;
        </button>
      </section>
      <div className="edta-layout">
        <HandsOnBench
          key={s.config.seed}
          s={s}
          send={send}
          select={setTool}
          demo={mode === "demo"}
        />
        <aside
          className="edta-controls"
          aria-label="Selected apparatus controls"
        >
          <p className="edta-eyebrow">
            {mode === "demo"
              ? "FOLLOW THE EXPERIMENT"
              : "YOUR HANDS, YOUR MEASUREMENTS"}
          </p>
          <h2>
            {mode === "demo"
              ? "Watch & learn"
              : {
                  bench: "Prepare your bench",
                  burette: "Burette",
                  pipette: "Volumetric pipette",
                  buffer: "Ammonia buffer",
                  indicator: "EBT dropper",
                  flask: "Conical flask",
                }[tool]}
          </h2>
          {mode === "demo" ? (
            <>
              <p>
                The demonstration uses the same apparatus, quantities and
                acceptance checks as practice.
              </p>
              <button
                className="edta-primary"
                disabled={playing || nextDemoCommand(s) === null}
                onClick={() => {
                  const command = nextDemoCommand(s);
                  if (command) dispatch(command);
                }}
              >
                Next step
              </button>
              <button
                disabled={nextDemoCommand(s) === null}
                onClick={() => setPlaying(!playing)}
              >
                {playing ? "Pause demonstration" : "Play slowly"}
              </button>
              <p>
                {playing
                  ? "Autoplay is running. Each preparation step pauses so you can follow it."
                  : "Paused — choose Next step or Play slowly."}
              </p>
              <button
                onClick={() => {
                  setPlaying(false);
                  dispatch({ type: "restart", seed: s.config.seed });
                }}
              >
                Restart demonstration
              </button>
              <p>{hint(s)}</p>
              <div
                className="edta-demo-explanation"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <h3>Why this step matters</h3>
                <p>{demoExplanation(s)}</p>
              </div>
              <p>
                Use Next step to move at your own pace. Nothing advances
                automatically unless you choose Play slowly.
              </p>
            </>
          ) : (
            <>
              {tool === "bench" && (
                <>
                  <p>
                    Inspect the clean glassware, then align the flask beneath
                    the burette.
                  </p>
                  <button onClick={() => send({ type: "inspect" })}>
                    {s.inspected
                      ? "Glassware inspected ✓"
                      : "Inspect glassware"}
                  </button>
                  <button onClick={() => send({ type: "position" })}>
                    {s.positioned
                      ? "Flask positioned ✓"
                      : "Place flask under burette"}
                  </button>
                  <p>Select an object on the bench to use it.</p>
                </>
              )}
              {tool === "burette" && (
                <>
                  <div className="edta-reading">
                    <span>MENISCUS / mL</span>
                    <output data-testid="burette-reading">
                      {reading(s).toFixed(2)}
                    </output>
                  </div>
                  <button
                    onClick={() => send({ type: "rinse", vessel: "burette" })}
                  >
                    Rinse burette with EDTA
                  </button>
                  <button
                    onClick={() =>
                      send({
                        type: "transfer",
                        from: "edta",
                        to: "burette",
                        volumeMl: 50 - volume(s.vessels.burette),
                      })
                    }
                  >
                    Fill burette to zero
                  </button>
                  <button onClick={() => send({ type: "purge" })}>
                    Clear air bubbles to waste
                  </button>
                  <button onClick={() => send({ type: "read-initial" })}>
                    Record initial meniscus
                  </button>
                  <p>Initial: {s.initialMl?.toFixed(2) ?? "not recorded"} mL</p>
                  <label className="edta-valve">
                    Stopcock opening <span>{Math.round(s.valve * 100)}%</span>
                    <input
                      aria-label="Stopcock opening"
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={s.valve}
                      onChange={(e) =>
                        send({
                          type: "valve",
                          openness: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <div className="edta-button-row">
                    <button
                      onClick={() => send({ type: "valve", openness: 0 })}
                    >
                      Close stopcock
                    </button>
                    <button onClick={() => send({ type: "drop" })}>
                      Add one drop
                    </button>
                  </div>
                  <p>
                    Flow: up to 2 mL/s. One drop: 0.05 mL. Slow down at violet.
                  </p>
                </>
              )}
              {tool === "pipette" && (
                <>
                  <p>
                    Condition with {s.sample} water. Aspirate to the 20 mL mark,
                    then move to the flask.
                  </p>
                  <button
                    onClick={() => send({ type: "rinse", vessel: "pipette" })}
                  >
                    Rinse pipette with sample
                  </button>
                  <button
                    onClick={() =>
                      send({
                        type: "transfer",
                        from: s.sample,
                        to: "pipette",
                        volumeMl: 20,
                      })
                    }
                  >
                    Aspirate 20 mL
                  </button>
                  <button
                    onClick={() =>
                      send({
                        type: "transfer",
                        from: "pipette",
                        to: "flask",
                        volumeMl: 20,
                      })
                    }
                  >
                    Transfer pipette to flask
                  </button>
                  <p>
                    Drag the filled pipette label onto the flask, select the
                    flask, or use the transfer control.
                  </p>
                </>
              )}
              {tool === "buffer" && (
                <>
                  <p>
                    4 mL of ammonia–ammonium chloride buffer maintains the
                    intended pH near 10.
                  </p>
                  <button
                    onClick={() =>
                      send({
                        type: "transfer",
                        from: "buffer",
                        to: "flask",
                        volumeMl: 4,
                      })
                    }
                  >
                    Pour 4 mL buffer into flask
                  </button>
                  <p>You can also select the flask to pour.</p>
                </>
              )}
              {tool === "indicator" && (
                <>
                  <p>
                    Add three individual EBT drops. The buffered metal–indicator
                    complex is wine red.
                  </p>
                  <button
                    onClick={() =>
                      send({
                        type: "transfer",
                        from: "indicator",
                        to: "flask",
                        volumeMl: 0.05,
                      })
                    }
                  >
                    Add one EBT drop to flask
                  </button>
                  <p>Added: {o.drops} / 3 drops</p>
                </>
              )}
              {tool === "flask" && (
                <>
                  <p>
                    {c[s.sample].toFixed(0)} mL aliquot · {c.buffer.toFixed(0)}{" "}
                    mL buffer · {o.drops} EBT drops
                  </p>
                  <button
                    aria-pressed={s.stirring}
                    onClick={() => send({ type: "stir", on: !s.stirring })}
                  >
                    {s.stirring ? "Stop stirrer" : "Start stirrer"}
                  </button>
                  <label>
                    Final meniscus (mL)
                    <input
                      aria-label="Final meniscus (mL)"
                      type="number"
                      min="0"
                      max="50"
                      step="0.01"
                      placeholder="Read the burette"
                      value={finalReading}
                      onChange={(e) => setFinalReading(e.target.value)}
                    />
                  </label>
                  <button
                    className="edta-primary"
                    onClick={() =>
                      send({
                        type: "record",
                        finalMl:
                          finalReading.trim() === ""
                            ? NaN
                            : Number(finalReading),
                      })
                    }
                  >
                    Record trial
                  </button>
                  <button
                    onClick={() => {
                      send({ type: "clean" });
                      setFinalReading("");
                    }}
                  >
                    Empty and rinse flask
                  </button>
                  <p>
                    Record only a mixed steel-blue endpoint. Overshot trials
                    must be repeated.
                  </p>
                </>
              )}
              <button
                className="edta-text-button"
                onClick={() => setTool("flask")}
              >
                Inspect flask & record →
              </button>
              <button
                className="edta-text-button"
                onClick={() => setTool("bench")}
              >
                Prepare bench
              </button>
            </>
          )}
          <div className="edta-warning" role="alert">
            {s.warning ??
              (s.recorded
                ? "Trial accepted. Empty and rinse the flask before continuing."
                : "")}
          </div>
        </aside>
      </div>
      {guideOpen && (
        <div id="detailed-procedure">
          <ProcedureGuide s={s} />
        </div>
      )}
      <section className="edta-guidance">
        <div>
          <p className="edta-eyebrow">
            {mode === "challenge" ? "INDEPENDENT TECHNIQUE" : "AT YOUR SIDE"}
          </p>
          {showHint ? (
            <p>{hint(s)}</p>
          ) : (
            <p>
              Follow the manual. Use the apparatus and judge the endpoint
              yourself.
            </p>
          )}
        </div>
        <button onClick={() => setShowHint(!showHint)}>
          {showHint ? "Hide guidance" : "Show guidance"}
        </button>
      </section>
      <section className="edta-progress">
        <div>
          <span>STANDARDIZATION / V₁</span>
          <b>
            {v1?.toFixed(3) ?? "—"} <small>mL</small>
          </b>
        </div>
        <div>
          <span>UNKNOWN WATER / V₂</span>
          <b>
            {v2?.toFixed(3) ?? "—"} <small>mL</small>
          </b>
        </div>
        <div>
          <span>TOTAL HARDNESS</span>
          <b data-testid="hardness-result">
            {ppm?.toFixed(1) ?? "—"} <small>ppm as CaCO₃</small>
          </b>
        </div>
        <button
          disabled={mode === "demo"}
          onClick={() => {
            send({
              type: "sample",
              sample: s.sample === "standard" ? "unknown" : "standard",
            });
            setTool("pipette");
          }}
        >
          {s.sample === "standard"
            ? "Change to unknown water →"
            : "Return to standard water"}
        </button>
      </section>
      {(notebook || ppm !== null) && (
        <section className="edta-notebook">
          <div className="edta-notebook-title">
            <div>
              <p className="edta-eyebrow">YOUR OBSERVATIONS</p>
              <h2>
                {ppm !== null
                  ? "From colour to a result."
                  : "Every accepted reading."}
              </h2>
            </div>
            <button onClick={download}>Download report</button>
          </div>
          <div className="edta-table-wrap">
            <table>
              <caption>
                Accepted trials · last two must agree within{" "}
                {s.config.concordanceMl.toFixed(2)} mL
              </caption>
              <thead>
                <tr>
                  <th>Sample</th>
                  <th>Initial / mL</th>
                  <th>Final / mL</th>
                  <th>Titre / mL</th>
                  <th>Buffer / mL</th>
                  <th>EBT drops</th>
                </tr>
              </thead>
              <tbody>
                {s.trials.map((t, i) => (
                  <tr key={i}>
                    <td>
                      {t.sample} {i + 1}
                    </td>
                    <td>{t.initialMl.toFixed(2)}</td>
                    <td>{t.finalMl.toFixed(2)}</td>
                    <td>{t.titreMl.toFixed(2)}</td>
                    <td>{t.bufferMl}</td>
                    <td>{t.drops}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Hardness = (V₂ / V₁) × 1000 ={" "}
            <strong>{ppm?.toFixed(1) ?? "pending"} ppm as CaCO₃</strong>. EDTA
            factor = 20 / V₁ = {v1 ? (20 / v1).toFixed(4) : "pending"} mg
            CaCO₃/mL.
          </p>
          {ppm !== null && (
            <p>
              Technique feedback: {s.errors} rejected actions. Difference from
              this simulated sample’s reference:{" "}
              {Math.abs(ppm - s.config.unknownMgPerMl * 1000).toFixed(1)} ppm.
              Repeat with careful dropwise control to improve accuracy.
            </p>
          )}
        </section>
      )}
      <footer className="edta-footer">
        <span>VIT CHENNAI · BCHY101P · 2026–27</span>
        <span>
          Simulated measurements · Manual pp. 4–6 · Seed {s.config.seed}
        </span>
        <button
          onClick={() => {
            setPlaying(false);
            setFinalReading("");
            setTool("bench");
            dispatch({ type: "restart", seed: s.config.seed + 1 });
          }}
        >
          Start new experiment
        </button>
        <Link href="/experiments/exp-1/legacy">
          Other water activities · legacy preview →
        </Link>
      </footer>
    </div>
  );
}
