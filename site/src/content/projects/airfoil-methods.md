---
title: 'Airfoil Methods — Low-Order Models vs NASA'
year: 2026
date: 2026-02
status: complete
categories: [validation, tooling]
tags: [Python, Hess–Smith, NACA 0012, panel method, NASA]
summary: 'Thin-airfoil and geometry-resolved panel methods tested against a single traceable NASA wind-tunnel series—with stall and drag failures left visible.'
methodLine: 'Thin-airfoil theory · Prandtl–Glauert · Hess–Smith · NASA TM-4074'
role: 'Aerodynamic methods & validation'
duration: 'Independent study'
heroMetrics:
  - { label: 'NASA points', value: '16' }
  - { label: 'Linear Cl RMSE', value: '0.0824' }
  - { label: 'Panel convergence', value: '0.0307%' }
  - { label: 'Public source', value: 'TM-4074' }
keyOutputs:
  - 'Implemented cosine-spaced NACA geometry and a Hess–Smith source/vortex solver with quadrature, self-jump terms, and a Kutta condition.'
  - 'Validated lift only inside a declared attached-flow range; 160-to-240-panel lift changed by 0.0307% at four degrees.'
  - 'Showed the inviscid model beside measured wake drag and stall rather than presenting structurally unavailable outputs as weak predictions.'
featured: true
sample: false
order: 7
studySequence: 6
heroImage: /images/projects/airfoil-methods/lift-validation.svg
---

## Context & objective

Against one public NASA wind-tunnel series, thin-airfoil theory predicts the NACA 0012's measured lift slope to 3.81% error while a geometry-resolved panel method misses by 13.83%. This study builds that low-order hierarchy, verifies each implementation step, and maps where each level earns and loses trust.

The selected source is Table I of Charles L. Ladson's [NASA TM-4074](https://ntrs.nasa.gov/citations/19880019495): free-transition measurements at $M=0.15$ and $Re=5.97\times10^6$. Sixteen values are transcribed directly from the public table. No plotted curve was digitised and no Reynolds numbers or transition conditions were mixed.

## Interactive model hierarchy

Move from the linear range toward stall. The upper view maps Hess–Smith surface pressure; the lower view keeps NASA measurements, the panel result, and thin-airfoil theory on one set of axes.

<iframe src="/labs/airfoil-methods/" title="Interactive NACA 0012 airfoil model hierarchy" style="width:100%;height:760px;border:1px solid #233226;background:#08111f" loading="lazy"></iframe>

## Three levels, three capability boundaries

**Thin-airfoil theory** gives $C_l=2\pi\alpha$ for the symmetric section. A Prandtl–Glauert factor accounts for the selected $M=0.15$ condition. It predicts linear lift, but resolves neither the 12%-thick surface nor a pressure distribution.

**Hess–Smith potential flow** uses 160 cosine-spaced surface panels, one constant source strength per panel, one global vortex-sheet strength, and a trailing-edge Kutta condition. Twelve-point Gauss–Legendre quadrature evaluates panel influences; analytical half-jump terms handle self influence. It produces inspectable $C_p(x)$, lift, pressure drag, and quarter-chord moment.

**NASA wind-tunnel data** supplies the external reference. Lift and moment come from integrated model pressures; drag comes from a wake survey. This is evidence, not another rung of the numerical model.

![NACA 0012 lift hierarchy against NASA measurements](/images/projects/airfoil-methods/lift-validation.svg)

## Verification before comparison

Behavioral tests require a closed symmetric 12%-thick geometry, zero lift at zero angle, negligible inviscid pressure drag, the expected small-angle lift scale, and less than 1% change when the surface discretisation doubles from 80 to 160 panels.

A separate 40/80/160/240-panel sequence gives $C_l=0.48773$ and $0.48788$ for the final two levels at $4^\circ$: a 0.0307% relative change.

![Pressure distributions and panel refinement](/images/projects/airfoil-methods/pressure-and-refinement.svg)

## Validation result: simpler wins one scalar metric

A least-squares fit over the declared linear range, $-4.1^\circ\leq\alpha\leq10.2^\circ$, gives:

| Quantity | NASA | Thin airfoil + P–G | Hess–Smith + P–G |
|---|---:|---:|---:|
| Lift slope / degree | 0.10684 | 0.11092 | 0.12162 |
| Slope error | — | 3.81% | 13.83% |
| Linear-range $C_l$ RMSE | — | 0.0226 | 0.0824 |

Thin-airfoil theory is closer to the measured integral lift slope. The panel method earns its extra complexity by resolving geometry and surface loading, not by improving every scalar output. Presenting that reversal is more useful than claiming a universal model ranking.

## Failure is part of the result

Across all 16 points, panel-model lift RMSE rises to 0.225. NASA measures $C_l=1.660$ at $17.35^\circ$; the inviscid model continues almost linearly to 2.085 because it contains no separation physics.

The drag comparison is even clearer. NASA wake-survey $C_d$ rises from about 0.0065 near zero lift to 0.0275. Panel pressure drag stays below 0.0008 apart from discretisation error. That is d'Alembert's paradox, not an accurate low-drag prediction.

Cropping either failure would have been easy: truncate the comparison at the declared linear range, omit the drag curve, and the panel method reads as uniformly successful. The evidence pack does the opposite. The acceptance criteria require near-zero inviscid pressure drag and measured drag above 0.02 to coexist in the same output, so the blind spot cannot be edited out silently later.

![Measured drag beside the inviscid blind spot](/images/projects/airfoil-methods/drag-blind-spot.svg)

## What this demonstrates

- choosing one traceable experimental series before interpreting errors;
- separating code verification, discretisation evidence, and measurement validation;
- matching claims to the governing model rather than to the requested plot;
- recognising when a simpler model better predicts one integral quantity;
- stating what requires a boundary-layer model or viscous CFD next.

## Reproduce

`python3 -m unittest discover -s tests -v` exercises the geometry and solver contracts. `python3 scripts/analyse.py` regenerates every metric and figure and exits nonzero if any acceptance gate fails. The [technical report](/documents/airfoil-methods-report.html) records equations, provenance, interpretation, and limitations.

## Experimental provenance

The reference series is deliberately narrow: free transition, $M=0.15$, and $Re=5.97\times10^6$ from one NASA table. Lift and pitching moment were obtained by integrating model pressures; drag came from a wake survey. NASA reports repeated zero-angle precision of 0.0002 in $C_d$, 0.004 in normal-force coefficient, and 0.0002 in moment coefficient.

Keeping all 16 points in one test condition prevents an apparently smooth polar assembled from incompatible Reynolds numbers or transition states. It also establishes which discrepancy belongs to the numerical model and which may be comparable to measurement repeatability.

## Numerical implementation

Cosine spacing concentrates panels at the leading and trailing edges without changing the physical geometry. The Hess–Smith system solves one source strength per panel and one global circulation unknown. Collocation enforces no penetration, while the trailing-edge equation supplies the Kutta condition. Surface tangential velocity then gives

$$C_p=1-\left(V_t/V_\infty\right)^2.$$

Non-self panel influence uses twelve-point Gauss–Legendre integration; analytical half-jump terms handle the singular self contribution. More panels cannot repair a wrong singular term or Kutta condition: those are correctness questions, not convergence questions.

## Verification, validation, and capability

| Question | Evidence | Conclusion |
|---|---|---|
| Is the geometry implementation credible? | symmetry, closure, and thickness tests | verified for NACA 0012 generation |
| Is the panel result discretisation-stable? | 160→240-panel $C_l$ change of 0.0307% | adequate for this comparison |
| Does integral lift match experiment? | linear-range slope and RMSE against NASA | bounded validation pass |
| Does the model predict drag or stall? | near-zero pressure drag and continuing linear lift | structurally unavailable |

The distinction prevents one successful scalar comparison from being promoted into validation of every requested output.

## Error interpretation

The panel method's 13.83% lift-slope error is inside the predeclared 15% gate but materially larger than thin-airfoil theory's 3.81%. Panel refinement has already converged far below that discrepancy, so additional panels are not the corrective action. The remaining gap is dominated by model-form differences: thickness treatment, inviscid flow, and the absence of boundary-layer displacement and transition.

Beyond the attached-flow range, the error changes category rather than merely increasing. At $17.35^\circ$, the measurement is $C_l=1.660$ while the panel method returns 2.085. A viscous or empirical separation model is required before this region can support design decisions.

## Engineering use

This hierarchy is useful for geometry checks, sign conventions, linear lift scale, surface-loading inspection, and cheap pre-CFD screening. It is not suitable for ranking high-lift sections by stall margin or drag. The next fidelity step must earn its complexity with transition, wall resolution, and a grid/model sensitivity programme—not simply a denser inviscid discretisation.

## What I took away

The geometry-resolved model lost the scalar comparison I expected it to win: 13.83% slope error against thin-airfoil theory's 3.81%, with panel refinement already at 0.0307%. The gap was model form, so the corrective action was to name the missing physics rather than add panels. The more durable decision was presentational: the stall overshoot (2.085 against a measured 1.660) and the near-zero drag curve stayed in the headline figures, because cropping them would have turned a capability boundary into an apparent validation.
