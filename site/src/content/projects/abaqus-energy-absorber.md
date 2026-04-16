---
title: 'Crash Analysis of a Car Front Rail in Abaqus'
year: 2026
date: '2026-03-28'
status: complete
categories: [design, validation]
tags: [FEA]
summary: 'Starting from a car front rail, we first learned to read impact curves, then compared materials, impact cases, and section thicknesses. The results include models that would not run, and designs that looked good at absorbing energy but were too heavy or peaked too high.'
role: 'Shared modelling, results analysis and report writing'
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
heroImage: /images/projects/abaqus-energy-absorber/assignment-front-rail.jpeg
---

This is my lab record from the Computational Solid Mechanics course in the spring 2026 semester.

## Why the front rail matters

In a frontal collision, the front rail is bent and wrinkled first, then folds up layer by layer. The metal goes from its original shape to a shape it cannot return from, and part of the car's kinetic energy turns into permanent deformation. Our Computational Solid Mechanics course project asked us to research the front rail, and to treat it as the part that carries about half the kinetic energy in a frontal crash. The teacher gave us a very open task, with a few directions to explore:
- simulate the dynamic impact of the front rail;
- learn modelling and result-reading from the curved-beam case;
- start from the given STEP geometry;
- plot the force–displacement curve;
- and finally try different shapes.

The teacher did not fix the material, velocity, impactor mass, mesh, or how many variants to run. Those were for us to decide. And the question we wanted to answer was just as direct: how do you make the rail keep folding, take in more kinetic energy, and still not produce too high a force at the first hit?

## Getting the model onto one scale

The rail given by the course is 1000 mm long. The baseline hat section is 100 mm wide, with a 59 mm inner span, a total height of 51.2 mm, and 20.5 mm flanges; the hat is 1.2 mm thick and the closing plate is 0.8 mm thick. The later changes (making both 1.0 mm, or thickening the corners) all vary from this baseline.

<figure>
  <img src="/images/projects/abaqus-energy-absorber/baseline-geometry-dimensions.png" alt="Baseline rail length, section dimensions and 1.2/0.8 mm wall thicknesses" loading="lazy">
  <figcaption>Baseline dimensions</figcaption>
</figure>

The model uses the mm–tonne–s unit system. Length in mm, force in N, mass in tonnes, time in s, stress in MPa. The easiest place to misread this unit system is energy: Abaqus outputs N·mm, not J.

| Quantity | Unit |
|---|---|
| Length | mm |
| Force | N |
| Mass | tonne |
| Time | s |
| Stress | MPa, i.e. N/mm² |
| Energy | N·mm |

$$
1\times10^6\ \text{N·mm}=1\ \text{kJ}.
$$

The area under the force–displacement curve is the work done:

$$
W=\int F\,dx.
$$

So the $3.5\times10^6$ N·mm on the plot means 3.5 kJ, and must not be written as $3.5\times10^6$ J.

With the dimensions and units sorted out, we started the first round of models and quickly ran into missing properties.

## Round one

### The problem we found: 328 elements in the model tree had no properties

When we got the model file, we found 328 elements had no material or section properties assigned. Abaqus stopped at the input check, so there was no usable impact run at all. This failure was basic, but useful. Parts, a mesh, and a job in the model tree do not mean the solve really started. So from then on, before every submission, we first checked whether section assignment had missed any elements.

### Early baseline

The early baseline velocity was 13,888 mm/s, about 50 km/h.

<figure>
  <img src="/images/projects/abaqus-energy-absorber/early-baseline-energy.png" alt="Kinetic and internal energy of the early baseline over 0.02 s" loading="lazy">
  <figcaption>Energy</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/early-baseline-displacement.png" alt="Early-baseline impactor displacement falling almost linearly with time" loading="lazy">
  <figcaption>Displacement</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/early-baseline-reaction-force.png" alt="Early-baseline support reaction force rising quickly after contact, with oscillations" loading="lazy">
  <figcaption>Reaction force</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/early-baseline-force-displacement-raw.png" alt="Unsmoothed early-baseline force–displacement curve" loading="lazy">
  <figcaption>Raw force–displacement</figcaption>
</figure>

For the first 0.005 s the impactor had not yet pressed onto the rail, so the reaction force stayed near zero. After contact there was first a spike of about 100 kN; then the rail kept folding and the reaction force rose while oscillating, reaching 137.6 kN at about 0.0199 s. The impactor travelled about 270 mm in 0.02 s, and the displacement is almost a straight line, which means the velocity had not come down noticeably during that time.

The raw force curve has a lot of high-frequency sawtooth. Explicit solving, contact, stress waves, and mass scaling all bring this kind of oscillation into the results. We kept the raw plot to see instantaneous peaks and used the smoothed plot to see the overall plateau. You cannot just pick the better-looking curve.

<figure>
  <img src="/images/projects/abaqus-energy-absorber/force-displacement-preliminary.png" alt="Smoothed early-baseline force–displacement curve" loading="lazy">
  <figcaption>Smoothed force–displacement</figcaption>
</figure>

After filling in the missing section properties, we moved on to the V2 exploration.

## Round two: exploring materials

V2 brought the model up to 393 C3D8R elements and 902 nodes; the velocity was still 13,888 mm/s, the analysis time was extended to 0.04 s, and the contact friction coefficient was 0.3. Four jobs were completed in total.

Steel first: the impactor moved about 500 mm within 0.04 s, and the reaction force rose to about 190 kN; as kinetic energy fell, internal energy rose with it.

<figure>
  <img src="/images/projects/abaqus-energy-absorber/steel-displacement-history.png" alt="V2 steel model impactor displacement over time" loading="lazy">
  <figcaption>Steel: displacement</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/steel-reaction-force-history.png" alt="V2 steel model reaction force rising over time to about 190 kN" loading="lazy">
  <figcaption>Steel: reaction force</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/steel-energy-history.png" alt="V2 steel model energy curves with kinetic energy falling and internal energy rising" loading="lazy">
  <figcaption>Steel: energy</figcaption>
</figure>

Aluminium peaked lower, at about 115 kN. In the plots, the stress concentrates in the bending and folding regions, exactly where a thin-walled part absorbs energy through local buckling.

<figure>
  <img src="/images/projects/abaqus-energy-absorber/aluminium-displacement-history.png" alt="V2 aluminium model impactor displacement over time" loading="lazy">
  <figcaption>Aluminium: displacement</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/aluminium-reaction-force-history.png" alt="V2 aluminium model reaction force forming a plateau of about 100 kN after contact" loading="lazy">
  <figcaption>Aluminium: reaction force</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/aluminium-energy-numerical-quality.png" alt="V2 aluminium model artificial and internal energy curves" loading="lazy">
  <figcaption>Aluminium: artificial energy</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/aluminium-energy-history.png" alt="V2 aluminium model kinetic, internal and artificial energy curves" loading="lazy">
  <figcaption>Aluminium: total energy</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/aluminium-mises-impact.png" alt="Mises stress distribution in the bent V2 aluminium rail" loading="lazy">
  <figcaption>Aluminium: Mises stress</figcaption>
</figure>

With steel and aluminium drawn on the same force–displacement plot, steel peaks at about 190 kN and aluminium at about 115 kN. The work integrated from the curves is roughly 58 and 46 kJ. Steel's density is 7850 kg/m³ and aluminium's is 2500 kg/m³; if the geometric volume is the same and you convert mass through density, aluminium's SEA is about 2.48 times steel's. Steel absorbed more absolute energy; aluminium did a fair part of the work with much less mass.

<figure>
  <img src="/images/projects/abaqus-energy-absorber/steel-aluminium-force-comparison.png" alt="Overlaid V2 steel and aluminium force–displacement curves" loading="lazy">
  <figcaption>Steel / aluminium</figcaption>
</figure>

Some values read from the energy plots do not quite agree with the force–displacement integrals. In V2 we also used a fixed mass-scaling factor of 100, which added about 9900% mass; late in the aluminium model $ALLAE/ALLIE\approx15\%$, so artificial energy was already significant there. Magnesium's reaction plateau, about 70 kN, was only an exploratory result too. To compare materials seriously, you have to fix the geometry, mesh, velocity, and impactor, and remove mass scaling that strong.

This set of results gave us a direction, but the numerical quality was not good enough. We planned to switch to a 500 kg rigid impactor and see whether the same material differences would show up again.

### Looking again with a 500 kg impactor

This time we ran a separate set of wall impacts: a 500 kg rigid impactor hitting the absorber at 50 km/h, with steel, Al 6061, Ti-6Al-4V, and polypropylene as materials. The mass, boundary conditions, and stroke in this set are different from V2, V3, and the A/B/D section comparison.

<figure>
  <img src="/images/projects/abaqus-energy-absorber/wall-impact-aluminium.png" alt="Mises stress result for the aluminium rail under the 500 kg impactor case" loading="lazy">
  <figcaption>Al 6061</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/wall-impact-polypropylene.png" alt="Impact result for the polypropylene rail under the 500 kg impactor case" loading="lazy">
  <figcaption>Polypropylene</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/wall-impact-steel.png" alt="Mises stress result for the steel rail under the 500 kg impactor case" loading="lazy">
  <figcaption>Steel</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/wall-impact-titanium.png" alt="Impact result for the titanium rail under the 500 kg impactor case" loading="lazy">
  <figcaption>Ti-6Al-4V</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/wall-impact-force-displacement.png" alt="Force–displacement curves for steel, titanium and aluminium under the 500 kg impactor case" loading="lazy">
  <figcaption>Force–displacement</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/wall-impact-energy-comparison.png" alt="Energy curves for steel, titanium and aluminium under the 500 kg impactor case" loading="lazy">
  <figcaption>Energy</figcaption>
</figure>

| Material | Mass (kg) | Peak force (kN) | CFE | SEA (kJ/kg) | Stroke (mm) |
|---|---:|---:|---:|---:|---:|
| Steel | 2.73 | 185 | 95.2% | 17.3 | 268 |
| Al 6061 | 0.94 | 102 | 60.5% | 50.8 | 774 |
| Ti-6Al-4V | 1.54 | 249 | 92.5% | 27.9 | 186 |

Polypropylene developed contact instability and its force curve is not trustworthy, so it is not in the table. Al 6061 has the lowest peak force and the highest SEA, but it needs a 774 mm stroke, almost three times steel's. If the front of the car cannot fit that much crush space, no SEA solves the packaging problem. Titanium and steel have flatter plateaus but come with higher forces. So in this set of results, you cannot just pick the biggest number in one column.

Both material trials showed that looking only at peak force or SEA makes it easy to draw the wrong conclusion. We stopped ranking materials and reran a cleaner 30 km/h case.

## Round three: finishing the 30 km/h case

V3 returned to the 30 km/h case. Both the hat rail and the closing plate were set to 1 mm, and the two parts were joined with Tie; contact used general contact with a friction coefficient of 0.3. The model had 405 deformable elements and 961 nodes; the rigid wall had a mass of 1.0 tonne, i.e. 1000 kg, an initial velocity of 8333 mm/s, and an analysis time of 0.06 s. V3 used no fixed mass scaling, and the job ran to completion.

<figure>
  <video controls playsinline muted loop preload="metadata" style="display:block;width:100%;height:auto;">
    <source src="/images/projects/abaqus-energy-absorber/v3-crash-result.mp4" type="video/mp4">
    Your browser does not support HTML5 video.
  </video>
  <figcaption>V3 impact</figcaption>
</figure>

The results show the initial total energy was about 34.72 kJ and the final about 34.70 kJ, so the total barely drifted away. The final kinetic energy was still 22.65 kJ, so about 12.07 kJ of kinetic energy moved into other energy terms. But you cannot treat that 12.07 kJ as plastic energy absorption here. To find out where the energy really went, you have to look through the ODB item by item: internal energy, artificial energy, contact energy, and the other components.

V3 also left numerical problems behind. The solve went past 300,000 increments, and Abaqus advised us to rerun in double precision. It dropped V2's aggressive mass scaling, but we still had not done a mesh-convergence check, so we cannot assume every term is accurate enough just because the total energy is conserved. Once V3 could run to the end, our question moved from "can the model finish" to "where should the limited material go?"

## Round four: exploring section changes

We knew that for a section, thickening everything uniformly is the least work, but not every position in a thin-walled part matters equally. Folding usually starts at the corners and where ribs join, and that is where plastic hinges form. The idea of FGT (Functionally Graded Thickness) is to put more material in those positions, make the flat, weakly loaded walls thinner, and let local buckling develop in the intended order.

<figure>
  <img src="/images/projects/abaqus-energy-absorber/fgt-regions-theory.png" alt="Region I, II, III and the continuous thickness parameter in an FGT multi-cell section" loading="lazy">
  <figcaption>FGT regions</figcaption>
</figure>

Our reference was Fang et al.'s 2015 paper in the International Journal of Mechanical Sciences, [Dynamic crashing behavior of new extrudable multi-cell tubes with a functionally graded thickness](https://doi.org/10.1016/j.ijmecsci.2015.08.029). The paper splits the section into three types of region: Region I is the outer wall of the corner elements, Region II is the connecting outer wall between corners, and Region III is the internal ribs. In theory, the thickness can transition continuously from $t_{max}$ at the corners to $t_{min}$ on the flat walls:

$$
t(s)=t_{min}+\left(t_{max}-t_{min}\right)\left(1-\frac{s}{H}\right)^{n_i}.
$$

$s$ is how far you have gone along the section, $H$ is the length of that wall segment, and $n_i$ decides whether the thickness falls fast or slowly. The point of this formulation is not to thicken the whole rail together, but to move material to where it is needed more, under the ideal condition of unchanged total mass.

The FGT in the paper is a continuous-thickness design. What we did in Abaqus is a simplified version: 2 mm at the corners, 1 mm on the walls. We did not implement the continuous thickness function, and we did not run a parameter search under a fixed-mass constraint. So Model D is a stepped-thickness multi-cell section inspired by FGT.

This is the raw FGT result animation used in the defense. As it plays, the mid-bend location keeps deforming, and the Mises stress colour moves gradually from blue toward green, orange, and red.

<figure>
  <video controls playsinline muted loop autoplay preload="metadata" style="display:block;width:100%;height:auto;">
    <source src="/images/projects/abaqus-energy-absorber/fgt-model-d-deformation.mp4" type="video/mp4">
    Your browser does not support HTML5 video.
  </video>
  <figcaption>FGT: deformation</figcaption>
</figure>

### Comparing Model A, B and D

We numbered the three section variants:

- **Model A (Classic)**: the original structure given by the course. It consists of a hat channel and a flat closing plate, forming a single-cell section once joined. The hat is 1.2 mm thick and the plate is 0.8 mm thick.
- **Model B (Uniform)**: keeps Model A's hat shape and single-cell structure, and only changes both the hat and the plate to 1.0 mm. This variant checks whether "uniform wall thickness" makes the crush more stable.
- **Model D (FGT-inspired multi-cell section)**: no longer just one cell, but with dividers and stiffening ribs added inside the section, splitting it into several small cells. Corners are 2 mm thick and flat walls 1 mm, aiming to concentrate material where bending happens.

All the geometry comparisons in this set look at the results at 0.06 s. There is also a uniform 2 mm Model C, but it has no usable final results, so it is not in the comparison below.

| Metric | Model A | Model B | Model D |
|---|---:|---:|---:|
| Mass (kg) | 0.727 | 0.683 | 3.397 |
| ALLIE (kJ) | 3.5 | 2.8 | 33.0 |
| Residual kinetic energy (kJ) | 31.0 | 32.0 | 0.5 |
| ALLAE/ALLIE | <1% | <1% | <1% |
| SEA (kJ/kg) | 4.81 | 4.09 | 9.71 |
| Peak force (kN) | 32.0 | 32.5 | 280 |
| Mean force (kN) | 11.6 | 7.7 | 264 |
| CFE | 36.2% | 23.7% | 94.3% |
| Max displacement (mm) | 300 | 360 | 125 |

#### Model A: the baseline can still travel a long way

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-a-energy-history.png" alt="Model A kinetic, internal and artificial energy over 0.06 s" loading="lazy">
  <figcaption>A: energy</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-a-force-history.png" alt="Model A reaction force over time after contact" loading="lazy">
  <figcaption>A: reaction force</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-a-displacement-history.png" alt="Model A reaching 300 mm displacement after contact at about 0.025 s" loading="lazy">
  <figcaption>A: displacement</figcaption>
</figure>

Model A's internal energy reached 3.5 kJ, with a mean force of 11.6 kN and a peak of 32 kN; after 300 mm of travel it still had 31 kJ of kinetic energy left. It set a baseline that is not strong, but is easy to understand.

#### Model B: unifying the thickness to 1.0 mm

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-b-energy-history.png" alt="Model B kinetic, internal and artificial energy over 0.06 s" loading="lazy">
  <figcaption>B: energy</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-b-force-history.png" alt="Model B reaction force over time after contact" loading="lazy">
  <figcaption>B: reaction force</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-b-displacement-history.png" alt="Model B reaching 360 mm displacement after contact at about 0.025 s" loading="lazy">
  <figcaption>B: displacement</figcaption>
</figure>

From A to B, mass dropped only 6.1%, but ALLIE fell 20%, SEA fell 15%, mean force fell 33.6%, CFE lost 12.5 percentage points, while stroke increased by 20%. This does not prove that a 1 mm thickness itself is necessarily bad. A more likely explanation is that once the wall thickness was redistributed, the fold initiation points moved with it.

#### Model D: the corner-thickened multi-cell section

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-d-energy-history.png" alt="Model D kinetic energy quickly turning into internal energy and nearly stopping at the end" loading="lazy">
  <figcaption>D: energy</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-d-force-history.png" alt="Model D forming a high reaction-force plateau of about 264 kN after contact" loading="lazy">
  <figcaption>D: reaction force</figcaption>
</figure>

<figure>
  <img src="/images/projects/abaqus-energy-absorber/model-d-displacement-history.png" alt="Model D reaching about 125 mm displacement during the impact" loading="lazy">
  <figcaption>D: displacement</figcaption>
</figure>

From A to D, mass became 4.67 times, ALLIE became 9.43 times, and SEA became 2.02 times; at the same time peak force became 8.75 times, mean force became about 22.8 times, and stroke shrank by about 58%. D's 94.3% CFE does show a very flat plateau, but that plateau sits around 264 kN with a peak of 280 kN. For an energy absorber, "crushing continuously with a very large force" and "crushing continuously with an appropriate force" are not the same thing. So we did not take D as the best design here. It can absorb more kinetic energy in a shorter stroke, but at the cost of much more mass and load. To know whether the thickness distribution itself has value, the next round must give different sections the same mass budget.

## Summary

First, exploring a crash beam is a very practical project. I can imagine that designing a car at a car company means really thinking about crash-beam performance this way. This group assignment was the first time we put material, section, and numerical settings into the same crash problem. We learned how to judge results from force–displacement, kinetic energy, internal energy, and artificial energy, and we also saw that a model finishing its run does not make its numbers trustworthy. Missing properties, mass scaling, and precision problems are all very concrete takeaways from this course.

On design, we learned that light weight, high energy absorption, low peak force, and short stroke are hard to have at the same time. Aluminium is mass-efficient but needs a longer crush stroke; Model D absorbs more energy and has a flatter crush plateau, but its mass and forces go up a lot; and making all wall thicknesses the same does not necessarily give a better folding pattern. This assignment did not produce an answer that wins everywhere, but it taught us how to compare designs, and how to stay suspicious of a curve that looks beautiful.
