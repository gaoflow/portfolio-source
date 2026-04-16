---
title: 'Reduced-Order Modeling: Compressing 480 Flow Fields into a Few Modes'
year: 2026
date: '2026-05-30'
status: complete
categories: [validation, tooling]
tags: [CFD]
summary: 'While running unsteady CFD, I found my hard drive filling up fast. I wondered whether I could distill hundreds of complex flow fields into 8 core skeleton images, like compressing a video, and predict the future flow directly without the equations.'
role: 'Numerical Methods & Software Engineering'
duration: 'Independent study'
featured: false
order: 4
studySequence: 15
heroImage: /images/projects/flowrom/pod-modes.svg
github: 'https://github.com/gaoflow/flowrom'
---
## A hand-written solver

At the start, I wanted to watch how fluid moves, directly and interactively, in the browser and in the terminal. With traditional commercial CFD software you are always drawing complex meshes and solving complex differential equations. It is slow, and real-time interaction on a web page is hard to do with it. So I hand-wrote a lightweight fluid solver from scratch in JavaScript — [Hand-written fluid solver: putting Lattice Boltzmann in the browser (FlowLab)](/projects/flowlab). To make it fast enough, I did not solve the traditional Navier–Stokes equations. I chose the Lattice Boltzmann Method (LBM). Once it was written, it ran smoothly at 60 FPS in the browser. I could drag a baffle with the mouse and watch the vortices in the cavity flow change in real time.

![FlowLab lid-driven cavity unsteady flow evolution and vortex animation](/images/projects/flowrom/flowlab-demo.gif)

But when I tried to use it to study unsteady flow with a periodic disturbance, I quickly hit a very practical problem: the data volume was too large for my hard drive to handle. To record how the vortices changed over time, I had to save the velocity of every grid point every few milliseconds. One run of the simulation piled up dozens of gigabytes of snapshot files. Besides taking up a lot of space, reviewing the flow behavior afterwards meant slowly flipping through frames one by one in post-processing software, which was very inefficient.

At the time I was thinking: this kind of periodic flow clearly has a strong inner pattern, so why can't I compress hundreds of frames of complex flow fields into a few core "skeleton images", like compressing a video? Could I even predict how the flow evolves next, without going back to the original fluid equations?

To do this, I built this flow-field reduction and prediction toolkit — FlowROM.

## Understanding Lattice Boltzmann (LBM)

If traditional CFD treats water as one continuous piece of dough and solves calculus equations on it, the Lattice Boltzmann Method (LBM) imagines the fluid as countless microscopic marbles bouncing around on a regular lattice. I used the most classic model for 2D flow, D2Q9: the domain is divided into square cells, and the particles on each grid point can only move in 9 directions (stationary at the center, 4 directions up/down/left/right, and 4 diagonals).

In each time step, the program only does two extremely simple things, collision and streaming:

1. Collision: particles that fly onto the same grid point hit each other and redistribute their velocities across the directions (moving toward equilibrium);
2. Streaming: after the collision, each particle hops along its own direction to the next neighboring grid point.

After these two steps, adding up the number of particles in all 9 directions on a grid point gives the macroscopic density there. Taking the momentum-weighted average across the directions gives the macroscopic flow velocity directly. It never needs to solve a global pressure equation, the algorithm is naturally suited to parallel computing, and it runs very fast. In FlowLab I ran a cavity flow with a sinusoidal velocity disturbance. After it settled into a stable periodic oscillation, I saved one frame every 10 steps, and exported 480 transient flow-field snapshots in total as the raw data for what came next.

## How FlowROM works

FlowROM itself does not solve the fluid equations. It is a toolbox of algorithms for "slimming down" and "fortune-telling" flow-field data. I split it into two main parts.

### 1. POD (Proper Orthogonal Decomposition)
The idea behind POD is just data dimensionality reduction. After subtracting the mean flow from the 480 frames, it uses singular value decomposition to break the messy flow fields into a few "orthogonal spatial feature maps" ranked by importance.

- Originally each frame had thousands of velocity values, a huge amount of data;
- After POD, we only need to keep the 8 most core flow-field skeleton images, plus the 8 coefficients for each frame;
- The data volume shrinks by nearly 50x, but when I use it to reconstruct the real flow field, the fluctuation error is only about 0.1%.

### 2. DMD (Dynamic Mode Decomposition)
POD can only compress and store flow fields that have already happened. On its own it does not know how time moves forward. To predict future flow, I brought in DMD. DMD analyzes how several consecutive frames evolve and fits a matrix dedicated to advancing time:

- First lock onto the frequency: whatever the true oscillation frequency of the external disturbance is, DMD can automatically pull out the dominant frequency with very high precision;
- Then advance on its own: starting from the last frame of the training data, without calling the fluid solver again at all, DMD steps forward by itself and directly works out the flow evolution for the next 4 cycles.

## Splitting the training and test sets

I used the first 320 frames, roughly the first 8 cycles, to train the model. I set aside the last 160 frames, 4 full cycles, for later.

![POD modal energy spectrum](/images/projects/flowrom/pod-energy-spectrum.svg)

![POD held-out reconstruction error convergence curve](/images/projects/flowrom/pod-reconstruction-error.svg)

In a lot of data analysis, people like to randomly pick 20% of the data as the test set. But in periodic fluid flow, I think randomly sampling frames is serious "data cheating". Periodic motion loops over and over. If you sample randomly, a frame in the test set has already appeared among the frames before and after it in the training set. The model does not need to learn the real physics at all. It just needs to draw a line and interpolate between two neighboring frames to hand in a fake high score.

So the last four full cycles have to be held out as one block. That forces the model to walk by itself from a known endpoint into the unknown future. Only then can you test whether it has truly learned how the flow evolves.

## A lesson from a failure

When I looked at the energy distribution, the 1st spatial mode alone accounted for a full 87% of the fluctuation energy. Looking at that number, I thought keeping this 1 image would be enough to represent the flow. But when I used only this 1 mode to reconstruct the test set it had never seen, the error shot straight up to 36%. More than a third of the fluctuation detail was lost!

| Modes kept | Training error | Unseen test error |
|---:|---:|---:|
| 1 mode | 35.98% | 35.97% (badly distorted) |
| 2 modes | 1.63% | 1.30% (instantly accurate) |
| 4 modes | 0.39% | 0.47% |
| 8 modes | 0.09% | 0.12% |

Later I thought about why keeping only 1 mode failed so badly.
Because periodic vortex motion is "going in circles" in space. To describe a full circular motion, you need at least one pair of mutually orthogonal directions (just like drawing a circle requires both the horizontal coordinate $\cos$ and the vertical coordinate $\sin$). With only one mode, the flow cannot rotate through its phases.

The moment I added the 2nd mode, the test error dropped from 36% to 1.3%. This failure taught me once and for all: when reducing data you must never look only at the energy share on the training set. You have to combine it with the physical mechanism, and you have to speak from a test set the model has truly never seen.

## Error analysis with two different denominators

When evaluating the accuracy of predicting 4 cycles ahead, I deliberately paid attention to two different errors:

- Error relative to the complete total flow field: 0.10% (this looks extremely perfect)
- Error relative to the true fluctuation after removing the mean: 1.41% (honestly reflects the oscillation deviation)

![DMD time-series autonomous prediction waveform](/images/projects/flowrom/dmd-timeseries.svg)

![DMD mode frequency spectrum and applied disturbance frequency](/images/projects/flowrom/dmd-spectrum.svg)

In a cavity flow, most of the velocity in most regions comes from the steady mean flow. If you use the full velocity as the denominator, the base is large, so the computed error is only about one in a thousand, which looks very pretty.

But if what we want to grade is "whether the unsteady fluctuation prediction is accurate", we have to subtract the mean flow and look only at the deviation of the fluctuation. Then the error is 1.41%. Reporting only 0.10% would in essence use the steady mean flow to cover up the flaws of the time stepping. So both numbers matter.

## Unit tests

There is one more problem. FlowLab is both the data source and the standard to check against. If there is a bug in the reduction code, sometimes you cannot see it at all just by running FlowLab data through it.

To close this "being your own referee" loophole, I added two purely mathematical independent unit tests to the program:
1. Build a pure rank-2 matrix with a known mathematical solution to test POD, which must reconstruct it with 100% accuracy;
2. Build a pure sine wave to test DMD, which must extract the period and frequency exactly.

These two problems have standard answers. With this kind of isolated testing, if something fails, I can be sure it is a code problem in the reduction algorithm itself, not something wrong with the physics data.

## Other thoughts

All the data in my project comes from a coarse $48\times48$ grid cavity. That is a low-speed flow with a single geometry, a single Reynolds number, and a single operating condition. It is not real external racecar aerodynamics, and it cannot be used directly as a surrogate model for a racecar wake. To apply this method to full-car racing CFD for real, I would also have to cover different ride heights, different speeds, and yaw angles, and build test sets by operating condition.

But I think the workflow built here, the leakage-free splitting, POD spatial compression, DMD frequency capture, orthogonal mode matching, and dual-denominator error accounting, is a fully working, rigorous, and trustworthy data analysis process.

## Code and how to run

This project is open source on GitHub, at [gaoflow/flowrom](https://github.com/gaoflow/flowrom).

```bash
git clone https://github.com/gaoflow/flowrom.git
cd flowrom
node scripts/generate-snapshots.mjs
python3 scripts/analyse.py
```

## A practical scenario

In long unsteady CFD simulations, the full-field transient data (for example the velocity field and pressure field) is extremely large (> tens of GB). It is expensive to store and hard to use directly for control system design.

Running the FlowROM pipeline on 480 flow-field snapshots with Proper Orthogonal Decomposition (POD), you only need to extract 8 orthogonal spatial modes to keep more than 99.9% of the flow energy at a compression ratio of nearly 50x. Combined with Dynamic Mode Decomposition (DMD), it extracts the dominant vortex-shedding frequency with very high precision, and accurately extrapolates the flow evolution for the next four full cycles without the original equations.

Later, when I run into more complex cases in my coursework, I will keep improving this project.
