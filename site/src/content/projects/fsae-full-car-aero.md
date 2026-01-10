---
title: 'Sample — FSAE Full-Car Aero Package (replace me)'
year: 2025
status: complete
categories: [fsae]
tags: [OpenFOAM, simpleFoam, snappyHexMesh, Python]
summary: 'Iterative CFD development of a full aero package, closing the loop with on-track data.'
methodLine: 'OpenFOAM · steady RANS · k-ω SST'
role: 'Aerodynamics Lead'
team: '5 engineers'
duration: '9 months'
heroMetrics:
  - { label: 'Δ Downforce', value: '+18.2%' }
  - { label: 'L/D', value: '3.4' }
  - { label: 'Mesh', value: '36M cells' }
  - { label: 'Correlation', value: '±4%' }
keyOutputs:
  - 'Full-car external aero workflow: CAD cleanup → meshing → RANS → post-processing, owned end to end.'
  - 'Quantified development: +18.2% downforce over 12 documented iterations.'
  - 'CFD↔track correlation within ±4% via coast-down and constant-speed runs.'
featured: false
sample: true
order: 8
---

> ⚠️ This is **sample content** demonstrating the nine-section project template. Replace it with your real project — keep the section structure.

## Context & objectives

What problem, under what constraints (rules, budget, compute)? One paragraph. State the baseline and the target metric.

## Methodology

The proof of technical depth — be specific: turbulence model and why, y+ target and wall treatment, mesh strategy (cell count, growth rate, prism layers), boundary conditions, convergence criteria. Tool versions included.

## Results

Numbers first. Per-assembly contribution tables beat prose (e.g. floor 78.9% of total downforce). Prefer normalised coefficients (SCd/SCl) over raw counts. Contour plots here, with engineering captions.

## Validation

Its own section — the metric F1 aero departments care about most. Wind tunnel or track correlation with error percentages; if unavailable, mesh-independence study plus benchmark against published data.

## Failures & iterations

Engineering honesty: diverged cases, geometry simplifications, ideas that didn't survive the wind tunnel. What changed because of each failure.
