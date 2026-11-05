---
name: delight
description: Add moments of wonder to a 3D site: cursor-reactive worlds, tactile configurators, hidden discoveries, playful loaders, sound, and celebrations. Joy that never blocks the task.
---

Turn a technically impressive site into one people want to play with and share.

**Prerequisite**: Load the `immersive-3d-web` skill first.

## 1. Gather context (do this first)

Audience, brand personality (playful, elegant, quirky, serious), and what is appropriate for the domain. If unclear, ask before building. Wrong delight is worse than none.

## 2. Find the moments

- **Hero idle**: The world responds when someone just looks at it.
- **Pointer play**: Cursor pushes particles, bends light, ripples a surface.
- **Configurators**: Changing a color or material feels physical.
- **Loading**: A designed intro, not a spinner.
- **Success**: Form sent, item added, tour finished.
- **Scroll payoffs**: A reveal at the end of a long glide.
- **Hidden layers**: Easter eggs for the curious.
- **Errors and empty states**: Soften frustration.

**CRITICAL**: Delight serves the task. If people notice the delight more than their goal, dial it back.

## 3. Principles

- **Amplify, never block**: Moments under about a second, skippable, never delaying core actions.
- **Discovery**: Hide details to find. Do not announce them.
- **Context**: Celebrate wins, be calm during errors. Match brand and culture.
- **Compound over time**: Vary responses and add layers on repeat visits.

## 4. Techniques

### Pointer-reactive worlds
- Raycast the pointer into the scene. Use the hit point to displace vertices, push instanced particles, drive a shader ripple, or steer a light.
- Fluid-like trails: render pointer velocity into a low-res buffer and sample it in the hero shader.
- Always damp. Add a gentle return to rest.

### Tactile configurators
- Swatches that trigger a material cross-fade in a shader, not a snap.
- Sliders mapped to uniforms (roughness, distortion, glow) with instant feedback.
- A small physical reaction on change: a subtle camera nudge, a light flash, a settle motion with critically damped springs (no bounce overshoot that reads as cheap).

### Playful 3D UI
- Magnetic buttons, custom cursor that morphs over interactive elements.
- Cards that tilt in 3D toward the pointer with parallax layers inside.
- Toggles that change the scene (day to night, wireframe to solid, explode view).
- Drag the hero to spin it with inertia.

### Loading as a performance
Short assembling sequence: shards coalescing into the hero, a counter, a curtain wipe into the first frame. Rotating honest status lines ("Polishing the lens", "Lighting the room"). Keep under about 2 seconds of added delay and make it skippable on repeat visits.

### Celebrations
Particle burst from the hero on success, a ring pulse, a color bloom. Use sparingly, once per meaningful milestone.

### Copy with personality
Match the brand. Warm beats wacky for serious domains. Examples: 404 as "This room doesn't exist. Let's go back." with the camera slowly pulling out of an empty scene.

### Sound (optional)
Subtle, off by default or behind a clear toggle. Respect system settings, keep it quiet, never autoplay loud audio. Short UI ticks, a low ambient bed, a soft whoosh on the signature moment. Provide mute and remember the choice (try/catch around storage).

### Easter eggs
Konami code, a hidden camera angle, a clickable detail in the scene, a console message for developers. Reward curiosity.

### Time and context
Sky or lighting shifts by local time of day, subtle seasonal touches, different greetings. Keep it tasteful.

## 5. Implementation notes

- Libraries: GSAP, Howler (sound), canvas-confetti (or custom particles in the scene), physics (Rapier or cannon-es) only if it serves the concept.
- Budget everything. Lazy-create delight features after first paint.
- Reduced motion: replace dramatic delight with calm feedback (color and text changes).

**NEVER**:
- Delay core functionality.
- Force people through delight.
- Use delight to hide poor UX.
- Make every interaction special. Special needs rarity.
- Ignore accessibility, performance, or context.
- Autoplay sound.

## 6. Verify

Still pleasant on the 50th visit? Skippable? 60fps? Works with reduced motion and on touch? Appropriate for the brand? Would someone screenshot or screen-record it?
