---
title: 'How I Estimated Cooling-Loop Flow Before the Hardware Existed'
year: 2025
date: '2025-11-29'
status: complete
categories: [tooling]
tags: [CFD]
summary: 'A pump labelled 40 L/min will not deliver 40 L/min after it is connected to hoses, a radiator and cooling passages. I added those restrictions one by one, found a representative operating point of 26.22 L/min at 51.34 kPa, and checked the friction, loop loss and curve intersection.'
role: 'Hydraulics & numerical methods'
duration: 'Independent study'
featured: false
order: 13
studySequence: 3
heroImage: /images/projects/pipe-flow-sizing/reference/pump-cutaway.jpg
cardImageFit: cover
github: 'https://github.com/gaoflow/pipe-flow-sizing'
---

## The pump says 40 L/min. What reaches the car?

I built this project in the third month after moving from software engineering into mechanical engineering. At the time, the team was discussing the FSAE racecar cooling system. One pump datasheet listed a maximum flow of 40 L/min. The easy option was to copy that number into the radiator calculation.

The number came with a condition: almost no resistance at the outlet. Once installed, the coolant must pass through hoses, bends, a radiator and narrow cooling passages. A garden hose behaves in the same way. A short, straight hose fills a bucket quickly. Make it longer, add several bends and squeeze one section, and the same water supply delivers less flow.

If I overestimated the flow here, the later thermal model could be numerically precise and still describe the wrong condition. The question I wanted to answer was:

> Given a pump curve and a series loop, what flow rate makes the pump pressure exactly equal to the pressure lost around the loop?

I did not yet have measured pump, radiator or water-jacket data. This study therefore checks the calculation method with declared substitute inputs. The result of 26.22 L/min is not a measured vehicle flow rate.

The header shows a cutaway centrifugal-pump display, not team hardware. Photo: S.J. de Waard, [CC BY 2.5](https://creativecommons.org/licenses/by/2.5/), via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Pump_(Cut-Away).JPG).

## The route the coolant must follow

I split the loop into four elements: a suction hose, radiator core, engine gallery and return hose. They connect end to end, so the coolant passes through each one before returning to the pump.

![Series cooling loop](/images/projects/pipe-flow-sizing/cooling-loop-schematic.svg)

A series loop has one useful property: the flow rate is the same through every element. I can calculate the pressure lost in each part, add the four losses, and obtain the pressure required by the complete loop at that flow rate.

| Element | Length | Internal diameter | $K$ |
|---|---:|---:|---:|
| Suction hose | 0.40 m | 16 mm | 1.5 |
| Radiator core | 0.15 m | 16 mm | 8.0 |
| Engine gallery | 0.50 m | 14 mm | 4.0 |
| Return hose | 0.60 m | 16 mm | 2.0 |

The example uses water properties at 20 °C. The dimensions and $K$ values are representative inputs for checking the method, not measurements from the car.

A real radiator makes this restriction easier to picture. Coolant does not cross one large empty chamber. It divides between many narrow internal passages.

<figure>
  <img src="/images/projects/pipe-flow-sizing/reference/automobile-radiator.jpg" alt="Aluminium automotive radiator" loading="lazy" style="max-width: 529px; margin-inline: auto;">
  <figcaption>Aluminium automotive radiator · Bill Wrigley · <a href="https://commons.wikimedia.org/wiki/File:Automobile_radiator.jpg">Wikimedia Commons</a> · public domain</figcaption>
</figure>

## Turning every element into a pressure loss

I calculated the pressure loss of each element with the same Darcy-Weisbach form:

$$
\Delta p=\left(f\frac{L}{D}+K\right)\frac{\rho V^2}{2}.
$$

The equation keeps two accounts. The term $fL/D$ covers friction along the pipe wall. The coefficient $K$ covers bends, entrances and restrictive passages inside components. The final term, $\rho V^2/2$, sets the pressure scale. As the coolant moves faster, the loss rises quickly. The [Hydraulic Institute system-curve guide](https://datatool.pumps.org/pump-fundamentals/sys-curves) uses the same separation.

Length, diameter, density and velocity can be inserted directly. The awkward part is the friction factor $f$. Before solving the complete loop, I checked this part on its own.

## Checking the hardest part first

When the flow is laminar, $f$ has a direct solution:

$$
f=\frac{64}{Re}.
$$

The Reynolds number $Re$ is a scale for the flow regime. At lower values, viscosity dominates. As it rises and the flow becomes turbulent, pipe roughness also begins to affect friction.

I tested 200 points between $Re=100$ and 2300. The computed values differed from $64/Re$ by 0.0.

Turbulent flow is less direct. The friction factor appears on both sides of the Colebrook equation, so the program must approach the answer through iteration. I used the [Haaland formula](https://doi.org/10.1115/1.3240948) for a close starting value, then refined it with Newton iteration. If it has not converged after 50 iterations, the program raises an error instead of keeping a plausible-looking number.

I then substituted every calculated $f$ back into the Colebrook equation. Across 150 combinations of Reynolds number and relative roughness, reaching $Re=10^8$, the largest residual was $3.55\times10^{-15}$. The values therefore satisfied the equation they were meant to solve.

![Friction factors for laminar flow, a smooth pipe and a rough pipe](/images/projects/pipe-flow-sizing/moody.svg)

Substitution checks only whether I solved the equation correctly. I still needed a second route to judge the result.

## The first comparison failed because I tested the wrong range

I used the explicit [Swamee-Jain formula](https://doi.org/10.1061/JYCEAJ.0004542) as that second route. Its reported accuracy is $\pm3\%$, within this range:

$$
5\times10^3\le Re\le10^8,\qquad
10^{-6}\le\varepsilon/D\le10^{-2}.
$$

My first comparison used a wider range. At very low roughness near $Re=4\times10^3$, the two results differed by more than 3%. I first suspected the Colebrook solver. The failing points, however, were outside the range where Swamee-Jain claimed that accuracy.

I restricted the 3% acceptance check to the published range. The largest difference was then 2.83%. The Colebrook solver did not change; the test range did. A published reference still has limits, and outside them it cannot serve as the judge.

Only after these two checks passed did I reconnect the four loop elements.

## The flow is fixed where the pump and loop meet

I chose a trial flow, calculated the pressure loss of all four elements, and added them:

$$
\Delta p_{sys}(Q)=\sum_i \Delta p_i(Q).
$$

Repeating this calculation over a range of flows produces the system curve. Higher flow means higher loop loss, so the curve rises.

The pump supplies the other curve. The cutaway at the top shows a motor, impeller and casing. The impeller adds energy to the coolant, but a pump does not force one fixed flow through every level of resistance. For this study, I used a simple quadratic curve in place of measured pump data:

$$
\Delta p_{pump}=90\ \text{kPa}-cQ^2.
$$

It provides 90 kPa at zero flow and reaches zero pressure at 40 L/min. The installed flow is where the two curves meet:

$$
\Delta p_{pump}(Q)-\Delta p_{sys}(Q)=0.
$$

The program starts with Newton iteration. If the next step leaves the known interval, it returns to the interval midpoint and uses bisection as a safe fallback.

![Pump curve and system curve](/images/projects/pipe-flow-sizing/pump-operating-point.svg)

The curves meet at **26.22 L/min and 51.34 kPa**. With these substitute inputs, connecting the loop cuts the 40 L/min free-delivery value by about one third.

## Finding the same answer the slow way

A numerical root finder can return many decimal places even when the setup is wrong. I therefore sampled the complete range from 0 to 40 L/min at 4096 points and looked directly for the place where one curve crossed the other.

This scan bracketed the crossing between 26.2173 and 26.2271 L/min. The earlier solution fell inside that interval. Across the retained runs, the pump pressure and loop loss differed by no more than $2.18\times10^{-11}$ Pa at the solution.

I also checked the basic behaviour of the model. Loop loss had to increase with flow. Adding 10 kPa of static pressure had to reduce the operating flow. The total loop loss also had to equal the sum of the four element losses. That sum differed by 0.0 Pa at the operating point and at 24 additional flow values.

These checks do not show that the substitute inputs represent a real car. They do show that the model is internally consistent. Once the crossing survived them, I could ask the practical question: which part of the loop is most restrictive?

## Where the 51.34 kPa goes

![Pressure loss across the four loop elements](/images/projects/pipe-flow-sizing/pressure-loss-breakdown.svg)

At the operating point, the suction hose loses 4.89 kPa, the radiator core 19.37 kPa, the engine gallery 20.33 kPa, and the return hose 6.75 kPa. Together they give 51.34 kPa.

The radiator core and engine gallery account for 39.70 kPa, or about 77% of the total. Across the complete loop, the $K$ terms contribute 43.19 kPa, or 84.1%, while straight-pipe friction contributes 8.14 kPa, or 15.9%. With these assumptions, reducing resistance in the core and gallery would matter more than shortening a small length of hose.

This ranking applies only to the current geometry and $K$ values. Measured components could change it.

## How far this result can be used

The calculation shows why a thermal model should not copy a pump's free-delivery flow. Given a pump curve, diameters, lengths, roughness and component losses, the same method can find the operating point.

It does not establish that the racecar will flow at 26.22 L/min. The pump curve is a substitute, and the $K$ values are handbook-scale estimates rather than bench measurements. The model covers steady, incompressible, single-phase flow. It has no cavitation, air-entrainment, efficiency or NPSH check. It also switches directly between laminar and turbulent formulas at $Re=2300$ and handles only series loops, not parallel branches.

The next useful step would be to insert measured pump and component curves, add parallel branches, and couple the resulting flow to the thermal model. I did not complete those steps in this study.

## What changed in how I work

Before this project, I looked at a pump and saw one flow-rate number. I now ask what pressure goes with that number and how much pressure the installed route requires. The pump and loop must be considered together before the flow has meaning.

The failed Swamee-Jain comparison also changed my checking order. When two results disagree, I check both the calculation and the reference method's range. Only after the basic hydraulic calculation passes those checks do I use it in a larger thermal model.

## Reproduction and sources

The complete code and tests are available in [gaoflow/pipe-flow-sizing](https://github.com/gaoflow/pipe-flow-sizing):

```bash
git clone https://github.com/gaoflow/pipe-flow-sizing.git
cd pipe-flow-sizing
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
```

The friction references are the Haaland estimate, the Swamee-Jain cross-check, and the original [Colebrook paper](https://doi.org/10.1680/ijoti.1939.13150).
