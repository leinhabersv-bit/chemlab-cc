/**
 * tokens.ts: the single source of truth for the design system.
 *
 * Pure data, no Node or Tailwind imports, so it is safe to import from
 * browser code (Three.js scenes, GSAP timelines) AND from tailwind.config.ts.
 * Change a value here and the CSS, the Tailwind classes, and the 3D lights
 * and materials all change together.
 */

/* ------------------------------------------------------------------ */
/* Palette: "lab bench" universe                                       */
/*   bench      = dark workbench surfaces (cool, blue-tinted neutrals) */
/*   enamel     = warm paper / porcelain neutrals                      */
/*   instrument = signal colors, each with one job                     */
/* ------------------------------------------------------------------ */
export const palette = {
  bench: {
    950: "#0e1014",
    900: "#14171d",
    850: "#1a1e26",
    800: "#222732",
    700: "#2d3443",
    600: "#3d4659",
    500: "#566078",
  },
  enamel: {
    50: "#faf9f6",
    100: "#f4f2ec",
    200: "#e8e5db",
    300: "#d6d1c2",
    400: "#aba593",
    500: "#807a6a",
    600: "#5f5a4c",
    700: "#3f3b31",
  },
  instrument: {
    amber: "#f59e0b", // primary accent, hero glow, key light
    amberDark: "#d97706", // accent on light surfaces
    amberInk: "#b45309", // accent as TEXT on light surfaces (AA)
    phosphor: "#22c55e", // success / live / running
    sky: "#38bdf8", // info, rim light, notebook grid
    cobalt: "#2563eb", // links, selection on light
    ruby: "#ef4444", // danger / error
  },
} as const;

/* ------------------------------------------------------------------ */
/* Semantic themes: components use THESE names, never raw palette.     */
/* Dark is the default. Light activates with .light, [data-theme=light]*/
/* or the OS preference when no explicit choice has been made.         */
/* ------------------------------------------------------------------ */
export const themes = {
  dark: {
    background: palette.bench[950],
    surface: palette.bench[900],
    raised: palette.bench[850],
    line: palette.bench[700],
    foreground: palette.enamel[100],
    muted: palette.enamel[400],
    accent: palette.instrument.amber,
    "accent-ink": palette.instrument.amber, // accent used as text
    "on-accent": palette.bench[950], // text on accent fills
    signal: palette.instrument.phosphor,
    info: palette.instrument.sky,
    danger: palette.instrument.ruby,
  },
  light: {
    background: palette.enamel[100],
    surface: palette.enamel[50],
    raised: "#fdfcfa",
    line: palette.enamel[300],
    foreground: palette.bench[900],
    muted: palette.enamel[600],
    accent: palette.instrument.amberDark,
    "accent-ink": palette.instrument.amberInk,
    "on-accent": palette.bench[950],
    signal: "#15803d",
    info: palette.instrument.cobalt,
    danger: "#dc2626",
  },
} as const;

export type ThemeName = keyof typeof themes;
export type SemanticToken = keyof (typeof themes)["dark"];

/* ------------------------------------------------------------------ */
/* Scene presets: feed Three.js lights, fog, and materials from the    */
/* same palette so the 3D world and the UI share one color story.      */
/* usage: new THREE.Color(scene.dark.key)                              */
/* ------------------------------------------------------------------ */
export const scene = {
  dark: {
    background: palette.bench[950],
    fog: palette.bench[950], // fog === background for seamless depth
    key: palette.instrument.amber,
    rim: palette.instrument.sky,
    fill: palette.bench[600],
    hero: palette.enamel[200],
    accent: palette.instrument.amber,
  },
  light: {
    background: palette.enamel[100],
    fog: palette.enamel[100],
    key: "#fff4de",
    rim: palette.instrument.cobalt,
    fill: palette.enamel[300],
    hero: palette.bench[800],
    accent: palette.instrument.amberDark,
  },
} as const;

/* ------------------------------------------------------------------ */
/* Motion: one vocabulary for CSS, GSAP, and shader timing.            */
/* Cubic-bezier arrays work with CSS, GSAP CustomEase, and Framer.     */
/* GSAP built-ins that match: outExpo = "expo.out",                    */
/* outQuart = "power4.out", outQuint = "power4.out", inOutQuart =      */
/* "power4.inOut".                                                     */
/* ------------------------------------------------------------------ */
export const ease = {
  outExpo: [0.16, 1, 0.3, 1],
  outQuint: [0.22, 1, 0.36, 1],
  outQuart: [0.25, 1, 0.5, 1],
  inOutQuart: [0.76, 0, 0.24, 1],
  inOutCubic: [0.65, 0, 0.35, 1],
} as const;

export const duration = {
  instant: 120, // press feedback
  quick: 220, // hover, focus, toggles
  base: 420, // component state changes
  slow: 700, // section reveals
  cinematic: 1100, // hero reveals, scene transitions
} as const;

export const glide = {
  lenisDuration: 1.2, // smooth-scroll inertia
  scrub: 1.2, // ScrollTrigger scrub smoothing (1 to 1.5)
  dampPointer: 6, // lambda for pointer parallax damping
  dampCamera: 4, // lambda for camera look-at damping
  stagger: 0.06, // seconds between staggered children
} as const;

/* ------------------------------------------------------------------ */
/* Quality tiers: pick on first-second frame-time sample, step down    */
/* automatically on dropped frames. Mirrors the /adapt workflow.       */
/* ------------------------------------------------------------------ */
export const tiers = {
  high: { pixelRatio: 2, particles: 1, post: true, transmission: true, shadows: true },
  medium: { pixelRatio: 1.5, particles: 0.5, post: false, transmission: true, shadows: false },
  low: { pixelRatio: 1, particles: 0.15, post: false, transmission: false, shadows: false },
} as const;

export type TierName = keyof typeof tiers;

/* ------------------------------------------------------------------ */
/* Layers: named z-index stack, mirrored as z-* utilities.             */
/* ------------------------------------------------------------------ */
export const layers = {
  canvas: 0,
  scrim: 10,
  content: 20,
  hud: 30,
  nav: 40,
  cursor: 50,
  loader: 60,
} as const;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** "#f59e0b" -> "245 158 11" (space-separated channels for rgb(var(--x) / a)) */
export const channels = (hex: string): string => {
  const n = parseInt(hex.replace("#", ""), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/** Read a live semantic color from CSS (respects the active theme) as a THREE-friendly hex. */
export const cssColor = (name: SemanticToken, el: Element = document.documentElement): string => {
  const [r, g, b] = getComputedStyle(el).getPropertyValue(`--${name}`).trim().split(/\s+/).map(Number);
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
};
