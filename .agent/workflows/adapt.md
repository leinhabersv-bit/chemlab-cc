---
name: adapt
description: Adapt an immersive 3D site to every device, input, GPU tier, and context without losing the wow. Re-stages the scene, camera path, and UI per context instead of shrinking it.
---

Take a 3D, scroll-driven experience and make it feel native on every device. A phone is not a small desktop. A low-end laptop is not a gaming rig. Re-stage the experience for each one.

**Prerequisite**: Load the `immersive-3d-web` skill first so you know the glide, camera, and performance rules.

## 1. Assess the context gap

- **Source context**: What was this built for? (Desktop, mouse, discrete GPU, fast network?)
- **Targets**: Phone portrait, phone landscape, tablet, laptop with integrated graphics, 4K and ultrawide, TV, reduced-motion users, no-WebGL browsers, print.
- **Inputs**: Touch, mouse, keyboard, gamepad, device tilt, screen reader.
- **Constraints**: GPU tier, thermal throttling, battery, data cost.

**CRITICAL**: Adaptation is re-composition. If the hero object is dead center on desktop and hidden behind the headline on mobile, the design failed.

## 2. Re-stage the 3D per viewport

- **Camera**: Adjust FOV and distance by aspect ratio so the hero object always fits. Portrait gets a narrower subject and a higher camera. Compute framing from aspect, never hard-code one position.
- **Hero placement**: Desktop can place the object off-center beside the text. Mobile stacks it: object in the upper half, text in the lower half, or the object behind a scrimmed text block.
- **Camera path**: Simplify the journey on small screens. Fewer waypoints, shorter travel, less roll. Keep the signature moment, cut secondary beats.
- **Scene density**: Reduce particles, instances, and geometry segments on small screens. Keep the hero at full quality.
- **Orientation change**: Handle `resize` and `orientationchange` by recomputing camera, renderer size, pixel ratio, and ScrollTrigger positions (`ScrollTrigger.refresh()`).

## 3. Quality tiers (auto-detect)

Sample frame time for the first 1 to 2 seconds, then pick a tier. Allow the tier to step down at runtime if frames drop.

| Tier | Pixel ratio | Effects | Particles | Shadows / post |
|---|---|---|---|---|
| High | up to 2 | Full shaders, transmission, bloom | 100% | On |
| Medium | 1.5 | Simplified materials, light bloom | 50% | Off or baked |
| Low | 1 | Matte materials, no post | 15% | Off |
| Fallback | n/a | Static designed hero, no canvas | 0 | n/a |

Tell the user which tier is active only in a debug overlay, never in the UI.

## 4. Input adaptation

- **Touch**: Replace cursor effects and hover tilts with drag-to-rotate and tap states. Touch targets 44x44px minimum. Controls in thumb reach. Do not hijack vertical scroll with the canvas.
- **Mouse**: Parallax, magnetic buttons, custom cursor, hover reveals.
- **Keyboard**: Every control reachable and visible on focus. Provide section jump keys or a skip link.
- **Device tilt** (optional, mobile): Gyro parallax with permission handling and a graceful off state.
- **Scroll feel**: Lenis on desktop and touch can feel different. Test `syncTouch` behavior and keep native momentum on touch if the glide feels laggy.

## 5. Layout adaptation

- Single column on mobile, asymmetric multi-column on desktop. Use CSS Grid, `clamp()`, and container queries.
- Display type scales fluidly but never drops below readable sizes. Keep body text at 16px or larger on mobile.
- Keep a consistent information architecture across devices. Same content order, adapted presentation.
- Respect safe areas (`env(safe-area-inset-*)`) for notched phones.
- Wide content (tables, code) scrolls inside its own container.

## 6. Other contexts

- **Reduced motion**: Replace the scroll film with a static scene or a slow idle drift. Remove parallax, cursor effects, and large camera moves.
- **No WebGL**: Show a designed fallback hero (CSS gradient, inline SVG, or pre-rendered still) with all content intact.
- **Print**: Hide the canvas, expand collapsed content, show URLs, use black on white.
- **Low bandwidth / Save-Data**: Skip optional effects and heavy procedural textures.
- **Email / social share**: Provide an `og:image` still of the hero.

**NEVER**:
- Ship the desktop camera path to mobile unchanged.
- Hide core functionality on small screens. Adapt it.
- Assume the user's GPU is powerful.
- Use blind breakpoints. Break where the composition breaks.
- Forget landscape on phones and tablets.
- Let the canvas block scroll or taps on touch devices.

## 7. Verify

- Test on a real mid-range phone, a real low-end laptop, and a high-DPI desktop.
- Test portrait, landscape, rotate mid-scroll, and resize live.
- Test touch, mouse, and keyboard-only.
- Test reduced motion on, WebGL disabled, and a throttled CPU.
- Confirm the hero is framed, readable, and responsive to input in every case.
