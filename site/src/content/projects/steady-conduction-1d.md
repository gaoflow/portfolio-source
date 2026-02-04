---
title: 'Steady 1-D Conduction — First Discretised PDE'
year: 2026
date: '2026-08-18'
status: complete
categories: [validation]
tags: [Python, NumPy, finite differences, heat conduction, verification]
summary: 'A generating rod solved by finite differences and a Thomas algorithm, then checked by an exact solution, second-order MMS convergence and energy closure.'
methodLine: 'Central differences · half-cell Robin tip · Thomas algorithm · manufactured solutions'
role: 'Heat transfer & numerical methods'
duration: 'Independent study'
heroMetrics:
  - { label: 'Nodal error, N=160', value: '1.34e-11 K' }
  - { label: 'Observed order', value: '2.0002' }
  - { label: 'Energy residual', value: '1.59e-12' }
  - { label: 'Thomas vs dense', value: '1.1e-16' }
keyOutputs:
  - 'Discretised the steady 1-D conduction equation with a Dirichlet wall, a half-control-volume convective tip, and uniform volumetric generation, and solved the tridiagonal system with a Thomas algorithm written from scratch.'
  - 'Derived the closed-form exact solution and showed the scheme reproduces it to roundoff — then explained why that makes a manufactured source necessary for a genuine grid-convergence study (observed order 2.0002 over N=20/40/80/160).'
  - 'Closed the global energy balance to a relative residual of 1.59e-12 and cross-checked the tridiagonal solver against a NumPy dense solve at 1.1e-16 on 64 randomized systems.'
featured: false
order: 12
studySequence: 16
heroImage: /images/projects/steady-conduction-1d/temperature-profile.svg
---

## Context & objective

The scheme is verified, and the interesting part is how close it came to being "verified" vacuously: it reproduces the closed-form solution to $1.34\times10^{-11}$ K, converges at observed order 2.0002 on a manufactured case, and closes the global energy balance to $1.59\times10^{-12}$. Each check exists because one of the others cannot see a particular failure mode.

This study discretises a differential equation instead of evaluating a closed-form correlation. It establishes the workflow every later numerical project depends on: discretise, impose boundary conditions honestly, solve, then verify before interpreting. The physics stays deliberately simple — a generating rod.

The problem: steady conduction in a rod of length $L=0.5$ m with uniform conductivity $k=167$ W/(m·K), uniform volumetric generation $q'''=2\times10^{4}$ W/m³, a fixed temperature $T(0)=350$ K, and a convective tip $-k\,T'(L)=h_c(T(L)-T_\infty)$ with $h_c=25$ W/(m²·K) and $T_\infty=300$ K.

## Method

The rod is split into $N$ uniform cells. Interior nodes use central differences on $kT''+q'''=0$. The convective tip is a half-control-volume balance: the last interior face flux plus half a cell of generation equals the surface convection. The resulting tridiagonal system is solved with a Thomas algorithm implemented from scratch — forward elimination, back substitution, explicit zero-pivot guards — with no library solve in the production path.

The governing equation integrates twice to a closed form,

$$T(x)=T_\text{left}+C_1x-\frac{q'''x^2}{2k},\qquad C_1=\frac{q'''L+\dfrac{h_cq'''L^2}{2k}-h_c(T_\text{left}-T_\infty)}{k+h_cL},$$

derived in the [technical report](/documents/steady-conduction-1d-report.html). That exact solution is the primary validation reference.

![Numerical and exact temperature profiles with the convective tip](/images/projects/steady-conduction-1d/temperature-profile.svg)

## Iteration: the convergence study that measured nothing

The verification plan failed on first contact. The plan was to run the grid-convergence study against the closed-form solution. At $N=160$ the maximum nodal error came back $1.34\times10^{-11}$ K — roundoff, not truncation error. Central differences are exact for quadratics, the exact solution is quadratic, and the half-cell Robin balance is exact for quadratics too: the face-flux truncation term $-\tfrac{h}{2}kT''$ cancels the half-cell generation term $\tfrac{h}{2}q'''$ exactly. Refining the grid further would have measured floating-point noise.

The exactness result still earns its place, because it catches what a convergence study can mask: sign errors and boundary-row assembly mistakes. But the convergence rate needed a different vehicle. The iteration was to adopt the method of manufactured solutions — a sinusoidal source whose exact solution satisfies the same Dirichlet and Robin conditions. On that case the error falls $4.81\times10^{-2} \to 1.20\times10^{-2} \to 3.00\times10^{-3} \to 7.51\times10^{-4}$ K across $N=20/40/80/160$, a least-squares observed order of 2.0002 against a slope-2 reference.

![Log-log error versus grid spacing with slope-2 reference](/images/projects/steady-conduction-1d/convergence.svg)

## Validation

Four predeclared gates, all passing:

| Gate | Observed | Threshold |
|---|---:|---:|
| Max nodal error vs exact, $N=160$ | $1.34\times10^{-11}$ K | $\leq 10^{-9}$ K |
| Observed order, $N=20/40/80/160$ | 2.0002 | $\in[1.8,\,2.2]$ |
| Energy-balance relative residual | $1.59\times10^{-12}$ | $\leq 10^{-10}$ |
| Thomas vs NumPy dense solve | $1.1\times10^{-16}$ | $\leq 10^{-12}$ |

## Quantitative results

The exact tip temperature is 360.446 K and the profile peaks at 360.788 K at $x=0.425$ m. The global balance is the more instructive number: of the $10{,}000$ W/m² generated per unit area, only $1{,}511$ W/m² leaves through the convective tip — the remaining $8{,}489$ W/m² conducts backwards into the fixed-temperature wall at $x=0$. Summing the discrete cell balances reproduces that identity with a relative residual of $1.59\times10^{-12}$, so the scheme is conservative as well as pointwise accurate. The hand-written Thomas solver also matches a NumPy dense solve to $1.1\times10^{-16}$ over 64 randomized systems.

## Limitations

The model is one-dimensional and steady with constant properties; temperature-dependent conductivity would make it nonlinear. There is no contact resistance at either boundary, and tip radiation — a nonlinear $T^4$ term — is excluded. The manufactured convergence case is a verification device, not a physical scenario. Nothing here extends to multidimensional spreading, fins of varying section, or transients.

## What I took away

Central differences are exact on quadratics, and my exact solution was quadratic — the convergence study I had planned measured roundoff, $1.34\times10^{-11}$ K of it. The manufactured sinusoidal source exists because of that failure, and it is what produced a genuine observed order of 2.0002. I also stopped treating checks as interchangeable: exactness catches sign and boundary-row assembly errors, the manufactured slope catches truncation behaviour, and the energy residual catches a non-conservative scheme. Each sees a failure the other two cannot.

## Reproduce

```bash
cd projects/steady-conduction-1d
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
python3 scripts/publish_site.py
```

`analyse.py` regenerates `results/analysis.json` and both figures and exits nonzero if any gate fails. The committed [technical report](/documents/steady-conduction-1d-report.html) carries the derivation, the verification argument, and the sources.
