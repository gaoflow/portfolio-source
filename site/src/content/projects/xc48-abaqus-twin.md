---
title: 'Digital Twin in Practice: Reproducing a Tensile Test in Abaqus'
year: 2026
date: '2026-04-04'
status: complete
categories: [validation, design]
tags: [FEA]
summary: 'Course assignment record, from a real tensile test to an Abaqus analysis.'
duration: '8 weeks'
academic:
  institution: 'ESILV'
  course: 'Materials and Behavior'
  assignment: 'XC48 tensile experiment and Abaqus numerical reconstruction'
  requirements:
    - 'Record the testing-machine output and post-failure specimen dimensions, then describe necking and fracture.'
    - 'Calculate engineering and true stress–strain curves and identify modulus, yield, ultimate, and breaking strength.'
    - 'Transfer the experimental material data into Abaqus and compare measured and numerical curves.'
    - 'Study mesh, solver, and loading-amplitude effects and justify the final configuration.'
featured: false
order: 19
studySequence: 11
heroVideo:
  src: '/videos/projects/xc48-abaqus-twin/m2-von-mises-fracture.mp4'
  poster: '/images/projects/xc48-abaqus-twin/m2-von-mises-fracture-poster.webp'
  caption: 'M2 Von Mises stress and fracture evolution under Smooth Step loading.'
heroImage: /images/projects/xc48-abaqus-twin/stress-strain.svg
---

This is a tensile-test record we completed in the Materials and Behavior course in the spring 2026 semester.

## Doing the real tensile test first

We first ran a uniaxial tensile test on an XC48 steel dog-bone specimen. The testing machine gave load and elongation; we recorded the post-fracture dimensions and used Excel to compute the engineering and true stress–strain curves. Only with that measured curve in hand did we start building the Abaqus model. The question we wanted to answer was direct: can the numerical curve follow the measured hardening, necking, and post-peak decline?

<figure>
  <img src="/images/projects/xc48-abaqus-twin/source/teacher-handout-tensile-machine.png" alt="Tensile machine, grips and dog-bone specimen photos in the teacher's tensile-test handout" loading="lazy">
  <figcaption>Tensile test equipment</figcaption>
</figure>

<figure>
  <img src="/images/projects/xc48-abaqus-twin/source/teacher-handout-specimen-geometry.png" alt="Dog-bone specimen dimension drawing in the teacher's handout, marking total length, shoulder distance, gauge length and reduced section" loading="lazy">
  <figcaption>Specimen dimension definitions</figcaption>
</figure>

## The first version of the curves

The first calculation kept the same 1,129-point source data but used placeholder dimensions of Ø10 mm and a 50 mm gauge length. The curve looked complete, but the engineering stress peaked at only 489.09 MPa and the true stress at 545.68 MPa. That gap made us go back and check the calculation inputs, and in the end the problem was not in the load data but in the specimen area and gauge length. After changing the geometry to the measured Ø7.99 mm and 70 mm, the engineering UTS became 766.12 MPa. The first two curves are therefore kept only as a record of a correction and are no longer used for the later material input.

$$
\varepsilon=\frac{\Delta L}{L_0},\qquad
\sigma=\frac{F}{A_0},\qquad
\varepsilon_T=\ln(1+\varepsilon),\qquad
\sigma_T=\sigma(1+\varepsilon)
$$

<figure>
  <img src="/images/projects/xc48-abaqus-twin/initial-tp-engineering-stress-strain.png" alt="Early engineering stress–strain curve computed with Ø10 mm and 50 mm placeholder geometry, peaking at 489.09 MPa" loading="lazy">
  <figcaption>Initial engineering stress–strain curve</figcaption>
</figure>

<figure>
  <img src="/images/projects/xc48-abaqus-twin/initial-tp-true-stress-strain.png" alt="Early true stress–strain curve converted from the same source data with placeholder geometry, peaking at 545.68 MPa" loading="lazy">
  <figcaption>Initial true stress–strain curve</figcaption>
</figure>

<figure>
  <img src="/images/projects/xc48-abaqus-twin/geometry-correction.svg" alt="Placeholder diameter and gauge length versus verified specimen dimensions, with engineering UTS changing from 489.09 MPa to 766.12 MPa" loading="lazy">
  <figcaption>Specimen dimension correction</figcaption>
</figure>

## Settling the experimental results

With the dimensions corrected, we kept the following experimental results; all later Abaqus calculations use them as the reference.

| Quantity | Value | Note |
|---|---:|---|
| Young's modulus | 12.28 GPa | Affected by machine and grip compliance |
| 0.2% offset yield strength | 758.33 MPa | Corrected result |
| Engineering UTS | 766.12 MPa | At 7.6% engineering strain |
| True peak stress | 828.4 MPa | Recomputed from corrected experimental data |
| Breaking strength | 557.80 MPa | Just before the final load drop |
| Fracture strain | 13.4% | Engineering strain |
| Necking | Ø7.99 → 5.77 mm | 47.8% reduction in area |

The Young's modulus is only 12.28 GPa, far below the roughly 210 GPa common for steel. The crosshead displacement here also includes deformation of the machine frame and grips, so this measured curve is "softer" than the material itself. The Abaqus model reused this slope, so a high $R^2$ later only means the numerical curve stays close to this particular test.

With this experimental baseline settled, the next step was turning it into geometry, material, and boundary conditions that Abaqus can understand.

## Analysing the Abaqus results

We built the full 3D dog-bone specimen and meshed it with C3D4 linear tetrahedral elements. One end of the specimen was fully fixed, i.e. `ENCASTRE`; the other end was pulled only along the axis, moving 15 mm within 1 s. Once the specimen necks and fractures, the shape change can no longer be treated as small deformation, so the step enabled the large-deformation option `nlgeom=YES`.

The material setup splits into pre-peak and post-peak. Before the peak, the elastic parameters and true plasticity data decide how the material goes from elastic into plastic and how it keeps hardening; after the peak, damage initiation, damage evolution, and element deletion decide how the curve softens and how the specimen finally separates. On the material card, that meant $E=12{,}283.5$ MPa, $\nu=0.3$, true plasticity data, ductile damage, 0.5 mm displacement-based damage evolution, and element deletion. The final loading amplitude was Smooth Step, for a reason explained in the energy check later.

<figure>
  <img src="/images/projects/xc48-abaqus-twin/abaqus-baseline-meshed-specimen.png" alt="Baseline C3D4 tetrahedral mesh view of the full dog-bone tensile specimen in Abaqus" loading="lazy">
  <figcaption>Baseline tetrahedral mesh</figcaption>
</figure>

We requested 200 field-output intervals in Abaqus, so we could see the whole curve and also follow necking and fracture over time. We rebuilt the engineering stress–strain curve from the displacement and reaction force at the loaded end, then checked the stress and strain inside the 70 mm gauge section to get the true curve used for comparison. That way, the numerical and experimental results share the same geometric reference.

A curve can only tell us how hard we pulled overall and how much it stretched; by itself it cannot say whether the fracture process is reasonable. So we looked at four kinds of results at the same time: stress `S` and equivalent plastic strain `PEEQ` to find stress concentration and plastic localisation; damage variable `SDEG` and element `STATUS` to track damage growth and element deletion; displacement and reaction force to rebuild the curve; and kinetic energy `ALLKE` with internal energy `ALLIE` for a basic inertia check.

That also set how we judged things later. $R^2$ can summarise how close the whole curve is, but we would not look at one score alone — we also looked at the necking shape, where the stress concentrated, and the pace of element deletion.

## The mesh study

Because of computer performance and the size limits of Abaqus Learning Edition, we could not refine the mesh without limit. M2 used an approximate global seed size of 4.5 with curvature control on; the other three meshes let us see how the discretisation scale changes the curve and the fracture region.

<figure>
  <img src="/images/projects/xc48-abaqus-twin/m2-global-seed-settings.png" alt="Abaqus global seed settings dialog with an approximate global size of 4.5 and curvature control enabled" loading="lazy">
  <figcaption>Global seed settings</figcaption>
</figure>

We compared the baseline mesh, M1, M2, and M3 against the same experimental curve. The criteria were curve fit and changes in the fracture region.

| Mesh | Elements | $R^2$ | Main behaviour |
|---|---:|---:|---|
| Baseline mesh | 3,846 | 0.9308 | Continued hardening after the peak |
| M1 | 830 | 0.9653 | Strain concentrated in a few elements |
| M2 | 1,975 | **0.9663** | Captured necking and post-peak decline |
| M3 | 2,928 | 0.9497 | Excessive localisation |

<figure>
  <img src="/images/projects/xc48-abaqus-twin/abaqus-m1-von-mises-result.png" alt="Deformation, Von Mises stress contour and separated specimen of the Abaqus M1 mesh in the final frame" loading="lazy">
  <figcaption>M1 fracture result</figcaption>
</figure>

<figure>
  <img src="/images/projects/xc48-abaqus-twin/abaqus-m2-von-mises-fracture-stage.png" alt="Necking, deformation and Von Mises stress contour of the Abaqus M2 mesh at the fracture stage" loading="lazy">
  <figcaption>M2 fracture result</figcaption>
</figure>

<figure>
  <img src="/images/projects/xc48-abaqus-twin/abaqus-m3-von-mises-result.png" alt="Deformation and Von Mises stress contour of the denser Abaqus M3 tetrahedral mesh in the final frame" loading="lazy">
  <figcaption>M3 fracture result</figcaption>
</figure>

<figure>
  <img src="/images/projects/xc48-abaqus-twin/mesh-r2-comparison.png" alt="Fit comparison of the baseline, M1, M2 and M3 meshes against the experimental true stress–strain curve" loading="lazy">
  <figcaption>Mesh sensitivity comparison</figcaption>
</figure>

M1 has only 830 elements, and plastic strain concentrates in a few of them. With M2 raised to 1,975 elements, the curve shows the necking and post-peak decline visible in the experiment, with $R^2=0.9663$. M3 refines further to 2,928 elements, but the damage becomes more local and $R^2$ drops back to 0.9497. The baseline mesh, despite its 3,846 elements, keeps hardening after the peak, which does not match the experiment's downward trend.

These results show that once damage and element deletion are in, mesh size changes the pace at which localisation and deletion happen. Weighing the curve, necking shape, stress concentration, and deletion process together, we kept M2. This is a configuration choice under the current limits, and it cannot be written up as achieved mesh convergence.

With the mesh settled, the remaining question was: which solver setting can push the calculation on through material softening to separation?

## Two solver setups

The archive kept both Static General and Dynamic Explicit solutions. After Static General enters the necking and damage stage, the negative stiffness from material softening makes the iterations hard to continue; its curve fit was $R^2=0.9595$. Dynamic Explicit does not rely on the same static iteration process and can keep computing through damage growth and element deletion; the reference run reached $R^2=0.9653$.

The displacement and damage settings in these two archives are not identical, so they cannot be treated as a single-variable sensitivity test that changed only the solver. And 0.9653 is only the result of that Explicit reference run — not the same calculation as the final M2 combination's 0.9663. We kept Explicit mainly because it can keep going through the post-peak softening and deletion stages, not because one $R^2$ proves it is generally better than Static.

<figure>
  <img src="/images/projects/xc48-abaqus-twin/static-vs-explicit-comparison.png" alt="Experimental true stress–strain curve compared with Static General and Dynamic Explicit numerical results" loading="lazy">
  <figcaption>Static vs Explicit comparison</figcaption>
</figure>

But switching to Explicit brings a new problem: a real tensile test loads slowly, while an explicit calculation can turn one pull into an impact. The next step was checking whether inertia had dominated the results.

## Explicit still has to pass a basic quasi-static check

We used kinetic energy `ALLKE` and internal energy `ALLIE` to check inertial effects. Smooth Step slows the velocity and acceleration changes at the start and end of loading; with a linear Ramp, the velocity builds up suddenly and excites an initial shock followed by oscillation; a sudden Step is more like slamming straight into the specimen.

In the Smooth Step run, `ALLKE/ALLIE` stayed at or below 5% before fracture, and the energy spike mainly appeared at fracture. It passes the basic quasi-static check used in this article, but that is not the same as having completed all explicit-dynamics validation.

<figure>
  <img src="/images/projects/xc48-abaqus-twin/smooth-step-energy-history.png" alt="Internal energy ALLIE and kinetic energy ALLKE histories in the Smooth Step explicit run" loading="lazy">
  <figcaption>Smooth Step energy history</figcaption>
</figure>

The loading method directly affects this check. The three amplitudes behaved like this:

| Loading | Result |
|---|---|
| Smooth Step | `ALLKE/ALLIE` at or below 5% before fracture |
| Linear Ramp | An initial shock and inertial oscillation appear |
| Sudden Step | The loading behaves close to an impact |

<figure>
  <img src="/images/projects/xc48-abaqus-twin/loading-amplitude-comparison.png" alt="Experimental curve compared with true stress–strain results from Smooth Step, Ramp and Step loading amplitudes" loading="lazy">
  <figcaption>Loading amplitude comparison</figcaption>
</figure>

So we kept Smooth Step in the final configuration. At this point, geometry, material, mesh, solver, and loading each had their own reason for being chosen, and only then could we go back to the full experimental curve.

## How much of the final curve actually matched

The final combination is M2 + Dynamic Explicit + Smooth Step, with $R^2=0.9663$ over the whole curve. Before the peak, the numerical curve follows the experiment's plastic hardening trend; the numerical true-stress peak is about 820 MPa versus the experimental 828.4 MPa, a difference of about 1%.

Past the peak, the specimen starts necking, damage grows, element deletion follows, and the numerical curve comes down with them. A visible gap remains here: the tail of the numerical curve falls more slowly and stays on the high side. So $R^2=0.9663$ means the curve as a whole is close, not that every segment overlaps. The agreement around the peak is good; the post-peak softening and fracture tail are only a trend-level reconstruction.

<figure>
  <img src="/images/projects/xc48-abaqus-twin/final-numerical-experimental-validation.png" alt="Final M2 Dynamic Explicit Smooth Step numerical curve versus the experimental true stress–strain curve, R-squared 0.9663" loading="lazy">
  <figcaption>Final numerical vs experimental curves</figcaption>
</figure>

## Summary

Looking back at this course project, we first corrected the specimen geometry and built the material data from the corrected experimental curve; then chose M2 from the curves, necking, stress concentration, and element deletion; then kept Explicit because it can keep computing through softening and fracture, and used Smooth Step to control the loading shock. Finally we put the numerical curve back against the experimental baseline and looked separately at hardening, the peak, and the post-peak decline.

This result comes with many limits: it comes from one test on one specimen, with no repeatability interval, and the damage parameters were taken from that same curve. The low modulus means part of the fit comes from testing-machine and grip compliance; the Learning Edition of Abaqus also limited the mesh size.

But after this course, we knew why the specimen breaks under these settings, and we knew which parts of the curve can be trusted and which still need judgement kept in reserve. It was still a very good hands-on run at an Abaqus digital twin.
