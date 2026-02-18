---
title: 'Ground Effect Needs a Fidelity Ladder, Not One Impressive Contour'
image: /images/notes/covers/ground-effect-fidelity-ladder.svg
published: 2026-08-05
summary: 'A model-selection guide from image vortices to moving-ground RANS, showing which ground-effect questions each rung can answer and where its authority ends.'
tags: [ground effect, VLM, RANS, model hierarchy]
sourceProjects: [ground-effect-vlm, airfoil-methods, f1-2026-aero]
featured: false
order: 4
---

Pick the ground-effect model by the mechanism and the decision, and each rung earns a bounded, checkable answer. Pick it by the most detailed tool available and you get an impressive contour with no authority behind it. A finite wing near a plane, an inverted multi-element front wing, and a full underfloor with leakage and rotating tyres share a boundary condition. They do not share dominant physics.

## Rung 0 — dimensional and sign checks

Before solving a flow field, freeze:

- span, chord, reference area, and aspect ratio;
- ride-height definition and reference point;
- angle-of-attack sign;
- lift/downforce sign;
- freestream and ground reference frame;
- coefficient normalisation;
- the quantity being swept.

Many apparent ground-effect disagreements are coordinate or normalisation disagreements. A result normalised by planform area cannot be compared with one using frontal area; quarter-chord height is not interchangeable with minimum floor clearance.

## Rung 1 — the image-vortex mechanism

For inviscid flow above an impermeable plane, a mirrored vortex system enforces zero normal velocity at the ground. Each real horseshoe-vortex segment above the road is paired with an image below it, circulation reversed.

This rung isolates one mechanism: how the plane changes circulation, induced velocity, lift, and induced drag for a finite lifting surface.

It can answer:

- whether the implemented ground-effect sign is plausible;
- whether the solution returns toward free-air behaviour as height increases;
- whether span symmetry and wall tangency hold;
- the scale of a controlled ride-height trend for one idealised wing.

Separation, viscous drag, diffuser pumping, tyre wakes, leakage, and moving-ground boundary layers all live above this rung.

## Rung 2 — a verified VLM sweep

A vortex-lattice model distributes bound circulation across panels and solves a linear no-penetration system. The [Ground Effect VLM study](/projects/ground-effect-vlm) models an aspect-ratio-4 rectangular wing at $\alpha = 4°$ with 64 uniform spanwise panels and an 80-chord wake, sweeping 14 heights from $h/c = 0.25$ to $50$.

At $h/c = 0.5$, fixed incidence:

| Quantity | Change relative to free air |
|---|---:|
| Lift coefficient (0.2615 → 0.3461) | +32.4% |
| $C_{D_i}/C_L^2$ | -41.9% |

These values are an auditable result of the image-vortex model. They are not estimates for a race-car floor. At $h/c = 0.25$ the same linear model predicts $C_L = 0.5419$ — twice free air. That endpoint is a warning, because every mechanism that would cap it (thickness, separation, leakage) is absent from the formulation.

The verification gates make the sweep trustworthy within its class. The ground-plane normal-velocity residual is 0.0 at 257 sample points, lift at $h/c = 50$ sits within 0.00335% of free air, spanwise symmetry error is $1.9\times10^{-16}$, and a 64-to-96-panel refinement changes lift by 0.258%. The free-air lift slope sits 11.01% from the Prandtl finite-wing estimate, inside a deliberately loose 12% gate. A single chordwise row and the classical lifting-line model are not the same model; exact agreement would be suspicious.

## Rung 3 — geometry-resolved potential flow

Panel methods add surface geometry and pressure distribution. They can inspect loading shifts, stagnation regions, and geometry-induced circulation while retaining an inviscid formulation.

The [Airfoil Methods project](/projects/airfoil-methods) shows the corresponding authority boundary in free air. Pressure-derived lift and moment are useful; wake drag and stall stay structurally unavailable. The panel model returns pressure drag below 0.0008 where the wind tunnel measured 0.0065 to 0.0275, and it answers 2.085 where the measured $C_l$ stalls at 1.66. Adding ground images creates no viscosity.

Use this rung when the decision concerns inviscid loading or geometric consistency. When the mechanism depends on boundary-layer growth or separation, it cannot decide.

## Rung 4 — simplified viscous CFD

A two-dimensional or simplified three-dimensional RANS model can introduce:

- viscosity and wall shear;
- turbulence closure;
- moving-ground boundary conditions;
- pressure recovery and separation;
- local geometry details.

It also introduces new obligations: wall resolution, turbulence inlet quantities, domain and blockage checks, grid sensitivity, model sensitivity, and a credible validation reference.

A 2-D diffuser slice can isolate pressure recovery, but it inherits no full-car authority. The missing side-edge leakage and tyre interaction may be the mechanism that sets the real design ranking.

## Rung 5 — component CFD with relevant interference

For a front wing or floor study, the minimum useful context may include:

- ground motion;
- rotating or translated tyre surfaces;
- nearby suspension or bodywork;
- realistic ride, pitch, yaw, and steering states;
- leakage paths and edge-vortex development;
- wake-sensitive refinement.

This rung supports component design only if the omitted vehicle parts are shown to leave the mechanism under study untouched.

## Rung 6 — full-car moving-ground RANS

A full-car case connects component loads, balance, wheel wakes, floor pressure recovery, cooling exits, and body interactions. It is also where geometry and meshing risk dominate.

The [F1 2026 project](/projects/f1-2026-aero) illustrates the readiness requirement. The target setup specifies 50 m/s inlet flow, moving ground, rotating wheels, seven component force groups, and k–ω SST. The production solve remains blocked because the volume-mesh gate has not passed.

Writing the intended boundary conditions is not the same as obtaining a qualified full-car result.

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

Starting above the minimum rung is justified when the lower model omits the controlling mechanism. Starting below it cannot be repaired by confident language.

## A useful escalation contract

Move to the next rung only when it adds a required mechanism and passes a new check:

1. analytical sign and far-field limits;
2. discretisation sensitivity;
3. geometry and pressure consistency;
4. viscous wall and separation verification;
5. interference and operating-state coverage;
6. full-car mesh, balance, and component accounting;
7. independent physical correlation.

Each higher rung should preserve the lower rung as an oracle where their assumptions overlap. If a full RANS setup reverses an analytical sign or breaks far-field recovery, the complexity is hiding a defect.

## Boundary of this note

Model fidelity does not rise monotonically with compute cost. A poorly qualified RANS case can be less trustworthy than a verified low-order model for a bounded question. Authority comes from matching assumptions to the mechanism, then validating the output the decision requires.
