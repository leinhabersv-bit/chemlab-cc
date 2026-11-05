import Link from "next/link";

export default function HomePage() {
  const logos = [
    "Northwind",
    "Helix Labs",
    "Orbital",
    "Fathom",
    "Kepler & Co",
    "Nimbus",
    "Synthetix",
    "Apex Data",
  ];

  return (
    <div className="w-full min-h-screen flex flex-col justify-between">
      {/* ── 0. Sticky Header Navigation ── */}
      <header className="sticky top-0 z-40 w-full glass hairline px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-bold font-display text-base">
            ✦
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white">
            Lumen
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-mono text-muted">
          <a href="#features" className="hover:text-foreground transition-colors">
            Product
          </a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#impact" className="hover:text-foreground transition-colors">
            Impact
          </a>
          <a href="#cta" className="hover:text-foreground transition-colors">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#cta"
            className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-accent text-accent-ink hover:bg-instrument-amber-dark transition-all shadow-lg shadow-accent/20"
          >
            Get started ↗
          </a>
        </div>
      </header>

      {/* ── 1. Hero Section ── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 md:py-32 flex flex-col items-start w-full">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass hairline text-xs font-mono text-muted mb-8">
          <span className="px-2 py-0.5 rounded-full bg-accent text-accent-ink font-bold text-[10px]">
            NEW
          </span>
          <span>Agents 2.0 is live</span>
          <span aria-hidden="true" className="text-accent">→</span>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white max-w-3xl leading-[1.04] mb-8">
          Intelligence that moves with you.
        </h1>

        <p className="text-lg md:text-xl text-muted max-w-xl leading-relaxed mb-10">
          Turn scattered telemetry and unstructured signals into autonomous agent decisions in minutes.
          Plain language workflows that orchestrate across your entire toolstack.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <a
            href="#cta"
            className="px-6 py-3.5 rounded-xl text-sm font-semibold bg-accent text-accent-ink hover:bg-instrument-amber-dark transition-all shadow-xl shadow-accent/25 flex items-center gap-2"
          >
            <span>Start free</span>
            <span aria-hidden="true">↗</span>
          </a>
          <a
            href="#how-it-works"
            className="px-6 py-3.5 rounded-xl text-sm font-semibold glass hairline text-foreground hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <span>Watch it work</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      {/* ── 2. Logo Marquee ── */}
      <section className="w-full py-8 border-y border-white/5 bg-background/50 overflow-hidden relative">
        <div className="flex w-max animate-marquee">
          <div className="flex items-center gap-16 pr-16">
            {logos.map((name, i) => (
              <span
                key={i}
                className="font-display font-semibold text-base text-muted/60 tracking-wider uppercase whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-16 pr-16" aria-hidden="true">
            {logos.map((name, i) => (
              <span
                key={`dup-${i}`}
                className="font-display font-semibold text-base text-muted/60 tracking-wider uppercase whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Features Bento Grid ── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-28 w-full">
        <div className="mb-14">
          <p className="font-mono text-xs text-accent font-semibold tracking-widest uppercase mb-3">
            CAPABILITIES
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            One platform. Every signal.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tile 1: Large (Realtime insights) */}
          <div className="md:col-span-2 glass rounded-2xl p-8 flex flex-col justify-between hover:border-accent/40 transition-all">
            <div>
              <span className="font-mono text-[10px] text-accent font-bold tracking-wider uppercase">
                TELEMETRY
              </span>
              <h3 className="font-display text-2xl font-bold text-white mt-3 mb-2">
                Realtime Signals & Autonomous Insights
              </h3>
              <p className="text-muted text-sm leading-relaxed max-w-lg">
                Continuous stream evaluation across APIs, logs, and database events.
                Zero query queueing. Sub-second reactive intelligence.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between font-mono text-xs text-muted">
              <span className="text-signal flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-signal animate-pulse" />
                Live ingest: 142k events/sec
              </span>
              <span>P99: 14ms</span>
            </div>
          </div>

          {/* Tile 2: Small Stat (Latency) */}
          <div className="glass rounded-2xl p-8 flex flex-col justify-between hover:border-accent/40 transition-all">
            <span className="font-mono text-[10px] text-accent font-bold tracking-wider uppercase">
              PERFORMANCE
            </span>
            <div className="my-6">
              <div className="font-mono text-5xl font-extrabold text-accent">38ms</div>
              <div className="font-semibold text-white mt-2">Median Latency</div>
            </div>
            <p className="text-muted text-xs leading-relaxed">
              Global edge inference points across 300+ regions with zero cold start.
            </p>
          </div>

          {/* Tile 3: Tall (Smart agents) */}
          <div className="glass rounded-2xl p-8 flex flex-col justify-between hover:border-accent/40 transition-all">
            <div>
              <span className="font-mono text-[10px] text-accent font-bold tracking-wider uppercase">
                AUTONOMY
              </span>
              <h3 className="font-display text-xl font-bold text-white mt-3 mb-2">
                Smart Agent Roles
              </h3>
              <p className="text-muted text-xs leading-relaxed mb-6">
                Pre-configured specialists ready to deploy with guarded tool calling.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Support", "Sales Ops", "Security", "Finance", "Research"].map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1.5 rounded-lg bg-surface hairline font-mono text-xs text-foreground"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tile 4: Small Badge (Private by design) */}
          <div className="glass rounded-2xl p-8 flex flex-col justify-between hover:border-accent/40 transition-all">
            <span className="font-mono text-[10px] text-accent font-bold tracking-wider uppercase">
              SECURITY
            </span>
            <div className="my-4">
              <div className="font-display text-2xl font-bold text-white">SOC 2 Type II</div>
              <div className="text-muted text-xs mt-1">Enterprise Compliance</div>
            </div>
            <p className="text-muted text-xs leading-relaxed">
              Zero training on customer data. End-to-end encrypted tenant isolation.
            </p>
          </div>

          {/* Tile 5: Wide (200+ integrations) */}
          <div className="glass rounded-2xl p-8 flex flex-col justify-between hover:border-accent/40 transition-all">
            <span className="font-mono text-[10px] text-accent font-bold tracking-wider uppercase">
              ECOSYSTEM
            </span>
            <div className="my-4">
              <div className="font-display text-2xl font-bold text-white">200+ Integrations</div>
              <div className="text-muted text-xs mt-1">Native Tool Calling</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Slack", "Notion", "Stripe", "Linear", "GitHub", "+197 more"].map((tool) => (
                <span
                  key={tool}
                  className="px-2.5 py-1 rounded bg-surface hairline font-mono text-xs text-muted"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. How It Works (3 Steps) ── */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-28 w-full border-t border-white/5">
        <div className="mb-16">
          <p className="font-mono text-xs text-accent font-semibold tracking-widest uppercase mb-3">
            METHODOLOGY
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            From question to action.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass rounded-2xl p-8 flex flex-col">
            <span className="font-mono text-2xl font-bold text-accent mb-6">01</span>
            <h3 className="font-display text-xl font-bold text-white mb-3">Connect</h3>
            <p className="text-muted text-sm leading-relaxed mb-6">
              Plug into your existing telemetry, data warehouses, and internal microservices with 1-click connectors.
            </p>
            <div className="mt-auto font-mono text-xs text-info">Zero schema migration</div>
          </div>

          <div className="glass rounded-2xl p-8 flex flex-col">
            <span className="font-mono text-2xl font-bold text-accent mb-6">02</span>
            <h3 className="font-display text-xl font-bold text-white mb-3">Ask</h3>
            <p className="text-muted text-sm leading-relaxed mb-6">
              Pose operational questions in plain language. Lumen reasons across multi-hop data with verifiable citations.
            </p>
            <div className="mt-auto font-mono text-xs text-info">Structured reasoning</div>
          </div>

          <div className="glass rounded-2xl p-8 flex flex-col">
            <span className="font-mono text-2xl font-bold text-accent mb-6">03</span>
            <h3 className="font-display text-xl font-bold text-white mb-3">Automate</h3>
            <p className="text-muted text-sm leading-relaxed mb-6">
              Trigger autonomous workflows with human-in-the-loop validation policies. Turn decisions into executed pull requests and alerts.
            </p>
            <div className="mt-auto font-mono text-xs text-signal">Autonomous execution</div>
          </div>
        </div>
      </section>

      {/* ── 5. Impact Telemetry Stats ── */}
      <section id="impact" className="max-w-7xl mx-auto px-6 py-20 w-full border-t border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col">
            <span className="font-mono text-4xl sm:text-5xl font-extrabold text-accent">12x</span>
            <span className="font-display text-base font-bold text-white mt-2">Faster Reporting</span>
            <span className="text-muted text-xs font-mono mt-1">Cross-system synthesis</span>
          </div>

          <div className="flex flex-col">
            <span className="font-mono text-4xl sm:text-5xl font-extrabold text-accent">99.4%</span>
            <span className="font-display text-base font-bold text-white mt-2">Answer Accuracy</span>
            <span className="text-muted text-xs font-mono mt-1">Strict citation gating</span>
          </div>

          <div className="flex flex-col">
            <span className="font-mono text-4xl sm:text-5xl font-extrabold text-accent">4,200+</span>
            <span className="font-display text-base font-bold text-white mt-2">Teams Onboard</span>
            <span className="text-muted text-xs font-mono mt-1">Global production users</span>
          </div>

          <div className="flex flex-col">
            <span className="font-mono text-4xl sm:text-5xl font-extrabold text-accent">38ms</span>
            <span className="font-display text-base font-bold text-white mt-2">Median Latency</span>
            <span className="text-muted text-xs font-mono mt-1">Global edge routing</span>
          </div>
        </div>
      </section>

      {/* ── 6. CTA Banner ── */}
      <section id="cta" className="max-w-7xl mx-auto px-6 py-28 w-full">
        <div className="glass rounded-3xl p-12 md:p-20 text-center flex flex-col items-center relative overflow-hidden border border-accent/30 shadow-2xl">
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Ready to ascend?
          </h2>
          <p className="text-muted text-base md:text-lg max-w-xl mb-10 leading-relaxed">
            Free for 14 days. No credit card required. Experience how autonomous agents transform your day.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#cta"
              className="px-8 py-4 rounded-xl text-sm font-bold bg-accent text-accent-ink hover:bg-instrument-amber-dark transition-all shadow-xl shadow-accent/25"
            >
              Start free ↗
            </a>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-xl text-sm font-semibold glass hairline text-foreground hover:bg-white/10 transition-all"
            >
              Book a demo
            </a>
          </div>
          <div className="text-muted text-xs font-mono mt-8">
            SOC 2 Type II certified • 99.99% uptime SLA • Cancel anytime
          </div>
        </div>
      </section>

      {/* ── 7. Footer ── */}
      <footer className="w-full border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs text-muted">
          <div className="flex items-center gap-2 text-foreground font-display font-semibold">
            <span className="text-accent">✦</span>
            <span>Lumen Labs</span>
            <span className="text-muted font-mono font-normal">© 2026</span>
          </div>
          <div>Intelligence that moves with you.</div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#features" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#features" className="hover:text-foreground transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

