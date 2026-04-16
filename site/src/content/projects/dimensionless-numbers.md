---
title: 'A Dimensionless-Number Toolkit That Catches Mistakes'
year: 2025
date: '2025-10-18'
status: complete
categories: [tooling]
tags: [CFD]
summary: 'I built a small toolkit that checks units, rejects unreasonable inputs, and keeps the validation on record.'
role: 'Solo research project'
duration: 'Independent build'
featured: false
order: 11
studySequence: 1
heroImage: /images/projects/dimensionless-numbers/source/reynolds-observations-1883.svg
github: 'https://github.com/gaoflow/dimensionless-numbers'
---

## Starting from Reynolds' glass tube experiment

This was the first research project I gave myself when I started my program. It didn't begin with code, but with an experiment from more than 140 years ago.

Soon after I started the fluid mechanics course, I learned that in 1883 Osborne Reynolds did a classic experiment. He ran water through a glass tube and injected a thin stream of dye into it. At low speed the dye stretched into a straight, thin line; open the valve wider, raise the speed, and the dye suddenly broke up and mixed with the surrounding water.

What interested me was his next judgement: whether the flow state changes abruptly doesn't depend on speed, diameter, or viscosity on its own, but on one ratio they form together. That ratio was later named after him:

$$
Re=\frac{\rho uL}{\mu}
$$

Same water, same tube. Just turn the speed up and the flow puts on a different face, and this ratio tells you roughly where the transition will happen. This idea was the first time I had seen several physical quantities put onto the same ruler before calculating.

Now picture a small fan blowing at about 3 m/s across a card 15 cm wide. Plug in sea-level air density $\rho=1.225\ \mathrm{kg/m^3}$ and dynamic viscosity $\mu=1.81\times10^{-5}\ \mathrm{Pa\cdot s}$:

$$
Re=\frac{1.225\times3\times0.15}{1.81\times10^{-5}}
\approx3.05\times10^4.
$$

The result has no unit; it is the ratio between "the inertia that keeps the fluid charging forward" and "viscosity's ability to smooth the flow out". The really useful part is that a fan, a racecar wing, and a whole car look nothing alike, yet they can all be compared inside the same ratio.

![How Reynolds number varies with speed at three length scales](/images/projects/dimensionless-numbers/reynolds-sweep.svg)

*Speed and length together set the order of magnitude of the Reynolds number. The three curves use a 0.3 m wing chord, a 1 m sidepod, and a 5 m full car.*

I drew a sketch. With the same sea-level air, a 0.3 m wing chord at 15 m/s gives $Re\approx3\times10^5$, and a 5 m full car at 60 m/s gives $Re\approx2\times10^7$, tens of times apart. When the Reynolds numbers are that far apart, the flows are not the same thing.
## So I wrote my first small tool

So before tackling any new problem, you have to compute these numbers first, to work out which scale you're sitting at and which effects matter. Whether it's airflow over a racecar wing or cooling-water heat transfer, the first step is always this. So I just put the six most-used ones into a small Python tool:

| Dimensionless number | What it helps me judge first |
|---|---|
| Reynolds | whether inertia or viscosity has the upper hand |
| Mach | whether compressibility needs to be considered |
| Prandtl | whether momentum or heat diffuses faster |
| Nusselt | how much convection beats pure conduction |
| Grashof | how strong buoyancy is relative to viscosity |
| Rayleigh | whether natural convection is worth considering |

The formulas are all one line; the inputs are where things go wrong. Dynamic viscosity and kinematic viscosity, for example, both sit near $10^{-5}$ numerically. Put one in the other's slot and a normal calculator still hands you a very plausible-looking number. So I gave the tool two checks:

- Unit check: every input must declare its unit. Put kinematic viscosity into the dynamic-viscosity slot and the program stops immediately and points out the problem.
- Range check: density and viscosity must be positive, velocity can't be negative, and a property lookup outside its temperature range raises an error instead of extrapolating.

I also built 10 invalid calls, and all 10 were caught; one fully unit-tagged normal call went through. I treated the property data with the same care: I entered five temperature anchors from a textbook appendix (three for air at 300–400 K, two for water at 300–320 K), used linear interpolation between anchors, and refused to extrapolate outside them. The lookup results return the entered values exactly on all 20 fields.

While verifying the Rayleigh number, I almost made a mistake. The Rayleigh number has an identity, $Ra=Gr\cdot Pr$. If I let the program just multiply Grashof by Prandtl for the result, and then tested that "the two sides are equal", that test would pass forever, because it compares the thing against itself, and an error shared by both sides can never show up. So I compute the Rayleigh number separately from its expanded form, then reconcile it against $Gr\times Pr$. Over 500 fixed-seed random input sets, the two independent paths differed by at most $4.4\times10^{-16}$.

## Code

The source and tests are at [gaoflow/dimensionless-numbers](https://github.com/gaoflow/dimensionless-numbers):

```bash
git clone https://github.com/gaoflow/dimensionless-numbers.git
cd dimensionless-numbers
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
```
