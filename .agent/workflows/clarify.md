---
name: clarify
description: Improve copy, labels, errors, loaders, and microcopy in an immersive 3D site so the spectacle never costs understanding. Clear, specific, human.
---

Beautiful scenes with confusing words fail. Make every piece of interface text easy to understand and act on, including text that sits over or inside a 3D world.

## 1. Assess the copy

Look for: jargon, ambiguity, passive voice, vague labels ("Explore", "Discover", "Learn more" with no object), filler, tone mismatch, copy that repeats what the visuals already say, and text that only exists inside the canvas.

Know the audience, their mental state (curious, rushed, frustrated), the action you want, and constraints (length, localization, space over the scene).

**CRITICAL**: Poetic is fine, unclear is not. A visitor should always know what this is, what they can do, and what happens next.

## 2. Plan

- **Primary message**: The one thing to understand.
- **Action**: What to do next.
- **Tone**: Matches the brand and the moment.
- **Constraints**: Space over the scene, readability, translation length.

## 3. Improve systematically

### Hero and section copy
- Say what the product or project is in plain words within the first screen. Cinematic is not a replacement for clarity.
- One idea per section. Headlines make a claim. Supporting text proves it.
- Do not restate the headline in the intro line.

### Buttons and CTAs
Bad: "Click here", "Submit", "Explore". Good: "Start the tour", "Book a demo", "Add to cart", "View the collection".
Use verb + object. Keep the same name for the same action everywhere.

### Interactive 3D hints
- Tell users what the scene can do: "Drag to rotate", "Scroll to enter", "Pick a finish".
- Show hints at the moment of need, fade them after first use, and never rely on hover alone.
- Provide text equivalents for configurator choices: the selected finish name, the price change, the result.

### Loaders and progress
Bad: "Loading..." for several seconds. Good: "Building the scene" with a visible progress value, or a short honest line. Never hide a long load behind a spinner with no information.

### Errors and fallbacks
- WebGL unavailable: "Your browser can't show the 3D view. Here's the same story in 2D." Then deliver it.
- Context lost: "The 3D view paused. Reload to bring it back." with a retry button.
- Form and network errors: say what happened, how to fix it, and do not blame the user.

### Labels, forms, tooltips
Specific labels, real labels (not placeholder-only), format examples, why you are asking, instructions before the field.

### Empty and success states
Explain what will appear, give a next step. Confirm what happened and what comes next.

### Navigation and wayfinding
Name sections by what they contain. Show a section index or progress indicator tied to scroll so visitors know where they are in the journey.

## 4. Clarity rules

1. Be specific. 2. Be concise. 3. Use active voice. 4. Sound human. 5. Tell people what to do. 6. Be consistent with terms.

## 5. Text over 3D

- Ensure legibility: scrims, text shadows used sparingly, or position text over calm regions of the scene.
- Keep line length under about 70 characters and sizes responsive.
- All essential content exists as real DOM text, never only as 3D text or texture.

**NEVER**:
- Use jargon without explaining it.
- Blame the user.
- Use humor in serious errors.
- Vary terminology for variety.
- Write long explanations where a line works.
- Use placeholders as the only labels.

## 6. Verify

Can a new visitor understand the offer in 5 seconds? Do they know what to do next? Is every CTA specific? Is the copy short, consistent, and readable over the scene? Does the fallback copy work when the 3D does not?
