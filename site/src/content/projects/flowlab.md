---
title: 'FlowLab — Browser-Native Lattice-Boltzmann Validation'
year: 2026
date: 2026-05
status: complete
categories: [tooling, validation]
tags: [JavaScript, D2Q9, LBM, BGK, V&V]
summary: 'A dependency-free lattice-Boltzmann solver that runs in Node.js and the browser, validated against canonical lid-driven-cavity data on three grids.'
methodLine: 'D2Q9 · BGK collision · halfway bounce-back · Ghia et al. benchmark'
role: 'Numerical methods & software engineering'
duration: 'Independent study'
heroMetrics:
  - { label: 'Finest grid', value: '64²' }
  - { label: 'u RMSE', value: '0.00286' }
  - { label: 'v RMSE', value: '0.00202' }
  - { label: 'Mass drift', value: '2.56e−12' }
keyOutputs:
  - 'Implemented collision, streaming, moving-wall momentum correction, convergence monitoring, and benchmark interpolation without numerical dependencies.'
  - 'Reduced streamwise centerline RMSE from 0.00511 to 0.00286 across 32², 48², and 64² grids.'
  - 'Kept one solver core for automated Node.js validation and a live browser experience.'
featured: true
sample: false
order: 5
studySequence: 9
heroImage: /images/projects/flowlab/cavity-vorticity.svg
---

## Context & objective

Interactive CFD graphics are easy to make visually convincing and hard to make numerically accountable. This study asked whether a small JavaScript lattice-Boltzmann implementation could remain inspectable, run live in a browser, and still reproduce a canonical reference quantitatively.

The publication gates were fixed before release: three converged grids, less than 0.01 lid-speed RMSE for both centerline velocity components on the finest grid, relative mass drift below $10^{-9}$, and one solver core shared by the validation runner and interactive experience.

## Live numerical experiment

The upper boundary moves to the right and transfers momentum into the cavity. Change Reynolds number or switch between speed and vorticity. The higher-Reynolds-number options are exploratory; the published quantitative validation is restricted to $Re=100$.

<iframe src="/labs/flowlab/" title="Interactive FlowLab lattice-Boltzmann solver" style="width:100%;height:720px;border:1px solid #233226;background:#0f172a" loading="lazy"></iframe>

## Methodology

FlowLab implements the D2Q9 lattice with a single-relaxation-time BGK collision operator. Kinematic viscosity is selected from $\nu=U_{lid}L/Re$, giving $\tau=0.5+3\nu$. Stationary boundaries use halfway bounce-back; the moving lid applies its momentum correction during population reflection rather than overwriting velocity after streaming.

The solver rejects relaxation times too close to the BGK stability boundary. A run is considered converged from the RMS change in both velocity components between 250-iteration checkpoints, normalised by lid speed.

## Grid study

| Fluid grid | Iterations | Final residual | $u/U_{lid}$ RMSE | $v/U_{lid}$ RMSE |
|---:|---:|---:|---:|---:|
| 32² | 14,750 | $1.85\times10^{-7}$ | 0.00511 | 0.00404 |
| 48² | 22,000 | $1.91\times10^{-7}$ | 0.00369 | 0.00208 |
| 64² | 27,500 | $1.89\times10^{-7}$ | 0.00286 | 0.00202 |

The streamwise error decreases at every refinement. Cross-stream error falls sharply by 48² and changes only slightly at 64², so remaining discrepancy is not explained by bulk grid resolution alone.

## Validation

![FlowLab centerline velocities against Ghia et al.](/images/projects/flowlab/centerline-validation.svg)

Reference values are Tables I and II from Ghia, Ghia, and Shin, *Journal of Computational Physics* 48(3), 1982 ([DOI](https://doi.org/10.1016/0021-9991(82)90058-4)). White points are published data; teal lines are independently generated FlowLab values.

The 64² case passed both predeclared one-percent RMSE gates by more than a factor of three. Relative mass drift was $2.56\times10^{-12}$.

## Performance

The recorded 64² validation run sustained 26.3 million lattice updates per second and completed 27,500 iterations in 4.28 seconds on an Apple M4. The browser experience uses a 96×64 fluid grid, advances five iterations per animation frame, and reports measured frame rate live rather than claiming a fixed value.

## Failure & correction

The first automated validation stopped at 20,000 iterations with residual $4.80\times10^{-7}$. Its velocity error was already small, but it failed the declared convergence gate. The iteration allowance was increased; the numerical acceptance criterion was not weakened.

A direct moving-wall velocity overwrite was also rejected. It would display the requested lid speed without defining consistent incoming populations. Momentum-corrected bounce-back makes the boundary condition part of the distribution update instead.

## Limitations

Only the steady $Re=100$ cavity carries a quantitative validation claim. BGK becomes fragile as $\tau$ approaches 0.5, and halfway bounce-back introduces a grid-dependent effective wall location. Lattice units are nondimensional; animation time is not mapped to a specific physical fluid.

This is a numerical-method study and interactive teaching artifact, not a substitute for an industrial finite-volume solver.

## Reproducibility

The project directory contains the solver, tests, benchmark transcription, validation runner, generated JSON/CSV evidence, and figures. `npm test && npm run validate` regenerates every metric shown above. The committed [technical report](/documents/flowlab-report.html) records the method, three-grid comparison, acceptance gates, source, and limitations.

## One time step, made inspectable

Each solver iteration follows a fixed sequence:

1. recover density and velocity from the nine populations;
2. build the second-order equilibrium distribution;
3. apply BGK relaxation with $\omega=1/\tau$;
4. stream populations along the D2Q9 lattice directions;
5. reflect wall populations, adding the lid momentum correction at the moving boundary;
6. recompute macroscopic fields and periodically evaluate convergence.

The order is shared by Node.js validation and the browser. The interactive layer receives fields from the solver; it does not contain a second numerical implementation tuned for display.

## Benchmark discipline

The Ghia reference coordinates do not generally land on the same points as each FlowLab grid. The validation runner therefore interpolates the generated centerline velocities to the published sample coordinates before computing RMSE. It compares $u/U_{lid}$ along the vertical centreline and $v/U_{lid}$ along the horizontal centreline.

Field images remain secondary evidence. A visually plausible primary vortex can coexist with incorrect wall momentum, shifted corner structures, or a biased centreline profile. The tabulated comparison is the publication gate.

## Convergence is not validation

The finest case reaches a residual of $1.89\times10^{-7}$, but that only establishes that its discrete state has stopped changing under the chosen iteration. Agreement with Ghia establishes the separate validation result. Conversely, the first 20,000-iteration run already had small velocity error yet still failed the convergence contract; both conditions are required.

Mass drift provides another independent invariant. The recorded $2.56\times10^{-12}$ relative change is far below the $10^{-9}$ gate and guards against a solver that matches selected velocities while losing population mass globally.

## Software architecture

The core has no plotting or DOM dependency. Tests exercise collision/streaming behaviour and invalid relaxation parameters; the validation runner owns benchmark interpolation, grid sequencing, JSON output, and figure generation; the browser owns controls and rendering. This boundary keeps presentation latency out of the solver contract.

The measured 26.3 million lattice updates per second is a workstation observation, not a cross-platform guarantee. Browser frame rate is reported live because rendering cost, display refresh, and power state are environmental inputs.

## Extension gates

Higher Reynolds numbers remain exploratory until they pass an external reference and stability study. Replacing BGK with MRT or a regularised collision operator would require repeating the three-grid benchmark rather than inheriting the current validation. Cylinder wake or aeroacoustic modes would additionally need Strouhal-number and force-history gates before publication.
