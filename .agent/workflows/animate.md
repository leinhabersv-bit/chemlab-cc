---
name: animate
description: Choreograph motion across a 3D site: scroll-scrubbed camera moves, shader-driven transitions, damped pointer reactions, orchestrated reveals, and micro-interactions that all share one glide.
---

Turn a static or lightly animated page into a living, scroll-driven film. The scene, the camera, the type, and the UI should move as one choreographed system.

**Prerequisite**: Load the `immersive-3d-web` skill first.

## 1. Gather context (do this first)

You need: audience, brand personality (calm or energetic), the hero object, the scroll beats, and performance targets. Check the thread and codebase. If anything is inferred rather than confirmed, ask the user before building. Guessing produces random motion.

## 2. Find the motion opportunities

- **Static 3D**: A scene that only rotates. Needs scroll, pointer, and idle life.
- **Disconnected layers**: DOM text that animates separately from the canvas. Needs one shared timeline.
- **Abrupt transitions**: Sections that cut instead of morph.
- **Missing feedback**: Buttons, toggles, and configurators with no response.
- **No hero moment**: Nothing a visitor will remember.

**CRITICAL**: Respect `prefers-reduced-motion` with a real alternative, not just a disabled page.

## 3. Plan the choreography in layers

1. **Idle layer**: Always-on quiet life. Slow rotation, noise breathing in shaders, drifting particles, light movement.
2. **Scroll layer**: A master GSAP timeline bound to scroll with `scrub: 1` to `1.5`. Drives camera, hero transform, material uniforms, light, fog, and palette.
3. **Pointer layer**: Damped parallax on camera and hero, magnetic buttons, cursor states.
4. **Reveal layer**: Type and UI entrances, staggered, masked.
5. **Feedback layer**: Micro-interactions that answer user actions.
6. **Signature moment**: One showstopper (camera dive, morph, shader dissolve, liquid cursor).

## 4. Implementation patterns

### Glide infrastructure
```js
const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```
Drive the Three.js render from the same ticker so scroll, DOM, and canvas stay in lockstep.

### Scroll-scrubbed 3D
```js
const tl = gsap.timeline({
  scrollTrigger: { trigger: '#story', start: 'top top', end: 'bottom bottom', scrub: 1.2 }
});
tl.to(camera.position, { x: 2, y: 1, z: 4, ease: 'none' }, 0)
  .to(hero.rotation, { y: Math.PI * 2, ease: 'none' }, 0)
  .to(heroMat.uniforms.uDistort, { value: 0.8, ease: 'none' }, 0.3);
```
Use `ease: 'none'` on scrubbed tweens and let the scrub smoothing provide the glide. Put easing in the timing between beats, not inside them.

### Frame-rate-independent damping
```js
current += (target - current) * (1 - Math.exp(-lambda * dt));
```
Use this for pointer parallax, cursor follow, and any value driven by input.

### Camera path
Move along a `CatmullRomCurve3` using `curve.getPointAt(progress)`. Ease the look-at target separately so the camera never snaps.

### Type reveals
Split headings into lines or characters. Mask each (`overflow: clip`), animate `yPercent` from 110 to 0 with `expo.out` and 40 to 80ms stagger.

### Shader-driven transitions
Animate a `uProgress` uniform for dissolves, wipes, noise-based reveals, and morphs between two states. Prefer shader transitions over DOM crossfades for scene changes.

## 5. Timing and easing

- Instant feedback: 100 to 150ms. State changes: 200 to 300ms. Section reveals: 600 to 1000ms. Camera and scene moves: tied to scroll scrub.
- Entrances use `expo.out`, `power4.out`, or `power3.out`. Transitions use `power2.inOut`. Exits are about 75% of entrance time.
- **Never** bounce or elastic. They feel cheap and fight the cinematic tone.

## 6. Performance and accessibility

- Animate DOM with `transform` and `opacity` only. Animate 3D through uniforms and transforms, not geometry rebuilds.
- Keep one render loop. Pause when the tab is hidden.
- Reduced motion: disable scrub-driven camera travel and parallax, keep a calm idle drift or a static scene, show all content immediately.
- Never block interaction during animation unless intentional.

**NEVER**:
- Animate without a purpose. Every move needs a reason.
- Scatter unrelated effects. One orchestrated system beats many tricks.
- Create scroll-jacking that removes user control.
- Use fade-up-on-everything as the only language.
- Let motion hurt legibility.

## 7. Verify

- Scrub the page slowly and quickly in both directions. Nothing pops, snaps, or desyncs.
- Check 60fps on a mid-range device.
- Check reduced motion, tab switching, resize mid-animation, and fast scroll flicks.
- Confirm the signature moment lands and the rest stays quiet.
