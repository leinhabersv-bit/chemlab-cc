# CHEMLAB CC — EDTA implementation

This package contains the first playable EDTA hardness slice and the original reference material. It is not a completed rebuild of all ten experiments.

## Run locally

Use Node.js 24.x and npm. The verified machine used Node 24.19.0 and npm 11.17.0.

```powershell
npm ci
npm run dev
```

Open http://localhost:3000/experiments/exp-1. The homepage is at http://localhost:3000/.

For a production build:

```powershell
npm run build
npm start
```

No API key, database, account, paid service, or WebGL support is required for this slice.

## Verify

```powershell
npm test
npm run typecheck
npx playwright install chromium
npm run build
npm run test:e2e
npm audit
```

Playwright starts the production build on port 3100. Do not run a different application on that port during verification. Tests record video and traces in `test-results/`, including four complete titrations on both desktop and emulated mobile Chromium. The browser test reads visible menisci and colour; it does not inject simulation state or hidden endpoints.

## Conduct the experiment

1. Inspect the glassware and place the flask under the burette.
2. Select the burette. Rinse with EDTA, fill to zero, clear the air bubbles into waste, and record the initial meniscus.
3. Select the pipette. Rinse with the current sample, aspirate 20 mL, and transfer to the flask. In Practice and Challenge, drag the actual pipette into the sample (Rinse, then Fill), move it above the flask, and use the tilt slider to drain. Keyboard-accessible controls remain available.
4. Select the buffer. Pour 4 mL into the flask. Select EBT and add three separate drops.
5. Inspect the flask and start the stirrer.
6. Select the burette. Open the stopcock with the slider. At violet, close it and use individual drops until steel blue.
7. Note the final meniscus. Inspect the flask, enter the reading, and record the trial.
8. Drag the flask to the waste area and tilt to empty it. Bring the wash bottle over it and tilt to rinse. Return the flask under the burette, refill/purge the burette, and repeat until the last two accepted titres agree within 0.10 mL.
9. Clean the flask, change to unknown water, recondition the pipette, and perform two more valid titrations.
10. Review the calculation and download the observation report.

Demonstration performs these same commands. It starts paused: Next step performs one physical action and waits. Why this step matters explains reagent choices and technique. Play slowly enables optional autoplay (2 seconds for ordinary actions, 4.5 seconds at key teaching moments, with slower titrant flow and drops). Practice provides optional guidance. Challenge starts with guidance hidden and reports rejected actions and final measurement error. Start new experiment resets the bench with a different reproducible sample seed. Current progress is held in memory; refreshing the page starts over. Download the report before leaving.

## Architecture

- `src/lib/simulation/edta.ts`: pure typed commands, seeded sample creation, finite stocks, transfer conservation, preparation checks, burette flow, qualitative chemical observations, trials and results.
- `src/components/laboratory/EdtaLab.tsx`: apparatus interaction, SVG scene, demo scheduling, contextual controls and report export. The renderer does not calculate its own chemical result.
- `src/components/laboratory/HandsOnBench.tsx`: movable apparatus, tilt transfers, waste and wash interactions, using the same simulation commands.
- `src/components/laboratory/edta.css`: responsive scene, touch targets and reduced-motion support. The manual bench supports mouse, touch and keyboard positioning.
- `src/app/page.tsx` and `home.css`: new entry experience and honest catalogue availability.
- `src/lib/simulation/edta.test.ts`: complete deterministic workflow and negative/conservation/replay tests.
- `tests/experiment1.spec.ts`: full standardization and unknown analysis through browser controls.
- `docs/takeover-audit.md`: baseline defects, scientific references and conventions.

The original `water-fsm.ts` also has guards for premature/overshot titres, numerical concordance, invalid transfer quantities, repeated reagents and the missing stirrer action. Legacy water activities remain at `/experiments/exp-1/legacy`; they are not scientifically validated by the new EDTA tests. Old unused prototype components remain in the source for recovery and are not the new EDTA route.

## Scientific conventions

The manual is the primary procedure: 20 mL aliquots, 1 mg/mL standard as CaCO3, 3–5 mL buffer, three EBT drops, repeated concordant readings and `(V2 / V1) * 1000` ppm. The implementation uses 4 mL buffer in both stages. Normality ambiguity and the unspecified unknown-stage 'test tube full' are documented in the audit.

The engine uses explicit mg CaCO3-equivalent per mL rather than treating the ambiguous '0.01 N' label as an exact molarity. Accepted readings establish the reported EDTA factor. The 20.00/8.40 mL = 420 ppm case exists only as a unit-test configuration. Default seed 2026 produces a different unknown sample; measured results depend on technique.

The model uses ideal stoichiometric binding and a qualitative colour transition. It does not solve acid/base equilibria, metal-specific interference, magnesium-dependent indicator behaviour, real glassware uncertainty, temperature or reaction kinetics. The 0.10 mL excess and concordance limits are explicit teaching policies, not quoted manual requirements. Two-decimal instrument readings are averaged without premature rounding; means are displayed to three decimals.

## Dependencies

Next remains 15.5.29 and React remains 19 from the lockfile. Vitest was updated to 5.1.0 after checking Node/peer compatibility. Unused Zod was removed. PostCSS 8.5.32 is pinned and applied across the dependency tree to remove the vulnerable copy nested under Next. No renderer dependency was added. See the delivered dependency audit for the final registry result; this is not a guarantee against future advisories.

## Deploy

This task did not publish, push, or change production. To deploy, use a Node.js 24 environment that supports Next.js, install with `npm ci`, build with `npm run build`, and run `npm start` behind your usual HTTPS proxy or host routing. On a managed Next.js host, use the same install/build commands and Node version. Validate the deployed URL with the full browser journey before promoting it. No old `.vercel` project binding is included in the source archive.

## Remaining scope

- Renderer is an original 2D SVG laboratory illustration, not a photorealistic 3D lab. Glide-level cinematic motion, fluid transfer animation and camera movement remain unfinished.
- Practice and Challenge support moving the flask, pipette and reagent bottles, with tilt-triggered measured transfers and rinsing. The burette stays clamped. Transfers use fixed teaching quantities; continuous free pouring and fluid physics remain outside this slice.
- Challenge feedback is basic; no achievement system, saved progression, or classroom management.
- Chloride, sulfate, EC/TDS and pH need independent measured-data models, calibration/stabilization, procedure tests and full journeys.
- Experiments 2–10 remain reference screens, not playable simulations.
- Browser evidence covers Chromium desktop and emulated mobile, not real phones, Safari, Firefox or assistive-technology certification.

Original archive and laboratory manual remain unchanged. Working branch: `implementation/edta-vertical-slice`, based on `d9deeec8ab5b3d5c4c607de5903ff8a29bb75c10`.

