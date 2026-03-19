---
title: 'Building a custom solver: Bringing Lattice Boltzmann to the browser'
year: 2026
date: '2026-05-16'
status: complete
categories: [tooling, validation]
tags: [CFD]
summary: 'Web fluid animations are mostly shader tricks with no mass or momentum conservation. I wrote a zero-dependency Lattice Boltzmann solver (FlowLab, D2Q9) from scratch in JavaScript: powering a 60 FPS interactive browser canvas while passing rigorous Ghia et al. benchmark regressions in Node.js.'
role: 'Numerical Methods & Software Engineering'
duration: 'Independent study'
featured: false
order: 5
studySequence: 14
heroImage: /images/projects/flowlab/cavity-vorticity.svg
github: 'https://github.com/gaoflow/flowlab'
---

## Why web fluid toys are mostly fake physics

The starting point of this project was examining interactive fluid demos on the web (such as stirring smoke with a mouse). While visually striking, looking at the code revealed they are mostly shader filters or heavily simplified approximations where mass and momentum are not conserved.

As a computational mechanics student, I wondered: could we build a serious, conservation-preserving CFD solver directly inside the browser?

Could the exact same numerical core pass strict benchmark regressions in Node.js while driving a 60 FPS interactive canvas where users draw obstacles and watch vortex dynamics evolve in real time? That question led to FlowLab, a zero-dependency D2Q9 lattice-Boltzmann solver.

## What happens in a single iteration step

FlowLab uses a standard D2Q9 lattice with single-relaxation-time BGK collision. Each grid node stores 9 particle distribution functions, representing the population fractions moving along discrete lattice directions. The execution sequence per time step is fixed:

```text
Recover density and velocity from 9 distribution components
→ Construct local equilibrium distributions
→ BGK collision step
→ Moving lid momentum correction
→ Stream along 9 discrete lattice vectors
→ Recompute velocity and vorticity
→ Check residual convergence
```

In plain terms: first count the particles at each cell to find density and bulk velocity; calculate the theoretical equilibrium state for each direction; execute collision by relaxing current distributions toward equilibrium at a rate governed by relaxation time $\tau$; apply lid momentum; stream particles to neighboring nodes; and recompute macroscopic fields to evaluate residuals.

Kinematic viscosity is defined by

$$
\nu=\frac{U_{lid}L}{Re}
$$

which converts to lattice relaxation time $\tau=0.5+3\nu$. Because BGK becomes numerically fragile as $\tau$ approaches 0.5, the solver refuses to run if inputs push $\tau$ too close to the stability limit.

## Moving lid: why overwriting velocity post-streaming is flawed

A naive shortcut is to run streaming, then manually overwrite the velocity of the top row to $U_{lid}$. Visually, the boundary condition appears satisfied. However, incoming distribution functions do not receive the corresponding momentum transfer, creating subtle mass and momentum leaks elsewhere in the domain.

I embedded the moving-wall momentum directly into the bounce-back step: stationary walls use halfway bounce-back, while the top lid adds a velocity-dependent correction to reflected populations. Boundary conditions remain an integral part of distribution updating rather than an ad-hoc post-processing patch.

## Why 20,000 steps was not yet converged

Every 250 iterations, the solver measures the RMS change across both velocity components, normalized by lid speed, to evaluate residuals.

The first automated benchmark run stopped at 20,000 steps. While centerline profiles closely resembled reference data, the residual remained at $4.80\times10^{-7}$, failing the strict convergence criterion of $2.00\times10^{-7}$.

Looking like the reference solution and reaching internal steady-state convergence are two different milestones. Rather than loosening acceptance thresholds to declare an early pass, I increased iteration budgets across all grids.

## Grid convergence results

All three grid resolutions ran to true residual convergence:

| Fluid Grid | Iterations | Final Residual | $u/U_{lid}$ RMSE | $v/U_{lid}$ RMSE |
|---:|---:|---:|---:|---:|
| 32² | 14,750 | $1.85\times10^{-7}$ | 0.00511 | 0.00404 |
| 48² | 22,000 | $1.91\times10^{-7}$ | 0.00369 | 0.00208 |
| 64² | 27,500 | $1.89\times10^{-7}$ | 0.00286 | 0.00202 |

Streamwise velocity error drops consistently with grid refinement. Normal velocity error plateaus after 48², indicating that residual discrepancies stem from spatial resolution limits rather than iteration count.

## Benchmarking against classic literature

Reference data comes from the classic lid-driven cavity benchmark by Ghia, Ghia, and Shin in the *Journal of Computational Physics* ([DOI](https://doi.org/10.1016/0021-9991(82)90058-4)).

Because published sampling coordinates do not fall directly on lattice nodes, the benchmark suite interpolates centerline velocities to exact literature coordinates before computing RMSE.

![Vertical centerline u velocity: FlowLab vs Ghia et al.](/images/projects/flowlab/centerline-u.svg)

![Horizontal centerline v velocity: FlowLab vs Ghia et al.](/images/projects/flowlab/centerline-v.svg)

On the 64² grid, centerline RMSE across both components remains well below 1%, with a relative mass drift of $2.56\times10^{-12}$ (far below the $10^{-9}$ threshold).

These three checks serve distinct auditing roles: residuals verify internal numerical steady state, reference datasets verify physical velocity alignment, and mass tracking confirms global conservation.

## Why a plausible vorticity plot is not enough

Producing a central recirculation vortex in a cavity is easy. Incorrect lid momentum, distorted corner vortices, or inaccurate centerline velocities can still produce a visually plausible contour map.

Visual flowfields illustrate qualitative topology; quantitative validity is determined by centerline metrics and conservation tracking.

## Performance and software architecture

On Apple M4 hardware, the 64² benchmark run achieved approximately 26.3 million lattice updates per second, completing 27,500 steps in 4.28 seconds.

The browser edition uses a 96×64 fluid lattice, advancing 5 iterations per animation frame with a live FPS counter.

The numerical core is strictly decoupled from the DOM and rendering logic. Node.js manages regression tests and benchmark validation; the browser UI reads velocity and vorticity buffers as read-only arrays without mutating distribution state.

## Limits and next work

Quantitative verification is currently established for steady $Re=100$ cavity flow. Higher Reynolds numbers are supported as exploratory interactive demos.

BGK becomes fragile as $\tau$ approaches 0.5, and halfway bounce-back introduces grid-dependent effective wall positions. Lattice time is also unmapped to physical dimensional seconds.

It is a numerical demonstration and pedagogical tool, not a replacement for commercial finite-volume solvers. Migrating to Multi-Relaxation-Time (MRT) or regularized collision operators in the future will require re-running full grid convergence benchmarks.

When I used this solver to study unsteady periodic flows, the massive volume of snapshot files quickly consumed disk storage. To resolve dataset explosion and forecast future dynamics, I built the downstream reduced-order pipeline: [Reduced-Order Modeling: Compressing 480 Flow Fields into a Few Modes (FlowROM)](/projects/flowrom).

## Code and reproduction

The source code is open source on GitHub: [gaoflow/flowlab](https://github.com/gaoflow/flowlab)

```bash
git clone https://github.com/gaoflow/flowlab.git
cd flowlab
npm test
npm run analyse
```

## Practical applications

When exploring lid-driven cavity flows, secondary corner vortex formation, and wall shear phenomena, traditional CFD pipelines require separate pre-processing, meshing, solver execution, and file exports.

FlowLab operates as a zero-dependency lattice-Boltzmann solver that serves two simultaneous roles: it executes automated, rigorous benchmark validation in Node.js (matching Ghia data to RMSE = 0.00286), while powering a 60 FPS interactive canvas in the web browser. Users can draw obstacles, adjust lid speed, and modify Reynolds numbers to observe vortex evolution in real time.

## What this project taught me

Stopping early at 20,000 steps proved that looking close to reference data is not equivalent to reaching internal numerical convergence. Expanding the iteration budget allowed the solver to finish its convergence path without compromising acceptance standards.

Refining the moving lid boundary also demonstrated that presentation layers must never patch numerical boundary conditions post-hoc. A visually correct surface value is meaningless unless distribution functions and conservation laws are updated consistently inside the solver core.
