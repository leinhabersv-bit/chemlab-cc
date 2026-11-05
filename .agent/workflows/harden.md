---
name: harden
description: Make a 3D site production-proof: WebGL context loss, no-GPU fallbacks, memory leaks, bad inputs, slow networks, i18n and RTL, accessibility, and graceful degradation.
---

Real users have weak GPUs, flaky networks, odd languages, and assistive tech. Harden the site so it never breaks in front of them.

**Prerequisite**: Load the `immersive-3d-web` skill first.

## 1. Assess

Test with extremes: very long and very short text, emoji, RTL, CJK, huge lists, no data, offline, throttled CPU and network, blocked scripts, old browsers, software rendering, background tabs, rapid resizing, fast scroll flicks, rotate mid-animation.

**CRITICAL**: A showpiece that only works on the dev machine is a demo, not a product.

## 2. 3D and WebGL resilience

- **Capability detection**: Try creating the context in `try/catch`. Check `renderer.capabilities`, max texture size, and float texture support. Pick a quality tier accordingly.
- **Context loss**: Listen for `webglcontextlost` (`preventDefault()`) and `webglcontextrestored`. Pause the loop, show a friendly status, rebuild resources on restore.
- **Fallback hero**: If WebGL fails, show a designed static hero (CSS gradient, inline SVG, or a pre-rendered image as a data URI) with all content intact and working navigation.
- **Shader compile failures**: Check `renderer.debug.onShaderError` and fall back to a basic material.
- **Memory**: `dispose()` geometries, materials, textures, render targets, and composers when removed. Remove listeners, kill GSAP tweens and ScrollTriggers, cancel animation frames, and disconnect observers on teardown.
- **Visibility**: Stop rendering when the tab is hidden or the canvas is offscreen.
- **Quality scaling**: Measure frame time. Step down pixel ratio, particle count, and passes automatically when frames drop.
- **Resize safety**: Debounced resize that updates camera, renderer, passes, and `ScrollTrigger.refresh()`.

## 3. Loading and network

- Show the HTML shell and a designed loader immediately. Build the scene after first paint.
- Handle failed CDN loads: detect missing `THREE`, `gsap`, or `Lenis` globals and degrade (no smooth scroll, no 3D) rather than throwing.
- Pin CDN versions. Keep the page self-contained where possible.
- Set explicit sizes for the canvas container to prevent layout shift.
- Respect `navigator.connection.saveData` and slow connections by skipping optional effects.

## 4. Text overflow and layout

```css
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wrap { overflow-wrap: anywhere; hyphens: auto; }
.flex-item, .grid-item { min-width: 0; }
```
- Fluid type with `clamp()`. Containers grow with content. Avoid fixed widths on text.
- Test text zoom to 200%.

## 5. Internationalization

- Budget 30 to 40% extra space for translations. Use flexible layouts.
- Logical properties (`margin-inline-start`, `padding-inline`). Mirror directional icons and, where it matters, scene composition for RTL.
- UTF-8 everywhere. Test CJK, Arabic, emoji. Make sure display fonts cover required scripts or provide fallbacks.
- `Intl.DateTimeFormat`, `Intl.NumberFormat`, `Intl.PluralRules` instead of hand-rolled formats.
- Animated type splitting must handle multi-byte characters, ligatures, and RTL (split by grapheme with `Intl.Segmenter` when available).

## 6. Errors and edge cases

- Forms: inline, specific errors. Preserve input. Prevent double submission.
- API errors: handle each status meaningfully. Retry button on network failure.
- Storage and optional APIs wrapped in `try/catch` (`localStorage`, `AudioContext`, device orientation, clipboard).
- Empty, loading, error, success, and permission states for every dynamic area.
- Isolate failures: one broken feature must not take down the page.
- Pointer and touch conflicts: ensure the canvas never traps scroll or taps.

## 7. Accessibility resilience

- Real semantic HTML underneath the canvas. All essential content in the DOM.
- Keyboard access, visible focus, skip links, logical order.
- `prefers-reduced-motion`: swap the scroll film for calm static or slow-drift. Pause autoplay and auto-advancing effects.
- `prefers-contrast` and forced colors: scrims and outlines that survive.
- Announce dynamic changes with live regions. Provide a pause control for continuous motion.
- No flashing content.

## 8. Testing

Manual: low-end device, software renderer, offline, throttled network, screen reader, keyboard only, RTL, long text, rapid input. Automated: unit tests for edge cases, E2E for critical paths, visual regression of the fallback, axe accessibility checks.

**NEVER**:
- Assume WebGL, a fast GPU, or fast network.
- Leave resources undisposed.
- Throw on a missing CDN global.
- Trust client-side validation alone.
- Use fixed widths for text.
- Block the whole interface when one piece fails.

## 9. Verify

Kill WebGL, drop the network, lose the context, flood with long text, flip to RTL, rotate and resize repeatedly, leave the tab for 10 minutes and return. The page should still look intentional and work.
