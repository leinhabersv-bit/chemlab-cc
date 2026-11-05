---
name: colorize
description: Give a 3D site a purposeful color system across lights, materials, shaders, fog, UI, and scroll-driven palette shifts, so scene and interface share one world.
---

Introduce or refine color so the 3D scene and the UI feel like one designed universe. Color should carry mood, hierarchy, and meaning.

**Prerequisite**: Load the `immersive-3d-web` skill first.

## 1. Gather context (do this first)

Audience, brand colors, emotional goal, and the domain. If brand colors or mood are only inferred, ask before applying. Guessing yields slop palettes.

## 2. Assess

- **Washed-out scene**: Gray materials, white light, empty background.
- **UI and scene mismatch**: CSS palette unrelated to the lighting.
- **One timid accent**, or too many random colors.
- **No palette movement**: Same color from first section to last.
- **Contrast failures** over the scene.

**CRITICAL**: More color is not better. Every color needs a job.

## 3. Plan the palette

- 2 to 4 hues beyond neutrals. Dominant about 60%, secondary 30%, accent 10%.
- Define them once as tokens and feed both CSS and Three.js from the same source:
```js
const tokens = { base: '#0e1a1f', surface: '#16262d', hero: '#e9b44c', accent: '#ff5d3a', ink: '#f3efe6' };
```
Read CSS custom properties in JS (`getComputedStyle`) or generate both from one object.
- Work in **OKLCH** for perceptually even scales. Tint neutrals toward the dominant hue.
- Avoid pure black and pure white in large areas. Avoid the cyan-purple default.

## 4. Apply color across the stack

### In the 3D scene
- **Lights**: Key light warm or cool against a complementary rim. Colored lights are your biggest lever for mood. Keep fill subtle.
- **Materials**: Base color, emissive accents, iridescence tint, transmission tint (`attenuationColor`), clearcoat. Let the hero carry the accent.
- **Background and fog**: A tinted gradient or fog color that matches the palette. Fog color should equal background color for seamless depth.
- **Shaders**: Gradient ramps and fresnel colors from uniforms. Use cosine palettes or LUT-style ramps for rich, controlled color.
- **Particles**: Color by depth or speed, not randomly.
- **Environment reflections**: A procedural environment tinted to the palette so reflections feel in-world.

### In the UI
- Primary CTA uses the accent. Links and focus rings use a harmonized hue.
- Backgrounds tinted, never flat gray. Text never gray on colored fills: use a shade of the background hue or transparency.
- Semantic states: success, error, warning, info, always paired with icon or label, never color alone.

### Scroll-driven palette shifts
Animate palette tokens along the master timeline so each section has a mood: lights, fog, material tint, and CSS variables change together. Interpolate in OKLCH to avoid muddy midpoints.

## 5. Balance and accessibility

- Contrast: 4.5:1 for text, 3:1 for UI components, including over the scene (add a scrim where needed).
- Test for color blindness. Red and green alone must not carry meaning.
- Keep temperature consistent within a section.
- Check the palette in bright and dim environments and on mobile screens.

**NEVER**:
- Use the whole rainbow.
- Color randomly.
- Rely on color alone for meaning.
- Mismatch scene lights and UI palette.
- Use gradient text for impact.
- Violate contrast requirements.

## 6. Verify

Does color guide attention to the hero and the primary action? Do scene and UI share a palette? Does each section have a distinct mood? Is everything accessible? Is it restrained enough that the accent still pops?
