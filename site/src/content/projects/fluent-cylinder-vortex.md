---
title: 'Simulating a Kármán Vortex Street in Fluent'
year: 2026
date: '2026-04-11'
status: complete
categories: [component-cfd, validation]
tags: [CFD]
summary: 'In this CFD course assignment we studied two cylinder-flow cases: a steady wake at Re=40 and unsteady vortex shedding at Re=150. I built two Fluent cases, triggered the vortex street with a deliberately patched velocity region, and recorded lift and drag.'
role: 'Fluent simulation & data validation'
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
studySequence: 12
heroImage: /images/projects/fluent-cylinder-vortex/force-history.svg
---

This is my lab record for the Computational Fluid Dynamics course in the spring 2026 semester.

## The assignment

The course task starts from a very concrete fluid problem: when flow passes a cylinder, why does it sometimes leave a steady wake behind, and sometimes shed vortices alternately from the two sides? The teacher introduced the problem with Kármán vortex streets in nature. Islands act like bluff bodies and force the airflow to separate; vortices shed alternately from the two sides and leave a visible periodic structure downstream.

<figure>
  <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/course-karman-islands.png" alt="Natural Kármán vortex street downstream of the Juan Fernández Islands in Chile, from the course material" loading="lazy">
  <figcaption>A natural Kármán vortex street downstream of the Juan Fernández Islands</figcaption>
</figure>

The assignment puts the two flow regimes side by side: first compute steady cylinder flow at $Re=40$ and check convergence, mass conservation, velocity, streamlines, vorticity, pressure and drag; then raise the Reynolds number to 150, switch to a transient solve, monitor lift and drag, and describe the unsteady rhythm of the wake with one dimensionless number. That number is the Strouhal number measured later.

<figure>
  <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/course-cylinder-flow-regimes.png" alt="Course diagram of five cylinder-flow regimes from attached flow to unsteady vortex shedding" loading="lazy">
  <figcaption>Cylinder-flow regimes from the course material</figcaption>
</figure>

## Considering the two cases

I turned the teacher's requirements into two cylinder-flow cases: a steady symmetric wake at $Re=40$, and an unsteady Kármán vortex street at $Re=150$. I built one steady and one transient Fluent case, and used a controlled perturbation to excite the vortex street. After the runs, I also digitized the surviving monitor screenshots one by one and rebuilt the force histories. The results were one good, one bad: the shedding frequency came out at $St=0.155$, but the drag was 29.3% lower than the experimental chart. The frequency is basically reasonable; the pressure drag is not accurate enough yet.

As the teacher required, the two cases share one quadrilateral mesh with 20,200 nodes and about 100 elements around the cylinder edge. The density is 1 kg/m³ and the cylinder diameter is 1 m. The transient case also used Fluent Adapt to refine the downstream region, with the residual target set to $10^{-3}$.

## The $Re=40$ steady baseline

At $Re=40$, we found that the wake stays steady and symmetric about the centreline. There are two closed recirculation zones behind the cylinder, and the upper and lower pressures cancel each other, so the lift is zero. This steady result had one more use later: when I analysed the $Re=150$ drag error, it provided an independent comparison. The drag breaks down as:

| Component | Force | Coefficient |
|---|---:|---:|
| Pressure | 2.0100 N | 3.2816 |
| Viscous | 1.0615 N | 1.7330 |
| Total | 3.0714 N | 5.0146 |

<div class="space-y-8">
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/steady-velocity-magnitude.png" alt="Symmetric steady velocity-magnitude field around the cylinder at Reynolds number 40" loading="lazy">
    <figcaption>Steady velocity field at Re=40</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/steady-recirculation-streamlines.png" alt="Streamlines of the symmetric twin recirculation zones behind the cylinder at Reynolds number 40" loading="lazy">
    <figcaption>Twin recirculation zones behind the cylinder at Re=40</figcaption>
  </figure>
</div>

## The $Re=150$ case

The real flow at $Re=150$ is unstable: alternately shedding vortices grow behind the cylinder on their own. But in my numerical model, the mesh, the inlet and the cylinder are all perfectly symmetric about the centreline. Nothing in the equations or the boundary conditions breaks the symmetry, so the numerical result can stay in a nearly symmetric state for a long time. The instability of the real flow does not appear right away in this case.

If I just kept waiting, the available computing time might never reach the result I wanted. So after initialization I used patch to add an asymmetry by hand: in the downstream quadrant with $X>0.5$ m and $Y>0$, I added a $+0.2$ m/s transverse velocity.

The peak velocity after the perturbation is

$$
\sqrt{1^2+0.2^2}\approx1.02\ \text{m/s},
$$

which matches the initial contour.

<div class="space-y-8">
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/transverse-velocity-patch.png" alt="The patch configuration in Fluent setting the transverse velocity to 0.2 metres per second" loading="lazy">
    <figcaption>Patch settings for the transverse-velocity perturbation</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/patched-y-velocity.png" alt="Initial Y-velocity field in the downstream quadrant after the perturbation" loading="lazy">
    <figcaption>Initial Y-velocity field after the perturbation</figcaption>
  </figure>
</div>

This perturbation only sets the phase of the first vortices; it does not decide the final frequency. Once the vortex shedding settled, the lift still oscillated symmetrically around zero, which shows the artificial bias did not stay in the developed result. If the perturbation were still acting, the lift curve would lean to one side.

## Watching the wake turn from symmetric into a vortex street

The full output has 400 frames, played at 30 fps for 13.33 seconds. At the start, the wake behind the cylinder is still nearly symmetric. After the perturbation grows, the upper and lower shear layers roll up one after the other, vortices begin to shed alternately, and a stable Kármán vortex street finally forms.

<figure>
  <video class="w-full rounded-xl shadow-sm" controls autoplay muted loop playsinline preload="metadata" aria-label="Full animation of the Fluent cylinder wake developing from its initial state into a Kármán vortex street">
    <source src="/videos/projects/fluent-cylinder-vortex/vortex-evolution.mp4" type="video/mp4">
    Your browser does not support HTML5 video.
  </video>
  <figcaption>400-frame transverse-velocity animation at Re=150</figcaption>
</figure>

## Reading $St=0.155$ off the lift curve

Vortices shed alternately from the upper and lower surfaces of the cylinder, and each shed pair completes one periodic oscillation of the lift coefficient around zero. Once developed, the amplitude is about $\pm0.117$. I used the most direct method: take the curve after $t>40$ s, find the moments where the lift crosses zero going up, and count six periods from those zero crossings. The mean period is 6.44 s, so
$$
f=0.155\ \text{Hz},\qquad St=\frac{fD}{U}=0.155.
$$

To confirm this frequency further, I also ran a Hann-window FFT on the same digitized lift history. With 670 samples, the frequency resolution is 0.0252 Hz, and the largest non-zero bin sits at 0.151 Hz, in the same frequency cell as the zero-crossing method. The lift history tells me how long a period is; the instantaneous fields tell me where the periodic structure is. The vorticity plot shows the two shear layers rolling up alternately, and the pressure plot shows the stagnation high pressure and the staggered low-pressure zones downstream.

<div class="space-y-8">
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/developed-vorticity.png" alt="Alternately shedding vorticity-magnitude field in the cylinder wake at Reynolds number 150" loading="lazy">
    <figcaption>Vorticity field at Re=150</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/developed-pressure.png" alt="Static-pressure field alternating with vortex shedding behind the cylinder at Reynolds number 150" loading="lazy">
    <figcaption>Instantaneous pressure field at Re=150</figcaption>
  </figure>
</div>

![Lift spectrum in the developed stage](/images/projects/fluent-cylinder-vortex/lift-spectrum.svg)

The forces at the final time step of Re=150 are:

| Component | Force | Coefficient |
|---|---:|---:|
| Pressure | 0.4385 N | 0.7159 |
| Viscous | 0.1269 N | 0.2072 |
| Total | 0.5654 N | 0.9231 |

The experimental chart gives about 0.8 N at this condition, so the simulation is 29.3% low. The gap sits mainly in the pressure term: pressure drag makes up 78% of the computed total drag, so the key is the pressure recovery behind the cylinder, not the wall viscous term. The steady $Re=40$ case also shows a gap in the same direction: the computed drag is 3.07 N, the chart gives about 4.2 N, a 26.9% underprediction. One steady and one transient, yet the underprediction is similar in size, which says the $Re=150$ gap does not look like it comes from a single sampling instant.

My guess at one possible cause is numerical dissipation. A coarse mesh and the looser transient tolerance may weaken the shed vortices and fill in the low-pressure region of the wake, reducing the pressure difference between the front and rear of the cylinder. And there is an easy trap to step into: residual convergence only shows that Fluent has finished the current discrete equations; it does not show that the drag is accurate. The equations can converge beautifully while the mesh is still not fine enough.

The forces and coefficients exported for the two cases both satisfy $C_D=F_D/0.6125$. But the theoretical dynamic-pressure references for $Re=40$ and $Re=150$ are 2.0 and 0.5 respectively. This shows the two cases reused the same set of reference values without converting the coefficients separately. So comparing these coefficients directly with the textbook reference chart would mix different definitions. This article compares forces instead, because for the same geometry the reference area cancels.

That said, the pressure coefficient 3.2816 happens to be close to the total drag coefficient 3.28 in the reference chart, but the two are not the same physical quantity. A close number cannot count as validation unless both sides use the same definition. So this article uses the exported pressure force, viscous force and total drag, compared against the course reference curve under one consistent geometry, and does not use the raw $C_D$ directly.

<div class="space-y-8">
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/final-force-report.png" alt="Fluent pressure, viscous and total force values at the final time step" loading="lazy">
    <figcaption>Fluent force results at the final Re=150 time step</figcaption>
  </figure>
  <figure>
    <img class="w-full" src="/images/projects/fluent-cylinder-vortex/source/experimental-drag-reference.png" alt="Reference curve of experimental drag coefficient versus Reynolds number for a smooth cylinder" loading="lazy">
    <figcaption>The course's drag reference curve for a smooth cylinder</figcaption>
  </figure>
</div>

## Final numerical results

| Check | Result |
|---|---|
| Re=40 steady convergence | 53 iterations, residuals below $10^{-6}$ |
| Re=40 mass imbalance | $5.84\times10^{-9}$ kg/s |
| Final $C_L$, digitized vs exported | 0.075 vs 0.069 |
| Final drag, digitized vs exported | 0.555 N vs 0.565 N |
| Shedding period | Six periods, standard deviation 0.03 s |
| Strouhal number | 0.155 |

## Summary

Through this hands-on course assignment, I first feel that I got familiar with the basic ANSYS and Fluent workflow. I started from geometry, mesh and boundary conditions, set up steady and transient solves, then monitored residuals, lift and drag, and finally checked the results with velocity, pressure and vorticity fields. Second, I found that the CFD way of thinking is quite distinctive: residual convergence only shows that the discrete equations are done, not that every physical quantity is accurate enough. Frequency and drag also have to be judged separately: this run got a reasonable vortex-shedding frequency, but the pressure drag still has a clear gap against the reference. I see this case's simplifications and boundaries clearly. It is a two-dimensional laminar model with one mesh and one 0.2 s time step, with no mesh or time-step refinement. The $St=0.155$ comes from only six periods, and the current mesh cannot finely resolve the boundary layer that decides the separation points. So these results are good for understanding vortex shedding and validating the frequency, but the drag cannot be treated as a high-precision result.

This is a very classic study case, and next I plan to redo it in OpenFOAM: reproduce the steady wake at $Re=40$ and the Kármán vortex street at $Re=150$, then add mesh, time-step and domain refinement, extend the sampling time, and export the lift and drag histories directly. That way the current simplified course case becomes a baseline, and I can step by step find out how mesh, time step and numerical settings affect the frequency and the drag.
