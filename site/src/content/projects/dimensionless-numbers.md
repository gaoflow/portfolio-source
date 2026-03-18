---
title: 'Why I Built a Dimensionless-Number Toolkit First'
year: 2025
date: '2025-10-18'
status: complete
categories: [tooling]
tags: [CFD]
summary: 'I built Reynolds, Mach, Prandtl, Nusselt, Grashof, and Rayleigh calculators with unit checks so that viscosity, temperature, and property-input errors cannot quietly propagate into later CFD work.'
role: 'Solo study project'
duration: 'Independent build'
featured: false
order: 11
studySequence: 1
heroImage: /images/projects/dimensionless-numbers/reynolds-sweep.svg
---

## Why I started with dimensionless numbers

When I began studying fluid mechanics and CFD systematically, I found that many initial estimates start with dimensionless numbers. Reynolds number identifies the relevant flow scale, Mach number helps assess compressibility, and Prandtl, Nusselt, Grashof, and Rayleigh numbers appear in heat-transfer and natural-convection problems.

The formulas are short. The harder problem is supplying the right inputs. Dynamic viscosity and kinematic viscosity differ by a density relationship and have different dimensions. If I confuse them, a basic calculator can still return a plausible-looking Reynolds number while quietly leading later mesh choices, similarity arguments, and solver settings in the wrong direction.

I therefore built a toolkit that checks units, numerical ranges, and property-data sources rather than a collection of formulas that accepts unlabelled numbers without question.

## What the toolkit calculates

The toolkit currently implements six common dimensionless numbers:

| Dimensionless number | Definition |
|---|---|
| Reynolds number | $Re=\rho uL/\mu$ |
| Mach number | $Ma=u/a$ |
| Prandtl number | $Pr=\mu c_p/k$ |
| Nusselt number | $Nu=hL/k$ |
| Grashof number | $Gr=g\beta\lvert\Delta T\rvert L^3\rho^2/\mu^2$ |
| Rayleigh number | Calculated independently from its expanded definition |

Plain floating-point inputs are treated as SI values. For stricter checking, I can pass `Quantity(value, unit)`. The toolkit verifies the required mass, length, time, and temperature dimensions and rejects zero, negative, non-finite, or out-of-range property inputs.

## The main problem I wanted to prevent

A parameter that requires dynamic viscosity $\mu$ expects dimensions of $ML^{-1}T^{-1}$. Kinematic viscosity $\nu$ has dimensions of $L^2T^{-1}$. They are not interchangeable physical quantities.

If I pass kinematic viscosity into the dynamic-viscosity parameter, the toolkit stops instead of continuing the calculation. Its error identifies the incorrect parameter, the expected dimensions, and the unit it received.

The same checks cover several other common input problems:

| Input problem | Why the toolkit rejects it |
|---|---|
| Using kinematic viscosity $\nu$ as dynamic viscosity $\mu$ | The quantities differ and require a density relationship |
| Absolute temperature at or below zero | The ideal-gas relation $\beta=1/T$ is undefined |
| Zero characteristic length | $Re$, $Nu$, and $Gr$ lose their physical scale |
| A property lookup outside the tabulated range | Extrapolation would no longer be supported by the source data |

## Practical applications: where I used this toolkit

In my subsequent FSAE racecar aerodynamics and cooling system projects, this toolkit directly solved two practical problems:

1. **Evaluating aerodynamic wing flow regimes**: When selecting FSAE front and rear wing airfoils, low-speed cornering at 15 m/s (54 km/h) corresponds to $Re \approx 3.05 \times 10^5$ for a $c=0.3$ m chord, whereas top-speed straight running at 60 m/s (216 km/h) over the full car ($L=5$ m) reaches $Re \approx 2.03 \times 10^7$. Confusing dynamic viscosity $\mu$ and kinematic viscosity $\nu$ would distort Reynolds number calculations across different fluids or temperatures, risking an incorrect transition estimate and poor airfoil selection. The toolkit's dimensional guards directly prevent these errors.

2. **Self-consistent property inputs for cooling calculations**: When sizing radiators and water cooling circuits across temperatures from 300 K to 360 K, calculating Prandtl ($Pr$), Nusselt ($Nu$), and Grashof ($Gr$) numbers requires verified fluid properties. The toolkit's Incropera anchors and NIST cross-checks prevent transcription typos and unverified temperature extrapolations, ensuring that property inputs for 1D pipe flow and CFD boundary conditions are 100% self-consistent.

## Property data and interpolation

I transcribed five property anchors for air from 300–400 K and water from 300–320 K from Incropera, 7th edition, Tables A.4 and A.6. I cross-checked the values against the [NIST Chemistry WebBook](https://webbook.nist.gov/chemistry/).

For temperatures between anchors, the toolkit uses piecewise-linear interpolation. It refuses values outside the available range rather than extrapolating them.

I also recalculated Prandtl number from the transcribed values of $\mu$, $c_p$, and $k$ and compared the result with the tabulated Prandtl number. The two agree within 0.19%.

The table is not intended to cover every fluid. Its purpose is to provide a small set of clearly sourced, explicitly bounded inputs for common air and water problems.

## Making sure a test could actually fail

Rayleigh number satisfies

$$
Ra=Gr\cdot Pr.
$$

My first option was to implement `rayleigh()` by returning `grashof()*prandtl()`. That would make both sides identical by construction, so every test would report zero error even if the Grashof and Prandtl implementations shared the same mistake.

That test would only compare an expression with itself.

I corrected this by implementing Rayleigh number independently from its expanded definition, then calculating Grashof and Prandtl numbers through their separate paths. I compared the two routes over 500 samples generated with a fixed random seed. The worst relative error was $4.4\times10^{-16}$.

This turned the identity check into a test that could reveal an implementation error rather than one that was guaranteed to pass.

## Retained validation results

| Check | Result | Requirement |
|---|---:|---:|
| Reference $Re$ compared with a hand calculation | 0.0 relative error | $\leq 10^{-12}$ |
| $Ra=Gr\cdot Pr$ over 500 seeded samples | $4.4\times10^{-16}$ | $\leq 10^{-12}$ |
| Invalid inputs rejected | 10/10 | 10/10 |
| Property anchors matched exactly | 20/20 | 20/20 |

One reference case can be checked by hand:

$$
Re=\frac{1.225\times15\times0.3}{1.81\times10^{-5}}
\approx3.05\times10^5.
$$

Using the same sea-level properties, a 5 m full-car characteristic length reaches $Re=2.03\times10^7$ at 60 m/s. The hero figure plots $Re(u)$ for three FSAE characteristic lengths on the same logarithmic axis, showing how velocity and characteristic length change the flow scale together.

The annotations at $5\times10^5$ and $10^7$ are only textbook-level regime references. Real transition also depends on surface roughness, pressure gradients, and free-stream turbulence, so Reynolds number alone cannot determine it.

## Limitations

The property table contains only five anchors, covers only air and water, and uses linear interpolation. For air, the volumetric expansion coefficient follows the ideal-gas relation $\beta=1/T$.

The toolkit is mainly intended for incompressible-flow work. It can calculate Mach number and the speed of sound for a perfect gas, but it does not include real-gas effects. It also cannot replace transition, roughness, turbulence, or heat-transfer models.

## What I learned

The most important part of this project was not implementing six formulas. It was making the toolkit refuse incorrect inputs before those errors could propagate.

My own hand calculations repeatedly exposed opportunities to confuse viscosity definitions and units, so I designed the failure paths before the normal calculation paths. I also learned that validation should not merely show that a program runs. It should deliberately supply incorrect inputs and confirm that the program stops at the right place.

## Code and reproduction

The source code is open source on GitHub: [gaoflow/dimensionless-numbers](https://github.com/gaoflow/dimensionless-numbers)

```bash
git clone https://github.com/gaoflow/dimensionless-numbers.git
cd dimensionless-numbers
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
PYTHONPATH=src python3 -m dimensionless_numbers reynolds --rho 1.225 --u 50 --l 1.0 --mu 1.81e-5 --json
```
