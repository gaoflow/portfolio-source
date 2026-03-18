---
title: 'How I Screened an FSAE Cooling System Step by Step'
year: 2026
date: '2026-08-22'
status: complete
categories: [fsae, validation]
tags: [Thermal Management]
summary: 'I first used a coupled thermal-fluid model to reject the passive E3 concept at 40 °C ambient, then separated the system into temperature-specific loops and used public component data, boundary searches and an OpenFOAM surrogate duct to assess E7 and E8. The results show why numerical feasibility alone is not enough to approve procurement.'
role: 'Thermal Systems & Numerical Modelling'
team: 'Vinci Eco Drive — ESILV FSAE'
duration: 'E3 / E7 / E8 numerical baselines'
featured: false
order: 2
studySequence: 5
heroImage: '/images/projects/fsae-cooling/thermal-screen.svg'
---

## Origin: in 40 °C summer heat, how do we chill coolant down to 25 °C?

The origin of this research was joining the Vinci EcoDrive team and confronting a severe engineering bottleneck: the motor and inverter supplier specified a coolant inlet ceiling of 25 °C.

Yet in a 40 °C summer race environment, a purely passive sidepod radiator cannot cool a fluid below ambient air temperature in steady state.

The passive architecture was physically contradictory before running any simulations. To provide clear engineering evidence for the team, I evaluated configurations from the passive E3 loop to the dual-temperature E7 and catalogue-anchored E8 models, proving why hardware could not be purchased blindly.

## E3: enough flow, but an impossible temperature target

The E3 combination consisted of two Boyd 6310G3 heat exchangers, two SPAL brushless fans and one Pierburg CWA150 pump.

I coupled four parts of the system in one model:

- the fan curve intersected with the radiator-core and duct resistance curve;
- the pump curve intersected with two radiator branches and the motor branches;
- interpolation within the manufacturer’s published thermal-conductance range;
- a one-dimensional finite-volume loop resolving advection, heat sources, heat rejection and thermal storage.

The air-side operating point was 6.56 m³/min per radiator at 45.6 Pa. Total coolant flow was 10.03 L/min, and the limiting motor branch still received 4.16 L/min. On airflow and coolant flow alone, the combination passed.

The real problem was the temperature boundary. E3 assumed 40 °C air at the radiator inlet, while the AMK KW26 required coolant at 25 °C at its inlet. Without active refrigeration, a radiator can only bring the coolant towards ambient temperature from above. It cannot provide steady-state coolant below ambient.

The passive architecture therefore contained a physical contradiction before the solver started.

![E3 steady-state and transient results exceed the KW26 temperature boundary](/images/projects/fsae-cooling/revision-12/e3_steady_transient.png)

The model quantified the extent of the failure:

- the KW26 inlet remained at 51.86 °C even in the lowest heat-load case;
- the 80-cell baseline loop settled at 59.45 °C, with a maximum coolant temperature of 63.87 °C;
- the 10 s, 6.0 kW peak produced a maximum coolant temperature of 68.18 °C;
- under the adverse fan-curve reading, the fan curve and system-resistance curve did not intersect at all.

I therefore classified E3 as a NO-GO. This rejects the passive combination as an E3 system; it does not mean that any individual pump, fan or radiator could never be used in another architecture.

## Confirming that E3 was not a numerical false failure

Near steady state, the baseline 80-cell loop received 3,061.53 W and rejected 3,061.43 W. The remaining 0.105 W was changing the system’s stored energy. The algebraic energy residual was only $3.2\times10^{-12}$ W.

During the peak, the model received 6,000 W. The radiators rejected 3,595.51 W, while the remaining 2,404.49 W entered thermal storage. The temperature rise followed the same energy equation; I did not impose an artificial temperature ramp.

![Input power, heat rejection, storage and algebraic residual in the E3 model](/images/projects/fsae-cooling/revision-12/e3_energy_residual.png)

I then varied the spatial grid and time step:

| Check | Change between the two finest levels | Requirement |
|---|---:|---:|
| 20→40→80→160 cells | 0.029 K | $<0.1$ K |
| Three time-step sizes | 0.018 K | $<0.1$ K |
| 80-cell model against an independent steady-state equation | 0.078 K | $<0.1$ K |

![Spatial, temporal and independent steady-state checks for E3](/images/projects/fsae-cooling/revision-12/e3_convergence.png)

These checks show that the failure was not caused by the chosen discretisation scale. They only establish that the model solves its own equations consistently; they cannot turn an unknown heat load into a measured input.

## E7: separating the system into two temperature levels

After E3 failed, I stopped trying to make one passive loop satisfy both the KW26 and DD5 requirements. Instead, I separated the architecture into:

- an active low-temperature KW26 loop with a 25 °C inlet boundary;
- a passive high-temperature loop for two DD5 motors, allowing a 40–60 °C inlet;
- a refrigerant loop transferring the KW26 heat and compressor power to the high-temperature side;
- separate condenser and DD5 airflow paths.

E7 did not select a chiller. I first scanned an assumed operating envelope:

| Parameter | Scanned range |
|---|---:|
| KW26 heat entering the liquid loop | 0.500–2.000 kW |
| Ambient heat leak | 0–0.300 kW |
| Refrigeration COP | 1.5–3.0 |
| Required evaporator capacity | 0.500–2.300 kW |
| Compressor power | 0.167–1.533 kW |
| Total high-side heat rejection | 2.041–6.582 kW |
| DD5 inlet temperature | 48.7–57.4 °C |
| DD5 derating | 8.7%–17.4% |

Every combination closed within the stated equations. E7 therefore showed only that a two-temperature architecture was numerically feasible within those assumptions.

It did not include selected evaporators, condensers, control valves or receivers. It also lacked installed-state data and complete auxiliary-power estimates, so it could not be converted directly into a hardware design.

## E8: mapping the assumptions to public catalogue components

For E8, I built a three-loop steady-state reference using public catalogue data. The main model inputs included a Masterflux SIERRA03-0982Y3 compressor, Danfoss B3-012 plate heat exchangers, a Bosch PCE high-temperature pump, a Pierburg CWA150 pump, Boyd 6310G3 cores and SPAL fans.

These part numbers identify the catalogue data used in the model. They do not mean that the team selected or purchased the components.

E8 assessed two KW26 evaporator heat loads: 0.820 kW and 2.300 kW. For the DD5 loop, I varied the combined heat entering the coolant from two motors between 1.374 kW and 2.749 kW.

The nominal model passed with the stated flow rates, temperatures, heat-exchanger UA values, compressor capacity, pump head and fan settings.

Passing one nominal point was not enough, so I used bisection searches to find where each parameter changed from pass to fail:

| Boundary | Last passing point | First failing point |
|---|---:|---:|
| Minimum condenser-fan command | 68.0168% | 68.0161% |
| Minimum DD5-fan command | 43.5217% | 43.5208% |
| Common available UA of the three B3 units | 67.0258% | 67.0251% |
| Maximum KW26-loop pressure loss | 1.26000 bar | 1.26001 bar |
| Maximum combined DD5 liquid heat load | 3.13434 kW | Above 3.13434 kW |

![Five pass-to-fail boundaries in the E8 model](/images/projects/fsae-cooling/revision-12/e8_exact_boundaries.png)

These decimal values are numerical boundaries in deterministic equations. They are not hardware control-accuracy requirements. A real vehicle must also accommodate measurement uncertainty, manufacturing variation, fouling, control delays and environmental changes, so the engineering margin must be much larger.

## Single-variable margins cannot be added together

Using all five “last passing” values at once would create a combination that the model had never validated. I therefore calculated five sets of $5\times5$ interaction grids:

- condenser-fan command against available B3 UA;
- DD5-fan command against DD5 liquid heat load;
- KW26 heat load against low-temperature-loop pump head;
- ambient temperature against KW26 heat load;
- DD5 airflow distribution against available radiator conductance.

![Five E8 parameter-interaction domains](/images/projects/fsae-cooling/revision-12/e8_interaction_domains.png)

The result was straightforward: when one parameter became less favourable, the minimum requirement for another parameter increased. The five single-variable boundaries are separate slices through the model, not five independent allowances that can all be consumed at once.

I also applied twelve larger perturbations to confirm that the expected failure mechanisms appeared in the expected direction. For example:

- the condenser passed at a 70% fan command and failed at 65%;
- the B3 heat exchangers passed at 70% available UA and failed at 65%;
- increasing KW26-loop pressure loss from 1.20 bar to 1.30 bar caused the model to fail.

## OpenFOAM only checked the fan and porous-core method

Once the system architecture had passed its initial screen, CFD became useful for a narrower question: how air moves through a fan, shroud and radiator core.

I built an isolated three-dimensional surrogate duct. The fan used a full-face pressure jump, while the radiator core used an isotropic Darcy–Forchheimer porous zone. All four meshes retained the same geometry and boundary conditions.

| Mesh | Cells | Core flow (m³/s) | Core pressure loss (Pa) |
|---|---:|---:|---:|
| Coarse | 7,440 | 0.143580 | 32.654 |
| Medium | 53,940 | 0.134869 | 34.961 |
| Fine | 431,520 | 0.130726 | 36.073 |
| Extra fine | 3,481,920 | 0.129484 | 36.078 |

From the fine to the extra-fine mesh, the core-flow change was 0.959% and the pressure-loss change was 0.0145%. The extra-fine mesh had a global mass imbalance of $1.39\times10^{-5}$% and a final-time-window drift of $3.24\times10^{-5}$%.

![Four-mesh study of the fan and porous-core surrogate duct](/images/projects/fsae-cooling/openfoam-mesh-qualification.svg)

This result shows that the idealised surrogate-duct method passed its mesh and conservation checks. The model did not include the real sidepod, measured incoming flow, core non-uniformity, hot-air recirculation or conjugate heat transfer. It therefore does not represent installed E8 airflow performance.

## Why the results still do not justify procurement

E8 passed a steady-state model assembled from public data and explicit assumptions. Procurement approval still requires the following information:

| Missing information | How it should be obtained |
|---|---|
| Actual KW26 heat entering the coolant | Calorimetric testing or a manufacturer operating map |
| Fraction of DD5 heat entering the water jacket | Independent calorimetry for the left and right motors |
| Installed pump and radiator-core curves | Complete first-party curves or measured data |
| Dynamic driving duty | Synchronous speed, torque, flow, temperature and ambient records |
| Installed airflow path | Frozen CAD, measured boundary conditions and a screened architecture |
| Control and fault behaviour | Degraded-operation tests for the fans, pumps, compressor and valves |

The public AMK material, including the PDK 205481 boundary information used for the KW26, does not provide the required loss map at the target operating point. The available DD5 total-loss information does not establish how much heat enters the water jacket. Complete operating curves for the pumps and heat exchangers at the intended conditions are also unavailable.

The Boyd 6310G3 and SPAL fan catalogue data were useful for screening, but catalogue values are not a substitute for installed measurements. The CWA150 curve available for the screen was secondary-hosted and conservatively biased; final approval would require first-party or measured hydraulic data.

Without these inputs, a numerical pass cannot be translated into “the hardware is sufficient.” Solid temperatures, interface behaviour, material and contact resistance, condensation control and installed-vehicle correlation also remain outside the validated scope.

## How this study changed my workflow

The most important E3 result was finding the physical contradiction between 40 °C air and a 25 °C coolant-inlet requirement before attempting more complex analysis. E7 showed that a two-temperature architecture could close within a declared assumption range. E8 then showed that even a steady-state reference built from public catalogue hardware could have very narrow local margins.

My current sequence is therefore:

1. establish the heat loads and real operating duty;
2. screen the system architecture;
3. validate physical components and controls;
4. use installation-level CFD to study the sidepod and duct only after the earlier stages pass.

A more expensive or more complicated model cannot compensate for undefined inputs. The main lesson from this work was to reject an unsuitable architecture with the lowest-cost adequate model, then spend detailed modelling effort only on concepts that can still satisfy the underlying physics.
