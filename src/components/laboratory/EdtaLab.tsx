"use client";

import { useEffect, useReducer, useState } from "react";
import Link from "next/link";
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
  const [dragging, setDragging] = useState(false);
  const o = observe(s),
    ppm = result(s),
    c = s.vessels.flask.contents;
  const v1 = concordant(s, "standard"),
    v2 = concordant(s, "unknown");
  const send = (command: EdtaCommand) => {
    if (mode !== "demo") dispatch(command);
  };
  const choose = (selected: Tool) => {
    if (mode === "demo") return;
    if (
      selected === "flask" &&
      (tool === "pipette" || tool === "buffer" || tool === "indicator")
    ) {
      send({
        type: "transfer",
        from: tool,
        to: "flask",
        volumeMl: tool === "pipette" ? 20 : tool === "buffer" ? 4 : 0.05,
      });
    } else setTool(selected);
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
        <button onClick={() => setNotebook(!notebook)}>
          Notebook <span className="edta-count">{s.trials.length}</span>
        </button>
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
      <div className="edta-layout">
        {mode !== "demo" ? (
          <HandsOnBench
            key={s.config.seed}
            s={s}
            send={send}
            select={setTool}
          />
        ) : (
          <section
            className="edta-stage"
            aria-label="Interactive chemistry bench"
          >
            <div className="edta-stage-label">
              <span>
                01 /{" "}
                {s.sample === "standard"
                  ? "STANDARDIZE THE EDTA"
                  : "ANALYZE UNKNOWN WATER"}
              </span>
              <span>
                20 mL aliquot ·{" "}
                {s.trials.filter((t) => t.sample === s.sample).length} trials
                recorded
              </span>
            </div>
            <svg
              className="edta-scene"
              viewBox="0 0 900 630"
              role="img"
              aria-label={`Laboratory scene. Flask: ${o.colour}, ${volume(s.vessels.flask).toFixed(2)} mL. Burette: ${reading(s).toFixed(2)} mL.`}
            >
              <defs>
                <linearGradient id="room" x2="0.8" y2="1">
                  <stop stopColor="#f6f4e9" />
                  <stop offset="1" stopColor="#d8e1d7" />
                </linearGradient>
                <linearGradient id="glass">
                  <stop stopColor="#ffffff" stopOpacity=".7" />
                  <stop offset=".25" stopColor="#d3eeee" stopOpacity=".12" />
                  <stop offset=".7" stopColor="#ffffff" stopOpacity=".08" />
                  <stop offset="1" stopColor="#779f9c" stopOpacity=".45" />
                </linearGradient>
                <linearGradient id="metal">
                  <stop stopColor="#526761" />
                  <stop offset=".4" stopColor="#f4f6ef" />
                  <stop offset=".6" stopColor="#c2cfc6" />
                  <stop offset="1" stopColor="#6d8077" />
                </linearGradient>
                <linearGradient id="bench" x2="0" y2="1">
                  <stop stopColor="#ebeee4" />
                  <stop offset="1" stopColor="#bdcabe" />
                </linearGradient>
                <radialGradient id="shadow">
                  <stop stopColor="#274035" stopOpacity=".3" />
                  <stop offset="1" stopColor="#274035" stopOpacity="0" />
                </radialGradient>
                <clipPath id="flask-liquid">
                  <path d="M476 364 L504 364 L504 405 L557 499 Q561 510 547 513 L433 513 Q419 510 423 499 L476 405 Z" />
                </clipPath>
              </defs>
              <rect width="900" height="630" fill="url(#room)" />
              <path d="M35 0H340L680 445H160Z" fill="#fffdf2" opacity=".58" />
              <path
                d="M60 40H340V315H60Z"
                fill="#e4ebe0"
                stroke="#c1cfc1"
                strokeWidth="6"
              />
              <path
                d="M200 40V315M60 175H340"
                stroke="#f8faf2"
                strokeWidth="8"
              />
              <path d="M0 445H900V630H0Z" fill="url(#bench)" />
              <path d="M0 580H900V630H0Z" fill="#a9bcae" />
              <path d="M0 579H900" stroke="#fafff3" strokeWidth="3" />
              <text
                x="690"
                y="100"
                fontSize="64"
                fill="#c0ccbf"
                fontFamily="Georgia"
              >
                H₂O
              </text>
              <text
                x="690"
                y="128"
                fontSize="12"
                letterSpacing="3"
                fill="#6f8372"
              >
                WATER ANALYSIS
              </text>
              <ellipse cx="490" cy="547" rx="150" ry="32" fill="url(#shadow)" />
              <rect
                x="371"
                y="81"
                width="12"
                height="450"
                rx="6"
                fill="url(#metal)"
              />
              <path d="M350 523H445L461 546H332Z" fill="#718379" />
              <rect
                x="374"
                y="147"
                width="110"
                height="10"
                rx="4"
                fill="url(#metal)"
              />
              <rect
                x="477"
                y="69"
                width="26"
                height="257"
                rx="4"
                fill="url(#glass)"
                stroke="#7e9b94"
                strokeWidth="2"
              />
              {volume(s.vessels.burette) > 0 && (
                <>
                  <rect
                    x="481"
                    y={74 + reading(s) * 4.7}
                    width="18"
                    height={volume(s.vessels.burette) * 4.7}
                    fill="#91c8cc"
                    opacity=".65"
                  />
                  <ellipse
                    cx="490"
                    cy={74 + reading(s) * 4.7}
                    rx="9"
                    ry="2"
                    fill="#e9fdff"
                    stroke="#72a4a7"
                  />
                </>
              )}
              {Array.from({ length: 11 }, (_, i) => (
                <g key={i}>
                  <path
                    d={`M478 ${75 + i * 23.5}h${i % 2 ? 8 : 13}`}
                    stroke="#466861"
                  />
                  <text x="514" y={79 + i * 23.5} fontSize="10" fill="#39594f">
                    {i * 5}
                  </text>
                </g>
              ))}
              <path
                d="M485 326V345L490 355L495 345V326"
                fill="url(#glass)"
                stroke="#7e9b94"
              />
              {!s.tipClear && volume(s.vessels.burette) > 0 && (
                <circle cx="490" cy="337" r="4" fill="white" stroke="#8badb1" />
              )}
              <g transform={`rotate(${s.valve * 90} 490 326)`}>
                <rect
                  x="463"
                  y="321"
                  width="54"
                  height="10"
                  rx="5"
                  fill="#ad7044"
                />
                <circle cx="490" cy="326" r="7" fill="#d5ab72" />
              </g>
              {s.valve > 0 && (
                <path
                  className="edta-stream"
                  d="M490 355V441"
                  stroke="#74b9c1"
                  strokeWidth="3"
                  strokeDasharray="4 8"
                />
              )}
              <g opacity={s.positioned ? 1 : 0.35}>
                <path
                  d="M415 519H565L579 555H402Z"
                  fill="#f5f5eb"
                  stroke="#8ba091"
                />
                <rect
                  x="402"
                  y="552"
                  width="177"
                  height="22"
                  rx="5"
                  fill="#234f45"
                />
                <circle
                  cx="550"
                  cy="562"
                  r="7"
                  fill={s.stirring ? "#b9de7c" : "#9cb4aa"}
                />
                <text
                  x="418"
                  y="566"
                  fill="#e9f0df"
                  fontSize="10"
                  letterSpacing="2"
                >
                  MAGNETIC MIXER
                </text>
                <path
                  d="M476 364 L504 364 L504 405 L557 499 Q561 510 547 513 L433 513 Q419 510 423 499 L476 405 Z"
                  fill="url(#glass)"
                  stroke="#76928a"
                  strokeWidth="2"
                />
                <g clipPath="url(#flask-liquid)">
                  {volume(s.vessels.flask) > 0 && (
                    <>
                      <rect
                        x="420"
                        y={510 - Math.min(volume(s.vessels.flask) * 1.2, 140)}
                        width="140"
                        height="150"
                        fill={o.colourHex}
                        opacity=".83"
                      />
                      <ellipse
                        cx="490"
                        cy={510 - Math.min(volume(s.vessels.flask) * 1.2, 140)}
                        rx="70"
                        ry="4"
                        fill={o.colourHex}
                      />
                    </>
                  )}
                  <path
                    d="M444 484L482 411V374"
                    stroke="white"
                    strokeWidth="5"
                    opacity=".55"
                  />
                </g>
                <path d="M473 363H507" stroke="#6f8e87" strokeWidth="4" />
                <path d="M522 474h16M512 454h14M505 434h10" stroke="#eff9f2" />
                <text x="464" y="456" fontSize="12" fill="#345e58">
                  250 mL
                </text>
                {s.stirring && (
                  <ellipse
                    className="edta-stir"
                    cx="490"
                    cy="503"
                    rx="14"
                    ry="3"
                    fill="#f3f0d7"
                  />
                )}
              </g>
              <g transform="translate(145 377)">
                <ellipse cx="30" cy="149" rx="55" ry="13" fill="url(#shadow)" />
                <rect
                  x="1"
                  y="16"
                  width="58"
                  height="127"
                  rx="9"
                  fill="#759c92"
                  opacity=".7"
                  stroke="#4e7668"
                />
                <rect x="9" width="42" height="26" rx="4" fill="#325d50" />
                <rect
                  x="6"
                  y="66"
                  width="48"
                  height="52"
                  rx="2"
                  fill="#f9f7e7"
                />
                <text
                  x="30"
                  y="86"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#254d3d"
                >
                  {s.sample === "standard" ? "STANDARD" : "UNKNOWN"}
                </text>
                <text
                  x="30"
                  y="103"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#254d3d"
                >
                  WATER
                </text>
              </g>
              <g transform="translate(245 427)">
                <rect
                  width="40"
                  height="87"
                  rx="6"
                  fill="#a17c45"
                  opacity=".85"
                />
                <rect
                  x="5"
                  y="-13"
                  width="30"
                  height="18"
                  rx="3"
                  fill="#e8e6d9"
                />
                <rect x="3" y="29" width="34" height="38" fill="#fbf2d9" />
                <text
                  x="20"
                  y="43"
                  textAnchor="middle"
                  fontSize="9"
                  fill="#453e24"
                >
                  BUFFER
                </text>
                <text
                  x="20"
                  y="58"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#453e24"
                >
                  pH 10
                </text>
              </g>
              <g transform="translate(311 449)">
                <rect width="30" height="67" rx="5" fill="#6e423d" />
                <rect
                  x="7"
                  y="-20"
                  width="16"
                  height="25"
                  rx="7"
                  fill="#3b4541"
                />
                <rect x="2" y="24" width="26" height="27" fill="#eedccb" />
                <text
                  x="15"
                  y="42"
                  textAnchor="middle"
                  fontSize="11"
                  fill="#593736"
                >
                  EBT
                </text>
              </g>
              <g transform="translate(650 300) rotate(12)">
                <ellipse cx="0" cy="0" rx="17" ry="24" fill="#b26245" />
                <path
                  d="M-4 23V75Q-16 82 -13 107Q-12 119 -4 124V200L0 217L4 200V124Q12 119 13 107Q16 82 4 75V23Z"
                  fill="url(#glass)"
                  stroke="#79978e"
                  strokeWidth="2"
                />
                {volume(s.vessels.pipette) > 0 && (
                  <path
                    d="M-2 75Q-13 84 -11 106Q-10 116 -2 123V198H2V123Q10 116 11 106Q13 84 2 75Z"
                    fill="#87c5cb"
                    opacity=".8"
                  />
                )}
                <path d="M-7 59H7" stroke="#b76242" strokeWidth="2" />
              </g>
              <text x="700" y="494" fontSize="13" fill="#496959">
                20 mL
              </text>
              <text x="700" y="515" fontSize="10" fill="#496959">
                VOLUMETRIC PIPETTE
              </text>
            </svg>
            <div className="edta-hotspots">
              <button
                className={`edta-hotspot edta-burette ${tool === "burette" ? "selected" : ""}`}
                aria-label="Select burette"
                onClick={() => choose("burette")}
              >
                Burette <b>{reading(s).toFixed(2)} mL</b>
              </button>
              <button
                className="edta-hotspot edta-sample"
                onClick={() => setTool("pipette")}
                aria-label="Select water sample"
              >
                {s.sample === "standard" ? "Standard" : "Unknown"} water
              </button>
              <button
                className={`edta-hotspot edta-buffer ${tool === "buffer" ? "selected" : ""}`}
                onClick={() => choose("buffer")}
              >
                Buffer
              </button>
              <button
                className={`edta-hotspot edta-indicator ${tool === "indicator" ? "selected" : ""}`}
                onClick={() => choose("indicator")}
              >
                EBT
              </button>
              <button
                className={`edta-hotspot edta-pipette ${tool === "pipette" ? "selected" : ""}`}
                aria-label="Select pipette"
                onClick={() => choose("pipette")}
                onPointerDown={(e) => {
                  if (mode !== "demo" && volume(s.vessels.pipette) > 0) {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setDragging(true);
                  }
                }}
                onPointerUp={(e) => {
                  if (dragging) {
                    const flask = document
                      .getElementById("edta-flask-target")
                      ?.getBoundingClientRect();
                    if (
                      flask &&
                      e.clientX >= flask.left &&
                      e.clientX <= flask.right &&
                      e.clientY >= flask.top &&
                      e.clientY <= flask.bottom
                    )
                      send({
                        type: "transfer",
                        from: "pipette",
                        to: "flask",
                        volumeMl: 20,
                      });
                    setDragging(false);
                  }
                }}
                onPointerCancel={() => setDragging(false)}
              >
                {dragging
                  ? "Move to flask →"
                  : `Pipette · ${volume(s.vessels.pipette).toFixed(0)} mL`}
              </button>
              <button
                id="edta-flask-target"
                className={`edta-hotspot edta-flask ${tool === "flask" ? "selected" : ""}`}
                onClick={() => choose("flask")}
                aria-label="Select flask or transfer selected reagent"
              >
                {tool === "pipette" || tool === "buffer" || tool === "indicator"
                  ? "↓ Transfer here"
                  : "Conical flask"}
              </button>
            </div>
            <div className="edta-observation">
              <span
                className="edta-swatch"
                style={{ background: o.colourHex }}
              />
              <span data-testid="colour">{o.colour}</span>
              <span>{volume(s.vessels.flask).toFixed(2)} mL in flask</span>
              <span>{s.stirring ? "Mixing" : "Stirrer off"}</span>
            </div>
          </section>
        )}
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
