---
name: onboard
description: Design onboarding for interactive 3D experiences: teach scroll, drag, and configure interactions through the scene itself, guide first success, and respect returning visitors.
---

Immersive sites ask visitors to do unfamiliar things: scroll through a film, drag a model, switch materials. Get them to their "aha" fast, and let the world do the teaching.

**Prerequisite**: Load the `immersive-3d-web` skill first.

## 1. Assess

- What are visitors trying to do? What is confusing? Where do they bounce?
- What is the "aha": the first reveal, the first configuration change, the first purchase intent?
- Audience experience level, motivation, and time budget.
- Success metrics: completion of the first scroll beat, first interaction, time to value.

**CRITICAL**: Teach the minimum needed to succeed. The experience itself is the product, not a tutorial.

## 2. Principles

- **Show, don't tell**: Let the scene demonstrate. A hero that gently invites a drag teaches more than a modal.
- **Optional**: Never gate the site behind a tour. Always provide a skip.
- **Time to value**: Reach the first wow in seconds.
- **Context over ceremony**: Hints appear at the moment of need.
- **Respect intelligence**: Short, clear, no patronizing.

## 3. Designing 3D onboarding

### First moments
- Designed loader that sets tone and flows straight into the hero reveal.
- One clear line stating what this is and the first action: "Scroll to begin", "Drag to turn it".
- A subtle scroll cue (animated indicator or camera drift) that disappears after the first scroll.

### Teaching interactions through the world
- **Affordance by motion**: Auto-nudge the hero slightly so people see it responds. Hover or touch states that respond immediately.
- **Contextual hints**: A small hint near the object ("Drag to rotate") that fades after first successful use. Detect use, then dismiss.
- **Progress and place**: A section index and scroll progress so people know the journey length.
- **First success**: Guide to one meaningful interaction (change a finish, trigger the reveal), then celebrate lightly.

### Configurators and tools
- Pre-select a good default so the first view looks great.
- Label options with real names and results. Show what changes and what it costs.
- Offer "Reset" and "Share this view" once people have customized.

### Guided tours (when the experience is complex)
- 3 to 6 steps. Camera moves to each relevant part while a caption explains it.
- Interactive and skippable, replayable from a help control.
- Focus on workflow, not features.

### Empty and error states
- Nothing selected, nothing saved, WebGL unavailable: explain, show the next action, keep it friendly.

### Help
- Persistent small help control with controls reference (scroll, drag, keys).
- Keyboard shortcut hints where relevant.

## 4. Implementation

- Track "seen" state with `try/catch`-wrapped storage so returning visitors skip intros and hints. Respect dismissals.
- Detect input type (touch vs mouse) to show the right hint text.
- Make hints accessible: real DOM text, announced via live region when appropriate, never the only way to learn a control.
- Reduced motion: replace camera nudges with static hints.
- Never run analytics that block rendering. Measure completion, drop-off, and time to first interaction.

**NEVER**:
- Force a long intro before content.
- Show the same hint repeatedly after it was used or dismissed.
- Block the whole UI during a tour.
- Build a separate tutorial mode disconnected from the real experience.
- Hide the skip control.
- Forget returning visitors.

## 5. Verify

Do new visitors reach the first interaction within seconds? Do they understand how to move through the page? Do returning visitors skip the basics? Is it usable on touch, with keyboard, and with reduced motion?
