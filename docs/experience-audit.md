# CHEMLAB CC — Comprehensive Experience & Simulation Audit
**Audit Date:** 2026-11-04  
**Auditor:** Principal Scientific Simulation Architect, Product Designer & QA Lead  
**Scope:** Architecture, UI/UX, Simulation State Engine, Apparatus Fidelity, Scientific Consistency, and Responsive Layouts

---

## 1. Executive Summary

While Phase 1 established a working Next.js foundation, verified unit calculations, and mapped all 51 manual pages, the student experience retains significant SaaS template artifacts:
1. **Disconnected Apparatus**: The burette and conical flask sit in isolated container cards instead of an integrated, physical workbench stand. Dispensing titrant is triggered by discrete button clicks rather than continuous physical stopcock manipulation.
2. **Tab-Heavy Fragmentation**: The interface divides the laboratory into rigid top-level tabs (`Learn`, `Demo`, `Practice`, `Calculations`, `Review`) and subpart pills (`Part A` through `Part E`). Students spend cognitive effort switching tabs rather than performing chemistry.
3. **Information Dumping vs Contextual Discovery**: Theory, 51-page syllabus references, and reaction equations are presented as text walls instead of unfolding contextually in a reagent/reaction inspector when actions take place.
4. **Scattered Simulation State**: Each subpart (`PartAHardnessSim`, `PartBChlorideSim`, etc.) manages isolated `useState` hooks, lacking a centralized authoritative State Machine that enforces physical causality, procedural validity, and reversible history.
5. **Observation Disconnection**: Observation tables exist as standard HTML tables beside the apparatus rather than a tactile, live laboratory notebook that records real measurements with student annotations and error flags.
6. **Mobile Layout Constraints**: On mobile screens (390px), stacking the burette and flask vertically forces the student to scroll continuously between the stopcock and the flask color, breaking the essential visual feedback loop of titration.

---

## 2. Interaction & Visual Defects Identified

| Area | Observed Defect | Root Cause | Architectural Solution |
|---|---|---|---|
| **Bench & Spatial Layout** | Burette and flask rendered in separate cards with independent backgrounds and borders. | Card-based SaaS grid layout. | Unified Laboratory Workbench stage: realistic support stand holding burette directly above the magnetic stirrer and conical flask. |
| **Burette Control** | Dispensing requires clicking discrete "+0.05 mL" or "+1.0 mL" buttons. Stopcock is a static 90° toggle. | Lack of continuous pointer/touch drag controller. | Dual-mode stopcock: hold-to-dispense, fine-turn slider, and realistic continuous liquid stream linking jet tip to flask. |
| **Flask Reaction Rendering** | Color jumps abruptly across 3 fixed CSS colors without dynamic vortex or liquid volume rising smoothly. | Discrete color stepping in `getFlaskColor`. | Continuous color interpolation engine with liquid level rising dynamically, magnetic stir vortex, and clouding/precipitate suspension shaders. |
| **Conductometry (Part B)** | Beaker is detached from burette; user presses "Add 1 mL" without seeing titrant drop into the beaker or AgCl precipitate clouding. | Separate display card without spatial link. | Integrated precipitation bench: burette dispensing AgNO3 directly into conductivity beaker containing Pt electrode and magnetic stir bar. |
| **Nephelometry (Part C)** | Cuvettes selected via button grid instead of picking from a tube rack and inserting into the optical well. | Abstract selection UI. | Interactive Glassware Rack: student drags or selects cuvette, lowers well lid, and adjusts zero potentiometer physically. |
| **pH Measurement (Part E)** | Buffer calibration is a row of 3 buttons rather than an interactive rinsing and immersion protocol. | Shortcut buttons. | Three-beaker calibration station: rinse bottle, standard buffer beakers (4.01, 7.00, 9.20), and sample beaker with electrode arm lowering animation. |
| **Contextual Chemistry** | Equations are isolated in the Learn tab; students cannot see the molecular mechanism while watching the color change. | Separation of presentation from simulation. | Active Reaction HUD: displays real-time chemical reaction progress, species concentrations ([Ca2+], [Ca-EDTA], free [EBT]), and stoichiometric tips. |
| **Observation Notebook** | Static HTML table in right column crowding the workspace. | Desktop-centric split layout. | Dockable / Collapsible Laboratory Notebook drawer at the bottom with live ink entries, exportable observation sheets, and tolerance feedback. |
| **Mobile Experience** | Simultaneous viewing of stopcock and meniscus impossible on 390px screens. | Vertical column flex without viewport zooming or focal framing. | Adaptive Mobile Workbench with focal camera framing: auto-pans between burette stopcock and flask base during active titration. |

---

## 3. Scientific Model & Simulation Engine Refactor Plan

1. **Authoritative Finite-State Machine (FSM)**:
   - State model: `IDLE` $\to$ `SOLUTION_PREPARATION` $\to$ `TITRANT_LOADING` $\to$ `TITRATING` $\to$ `ENDPOINT_DETECTED` $\to$ `RECORDING` $\to$ `ANALYZING`.
   - Single source of truth holding:
     - Glassware inventory and positions.
     - Solution volumes, species moles ($n_{\text{Ca}}$, $n_{\text{Mg}}$, $n_{\text{EDTA}}$, $n_{\text{EBT}}$, $n_{\text{Cl}}$, $n_{\text{Ag}}$, etc.).
     - Physical temperature ($T = 25.0^\circ\text{C}$), conductivity ($\kappa$), absorbance ($A$), turbidity ($\text{NTU}$), and potential ($E$).
     - Procedural warnings (e.g. attempting to titrate without adding buffer pH 10 or indicator).
2. **Continuous Kinetic & Stoichiometric Integrator**:
   - Time-delta numerical step: $\Delta V = \text{flowRate} \times \Delta t$.
   - Real-time thermodynamic equilibrium calculation for chelation and solubility products ($K_{\text{sp}}(\text{AgCl}) = 1.8 \times 10^{-10}$, $K_{\text{sp}}(\text{BaSO}_4) = 1.1 \times 10^{-10}$).
3. **Progressive Contextual Teaching System**:
   - Replace wall-of-text tabs with an unobtrusive, slide-out **Inspector Panel** containing:
     - Step guidance and procedural hints.
     - Live reaction equations and ionic equilibria.
     - Apparatus specs and safety notes.
     - Formula breakdown when entering observations.
