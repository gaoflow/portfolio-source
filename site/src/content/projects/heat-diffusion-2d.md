---
title: 'Heat Diffusion 2-D — Explicit FTCS with a Hard Stability Gate'
year: 2026
date: '2026-08-18'
status: complete
categories: [validation]
tags: [Python, NumPy, heat equation, FTCS, stability, V&V]
summary: 'Explicit FTCS heat diffusion matches the analytical slab transient to 1.38e−5 and refuses any run outside its r≤0.25 stability bound.'
methodLine: 'FTCS · finite-volume flux form · slab series · stability gate'
role: 'Numerical methods & validation'
duration: 'Independent study'
heroMetrics:
  - { label: 'L∞ error vs series', value: '1.38e−5' }
  - { label: 'Temporal order', value: '1.017' }
  - { label: 'Energy drift', value: '0.0' }
  - { label: 'Stability limit', value: 'r ≤ 0.25' }
keyOutputs:
  - 'Implemented a cell-centred finite-volume FTCS solver with Dirichlet and zero-flux Neumann boundaries on uniform square grids.'
  - 'Validated the quasi-1-D transient against the analytical slab series: L∞ error 1.38e−5 against a 5e−5 gate.'
  - 'Isolated first-order time integration (observed order 1.017) and exact energy conservation under full insulation.'
  - 'Made the stability bound a hard contract: an attempted r = 0.26 run is refused and logged before integration.'
featured: false
order: 15
studySequence: 18
heroImage: /images/projects/heat-diffusion-2d/temperature-field.svg
---

## Context & objective

This first time-dependent solver matches the analytical slab transient to $L^\infty=1.38\times10^{-5}$, and it refuses to run outside its stability bound. It directly precedes the [FlowLab lattice-Boltzmann work](/projects/flowlab): before trusting a browser LBM solver, I wanted the smallest unsteady solver where stability, temporal order, and conservation could each be checked against an independent result.

The heat equation $\partial_t T=\alpha\nabla^2 T$ is the right vehicle: it has an analytical transient, a textbook stability bound, and a conservation identity. The objective was a verifiable solver, with the gates declared before the numbers were generated.

## Method

The domain is a uniform grid of square cells with temperatures at cell centres. The update is explicit FTCS written in face-flux form,

$$T_{j,i}^{n+1}=T_{j,i}^{n}+r\,\big[\Delta T_{x,\,i+1/2}-\Delta T_{x,\,i-1/2}+\Delta T_{y,\,j+1/2}-\Delta T_{y,\,j-1/2}\big],\qquad r=\frac{\alpha\Delta t}{\Delta x^2},$$

which makes the conservation property structural: with all boundaries zero-flux, every interior face difference is added to one cell and subtracted from its neighbour as the same floating-point value, so cell-integrated energy is conserved to round-off. Dirichlet boundaries use a linear ghost cell; Neumann boundaries have exactly zero face difference.

Von Neumann analysis gives the amplification factor $g=1-4r(\sin^2\tfrac{k_x\Delta x}{2}+\sin^2\tfrac{k_y\Delta x}{2})$, hence the stability bound $r\leq\tfrac14$ on a square grid. The solver enforces this as a contract, not a warning: `check_stability` raises `StabilityError` and logs the refusal before any integration. A solver that diverges silently is worse than one that refuses to run.

## Validation

The analytical reference is the transient in a slab with one fixed-temperature face and one insulated face, initialised uniform:

$$\theta(x,t)=\sum_{n=0}^{\infty}\frac{4}{(2n+1)\pi}\sin(\lambda_n x)\,e^{-\alpha\lambda_n^2 t},\qquad \lambda_n=\frac{(2n+1)\pi}{2L},$$

truncated when the term envelope falls below $10^{-14}$, which bounds the neglected tail since $|\sin|\leq1$. The 2-D solve is run quasi-1-D: west face Dirichlet, the other three insulated, on a $100\times20$ grid at $r=0.2$.

![Temperature field at t = 0.05 s: the insulated faces keep the field uniform across y](/images/projects/heat-diffusion-2d/temperature-field.svg)

Five predeclared gates, all passing:

| Gate | Observed | Threshold |
|---|---:|---:|
| $L^\infty$ error vs series at $t=0.05$ s | $1.384\times10^{-5}$ | $\leq5\times10^{-5}$ |
| Temporal order, fixed grid | 1.017 | within $[0.9,\,1.1]$ |
| Insulated energy drift, 576 steps | $0.0$ | $\leq10^{-12}$ |
| Attempted $r=0.26$ run | refused and logged | refused |
| Cross-direction variation, series-initialised 2-D field | $0.0$ | $<10^{-14}$ |

The obvious temporal-refinement plan fails on paper. FTCS applied to the heat equation carries the combined leading truncation term $\tfrac{\alpha\Delta x^2}{12}(6r-1)\,\partial_x^4T$: temporal and spatial errors couple, so refining $\Delta t$ against the analytical solution at fixed grid cannot show order one. The temporal order is therefore isolated by comparing four runs at $r\in\{0.20,0.10,0.05,0.025\}$ against a fine-time reference ($r=10^{-3}$) on the *same* grid, where the shared spatial error cancels in the difference. The observed slope is 1.017.

![Error versus time step with slope-1 reference](/images/projects/heat-diffusion-2d/temporal-refinement.svg)

A second identity pins the implementation itself: a discrete cosine mode on the insulated grid is an exact eigenvector of the FTCS operator, and the solver reproduces its per-step amplification $g=1-4r\sin^2(\pi/2n_x)$ to $10^{-14}$. That test catches sign and indexing errors that an error-vs-analytical check alone would only blur into the truncation constant.

## Limitations

- Explicit scheme: the $r\leq0.25$ bound forces $\Delta t\propto\Delta x^2$, so resolved runs cost thousands of steps — the production validation is 2500 steps for 0.05 s of physical time.
- Constant isotropic diffusivity; no advection, no source terms, no phase change.
- Cartesian uniform grids with square cells only; only fixed-temperature and zero-flux boundaries are implemented.
- First order in time, second order in space; the temporal-order gate relies on a fine-time reference rather than the analytical solution because of the $(6r-1)$ coupling above.

## Reproduce

`python3 -m unittest discover -s tests -v` runs the thirteen solver contracts. `python3 scripts/analyse.py` regenerates `results/analysis.json` and both figures, exiting nonzero if any gate fails. The committed [technical report](/documents/heat-diffusion-2d-report.html) preserves the derivation, gates, and recorded stability refusal.

## What I took away

The temporal-order study was redesigned before it ran. Deriving the leading truncation term first exposed the $(6r-1)$ coupling, so the planned refinement against the analytical solution would have attributed spatial error to the time integrator; the fix was a fine-time reference ($r=10^{-3}$) on the same grid, where the shared spatial error cancels, and the observed order came out 1.017. The stability gate taught a second lesson: refusing the $r=0.26$ attempt, and logging the refusal, made the solver's failure behaviour part of the deliverable instead of an accident left to the user.
