---
name: polish
description: Final quality pass for a 3D scroll site: edge alignment, spacing, type detail, shader and light tuning, state coverage, timing, performance sanity, and code cleanup before launch.
---

The difference between shipped and polished. Do this last, once everything works.

**Prerequisite**: Load the `immersive-3d-web` skill first.

## 1. Pre-polish check

- Is it functionally complete? Polish is the final step.
- What is the quality bar (portfolio showpiece or MVP)? How much time remains? Triage accordingly.
- Note known issues to preserve with TODOs.

## 2. Polish dimensions

### 3D scene
- **Framing**: Hero well composed at every aspect ratio. Nothing clipped, nothing awkwardly empty.
- **Lighting**: No blown highlights or crushed blacks. Rim light reads. Reflections look intentional.
- **Materials**: Roughness, clearcoat, transmission tuned. No z-fighting, shimmering, or visible seams. Normals correct.
- **Edges**: Antialiasing clean. No jagged silhouettes or banding in gradients (add subtle dither or grain).
- **Depth cues**: Fog and particles consistent in scale and density.
- **Color management**: Correct color space and tone mapping. Consistent look between scene and CSS.
- **Idle life**: Quiet, never distracting.
- **Loader to hero handoff**: Seamless, no flash of empty canvas.

### Motion and glide
- Smooth in both scroll directions and under fast flicks.
- No pops at section boundaries, no scrub overshoot.
- Consistent easing (expo, quart) and durations. No bounce.
- Camera look-at eased. Pointer damping consistent.
- Pin and unpin points feel natural. Anchor links and "back to top" glide properly.
- `ScrollTrigger.refresh()` after fonts load and on resize.
- Reduced-motion alternative looks good, not broken.

### Alignment and spacing
- Everything on the spacing scale. No random 13px gaps.
- Optical alignment for icons and large type (display type often needs negative offsets).
- Consistent edge margins and rhythm. Intentional asymmetry, not accidents.

### Typography
- Consistent hierarchy. Line length 45 to 75 characters for body.
- Tight tracking on display, comfortable on body. No widows and orphans.
- Kerning tuned on headlines. No FOUT or layout jump when fonts load.
- Split-text animations preserve spacing, ligatures, and wrapping.

### Color and contrast
- Contrast passes over the scene at every scroll position. Check the worst frame.
- Tokens used everywhere. Tinted neutrals. No gray on colored fills.
- Focus rings visible against the scene.

### Interaction states
Every interactive element has default, hover, focus, active, disabled, loading, error, success. Custom cursor states for every interactive type. Touch states replace hover on touch devices.

### Copy and content
Consistent terms and capitalization, no typos, specific CTAs, no placeholder text. Loader and hint copy fits the brand.

### Responsiveness and adaptation
All breakpoints and orientations. Touch targets 44px. No horizontal scroll. Safe areas respected. Quality tiers working.

### Performance sanity
60fps on target devices, no layout shift, clean first load, no console errors or warnings, resources disposed.

### Code quality
Remove debug helpers (stats, GUI, axes, logs) from production. Remove dead code and unused imports. Pinned CDN versions. Consistent naming. Comments where non-obvious.

### Meta and sharing
Title, description, favicon, social image (a still of the hero), correct theme color.

## 3. Checklist

- [ ] Hero framed well at all aspect ratios
- [ ] Lighting and materials tuned, no artifacts
- [ ] Glide smooth in both directions, no pops
- [ ] Easing and timing consistent
- [ ] Reduced-motion version polished
- [ ] WebGL fallback polished
- [ ] Spacing and alignment on system
- [ ] Type hierarchy and kerning refined
- [ ] Contrast passes at worst frame
- [ ] All interactive states present
- [ ] Copy consistent, no placeholders
- [ ] Touch, keyboard, and mouse all work
- [ ] 60fps on mid-range device
- [ ] No console errors, debug tools removed
- [ ] Meta tags and share image set

**NEVER**:
- Polish before it works.
- Introduce bugs while polishing.
- Perfect one area and leave others rough.
- Ignore systemic issues. Fix the system, not each instance.

Zoom in. Squint. Scroll it slowly, then fast. Use it yourself on a real phone. Sweat the details.
