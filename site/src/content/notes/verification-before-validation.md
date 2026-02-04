---
title: 'Verification Before Validation: A Practical CFD Evidence Ladder'
published: 2026-08-18
summary: 'A decision-oriented method for separating code checks, numerical verification, physical validation, and production readiness before aerodynamic numbers are trusted.'
tags: [CFD verification, validation, mesh convergence, decision gates]
sourceProjects: [airfoil-methods, fsae-cooling, f1-2026-aero]
featured: true
order: 1
---

One question decides everything downstream: **what did this run establish, what checked it, and what may I now decide?** Keeping four claim layers separate let my F1 2026 campaign publish a verified coefficient pipeline and a NO-GO production decision at the same time. A converged solver can still compute the wrong physics; a simulation that matches one experiment can still sit on an unresolved grid.

## Four claims that must stay separate

| Layer | Question | Typical evidence | What it does not prove |
|---|---|---|---|
| Implementation | Does the code execute the intended equations and conventions? | unit tests, manufactured or analytical cases, conservation checks | that the model represents the real vehicle |
| Numerical verification | Is the reported result sufficiently insensitive to numerical choices? | grid/time-step studies, iteration histories, boundedness, mass balance | that the turbulence and boundary models are physically adequate |
| Validation | Does the model reproduce an independent physical reference within stated uncertainty? | wind-tunnel, track, rig, or published benchmark comparison | that it extrapolates to every geometry and operating point |
| Production readiness | Is the full workflow safe to use for the intended design decision? | frozen inputs, passing gates, repeatable automation, cost and uncertainty bounds | that every future run is trustworthy without review |

Calling all four layers "validation" hides where the risk sits. Each layer can fail while the others look healthy.

## Gate 1 — freeze the claim before inspecting the result

A verification programme starts with the output and tolerance, not with a mesh count. For an aerodynamic comparison this means fixing:

- geometry revision and component grouping;
- reference area, length, moment origin, axes, and coefficient signs;
- speed, density, ground motion, wheel rotation, ride, pitch, yaw, and steering state;
- the decision metric: load delta, balance, cooling margin, or sensitivity;
- the averaging rule and acceptable numerical uncertainty.

Without this contract, a later change in reference area or sampling window can masquerade as an aerodynamic improvement.

## Gate 2 — check implementation on a problem with a known answer

The best implementation check is smaller than the target CFD problem.

The [Airfoil Methods project](/projects/airfoil-methods) separates three rungs: thin-airfoil theory, a Prandtl lifting-line model, and a Hess–Smith panel method. Symmetry, closure, thickness, sign conventions, and linear lift scale are all checked before any comparison with the NASA wind-tunnel series. The hierarchy exposes structural limits with numbers attached. Against the measured lift slope, thin-airfoil theory errs by 3.81% and the panel method by 13.83%. Measured stall ($C_l = 1.66$ at $17.35°$) stays invisible to both; the inviscid model answers 2.085 and keeps rising. More panels cannot fix that.

The same principle applies to finite-volume work. A cavity, channel, manufactured solution, or closed energy balance reveals implementation errors that a complex vehicle case will conceal.

## Gate 3 — verify the exact quantity used in the decision

Residuals diagnose the solve; they do not accept the result. Numerical verification should follow the decision output:

1. **Conservation:** mass, momentum, or energy imbalance within a declared limit.
2. **Iteration or sampling stability:** forces and moments reach a defensible steady window or statistical interval.
3. **Spatial sensitivity:** the coefficient or temperature used for the decision is compared across a controlled refinement family.
4. **Temporal sensitivity:** transient results are checked against time-step or sampling changes.
5. **Model sensitivity:** alternative turbulence or wall treatments are tested only after the numerical gates pass.

The [FSAE Cooling study](/projects/fsae-cooling) follows this order. Its 80-cell transient coolant model differs by 0.029 K from the 160-cell case and by 0.018 K under a halved time step, both inside the declared 0.1 K gate. Those checks qualify the numerical screen. They do not turn secondary-hosted component curves into first-party validation data.

## Grid independence is more than a cell-count comparison

Three meshes form a grid study only when the refinement variable is controlled. A defensible comparison states:

- what was refined and by what ratio;
- whether geometry, layers, schemes, convergence criteria, and averaging rules stayed fixed;
- which scalar output is assessed;
- whether the sequence is monotonic or oscillatory;
- the observed order, or the reason it cannot be estimated;
- the uncertainty attached to the published result.

Comparing unrelated "coarse", "medium", and "fine" meshes mixes topology changes, wall treatment, and local resolution into one uninterpretable delta.

## Gate 4 — validation needs an independent reference

Validation asks a physical question, so the reference needs its own provenance and uncertainty:

- configuration and geometry match;
- Reynolds and Mach numbers;
- ground and wheel treatment;
- support, blockage, and wall corrections;
- sensor calibration and repeatability;
- alignment, ride, yaw, tyre, and environmental state;
- the exact comparison metric.

When these conditions do not match, the result may still be a useful trend comparison. Call it that.

The Airfoil Methods study uses one traceable series: NASA TM-4074, NACA 0012, $M = 0.15$, $Re = 5.97\times10^6$, free transition. It retains the measured wake drag and stall beside the inviscid prediction precisely to show what the model cannot reproduce.

## A failed mesh blocks downstream claims

The [F1 2026 full-car project](/projects/f1-2026-aero) shows the gate doing its job. Twenty bounded meshing paths were examined: nineteen OpenFOAM outcomes and one external topology route. The best mesh still carried eight highly skew faces, so none met the zero-failure volume-mesh contract. The production decision was **NO-GO**.

A solver history from a rejected coarse mesh can still test coefficient plumbing and sign conventions. It cannot be promoted into a production aerodynamic prediction. Numerical calm downstream does not repair invalid topology upstream.

## A compact publication checklist

Before a CFD number appears in a portfolio or design review, the reader should be able to recover:

1. the engineering decision and frozen operating point;
2. geometry and reference-quantity provenance;
3. boundary conditions and model choices with reasons;
4. complete mesh-quality and conservation gates;
5. force, moment, temperature, or pressure histories;
6. spatial and temporal sensitivity for the decision metric;
7. the independent physical reference, or an explicit statement that none exists;
8. failed cases and the decisions they changed;
9. a reproducible command and machine-readable evidence.

The payoff is a shorter path from simulation output to a bounded engineering decision.

## Boundary of this note

This is a workflow for structuring evidence, not a universal tolerance table. Acceptable mesh quality, uncertainty, sampling duration, and correlation error depend on solver formulation, geometry, operating regime, and the cost of the decision. Declare those limits before using them as gates.
