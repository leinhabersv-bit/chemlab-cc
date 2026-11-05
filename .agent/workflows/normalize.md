---
name: normalize
description: Align a 3D feature or page with the project's design system: tokens, components, motion presets, camera and lighting conventions, and shared shader and material libraries.
---

Make a feature feel like it belongs to the same world as the rest of the product, in both the 2D interface and the 3D scene.

**Prerequisite**: Load the `immersive-3d-web` skill first.

## 1. Plan

1. **Discover the system**: Find design system docs, tokens, component libraries, scene helpers, shader chunks, motion presets, and style guides. Learn the aesthetic direction, personas, patterns, and conventions. **If something is unclear, ask. Do not guess.**
2. **Analyze the feature**: Where does it deviate? Is the cause missing tokens, one-off implementations, or conceptual misalignment?
3. **Write the normalization plan**: Which pieces become system equivalents? Which values become tokens? Which patterns should match established flows?

**IMPORTANT**: Prioritize effective UX and consistency over cosmetic polish.

## 2. Execute

Align each dimension:

- **Typography**: System fonts, sizes, weights, line heights, and type tokens. Match display-type reveal behavior.
- **Color and theme**: System tokens for CSS and for scene lights, materials, fog, and shader uniforms. Remove one-off hex values.
- **Spacing and layout**: Spacing tokens, grid, and layout patterns.
- **Components**: Replace custom buttons, nav, cards, tabs, sliders, and tooltips with system versions and variants.
- **3D conventions**: Same renderer settings (tone mapping, color space, pixel ratio cap), lighting rig presets, environment approach, camera FOV defaults, and quality tiers.
- **Materials and shaders**: Use shared material presets and shader chunks instead of near-duplicate copies.
- **Motion**: System easing curves, durations, stagger values, scroll-scrub smoothing, reveal patterns, and the shared Lenis and GSAP setup.
- **Interaction**: Cursor, magnetic, hover, focus, and touch behavior match the rest of the product.
- **Responsive and adaptation**: Same breakpoints, quality tiers, and fallbacks.
- **Accessibility**: Contrast, focus, ARIA, reduced-motion handling as specified by the system.
- **Progressive disclosure**: Match information hierarchy and complexity management.

**NEVER**:
- Create a new component when a system one exists.
- Hard-code values that should be tokens.
- Introduce patterns that diverge from the system.
- Duplicate shader or material code that already exists.
- Compromise accessibility for consistency.

## 3. Clean up

- **Consolidate**: Move new reusable pieces into the system.
- **Remove orphans**: Delete obsolete styles, shaders, helpers, and files.
- **Verify**: Lint, type-check, test, and compare frame times and visuals before and after.
- **DRY**: Merge duplication introduced during the refactor.

You have world-class taste in both UX and 3D craft. Execute with precision.
