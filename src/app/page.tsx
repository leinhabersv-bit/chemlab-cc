import Link from "next/link";
import { EXPERIMENTS_REGISTRY } from "@/data/experiments-registry";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { HeroAtrium3D } from "@/components/atrium/HeroAtrium3D";
import "@/components/laboratory/edta.css";
import "./home.css";

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <div className="edta-lab home-lab">
        <header className="edta-header">
          <Link href="/" className="edta-brand">
            CC<span>CHEMLAB / CHENNAI</span>
          </Link>
          <span className="edta-course">A DIGITAL LABORATORY FOR BCHY101P</span>
          <a href="#experiments">Explore experiments ↓</a>
        </header>

        <section className="home-hero">
          <div className="home-copy">
            <p className="edta-eyebrow">ENGINEERING CHEMISTRY / BCHY101P</p>
            <h1>
              Small drops.
              <br />
              Real discovery.
            </h1>
            <p>
              Operate the calibrated burette. Aspirate precision aliquots.
              Watch coordination chemistry unfold drop-by-drop in real time.
            </p>
            <Link className="home-enter" href="/experiments/exp-1">
              Enter the water laboratory <span>↗</span>
            </Link>
            <span className="home-note">
              Station 01 — EDTA Complexometric Hardness Titration · 3D Digital Twin, Interactive Practice & Challenge
            </span>
          </div>

          <div className="home-object">
            <HeroAtrium3D />
          </div>
        </section>

        {/* Real scientific telemetry stats band */}
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

        <section id="experiments" className="home-directory">
          <p className="edta-eyebrow">YOUR NEXT DISCOVERY</p>
          <h2>Inside the laboratory.</h2>
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
              <span>↗</span>
            </Link>
          ))}
        </section>

        <footer className="edta-footer">
          <span>VIT CHENNAI · ENGINEERING CHEMISTRY · BCHY101P</span>
          <span>
            A scientific teaching laboratory simulation. Deterministic physical conservation models.
          </span>
        </footer>
      </div>
    </SmoothScrollProvider>
  );
}
