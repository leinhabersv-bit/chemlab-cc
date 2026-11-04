# Takeover audit — 4 November 2026

## Reproducible baseline

Original ZIP preserved. Extracted Git tree was clean; implementation branch: `implementation/edta-vertical-slice`. Next 15.5.29 / React 19 from installed dependencies; package ranges Next ^15.2.1 / React ^19. No Three.js dependency. Baseline: 13 Vitest tests pass; TypeScript passes. These checks do not establish procedural validity. Live Chromium desktop capture is supplied separately. HANDOFF.md is absent. The separately supplied 51-page manual is byte-identical to reference/LAB_MANUAL_SCOPE_V3.0.pdf.

## Findings grounded in source

* `water-fsm.ts`, HARDNESS_RECORD_TRIAL: no endpoint guard; any two trials select the latest reading without numerical comparison.
* HARDNESS_DISPENSE_EDTA caps the reading at 50 but adds the uncapped quantity to the flask; negative/nonfinite payloads are unchecked.
* Default PRNG is shared mutable state; mode switching consumes it inside the reducer. Same initial seed is not enough for reproducibility.
* `DemoController.tsx` describes 2 mL buffer / 2 drops, dispatches 5 mL / 3 drops, dispenses 16.8 mL and claims an unrelated 420 ppm result. Play also executes a step before the timer repeats it.
* `LabBench.tsx` owns pipette contents separately from chemistry; reagent buttons bypass aspiration. It dispatches HARDNESS_TOGGLE_STIRRER without a reducer case.
* `tests/experiment1.spec.ts` dispenses only 2.05 mL before recording. Existing unit tests similarly omit concordance and overshoot rejection.
* Desktop apparatus is taller than the central view; flask and action controls are below the visible region. Three competing panels dominate the experiment.
* Chloride reducer exposes hidden equivalence after 16 mL rather than fitting measurements. Sulfate unknown uses hidden calibration constants. Instrument calibration and stabilization need dedicated models.
* Experiments 2–10 route to informational ExperimentShell, not playable workflows. A second older hardness implementation owns independent chemistry in component state.

## First-slice architecture decision

New EDTA core owns finite reagent stocks, typed physical commands, volume/mass accounting, preparation, flow, observations and accepted trials. Renderer derives liquid state from the core. Demonstration issues the same commands, guided by observable colour. SVG provides a responsive accessible scene without a new dependency or WebGL requirement; this is a 2D renderer, not a claim of photorealistic 3D. Existing later activities are retained as legacy work pending their own gates.

## Scientific reference and model limits

Primary: manual PDF physical pages 4–6 (printed 15–17): 20 mL aliquots, 1 mg/mL CaCO3 standard, 3–5 mL buffer, three EBT drops, red-to-blue endpoint, repeated concordant titres, V2/V1 × 1000. Unknown's 'test tube full' is ambiguous; use 4 mL as the explicit teaching convention shared with standardization.

Independent check: EPA-hosted Method 130.2 SOP, physical pages 7–9, https://www.epa.gov/sites/default/files/2017-11/documents/vol2-appendixa-1_a-20.pdf supports pH 10, red-to-blue EBT response and slowing to drops near endpoint. Its EDTA is labelled 0.02 N, illustrating the manual's normality ambiguity: approximately 0.01 mol/L EDTA binds metal ions 1:1 and corresponds to approximately 1 mg CaCO3/mL; on a divalent equivalent basis that is approximately 0.02 N. Do not silently interpret the manual's 0.01 N as 0.01 M. The model uses explicit CaCO3 binding capacity in mg/mL, established experimentally by standardization. V1=20 and V2=8.4 are a configurable validation fixture only.

Colour is a qualitative teaching approximation, not a thermodynamic spectrum. A 0.10 mL concordance tolerance and 0.10 mL endpoint excess limit are explicit configurable teaching policies, not claimed manual values. Buffer produces the intended pH condition; no acid-base equilibrium solver or real measurement uncertainty is claimed. All readings are simulated.

## Follow-up scientific audit items

For sulfate, 3.5 mL of 1420 mg/L stock diluted to 100 mL gives 49.7 mg/L on the stock's stated basis. If that basis is Na2SO4 mass, sulfate-ion mass is only about 0.676 times that value. Resolve whether the manual's standards are labelled as salt or sulfate before implementing calibration. Do not silently use 50–250 ppm sulfate with a Na2SO4-basis stock. Unknown dilution bookkeeping also needs an explicit procedure.

For chloride, the manual's statement that sodium is replaced by silver is misleading: Ag+ precipitates Cl-; Na+ remains a spectator and nitrate accumulates. The next module must fit the collected conductivity branches rather than expose the hidden model equivalence.

## Dependency repair

Clean baseline installation reported six advisories. Unused Zod was removed; Vitest was upgraded from 3.2.7 to 5.1.0 after registry engine/peer checks against Node 24; PostCSS 8.5.32 is shared through a root override. Next/React were not upgraded to new major versions. The final npm registry audit reported zero vulnerabilities. Build and scientific tests were rerun after the changes.
