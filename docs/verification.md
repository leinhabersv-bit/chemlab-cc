# Verification and delivery — 4 November 2026

## Delivered

A playable EDTA hardness slice at `/experiments/exp-1`, with apparatus preparation, conditioned pipette transfer, burette filling and tip clearing, initial/final meniscus readings, continuous stopcock flow, single drops, state-driven colour, stirring, endpoint rejection, repeated standardization, unknown analysis and report download. Demonstration uses the same engine commands. Practice includes optional hints. Challenge hides hints initially and reports technique/measurement feedback. The homepage and laboratory use a new light SVG visual design.

Original ZIP and reference PDF were preserved. Implementation branch: `implementation/edta-vertical-slice`. No commit was pushed and no deployment was performed.

## Final verification

| Check | Result | Scope |
|---|---|---|
| Unit tests | 24 passed across 4 files | Scientific functions, deterministic four-trial replay, 420 ppm fixture, transfer conservation per reagent, impossible actions, flow, overshoot, duplicate recording, concordance and legacy reducer regressions |
| Production build | Passed | Next 15.5.29, React 19, Node 24.19.0; includes TypeScript validation; 15 pages generated |
| Browser tests | 8 passed, 2.1 minutes | Full practice workflow, full demonstration, entry/challenge/keyboard checks, and pipette drag; each on 1440px desktop and 390px emulated mobile Chromium |
| Dependency audit | 0 reported vulnerabilities | Final npm audit after unused Zod removal, Vitest 5.1.0 update and PostCSS 8.5.32 override |
| Accessibility | 0 automatic WCAG A/AA violations in four initial-view scans | Homepage and initial bench, desktop/mobile; axe-core 4.14.0; some SVG contrast/ARIA checks remain marked for manual review |
| Local rendering sample | Median frame interval approximately 16.7 ms | Unthrottled local Chromium, 120 frames per initial view; not a real-device or field performance benchmark |
| Horizontal overflow | None in tested initial views and completed practice journeys | Observation table intentionally scrolls within its container on mobile |

The first browser run exposed an ambiguous test selector matching Next's route announcement and the lab warning. The selector was corrected; final runs pass. The attempted premature reading is deliberately rejected in each practice test, so those reports include one rejected action. Demonstration finishes with zero rejected actions.

The deterministic unit-test fixture uses EDTA capacity 1 mg CaCO3/mL and unknown water 0.42 mg CaCO3/mL. It yields V1 = 20.00 mL and V2 = 8.40 mL, therefore 420 ppm. The live default seed is different and is not forced to 420 ppm. Browser tests calculate their expected result from the readings actually collected.

## Evidence files

- `browser-results.json`: final eight-test machine-readable result.
- `desktop-walkthrough.webm`, `mobile-walkthrough.webm`: actual complete practice recordings.
- `browser-evidence/`: complete traces, videos, screenshots and observation reports for all final tests.
- `before-desktop.png`: live original application before implementation.
- `after-desktop.png`: completed practice in the new laboratory.
- `after-mobile.png`: completed demonstration in the new mobile laboratory.
- `home-1440.png`, `home-390.png`: new entry experience.
- `accessibility-performance.json`: measured initial-view checks and their limits.
- `dependency-audit.json`: original six-advisory audit; `dependency-audit-final.json`: final zero-advisory audit.

Playwright videos are automated browser walkthroughs, not human usability studies. The raw full-page mobile practice screenshot contains the sticky scene at the scroll position reached during report download; the standalone mobile screenshot uses the completed demonstration at the top of the page.

## Scope still incomplete

This is a verified functional EDTA delivery, not completion of the full production-quality takeover. The strict cinematic/material/interaction acceptance gate remains open: the renderer is 2D SVG, with no photorealistic 3D glass, full fluid-transfer animation or camera choreography. Glide was inspected as a reference; visual parity is not claimed.

The scientific model combines calcium/magnesium as CaCO3 equivalents and assumes conditioned buffer and ideal mixing. It does not solve full equilibrium chemistry, interference, uncertainty or kinetics. More detailed behaviour and instrument calibration must be validated before expanding the science claims.

Water activities 1B–1E remain clearly labelled legacy previews; experiments 2–10 remain reference screens. They have not passed the EDTA acceptance tests and must not be described as completed simulations. Saved progress, achievements, real-device testing and screen-reader certification remain outstanding. The project retains unused legacy prototype components for recovery; they are not the new EDTA route.

## Reference integrity

The separately supplied manual and the ZIP's reference manual are byte-identical. SHA-256:

`d04365d0e78b0eb58e2a74d838fdd4c6552359e35669214ada64a818057f66ca`

Scientific source discussion and ambiguities are in `TECHNICAL-AUDIT.md` / `docs/takeover-audit.md`. Run/deploy instructions and architecture are in `RUN-AND-SCOPE.md` / `README.md`.

## Follow-up: demonstration explanations and pacing

The demo now starts paused, with Next step as its primary control. Each press performs one engine command and waits. A contextual Why this step matters callout explains conditioning, known aliquots, buffer, EBT, mixing, endpoint technique and repeated trials. Optional Play slowly uses readable pauses; Pause demonstration cancels the pending action.

Verification after this update: production build passed; two focused browser journeys passed (desktop/mobile). They check that step mode does not advance by itself, slow autoplay advances, pause stops it, buffer/EBT explanations appear, and manual stepping completes four accepted trials. Scientific engine is unchanged. Earlier practice, unit and dependency results remain applicable; the complete eight-test suite was not rerun for this UI-only update. See demo-update-results.json and demo-explanation.png.

## Follow-up: hands-on manipulation and demo recovery � 5 November 2026

Practice and Challenge now let users drag the actual flask, pipette, sample and reagent bottles with mouse or touch. Arrow keys also move focused objects. Rinse/Fill selects conditioning or aspiration; the tilt slider transfers measured liquid after apparatus is positioned at the receiving vessel. Moving the flask off its stand closes flow and stops stirring. At waste, tilting empties it; tilting the wash bottle over it performs a separate rinse. Dirty glassware cannot receive a fresh aliquot until rinsed. The burette remains clamped; transfers use fixed teaching quantities rather than continuous fluid physics.

The demo could repeatedly attempt a rejected reading after an overshot manual trial. The shared planner now cleans and restarts that trial; an invalid automatic command pauses playback instead of looping. Restart demonstration is also available. Default Next step pacing, contextual explanations and optional Play slowly remain.

Verification: 26 unit tests passed, including the overshoot regression and dirty-flask/movement checks. Production build passed. Full practice, step demonstration and slow autoplay completed on desktop and emulated mobile Chromium; autoplay took approximately 4.5 minutes per device and ended with four accepted trials and zero rejected actions. The first run had eight passing tests and two failed manual-interaction checks: an over-strict coordinate assertion and touch scrolling interrupting drag. Both were corrected. After the final build, all four entry/manual interaction checks passed, including actual touch events for moving, conditioning, filling, pouring, discarding and washing. Autoplay was not repeated after the final touch CSS and feedback-text changes; its scheduler and science logic were unchanged.

Evidence: autoplay-full-run-results.json preserves the initial run, including its two failures; manual-controls-results.json records the final four passing checks. Corresponding traces, videos and screenshots are under browser-evidence/manual-demo-initial and browser-evidence/manual-controls-final. The earlier eight-test browser-results.json and accessibility/performance report are historical baseline evidence, not fresh audits of the new hands-on view. No deployment or Git push was performed.
