---
title: 'How I Triggered and Measured a Kármán Vortex Street in Fluent'
year: 2026
date: '2026-03-12'
status: complete
categories: [component-cfd, validation]
tags: [CFD]
summary: 'I added a controlled transverse-velocity perturbation to a Re=150 cylinder wake, triggered stable vortex shedding, and measured St=0.155. I also retained the 29.3% drag underprediction, showing that the tutorial mesh could capture the frequency but not predict pressure drag accurately.'
role: 'Simulation & report lead'
team: 'ESILV MMN1 group — Bing Gao, Nicolas Chang, Daphné Baray'
duration: '4 weeks'
academic:
  institution: 'ESILV'
  course: 'Computational Fluid Dynamics'
  assignment: 'TD2 steady and transient flow past a cylinder'
  note: 'The second tutorial of the same ESILV CFD module, again completed by a group of three. I set up the steady and transient cylinder cases, triggered the vortex street with a deliberate velocity patch, and wrote the report. Later, I digitised the archived Fluent monitor images, reconstructed the force histories, checked their endpoints against the exported force reports, and organised the results as a self-contained reproduction package.'
  requirements:
    - 'Solve steady laminar cylinder flow at Re=40 and check convergence, mass balance and drag.'
    - 'Run a transient Re=150 case and trigger symmetry breaking with a controlled velocity perturbation.'
    - 'Record lift and drag histories and identify the Kármán vortex street.'
    - 'Compare the force result with the supplied experimental reference and discuss the discrepancy.'
  media:
    - src: '/images/projects/fluent-cylinder-vortex/assignment-workflow.svg'
      alt: 'Workflow from steady cylinder flow to a perturbed transient case and Strouhal extraction'
      caption: 'I turned the assignment into a controlled experiment: establish the steady case, perturb symmetry, monitor the forces, then extract St and the drag error.'
    - src: '/images/projects/fluent-cylinder-vortex/vortex-evolution.gif'
      alt: 'Animated sequence of the cylinder wake developing into a staggered vortex street'
      caption: 'Four retained Fluent frames show the imposed asymmetry growing into a developed Kármán vortex street.'
featured: true
order: 17
studySequence: 9
heroImage: /images/projects/fluent-cylinder-vortex/force-history.svg
---

## What I needed to observe

The assignment covered two cylinder-flow regimes: a steady, symmetric wake at $Re=40$ and an unsteady Kármán vortex street at $Re=150$.

This was a three-person group assignment. I set up the steady and transient Fluent cases, ran the monitors, introduced the controlled perturbation that triggered vortex shedding, and wrote the report. Later, I digitised the surviving monitor screenshots and checked the reconstructed endpoints against the final-step force reports.

The Re=150 case produced a Strouhal number of $St=0.155$, but its drag was 29.3% below the experimental chart value. Both results matter. The frequency shows that the tutorial mesh was sufficient to reveal the shedding cycle, while the drag error shows that it was not sufficient for an accurate pressure-drag prediction.

## Method and simulation settings

Both cases used the same quadrilateral mesh, with 20,200 nodes and about 100 elements around the cylinder edge. The fluid density was 1 kg/m³, and the cylinder diameter was 1 m.

| Case | Inlet velocity | Dynamic viscosity | Run |
|---|---:|---:|---|
| $Re=40$ | 2 m/s | 0.05 Pa·s | Steady; residuals below $10^{-6}$ after 53 iterations |
| $Re=150$ | 1 m/s | 0.00667 Pa·s | Transient; 400 steps × 0.2 s |

For the transient case, I also used Fluent Adapt to refine the downstream region. I set the transient residual target to $10^{-3}$.

## Why I broke the symmetry deliberately

The mesh, inlet, and cylinder were all symmetric about the centreline. Although the physical flow at $Re=150$ is unstable, a numerical model with this symmetry can remain nearly symmetric for a long time.

To make the vortex street appear within the available simulation time, I used Fluent's patch tool after initialization. In the downstream quadrant defined by $X>0.5$ m and $Y>0$, I imposed a transverse velocity of $+0.2$ m/s.

The resulting peak velocity magnitude was

$$
\sqrt{1^2+0.2^2}\approx1.02\ \text{m/s},
$$

which matched the initial contour.

The patch set the phase of the first vortices, but it did not determine the final shedding frequency. After the wake reached a developed state, lift continued to oscillate symmetrically around zero. This indicated that the imposed bias had not remained in the developed result.

## The Re=40 control case

At $Re=40$, the wake remained steady and symmetric about the centreline. Two stationary recirculation regions formed behind the cylinder. The pressure contributions from the upper and lower surfaces cancelled in the transverse direction, so the lift was zero.

The drag components were:

| Component | Force | Coefficient |
|---|---:|---:|
| Pressure | 2.0100 N | 3.2816 |
| Viscous | 1.0615 N | 1.7330 |
| **Total** | **3.0714 N** | **5.0146** |

This steady case later became an important check on whether the Re=150 drag error was incidental or systematic.

## How I measured the Strouhal number

Vortices shed alternately from the upper and lower sides of the cylinder, causing the lift coefficient to oscillate around zero. Once the wake was developed, the lift amplitude was about $\pm0.117$.

I used upward zero-crossings after $t>40$ s to measure six complete periods. Their mean period was 6.44 s, giving

$$
f=0.155\ \text{Hz},\qquad St=\frac{fD}{U}=0.155.
$$

I also applied a Hann-windowed FFT to the same digitised lift history. With 670 samples, the frequency resolution was 0.0252 Hz. The largest non-zero frequency bin was at 0.151 Hz, within the same frequency interval as the zero-crossing result.

These are not independent experimental validations because both methods use the same screenshot-derived signal. They only show that the identified frequency does not depend on manually selecting one particular pair of peaks.

![Spectrum of the developed lift history](/images/projects/fluent-cylinder-vortex/lift-spectrum.svg)

## The concrete failure: drag was 29.3% too low

At the final time step of the Re=150 run, Fluent reported:

| Component | Force | Coefficient |
|---|---:|---:|
| Pressure | 0.4385 N | 0.7159 |
| Viscous | 0.1269 N | 0.2072 |
| **Total** | **0.5654 N** | **0.9231** |

The supplied experimental chart corresponds to about 0.8 N under these conditions. The simulated force was therefore 29.3% too low.

Pressure drag accounted for 78% of the computed total. This located the main shortfall in the pressure recovery behind the cylinder rather than in the wall-viscous contribution.

The Re=40 result showed the same pattern. Its computed drag was 3.07 N, compared with about 4.2 N from the chart, an underprediction of 26.9%. The error had the same direction and a similar magnitude at both Reynolds numbers. That made numerical dissipation a more useful explanation than a difference between an instantaneous and mean value.

A coarse mesh and the looser transient convergence tolerance can weaken the shedding vortices and fill in the low-pressure wake. This reduces the pressure difference between the front and rear of the cylinder and therefore lowers the pressure drag. Residual convergence only shows that Fluent has solved the current discretised equations; it does not establish that the resulting drag is accurate.

## Correcting the reference-coefficient problem

The two Fluent force reports both satisfy

$$
C_D=\frac{F_D}{0.6125}.
$$

However, the theoretical dynamic-pressure reference quantities for the Re=40 and Re=150 runs are 2.0 and 0.5 respectively. Fluent's reference values had therefore not been updated between operating conditions.

Directly comparing the reported coefficients with the textbook chart would mix different reference definitions. I corrected the comparison by using forces instead, because the reference area cancels when the geometry is unchanged.

This also explained a misleading result in the draft. The Re=40 pressure coefficient of 3.2816 was almost identical to the chart's total drag coefficient of 3.28. It initially looked like excellent validation, but the two numbers represented different physical quantities. The suspiciously close match was what led me to check the definitions.

## What could be recovered from the archived data

The original Fluent monitor text was not retained after the course. Only screenshots of the monitors and the final-time-step force reports survived.

I digitised the force histories from those screenshots and used the reports to check their endpoints:

| Quantity | Digitised endpoint | Force-report endpoint |
|---|---:|---:|
| Final $C_L$ | 0.075 | 0.069 |
| Final drag | 0.555 N | 0.565 N |

The drag screenshot used a vertical scale from 0 to 7 N, while the developed drag fluctuation was only about 0.01 N. That fluctuation was below the image's pixel resolution. I therefore retained only the supported mean drag instead of recreating a small twice-frequency oscillation that the archived image could not resolve.

## How the vortex street developed

<div class="grid gap-3 sm:grid-cols-2">
  <figure>
    <img src="/images/projects/fluent-cylinder-vortex/animation-0001.png" alt="Initial nearly symmetric cylinder wake after the impulsive start" loading="lazy">
    <figcaption>1. Initial transient: separation is still nearly symmetric.</figcaption>
  </figure>
  <figure>
    <img src="/images/projects/fluent-cylinder-vortex/animation-0002.png" alt="Cylinder wake beginning to roll up after the imposed asymmetry" loading="lazy">
    <figcaption>2. The transverse-velocity perturbation triggers the first uneven roll-up.</figcaption>
  </figure>
  <figure>
    <img src="/images/projects/fluent-cylinder-vortex/animation-0003.png" alt="Alternating cylinder-wake structures detaching downstream" loading="lazy">
    <figcaption>3. Alternating structures detach from the two sides of the cylinder.</figcaption>
  </figure>
  <figure>
    <img src="/images/projects/fluent-cylinder-vortex/animation-0004.png" alt="Developed staggered Karman vortex street" loading="lazy">
    <figcaption>4. The wake develops into a mature staggered Kármán vortex street.</figcaption>
  </figure>
</div>

## Retained checks and results

| Check | Result |
|---|---|
| Re=40 steady convergence | 53 iterations; residuals below $10^{-6}$ |
| Re=40 mass imbalance | $5.84\times10^{-9}$ kg/s |
| Digitised vs reported final $C_L$ | 0.075 vs 0.069 |
| Digitised vs reported final drag | 0.555 N vs 0.565 N |
| Shedding-period sample | Six periods; standard deviation 0.03 s |
| Strouhal number | 0.155 |

## Limits and next work

I used only one mesh and one time step, so this work does not include a spatial or temporal refinement study. The 0.2 s time step gives about 32 steps per shedding period.

The continuity residual settled on a plateau slightly above $10^{-3}$. The raw monitor text was also not retained, and the surviving screenshots cannot support sub-pixel drag fluctuations.

The Strouhal estimate is based on only six periods. A laminar model is appropriate for the Re=150 case, but this mesh still does not resolve the boundary layer that determines the separation points. The drag should therefore not be treated as a high-accuracy result.

The next useful step would be to repeat the calculation with mesh and time-step refinement, especially near the cylinder boundary layer and in the near wake, while retaining the raw force-monitor data. That work was not completed here.

## What I learned

My first explanations for the drag discrepancy were the usual ones: comparing an instantaneous result with an average, and comparing a two-dimensional simulation with a three-dimensional experiment. Those statements can be relevant, but they did not predict which force component or which case should contain the error.

The numerical-dissipation explanation was more useful because it located the shortfall in pressure drag and predicted that the Re=40 case should show a similar bias. The later comparison did show a 26.9% underprediction in the same direction.

I took two practical habits from this assignment: decompose the forces before explaining a total error, and when two numbers appear to match perfectly, first check that they use the same definition.
