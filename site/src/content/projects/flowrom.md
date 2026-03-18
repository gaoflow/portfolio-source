---
title: 'FlowROM — POD & DMD of Unsteady Flow Fields'
year: 2026
date: '2026-05-30'
status: complete
categories: [validation, tooling]
tags: [CFD]
summary: 'A reproducible reduced-order modelling study I ran on FlowLab snapshots: 480 independently generated velocity fields, held-out reconstruction, and a four-cycle frequency forecast.'
role: 'Numerical methods & software engineering'
duration: 'Independent study'
featured: false
order: 4
studySequence: 15
heroImage: /images/projects/flowrom/pod-modes.svg
github: 'https://github.com/gaoflow/flowrom'
---

## Origin: staring at tens of gigabytes of unsteady flowfield snapshots

The origin of this reduced-order modeling toolkit was running unsteady CFD simulations and staring at tens of gigabytes of raw snapshot files. Saving full-grid velocity fields every few milliseconds consumes vast storage and makes exploring dynamic patterns painfully slow.

I wondered: periodic unsteady flows exhibit coherent spatial structures—why can't we compress hundreds of flowfield frames into a handful of dominant modes, like video compression?

To achieve high-ratio data compression and forecast future flow states without re-running full-order PDE solvers, I built this Proper Orthogonal Decomposition (POD) and Dynamic Mode Decomposition (DMD) pipeline.

## How I generated and divided the 480 snapshots

FlowLab first converged a $48\times48$ lid-driven cavity at $Re=100$. I then applied a sinusoidal perturbation to the lid speed with a period of 400 solver iterations.

After four settling cycles, I recorded $u$ and $v$ at all 2,304 fluid cells every 10 iterations. This produced 480 snapshots and a $4{,}608\times480$ data matrix.

I used the first 320 snapshots—eight complete forcing cycles—to train both models. I reserved the final 160 snapshots, or four complete cycles, and did not use them during fitting.

A random frame-level split would have placed nearly identical phases of the same periodic response in both sets. That would mainly test interpolation between neighbouring states. The chronological split instead required DMD to advance autonomously beyond the training endpoint and required POD to reconstruct later flow fields.

This is still not a distribution-shift test. Training and holdout data share the same geometry, Reynolds number, mean lid speed, forcing amplitude, and forcing frequency. The split measures temporal continuation under one operating condition.

![POD modal energy and held-out reconstruction error](/images/projects/flowrom/pod-spectrum.svg)

## POD compression and reconstruction

I subtracted the training mean and applied singular-value decomposition to obtain orthonormal spatial modes ordered by captured fluctuation energy.

| Rank | Training fluctuation error | Held-out fluctuation error |
|---:|---:|---:|
| 1 | 35.981% | 35.971% |
| 2 | 1.630% | 1.301% |
| 4 | 0.387% | 0.471% |
| 8 | 0.0885% | 0.123% |
| 16 | 0.00439% | 0.00949% |

At rank 8, storing one mean field, eight spatial modes, and eight coefficients per snapshot requires 48.8 times fewer scalar values than storing the original matrix. The held-out fluctuation error is 0.123%.

Two modes retain 99.973% of the training fluctuation energy, but retained energy alone does not establish reconstruction quality on later fields. I therefore selected and evaluated ranks using the chronological holdout as well as the training spectrum.

## The useful failure at rank 1

The first POD mode contains 87.05% of the training fluctuation energy. Judged only by that percentage, a rank-1 model might appear sufficient.

It is not. Rank 1 misses 35.97% of the fluctuation in the held-out cycles. The periodic response needs a quadrature pair: the first mode represents the main spatial shape, while the second provides the other phase needed to follow the oscillation.

Adding the second mode reduces held-out error directly to 1.301%. This failure showed me that the minimum useful rank cannot be chosen from training energy alone; it must also be checked against fields excluded from fitting.

## DMD frequency identification and forecast

I fitted a rank-12 exact DMD linear evolution operator to consecutive training snapshots.

The imposed frequency was 0.025 cycles per snapshot. The strongest oscillatory DMD mode had a frequency of 0.02500023 cycles per snapshot, giving a relative frequency error of 0.00093%.

I then advanced the model autonomously through the four held-out cycles. The relative Frobenius error was 0.100% when measured against the complete velocity state and 1.41% when measured against fluctuations about the training mean.

![DMD probe forecast and modal spectrum](/images/projects/flowrom/dmd-forecast.svg)

## Why I retained both DMD errors

The complete velocity field contains a dominant steady mean component. Normalising by the full state makes the denominator much larger, so the 0.100% error answers: “How much of the total flow-field norm is wrong?”

After removing the training mean, the 1.41% error answers a different question: “How much of the unsteady fluctuation is wrong?”

Both values are correct. Reporting only the smaller full-state error would allow the stable mean flow to hide part of the temporal prediction error, so I retained both denominators.

## What POD and DMD established

| Metric | Question it answers |
|---|---|
| POD energy fraction | How many spatial directions represent the training fluctuation? |
| POD held-out error | Can those directions reconstruct later, unseen cycles? |
| DMD frequency | Did the evolution operator identify the correct time scale? |
| DMD forecast error | Can the model advance beyond its fitting interval? |

POD was the more useful method here for storage and reconstruction. Rank 8 reduced the scalar count by 48.8 times while keeping held-out fluctuation error at 0.123%.

DMD was evaluated on temporal behaviour rather than maximum captured energy. The rank-12 model identified 0.02500023 cycles per snapshot and maintained the phase through the reserved four-cycle interval.

Neither result makes ranks 8 and 12 universal choices. Rank is part of the model definition and must be selected again when the operating condition, geometry, or observed quantity changes.

## How I checked the implementation

I did not use the FlowLab production case as the implementation’s only oracle. I also used two synthetic tests:

- POD had to recover a known rank-2 field exactly.
- DMD had to identify and forecast a known sinusoidal signal to numerical precision.

The analysis exits with a nonzero status unless all four predeclared acceptance gates pass:

1. held-out POD error decreases as rank increases;
2. rank-8 held-out fluctuation error remains below 2%;
3. the dominant DMD frequency remains within 5% of the known forcing frequency;
4. DMD full-state holdout error remains below 2%.

These checks help distinguish a decomposition or forecasting defect from a problem in FlowLab’s generated data. A visually plausible mode plot is not enough to pass the analysis.

## Limits and next work

This study uses one coarse-grid cavity, one geometry, one Reynolds number, and one deterministic sinusoidal perturbation. A D2Q9 BGK lid-driven cavity is not turbulent external aerodynamics, and these results do not constitute a surrogate model for a racing-car wake.

Applying the same process to vehicle CFD would require data spanning multiple ride heights, yaw angles, speeds, and geometry states. It would also require holdout sets defined by operating condition rather than only by time.

The current result demonstrates snapshot selection, leakage prevention, compression, reconstruction, frequency identification, autonomous continuation, and explicit error accounting under one operating condition. It does not claim production CFD fidelity.

## Code and reproduction

The source code is open source on GitHub: [gaoflow/flowrom](https://github.com/gaoflow/flowrom)

```bash
git clone https://github.com/gaoflow/flowrom.git
cd flowrom
node scripts/generate-snapshots.mjs
python3 scripts/analyse.py
```

## Practical applications: high-ratio compression and reduced-order forecasting for unsteady CFD

Unsteady CFD simulations generate massive flowfield datasets across grid cells and time steps, creating multi-gigabyte storage footprints that cannot be deployed in real-time control loops.

FlowROM applies Proper Orthogonal Decomposition (POD) to 480 flowfield snapshots, capturing over 99.9% of fluctuating kinetic energy with just 8 spatial modes (a 48.8x compression ratio, holdout error 0.123%). Combined with Dynamic Mode Decomposition (DMD), it extracts dominant frequencies to 0.00093% accuracy and autonomously forecasts future flow states without re-running full-order PDE solvers.

## What I learned

The rank-1 result changed how I assess reduced-order models. Capturing 87.05% of the training fluctuation energy sounds strong, but the resulting model still missed 35.97% of the held-out fluctuation. The chronological holdout and the drop to 1.301% at rank 2 exposed a failure that the energy percentage alone would have approved.

I also learned to inspect both the numerator and denominator of every reported error. The same DMD forecast scores 0.100% against the full velocity state and 1.41% against the fluctuations. Neither number replaces the other because they describe different aspects of the prediction.
