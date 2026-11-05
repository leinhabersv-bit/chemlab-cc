# Reference Blueprint: Lumen (AI SaaS landing with a 3D orb)

A worked example of the `immersive-3d-web` skill applied to a product landing page. Use it as a pattern for structure, pacing, and component choices, not as a template to copy. Always pick a hero object, palette, and type native to the new subject.

## 1. Concept

- **Subject**: Lumen, an AI platform that turns scattered data into decisions and runs agent workflows.
- **Hero object**: A glowing, softly deforming **orb** (the "intelligence"). Drag to spin it, hint text at the bottom: "Drag the orb to spin it".
- **Story in one line**: Intelligence that moves with you. The orb reacts as the visitor moves from question to action to results.
- **Signature moment**: The orb changes state per section (calm in hero, contracts into a core during "How it works", expands and pulses on the CTA "Ready to ascend?").
- **Single goal**: Start free (primary), Book a demo (secondary).

## 2. Page map and content

| # | Section | Content | 3D / motion role |
|---|---|---|---|
| 0 | Nav | Logo, Product, How it works, Impact, Get started (anchor links) | Sticky, blends over the scene, active link follows scroll |
| 1 | Hero | Pill: "NEW Agents 2.0 is live →". H1: "Intelligence that moves with you." Subhead (data into decisions, plain language, agents in minutes). CTAs: Start free, Watch it work | Orb large and off-center, idle breathing, pointer parallax, type reveal |
| 2 | Logo marquee | Northwind, Helix Labs, Orbital, Fathom, Kepler&Co, Nimbus, repeated for a seamless loop | CSS or GSAP infinite marquee, pause on hover, orb recedes slightly |
| 3 | Features (bento) | "One platform. Every signal." 5 tiles: Realtime insights, Latency 38ms, Smart agents (Support, Sales, Ops, Finance, Research chips), Private by design (SOC 2 badge), 200+ integrations (Slack, Notion, Stripe, +197) | Orb shifts aside and dims, tiles reveal with stagger, each tile reacts to pointer |
| 4 | How it works | "From question to action." 3 steps: Connect, Ask, Automate | Pinned section. Orb contracts to a core, three nodes orbit it, one lights per step as you scroll |
| 5 | Impact | "Results that compound." 4 stats: Nx faster reporting, % answer accuracy, teams onboard, ms median latency | Count-up on enter, orb pulses in time with each number landing |
| 6 | CTA | "Ready to ascend?" Free for 14 days. No credit card. Start free, Book a demo | Orb expands, brightens, rim light peaks, final camera pull-in |
| 7 | Footer | (c) 2026 Lumen Labs, drag hint | Orb idles, hint fades after first drag |

## 3. Scroll choreography (master timeline)

One GSAP timeline scrubbed to total scroll (`scrub: 1.2`) driving camera, orb uniforms, light colors, fog, and CSS palette variables. Keyframes by section:

| Section | Camera | Orb state (uniforms) | Palette mood |
|---|---|---|---|
| Hero | z 6, slight right offset so the orb sits right | `uDistort 0.35`, slow `uSpeed`, soft glow | Deep base, warm-cool contrast |
| Features | Dolly back, orb drifts to a corner, lower opacity | `uDistort 0.15`, calm | Neutral, quieter |
| How it works | Push in, slow orbit | Contract (`scale 0.6`), `uDistort 0.5` swirl, nodes orbit | Cooler, focused |
| Impact | Slight pull back | Pulse per counter (`uPulse` tween) | Accent rises |
| CTA | Pull in close, centered | `scale 1.3`, `uGlow` max, rim light brightest | Accent dominant |

Rules from the skill that apply: `ease: 'none'` on scrubbed tweens, smoothing comes from `scrub`, all pointer input damped, one ticker for Lenis + GSAP + render.

## 4. The orb (build recipe)

- **Geometry**: `IcosahedronGeometry(1.4, 64)` for smooth displacement.
- **Material**: Custom `ShaderMaterial` (or `MeshPhysicalMaterial` with `onBeforeCompile` if you need PBR reflections).
  - Vertex: displace along normal with simplex or curl noise driven by `uTime`, `uDistort`, `uSpeed`, plus a pointer-driven bulge toward `uPointer`.
  - Fragment: fresnel rim (`pow(1.0 - dot(n, v), 3.0)`), a palette ramp by noise value, inner glow, subtle iridescent shift by view angle.
- **Support layers**:
  - A larger, additive back-glow sprite or inverted sphere (BackSide) for atmosphere.
  - Particle halo (`Points`, 1.5 to 3k) orbiting slowly, color by depth.
  - 2 to 3 thin orbit rings (`TorusGeometry`, tiny tube) that tilt with scroll, used as the "nodes" in How it works.
- **Lighting** (if physical): colored key, complementary rim, procedural gradient environment.
- **Interaction**: Pointer drag rotates with inertia (store angular velocity, apply damping), hover increases `uDistort` slightly, release eases back. Cursor shows a "drag" state over the canvas.
- **Idle**: Always on. Never fully still.

Skeleton (global `THREE` build, no addon imports):

```js
const orbMat = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 }, uDistort: { value: 0.35 }, uSpeed: { value: 0.25 },
    uGlow: { value: 0.6 }, uPulse: { value: 0 },
    uA: { value: new THREE.Color(tokens.hero) }, uB: { value: new THREE.Color(tokens.accent) },
    uPointer: { value: new THREE.Vector3() }
  },
  vertexShader, fragmentShader, transparent: true
});
const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 64), orbMat);
```

Drive `uTime` and damped values from the shared ticker. Tween `uDistort`, `uGlow`, `orb.scale`, and camera from the master timeline.

## 5. UI patterns to reuse

- **Announcement pill**: Small, pill-shaped, "NEW" tag plus message and arrow. Subtle border, links to the release. Entrance as part of the hero reveal.
- **Hero type**: Large display H1 with tight tracking, split-line mask reveal. Subhead max about 60 characters per line. Two CTAs with clear hierarchy (filled primary, ghost secondary), both magnetic.
- **Logo marquee**: Duplicate the list for a seamless loop, mask edges with a gradient, text-only logos are fine. Respect reduced motion (static row).
- **Bento grid** (not identical cards):
  - Mixed tile sizes: one large (Realtime insights), one tall (Smart agents), small stat (Latency), small badge (Private), wide (Integrations).
  - Each tile has one idea: a mini live chart or sparkline that actually responds, a stat, chips, a badge, integration chips with a "+197" overflow chip.
  - Tilt toward the pointer with parallax inner layers. No nested cards.
- **Steps (How it works)**: Numbering is justified here because it is a real sequence. Show the active step large, others dimmed, tied to scroll progress and to the orb's nodes.
- **Stats**: Large numerals with small labels, count-up when entering view with `expo.out`. Pulse the orb per landed number. Keep layout stable with tabular numbers and fixed-width containers.
- **CTA**: Big headline "Ready to ascend?", two buttons, reassurance line ("Free for 14 days. No credit card, no friction."), orb as backdrop.
- **Nav**: Transparent over the hero, gains subtle backdrop on scroll, active section highlighted, collapses to a menu on mobile.

## 6. Copy notes

- Headlines make claims, subtext proves them. Verb-first CTAs ("Start free", "Book a demo").
- Keep terms consistent: "agents", "workflows", "signals".
- Trust line near CTAs. Compliance badge (SOC 2) stated plainly.

## 7. Known pitfalls in the source export (fix when building)

- **Stats render as 0 in static content** ("0x", "0%", "0 teams", "0ms"). The count-up starts from zero in the DOM, so no-JS, reduced-motion, crawlers, and screenshots see zeros. Put the **final values in the markup** and animate from a start value only when JS runs and motion is allowed.
- Marquee content is duplicated in the DOM. Mark the duplicate `aria-hidden="true"` so screen readers do not read it twice.
- Decorative arrows and diamond separators should be `aria-hidden`.
- Several links point to `#`. Give every CTA a real destination or a working handler.
- Make sure the hint "Drag the orb to spin it" is also available as accessible text and disappears after the first successful drag.
- Provide a static hero (CSS radial gradient orb) as the no-WebGL fallback with all sections intact.

## 8. Quality tiers for this build

| Tier | Orb | Extras |
|---|---|---|
| High | 64-subdivision icosahedron, full shader, halo 3k, rings, grain | Bloom-like glow via additive back sprite |
| Medium | 48 subdivisions, halo 1k, no grain | Simplified fresnel |
| Low | 32 subdivisions, no halo, no rings | Flat gradient glow |
| Fallback | CSS gradient orb | No canvas |

## 9. Acceptance checklist

- [ ] Orb is the clear hero and reads at every aspect ratio, framed beside (not behind) the H1 on desktop
- [ ] Orb state visibly changes per section and ties to the story
- [ ] Glide is smooth both directions, no pops at pin and unpin
- [ ] Stats show real values without JS and count up with JS
- [ ] Bento tiles vary in size and each has one idea
- [ ] Contrast passes over the scene at the worst scroll position
- [ ] Reduced motion: static orb, instant content, no marquee motion
- [ ] 60fps on a mid-range laptop, tiers step down automatically
- [ ] Touch: drag-to-spin works without blocking page scroll (horizontal drag on the orb, vertical scroll passes through)
