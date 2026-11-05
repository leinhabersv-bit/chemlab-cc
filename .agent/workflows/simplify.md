---
name: simplify
description: Strip a 3D site down to its essence: one hero idea, fewer effects, a clearer scroll story, simpler UI, leaner code, and faster load. Remove obstacles, not capability.
---

Cut everything that does not serve the one idea. A focused scene beats a crowded one.

**Prerequisite**: Load the `immersive-3d-web` skill first.

## 1. Gather context (do this first)

Primary goal, audience, and what is essential versus nice-to-have. If unclear, ask before cutting. Simplifying the wrong thing hurts usability.

## 2. Find the complexity

- **Too many ideas**: Several hero objects, competing focal points, unrelated effects.
- **Effect stack**: Bloom, grain, glitch, particles, parallax, cursor trails, all at once.
- **Long, unfocused journey**: More beats than the story needs.
- **Cluttered UI**: Too many buttons, panels, HUD elements, options.
- **Excess variation**: Too many fonts, colors, sizes, easings.
- **Heavy code**: Unused modules, dead shaders, deep component trees.

Find the essence: What is the single thing this site must achieve? What is the 20% that delivers 80% of the value?

**CRITICAL**: Simplicity is removing obstacles between people and their goal, not removing features people need.

## 3. Plan

- **Core purpose**: One sentence.
- **Essential elements**: What the purpose truly requires.
- **Progressive disclosure**: What can hide until needed.
- **Consolidation**: What can merge.

## 4. Simplify

### The scene
- One hero object, one supporting environment. Remove secondary props.
- Keep the 2 or 3 effects that define the look. Cut the rest.
- Reduce particle and instance counts. Fewer, better lights. Simpler materials where the difference is invisible.
- Replace complex shaders with simpler ones where the result is the same.

### The journey
- Reduce scroll beats to what the story needs (often 3 to 5). Merge adjacent sections.
- Keep one signature moment. Remove competing set pieces.
- Shorter total scroll length. Clear pacing with deliberate quiet sections.

### Interaction
- Fewer controls. One obvious primary action per view. Smart defaults.
- Replace multi-step flows with inline interactions. Remove modals where inline works.
- Remove redundant hints once the interaction is learnable by doing.

### Visual system
- 1 to 2 colors plus tinted neutrals. One or two type families, a few sizes and weights.
- Remove unneeded borders, shadows, cards, and containers. Use spacing and alignment.
- Never nest cards in cards.

### Layout
- Linear flow, consistent alignment, generous whitespace. Remove sidebars and dense grids when a single column works.

### Copy
- Cut every sentence in half, then again. Active voice. Plain language. Say it once.

### Code
- Remove dead code, unused libraries, orphaned shaders and textures. Flatten component trees. Reduce variants (3 cover most cases). Smaller bundle, faster load, steadier frames.

**NEVER**:
- Remove necessary functionality or information needed to decide.
- Sacrifice accessibility, labels, or reduced-motion support.
- Make it so minimal it is unclear. Mystery is not minimalism.
- Eliminate hierarchy completely.
- Oversimplify genuinely complex domains.

## 5. Verify

- Do people reach their goal faster?
- Is the hierarchy clearer? Is there one obvious focus per screen?
- Is everything necessary still reachable?
- Did load time and frame stability improve?

## 6. Document what was removed

Record why features were removed and whether they need another entry point. Note feedback to watch.

Perfection is achieved when there is nothing left to take away.
