"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import "./exp1.css";

/* ====================================================================
   1. TYPES & DATA
   ==================================================================== */

interface CoachStep {
  text: string;
  targetId: string;
  zoneId?: string;
}

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
   2. ACOUSTIC ENGINE (Web Audio API Synthesizer)
   ==================================================================== */

class LabAcoustics {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);

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

  // Stopcock squeak/turn
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
   3. COMPONENT
   ==================================================================== */

export default function ExperimentOnePage() {
  // Session random chemical parameters
  const truths = useRef({
    v1: 19.5 + Math.random() * 1.0, // Standard titre ~20.00 mL
    trueHardness: Math.round(180 + Math.random() * 220), // 180 - 400 ppm
  }).current;

  const targetV2 = (truths.trueHardness / 1000) * truths.v1;

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
  const [dropsPulse, setDropsPulse] = useState(0);
  const [endpointReached, setEndpointReached] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // 3D Parallax tilt coordinates
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  // Calculation & VIT evaluation state
  const [userHardnessInput, setUserHardnessInput] = useState("");
  const [studentRegNo, setStudentRegNo] = useState("24BCE1042");
  const [evalResult, setEvalResult] = useState<EvalSummary | null>(null);

  // Modals & hints
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showTheoryModal, setShowTheoryModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
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
  const lastTimeRef = useRef<number>(performance.now());
  const warnSoundRef = useRef(false);

  // Sync audio toggle with acoustic engine
  const toggleAudio = () => {
    acoustics.enabled = !audioEnabled;
    setAudioEnabled(!audioEnabled);
  };

  // Responsive stage scaler
  const updateStageScale = useCallback(() => {
    if (!wrapRef.current || !stageRef.current) return;
    const wrapRect = wrapRef.current.getBoundingClientRect();
    const scale = Math.min(wrapRect.width / 1000, wrapRect.height / 620);
    stageRef.current.style.transform = `scale(${scale}) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`;
    stageRef.current.style.left = `${(wrapRect.width - 1000 * scale) / 2}px`;
    stageRef.current.style.top = `${(wrapRect.height - 620 * scale) / 2}px`;
  }, [tilt.rx, tilt.ry]);

  useEffect(() => {
    updateStageScale();
    window.addEventListener("resize", updateStageScale);
    return () => window.removeEventListener("resize", updateStageScale);
  }, [updateStageScale]);

  // Toast notification
  const triggerToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), 3200);
  }, []);

  // Target endpoint volume for active phase
  const currentTargetEndpoint = useMemo(() => {
    return phase === 1 ? truths.v1 : targetV2;
  }, [phase, truths.v1, targetV2]);

  // Determine active pedagogical coach guidance
  const getNextStep = useCallback((): CoachStep | null => {
    if (!flaskPlaced) {
      return {
        text: "Pick up the 250 mL conical flask and drop it onto the white tile beneath the burette.",
        targetId: "tray-flask",
        zoneId: "zone-flask",
      };
    }
    if (!buretteFilled) {
      return {
        text: "Drag 0.01 N EDTA standard solution onto the burette tube to fill and zero the meniscus at 0.00 mL.",
        targetId: "tray-edta",
        zoneId: "zone-bur",
      };
    }
    if (!pipetteAdded) {
      return {
        text: `Pipette 20.0 mL of ${phase === 1 ? "standard hard water (1000 ppm CaCO₃ eq)" : "the unknown water sample"} into the conical flask.`,
        targetId: "tray-pip",
        zoneId: "zone-flask",
      };
    }
    if (!bufferAdded) {
      return {
        text: "Add 4 mL of ammonia buffer (NH₃–NH₄Cl) to buffer the solution to pH 10 for stable EDTA chelation.",
        targetId: "tray-buf",
        zoneId: "zone-flask",
      };
    }
    if (!ebtAdded) {
      return {
        text: "Add 3 drops of Eriochrome Black-T (EBT) indicator. Free Ca²⁺/Mg²⁺ form an unstable wine-red complex.",
        targetId: "tray-ebt",
        zoneId: "zone-flask",
      };
    }
    if (finalRecorded === null && !endpointReached) {
      return {
        text: "Hold 'Hold to Run' to deliver EDTA. Switch to '1 Drop' single drops as wine-red turns purple.",
        targetId: "btn-run",
      };
    }
    if (finalRecorded === null) {
      return {
        text: "The solution is crisp steel blue (all metal ions complexed). Click 'Record Final Reading'.",
        targetId: "btn-fin",
      };
    }
    return null;
  }, [flaskPlaced, buretteFilled, pipetteAdded, bufferAdded, ebtAdded, finalRecorded, endpointReached, phase]);

  // Position coach tooltip
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

      if (dropsPulse > 0) {
        setDropsPulse((prev) => Math.max(0, prev - dt));
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, ebtAdded, buretteFilled, finalRecorded, buretteUsed, dropsPulse]);

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

  // Color calculation with realistic continuous spectral transition
  const solutionColor = useMemo(() => {
    if (!ebtAdded) {
      return bufferAdded ? "#e5eff5" : pipetteAdded ? "#dbe9f4" : "transparent";
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

  // Direct apparatus interaction
  const handleItemAction = useCallback(
    (id: string) => {
      setShowCoach(false);

      if (id === "flask") {
        if (flaskPlaced) return;
        setFlaskPlaced(true);
        acoustics.playGlass();
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
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
        acoustics.playGlass();
        triggerToast("Class-A burette filled with 0.01 N EDTA to 0.00 mL ✓");
        return;
      }

      if (!flaskPlaced) {
        triggerToast("Mount the conical flask onto the white tile first.");
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

  // Precision single drop delivery (+0.05 mL)
  const handleSingleDrop = () => {
    if (!ebtAdded || !buretteFilled || finalRecorded !== null || buretteUsed >= 50) return;
    setBuretteUsed((prev) => Math.min(50, prev + 0.05));
    setDropsPulse(0.35);
    acoustics.playDrop();
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
    setShowCoach(false);
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
      triggerToast("Titration II: 20 mL pipette now dispenses unknown water sample.");
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

  // "Show me" ghost animation
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

  // Drag interaction with stage 3D parallax
  const onPointerDownItem = (e: React.PointerEvent, id: string) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragItem(id);
    setShowCoach(false);
    acoustics.playGlass();
  };

  const onPointerMoveStage = (e: React.PointerEvent) => {
    if (!stageRef.current) return;
    const stageRect = stageRef.current.getBoundingClientRect();
    const centerX = stageRect.left + stageRect.width / 2;
    const centerY = stageRect.top + stageRect.height / 2;
    const normX = (e.clientX - centerX) / (stageRect.width / 2);
    const normY = (e.clientY - centerY) / (stageRect.height / 2);

    // Subtle 3D glided parallax
    setTilt({
      rx: Math.max(-5, Math.min(5, -normY * 4)),
      ry: Math.max(-6, Math.min(6, normX * 5)),
    });

    if (!dragItem) return;

    const scale = stageRect.width / 1000;
    const mouseX = (e.clientX - stageRect.left) / scale;
    const mouseY = (e.clientY - stageRect.top) / scale;

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
      {/* Background Ambient Lighting */}
      <div className="exp1-ambient-glow" />

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
            className="exp1-btn-subtle"
            id="btn-hint"
            onClick={() => refreshCoach()}
            aria-label="Show contextual hint"
          >
            ? Hint
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
        {/* Stage Wrapper */}
        <div className="exp1-wrap" ref={wrapRef} onPointerMove={onPointerMoveStage}>
          <div className="exp1-stage" ref={stageRef}>
            {/* SVG Apparatus Scene with 3D Lighting & Shading */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none exp1-glass-filter" viewBox="0 0 1000 620">
              <defs>
                <clipPath id="flaskClip">
                  <path d="M482 400H518V445L575 518Q579 522 572 522H428Q421 522 425 518L482 445Z" />
                </clipPath>
                {/* 3D Glass Specular Gradient */}
                <linearGradient id="glassSheen" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
                  <stop offset="25%" stopColor="rgba(255,255,255,0.15)" />
                  <stop offset="70%" stopColor="rgba(255,255,255,0.05)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.35)" />
                </linearGradient>
                {/* Meniscus Shadow */}
                <linearGradient id="meniscusGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#70b5f5" />
                  <stop offset="100%" stopColor="#4187cc" />
                </linearGradient>
                {/* Metallic Retort Rod */}
                <linearGradient id="rodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3d4743" />
                  <stop offset="45%" stopColor="#879690" />
                  <stop offset="70%" stopColor="#55635e" />
                  <stop offset="100%" stopColor="#2c3330" />
                </linearGradient>
              </defs>

              {/* Bench surface with beveled 3D perspective edge */}
              <rect x="190" y="520" width="810" height="100" fill="var(--exp-bench)" />
              <rect x="190" y="516" width="810" height="4" fill="var(--exp-bench-edge)" />
              <rect x="190" y="514" width="810" height="2" fill="rgba(255,255,255,0.12)" />

              {/* White titration porcelain tile */}
              <rect x="400" y="518" width="200" height="6" rx="3" fill="#ffffff" opacity="0.98" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />

              {/* Retort Stand & Clamp Assembly */}
              <rect x="718" y="55" width="10" height="465" rx="3" fill="url(#rodGrad)" />
              <rect x="615" y="510" width="230" height="12" rx="4" fill="url(#rodGrad)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))" />
              <rect x="502" y="148" width="226" height="8" rx="2" fill="url(#rodGrad)" />
              <rect x="492" y="138" width="24" height="28" rx="4" fill="#323c38" stroke="#485450" strokeWidth="1" />
              {/* Clamp fingers around burette */}
              <path d="M486 142H492V162H486Z" fill="#242b28" />

              {/* Burette graduations (0 to 50 mL) */}
              <g stroke="var(--exp-mute)" strokeWidth="1" fontSize="10" fill="var(--exp-mute)" opacity="0.9">
                {[...Array(11)].map((_, i) => {
                  const m = i * 5;
                  const y = 72 + m * 5.2;
                  return (
                    <g key={m}>
                      <line x1="479" x2="488" y1={y} y2={y} strokeWidth="1.2" />
                      <text x="458" y={y + 3.5} textAnchor="end" fontFamily="var(--font-mono, monospace)" fontSize="9.5">
                        {m}
                      </text>
                      {/* Minor tick marks */}
                      {i < 10 && (
                        <>
                          <line x1="483" x2="488" y1={y + 5.2 * 1} y2={y + 5.2 * 1} strokeWidth="0.7" opacity="0.6" />
                          <line x1="483" x2="488" y1={y + 5.2 * 2} y2={y + 5.2 * 2} strokeWidth="0.7" opacity="0.6" />
                          <line x1="483" x2="488" y1={y + 5.2 * 3} y2={y + 5.2 * 3} strokeWidth="0.7" opacity="0.6" />
                          <line x1="483" x2="488" y1={y + 5.2 * 4} y2={y + 5.2 * 4} strokeWidth="0.7" opacity="0.6" />
                        </>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Burette Glass Tube */}
              <rect
                x="488"
                y="68"
                width="24"
                height="266"
                rx="4"
                fill="var(--exp-glass)"
                stroke="var(--exp-line)"
                strokeWidth="1.5"
              />
              <rect x="490" y="70" width="8" height="262" rx="2" fill="url(#glassSheen)" opacity="0.6" />

              {/* Burette Liquid Column with Meniscus Curve */}
              {buretteFilled && (
                <g>
                  <rect
                    x="490"
                    y={72 + buretteUsed * 5.2}
                    width="20"
                    height={Math.max(0, 260 - buretteUsed * 5.2)}
                    fill="url(#meniscusGrad)"
                    opacity="0.88"
                  />
                  {/* Curved Meniscus Surface */}
                  <path
                    d={`M490 ${72 + buretteUsed * 5.2} Q500 ${75 + buretteUsed * 5.2} 510 ${72 + buretteUsed * 5.2}`}
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </g>
              )}

              {/* Stopcock valve assembly */}
              <rect x="494" y="332" width="12" height="10" fill="var(--exp-rod)" rx="1" />
              {/* 3D Stopcock Handle (Rotates smoothly during flow) */}
              <rect
                x="484"
                y="334"
                width="32"
                height="7"
                rx="2"
                fill="#dc2626"
                stroke="#991b1b"
                strokeWidth="1"
                transform={isRunning ? "rotate(90 500 337)" : "none"}
                style={{ transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)" }}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
              />

              {/* Burette Delivery Tip */}
              <path d="M497 342H503V362L500 368L497 362Z" fill="var(--exp-glass)" stroke="var(--exp-line)" strokeWidth="1" />

              {/* Falling Liquid Droplet with Fluid Stretch Physics */}
              {(isRunning || dropsPulse > 0) && (
                <ellipse cx="500" cy="382" rx="2.8" ry="4.2" fill="#70b5f5" opacity="0.95" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))" />
              )}

              {/* Conical Flask on Porcelain Tile */}
              {flaskPlaced && (
                <g>
                  {/* Liquid inside flask with smooth color progression */}
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
                      opacity="0.94"
                      style={{ transition: "fill 0.25s ease, height 0.2s ease" }}
                    />
                    {/* Liquid surface wave ripple */}
                    {pipetteAdded && (isRunning || dropsPulse > 0) && (
                      <ellipse
                        cx="500"
                        cy={522 - Math.min(115, 20 + (bufferAdded ? 8 : 0) + (ebtAdded ? 4 : 0) + buretteUsed * 1.5)}
                        rx="24"
                        ry="4"
                        fill="rgba(255,255,255,0.4)"
                        opacity="0.7"
                      />
                    )}
                  </g>

                  {/* Pyrex Glass Flask Body & Specular Highlights */}
                  <path
                    d="M482 400H518V445L575 518Q579 522 572 522H428Q421 522 425 518L482 445Z"
                    fill="rgba(255,255,255,0.12)"
                    stroke="var(--exp-mute)"
                    strokeWidth="2.2"
                  />
                  {/* Refractive curved highlight */}
                  <path
                    d="M486 410L486 442L438 506"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Pyrex Volume Graduations */}
                  <line x1="535" y1="480" x2="547" y2="480" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
                  <line x1="542" y1="495" x2="556" y2="495" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
                  <text x="562" y="498" fill="rgba(255,255,255,0.6)" fontSize="8" fontFamily="sans-serif">
                    100
                  </text>
                </g>
              )}
            </svg>

            {/* Apparatus Tray on Stage with Glided Cards */}
            <div className="exp1-tray">
              <span className="exp1-tray-header">Apparatus Tray</span>
              <div className="exp1-tray-items">
                {/* 1. Conical Flask */}
                <div
                  id="tray-flask"
                  className={`exp1-item ${dragItem === "flask" ? "drag" : ""} ${flaskPlaced ? "gone" : ""}`}
                  onPointerDown={(e) => onPointerDownItem(e, "flask")}
                  onPointerUp={(e) => onPointerUpItem(e, "flask")}
                  role="button"
                  tabIndex={0}
                  aria-label="Conical Flask: 250 mL Pyrex"
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
                  role="button"
                  tabIndex={0}
                  aria-label="0.01 N Disodium EDTA solution bottle"
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

                {/* 3. 20 mL Bulb Pipette */}
                <div
                  id="tray-pip"
                  className={`exp1-item ${dragItem === "pip" ? "drag" : ""}`}
                  onPointerDown={(e) => onPointerDownItem(e, "pip")}
                  onPointerUp={(e) => onPointerUpItem(e, "pip")}
                  role="button"
                  tabIndex={0}
                  aria-label="20 mL Volumetric Bulb Pipette"
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

                {/* 4. Ammonia Buffer Solution Bottle */}
                <div
                  id="tray-buf"
                  className={`exp1-item ${dragItem === "buf" ? "drag" : ""}`}
                  onPointerDown={(e) => onPointerDownItem(e, "buf")}
                  onPointerUp={(e) => onPointerUpItem(e, "buf")}
                  role="button"
                  tabIndex={0}
                  aria-label="NH3-NH4Cl buffer solution bottle (pH 10)"
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

                {/* 5. Eriochrome Black-T (EBT) Indicator Dropper */}
                <div
                  id="tray-ebt"
                  className={`exp1-item ${dragItem === "ebt" ? "drag" : ""}`}
                  onPointerDown={(e) => onPointerDownItem(e, "ebt")}
                  onPointerUp={(e) => onPointerUpItem(e, "ebt")}
                  role="button"
                  tabIndex={0}
                  aria-label="Eriochrome Black-T Indicator Dropper bottle"
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

            {/* Dynamic Burette HUD Readout */}
            <div className="exp1-hud">
              <span>
                Burette: {buretteFilled ? (Math.round(buretteUsed * 20) / 20).toFixed(2) : "–"} mL
              </span>
              <small>Read bottom of concave meniscus</small>
            </div>

            {/* Chemical Reaction Phase HUD */}
            <div className="exp1-rxn-hud">
              <span className="exp1-rxn-title">Chemical State</span>
              <div className="exp1-rxn-state">
                <span
                  className="exp1-rxn-indicator"
                  style={{
                    backgroundColor: ebtAdded
                      ? endpointReached
                        ? "#38bdf8"
                        : buretteUsed / currentTargetEndpoint > 0.85
                        ? "#8b5cf6"
                        : "#ef4444"
                      : "#94a3b8",
                  }}
                />
                <span>
                  {!ebtAdded
                    ? bufferAdded
                      ? "Buffered (pH 10)"
                      : pipetteAdded
                      ? "Aqueous Sample"
                      : "Bench Ready"
                    : endpointReached
                    ? "Free EBT (Steel Blue)"
                    : buretteUsed / currentTargetEndpoint > 0.85
                    ? "Equivalence Near (Purple)"
                    : "[Ca/Mg-EBT] (Wine Red)"}
                </span>
              </div>
            </div>

            {/* Ghost demo node for animated tutorials */}
            <div id="ghost" />
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
              <li className={flaskPlaced ? "done" : ""}>Mount 250 mL conical flask on white tile</li>
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
                  setShowCoach(false);
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
