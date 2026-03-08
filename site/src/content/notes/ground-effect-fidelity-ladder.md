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

Ground effect is easy to make look convincing. Put a wing near the ground, colour the pressure field, and the image can look authoritative even when the model lacks the physics that decide the answer.

I built a ground-effect fidelity ladder to avoid trusting the prettiest result. I start with the simplest model that can answer the current question and move up only when it is missing a necessary mechanism.

![Ground-effect fidelity ladder](/images/notes/systems/ground-effect-fidelity-ladder.svg)

Each step can represent more physics, but it also adds mesh, modelling, boundary-condition, and physical-correlation problems. More complexity does not automatically mean more credibility.

## I define the signs and measurements first

Before solving anything, I write down:

- span, chord, and reference area;
- where and how ride height is measured;
- angle-of-attack and downforce signs;
- the ground reference frame;
- coefficient normalisation.

This prevents disagreements with no physical meaning. One person might use minimum floor clearance while another uses quarter-chord height. One coefficient might use planform area while another uses frontal area.

If those definitions do not match, a more expensive solver only gives me a more expensive disagreement.

## I use an image vortex to check the basic ground mechanism

For inviscid flow above a solid plane, I can place an image vortex below the plane to enforce zero normal velocity at the ground. This model has a narrow but clear purpose: it shows how the ground changes induced velocity and circulation for a finite wing.

I use it to check:

- whether the result has a plausible sign;
- whether it returns to free-air behaviour as height increases;
- whether symmetry and ground tangency are implemented correctly.

An image-vortex model cannot represent separation, diffuser suction, tyre wakes, leakage, or a moving-ground boundary layer. I keep those limits beside the result so I do not turn a wing-model conclusion into a floor or full-car claim.

## The VLM sweep gave me numbers I could check

In `ground-effect-vlm`, I used a Vortex Lattice Method model of an aspect-ratio-4 rectangular wing at $4°$ angle of attack, with 64 spanwise panels and an 80-chord wake. I swept 14 heights from $h/c=0.25$ to 50.

At $h/c=0.5$ and fixed angle of attack, the results were:

| Quantity | Change from free air |
|---|---:|
| Lift coefficient, 0.2615 → 0.3461 | +32.4% |
| $C_{D_i}/C_L^2$ | −41.9% |

Under ideal inviscid boundary conditions, the image-vortex model predicts more lift and a lower induced cost per lift squared. That supports this specific mechanism. It does not predict diffuser separation, a ride-height cliff, or the real performance of a race-car floor.

I kept several checks to confirm that the code worked within its assumptions:

- ground-normal velocity was 0.0 at 257 sample points;
- the $h/c=50$ result returned within 0.00335% of free air;
- spanwise symmetry error was $1.9\times10^{-16}$;
- increasing the panel count from 64 to 96 changed lift by 0.258%.

These checks increased my confidence in the implementation. They did not expand the model’s valid scope.

## Very low height exposed the model’s limit

At $h/c=0.25$, the model predicted $C_L=0.5419$, roughly twice the free-air value.

I could not treat that as a design result. The model has no thickness, separation, or leakage, so it continues to predict a rapidly rising trend. My correction was not to present the curve as stronger ground effect. It was to recognise that the model was now missing the physics that decide the question and move to a higher rung.

## Surface geometry does not add viscosity

A panel method can include the real surface shape and calculate pressure distribution. That makes it useful for checking loading, circulation, pressure-derived lift, and moment.

`airfoil-methods` made the limit clear. Its panel model kept pressure drag below 0.0008, while the wind tunnel measured 0.0065 to 0.0275. The calculated lift also continued to rise after the real airfoil had stalled.

Adding a ground image would not fix this. An inviscid model remains inviscid; more geometric detail does not create wall shear, separation, or realistic drag.

## I use RANS only when near-wall flow and separation decide the answer

When the question depends on viscosity, wall shear, pressure recovery, or separation, I need Reynolds-Averaged Navier–Stokes methods.

RANS can include those mechanisms, but it also adds work:

- near-wall resolution;
- domain size;
- turbulence inputs;
- moving-ground treatment;
- mesh sensitivity;
- turbulence-model sensitivity;
- comparison with physical results.

The model scope must also match the question. A two-dimensional diffuser slice can help me understand pressure recovery, but it cannot show how tyre wakes or side-edge leakage change the ranking of two complete floors.

A useful front-wing or floor model may need the ground, rotating tyres, suspension, realistic ride height and yaw, and the actual leakage paths. If the question is full-car balance, I need the complete vehicle, and the mesh must first meet its planned checks.

## `f1-2026-aero` does not yet have a credible full-car result

In `f1-2026-aero`, the ladder stopped me at the setup stage. I had configured the intended 50 m/s inlet speed, moving ground, rotating wheels, seven force groups, and the $k$–$\omega$ SST turbulence model.

The production mesh still failed its gate checks. I therefore cannot present that full-car case as a credible result. Completing the boundary conditions did not make the simulation physically reliable.

This is one reason I use the ladder: a checked low-order model can be more trustworthy than a RANS case whose mesh has not met its requirements.

## Tunnel and track comparisons must match the conditions

A wind-tunnel or track result is not a decorative line on the final plot. A meaningful comparison still requires matched:

- geometry;
- Reynolds and Mach numbers;
- ground and wheel treatment;
- ride height and yaw;
- tyre state;
- sensor uncertainty;
- comparison metric.

Track data also depend on driver inputs, transient vehicle state, weather, and position alignment. A force change without matched conditions is not a clean comparison point.

## I choose the lowest useful model for the question

| Current question | Lowest model I would try first | When I move up |
|---|---|---|
| Is the ground-image sign correct, and does the ground strengthen circulation? | Image-vortex check | I need the spanwise distribution of a finite wing |
| Does a finite wing recover toward free-air behaviour as height increases? | Checked VLM sweep | I need thickness or real surface pressure |
| How does loading vary along the span? | VLM | I need surface geometry and pressure distribution |
| How does inviscid surface loading change? | Panel method | Viscosity, drag, or stall decides the answer |
| Does a diffuser or floor separate? | Viscous CFD with mesh checks | I need unsteady behaviour or physical correlation |
| How does tyre wake change front-wing loading? | Component CFD with a rotating tyre | Component interactions require the full vehicle |
| How does a package change full-car balance? | Full-car RANS with a qualified mesh | I need to confirm that the numerical trend represents the real car |
| Does the model represent the real car? | Matched wind-tunnel or track test | Geometry and operating conditions must match |

I do not move up because a higher rung looks more professional. I move up only when the lower-order model lacks the mechanism that decides the current question.

The standard I keep is simple: credibility does not come from the model’s name. It comes from asking a question the model can answer and stating clearly what it cannot.
