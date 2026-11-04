# CHEMLAB CC — REDESIGN SPECIFICATION & ARCHITECTURAL BLUEPRINT
**Visual Concept: Interactive Scientific Digital Twin**
**Document Version:** 4.0 (Autonomous Complete Experience Rebuild)
**Status:** Approved for Implementation

---

## 1. Comparative Analysis: Current Rejected vs. New Digital Twin

| Dimension | Rejected Design (Commit `9cd0ad3`) | Approved Redesign (Digital Twin Laboratory) |
| :--- | :--- | :--- |
| **Aesthetic Direction** | Generic SaaS dark theme with purple/cyan gradients, floating blur blobs, pill badges | High-precision scientific instrumentation (Mettler Toledo / Bruker / Keysight aesthetic); warm slate/epoxy benchtop, anodized aluminum chassis, precision silk-screened enamel |
| **Homepage Layout** | Standard SaaS hero + 4 stats cards + 3-column card grid with cyan glowing borders | Central Laboratory Atrium: Live atmospheric telemetry (298.15 K, 101.3 kPa), Interactive Workbench Blueprint Console, Station Bay Matrix organized by physical lab departments |
| **Apparatus Interaction** | Abstract side-panel buttons ("+0.05 mL", "Add Buffer") triggering state without physical contact | Direct physical apparatus interaction: pick up volumetric pipette, fill from reagent reservoir, transfer to flask; tactile rotary stopcock valve with hold-to-stream; stirrer RPM dial with vortex physics |
| **Demonstration Architecture** | Separate `Exp1Demo.tsx` accordion cards disconnected from the physical bench | **Unified Engine**: Practice and Demo run on the EXACT SAME interactive 3D/SVG laboratory bench. Demo automates apparatus motions with timeline scrub, step forward/back, and contextual callouts |
| **Instrument Displays** | Generic text in side panels | Physically rendered benchtop meters: 7-segment green LED conductometer, optical cuvette nephelometer chamber, benchtop pH meter with glass electrode and BNC cable |
| **Chemistry Integration** | Static text accordion buried at the bottom | Dynamic reaction HUD: live ionic equilibrium shifts ($[Ca\text{-}EBT]^{2+} \to [Ca\text{-}EDTA]^{2-}$), pCa/pMg dissociation curve, stoichiometry tracker updating with every droplet |
| **Observation Notebook** | Standard floating bottom sheet | Authentic bound laboratory notebook with graph-paper grid styling, concordance validation, linear calibration curve fitting, and BIS 10500:2012 compliance certificate |
| **Non-implemented Experiments** | Generic placeholder text or identical cards | High-fidelity station specifications: apparatus manifests, XRD/kinetic blueprints, stoichiometric reaction schemes, manual page citations, clearly flagged as "Station In Preparation" |

---

## 2. Design System Tokens & Material Palette

### 2.1 Surfaces & Depths
- **Laboratory Benchtop:** `#131518` with subtle micro-grid alignment lines (`rgba(255,255,255,0.035)`), simulating chemical-resistant black epoxy resin.
- **Instrument Enamels:** Off-white/cream instrument faces (`#eceae4`) and anodized dark titanium frames (`#1e2126` and `#2a2e36`).
- **Glassware Glass:** Optical borosilicate 3.3 simulation: transparent refractive highlights (`rgba(255,255,255,0.22)`), deep liquid refraction, and crisp white enamel graduation marks.
- **Physical Shadows:** Layered ambient occlusion (`0 20px 40px -15px rgba(0,0,0,0.85)`).

### 2.2 Functional Instrumentation Accents
- **Digital LED / Phosphor:** `#22c55e` (Emerald 500) and `#38bdf8` (Calibrated Sky) for 7-segment numerical readouts.
- **Valve & Stopcock Controls:** Precision Instrument Amber (`#f59e0b` / `#d97706`).
- **Chemical Warning & Hazard:** Cautionary Amber/Red (`#ef4444`).
- **Equivalence Point Blue:** Steel Blue (`#2563eb` / `#3b82f6`).

---

## 3. Screen-by-Screen Transformation Blueprint

### 3.1 Global Header & Navigation (`Navbar.tsx`)
- Architectural brand identity: `CHEMLAB CC` + `VIT CHENNAI • BCHY101P`.
- Live digital telemetry widget:
  - `ATM: 101.3 kPa`
  - `TEMP: 25.0 °C`
  - `CAL: BIS 10500:2012`
- Fast station jump menu with active status indicators (Station 01 active, Stations 02–10 blueprint mode).
- Sound/haptics toggle for glass clinks and stirrer hum.

### 3.2 Homepage (`src/app/page.tsx`)
1. **Atrium Status Deck:** Atmospheric readings, syllabus compliance banner, laboratory safety protocol.
2. **Featured Digital Twin Station Console:** Large interactive workstation viewport allowing direct exploration of Station 01 apparatus before launching.
3. **The 4 Physical Laboratory Bays:**
   - **Bay 1: Environmental & Analytical Metrology** (Exp 1: Comprehensive Water Analysis)
   - **Bay 2: Nanomaterials & Crystal Engineering** (Exp 2: Eggshell HAP, Exp 7: Cu2O, Exp 8: Al-ZnO)
   - **Bay 3: Photovoltaic & Energy Systems** (Exp 3: DSSC Solar Cell, Exp 6: Mg-Saline Battery, Exp 10: Li-ion Battery SoC)
   - **Bay 4: Reaction Kinetics & Photochemistry** (Exp 4: Zn-Cu Galvanic Cell, Exp 5: Ester Hydrolysis, Exp 9: Rhodamine B Degradation)
4. **Interactive Station Specimen Cards:**
   - Physical equipment manifest.
   - Target analytes and reagents.
   - Direct launch or inspect blueprint.

### 3.3 Unified Laboratory Workspace (`LabWorkspace.tsx`)
- **Top Control Strip:** Station title, subpart switcher (Hardness, Chloride, Nephelometry, TDS, pH), Mode Switcher (**Practice** vs **Guided Demo**), Reset, and Notebook toggle.
- **Center Stage (The Physical Bench):**
  - High-resolution SVG/Canvas apparatus assembly:
    - Retort stand with adjustable double burette clamp.
    - 50 mL Class-A burette with liquid meniscus and animated stopcock valve.
    - Volumetric pipette station with pipette controller bulb for direct suction and transfer.
    - 250 mL Erlenmeyer flask on heavy-duty magnetic stirrer with adjustable RPM knob, liquid swirling vortex, and continuous RGB color interpolation.
    - Digital Benchtop Conductometer with dip cell electrode.
    - Digital Nephelometer chamber with removable optical cuvette.
    - Digital pH meter with combination glass electrode.
- **Left Apparatus Rack:** Physical glassware and reagent shelf (Standard Hard Water, EDTA, Ammonia Buffer, EBT indicator, AgNO3, BaCl2, pH buffers 4.0/7.0/9.2).
- **Right Chemical Inspector:**
  - Real-time ionic dissociation HUD ($[Ca-EBT] + EDTA \to [Ca-EDTA] + EBT$).
  - Titration curve coordinate ($V_{\text{titrant}}$ vs $p\text{Ca}$).
  - Procedural safety checks (ensures buffer added prior to indicator, stirrer running before titrating).
- **Bottom Notebook & Observations:**
  - Hardcover scientific lab book styling.
  - Concordant titration trial log with automatic concordant value selection.
  - Nephelometric standard calibration plot with linear regression ($y = mx + c$).
  - Tolerance-aware student calculation grader.
  - Official BIS 10500:2012 Drinking Water Quality Certificate report.

### 3.4 Unified Demonstration Engine
- Runs on the exact same `LabBench` component.
- Integrated playback bar at top of bench:
  - `[ ⏮ Previous Step ]` `[ ⏯ Play / Pause ]` `[ ⏭ Next Step ]` `[ 1x / 2x Speed ]`
- Automated robotic steps:
  1. Transfer 20 mL sample via volumetric pipette.
  2. Add 2 mL Ammonia buffer ($pH \approx 10$).
  3. Add 2 drops EBT indicator (wine red formed).
  4. Stream 0.01 N EDTA titrant into vortex.
  5. Slow down to micro-drops near equivalence point ($V_E \approx 16.8\,\text{mL}$).
  6. Sudden color change to clear steel blue.
  7. Log concordant titre reading into notebook.
- Floating educational pointer cards explaining the scientific phenomenon at each step.

---

## 4. Verification & Visual Acceptance Protocol
1. Rebuild all components according to this specification.
2. Execute TypeScript typecheck (`tsc --noEmit`).
3. Execute Vitest test suite (`vitest run`).
4. Execute Next.js production build (`next build`).
5. Capture and verify after-screenshots:
   - Homepage 1440px
   - Catalog 1440px
   - Exp 1 Practice 1440px
   - Exp 1 Demo 1440px
   - Mobile Homepage 390px
   - Mobile Laboratory 390px
6. Manually audit screenshots for genuine aesthetic transformation.
7. Push commit to `redesign/digital-lab`.
