---
name: teach-impeccable
description: One-time setup that gathers context for an immersive 3D project (audience, concept, hero object, aesthetic, performance targets) and saves persistent design guidelines for all future sessions.
---

Gather the context a great creative developer needs, then persist it so every future session starts informed.

**Prerequisite**: Load the `immersive-3d-web` skill first.

## Step 1: Explore the project

Before asking questions, scan what you can:

- **README and docs**: Purpose, audience, goals.
- **package.json and config**: Stack (Three.js, R3F, GSAP, Lenis, framework, build tool).
- **Existing scene code**: Renderer setup, lighting, materials, shaders, camera paths, quality tiers.
- **Motion setup**: Scroll library, timeline structure, easing and duration conventions.
- **Brand assets**: Logos, colors, fonts, tokens, CSS variables.
- **Content**: Real copy, product details, imagery or models that already exist.
- **Style guides** or design documentation.

Note what you learned and what is still unclear.

## Step 2: Ask focused questions

Ask the user (batch them, skip what the codebase already answers):

### Users and purpose
- Who visits, in what context, and what should they do or feel?
- What is the single goal of the site (sell, impress, explain, convert, entertain)?

### Concept
- What is the subject, and what could be the one hero object or idea?
- Any story arc or sections the scroll should tell?
- Any reference sites you admire? What specifically about them? Any anti-references?

### Brand and aesthetic
- Three words for the brand personality.
- Direction: elegant, brutal, organic, playful, technical, surreal, minimal?
- Light, dark, or shifting? Colors and fonts that must be used or avoided?
- Preferred material feel (glass, metal, clay, iridescent, matte)?

### Technical and performance
- Target devices and browsers? Is mobile a priority?
- Hosting constraints (single HTML file, framework app, CDN limits)? Any no-external-asset rule?
- Performance budget and minimum acceptable frame rate?
- Do you have 3D models or must everything be procedural?

### Accessibility and inclusion
- WCAG target, reduced-motion expectations, known user needs, languages and RTL.

## Step 3: Write the design context

Synthesize findings and answers into a `## Design Context` section:

```markdown
## Design Context

### Users and Goal
[Who they are, their context, the single goal]

### Concept
[Subject, hero object, scroll story beats, signature moment]

### Brand Personality
[Voice, tone, three words, emotional goals]

### Aesthetic Direction
[Visual tone, palette (named hex values), type pairing, material language, references, anti-references, theme]

### Motion Language
[Glide feel, easing and duration conventions, scrub smoothing, idle vs expressive motion]

### Technical Constraints
[Stack, hosting limits, quality tiers, performance budget, device targets]

### Accessibility
[WCAG target, reduced-motion approach, fallback behavior]

### Design Principles
[3 to 5 principles that guide every decision]
```

Write this to `task.md` in the project root. If the file exists, append or update the Design Context section.

Confirm completion and summarize the key principles that will now guide all future work.
