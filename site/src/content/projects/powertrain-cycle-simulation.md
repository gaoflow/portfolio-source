---
title: 'Cycle Simulation of Four Powertrain Architectures: An Energy Comparison'
year: 2025
date: '2025-12-06'
status: complete
categories: [tooling, validation]
tags: [Powertrain simulation]
summary: 'Based on a course-provided powertrain benchmark dataset, we used a backward quasi-static model to systematically compare the energy consumption and carbon emissions of ICE, HEV, PHEV, and BEV on the Spa circuit and standard cycles, focusing on the PHEV’s sensitivity to initial charge and the mass penalty once the battery is depleted.'
role: 'Powertrain modelling, data validation, and energy analysis'
duration: '4 weeks'
academic:
  institution: 'ESILV'
  course: 'Powertrains & Vehicle Dynamics'
  assignment: 'Powertrain energy consumption and CO₂ simulation across driving cycles'
  requirements:
    - 'Simulate the same vehicle under ICE, BEV, HEV, and PHEV architectures on the Spa-Francorchamps circuit and the NEDC cycle.'
    - 'Resolve inertial force, rolling resistance, aerodynamic drag, and grade resistance point by point with a backward quasi-static model.'
    - 'Quantify fuel consumption, electrical energy use, and CO₂ emissions per unit distance for each powertrain.'
    - 'Investigate PHEV behaviour at different initial SOC values, and the extra mass penalty after the battery is depleted.'
featured: false
order: 20
studySequence: 4
heroImage: /images/projects/powertrain-cycle-simulation/spa-francorchamps-aerial.jpg
cardImageFit: cover
---

## Simulation background and datasets

Our instructor, who works at the Spa-Francorchamps circuit, gave us a rich powertrain and driving-cycle dataset and asked us to systematically evaluate the energy consumption and emissions of different drive architectures. The data included:

- Powertrain and vehicle parameters: four architectures, conventional internal combustion (ICE), full hybrid (HEV), plug-in hybrid (PHEV), and battery electric (BEV), with the Peugeot 308 as the main reference car, and detailed curb weights, motor power, battery capacity, engine efficiency curves, and gear ratios.
- Track and test cycles: gradient, elevation, distance, and speed sequences for the real Spa-Francorchamps circuit in Belgium, split into a gentle, economical ECO mode and a highly dynamic, aggressive SPORT mode, plus the standard European test cycles (NEDC and WLTC base speed sequences).
- Operating characteristics and control parameters: 0–100 km/h acceleration and braking characteristics, engine load-efficiency maps under different conditions, and PHEV initial state of charge (SOC) settings from 0% to 100%.

With this data we could build a unified analysis baseline. Holding the same speed trace and external road conditions, we worked backwards to the power required at the wheels, then pushed it level by level back to the engine's and the motor's energy consumption. Finally we compared the powertrains side by side, with a focus on the PHEV's charge sensitivity and mass penalty.

## Baseline setup and physical modelling

For a fair comparison, every vehicle model must strictly follow the same trajectory and speed curve, removing consumption swings caused by driving style or route differences. We used a backward quasi-static physical model. Given the speed $v$, acceleration $a$, distance travelled, and road gradient $\theta$ at each time step, it solves backwards for the total tractive force $F$ needed at the wheels:

$$
F = ma + fmg + \frac{1}{2}\rho C_x S v^2 + mg\sin\theta.
$$

The four terms are inertial force, rolling resistance, aerodynamic drag, and grade resistance. The instantaneous power demand at the wheels is $P_{\text{wheel}} = Fv$. The model then converts mechanical power into instantaneous fuel or electricity consumption using drivetrain efficiency, the engine load map, or the motor/battery efficiency chain. CO₂ emissions from petrol are computed at 2392 g/l.

For the reference-car comparison, the main Peugeot 308 input parameters were:

| Parameter | ICE (petrol) | PHEV (plug-in hybrid) |
|---|---:|---:|
| Aerodynamic drag coefficient $C_x$ | 0.28 | 0.28 |
| Frontal area $S$ | 2.25 m² | 2.25 m² |
| Wheel diameter | 0.64 m | 0.64 m |
| Base vehicle mass | 1280 kg | 1443 kg |
| Electric drive (motor) mass | — | 50 kg |
| Battery system mass | — | 110 kg |
| Maximum engine power | 96 kW | 110 kW |
| Overall gear ratios | 13.5 / 7.1 / 4.8 / 3.6 / 2.7 | 13.5 / 7.1 / 4.8 / 3.6 / 2.7 |
| Traction battery capacity | — | 12.4 kWh |
| Electric motor power | — | 81 kW |
| Battery / motor nominal efficiency | — | 0.95 / 0.90 |

The two cars share an identical aerodynamic body, tyre spec, and set of gear ratios, which makes the influence of powertrain architecture, total mass, and control strategy stand out more clearly.

For the Spa circuit, the cornering speed limit is estimated from the tyre adhesion limit:

$$
v = \sqrt{\mu g R}.
$$

where $\mu$ is the adhesion coefficient, $g$ is gravitational acceleration, and $R$ is the corner radius. ECO mode uses relatively gentle acceleration (0–100 km/h in 20 s), 0.4 g braking deceleration, and a 90 km/h top-speed cap. SPORT mode releases the engine's full power, raises braking intensity to about 0.6 g, and determines braking points through multiple rounds of iterative optimization.

![Spa ECO speed and elevation curves](/images/projects/powertrain-cycle-simulation/spa-eco-profile.svg)

## Data validation and consistency calibration

Before the global comparison, we first checked the exported simulation data for completeness. In the early data wrangling, locale differences in number formats truncated some exported values at the decimal point, and the point-by-point cumulative fuel differed from the summary total by a factor of two. We used physical constraints to remove every ambiguous, anomalous record and kept only fully self-consistent results:
1. Fuel consumption and tailpipe CO₂ must strictly satisfy the 2392 g/l chemical-equivalent relation;
2. Per-distance energy use and the total energy of a 7.0 km lap must agree precisely;
3. Instantaneous tractive force and the integrated wheel energy must close continuously in physical terms.

## Comparing the four architectures

Under the unified input baseline, the simulated results of the four architectures on three typical cycles are:

| Test cycle | ICE (petrol) | HEV (full hybrid) | PHEV (full charge) | BEV (pure electric) |
|---|---|---|---|---|
| Spa ECO | 10.27 l / 245.7 g | 9.05 l / 216.5 g | 1.43 l / 34.2 g | 21.00 kWh / 96.7 g |
| Spa SPORT | 15.60 l / 373.1 g | 15.19 l / 363.3 g | 8.19 l / 196.0 g | 32.68 kWh / 148.4 g |
| NEDC | 6.62 l / 158.3 g | 6.46 l / 154.5 g | 0.79 l / 18.9 g | 15.30 kWh / 67.3 g |

*Note: fuel consumption is in l/100km, BEV energy use in kWh/100km, and CO₂ in g/km. The carbon figures for ICE, HEV, and PHEV are tailpipe emissions from direct fuel combustion; the BEV figures are converted emissions at a specific grid carbon intensity.*

![The four powertrains across the three cycles](/images/projects/powertrain-cycle-simulation/cycle-comparison.svg)

A few key observations from the comparison data:

- The HEV's fuel-saving potential is limited: only 0.41 l/100km less than the pure petrol car on Spa SPORT, and only 0.16 l/100km on NEDC. The small buffer battery can shave peaks and fill valleys during acceleration and deceleration, and recover some braking energy. But its capacity is limited, and the added weight of the hybrid system cancels a fair part of the savings.
- A fully charged PHEV performs very well: thanks to the high efficiency of electric drive and the stored charge, the PHEV cuts fuel use and tailpipe emissions by 86%–88% versus the ICE on Spa ECO and NEDC.
- Aggressive driving pushes consumption up sharply across all architectures: on the aggressive Spa SPORT cycle, aerodynamic drag grows with the square of speed (and power with the cube). Frequent hard acceleration pushes ICE fuel use to 15.60 l/100km, and BEV electricity use climbs from 15.30 kWh/100km to 32.68 kWh/100km.

![BEV energy use on NEDC and Spa](/images/projects/powertrain-cycle-simulation/bev-cycle-energy.png)

The fully charged PHEV's strong numbers led us to a further question. If the car sets off without enough charge, does the advantage survive?

## The nonlinear effect of initial SOC on PHEV efficiency

On the Spa ECO cycle we set 11 different initial SOC values (from 0% to 100% in 10% steps) to assess how sensitive the final fuel use is to starting charge:

| Initial SOC | Fuel consumption (l/100km) | Tailpipe CO₂ (g/km) |
|---:|---:|---:|
| 0% | 11.3 | 270.7 |
| 10% | 11.3 | 270.7 |
| 20% | 9.1 | 218.7 |
| 30% | 3.7 | 88.3 |
| 40% | 1.4 | 34.2 |
| 100% | 1.4 | 34.2 |

The data shows a clear nonlinear step:
1. Critical transition band: there is a key turning point between 20% and 40% initial SOC. Below 20%, the battery cannot provide enough pure-electric traction, and the engine is forced to engage early and for long stretches. Once the initial charge reaches 40% or more, the charge already covers most of the high-load conditions of this 7.0 km lap, and adding more starting charge improves the lap's fuel use by essentially nothing.
2. Energy-management control logic: the simulation traces show that when starting at 0%–20% charge, the controller actively uses the engine to generate electricity and recovers energy during driving, bringing the terminal SOC back up to a protective band of 6%–22%. At high initial SOC, the system prefers to discharge to reduce fuel use.

This result leads directly to the next core question. When the battery is completely drained and the PHEV becomes a petrol car "carrying a heavy battery and motor", what happens?

## The "deadweight penalty" after the battery runs out

Comparing the PHEV's energy use with a depleted battery against a full-charge start, the result reverses dramatically:

| Test cycle | PHEV (full charge) | PHEV (depleted) | Reference: ICE (pure petrol) |
|---|---|---|---|
| Spa ECO | 1.43 l / 34.2 g | 11.32 l / 270.6 g | 10.27 l / 245.7 g |
| Spa SPORT | 8.19 l / 196.0 g | 17.13 l / 409.4 g | 15.60 l / 373.1 g |
| NEDC | 0.79 l / 18.9 g | 7.20 l / 171.5 g | 6.62 l / 158.3 g |

With the battery depleted, the PHEV uses more fuel than the comparable pure petrol car in every cycle (about 10% higher on Spa ECO, about 9% higher on NEDC).

![PHEV with charge and with a depleted battery](/images/projects/powertrain-cycle-simulation/deadweight-comparison.svg)

The physical mechanism is clear:
- Mass penalty (deadweight penalty): the PHEV carries an extra traction battery and electric drive unit, making it about 300 kg heavier than the pure petrol version. The cumulative energy demanded at the wheels over one 7 km lap rises from 1.9 kWh for the petrol car to 2.3 kWh for the hybrid (an increase of more than 20%).
- Irreversible energy loss: regenerative braking can recover some downhill and braking kinetic energy, but the mechanical loss from rolling resistance is proportional to mass, and energy suffers inherent losses in the repeated conversions "kinetic $\rightarrow$ motor $\rightarrow$ battery $\rightarrow$ drive". When cheap electricity from the grid isn't available, the extra mass turns entirely into extra burden on the engine.

![Spa elevation and battery SOC](/images/projects/powertrain-cycle-simulation/spa-topography-soc.png)

In the plot of Spa's elevation against SOC, the PHEV's SOC briefly recovers in the downhill and repeated-braking sections, which directly confirms that kinetic energy recovery exists. But this local recovery is far from enough to offset the mass penalty borne through the whole lap's climbing and acceleration.

## Model limitations and engineering boundaries

When reading these conclusions, the applicable boundaries and assumptions of the backward quasi-static model must be stated:

1. Idealized trajectory tracking: the model assumes the car always strictly follows the target speed curve, with no gearbox shift shock, clutch slip, tyre slip, or real-driver deviations.
2. Missing auxiliary and thermal loads: the model does not count the energy of air conditioning, cabin heating, or low-voltage onboard electronics, nor the battery's internal-resistance change with temperature or engine cold-start heat losses.
3. Simplified regenerative braking: brake energy recovery uses a simplified fixed efficiency and brake-force split, without the dynamic safety limits of ABS/ESP intervention.
4. Parameter-calibration differences: the early exploratory parameters and the final defence data differ slightly in some mass definitions (such as the boundary between curb weight and unladen mass), so the absolute numbers are better suited to relative trend comparison between options than to strict production-car calibration data.

## The European operating context and regulations

Placing the simulation results in the context of current European passenger-car regulations and real roads gives a deeper industry picture:

- A generational gap between cycle standards: the NEDC cycle accelerates gently and cruises for long stretches, seriously underestimating consumption at high speed and under hard acceleration. [The European Commission has long pointed out that WLTP reflects modern driving behaviour more realistically](https://climate.ec.europa.eu/news-other-reads/news/car-and-van-manufacturers-meet-co2-emissions-targets-2016-2018-01-18_en), and since 2021 has based carbon-emission targets entirely on WLTP.
- A "utility factor" correction for real PHEV emissions: [the EU's official real-world monitoring report](https://climate.ec.europa.eu/document/download/b644dafe-1385-4b56-98d9-21e7e9f3601b_en?filename) notes that because many owners haven't built a habit of regular daily charging, the average real-road emissions of European PHEVs in 2021 reached 139.5 g CO₂/km, about 3.5 times the laboratory WLTP certified value (39.5 g/km). This matches the "empty-battery mass penalty" we simulated. In response, the EU sharply lowered the PHEV Utility Factor in new regulations such as Euro 6e-bis, forcing a more realistic share of electric driving.
- Spatial heterogeneity of grid carbon intensity: a BEV's lifecycle carbon advantage depends on how clean the grid is. According to [European Environment Agency (EEA) data](https://www.eea.europa.eu/en/analysis/indicators/greenhouse-gas-emission-intensity-of-1), the EU's average grid carbon intensity in 2024 was 183.4 g CO₂e/kWh, but the spread between countries is extreme (France, dominated by nuclear and clean hydro, is as low as about 36 g/kWh, while fossil-dependent Poland reaches 566 g/kWh). Assessing an electric car's environmental benefit has to account for the specific region and time of charging.

## Conclusions and future work

From this multi-angle dissection of the powertrain simulation data, we drew clear engineering conclusions:

1. There is no absolutely better or worse powertrain, only ones matched to a scenario. Battery-electric cars have a clear advantage in short trips with frequent acceleration and deceleration on a clean grid. A fully charged PHEV is an ideal low-carbon solution for short-to-medium trips, but only if it is charged often. The HEV offers a mild fuel saving with no change in refuelling habits, but the benefit narrows at high speed and heavy load.
2. Beware the "weight cost" of electrified cars: once its battery is depleted, a PHEV's real fuel use ends up higher than a conventional petrol car's, because of the hundreds of kilograms of electric-drive deadweight it carries.
3. Data-consistency checking is the first line of defence in engineering simulation: any simulation analysis must first establish energy-conservation and chemical-equivalence checks, to avoid distorted technical conclusions caused by unit-conversion or export errors.

Follow-up directions suggested by our instructor:
- Bring in the complete WLTP cycle and real-driving (RDE) trips, covering urban, rural, motorway, and continuous mountain roads.
- Bring in statistical charging-behaviour models and trip-chain distributions to build a more realistic probability distribution of PHEV initial SOC.
- Combined with the [EU Alternative Fuels Infrastructure Regulation (AFIR)](https://transport.ec.europa.eu/transport-themes/clean-transport/alternative-fuels-sustainable-mobility-europe/alternative-fuels-infrastructure/questions-and-answers-regulation-deployment-alternative-fuels-infrastructure-eu-20231804_en) requirement for fast-charging stations every 60 km along the main (TEN-T) corridors, simulate charging stops, charging power, and dynamic grid load on long cross-border trips.
- Feed in measured CAN bus signals and on-board fuel-consumption monitoring (OBFCM) data from real vehicles to close the loop on model calibration and accuracy validation.
