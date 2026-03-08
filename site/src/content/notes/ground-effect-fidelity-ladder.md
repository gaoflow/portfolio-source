---
title: 'Why I Built a Ground-Effect Ladder Before Running Full-Car CFD'
image: /images/notes/covers/ground-effect-fidelity-ladder.svg
published: 2026-08-05
summary: 'I wanted one simple way to decide when an image-vortex model is enough, when I need viscous CFD, and when only a tunnel or track comparison can answer the question.'
tags: [CFD]
sourceProjects: [ground-effect-vlm, airfoil-methods, f1-2026-aero]
featured: false
order: 4
---

Ground effect is easy to make look impressive. Put a wing near a floor, colour the pressure field, and almost any image starts to feel like an explanation.

I wanted a way to stop myself from trusting the prettiest picture. So I wrote a ladder: start with the cheapest model that contains the mechanism I care about, and climb only when the next question requires more physics.

## I begin with signs and definitions

Before solving anything, I write down the span, chord, reference area, ride-height definition, angle-of-attack sign, downforce sign, ground reference frame, and coefficient normalisation.

This sounds boring, but ground-effect comparisons often disagree because one person measured minimum floor clearance and another used quarter-chord height, or because one coefficient used planform area and another used frontal area.

If those definitions are wrong, a more expensive solver only gives me a more expensive disagreement.

## My first useful model was just a mirrored vortex

For inviscid flow above a solid plane, a mirrored vortex below the plane can enforce zero normal velocity at the ground. It is a small model with one clear job: show how the floor changes induced velocity and circulation for a finite wing.

This model can tell me whether the sign is plausible, whether the solution returns to free-air behaviour as height increases, and whether symmetry and ground tangency are implemented correctly.

It cannot tell me about separation, diffuser pumping, tyre wakes, leakage, or moving-ground boundary layers. I keep that list beside the result so I do not accidentally turn a wing model into a floor claim.

## The VLM sweep gave me numbers I could check

In the Ground Effect VLM project, I used an aspect-ratio-4 rectangular wing at $4°$ angle of attack, 64 spanwise panels, and an 80-chord wake. I swept 14 heights from $h/c=0.25$ to 50.

At $h/c=0.5$:

| Quantity | Change from free air |
|---|---:|
| Lift coefficient, 0.2615 → 0.3461 | +32.4% |
| $C_{D_i}/C_L^2$ | −41.9% |

Those numbers tell me what the image-vortex model predicts. They do not tell me what a race-car underfloor will do.

The model also warns me when it is being pushed too far. At $h/c=0.25$, it predicts $C_L=0.5419$, roughly twice the free-air value. Thickness, separation, and leakage are missing, so the runaway trend is a reason to climb the ladder—not a dramatic design result.

I kept several checks around the sweep:

- ground-normal velocity was 0.0 at 257 sample points;
- the $h/c=50$ result returned within 0.00335% of free air;
- spanwise symmetry error was $1.9\times10^{-16}$;
- 64 to 96 panels changed lift by 0.258%.

That gave me confidence in the code inside its own assumptions.

## Surface geometry adds detail, not viscosity

A panel method can put the actual surface shape into the calculation and give me a pressure distribution. That is useful for checking loading and circulation.

My Airfoil Methods project made the limit obvious. The panel model produced pressure-derived lift and moment, but pressure drag stayed below 0.0008 while the wind tunnel measured 0.0065 to 0.0275. It also kept increasing lift after the real airfoil stalled.

Adding a ground image does not fix that. An inviscid model remains inviscid.

## I climb to RANS only when the question needs it

A simplified RANS case adds viscosity, wall shear, turbulence closure, moving-ground treatment, pressure recovery, and separation. It also creates new work: wall resolution, domain size, turbulence inputs, grid sensitivity, model sensitivity, and validation.

A two-dimensional diffuser slice can help me understand pressure recovery. It cannot tell me how tyre wakes or side-edge leakage rank two full floors.

For a front wing or floor, the useful model may need the ground, rotating tyres, suspension, realistic ride and yaw, and the actual leakage paths. For full-car balance, I need the whole car and a qualified mesh.

The F1 2026 project is where this ladder stopped me. I had the intended 50 m/s inlet, moving ground, rotating wheels, seven force groups, and $k$–$\omega$ SST setup. The production mesh still failed its gate. Writing the boundary conditions did not make the full-car answer real.

## The last rung is physical correlation

A tunnel or track result is not a decorative line on the final plot. I still need matched geometry, Reynolds and Mach numbers, ground and wheel treatment, ride, yaw, tyre state, sensor uncertainty, and a declared comparison metric.

Track data add even more context: driver controls, transient vehicle state, weather, and alignment. A force delta without a matched state is not a clean validation point.

## The ladder I use now

| Question | Lowest model I would try first |
|---|---|
| Is the ground-image sign correct? | image-vortex check |
| Does a finite wing recover toward free air? | verified VLM sweep |
| How does inviscid surface loading move? | panel method |
| Does a diffuser separate? | viscous CFD with mesh checks |
| How does tyre wake change front-wing loading? | component CFD with rotating tyre |
| How does a package change full-car balance? | qualified full-car RANS |
| Does the model represent the car? | matched experiment |

I do not climb the ladder because a higher rung looks more professional. I climb when the lower model is missing the mechanism that decides the question.

A verified low-order model can be more trustworthy than an unqualified RANS case. The authority comes from asking a question the model can actually answer.
