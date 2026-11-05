---
name: extract
description: Extract reusable 3D and UI building blocks into a system: scene modules, material and shader libraries, motion presets, camera rigs, tokens, and components.
---

Turn one-off code from a 3D site into a reusable, well-documented system so the next build is faster and more consistent.

**Prerequisite**: Load the `immersive-3d-web` skill first.

## 1. Discover

Find the existing system (design system, component library, shared `lib`, scene helpers). Learn its structure, naming, token format, documentation style, and import conventions. **If none exists, ask before creating one**, including where it should live.

Look for:
- **Repeated scene code**: Renderer and resize setup, lighting rigs, environment generation, post passes.
- **Repeated shaders**: Fresnel, noise displacement, gradient ramps, dissolve, grain.
- **Repeated motion**: Reveal timelines, scroll-scrub setups, damping utilities, magnetic and cursor behavior.
- **Repeated UI**: Buttons, nav, cards, tabs, sliders, tooltips, section index.
- **Hard-coded values**: Colors, durations, easings, spacing, camera presets that should be tokens.
- **Inconsistent variants**: Three implementations of the same effect.

**Assess value**: Used 3+ times or clearly reusable? Will systematizing improve consistency? General pattern or one-off? Maintenance cost?

## 2. Plan

- **Modules to extract**: `createStage()`, `createLights(preset)`, `createEnvironment(palette)`, `createCameraRig(path)`, `createPostStack(tier)`, `useScrollTimeline()`, `damp()`, `splitReveal()`, `magnetic()`, `customCursor()`, `qualityTier()`.
- **Shader chunks**: Noise (simplex, curl), fresnel, palette ramps, dissolve, grain, vignette. Export as reusable GLSL strings with documented uniforms.
- **Material presets**: Glass, brushed metal, clay, iridescent, toon, each with tunable parameters.
- **Tokens**: Primitive and semantic. Colors (OKLCH), type scale, spacing, easing curves, durations, camera presets, quality tiers.
- **Components**: Props with sensible defaults, variants, built-in accessibility.
- **Naming and migration path** matching the existing conventions.

**IMPORTANT**: Systems grow incrementally. Extract what is clearly reusable now.

## 3. Extract and enrich

- **Clean APIs**: Small functions with options objects, defaults, and cleanup (`dispose()` and `destroy()` returned from every factory).
- **Resilient by default**: Quality tiers, reduced-motion handling, WebGL fallback hooks built into the modules.
- **Shared source of truth**: One token object feeds CSS variables and shader uniforms.
- **Accessibility**: Focus states, ARIA, keyboard support in every UI component.
- **Documentation**: When to use, parameters, performance cost, examples, and a live demo page.
- **Types**: TypeScript types or JSDoc for every public API.

## 4. Migrate

Find all instances, replace systematically, verify visual and performance parity (compare frame times), delete the old code, and update demos.

## 5. Document

Update the component catalog or Storybook, token docs, shader chunk reference, and a short "how to build a new scene" guide.

**NEVER**:
- Extract one-off effects without generalizing.
- Build abstractions so generic they are useless.
- Ignore existing conventions.
- Create a token for every value. Tokens carry semantic meaning.
- Skip cleanup and disposal in factories.

A good system is alive. Extract as patterns emerge and maintain them.
