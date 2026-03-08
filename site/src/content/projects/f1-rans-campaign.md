---
title: 'F1 RANS Pilot — 23 Variants, 9 Valid Sensitivity Results'
year: 2026
date: '2026-08-09'
status: complete
categories: [full-car, validation]
tags: [CFD]
summary: 'My 4.35M-cell OpenFOAM pilot campaign completed 23 variants and retained nine valid sensitivity results, with mesh uncertainty and two diverged roughness runs kept visible.'
role: 'Sole engineer'
duration: 'Pilot campaign complete'
featured: true
order: 21
studySequence: 18
heroImage: /images/projects/f1-rans-campaign/campaign-map.svg
---

## Result

This pilot answered the question the later topology campaign could not: can the OpenFOAM workflow run a full sensitivity programme and reject bad results automatically? Yes. The 4.35M-cell half-car baseline ran end to end; the wider campaign completed 23 variants across eight dimensions, two interaction checks and one design-loop check. The core comparison retains nine valid solutions and excludes two diverged roughness runs.

The result is a workflow and sensitivity map, not a production aerodynamic prediction. Mesh sensitivity remains large: the coarse grid moves drag by 32.2% relative to baseline and the medium grid by 7.67%. That blocks absolute coefficient claims and is the reason a 25–35M-cell production programme remains separate.

![Valid RANS sensitivity results and excluded failures in drag/downforce space](/images/projects/f1-rans-campaign/campaign-map.svg)

## What ran

The case uses public 2026-car geometry in half-car symmetry with moving ground, rotating tyre walls and component force groups for front wing, rear wing, floor, tyres and body. OpenFOAM 14 runs the steady incompressible RANS system; the retained baseline uses k-ω SST and a stable bounded transport setup.

One queue owns the full chain:

1. stage the geometry and requested variant;
2. generate or reuse the mesh;
3. decompose and run on four remote CPU ranks;
4. reject missing vehicle patches, NaN/FPE, mass-balance failure or unstable force windows;
5. retain every validity file, coefficient history and component breakdown;
6. continue to the next variant after a failure.

A 4.35M-cell variant took 2.5–3 hours on the measured 4-vCPU pilot host; mesh generation took roughly 45 minutes. Those measurements, rather than catalogue estimates, produced the later 16-vCPU cost model.

## The valid comparison set

| Variant | $C_D$ | $C_L$ | What changed |
|---|---:|---:|---|
| Baseline | 0.2413 | -0.2498 | k-ω SST reference |
| k-ε | 0.2305 | -0.2569 | turbulence-model form |
| SST $a_1$ | 0.2417 | -0.2586 | SST coefficient sensitivity |
| Mesh coarse | 0.3190 | -0.1342 | systematic coarsening |
| Mesh mid | 0.2598 | -0.2522 | intermediate mesh |
| Rough 0.5 mm, compatible mesh | 0.2437 | -0.2697 | rough-wall treatment |
| Rough 1.0 mm, compatible mesh | 0.2457 | -0.2851 | rough-wall treatment |
| Low-$y^+$ variant | 0.2339 | -0.2490 | near-wall resolution |
| Tyre-layer variant | 0.2413 | -0.2498 | tyre-layer treatment |

The 1.0 mm roughness-compatible case increases downforce magnitude by 14.13% while drag rises 1.82% relative to baseline. That is a sensitivity result, not evidence that a real car should use a rough floor: the public geometry, roughness model and first-cell-height contract define the boundary.

The component table matters more than the whole-car delta. Some small total changes come from large opposing component shifts, so the pipeline publishes front wing, rear wing, floor, tyre and body coefficients alongside the total.

## Failures that changed the method

The first roughness runs (`rough05`, `rough10`) both reached a floating-point failure near iteration 549. Their requested roughness height exceeded the contact-region first-cell height. The histories remain diagnostic artifacts, but they never enter the sensitivity table. Rebuilt roughness-compatible meshes (`rough05r`, `rough10r`) pass.

The planned fine mesh exceeded the pilot host's 15 GB memory ceiling. It is recorded as `FAIL: OOM` and replaced by the intermediate mesh; it is not relabelled as a completed refinement level. With only coarse, mid and baseline pilot grids—and non-monotonic component movement—the study does not claim an asymptotic GCI region.

A stable first-order campaign also exposed numerical diffusion at the same scale as some physical variants. A later second-order run passed under the tightened solver settings, so second order became the production default instead of treating the earlier instability as a universal limitation.

## What I learned

Automation is useful only when the failure state is as structured as the pass state. A queue that continues after divergence, writes `VALIDITY`, and excludes failed rows did more for credibility than another contour plot.

Whole-car coefficients can hide component errors. The mesh-mid total lift is close to baseline, but its component shares move strongly in opposite directions; a total-only report would call that convergence too early.

The campaign also set a clean boundary between a pilot and production work. It proved the solver, queue, component outputs and sensitivity workflow. It did not prove grid-independent absolute aerodynamics.

## Boundary and next fidelity step

This is steady half-car RANS on reconstructed public geometry. It has no wind-tunnel or track correlation, no yaw, no full-car asymmetric flow and no demonstrated production mesh convergence. The 25–35M-cell programme, wall-resolved wing surfaces, three-grid GCI and URANS/DES ride-height cliff remain separate gates.

