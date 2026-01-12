---
title: 'FlowROM — POD & DMD of Unsteady Flow Fields'
year: 2026
status: complete
categories: [validation, tooling]
tags: [Python, NumPy, POD, DMD, reduced-order modelling]
summary: 'A reproducible reduced-order modelling study: 480 independently generated velocity fields, held-out reconstruction, and four-cycle frequency forecast.'
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
featured: true
sample: false
order: 4
studySequence: 5
heroImage: /images/projects/flowrom/pod-modes.svg
---

## Context & objective

A reduced-order model is only useful when its compression claims survive data it did not fit. This study asks whether compact POD and DMD representations can recover a controlled unsteady component in independently generated full-field velocity data, then holds out four full forcing cycles before fitting.

The parent data source is the [FlowLab lattice-Boltzmann solver](/projects/flowlab/). FlowROM does not copy or relabel another portfolio project: every snapshot, decomposition, figure, metric, and test is generated in this repository.

## Live mode explorer

Choose a retained POD rank and scrub from the training interval into the held-out cycles. Both canvases share one fixed speed scale; the frame error is computed on the full two-component velocity field, not on the displayed downsampled magnitude.

<iframe src="/labs/flowrom/?v=1" title="Interactive FlowROM POD rank explorer" style="width:100%;height:620px;border:1px solid #233226;background:#08111f" loading="lazy"></iframe>

## Data and split

The FlowLab D2Q9 BGK solver first converges a $48\times48$ lid-driven cavity at $Re=100$. Its lid speed is then perturbed sinusoidally with a 400-iteration period. After four settling cycles, the study records $u$ and $v$ at 2,304 fluid cells every 10 iterations, yielding a $4,608\times480$ matrix.

The first 320 snapshots—eight complete cycles—train both models. The remaining 160 snapshots—four cycles—are untouched until evaluation. That split prevents a random holdout from leaking adjacent phases of the same periodic response across train and test sets.

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
