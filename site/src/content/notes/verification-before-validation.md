---
title: 'Verification Before Validation: A Practical CFD Evidence Ladder'
published: 2026-08-04
summary: 'A decision-oriented method for separating code checks, numerical verification, physical validation, and production readiness before aerodynamic numbers are trusted.'
tags: [CFD verification, validation, mesh convergence, decision gates]
sourceProjects: [airfoil-methods, fsae-cooling, f1-2026-aero]
featured: true
order: 1
---

A converged solver is not automatically a correct simulation. A simulation that matches one experiment is not automatically numerically resolved. A polished contour is evidence of neither.

The useful question is narrower: **what has been established, by which independent check, and what decision does that permit?**

## Four claims that must stay separate

| Layer | Question | Typical evidence | What it does not prove |
|---|---|---|---|
| Implementation | Does the code execute the intended equations and conventions? | unit tests, manufactured or analytical cases, conservation checks | that the model represents the real vehicle |
| Numerical verification | Is the reported result sufficiently insensitive to numerical choices? | grid/time-step studies, iteration histories, boundedness, mass balance | that the turbulence and boundary models are physically adequate |
| Validation | Does the model reproduce an independent physical reference within stated uncertainty? | wind-tunnel, track, rig, or published benchmark comparison | that it extrapolates to every geometry and operating point |
| Production readiness | Is the full workflow safe to use for the intended design decision? | frozen inputs, passing gates, repeatable automation, cost and uncertainty bounds | that every future run is trustworthy without review |

Calling all four layers “validation” hides the location of risk. The vocabulary matters because each layer can fail while the others appear healthy.

## Gate 1 — freeze the claim before inspecting the result

A verification programme starts with the output and tolerance, not with a mesh count. For an aerodynamic comparison this means fixing:

- geometry revision and component grouping;
- reference area, length, moment origin, axes, and coefficient signs;
- speed, density, ground motion, wheel rotation, ride, pitch, yaw, and steering state;
- the decision metric, such as load delta, balance, cooling margin, or sensitivity;
- the averaging rule and acceptable numerical uncertainty.

Without this contract, a later change in reference area or sampling window can masquerade as an aerodynamic improvement.

## Gate 2 — establish implementation behaviour on a problem with a known answer

The best implementation check is usually smaller than the target CFD problem.

The [Airfoil Methods project](/projects/airfoil-methods) separates three rungs: thin-airfoil theory, a Prandtl lifting-line model, and a Hess–Smith panel method. Symmetry, closure, thickness, sign conventions, and linear lift scale can be checked before comparing with NASA wind-tunnel measurements. The hierarchy exposes structural limits: an inviscid model cannot earn trust for viscous drag or stall by increasing panel count.

The same principle applies to finite-volume work. A cavity, channel, manufactured solution, or closed energy balance can reveal implementation errors that a complex vehicle case will conceal.

## Gate 3 — verify the exact quantity used in the decision

Residuals are diagnostic, not the final acceptance quantity. Numerical verification should follow the decision output:

1. **Conservation:** mass, momentum, or energy imbalance is within a declared limit.
2. **Iteration or sampling stability:** forces and moments have a defensible steady window or statistical interval.
3. **Spatial sensitivity:** the coefficient or temperature used for the decision is compared across a controlled refinement family.
4. **Temporal sensitivity:** transient results are checked against time-step or sampling changes.
5. **Model sensitivity:** alternative turbulence or wall treatments are tested only after the numerical gates pass.

The [FSAE Cooling study](/projects/fsae-cooling) follows this order. Its 80-cell transient coolant model differs by 0.029 K from the finer spatial case and by 0.018 K under the time-step comparison. Those checks support the numerical screen; they do not turn secondary-hosted component curves into first-party validation data.

## Grid independence is not a cell-count comparison

Three meshes do not form a grid study unless the refinement variable is controlled. A defensible comparison states:

- what was refined and by what ratio;
- whether geometry, layers, schemes, convergence criteria, and averaging rules remained fixed;
- which scalar output is assessed;
- whether the sequence is monotonic or oscillatory;
- the observed order or the reason it cannot be estimated;
- the uncertainty attached to the published result.

Comparing unrelated “coarse”, “medium”, and “fine” meshes can mix topology changes, wall treatment, and local resolution into one uninterpretable delta.

## Gate 4 — validation needs an independent reference

Validation asks a physical question. The reference therefore needs its own provenance and uncertainty:

- configuration and geometry match;
- Reynolds and Mach numbers;
- ground and wheel treatment;
- support, blockage, and wall corrections;
- sensor calibration and repeatability;
- alignment, ride, yaw, tyre, and environmental state;
- the exact comparison metric.

When these conditions do not match, the result may still be a useful trend comparison, but it must not be described as full validation.

The Airfoil Methods study uses one traceable NASA series at one Mach number, Reynolds number, and transition condition. It retains measured wake drag and stall beside the inviscid prediction specifically to show what the numerical model cannot reproduce.

## A failed mesh blocks downstream claims

The [F1 2026 full-car project](/projects/f1-2026-aero) is an example of the gate doing its job. Twenty bounded meshing paths were examined: nineteen OpenFOAM outcomes and one external topology route. None met the zero-failure volume-mesh contract. The correct production decision was therefore **NO-GO**.

A solver history from a rejected coarse mesh can still test coefficient plumbing and sign conventions. It cannot be promoted into a production aerodynamic prediction. Numerical calm downstream does not repair invalid topology upstream.

## A compact publication checklist

Before a CFD number appears in a portfolio or design review, the article should let a reader recover:

1. the engineering decision and frozen operating point;
2. geometry and reference-quantity provenance;
3. boundary conditions and model choices with reasons;
4. complete mesh-quality and conservation gates;
5. force, moment, temperature, or pressure histories;
6. spatial and temporal sensitivity for the decision metric;
7. the independent physical reference, or an explicit statement that none exists;
8. failed cases and the decisions they changed;
9. a reproducible command and machine-readable evidence.

The result is not more ceremony. It is a shorter path from simulation output to a bounded engineering decision.

## Boundary of this note

This is a workflow for structuring evidence, not a universal tolerance table. Acceptable mesh quality, uncertainty, sampling duration, and correlation error depend on solver formulation, geometry, operating regime, and the cost of the decision. Every project must declare those limits before using them as gates.
