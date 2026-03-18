---
title: 'FlowLab — Browser-Native Lattice-Boltzmann Validation'
year: 2026
date: '2026-05-16'
status: complete
categories: [tooling, validation]
tags: [CFD]
summary: 'I wrote a dependency-free D2Q9 BGK solver in JavaScript so Node.js validation and browser animation could share one core; for the Re=100 cavity, the 64² grid achieved a centreline RMSE of 0.00286 and relative mass drift of 2.56e−12.'
role: 'Numerical methods & software engineering'
duration: 'Independent study'
featured: false
order: 5
studySequence: 14
heroImage: /images/projects/flowlab/cavity-vorticity.svg
---

## Why I built a CFD solver for the browser

It is easy to make a browser flow animation look like CFD. A convincing vorticity plot, however, does not prove that the velocity field, boundary conditions, or mass conservation are correct.

I wanted a solver small enough to inspect line by line but capable of running in both Node.js and the browser. The browser could not use a separate simplified implementation tuned for appearance: the validation program and interactive interface had to share the same numerical core.

I chose the lid-driven cavity at $Re=100$ because canonical centreline velocity data are available, and the case tests the walls, primary vortex, corner structures, and global mass conservation together.

## How FlowLab advances one time step

FlowLab uses a D2Q9 lattice with a single-relaxation-time BGK collision operator. Each iteration follows a fixed sequence:

```text
Recover density and velocity from the nine populations
→ Build the equilibrium distribution
→ Apply BGK collision
→ Apply the moving-lid momentum correction
→ Stream along the nine lattice directions
→ Recompute velocity and vorticity
→ Check the residual
```

I calculate the kinematic viscosity from

$$
\nu=\frac{U_{lid}L}{Re}
$$

and then obtain

$$
\tau=0.5+3\nu.
$$

The solver refuses to run when $\tau$ is too close to the BGK stability boundary.

## The moving lid cannot be imposed by overwriting velocity

The most direct implementation is to overwrite the lid velocity after streaming. That makes the displayed boundary speed look correct, but it does not apply a consistent momentum change to the populations that strike the wall.

I instead included the moving-wall momentum correction in the bounce-back step. Stationary walls use halfway bounce-back, while the lid adds a velocity correction as the populations are reflected.

This makes the boundary condition part of the distribution update rather than a macroscopic value imposed after the flow field has been calculated.

## How I decided whether a run had converged

Every 250 iterations, I compare the RMS change in both velocity components and normalise it by the lid speed.

The first automated validation stopped after 20,000 iterations. Its centreline velocities were already close to the reference data, but the residual was still $4.80\times10^{-7}$, so it did not meet the convergence requirement I had set in advance.

I did not relax that requirement. I increased the iteration budgets for the different grids instead. The final runs were:

| Fluid grid | Iterations | Final residual | $u/U_{lid}$ RMSE | $v/U_{lid}$ RMSE |
|---:|---:|---:|---:|---:|
| 32² | 14,750 | $1.85\times10^{-7}$ | 0.00511 | 0.00404 |
| 48² | 22,000 | $1.91\times10^{-7}$ | 0.00369 | 0.00208 |
| 64² | 27,500 | $1.89\times10^{-7}$ | 0.00286 | 0.00202 |

The streamwise error decreases with every grid refinement. The cross-stream error changes only slightly after 48², which suggests that the remaining discrepancy cannot be explained by overall grid resolution alone.

## How I compared FlowLab with canonical data

The reference values come from the lid-driven-cavity results published by Ghia, Ghia, and Shin in *Journal of Computational Physics* 48(3), 1982 ([DOI](https://doi.org/10.1016/0021-9991(82)90058-4)).

The published sampling coordinates do not generally coincide with FlowLab grid points. Before calculating RMSE, the validation program therefore interpolates the generated centreline velocities to the reference coordinates. It compares $u/U_{lid}$ along the vertical centreline and $v/U_{lid}$ along the horizontal centreline.

![FlowLab centreline velocities against Ghia et al.](/images/projects/flowlab/centerline-validation.svg)

On the 64² grid, both RMSE values are well below 0.01. The relative mass drift is $2.56\times10^{-12}$, also below the $10^{-9}$ requirement.

These checks answer different questions. The residual shows whether the solver’s internal state has stopped changing. The reference comparison shows whether its velocity field agrees with external data. Mass drift shows whether it is losing population mass globally.

## Why a plausible primary vortex is not enough

Producing a primary vortex in a cavity is not difficult. Incorrect lid momentum, displaced corner structures, or biased centreline velocities can still produce a vorticity plot that looks reasonable.

I therefore use field images to understand the flow structure, not to decide whether a run passes validation. The centreline comparison and mass drift provide the quantitative checks.

## Performance and software structure

On an Apple M4, the recorded 64² validation run sustained about 26.3 million lattice updates per second and completed 27,500 iterations in 4.28 seconds. This is a single workstation observation, not a cross-platform performance guarantee.

The browser version uses a 96×64 fluid grid, advances five iterations per animation frame, and reports the current frame rate.

The numerical core has no DOM or plotting dependency. Node.js runs the tests, grid study, and reference comparison. The browser reads velocity or vorticity arrays for rendering but cannot modify the distribution functions.

## What the solver cannot yet do

Only the steady $Re=100$ cavity has quantitative validation. Higher Reynolds numbers remain exploratory.

BGK becomes fragile as $\tau$ approaches 0.5. Halfway bounce-back also introduces a grid-dependent effective wall location. The lattice time is nondimensional and is not mapped to the physical time of a specific fluid.

FlowLab is a numerical-method study and teaching tool, not a replacement for an industrial finite-volume solver.

If I later replace BGK with MRT or a regularised collision operator, I will need to repeat the three-grid study and the external reference checks rather than carrying the current validation claim over to the new method.



## Practical applications: real-time interactive fluid visualization and cavity vortex exploration

When exploring lid-driven cavity flows, secondary corner vortex formation, and wall shear phenomena, traditional CFD pipelines require separate pre-processing, meshing, solver execution, and file exports.

FlowLab operates as a zero-dependency lattice-Boltzmann solver that serves two simultaneous roles: it executes automated, rigorous benchmark validation in Node.js (matching Ghia data to $RMSE = 0.00286$), while powering a 60 FPS interactive canvas in the web browser. Users can draw obstacles, adjust lid speed, and modify Reynolds numbers to observe vortex evolution in real time.

## What I learned

The first 20,000-iteration run showed me that agreement with reference data and convergence of the internal state are not the same result. More iterations corrected the incomplete convergence, but lowering the acceptance standard would only have hidden it.

The moving-lid problem taught the same lesson at the software boundary. The display layer cannot repair a boundary condition that is missing from the numerical core. Drawing the correct value does not mean that the populations and conservation relationships were updated correctly.

## Code and reproduction

The source code is open source on GitHub: [gaoflow/flowlab](https://github.com/gaoflow/flowlab)

```bash
git clone https://github.com/gaoflow/flowlab.git
cd flowlab
npm test
npm run validate
```
