---
title: 'FSAE Cooling System — Coupled Screening Study'
year: 2026
status: complete
categories: [fsae, validation]
tags: [Python, finite volume, thermal, hydraulics]
summary: 'Coupled fan, radiator, pump, and transient coolant models turned an attractive hardware shortlist into an evidence-backed no-go — before procurement or expensive CFD.'
methodLine: 'System curves · transient finite volume · numerical convergence'
role: 'Thermal Systems & Numerical Modelling'
team: 'Vinci Eco Drive — ESILV FSAE'
duration: 'Independent study'
heroMetrics:
  - label: 'Loop flow'
    value: '10.03 L/min'
  - label: 'Motor branch'
    value: '4.16 L/min'
  - label: 'Baseline KW26 inlet'
    value: '59.45 °C'
  - label: 'Decision'
    value: 'NO-GO'
keyOutputs:
  - 'Coupled air-side and liquid-side operating points'
  - '80-cell transient coolant finite-volume model'
  - '20/40/80/160-cell and time-step convergence'
  - 'Replacement-architecture decision gates'
featured: true
sample: false
order: 2
studySequence: 7
heroImage: '/images/projects/fsae-cooling/thermal-screen.svg'
---

## Engineering question

Could two Boyd 6310G3 heat exchangers, two SPAL brushless fans, and a Pierburg CWA150 satisfy the declared **E3 envelope: 40 °C ambient**, while respecting the AMK KW26 and DD5 cooling boundaries?

The useful result was not a component list. It was a defensible rejection. The passive concept meets the narrow hydraulic flow screen, but it cannot satisfy the inverter temperature boundary. That decision stops procurement and production CFD until the architecture changes.

## Model chain

The screen keeps four pieces coupled instead of sizing them independently:

1. **Air side.** The transformed SPAL fan curve is intersected with the Boyd core resistance and an installed-system pressure factor. The nominal mapped point is **6.56 m³/min per radiator at 45.6 Pa**.
2. **Liquid side.** Pump pressure is intersected with two radiator branches, unequal motor branches, and a conservative non-radiator loss. The result is **10.03 L/min total** and **4.16 L/min through the limiting motor branch**.
3. **Thermal map.** Published radiator conductance is interpolated only inside its mapped range. Unknown KW26 loss and motor-to-liquid heat fraction remain explicit sensitivity variables.
4. **Transient loop.** A one-dimensional finite-volume model resolves coolant advection, discrete inverter and motor heat sources, distributed radiator rejection, thermal storage, a 10 s peak, and recovery.


## Why the hardware fails

At 40 °C radiator-inlet air, a passive heat exchanger cannot deliver the AMK rated **≤25 °C KW26 coolant condition**. More importantly, the coupled numerical result also exceeds the documented 40 °C cold-plate boundary:

- the lowest declared sensitivity case predicts **51.86 °C** at the KW26 inlet;
- the selected baseline transient settles at **59.45 °C KW26 inlet** and **63.87 °C maximum coolant**;
- the 10 s, 6 kW legacy peak reaches **68.18 °C maximum coolant**;
- the adverse fan reading loses overlap with the published transformed curve.

The procurement verdict is therefore **NO-GO**. More radiator optimisation cannot repair a boundary-condition contradiction. The next credible branch is a two-temperature architecture: condition the KW26 loop below ambient, keep the DD5 loop separate, and add condensation, hot-side rejection, and control requirements before returning to CFD.

## Numerical verification

The 80-cell result is checked against 20, 40, 80, and 160 cells and three time steps. The finest changes are **0.029 K for spatial refinement** and **0.018 K for time-step refinement**, both inside the 0.1 K numerical gate. The steady finite-volume solution differs from the map equation by **0.078 K**.

![Mesh and time-step sensitivity of the peak result](/images/projects/fsae-cooling/transient-convergence.svg)

The repository also runs **22 zero-dimensional / finite-volume tests** and **8 OpenFOAM preflight / result-evaluation tests**. These defend energy balance, map interpolation boundaries, flow gates, transfer-package checksums, systematic mesh families, mass conservation, and the rule that a qualification matrix cannot be promoted to production evidence.

## What remains deliberately unresolved

- The CWA150 curve used for screening is secondary-hosted and conservatively biased; final approval needs first-party or measured hydraulic data.
- AMK does not publish the required KW26 operating-point loss map, and the DD5 total-loss workbook does not establish coolant heat partition.
- No production external-flow or CHT claim is made without frozen sidepod / duct geometry, measured core inputs, and a passing replacement architecture.
- Solid temperatures, interfaces, material/contact resistance, condensation control, and installed vehicle correlation remain validation tasks.

## Evidence

- [Revision 2 engineering report](/documents/fsae-cooling-system-design.pdf)
- [Machine-audited evidence report](/evidence/fsae-cooling.html)
- [Evidence catalogue](/evidence/)
- Primary boundaries: AMK `PDK 205481`; component curves: Boyd 6310G3 and SPAL brushless fan catalogue

The result is intentionally bounded: a verified coolant-domain system screen and an auditable no-go decision, not a finished race-car cooling installation.

## Requirements before components

The screening order is intentional. The E3 environment fixes radiator-inlet air at 40 °C, while the rated KW26 requirement asks for coolant no warmer than 25 °C. A passive radiator can approach ambient from above but cannot produce below-ambient coolant. That thermodynamic contradiction exists before fan, pump, or mesh optimisation.

Component maps are still evaluated because they answer a different question: whether flow capacity is also a blocker and which parts of the architecture could be retained after the temperature-level problem is corrected.

## Why hydraulic pass does not mean system pass

| Gate | Observed | Decision |
|---|---:|---|
| Total loop flow | 10.03 L/min | passes 10 L/min screen |
| Limiting motor branch | 4.16 L/min | passes 4 L/min screen |
| Baseline KW26 inlet | 59.45 °C | fails rated temperature boundary |
| Baseline maximum coolant | 63.87 °C | rejects passive E3 concept |
| Legacy 10 s peak | 68.18 °C maximum | retained as sensitivity, not validation |

The pump and branch network therefore have plausible screening flow, yet the combined system is unacceptable. Sizing each component independently would hide this result.

## Transient energy accounting

The 80-cell loop distributes inverter and motor heat at their physical positions and removes energy through the radiator cells. At the selected baseline, the model receives 3,061.53 W and rejects 3,061.43 W near steady state; only 0.105 W remains in storage. The reported algebraic energy residual is approximately numerical precision.

During the retained 6 kW peak, rejection is 3,595.51 W and storage rises to 2,404.49 W. The temperature increase is therefore tied to an explicit energy balance rather than an imposed ramp. The peak remains a legacy sensitivity boundary because the underlying application duty is not yet closed.

## Architecture branches

| Branch | State | Closure evidence |
|---|---|---|
| Passive loop at rated KW26 inlet | reject | below-ambient supply is impossible |
| Passive high-inlet derating | blocked | manufacturer-approved loss and temperature limits |
| Two-temperature active system | candidate for design | real chiller map, heat leak, parasitics, condenser rejection, condensation control |
| Lower ambient/load envelope | candidate for design | approved operating envelope followed by a complete re-screen |

The active branch estimates 0.5–2.0 kW of KW26 evaporator capacity or 1.87–4.75 kW for a combined conditioned loop, but these are sizing ranges—not selected hardware. The input contract remains blocked until synchronized duty, component heat partitions, installed maps, hydraulics, electrical limits, packaging, coolant compatibility, and failure evidence are available.

## Why CFD remains gated

Detailed sidepod or duct CFD cannot repair an architecture that fails its system-level temperature boundary. Production air-path CFD starts only after one replacement branch passes the zero-dimensional/finite-volume screen and the geometry, core maps, and installation boundary conditions are frozen.

This ordering protects expensive analysis from answering the wrong question: first establish a viable heat-rejection architecture, then use CFD to improve its installed airflow and thermal margin.
