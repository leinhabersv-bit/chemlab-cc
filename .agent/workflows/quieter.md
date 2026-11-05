---
name: quieter
description: Tone down an overstimulating 3D site into something refined and premium: calmer motion, softer lighting, restrained color, fewer effects, and more space, without going boring.
---

Reduce intensity while keeping craft and character. Think luxury, not lazy.

**Prerequisite**: Load the `immersive-3d-web` skill first.

## 1. Gather context (do this first)

Purpose (marketing, reading, tool), audience, brand personality, and what is working. If unclear, ask before changing. Do not throw away good ideas.

## 2. Diagnose the intensity

- **Motion overload**: Constant parallax, spinning, camera shake, rapid transitions.
- **Effects pile-up**: Bloom, chromatic aberration, grain, glow, particles all at once.
- **Saturation and contrast extremes**: Neon accents, harsh blacks and whites.
- **Visual weight**: Too many heavy elements competing, everything huge.
- **Density**: Too much on screen, too little breathing room.

**CRITICAL**: Quiet does not mean empty or generic. It means refined, controlled, and easy on the eyes.

## 3. Plan

- **Color**: Desaturate toward sophisticated tones. Neutrals dominate, color is a small accent.
- **Hierarchy**: What stays bold (very few things) and what recedes.
- **Simplification**: What can be removed outright.
- **Quality through restraint**: Precision in lighting, spacing, and type signals polish.

## 4. Refine

### 3D scene
- **Lighting**: Softer contrast, larger and softer lights, gentler rim. Move from dramatic to ambient.
- **Materials**: Matte and satin finishes over mirror chrome. Lower emissive. Subtler iridescence.
- **Effects**: Remove or minimize bloom, chromatic aberration, heavy grain, glitch effects. Keep a faint vignette or grain only if it adds texture.
- **Particles and decoration**: Cut counts, slow them down, or remove them.
- **Camera**: Shorter travel, slower moves, fewer waypoints, gentler angles. Keep one considered camera moment.
- **Idle motion**: Slower and smaller. Breathing, not spinning.
- **Fog and depth**: Soft atmospheric depth in muted tones.

### Motion and glide
- Smaller distances (10 to 20px reveals instead of 40+), longer, softer easing (`power3.out`, `expo.out`).
- Increase scrub smoothing slightly for a calmer feel.
- Remove decorative motion. Keep motion that explains or confirms.
- Reduce parallax strength. Reduce simultaneous animation.

### Color
- Lower saturation (about 70 to 85%), tinted neutrals, fewer hues. Accent about 10%.
- Gentler contrast except where it matters (primary action, key text).
- Never gray text on colored fills.

### Type and weight
- Reduce weights (900 to 600, 700 to 500), moderate scale jumps, more whitespace around headlines.
- Hierarchy through size, spacing, and position rather than color and boldness.

### Layout
- Even out spacing rhythm, align stray elements to the grid, flatten layering, reduce overlap and busy frames.
- Thinner or fewer borders. Remove unneeded shadows and glows.

**NEVER**:
- Flatten everything to the same size and weight.
- Strip all color or personality.
- Remove clear affordances from interactive elements.
- Make everything tiny and pale.
- Cut the hero. Keep one quiet anchor.

## 5. Verify

- Still functional and still distinctive?
- Easier to look at for minutes at a time?
- Smoother and calmer on scroll?
- Does it feel more premium, not just less?
- Frame rate still solid (fewer effects should help).

Quiet design is harder than loud design. Refine with precision.
