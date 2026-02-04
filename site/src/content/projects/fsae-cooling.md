---
title: 'FSAE Cooling System — Coupled Screening Study'
year: 2026
date: '2026-08-09'
status: complete
categories: [fsae, validation]
tags: [Python, finite volume, thermal, hydraulics]
summary: 'Coupled fan, radiator, pump, and transient coolant models reject the shortlisted E3 cooling hardware before procurement or production CFD: hydraulics pass, the inverter temperature boundary fails.'
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
featured: false
order: 2
studySequence: 7
heroImage: '/images/projects/fsae-cooling/thermal-screen.svg'
---

## Result

**NO-GO: do not procure this combination as the final E3 vehicle cooling system.** The shortlisted hardware — two Boyd 6310G3 heat exchangers, two SPAL brushless fans, one Pierburg CWA150 pump — clears the hydraulic screen but cannot meet the AMK KW26 temperature boundary in the declared E3 envelope of 40 °C ambient air.

The deliverable is a defensible rejection, reached before procurement and before any production CFD budget is spent.

Vinci Eco Drive approved publication of this bounded system study on 20 August 2026. No team CAD, telemetry or unapproved hardware data appears here.

## Engineering question

Could this combination satisfy 40 °C ambient while respecting the AMK KW26 and DD5 cooling boundaries? The screen couples four models instead of sizing each component alone:

1. **Air side.** The transformed SPAL fan curve is intersected with the Boyd core resistance and an installed-system pressure factor. The nominal mapped point is **6.56 m³/min per radiator at 45.6 Pa**.
2. **Liquid side.** Pump pressure is intersected with two radiator branches, unequal motor branches, and a conservative non-radiator loss. The result is **10.03 L/min total** and **4.16 L/min through the limiting motor branch**.
3. **Thermal map.** Published radiator conductance is interpolated only inside its mapped range. Unknown KW26 loss and motor-to-liquid heat fraction stay explicit as sensitivity variables.
4. **Transient loop.** A one-dimensional finite-volume model resolves coolant advection, discrete inverter and motor heat sources, distributed radiator rejection, thermal storage, a 10 s peak, and recovery.

## Why the hardware fails

The contradiction exists before any component map is read. The E3 environment fixes radiator-inlet air at 40 °C, while the rated KW26 requirement asks for coolant no warmer than 25 °C. A passive radiator can approach ambient from above; it cannot supply coolant below ambient.

The coupled numerical result also exceeds the documented 40 °C cold-plate boundary:

- the lowest declared sensitivity case predicts **51.86 °C** at the KW26 inlet;
- the selected baseline transient settles at **59.45 °C KW26 inlet** and **63.87 °C maximum coolant**;
- the 10 s, 6 kW legacy peak reaches **68.18 °C maximum coolant**;
- the adverse fan reading loses overlap with the published transformed curve.

More radiator optimisation cannot repair a boundary-condition contradiction. The next credible branch is a two-temperature architecture: condition the KW26 loop below ambient, keep the DD5 loop separate, and add condensation, hot-side rejection, and control requirements before returning to CFD.

## Hydraulic pass, system fail

| Gate | Observed | Decision |
|---|---:|---|
| Total loop flow | 10.03 L/min | passes 10 L/min screen |
| Limiting motor branch | 4.16 L/min | passes 4 L/min screen |
| Baseline KW26 inlet | 59.45 °C | fails rated temperature boundary |
| Baseline maximum coolant | 63.87 °C | rejects passive E3 concept |
| Legacy 10 s peak | 68.18 °C maximum | retained as sensitivity, not validation |

The pump and branch network deliver plausible screening flow, yet the combined system is unacceptable. Sizing each component independently would hide this result, which is why the maps are still evaluated: they show flow capacity is not the blocker and identify which parts a corrected architecture could retain.

## How the NO-GO was reached

The study began as a conventional selection report, and the first iteration was on the document itself. The legacy draft sized hardware from rated power and catalogue prose; the rebuilt workflow replaced that with a claim register in which every decision-critical statement carries one of four statuses — verified, screened, assumption, unknown. Losses computed as rated power times a fixed efficiency were demoted to labelled assumptions: the 3.256 kW continuous and 6.0 kW peak loads survive only as sensitivity inputs.

The decisive claim was screened before any coupled run. AMK's rated KW26 condition asks for coolant at or below 25 °C; the E3 envelope fixes radiator-inlet air at 40 °C. The register recorded that contradiction as a thermodynamic boundary, so the coupled model's job was to quantify the failure, not to discover it.

Two register rows then failed by name. The radiator claim — two Boyd 6310G3 cores rejecting the E3 load — is marked *screened; failed*, with the register's closure note reading "reject current passive concept rather than procure it." The fan claim failed the same way: the nominal 6.56 m³/min operating point loses overlap with the published transformed curve under the adverse reading check. Procurement stopped at those two rows.

Replacement work continued under the same discipline. The E7 branch defined a broad two-temperature assumption envelope; E8 converted it into a public-data steady reference with named catalogue hardware. When E8 adopted the SIERRA03-0982Y3 compressor, the E7 proxy (SIERRA03-0716Y3) was superseded and retained only as historical evidence — superseded rows stay in the register rather than disappearing.

## Transient energy accounting

The 80-cell loop places inverter and motor heat at their physical positions and removes energy through the radiator cells. At the selected baseline, the model receives 3,061.53 W and rejects 3,061.43 W near steady state; 0.105 W remains in storage. The reported algebraic energy residual sits at numerical precision.

During the retained 6 kW peak, rejection is 3,595.51 W and storage rises to 2,404.49 W. The temperature increase follows an explicit energy balance rather than an imposed ramp. The peak remains a legacy sensitivity boundary because the underlying application duty is not yet closed.

## Numerical verification

The 80-cell result is checked against 20, 40, 80, and 160 cells and three time steps. The finest changes are **0.029 K for spatial refinement** and **0.018 K for time-step refinement**, both inside the 0.1 K numerical gate. The steady finite-volume solution differs from the map equation by **0.078 K**.

![Mesh and time-step sensitivity of the peak result](/images/projects/fsae-cooling/transient-convergence.svg)

The maintained source repository now runs **59 reduced-order/admission tests** and **21 OpenFOAM tests**. They defend energy balance, map interpolation, acquisition manifests, branch-flow gates, deterministic four-mesh generation, transfer checksums, mass conservation and the rule that a qualification matrix cannot become production evidence.

## Positive result: the OpenFOAM method gate passed

The passive vehicle concept failed, but one narrower CFD question succeeded. I isolated the fan/core coupling in a three-dimensional shrouded duct: a full-face fan-pressure jump, an isotropic Darcy–Forchheimer radiator zone and four systematically refined meshes. The case tests the numerical method without pretending the proxy is our sidepod.

| Mesh | Cells | Core-face flow (m³/s) | Core loss (Pa) |
|---|---:|---:|---:|
| Coarse | 7,440 | 0.143580 | 32.654 |
| Medium | 53,940 | 0.134869 | 34.961 |
| Fine | 431,520 | 0.130726 | 36.073 |
| Extra fine | 3,481,920 | 0.129484 | 36.078 |

The fine-to-extra-fine flow change is 0.95%; pressure-loss change is 0.0145%. All four meshes pass integrity, fan-curve-domain, mass-balance and settled-window gates. The extra-fine run's global mass imbalance is $1.39\times10^{-5}$% and its final-window quantity drift is $3.24\times10^{-5}$%.

![Four-grid OpenFOAM qualification of the fan/core surrogate](/images/projects/fsae-cooling/openfoam-mesh-qualification.svg)

This is the positive CFD result I can defend today: the discretisation and fan/porous-core coupling converge for the declared surrogate. It does not validate installed-vehicle airflow, heat transfer, recirculation or the rejected E3 architecture. Those claims still need frozen sidepod/duct geometry and measured boundaries.

## Architecture branches

| Branch | State | Closure evidence |
|---|---|---|
| Passive loop at rated KW26 inlet | reject | below-ambient supply is impossible |
| Passive high-inlet derating | blocked | manufacturer-approved loss and temperature limits |
| Two-temperature active system | candidate for design | real chiller map, heat leak, parasitics, condenser rejection, condensation control |
| Lower ambient/load envelope | candidate for design | approved operating envelope followed by a complete re-screen |

The active branch estimates 0.5–2.0 kW of KW26 evaporator capacity, or 1.87–4.75 kW for a combined conditioned loop. These are sizing ranges, not selected hardware. The input contract stays blocked until synchronized duty, component heat partitions, installed maps, hydraulics, electrical limits, packaging, coolant compatibility, and failure evidence are available.

## Why CFD remains gated

Detailed sidepod or duct CFD cannot repair an architecture that fails its system-level temperature boundary. Production air-path CFD starts only after one replacement branch passes the zero-dimensional/finite-volume screen and the geometry, core maps, and installation boundary conditions are frozen. The ordering protects expensive analysis from answering the wrong question: first a viable heat-rejection architecture, then CFD to improve its installed airflow and thermal margin.

## What remains deliberately unresolved

- The CWA150 curve used for screening is secondary-hosted and conservatively biased; final approval needs first-party or measured hydraulic data.
- AMK does not publish the required KW26 operating-point loss map, and the DD5 total-loss workbook does not establish coolant heat partition.
- No production external-flow or CHT claim is made without frozen sidepod and duct geometry, measured core inputs, and a passing replacement architecture.
- Solid temperatures, interfaces, material and contact resistance, condensation control, and installed vehicle correlation remain validation tasks.

## Evidence

- [Revision 2 engineering report](/documents/fsae-cooling-system-design.pdf)
- [Machine-audited evidence report](/evidence/fsae-cooling.html)
- [Evidence catalogue](/evidence/)
- Primary boundaries: AMK `PDK 205481`; component curves: Boyd 6310G3 and SPAL brushless fan catalogue

The result is intentionally bounded: a verified coolant-domain system screen and an auditable no-go decision, short of a finished race-car cooling installation.

## What I took away

The hydraulics passed and the system failed; a per-component sizing exercise would have approved the purchase. The decisive number was never computed by my model — it was a boundary condition, and the claim register forced "40 °C air cannot deliver 25 °C coolant" into the open before the coupled solver ran. I now write rejected claims into the same table as passing ones, because the row marked *screened; failed* is the sentence that stopped a procurement.
