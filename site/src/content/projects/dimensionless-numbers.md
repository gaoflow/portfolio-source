---
title: 'A Dimensionless Numbers Tool That Catches Mistakes'
year: 2025
date: '2025-10-18'
status: complete
categories: [tooling]
tags: [CFD]
summary: 'I built a small utility that enforces unit consistency, rejects unphysical inputs, and retains full validation records.'
role: 'Personal Research Project'
duration: 'Independent Development'
featured: false
order: 11
studySequence: 1
heroImage: /images/projects/dimensionless-numbers/source/reynolds-observations-1883.svg
github: 'https://github.com/gaoflow/dimensionless-numbers'
---

## Starting from Reynolds' Glass Tube Experiment

This was the first research project I assigned myself when starting my studies. The catalyst was not writing code, but an experiment conducted over 140 years ago.

When first learning fluid mechanics, I read about Osborne Reynolds' famous 1883 experiment. He passed water through a glass tube while injecting a thin filament of colored dye into the stream. At low velocities, the dye remained a straight, intact streamline. When he opened the valve to increase the flow velocity, the dye suddenly dispersed and mixed chaotically with the surrounding water.

What struck me was his subsequent insight: whether the flow regime undergoes a transition does not depend on velocity, pipe diameter, or fluid viscosity in isolation, but on their combined dimensionless ratio. This ratio was later named in his honor:

$$
Re=\frac{\rho uL}{\mu}
$$

With the same water in the same tube, increasing only the velocity fundamentally changes the flow regime, and this dimensionless ratio predicts where that transition is likely to occur. It was my first exposure to the philosophy of normalizing disparate physical variables onto a common scale before performing computations.

Consider a practical scenario: a small desk fan blows air at roughly 3 m/s across a 15 cm wide index card. Substituting sea-level air density $\rho=1.225\ \mathrm{kg/m^3}$ and dynamic viscosity $\mu=1.81\times10^{-5}\ \mathrm{Pa\cdot s}$:

$$
Re=\frac{1.225\times3\times0.15}{1.81\times10^{-5}}
\approx3.05\times10^4.
$$

The result is strictly dimensionless—the ratio of fluid momentum (inertia) to viscous diffusion (the fluid's ability to smooth out velocity gradients). Its utility lies in comparability: a fan, an aerodynamic wing, and an entire race car appear entirely different, yet can be evaluated on the same benchmark scale.

![Reynolds number variation with velocity across three length scales](/images/projects/dimensionless-numbers/reynolds-sweep.svg)

*Velocity and characteristic length together determine Reynolds number magnitude; curves represent 0.3 m wing chord, 1 m sidepod, and 5 m full vehicle*

In sea-level air, a 0.3 m wing chord at 15 m/s yields $Re\approx3\times10^5$, while a 5 m vehicle at 60 m/s reaches $Re\approx2\times10^7$—differing by orders of magnitude. When Reynolds numbers differ significantly, the underlying flow physics are fundamentally distinct.

## Building My First Engineering Tool

Before tackling any new fluid mechanics problem, calculating these dimensionless parameters is the necessary first step to understand the relevant scales and dominant physical effects. Whether analyzing external airflow over a wing or internal heat transfer in a cooling jacket, this evaluation must come first. I packaged the six most common dimensionless numbers into a dedicated Python utility:

| Dimensionless Number | Initial Physical Question It Answers |
|---|---|
| Reynolds ($Re$) | Does inertia or viscosity dominate the flow? |
| Mach ($M$) | Should fluid compressibility be accounted for? |
| Prandtl ($Pr$) | Does momentum or thermal diffusion propagate faster? |
| Nusselt ($Nu$) | How much does convective heat transfer exceed pure conduction? |
| Grashof ($Gr$) | What is the relative strength of buoyancy forces versus viscous forces? |
| Rayleigh ($Ra$) | Is natural convection significant in the system? |

While the formulas are straightforward single-line expressions, user input errors are common. For instance, dynamic viscosity and kinematic viscosity can have numerical values around $10^{-5}$ in different unit systems; a swapped variable in a basic calculator will still return a seemingly plausible number without warning. I built two defensive checks into the tool:

- **Unit Verification**: Every input must declare explicit physical units; passing kinematic viscosity where dynamic viscosity is expected immediately halts execution with an explanatory error;
- **Range & Boundary Checks**: Density and viscosity must be strictly positive, velocity cannot be negative, and thermodynamic property lookups raise errors outside defined temperature bounds rather than extrapolating.

I implemented a test suite with 10 deliberate invalid calls—all 10 were successfully intercepted, while fully specified, valid calls passed without friction. Thermophysical property data was handled with equal rigor: five temperature anchor points from textbook reference tables were integrated (three for air across 300–400 K, two for water across 300–320 K) with linear interpolation between anchors and strict extrapolation rejection. Property lookups matched tabulated values across all 20 reference fields.

During Rayleigh number validation, I caught a potential testing pitfall. The Rayleigh number satisfies the mathematical identity $Ra = Gr \cdot Pr$. If the solver simply computed $Gr \times Pr$ and a unit test checked that `Ra == Gr * Pr`, the test would pass trivially because the two sides share the exact same implementation, concealing internal calculation bugs. Instead, I computed $Ra$ independently from its fundamental constituent variables and reconciled it against the product $Gr \times Pr$. Across 500 fixed randomized test inputs, the maximum discrepancy between the two independent evaluation paths was only $4.4\times10^{-16}$.

## Code

The source code and test suite are open-source at [gaoflow/dimensionless-numbers](https://github.com/gaoflow/dimensionless-numbers):

```bash
git clone https://github.com/gaoflow/dimensionless-numbers.git
cd dimensionless-numbers
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
```
