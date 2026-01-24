---
title: 'Ground Effect Needs a Fidelity Ladder, Not One Impressive Contour'
published: 2026-08-18
summary: 'A model-selection guide from image vortices to moving-ground RANS, showing which ground-effect questions each rung can answer and where its authority ends.'
tags: [ground effect, VLM, RANS, model hierarchy]
sourceProjects: [ground-effect-vlm, airfoil-methods, f1-2026-aero]
featured: false
order: 4
---

“Ground effect” is not one modelling problem. A finite wing near a plane, an inverted multi-element front wing, and a full underfloor with leakage and rotating tyres share a boundary but not the same dominant physics.

The model should be selected by the mechanism and decision—not by the most detailed tool available.

## Rung 0 — dimensional and sign checks

Before solving a flow field, freeze:

- span, chord, reference area, and aspect ratio;
- ride-height definition and reference point;
- angle-of-attack sign;
- lift/downforce sign;
- freestream and ground reference frame;
- coefficient normalisation;
- the quantity being swept.

Many apparent ground-effect disagreements are coordinate or normalisation disagreements. A result normalised by planform area cannot be compared directly with one using frontal area; a quarter-chord height is not interchangeable with minimum floor clearance.

## Rung 1 — the image-vortex mechanism

For inviscid flow above an impermeable plane, a mirrored vortex system can enforce zero normal velocity at the ground. Each real horseshoe-vortex segment above the road is paired with an image below it with reversed circulation.

This rung isolates one mechanism: how the plane changes circulation, induced velocity, lift, and induced drag for a finite lifting surface.

It can answer:

- whether the implemented ground-effect sign is plausible;
- whether the solution returns toward free-air behaviour as height increases;
- whether span symmetry and wall tangency are satisfied;
- the scale of a controlled ride-height trend for one idealised wing.

It cannot answer separation, viscous drag, diffuser pumping, tyre wakes, leakage, or moving-ground boundary layers.

## Rung 2 — a verified VLM sweep

A vortex-lattice model distributes bound circulation across panels and solves a linear no-penetration system. The low-order [Ground Effect VLM study](/projects/ground-effect-vlm) uses 64 uniform spanwise panels for its reported 14-height sweep, with 96-panel refinement used as a sensitivity check.

At fixed angle of attack and $h/c=0.5$, the model reports:

| Quantity | Change relative to free-air reference |
|---|---:|
| Lift coefficient | +32.4% |
| $C_{D_i}/C_L^2$ | -41.9% |

These values are an auditable result of the image-vortex model. They are not estimates for a race-car floor.

The solver also checks wall tangency at 257 ground-plane samples, span symmetry, far-ground recovery, the finite-wing lift-slope scale, and 64-to-96-panel sensitivity. Those checks establish that the implemented mathematical model behaves as intended.

## Rung 3 — geometry-resolved potential flow

Panel methods add surface geometry and pressure distribution. They can inspect loading shifts, stagnation regions, and geometry-induced circulation while retaining an inviscid formulation.

The [Airfoil Methods project](/projects/airfoil-methods) demonstrates the corresponding authority boundary in free air: pressure-derived lift and moment can be useful, but wake drag and stall remain structurally unavailable. Adding ground images does not create viscosity.

This rung is useful when the decision concerns inviscid loading or geometric consistency. It is insufficient when the mechanism depends on boundary-layer growth or separation.

## Rung 4 — simplified viscous CFD

A two-dimensional or simplified three-dimensional RANS model can introduce:

- viscosity and wall shear;
- turbulence closure;
- moving-ground boundary conditions;
- pressure recovery and separation;
- local geometry details.

It also introduces new obligations: wall resolution, turbulence inlet quantities, domain/blockage checks, grid sensitivity, model sensitivity, and a credible validation reference.

A 2-D diffuser slice can isolate pressure recovery but cannot inherit full-car authority. Missing side-edge leakage and tyre interaction may be the mechanism that determines the real design ranking.

## Rung 5 — component CFD with relevant interference

For a front wing or floor study, the minimum useful context may include:

- ground motion;
- rotating or translated tyre surfaces;
- nearby suspension or bodywork;
- realistic ride, pitch, yaw, and steering states;
- leakage paths and edge-vortex development;
- wake-sensitive refinement.

This rung supports component design only if the omitted vehicle parts are shown not to control the mechanism under study.

## Rung 6 — full-car moving-ground RANS

A full-car case connects component loads, balance, wheel wakes, floor pressure recovery, cooling exits, and body interactions. It is also where geometry and meshing risk dominate.

The [F1 2026 project](/projects/f1-2026-aero) illustrates the readiness requirement: a target setup specifies 50 m/s inlet flow, moving ground, rotating wheels, component force groups, and k–ω SST, but the production solve remains blocked because the volume-mesh gate has not passed.

Writing the intended boundary conditions is not equivalent to obtaining a qualified full-car result.

## Rung 7 — physical correlation

Wind-tunnel or track correlation is a separate rung, not a decorative final plot. It needs:

- configuration matching;
- Reynolds and Mach context;
- tunnel blockage and support corrections;
- moving-ground and wheel treatment;
- ride, yaw, steering, and tyre state;
- sensor calibration and repeatability;
- environmental and operational uncertainty;
- a pre-declared comparison metric.

Track correlation adds control-state and transient reconstruction problems. A force delta without a matched vehicle state is not a clean CFD validation point.

## Match the rung to the decision

| Engineering question | Lowest potentially useful rung |
|---|---|
| Is the ground-image sign implemented correctly? | image-vortex check |
| Does a finite wing recover toward free air with height? | verified VLM sweep |
| How does inviscid surface loading move? | geometry-resolved panel method |
| Does a simplified diffuser separate? | viscous CFD with grid/model checks |
| How does tyre wake alter front-wing loading? | component CFD with rotating tyre context |
| How does a package shift full-car balance? | qualified full-car RANS |
| Does the model represent the physical vehicle? | matched experimental correlation |

Starting above the minimum rung can be justified when the lower model omits the controlling mechanism. Starting below it cannot be repaired by confident language.

## A useful escalation contract

Move to the next rung only when it adds a required mechanism and passes a new check:

1. analytical sign and far-field limits;
2. discretisation sensitivity;
3. geometry and pressure consistency;
4. viscous wall and separation verification;
5. interference and operating-state coverage;
6. full-car mesh, balance, and component accounting;
7. independent physical correlation.

Each higher rung should preserve the lower rung as an oracle where their assumptions overlap. If a full RANS setup reverses an analytical sign or breaks far-field recovery, complexity is hiding a defect rather than adding fidelity.

## Boundary of this note

The ladder is not a claim that model fidelity rises monotonically with compute cost. A poorly qualified RANS case can be less trustworthy than a verified low-order model for a bounded question. The authority comes from matching assumptions to the mechanism, then validating the output required by the decision.
