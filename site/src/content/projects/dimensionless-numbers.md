---
title: 'Why I Started with a Dimensionless-Number Toolkit'
year: 2025
date: '2025-10-18'
status: complete
categories: [tooling]
tags: [CFD]
summary: 'After moving from software engineering into mechanics, I found that aerodynamic and heat-transfer estimates kept starting with the same dimensionless numbers. I built a small toolkit that checks units, rejects invalid inputs, and leaves a reproducible validation trail.'
role: 'Solo study project'
duration: 'Independent build'
featured: false
order: 11
studySequence: 1
heroImage: /images/projects/dimensionless-numbers/source/reynolds-observations-1883.svg
github: 'https://github.com/gaoflow/dimensionless-numbers'
---

## Why I started with this small tool

In September 2025, I had just moved from software engineering into mechanics. I quickly noticed a recurring pattern: whether I wanted to estimate airflow over a racecar wing or reason about cooling-water heat transfer, the first useful step was often not opening a CFD package. It was calculating a few dimensionless numbers.

Reynolds number appeared most often. Its formula fits on one line, but the inputs are easy to mishandle. Does the formula need dynamic or kinematic viscosity? Should the characteristic length be a wing chord, pipe diameter, or whole-car length? Do the fluid properties match the temperature? A normal calculator will still return a plausible-looking number when those choices are wrong.

That problem matched a habit I brought from software engineering. I did not want to copy six formulas into a script and stop. I wanted a first-line check for later projects: valid inputs should be quick to calculate, while invalid inputs should stop before they reach a CFD or heat-transfer model.

The real question was therefore not “Can Python calculate Reynolds number?” It was:

> Can a very small engineering tool remain easy to check by hand while actively catching unit and property-input mistakes?

The header image is the original illustration from Reynolds' 1883 paper: in the same glass tube, the dye streak stays a straight line at low speed (laminar flow) and suddenly breaks up and mixes at higher speed (turbulent flow). From observations like this he concluded that the flow regime is set not by speed, diameter, or viscosity alone, but by the ratio they form together — the number later named after him. (Image: Wikimedia Commons, public domain.)

## An everyday example first

Imagine a desk fan blowing at about 3 m/s across a card that is 15 cm wide. Using sea-level air density, $\rho=1.225\ \mathrm{kg/m^3}$, and dynamic viscosity, $\mu=1.81\times10^{-5}\ \mathrm{Pa\cdot s}$:

$$
Re=\frac{\rho uL}{\mu}
=\frac{1.225\times3\times0.15}{1.81\times10^{-5}}
\approx3.05\times10^4.
$$

This number has no unit. It compares the fluid's tendency to keep moving with the smoothing effect of viscosity. NASA Glenn's explanation of [Reynolds number and similarity parameters](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/similarity-parameters/) makes the same practical point: two problems are comparable only when the relative importance of their governing effects is represented by similar parameters.

A desk fan, a racecar wing, and a whole-car reference scale look unrelated, yet the same ratio connects them. The figure below does not predict transition. It only puts the three scales on one logarithmic axis so the orders of magnitude are visible.

![Everyday airflow and racecar Reynolds-number examples](/images/projects/dimensionless-numbers/reynolds-examples.svg)

## Six common questions in one interface

The toolkit calculates six dimensionless numbers. The equation matters, but so does the engineering question behind it.

| Number | Definition | What it helps me ask first |
|---|---|---|
| Reynolds number | $Re=\rho uL/\mu$ | Whether inertia or viscosity matters more, and whether two flows have a comparable scale |
| Mach number | $Ma=u/a$ | Whether compressibility may matter |
| Prandtl number | $Pr=\mu c_p/k$ | Whether momentum or heat diffuses faster |
| Nusselt number | $Nu=hL/k$ | How much convection strengthens heat transfer over conduction alone |
| Grashof number | $Gr=g\beta\lvert\Delta T\rvert L^3\rho^2/\mu^2$ | How strongly buoyancy competes with viscosity |
| Rayleigh number | Calculated from its expanded definition | Whether natural convection deserves attention |

These numbers do not replace CFD. They are a map before the calculation: they show which effects may matter, what scale the problem occupies, and whether two experiments or simulations are even sensible to compare.

## Step one: functions I could check by hand

I implemented each defining equation directly, without adding empirical correlations at this layer. That keeps every output calculator-checkable and gives me a clear place to start when a result looks wrong.

For example, air at 15 m/s moving over a 0.3 m chord gives:

$$
Re=\frac{1.225\times15\times0.3}{1.81\times10^{-5}}
\approx3.05\times10^5.
$$

The program matches this hand calculation with zero relative error. That only proves the function evaluates this equation correctly. It does not mean the Reynolds number has predicted transition on a real wing.

## Step two: teach the code what units mean

If I pass only `1.5e-5`, a program cannot know whether I mean dynamic or kinematic viscosity. The two values can even have similar orders of magnitude in air:

- dynamic viscosity $\mu$ has dimensions $ML^{-1}T^{-1}$;
- kinematic viscosity $\nu$ has dimensions $L^2T^{-1}$;
- they are related by $\nu=\mu/\rho$, but they are not the same physical quantity.

I built a minimal SI dimension system over mass $M$, length $L$, time $T$, and temperature $\Theta$. In strict mode, I can pass `Quantity(value, unit)`:

```python
reynolds(
    rho=Quantity(1.225, "kg/m3"),
    u=Quantity(15.0, "m/s"),
    length=Quantity(0.3, "m"),
    mu=Quantity(1.5e-5, "m2/s"),
)
```

The last line puts kinematic viscosity where dynamic viscosity is required. The toolkit stops there and identifies the parameter, the expected dimensions, and the unit it received.

The plain-float interface remains useful for quick SI calculations, but it trusts the caller. The real dimensional protection comes from `Quantity`; no program can infer the intended physical quantity from a bare number alone.

## Step three: reject inputs that have valid units but no useful physics

Correct dimensions do not guarantee a meaningful input. I added parameter-specific domain checks instead of rejecting every zero or negative value indiscriminately. For example:

- density, dynamic viscosity, thermal conductivity, and characteristic length must be positive;
- velocity may be zero, but it cannot be negative or `NaN`;
- Grashof number uses $\lvert\Delta T\rvert$, so the temperature difference may have either sign but cannot be zero;
- property lookup is allowed only between retained temperature anchors.

I created 10 deliberately invalid calls: kinematic viscosity supplied where dynamic viscosity is required, zero length, negative density, a velocity with the wrong unit, and an out-of-range property lookup, among others. The analysis must reject all 10 while allowing a fully unit-tagged control call through. This checks that the guards fail selectively instead of simply blocking everything.

## Step four: a small property table with hard boundaries

The equations are short; fluid-property data are often the more fragile input. I transcribed five temperature anchors from Incropera, 7th edition, Tables A.4 and A.6:

- air at 1 atm: 300 K, 350 K, and 400 K;
- saturated liquid water: 300 K and 320 K.

Each anchor stores density, dynamic viscosity, specific heat, and thermal conductivity. The lookup is piecewise-linear between anchors and refuses to extrapolate. Air's volumetric expansion coefficient uses the ideal-gas approximation $\beta=1/T$.

I also used the [NIST Chemistry WebBook](https://webbook.nist.gov/chemistry/fluid/) as a second public reference for trend and scale checks. The evidence boundary matters here: the retained automated tests prove that local lookup exactly reproduces all 20 stored anchor fields, and that Prandtl number recalculated as $\mu c_p/k$ differs from the tabulated value by at most 0.19%. They do not prove that the whole table reproduces NIST point by point.

The table is deliberately small. It is not a replacement for a full property database. It gives me bounded, traceable inputs for common air problems and water problems between 300 and 320 K.

## The test that could have been impossible to fail

Rayleigh number satisfies:

$$
Ra=Gr\cdot Pr.
$$

While designing the validation, I noticed a trap. If `rayleigh()` simply returned `grashof()*prandtl()`, a test comparing the two sides would always pass. It would compare an expression with itself, so a shared implementation error could remain invisible.

I therefore implemented Rayleigh number through a separate, expanded path:

$$
Ra=\frac{g\beta\lvert\Delta T\rvert L^3\rho^2c_p}{\mu k}.
$$

I then generated 500 valid input sets with a fixed random seed. Density, expansion coefficient, temperature difference, length, viscosity, specific heat, and conductivity all varied independently. One path evaluated expanded $Ra$; the other calculated $Gr$ and $Pr$ separately and multiplied them. The worst relative difference was $4.4\times10^{-16}$.

This does not validate the physical equation itself. It checks that the powers, products, divisions, and argument order in the code agree across two independently written routes.

## I kept the whole study path in the repository

The project preserves more than a final number. I worked through it in layers:

1. Fix one hand-checkable Reynolds-number reference case.
2. Implement the six definitions with the smallest useful interface.
3. Add dimensional checks for unit-tagged inputs and physical-domain checks for values.
4. Enter fluid-property anchors with explicit temperature limits.
5. Exercise failure paths with invalid calls and correct paths with an independent identity.
6. Generate the speed sweep and validation summary only after the checks pass.

The source and reproduction commands are available at [gaoflow/dimensionless-numbers](https://github.com/gaoflow/dimensionless-numbers):

```bash
git clone https://github.com/gaoflow/dimensionless-numbers.git
cd dimensionless-numbers
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
PYTHONPATH=src python3 -m dimensionless_numbers reynolds \
  --rho 1.225 --u 15 --l 0.3 --mu 1.81e-5 --json
```

## The four results I retained

![Validation checks retained after the study](/images/projects/dimensionless-numbers/validation-summary.svg)

| Check | Observed result | Pass condition |
|---|---:|---:|
| Reference Reynolds number against hand calculation | 0.0 relative error | $\leq10^{-12}$ |
| $Ra=Gr\cdot Pr$ over 500 seeded samples | $4.4\times10^{-16}$ worst relative error | $\leq10^{-12}$ |
| Deliberately invalid calls | 10/10 rejected | 10/10 |
| Stored property-anchor fields | 20/20 exact | 20/20 |

The checks answer four different questions: Does the base equation calculate correctly? Do independent code paths agree? Do bad inputs stop? Does lookup return the entered anchors? Collapsing them into a single “tests passed” label would hide the useful part.

## How I use this sense of scale

With the same sea-level air properties, a 0.3 m chord at 15 m/s gives $Re\approx3.05\times10^5$. A separate full-car-scale reference using a 5 m length and 60 m/s gives $Re\approx2.03\times10^7$. Multiplying speed by 4 and length by about 16.7 multiplies Reynolds number by about 66.7.

![Reynolds number versus velocity for three characteristic lengths: a 0.3 m wing chord, a 1 m sidepod, and a 5 m full car](/images/projects/dimensionless-numbers/reynolds-sweep.svg)
*Speed and length together set the Reynolds-number scale. The three curves use a 0.3 m wing chord, a 1 m sidepod, and a 5 m full-car length; the two markers are the reference values calculated above.*

That difference reminds me not to transfer intuition blindly between a wing element, a cooling passage, and a whole vehicle just because they all involve air. Putting speed, length, and fluid properties into the same dimensionless ratio at least exposes when two cases occupy very different scales.

I still do not use Reynolds number alone to declare a flow laminar, transitional, or fully turbulent. Geometry, surface roughness, pressure gradient, free-stream turbulence, and boundary conditions all matter. The chart above only shows how the scale changes with speed and length; it is not a transition predictor.

## What this toolkit cannot do

- The property table has only five anchors: air from 300–400 K and water from 300–320 K.
- Interpolation is linear, has no pressure coupling, and never extrapolates.
- Mach number uses a perfect-gas speed of sound and includes no real-gas effects.
- The toolkit contains no transition, roughness, turbulence, or heat-transfer correlation model.
- Dimensional guards can check `Quantity` inputs, while bare floats still rely on the caller to use SI.
- Passing algebraic identities and unit tests is not experimental validation.

## What this small project changed for me

The useful outcome was not simply collecting six formulas. I established a sequence that I could reuse later: start with a hand-checkable reference, write the smallest model, test both correct and deliberately incorrect paths, and leave the data source, valid range, and unsupported claims beside the result.

This toolkit is small, but it taught me to treat “the program returned a number” and “the number is worth trusting” as two separate statements.
