import Link from "next/link";
import { EXPERIMENTS_REGISTRY } from "@/data/experiments-registry";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { HeroAtrium3D } from "@/components/atrium/HeroAtrium3D";
import "@/components/laboratory/edta.css";
import "./home.css";

export default function HomePage() {
  const standards = [
    "VIT CHENNAI • SAS",
    "GRADE A VOLUMETRIC GLASSWARE",
    "DIN ISO 385 BURETTE STANDARD",
    "IUPAC COMPLEXOMETRIC METHOD",
    "EULER MASS CONSERVATION",
    "10-VESSEL SPECIATION ENGINE",
    "0.05 mL MENISCUS TOLERANCE",
    "BIS 10500:2012 PROTOCOL",
  ];

  return (
    <SmoothScrollProvider>
      <div className="edta-lab home-lab">
        {/* ── 0. Navigation ── */}
        <header className="edta-header">
          <Link href="/" className="edta-brand">
            CC<span>CHEMLAB / CHENNAI</span>
          </Link>
          <span className="edta-course">A DIGITAL LABORATORY FOR BCHY101P</span>
          <nav className="home-nav-links" aria-label="Main Navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#capabilities">Bento</a>
            <a href="#experiments">Stations</a>
            <Link href="/experiments/exp-1" className="home-nav-cta">
              Enter Lab ↗
            </Link>
          </nav>
        </header>

        {/* ── 1. Hero Section ── */}
        <section className="home-hero">
          <div className="home-copy">
            <div className="home-pill" aria-label="Announcement">
              <span className="pill-badge">NEW</span>
              <span>Digital Twin 2.0 is live • Grade A Calibrated Glassware</span>
              <span className="pill-arrow" aria-hidden="true">→</span>
            </div>

            <h1>
              Small drops.
              <br />
              Real discovery.
            </h1>

            <p>
              Operate the calibrated burette. Aspirate precision aliquots.
              Watch coordination chemistry unfold drop-by-drop in real time.
            </p>

            <div className="home-actions">
              <Link className="home-enter" href="/experiments/exp-1">
                Enter the water laboratory <span aria-hidden="true">↗</span>
              </Link>
              <a href="#experiments" className="home-secondary-action">
                Explore stations <span aria-hidden="true">↓</span>
              </a>
            </div>

            <span className="home-note">
              Station 01 — EDTA Complexometric Hardness Titration · 3D Digital Twin, Interactive Practice & Challenge
            </span>
          </div>

          <div className="home-object">
            <HeroAtrium3D />
          </div>
        </section>

        {/* ── 2. Scientific Standards Marquee (Lumen Blueprint Section 2) ── */}
        <section className="home-marquee-wrap" aria-label="Institutional Standards">
          <div className="home-marquee">
            <div className="marquee-track">
              {standards.map((s, idx) => (
                <span key={idx} className="marquee-item">
                  {s} <span className="marquee-sep" aria-hidden="true">◆</span>
                </span>
              ))}
            </div>
            <div className="marquee-track" aria-hidden="true">
              {standards.map((s, idx) => (
                <span key={`dup-${idx}`} className="marquee-item">
                  {s} <span className="marquee-sep" aria-hidden="true">◆</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Features Bento Grid (Lumen Blueprint Section 3) ── */}
        <section id="capabilities" className="home-bento-section" aria-label="Platform Architecture">
          <p className="edta-eyebrow">DIGITAL TWIN CAPABILITIES</p>
          <h2 className="section-title">One platform. Every station.</h2>

          <div className="bento-grid">
            {/* Tile 1: Large - Realtime Coordination Chemistry */}
            <div className="bento-tile bento-large">
              <div className="bento-badge">REALTIME ENGINE</div>
              <h3>Continuous Complex Speciation</h3>
              <p>
                Calculates dynamic equilibrium between free Ca²⁺/Mg²⁺, weak [M-EBT]⁻ indicator complex,
                and strong hexadentate [M-EDTA]²⁻ chelate at buffered pH 10.00.
              </p>
              <div className="bento-sparkline" aria-hidden="true">
                <span className="spark-stage stage-red">[M-In]⁻ Wine Red</span>
                <span className="spark-arrow">⟶</span>
                <span className="spark-stage stage-violet">Violet Transition</span>
                <span className="spark-arrow">⟶</span>
                <span className="spark-stage stage-blue">[M-EDTA]²⁻ Steel Blue</span>
              </div>
            </div>

            {/* Tile 2: Small Stat - Compute Latency */}
            <div className="bento-tile bento-stat">
              <div className="bento-badge">COMPUTE</div>
              <div className="bento-number">3.8 ms</div>
              <div className="bento-stat-label">Equilibrium Latency</div>
              <p className="bento-sub">Sub-millisecond stoichiometric evaluation on every dispensed microdrop.</p>
            </div>

            {/* Tile 3: Tall - 5 Active Modules */}
            <div className="bento-tile bento-tall">
              <div className="bento-badge">STATION 01 SUITE</div>
              <h3>Five Titrimetric Modules</h3>
              <p>Complete curriculum coverage for water quality analysis:</p>
              <div className="bento-chips">
                <span className="chip">1A: EDTA Standardisation</span>
                <span className="chip">1B: Total Hardness</span>
                <span className="chip">1C: Permanent Hardness</span>
                <span className="chip">1D: Temporary Hardness</span>
                <span className="chip">1E: Unknown Sample Audit</span>
              </div>
            </div>

            {/* Tile 4: Small Badge - Mass Conservation */}
            <div className="bento-tile bento-badge-card">
              <div className="bento-badge">PHYSICAL LAW</div>
              <div className="bento-law">∑ Δnᵢ = 0</div>
              <div className="bento-stat-label">10-Vessel Mass Conservation</div>
              <p className="bento-sub">Deterministic molar continuity strictly preserved across all transfer stages.</p>
            </div>

            {/* Tile 5: Wide - Curricular Integration */}
            <div className="bento-tile bento-wide">
              <div className="bento-badge">ACADEMIC ALIGNMENT</div>
              <h3>Vellore Institute of Technology • BCHY101P</h3>
              <p>
                Engineered to match the official 2026–27 laboratory syllabus. Automated concordance validation,
                step-by-step technique guidance, and verifiable observation notebook reports.
              </p>
            </div>
          </div>
        </section>

        {/* ── 4. How It Works Steps (Lumen Blueprint Section 4) ── */}
        <section id="how-it-works" className="home-steps-section" aria-label="Experimental Workflow">
          <p className="edta-eyebrow">TITRIMETRIC METHODOLOGY</p>
          <h2 className="section-title">From aliquot to analysis.</h2>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-num">01</div>
              <h3>Aspirate & Buffer</h3>
              <p>
                Condition the volumetric pipette with water sample. Transfer exactly 20.00 mL to the 250 mL conical flask.
                Add 4.00 mL ammonia buffer to maintain pH 10.00 and 3 drops of Eriochrome Black-T.
              </p>
              <div className="step-tag">Sample turns wine-red</div>
            </div>

            <div className="step-card">
              <div className="step-num">02</div>
              <h3>Titrate & Observe</h3>
              <p>
                Operate the PTFE stopcock on the calibrated burette. Titrate against standardized EDTA under continuous
                stirring. Observe the gradual transition from wine-red through purple to steel-blue.
              </p>
              <div className="step-tag">Displacement complete</div>
            </div>

            <div className="step-card">
              <div className="step-num">03</div>
              <h3>Concord & Calculate</h3>
              <p>
                Ensure consecutive titration runs achieve concordance within ±0.10 mL tolerance.
                Calculate total, permanent, and temporary hardness in parts per million (mg/L CaCO₃).
              </p>
              <div className="step-tag">Verification & report</div>
            </div>
          </div>
        </section>

        {/* ── 5. Telemetry & Quality Standards (Lumen Blueprint Section 5) ── */}
        <section className="home-telemetry" aria-label="Laboratory Precision Specifications">
          <div className="telemetry-card">
            <span className="telemetry-val">0.05 mL</span>
            <span className="telemetry-label">Meniscus Tolerance</span>
            <span className="telemetry-desc">Grade A certified volumetric graduation with physical concave refraction.</span>
          </div>
          <div className="telemetry-card">
            <span className="telemetry-val">10 Vessels</span>
            <span className="telemetry-label">Conservation Engine</span>
            <span className="telemetry-desc">Deterministic molar conservation across all discrete liquid transfer states.</span>
          </div>
          <div className="telemetry-card">
            <span className="telemetry-val">3.8 ms</span>
            <span className="telemetry-label">Speciation Compute</span>
            <span className="telemetry-desc">Sub-millisecond thermodynamic equilibrium and ligand exchange evaluation.</span>
          </div>
          <div className="telemetry-card">
            <span className="telemetry-val">log Kf = 10.7</span>
            <span className="telemetry-label">Chelate Formation</span>
            <span className="telemetry-desc">High-affinity EDTA⁴⁻ ligand displacement driving sharp wine-red to blue endpoint.</span>
          </div>
        </section>

        {/* ── 6. Experiment Stations Catalog (Lumen Blueprint Section 6) ── */}
        <section id="experiments" className="home-directory">
          <p className="edta-eyebrow">CURRICULAR CATALOG</p>
          <h2 className="section-title">Inside the laboratory.</h2>
          {EXPERIMENTS_REGISTRY.map((e) => (
            <Link
              key={e.id}
              href={`/experiments/${e.id}`}
              className="home-experiment"
            >
              <span>{String(e.number).padStart(2, "0")}</span>
              <strong>{e.shortTitle}</strong>
              <small>
                {e.number === 1
                  ? "3D Digital Twin · Interactive Titration"
                  : "Syllabus Blueprint · Calculations & Review"}
              </small>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </section>

        {/* ── 7. Call To Action (Lumen Blueprint Section 6) ── */}
        <section className="home-cta-banner">
          <div className="cta-content">
            <h2>Ready to enter the digital twin?</h2>
            <p>
              Experience authentic wet-lab mechanics without safety hazards or material costs.
              Deterministic simulation calibrated for VIT Chennai students.
            </p>
            <Link className="home-enter" href="/experiments/exp-1">
              Launch Station 01 Digital Twin <span aria-hidden="true">↗</span>
            </Link>
            <div className="cta-trust">
              Free open-access for students & faculty • No registration required • Strict ISO volumetric compliance
            </div>
          </div>
        </section>

        {/* ── 8. Footer (Lumen Blueprint Section 7) ── */}
        <footer className="edta-footer">
          <span>VIT CHENNAI • ENGINEERING CHEMISTRY • BCHY101P</span>
          <span>
            A scientific teaching laboratory simulation. Deterministic physical conservation models.
          </span>
        </footer>
      </div>
    </SmoothScrollProvider>
  );
}
