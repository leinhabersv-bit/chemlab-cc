---
name: critique
description: Evaluate a 3D scroll experience like a design director: concept, hero object, camera journey, motion feel, UI craft, emotional impact, and slop detection. Gives blunt, prioritized, actionable feedback.
---

Judge whether the experience actually works as a designed, immersive whole, not just whether it runs.

**Prerequisite**: Load the `immersive-3d-web` skill for the standard.

## Evaluate across these dimensions

### 1. Slop detection (most important)
Does it look like every other generated 3D landing page? Check for: default gray materials, a lone spinning primitive, neon-on-black, purple-blue gradients, gradient text, glassmorphism everywhere, identical card grids, generic fonts, fade-up-only motion, effects with no connection to the subject.
**Test**: Would someone say "AI made this" immediately? If yes, that is the problem.

### 2. Concept and hero object
- Is there a clear idea native to the subject?
- Is the hero object memorable, well-lit, well-materialed, and framed with intent?
- Could a stranger name the one thing they would remember?

### 3. Journey and camera
- Does the scroll tell a story with beats, or is it one scene with text scrolling over it?
- Does the camera move purposefully along a path, with eased look-at?
- Is there pacing: tension, release, quiet sections?
- Is there a signature moment, and does it land?

### 4. Motion feel
- Does it glide? Any snap, pop, lag, desync between DOM and canvas?
- Is input damped and weighted?
- Is idle motion alive but quiet?
- Are easings consistent and appropriate (no bounce)?
- Does it avoid scroll-jacking?

### 5. Visual quality of the 3D
- Materials, lighting, reflections, depth cues, scale, fog, grain.
- Does it look expensive or flat?
- Does it hold up at different aspect ratios?

### 6. Hierarchy and information architecture
- What does the eye hit first? Can you find the primary action in 2 seconds?
- Is the content structure intuitive? Is the 3D helping or hiding the message?

### 7. Typography and layout
- Display type with character, scale contrast, interplay with the 3D.
- Readable body text over the scene. Line lengths, contrast, scrims.
- Composition: asymmetry that feels designed, intentional emptiness.

### 8. Color and cohesion
- Do scene and UI share one palette and mood? Does color shift with the story?

### 9. UI craft and interaction
- Discoverability: Do users know the scene is interactive? Are hints timely?
- States: hover, focus, active, disabled, loading, error, success.
- Configurators, cursors, controls feel responsive and polished.

### 10. Emotional resonance
- What does it make you feel? Is that intentional? Does the target user feel it is for them?

### 11. Performance and resilience (perceived)
- Load experience, jank, heat, fan noise. Fallbacks and failure states.

### 12. Microcopy and voice
- Clear, specific, human. Loader, hints, CTAs, errors.

## Report format

### Anti-Patterns Verdict
Pass or fail with specific tells. Be honest.

### Overall Impression
Gut reaction: what works, what does not, the single biggest opportunity.

### What's Working
2 to 3 specifics, with why they work.

### Priority Issues
3 to 5 problems, ordered by impact. For each: **What**, **Why it matters**, **Fix** (concrete), **Workflow** (`/bolder`, `/quieter`, `/animate`, `/optimize`, `/polish`, `/simplify`, `/delight`, etc.).

### Minor Observations
Smaller notes.

### Questions to Consider
Provocations: "What if the camera went through the object instead of around it?", "What would the confident version of this section look like?", "Does this need to move at all here?"

**Remember**: Be direct and specific. Name the exact element. Explain impact. Give concrete suggestions. Prioritize. Do not soften the verdict, honest critique is how it ships great.
