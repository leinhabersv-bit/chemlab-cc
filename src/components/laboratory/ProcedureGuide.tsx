"use client";

import { useEffect, useState } from "react";
import {
  concordant,
  nextDemoCommand,
  observe,
  result,
  volume,
  type EdtaState,
} from "@/lib/simulation/edta";
import "./procedure-guide.css";

const steps = [
  {
    title: "Prepare clean glassware",
    action:
      "Inspect the 250 mL conical flask, 20 mL pipette and 50 mL burette. Place the flask under the burette on the stirrer.",
    why: "Clean apparatus prevents contamination. Correct alignment keeps delivered EDTA inside the sample.",
    check: "The flask is clean, stable and beneath the burette tip.",
  },
  {
    title: "Condition the burette",
    action:
      "Choose Rinse. Bring the EDTA bottle to the burette mouth and tilt it, or use the burette's rinse control. Drain the conditioning liquid to waste.",
    why: "Residual water would dilute the titrant. Rinsing with EDTA leaves the burette conditioned with the solution it will deliver.",
    check: "Use EDTA for conditioning, not the sample or buffer.",
  },
  {
    title: "Fill, clear the tip and read",
    action:
      "Fill the burette with EDTA. Clear air bubbles to waste, then record the initial meniscus before delivering any titrant to the flask.",
    why: "An air bubble can consume apparent burette delivery while only filling the tip. The titre is final minus initial, so the initial reading need not be zero.",
    check:
      "Read the bottom of the meniscus at eye level. The simulated purge uses 0.50 mL.",
  },
  {
    title: "Condition the pipette",
    action:
      "Choose Rinse and dip the pipette tip into the selected water sample. Use standard hard water during standardization; recondition with unknown water after changing samples.",
    why: "A small residue of water or the previous sample would change the concentration of the measured aliquot.",
    check:
      "Use a pipette bulb; never pipette by mouth in a physical laboratory.",
  },
  {
    title: "Measure a 20 mL aliquot",
    action:
      "Choose Fill and draw 20 mL into the conditioned pipette. Move its tip above the clean flask, then tilt the pipette to transfer the aliquot.",
    why: "The standard contains 1 mg CaCO3-equivalent per mL: a 20 mL aliquot supplies 20 mg. Use the same aliquot volume for the unknown comparison.",
    check:
      "Use the volumetric pipette rather than pouring directly from the sample bottle.",
  },
  {
    title: "Add the pH 10 buffer",
    action:
      "Bring the buffer bottle above the flask and tilt to add 4 mL of ammonia-ammonium chloride buffer.",
    why: "The buffer establishes the intended pH for EDTA complex formation and the indicator's colour response.",
    check:
      "The manual specifies 3-5 mL for standardization. This lab consistently uses 4 mL in both stages.",
  },
  {
    title: "Add three drops of EBT",
    action:
      "Position the EBT dropper over the flask. Tilt and return upright three times to add one drop per action.",
    why: "Eriochrome Black T gives a wine-red metal-indicator complex in the prepared sample. EDTA binds the hardness ions, releasing the blue indicator at the endpoint.",
    check:
      "Count the drops. Extra indicator is not a substitute for correct buffering.",
  },
  {
    title: "Mix and approach the endpoint",
    action:
      "Start the stirrer. Open the burette stopcock gently and watch the mixed solution. At violet, close the valve and add individual drops until the first steel-blue endpoint.",
    why: "Mixing distributes each addition through the aliquot. Small additions near the endpoint reduce excess EDTA and an overestimated titre.",
    check:
      "Judge the whole mixed solution, not a local blue streak. An overshot trial must be repeated.",
  },
  {
    title: "Record the final meniscus",
    action:
      "Close the stopcock at the endpoint. Read the final meniscus, enter it in the observation controls, and record the trial.",
    why: "The accepted titre is the difference between the final and initial readings. Recording a raw final reading as the titre would include the initial offset.",
    check:
      "Keep the initial, final and delivered volumes for every accepted trial.",
  },
  {
    title: "Repeat, then analyse the unknown",
    action:
      "Move the flask to waste and tilt to empty it. Rinse with the wash bottle. Repeat standard trials until concordant; change to unknown water, recondition the pipette, and obtain concordant unknown trials.",
    why: "Repeated agreement checks technique. Standardization establishes the EDTA factor before it is used to measure an unknown concentration.",
    check:
      "This simulation accepts the last two titres when they differ by at most the displayed concordance tolerance. Record more trials if needed.",
  },
] as const;

function activeStep(s: EdtaState): number {
  const command = nextDemoCommand(s);
  if (!command) return 9;
  switch (command.type) {
    case "inspect":
    case "position":
      return 0;
    case "rinse":
      return command.vessel === "burette" ? 1 : 3;
    case "purge":
    case "read-initial":
      return 2;
    case "transfer":
      return command.to === "burette"
        ? 2
        : command.from === "buffer"
          ? 5
          : command.from === "indicator"
            ? 6
            : 4;
    case "stir":
    case "valve":
    case "advance":
    case "drop":
      return 7;
    case "record":
      return 8;
    default:
      return 9;
  }
}

export function ProcedureGuide({ s }: { s: EdtaState }) {
  const [tab, setTab] = useState<"procedure" | "reference">("procedure");
  const active = activeStep(s);
  const [openStep, setOpenStep] = useState<number | null>(active);
  const [follow, setFollow] = useState(true);
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (follow) setOpenStep(active);
  }, [active, follow]);

  const v1 = concordant(s, "standard");
  const v2 = concordant(s, "unknown");
  const hardness = result(s);
  const o = observe(s);
  const contents = s.vessels.flask.contents;
  const completed = [
    s.inspected && s.positioned,
    s.buretteRinsed,
    s.initialMl !== null,
    s.pipetteRinsed,
    contents[s.sample] === 20,
    contents.buffer >= 3 && contents.buffer <= 5,
    Math.abs(contents.indicator - 0.15) < 1e-7,
    o.ready &&
      o.colour === "steel blue" &&
      s.stirring &&
      o.excessMl <= s.config.excessLimitMl,
    s.recorded,
    hardness !== null,
  ];
  const standardTrials = s.trials.filter(
    (trial) => trial.sample === "standard",
  ).length;
  const unknownTrials = s.trials.filter(
    (trial) => trial.sample === "unknown",
  ).length;
  const filtered = steps
    .map((step, index) => ({ ...step, index }))
    .filter((step) =>
      `${step.title} ${step.action} ${step.why} ${step.check}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );

  return (
    <section
      className="procedure-guide"
      aria-labelledby="procedure-guide-title"
    >
      <div className="procedure-guide-heading">
        <div>
          <p className="procedure-guide-eyebrow">YOUR LAB COMPANION</p>
          <h2 id="procedure-guide-title">Procedure &amp; learning</h2>
        </div>
        <span className="procedure-guide-phase">
          {hardness !== null
            ? "Analysis complete"
            : s.sample === "standard"
              ? "01 / Standardize"
              : "02 / Unknown water"}
        </span>
      </div>

      <div
        className="procedure-guide-milestones"
        aria-label="Accepted experiment progress"
      >
        <div>
          <span>Standard trials</span>
          <strong>{standardTrials}</strong>
          <small>{v1 === null ? "Concordance pending" : "Concordant"}</small>
        </div>
        <div>
          <span>Unknown trials</span>
          <strong>{unknownTrials}</strong>
          <small>{v2 === null ? "Concordance pending" : "Concordant"}</small>
        </div>
        <div>
          <span>Agreement limit</span>
          <strong>
            {s.config.concordanceMl.toFixed(2)} <em>mL</em>
          </strong>
          <small>Simulation policy</small>
        </div>
      </div>

      <div
        className="procedure-guide-tabs"
        role="group"
        aria-label="Learning panel view"
      >
        <button
          type="button"
          aria-pressed={tab === "procedure"}
          onClick={() => setTab("procedure")}
        >
          Step-by-step procedure
        </button>
        <button
          type="button"
          aria-pressed={tab === "reference"}
          onClick={() => setTab("reference")}
        >
          Theory &amp; reference
        </button>
      </div>

      {tab === "procedure" ? (
        <div>
          <div className="procedure-guide-current">
            <span>{hardness !== null ? "FINISHED" : "NEXT ON YOUR BENCH"}</span>
            <p>
              {hardness !== null
                ? "Review the calculation and download your observation report."
                : steps[active].title}
            </p>
            <button
              type="button"
              onClick={() => {
                setFollow(true);
                setOpenStep(active);
                setQuery("");
              }}
            >
              Follow current step
            </button>
          </div>
          <label className="procedure-guide-search">
            Find a step
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try buffer, rinse or endpoint"
            />
          </label>
          <p className="procedure-guide-caption">
            Checks reflect the current bench. They reset as glassware is emptied
            for the next trial.
          </p>
          <div className="procedure-guide-steps">
            {filtered.map((step) => (
              <details
                key={step.index}
                open={openStep === step.index}
                className={
                  step.index === active && hardness === null ? "is-current" : ""
                }
              >
                <summary
                  onClick={(event) => {
                    event.preventDefault();
                    setFollow(false);
                    setOpenStep(openStep === step.index ? null : step.index);
                  }}
                >
                  <span className="procedure-guide-number">
                    {String(step.index + 1).padStart(2, "0")}
                  </span>
                  <span>{step.title}</span>
                  <span className="procedure-guide-step-state">
                    {completed[step.index]
                      ? "Ready"
                      : step.index === active && hardness === null
                        ? "Current"
                        : ""}
                  </span>
                </summary>
                <div className="procedure-guide-step-content">
                  <p>{step.action}</p>
                  <div className="procedure-guide-why">
                    <strong>Why this matters</strong>
                    <p>{step.why}</p>
                  </div>
                  <p className="procedure-guide-check">
                    <strong>Check:</strong> {step.check}
                  </p>
                </div>
              </details>
            ))}
            {filtered.length === 0 && (
              <p className="procedure-guide-empty">
                No matching steps. Try a reagent or technique name.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="procedure-guide-reference">
          <div className="procedure-guide-formula">
            <p className="procedure-guide-eyebrow">
              FROM YOUR ACCEPTED READINGS
            </p>
            <h3>Hardness = (V2 / V1) × 1000</h3>
            <p>
              V1 is the mean concordant standard titre. V2 is the mean
              concordant unknown titre. Both use 20 mL aliquots; hardness is
              expressed as ppm CaCO3-equivalent.
            </p>
            <dl>
              <div>
                <dt>V1 / standard</dt>
                <dd>
                  {v1 === null ? "Awaiting concordance" : `${v1.toFixed(3)} mL`}
                </dd>
              </div>
              <div>
                <dt>V2 / unknown</dt>
                <dd>
                  {v2 === null ? "Awaiting concordance" : `${v2.toFixed(3)} mL`}
                </dd>
              </div>
              <div>
                <dt>EDTA factor / 20 ÷ V1</dt>
                <dd>
                  {v1 === null
                    ? "Awaiting standardization"
                    : `${(20 / v1).toFixed(5)} mg CaCO3/mL`}
                </dd>
              </div>
              <div>
                <dt>Total hardness</dt>
                <dd>
                  {hardness === null
                    ? "Complete both stages"
                    : `${hardness.toFixed(1)} ppm as CaCO3`}
                </dd>
              </div>
            </dl>
          </div>
          <div className="procedure-guide-reference-grid">
            <article>
              <h3>Know the colour change</h3>
              <ol className="procedure-guide-colours">
                <li>
                  <i style={{ background: "#9a294b" }} />
                  Wine red: prepared sample before the endpoint.
                </li>
                <li>
                  <i style={{ background: "#826091" }} />
                  Violet: slow down and switch to single drops.
                </li>
                <li>
                  <i style={{ background: "#327ca2" }} />
                  Steel blue: close the valve and read the meniscus.
                </li>
              </ol>
              <p>
                Blue alone is not enough: the model also checks preparation and
                excessive titrant.
              </p>
            </article>
            <article>
              <h3>Technique checklist</h3>
              <ul>
                <li>
                  Condition the burette with EDTA and pipette with the current
                  sample.
                </li>
                <li>Clear bubbles before taking the initial reading.</li>
                <li>Mix before judging the endpoint.</li>
                <li>
                  Keep the final and initial readings; subtract to obtain the
                  titre.
                </li>
                <li>Discard and rinse before every fresh aliquot.</li>
              </ul>
            </article>
            <article>
              <h3>Small glossary</h3>
              <dl>
                <div>
                  <dt>Aliquot</dt>
                  <dd>A measured portion of a sample; here, 20 mL.</dd>
                </div>
                <div>
                  <dt>Titre</dt>
                  <dd>
                    Delivered EDTA volume: final minus initial burette reading.
                  </dd>
                </div>
                <div>
                  <dt>Concordant</dt>
                  <dd>
                    Repeated titres that agree within the chosen tolerance.
                  </dd>
                </div>
                <div>
                  <dt>Standardization</dt>
                  <dd>
                    Finding titrant strength using a sample of known hardness.
                  </dd>
                </div>
              </dl>
            </article>
            <article>
              <h3>Bench snapshot</h3>
              <dl>
                <div>
                  <dt>Selected sample</dt>
                  <dd>
                    {s.sample === "standard"
                      ? "Standard hard water"
                      : "Unknown water"}
                  </dd>
                </div>
                <div>
                  <dt>Liquid in flask</dt>
                  <dd>{volume(s.vessels.flask).toFixed(2)} mL</dd>
                </div>
                <div>
                  <dt>Buffer in flask</dt>
                  <dd>{contents.buffer.toFixed(2)} mL</dd>
                </div>
                <div>
                  <dt>EBT added</dt>
                  <dd>{Math.round(contents.indicator / 0.05)} drops</dd>
                </div>
              </dl>
            </article>
          </div>
          <p className="procedure-guide-source">
            Procedure: BCHY101P manual, PDF pages 4–6. This simulation uses
            ideal stoichiometric binding and qualitative colours. The 4 mL
            buffer convention and {s.config.concordanceMl.toFixed(2)} mL
            agreement tolerance are stated teaching choices; simulated results
            are not physical laboratory measurements.
          </p>
        </div>
      )}
    </section>
  );
}
