---
title: 'How I Rebuilt a Tensile Test as an Abaqus Digital Twin'
year: 2026
date: '2026-04-04'
status: complete
categories: [validation, design]
tags: [FEA]
summary: 'In this four-person course project, I handled the test data, material card, ODB post-processing, and report toolchain. After correcting the specimen dimensions, the final M2 + Dynamic Explicit + Smooth Step model reproduced the measured curve with R²=0.9663, although the low measured modulus and single-specimen calibration limit the conclusions.'
role: 'Data post-processing & report toolchain'
team: 'ESILV MMN1 group — Nicolas Chang, Bing Gao, Sabin Karn, Nithor Bhowmik'
duration: '8 weeks'
academic:
  institution: 'ESILV'
  course: 'Materials and Behavior'
  assignment: 'XC48 tensile experiment and Abaqus numerical reconstruction'
  note: 'An eight-week Materials and Behavior project at ESILV, completed with Nicolas Chang, Sabin Karn, and Nithor Bhowmik. The group ran the physical tensile test and built the Abaqus models; I handled the data side — the Python pipeline from raw machine output to the material card, the ODB post-processing, and the report toolchain.'
  requirements:
    - 'Run and post-process an XC48 uniaxial tensile test through fracture.'
    - 'Derive engineering, true, and plastic stress–strain data and identify material properties.'
    - 'Build an Abaqus model of the specimen and compare the simulation with the measured curve.'
    - 'Study mesh, solver, and loading-amplitude sensitivity and explain the selected setup.'
  media:
    - src: '/images/projects/xc48-abaqus-twin/source/laboratory-handout-summary.webp'
      alt: 'Page from the submitted XC48 report summarising the laboratory worksheet, raw data, and specimen sketch'
      caption: 'The original assignment sheet is not preserved separately in the current archive; the submitted report reproduces its main laboratory panels. This page also retains the overall-length, diameter, and yield-strength transcription errors later corrected by the data pipeline, so it documents both the coursework and the source of the mistakes.'
    - src: '/images/projects/xc48-abaqus-twin/geometry-correction.svg'
      alt: 'Placeholder and validated specimen dimensions with the resulting UTS values'
      caption: 'The first data pass was internally consistent but used placeholder geometry. Correcting the diameter and gauge length moved UTS from 489 to 766 MPa.'
    - src: '/images/projects/xc48-abaqus-twin/assignment-workflow.svg'
      alt: 'Workflow from the tensile experiment through material data reduction to Abaqus comparison'
      caption: 'The work was a complete chain rather than a single solve: run the test, correct the geometry, derive true and plastic data, build the material card, and then review the mesh and solver choices.'
    - src: '/images/projects/xc48-abaqus-twin/solver-comparison.svg'
      alt: 'R-squared comparison across four meshes and the Static General solver'
      caption: 'The medium-density M2 mesh produced the best retained fit. Increasing the mesh density or using a nominally simpler static solve did not improve agreement.'
featured: false
order: 19
studySequence: 11
heroImage: /images/projects/xc48-abaqus-twin/stress-strain.svg
---

## The project began with a physical test

We first pulled an XC48 medium-carbon steel specimen in uniaxial tension through necking and fracture. We then converted the measured curve into Abaqus material data and tried to reproduce the experiment numerically.

This was an eight-week course project completed by a four-person group. We ran the test and built the Abaqus models together. I handled the data work: the raw machine output, stress–strain conversion, material card, ODB post-processing, and report toolchain.

The retained configuration was an M2 mesh with Dynamic Explicit and Smooth Step loading. It matched the experimental curve with $R^2=0.9663$.

## My first wrong curve looked perfectly clean

The testing machine recorded 1,129 data points containing time, crosshead displacement, and force. The peak load was 38.41 kN.

I calculated engineering strain and stress as

$$
\varepsilon=\frac{\Delta L}{L_0},\qquad
\sigma=\frac{F}{A_0}
$$

and then converted them into true stress, true strain, and plastic strain data for Abaqus.

My first script used placeholder dimensions: a 10 mm diameter and a 50 mm gauge length. The entire pipeline ran successfully and produced a plausible-looking curve with a UTS of 489.09 MPa.

The error was hidden in the denominator. The test spreadsheet gave the actual reduced-section dimensions as $L_0=70$ mm and $S_0=50.14$ mm², corresponding to a diameter of 7.99 mm. After I corrected those values, the UTS became 766.12 MPa.

That failure showed me that a smooth curve does not prove that its inputs are correct. I now print the gauge length and cross-sectional area beside the results so they can be checked before interpreting the curve.

## What the experiment measured

| Quantity | Value | Note |
|---|---:|---|
| Young's modulus | 12.28 GPa | Affected by machine and grip compliance |
| 0.2% offset yield strength | 758.33 MPa | Previously printed as “7583” in the report |
| Engineering UTS | 766.12 MPa | At 7.6% engineering strain |
| True peak stress | 828.4 MPa | At 8.2% true strain |
| Breaking strength | 557.80 MPa | Immediately before the final load drop |
| Fracture strain | 13.4% | Engineering strain |
| Necking | Ø7.99 → 5.77 mm | 47.8% reduction in area |

The UTS and reduction in area are reasonable for a ductile steel, but the measured modulus of 12.28 GPa is far below the typical value of about 210 GPa for steel.

The strain was calculated from crosshead displacement, which includes deformation from the testing machine and grips. The low modulus therefore reflects the test setup more than the XC48 material itself. To match the measured curve, the digital twin inherited this slope, so part of the final $R^2$ represents a fit to a measurement artifact.

## How I built the Abaqus model

The model used the complete dog-bone specimen with C3D4 tetrahedral elements. One end was fixed, and the other was displaced by 15 mm over 1 s.

The material card came from the measured curve rather than an idealised handbook law. It used $E=12{,}283.5$ MPa, $\nu=0.3$, true plastic data, and ductile damage initiation at an equivalent plastic strain of 0.0821.

Damage evolution was displacement-based over 0.5 mm, with element deletion enabled. This allowed the model to pass through necking, post-peak softening, and final separation.

My ODB script read 200 field-output frames, selected the 70 mm gauge section, integrated the reaction force at the loaded end, and generated engineering and true stress–strain curves.

The script also revealed a geometric mismatch. The numerical specimen had a radius of 3.838 mm, while the physical specimen radius was 3.995 mm, making the modelled cross-sectional area about 8% smaller. The simulated peak was still within 1% of the experiment, but the difference remains part of the model record.

## The finest mesh did not produce the best result

| Mesh | Elements | $R^2$ | Main behaviour |
|---|---:|---:|---|
| Baseline mesh | Learning Edition limit | 0.9308 | No damage softening; continued hardening after the peak |
| M1 | Fewer than 1,000 | 0.9653 | Strain concentrated in a small number of elements |
| M2 | About 2,000 | **0.9663** | Captured necking and the post-peak drop |
| M3 | About 3,000 | 0.9497 | Excessive localisation and the smallest stable time increment |

M2 gave the best balance between resolving the neck and avoiding excessive localisation in distorted elements. M3 was finer and more expensive, but it moved farther away from the experimental curve.

![Fit results for the four mesh configurations against the experimental curve](/images/projects/xc48-abaqus-twin/mesh-r2-comparison.png)

This result showed that “keep refining until the result improves” does not necessarily work for damage and element-deletion problems. Mesh density, damage regularisation, and localisation behaviour have to be considered together.

## Why Static General did not complete the softening branch

Static General lost a stable Newton–Raphson path after necking and damage introduced negative stiffness. Its true-stress curve reached a plateau near 795 MPa and ended at a true strain of about 0.13, producing $R^2=0.9595$.

Dynamic Explicit does not invert a stiffness matrix at every increment. It could continue through damage and element deletion, allowing the model to follow the post-peak drop and reach final fracture.

The physical experiment was quasi-static, but the fracture process itself was unstable. That made the explicit solver better suited to this particular assignment.

The retained records also show that the Static and Explicit runs used the same elastic–plastic material data. The Static model did not include damage or element deletion, so its plateau came from the different solution path rather than a changed base material curve.

## The Explicit run still had to remain quasi-static

I checked inertia using an energy criterion: during loading, kinetic energy ALLKE had to remain below 5% of internal energy ALLIE.

| Loading amplitude | Result |
|---|---|
| Smooth Step | ALLKE remained close to zero during loading and showed a physical spike only at fracture |
| Linear Ramp | Produced an initial shock, inertial oscillations, and premature failure |
| Sudden Step | Became dominated by kinetic energy from the first increment and no longer represented quasi-static tension |

Smooth Step has zero velocity and acceleration at both ends, so I retained it. The kinetic-energy spike at fracture came from the release of stored elastic energy rather than an impact introduced by the loading function.

## What the final model reproduced

The final M2 + Dynamic Explicit + Smooth Step model reached $R^2=0.9663$ against the experiment. Its peak true stress was about 820 MPa, compared with 828 MPa experimentally, a difference of about 1%.

The model reproduced the start of necking, post-peak softening, and final fracture. The `.sta` file recorded 71,965 increments, a stable increment of about 13.8 µs, and a wall-clock time of 77 s.

![Necked shape of the M2 model at fracture](/images/projects/xc48-abaqus-twin/m2-necking-deformed.png)

The clearest remaining difference is that the simulation stays slightly stiffer than the experiment during the final fracture stage.

## The failures and data problems I kept visible

The 489 MPa result from the placeholder geometry was not the only data problem. A report draft used the specimen's 114.23 mm overall length as its gauge length and printed the yield strength as 7583304756 MPa. The submitted version still showed “7583.” The correct yield strength is 758.33 MPa.

These errors came from copying values manually instead of recalculating them. My correction was to make the geometry and key material values enter the scripts from the same spreadsheet source.

The clean but incorrect first curve was especially useful. It demonstrated that a calculation can remain internally consistent while answering the wrong physical problem.

## What this digital twin cannot establish

Only one specimen was tested once, so there is no repeatability range or scatter band. The damage parameters were calibrated against that same curve, which means the validation applies only to this geometry and loading rate.

The Abaqus Learning Edition limited the available mesh size, so convergence beyond M3 remains unknown.

The report did not preserve photographs of the fracture surface. The ductile-fracture interpretation therefore rests on the measured 47.8% reduction in area, the experimental curve, and the simulated necking rather than direct fractography.

The most important limitation is the low measured modulus. The model reproduces the recorded curve well, but some of that agreement comes from testing-machine compliance. The plastic and post-peak regions provide more meaningful validation than the elastic slope.

## What I learned

Stress is force divided by an area that someone entered. The wrong area can still produce a neat, convincing curve, so I now display and verify the key geometry before beginning the analysis.

M3 losing to M2 also stopped me from treating a finer mesh as an automatic improvement. For damage, localisation, and element deletion, I need to consider physical behaviour, regularisation, and computational cost together.

Finally, I learned to check the `.sta` file and ODB before trusting the CAE model tree. A model can look complete in the interface without having run a single increment.
