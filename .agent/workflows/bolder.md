---
name: bolder
description: Push a safe or flat 3D site into something unforgettable: dramatic scale, hero-object depth, richer materials and lighting, cinematic camera, and confident type. Bold means distinctive, not more effects.
---

Take a timid or generic experience and make it memorable. Increase drama and personality while keeping it usable, performant, and coherent.

**Prerequisite**: Load the `immersive-3d-web` skill first.

## 1. Gather context (do this first)

Audience, purpose, brand personality, how far the brand can be pushed, and constraints (performance, accessibility, existing brand rules). If anything is only inferred, ask before building. Guessing produces generic "bold".

## 2. Diagnose why it feels safe

- **Flat 3D**: Default materials, one light, no depth, a plain background.
- **Timid scale**: Hero object small, camera far, everything medium.
- **No journey**: The scene does not change as you scroll.
- **Generic type and color**: Default fonts, safe palette, equal visual weight.
- **Predictable layout**: Centered, symmetric, card grid.
- **No signature moment**.

**WARNING, AI slop trap**: "Bolder" tempts toward cyan-purple gradients, neon on black, glass cards, gradient text. Those are the generic answer. Bold here means a point of view specific to the subject.

## 3. Plan the amplification

- **Focal point**: Pick one hero moment and make it extraordinary.
- **Personality lane**: Elegant drama, industrial brutalism, organic surreal, playful toy-like, cold precision. Choose one.
- **Risk budget**: Marketing can go further than a dashboard.
- **Hierarchy**: Big gets bigger, small gets smaller.

## 4. Amplify

### The 3D itself
- **Scale and framing**: Fill the frame with the hero. Crop it, push the camera in, let it break out of its container and overlap the type.
- **Materials**: Upgrade to physical materials with clearcoat, transmission, iridescence, or a custom fresnel shader. Tune roughness deliberately.
- **Lighting**: Strong key, colored rim, contrast. Let shadows and falloff carry mood. Use a procedural environment for real reflections.
- **Depth**: Foreground particles or debris, midground hero, background fog or gradient. Parallax between layers.
- **Geometry**: Add displacement, noise, bevels, instanced fields, or a morph target. Avoid plain primitives.
- **Camera drama**: Low angles, dolly pushes, orbit, and dives through the object. Vary focal length for tension.

### Typography
- Extreme scale jumps (3x to 5x), weight contrast (900 against 200), distinctive display faces, condensed or extended widths.
- Let type overlap, sandwich between canvas layers, or mask the 3D object.

### Color
- One dominant hue owns about 60%, with a sharp accent. Tint neutrals. Use OKLCH for even steps.
- Shift the palette between sections along with the scene.
- Avoid the purple-blue default and avoid timid desaturation.

### Space and composition
- Asymmetry, off-center hero, diagonal flow, full-bleed sections, generous emptiness (100 to 200px gaps).
- Unexpected splits like 70/30 or 80/20.

### Texture and detail
- Film grain, halftone, duotone, vignette, subtle chromatic aberration (only if it fits the concept).
- Custom shapes and frames over generic rounded rectangles.

### Motion
- Dramatic but orchestrated entrance. Scroll-scrubbed camera and uniform changes. Shader transitions. A signature moment.
- Expo and quart easing. No bounce.

**NEVER**:
- Add effects randomly. Chaos is not bold.
- Sacrifice readability. Body text stays clean over a scrim if needed.
- Make everything loud. Contrast needs quiet areas.
- Ignore performance. Bold at 20fps is a failure.
- Ignore accessibility and reduced motion.
- Copy a trend blindly.

## 5. Verify

- **Slop test**: Would someone say "an AI made this bolder" instantly? If yes, start over.
- Memorable: What is the one thing a visitor will describe afterward?
- Functional: Can they still read, navigate, and act?
- Coherent: Do scene, UI, color, and type feel like one world?
- Performant and accessible: 60fps, reduced-motion path, contrast.

Bold is confident, specific, and controlled. Make it unforgettable.
