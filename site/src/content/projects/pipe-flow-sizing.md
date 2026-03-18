---
title: 'How I Calculated the Actual Cooling-Loop Flow'
year: 2025
date: '2025-11-29'
status: complete
categories: [tooling]
tags: [CFD]
summary: 'I combined pipe friction, minor losses, a series network, and a pump curve in one hydraulic model, giving a representative operating point of 26.22 L/min at 51.34 kPa, then checked the friction equations, curve intersection, and pressure closure.'
role: 'Hydraulics & numerical methods'
duration: 'Independent study'
featured: false
order: 13
studySequence: 3
heroImage: /images/projects/pipe-flow-sizing/moody.svg
---

## Origin: a pump rated at 40 L/min, but how much flows in the car?

The origin of this hydraulic solver was a team discussion on racecar cooling, where a pump datasheet proudly claimed '40 L/min maximum free flow'. Some assumed we could size our heat exchanger directly for 40 L/min.

I knew that assumption was flawed: once connected to convoluted hoses, dense radiator micro-tubes, and narrow motor cooling jackets, hydraulic resistance drops the delivery rate significantly.

To calculate the actual coolant flow inside a real chassis, I built this hydraulic network solver. It couples Colebrook-White friction and component loss coefficients to find the exact intersection between pump curve and system resistance.

## How I calculated pipe friction

For laminar flow, I used the analytical relation

$$
f=\frac{64}{Re}.
$$

I checked this identity at 200 Reynolds numbers and found zero floating-point error.

For turbulent flow, I solved the implicit Colebrook equation. I used the [Haaland](https://doi.org/10.1115/1.3240948) formula to provide an initial guess, then applied Newton iteration to $x=1/\sqrt f$. The solver allows at most 50 iterations. If it still has not converged, it raises an error instead of returning an unsupported friction factor.

I also substituted each solved value of $f$ back into the Colebrook equation. Across 150 $(Re,\varepsilon/D)$ combinations reaching $Re=10^8$, the maximum residual was $3.55\times10^{-15}$.

## The cross-check had its own limits

I used the explicit [Swamee–Jain](https://doi.org/10.1061/JYCEAJ.0004542) formula as a second calculation route. Its published validity range is

$$
5\times10^3\le Re\le10^8,\qquad
10^{-6}\le\varepsilon/D\le10^{-2},
$$

with a stated accuracy of $\pm3\%$.

Within that range, the maximum difference between my Colebrook results and Swamee–Jain was 2.83%, which is inside the stated accuracy band. Outside the range, especially near $Re=4\times10^3$ at low relative roughness, the difference exceeded 3%.

That did not mean the Colebrook solver was wrong. It meant the cross-check itself had been used outside its stated range. This changed how I interpret failed checks: before blaming the result under test, I first ask whether the reference method is still valid.

## The operating point was not the pump's free-delivery flow

I built a representative series loop containing a suction hose, radiator core, engine gallery, and return hose. I represented its total pressure loss as

$$
\Delta p_{sys}(Q).
$$

For the pump, I used the explicitly defined quadratic stand-in

$$
\Delta p_{pump}=90\ \text{kPa}-cQ^2,
$$

with a free-delivery flow of 40 L/min. This was a substitute curve for validating the method, not measured vendor data.

The actual operating point satisfies

$$
\Delta p_{pump}(Q)-\Delta p_{sys}(Q)=0.
$$

I found the intersection by bisection. The resulting operating point was **26.22 L/min at 51.34 kPa**, with an intersection residual of $2.18\times10^{-11}$ Pa.

As an independent check, a brute-force scan with 4096 samples bracketed the intersection within $[26.2173,26.2271]$ L/min. The bisection result fell inside that interval.

![Pump curve, system resistance curve, and final operating point](/images/projects/pipe-flow-sizing/pump-operating-point.svg)

## Where the pressure loss occurred

| Element | $Re$ | $f$ | $\Delta p$ |
|---|---:|---:|---:|
| Suction hose, 0.40 m, 16 mm, $K=1.5$ | 34 654 | 0.0230 | 4.89 kPa |
| Radiator core, 0.15 m, 16 mm, $K=8.0$ | 34 654 | 0.0230 | 19.37 kPa |
| Engine gallery, 0.50 m, 14 mm, $K=4.0$ | 39 605 | 0.0296 | 20.33 kPa |
| Return hose, 0.60 m, 16 mm, $K=2.0$ | 34 654 | 0.0230 | 6.75 kPa |
| **Total** | | | **51.34 kPa** |

About 78% of the pressure loss came from the minor losses in the radiator core and engine gallery. In this representative loop, further reducing straight-pipe friction was not the main opportunity. Reducing the resistance of the core and engine passages would matter more.

The total pressure loss matched the sum of the four element losses exactly. The closure error was 0.0 Pa at the operating point and at 24 additional flow values.

## How I checked that the result was not accidentally correct

| Check | Result | Requirement |
|---|---:|---:|
| Laminar $f=64/Re$ | Maximum difference 0.0 | $\le10^{-12}$ |
| Colebrook implicit residual | $3.55\times10^{-15}$ | $<10^{-12}$ |
| Swamee–Jain difference within its validity range | 2.83% | $\le3\%$ |
| Operating-point residual | $2.18\times10^{-11}$ Pa | $<10^{-10}$ Pa |
| Network pressure closure | 0.0 Pa | Relative value $<10^{-12}$ |

I also checked several physical trends that the model should preserve. Increasing the static pressure rise had to reduce the operating flow. Increasing a minor-loss coefficient had to move the system curve upward, and increasing roughness had to increase turbulent friction.

## What the model still lacks

The model is steady, incompressible, and single-phase. It has no cavitation or NPSH check, and it does not use a real pump curve, so it is not suitable for final pump selection.

The minor-loss coefficients are handbook order-of-magnitude values and therefore carry substantial uncertainty. The model switches directly between laminar and turbulent flow at $Re=2300$, with no transition region. The network solver also supports only series topologies and cannot yet handle parallel branches.

These limitations identified the work still needed in the later cooling-system project: real pump and radiator data, parallel flow paths, thermal coupling, and transient temperature rise.



## Practical applications: matching pump operating points for FSAE racecar cooling

In the Vinci EcoDrive FSAE racecar cooling system, pump datasheets typically quote free-flow delivery (e.g. 40 L/min at zero head), but real vehicle installations incur major pressure drops through hoses, radiator micro-tubes, and motor jackets.

Using this hydraulic network solver to couple component loss coefficients ($K$) with Colebrook-White pipe friction and bisect for the true intersection between pump curve and system resistance yielded the actual loop operating point: 26.22 L/min at 51.34 kPa. It revealed that 78% of loop resistance was concentrated in the core and water jacket, providing the exact mass flow boundary for subsequent thermal balance models.

## What I learned

This was the first time I treated the pump and cooling loop as two separate curves instead of assuming that the pump's nominal flow was the system flow.

It also established an order of work that I continued to use: verify the friction factor, implicit-equation residual, and network pressure closure before allowing those results into a more complex thermal-fluid model. If a foundational calculation is only almost correct, the final system-level conclusion can still be completely wrong.

## Code and reproduction

The source code is open source on GitHub: [gaoflow/pipe-flow-sizing](https://github.com/gaoflow/pipe-flow-sizing)

```bash
git clone https://github.com/gaoflow/pipe-flow-sizing.git
cd pipe-flow-sizing
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
```
