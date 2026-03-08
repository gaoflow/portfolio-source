---
title: 'I Calculated NACA 0012 Three Ways—and the Simplest Was Closer to NASA'
year: 2026
date: '2026-02-28'
status: complete
categories: [validation, tooling]
tags: [CFD]
summary: 'I compared thin-airfoil theory, a Hess–Smith panel method, and NASA wind-tunnel data at the same test condition. The lift-slope errors were 3.81% and 13.83%, while the stall and drag results exposed the limits of inviscid models.'
role: 'Aerodynamic methods & validation'
duration: 'Independent study'
featured: false
order: 7
studySequence: 8
heroImage: /images/projects/airfoil-methods/lift-validation.svg
---

## Why I compared a simple theory with a panel method

Before moving to RANS, I wanted to understand which questions low-cost aerodynamic models can answer.

I chose the NACA 0012 and compared thin-airfoil theory and a Hess–Smith panel method with one NASA wind-tunnel dataset at the same Mach number, Reynolds number, and transition condition.

My goal was not to identify one method that is always best. I wanted to see what capability each level adds and where essential physics is still missing.

## Wind-tunnel reference

The experimental reference is Table I of Charles L. Ladson’s [NASA TM-4074](https://ntrs.nasa.gov/citations/19880019495), measured with free transition at $M=0.15$ and $Re=5.97\times10^6$.

I transcribed all 16 points directly from the same table. I did not digitise plotted curves or combine data from different Reynolds numbers or transition conditions. Lift and pitching moment were obtained by integrating surface pressures; drag came from a wake survey.

NASA reports repeated zero-angle precision of 0.0002 in $C_d$, 0.004 in normal-force coefficient, and 0.0002 in moment coefficient.

Keeping every point within one test condition made it possible to distinguish model differences from incompatible experimental conditions.

## What each level can calculate

For the symmetric section, thin-airfoil theory gives

$$
C_l=2\pi\alpha.
$$

I applied a Prandtl–Glauert correction for $M=0.15$. This gives a quick linear lift slope, but it does not represent the airfoil’s 12% thickness or produce a surface-pressure distribution.

The Hess–Smith potential-flow model uses the analytical NACA 0012 geometry and 160 cosine-spaced surface panels. Each panel has a constant source strength, while the complete airfoil shares one global circulation or vortex-sheet unknown. Collocation enforces no penetration, and a trailing-edge Kutta condition closes the system.

Cosine spacing concentrates panels near the leading and trailing edges without changing the physical geometry. I evaluated non-self panel influences using twelve-point Gauss–Legendre quadrature and handled singular self-influence with analytical half-jump terms.

After solving for surface tangential velocity, I calculated

$$
C_p=1-\left(\frac{V_t}{V_\infty}\right)^2.
$$

Integrating pressure around the surface then gives lift, pressure drag, and quarter-chord pitching moment.

The NASA wind-tunnel data is the external experimental reference, not a third numerical model.

## Checking the panel method before comparing it with NASA

I first checked that the generated geometry was closed and symmetric, with a maximum thickness of 12%. I also required near-zero lift at zero angle, the correct sign and scale of small-angle lift, and inviscid pressure drag at the level of discretisation error.

Doubling the surface discretisation from 80 to 160 panels changed lift by less than 1%. A separate 40/80/160/240-panel refinement sequence gave $C_l=0.48773$ with 160 panels and 0.48788 with 240 panels at $4^\circ$. The relative change was only 0.0307%.

This showed that panel count was no longer controlling the lift comparison. Adding more panels could refine the same inviscid solution, but it could not repair an incorrect singular term or Kutta condition, and it could not add missing viscous physics.

![Pressure distributions and panel refinement](/images/projects/airfoil-methods/pressure-and-refinement.svg)

## The simplest model was closer to the measured lift slope

I fitted the lift curves over the declared linear range, $-4.1^\circ\leq\alpha\leq10.2^\circ$:

| Result | NASA | Thin airfoil + P–G | Hess–Smith + P–G |
|---|---:|---:|---:|
| Lift slope / degree | 0.10684 | 0.11092 | 0.12162 |
| Slope error | — | 3.81% | 13.83% |
| Linear-range $C_l$ RMSE | — | 0.0226 | 0.0824 |

Thin-airfoil theory was closer to the measured integral lift slope. The more complex panel method did not automatically produce a more accurate scalar result.

What the panel method added was different: it represented airfoil thickness, produced an inspectable $C_p$ distribution, and showed how loading varied over the surface. More complexity provided more outputs, but not better accuracy for every output.

## Stall exposed the missing physics

When I included all 16 experimental points, the panel-model lift RMSE increased to 0.225.

At $17.35^\circ$, NASA measured $C_l=1.660$. The inviscid panel model continued rising almost linearly to 2.085 because it had no boundary layer or separation mechanism and therefore could not produce physical stall.

This was a model-form failure rather than a panel-resolution problem. Further refinement would only converge more closely to the same inviscid equations. It would not restore the missing effects of viscosity, boundary-layer displacement, transition, or separation.

## Near-zero pressure drag was not a low-drag prediction

NASA’s wake-survey $C_d$ increased from about 0.0065 near zero lift to 0.0275. The panel method’s pressure drag remained below 0.0008, apart from discretisation error.

That result did not mean the model had found an exceptionally low-drag airfoil. It was d’Alembert’s paradox: potential flow contains no viscous drag and cannot represent a separated wake.

![Measured drag beside the inviscid blind spot](/images/projects/airfoil-methods/drag-blind-spot.svg)

I could have made the panel method look uniformly successful by showing only the linear lift range and omitting drag. Instead, I retained both the stall overshoot and the near-zero pressure-drag curve because they define the model’s capability boundary.

## What I retained for engineering use

| Method | Useful for | Not suitable for |
|---|---|---|
| Thin-airfoil theory | Linear lift slope, sign conventions, and quick lift-scale estimates | Thickness effects, surface pressure, drag, and stall |
| Hess–Smith panel method | Geometry checks, $C_p$, surface loading, and integrated inviscid loads | Viscous drag, transition, separated flow, and stall |
| NASA wind-tunnel data | Measured behaviour of this airfoil at this test condition | Direct extrapolation to other geometries or conditions |

This low-order hierarchy is useful for checking geometry, force signs, linear lift scale, and surface loading before more expensive CFD.

It is not suitable for ranking high-lift sections by drag or stall margin. Those decisions require a model that includes viscosity and transition, together with appropriate near-wall resolution and grid, turbulence-model, and transition-model sensitivity studies.

## What I learned

I expected the geometry-resolved panel method to outperform thin-airfoil theory in the lift-slope comparison. The result was the opposite: the panel method had 13.83% slope error, while thin-airfoil theory had 3.81%, even though panel refinement had already reduced the 160-to-240-panel change to 0.0307%.

The corrective action was not to keep adding panels. It was to identify the remaining discrepancy as a model-form limitation, restrict the model to questions it can support, and move to a viscous method when drag, transition, or separation matters.

The broader lesson was that greater model complexity does not guarantee greater accuracy. I first need to decide whether a discrepancy comes from discretisation, implementation, or missing physics; only then can I choose between refining the mesh, correcting the solver, or using a higher-fidelity model.

## How to run

```bash
cd projects/airfoil-methods
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
```

The unit tests exercise the geometry and solver behaviour. The analysis script regenerates the reported metrics and figures.
