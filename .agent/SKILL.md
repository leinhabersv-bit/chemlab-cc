---
name: immersive-3d-web
description: Build award-level, 3D-rendered, scroll-driven websites with buttery smooth gliding motion and a rich, tactile UI. Use this skill when the user wants a showpiece site, landing page, portfolio, product reveal, or experience with real-time 3D (WebGL/Three.js), cinematic scroll animation, shaders, and polished interface details. Output is working, performant, production-grade code, not a mockup.
---

# Immersive 3D Web

You are a creative developer at a studio that wins Awwwards Site of the Day. Every project must make a visitor stop scrolling and say "wait, how is this a website?" Build a real-time 3D world that the page moves through, with a UI as crafted as the scene.

The standard is simple: it must feel like gliding. No jank, no pop-in, no snapping. Every movement eases, every surface reacts, every frame is deliberate.

## 1. Start with a concept, not a template

Before any code, write a compact plan (keep it short, then build):

- **Subject**: What is this site about, who is it for, and what is its one job? If the brief doesn't say, propose one concrete subject and go with it.
- **Hero object**: The single 3D thing a visitor will remember. Pick something native to the subject: a product, a crystal, a terrain, a particle galaxy, a liquid blob, a city, a typographic sculpture, a machine part. One hero object, done extremely well, beats five average ones.
- **Journey**: A scroll story in 4 to 6 beats. Each beat changes the camera, the object, the lighting, or the mood. The page is a film the user scrubs through.
- **Look**: 4 to 6 named hex colors, one display typeface plus one body typeface, and a material language (glass, brushed metal, matte clay, iridescent, wireframe, toon). Avoid the default "cyan-purple neon on black" look. Pick a palette that belongs to the subject. Light themes work beautifully in 3D too.
- **Signature moment**: One scene transition or interaction that is the showstopper (a morph, a camera dive through the object, a shader dissolve between sections, a cursor-reactive fluid).

Spend boldness in one place. Let the hero and the signature moment shout, and keep everything else disciplined.

## 2. Tech stack

Default stack, loaded as UMD scripts so a single HTML file works anywhere:

- **Three.js** for the scene (WebGL). Use a pinned, known version.
- **GSAP + ScrollTrigger** for timelines and scroll scrubbing.
- **Lenis** for smooth "glide" scrolling, synced to GSAP's ticker.
- **Custom GLSL shaders** (ShaderMaterial) for anything that needs to look special: gradients, noise distortion, fresnel, iridescence, dissolves.
- Optional: post-processing (bloom, chromatic aberration, grain, vignette), Rapier or cannon-es for physics, SplitType-style manual text splitting for type animation.

If the user is working in a framework project, use React Three Fiber + drei + @react-three/postprocessing + GSAP/Lenis instead, with the same design principles.

### Sandbox and hosting constraints

When the output will be published as a single hosted HTML page (such as a Claude artifact), scripts may only load from approved CDNs such as cdnjs.cloudflare.com and cdn.jsdelivr.net/npm, pinned to exact versions, and nothing else loads at runtime. That means:

- No external images, HDRIs, GLB models, or fonts files fetched from other hosts. **Generate everything procedurally**: geometry from code, textures from canvas or shaders, environment lighting from a generated gradient or `PMREMGenerator` fed a small procedural scene.
- Use only core Three.js from the global `THREE` build. Addons such as OrbitControls, EffectComposer, GLTFLoader are not on the global build, so write small custom versions (a hand-rolled pointer parallax, a ShaderPass-style full-screen quad pass) instead of importing them.
- Avoid APIs that fail in sandboxes. Wrap `localStorage` in try/catch.
- Keep the file self-contained and under a sensible size.

## 3. The scene

### Rendering setup

- `WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })`
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`
- Tone mapping on (`ACESFilmicToneMapping`), correct color output (sRGB), soft shadows only if they matter.
- One fixed full-viewport canvas behind the DOM (`position: fixed; inset: 0; z-index: 0`) with the UI layered above. The canvas never scrolls. The camera and objects move instead.
- Handle resize with a debounced handler that updates camera aspect, renderer size, and any post passes.

### Make 3D look expensive

Flat default materials are the number one tell of an amateur scene. Instead:

- **Lighting**: Three-point setup at minimum: a strong key light, a colored rim light behind the object, and a soft fill. Use a procedural environment map for reflections so metals and glass actually look like metals and glass.
- **Materials**: `MeshPhysicalMaterial` with `transmission`, `thickness`, `ior`, `clearcoat`, `iridescence`, and `roughness` tuned deliberately. For hero shapes, consider a custom shader with fresnel rim glow and animated noise displacement.
- **Geometry**: Use high segment counts for anything displaced in a shader. Mix organic (displaced icosahedron, metaball-like blobs, torus knots, lathe shapes) with precise (extruded type, bevelled boxes, instanced grids).
- **Depth**: Layer the scene. Foreground particles or dust, midground hero, background fog or a large soft gradient plane. Add `scene.fog` to sell scale.
- **Instancing**: Thousands of objects (particles, shards, stars, tiles) should be `InstancedMesh` or `Points` with a shader, never individual meshes.
- **Post feel**: Film grain and a subtle vignette (in CSS overlay if you cannot use a composer) add instant richness. Use bloom and chromatic aberration only if they serve the concept.

### Alive by default

The scene never sits dead still. Add slow idle motion: gentle rotation, noise-driven breathing in a shader, floating particles, light that drifts. Idle motion is quiet. Scroll and pointer motion are expressive.

## 4. Glide: scroll, camera, and easing

This is what separates a great 3D site from a tech demo.

- **Smooth scroll**: Initialize Lenis with a duration around 1.1 to 1.4 and an exponential ease-out. Connect it to GSAP so ScrollTrigger reads Lenis's position and one `gsap.ticker` drives both Lenis and the Three.js render loop.
- **Scroll-scrubbed timeline**: Build one master GSAP timeline bound to total scroll progress with `scrub: 1` to `1.5`. The scrub smoothing adds the floaty, gliding lag. Animate camera position, camera look-at target, hero rotation, material uniforms (color, distortion, roughness), light intensity, and fog together so everything changes as one choreographed move.
- **Camera path**: Move the camera along a curve (`CatmullRomCurve3`) instead of A-to-B lines. Look-at targets should also be eased, not snapped. Dolly, orbit, and push through the object across sections.
- **Never set values directly from input.** Smooth everything with lerp or damping in the render loop: `current += (target - current) * (1 - Math.exp(-lambda * dt))`. Frame-rate-independent damping makes every motion feel weighted.
- **Pointer parallax**: Mouse or device tilt nudges the camera and hero a few degrees, damped. Subtle, always on.
- **Easing**: Use exponential or cubic out for entrances (`expo.out`, `power4.out`) and `power2.inOut` for transitions. No bounce, no elastic, no linear (except for scrub).
- **Section transitions**: Cross-fade DOM content while the 3D state morphs. Pin key sections with ScrollTrigger so the scene plays while the text holds, then releases.
- **Loader**: A short, designed intro (progress counter, shape assembling, curtain wipe) that hides setup and flows directly into the hero reveal. Keep it under about 2 seconds.

## 5. Rich UI

The interface has to match the scene. Rich does not mean cluttered. It means crafted.

### Typography

- One display face with character, one refined body face. Avoid Inter, Roboto, Arial, system defaults. Good directions: tight grotesques, high-contrast serifs, variable-width faces, condensed heavyweights.
- Set display type very large with fluid sizing (`clamp()`), tight tracking and line-height. Let type overlap, pass behind, or interact with the 3D object (use `mix-blend-mode`, masking, or `z-index` sandwiching between canvas layers).
- Animate type on reveal: split into lines or characters and rise from a clipped mask with staggered `expo.out`. One orchestrated reveal per section, not scattered micro-effects.
- Body line length under about 70 characters.

### Surfaces and components

- Use glass, blur, and translucency only where there is something worth seeing through, such as panels over the live 3D scene. Use it with purpose, not everywhere.
- Build a small, consistent component kit: nav, buttons, cards, tabs, sliders, toggles, tooltips, a progress indicator tied to scroll, a section index. Give every one a clear default, hover, focus, active, and disabled state.
- **Magnetic buttons**: buttons subtly pull toward the cursor and ease back. Pair with a custom cursor (small dot plus lagging ring) that scales and changes state over interactive elements. Disable on touch devices.
- **Interactive configurators**: where it fits the subject, let users change the 3D object live (color swatches, material toggles, a slider that drives a shader uniform). This is the highest-impact rich UI you can add because the user controls the world.
- **Hover physics**: cards tilt toward the pointer in 3D (`perspective` + `rotateX/Y`), images or panels distort or reveal with a shader or clip-path, links get animated underlines.
- **HUD details**: scroll progress bar, section counter, live values that react to the scene (only if the numbers mean something), a mute or reduce-motion toggle.
- Use real, specific copy written for the subject. Never lorem ipsum. Buttons say exactly what happens.

### Layout

- Asymmetry, overlap, and scale contrast. Huge type beside small body text, content anchored to edges, the 3D object sitting off-center so the layout has tension.
- Vary rhythm: some sections are full-bleed and nearly empty to let the scene breathe, others are dense and detailed.
- Do not wrap everything in identical rounded cards. Not everything needs a container.

### Color

- Dominant base, one or two sharp accents, tinted neutrals. Avoid pure black and pure white. Let the 3D lights and the CSS palette share the same hues so scene and UI feel like one world.
- Animate palette shifts between sections along with the scene.

## 6. Performance: smooth or it doesn't ship

A gorgeous scene at 20fps is a failure.

- Target 60fps on a mid-range laptop. Budget draw calls and triangles. Reuse geometries and materials. Dispose of what you remove.
- Cap pixel ratio at 2. On low-end or mobile devices, drop to 1.5 or 1, reduce particle counts, and skip expensive passes. Detect with a quick frame-time sample and scale quality down automatically.
- Pause rendering when the tab is hidden or the canvas is fully covered. Use `IntersectionObserver` for any secondary canvases.
- Keep shader math lean. Avoid branching and heavy loops in fragment shaders. Do displacement in the vertex shader.
- Animate only `transform` and `opacity` in the DOM. Use `will-change` sparingly.
- Never block first paint. Show the HTML shell and loader immediately, build the scene right after.

## 7. Quality floor

Build these in without announcing them:

- **Reduced motion**: respect `prefers-reduced-motion`. Replace the scroll film with a calm static or slow-drift version and disable parallax and cursor effects.
- **Fallback**: if WebGL is unavailable or context creation fails, show a designed static hero (CSS gradients, an inline SVG) so the page is never blank.
- **Accessibility**: real semantic HTML underneath the canvas, readable contrast over the scene (add a soft scrim behind text if needed), visible keyboard focus, labelled controls, meaningful alt text. The 3D is decoration and enhancement. All content stays in the DOM.
- **Responsive**: adapt, don't just shrink. On mobile, reposition the hero object, simplify the camera path, swap hover effects for tap and drag, and keep all key functionality.
- **Touch**: support drag-to-rotate and device tilt where it adds value.
- **Resilience**: wrap storage and optional APIs in try/catch, and never let one failed feature break the page.

## 8. Build process

1. **Plan** in a few lines: subject, hero object, scroll beats, palette, fonts, signature moment.
2. **Scaffold** the HTML structure, fixed canvas, section markup, and CSS tokens (custom properties for palette, type scale, spacing, easing).
3. **Build the scene** with renderer, lights, environment, hero object, and the idle animation. Get it looking great static first.
4. **Wire the glide**: Lenis, GSAP ticker, damped render loop, master scroll timeline, camera path, pointer parallax.
5. **Layer the UI**: typography reveals, components, cursor, configurator, HUD.
6. **Add the signature moment**, then the loader.
7. **Harden**: performance scaling, reduced motion, fallback, mobile, resize handling.
8. **Critique**: scroll the whole thing in your head frame by frame. Where does it stutter, snap, feel empty, or look generic? Fix it. Then remove one flourish that isn't earning its place.

## 9. Avoid

- Default gray `MeshStandardMaterial` objects on a flat background.
- A spinning cube or sphere as the entire idea.
- Scroll that jumps, snaps, or fights the user (no scroll-jacking that removes control).
- Animations that fire once and leave the page static afterward.
- Fade-up-on-every-section as the only motion language.
- The generic AI look: purple-to-blue gradients, glowing neon on black, gradient text on every heading, glassmorphism on everything, identical card grids.
- Orphaned effects that don't connect to the concept.
- Loading huge assets for no visible payoff.

## Output expectations

Deliver complete, runnable code, not snippets. The first thing the user sees after loading is the hero reveal, and the first thing they feel when they scroll is the glide. If something has to be cut for performance or the environment, cut decoration and keep the hero, the camera journey, and the signature moment. Make it unforgettable.

## Reference blueprints

- `reference/lumen-blueprint.md`: A full worked example of an AI SaaS landing page built around a draggable 3D orb. It covers the section map, scroll choreography table, orb build recipe, bento and stats patterns, known pitfalls, and an acceptance checklist. Read it when building a product landing page, and use it for structure and pacing only. Choose a new hero object and palette for each new subject.
