---
title: 'Dimensionless Numbers — a Guarded First Toolkit'
year: 2025
date: '2025-10-18'
status: complete
categories: [tooling]
tags: [CFD]
summary: 'I built Reynolds, Mach, Prandtl, Nusselt, Grashof and Rayleigh calculators with SI dimension guards and a property table anchored to cited textbook data.'
role: 'Solo study project'
duration: 'Independent build'
featured: false
order: 11
studySequence: 1
heroImage: /images/projects/dimensionless-numbers/reynolds-sweep.svg
---

## Context & objective

Six dimensionless groups — Reynolds, Mach, Prandtl, Nusselt, Grashof, Rayleigh — now sit one command away, machine-exact against a hand calculation, with guards that reject a dimensionally wrong input loudly instead of returning a plausible-looking number. That is the whole deliverable, and it was deliberately small.

I built the smallest useful mechanics tool first: a guarded dimensionless-number calculator. Nearly every aerodynamics estimate starts with a Reynolds number, and the wrong viscosity quietly poisons everything downstream. The objective was a strict toolkit that computes the standard groups, refuses inconsistent input, and carries a property table whose numbers cite a traceable source.

## Method

Each group is implemented from its defining equation: $Re=\rho u L/\mu$, $Ma=u/a$, $Pr=\mu c_p/k$, $Nu=hL/k$, $Gr=g\beta\lvert\Delta T\rvert L^3\rho^2/\mu^2$, and $Ra$ in expanded form.

Guarding uses a minimal SI dimension system: every parameter declares its dimension vector over $(M, L, T, \Theta)$, and `Quantity(value, unit)` inputs are checked against it. Passing kinematic viscosity ($L^2T^{-1}$) where dynamic viscosity ($ML^{-1}T^{-1}$) is required produces an error naming the parameter, the expected dimension, and the received unit — exactly the mix-up a hand calculation invites. Plain floats are trusted as SI values; domain guards then enforce positivity and finiteness.

The property table transcribes five anchors from Incropera 7th ed. Tables A.4 (air, 300–400 K) and A.6 (water, 300–320 K), cross-checkable against the NIST Chemistry WebBook. Lookup is exact at anchors, piecewise-linear between them, and refuses to extrapolate.

## Iteration: making the identity test able to fail

The headline check is the identity $Ra = Gr\cdot Pr$ over 500 seeded random draws. That check is vacuous if both sides share the computation: implement $Ra$ as $Gr\cdot Pr$ and the test compares a number with itself, passing at 0.0 error while proving nothing. $Ra$ is therefore implemented from its expanded defining equation, so the identity test is a genuine algebraic check that can fail. It passes at a worst relative error of $4.4\times10^{-16}$.

The same suspicion applies to the property table. Transcription errors are the realistic failure mode for a hand-copied table, so the runner checks more than the anchors: tabulated Prandtl numbers must agree with $\mu c_p/k$ computed from the transcribed $\mu$, $c_p$, $k$. They agree to within 0.19%, which bounds transcription coherence rather than trusting it.

## Validation

Four predeclared gates, all passing:

| Gate | Observed | Threshold |
|---|---:|---:|
| Reference Re vs hand calculation | 0.0 relative error | $\leq 10^{-12}$ |
| $Ra = Gr\cdot Pr$, 500 seeded draws | $4.4\times10^{-16}$ | $\leq 10^{-12}$ |
| Invalid calls rejected | 10 of 10 | 10 of 10 |
| Property anchors exact | 20 of 20 values | 20 of 20 |

The reference case is hand-checkable: $Re = 1.225 \times 15 \times 0.3 / 1.81\times10^{-5} \approx 3.05\times10^{5}$. A valid control call passes the same guards untouched, so rejection is not over-firing.

## Quantitative results

At sea level ($\rho=1.225$ kg/m³, $\mu=1.81\times10^{-5}$ Pa·s), the front-wing chord ($L=0.3$ m) reaches $Re = 3.05\times10^{5}$ at 15 m/s, and the full car ($L=5$ m) reaches $Re = 2.03\times10^{7}$ at 60 m/s. The sweep figure plots $Re(u)$ for three FSAE characteristic lengths on a log axis.

![Reynolds number vs velocity for three characteristic lengths](/images/projects/dimensionless-numbers/reynolds-sweep.svg)

The horizontal annotations — flat-plate transition near $5\times10^{5}$ and a fully-turbulent order of magnitude near $10^{7}$ — are regime intuition: real transition depends on roughness, pressure gradient, and free-stream turbulence, none of which a dimensionless group models.

## Limitations

The property table is a constant-property approximation: five anchors, linear interpolation, narrow temperature ranges, ideal-gas $\beta = 1/T$ for air, and coverage of air and water only. The toolkit's scope is the incompressible regime; compressibility appears as the Mach definition and the perfect-gas speed of sound, with no real-gas effects. The figure's regime limits are textbook intuition, and a specific surface needs a specific transition model.

## What I took away

A check that cannot fail proves nothing. The $Ra = Gr\cdot Pr$ identity became a real test only once Rayleigh was written from its expanded definition; before that decision the 500-draw sweep would have compared a number with itself at 0.0 error. The viscosity guard — kinematic rejected where dynamic is required, with the error naming parameter, expected dimension, and received unit — is the check my own hand calculations kept inviting. Building the rejection path first (10 invalid calls, all refused, control call untouched) set the pattern for every later study: design the failure modes before the happy path.

## Reproduce

```bash
cd projects/dimensionless-numbers
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
PYTHONPATH=src python3 -m dimensionless_numbers reynolds --rho 1.225 --u 50 --l 1.0 --mu 1.81e-5 --json
```

