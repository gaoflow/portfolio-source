---
title: 'Building an FSAE Cooling System from Scratch'
year: 2026
date: '2026-08-22'
status: complete
categories: [fsae, validation]
tags: [Thermal Management]
summary: 'I first used a thermal-fluid model to reject the passive E3 concept at 40 °C ambient, then split the system into two temperature loops and checked E7 and E8 with public component data, boundary searches and an OpenFOAM surrogate duct; the result was that even when everything passes numerically, it is still not enough to approve procurement.'
role: 'Thermal Systems & Numerical Modelling'
team: 'Vinci Eco Drive — ESILV FSAE'
duration: 'Three generations of numerical baselines: E3 / E7 / E8'
featured: false
order: 2
studySequence: 5
heroImage: '/images/projects/fsae-cooling/thermal-screen.svg'
---

## Where this started: on a 40 °C hot day, how do you get coolant down to 25 °C?

This study started when I joined the Vinci EcoDrive team to take charge of powertrain cooling and ran into a really awkward practical problem: the motor and inverter supplier's hard limit was a coolant inlet temperature no higher than 25 °C.

But on a 40 °C midsummer track, if we only rely on the body sidepods passively catching air to blow through the radiators, how could the coolant ever settle below ambient temperature in steady state?

This was an architecture problem with a physical contradiction before any calculation started. To give the team a clear-eyed judgement with a rigorous mathematical model, I worked from the passive E3 loop all the way to the dual-temperature E7 architecture and the E8 real part selection, and used the data to show why we could not just buy hardware blindly.

## E3: the flow was enough, but the temperature still could not work

The E3 combination was: two Boyd 6310G3 heat exchangers, two SPAL brushless fans and one Pierburg CWA150 pump.

I put four things into the same model:

- intersecting the fan curve with the resistance curve of the cores and the duct;
- intersecting the pump curve with the two radiator branches and the motor branch;
- interpolating within the range of the manufacturers' thermal-conductance data;
- a one-dimensional finite-volume loop that computes advection, heat sources, heat rejection and storage together.

The air-side operating point was 6.56 m³/min and 45.6 Pa per radiator; the total coolant flow was 10.03 L/min, and even the motor branch with the smallest flow still had 4.16 L/min. Judged on airflow and coolant flow alone, this combination passes.

The real problem was the temperature boundary. E3 assumes the air at the radiator inlet is 40 °C, while the AMK KW26 requires coolant at 25 °C at its inlet. Without active refrigeration, a radiator can only bring the coolant slowly towards ambient temperature; in steady state it can never take it below ambient.

In other words, before the solver even started, this passive architecture already contained a physical contradiction.

![E3 steady-state and transient results both exceed the KW26 temperature boundary](/images/projects/fsae-cooling/revision-12/e3_steady_transient.png)

The model worked out how bad the failure was:

- even in the case with the lowest heat load, the KW26 inlet was still 51.86 °C;
- the 80-cell baseline loop settled at 59.45 °C, with a maximum coolant temperature of 63.87 °C;
- in the 10 s, 6.0 kW peak case, the maximum coolant temperature reached 68.18 °C;
- with the unfavourable fan curve, the fan curve and the system-resistance curve did not even intersect.

So I classified E3 as rejected. What I rejected is this passive architecture itself; it does not mean these pumps, fans and radiators can never be used in some other concept.

## How I confirmed E3 was not a numerical false failure

Before rejecting it, I first had to make sure the failure was a physics problem, not the model calculating wrong.

In the baseline case, the 80-cell loop received 3,061.53 W and rejected 3,061.43 W; the remaining 0.105 W was changing the system's stored energy. The algebraic energy residual was only $3.2\times10^{-12}$ W.

During the peak phase, the input was 6,000 W, the radiators rejected 3,595.51 W, and the remaining 2,404.49 W went into storage. The temperature rise came entirely from the same energy equation; I did not add any artificial temperature ramp to the model.

![Input, heat rejection, storage and algebraic residual in the E3 model](/images/projects/fsae-cooling/revision-12/e3_energy_residual.png)

I then varied the spatial grid and the time step separately:

| Check | Change between the two finest levels | Requirement |
|---|---:|---:|
| 20→40→80→160 cells | 0.029 K | $<0.1$ K |
| Three time-step sizes | 0.018 K | $<0.1$ K |
| 80-cell model against an independent steady-state equation | 0.078 K | $<0.1$ K |

![Spatial, temporal and independent steady-solution checks for E3](/images/projects/fsae-cooling/revision-12/e3_convergence.png)

These results show the failure is not caused by the current discretisation scale. But they can only prove the model solves its own equations consistently; they cannot turn an unknown heat load into a measured input.

## E7: I split the system into two temperature levels

After E3 failed, I stopped expecting one passive loop to keep both the KW26 and the DD5 happy at the same time, and split the architecture instead:

- an active low-temperature KW26 loop with a 25 °C inlet boundary;
- a passive high-temperature loop for the two DD5s, allowing a 40–60 °C inlet;
- a refrigerant loop that moves the KW26 heat and the compressor power to the high-temperature side;
- separate condenser and DD5 air paths.

E7 did not select a chiller; it first scanned an assumed range:

| Parameter | Scanned range |
|---|---:|
| KW26 heat load into the liquid | 0.500–2.000 kW |
| Ambient heat leak | 0–0.300 kW |
| Refrigeration COP | 1.5–3.0 |
| Required evaporator capacity | 0.500–2.300 kW |
| Compressor power | 0.167–1.533 kW |
| Total high-side heat rejection | 2.041–6.582 kW |
| DD5 inlet | 48.7–57.4 °C |
| DD5 derating | 8.7%–17.4% |

Every combination closes inside the stated equations. So E7 can only say one thing: the two-temperature architecture is numerically feasible within these assumptions. It has no data on the evaporator, condenser, control valves, receiver, auxiliary power or installed state, so it cannot be turned directly into a hardware concept.

## E8: I mapped the assumptions to public catalogue parts

E8 built a steady-state reference for the three loops from public catalogue data. The main parts were a Masterflux SIERRA03-0982Y3 compressor, Danfoss B3-012 plate heat exchangers, a Bosch PCE hot-side pump, a Pierburg CWA150 pump, Boyd 6310G3 cores and SPAL fans.

To be clear: these part numbers are only model inputs; they do not mean the team has selected or purchased them.

E8 checked two KW26 evaporator heat loads: 0.820 kW and 2.300 kW. On the DD5 side, I swept the heat entering the coolant from the two motors from 1.374 kW to 2.749 kW. The nominal model passed with the stated flow rates, temperatures, heat-exchanger UA values, compressor capacity, pump head and fan settings.

But passing one nominal point was not enough. I then used bisection to find where each parameter turns from "pass" to "fail":

| Boundary | Last passing point | First failing point |
|---|---:|---:|
| Minimum condenser-fan command | 68.0168% | 68.0161% |
| Minimum DD5-fan command | 43.5217% | 43.5208% |
| Common available UA of the three B3s | 67.0258% | 67.0251% |
| Maximum KW26-loop pressure loss | 1.26000 bar | 1.26001 bar |
| Maximum combined liquid heat of the two DD5s | 3.13434 kW | Above 3.13434 kW |

![The five pass-to-fail turning points in E8](/images/projects/fsae-cooling/revision-12/e8_exact_boundaries.png)

These decimals are only numerical boundaries in deterministic equations, not requirements on hardware control accuracy. A real car also faces measurement error, manufacturing differences, fouling, control delay and environmental fluctuation, so the engineering margin has to be much larger than this.

## Why you cannot just add the single-variable margins together

If you used all five "last passing points" together, you would be walking into a combination the model has never validated. To see how the parameters affect each other, I computed five sets of $5\times5$ interaction grids:

- condenser-fan command against available B3 UA;
- DD5-fan command against DD5 liquid heat;
- KW26 heat load against low-temperature-loop pump head;
- ambient temperature against KW26 heat load;
- DD5 air distribution against available radiator conductance.

![The five parameter-interaction domains in E8](/images/projects/fsae-cooling/revision-12/e8_interaction_domains.png)

The result was direct: when one parameter gets worse, the minimum requirement on another goes up. The five single-variable boundaries are five different slices; they are not five independent allowances that can all be spent at once.

I also used twelve larger perturbations to confirm that failures appear in the expected direction. For example: the condenser fan passed at 70% and failed at 65%; the B3 available UA passed at 70% and failed at 65%; and raising the KW26-loop pressure loss from 1.20 bar to 1.30 bar failed.

## The surrogate duct: OpenFOAM only checked the method itself

Once the system architecture had passed numerically, CFD became the right tool for the question "how does the air get through the fan, the shroud and the radiator core".

I built an isolated three-dimensional surrogate duct: the fan used a full-face pressure jump, the core used an isotropic Darcy–Forchheimer porous zone, and four meshes kept the same geometry and the same set of boundary conditions.

| Mesh | Cells | Core flow (m³/s) | Core pressure loss (Pa) |
|---|---:|---:|---:|
| Coarse | 7,440 | 0.143580 | 32.654 |
| Medium | 53,940 | 0.134869 | 34.961 |
| Fine | 431,520 | 0.130726 | 36.073 |
| Extra fine | 3,481,920 | 0.129484 | 36.078 |

From the fine to the extra-fine mesh, the flow changed by 0.959% and the pressure loss by 0.0145%. The extra-fine mesh had a global mass imbalance of $1.39\times10^{-5}$% and a final-time-window drift of $3.24\times10^{-5}$%.

![Four-level mesh study of the fan and porous-core surrogate duct](/images/projects/fsae-cooling/openfoam-mesh-qualification.svg)

This result only says: on this idealised surrogate duct, the fan-plus-porous-core method passed its mesh and conservation checks. The model has no real sidepod, measured incoming flow, core non-uniformity, hot-air recirculation or conjugate heat transfer, so it cannot represent the installed E8 duct performance.

## Why we still cannot buy now

What E8 passed is a steady-state model built from public data and explicit assumptions. To approve procurement, these things are still missing:

| Missing data | How it should be filled in |
|---|---|
| Actual KW26 heat entering the coolant | Calorimetric rig or a manufacturer operating map |
| Fraction of DD5 heat entering the water jacket | Independent calorimetry of the left and right motors |
| Installed pump and core curves | Complete first-party curves or measurements |
| Dynamic driving duty | Synchronous records of speed, torque, flow, temperature and ambient |
| Installed air path | Frozen CAD, measured boundaries and a screened architecture |
| Control and fault states | Degraded tests of the fans, pumps, compressor and valves |

The public material has no KW26 loss map at the target operating point, no fraction of DD5 heat entering the water jacket, and no pump and heat-exchanger curves at the full operating conditions. Without these data, a numerical "pass" cannot be translated into "the hardware is sufficient".

## How this study changed the order I work in

The most important E3 result was finding the physical contradiction between 40 °C air and the 25 °C coolant inlet before doing any complex calculation. E7 showed the two-temperature architecture can close within the assumed range. E8 then showed that even with hardware from public catalogues, the steady-state reference can have only very narrow local margins.

So now I first pin down the heat loads and the real duty, then screen architectures, then validate physical components and controls, and only at the end use installation-level CFD to study the sidepod and the duct.

A more expensive, more complex model cannot patch a problem whose inputs are not yet defined. Reject the wrong architectures with cheap models first, then spend the compute on concepts that can still hold up — that is the main method this study left me.
