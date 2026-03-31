---
title: 'How We Rebuilt a Tensile Test as an Abaqus Digital Twin'
year: 2026
date: '2026-04-04'
status: complete
categories: [validation, design]
tags: [FEA]
summary: 'From a physical tensile test to an Abaqus sensitivity study: after correcting the specimen dimensions, M2 + Dynamic Explicit + Smooth Step reproduced the measured curve with R²=0.9663.'
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

## Starting with the physical test

The assignment began with a uniaxial tensile test of XC48 steel. We calculated engineering and true stress–strain curves, transferred the same material data into Abaqus, and then compared meshes, solvers, and loading amplitudes. The goal was not merely to break the model, but to reproduce the measured hardening, necking, and post-peak decline.

<figure>
  <img src="/images/projects/xc48-abaqus-twin/source/teacher-handout-tensile-machine.png" alt="Tensile-testing machine, grips, and dog-bone specimen shown in the teacher handout" loading="lazy">
  <figcaption>Teacher handout: the machine records load and elongation until failure.</figcaption>
</figure>

<figure>
  <img src="/images/projects/xc48-abaqus-twin/source/teacher-handout-specimen-geometry.png" alt="Teacher-handout diagram labelling overall length, shoulder distance, gauge length, and reduced section on a dog-bone specimen" loading="lazy">
  <figcaption>Teacher handout: overall length, gauge length, and reduced section must remain distinct.</figcaption>
</figure>

## Why we rejected the first curves

TP1 and TP2 retain the same 1,129-point source data; they are not repeat tests. The first pass used placeholder geometry: a 10 mm diameter and 50 mm gauge length. The script ran cleanly but produced an engineering peak of 489.09 MPa and a true-stress peak of 545.68 MPa. These plots document an early pass and are not retained as XC48 properties.

$$
\varepsilon=\frac{\Delta L}{L_0},\qquad
\sigma=\frac{F}{A_0},\qquad
\varepsilon_T=\ln(1+\varepsilon),\qquad
\sigma_T=\sigma(1+\varepsilon)
$$

<figure>
  <img src="/images/projects/xc48-abaqus-twin/initial-tp-engineering-stress-strain.png" alt="Early engineering stress-strain curve calculated with a 10 mm diameter and 50 mm placeholder gauge length, peaking at 489.09 MPa" loading="lazy">
  <figcaption>The 489.09 MPa peak from placeholder geometry is not a retained material result.</figcaption>
</figure>

<figure>
  <img src="/images/projects/xc48-abaqus-twin/initial-tp-true-stress-strain.png" alt="Early true stress-strain curve converted from the same source data with placeholder geometry, peaking at 545.68 MPa" loading="lazy">
  <figcaption>The 545.68 MPa curve is an early true-stress conversion of the same test.</figcaption>
</figure>

The verified reduced-section dimensions were $L_0=70$ mm and $S_0=50.14$ mm², corresponding to a 7.99 mm diameter. Correcting the stress and strain denominators moved engineering UTS from 489.09 MPa to 766.12 MPa and gave a true-stress peak of 828.4 MPa.

<figure>
  <img src="/images/projects/xc48-abaqus-twin/geometry-correction.svg" alt="Comparison of placeholder and verified specimen dimensions showing engineering UTS changing from 489.09 MPa to 766.12 MPa" loading="lazy">
  <figcaption>Corrected dimensions moved engineering UTS from 489.09 MPa to 766.12 MPa.</figcaption>
</figure>

## The retained experimental results

| Quantity | Value | Note |
|---|---:|---|
| Young's modulus | 12.28 GPa | Affected by machine and grip compliance |
| 0.2% offset yield strength | 758.33 MPa | Corrected result |
| Engineering UTS | 766.12 MPa | At 7.6% engineering strain |
| True peak stress | 828.4 MPa | Recomputed from corrected data |
| Breaking strength | 557.80 MPa | Before the final load drop |
| Fracture strain | 13.4% | Engineering strain |
| Necking | Ø7.99 → 5.77 mm | 47.8% reduction in area |

The 12.28 GPa modulus is far below the typical steel value of about 210 GPa because crosshead displacement includes deformation of the machine frame and grips. The model inherits this soft measured slope, so a high $R^2$ does not independently validate the constitutive law.

## How the Abaqus model used the test data

The material card used $E=12{,}283.5$ MPa, $\nu=0.3$, Smooth Step loading, ductile damage, 0.5 mm displacement-based damage evolution, and element deletion. The complete dog-bone specimen used C3D4 tetrahedral elements.

<figure>
  <img src="/images/projects/xc48-abaqus-twin/abaqus-baseline-meshed-specimen.png" alt="Baseline C3D4 tetrahedral mesh of the complete dog-bone tensile specimen in Abaqus" loading="lazy">
  <figcaption>The complete dog-bone specimen uses a C3D4 tetrahedral mesh.</figcaption>
</figure>

The numerical specimen radius was 3.838 mm, compared with 3.995 mm physically, making the modelled area about 8% smaller. This mismatch remains relevant beside the final peak difference of about 1%.

## Why M2 beat the finer M3 mesh

<figure>
  <img src="/images/projects/xc48-abaqus-twin/m2-global-seed-settings.png" alt="Abaqus Global Seeds dialog with an approximate global size of 4.5 and curvature control enabled" loading="lazy">
  <figcaption>The global seed size is 4.5 with curvature control enabled.</figcaption>
</figure>

| Mesh | Elements | $R^2$ | Main behaviour |
|---|---:|---:|---|
| Baseline mesh | Learning Edition limit | 0.9308 | Continued hardening after the peak |
| M1 | Fewer than 1,000 | 0.9653 | Strain concentrated in few elements |
| M2 | About 2,000 | **0.9663** | Captured necking and post-peak decline |
| M3 | About 3,000 | 0.9497 | Excessive localisation |

<figure>
  <img src="/images/projects/xc48-abaqus-twin/abaqus-m1-von-mises-result.png" alt="Deformed M1 mesh, Von Mises stress contour, and separated specimen in the final Abaqus output frame" loading="lazy">
  <figcaption>M1 concentrates strain and reaches specimen separation in the final frame.</figcaption>
</figure>

<figure>
  <img src="/images/projects/xc48-abaqus-twin/abaqus-m2-von-mises-fracture-stage.png" alt="Necked and deformed M2 mesh with a Von Mises stress contour at the Abaqus fracture stage" loading="lazy">
  <figcaption>M2 captures necking, stress redistribution, and element separation.</figcaption>
</figure>

<figure>
  <img src="/images/projects/xc48-abaqus-twin/abaqus-m3-von-mises-result.png" alt="Denser M3 tetrahedral mesh with deformation and a Von Mises stress contour in the final Abaqus output frame" loading="lazy">
  <figcaption>M3 is finer, but damage localisation reduces its fit quality.</figcaption>
</figure>

<figure>
  <img src="/images/projects/xc48-abaqus-twin/mesh-r2-comparison.png" alt="Baseline, M1, M2, and M3 mesh fits compared with the experimental true stress-strain curve" loading="lazy">
  <figcaption>M2 gives the highest fit at R²=0.9663.</figcaption>
</figure>

Element deletion makes mesh refinement change the timing of damage initiation. M2 resolves the neck without concentrating strain into as few elements as M3, so finer did not mean more accurate here.

## Why we chose Dynamic Explicit and Smooth Step

Static General struggled once necking and damage introduced negative stiffness, producing $R^2=0.9595$. The reference Dynamic Explicit run continued through damage growth and element deletion and reached $R^2=0.9653$; the final M2 combination's 0.9663 is a separate result.

<figure>
  <img src="/images/projects/xc48-abaqus-twin/static-vs-explicit-comparison.png" alt="Experimental true stress-strain curve compared with Static General and Dynamic Explicit numerical results" loading="lazy">
  <figcaption>Static gives 0.9595; the reference Dynamic Explicit run gives 0.9653.</figcaption>
</figure>

The explicit run also had to remain quasi-static: before fracture, kinetic energy ALLKE stayed at or below 5% of internal energy ALLIE.

<figure>
  <img src="/images/projects/xc48-abaqus-twin/smooth-step-energy-history.png" alt="Internal energy ALLIE and kinetic energy ALLKE histories for the Smooth Step Explicit run" loading="lazy">
  <figcaption>ALLKE/ALLIE stays at or below 5% before the fracture spike.</figcaption>
</figure>

| Loading amplitude | Result |
|---|---|
| Smooth Step | Kinetic energy remained near zero during loading |
| Linear Ramp | Introduced an initial shock and inertial oscillations |
| Sudden Step | Was kinetic-energy dominated from the first increment |

<figure>
  <img src="/images/projects/xc48-abaqus-twin/loading-amplitude-comparison.png" alt="Experimental curve compared with Smooth Step, Ramp, and Step loading-amplitude results" loading="lazy">
  <figcaption>Smooth Step avoids the inertial bias from abrupt loading.</figcaption>
</figure>

## Final fit and limitations

M2 + Dynamic Explicit + Smooth Step reached $R^2=0.9663$. The numerical true-stress peak was about 820 MPa, compared with the experimental 828.4 MPa, a difference of about 1%.

<figure>
  <img src="/images/projects/xc48-abaqus-twin/final-numerical-experimental-validation.png" alt="Final M2 Dynamic Explicit Smooth Step numerical curve compared with the experimental true stress-strain curve at R-squared 0.9663" loading="lazy">
  <figcaption>The final model reproduces hardening, the peak, and post-peak decline.</figcaption>
</figure>

This remains one test on one specimen, with no repeatability interval, and the damage parameters came from the same curve. Abaqus Learning Edition limited mesh size, leaving convergence beyond M3 unknown. The low modulus means part of the fit reflects testing-machine compliance, while the available material has no clear physical fracture-surface photograph; the animation therefore shows numerical response, not direct fractography.
