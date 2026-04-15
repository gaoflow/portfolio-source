---
title: 'Estimating Cooling-Loop Flow Without the Hardware'
year: 2025
date: '2025-11-29'
status: complete
categories: [tooling]
tags: [CFD]
summary: 'A cooling-system pump labelled 40 L/min will not deliver 40 L/min once hoses, a radiator, and water passages are connected. I added those resistances to the model section by section, arrived at 26.22 L/min and 51.34 kPa, and checked the friction factor, the loop pressure drop, and the intersection of the two curves.'
role: 'Hydraulics & numerical methods'
duration: 'Independent study'
featured: false
order: 13
studySequence: 3
heroImage: /images/projects/pipe-flow-sizing/reference/split-case-centrifugal-pump.jpg
cardImageFit: cover
github: 'https://github.com/gaoflow/pipe-flow-sizing'
---

## The datasheet's 40 L/min is not the real number

I built this project in the third month of my first year of the mechanical engineering master's. The team was discussing the FSAE race car's cooling system, and a pump datasheet said "maximum flow 40 L/min". My job was to verify what 40 L/min actually delivers in practice.

That number has a condition attached: almost no resistance at the outlet. Once installed in the car, the water has to pass through hoses, bends, a radiator, and narrow water passages. It is a lot like a garden hose. Short and straight, the bucket fills quickly; make the hose longer, wind it around bends, and pinch one section narrower, and the flow drops even though the water source hasn't changed.

If I overestimated the flow here, the thermal calculations downstream could be full of decimal places and still describe the wrong working condition. So I needed to solve this problem:

> Given a pump curve and a series loop, at what flow rate does the pressure the pump delivers exactly make up for the pressure lost around the whole loop?

## The water circuit

To compute the flow, I first split the loop into four segments: suction hose, radiator core, engine water passages, and return hose. They connect end to end; the water flows through each one in turn and finally returns to the pump.

A series loop has one convenient property: the flow rate is the same in every segment. I only need to compute how much pressure each of the four segments loses, add them up, and get the pressure the whole loop needs at that flow rate.

| Element | Length | Internal diameter | $K$ |
|---|---:|---:|---:|
| Suction hose | 0.40 m | 16 mm | 1.5 |
| Radiator core | 0.15 m | 16 mm | 8.0 |
| Engine water passages | 0.50 m | 14 mm | 4.0 |
| Return hose | 0.60 m | 16 mm | 2.0 |

The radiator adds obvious resistance: the coolant does not cross one big open cavity; it has to split into many narrow passages.

<figure>
  <img src="/images/projects/pipe-flow-sizing/reference/automobile-radiator.jpg" alt="Aluminium automotive radiator" loading="lazy" style="max-width: 529px; margin-inline: auto;">
  <figcaption>An aluminium automotive radiator</figcaption>
</figure>

## Converting each component into a pressure drop

I used the same Darcy–Weisbach form to compute the pressure drop of every element:

$$
\Delta p=\left(f\frac{L}{D}+K\right)\frac{\rho V^2}{2}.
$$

The equation splits into two parts. $fL/D$ is the friction of water moving along the pipe wall; $K$ is the extra loss from bends, entrances, and the passages inside components. The final $\rho V^2/2$ depends on the water speed — the faster the water moves, the faster the pressure drop grows. Length, diameter, density, and velocity can all be plugged in directly. The genuinely awkward part is the friction factor $f$, so instead of rushing to solve the whole loop, I pulled $f$ out and checked it on its own first.

## Computing the friction factor

When the flow is calm, $f$ can be computed directly:

$$
f=\frac{64}{Re}.
$$

You can read this as a scale for the flow regime: at low values, viscosity dominates; as the number rises, the flow enters turbulence and wall roughness starts to affect friction. I took 200 points between $Re=100$ and 2300, and the program's results differed from $64/Re$ by 0.0.

Turbulence is more complicated. In the Colebrook equation, $f$ appears on both sides of the equals sign, so it needs repeated iteration. I used the [Haaland formula](https://doi.org/10.1115/1.3240948) to get a starting value close to the answer, then tightened it with Newton iteration. If it hasn't converged after 50 tries, the program raises an error rather than leaving behind a plausible-looking number. After solving, I substituted every $f$ back into the Colebrook equation. Across 150 combinations of Reynolds number and relative roughness, up to $Re=10^8$, the largest residual was $3.55\times10^{-15}$. At least as far as the equation itself is concerned, the solved $f$ holds up.

![Friction factors for laminar flow, a smooth pipe, and a rough pipe](/images/projects/pipe-flow-sizing/moody.svg)

## Fixing the range of the check

I used the explicit [Swamee–Jain formula](https://doi.org/10.1061/JYCEAJ.0004542) as a second route. Its declared accuracy is $\pm3\%$, but it is only guaranteed inside this range:

$$
5\times10^3\le Re\le10^8,\qquad
10^{-6}\le\varepsilon/D\le10^{-2}.
$$

On the first comparison I had set the range too wide. Where the roughness was very low and $Re$ was close to $4\times10^3$, the two results differed by more than 3%. I first suspected my Colebrook solver was wrong, and only later realised those points had already run outside Swamee–Jain's accuracy promise. So I pulled the 3% acceptance range back inside the formula's declared interval, and the largest difference became 2.83%. That failure didn't change the Colebrook solver; it changed the test range. It also reminded me: a reference formula has boundaries too — don't let it act as judge over all working conditions just because it comes from a paper.

With the friction factor past both checks, I could reconnect the four pipe segments.

## Pinning down the flow rate

I first guessed a trial flow rate, computed the four pressure drops in turn, and added them up:

$$
\Delta p_{sys}(Q)=\sum_i \Delta p_i(Q).
$$

Repeating the calculation over a batch of flow rates gives the system curve. The larger the flow, the more pressure the loop consumes, so this curve climbs. The pump supplies another curve. The pump at the top of this page is driven by the engine through a pulley, and the impeller inside the casing adds energy to the water. But a pump does not force the same flow out against every level of resistance. This project replaces real pump data with a simple quadratic curve:

$$
\Delta p_{pump}=90\ \text{kPa}-cQ^2.
$$

It delivers 90 kPa at zero flow, and the pressure falls to zero at 40 L/min. The flow the system can actually reach is the intersection of the pump curve and the system curve:

$$
\Delta p_{pump}(Q)-\Delta p_{sys}(Q)=0.
$$

The program first looks for the intersection with Newton iteration. If the next step runs out of the known interval, it falls back to the interval midpoint and uses bisection as a safety net.

![Pump curve and system curve](/images/projects/pipe-flow-sizing/pump-operating-point.svg)

The two curves intersect at 26.22 L/min and 51.34 kPa. In other words, with these substitute parameters, connecting the 40 L/min free flow to the loop loses about a third of it.

A numerical solver can give you many decimal places, but more decimals don't mean the setup is right. So I took 4096 evenly spaced points between 0 and 40 L/min and directly looked for where the two curves cross from one side to the other. This slow scan bracketed the intersection between 26.2173 and 26.2271 L/min, and the Newton result fell inside it. At this operating point, the pump pressure and the system pressure drop differ by at most $2.18\times10^{-11}$ Pa. I also checked a few of the most basic physical relations. When the flow increases, the system pressure drop must rise; adding 10 kPa of static pressure must push the operating flow down; and the whole loop's pressure drop must equal the sum of the four segments. Only after confirming the intersection did the study return to the most practical question: which segment hurts the most?

## Where the 51.34 kPa goes

![Pressure loss of the four loop elements](/images/projects/pipe-flow-sizing/pressure-loss-breakdown.svg)

At the operating point, the suction hose loses 4.89 kPa, the radiator core loses 19.37 kPa, the engine water passages lose 20.33 kPa, and the return hose loses 6.75 kPa. The four add up to 51.34 kPa. The radiator core and the engine water passages together account for 39.70 kPa, about 77% of the total drop. Across the whole loop, the $K$ terms account for 43.19 kPa, or 84.1%; straight-pipe friction accounts for 8.14 kPa, or 15.9%.

So, under these assumptions, reducing the resistance of the core and the water passages first is more effective than shortening the hoses a little more. But that judgement only holds for the current geometry and $K$ values; with measured parts, the proportions could change.

## Summary

To sum up: 40 L/min is just the pump's free flow when there is almost no resistance. Connected into a real loop, the operating point lands at 26.22 L/min and 51.34 kPa — about a third less. And I traced where the pressure is spent: about 77% of the 51.34 kPa is lost in the radiator core and the engine water passages, so if you want to improve the flow, that's where you have to start.

When we see a flow number, we need to ask what pressure goes with it, and then look at how much pressure the real plumbing needs. Only when the pump and the loop are considered together does a flow rate mean anything. The failed Swamee–Jain comparison also reminds us: when results don't line up, check the object you're computing and the applicable range of the reference formula together.

That said, 26.22 L/min is not necessarily the design flow of the real car. Many things are still simplified: the pump curve is a substitute quadratic; the $K$ values are handbook orders of magnitude, not bench measurements; the model only covers steady, incompressible, single-phase flow, with no cavitation, entrained air, or NPSH checks; and the loop can only be in series. The next step is to swap in the real pump curve and measured component pressure-drop data, then add parallel branches and a thermal model, and check further.

## Code

The complete code and tests are in [gaoflow/pipe-flow-sizing](https://github.com/gaoflow/pipe-flow-sizing):

```bash
git clone https://github.com/gaoflow/pipe-flow-sizing.git
cd pipe-flow-sizing
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
```

References: the formulas come from the Haaland friction estimate, the Swamee–Jain cross-check, and the original [Colebrook paper](https://doi.org/10.1680/ijoti.1939.13150).
