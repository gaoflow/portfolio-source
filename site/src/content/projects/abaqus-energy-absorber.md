---
title: 'How I Used Abaqus to Compare Materials and Energy-Absorber Structures'
year: 2026
date: '2026-03-28'
status: complete
categories: [design, validation]
tags: [FEA]
summary: 'In this four-person course project, I ran the wall-impact study and assembled the final report. Our results favoured aluminium in the material screening, while the FGT multi-cell structure absorbed 95.6% of the initial kinetic energy and reached 2.56 times the classic section''s SEA. It was also nearly four times heavier, and the study still lacked a mesh-convergence check.'
role: 'Wall-impact study & report assembly'
team: 'ESILV MMN1 group — Nicolas Chang, Daphné Baray, Bing Gao, Immanuella Castro'
duration: '6 weeks'
academic:
  institution: 'ESILV'
  course: 'Computational Solid Mechanics'
  assignment: 'Dynamic impact and optimization of an automotive energy absorber'
  note: 'A six-week Computational Solid Mechanics project at ESILV, completed in a group of four with Nicolas Chang, Daphné Baray and Immanuella Castro. My teammates ran the preliminary crush, material screening, barrier crash and FGT geometry jobs; I ran the wall-impact study and assembled the final report. Every number shown here traces to that report.'
  requirements:
    - 'Model the axial impact of a longitudinal front rail in Abaqus/Explicit.'
    - 'Extract and interpret the force–displacement response and energy balance.'
    - 'Compare candidate materials using peak force, absorbed energy, SEA and CFE.'
    - 'Modify the geometry to improve crashworthiness while controlling numerical artifacts.'
  media:
    - src: '/images/projects/abaqus-energy-absorber/source/submitted-report-cover.webp'
      alt: 'Cover and abstract of the submitted ESILV Computational Solid Mechanics group report'
      caption: 'The course archive does not contain a separately preserved assignment PDF, so this is the cover and abstract of the report we submitted. It records the team, scope, 95.6% absorption result and final recommendation without presenting a later workflow diagram as the original assignment brief.'
    - src: '/images/projects/abaqus-energy-absorber/assignment-workflow.svg'
      alt: 'Workflow from baseline crush through material screening and geometry redesign'
      caption: 'We moved from a baseline crash to material screening, a realistic barrier case, the wall-impact study and finally the FGT redesign.'
    - src: '/images/projects/abaqus-energy-absorber/material-screening.svg'
      alt: 'Peak force and absorbed energy comparison for steel aluminium and magnesium absorbers'
      caption: 'The first decision was material selection: aluminium reduced peak force while retaining much more energy absorption than magnesium.'
    - src: '/images/projects/abaqus-energy-absorber/geometry-comparison.svg'
      alt: 'Specific and total absorbed energy for classic uniform and functionally graded absorber geometries'
      caption: 'The uniform redesign did not meet the target. The FGT multi-cell concept was the only geometry that substantially increased both SEA and total absorbed energy.'
featured: false
order: 18
studySequence: 10
heroImage: /images/projects/abaqus-energy-absorber/force-displacement-preliminary.png
---

## What we were trying to improve

A thin-walled front rail must absorb energy during a frontal collision. The design needs to absorb more energy per unit mass without creating an excessive initial force peak, which would expose occupants to greater deceleration.

This was a six-week course project completed by a four-person team. My teammates handled the preliminary crush analysis, material screening, barrier crash and FGT geometry simulations. I ran a separate wall-impact study and assembled the final report.

We based every comparison on three metrics:

- specific energy absorption, $SEA=E/M$, which should be as high as possible;
- peak crush force, $F_{max}$, which should be as low as possible;
- crash force efficiency, $CFE=F_{mean}/F_{max}$, where a higher value indicates a flatter and more controlled force plateau.

## How we set up the Abaqus models

We used the mm–tonne–s unit system and Abaqus/Explicit. The reference absorber was a 931.6 mm-long, 220.6 mm-wide and 50 mm-high thin-walled hat section.

The main dynamic case used a 1000 kg rigid impactor travelling at 30 km/h. We used hard contact with a friction coefficient of 0.3 and an analysis time of 0.06 s.

The force–displacement curve directly represented the design objective: reduce the first force peak, make the following crush plateau more stable and increase the area under the curve. That area is the absorbed work:

$$
W=\int F\,dx.
$$

## We first selected the material

The team compared steel, aluminium and magnesium under the same loading conditions:

| Metric | Steel | Aluminium | Magnesium |
|---|---:|---:|---:|
| Density (kg/m³) | 7850 | 2500 | 1800 |
| Peak force (kN) | 212.4 | 132.9 | 83.7 |
| Absorbed energy (kJ) | 64.9 | 50.4 | 31.0 |
| CFE | 36% | 37% | 23% |

Steel absorbed the most total energy, but its mass was about three times that of aluminium. On a mass-normalized basis, aluminium was about 2.4 times as efficient as steel and approximately 17% more efficient than magnesium.

Magnesium produced the lowest peak force, but it folded too early and could sustain a plateau force of only about 70 kN. After balancing peak force, total absorbed energy and mass, we selected aluminium for the later models.

## The barrier case established a reference

The reference aluminium absorber had a mass of 0.70 kg and contained 405 deformable solid elements. A 1000 kg rigid wall struck it at 30 km/h, giving an initial kinetic energy of 34.72 kJ.

By the end of the analysis, total energy remained at $34.70\pm0.02$ kJ. The absorber crushed by 241.8 mm, while its internal energy increased by 11.95 kJ. This gives an average crush force of approximately 49.4 kN:

$$
F_{\text{mean}}
=
\frac{11\,952\,000\ \mathrm{N\cdot mm}}
{241.8\ \mathrm{mm}}
\approx 49.4\ \mathrm{kN}.
$$

The final reference values were an SEA of 17.07 kJ/kg and a CFE of 68.0%. These became the results that later structural changes needed to exceed.

## My wall-impact study

I used a different loading case to compare steel, Al 6061, Ti-6Al-4V and polypropylene. A 500 kg rigid impactor struck the same absorber concept at 50 km/h.

The polypropylene simulation developed contact instability. I therefore excluded it from the force-metric table and retained only its energy history.

| Material | Mass (kg) | $F_{max}$ (kN) | CFE | SEA (kJ/kg) | Crush stroke (mm) |
|---|---:|---:|---:|---:|---:|
| Steel | 2.73 | 185 | 95.2% | 17.3 | 268 |
| Al 6061 | 0.94 | 102 | 60.5% | 50.8 | 774 |
| Ti-6Al-4V | 1.54 | 249 | 92.5% | 27.9 | 186 |

Steel and titanium produced very flat crush plateaus, but their peak forces reached 185–249 kN. Al 6061 had the lowest peak force and the highest SEA, which independently supported aluminium as the preferred candidate.

The trade-off was its 774 mm crush stroke. Aluminium absorbed energy through a much longer deformation distance, and a real vehicle might not have enough packaging space for that travel.

## Making the thickness uniform made the design worse

In the final stage, the team kept aluminium and compared three cross-sectional layouts:

| Metric | Classic section | Uniform 1.0 mm | FGT multi-cell |
|---|---:|---:|---:|
| Mass (kg) | 0.727 | 0.683 | 2.70 |
| Absorbed energy (kJ) | 3.5 | 2.8 | 33.20 |
| SEA (kJ/kg) | 4.81 | 4.09 | 12.30 |
| CFE | 36% | 24% | Not calculated |
| Residual kinetic energy | ≈90% | ≈92% | 4.4% |

The uniform 1.0 mm section was slightly lighter, but it performed worse than the classic asymmetric section in absorbed energy, SEA and CFE. Distributing the material evenly did not make the structure safer.

The FGT layout instead concentrated thickness around the corners and ribs where plastic hinges were likely to form. Under the same 30 km/h loading condition, it absorbed 33.20 kJ, or 95.6% of the initial kinetic energy. Its SEA reached 12.30 kJ/kg, which was 2.56 times the classic section's value.

![Energy history for the FGT simulation](/images/projects/abaqus-energy-absorber/fgt-energy-balance.png)

![Impactor displacement and crushing response for the FGT simulation](/images/projects/abaqus-energy-absorber/fgt-displacement-history.png)

## We had to correct conflicting model results

The first model version looked complete in the Abaqus/CAE model tree, but the input processor stopped because 328 elements had no assigned properties. It completed zero increments.

In the second version, the team rebuilt the complete model with C3D8R elements. Only then did the four material simulations run successfully. The third version changed the setup to the rigid-wall case.

An early aluminium model also produced artificial energy equal to about 15% of its internal energy, which was high enough to be a warning. In the recalculated results included in the submitted report, this ratio fell below 1%.

The FGT result also changed between the working notes and the final submission. The notes initially recorded a mass of 3.397 kg, an SEA of 9.71 kJ/kg and a peak force of 280 kN. The submitted report instead recorded a mass of 2.70 kg, an SEA of 12.30 kJ/kg and absorption of 95.6% of the initial kinetic energy. I use only the final report's second set of results here.

This correction process taught me that a populated model tree does not prove that a job ran, and a number in a draft does not automatically belong to the final model. Checking the `.sta` file, ODB and the specific job that generated each result was more reliable than relying on filenames.

## Why the higher absorption does not finish the design

The FGT structure weighed 2.70 kg, compared with 0.727 kg for the classic section, so it was nearly four times heavier. Its SEA was higher, but its absolute mass and mean crush force also increased substantially. The report did not calculate its CFE.

The barrier reference and geometry-optimization studies also used different cross-sections. Their absolute SEA values therefore cannot be treated as a like-for-like comparison.

Each study used only one velocity and one mesh, with no mesh-convergence study. The explicit force curves were also affected by mass scaling and high-frequency oscillation. The 95.6% result does not support conclusions more precise than the current model resolution allows.

## What I retained from the project

Material selection and structural geometry cannot be separated. Aluminium won after normalizing the results by mass, but the large increase in absorbed energy came from changing where the material was placed within the cross-section.

The most useful failure was the uniform 1.0 mm section. It looked simpler and more conservative, yet it performed worse than the classic section in every main metric we calculated.

The next step should be to optimize the FGT gradient under a fixed-mass constraint, then repeat the analysis with mesh refinement and multiple impact velocities. Only those checks can show whether the added structural complexity produces a stable benefit.
