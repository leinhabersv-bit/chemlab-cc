/**
 * variant.ts: the randomiser.
 * One seed -> one complete, internally consistent "world": palette (built to
 * pass AA contrast by construction), hero surface, rings, dust, layout side,
 * display typeface, camera feel. Every axis is drawn from curated ranges, so
 * every seed is a different site at the same quality bar.
 * ?seed=abc replays a look. No seed -> a fresh random one on every visit.
 */
export type Variant = {
  seed: string; mode: "dark" | "light"; name: string;
  hex: Record<"bg" | "accent" | "accentInk" | "info" | "key" | "rim" | "fill" | "hero", string>;
  shape: { freq: number; ridge: number; terrace: number; distort: number; spin: number };
  rings: number; ringTilt: number; dust: 0 | 1 | 2; dustSize: number; // 0 shell, 1 disk, 2 ribbon
  swing: number; corners: "sharp" | "soft" | "round"; flip: 1 | -1; font: 0 | 1 | 2 | 3; camJitter: number; exposure: number;
};

const hash = (s: string) => { let h = 1779033703 ^ s.length; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^ (h >>> 16)) >>> 0; };
const mulberry = (a: number) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

function hsl(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return "#" + [f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, "0")).join("");
}
const mix = (a: string, b: string, t: number) => {
  const p = (x: string) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
};
const ch = (hex: string) => { const n = parseInt(hex.slice(1), 16); return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`; };

export const newSeed = () => Math.random().toString(36).slice(2, 8);

export function makeVariant(seed: string): Variant {
  const r = mulberry(hash(seed));
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)];
  const range = (a: number, b: number) => a + r() * (b - a);

  const mode = r() < 0.5 ? "dark" : "light", dark = mode === "dark";
  const h = range(0, 360), sat = range(58, 90), tint = range(8, 22);
  const [rimOff, keyOff] = pick([[150, 0], [180, 30], [120, 240], [30, -30]] as const);
  const bg = hsl(h, tint, dark ? range(5, 9) : range(94, 97));
  const fill = hsl(h, tint, dark ? range(22, 32) : range(80, 88));
  const looks = [
    { name: "molten", freq: 1.1, ridge: 0, terrace: 0, distort: 0.38 },
    { name: "ridged", freq: 1.5, ridge: 1, terrace: 0, distort: 0.3 },
    { name: "terraced", freq: 1.0, ridge: 0, terrace: 1, distort: 0.34 },
    { name: "silk", freq: 0.7, ridge: 0, terrace: 0, distort: 0.5 },
    { name: "crystal", freq: 2.0, ridge: 0.6, terrace: 1, distort: 0.22 },
  ];
  const look = pick(looks);
  return {
    seed, mode, name: look.name,
    hex: {
      bg, fill,
      accent: hsl(h, sat, dark ? range(56, 66) : range(40, 48)),
      accentInk: hsl(h, sat, dark ? range(62, 72) : range(26, 33)), // AA as text
      info: hsl(h + rimOff, range(60, 85), dark ? 66 : 38),
      key: hsl(h + keyOff, range(70, 95), dark ? 64 : 92),
      rim: hsl(h + rimOff, range(65, 90), dark ? range(58, 70) : range(40, 50)),
      hero: hsl(h + range(-20, 20), range(10, 30), dark ? range(80, 90) : range(14, 22)),
    },
    shape: { freq: look.freq, ridge: look.ridge, terrace: look.terrace, distort: look.distort, spin: range(0.04, 0.1) * (r() < 0.5 ? -1 : 1) },
    rings: pick([2, 3, 3, 4, 5]), ringTilt: range(0.3, 0.8),
    dust: pick([0, 1, 2] as const), dustSize: range(0.018, 0.03),
    swing: range(0.15, 0.55) * (r() < 0.5 ? -1 : 1), corners: pick(["sharp", "soft", "round"] as const),
    flip: r() < 0.5 ? 1 : -1, font: pick([0, 1, 2, 3] as const),
    camJitter: range(0.94, 1.1), exposure: dark ? range(1.0, 1.2) : range(0.9, 1.0),
  };
}

/** Writes palette, theme, layout side and typeface onto <html>: the whole DOM re-skins. */
export function applyVariantToDom(v: Variant) {
  const el = document.documentElement, s = el.style, t = v.hex, dark = v.mode === "dark";
  el.dataset.theme = v.mode; el.dataset.layout = v.flip === 1 ? "right" : "left"; el.dataset.look = v.name; el.dataset.corners = v.corners;
  const set = (k: string, hex: string) => s.setProperty(`--${k}`, ch(hex));
  const fg = dark ? "#f2f0ea" : "#15171c";
  set("background", t.bg); set("accent", t.accent); set("accent-ink", t.accentInk); set("info", t.info);
  set("surface", mix(t.bg, t.fill, dark ? 0.18 : 0.35)); set("raised", mix(t.bg, t.fill, dark ? 0.32 : 0.1));
  set("line", mix(t.bg, t.fill, dark ? 0.7 : 0.9));
  set("foreground", fg); set("muted", mix(fg, t.bg, dark ? 0.42 : 0.38));
  set("on-accent", dark ? t.bg : "#ffffff");
  s.setProperty("--font-display", `var(--fd-${v.font})`);
  const meta = document.querySelector('meta[name="theme-color"]'); meta?.setAttribute("content", t.bg);
}
