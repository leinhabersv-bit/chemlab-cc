"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Exp1Canvas3D, type Exp1Canvas3DHandle } from "./Exp1Canvas3D";
import "./exp1.css";

/* ====================================================================
   1. ACOUSTIC ENGINE (Web Audio API Synthesizer)
   ==================================================================== */

class LabAcoustics {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Droplet chirp sound
  playDrop() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = "sine";
      osc.frequency.setValueAtTime(920, now);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Audio context restricted or unavailable
    }
  }

  // Pyrex glassware click
  playGlass() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Audio context restricted
    }
  }

  // Stopcock valve turn sound
  playValve() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.linearRampToValueAtTime(420, now + 0.06);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Audio context restricted
    }
  }

  // Success chord ping
  playSuccess() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      freqs.forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now + idx * 0.05);

        gain.gain.setValueAtTime(0.12, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.6);
      });
    } catch {
      // Audio context restricted
    }
  }
}

const acoustics = new LabAcoustics();

/* ====================================================================
   2. TYPES & INTERFACES
   ==================================================================== */

interface EvalSummary {
  calculated: number;
  trueHardness: number;
  errorPct: number;
  marks: number;
  bisDeviation: number;
  isPotable: boolean;
  dateStr: string;
}

/* ====================================================================
   3. COMPONENT
   ==================================================================== */

export default function ExperimentOnePage() {
  // Session random chemical parameters
  const truths = useRef({
    v1: 19.5 + Math.random() * 1.0, // Standard titre ~20.00 mL
    trueHardness: Math.round(180 + Math.random() * 220), // 180 - 400 ppm
  }).current;

  const targetV2 = (truths.trueHardness / 1000) * truths.v1;

  // 3D Canvas Ref & Camera View State
  const canvas3DRef = useRef<Exp1Canvas3DHandle>(null);
  const [cameraView, setCameraView] = useState<"overview" | "meniscus" | "flask">("overview");

  // Laboratory state machine
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
  const [endpointReached, setEndpointReached] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Calculation & VIT evaluation state
  const [userHardnessInput, setUserHardnessInput] = useState("");
  const [studentRegNo, setStudentRegNo] = useState("24BCE1042");
  const [evalResult, setEvalResult] = useState<EvalSummary | null>(null);

  // Modals & UI notifications
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showTheoryModal, setShowTheoryModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  // References
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const warnSoundRef = useRef(false);

  const toggleAudio = () => {
    acoustics.enabled = !audioEnabled;
    setAudioEnabled(!audioEnabled);
  };

  const triggerToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), 3200);
  }, []);

  const currentTargetEndpoint = useMemo(() => {
    return phase === 1 ? truths.v1 : targetV2;
  }, [phase, truths.v1, targetV2]);

  // Color calculation with continuous spectral transition
  const solutionColor = useMemo(() => {
    if (!ebtAdded) {
      return bufferAdded ? "rgb(228, 239, 245)" : pipetteAdded ? "rgb(219, 233, 244)" : "rgb(240, 244, 248)";
    }

    const f = buretteUsed / currentTargetEndpoint;
    // Wine Red: rgb(158, 31, 61), Purple: rgb(110, 62, 145), Steel Blue: rgb(72, 126, 184)
    if (f < 0.85) {
      return "rgb(158, 31, 61)"; // Stable wine red [M-EBT] complex
    }
    const t = Math.min(1, Math.max(0, (f - 0.85) / 0.15));
    if (t < 0.5) {
      // Transition from Wine Red to Purple
      const k = t * 2;
      const r = Math.round(158 + (110 - 158) * k);
      const g = Math.round(31 + (62 - 31) * k);
      const b = Math.round(61 + (145 - 61) * k);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Transition from Purple to Steel Blue
      const k = (t - 0.5) * 2;
      const r = Math.round(110 + (72 - 110) * k);
      const g = Math.round(62 + (126 - 62) * k);
      const b = Math.round(145 + (184 - 145) * k);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }, [ebtAdded, bufferAdded, pipetteAdded, buretteUsed, currentTargetEndpoint]);

  // Continuous titration animation loop & droplet cadence
  useEffect(() => {
    let animId: number;
    let dropTimer = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      if (isRunning && ebtAdded && buretteFilled && finalRecorded === null && buretteUsed < 50) {
        setBuretteUsed((prev) => Math.min(50, prev + 1.25 * dt));
        dropTimer += dt;
        if (dropTimer > 0.08) {
          dropTimer = 0;
          acoustics.playDrop();
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, ebtAdded, buretteFilled, finalRecorded, buretteUsed]);

  // Endpoint detection & warning
  useEffect(() => {
    const f = buretteUsed / currentTargetEndpoint;
    if (ebtAdded && f >= 1.0 && !endpointReached && finalRecorded === null) {
      setEndpointReached(true);
      setIsRunning(false);
      acoustics.playSuccess();
      triggerToast("Steel blue endpoint reached! Stop titration and record reading.");
    }
    if (ebtAdded && f > 0.85 && f < 1.0 && !warnSoundRef.current) {
      warnSoundRef.current = true;
      triggerToast("Solution turning purple: switch to single 0.05 mL drops.");
    }
  }, [buretteUsed, currentTargetEndpoint, ebtAdded, endpointReached, finalRecorded, triggerToast]);

  // Apparatus card interactions
  const handleItemAction = useCallback(
    (id: string) => {
      if (id === "flask") {
        if (flaskPlaced) return;
        setFlaskPlaced(true);
        acoustics.playGlass();
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
        triggerToast("Conical flask mounted on porcelain tile in 3D bench ✓");
        return;
      }

      if (id === "edta") {
        if (buretteFilled) {
          triggerToast("Burette is already filled to 0.00 mL.");
          return;
        }
        setBuretteFilled(true);
        setBuretteUsed(0);
        acoustics.playGlass();
        triggerToast("Class-A burette filled with 0.01 N EDTA to 0.00 mL ✓");
        return;
      }

      if (!flaskPlaced) {
        triggerToast("Mount the conical flask onto the porcelain tile first.");
        return;
      }

      if (id === "pip") {
        if (pipetteAdded) {
          triggerToast("20.0 mL aliquot already dispensed into the flask.");
          return;
        }
        setPipetteAdded(true);
        acoustics.playGlass();
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
        acoustics.playDrop();
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
        acoustics.playDrop();
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
    canvas3DRef.current?.triggerDropAnim();
    acoustics.playDrop();
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
  };

  // Record final meniscus reading
  const handleRecordFinal = () => {
    if (finalRecorded !== null || !ebtAdded) return;
    const f = buretteUsed / currentTargetEndpoint;
    if (f < 0.9) {
      triggerToast("Endpoint not reached yet: solution must turn distinct steel blue.");
      return;
    }

    const roundedVal = Math.round(buretteUsed * 20) / 20;
    setFinalRecorded(roundedVal);
    acoustics.playGlass();

    const updatedList = [...trials[phase], roundedVal];
    setTrials((prev) => ({ ...prev, [phase]: updatedList }));

    const len = updatedList.length;
    if (len >= 2 && Math.abs(updatedList[len - 1] - updatedList[len - 2]) <= 0.1) {
      const concValue = Math.round(((updatedList[len - 1] + updatedList[len - 2]) / 2) * 20) / 20;
      setConcordant((prev) => ({ ...prev, [phase]: concValue }));
      acoustics.playSuccess();
      triggerToast(`Concordant titre confirmed: V${phase} = ${concValue.toFixed(2)} mL ✓`);
    } else {
      if (f > 1.05) {
        triggerToast(`Recorded ${roundedVal.toFixed(2)} mL (slightly overshot). Repeat for concordant reading.`);
      } else {
        triggerToast(`Reading ${roundedVal.toFixed(2)} mL recorded ✓. Need 2 trials within ±0.1 mL.`);
      }
    }
  };

  // Reset for next trial or continue to Titration II
  const handleNextTrialOrPhase = (advancePhase: boolean) => {
    if (advancePhase) {
      setPhase(2);
      acoustics.playSuccess();
      triggerToast("Titration II: Pipette now dispenses unknown water sample.");
    } else {
      acoustics.playGlass();
      triggerToast("Preparing next trial. Flask rinsed and reset.");
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

  // Full experiment reset
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
    acoustics.playGlass();
    triggerToast("Laboratory bench restored to clean initial setup.");
  };

  // Grade student hardness calculation
  const handleCheckHardness = () => {
    const val = parseFloat(userHardnessInput);
    if (isNaN(val) || val <= 0) {
      triggerToast("Please enter a valid positive hardness value in ppm.");
      return;
    }

    const trueH = truths.trueHardness;
    const errorPct = (Math.abs(val - trueH) / trueH) * 100;

    // Official VIT FAT Titration Rubric
    let marks = 5;
    if (errorPct <= 2.0) marks = 10;
    else if (errorPct <= 3.0) marks = 9;
    else if (errorPct <= 4.0) marks = 8;

    const bisDev = ((val - 200) / 200) * 100;
    const isPotable = val <= 200;

    const resultSummary: EvalSummary = {
      calculated: val,
      trueHardness: trueH,
      errorPct,
      marks,
      bisDeviation: bisDev,
      isPotable,
      dateStr: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };

    setEvalResult(resultSummary);
    acoustics.playSuccess();
    triggerToast(`Graded! Skill marks: ${marks}/10 (Error: ${errorPct.toFixed(1)}%). Lab manual record generated!`);
  };

  return (
    <div className="exp1-root">
      {/* Navigation Header */}
      <header className="exp1-nav">
        <div className="exp1-brand">
          <Link href="/" className="exp1-back-btn" aria-label="Return to CHEMLAB CC main workbench">
            ← Home
          </Link>
          <div className="exp1-title-group">
            <h1>
              Experiment 1: Total Hardness of Water by EDTA Titration
              <span className="exp1-badge">BCHY101P</span>
              {concordant[1] !== null && concordant[2] !== null && (
                <span className="exp1-badge gold">Complete ✓</span>
              )}
            </h1>
            <p>Division of Chemistry · School of Advanced Sciences · VIT Chennai</p>
          </div>
        </div>

        <div className="exp1-nav-actions">
          <button
            type="button"
            className="exp1-btn-subtle"
            onClick={toggleAudio}
            aria-label="Toggle laboratory acoustic effects"
            title={audioEnabled ? "Mute sound" : "Enable sound"}
          >
            {audioEnabled ? "🔊 Sound On" : "🔇 Muted"}
          </button>
          <button
            type="button"
            className="exp1-btn-subtle"
            onClick={() => setShowTheoryModal(true)}
            aria-label="View laboratory theory and equations"
          >
            ℹ Theory & Principle
          </button>
          <button
            type="button"
            className="exp1-btn-subtle exp1-btn-record"
            onClick={() => setShowManualModal(true)}
            aria-label="View official VIT lab manual record sheet"
          >
            📋 Official Lab Record
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
        {/* Actual 3D WebGL Three.js Canvas Container */}
        <div className="exp1-canvas-container">
          <Exp1Canvas3D
            ref={canvas3DRef}
            flaskPlaced={flaskPlaced}
            buretteFilled={buretteFilled}
            pipetteAdded={pipetteAdded}
            bufferAdded={bufferAdded}
            ebtAdded={ebtAdded}
            buretteUsed={buretteUsed}
            isRunning={isRunning}
            solutionColor={solutionColor}
            cameraView={cameraView}
          />

          {/* Floating Camera Presets Pill */}
          <div className="exp1-cam-pill">
            <button
              type="button"
              className={`exp1-cam-btn ${cameraView === "overview" ? "active" : ""}`}
              onClick={() => setCameraView("overview")}
              aria-label="Overview bench angle"
            >
              ⊞ Bench Overview
            </button>
            <button
              type="button"
              className={`exp1-cam-btn ${cameraView === "meniscus" ? "active" : ""}`}
              onClick={() => setCameraView("meniscus")}
              aria-label="Meniscus close-up view"
            >
              🔍 Meniscus Zoom
            </button>
            <button
              type="button"
              className={`exp1-cam-btn ${cameraView === "flask" ? "active" : ""}`}
              onClick={() => setCameraView("flask")}
              aria-label="Conical flask endpoint view"
            >
              🧪 Reaction Flask
            </button>
          </div>

          {/* Floating Apparatus Tray on Left */}
          <div className="exp1-tray-floating">
            <div className="exp1-tray-title">Apparatus Rack</div>
            <div className="exp1-tray-scroll">
              {/* 1. Conical Flask */}
              <div
                className={`exp1-app-card ${flaskPlaced ? "done" : ""}`}
                onClick={() => handleItemAction("flask")}
                role="button"
                tabIndex={0}
                aria-label="250 mL Conical Flask"
              >
                <div className="exp1-app-card-top">
                  <span className="exp1-app-card-icon">🧪</span>
                  <span className={`exp1-status-dot ${flaskPlaced ? "active" : ""}`} />
                </div>
                <div className="exp1-app-card-name">Conical Flask</div>
                <div className="exp1-app-card-desc">
                  {flaskPlaced ? "Mounted on Tile ✓" : "250 mL Pyrex"}
                </div>
              </div>

              {/* 2. 0.01 N EDTA */}
              <div
                className={`exp1-app-card ${buretteFilled ? "done" : ""}`}
                onClick={() => handleItemAction("edta")}
                role="button"
                tabIndex={0}
                aria-label="0.01 N EDTA Standard Solution"
              >
                <div className="exp1-app-card-top">
                  <span className="exp1-app-card-icon">🧴</span>
                  <span className={`exp1-status-dot ${buretteFilled ? "active" : ""}`} />
                </div>
                <div className="exp1-app-card-name">0.01 N EDTA</div>
                <div className="exp1-app-card-desc">
                  {buretteFilled ? "Burette Zeroed ✓" : "Standard Titrant"}
                </div>
              </div>

              {/* 3. 20 mL Pipette */}
              <div
                className={`exp1-app-card ${pipetteAdded ? "done" : ""}`}
                onClick={() => handleItemAction("pip")}
                role="button"
                tabIndex={0}
                aria-label="20 mL Volumetric Bulb Pipette"
              >
                <div className="exp1-app-card-top">
                  <span className="exp1-app-card-icon">🔬</span>
                  <span className={`exp1-status-dot ${pipetteAdded ? "active" : ""}`} />
                </div>
                <div className="exp1-app-card-name">
                  {phase === 1 ? "20 mL Pipette" : "20 mL Sample"}
                </div>
                <div className="exp1-app-card-desc">
                  {pipetteAdded
                    ? "20 mL Added ✓"
                    : phase === 1
                    ? "Std Hard Water"
                    : "Water Sample"}
                </div>
              </div>

              {/* 4. Ammonia Buffer (pH 10) */}
              <div
                className={`exp1-app-card ${bufferAdded ? "done" : ""}`}
                onClick={() => handleItemAction("buf")}
                role="button"
                tabIndex={0}
                aria-label="Ammonia Buffer Solution (pH 10)"
              >
                <div className="exp1-app-card-top">
                  <span className="exp1-app-card-icon">⚗️</span>
                  <span className={`exp1-status-dot ${bufferAdded ? "active" : ""}`} />
                </div>
                <div className="exp1-app-card-name">NH₃–NH₄Cl Buffer</div>
                <div className="exp1-app-card-desc">
                  {bufferAdded ? "Buffered (pH 10) ✓" : "Maintains pH 10"}
                </div>
              </div>

              {/* 5. EBT Indicator */}
              <div
                className={`exp1-app-card ${ebtAdded ? "done" : ""}`}
                onClick={() => handleItemAction("ebt")}
                role="button"
                tabIndex={0}
                aria-label="Eriochrome Black-T Indicator"
              >
                <div className="exp1-app-card-top">
                  <span className="exp1-app-card-icon">💧</span>
                  <span className={`exp1-status-dot ${ebtAdded ? "active" : ""}`} />
                </div>
                <div className="exp1-app-card-name">EBT Indicator</div>
                <div className="exp1-app-card-desc">
                  {ebtAdded ? "Wine Red Active ✓" : "Wine-red → Blue"}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Instrument HUD Top Right */}
          <div className="exp1-hud-floating">
            <div className="exp1-hud-panel">
              <span className="exp1-hud-label">Class-A Burette Meniscus</span>
              <div className="exp1-hud-val">
                <span>{buretteFilled ? (Math.round(buretteUsed * 20) / 20).toFixed(2) : "0.00"}</span>
                <small>mL (±0.05)</small>
              </div>
              <div className="exp1-endpoint-bar">
                <div
                  className="exp1-endpoint-fill"
                  style={{
                    width: `${Math.min(100, (buretteUsed / currentTargetEndpoint) * 100)}%`,
                    backgroundColor: endpointReached
                      ? "#38bdf8"
                      : buretteUsed / currentTargetEndpoint > 0.85
                      ? "#a855f7"
                      : "#ef4444",
                  }}
                />
              </div>
            </div>

            <div className="exp1-hud-panel">
              <span className="exp1-hud-label">Chemical State</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: ebtAdded
                      ? endpointReached
                        ? "#38bdf8"
                        : buretteUsed / currentTargetEndpoint > 0.85
                        ? "#a855f7"
                        : "#ef4444"
                      : "#64748b",
                    boxShadow: ebtAdded ? "0 0 8px currentColor" : "none",
                  }}
                />
                <span style={{ fontSize: "12.5px", fontWeight: 600 }}>
                  {!ebtAdded
                    ? bufferAdded
                      ? "Buffered at pH 10"
                      : pipetteAdded
                      ? "Aqueous Analyte"
                      : "Bench Ready"
                    : endpointReached
                    ? "Free EBT (Steel Blue)"
                    : buretteUsed / currentTargetEndpoint > 0.85
                    ? "Equivalence Near (Purple)"
                    : "[Ca/Mg-EBT] (Wine Red)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Cockpit Aside */}
        <aside className="exp1-cockpit">
          {/* Section 1: Checklist */}
          <section className="exp1-section">
            <div className="exp1-section-header">
              <h2 className="exp1-section-title">Standard Procedure Checklist</h2>
              <span className="exp1-badge">{phase === 1 ? "Titration I (Std)" : "Titration II (Sample)"}</span>
            </div>
            <ul className="exp1-steps">
              <li className={flaskPlaced ? "done" : ""}>Mount 250 mL conical flask on porcelain tile</li>
              <li className={buretteFilled ? "done" : ""}>Fill Class-A burette with 0.01 N EDTA to 0.00 mL</li>
              <li className={pipetteAdded ? "done" : ""}>
                Pipette 20.0 mL of {phase === 1 ? "standard hard water (1000 ppm)" : "the unknown water sample"}
              </li>
              <li className={bufferAdded ? "done" : ""}>Add 4 mL ammonia buffer (NH₃–NH₄Cl, pH 10)</li>
              <li className={ebtAdded ? "done" : ""}>Add 3 drops EBT indicator (forms wine-red complex)</li>
              <li className={endpointReached || finalRecorded !== null ? "done" : ""}>
                Titrate drop-by-drop until wine-red breaks into steel blue
              </li>
              <li className={finalRecorded !== null ? "done" : ""}>Record final burette reading and verify concordance</li>
            </ul>
          </section>

          {/* Section 2: Titration Controls */}
          <section className="exp1-section">
            <h2 className="exp1-section-title">Apparatus Titration Controls</h2>
            <div className="exp1-row">
              <button
                type="button"
                id="btn-run"
                className="exp1-btn-primary"
                disabled={!ebtAdded || !buretteFilled || finalRecorded !== null || buretteUsed >= 50}
                onPointerDown={() => {
                  setIsRunning(true);
                  acoustics.playValve();
                }}
                onPointerUp={() => setIsRunning(false)}
                onPointerLeave={() => setIsRunning(false)}
              >
                Hold to Run Stream
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
                Record Final Meniscus
              </button>
            </div>
            <p className="exp1-tip-note">
              <b>Lab Technique:</b> Approaching the stoichiometric endpoint, the solution transitions from wine-red to
              purple. Switch to single drops (+0.05 mL) to capture the sharp steel-blue endpoint without overshooting.
            </p>
          </section>

          {/* Section 3: Lab Notebook */}
          <section className="exp1-section">
            <div className="exp1-section-header">
              <h2 className="exp1-section-title">Official Observation Table</h2>
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
                      Concordant Titre (V₁)
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
                        Titration II: Estimation of Total Hardness of Water Sample
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
                          Concordant Titre (V₂)
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

            {/* Trial transition buttons */}
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

          {/* Section 4: Hardness Calculation & FAT Evaluation */}
          {concordant[2] !== null && (
            <section className="exp1-section">
              <h2 className="exp1-section-title">Manual Calculation & FAT Grading</h2>
              <div className="exp1-res-card">
                <p style={{ fontSize: "12.5px", color: "var(--exp-mute)", margin: 0 }}>
                  Derivation from Page 6 of Manual:
                  <br />
                  <code>Total Hardness = (V₂ / V₁) × 1000 ppm (mg/L)</code>
                  <br />
                  Where V₁ = {concordant[1]?.toFixed(2)} mL and V₂ = {concordant[2]?.toFixed(2)} mL.
                </p>

                <div className="exp1-input-group">
                  <input
                    type="number"
                    step="0.1"
                    className="exp1-input"
                    placeholder="Enter ppm"
                    value={userHardnessInput}
                    onChange={(e) => setUserHardnessInput(e.target.value)}
                    aria-label="Enter calculated total hardness in ppm"
                  />
                  <span style={{ fontSize: "13px", fontWeight: 500 }}>ppm</span>
                  <button type="button" className="exp1-btn-primary" onClick={handleCheckHardness}>
                    Grade Calculation
                  </button>
                </div>

                {evalResult && (
                  <div className={`exp1-score-box ${evalResult.errorPct <= 2.0 ? "pass" : "warn"}`}>
                    <p style={{ margin: "0 0 6px" }}>
                      Your Entered Hardness: <b>{evalResult.calculated.toFixed(1)} ppm</b>
                      <br />
                      Actual Standard Hardness: <b>{evalResult.trueHardness} ppm</b> (Error:{" "}
                      <b>{evalResult.errorPct.toFixed(2)}%</b>)
                    </p>
                    <p style={{ margin: "0 0 6px" }}>
                      FAT Skill Marks Awarded: <b>{evalResult.marks}/10 Marks</b>
                      <br />
                      <span style={{ fontSize: "11px", color: "var(--exp-mute)" }}>
                        VIT FAT Scale: ≤2% error = 10M, 2–3% = 9M, 3–4% = 8M, &gt;4% = 5M
                      </span>
                    </p>
                    <p style={{ margin: "0 0 8px", color: evalResult.isPotable ? "var(--exp-acc)" : "var(--exp-warn)" }}>
                      BIS 10500:2012 Water Potability: Sample deviates{" "}
                      <b>{evalResult.bisDeviation > 0 ? "+" : ""}{evalResult.bisDeviation.toFixed(1)}%</b> from the
                      200 ppm acceptable drinking water limit.{" "}
                      {evalResult.isPotable ? "Potable without treatment." : "Hard water; softening required before domestic use."}
                    </p>
                    <button
                      type="button"
                      className="exp1-btn-secondary w-full"
                      onClick={() => setShowManualModal(true)}
                    >
                      Open Official Lab Manual Record Sheet →
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
        </aside>
      </main>

      {/* Toast Notification */}
      {toastMsg && <div className="exp1-toast">{toastMsg}</div>}

      {/* Theory & Principle Modal */}
      {showTheoryModal && (
        <div className="exp1-modal-backdrop" onClick={() => setShowTheoryModal(false)}>
          <div className="exp1-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Experiment 1: Comprehensive Water Analysis</h2>
            <h3>Part A: Estimation of Total Hardness of Given Water Sample</h3>
            <p>
              <b>Aim:</b> To determine the total hardness of the given water sample by complexometric titration using
              standard disodium salt of EDTA.
            </p>
            <p>
              <b>Principle:</b> Hardness in groundwater is caused by dissolved salts of calcium (Ca²⁺) and magnesium (Mg²⁺).
              Disodium EDTA is a hexadentate chelating agent providing six electron-donating pairs (four carboxylate groups
              and two tertiary amino groups) that form 1:1 octahedral complexes with metal cations at basic pH (9–10).
            </p>

            <h4 style={{ fontSize: "14px", margin: "14px 0 6px", color: "var(--exp-ink)" }}>Chemical Equations:</h4>
            <code>Ca²⁺/Mg²⁺ + EBT (Blue) → [Ca²⁺/Mg²⁺–EBT] (Wine Red Unstable Complex)</code>
            <p style={{ marginTop: "8px" }}>
              Upon adding EDTA from the burette, EDTA displaces the indicator because the metal–EDTA complex is far more
              stable:
            </p>
            <code>[Ca²⁺/Mg²⁺–EBT] (Wine Red) + EDTA⁴⁻ → [Ca²⁺/Mg²⁺–EDTA]²⁻ (Colorless) + EBT (Steel Blue)</code>

            <h4 style={{ fontSize: "14px", margin: "14px 0 6px", color: "var(--exp-ink)" }}>Role of NH₃–NH₄Cl Buffer:</h4>
            <p>
              Maintains the solution at pH ≈ 10. Below pH 9, the [Ca²⁺/Mg²⁺–EDTA] complexes dissociate; above pH 11,
              Mg(OH)₂ precipitates out prematurely.
            </p>

            <h4 style={{ fontSize: "14px", margin: "14px 0 6px", color: "var(--exp-ink)" }}>Derivations & Formulae:</h4>
            <code>20 mL standard hard water (1000 ppm) requires V₁ mL EDTA</code>
            <br />
            <code>1 mL of EDTA ≡ 20 / V₁ mg CaCO₃ equivalent</code>
            <br />
            <code>Total Hardness = (V₂ / V₁) × 1000 ppm (mg/L)</code>

            <h4 style={{ fontSize: "14px", margin: "14px 0 6px", color: "var(--exp-ink)" }}>BIS 10500:2012 Drinking Water Specification:</h4>
            <ul>
              <li>Acceptable Limit: <b>200 mg/L (ppm)</b></li>
              <li>Permissible Limit (in absence of alternate source): <b>600 mg/L (ppm)</b></li>
            </ul>

            <div style={{ marginTop: "20px", textAlign: "right" }}>
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

      {/* Official VIT Lab Manual Record Sheet Modal */}
      {showManualModal && (
        <div className="exp1-modal-backdrop" onClick={() => setShowManualModal(false)}>
          <div className="exp1-manual-modal" onClick={(e) => e.stopPropagation()}>
            <div className="exp1-manual-header">
              <div className="exp1-manual-title">
                <h2>DIVISION OF CHEMISTRY · SCHOOL OF ADVANCED SCIENCES</h2>
                <h3>ENGINEERING CHEMISTRY LAB BCHY101P (REVISED SYLLABUS 2026–27)</h3>
                <p>Vellore Institute of Technology, Chennai Campus</p>
              </div>
              <div className="exp1-no-print" style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="exp1-btn-subtle"
                  onClick={() => window.print()}
                  style={{ background: "#f3f4f6", color: "#111827", borderColor: "#d1d5db" }}
                >
                  🖨 Print / Export PDF
                </button>
                <button
                  type="button"
                  className="exp1-btn-subtle"
                  onClick={() => setShowManualModal(false)}
                  style={{ background: "#f3f4f6", color: "#111827", borderColor: "#d1d5db" }}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Student & Course Meta */}
            <div className="exp1-manual-meta">
              <div>
                <span>Student Reg. No</span>
                <strong>
                  <input
                    type="text"
                    value={studentRegNo}
                    onChange={(e) => setStudentRegNo(e.target.value)}
                    style={{
                      border: "none",
                      background: "transparent",
                      fontWeight: 700,
                      width: "100%",
                      fontFamily: "inherit",
                      fontSize: "12.5px",
                    }}
                  />
                </strong>
              </div>
              <div>
                <span>Experiment No</span>
                <strong>01 (Part A)</strong>
              </div>
              <div>
                <span>Course Code</span>
                <strong>BCHY101P</strong>
              </div>
              <div>
                <span>Date of Evaluation</span>
                <strong>{evalResult?.dateStr || new Date().toLocaleDateString("en-IN")}</strong>
              </div>
            </div>

            {/* Experiment Aim & Principle */}
            <div className="exp1-manual-section">
              <h4>Experiment 1: Comprehensive Water Analysis</h4>
              <p>
                <b>Aim:</b> To estimate the total hardness of the given groundwater sample by complexometric titration
                using standard disodium EDTA solution and Eriochrome Black-T (EBT) indicator.
              </p>
              <p>
                <b>Principle:</b> Divalent metallic cations (Ca²⁺, Mg²⁺) react with EBT at pH 10 (buffered by NH₃–NH₄Cl)
                to yield an unstable wine-red complex. Titration against EDTA replaces EBT to form a stable, colorless
                octahedral [M–EDTA] chelate, liberating free EBT which imparts a sharp steel-blue color at equivalence.
              </p>
            </div>

            {/* Observation Table I */}
            <div className="exp1-manual-section">
              <h4>Titration I: Standardisation of EDTA (Standard Hard Water vs. EDTA)</h4>
              <table className="exp1-manual-table">
                <thead>
                  <tr>
                    <th>S. No.</th>
                    <th>Volume of Std Hard Water (mL)</th>
                    <th>Initial Burette Reading (mL)</th>
                    <th>Final Burette Reading (mL)</th>
                    <th>Volume of EDTA (V₁, mL)</th>
                  </tr>
                </thead>
                <tbody>
                  {trials[1].length > 0 ? (
                    trials[1].map((v, i) => (
                      <tr key={`m1-${i}`}>
                        <td>{i + 1}</td>
                        <td>20.00</td>
                        <td>0.00</td>
                        <td>{v.toFixed(2)}</td>
                        <td>{v.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ color: "#9ca3af", padding: "12px" }}>
                        Trials not yet performed on the virtual bench.
                      </td>
                    </tr>
                  )}
                  {concordant[1] !== null && (
                    <tr style={{ background: "#f0fdf4", fontWeight: 700 }}>
                      <td colSpan={4} style={{ textAlign: "right" }}>
                        Concordant Value (V₁):
                      </td>
                      <td>{concordant[1].toFixed(2)} mL</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Observation Table II */}
            <div className="exp1-manual-section">
              <h4>Titration II: Estimation of Total Hardness of Water Sample (Sample Water vs. EDTA)</h4>
              <table className="exp1-manual-table">
                <thead>
                  <tr>
                    <th>S. No.</th>
                    <th>Volume of Water Sample (mL)</th>
                    <th>Initial Burette Reading (mL)</th>
                    <th>Final Burette Reading (mL)</th>
                    <th>Volume of EDTA (V₂, mL)</th>
                  </tr>
                </thead>
                <tbody>
                  {trials[2].length > 0 ? (
                    trials[2].map((v, i) => (
                      <tr key={`m2-${i}`}>
                        <td>{i + 1}</td>
                        <td>20.00</td>
                        <td>0.00</td>
                        <td>{v.toFixed(2)}</td>
                        <td>{v.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ color: "#9ca3af", padding: "12px" }}>
                        Titration II pending execution.
                      </td>
                    </tr>
                  )}
                  {concordant[2] !== null && (
                    <tr style={{ background: "#f0fdf4", fontWeight: 700 }}>
                      <td colSpan={4} style={{ textAlign: "right" }}>
                        Concordant Value (V₂):
                      </td>
                      <td>{concordant[2].toFixed(2)} mL</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Step-by-Step Derivation Breakdown */}
            <div className="exp1-manual-section">
              <h4>Calculations (Strictly as per Manual Spec):</h4>
              <div className="exp1-calc-box">
                From Titration 1:
                <br />
                20 mL of standard hard water (1 mg/mL CaCO₃) consumes ={" "}
                {concordant[1] ? concordant[1].toFixed(2) : "V₁"} mL of EDTA.
                <br />
                20 mg of CaCO₃ eq requires = {concordant[1] ? concordant[1].toFixed(2) : "V₁"} mL EDTA.
                <br />
                ∴ 1 mL of EDTA ≡ 20 / {concordant[1] ? concordant[1].toFixed(2) : "V₁"} ={" "}
                {concordant[1] ? (20 / concordant[1]).toFixed(4) : "—"} mg CaCO₃ eq.
                <br />
                <br />
                From Titration 2:
                <br />
                20 mL of sample hard water consumes = {concordant[2] ? concordant[2].toFixed(2) : "V₂"} mL of EDTA.
                <br />
                = {concordant[2] ? concordant[2].toFixed(2) : "V₂"} × (20 /{" "}
                {concordant[1] ? concordant[1].toFixed(2) : "V₁"}) mg of CaCO₃ eq.
                <br />
                ∴ 1000 mL of sample water consumes = (V₂ / V₁) × 1000 ppm
                <br />= (
                {concordant[2] ? concordant[2].toFixed(2) : "V₂"} / {concordant[1] ? concordant[1].toFixed(2) : "V₁"}) ×
                1000
                <br />
                <b>
                  = {concordant[1] && concordant[2] ? ((concordant[2] / concordant[1]) * 1000).toFixed(1) : "—"} ppm
                </b>
              </div>
            </div>

            {/* Formal Result Statement */}
            <div className="exp1-manual-section">
              <h4>Result & BIS Interpretation:</h4>
              <p>
                1. Total hardness of the given water sample ={" "}
                <b>
                  {evalResult
                    ? `${evalResult.calculated.toFixed(1)} ppm (mg/L)`
                    : concordant[1] && concordant[2]
                    ? `${((concordant[2] / concordant[1]) * 1000).toFixed(1)} ppm`
                    : "—"}
                </b>
                .
              </p>
              <p>
                2. Comparing against the BIS 10500:2012 acceptable threshold of 200 ppm:
                <br />
                The sample demonstrates a{" "}
                <b>{evalResult ? `${evalResult.bisDeviation > 0 ? "+" : ""}${evalResult.bisDeviation.toFixed(1)}%` : "—"}</b>{" "}
                deviation.{" "}
                {evalResult?.isPotable
                  ? "Water is within the acceptable limit and potable without softening."
                  : "Water exceeds the desirable limit of 200 ppm; requires zeolite/ion-exchange softening for domestic consumption."}
              </p>
            </div>

            {/* Faculty Sign-Off and Rubric Stamp */}
            <div className="exp1-signoff">
              <div className="exp1-rubric-stamp">
                <span>VIT FAT EVALUATION RUBRIC</span>
                <br />
                <strong>
                  Marks: {evalResult ? `${evalResult.marks} / 10 M` : "Awaiting Calculation"}
                </strong>
                <br />
                <small>
                  {evalResult?.errorPct !== undefined
                    ? `Precision Error: ${evalResult.errorPct.toFixed(2)}% (≤2% = 10M, 2–3% = 9M, 3–4% = 8M)`
                    : "Concordant readings required"}
                </small>
              </div>

              <div className="exp1-faculty-sig">
                <div className="exp1-sig-line" />
                <span>Faculty In-Charge Signature</span>
                <br />
                <small>Division of Chemistry, VIT Chennai</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
