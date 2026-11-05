---
name: optimize
description: Make a 3D scroll site hit 60fps: profile first, then cut draw calls, GPU cost, shader work, memory, bundle size, and load time without losing the look.
---

A gorgeous scene at 20fps is a failure. Measure, find the real bottleneck, fix it, measure again.

**Prerequisite**: Load the `immersive-3d-web` skill first.

## 1. Measure first

- **Frame performance**: FPS and frame-time graph (stats panel, Chrome Performance tab). Look for spikes during scroll, resize, and the signature moment.
- **GPU stats**: `renderer.info` (draw calls, triangles, geometries, textures, programs). Spector.js for frame captures.
- **CPU vs GPU bound**: If shrinking the canvas (lower pixel ratio) fixes it, you are fill-rate or fragment bound. If not, you are CPU or draw-call bound.
- **Memory**: Heap and GPU memory growth over time (leaks).
- **Load**: LCP, INP, CLS, time to first frame, total bytes, script count.
- **Devices**: Mid-range phone, integrated-graphics laptop, high-DPI desktop.

**CRITICAL**: Optimize the biggest bottleneck first. Do not micro-optimize blindly.

## 2. GPU and rendering

### Pixel cost (usually the biggest lever)
- Cap pixel ratio (`Math.min(devicePixelRatio, 2)`, lower on weak devices). Dynamic resolution: lower it when frame time spikes, restore when stable.
- Reduce overdraw: avoid many large transparent layers, sort and limit particle sprites.
- Render post-processing at reduced resolution (bloom especially). Drop passes on low tiers.
- Transmission and refraction materials are expensive: limit to the hero, reduce samples and resolution, or fake with an environment lookup on low tiers.
- Shadows: smaller maps, tight frustums, bake static shadows, or fake with contact blobs.

### Shader cost
- Move work from fragment to vertex where possible. Avoid loops and heavy branching in fragments.
- Cheaper noise (value or gradient noise over many-octave fBm), precompute into a texture, or use fewer octaves.
- Use `mediump` where visual quality allows. Avoid per-pixel `pow`, `sin` chains, and dependent texture reads when a lookup works.

### Draw calls and geometry
- `InstancedMesh` for repeated objects, `Points` with shaders for particles, merged geometry for static props.
- Share geometries and materials. Avoid creating them in the render loop.
- Reduce segment counts where displacement does not need them. Use LOD for distant objects.
- Frustum culling on. Disable `matrixAutoUpdate` on static objects.
- Avoid per-frame allocations (`new Vector3()` in loops). Reuse temporaries.

### Textures
- Procedural or compressed where possible. Power-of-two sizes, mipmaps on, appropriate formats. Keep canvas textures small.
- Dispose of anything unused.

## 3. Scroll and animation performance

- One `requestAnimationFrame` source: the GSAP ticker driving Lenis and Three together.
- Read layout once, write once. Avoid layout thrash in scroll handlers. Use `ScrollTrigger` instead of manual scroll listeners.
- Animate DOM with `transform` and `opacity` only. Use `will-change` sparingly and remove it after animations.
- `contain: layout paint` on independent sections. `content-visibility: auto` for long off-screen content.
- Throttle expensive pointer work. Use `passive` listeners.
- Pause rendering when the tab is hidden or the canvas is fully covered (`IntersectionObserver`, `visibilitychange`).

## 4. Loading performance

- Show the shell, fonts with fallbacks, and loader immediately. Initialize the scene after first paint (`requestIdleCallback` or `setTimeout 0` after first frame).
- Defer non-critical scripts. Load only the Three.js build and plugins you need.
- Keep inline assets small. Prefer procedural generation to big embedded textures or models.
- Font loading: `font-display: swap`, subset, limit weights, preload the display face.
- Set explicit canvas container size to avoid layout shift.
- On Save-Data or slow connections, skip optional effects.

## 5. Quality tiers and adaptive scaling

Implement tiers (High, Medium, Low, Fallback). Sample frame time for the first second to choose, then monitor and step down automatically. See `/adapt` for tier definitions.

## 6. Memory

- Dispose geometries, materials, textures, and render targets you remove.
- Remove event listeners, kill tweens and triggers, cancel RAF on teardown.
- Watch for growth in `renderer.info.memory` across repeated scrolls and resizes.

## 7. Targets

- 60fps (16.6ms) on mid-range hardware. Stable beats high-but-spiky.
- LCP under 2.5s, INP under 200ms, CLS under 0.1.
- Total initial JS as small as the concept allows.

**NEVER**:
- Optimize without measuring.
- Sacrifice accessibility or the hero's quality for micro-gains.
- Strip the look everywhere. Cut decoration first, keep the hero and signature moment.
- Use `will-change` everywhere.
- Lazy-load above-the-fold essentials.
- Test only on a flagship machine.

## 8. Verify

Compare before and after on the same devices: frame time, draw calls, memory, Lighthouse. Confirm no visual regression on the hero, no new jank during scroll, and that reduced motion and fallbacks still work. Ask: does it feel faster?
