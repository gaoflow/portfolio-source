---
title: 'FlowLab: Reproducing an LBM Solver'
year: 2026
date: '2026-05-16'
status: complete
categories: [tooling, validation]
tags: [CFD]
summary: 'To learn how to write a CFD solver, I reproduced a simple LBM solver in JavaScript and wrote a lid-driven cavity demo at Re=100'
role: 'Numerical Methods & Software Engineering'
duration: 'Independent study'
featured: false
order: 5
studySequence: 14
heroImage: /images/projects/flowlab/cavity-vorticity.svg
github: 'https://github.com/gaoflow/flowlab'
---

## Trying to write a solver by hand

A solver is a very important part of CFD. I happen to have coding experience, so I wondered whether I could reproduce a simple solver. I wanted to see how the fluid state actually changes and how a solver should be written, and through that better understand every state update. To check I had not written anything obviously wrong, I then verified it with a real test case. Specifically, I did the lid-driven cavity first. It is a square cavity with three stationary sides and a top edge moving to the right at constant speed.

## The cavity first

The quantitative verification covers only the steady $Re=100$ cavity, on three fluid grids: 32², 48² and 64². I compared the centreline velocities with the classic results of Ghia, Ghia and Shin, and checked the convergence residual and the mass drift at the same time.

The web demo calls this `LBMSolver`, uses a rectangular 96×64 grid, and defaults to $Re=400$. [You can see the FlowLab demo here](/labs/flowlab/)

## The design steps

I chose the most basic two-dimensional LBM formulation. Each lattice node stores 9 particle distributions, corresponding to staying in place, the four axial directions and the four diagonal directions. The rest direction has weight $4/9$, the four axial directions $1/9$ each, and the four diagonal directions $1/36$ each.

At each step, I first add the 9 distributions together to recover the density, then weight them along the 9 directions to recover the velocity. Next I build the equilibrium distribution from the density, velocity, directions and weights. The collision process moves the current distributions towards this equilibrium. How much they move is decided by the relaxation time $\tau$.

After the collision, I push each distribution to the neighbouring node it points at. This is push streaming. If the target node is a wall, I send it back to the current node along the opposite direction, which gives halfway bounce-back. The lid is not a stationary wall, so the reflection also needs a momentum correction based on the wall velocity. After swapping the old and new distribution buffers, the program recovers the density and velocity again and computes the vorticity with $\partial v/\partial x-\partial u/\partial y$.

The Reynolds number first sets the kinematic viscosity, which then sets the relaxation time:

$$
\nu=\frac{U_{lid}L}{Re}
$$

$$
\tau=0.5+3\nu
$$

I found that the closer $\tau$ gets to 0.5, the more easily this single-relaxation-time formulation goes unstable. The code refuses to run when $\tau\leq0.5005$. A steady-state run compares the RMS change of the two velocity components every 250 steps, normalised by the lid speed. I take this as the convergence residual.

At first, I set the macroscopic velocity of the top row directly to the target value after streaming. It looked right on the plot, but the distributions hitting the wall never got the corresponding momentum change. In other words, the displayed velocity changed while the solver's internal distribution state did not change with it. Later I moved the moving-wall correction into the bounce-back process. Stationary walls get the usual halfway bounce-back, and the lid adds the momentum from the wall velocity when reflecting distributions. That way the boundary condition truly entered the solution step.

On the first 48² validation, I set the cap at 20,000 steps. When the run ended, the centreline velocities were already very close to the reference data, but the residual was still $4.80\times10^{-7}$, failing the pre-set convergence threshold of $2\times10^{-7}$. Instead of lowering the threshold, I increased the iteration budget. So a result close to an external reference does not mean the solver has stopped changing inside.

## The results across the three grids

With the larger budget, all three grids passed the same convergence threshold. The velocity errors in the table are RMSE values computed against the reference after interpolating FlowLab results to the sampling coordinates; the mass drift is the relative change in total mass before and after the run.

| Fluid grid | Iterations | Final residual | $u/U_{lid}$ RMSE | $v/U_{lid}$ RMSE | Relative mass drift |
|---:|---:|---:|---:|---:|---:|
| 32² | 14,750 | $1.85\times10^{-7}$ | 0.00511 | 0.00404 | $1.49\times10^{-12}$ |
| 48² | 22,000 | $1.91\times10^{-7}$ | 0.00369 | 0.00208 | $2.13\times10^{-12}$ |
| 64² | 27,500 | $1.89\times10^{-7}$ | 0.00286 | 0.00202 | $2.56\times10^{-12}$ |

The reference data comes from Ghia, Ghia & Shin (1982), *Journal of Computational Physics* 48(3), 387–411 ([DOI](https://doi.org/10.1016/0021-9991(82)90058-4)).

![Vertical-centreline u-velocity profile: FlowLab vs Ghia et al.](/images/projects/flowlab/centerline-u.svg)

![Horizontal-centreline v-velocity profile: FlowLab vs Ghia et al.](/images/projects/flowlab/centerline-v.svg)

On the 64² grid, the RMSE of both centrelines is below 1% of the lid speed, and the relative mass drift is below $10^{-9}$. The residual checks whether the state is steady, the Ghia comparison checks whether the velocities are close to an external answer, and the mass drift checks whether mass is lost globally. Still, a decent-looking main-vortex picture cannot replace these checks. When the boundary momentum is written wrong, the picture can still look like a fluid. So the vorticity plot is only for looking at structure, not as evidence that validation passed.

## The web demo

My web demo creates a simple `LBMSolver`. It just swaps the square used for validation for a 96×64 fluid grid. The interface can select $Re=100$, 400 or 1000, switch between velocity and vorticity, pause and reset, and drag the flow field with a mouse or touch.

The animation calls `solver.step(1)` once per frame, then draws from the solver's velocity or vorticity buffer. Dragging is a deliberate exception. The interface calls `setVelocityAt`, modifies the local velocity, and rebuilds the local 9 distributions from that velocity. The FPS shown on the page is a live measurement, not a guarantee. On my MacBook M1 it runs well. The measured numbers are these. The committed 64² validation record took 4.21 s for 27,500 steps, about 26.8 million lattice updates per second.

## Continuing to FlowROM

When I later worked on FlowROM, I needed a batch of flow-field snapshots to test the reduced-order process. FlowLab can inject perturbations and export transient data, so it became one of the data sources for that work. This use did not change the core of this project. It is still the learning project I use to understand and check a minimal solver. That said, my solver still has many limits. Only the steady $Re=100$ cavity has been quantitatively validated so far. The model itself is limited too. The single-relaxation-time formulation becomes fragile when $\tau$ approaches 0.5. The effective wall position of halfway bounce-back changes with the grid. And lattice time has not been mapped to the physical time of a real fluid.

## Code and reproduction

The code is on GitHub: [gaoflow/flowlab](https://github.com/gaoflow/flowlab)

```bash
git clone https://github.com/gaoflow/flowlab.git
cd flowlab
npm test
npm run validate
```
