---
title: 'How I Batch-Simulated an F1 2026 Car with OpenFOAM'
year: 2026
date: '2026-08-22'
status: complete
categories: [full-car, validation]
tags: [CFD, OpenFOAM]
summary: 'I built a batch CFD workflow for an F1 2026 half-car model, applied the same rules across mesh, roughness, turbulence-model and geometry variants, and kept configuration errors, divergence and statistically unstable cases out of the results.'
role: 'Independent CFD study'
duration: '23 initial variants · 37 valid cases'
featured: true
order: 21
studySequence: 18
heroImage: /images/projects/f1-rans-campaign/campaign-map.svg
---

## Why I built a batch workflow

After completing the first version of my F1 2026 half-car model, I wanted to understand how different assumptions affected whole-car drag, downforce and aerodynamic balance. The variables included mesh density, turbulence model, tyre roughness, first-layer resolution, rear-wing angle, ride height, rake and yaw.

Manually copying a case, editing files, running the solver and pasting the results into a spreadsheet creates two serious risks. A requested change may never take effect, or a failed case may still produce plausible-looking coefficients and end up in the comparison table.

I therefore built a batch workflow around OpenFOAM 14. The first campaign contained 23 variants. I later added active-wing, ride-height, tyre contact-region, rake, yaw and URANS cases. Across the complete study, I retained 37 usable cases and withdrew four first-version yaw cases because their setup was wrong.

The model uses reconstructed public 2026-car geometry in half-car symmetry, with a moving ground, rotating tyre walls and separate force groups for the front wing, rear wing, floor, front and rear tyres, and body. The retained steady baseline uses incompressible RANS with the $k$-$\omega$ SST turbulence model.

## How a case moves through the workflow

A successful solver exit does not mean that a result is usable. Each case follows the same sequence:

```text
Prepare inputs
→ confirm that the requested change took effect
→ generate or reuse the mesh
→ run OpenFOAM
→ collect forces and flow results
→ validate the result
→ retain or reject the case
```

I apply these checks before a case can enter the results:

| Check | What I need to confirm | Action if it fails |
|---|---|---|
| Configuration | The requested geometry or parameter actually changed | Stop the case |
| Mesh | Vehicle surfaces, cell count and mesh-quality information are complete | Do not start the solver, or reject the result |
| Solver run | The log contains no FPE, NaN or infinite values | Keep the log, but discard the coefficients |
| Mass conservation | Inlet, outlet and wall mass flows close to an acceptable balance | Reject the result |
| Force stability | Drag and downforce reach a stable statistical window | Mark the case as unstable |
| Component closure | The sum of component forces agrees with the whole-car result | Do not attribute the change to individual components |

A successful `foamRun` return code only shows that the program finished executing. It does not prove that the input was correct, the mesh was reliable or the final forces were stable.

## The first failure: cases that looked different but were not

An early version of the workflow contained a dangerous configuration error. The variant script was loaded before the runner entered the individual case directory, so several cases used the same baseline files.

Every job ran normally. Eight coefficient columns were even identical, which initially looked like excellent repeatability. In reality, none of the requested variants had taken effect.

I corrected the runner so that a variant script can execute only after entering its target directory. Before starting the solver, the workflow now checks that the expected files really differ from the baseline.

That failure established a basic rule for the rest of the campaign: different case names are not evidence of different inputs. Every variant must demonstrate that it changed the intended configuration.

## When I reuse a mesh and when I rebuild it

I can reuse a mesh when a case changes only boundary conditions, the turbulence model or solver parameters. Rear-wing rotation, tyre contact-region changes, ride height, rake and yaw alter the geometry, so they require a new mesh.

I record whether each result used a reused or regenerated mesh. A difference between remeshed cases includes both the intended physical change and approximately 1%–2% variation between nominally comparable meshes. I do not treat that numerical contribution as part of the physical effect.

The pilot host had 4 vCPUs and 15 GB of memory. A steady 4.35-million-cell case usually took 2.5–3 hours, while one mesh generation took about 45 minutes. The planned finer mesh exceeded the available memory, so I retained only the three mesh levels that actually completed:

| Mesh | Cells | $C_d$ | $C_l$ |
|---|---:|---:|---:|
| Coarse | 592,322 | 0.3190 | −0.1342 |
| Medium | 2,032,685 | 0.2598 | −0.2522 |
| Baseline | 4,351,624 | 0.2413 | −0.2498 |

Drag changed monotonically as the mesh was refined, but downforce did not. These three grids therefore provide a pilot sensitivity study, not evidence of mesh independence or an asymptotic grid-convergence region.

## The nine core comparisons I retained

The first campaign produced nine results that passed the same validity checks and could be compared over the same statistical window:

| Variant | $C_d$ | $C_l$ | Main comparison |
|---|---:|---:|---|
| Baseline | 0.2413 | −0.2498 | $k$-$\omega$ SST reference |
| Realizable $k$-$\epsilon$ | 0.2305 | −0.2569 | Turbulence-model form |
| SST $a_1=1.0$ | 0.2417 | −0.2586 | SST parameter |
| Coarse mesh | 0.3190 | −0.1342 | Mesh coarsening |
| Medium mesh | 0.2598 | −0.2522 | Intermediate mesh |
| 0.5 mm roughness | 0.2437 | −0.2697 | Tyre surface roughness |
| 1.0 mm roughness | 0.2457 | −0.2851 | Tyre surface roughness |
| Low $y^+$ | 0.2339 | −0.2490 | First-layer resolution |
| Tyre-layer control | 0.2413 | −0.2498 | Reproduction with identical inputs |

The roughness changes were larger than the measured statistical variation, so I retained them as pilot trends. The change caused by $a_1$ was close to the statistical interval, so I retained only its direction and did not present it as a firm aerodynamic conclusion.

These are sensitivity results for this public geometry, wall treatment and mesh contract. They are not evidence that the same changes would produce the same effect on a real car.

## The roughness cases corrected my first diagnosis

The first 0.5 mm and 1.0 mm roughness runs both encountered a floating-point exception near iteration 549. I initially concluded that the roughness height exceeded the distance to the first cell centre, so I generated meshes intended to be compatible with the requested roughness.

When I checked the first layer more carefully, I found that the median first-cell-centre height on the tyres was about 7.7 mm. No more than 0.02% of the surface actually violated the condition. The original failure was therefore more likely to have come from gradual divergence under the old solver settings than from the roughness height itself.

After switching to stable pressure, velocity and turbulence settings, both roughness cases completed. I retained the original failure, my initial explanation, the later first-layer check and the corrected diagnosis rather than rewriting the history as if the successful runs had worked immediately.

![Change in aerodynamic coefficients across the tyre-roughness cases](/images/projects/f1-2026-aero/campaign/roughness_trend.png)

## Second-order discretisation was not inherently unstable

An early `linearUpwind` case diverged near the front-wing endplate. I initially summarised that result too broadly as evidence that the mesh could not support a second-order momentum scheme.

After establishing more stable pressure, velocity and turbulence relaxation settings, the same mesh completed 800 iterations. The new comparison showed that the first-order scheme predicted about 5.6% more downforce.

The correction was methodological as well as numerical. Mesh quality, discretisation and solver settings have to be assessed together. One failed run is not enough to establish a general limitation of a numerical scheme.

## How I decide whether the forces are stable

Falling residuals show that the equations are continuing to solve; they do not prove that drag and downforce have reached stable statistics. A force trace can also look flat while producing different means when the averaging window changes.

For each case, I search for a stable statistical interval. The usual starting point was between iterations 728 and 770. When I considered only a short final segment, the confidence interval could appear to be just 0.3%–0.6%. However, expanding the window from the final 50 iterations to 400 iterations could still move the mean by more than 9%.

Adjacent iterations are not independent samples, so I use block resampling to estimate the range of force variation. The resulting statistical interval for downforce was approximately 3%–5%. I only treat changes larger than that scale as candidates for further physical interpretation.

![Force histories across all variants](/images/projects/f1-2026-aero/campaign/convergence_overlay.png)

## Why whole-car coefficients are not enough

Every case reports forces for the whole car and separately for the front wing, rear wing, floor, front and rear tyres, and body. The component sum must agree with the whole-car result before I use the breakdown.

Some cases have similar total downforce even though the front wing, floor, tyres and body move strongly in different directions. A whole-car coefficient alone hides those compensating changes and can make an unconverged or poorly resolved comparison look credible.

I therefore check both the total forces and the component closure. I only explain why a component changed the whole-car result when those two views agree.

## Why I withdrew and rebuilt every first-version yaw case

The first yaw model combined the left and right tyres into one surface region and applied one rotation centre. All four cases completed, and the results showed a plausible reduction in downforce under yaw.

However, the downforce difference between $+3^\circ$ and $-3^\circ$ was 13.5%. That was not credible for a nominally symmetric model, so I withdrew all four first-version yaw cases.

In the second version, I defined all four tyres as independent regions and corrected their rotation centres. The rebuilt model passed positive-versus-negative yaw checks for drag, downforce and aerodynamic balance before I allowed those cases into the retained dataset.

## What happens after a case fails

If a case fails only because its numerical settings are not stable enough, the queue allows one restart from the existing solution with reduced relaxation. The original log and time directories remain intact. If the restarted case also fails, I mark it as rejected and let the queue continue to the next job.

I do not restart a case when the geometry did not change, a surface region is missing, meshing failed, input files disagree or the yaw setup is wrong. Those problems require corrected inputs and a new case.

The remote campaign also exposed three failures unrelated to aerodynamics:

- Old time directories remained in a case and caused parallel decomposition to read the wrong state.
- The remote disk filled up, leaving empty runner and log files.
- A running Bash script was overwritten directly, so the interpreter read a mixture of old and new content.

These failures did not change the physical model, but they made the batch process impossible to reproduce reliably. I responded by keeping case directories independent, removing remote copies after each returned batch, and updating runner scripts through temporary files followed by atomic replacement.

## What the campaign retained

The workflow can run mesh-reuse and remeshing variants in the same queue. One failed case does not stop later jobs, and configuration errors, out-of-memory failures, floating-point exceptions, statistical drift, component-closure failures and incorrect yaw definitions are all recorded explicitly.

More importantly, the process allows me to withdraw plots and interpretations after they have been generated. The roughness failures, the early second-order failure and the first yaw model all produced plausible stories. Later checks forced me to revise the cause, withdraw the conclusion or remove the entire result set.

Across the complete study, 37 cases passed the required checks. The core nine-case table remains the directly comparable pilot sensitivity set; the later active-wing, ride-height, contact-region, rake, yaw and URANS cases extend the campaign without changing the limits of that original comparison.

## Limits and next work

This remains a pilot study based on steady half-car RANS and reconstructed public geometry. The 4.35-million-cell baseline does not demonstrate mesh-independent aerodynamics, and there is no wind-tunnel or track correlation. Half-car symmetry also cannot represent full-car asymmetric flow.

A production study still requires larger meshes, second-order discretisation, better near-wall resolution on the wings, and independent mesh and turbulence-model sensitivity studies. Those are future fidelity gates, not completed results from this campaign.

The most important outcome was not a particular downforce value. It was the rule that now controls the whole workflow: a case can enter the results table only after its configuration, mesh, solver history, mass balance, force statistics and component breakdown have all passed.
