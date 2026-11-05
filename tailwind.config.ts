import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { palette, themes, ease, duration, layers, channels } from "./tokens";

/**
 * Immersive 3D web: Tailwind (v3.4+) config.
 *
 * What this gives you:
 *  - Semantic, theme-aware colors (bg-background, text-foreground, bg-accent/20)
 *    that switch between "bench" (dark) and "enamel" (light) via CSS variables
 *  - The full static palette (bench / enamel / instrument) for art direction
 *  - Fluid display typography, fluid section spacing, readable measures
 *  - Cinematic easing + duration vocabulary shared with GSAP and Three.js
 *  - Scroll-reveal, marquee, float, and instrument animations
 *  - 3D transform utilities (perspective, preserve-3d, rx/ry/tz tilt vars)
 *  - Utilities for the canvas stack: fixed canvas, scrims, grain, glass, masks
 *  - Variants for the real world: touch, mouse, tier-low/medium/high, no-webgl
 *  - Lenis smooth-scroll base CSS, focus rings, reduced-motion guard
 *
 * All colors come from ./tokens so Three.js can use the exact same values.
 */

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const rgbVar = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;
const bez = (a: readonly number[]) => `cubic-bezier(${a.join(", ")})`;

/** Turn a semantic theme object into CSS custom properties holding rgb channels. */
const themeVars = (t: Record<string, string>) =>
  Object.fromEntries(Object.entries(t).map(([k, v]) => [`--${k}`, channels(v)]));

/** Emit the raw palette as hex variables (--bench-900, --instrument-amber-dark) for custom CSS and JS. */
const paletteVars = Object.fromEntries(
  Object.entries(palette).flatMap(([group, scale]) =>
    Object.entries(scale).map(([step, hex]) => [`--${group}-${kebab(step)}`, hex as string])
  )
);

const noise = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

const config = {
  // Semantic tokens already switch themes, so you rarely need dark: variants.
  // Kept for third-party components that expect them.
  darkMode: ["class", '[data-theme="dark"]'],

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx,html}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      /* ------------------------------ Colors ------------------------------ */
      colors: {
        // Semantic (theme-aware, alpha-capable): use these in components
        background: rgbVar("background"),
        surface: rgbVar("surface"),
        raised: rgbVar("raised"),
        line: rgbVar("line"),
        foreground: rgbVar("foreground"),
        muted: rgbVar("muted"),
        accent: { DEFAULT: rgbVar("accent"), ink: rgbVar("accent-ink"), on: rgbVar("on-accent") },
        signal: rgbVar("signal"),
        info: rgbVar("info"),
        danger: rgbVar("danger"),

        // Static palette: use for art direction, illustrations, fixed brand moments
        bench: palette.bench,
        enamel: palette.enamel,
        instrument: palette.instrument,
      },

      /* ----------------------------- Typography --------------------------- */
      // Never ship Inter/Roboto/Arial as the identity. Set --font-display,
      // --font-sans, --font-mono to real, characterful faces (next/font, @font-face).
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        // Mono is for real data, readouts, and code. Not a shortcut for "technical".
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        "display-2xl": ["clamp(3.5rem, 1.5rem + 9vw, 11rem)", { lineHeight: "0.86", letterSpacing: "-0.05em", fontWeight: "600" }],
        "display-xl": ["clamp(3rem, 1.4rem + 6.5vw, 8rem)", { lineHeight: "0.9", letterSpacing: "-0.045em", fontWeight: "600" }],
        "display-lg": ["clamp(2.5rem, 1.3rem + 4.5vw, 5.75rem)", { lineHeight: "0.95", letterSpacing: "-0.035em", fontWeight: "600" }],
        title: ["clamp(1.75rem, 1.1rem + 2.1vw, 3.25rem)", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "600" }],
        lead: ["clamp(1.125rem, 1rem + 0.6vw, 1.5rem)", { lineHeight: "1.45" }],
        body: ["1rem", { lineHeight: "1.65" }],
        small: ["0.875rem", { lineHeight: "1.5" }],
        eyebrow: ["0.75rem", { lineHeight: "1", letterSpacing: "0.16em", fontWeight: "500" }],
      },
      maxWidth: {
        measure: "68ch", // body copy
        tight: "52ch", // intros over the 3D scene
        stage: "112rem", // outer layout cap on ultrawide
      },

      /* ------------------------------- Spacing ---------------------------- */
      spacing: {
        section: "clamp(5rem, 3rem + 10vw, 12rem)", // py-section
        gutter: "clamp(1.25rem, 0.5rem + 3vw, 4rem)", // px-gutter
        "safe-top": "env(safe-area-inset-top, 0px)",
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
      },
      screens: {
        xs: "480px",
        "3xl": "1920px",
        short: { raw: "(max-height: 640px)" }, // landscape phones
        tall: { raw: "(min-aspect-ratio: 3/4) and (max-aspect-ratio: 9/16)" },
      },
      zIndex: Object.fromEntries(Object.entries(layers).map(([k, v]) => [k, String(v)])),

      /* ------------------------- Backgrounds & surfaces ------------------- */
      backgroundImage: {
        "bench-grid": "radial-gradient(rgb(var(--foreground) / 0.06) 1px, transparent 1px)",
        "notebook-grid":
          "linear-gradient(to right, rgb(var(--info) / 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--info) / 0.08) 1px, transparent 1px)",
        spotlight: "radial-gradient(60% 50% at 50% 0%, rgb(var(--accent) / 0.2), transparent 70%)",
        vignette: "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgb(var(--background) / 0.85) 100%)",
        "scrim-t": "linear-gradient(to bottom, rgb(var(--background) / 0.9), transparent)",
        "scrim-b": "linear-gradient(to top, rgb(var(--background) / 0.9), transparent)",
        "scrim-l": "linear-gradient(to right, rgb(var(--background) / 0.85), transparent 70%)",
        noise,
      },
      backgroundSize: { "bench-grid": "24px 24px", "notebook-grid": "16px 16px" },
      boxShadow: {
        "glow-accent": "0 0 48px -8px rgb(var(--accent) / 0.5)",
        "glow-info": "0 0 48px -8px rgb(var(--info) / 0.45)",
        edge: "inset 0 0 0 1px rgb(var(--line) / 0.7)",
        lift: "0 24px 60px -24px rgb(0 0 0 / 0.55), 0 2px 0 0 rgb(var(--foreground) / 0.04) inset",
      },

      /* ------------------------------- Motion ----------------------------- */
      transitionTimingFunction: {
        "out-expo": bez(ease.outExpo),
        "out-quint": bez(ease.outQuint),
        "out-quart": bez(ease.outQuart),
        "in-out-quart": bez(ease.inOutQuart),
        "in-out-cubic": bez(ease.inOutCubic),
      },
      transitionDuration: Object.fromEntries(
        Object.entries(duration).map(([k, v]) => [k, `${v}ms`])
      ),
      animation: {
        // Original instrument animations, retuned
        "drop-fall": `drop 0.6s ${bez(ease.outQuart)} forwards`,
        stir: "stirring 1.5s linear infinite",
        "pulse-slow": "pulseSlow 3s ease-in-out infinite",
        // Scene-grade additions
        "fade-up": `fadeUp 0.9s ${bez(ease.outExpo)} both`,
        "rise-mask": `riseMask 1.1s ${bez(ease.outExpo)} both`, // inside .line-mask
        float: "floatY 7s ease-in-out infinite",
        breathe: "breathe 6s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        scan: "scan 6s linear infinite",
        "spin-slow": "stirring 40s linear infinite",
        "cursor-ping": "cursorPing 1.6s ease-out infinite",
      },
      keyframes: {
        drop: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "80%": { transform: "translateY(80px) scale(0.9)", opacity: "0.9" },
          "100%": { transform: "translateY(110px) scale(1.4)", opacity: "0" },
        },
        stirring: { to: { transform: "rotate(360deg)" } },
        pulseSlow: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.6" } },
        fadeUp: {
          from: { opacity: "0", transform: "translate3d(0, 24px, 0)" },
          to: { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        riseMask: {
          from: { transform: "translate3d(0, 110%, 0)" },
          to: { transform: "translate3d(0, 0, 0)" },
        },
        floatY: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -14px, 0)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.045)", opacity: "1" },
        },
        marquee: { to: { transform: "translate3d(-50%, 0, 0)" } },
        scan: { from: { backgroundPosition: "0 0" }, to: { backgroundPosition: "0 160px" } },
        cursorPing: {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
      },
    },
  },

  plugins: [
    plugin(function ({ addBase, addUtilities, addVariant }) {
      /* ----------------------------- Base layer ---------------------------- */
      addBase({
        ":root": {
          ...paletteVars,
          ...themeVars(themes.dark),
          colorScheme: "dark",
        },
        // Explicit light choice
        ':root[data-theme="light"], :root.light': {
          ...themeVars(themes.light),
          colorScheme: "light",
        },
        // OS preference when the user has not chosen
        "@media (prefers-color-scheme: light)": {
          ':root:not([data-theme="dark"]):not(.dark)': {
            ...themeVars(themes.light),
            colorScheme: "light",
          },
        },
        html: {
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          textRendering: "optimizeLegibility",
          scrollPaddingTop: "env(safe-area-inset-top, 0px)",
          backgroundColor: "rgb(var(--background))",
          color: "rgb(var(--foreground))",
        },
        body: { minHeight: "100dvh", overflowX: "clip" },
        canvas: { display: "block" },
        "::selection": { backgroundColor: "rgb(var(--accent) / 0.35)", color: "rgb(var(--foreground))" },
        ":focus-visible": {
          outline: "2px solid rgb(var(--accent-ink))",
          outlineOffset: "3px",
          borderRadius: "2px",
        },
        // Lenis smooth scroll (required CSS)
        "html.lenis, html.lenis body": { height: "auto" },
        ".lenis.lenis-smooth": { scrollBehavior: "auto !important" },
        ".lenis.lenis-smooth [data-lenis-prevent]": { overscrollBehavior: "contain" },
        ".lenis.lenis-stopped": { overflow: "hidden" },
        // Reduced motion: collapse CSS motion globally. JS must also check
        // matchMedia('(prefers-reduced-motion: reduce)') for GSAP and Three.
        "@media (prefers-reduced-motion: reduce)": {
          "*, *::before, *::after": {
            animationDuration: "0.01ms !important",
            animationIterationCount: "1 !important",
            transitionDuration: "0.01ms !important",
            scrollBehavior: "auto !important",
          },
        },
      });

      /* ----------------------- Utilities: the canvas stack ------------------ */
      addUtilities({
        // Fixed full-viewport WebGL canvas behind the DOM. Add pointer-events-auto
        // on it if the scene needs drag or pointer input.
        ".canvas-fixed": {
          position: "fixed",
          inset: "0",
          zIndex: String(layers.canvas),
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        },
        // Page content sits above the canvas
        ".stage": { position: "relative", zIndex: String(layers.content) },
        // Safe-area padding for notched phones
        ".safe-pt": { paddingTop: "env(safe-area-inset-top, 0px)" },
        ".safe-pb": { paddingBottom: "env(safe-area-inset-bottom, 0px)" },
        ".safe-px": {
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
        },
      });

      /* -------------------------- Utilities: 3D transforms ------------------ */
      // Drive --rx / --ry / --tz from JS (pointer tilt, scroll) and let CSS compose them.
      addUtilities({
        ".t3d": {
          transform:
            "perspective(var(--persp, 1200px)) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateZ(var(--tz, 0px))",
          transformStyle: "preserve-3d",
          willChange: "transform",
        },
        ".preserve-3d": { transformStyle: "preserve-3d" },
        ".flat-3d": { transformStyle: "flat" },
        ".backface-hidden": { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" },
        ".persp-near": { "--persp": "600px" },
        ".persp-mid": { "--persp": "1200px" },
        ".persp-far": { "--persp": "2400px" },
        ".rx-6": { "--rx": "6deg" },
        ".rx-12": { "--rx": "12deg" },
        ".ry-6": { "--ry": "6deg" },
        ".ry-12": { "--ry": "12deg" },
        ".-rx-6": { "--rx": "-6deg" },
        ".-ry-6": { "--ry": "-6deg" },
        ".tz-8": { "--tz": "8px" },
        ".tz-24": { "--tz": "24px" },
        ".tz-48": { "--tz": "48px" },
        // Release will-change once an animation finishes
        ".will-glide": { willChange: "transform, opacity" },
        ".will-auto": { willChange: "auto" },
      });

      /* ------------------------ Utilities: text and reveal ------------------ */
      addUtilities({
        // Wrap each split line in .line-mask, animate the inner span with animate-rise-mask
        ".line-mask": { overflow: "hidden", paddingBlock: "0.08em", marginBlock: "-0.08em" },
        // Stagger helper: set style="--i:N" per child
        ".delay-i": { animationDelay: "calc(var(--i, 0) * var(--stagger, 60ms))" },
        ".hud": {
          fontFamily: "var(--font-mono), ui-monospace, monospace",
          fontSize: "0.75rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontVariantNumeric: "tabular-nums",
        },
        ".tabular": { fontVariantNumeric: "tabular-nums" },
        ".no-scrollbar": { scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } },
      });

      /* ------------------------- Utilities: surfaces ----------------------- */
      addUtilities({
        // Glass only where there is a live scene behind it worth seeing
        ".glass": {
          backgroundColor: "rgb(var(--surface) / 0.55)",
          backdropFilter: "blur(18px) saturate(1.2)",
          WebkitBackdropFilter: "blur(18px) saturate(1.2)",
          boxShadow: "inset 0 0 0 1px rgb(var(--line) / 0.6)",
        },
        ".hairline": { boxShadow: "inset 0 0 0 1px rgb(var(--line) / 0.7)" },
        // Film grain overlay: add to any positioned element
        ".grain": { position: "relative", isolation: "isolate" },
        ".grain::after": {
          content: '""',
          position: "absolute",
          inset: "0",
          zIndex: "1",
          pointerEvents: "none",
          backgroundImage: noise,
          opacity: "0.06",
          mixBlendMode: "overlay",
        },
      });

      /* ------------------------------- Variants ---------------------------- */
      addVariant("touch", "@media (hover: none) and (pointer: coarse)");
      addVariant("mouse", "@media (hover: hover) and (pointer: fine)");
      // Set data-tier on <html> from your quality detector
      addVariant("tier-high", '[data-tier="high"] &');
      addVariant("tier-medium", '[data-tier="medium"] &');
      addVariant("tier-low", '[data-tier="low"] &');
      // Add class "no-webgl" to <html> when context creation fails
      addVariant("no-webgl", ".no-webgl &");
      addVariant("webgl", ":not(.no-webgl) &");
      // Add class "is-loading" until the first frame renders
      addVariant("loading", ".is-loading &");
    }),
  ],
} satisfies Config;

export default config;
