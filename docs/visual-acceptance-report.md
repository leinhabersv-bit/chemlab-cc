# CHEMLAB CC — VISUAL ACCEPTANCE COMPARISON REPORT
**Phase:** Complete Visual & Interactive Rebuild
**Target Branch:** `redesign/digital-lab`
**Standard:** Interactive Scientific Digital Twin

---

## 1. Executive Summary & Aesthetic Transformation

The previous design at commit `9cd0ad3` was rejected for retaining a generic SaaS dark-gradient layout, floating blur blobs, pill badges, and separate demonstration cards.

The rebuilt product experience completely dismantles the old visual language and implements the **Interactive Scientific Digital Twin** architectural standard:
- **Material Environment:** Replaced generic purple-blue gradients with warm dark-slate and black epoxy resin benchtop surfaces (`#0e1014`, `#14171d`), brushed titanium chassis, and off-white/cream enamel instrumentation panels (`#f4f2ec`, `#d6d1c2`).
- **Typography & Technical Hierarchy:** Replaced generic marketing copy with precision Swiss technical typography (JetBrains Mono and DIN-inspired Grotesk), real instrument coordinate readouts, and stoichiometric chemical equations.
- **Physical Direct Manipulation:** Added an interactive Class-A Volumetric Bulb Pipette station, tactile rotary stopcock valve, deepening fluid vortex on magnetic stirrer, and digital 7-segment LED meter readouts.
- **Unified Engine for Demonstration & Practice:** Replaced the isolated accordion `Exp1Demo.tsx` with a unified pedagogical robotic controller that runs on the **exact same** physical laboratory bench, driving the authoritative finite-state machine.

---

## 2. Six Mandatory Visual Acceptance Viewport Audits

### 2.1 Viewport 1: Homepage Desktop (1440px)
- **Before (`screenshots/before/01_homepage_1440px.png`):**
  - Dark gradient banner with glowing cyan blur blobs.
  - Floating pill badge "BCHY101P ENGINEERING CHEMISTRY LAB (2026–27)".
  - 4 generic metric cards ("10 / 10", "51 Pages", "5 Modalities", "0% Fake").
- **After (`screenshots/after/01_homepage_1440px.png`):**
  - **Scientific Atrium Telemetry Bar:** Live atmospheric sensors (101.32 kPa, 298.15 K, 48.2% RH) and facility metadata.
  - **Interactive Digital Twin Workstation Console:** A large, multi-panel instrument preview featuring an interactive schematic of Station 01 with live volumetric column, rotary stopcock, Erlenmeyer flask, and interactive stoichiometric equilibrium swatches.
  - **Zero generic gradient hero or floating metric cards.**

### 2.2 Viewport 2: Experiment Catalog Desktop (1440px)
- **Before (`screenshots/before/02_catalog_1440px.png`):**
  - Standard 3-column card grid with repetitive cyan glowing borders.
- **After (`screenshots/after/02_catalog_1440px.png`):**
  - **4 Departmental Laboratory Bays:**
    - Bay A: Environmental & Analytical Metrology (Station 01: Water Analysis)
    - Bay B: Nanomaterials & Crystal Engineering (Stations 02, 07, 08)
    - Bay C: Photovoltaic & Energy Conversion (Stations 03, 06, 10)
    - Bay D: Chemical Kinetics & Thermodynamics (Stations 04, 05, 09)
  - Modular instrument rack cards with apparatus specifications, reagent formulas, and verified manual page citations.

### 2.3 Viewport 3: Experiment 1 Practice Workbench Desktop (1440px)
- **Before (`screenshots/before/03_exp1_practice_1440px.png`):**
  - Standard slate boxes with cyan accent buttons and emoji drawer headers (`🧰`, `🔬`, `📓`).
- **After (`screenshots/after/03_exp1_practice_1440px.png`):**
  - **Integrated 3-Pane Digital Laboratory Workstation:**
    - Left: Benchtop Reagent Rack with direct-click Class-A volumetric flask (Std Hard Water), ammonia buffer dropper bottle (pH 10), and amber EBT indicator dropper.
    - Volumetric Transfer Station: Class-A bulb pipette with rubber filler bulb, rising meniscus, calibration ring mark, and drop delivery into flask.
    - Center Stage: Physical laboratory bench with retort stand holding a 50 mL Class-A burette with fluid meniscus and tactile rotary stopcock valve, and 250 mL flask on heavy-duty magnetic stirrer with fluid vortex and continuous stoichiometric color transition (wine red to steel blue).
    - Right: Real-time Contextual Chemical Inspector with live ionic dissociation HUD (`[Ca-EBT]²⁺ → [Ca-EDTA]²⁻`), plus Benchtop Live Curve Telemetry Oscilloscope plotting real-time sigmoidal $p\text{Ca}$ curve with tracking marker dot.
    - Bottom: Hardcover graph-paper laboratory logbook with concordant trials, calibration plots, calculation grader, and BIS water quality report.
    - Offline Web Audio API Synthesizer: Zero-network procedural audio feedback for glass clinks, bulb suction, drop impacts, 65 Hz stirrer hum, stopcock valve clicks, and digital meter beeps.

### 2.4 Viewport 4: Experiment 1 Demonstration Workbench Desktop (1440px)
- **Before (`screenshots/before/04_exp1_demo_1440px.png`):**
  - Replaced the workbench with a separate 5-step accordion list card (`Exp1Demo.tsx`).
- **After (`screenshots/after/04_exp1_demo_1440px.png`):**
  - **Unified Workbench Engine:** Demonstration runs on the **exact same** 3D/SVG laboratory bench as Practice!
  - Features an Automated Guided Demonstration Control Deck with timeline scrubber, Step indicator, Play/Pause/Prev/Next controls, 1x/2x speed toggle, and contextual pedagogical callout boxes pointing to the active physical apparatus.

### 2.5 Viewport 5: Homepage Mobile (390px)
- **Before (`screenshots/before/05_homepage_mobile_390px.png`):**
  - Stacked SaaS cards with truncated gradient text.
- **After (`screenshots/after/05_homepage_mobile_390px.png`):**
  - Calibrated mobile laboratory console with responsive atmospheric status, compact workstation preview with touch-friendly modality switches, and clearly grouped departmental bays.

### 2.6 Viewport 6: Laboratory Mobile (390px)
- **Before (`screenshots/before/06_laboratory_mobile_390px.png`):**
  - Drawer overlap and pointer interception conflicts on small screens.
- **After (`screenshots/after/06_laboratory_mobile_390px.png`):**
  - Absolute sliding drawer architecture with zero pointer event collisions.
  - Dedicated mobile navigation bar allowing students to seamlessly toggle between the physical bench, reagents drawer, contextual inspector, and observation notebook.

---

## 3. Verification Summary

1. **TypeScript Verification (`tsc --noEmit`):**
   - Result: `0 errors`
2. **Unit & Scientific Calculation Test Suite (`vitest run`):**
   - Result: `13 / 13 tests passed`
3. **Next.js Production Build (`next build`):**
   - Result: `14 / 14 static pages compiled successfully` (○ Static: 2, ● SSG: 12)
4. **Playwright Multi-Viewport Test Suite (`npx playwright test`):**
   - Result: `6 / 6 tests passed (19.0s)`
     - Desktop Chrome (1440px): 2 passed
     - Tablet (768px): 2 passed
     - Mobile (390px): 2 passed
5. **Visual Evidence:**
   - Saved 12 comparative screenshots in `screenshots/before/` and `screenshots/after/`.

