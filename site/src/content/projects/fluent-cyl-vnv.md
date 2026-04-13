---
title: 'How I Checked Fluent with Exact Solutions, Mesh Studies and Experimental Data'
year: 2026
date: '2026-03-12'
status: complete
categories: [component-cfd, validation]
tags: [CFD]
summary: 'I first checked Fluent pipe flow against the exact Poiseuille solution, then studied mesh, domain and Re=0.1–20 effects around a cylinder; Cd stabilised at 2.7973 with 40,000 cells, but only Re=20 fell within 5% of the experimental data.'
role: 'Simulation & report lead'
team: 'ESILV MMN1 group — Bing Gao, Nicolas Chang, Daphné Baray'
duration: '7 weeks (TD1+TD4)'
academic:
  institution: 'ESILV'
  course: 'Computational Fluid Dynamics'
  assignment: 'TD1 pipe validation + TD4 cylinder verification study'
  note: 'This was the verification part of my first-year CFD module at ESILV, covering tutorials TD1 and TD4. I worked in a group of three with Nicolas Chang and Daphné Baray. I ran the Fluent simulations and wrote both reports; the group reviewed the setups and cross-checked the tables. After the course, I regenerated every chart on this page from the report tables and the surviving console log, so each numerical value can be reproduced by a script.'
  requirements:
    - 'Validate laminar pipe flow against Poiseuille velocity, wall shear, pressure drop and entrance length.'
    - 'Establish cylinder mesh independence at Re=10.'
    - 'Establish far-field domain independence.'
    - 'Sweep Reynolds number from 0.1 to 20 and compare drag with the supplied experimental table under a 5% course gate.'
  media:
    - src: '/images/projects/fluent-cyl-vnv/source/td1-submitted-report-cover.webp'
      alt: 'Cover of the submitted ESILV CFD TD1 report on pipe-flow validation'
      caption: 'The archived TD1 source is the submitted report rather than a separate assignment sheet. Its cover fixes the scope as Poiseuille pipe-flow validation; the numerical results come from the report and console log.'
    - src: '/images/projects/fluent-cyl-vnv/source/td4-submitted-report-cover.webp'
      alt: 'Cover of the submitted ESILV CFD TD4 report on cylinder mesh studies and the Reynolds-number sweep'
      caption: 'The TD4 report separates two tasks: the Re=10 mesh and domain study, and the Re=0.1–20 sweep on a fixed case grid. The handout’s experimental table is used only for the final 5% external check.'
    - src: '/images/projects/fluent-cyl-vnv/assignment-workflow.svg'
      alt: 'Workflow from the exact pipe-flow case through mesh and domain sweeps to experimental comparison'
      caption: 'The assignment progresses from checking the solver on a problem with an exact solution, through bounding mesh and domain effects, to interpreting the remaining difference from experiment.'
    - src: '/images/projects/fluent-cyl-vnv/velocity-re20.png'
      alt: 'ANSYS Fluent velocity-magnitude contour around the cylinder at Reynolds number 20'
      caption: 'At Re=20, the wake is clearly visible and the drag comparison finally enters the assignment’s 5% experimental band.'
    - src: '/images/projects/fluent-cyl-vnv/pressure-re20.png'
      alt: 'ANSYS Fluent static-pressure contour around the cylinder at Reynolds number 20'
      caption: 'Pressure peaks at the upstream stagnation point and falls around the cylinder shoulders, explaining the integrated pressure-drag result.'
featured: true
order: 16
studySequence: 9
heroImage: /images/projects/fluent-cyl-vnv/cd-vs-re.svg
---

## Why I started with pipe flow

Both CFD tutorials addressed the same question: when should I trust a number produced by Fluent?

The first part used Poiseuille pipe flow, which has an exact solution, to check the boundary conditions, mass conservation, velocity, wall shear and pressure drop. The second part moved to flow around a cylinder, where there is no closed-form solution, and examined mesh effects, domain effects and differences from experimental data separately.

This was a three-person group assignment. I ran the Fluent simulations and wrote both reports, while the group reviewed the setups and cross-checked the result tables.

## TD1: checking the complete workflow with Poiseuille flow

The pipe was 10 m long with a radius of 0.2 m. The mean inlet velocity was 1 m/s, the density was 1 kg/m³ and the dynamic viscosity was 0.004 Pa·s, giving $Re=100$.

The surviving run used 500 quadrilateral cells and 561 nodes.

| Check | Analytical value | Fluent result |
|---|---:|---:|
| Convergence | Residuals below $10^{-6}$ | Reached at iteration 53 |
| Net mass imbalance | 0 | $-2.8\times10^{-10}$ kg/s |
| Maximum centreline velocity | 2.00 m/s | 1.98 m/s |
| Wall shear stress | 0.08 Pa | 0.08 Pa |
| Fully developed pressure drop | 8 Pa | 8.65 Pa |
| Entrance length | 2.4 m | About 2.4 m |

The centreline velocity was 1% below the exact value. The extra 0.65 Pa of pressure drop came from the entrance region, where the wall gradient was larger before the velocity profile became parabolic.

I initially estimated the entrance length visually as about 2 m. In the final report, I replaced that judgement with a defined criterion: the point where the centreline velocity reached 99% of its final value. This gave an entrance length of about 2.4 m, consistent with the analytical relation.

That correction showed me why a written criterion is more reliable than deciding that a curve “looks close enough.”

## TD4: keeping the cylinder model simple

The cylinder diameter was 1 m, and the external fluid domain was a circular region with diameter $D_2$. The fluid density was 1 kg/m³ and its dynamic viscosity was $10^{-3}$ Pa·s. I varied the inlet velocity to set the Reynolds number.

The model was two-dimensional, steady, laminar and incompressible. I applied a uniform inlet velocity, zero gauge pressure at the outlet and a no-slip condition on the cylinder wall.

I first searched for mesh and domain plateaus at $Re=10$. I then kept the case settings fixed while sweeping Reynolds number from 0.1 to 20.

## The mesh plateau needed coarse points

| Cells | 50 | 200 | 450 | 800 | 12,800 | 28,800 | 40,000 |
|---|--:|--:|--:|--:|--:|--:|--:|
| $C_D$ | 3.1328 | 2.7982 | 2.7757 | 2.7800 | 2.7938 | 2.7953 | 2.7973 |

From 12,800 cells onward, each further change in $C_D$ was below 0.1%. I retained the 40,000-cell result, $C_D=2.7973$.

![Mesh sensitivity at Re=10](/images/projects/fluent-cyl-vnv/mesh-sensitivity.svg)

My first refinement, from 12,800 to 28,800 cells, changed the result by only 0.05%. However, two nearby fine-grid values were not enough to demonstrate that a plateau existed.

The downward sweep supplied the missing evidence. The 50-cell mesh gave $C_D=3.1328$, about 12% above the final value. This coarse point showed that the result did depend on resolution before approaching the stable range, making the plateau more convincing.

## The outer boundary also changed cylinder drag

With the mesh fixed, I increased the outer-domain diameter from 100 to 200 m:

| $D_2$ | 100 m | 120 m | 150 m | 180 m | 200 m |
|---|--:|--:|--:|--:|--:|
| $C_D$ | 2.7973 | 2.7889 | 2.7806 | 2.7751 | 2.7723 |

The change from 100 to 200 m was below 1%, so I retained $D_2=100$ m.

![Domain sensitivity on the fixed mesh](/images/projects/fluent-cyl-vnv/domain-sensitivity.svg)

Smaller domains between 20 and 80 m raised $C_D$ to about 3.05, showing that the outer boundary constrained the flow. Those low-end cases also used coarser boundary divisions, however, so they only indicate the scale of the domain effect. They do not separate it completely from the mesh effect.

## Reynolds-number sweep on a fixed case

The sweep used one grid with about 20,200 nodes and $D_2=50$ m. As $Re$ increased from 0.1 to 20, $C_D$ fell from 92.4 to 2.06.

| $Re$ | Inlet velocity (m/s) | Drag force (N) | $C_D$ |
|---:|---:|---:|---:|
| 0.1 | $10^{-4}$ | $4.62\times10^{-7}$ | 92.4 |
| 0.5 | $5\times10^{-4}$ | $2.42\times10^{-6}$ | 19.37 |
| 1 | $10^{-3}$ | $5.71\times10^{-6}$ | 11.43 |
| 5 | $5\times10^{-3}$ | $5.14\times10^{-5}$ | 4.11 |
| 10 | $10^{-2}$ | $1.43\times10^{-4}$ | 2.85 |
| 20 | $2\times10^{-2}$ | $4.11\times10^{-4}$ | 2.06 |

When I compared these values with the experimental table supplied in the course handout, only $Re=20$ fell within the required 5% error band:

| $Re$ | 0.1 | 0.5 | 1 | 5 | 10 | 20 |
|---|--:|--:|--:|--:|--:|--:|
| Relative error | 81.2% | 51.1% | 48.9% | 32.4% | 17.5% | 3.83% |

Five of the six points failed the course threshold. I did not hide that result by tuning the setup toward the experimental values.

## Why the difference was largest at low Reynolds numbers

The sweep grid was coarser than the 40,000-cell reference mesh used at $Re=10$, and its domain was smaller. Those setting changes alone increased the $Re=10$ result from $C_D=2.7973$ to 2.85.

At $Re\le1$, the steady two-dimensional model was also a stronger assumption. In the $Re=0.1$ case, the continuity residual stalled and the velocity residuals reached only $10^{-3}$. I therefore treat its $C_D=92.4$ result as the least reliable of the six points.

The experimental difference cannot be assigned to one cause. It contains discretisation, domain and model-form effects at the same time.

## Correcting mismatches in the working records

The TD1 draft described a 1,000-cell grid, but the only surviving console log came from a 500-cell run. I used the data associated with that log rather than repeating a mesh description that I could no longer verify.

The entrance-length record needed a different correction. The first visual estimate was about 2 m, but the final report defined the entrance length as the point where the centreline velocity reached 99% of its final value. That reproducible criterion gave about 2.4 m.

There was also a figure-bookkeeping error in TD4. A pressure figure labelled $Re=20$ in the report actually reused the $Re=10$ export. The drag conclusion still comes from the force table, but that report figure cannot demonstrate the $Re=20$ pressure field.

These problems taught me to treat run identity as part of validation. A filename, draft description or caption cannot replace the console log and the corresponding numerical results.

## Results I retained

| Check | Retained result |
|---|---|
| TD1 centreline velocity | 1% below the analytical value |
| TD1 wall shear, entrance length and pressure-drop trend | Consistent with the analytical results |
| $Re=10$ mesh plateau | Further changes below 0.1% in the fine-grid range, with $C_D=2.7973$ at 40,000 cells |
| $Re=10$ domain plateau | Change below 1% for $D_2\ge100$ m |
| $Re=20$ comparison with handout drag | 3.83% error, passing the 5% requirement |
| $Re\le10$ comparison with handout drag | 17.5%–81.2% error, failing the requirement |

## What this work does not establish

The cylinder sweep only covers $Re\le20$. It cannot be extended to higher Reynolds numbers or unsteady vortex shedding. The two-dimensional model also omits possible three-dimensional wake structures.

The uniform TD1 mesh was sufficient for the analytical checks performed here, but it was not an optimal near-wall resolution strategy. A better next step would be to add inflation layers near the wall.

I regenerated the charts on this page from the report tables and surviving logs without rerunning Fluent. The experimental curve comes from the course handout table, so this page can only recheck the saved data; it does not add new simulation results.

## What I learned

Two close fine-grid results do not prove a plateau by themselves. Sweeping toward coarse meshes and seeing the result move clearly away from the stable range provided stronger evidence that the retained setting was sufficiently resolved.

I also stopped using the circular claim that a mesh must be optimal because its result agrees with theory. The defensible conclusion is narrower: the current mesh was adequate for the checks I performed. Establishing that it was optimal would require a separate comparison of computational cost and error.
