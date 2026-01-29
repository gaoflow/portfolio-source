---
title: 'XC48 Tensile Twin — Experiment to Abaqus Explicit'
year: 2026
date: '2026-03'
status: complete
categories: [validation, design]
tags: [Abaqus, Dynamic Explicit, tensile test, XC48 steel, ductile damage, Python]
summary: 'A group XC48 tensile test rebuilt as an Abaqus Dynamic Explicit digital twin reaching R²=0.9663 against the measured curve — with the modulus anomaly and the mesh-study upset left in plain sight.'
methodLine: 'Tensile test · engineering→true conversion · Abaqus Explicit · mesh/solver/amplitude sensitivity'
role: 'Data post-processing & report toolchain'
team: 'ESILV MMN1 group — Nicolas Chang, Bing Gao, Sabin Karn, Nithor Bhowmik'
duration: '8 weeks'
heroMetrics:
  - { label: 'Twin vs test R²', value: '0.9663' }
  - { label: 'Engineering UTS', value: '766.12 MPa' }
  - { label: 'Necking area reduction', value: '47.8%' }
  - { label: 'Explicit run', value: '71,965 incr / 77 s' }
keyOutputs:
  - 'Built the data pipeline from raw machine output to the Abaqus material card: engineering → true → plastic stress-strain, in pandas.'
  - 'Ranked four meshes, two solvers, and three loading amplitudes by R² against the experiment; the mid-density M2 mesh won at 0.9663.'
  - 'Showed Static General stalls on the softening branch while Dynamic Explicit with Smooth Step loading follows necking to rupture, with ALLKE/ALLIE under 5% before fracture.'
  - 'Kept the measured 12.28 GPa modulus as-is and documented it as a machine-compliance artifact rather than calibrating it away.'
featured: false
sample: false
order: 19
studySequence: 11
heroImage: /images/projects/xc48-abaqus-twin/stress-strain.svg
---

## Context & objective

A tensile test on XC48 medium-carbon steel became a validated digital twin: the final Abaqus configuration — M2 mesh, Dynamic Explicit, Smooth Step loading — reproduces the measured stress–strain curve at $R^2 = 0.9663$ and follows the specimen through necking to rupture. The sensitivity study behind that number also produced a result worth keeping: the mid-density mesh beat the finest one, and the implicit solver never finished the job.

The group ran the physical test and built the Abaqus models. My part was the data side: the Python pipeline from raw machine output to the material card, the post-processing of the simulation ODB, and the report toolchain. The physical test was run once, on one specimen, in the ESILV mechanics lab (MMN1, March 2026).

## From machine output to a material card

The machine logged 1,129 points over 112.7 s: time, crosshead displacement, force (peak 38.41 kN). The pipeline converts that record in three steps:

1. **Engineering:** $\varepsilon = \Delta L / L_0$, $\sigma = F / A_0$.
2. **True:** $\varepsilon_t = \ln(1+\varepsilon)$, $\sigma_t = \sigma(1+\varepsilon)$, valid until necking localises.
3. **Plastic table:** subtract the elastic strain and hand Abaqus the $(\sigma_t, \varepsilon_{pl})$ pairs.

The geometry that matters is the reduced section: gauge length $l_0 = 70$ mm and $S_0 = 50.14$ mm² (Ø7.99 mm), from the test spreadsheet. The report's geometry section prints $L_0 = 114.23$ mm; that is the specimen's overall length, and using it for strain contradicts the spreadsheet and the plotted curves, so the pipeline uses 70 mm. An earlier pass of my own script ran with placeholder geometry (Ø10 mm, 50 mm) and reported a 489 MPa UTS — wrong by the area ratio, and a good lesson in where stress–strain numbers actually come from.

![Engineering vs true stress–strain, regenerated from the test data](/images/projects/xc48-abaqus-twin/stress-strain.svg)

## Measured behaviour

| Quantity | Value | Note |
|---|---:|---|
| Young's modulus $E$ | 12.28 GPa | as measured; see the anomaly below |
| Yield $\sigma_y$ (0.2% offset) | 758.33 MPa | printed as "7583" in the report — a typo |
| Engineering UTS | 766.12 MPa | at $\varepsilon = 7.6\%$ |
| True peak stress | 828.4 MPa | at $\varepsilon_t = 8.2\%$ |
| Breaking strength | 557.80 MPa | just before the final load drop |
| Fracture strain | 13.4% | engineering |
| Necking | Ø7.99 → 5.77 mm | 47.8% area reduction, ductile range |

UTS sits 9.5% above the 700 MPa handbook value and the area reduction lands in the 40–50% ductile band, so the strength numbers are believable. The curve reads as a normal ductile steel: proportional limit near 730 MPa, plastic flow from $\varepsilon \approx 0.06$, uniform hardening up to the peak at 7.6%, then the load drops as the neck localises and the specimen separates at 13.4%. The modulus is not believable: 12.28 GPa against a textbook 210 GPa for steel. The strain came from crosshead displacement, so machine and grip compliance swamp the specimen's elastic strain, and the reported $E$ is mostly a property of the test rig. We kept it as measured — the twin below inherits it, and the limitations section prices that in.

## The digital twin

The Abaqus model is the specimen itself: C3D4 tetrahedra over the full dog-bone, one end encastred, the other pulled 15 mm over a 1 s step. The material card is the measured curve, not a handbook law: $E = 12{,}283.5$ MPa, $\nu = 0.3$, plasticity starting at 826.9 MPa true, ductile damage initiation at $\bar\varepsilon_{pl} = 0.0821$ and triaxiality 0.333 — exactly the true strain at the measured peak — with displacement-based damage evolution over 0.5 mm and element deletion to separate the specimen.

Three design choices decided whether this twin matched the test, so we swept each one. Post-processing was the other half of the toolchain: the job wrote 200 field-output frames, and an `odbAccess` script walks them, selects the gauge-section elements (z from 22.54 to 92.54 mm in the model), integrates reaction force over the end set, and writes engineering and true stress–strain CSVs for the validation plots.

One geometry note from that script: the modelled gauge radius is 3.838 mm (from node coordinates) against 3.995 mm on the physical specimen — about 8% less cross-section in the twin. The peak still lands within 1%, so the mismatch is real but not dominant.

## Sensitivity: the middle mesh won

| Mesh | Elements | $R^2$ vs experiment | Behaviour |
|---|---:|---:|---|
| Baseline ("Optimal") | max nodes, Learning Edition | 0.9308 | no softening; keeps hardening past the peak |
| M1 | < 1,000 | 0.9653 | pointy fracture tips, strain trapped in few elements |
| M2 | ≈ 2,000 | **0.9663** | captures necking onset and the post-peak drop |
| M3 | ≈ 3,000 | 0.9497 | over-localisation, slowest stable increment |

M2 wins because it resolves the neck without forcing deformation into distorted elements. M3's regression is small but real, and it cost the lowest stable time increment of the three. The baseline's last place is the instructive part: a mesh with no damage-driven softening cannot fit a curve whose second half is defined by it.

![R² comparison of the four mesh configurations (group-report figure)](/images/projects/xc48-abaqus-twin/mesh-r2-comparison.png)

## Sensitivity: why Explicit beat Static

Static General solves $\mathbf{K}\mathbf{u} = \mathbf{F}$ iteratively; once necking and damage make the stiffness matrix negative, Newton–Raphson has nothing to converge to. That is what the run did: the static curve plateaus near 795 MPa true and ends around $\varepsilon_t \approx 0.13$, never following the experimental softening branch ($R^2 = 0.9595$). Dynamic Explicit marches $\mathbf{M}\ddot{\mathbf{u}} = \mathbf{F} - \mathbf{F}^{int}$ forward with no matrix inversion, so it stays stable through element deletion and reaches full separation ($R^2 = 0.9653$ in the solver-only comparison). The physical test is quasi-static, but the instability at rupture is exactly the regime where the implicit assumption breaks.

## Sensitivity: loading amplitude and the energy gate

An Explicit quasi-static run is only honest if inertia stays negligible, so the gate was ALLKE under 5% of ALLIE during loading. Smooth Step (fifth-order, zero velocity and acceleration at both ends) passes: kinetic energy stays at zero until fracture at $t \approx 0.45$, where a sharp ALLKE spike and ALLIE drop mark the elastic energy release — physical, not noise.

| Amplitude | Rupture time | Energy behaviour | Verdict |
|---|---:|---|---|
| Smooth Step | $t \approx 0.45$ | ALLKE ≈ 0 while loading, spike at fracture | quasi-static, passes the gate |
| Ramp (tabular) | $t \approx 0.41$ | $t=0$ impulse, inertial oscillations | premature failure |
| Step (brutal, 10% of step) | immediate | ALLKE dominates from increment one | impact test, invalid |

A brutal step that applies the full 15 mm in the first 10% of the step no longer measures the material: internal energy peaks almost instantly and both energies ring at high frequency. The gate exists because "the solver finished" says nothing about whether the run was quasi-static.

## Final validation

M2 + Dynamic Explicit + Smooth Step: $R^2 = 0.9663$ against the experiment, peak stress ≈ 820 MPa true against 828 measured (about 1% low), correct post-peak softening and rupture. The .sta file records 71,965 increments at a 13.8 µs stable increment (semi-automatic mass scaling at 10 µs) in 77 s of wall time — cheap enough to iterate, which is the point of a twin. The simulation runs slightly stiffer than the test in the final fracture phase, the one visible deviation.

![M2 deformed shape at fracture, showing the necked section (group-report figure)](/images/projects/xc48-abaqus-twin/m2-necking-deformed.png)

## Limitations

- **The modulus is a rig property.** Feeding $E = 12.28$ GPa makes the twin match the measured elastic slope, but that slope is machine compliance, so part of the 0.9663 fit is agreement on an artifact. The plastic regime is where the validation means something.
- **One specimen, one test.** No repeats, no scatter band; the damage parameters were calibrated to this same curve, so "validated" covers one geometry at one loading rate.
- **Learning Edition ceiling.** The node cap put M3 (~3,000 elements, linear C3D4 tets) at the top of the mesh range; convergence past that is untested.
- **Missing fractography.** The report's fracture-photo slots ended up holding spreadsheet screenshots, so the cup-and-cone claim rests on the measured 47.8% area reduction and the simulated neck, not on surface images.

## Reproduce

The experiment side lives in `research/esilv-materials/plot_stress_strain.py`: it reads the pipeline CSV, applies the spreadsheet geometry ($l_0 = 70$ mm, $S_0 = 50.14$ mm²), and regenerates the hero figure — printing UTS 766.12 MPa, true peak 828.4 MPa, and fracture strain 13.4% as a check. The simulation side is the group Abaqus job (`copy27`): the input deck carries the full material card and Smooth Step setup, and a small `odbAccess` script pulls frame-by-frame stress–strain from the ODB for the validation plot.
