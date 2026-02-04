---
title: 'Fluent Cylinder V&V — Mesh, Domain & Reynolds Sweeps'
year: 2026
date: '2026-03-29'
status: complete
categories: [component-cfd, validation]
tags: [ANSYS Fluent, cylinder drag, mesh independence, domain sensitivity, Poiseuille]
summary: 'Poiseuille flow validates within 1%; cylinder mesh and domain sweeps converge at Cd 2.7973, but only Re=20 meets the 5% experimental gate.'
methodLine: 'ANSYS Fluent · steady laminar · mesh/domain plateaus · handout benchmark'
role: 'Simulation & report lead'
team: 'ESILV MMN1 group — Bing Gao, Nicolas Chang, Daphné Baray'
duration: '7 weeks (TD1+TD4)'
heroMetrics:
  - { label: 'Plateau Cd at Re 10', value: '2.7973' }
  - { label: 'Mesh plateau', value: '<0.1% past 40k cells' }
  - { label: 'Domain plateau', value: '<1% at D2 ≥ 100 m' }
  - { label: 'Handout gap at Re 20', value: '3.83%' }
keyOutputs:
  - 'Validated the Fluent workflow on a Re=100 pipe first: centreline velocity 1.98 vs 2.00 m/s analytical, wall shear 0.08 Pa, and entrance length 2.4 m all matching Poiseuille theory.'
  - 'Ran Workbench design-point sweeps at Re=10: drag plateaus past 40,000 cells (<0.1%) and past D2=100 m (<1%), fixing the reference setup at Cd=2.7973.'
  - 'Swept six Reynolds numbers (0.1–20) on one fixed grid, overlaid the handout experimental drag curve, and showed the 5% margin holds only at Re=20 (3.83%) — with the low-Re bias traced to grid and modelling limits rather than tuned away.'
featured: true
order: 16
studySequence: 5
heroImage: /images/projects/fluent-cyl-vnv/cd-vs-re.svg
---

## Context & objective

Two first-year CFD tutorials, one question in common: when can a number out of ANSYS Fluent be trusted? The pipe tutorial (TD1) checks the solver against analytical Poiseuille flow, where every output has an exact answer. The cylinder tutorial (TD4) then runs the same verification loop without a closed-form solution: mesh and domain sweeps at $Re=10$ to find plateaus, a Reynolds sweep from 0.1 to 20, and a final benchmark against tabulated experimental drag.

Results first. On the pipe, every checkable quantity — centreline velocity, wall shear, pressure drop, entrance length — lands within 1% of the analytical value. On the cylinder, $C_D$ plateaus at 2.7973 beyond 40,000 cells and $D_2 = 100$ m, and the experimental benchmark passes the course's 5% margin at exactly one of six Reynolds numbers.

This was three-person group work (ESILV MMN1). I ran the simulations and wrote both reports; the group reviewed setups and cross-checked the tables.

## Warm-up: Poiseuille pipe against the exact solution (TD1)

Fluent reproduces analytical laminar pipe flow to 1% on a 500-cell mesh. That validates the whole chain — solver settings, boundary conditions, post-processing — before any case without a closed-form answer.

Setup: 2-D axisymmetric pipe, $L = 10$ m, radius 0.2 m, uniform inlet $\bar U = 1$ m/s, $\rho = 1$ kg/m³, $\mu = 0.004$ Pa·s, so $Re = \rho \bar U D / \mu = 100$, firmly laminar. Mesh: 500 quadrilateral cells, 561 nodes. Every check below comes from the Fluent console log or the report figures.

| Check | Analytical | Fluent | Outcome |
|---|---:|---:|---|
| Convergence | residuals $<10^{-6}$ | iteration 53 | pass |
| Net mass imbalance | 0 | $-2.8\times10^{-10}$ kg/s on 0.1257 kg/s | $\sim10^{-9}$ relative |
| Centreline $V_{max} = 2\bar U$ | 2.00 m/s | 1.98 m/s | 1% low |
| Wall shear $\tau_w = 8\mu\bar U/D$ | 0.08 Pa | 0.08 Pa, developed region | match |
| Pressure drop $32\mu L\bar V/D^2$ | 8 Pa | 8.65 Pa total | +0.65 Pa entrance loss |
| Entrance length $0.06\,Re\,D$ | 2.4 m | 99% of final velocity at $x \approx 2.4$ m | match |

The 0.65 Pa excess over Hagen–Poiseuille is the entrance-region penalty — steeper wall gradients before the profile turns parabolic. Right direction, right order of magnitude, so it counts as evidence rather than noise.

One honest caveat carried into the report: the uniform 500-cell mesh was adequate, and a wall-refined mesh with inflation layers would have resolved the shear gradient with fewer cells. Adequate and optimal are different claims, and conflating them here would have undermined the mesh discipline TD4 depends on.

## Cylinder model (TD4)

The configuration is deliberately simple — steady, laminar, 2-D, incompressible — so that every discrepancy can be traced to mesh, domain, or modelling assumption.

A cylinder of $D = 1$ m sits in a circular fluid annulus of outer diameter $D_2$, exposed as a Workbench parameter. Fluid $\rho = 1$ kg/m³, $\mu = 10^{-3}$ Pa·s; the Reynolds number $Re = \rho U_\infty D / \mu$ is set through the inlet velocity. Uniform velocity on the inlet arc, zero gauge pressure on the outlet arc, no slip on the wall. Pressure-based steady solver with the laminar model, residuals driven below $10^{-6}$ (about 50 iterations at $Re = 10$). The mesh is quad-dominant with edge divisions on both circles and a radial bias of 500 packing cells at the wall, where separation and the boundary layer live. Coefficients come from Fluent surface integrals, $C_D = F_D / (\tfrac{1}{2}\rho U_\infty^2 D)$.

## Part A: mesh and domain plateaus at Re=10

$C_D$ stops moving past 40,000 cells and past $D_2 = 100$ m. That configuration, $C_D = 2.7973$ ($F_D \approx 1.40\times10^{-4}$ N), becomes the reference for everything after.

![Drag coefficient vs mesh element count at Re=10, log scale](/images/projects/fluent-cyl-vnv/mesh-sensitivity.svg)

| Cells | 50 | 200 | 450 | 800 | 12,800 | 28,800 | 40,000 |
|---|--:|--:|--:|--:|--:|--:|--:|
| $C_D$ | 3.1328 | 2.7982 | 2.7757 | 2.7800 | 2.7938 | 2.7953 | 2.7973 |

The coarsest mesh over-estimates drag by 12%. From 12,800 cells onward $C_D$ moves less than 0.1%, which is the plateau criterion. Retained: 200 divisions on each circle, 40,000 cells, 40,200 nodes.

![Drag coefficient vs outer domain diameter at Re=10, fixed mesh](/images/projects/fluent-cyl-vnv/domain-sensitivity.svg)

| $D_2$ (m) | 100 | 120 | 150 | 180 | 200 |
|---|--:|--:|--:|--:|--:|
| $C_D$ | 2.7973 | 2.7889 | 2.7806 | 2.7751 | 2.7723 |

On the fixed optimum mesh, $C_D$ shifts less than 1% from $D_2 = 100$ to 200 m, so 100 m is retained. The low end of the sweep shows why the check matters: at $D_2 = 20$–80 m the same case returns $C_D$ up to 3.05, because a confining outer boundary inflates drag. Those three points also carried coarser edge divisions, so they bound the domain effect rather than isolate it — one more reason to quote the plateau from the constant-mesh rows only.

## Part B: Reynolds sweep on a fixed grid

$C_D$ falls monotonically from 92.4 to 2.06 as $Re$ rises from 0.1 to 20, and the wake grows accordingly in the field plots. Only $Re = 20$ meets the course's 5% margin against the experimental table.

Part B reuses the Workbench case matrix ($D_2 = 50$ m, about 20,200 nodes) so all six Reynolds numbers share one grid; mesh and far-field independence remain Part A results. Forces are normalised with the local $U_\infty$, which matters here because a fixed reference velocity would corrupt the coefficients across a 200× velocity range.

| $Re$ | $U_\infty$ (m/s) | $F_D$ (N) | $C_D$ |
|---:|---:|---:|---:|
| 0.1 | $10^{-4}$ | $4.62\times10^{-7}$ | 92.4 |
| 0.5 | $5\times10^{-4}$ | $2.42\times10^{-6}$ | 19.37 |
| 1 | $10^{-3}$ | $5.71\times10^{-6}$ | 11.43 |
| 5 | $5\times10^{-3}$ | $5.14\times10^{-5}$ | 4.11 |
| 10 | $10^{-2}$ | $1.43\times10^{-4}$ | 2.85 |
| 20 | $2\times10^{-2}$ | $4.11\times10^{-4}$ | 2.06 |

![Fluent drag coefficient vs Reynolds number overlaid on the handout experimental curve, log-log](/images/projects/fluent-cyl-vnv/cd-vs-re.svg)

Against the course handout's experimental $C_D$ for a smooth cylinder (used as a benchmark, never as a tuning target):

| $Re$ | 0.1 | 0.5 | 1 | 5 | 10 | 20 |
|---|--:|--:|--:|--:|--:|--:|
| Error vs handout | 81.2% | 51.1% | 48.9% | 32.4% | 17.5% | 3.83% |
| Within 5%? | no | no | no | no | no | yes |

Two things separate the gap into causes. First, grid: Part B runs a smaller domain and half the nodes of the Part A optimum, which alone moves $C_D$ at $Re = 10$ from 2.7973 to 2.85 — so the Part B points sit systematically high. Second, modelling: at $Re \le 1$ a steady 2-D laminar solve is a strong assumption, and the simulated curve lies furthest from experiment exactly there. Lift stays at numerical-noise level ($|C_L| \lesssim 0.11$) as a symmetric steady solution should, except at $Re = 0.1$, where continuity stalls and the velocity residuals reach only $10^{-3}$. That point is the weakest of the six and its 92.4 carries the least weight.

## Iteration: what the working files add

The tables above look like a procedure executed top to bottom; the drafts show the real order. TD1 survives in two versions — the group's shared Word draft and the submitted LaTeX report — plus one archived console log, and they do not describe the same mesh. The draft documents the tutorial's requested 1,000-element grid, built as 100×10 divisions with the sizing behaviour locked to "hard" so Workbench could not re-smooth the count, and quotes a mass imbalance of $-7.704\times10^{-10}$ kg/s. The submitted report kept that description, but the only console log that survives records a 500-cell, 561-node run closing mass at $-2.8\times10^{-10}$ kg/s — the run this article traces. Two passes of the same checks on two meshes; the log, not the prose, decides which run a number belongs to.

The draft also shows the entrance length read off the centreline plot by eye — "approximately 2 m" against the 2.4 m analytical value, excused as the difficulty of seeing where the plateau starts. The report replaced the eyeball with a criterion: 99% of the final velocity, which lands at $x \approx 2.4$ m and turns the row into a check. The draft's answer to "did you use the optimum mesh?" was circular — the mesh is optimal because the results match theory. The report downgraded that to adequate-for-the-checks-run, a claim a review can attack and the data can defend.

TD4's protocol document records the mesh sweep in the order it ran, and the order was bracketing. First attempt: 80 divisions per circle, 12,800 cells, $C_D = 2.7938$. Refine: 120 divisions, 28,800 cells, 2.7953 — a 0.05% move that on its own says nothing. Then the group swept down through 20, 5, 10, and 15 divisions to find the edge, and found it at 50 cells: $C_D = 3.1328$, 12% high. Only then did the 200-division, 40,000-cell run land at 2.7972802 and freeze the reference the table rounds to 2.7973. The domain choice has the same shape: $D_2 = 100$ m started as a rule of thumb quoted from the tutorial brief ("the outer limit of the fluid domain should be far enough to avoid border effects"), and the domain sweep exists because the group verified the rule instead of trusting it.

## Validation summary

| Gate | Observed | Threshold |
|---|---:|---:|
| TD1 centreline velocity vs Poiseuille | 1% low | exact solution |
| TD1 wall shear / entrance length / $\Delta P$ slope | match analytical | exact solution |
| TD4 mesh plateau at $Re=10$ | <0.1% past 40k cells | plateau |
| TD4 domain plateau at $Re=10$ | <1% for $D_2 \ge 100$ m | plateau |
| TD4 vs handout $C_D$, $Re=20$ | 3.83% | $\le$ 5% |
| TD4 vs handout $C_D$, $Re \le 10$ | 17.5–81.2% | fails |

## Failures and limitations

- Five of six Reynolds numbers miss the 5% margin. The report states this plainly; the handout curve was an external benchmark and nothing in the setup was adjusted toward it.
- At $Re = 0.1$ the continuity residual never converges properly on the case grid, so the largest-$C_D$ point is also the least trustworthy.
- The steady, symmetric laminar model holds only while the wake stays steady — the justification covers the swept range $Re \le 20$ and nothing above it, and the 2-D assumption ignores any three-dimensional wake structure near the top of the range.
- Report bookkeeping slipped once: the $C_p$ figure shown for $Re = 20$ is the same export as $Re = 10$, which the caption admits. The $C_D(Re)$ conclusion rests on the force table, so it stands, but that figure proves nothing at $Re = 20$.
- TD1's uniform mesh was adequate for the checks run, and inflating the near-wall region would have been the better default — the same wall-bias logic TD4 applied deliberately.

## Reproduce

`python3 research/esilv-cfd/plot_vnv_figures.py` regenerates all three figures in this article from the sweep data typeset in the group report (`main.tex` tables and pgfplots coordinates; the same values live in the report's own `scripts/plot_sensitivity.py`). The experimental curve is the course handout's Table 1 as digitised in the report. Fluent itself is not rerun here — the console log (`td1.txt`) and the report tables are the primary artefacts.

## What I took away

A plateau needs both sides: refining 80 to 120 divisions moved $C_D$ by 0.05% and proved nothing until the down-sweep put the 50-cell mesh 12% high. The coarse points are the plateau's evidence, not the fine ones. The second habit came from TD1: an eyeballed entrance length read 2 m against a 2.4 m theory, and the fix was a written criterion — 99% of the final value — rather than a better eye. The draft also taught me what a circular justification looks like, "the mesh is optimal because the results match", because I was the one who had to rewrite it for the report.
