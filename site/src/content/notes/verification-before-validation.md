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

I used to call a CFD result “validated” whenever the solver ran, the residuals fell, and the curves looked sensible.

As my projects grew, that shortcut began to hide real problems. A correct implementation can use the wrong physics. A numerically stable result can come from an inadequate mesh. A model can match one experiment and still be unreliable for another geometry.

I now ask:

> What did this calculation actually prove, and what decision can I make from it?

## I separate four checks

![Verification and validation ladder](/images/notes/systems/verification-before-validation.svg)

| Step | What I need to answer |
|---|---|
| Code check | Are the equations, signs, indexing, units, and conventions implemented correctly? |
| Numerical check | Do changes in mesh, time step, or sampling significantly change the result? |
| Physical comparison | Does the model agree with an independent experiment or trusted benchmark? |
| Design-use check | Is the complete workflow reliable enough for the design decision I want to make? |

These checks cannot replace one another. Correct code cannot rescue an unconverged mesh. Agreement with one experiment cannot hide time-step sensitivity. A finer mesh cannot repair the wrong physical model. If a model is outside its valid range, I must change the model or narrow its use.

My F1 2026 full-car project is a direct example: the coefficient-processing pipeline works, but the production mesh does not pass its checks. Both statements can be true.

## I write the acceptance criteria before running the study

Before a parameter sweep, I freeze:

- the geometry revision;
- reference area;
- coordinate axes;
- force signs;
- operating conditions;
- the outputs used to judge the result;
- tolerances; and
- averaging and sampling rules.

This prevents me from changing the reference area after seeing the result, or choosing a more favourable averaging window and calling the difference an aerodynamic improvement.

Writing the gate first also makes failure easier to accept. I do not have to renegotiate the standard after seeing a result I like.

I do not use one universal tolerance table. The limits depend on the solver, model, geometry, and cost of making the wrong decision.

## I check implementations on simple airfoil problems first

In my Airfoil Methods work, I used thin-airfoil theory, lifting-line theory, and a panel method. They are inexpensive enough to check several basics before I move to a complex vehicle:

- geometric symmetry;
- signs and units;
- geometric closure;
- lift at zero angle of attack;
- lift slope;
- pressure integration; and
- near-zero inviscid drag.

For the panel method, geometric symmetry, zero lift at zero angle of attack, and near-zero inviscid drag are code and implementation checks. Increasing the panel count from 80 to 160 changed the result by less than 1%, which is a numerical check. It does not prove that the model includes real viscous or stall physics.

Against the measured lift slope, thin-airfoil theory differed by 3.81% and the panel method by 13.83%. NASA NACA 0012 wind-tunnel data reached $C_l=1.66$ and stalled near $17.35°$, while the inviscid panel model kept rising to 2.085.

Adding more panels cannot create viscosity, wake drag, or stall. The model is not necessarily bad; I asked it a question it cannot answer. I can use it to check trends in the linear range, but not to rank high-lift airfoils.

## I no longer use residuals as a substitute for engineering outputs

A residual plot shows whether the algebraic solve is converging. It does not show whether the force, temperature, or flow rate I care about is stable.

For an output that affects a design decision, I check:

1. conservation;
2. stability of the averaging or sampling window;
3. mesh sensitivity;
4. time-step sensitivity for transient cases; and
5. model sensitivity only after the numerical checks pass.

The FSAE Cooling study followed this order. Its selected transient model changed by 0.029 K under spatial refinement and by 0.018 K when the time step was halved. Both changes were below the 0.1 K numerical threshold.

That gives the screening model numerical credibility at its intended scale. It cannot turn incomplete manufacturer data into a physical validation dataset. The cooling E8 equation passed the numerical gate, but I could not complete a physical comparison because the applied heat-load and installation data were missing.

## “Coarse, medium, fine” only means something when I control the variables

I used to call any three meshes of different density a grid study. Now I only do that when I can state exactly what changed.

Across coarse, medium, and fine meshes, I keep these fixed:

- geometry;
- boundary-layer settings;
- numerical schemes;
- convergence criteria; and
- averaging and sampling rules.

I then vary one controlled refinement parameter. Otherwise, the difference between the medium and fine meshes mixes several causes. I get a difference, but I cannot explain what it means.

I also define the output that matters before the study. A lower residual cannot replace a check of the coefficient or temperature that drives the engineering decision.

## A physical comparison must state whether the conditions match

When I compare a calculation with wind-tunnel or test-rig data, I check:

- geometry;
- Reynolds number;
- Mach number;
- ground treatment;
- wheels;
- support structure;
- blockage correction;
- vehicle attitude;
- yaw angle; and
- the quantity that was actually measured.

If those conditions do not match, the comparison may still be useful, but I call it a trend comparison rather than full physical validation.

That is why I show the NASA NACA 0012 data beside the inviscid airfoil predictions. Agreement in the linear range is useful, while the missing wake drag and stall make the model boundary clear.

## I stopped before making production predictions when the F1 mesh failed

In the F1 2026 full-car project, I tried twenty constrained meshing routes. The best volume mesh still had eight high-skew faces that failed the checks, so I did not start the production solve.

An earlier coarse case was still useful for checking force signs and the output-processing pipeline. A calm-looking force history did not make it a production aerodynamic prediction.

The failure showed exactly where the workflow stopped. The output processing passed its basic checks, but the production mesh did not pass the numerical gate. I therefore could not claim physical validation or use the model to support full-car design decisions.

## What I answer before publishing a CFD result

Before I publish a CFD number, I want to answer:

- What decision is this number meant to support?
- Which geometry revision and operating condition produced it?
- Did the implementation pass a known-answer check?
- Did mesh, time step, or sampling change the actual decision metric?
- Is there an independent physical reference?
- Do the reference and calculation conditions really match?
- Which failed cases changed the plan?
- Can I regenerate the number and figure from the same data?
- How far does the current evidence allow me to take the conclusion?

The standard I keep is simple: **check the code first, the numerics second, the physics third, and only then decide whether the workflow is fit for design use.**
