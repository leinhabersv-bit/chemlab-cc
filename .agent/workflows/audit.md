---
name: audit
description: Run a full technical audit of a 3D, scroll-driven site covering WebGL performance, GPU cost, scroll and animation sync, accessibility, responsiveness, resilience, and anti-patterns. Produces a prioritized report. Does not fix.
---

Systematically inspect an immersive site and produce an actionable report. Document, do not fix. Other workflows handle the repair.

**Prerequisite**: Load the `immersive-3d-web` skill for the standards you are auditing against.

## 1. Diagnostic scan

### 3D rendering and GPU performance
- Frame rate on target devices, frame-time spikes, jank during scroll.
- Draw calls, triangle count, texture memory, shader complexity (loops, branching, heavy fragment math).
- Individual meshes where `InstancedMesh` or `Points` should be used.
- Pixel ratio uncapped. Shadow maps oversized. Post-processing passes at full resolution on weak devices.
- Memory leaks: geometries, materials, textures, render targets never `dispose()`d. Event listeners never removed.
- Render loop running when the tab is hidden or the canvas is offscreen.

### Scroll, glide, and animation sync
- Lenis, GSAP ticker, and the render loop out of sync (double loops, lag, jitter).
- `ScrollTrigger` not refreshed after resize, font load, or content change.
- Raw input applied to the scene without damping. Frame-rate dependent easing.
- Scroll-jacking that removes native control. Broken anchor links and keyboard scrolling.
- Animating layout properties (width, height, top, left) in the DOM.
- Bounce or elastic easing.

### Accessibility
- Contrast of text over the 3D scene (no scrim, busy backgrounds).
- Reduced motion ignored. No alternative for vestibular-sensitive users.
- Content only present inside the canvas. Missing semantic HTML, heading order, landmarks, alt text.
- Focus visibility, keyboard reachability, skip links, ARIA labels on custom controls.
- Flashing or strobing effects.

### Responsive and device support
- Camera framing breaks on portrait or ultrawide. Hero overlaps text.
- Touch: hover-only interactions, targets under 44px, canvas capturing scroll.
- No quality tiers. Desktop-only effects on mobile.
- Horizontal overflow, safe-area problems.

### Resilience
- No WebGL fallback. Blank page on context loss. No `webglcontextlost` handling.
- Unhandled storage or API failures. A single failed feature breaking the page.
- Long load with no designed loader. Layout shift when fonts or canvas initialize.
- Blocking scripts, oversized embedded assets, unpinned CDN versions.

### Theming and tokens
- Hard-coded colors in CSS and shaders that should come from tokens.
- Scene palette and UI palette drifting apart. Broken light or dark variants.

### Anti-patterns (CRITICAL)
Check against the `immersive-3d-web` avoid list: default gray materials, a lone spinning primitive, generic neon-on-black, gradient text everywhere, glassmorphism everywhere, identical card grids, disconnected effects, fade-up-only motion.

## 2. Report structure

### Anti-Patterns Verdict
Start here. Pass or fail: does this look like a generic AI or template 3D site? List the specific tells. Be blunt.

### Executive Summary
- Issue counts by severity.
- Top 3 to 5 critical issues.
- Overall quality rating and estimated frame budget status.
- Recommended next steps.

### Findings by severity
For each finding give: **Location** (file, function, section), **Severity** (Critical, High, Medium, Low), **Category** (Performance, Motion, Accessibility, Responsive, Resilience, Theming, Design), **Description**, **Impact**, **Standard** (WCAG or best practice, if any), **Recommendation**, **Suggested workflow** (`/optimize`, `/harden`, `/adapt`, `/normalize`, `/polish`, etc.).

- **Critical**: Blocks use or violates WCAG A (blank page without WebGL, unreadable text, scroll trap, crashes).
- **High**: Serious usability, accessibility, or sustained frame drops.
- **Medium**: Quality and efficiency issues.
- **Low**: Minor inconsistencies and tuning.

### Systemic patterns
Recurring problems, for example "No `dispose()` anywhere", "Every uniform driven from raw pointer values", "Hard-coded hex in 12 shaders".

### What works
Call out strong choices worth keeping and replicating.

### Prioritized plan
Immediate, short-term, medium-term, long-term. Map each cluster to the right workflow.

**NEVER**:
- Report an issue without explaining its impact.
- Mix severity levels inconsistently or call everything critical.
- Skip the positives.
- Give vague advice. Be specific.
- Report unverified problems. Reproduce first.

Be thorough but ruthless about priority. A good audit makes the fix obvious.
