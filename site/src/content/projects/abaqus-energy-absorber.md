---
title: 'Abaqus Energy Absorber — Crashworthiness Optimization'
year: 2026
date: '2026-03'
status: complete
categories: [design, validation]
tags: [Abaqus, Explicit dynamics, crashworthiness, FGT, energy absorption]
summary: 'Abaqus/Explicit crash campaign on a front-rail absorber: aluminium wins the material screening, and a functionally graded thickness (FGT) multi-cell layout absorbs 95.6% of striker kinetic energy at 2.56× the specific energy of the classic section.'
methodLine: 'Abaqus/Explicit · dynamic crush · SEA / Fmax / CFE · functionally graded thickness'
role: 'Wall-impact study & report assembly'
team: 'ESILV MMN1 group — Nicolas Chang, Daphné Baray, Bing Gao, Immanuella Castro'
duration: '6 weeks'
heroMetrics:
  - { label: 'KE absorbed (FGT)', value: '95.6%' }
  - { label: 'SEA (FGT)', value: '12.30 kJ/kg' }
  - { label: 'Mean crush force', value: '215 kN' }
keyOutputs:
  - 'Material screening across steel, HSS, aluminium, and magnesium; aluminium selected on peak force and weight-normalized SEA.'
  - 'Barrier-crash baseline (1 mm Al, 30 km/h): SEA 17.07 kJ/kg, CFE 68%, energy closure 34.70 ± 0.02 kJ.'
  - 'Wall-impact study (steel / Al 6061 / Ti-6Al-4V / PP): Al 6061 lowest Fmax at 102 kN and best metal SEA at 50.8 kJ/kg.'
  - 'FGT multi-cell geometry absorbs 33.20 of 34.72 kJ (95.6%) with SEA 12.30 kJ/kg, 2.56× the classic baseline.'
featured: false
sample: false
order: 18
studySequence: 9
heroImage: /images/projects/abaqus-energy-absorber/force-displacement-preliminary.png
---

## Brief

Thin-walled front rails absorb roughly half the kinetic energy in a frontal collision, so the design problem has two competing targets: absorb as much energy as possible per kilogram, and keep the peak crush force low enough that occupants survive the deceleration. This six-week ESILV solid-mechanics project attacked that trade-off in Abaqus/Explicit, ending with a recommendation: an aluminium absorber with a functionally graded thickness (FGT) multi-cell section.

The team split the work across four people. I ran the complementary wall-impact study and assembled the final report; my teammates ran the preliminary crush, the material screening, the barrier crash, and the FGT geometry jobs. Every number below comes from that report.

Three indicators drove every comparison, fixed before the runs: specific energy absorption $\mathrm{SEA} = E/M$ (maximize), peak crush force $F_{max}$ (minimize), and crash force efficiency $\mathrm{CFE} = F_{mean}/F_{max}$ (maximize, since a flat plateau means a controlled deceleration).

## Method

All jobs use the mm–tonne–s unit system (stress in MPa, density in t/mm³ — steel is $7.85\times10^{-9}$, not 7850). The reference section was built in SolidWorks and exported as STEP: a 220.6 mm-wide, 50.0 mm-high, 931.6 mm-long hat profile closed by a flat plate. The dynamic jobs drive a 1000 kg rigid impactor at 8333 mm/s (30 km/h) into the rail with general contact, hard overclosure, and friction $\mu = 0.3$, over a 0.06 s step.

A preliminary 90 km/h axial crush established the baseline behaviour: an aluminium absorber (286 SC8R continuum shells, 250 MPa yield, 300 MPa at 10% plastic strain) struck by a steel impactor (64 C3D8R solids) at 25,000 mm/s. Energy conservation holds between ALLKE and ALLIE, impactor displacement stays linear to −270 mm at 0.02 s, and the reaction force evolves in three phases: zero during free approach, a first-contact spike near 100 kN, then resistance rising to $F_{max} = 137.6$ kN as the rail folds and densifies. The high-frequency noise on the force trace is explicit-solver oscillation under mass scaling; the underlying trend is what we designed against.

One reference model anchors the project: a quasi-static curved-beam benchmark in steel (16,756 S4RS shell elements, stiffness hourglass control, −1 mm prescribed displacement over 0.01 s). Our crash models are coarser and different in kind — 405 reduced-integration solids, no hourglass control, dynamic loading at 8333 mm/s — so the benchmark checks element quality and setup, and the report is explicit that a quasi-static result says nothing about the dynamic crush, where inertia and stress waves change the response.

![Force–displacement response of the preliminary 90 km/h axial crush: initial peak, then a declining folding plateau. Group-report figure from the Abaqus XY output.](/images/projects/abaqus-energy-absorber/force-displacement-preliminary.png)

The force–displacement curve defines the design goal visually: cut the initial peak, flatten the plateau, and grow the area underneath, since $W = \int F\,dx$ is the absorbed energy.

## Material screening

The first comparison ran the same crash on dual-phase steel, high-strength steel (HSS), automotive aluminium, and magnesium. HSS peaked so high it was dropped from the comparison plots; the remaining three:

| Metric | Steel | Aluminium | Magnesium |
|---|---:|---:|---:|
| Density (kg/m³) | 7850 | 2500 | 1800 |
| Peak force $F_{max}$ (kN) | 212.4 | 132.9 | 83.7 |
| Absorbed energy (kJ) | 64.9 | 50.4 | 31.0 |
| CFE (%) | 36 | 37 | 23 |

Steel absorbs the most absolute energy but weighs three times more than aluminium. Normalized per kilogram, aluminium comes out about 2.4× more weight-efficient than steel and roughly 17% ahead of magnesium — magnesium folds too easily and its plateau sits near 70 kN. The artificial-energy ratio ALLAE/ALLIE stayed under 1% in every case, so the deformation was physical rather than hourglassing. Aluminium carried forward into all later stages.

## Barrier crash baseline

The realistic scenario: a 1.0 mm uniform aluminium absorber (U-channel of 351 C3D8R elements tied to a 54-element closing plate, 405 deformable elements total, mass 0.70 kg) struck by a 1000 kg rigid wall at 30 km/h. The step ran 470,678 increments at a stable increment near $1.22\times10^{-7}$ s.

The energy audit closes. Initial kinetic energy is $\frac{1}{2}mv^2 = 34.72$ kJ; total energy holds at $34.70 \pm 0.02$ kJ for the full step. Contact begins at $t \approx 0.027$ s after 224.7 mm of free travel. At 0.06 s the split is 22.65 kJ kinetic, 11.95 kJ internal, with 241.8 mm of crush.

The force response shows a first peak near 63 kN and a global peak of about 72.6 kN, then folding oscillations between 26 and 50 kN. Dividing internal energy by crush travel gives the mean crush force:

$$F_{mean} = \frac{\mathrm{ALLIE}}{\Delta x_{crush}} = \frac{11\,952\,000\ \mathrm{N\cdot mm}}{241.8\ \mathrm{mm}} \approx 49.4\ \mathrm{kN}$$

That yields SEA = 17.07 kJ/kg and CFE = 68.0% — the reference the geometry stage had to beat. Against the uniform reference geometry run later under the same nominal impact ($F_{max} = 32.5$ kN, $F_{mean} = 7.7$ kN, SEA = 4.09 kJ/kg), this assembly absorbs far more energy in less travel; the report attributes the difference to a different cross-section and folding mode, so we treated the comparison as context rather than a like-for-like verdict.

## Wall-impact study

My part of the project: an independent material check under a different load case — a 500 kg rigid impactor at 50 km/h (48.4 kJ) against the same absorber concept in steel, Al 6061, Ti-6Al-4V, and polypropylene. The candidates span two orders of magnitude in stiffness and yield: E from 1.5 GPa (PP) to 210 GPa (steel), yield from 25 MPa (PP) to 880 MPa (Ti-6Al-4V). The PP job developed contact instabilities, so I excluded it from the force metrics and reported the energy history only.

| Material | Mass (kg) | $F_{max}$ (kN) | CFE (%) | SEA (kJ/kg) | Crush (mm) |
|---|---:|---:|---:|---:|---:|
| Steel | 2.73 | 185 | 95.2 | 17.3 | 268 |
| Al 6061 | 0.94 | 102 | 60.5 | 50.8 | 774 |
| Ti-6Al-4V | 1.54 | 249 | 92.5 | 27.9 | 186 |

Steel and titanium crush with admirably flat plateaus (CFE above 92%) but at peak forces of 185–249 kN; titanium converts energy to plastic work fastest and then collapses. Al 6061 delivers the lowest peak force at 102 kN and the best SEA among the metals at 50.8 kJ/kg — the same conclusion as the screening, under a different impactor, velocity, and energy. The 774 mm crush stroke is the price: aluminium protects by travelling, and a real packaging budget would constrain that.

## FGT geometry optimization

The final stage held the material and changed the cross-section. Functionally graded thickness distributes material by stress demand instead of uniformly: the section splits into three regions — corner-cell exterior walls, connecting walls, and internal ribs — and a power-law gradient $t(s) = t_{min} + (t_{max} - t_{min})\,(1 - s/H)^{n_i}$ thickens the corners that form plastic hinges ($t_{max} = 2.0$ mm) while thinning the flat webs ($t_{min} = 1.0$ mm). The framework follows Fang et al. (IJMS, 2015), who optimized extrudable multi-cell FGT tubes with MOPSO and response surfaces and found Pareto sets that favour exactly this outer-wall gradient with stronger ribs.

Three layouts ran under the same 30 km/h impactor:

| Indicator | Classic (1.2/0.8 mm) | Uniform (1.0 mm) | FGT multi-cell |
|---|---:|---:|---:|
| Mass (kg) | 0.727 | 0.683 | 2.70 |
| Absorbed energy (kJ) | 3.5 | 2.8 | 33.20 |
| SEA (kJ/kg) | 4.81 | 4.09 | 12.30 |
| CFE | 36% | 24% | — |
| Residual KE | ≈90% | ≈92% | 4.4% |

The uniform section is the instructive failure: slightly lighter than the classic hat and worse at everything — SEA down 15%, CFE down to 23.7%. Spreading thickness evenly is strictly worse than the asymmetric baseline it replaced.

The FGT section ran under the same 1000 kg impactor at 8333 mm/s, contacting at about 27 ms after roughly 225 mm of free travel. It absorbs 33.20 of the 34.72 kJ initial kinetic energy — 95.6%, against about 10% for the classic layouts, which still have 31–32 kJ of kinetic energy left at 0.06 s. Mean crush force is 215 kN over a 154 mm stroke, and SEA reaches 12.30 kJ/kg, 2.56× the classic section.

![FGT job energy history: kinetic energy (purple) falls from 34.72 kJ to near zero while internal energy (teal) rises to 33.2 kJ; artificial energy (red) stays flat at the axis. Group-report figure.](/images/projects/abaqus-energy-absorber/fgt-energy-balance.png)

![FGT striker displacement: free flight until contact at ≈0.023 s, then a 125 mm crush plateau — the striker stops. Group-report figure from the Abaqus XY output.](/images/projects/abaqus-energy-absorber/fgt-displacement-history.png)

## Iteration: V1 to V3, and the numbers that moved

The archived job directories show the campaign restarting once. V1 never produced a result: the input processor stopped on a fatal error — 328 elements with missing property definitions, collected into `ErrElemMissingSection` — on a rail that mixed SC8R continuum shells with C3D8R solids. The `.sta` file is empty; the CAE tree looked finished anyway. V2 rebuilt the deck with C3D8R throughout and the impactor carried as a point mass on its reference point, and all four screening jobs (steel, HSS, aluminium, magnesium) ran to completion. V3 changed the load case to the rigid-wall configuration — R3D4 wall, MASS and ROTARYI on its reference point — which is the barrier-crash setup the report analyzes.

The notes record an energy-quality scare the final table hides. An early aluminium run showed artificial energy ALLAE around $7.5\times10^6$ against an ALLIE of $50\times10^6$ — about 15%, flagged as "at the limit", with a plan to rerun on the school's computers with a finer mesh. The submitted report's jobs all sit under 1%, so the rerun happened; the finer mesh did not, and the limitations above carry that.

The FGT headline itself moved between the working notes and the submitted PDF. The notes and the draft LaTeX carry the first FGT job: 3.397 kg, SEA 9.71 kJ/kg, $F_{max}$ 280 kN, CFE 94.3%. The submitted report carries the rerun: 2.70 kg, 12.30 kJ/kg, 215 kN mean over a 154 mm stroke, 95.6% of the kinetic energy. This article traces only the second set. The draft's comparison table also held a fourth geometry — a uniform 2 mm multi-cell section — whose column was never filled; it was dropped from the comparison instead of being reported.

One detour became a fixture. The quasi-static curved-beam benchmark entered through Workshop 6, which the notes show the group mining for tooling — integrated output sections for load paths, SAE filtering for noisy explicit force traces — before adopting the beam itself as the reference model in the method section.

## What it demonstrates

Two conclusions survived every stage. Aluminium is the right material for a crush box: it won the screening on weight-normalized SEA, and the independent wall-impact study reproduced the result with the lowest peak force of any metal tested. Geometry then matters more than gauge: the uniform 1.0 mm section proves that adding material evenly loses to the asymmetric baseline, while grading thickness into the hinge regions multiplies absorbed energy by an order of magnitude.

The honest caveats, stated in the report and worth keeping. The FGT section weighs 2.70 kg against 0.727 kg for the classic — nearly four times the mass — so the 2.56× SEA gain is real but the design is heavier, and CFE was not computed for it. The barrier and geometry jobs use different cross-sections, so their absolute SEA values are not directly comparable. Each study ran a single velocity and a single mesh with no convergence sweep, and explicit noise plus mass scaling rides on every force trace. The right next step is a fixed-mass FGT optimization — vary the gradient exponent $n_i$ under a mass constraint — plus a mesh-refinement check before trusting the 95.6% figure past one significant digit.

## What I took away

Assembling the report meant deciding which numbers exist: the working notes and the submitted PDF disagree on the FGT job (9.71 against 12.30 kJ/kg), so every value I typeset was traced to the job that produced it. V1 taught the cheaper lesson — a finished-looking CAE tree ran zero increments, and the `.sta` file, opened before the ODB, is the evidence that a run happened. The result I would put in front of a designer first is the uniform 1.0 mm section losing to the asymmetric classic (SEA 4.09 against 4.81 kJ/kg): spreading material evenly feels conservative, and it was worse at everything we measured.
