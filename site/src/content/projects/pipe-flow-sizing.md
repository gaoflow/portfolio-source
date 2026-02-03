---
title: 'Pipe Flow Sizing — Verified Hydraulics Primitives'
year: 2025
date: 2025-11
status: complete
categories: [tooling]
tags: [Python, hydraulics, Darcy–Weisbach, Colebrook, pump curve]
summary: 'A third-month study: friction factors, series networks, and pump operating points built from scratch — and verified against identities, residuals, and a published accuracy band before being trusted.'
methodLine: 'Darcy–Weisbach · Colebrook Newton solve · series networks · pump intersection'
role: 'Hydraulics & numerical methods'
duration: 'Independent study'
heroMetrics:
  - { label: 'Colebrook residual', value: '<3.6e-15' }
  - { label: 'Swamee–Jain deviation', value: '2.83%' }
  - { label: 'Loop operating flow', value: '26.22 L/min' }
  - { label: 'Intersection residual', value: '2.2e-11 Pa' }
keyOutputs:
  - 'Implemented the laminar 64/Re branch and a Newton Colebrook solver with a Haaland initial guess; 150-point residual grid peaks at 3.6e-15.'
  - 'Cross-checked turbulent friction factors against the explicit Swamee–Jain formula inside its published ±3% band — observed maximum 2.83% — and restricted the comparison to the declared validity range.'
  - 'Solved a series cooling loop and its pump operating point (26.22 L/min at 51.34 kPa), confirmed against an independent brute-force scan bracket.'
featured: false
order: 13
studySequence: 3
heroImage: /images/projects/pipe-flow-sizing/moody.svg
---

## Context & objective

The representative cooling loop operates at 26.22 L/min against 51.34 kPa, and about 78% of that pressure drop is minor losses — the K coefficients of the radiator core and engine gallery, with straight-pipe friction a minor share at this scale. That conclusion only matters because every primitive behind it was verified before it was allowed to feed anything downstream.

Three months after moving from software engineering into mechanical engineering, I needed hydraulics I could trust for a later FSAE cooling-loop study. The mathematics of pipe sizing is not hard, but it is easy to *almost* get right: a friction factor off by a few percent, a minor-loss coefficient silently dropped, an operating point found by eyeballing two curves. Everything here is steady, incompressible, single-phase pipe flow: Darcy–Weisbach friction, K-coefficient minor losses, a series network, and the intersection of a pump curve with the system resistance curve.

## Friction factor, verified two ways

Below $Re=2300$ the friction factor is the analytical identity $f=64/Re$; the implementation reproduces it with zero floating-point error across a 200-point grid. Above it, the implicit Colebrook equation is solved by Newton iteration on $x=1/\sqrt{f}$ from a [Haaland](https://doi.org/10.1115/1.3240948) initial guess, with a 50-iteration guard that turns non-convergence into a loud failure instead of a silent bad factor. Substituting the solved factor back into the defining equation across 150 $(Re, \varepsilon/D)$ grid points up to $Re=10^8$ gives a maximum residual of $3.55\times10^{-15}$.

![Computed Moody-style chart: laminar line and Colebrook curves](/images/projects/pipe-flow-sizing/moody.svg)

The Moody-style chart is drawn from computed curves only — the laminar line and six Colebrook sweeps at declared relative roughnesses. No external chart was digitised.

## Iteration: the cross-check that needed a fence

The independent cross-check is the explicit [Swamee–Jain](https://doi.org/10.1061/JYCEAJ.0004542) formula, published with a $\pm3\%$ accuracy band over $5\times10^3\le Re\le10^8$ and $10^{-6}\le\varepsilon/D\le10^{-2}$. That band has edges, and the comparison finds them: outside the declared range — near $Re=4\times10^3$ at very low roughness — the deviation exceeds 3%.

That left two bad options and one honest one. Widening the comparison grid would have produced a failing number and a false sense that the solver was wrong; quietly narrowing it would have hidden where the approximation breaks. The runner does neither. It evaluates the declared validity range, reports the in-range maximum deviation of 2.83% (inside the band), and leaves the out-of-range behaviour documented as a property of the formula. The lesson carried forward: a cross-check against an approximation is only meaningful inside that approximation's own fence.

## Series network and pump operating point

A representative FSAE-scale cooling loop — suction hose, radiator core, engine gallery, return hose, declared water properties, declared K coefficients — is solved in series by bisection on the monotone system curve. The pump is a declared quadratic model $\Delta p = 90\ \text{kPa} - c\,Q^2$ (40 L/min free delivery), explicitly a stand-in rather than vendor data. The operating point is where pump curve meets system resistance curve:

- **Operating flow:** 26.22 L/min at 51.34 kPa, intersection residual $2.18\times10^{-11}$ Pa.
- **Independent check:** a 4096-sample brute-force scan brackets the intersection at $[26.2173, 26.2271]$ L/min; the Newton solution sits inside.
- **Closure:** the total drop equals the sum of the per-element drops exactly (0.0 Pa closure error, at the operating point and across a 24-flow sweep).

The element breakdown shows where the pressure goes:

| Element | $Re$ | $f$ | $\Delta p$ |
|---|---:|---:|---:|
| Suction hose (0.40 m, 16 mm, $K=1.5$) | 34 654 | 0.0230 | 4.89 kPa |
| Radiator core (0.15 m, 16 mm, $K=8.0$) | 34 654 | 0.0230 | 19.37 kPa |
| Engine gallery (0.50 m, 14 mm, $K=4.0$) | 39 605 | 0.0296 | 20.33 kPa |
| Return hose (0.60 m, 16 mm, $K=2.0$) | 34 654 | 0.0230 | 6.75 kPa |
| **Total** | | | **51.34 kPa** |

![Pump curve vs system resistance curve with the operating point](/images/projects/pipe-flow-sizing/pump-operating-point.svg)

A sanity check with physics teeth: adding a 10 kPa static lift reduces the operating flow, as the model must.

## Validation summary

| Check | Observed | Threshold |
|---|---:|---:|
| Laminar max $\lvert f-64/Re\rvert$ | 0.0 | $\le10^{-12}$ |
| Colebrook max residual (150-point grid) | $3.55\times10^{-15}$ | $<10^{-12}$ |
| Swamee–Jain max deviation (in validity range) | 2.83% | $\le3\%$ |
| Operating-point residual | $2.18\times10^{-11}$ Pa | $<10^{-10}$ Pa |
| Network closure (total − element sum) | 0.0 Pa | relative $<10^{-12}$ |

All gates are enforced by the analysis runner, which exits nonzero if any fail.

## Limitations

The model is steady, incompressible, and single-phase; there is no cavitation or NPSH check, so the pump curve is followed wherever the mathematics goes. Minor-loss K coefficients are declared handbook order-of-magnitude values, and published K tables carry wide uncertainty. The pump curve is a declared quadratic; real curves bend near shutoff and free delivery. The laminar/turbulent transition is a hard switch at $Re=2300$ with no transition band, and the network solver handles series topology only; parallel branches were deliberately left for the later cooling study.

## What I took away

A cross-check against an approximation means something only inside that approximation's own fence. Swamee–Jain exceeds its ±3% band near $Re=4\times10^3$ at low roughness; a deviation measured there would have said nothing about my solver. When a check fails, the first question is now whether the code or the check is out of scope. The second habit this study set: verified primitives before capability. Every number the later cooling study consumed traces to an identity, an implicit-equation residual, or a published band.

## Reproduce

```bash
cd projects/pipe-flow-sizing
python3 -m unittest discover -s tests -v   # 15 solver-contract tests
python3 scripts/analyse.py                 # regenerates metrics + figures, gates
python3 scripts/publish_site.py            # publishes figures and the HTML report
```

The committed [technical report](/documents/pipe-flow-sizing-report.html) preserves the equations, verification grids, element breakdown, and sources.

## What this fed into

This was the first encounter with hydraulic networks, and it set the pattern for the later [FSAE cooling-system study](/projects/fsae-cooling): fan and pump operating points as curve intersections, system resistance built element by element, and a decision gate that trusts the model only as far as its verified envelope. The cooling study adds what this one deliberately omits — parallel branches, a real pump curve, thermal coupling, and transients — but its hydraulic core is this one, with the verification discipline intact.
