---
title: 'Checking Fluent Results Against an Exact Solution, Mesh Studies and Experimental Data'
year: 2026
date: '2026-03-12'
status: complete
categories: [component-cfd, validation]
tags: [CFD]
summary: 'Check a Fluent pipe-flow computation against the exact Poiseuille solution, then run mesh, domain and Re=0.1–20 sweeps for flow past a cylinder and compare with experimental data.'
role: 'Fluent simulation, data validation & report write-up'
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
heroImage: /images/projects/fluent-cyl-vnv/velocity-re20.png
---

This is my lab record for the Computational Fluid Dynamics course in the spring 2026 semester.

## What the teacher asked for

The course task first handed us a pipe 10 m long and 0.4 m in diameter: fluid enters at a uniform 1 m/s and gradually develops into fully developed flow under wall friction. The teacher asked us to first compute the Reynolds number and the analytical entrance length, and judge whether the pipe is long enough; then check convergence, mass conservation, the velocity profile, wall shear and the pressure drop; and finally compare with the exact Poiseuille solution. The course diagram draws the process very directly: the boundary layers on the two walls grow thicker from the inlet, merge at the end of the entrance region, and afterwards the velocity profile keeps its parabolic shape. It is also a very good entry case for learning CFD.

<figure>
  <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/course-pipe-entrance-region.png" alt="Course diagram of boundary-layer development and entrance length in a pipe" loading="lazy">
  <figcaption>Pipe entrance region, from the course material</figcaption>
</figure>

The cylinder-flow task swaps the problem for an external flow with no closed-form solution: the outer boundary has to be far enough away, the cylinder edge and the whole fluid domain need a clearly defined mesh size, and the results have to be checked for convergence, mass conservation, the flow field and drag, then compared with the course's smooth-cylinder drag curve.

<figure>
  <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/course-cylinder-drag-reference.png" alt="Course reference curves of drag coefficient versus Reynolds number for a smooth cylinder and a sphere" loading="lazy">
  <figcaption>The course's drag reference curve for a smooth cylinder</figcaption>
</figure>

Next, I first used the pipe flow — which has an exact solution — to check the computation workflow, then switched to the cylinder and checked mesh, domain and experimental differences one by one. And along the way I kept asking myself: can I trust the numbers Fluent gives?

## Calibrating the computation workflow with pipe flow

The pipe is 10 m long with a radius of 0.2 m; the mean inlet velocity is 1 m/s, the density is 1 kg/m³ and the dynamic viscosity is 0.004 Pa·s, so $Re=100$. In Fluent I used 500 quadrilateral cells and 561 nodes. The comparison:

| Check | Analytical value | Fluent result |
|---|---:|---:|
| Convergence | Residuals below $10^{-6}$ | Reached at iteration 53 |
| Mass imbalance | 0 | $-2.8\times10^{-10}$ kg/s |
| Maximum centreline velocity | 2.00 m/s | 1.98 m/s |
| Wall shear stress | 0.08 Pa | 0.08 Pa |
| Fully developed pressure drop | 8 Pa | 8.65 Pa |
| Entrance length | 2.4 m | About 2.4 m |

First look at the velocity field, to check that the uniform inflow really develops step by step into the Poiseuille parabolic profile.

<div class="space-y-8">
  <figure>
    <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/pipe-velocity-development.png" alt="Contour of the in-pipe velocity developing from a uniform inlet toward a parabolic profile" loading="lazy">
    <figcaption>Velocity in the pipe developing step by step from the uniform inlet</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/pipe-velocity-profiles.png" alt="Axial velocity profiles near the pipe inlet and at a downstream station" loading="lazy">
    <figcaption>Velocity profiles in the entrance region and the fully developed region</figcaption>
  </figure>
</div>

The centreline velocity is off by 1%. The extra 0.65 Pa of pressure drop comes from the entrance region: before the velocity profile grows into a parabola, the velocity gradient at the wall is larger, so the friction is naturally larger. Eyeballing the plot, the entrance length is about 2 m. The point where the centreline velocity reaches almost 99% of its final value gives about 2.4 m, so it agrees with the analytical relation.

<div class="space-y-8">
  <figure>
    <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/pipe-centerline-velocity.png" alt="Centreline velocity gradually approaching its final value along the pipe axis" loading="lazy">
    <figcaption>Centreline velocity along the pipe length</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/pipe-pressure-drop.png" alt="Centreline static pressure falling along the pipe axis" loading="lazy">
    <figcaption>Centreline static pressure along the pipe length</figcaption>
  </figure>
</div>

## Checking the cylinder case, which has no exact solution

The cylinder diameter is 1 m, and the external fluid domain is a circle of diameter $D_2$. The density is 1 kg/m³ and the dynamic viscosity is $10^{-3}$ Pa·s; I changed the Reynolds number by changing the inlet velocity. The model is two-dimensional, steady, laminar and incompressible. The inlet gets a uniform velocity, the outlet gets zero gauge pressure, and the cylinder wall is no-slip.

I first found the mesh and domain plateaus at $Re=10$, then fixed that setup and swept from $Re=0.1$ to 20.

<figure>
  <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/cylinder-domain-geometry.png" alt="Diameter parameters of the inner and outer circles in the cylinder external-flow domain" loading="lazy">
  <figcaption>Parameterized geometry of the cylinder and the adjustable outer boundary</figcaption>
</figure>

| Cells | 50 | 200 | 450 | 800 | 12,800 | 28,800 | 40,000 |
|---|--:|--:|--:|--:|--:|--:|--:|
| $C_D$ | 3.1328 | 2.7982 | 2.7757 | 2.7800 | 2.7938 | 2.7953 | 2.7973 |

From 12,800 cells onward, the change in $C_D$ stays below 0.1%. In the end I kept 40,000 cells and $C_D=2.7973$.

![Mesh sensitivity at Re=10](/images/projects/fluent-cyl-vnv/mesh-sensitivity.svg)

One thing worth noting: refining from 12,800 to 28,800 changes the result by only 0.05%, and the two points sit very close. But two close fine-grid points cannot prove a plateau exists — they may just both happen to be short of it. So I swept in the coarse direction instead. The 50-cell mesh gives 3.1328, about 12% above the final value. It is exactly this coarse point that shows the result really does change with resolution — the direction and magnitude of the change are both visible — and that is what is truly convincing.

With the mesh fixed, I increased the outer-domain diameter from 100 m to 200 m:

| $D_2$ | 100 m | 120 m | 150 m | 180 m | 200 m |
|---|--:|--:|--:|--:|--:|
| $C_D$ | 2.7973 | 2.7889 | 2.7806 | 2.7751 | 2.7723 |

The change from 100 m to 200 m is below 1%, so I kept 100 m.

![Domain sensitivity on the fixed mesh](/images/projects/fluent-cyl-vnv/domain-sensitivity.svg)

Smaller 20–80 m domains push $C_D$ up to about 3.05, which shows the outer boundary really does squeeze the flow. But those low-end points also used coarser boundary divisions, so they can only show the magnitude of the domain effect; they cannot fully separate it from the mesh effect.

The sweep used the same mesh of about 20,200 nodes and $D_2=50$ m. As $Re$ went from 0.1 to 20, $C_D$ fell from 92.4 to 2.06.

| $Re$ | Inlet velocity (m/s) | Drag (N) | $C_D$ |
|---:|---:|---:|---:|
| 0.1 | $10^{-4}$ | $4.62\times10^{-7}$ | 92.4 |
| 0.5 | $5\times10^{-4}$ | $2.42\times10^{-6}$ | 19.37 |
| 1 | $10^{-3}$ | $5.71\times10^{-6}$ | 11.43 |
| 5 | $5\times10^{-3}$ | $5.14\times10^{-5}$ | 4.11 |
| 10 | $10^{-2}$ | $1.43\times10^{-4}$ | 2.85 |
| 20 | $2\times10^{-2}$ | $4.11\times10^{-4}$ | 2.06 |

The two animations below play the real Fluent outputs for $Re=0.1$, 0.5, 1, 5, 10 and 20 in turn.

<div class="space-y-8">
  <figure>
    <video class="w-full rounded-xl shadow-sm" controls autoplay muted loop playsinline preload="metadata" aria-label="Sweep animation of the velocity field around the cylinder as the Reynolds number rises from 0.1 to 20">
      <source src="/videos/projects/fluent-cyl-vnv/reynolds-velocity-sweep.mp4" type="video/mp4">
      Your browser does not support HTML5 video.
    </video>
    <figcaption>Velocity-field sweep, Re=0.1–20</figcaption>
  </figure>
  <figure>
    <video class="w-full rounded-xl shadow-sm" controls autoplay muted loop playsinline preload="metadata" aria-label="Sweep animation of the static-pressure field around the cylinder as the Reynolds number rises from 0.1 to 20">
      <source src="/videos/projects/fluent-cyl-vnv/reynolds-pressure-sweep.mp4" type="video/mp4">
      Your browser does not support HTML5 video.
    </video>
    <figcaption>Static-pressure-field sweep, Re=0.1–20</figcaption>
  </figure>
</div>

The endpoint plots spread out the difference between the two ends. At $Re=0.1$, the viscous influence diffuses over a very large region, and there is only a smooth low-speed zone behind the cylinder; by $Re=20$, the wake is more concentrated, and the upstream stagnation high pressure and the downstream low pressure are clearer.

<div class="space-y-8">
  <figure>
    <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/velocity-re0.1.png" alt="Fluent velocity-magnitude contour around the cylinder at Reynolds number 0.1" loading="lazy">
    <figcaption>Velocity field at Re=0.1</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cyl-vnv/velocity-re20.png" alt="Fluent velocity-magnitude contour around the cylinder at Reynolds number 20" loading="lazy">
    <figcaption>Velocity field at Re=20</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/pressure-re0.1.png" alt="Fluent static-pressure contour around the cylinder at Reynolds number 0.1" loading="lazy">
    <figcaption>Static-pressure field at Re=0.1</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cyl-vnv/pressure-re20.png" alt="Fluent static-pressure contour around the cylinder at Reynolds number 20" loading="lazy">
    <figcaption>Static-pressure field at Re=20</figcaption>
  </figure>
</div>

## Comparing with 6 experimental points

Compared against the experimental table in the course handout, only $Re=20$ of the six points falls inside the 5% error band:
| $Re$ | 0.1 | 0.5 | 1 | 5 | 10 | 20 |
|---|--:|--:|--:|--:|--:|--:|
| Relative error | 81.2% | 51.1% | 48.9% | 32.4% | 17.5% | 3.83% |

The other five points all failed :(

Why is the low-Reynolds-number end the worst? Analysing it afterwards, one layer of the reason is the setup: the sweep mesh is coarser than the 40,000-cell reference mesh at $Re=10$, and its domain is smaller. Those setup differences alone pushed the $Re=10$ $C_D$ from 2.7973 up to 2.85. Another possible reason comes from the model assumptions. At $Re\le1$, steady two-dimensional flow is a stronger assumption. In the $Re=0.1$ run, the continuity residual even stalled, and the velocity residuals only came down to $10^{-3}$, so the 92.4 number is the least trustworthy of the six results.

<figure>
  <img class="w-full" src="/images/projects/fluent-cyl-vnv/source/re-0.1-residuals.png" alt="Iteration history of the continuity and velocity residuals at Reynolds number 0.1" loading="lazy">
  <figcaption>Residual history at Re=0.1</figcaption>
</figure>

The pipe-flow text record says a 1,000-cell mesh, while the only surviving console log comes from the 500-cell run. This article uses the data under the log's case conditions. Another mismatch comes from the cylinder surface pressure-coefficient $C_p$ curve: the exported figure labelled $Re=20$ is identical to the $Re=10$ file. So this article does not use that $C_p$ curve to support any $Re=20$ judgement. The $Re=20$ static-pressure contour and the force data table still match that case. So you can see: every number has to be tied to its specific case first. Filenames and captions are only clues; the log and the raw results decide which case the data belongs to.

## Summary

This assignment is where I started building my approach to CFD verification. I first did two relatively simple steady problems: check pipe flow with the exact Poiseuille solution, then check low-Reynolds-number cylinder flow with mesh, domain and external reference values. This stage settles one basic question first: what checks does a steady CFD result have to pass before it is worth trusting?

A mesh plateau cannot be judged from two close fine-grid points either. I also had to sweep toward coarse meshes and see the result clearly leave the plateau; and the domain had to be changed on its own before I could tell whether the outer boundary was still affecting the drag. Of the 6 Reynolds-number cases, only $Re=20$ entered the 5% error band. This shows residual convergence is only the starting point — it does not mean the model, mesh and domain are accurate enough.

The study here stops at two-dimensional steady laminar flow with $Re\le20$. After building this verification sequence, I pushed the same cylinder problem to higher Reynolds numbers in later assignments: first a steady-wake baseline at $Re=40$, then unsteady vortex shedding, lift and drag histories and the Strouhal number at $Re=150$. The progression is very clear: first judge whether a steady result is trustworthy, then study how the flow changes with time.
