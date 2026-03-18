---
title: 'Reduced-Order Modeling: Compressing 480 Flow Fields into a Few Modes'
year: 2026
date: '2026-05-30'
status: complete
categories: [validation, tooling]
tags: [CFD]
summary: 'While running unsteady CFD, I found hard drives filling up quickly. I first built a lightweight particle-based fluid solver (FlowLab), then developed a reduced-order modeling toolkit (FlowROM): compressing hundreds of complex flow fields into 8 key mode shapes—much like video compression—and forecasting future flow evolution without re-running fluid solvers.'
role: 'Numerical Methods & Software Engineering'
duration: 'Independent study'
featured: false
order: 4
studySequence: 15
heroImage: /images/projects/flowrom/pod-modes.svg
github: 'https://github.com/gaoflow/flowrom'
---

## Building a custom solver

I wanted an intuitive way to explore fluid dynamics directly inside the browser and terminal. Commercial CFD tools require tedious meshing and heavy differential equation solvers that are too slow for real-time interactive web experiments. So, I built a lightweight fluid solver from scratch in JavaScript: FlowLab. To keep it fast, I avoided solving the traditional Navier–Stokes equations and chose the Lattice Boltzmann Method (LBM). Once written, it ran at 60 FPS in the browser, letting me drag obstacles and watch cavity vortex structures evolve in real time.

![FlowLab unsteady lid-driven cavity vortex dynamics](/images/projects/flowrom/flowlab-demo.gif)

However, when I moved on to study unsteady periodic flows, I hit an immediate bottleneck: the dataset grew too large for storage to handle. Recording how vortices evolve over time meant saving the velocity of every single cell every few milliseconds. A single simulation easily generated dozens of gigabytes of raw snapshot files. Storing this data was expensive, and analyzing flow patterns by stepping through thousands of frames in post-processing tools was painfully slow.

I wondered: since periodic flows follow clear underlying rhythms, why can't we compress hundreds of 2D flow fields into a handful of core mode shapes—much like video compression? And could we forecast future flow evolution directly without re-running heavy fluid equations?

To tackle this, I built the reduced-order modeling toolkit: FlowROM.

---

## Understanding the Lattice Boltzmann Method (LBM)

While traditional CFD treats fluid as a continuous block and solves complex calculus equations, the Lattice Boltzmann Method models fluid as swarms of virtual particles bouncing around on a regular grid. I implemented the standard 2D model: D2Q9. The domain is divided into square cells where particles can move in 9 discrete directions (stationary at the center, 4 cardinal axes, and 4 diagonals).

In every time step, the algorithm executes two basic operations:

1. Collision: Particles arriving at the same node collide and redistribute their velocities toward local equilibrium;
2. Streaming: After colliding, particles hop along their directions to neighboring grid nodes.

Summing the particles across all 9 directions yields the local fluid density, and taking their momentum-weighted average gives the macroscopic flow velocity. It completely avoids solving global pressure Poisson equations, making it naturally parallel and extremely fast. I set up a lid-driven cavity flow with a sinusoidal lid velocity perturbation. Once the flow settled into a stable limit cycle, I saved a snapshot every 10 steps, exporting 480 full flowfield snapshots to feed into the reduction pipeline.

---

## How FlowROM works

FlowROM does not solve fluid dynamics equations. It is an algorithmic toolkit designed to compress flowfield data and forecast its evolution. I divided it into two main components:

### 1. POD (Proper Orthogonal Decomposition)
POD works like dimensional reduction. After subtracting the mean flow from the 480 snapshots, it uses Singular Value Decomposition (SVD) to decompose the messy flow fields into a series of orthogonal spatial modes ranked by importance.

- Raw flow fields contain thousands of velocity numbers per frame;
- POD reduces this entire dataset to just 8 core spatial mode shapes and their temporal coefficients;
- Storage requirements drop by nearly 50x, while reconstructing unseen test flows with around 0.1% fluctuation error.

### 2. DMD (Dynamic Mode Decomposition)
POD compresses historical flow fields, but cannot advance states forward in time on its own. To forecast future dynamics, I integrated DMD. DMD analyzes the sequential progression of snapshot frames and fits a linear operator to advance time:

- Catch the frequency: DMD automatically extracts the primary oscillation frequency with high precision;
- Forecast autonomously: Starting from the end of the training data, DMD steps forward step by step on its own, forecasting four full cycles of flow evolution without calling the fluid solver.

---

## Partitioning training and test data

I used the first 320 snapshots (the first 8 cycles) for training and set aside the final 160 snapshots (4 full cycles) as the unseen test exam.

![POD Modal Energy Spectrum](/images/projects/flowrom/pod-energy-spectrum.svg)

![POD Held-Out Reconstruction Error vs Retained Rank](/images/projects/flowrom/pod-reconstruction-error.svg)

In standard machine learning, people often randomly sample 20% of the data for testing. In periodic fluid dynamics, random frame sampling is severe data leakage. Because periodic flows repeat cyclically, a randomly sampled test frame shares near-identical flow states with the frames right before and after it in the training set. The model would not need to learn genuine physical evolution; it could achieve a cosmetically low error simply by interpolating between neighboring frames.

Reserving four continuous cycles at the end forces the model to step into genuinely unobserved territory from a fixed starting point, proving whether it truly captured the physical dynamics.

---

## A valuable failure

When looking at the energy distribution, the 1st spatial mode accounts for 87% of the fluctuating kinetic energy. Looking only at this number, one might assume that a single mode is enough to represent the flow. However, when I used only this 1st mode to reconstruct the unseen test set, the error spiked to 36%—discarding over a third of the dynamic fluctuations!

| Modes Retained | Training Error | Unseen Test Error |
|---:|---:|---:|
| 1 mode | 35.98% | 35.97% (severe distortion) |
| 2 modes | 1.63% | 1.30% (instant recovery) |
| 4 modes | 0.39% | 0.47% |
| 8 modes | 0.09% | 0.12% |

Why did 1 mode fail so dramatically?
Periodic vortex shedding in space is a closed rotational trajectory. Describing a full rotation requires at least a pair of orthogonal directions (just as plotting a circle requires both $\cos$ and $\sin$). With only one mode, the flow cannot physically rotate across phases.

Adding the 2nd mode caused the test error to plummet from 36% down to 1.3%. This failure made one thing clear: model truncation cannot be decided by cumulative energy on training data alone; it must be audited against unobserved test data and physical kinematics.

---

## Dual-denominator error analysis

When evaluating DMD forecast accuracy across the 4 unobserved cycles, I deliberately report two distinct error figures:

- Relative to the full velocity field: 0.10% (looks cosmetically perfect)
- Relative to mean-subtracted dynamic fluctuations: 1.41% (honest reflection of time-stepping error)

![DMD Time-Series Autonomous Prediction](/images/projects/flowrom/dmd-timeseries.svg)

![DMD Eigenvalue Frequency Spectrum](/images/projects/flowrom/dmd-spectrum.svg)

In cavity flows, the steady mean flow contributes the majority of velocity magnitude. Using full velocity as the denominator dilutes the forecasting error down to 0.10%.

However, evaluating the quality of dynamic forecasting requires isolating the fluctuations. Normalizing by fluctuation magnitude reveals the true dynamic error of 1.41%. Reporting only 0.10% would use the steady average to mask time-stepping discrepancies. Reporting both numbers provides an honest engineering assessment.

---

## Preventing the solver from grading its own homework

FlowLab is both the data generator and the reference benchmark. If the reduction code has a subtle bug, relying solely on FlowLab data might leave it unnoticed.

To prevent self-referential validation, I added two independent mathematical synthetic unit tests:
1. A known analytical rank-2 matrix to verify that POD reconstructs it with zero loss;
2. A pure synthetic sine wave to verify that DMD extracts exact frequencies and trajectories.

Because these benchmark tests have undisputed mathematical solutions, any failure immediately isolates bugs in the reduction algorithms from physical data noise.

---

## What this project does not claim

All data in this study comes from a coarse $48\times48$ lid-driven cavity with a single geometry, single Reynolds number ($Re=100$), and single operating condition. It is not complex turbulent external aerodynamics, and cannot be used directly as a surrogate model for a racecar wake.

Applying this methodology to full-car CFD requires sweeping ride heights, speeds, and yaw angles, with test sets partitioned across distinct operating conditions.

Nevertheless, the foundational workflow established here—leakage-free temporal partitioning, POD spatial compression, DMD frequency extraction, orthogonal modal matching, and dual-denominator error auditing—provides a solid, rigorous data analysis framework.

---

## Code and reproduction

The source code is open source on GitHub: [gaoflow/flowrom](https://github.com/gaoflow/flowrom)

```bash
git clone https://github.com/gaoflow/flowrom.git
cd flowrom
node scripts/generate-snapshots.mjs
python3 scripts/analyse.py
```

## Practical applications

In unsteady CFD simulations, full flowfield transient datasets (velocity and pressure) can be massive (tens of gigabytes), making them costly to store and difficult to integrate directly into real-time control loops.

FlowROM applies Proper Orthogonal Decomposition (POD) to 480 flowfield snapshots, capturing over 99.9% of fluctuating kinetic energy with just 8 spatial modes (a nearly 50x compression ratio); combined with Dynamic Mode Decomposition (DMD), it extracts dominant frequencies with high accuracy and forecasts future flow states without re-running full-order PDE solvers.

As I encounter more complex cases in coursework and projects, I plan to continue extending this pipeline.
