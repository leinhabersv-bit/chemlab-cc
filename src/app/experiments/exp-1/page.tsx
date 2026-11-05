"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import "./exp1.css";

/* ====================================================================
   1. TYPES & DATA
   ==================================================================== */

interface TrialRecord {
  trial: number;
  initial: number;
  final: number;
  titre: number;
}

interface CoachStep {
  text: string;
  targetId: string;
  zoneId?: string;
}

/* ====================================================================
   2. COMPONENT
   ==================================================================== */

export default function ExperimentOnePage() {
  // Random hidden truth values (fresh each session)
  const truths = useRef({
    v1: 19.4 + Math.random() * 1.2, // ~20.00 mL standard titre
    trueHardness: Math.round(160 + Math.random() * 240), // 160-400 ppm
  }).current;

  const targetV2 = (truths.trueHardness / 1000) * truths.v1;

  // Lab bench state
  const [phase, setPhase] = useState<1 | 2>(1); // 1 = Standardization, 2 = Unknown Sample
  const [flaskPlaced, setFlaskPlaced] = useState(false);
  const [buretteFilled, setBuretteFilled] = useState(false);
  const [pipetteAdded, setPipetteAdded] = useState(false);
  const [bufferAdded, setBufferAdded] = useState(false);
  const [ebtAdded, setEbtAdded] = useState(false);
  const [buretteUsed, setBuretteUsed] = useState(0);
  const [finalRecorded, setFinalRecorded] = useState<number | null>(null);
  const [trials, setTrials] = useState<{ 1: number[]; 2: number[] }>({ 1: [], 2: [] });
  const [concordant, setConcordant] = useState<{ 1: number | null; 2: number | null }>({ 1: null, 2: null });
  const [isRunning, setIsRunning] = useState(false);
  const [dropsPulse, setDropsPulse] = useState(0);
  const [endpointReached, setEndpointReached] = useState(false);

  // Result check
  const [userHardnessInput, setUserHardnessInput] = useState("");
  const [evalResult, setEvalResult] = useState<{
    calculated: number;
    trueHardness: number;
    errorPct: number;
    marks: number;
    bisDeviation: number;
    isPotable: boolean;
  } | null>(null);

  // UI state
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showTheoryModal, setShowTheoryModal] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [coachStep, setCoachStep] = useState<CoachStep | null>(null);
  const [coachPos, setCoachPos] = useState({ left: 0, top: 0, isBelow: true, arrowX: 24 });
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [hotZone, setHotZone] = useState<"flask" | "burette" | null>(null);

  // References
  const stageRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const coachTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const warnSoundRef = useRef(false);

  // Scale stage to fit viewport
  const updateStageScale = useCallback(() => {
    if (!wrapRef.current || !stageRef.current) return;
    const wrapRect = wrapRef.current.getBoundingClientRect();
    const scale = Math.min(wrapRect.width / 1000, wrapRect.height / 620);
    stageRef.current.style.transform = `scale(${scale})`;
    stageRef.current.style.left = `${(wrapRect.width - 1000 * scale) / 2}px`;
    stageRef.current.style.top = `${(wrapRect.height - 620 * scale) / 2}px`;
  }, []);

  useEffect(() => {
    updateStageScale();
    window.addEventListener("resize", updateStageScale);
    return () => window.removeEventListener("resize", updateStageScale);
  }, [updateStageScale]);

  // Show Toast
  const triggerToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), 3200);
  }, []);

  // Target endpoint volume for current phase
  const currentTargetEndpoint = useMemo(() => {
    return phase === 1 ? truths.v1 : targetV2;
  }, [phase, truths.v1, targetV2]);

  // Determine active coach step
  const getNextStep = useCallback((): CoachStep | null => {
    if (!flaskPlaced) {
      return {
        text: "Drag the conical flask and drop it onto the white tile beneath the burette.",
        targetId: "tray-flask",
        zoneId: "zone-flask",
      };
    }
    if (!buretteFilled) {
      return {
        text: "Drag 0.01 N EDTA onto the burette tube to fill and zero the meniscus.",
        targetId: "tray-edta",
        zoneId: "zone-bur",
      };
    }
    if (!pipetteAdded) {
      return {
        text: `Pipette 20.0 mL of ${phase === 1 ? "standard hard water (1000 ppm)" : "the unknown water sample"} into the conical flask.`,
        targetId: "tray-pip",
        zoneId: "zone-flask",
      };
    }
    if (!bufferAdded) {
      return {
        text: "Add 4 mL of ammonia buffer (NH₃–NH₄Cl) to hold the pH at 10 for EDTA complexation.",
        targetId: "tray-buf",
        zoneId: "zone-flask",
      };
    }
    if (!ebtAdded) {
      return {
        text: "Add 3 drops of Eriochrome Black-T (EBT). The solution turns wine-red with free Ca²⁺/Mg²⁺.",
        targetId: "tray-ebt",
        zoneId: "zone-flask",
      };
    }
    if (finalRecorded === null && !endpointReached) {
      return {
        text: "Hold 'Hold to Run' to deliver EDTA. Switch to single drops once wine-red shifts to purple.",
        targetId: "btn-run",
      };
    }
    if (finalRecorded === null) {
      return {
        text: "The solution is steel blue (all metal ions complexed). Click 'Record Final Reading'.",
        targetId: "btn-fin",
      };
    }
    return null;
  }, [flaskPlaced, buretteFilled, pipetteAdded, bufferAdded, ebtAdded, finalRecorded, endpointReached, phase]);

  // Update coach position
  const positionCoach = useCallback((step: CoachStep) => {
    const el = document.getElementById(step.targetId);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = 280;
    const isBelow = r.bottom + 120 < window.innerHeight;
    const left = Math.max(12, Math.min(window.innerWidth - w - 12, r.left + r.width / 2 - w / 2));
    const top = isBelow ? r.bottom + 12 : Math.max(10, r.top - 110);
    const arrowX = Math.max(16, Math.min(w - 24, r.left + r.width / 2 - left - 6));
    setCoachPos({ left, top, isBelow, arrowX });
    setShowCoach(true);
  }, []);

  const refreshCoach = useCallback(() => {
    const next = getNextStep();
    setCoachStep(next);
    if (next) {
      positionCoach(next);
      if (coachTimeoutRef.current) clearTimeout(coachTimeoutRef.current);
      coachTimeoutRef.current = setTimeout(() => setShowCoach(false), 9000);
    } else {
      setShowCoach(false);
    }
  }, [getNextStep, positionCoach]);

  useEffect(() => {
    const timer = setTimeout(refreshCoach, 400);
    return () => clearTimeout(timer);
  }, [refreshCoach]);

  // Main animation loop for liquid delivery and color changes
  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      // Handle running flow
      if (isRunning && ebtAdded && buretteFilled && finalRecorded === null && buretteUsed < 50) {
        setBuretteUsed((prev) => {
          const next = Math.min(50, prev + 1.25 * dt);
          return next;
        });
      }

      // Handle drop pulse decay
      if (dropsPulse > 0) {
        setDropsPulse((prev) => Math.max(0, prev - dt));
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, ebtAdded, buretteFilled, finalRecorded, buretteUsed, dropsPulse]);

  // Endpoint detection and warnings
  useEffect(() => {
    const f = buretteUsed / currentTargetEndpoint;
    if (ebtAdded && f >= 1.0 && !endpointReached && finalRecorded === null) {
      setEndpointReached(true);
      setIsRunning(false);
      triggerToast("Steel blue endpoint reached! Stop titration and record reading.");
    }
    if (ebtAdded && f > 0.85 && f < 1.0 && !warnSoundRef.current) {
      warnSoundRef.current = true;
      triggerToast("Solution turning purple: switch to single 0.05 mL drops.");
    }
  }, [buretteUsed, currentTargetEndpoint, ebtAdded, endpointReached, finalRecorded, triggerToast]);

  // Color calculation for conical flask solution
  const solutionColor = useMemo(() => {
    if (!ebtAdded) {
      return bufferAdded ? "#e4eff5" : pipetteAdded ? "#dbe9f4" : "transparent";
    }

    const f = buretteUsed / currentTargetEndpoint;
    // Wine Red: rgb(158, 31, 61), Purple: rgb(110, 62, 145), Steel Blue: rgb(72, 126, 184)
    if (f < 0.85) {
      return "rgb(158, 31, 61)"; // Wine red complex
    }
    const t = Math.min(1, Math.max(0, (f - 0.85) / 0.15));
    if (t < 0.5) {
      // Wine Red to Purple
      const k = t * 2;
      const r = Math.round(158 + (110 - 158) * k);
      const g = Math.round(31 + (62 - 31) * k);
      const b = Math.round(61 + (145 - 61) * k);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Purple to Steel Blue
      const k = (t - 0.5) * 2;
      const r = Math.round(110 + (72 - 110) * k);
      const g = Math.round(62 + (126 - 62) * k);
      const b = Math.round(145 + (184 - 145) * k);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }, [ebtAdded, bufferAdded, pipetteAdded, buretteUsed, currentTargetEndpoint]);

  // Handle Drag & Drop
  const handleItemAction = useCallback(
    (id: string) => {
      setShowCoach(false);

      if (id === "flask") {
        if (flaskPlaced) return;
        setFlaskPlaced(true);
        triggerToast("Conical flask mounted on white tile ✓");
        return;
      }

      if (id === "edta") {
        if (buretteFilled) {
          triggerToast("Burette is already filled to 0.00 mL.");
          return;
        }
        setBuretteFilled(true);
        setBuretteUsed(0);
        triggerToast("Class-A burette filled with 0.01 N EDTA to 0.00 mL ✓");
        return;
      }

      if (!flaskPlaced) {
        triggerToast("Mount the conical flask onto the white tile first.");
        return;
      }

      if (id === "pip") {
        if (pipetteAdded) {
          triggerToast("20 mL aliquot already dispensed into the flask.");
          return;
        }
        setPipetteAdded(true);
        triggerToast(
          `20.0 mL of ${phase === 1 ? "standard hard water (1000 ppm)" : "water sample"} pipetted into flask ✓`
        );
        return;
      }

      if (id === "buf") {
        if (!pipetteAdded) {
          triggerToast("Pipette water sample into the flask first.");
          return;
        }
        if (bufferAdded) return;
        setBufferAdded(true);
        triggerToast("4 mL NH₃–NH₄Cl buffer added: pH held at 10 ✓");
        return;
      }

      if (id === "ebt") {
        if (!bufferAdded) {
          triggerToast("Add ammonia buffer before the indicator to ensure pH 10.");
          return;
        }
        if (ebtAdded) return;
        setEbtAdded(true);
        warnSoundRef.current = false;
        triggerToast("3 drops EBT indicator added: solution turns wine red ✓");
        return;
      }
    },
    [flaskPlaced, buretteFilled, pipetteAdded, bufferAdded, ebtAdded, phase, triggerToast]
  );

  // Single drop delivery (+0.05 mL)
  const handleSingleDrop = () => {
    if (!ebtAdded || !buretteFilled || finalRecorded !== null || buretteUsed >= 50) return;
    setBuretteUsed((prev) => Math.min(50, prev + 0.05));
    setDropsPulse(0.3);
    setShowCoach(false);
  };

  // Record final reading
  const handleRecordFinal = () => {
    if (finalRecorded !== null || !ebtAdded) return;
    const f = buretteUsed / currentTargetEndpoint;
    if (f < 0.9) {
      triggerToast("Endpoint not yet reached: solution must turn steel blue.");
      return;
    }

    const roundedVal = Math.round(buretteUsed * 20) / 20;
    setFinalRecorded(roundedVal);

    const updatedList = [...trials[phase], roundedVal];
    setTrials((prev) => ({ ...prev, [phase]: updatedList }));

    const len = updatedList.length;
    if (len >= 2 && Math.abs(updatedList[len - 1] - updatedList[len - 2]) <= 0.1) {
      const concValue = Math.round(((updatedList[len - 1] + updatedList[len - 2]) / 2) * 20) / 20;
      setConcordant((prev) => ({ ...prev, [phase]: concValue }));
      triggerToast(`Concordant titre confirmed: V${phase} = ${concValue.toFixed(2)} mL ✓`);
    } else {
      if (f > 1.05) {
        triggerToast(`Recorded ${roundedVal.toFixed(2)} mL (slightly overshot). Repeat for concordant value.`);
      } else {
        triggerToast(`Reading ${roundedVal.toFixed(2)} mL recorded ✓. Need 2 trials within ±0.1 mL.`);
      }
    }
  };

  // Reset bench for next trial or phase
  const handleNextTrialOrPhase = (advancePhase: boolean) => {
    if (advancePhase) {
      setPhase(2);
      triggerToast("Titration II: 20 mL pipette now dispenses unknown water sample.");
    } else {
      triggerToast("Preparing next trial. Flask cleaned and reset.");
    }

    setFlaskPlaced(false);
    setPipetteAdded(false);
    setBufferAdded(false);
    setEbtAdded(false);
    setFinalRecorded(null);
    setBuretteUsed(0);
    setEndpointReached(false);
    setIsRunning(false);
    warnSoundRef.current = false;
  };

  // Completely reset experiment
  const handleFullReset = () => {
    setPhase(1);
    setFlaskPlaced(false);
    setBuretteFilled(false);
    setPipetteAdded(false);
    setBufferAdded(false);
    setEbtAdded(false);
    setBuretteUsed(0);
    setFinalRecorded(null);
    setTrials({ 1: [], 2: [] });
    setConcordant({ 1: null, 2: null });
    setIsRunning(false);
    setEndpointReached(false);
    setEvalResult(null);
    setUserHardnessInput("");
    triggerToast("Lab bench reset to initial state.");
  };

  // Grade user hardness calculation
  const handleCheckHardness = () => {
    const val = parseFloat(userHardnessInput);
    if (isNaN(val) || val <= 0) {
      triggerToast("Please enter a valid positive number for hardness in ppm.");
      return;
    }

    const trueH = truths.trueHardness;
    const errorPct = (Math.abs(val - trueH) / trueH) * 100;

    let marks = 1;
    if (errorPct <= 2.0) marks = 10;
    else if (errorPct <= 3.0) marks = 9;
    else if (errorPct <= 4.0) marks = 8;

    const bisDev = ((val - 200) / 200) * 100;
    const isPotable = val <= 200;

    setEvalResult({
      calculated: val,
      trueHardness: trueH,
      errorPct,
      marks,
      bisDeviation: bisDev,
      isPotable,
    });
  };

  // "Show me" ghost animation demo
  const handleDemo = (step: CoachStep) => {
    setShowCoach(false);
    const src = document.getElementById(step.targetId);
    const z = step.zoneId ? document.getElementById(step.zoneId) : null;
    const ghost = document.getElementById("ghost");
    if (!src || !z || !ghost) return;

    ghost.innerHTML = src.innerHTML;
    ghost.style.left = `${src.offsetLeft}px`;
    ghost.style.top = `${src.offsetTop}px`;
    ghost.style.opacity = "0.9";
    ghost.style.transition = "none";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ghost.style.transition = "all 1.2s cubic-bezier(0.2, 0, 0.1, 1)";
        ghost.style.left = `${z.offsetLeft + z.offsetWidth / 2 - 48}px`;
        ghost.style.top = `${z.offsetTop + z.offsetHeight / 2 - 40}px`;
      });
    });

    setTimeout(() => {
      ghost.style.opacity = "0";
    }, 1400);
    setTimeout(() => {
      ghost.innerHTML = "";
    }, 1800);
  };

  // Dragging event handlers
  const onPointerDownItem = (e: React.PointerEvent, id: string) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragItem(id);
    setShowCoach(false);
  };

  const onPointerMoveStage = (e: React.PointerEvent) => {
    if (!dragItem || !stageRef.current) return;
    const stageRect = stageRef.current.getBoundingClientRect();
    const scale = stageRect.width / 1000;
    const mouseX = (e.clientX - stageRect.left) / scale;
    const mouseY = (e.clientY - stageRect.top) / scale;

    // Check hit test against zones
    if (mouseX >= 410 && mouseX <= 590 && mouseY >= 380 && mouseY <= 530) {
      if (dragItem !== "edta") setHotZone("flask");
      else setHotZone(null);
    } else if (mouseX >= 470 && mouseX <= 530 && mouseY >= 50 && mouseY <= 340) {
      if (dragItem === "edta") setHotZone("burette");
      else setHotZone(null);
    } else {
      setHotZone(null);
    }
  };

  const onPointerUpItem = (e: React.PointerEvent, id: string) => {
    if (hotZone === "flask" && id !== "edta") {
      handleItemAction(id);
    } else if (hotZone === "burette" && id === "edta") {
      handleItemAction(id);
    }
    setDragItem(null);
    setHotZone(null);
  };

  return (
    <div className="exp1-root">
      {/* Navigation Header */}
      <header className="exp1-nav">
        <div className="exp1-brand">
          <Link href="/" className="exp1-back-btn" aria-label="Return to CHEMLAB CC homepage">
            ← Home
          </Link>
          <div className="exp1-title-group">
            <h1>
              Experiment 1: Total Hardness of Water by EDTA Titration
              <span className="exp1-badge">BCHY101P</span>
            </h1>
            <p>School of Advanced Sciences · Division of Chemistry · VIT Chennai</p>
          </div>
        </div>
        <div className="exp1-nav-actions">
          <button
            type="button"
            className="exp1-btn-subtle"
            onClick={() => setShowTheoryModal(true)}
            aria-label="View laboratory theory and equations"
          >
            ℹ Theory & Formulas
          </button>
          <button
            type="button"
            className="exp1-btn-subtle"
            id="btn-hint"
            onClick={() => refreshCoach()}
            aria-label="Show contextual hint"
          >
            ? Hint
          </button>
          <button
            type="button"
            className="exp1-btn-subtle"
            onClick={handleFullReset}
            aria-label="Reset virtual laboratory bench"
          >
            ↻ Reset Bench
          </button>
        </div>
      </header>

      {/* Main Work Area */}
      <main className="exp1-main">
        {/* Stage Wrapper */}
        <div className="exp1-wrap" ref={wrapRef}>
          <div className="exp1-stage" ref={stageRef} onPointerMove={onPointerMoveStage}>
            {/* SVG Apparatus Scene */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 620">
              <defs>
                <clipPath id="flaskClip">
                  <path d="M482 400H518V445L575 518Q579 522 572 522H428Q421 522 425 518L482 445Z" />
                </clipPath>
              </defs>

              {/* Bench surface */}
              <rect x="200" y="520" width="800" height="100" fill="var(--exp-bench)" />
              <rect x="200" y="516" width="800" height="6" fill="rgba(0,0,0,0.25)" />

              {/* White titration tile */}
              <rect x="400" y="518" width="200" height="6" rx="3" fill="#ffffff" opacity="0.95" />

              {/* Retort Stand & Clamp */}
              <rect x="718" y="60" width="10" height="460" fill="var(--exp-rod)" />
              <rect x="620" y="512" width="220" height="10" rx="4" fill="var(--exp-rod)" />
              <rect x="505" y="150" width="220" height="7" fill="var(--exp-rod)" />
              <rect x="494" y="140" width="22" height="30" rx="3" fill="var(--exp-rod)" />

              {/* Burette graduations (0 to 50 mL) */}
              <g stroke="var(--exp-mute)" strokeWidth="1" fontSize="10" fill="var(--exp-mute)">
                {[...Array(11)].map((_, i) => {
                  const m = i * 5;
                  const y = 72 + m * 5.2;
                  return (
                    <g key={m}>
                      <line x1="481" x2="488" y1={y} y2={y} />
                      <text x="460" y={y + 3} textAnchor="end">
                        {m}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Burette Tube (Glass) */}
              <rect
                x="488"
                y="70"
                width="24"
                height="262"
                rx="3"
                fill="var(--exp-glass)"
                stroke="var(--exp-line)"
                strokeWidth="1.5"
              />

              {/* Burette Liquid Column */}
              <rect
                x="490"
                y={72 + (buretteFilled ? buretteUsed * 5.2 : 0)}
                width="20"
                height={buretteFilled ? Math.max(0, 260 - buretteUsed * 5.2) : 0}
                fill="#9fd3ff"
                opacity="0.85"
              />

              {/* Stopcock valve assembly */}
              <rect x="494" y="332" width="12" height="9" fill="var(--exp-rod)" />
              <rect
                x="484"
                y="334"
                width="32"
                height="6"
                rx="2"
                fill="#dc2626"
                transform={isRunning ? "rotate(90 500 337)" : "none"}
                style={{ transition: "transform 0.15s ease" }}
              />

              {/* Burette tip */}
              <path d="M497 341H503V362L500 368L497 362Z" fill="var(--exp-glass)" stroke="var(--exp-line)" />

              {/* Falling droplet */}
              {(isRunning || dropsPulse > 0) && (
                <circle cx="500" cy="378" r="3.2" fill="#9fd3ff" opacity="0.9" />
              )}

              {/* Conical Flask on Bench */}
              {flaskPlaced && (
                <g>
                  {/* Flask Liquid */}
                  <g clipPath="url(#flaskClip)">
                    <rect
                      x="420"
                      y={
                        522 -
                        (pipetteAdded
                          ? Math.min(115, 20 + (bufferAdded ? 8 : 0) + (ebtAdded ? 4 : 0) + buretteUsed * 1.5)
                          : 0)
                      }
                      width="160"
                      height={
                        pipetteAdded
                          ? Math.min(115, 20 + (bufferAdded ? 8 : 0) + (ebtAdded ? 4 : 0) + buretteUsed * 1.5)
                          : 0
                      }
                      fill={solutionColor}
                      opacity="0.92"
                    />
                  </g>
                  {/* Glass Outline */}
                  <path
                    d="M482 400H518V445L575 518Q579 522 572 522H428Q421 522 425 518L482 445Z"
                    fill="rgba(255,255,255,0.12)"
                    stroke="var(--exp-mute)"
                    strokeWidth="2"
                  />
                </g>
              )}
            </svg>

            {/* Apparatus Tray on Stage */}
            <div className="exp1-tray">
              <span className="exp1-tray-header">Apparatus Tray</span>
              <div className="exp1-tray-items">
                {/* 1. Conical Flask */}
                <div
                  id="tray-flask"
                  className={`exp1-item ${dragItem === "flask" ? "drag" : ""} ${flaskPlaced ? "gone" : ""}`}
                  onPointerDown={(e) => onPointerDownItem(e, "flask")}
                  onPointerUp={(e) => onPointerUpItem(e, "flask")}
                >
                  <svg viewBox="0 0 70 78">
                    <path
                      d="M27 6h16v22l20 40q2 6-4 6H11q-6 0-4-6l20-40z"
                      fill="#ffffff44"
                      stroke="#8e9e96"
                      strokeWidth="2.5"
                    />
                  </svg>
                  <span className="exp1-item-label">Conical Flask</span>
                  <span className="exp1-item-sub">250 mL Pyrex</span>
                  <button
                    type="button"
                    className="exp1-item-quick-btn"
                    onClick={() => handleItemAction("flask")}
                    aria-label="Mount conical flask onto white tile"
                  >
                    Place
                  </button>
                </div>

                {/* 2. 0.01 N EDTA Bottle */}
                <div
                  id="tray-edta"
                  className={`exp1-item ${dragItem === "edta" ? "drag" : ""}`}
                  onPointerDown={(e) => onPointerDownItem(e, "edta")}
                  onPointerUp={(e) => onPointerUpItem(e, "edta")}
                >
                  <svg viewBox="0 0 70 78">
                    <rect x="26" y="4" width="18" height="12" rx="3" fill="#555" />
                    <path d="M24 16h22l6 12v42q0 6-6 6H24q-6 0-6-6V28z" fill="#cfe6ff" stroke="#0004" />
                    <rect x="21" y="38" width="28" height="22" rx="3" fill="#fff" />
                    <text x="35" y="53" fontSize="9" textAnchor="middle" fill="#222" fontWeight="600">
                      EDTA
                    </text>
                  </svg>
                  <span className="exp1-item-label">0.01 N EDTA</span>
                  <span className="exp1-item-sub">Standard Titrant</span>
                  <button
                    type="button"
                    className="exp1-item-quick-btn"
                    onClick={() => handleItemAction("edta")}
                    aria-label="Fill Class-A burette with EDTA"
                  >
                    Fill
                  </button>
                </div>

                {/* 3. 20 mL Pipette */}
                <div
                  id="tray-pip"
                  className={`exp1-item ${dragItem === "pip" ? "drag" : ""}`}
                  onPointerDown={(e) => onPointerDownItem(e, "pip")}
                  onPointerUp={(e) => onPointerUpItem(e, "pip")}
                >
                  <svg viewBox="0 0 70 78">
                    <rect x="32" y="2" width="6" height="52" fill="#ffffff55" stroke="#778" />
                    <ellipse cx="35" cy="34" rx="9" ry="12" fill="#ffffff55" stroke="#778" />
                    <path d="M32 54l3 20 3-20z" fill="#ffffff55" stroke="#778" />
                    <rect x="32" y="40" width="6" height="14" fill="#8cc4ff" />
                  </svg>
                  <span className="exp1-item-label">
                    {phase === 1 ? "20 mL Pipette" : "20 mL Sample Pipette"}
                  </span>
                  <span className="exp1-item-sub">
                    {phase === 1 ? "Std Hard Water" : "Water Sample"}
                  </span>
                  <button
                    type="button"
                    className="exp1-item-quick-btn"
                    onClick={() => handleItemAction("pip")}
                    aria-label="Pipette 20 mL water into flask"
                  >
                    Pipette
                  </button>
                </div>

                {/* 4. Ammonia Buffer Bottle */}
                <div
                  id="tray-buf"
                  className={`exp1-item ${dragItem === "buf" ? "drag" : ""}`}
                  onPointerDown={(e) => onPointerDownItem(e, "buf")}
                  onPointerUp={(e) => onPointerUpItem(e, "buf")}
                >
                  <svg viewBox="0 0 70 78">
                    <rect x="26" y="4" width="18" height="12" rx="3" fill="#555" />
                    <path d="M24 16h22l6 12v42q0 6-6 6H24q-6 0-6-6V28z" fill="#e8e1b8" stroke="#0004" />
                    <rect x="21" y="38" width="28" height="22" rx="3" fill="#fff" />
                    <text x="35" y="53" fontSize="9" textAnchor="middle" fill="#222" fontWeight="600">
                      pH 10
                    </text>
                  </svg>
                  <span className="exp1-item-label">NH₃–NH₄Cl Buffer</span>
                  <span className="exp1-item-sub">Maintains pH 10</span>
                  <button
                    type="button"
                    className="exp1-item-quick-btn"
                    onClick={() => handleItemAction("buf")}
                    aria-label="Add ammonia buffer to flask"
                  >
                    Add
                  </button>
                </div>

                {/* 5. EBT Indicator Bottle */}
                <div
                  id="tray-ebt"
                  className={`exp1-item ${dragItem === "ebt" ? "drag" : ""}`}
                  onPointerDown={(e) => onPointerDownItem(e, "ebt")}
                  onPointerUp={(e) => onPointerUpItem(e, "ebt")}
                >
                  <svg viewBox="0 0 70 78">
                    <rect x="26" y="4" width="18" height="12" rx="3" fill="#555" />
                    <path d="M24 16h22l6 12v42q0 6-6 6H24q-6 0-6-6V28z" fill="#7b2a4b" stroke="#0004" />
                    <rect x="21" y="38" width="28" height="22" rx="3" fill="#fff" />
                    <text x="35" y="53" fontSize="9" textAnchor="middle" fill="#fff" fontWeight="600">
                      EBT
                    </text>
                  </svg>
                  <span className="exp1-item-label">EBT Indicator</span>
                  <span className="exp1-item-sub">Wine-red → Blue</span>
                  <button
                    type="button"
                    className="exp1-item-quick-btn"
                    onClick={() => handleItemAction("ebt")}
                    aria-label="Add 3 drops of EBT indicator"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Drop Zones */}
            <div
              id="zone-flask"
              className={`exp1-zone ${hotZone === "flask" ? "hot" : ""}`}
              style={{ left: "410px", top: "380px", width: "180px", height: "150px" }}
            />
            <div
              id="zone-bur"
              className={`exp1-zone ${hotZone === "burette" ? "hot" : ""}`}
              style={{ left: "470px", top: "50px", width: "64px", height: "290px" }}
            />

            {/* Burette HUD Readout */}
            <div className="exp1-hud">
              <span>
                Burette: {buretteFilled ? (Math.round(buretteUsed * 20) / 20).toFixed(2) : "–"} mL
              </span>
              <small>Read the lower liquid meniscus</small>
            </div>

            {/* Ghost demo node */}
            <div id="ghost" />
          </div>
        </div>

        {/* Right Cockpit Aside */}
        <aside className="exp1-cockpit">
          {/* Section 1: Checklist */}
          <section className="exp1-section">
            <div className="exp1-section-header">
              <h2 className="exp1-section-title">Step Checklist</h2>
              <span className="exp1-badge">{phase === 1 ? "Titration I" : "Titration II"}</span>
            </div>
            <ul className="exp1-steps">
              <li className={flaskPlaced ? "done" : ""}>Place 250 mL conical flask on white tile</li>
              <li className={buretteFilled ? "done" : ""}>Fill Class-A burette with 0.01 N EDTA to 0.00 mL</li>
              <li className={pipetteAdded ? "done" : ""}>
                Pipette 20.0 mL of {phase === 1 ? "standard hard water" : "water sample"}
              </li>
              <li className={bufferAdded ? "done" : ""}>Add 4 mL ammonia buffer (pH 10)</li>
              <li className={ebtAdded ? "done" : ""}>Add 3 drops EBT indicator (wine red)</li>
              <li className={endpointReached || finalRecorded !== null ? "done" : ""}>
                Titrate dropwise until wine-red turns steel blue
              </li>
              <li className={finalRecorded !== null ? "done" : ""}>Record final burette meniscus reading</li>
            </ul>
          </section>

          {/* Section 2: Titration Controls */}
          <section className="exp1-section">
            <h2 className="exp1-section-title">Titration Controls</h2>
            <div className="exp1-row">
              <button
                type="button"
                id="btn-run"
                className="exp1-btn-primary"
                disabled={!ebtAdded || !buretteFilled || finalRecorded !== null || buretteUsed >= 50}
                onPointerDown={() => {
                  setIsRunning(true);
                  setShowCoach(false);
                }}
                onPointerUp={() => setIsRunning(false)}
                onPointerLeave={() => setIsRunning(false)}
              >
                Hold to Run
              </button>
              <button
                type="button"
                id="btn-drop"
                className="exp1-btn-secondary"
                disabled={!ebtAdded || !buretteFilled || finalRecorded !== null || buretteUsed >= 50}
                onClick={handleSingleDrop}
              >
                1 Drop (+0.05 mL)
              </button>
            </div>
            <div className="exp1-row" style={{ marginTop: "4px" }}>
              <button
                type="button"
                id="btn-fin"
                className="exp1-btn-secondary"
                disabled={!ebtAdded || finalRecorded !== null || buretteUsed === 0}
                onClick={handleRecordFinal}
              >
                Record Final Reading
              </button>
            </div>
            <p className="exp1-tip-note">
              Tip: Solution transitions from wine-red to purple near 85% completion. Switch to single drops for an
              exact steel-blue endpoint.
            </p>
          </section>

          {/* Section 3: Lab Notebook */}
          <section className="exp1-section">
            <div className="exp1-section-header">
              <h2 className="exp1-section-title">Lab Notebook</h2>
              <span className="exp1-badge">±0.1 mL Concordance</span>
            </div>
            <table className="exp1-table">
              <thead>
                <tr>
                  <th>Trial</th>
                  <th>Initial (mL)</th>
                  <th>Final (mL)</th>
                  <th>Titre (mL)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="exp1-table-subhead">
                    Titration I: Standardisation of EDTA vs Standard Hard Water
                  </td>
                </tr>
                {trials[1].map((v, i) => (
                  <tr key={`t1-${i}`}>
                    <td>I · {i + 1}</td>
                    <td>0.00</td>
                    <td>{v.toFixed(2)}</td>
                    <td>{v.toFixed(2)}</td>
                  </tr>
                ))}
                {concordant[1] !== null && (
                  <tr style={{ background: "rgba(61, 214, 186, 0.12)" }}>
                    <td colSpan={3} style={{ fontWeight: 600 }}>
                      Concordant Volume (V₁)
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--exp-acc)" }}>
                      {concordant[1].toFixed(2)} mL
                    </td>
                  </tr>
                )}

                {phase === 2 && (
                  <>
                    <tr>
                      <td colSpan={4} className="exp1-table-subhead">
                        Titration II: Determination of Unknown Sample Hardness
                      </td>
                    </tr>
                    {trials[2].map((v, i) => (
                      <tr key={`t2-${i}`}>
                        <td>II · {i + 1}</td>
                        <td>0.00</td>
                        <td>{v.toFixed(2)}</td>
                        <td>{v.toFixed(2)}</td>
                      </tr>
                    ))}
                    {concordant[2] !== null && (
                      <tr style={{ background: "rgba(61, 214, 186, 0.12)" }}>
                        <td colSpan={3} style={{ fontWeight: 600 }}>
                          Concordant Volume (V₂)
                        </td>
                        <td style={{ fontWeight: 700, color: "var(--exp-acc)" }}>
                          {concordant[2].toFixed(2)} mL
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>

            {/* Next trial / Phase advance buttons */}
            {finalRecorded !== null && (
              <div style={{ marginTop: "8px" }}>
                {concordant[phase] === null ? (
                  <button
                    type="button"
                    className="exp1-btn-primary w-full"
                    onClick={() => handleNextTrialOrPhase(false)}
                  >
                    Repeat Trial (Need 2 within ±0.1 mL)
                  </button>
                ) : phase === 1 ? (
                  <button
                    type="button"
                    className="exp1-btn-primary w-full"
                    onClick={() => handleNextTrialOrPhase(true)}
                  >
                    Proceed to Titration II (Water Sample) →
                  </button>
                ) : null}
              </div>
            )}
          </section>

          {/* Section 4: Hardness Calculation & Scoring */}
          {concordant[2] !== null && (
            <section className="exp1-section">
              <h2 className="exp1-section-title">Calculation & Result Evaluation</h2>
              <div className="exp1-res-card">
                <p style={{ fontSize: "12.5px", color: "var(--exp-mute)", margin: 0 }}>
                  Formula: <code>Total Hardness = (V₂ / V₁) × 1000 ppm</code>
                  <br />
                  With V₁ = {concordant[1]?.toFixed(2)} mL and V₂ = {concordant[2]?.toFixed(2)} mL.
                </p>
                <div className="exp1-input-group">
                  <input
                    type="number"
                    step="0.1"
                    className="exp1-input"
                    placeholder="e.g. 250"
                    value={userHardnessInput}
                    onChange={(e) => setUserHardnessInput(e.target.value)}
                    aria-label="Enter calculated total hardness in ppm"
                  />
                  <span style={{ fontSize: "13px", fontWeight: 500 }}>ppm</span>
                  <button type="button" className="exp1-btn-primary" onClick={handleCheckHardness}>
                    Check & Grade
                  </button>
                </div>

                {evalResult && (
                  <div className={`exp1-score-box ${evalResult.errorPct <= 2.0 ? "pass" : "warn"}`}>
                    <p style={{ margin: "0 0 6px" }}>
                      Your calculated hardness: <b>{evalResult.calculated.toFixed(1)} ppm</b>
                      <br />
                      True sample hardness: <b>{evalResult.trueHardness} ppm</b> (Error:{" "}
                      <b>{evalResult.errorPct.toFixed(2)}%</b>)
                    </p>
                    <p style={{ margin: "0 0 6px" }}>
                      FAT Skill Marks: <b>{evalResult.marks}/10</b>
                      <span style={{ fontSize: "11px", color: "var(--exp-mute)", marginLeft: "6px" }}>
                        (≤2% = 10M, 2–3% = 9M, 3–4% = 8M)
                      </span>
                    </p>
                    <p style={{ margin: 0, color: evalResult.isPotable ? "var(--exp-acc)" : "var(--exp-warn)" }}>
                      BIS 10500:2012 Assessment: Sample deviates{" "}
                      <b>{evalResult.bisDeviation > 0 ? "+" : ""}{evalResult.bisDeviation.toFixed(1)}%</b> against the
                      200 ppm potable limit. {evalResult.isPotable ? "Acceptable without softening." : "Requires softening."}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}
        </aside>
      </main>

      {/* Floating Pedagogical Step Coach */}
      {showCoach && coachStep && (
        <div
          className="exp1-coach on"
          style={{
            left: `${coachPos.left}px`,
            top: `${coachPos.top}px`,
            ["--ax" as any]: `${coachPos.arrowX}px`,
          }}
          role="status"
        >
          <div className={`exp1-coach-arrow ${coachPos.isBelow ? "t" : "b"}`} />
          <p style={{ margin: 0 }}>{coachStep.text}</p>
          <div className="exp1-coach-actions">
            {coachStep.zoneId && (
              <button type="button" onClick={() => handleDemo(coachStep)}>
                Show me
              </button>
            )}
            <button type="button" onClick={() => setShowCoach(false)}>
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && <div className="exp1-toast">{toastMsg}</div>}

      {/* Theory & Equations Modal */}
      {showTheoryModal && (
        <div className="exp1-modal-backdrop" onClick={() => setShowTheoryModal(false)}>
          <div className="exp1-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Experiment 1: Principle & Calculations</h2>
            <p>
              Hardness in water is caused by divalent metallic cations, primarily calcium (Ca²⁺) and magnesium (Mg²⁺).
              Disodium salt of Ethylenediaminetetraacetic acid (EDTA) forms stable, soluble, octahedral 1:1 chelates with
              these cations.
            </p>
            <h3 style={{ fontSize: "15px", margin: "14px 0 6px" }}>Reaction Mechanism:</h3>
            <p>
              When Eriochrome Black-T (EBT) is added at pH 10, it forms an unstable wine-red complex with Ca²⁺/Mg²⁺ ions:
            </p>
            <code>M²⁺ + EBT (Blue) → [M–EBT]²⁺ (Wine Red)</code>
            <p style={{ marginTop: "8px" }}>
              During titration, free EDTA preferentially displaces EBT from the complex because the [M–EDTA] chelate is
              substantially more stable:
            </p>
            <code>[M–EBT]²⁺ (Wine Red) + EDTA⁴⁻ → [M–EDTA]²⁻ (Colorless) + EBT (Steel Blue)</code>
            <h3 style={{ fontSize: "15px", margin: "14px 0 6px" }}>Calculation Formula:</h3>
            <code>Total Hardness (ppm) = (V₂ / V₁) × 1000</code>
            <p style={{ marginTop: "6px" }}>
              Where <b>V₁</b> is the concordant volume of EDTA for 20 mL standard hard water (1000 ppm), and <b>V₂</b> is
              the concordant volume of EDTA for 20 mL of the water sample.
            </p>
            <h3 style={{ fontSize: "15px", margin: "14px 0 6px" }}>BIS 10500:2012 Standards:</h3>
            <ul>
              <li>Acceptable Limit: <b>200 mg/L (ppm)</b></li>
              <li>Permissible Limit (in absence of alternate source): <b>600 mg/L (ppm)</b></li>
            </ul>
            <div style={{ marginTop: "16px", textAlign: "right" }}>
              <button
                type="button"
                className="exp1-btn-primary"
                style={{ display: "inline-flex" }}
                onClick={() => setShowTheoryModal(false)}
              >
                Close & Return to Bench
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
