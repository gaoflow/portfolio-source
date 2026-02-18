---
title: 'FlowROM — POD & DMD of Unsteady Flow Fields'
year: 2026
date: '2026-08-10'
status: complete
categories: [validation, tooling]
tags: [Python, NumPy, POD, DMD, reduced-order modelling]
summary: 'A reproducible reduced-order modelling study I ran on FlowLab snapshots: 480 independently generated velocity fields, held-out reconstruction, and a four-cycle frequency forecast.'
methodLine: 'FlowLab snapshots · POD/SVD · exact DMD · temporal holdout'
role: 'Numerical methods & software engineering'
duration: 'Independent study'
heroMetrics:
  - { label: 'Snapshots', value: '480' }
  - { label: 'POD rank 8', value: '0.123%' }
  - { label: 'Compression', value: '48.8×' }
  - { label: 'DMD forecast', value: '0.100%' }
keyOutputs:
  - 'Built POD and exact-DMD routines from NumPy primitives, with synthetic known-rank and known-frequency behavioral tests.'
  - 'Reserved four complete forcing cycles for temporal holdout; rank-8 POD reached 0.123% fluctuation reconstruction error.'
  - 'Recovered the imposed frequency to 0.00093% relative error and forecast the full held-out velocity state to 0.100% error.'
featured: false
order: 4
studySequence: 11
heroImage: /images/projects/flowrom/pod-modes.svg
---

## Context & objective

Rank-8 POD compresses 480 velocity fields 48.8× while holding reconstruction error on four unseen forcing cycles to 0.123%; exact DMD forecasts those cycles at 0.100% full-state error. A reduced-order model earns trust only when its compression claims survive data it did not fit, so this study holds out four full forcing cycles before fitting either model.

The parent data source is the [FlowLab lattice-Boltzmann solver](/projects/flowlab/). FlowROM does not copy or relabel another portfolio project: every snapshot, decomposition, figure, metric, and test is generated in this repository.

## Live mode explorer

Choose a retained POD rank and scrub from the training interval into the held-out cycles. Both canvases share one fixed speed scale; the frame error is computed on the full two-component velocity field, not on the displayed downsampled magnitude.

<iframe src="/labs/flowrom/?v=1" title="Interactive FlowROM POD rank explorer" style="width:100%;height:620px;border:1px solid #233226;background:#08111f" loading="lazy"></iframe>

## Data and split

The FlowLab D2Q9 BGK solver first converges a $48\times48$ lid-driven cavity at $Re=100$. Its lid speed is then perturbed sinusoidally with a 400-iteration period. After four settling cycles, the study records $u$ and $v$ at 2,304 fluid cells every 10 iterations, yielding a $4,608\times480$ matrix.

The first 320 snapshots, eight complete cycles, train both models. The remaining 160, four cycles, stay untouched until evaluation. That split prevents a random holdout from leaking adjacent phases of the same periodic response across train and test sets.

![POD modal energy and held-out reconstruction error](/images/projects/flowrom/pod-spectrum.svg)

## POD: compression with an external error check

After subtracting the training mean, singular-value decomposition gives the orthonormal POD basis. Two modes retain 99.973% of training fluctuation energy. The held-out error still matters: energy retention alone does not establish reconstruction quality on later fields.

| Rank | Training fluctuation error | Held-out fluctuation error |
|---:|---:|---:|
| 1 | 35.981% | 35.971% |
| 2 | 1.630% | 1.301% |
| 4 | 0.387% | 0.471% |
| 8 | 0.0885% | 0.123% |
| 16 | 0.00439% | 0.00949% |

At rank 8, one mean field, eight spatial modes, and eight coefficients per snapshot require 48.8× fewer scalar values than the original matrix.

Rank 1 is the instructive failure. The first mode alone carries 87.05% of training fluctuation energy, yet rank-1 reconstruction misses 35.97% of the held-out fluctuation. The periodic response is a quadrature pair: the dominant mode without its partner reproduces a spatial shape but cannot follow the phase. Adding the second mode drops held-out error to 1.301%.

![First four POD mode magnitudes](/images/projects/flowrom/pod-modes.svg)

## DMD: recover the temporal mechanism

Exact DMD fits a rank-12 linear evolution operator to consecutive training snapshots. The strongest oscillatory mode is 0.02500023 cycles per snapshot; the imposed frequency is 0.025. Relative frequency error is 0.00093%.

The autonomous DMD evolution then continues through the four cycles it never saw. Relative Frobenius error is 0.100% for the full velocity state and 1.41% for fluctuations about the training mean. Both are reported because the steady cavity component makes the full-state denominator much larger.

![DMD probe forecast and modal spectrum](/images/projects/flowrom/dmd-forecast.svg)

## Validation & acceptance

The analysis exits nonzero unless all four predeclared gates pass:

1. held-out POD error decreases as rank increases;
2. rank-8 held-out fluctuation error is below 2%;
3. dominant DMD frequency is within 5% of the known forcing frequency;
4. DMD full-state holdout error is below 2%.

Separate synthetic tests require POD to recover a known rank-two field and DMD to identify and forecast a known sinusoid to numerical precision. This keeps the FlowLab generator from being the implementation's only oracle.

## Limitations

The result is deliberately bounded. A coarse D2Q9 BGK cavity with one deterministic excitation is not turbulent external aerodynamics. Training and holdout share one Reynolds number, geometry, and forcing amplitude. This study demonstrates the mechanics, error accounting, and reproducible software workflow; it does not claim production CFD fidelity.

## Reproduce

`node scripts/generate-snapshots.mjs` creates the fields. `python3 scripts/analyse.py` fits both models, evaluates the holdout, regenerates every figure and JSON metric, and enforces the acceptance gates. The committed [technical report](/documents/flowrom-report.html) records equations, interpretation, limitations, and canonical POD/DMD references.

## Why the holdout is chronological

Randomly withholding individual snapshots would place nearly identical phases of the same periodic response on both sides of the split. That tests interpolation between neighbouring states, not autonomous prediction. Reserving the final four complete cycles forces DMD to advance beyond its fitting interval and makes every POD error an evaluation on later fields.

The split is still not a distribution shift. Training and holdout share geometry, Reynolds number, mean lid speed, amplitude, and forcing frequency. The result measures temporal continuation under one operating condition.

## POD and DMD answer different questions

POD orders orthogonal modes by captured fluctuation energy. It is the better tool here for storage and reconstruction: rank 8 reduces the scalar count by 48.8× while keeping held-out fluctuation error at 0.123%.

DMD attaches a single complex evolution factor to each mode. It is therefore judged on frequency and autonomous forecast rather than maximum captured energy. The rank-12 model identifies 0.02500023 cycles per snapshot and continues phase through the reserved interval.

Neither result implies that eight or twelve modes are universal. Rank is part of the model contract and must be selected again when the operating envelope or observable changes.

## Error denominators matter

The DMD holdout error is 0.100% when normalised by the complete velocity state and 1.41% when normalised by fluctuations about the training mean. The first number answers “how much of the total field norm is wrong?” The second answers “how much of the unsteady content is wrong?”

Reporting only the full-state number would let a dominant steady mean hide temporal error. Reporting both prevents a numerically correct denominator from becoming a misleading communication choice.

## Numerical safeguards

The production case is not the only oracle. Synthetic tests require exact recovery of a known rank-two field and correct identification of a known sinusoid. The analysis also rejects non-monotonic POD holdout error, excessive rank-8 error, a misplaced DMD frequency, or excessive full-state forecast error.

These tests separate decomposition defects from FlowLab data-generation defects. A plausible mode plot cannot pass the project if the known-rank or known-frequency contracts fail.

## Motorsport relevance and boundary

The transferable skill is field-data reduction: choosing snapshots, preventing leakage, defining a metric, and preserving the distinction between reconstruction and prediction. Applied to vehicle CFD, the same discipline could compress pressure or wake databases and identify coherent operating modes.

That application would require multiple ride heights, yaw angles, speeds, and geometry states with operating-point holdouts. Until then, this article demonstrates ROM methodology—not a surrogate for turbulent vehicle aerodynamics.

## What I took away

Rank 1 was the failure that organised the study. One mode held 87.05% of training fluctuation energy yet missed 35.97% of the held-out fluctuation, because the response is a quadrature pair: the dominant mode carries the spatial shape, and without its partner it cannot follow the phase. Energy retention alone would have approved that model; the chronological holdout and the rank table — 1.301% at rank 2 — are what rejected it. The denominator lesson followed directly: the same DMD forecast scores 0.100% against the full state and 1.41% against fluctuations, so both numbers ship.
