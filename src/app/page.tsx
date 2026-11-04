import Link from "next/link";
import { EXPERIMENTS_REGISTRY } from "@/data/experiments-registry";
import "@/components/laboratory/edta.css";
import "./home.css";

export default function HomePage() {
  return (
    <div className="edta-lab home-lab">
      <header className="edta-header">
        <Link href="/" className="edta-brand">
          CC<span>CHEMLAB / CHENNAI</span>
        </Link>
        <span className="edta-course">A LABORATORY FOR THE CURIOUS</span>
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
            Take the pipette. Open the stopcock.
            <br />
            Watch chemistry become something you can measure.
          </p>
          <Link className="home-enter" href="/experiments/exp-1">
            Enter the water laboratory <span>↗</span>
          </Link>
          <span className="home-note">
            01A — EDTA hardness titration · Practice, demonstration & challenge
          </span>
        </div>
        <div className="home-object">
          <svg
            viewBox="0 0 540 600"
            role="img"
            aria-label="Illustration of a conical flask with wine-red indicator beneath a burette"
          >
            <defs>
              <linearGradient id="hg">
                <stop stopColor="#ffffff" stopOpacity=".9" />
                <stop offset=".35" stopColor="#bfd8c9" stopOpacity=".12" />
                <stop offset="1" stopColor="#628b77" stopOpacity=".5" />
              </linearGradient>
              <linearGradient id="hl" x2="0" y2="1">
                <stop stopColor="#b8546a" />
                <stop offset="1" stopColor="#6d1e3a" />
              </linearGradient>
              <radialGradient id="hs">
                <stop stopColor="#3b5d47" stopOpacity=".4" />
                <stop offset="1" stopColor="#3b5d47" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="285" cy="275" r="230" fill="#e1e7d6" />
            <path d="M70 0L400 600H540L250 0Z" fill="#fffdf1" opacity=".55" />
            <ellipse cx="270" cy="524" rx="190" ry="36" fill="url(#hs)" />
            <path
              d="M257 0V143L267 162L277 143V0"
              fill="url(#hg)"
              stroke="#719385"
              strokeWidth="2"
            />
            <rect
              x="239"
              y="123"
              width="57"
              height="12"
              rx="6"
              fill="#a7734f"
            />
            <path d="M267 175Q250 201 267 205Q284 201 267 175" fill="#85b4b0" />
            <path
              d="M237 237H297V325L392 489Q404 516 377 522H157Q130 516 142 489L237 325Z"
              fill="url(#hg)"
              stroke="#7f9c88"
              strokeWidth="2"
            />
            <path
              d="M191 405H343L392 489Q404 516 377 522H157Q130 516 142 489Z"
              fill="url(#hl)"
              opacity=".9"
            />
            <ellipse cx="267" cy="405" rx="76" ry="10" fill="#ba6b7e" />
            <path
              d="M159 487L248 329V250"
              fill="none"
              stroke="white"
              strokeWidth="9"
              opacity=".6"
            />
            <path d="M230 235H304" stroke="#638a75" strokeWidth="6" />
            <path
              d="M325 381H345M344 416H365M360 451H382"
              stroke="#f9f9ec"
              strokeWidth="2"
            />
            <text
              x="236"
              y="366"
              fontFamily="Georgia"
              fontSize="25"
              fill="#466652"
            >
              250 mL
            </text>
            <text
              x="320"
              y="575"
              fontSize="10"
              fill="#48634e"
              letterSpacing="3"
            >
              OBSERVE. MEASURE. UNDERSTAND.
            </text>
          </svg>
          <span className="home-annotation">
            Wine red → steel blue
            <br />
            <small>One endpoint. A measurable difference.</small>
          </span>
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
                ? "EDTA playable · other activities in preview"
                : "Reference material · simulation pending"}
            </small>
            <span>↗</span>
          </Link>
        ))}
      </section>
      <footer className="edta-footer">
        <span>VIT CHENNAI · ENGINEERING CHEMISTRY · 2026–27</span>
        <span>
          A teaching simulation. Observations are not physical laboratory
          measurements.
        </span>
      </footer>
    </div>
  );
}
