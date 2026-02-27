---
title: 'I Stopped Calling Every CFD Check “Validation”'
image: /images/notes/covers/verification-before-validation.svg
published: 2026-07-26
summary: 'A habit I learned across airfoil, cooling, and full-car projects: first check the code, then the numerics, then the physics, and only then decide whether the workflow is ready for design work.'
tags: [CFD]
sourceProjects: [airfoil-methods, fsae-cooling, f1-2026-aero]
featured: true
order: 1
---

I used to put too many things under the word “validation.” A solver ran, residuals dropped, a curve looked sensible—validation.

That shortcut became dangerous once my projects grew. A correct implementation can use the wrong physics. A numerically stable result can sit on a bad mesh. A model can match one experiment and still be unsafe for a different geometry.

I now ask a simpler question after every result:

> What did this run actually prove, and what am I allowed to decide from it?

## The four checks I keep separate

| Step | What I am asking |
|---|---|
| Code check | Did I implement the equations, signs, units, and conventions correctly? |
| Numerical check | Is the answer stable enough against mesh, time step, and sampling choices? |
| Physical comparison | Does the model match an independent experiment or trusted benchmark? |
| Production readiness | Is the whole workflow safe enough for the design decision I want to make? |

These steps can disagree. My F1 campaign is the clearest example: the coefficient pipeline works, but the production mesh does not pass. Both statements are true at the same time.

## I now write the claim before looking at the number

Before a sweep, I freeze the geometry revision, reference area, axes, force signs, operating point, and the output that will decide the case. I also write the tolerance and averaging rule.

This stops a later reference-area change or a convenient averaging window from looking like an aerodynamic improvement.

It also makes a failed result easier to accept. If the gate was written first, I do not have to negotiate with it after seeing a result I like.

## Small problems catch mistakes that a car will hide

My [Airfoil Methods project](/projects/airfoil-methods) became my favourite example of this.

Thin-airfoil theory, lifting-line theory, and a panel method are all cheap. That is their advantage. I can check symmetry, signs, closure, lift slope, and pressure integration before touching a complex vehicle.

The numbers also show where the models stop. Against the measured lift slope, thin-airfoil theory misses by 3.81% and the panel method by 13.83%. The wind tunnel stalls at $C_l=1.66$ near $17.35°$. The inviscid panel model keeps climbing to 2.085.

More panels will not create viscosity or stall. The model is not “bad”; I was asking it a question it cannot answer.

## Residuals are not the final result

A residual plot tells me whether the algebraic solve is progressing. It does not tell me whether the force, temperature, or flow rate I care about is stable.

For the output used in the decision, I now check:

1. conservation;
2. a stable averaging or sampling window;
3. mesh sensitivity;
4. time-step sensitivity when the problem is transient; and
5. model sensitivity only after the numerical checks pass.

The [FSAE Cooling study](/projects/fsae-cooling) follows that order. Its selected transient model changes by 0.029 K under spatial refinement and 0.018 K when the time step is halved. Both sit inside the 0.1 K numerical gate.

That makes the screen numerically trustworthy at its intended scale. It does not turn incomplete manufacturer data into a physical validation dataset.

## I stopped treating “coarse, medium, fine” as a method

Three meshes only form a useful grid study if I know what changed. Geometry, layers, schemes, convergence criteria, and averaging rules need to stay fixed while one controlled refinement variable moves.

Otherwise, the difference between “medium” and “fine” mixes too many causes. I get a delta, but I do not know what it means.

The output I care about also has to be named. A lower residual is not a substitute for checking the coefficient or temperature that drives the engineering decision.

## Physical validation needs an independent reference

When I compare with a wind-tunnel or rig result, I now check whether the geometry, Reynolds number, Mach number, ground treatment, wheels, support, blockage correction, ride, yaw, and measured quantity actually match.

If they do not, I may still have a useful trend comparison. I call it a trend comparison.

The Airfoil Methods page keeps the NASA NACA 0012 data beside the inviscid prediction for exactly this reason. The agreement in the linear range is useful. The missing wake drag and stall remain visible.

## A failed mesh taught me where the ladder stops

In the [F1 2026 full-car project](/projects/f1-2026-aero), I tried twenty bounded meshing routes. The best volume mesh still had eight failed skew faces. The mesh gate therefore said NO-GO.

An earlier coarse case still helped me check force signs and output plumbing. It could not become a production aerodynamic prediction just because its force trace looked calm.

That distinction saved the project from making a bigger claim than the evidence supported.

## The checklist I use now

Before I publish a CFD number, I want to be able to answer:

- What decision is this number meant to support?
- Which geometry and operating point produced it?
- Did the implementation pass a known-answer check?
- Did mesh, time step, and sampling choices move the actual decision metric?
- Is there an independent physical reference?
- Which failed cases changed the plan?
- Can I regenerate the number and the figure from the same data?

I do not use one universal tolerance table. The limits depend on the solver, model, geometry, and cost of being wrong.

The habit I am keeping is the order: **code first, numerics second, physics third, production decision last.**
