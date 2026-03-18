---
title: 'Ground Effect VLM — Image-Vortex Ride-Height Study'
year: 2026
date: '2026-04-25'
status: complete
categories: [validation, tooling]
tags: [CFD]
summary: 'I wrote a from-primitives horseshoe-vortex solver that isolates ground-image effects, sweeps ride height, and exposes exactly where the linear model stops earning trust.'
role: 'Aerodynamics & numerical methods'
duration: 'Independent study'
featured: false
order: 6
studySequence: 13
heroImage: /images/projects/ground-effect-vlm/ground-sweep.svg
github: 'https://github.com/gaoflow/ground-effect-vlm'
---

## Origin: why does downforce surge when a wing approaches the road?

The origin of this project was studying racecar aerodynamics and watching F1 cars, where commentators constantly emphasize 'ground effect'—the dramatic surge in downforce as a wing approaches the road plane.

I wanted to understand the clean physics: how does an impermeable boundary alter circulation and induce downforce without direct physical contact? Why does that benefit collapse at extreme proximity?

On a full car, underfloors, rotating wheels, diffuser fences, and edge vortices obscure the pure ground interaction. To isolate this mechanism, I built an image-vortex Vortex Lattice Method (VLM).

## How I represented the ground with image vortices

I used a rectangular wing with an aspect ratio of 4. The bound vortices sit at quarter-chord, the control points at three-quarter-chord, and the trailing legs extend 80 chords downstream.

For every real horseshoe vortex, I placed an image vortex with reversed circulation below the ground. The vertical velocities induced by the real and image vortices cancel on the $z=0$ plane, enforcing the no-penetration boundary condition.

The production sweep uses 64 spanwise panels at a fixed incidence of $4^\circ$. It covers 14 states from $h/c=0.25$ to 50.

The solver first assembles and solves

$$
A\Gamma=b
$$

for the spanwise circulation. It then integrates lift using Kutta–Joukowski and calculates induced drag from the Trefftz-plane downwash.

![Normalised span loading across selected ride heights](/images/projects/ground-effect-vlm/span-loading.svg)

## Three results that must be read separately

In free air, the model gives $C_L=0.2615$ and $C_{D_i}=0.00549$.

At $h/c=0.5$:

- fixed-incidence lift increases by 32.4% to $C_L=0.3461$;
- absolute induced drag becomes 0.00559, so it barely changes and does not decrease;
- $C_{D_i}/C_L^2$ falls by 41.9%.

The supported conclusion is that the induced-drag cost is lower for a required lift.

The model does not support the claim that bringing a wing closer to the ground must reduce its absolute drag. Reporting only the efficiency measure without noting the increase in lift would misrepresent the change in its denominator.

## How I checked the image boundary and discretisation

| Check | Observed | Requirement |
|---|---:|---:|
| Ground normal-velocity residual | 0.0 | $<10^{-12}$ |
| Lift difference between $h/c=50$ and free air | 0.00335% | $<0.1$% |
| Lift-slope difference from the Prandtl estimate | 11.01% | $<12$% |
| Lift change from 64 to 96 panels | 0.258% | $<1$% |
| Left–right loading symmetry error | $1.94\times10^{-16}$ | $<10^{-12}$ |

The solver also checks the normal velocity directly at 257 points on the ground plane. Far from the ground, the image-vortex influence should disappear, so the recovery at $h/c=50$ provides a separate check.

![Free-air recovery, lift-slope, and panel-refinement checks](/images/projects/ground-effect-vlm/verification.svg)

I retained the 11.01% lift-slope difference instead of calibrating it away. The panel-refinement change is only 0.258%, while the far-ground recovery difference is only 0.00335%. Together, these results indicate that the remaining difference is mainly due to model form rather than a problem that further panel refinement would solve.

## The lowest ride height exposed the linear model’s limit

At $h/c=0.25$, the model predicts $C_L=0.5419$, or 2.07 times the free-air lift. The conventional span-efficiency indicator reaches 2.59.

This is not a race-car design result. It is a warning that the linear model has begun to amplify its own mechanism. Reducing the ride height further would increase the numerical magnitude without adding more realistic physics.

I therefore set $h/c=0.25$ as the lower bound of the sweep. I kept this failure endpoint visible rather than deleting it or extrapolating to still lower ride heights.

The conventional free-air efficiency expression can exceed one here because the ground changes the boundary-value problem. It remains useful as a comparison measure, but it cannot be interpreted as an ordinary aircraft Oswald efficiency.

## What the model is suitable for

| Use | Suitability | Reason |
|---|---|---|
| Checking the sign and scale of ground effect | Suitable | The image-vortex mechanism is isolated |
| Defining a bounded ride-height sweep | Suitable | All 14 states use the same solver |
| Providing a low-cost reference for higher-fidelity models | Suitable | Trends and far-ground recovery can be checked |
| Comparing race-car floor geometries | Not suitable | There is no floor, diffuser, leakage, or tyre interaction |
| Predicting separation or stall | Not suitable | The model is inviscid and linear |

The model is steady, incompressible, inviscid, linear, and zero-thickness. It contains no road boundary layer, body blockage, pressure recovery, or flow separation.

## What the next model needs

The next step should first add finite thickness and chordwise loading. Vehicle complexity can then be introduced progressively through a moving-ground boundary layer, ride-height and pitch variation, tyres, leakage, a diffuser, and grid-sensitivity checks.

The low-order result should remain a reference for sign and scale. It should not be recalibrated after seeing the RANS result.

## Code and reproduction

The source code is open source on GitHub: [gaoflow/ground-effect-vlm](https://github.com/gaoflow/ground-effect-vlm)

```bash
git clone https://github.com/gaoflow/ground-effect-vlm.git
cd ground-effect-vlm
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
```

## Practical applications: exploring aerodynamic ground-effect windows for racecar wings

Racecar wings operating close to the road experience powerful ground-effect coupling. Running full 3D CFD sweeps across ride heights and pitch angles is computationally demanding.

Using this image-vortex VLM, I swept 14 continuous ride heights from $h/c=0.25$ to $h/c=50$ instantaneously, revealing spanwise circulation redistribution and demonstrating that at $h/c=0.5$, lift increases by 32.4% while induced drag per unit lift squared drops by 41.9%, providing directional guidance for wing clearance settings.

## What I learned

The most valuable result was not the maximum lift, but the $h/c=0.25$ endpoint where the model was no longer worth trusting.

I also learned to report fixed-incidence lift, absolute induced drag, and induced-drag cost per lift squared separately. These quantities answer different questions, and combining them into a single claim that “efficiency improved” would hide the actual change.
