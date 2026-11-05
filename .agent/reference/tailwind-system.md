# Tailwind System for Immersive 3D Sites

Files in this folder:

- `tokens.ts`: pure-data source of truth (palette, semantic themes, scene lighting colors, easing, durations, glide settings, quality tiers, z-layers). Safe to import in browser code.
- `tailwind.config.ts`: Tailwind v3.4+ config built from `tokens.ts`. Adds theme-aware colors, fluid type and spacing, motion vocabulary, 3D utilities, canvas-stack utilities, and device/tier variants.

Use them together so the DOM, the shaders, and the lights all pull from the same values.

## Setup

1. Copy both files to the project root (next to `package.json`).
2. Set fonts. The config reads `--font-display`, `--font-sans`, `--font-mono`. Define them with real faces (`next/font`, `@font-face`, or Google Fonts). Do not leave Inter, Roboto, or Arial as the identity.
3. Set the theme on `<html>`: nothing for dark (default), `class="light"` or `data-theme="light"` for light. With neither set, the OS preference is used.
4. Set `data-tier="high|medium|low"` on `<html>` from your quality detector, and add `no-webgl` to `<html>` if context creation fails. The variants below depend on these.
5. Tailwind v4 users: move the colors, fonts, and keyframes into an `@theme` block in CSS and keep `tokens.ts` for JS. The utilities in the plugin become `@utility` rules.

## Token flow (one source of truth)

```
tokens.ts ──► tailwind.config.ts ──► CSS variables (--background, --accent, --bench-900 ...)
    │                                        │
    └──► Three.js (scene.dark.key, ease, tiers)   └──► classes: bg-background text-foreground bg-accent/20
```

In Three.js:

```ts
import { scene, tiers, glide } from "./tokens";
const key = new THREE.DirectionalLight(scene.dark.key, 3);
const rim = new THREE.DirectionalLight(scene.dark.rim, 2);
scene3d.background = new THREE.Color(scene.dark.background);
scene3d.fog = new THREE.Fog(scene.dark.fog, 8, 30); // fog === background
```

To follow the live theme (including user toggle) read it from CSS:

```ts
import { cssColor } from "./tokens";
rim.color.set(cssColor("info"));
```

## Class cheat sheet

**Color (semantic, theme-aware, alpha-capable)**
`bg-background` `bg-surface` `bg-raised` `border-line` `text-foreground` `text-muted` `bg-accent` `text-accent-ink` `text-accent-on` `text-signal` `text-info` `text-danger`, e.g. `bg-accent/20`, `border-line/60`.
Static palette for art direction: `bg-bench-900` `text-enamel-200` `text-instrument-amber`.

**Type and layout**
`font-display text-display-2xl` (fluid hero), `text-display-xl`, `text-display-lg`, `text-title`, `text-lead`, `text-eyebrow uppercase`, `max-w-measure` (68ch), `max-w-tight` (52ch over the scene), `py-section`, `px-gutter`, `max-w-stage`.

**Motion**
Easing: `ease-out-expo` `ease-out-quint` `ease-out-quart` `ease-in-out-quart`. Durations: `duration-instant` (120) `duration-quick` (220) `duration-base` (420) `duration-slow` (700) `duration-cinematic` (1100).
Animations: `animate-fade-up` `animate-rise-mask` `animate-float` `animate-breathe` `animate-marquee` `animate-scan` `animate-spin-slow` `animate-cursor-ping`, plus the original `animate-drop-fall` `animate-stir` `animate-pulse-slow`.
Stagger: give children `style="--i:0"`, `--i:1`, ... and add `delay-i` (default step 60ms, override with `--stagger`).

**3D transforms**
`t3d` composes `perspective`, `rotateX`, `rotateY`, `translateZ` from CSS variables, so JS only sets `--rx`, `--ry`, `--tz`. Presets: `persp-near|mid|far`, `rx-6 rx-12 -rx-6`, `ry-6 ry-12 -ry-6`, `tz-8 tz-24 tz-48`. Also `preserve-3d`, `flat-3d`, `backface-hidden`, `will-glide` (remove after animating).

**Canvas stack**
`canvas-fixed` (fixed full-viewport canvas, `pointer-events: none`; add `pointer-events-auto` if the scene needs drag), `stage` (content above canvas), `z-canvas z-scrim z-content z-hud z-nav z-cursor z-loader`, `bg-scrim-t|b|l` (keep text legible over the scene), `bg-vignette`, `bg-spotlight`, `grain` (film grain overlay), `glass` (only over a live scene), `hairline`, `safe-pt safe-pb safe-px`.

**Variants**
`touch:` `mouse:` (input type), `tier-high:` `tier-medium:` `tier-low:` (quality), `no-webgl:` `webgl:` (fallback), `loading:` (until first frame), `motion-reduce:` and `motion-safe:` (built in).

## Patterns

**Masked line reveal (split text)**
```html
<h1 class="font-display text-display-xl max-w-tight">
  <span class="line-mask block"><span class="block animate-rise-mask" style="--i:0">Intelligence</span></span>
  <span class="line-mask block"><span class="block animate-rise-mask delay-i" style="--i:1">that moves.</span></span>
</h1>
```

**Pointer-tilt card (JS sets variables, damped)**
```html
<article class="t3d persp-mid hairline bg-surface rounded-2xl p-6 transition-transform duration-quick ease-out-quart">…</article>
```
```ts
el.style.setProperty("--rx", `${-y * 8}deg`);
el.style.setProperty("--ry", `${x * 8}deg`);
```

**Canvas under content, text kept legible**
```html
<canvas id="gl" class="canvas-fixed pointer-events-auto"></canvas>
<main class="stage px-gutter">
  <section class="py-section relative">
    <div class="absolute inset-0 bg-scrim-l -z-10"></div>
    <p class="text-lead max-w-tight text-foreground">…</p>
  </section>
</main>
```

**Quality-aware effects**
```html
<div class="glass tier-low:bg-surface tier-low:backdrop-blur-none">…</div>
<div class="grain tier-low:after:hidden">…</div>
<div class="no-webgl:block hidden bg-spotlight h-screen">static hero fallback</div>
```

**Touch vs mouse**
```html
<button class="mouse:hover:-translate-y-0.5 touch:active:scale-[0.98] min-h-11 px-5">Start free</button>
```

## What changed from the original config, and why

| Original | Now | Reason |
|---|---|---|
| Hex colors only, `background`/`foreground` pointing at undefined vars | Full semantic theme (background, surface, raised, line, foreground, muted, accent, signal, info, danger) generated from tokens, alpha-capable | Components never hard-code palette; light/dark come free; `bg-accent/20` works |
| Palette lived only in Tailwind | `tokens.ts` shared with Three.js (`scene.dark.key`, fog, rim) | Lights, fog, and UI share one color story |
| No light theme | "Enamel" light theme with AA-safe `accent-ink` and `muted` | Original enamel scale had no way to be used as a theme |
| Inter as the font stack | `--font-display/sans/mono` variables with neutral fallbacks | Skill rule: no default-font identity; mono reserved for data |
| Default type scale | Fluid `display-*`, `title`, `lead`, `eyebrow`, plus `measure` widths | Display type is a design tool in 3D sites |
| Fixed pixel spacing only | Fluid `py-section`, `px-gutter`, safe-area spacing | Breathes on large screens, safe on notched phones |
| 3 animations | 10 animations with expo/quart easing, reveal masks, stagger, marquee, float | Cinematic motion vocabulary; no bounce or elastic |
| No easing tokens | `ease-out-expo` etc. + duration scale mirrored in `tokens.ts` for GSAP | CSS and JS speak the same timing language |
| Nothing 3D-specific | `t3d` tilt system, perspective presets, `canvas-fixed`, `stage`, scrims, grain, glass | Core needs of the canvas-under-DOM architecture |
| No device awareness | `touch`, `mouse`, `tier-*`, `no-webgl`, `loading` variants | Adaptation, fallbacks, and performance tiers become one-class changes |
| No base styles | Lenis CSS, focus ring, selection color, reduced-motion guard | Smooth scroll works, keyboard users see focus, motion-sensitive users are protected |
| Grid patterns at fixed white/sky | Grids tinted by theme variables | Correct in both themes |

## Rules for using this system

- Use semantic classes (`bg-surface`, `text-muted`) in components. Reach for raw palette classes only for illustration or one-off brand moments.
- Never gray text on colored fills. Use `text-accent-on` on `bg-accent`.
- Use `text-accent-ink` for accent-colored text so it stays readable in light theme.
- JS motion must check `matchMedia("(prefers-reduced-motion: reduce)")`. The CSS guard only covers CSS animation and transitions.
- Remove `will-glide` once an animation finishes, and avoid it on many elements at once.
- Animate only `transform` and `opacity`. The keyframes here follow that rule.
