---
title: 'Simulating the Kármán Vortex Street in Fluent'
year: 2026
date: '2026-04-11'
updated: '2026-04-16'
status: complete
categories: [component-cfd, validation]
tags: [CFD]
summary: 'In this CFD coursework, we investigated two regimes of flow past a cylinder: a steady wake at Re=40 and unsteady vortex shedding at Re=150. I set up two Fluent cases, triggered the vortex street via an intentional velocity patch perturbation, and recorded lift and drag histories.'
role: 'Fluent Simulation and Data Validation'
duration: '4 weeks'
academic:
  institution: 'ESILV'
  course: 'Computational Fluid Dynamics'
  assignment: 'Steady and Transient Computations of Flow Past a Cylinder'
  requirements:
    - 'Solve steady laminar flow past a cylinder at Re=40 and verify convergence, mass balance, and drag.'
    - 'Run a transient case at Re=150 and trigger symmetry breaking via a controlled velocity perturbation.'
    - 'Record lift and drag histories and identify the Kármán vortex street.'
    - 'Compare force results against provided experimental benchmarks and discuss discrepancies.'
featured: true
order: 17
studySequence: 12
heroImage: /images/projects/fluent-cylinder-vortex/source/developed-vorticity.png
---

This is my lab record from the Computational Fluid Dynamics course in the Spring 2026 semester.

## Assignment Description

The assignment began with a concrete fluid dynamics question: when fluid flows past a cylinder, why does it sometimes leave a steady wake, yet at other times shed vortices alternately from both sides? The instructor introduced the phenomenon using natural Kármán vortex streets. Islands act as bluff bodies that force atmospheric flow separation, shedding vortices alternately from either side and leaving visible periodic structures downstream.

<figure>
  <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/course-karman-islands.png" alt="Natural Kármán vortex street downstream of the Juan Fernández Islands from course materials" loading="lazy">
  <figcaption>Natural Kármán vortex street downstream of the Juan Fernández Islands</figcaption>
</figure>

The assignment juxtaposed two distinct flow regimes: first, solve steady flow past a cylinder at $Re=40$, checking convergence, mass conservation, velocity, streamlines, vorticity, pressure, and drag; next, increase the Reynolds number to 150 using a transient solver to monitor lift and drag, characterizing the unsteady wake periodicity with a dimensionless parameter. That parameter is the Strouhal number evaluated later.

<figure>
  <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/course-cylinder-flow-regimes.png" alt="Course diagram showing five regimes of flow past a cylinder from attached flow to unsteady vortex shedding" loading="lazy">
  <figcaption>Schematic diagram of flow regimes past a cylinder from course materials</figcaption>
</figure>

## Two-Regime Framework

I structured the instructor's requirements into two cylinder flow cases: a steady symmetric wake at $Re=40$, and an unsteady Kármán vortex street at $Re=150$. I set up two Fluent cases (steady and transient) and triggered the vortex street using a controlled perturbation. After the simulations completed, I digitized the retained monitor screenshots frame-by-frame to reconstruct the force histories. The results were mixed: the vortex shedding frequency yielded $St=0.155$, but the drag was 29.3% lower than the experimental benchmark. The frequency was sound, whereas the pressure drag lacked precision.

Following the assignment guidelines, both cases shared a common quadrilateral mesh of 20,200 nodes, with approximately 100 elements along the cylinder circumference. The fluid density was 1 kg/m³ and the cylinder diameter was 1 m. The transient case also used Fluent Adapt to refine the downstream wake region, with a residual convergence target set to $10^{-3}$.

## $Re=40$ Steady Benchmark Case

At $Re=40$, the wake remains steady and top-bottom symmetric across the centerline. Two closed recirculation zones form behind the cylinder; top and bottom pressures cancel out, resulting in zero net lift. This steady result later served another purpose: providing an independent control when analyzing the drag discrepancy at $Re=150$. The drag decomposes as follows:

| Component | Force | Coefficient |
|---|---:|---:|
| Pressure | 2.0100 N | 3.2816 |
| Viscous | 1.0615 N | 1.7330 |
| Total | 3.0714 N | 5.0146 |

<div class="space-y-8">
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/steady-velocity-magnitude.png" alt="Symmetric steady velocity magnitude field around a cylinder at Reynolds number 40" loading="lazy">
    <figcaption>Steady velocity field at Re=40</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/steady-recirculation-streamlines.png" alt="Streamline plot of symmetric twin recirculation zones behind a cylinder at Reynolds number 40" loading="lazy">
    <figcaption>Twin recirculation bubbles behind the cylinder at Re=40</figcaption>
  </figure>
</div>

## The $Re=150$ Case

Real physical flow at $Re=150$ is inherently unstable, spontaneously developing alternating shedding vortices behind the cylinder. However, in the numerical model, the mesh, inlet boundary, and cylinder geometry are all perfectly symmetric about the centerline. With neither governing equations nor boundary conditions breaking symmetry, the numerical solution can linger in a quasi-symmetric state for an extended duration. The instability that occurs naturally in physical experiments does not emerge immediately in such a simulation.

Waiting for roundoff errors to trigger instability would risk exceeding our limited computational budget. Therefore, after initialization, I manually introduced an asymmetry using a patch: adding a $+0.2$ m/s transverse ($Y$) velocity in the downstream quadrant where $X>0.5$ m and $Y>0$.

The peak velocity immediately after perturbation was

$$
\sqrt{1^2+0.2^2}\approx1.02\ \text{m/s},
$$

consistent with the initial contour plots.

<div class="space-y-8">
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/transverse-velocity-patch.png" alt="Fluent patch configuration setting transverse velocity to 0.2 m/s" loading="lazy">
    <figcaption>Patch setup for transverse velocity perturbation</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/patched-y-velocity.png" alt="Initial Y-velocity field in the downstream quadrant after applying perturbation" loading="lazy">
    <figcaption>Initial Y-velocity field after perturbation</figcaption>
  </figure>
</div>

This perturbation serves solely to seed the initial phase for vortex shedding without dictating the asymptotic shedding frequency. Once vortex shedding reaches limit-cycle oscillation, lift oscillates symmetrically around zero, demonstrating that the artificial bias does not persist into the fully developed state. Had the perturbation exerted a continuous bias, the lift history would remain offset to one side.

## Transition from Symmetric Wake to Vortex Street

The complete output spans 400 frames, playing for 13.33 seconds at 30 fps. Initially, the wake behind the cylinder remains nearly symmetric. As the perturbation amplifies, the upper and lower shear layers roll up alternately, shedding vortices in sequence and culminating in a stable Kármán vortex street.

<figure>
  <video class="w-full rounded-xl shadow-sm" controls autoplay muted loop playsinline preload="metadata" aria-label="Complete animation showing Fluent cylinder wake developing from initial state into Kármán vortex street">
    <source src="/videos/projects/fluent-cylinder-vortex/vortex-evolution.mp4" type="video/mp4">
    Your browser does not support the HTML5 video tag.
  </video>
  <figcaption>400-frame transverse velocity animation at Re=150</figcaption>
</figure>

## Determining $St=0.155$ from the Lift History

Vortices shed alternately from the top and bottom surfaces of the cylinder; each vortex pair corresponds to one complete oscillation of the lift coefficient around zero. In the fully developed regime, the amplitude stabilizes at approximately $\pm0.117$. Using the most direct zero-crossing approach on the curve after $t>40$ s, I identified the upward zero-crossing timestamps across six full cycles. The mean period was 6.44 s, yielding
$$
f=0.155\ \text{Hz},\qquad St=\frac{fD}{U}=0.155.
$$

To further substantiate this shedding frequency, I performed a Hann-windowed FFT on the same digitized lift history. For 670 samples with a frequency resolution of 0.0252 Hz, the dominant non-zero spectral peak was located at 0.151 Hz, falling within the same frequency bin as the zero-crossing result. While the lift history quantifies cycle period, instantaneous field contours reveal spatial structures. The vorticity contour captures alternating shear-layer roll-up, while the pressure contour illustrates stagnation high pressure coupled with alternating downstream low-pressure vortex cores.

<div class="space-y-8">
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/developed-vorticity.png" alt="Vorticity magnitude field showing alternating vortex shedding in cylinder wake at Reynolds number 150" loading="lazy">
    <figcaption>Vorticity field at Re=150</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/developed-pressure.png" alt="Alternating static pressure field behind cylinder during vortex shedding at Reynolds number 150" loading="lazy">
    <figcaption>Instantaneous pressure field at Re=150</figcaption>
  </figure>
</div>

![Lift frequency spectrum in fully developed regime](/images/projects/fluent-cylinder-vortex/lift-spectrum.svg)

The forces at the final time step for $Re=150$ were:

| Component | Force | Coefficient |
|---|---:|---:|
| Pressure | 0.4385 N | 0.7159 |
| Viscous | 0.1269 N | 0.2072 |
| Total | 0.5654 N | 0.9231 |

The experimental reference corresponds to roughly 0.8 N under these conditions, meaning the simulation underpredicted drag by 29.3%. This deficit stems primarily from the pressure component: pressure drag accounts for 78% of total computed drag, indicating that the crux lies in base pressure recovery behind the cylinder rather than wall viscous friction. A similar directional underprediction appeared in the $Re=40$ steady case: computed drag was 3.07 N against ~4.2 N from reference charts, an underestimation of 26.9%. That a steady and a transient case exhibited comparable deficits suggests the $Re=150$ discrepancy was not merely an artifact of sampling at a single instant in time.

I hypothesize that numerical dissipation plays a major role. A coarse mesh combined with relatively relaxed transient convergence tolerances can damp shedding vortices and artificially elevate wake base pressure, reducing the front-to-back pressure differential. Another common pitfall: residual convergence merely signifies that Fluent solved the discrete algebraic system for that time step—it does not imply that integrated forces are physically accurate. Equations can converge cleanly on a mesh that remains too coarse.

The exported forces and coefficients in both cases satisfied $C_D=F_D/0.6125$. However, the theoretical dynamic pressure references for $Re=40$ and $Re=150$ are 2.0 and 0.5, respectively. This indicates that both runs reused a single static set of reference values in Fluent without recomputing dynamic pressure per case. Consequently, comparing these raw coefficients directly against literature charts would conflate differing definitions. This analysis compares dimensional forces instead, as reference areas cancel out under identical geometry.

Furthermore, the pressure coefficient of 3.2816 happened to be close to the total drag coefficient of 3.28 in the reference chart, but the two represent entirely different physical quantities. Numerical proximity cannot substitute for validation unless both share an identical definition. Therefore, this article evaluates exported pressure force, viscous force, and total drag against the course reference curve under consistent geometry, rather than taking raw $C_D$ values at face value.

<div class="space-y-8">
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/final-force-report.png" alt="Values of pressure force, viscous force, and total force at the final time step in Fluent" loading="lazy">
    <figcaption>Fluent force report at the final time step for Re=150</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/experimental-drag-reference.png" alt="Reference curve of experimental drag coefficient versus Reynolds number for a smooth cylinder" loading="lazy">
    <figcaption>Reference drag curve for a smooth cylinder provided by the course</figcaption>
  </figure>
</div>

## Final Numerical Results

| Metric / Verification Item | Result |
|---|---|
| Re=40 steady convergence | 53 iterations, residuals $< 10^{-6}$ |
| Re=40 mass imbalance | $5.84\times10^{-9}$ kg/s |
| Final $C_L$ (digitized vs. exported) | 0.075 vs. 0.069 |
| Final drag (digitized vs. exported) | 0.555 N vs. 0.565 N |
| Shedding period | Six cycles, standard deviation 0.03 s |
| Strouhal number | 0.155 |

## Summary

Through this hands-on course assignment, I first solidified my familiarity with the fundamental ANSYS and Fluent workflow. Starting from geometry, meshing, and boundary condition specification, I configured steady and transient solvers, monitored residuals, lift, and drag, and inspected the resulting velocity, pressure, and vorticity fields. Second, I developed a deeper understanding of CFD methodology: residual convergence merely indicates that the discrete algebraic equations were solved, not that integrated engineering quantities are fully accurate. Shedding frequency and drag must also be evaluated separately: this simulation captured a reasonable vortex shedding frequency, yet pressure drag retained a substantial discrepancy relative to empirical reference data. I recognized the simplifications and limitations inherent in this case: a 2D laminar formulation utilizing a single grid and a fixed 0.2 s time step without grid or time-step refinement studies. The calculated $St=0.155$ was derived from only six shedding cycles, and the existing mesh lacked sufficient resolution to finely capture the boundary layer governing separation points. Thus, while these results effectively elucidate vortex shedding mechanisms and validate frequency, the drag values should not be treated as high-precision data.

This remains a quintessential canonical CFD benchmark. In subsequent work, I plan to reproduce this case using OpenFOAM—replicating both the $Re=40$ steady wake and $Re=150$ Kármán vortex street while adding systematic mesh, time-step, and domain independence refinements, extending sampling durations, and exporting lift/drag histories directly. This will turn this simplified coursework baseline into a foundation for rigorously isolating the effects of grid resolution, time stepping, and numerical schemes on shedding frequency and drag.
