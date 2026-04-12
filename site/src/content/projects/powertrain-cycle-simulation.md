---
title: 'Vehicle Powertrain Cycle Simulation: Comparing Four Architectures'
year: 2025
date: '2025-12-06'
status: complete
categories: [tooling, validation]
tags: [Powertrain simulation]
summary: 'Using a comprehensive course-provided powertrain dataset, we applied backward quasi-static modelling to systematically compare ICE, HEV, PHEV, and BEV energy consumption and CO₂ emissions, quantifying PHEV initial SOC sensitivity and depleted-battery mass penalty.'
role: 'Powertrain modelling, data validation, and energy analysis'
duration: '4 weeks'
academic:
  institution: 'ESILV'
  course: 'Powertrains & Vehicle Dynamics'
  assignment: 'Powertrain energy consumption and CO₂ simulation across driving cycles'
  requirements:
    - 'Simulate ICE, BEV, HEV, and PHEV variants of a vehicle over Spa-Francorchamps and NEDC driving cycles.'
    - 'Resolve inertia, rolling resistance, aerodynamic drag, and road grade at each cycle time step.'
    - 'Quantify fuel consumption, electrical energy demand, and CO₂ emissions per unit distance.'
    - 'Investigate the sensitivity of PHEV performance to initial SOC and quantify the depleted-battery mass penalty.'
featured: false
order: 20
studySequence: 4
heroImage: /images/projects/powertrain-cycle-simulation/spa-francorchamps-aerial.jpg
cardImageFit: cover
---

## Background and Simulation Datasets

The goal of this project was not to construct a low-level dynamic solver from scratch, but to conduct a rigorous, physics-based evaluation of different vehicle powertrain architectures using a rich set of baseline simulation and cycle data.

The course provided extensive datasets covering multiple engineering dimensions:

- **Powertrain Architectures and Vehicle Parameters**: Detailed specifications for Conventional Internal Combustion Engine (ICE), Hybrid Electric (HEV), Plug-in Hybrid (PHEV), and Battery Electric (BEV) vehicles. Using the Peugeot 308 as the primary reference platform, the dataset included curb weights, motor power ratings, battery capacities, engine efficiency maps, and transmission gear ratios.
- **Driving Cycles and Track Topography**: Precise distance, elevation, grade, and velocity profiles for Belgium's Circuit de Spa-Francorchamps, divided into an economical ECO profile and an aggressive SPORT profile, alongside standard European certification cycles (NEDC and WLTC velocity sequences).
- **Dynamic Characteristics and Operating Profiles**: Acceleration and braking limits (0–100 km/h times and deceleration rates), engine load-versus-efficiency relationships, and PHEV initial state of charge (SOC) conditions ranging from 0% to 100%.

By leveraging these integrated datasets, we established a standardized evaluation pipeline. By enforcing identical driving traces and environmental conditions, we inverted the road-load equations to calculate instantaneous wheel demand, propagated energy flows through each powertrain's conversion chain, and benchmarked energy consumption and carbon emissions across architectures.

## Baseline Setup and Quasi-Static Methodology

To ensure a fair comparison, all vehicle variants had to track the exact same speed and distance profile, eliminating discrepancies caused by driver behaviour or route topography.

We implemented a backward quasi-static simulation model. Given the target vehicle speed $v$, acceleration $a$, distance, and road inclination $\theta$ at each time step, the total tractive force required at the wheel contact patch $F$ is resolved as:

$$
F = ma + fmg + \frac{1}{2}\rho C_x S v^2 + mg\sin\theta.
$$

The four terms represent inertial force, rolling resistance, aerodynamic drag, and grade resistance, respectively. The required wheel power is $P_{\text{wheel}} = Fv$. The model then applies drivetrain transmission efficiencies, engine brake-specific fuel consumption maps, or motor/battery efficiency chains to determine instantaneous fuel or electrical energy consumption. Petrol CO₂ emissions were computed using a standard factor of 2392 g/l.

For the core vehicle comparison, the reference Peugeot 308 parameters were configured as follows:

| Parameter | ICE (Petrol) | PHEV (Plug-in Hybrid) |
|---|---:|---:|
| Aerodynamic drag coefficient $C_x$ | 0.28 | 0.28 |
| Frontal area $S$ | 2.25 m² | 2.25 m² |
| Wheel diameter | 0.64 m | 0.64 m |
| Base vehicle mass | 1280 kg | 1443 kg |
| Electric motor mass | — | 50 kg |
| Battery system mass | — | 110 kg |
| Maximum engine power | 96 kW | 110 kW |
| Overall gear ratios | 13.5 / 7.1 / 4.8 / 3.6 / 2.7 | 13.5 / 7.1 / 4.8 / 3.6 / 2.7 |
| Traction battery capacity | — | 12.4 kWh |
| Electric motor power | — | 81 kW |
| Battery / motor nominal efficiency | — | 0.95 / 0.90 |

Sharing identical aerodynamic geometry, rolling dimensions, and gear ratios isolates the direct physical impacts of powertrain architecture, curb weight, and energy management strategies.

For the Spa circuit, cornering speeds were bounded by the tyre adhesion limit:

$$
v = \sqrt{\mu g R}.
$$

Here $\mu$ is the tyre–road friction coefficient, $g$ is gravitational acceleration, and $R$ is the corner radius. The ECO mode utilized a relaxed acceleration profile (0–100 km/h in 20 s), 0.4 g braking deceleration, and a 90 km/h top speed cap. The SPORT mode leveraged full engine power with braking intensities reaching ~0.6 g, with braking points tuned via iterative trajectory matching.

![Spa ECO speed and elevation profile](/images/projects/powertrain-cycle-simulation/spa-eco-profile.svg)

## Data Validation and Consistency Alignment

Prior to cross-comparison, we conducted a rigorous sanity check on all exported simulation data. An initial audit revealed locale-specific formatting issues that led to decimal truncation, as well as a 2x discrepancy between point-by-point fuel integration and summary outputs.

We established strict conservation and consistency criteria to discard anomalous records:
1. Fuel consumption and tailpipe CO₂ were strictly held to the 2392 g/l stoichiometric ratio;
2. Distance-normalized energy figures had to match the 7.0 km total lap integral within numerical tolerance;
3. Instantaneous tractive force and cumulative wheel energy had to satisfy physical continuity.

## Cross-Powertrain Consumption Comparison

Under unified boundary conditions, the simulation yielded the following consumption and emissions metrics across the test cycles:

| Test Cycle | ICE (Petrol) | HEV (Full Hybrid) | PHEV (Full Charge) | BEV (Pure Electric) |
|---|---|---|---|---|
| Spa ECO | 10.27 l / 245.7 g | 9.05 l / 216.5 g | 1.43 l / 34.2 g | 21.00 kWh / 96.7 g |
| Spa SPORT | 15.60 l / 373.1 g | 15.19 l / 363.3 g | 8.19 l / 196.0 g | 32.68 kWh / 148.4 g |
| NEDC | 6.62 l / 158.3 g | 6.46 l / 154.5 g | 0.79 l / 18.9 g | 15.30 kWh / 67.3 g |

*Note: Fuel consumption is reported in l/100km, electrical consumption in kWh/100km, and CO₂ in g/km. ICE, HEV, and PHEV values represent direct tailpipe combustion emissions; BEV carbon figures reflect grid-scenario conversions.*

![Four powertrains across three driving cycles](/images/projects/powertrain-cycle-simulation/cycle-comparison.svg)

Key insights emerge from the comparative data:

- **Diminishing Returns for Full Hybrids (HEV)**: The HEV achieved only modest savings—0.41 l/100km on Spa SPORT and 0.16 l/100km on NEDC relative to ICE. While its small buffer battery recaptures braking energy and buffers transient engine loads, its limited electrical storage and extra system mass constrain overall efficiency gains.
- **Superior Efficiency of Fully Charged PHEVs**: Benefiting from high electric powertrain efficiency and stored grid charge, the PHEV reduced fuel consumption and tailpipe CO₂ by 86%–88% on Spa ECO and NEDC relative to ICE.
- **Aggressive Driving Multiplies Energy Demand Across All Platforms**: In the high-dynamic Spa SPORT cycle, aerodynamic drag scaling with $v^2$ (and power with $v^3$) caused ICE fuel consumption to jump to 15.60 l/100km, while BEV electrical consumption doubled from 15.30 to 32.68 kWh/100km.

![BEV energy use on NEDC and Spa](/images/projects/powertrain-cycle-simulation/bev-cycle-energy.png)

The strong performance of the PHEV immediately raises a critical operational question: **How robust is this efficiency advantage if the vehicle starts with a depleted battery?**

## Initial SOC Sensitivity Analysis

We evaluated the PHEV over the Spa ECO cycle across 11 distinct starting state of charge (SOC) levels, from 0% to 100% in 10% increments:

| Initial SOC | Fuel Consumption (l/100km) | Tailpipe CO₂ (g/km) |
|---:|---:|---:|
| 0% | 11.3 | 270.7 |
| 10% | 11.3 | 270.7 |
| 20% | 9.1 | 218.7 |
| 30% | 3.7 | 88.3 |
| 40% | 1.4 | 34.2 |
| 100% | 1.4 | 34.2 |

The results exhibit pronounced non-linear behaviour:
1. **Critical Transition Regime**: A sharp inflection occurs between 20% and 40% initial SOC. Below 20%, the battery cannot sustain pure electric driving, forcing the internal combustion engine to engage early and frequently. Above 40%, the electrical buffer is sufficient to satisfy the high-demand segments of this 7.0 km lap, yielding negligible marginal fuel savings for higher starting charges.
2. **Energy Management Control Strategy**: Starting with low charge (0%–20%), the supervisory controller actively charges the battery via engine load-point shifting and regenerative braking, returning the terminal SOC to a protective 6%–22% window. At higher initial SOC, the system aggressively depletes stored energy to minimize fuel use.

This highlights the next structural issue: **What happens when the battery is completely exhausted, and the PHEV operates essentially as a heavy petrol car?**

## Depleted Battery Operation and the "Deadweight Penalty"

Comparing the PHEV with a fully depleted battery against its fully charged state reveals a dramatic reversal:

| Test Cycle | PHEV (Fully Charged) | PHEV (Battery Depleted) | Baseline: ICE (Pure Petrol) |
|---|---|---|---|
| Spa ECO | 1.43 l / 34.2 g | 11.32 l / 270.6 g | 10.27 l / 245.7 g |
| Spa SPORT | 8.19 l / 196.0 g | 17.13 l / 409.4 g | 15.60 l / 373.1 g |
| NEDC | 0.79 l / 18.9 g | 7.20 l / 171.5 g | 6.62 l / 158.3 g |

When depleted, the PHEV's fuel consumption **exceeds that of the conventional ICE across all test cycles** (~10% higher on Spa ECO, ~9% higher on NEDC).

![PHEV with usable charge and with a depleted battery](/images/projects/powertrain-cycle-simulation/deadweight-comparison.svg)

The underlying physics is straightforward:
- **The Deadweight Penalty**: Carrying an on-board traction battery and electric motor adds approximately 300 kg of mass. Over the 7.0 km lap, cumulative wheel tractive energy rose from 1.9 kWh for the ICE to 2.3 kWh for the hybrid variants (a >20% increase in mechanical work).
- **Irreversible Mechanical Losses**: Although regenerative braking captures some downhill and deceleration energy, rolling resistance scales directly with vehicle mass. Furthermore, round-trip energy conversion (kinetic $\rightarrow$ electrical $\rightarrow$ chemical $\rightarrow$ mechanical) incurs inherent losses. Without external charging, this deadweight becomes a pure parasitic load on the engine.

![Spa elevation and battery SOC](/images/projects/powertrain-cycle-simulation/spa-topography-soc.png)

The elevation and SOC profile of the Spa circuit shows brief recovery spikes during downhill segments and braking zones, verifying regenerative recapture. However, these local recoveries are insufficient to offset the continuous gravitational and rolling losses sustained across the entire lap.

## Model Assumptions and Limitations

To properly contextualize these findings, several model boundaries must be highlighted:

1. **Idealized Trajectory Following**: The model assumes exact speed-profile tracking without considering transmission shift delays, clutch slippage, tyre slip, or realistic driver pedal modulations.
2. **Omission of Auxiliary and Thermal Loads**: Ancillary power draw (HVAC, cabin conditioning, 12V electronics) was not simulated, nor were temperature-dependent battery internal resistance or engine cold-start inefficiencies.
3. **Simplified Regenerative Control**: Brake energy recuperation utilized idealized efficiency curves rather than dynamic ABS/ESP slip-control limits.
4. **Parameter Harmonization**: Minor differences existed between early exploratory parameter sets and finalized presentation figures regarding gross versus unladen vehicle mass definitions. The reported numerical values represent comparative engineering trends rather than absolute homologation measurements.

## European Real-World Context and Regulations

Interpreting these findings within the contemporary European automotive landscape offers meaningful regulatory and operational takeaways:

- **Certification Cycles vs. Real-World Driving**: The legacy NEDC cycle features gentle accelerations that drastically underestimate dynamic consumption. The [European Commission mandates WLTP](https://climate.ec.europa.eu/news-other-reads/news/car-and-van-manufacturers-meet-co2-emissions-targets-2016-2018-01-18_en) as a far more representative baseline for fleet emissions targets since 2021.
- **PHEV Real-World Emissions and Utility Factor Revisions**: The [European Commission's official monitoring data](https://climate.ec.europa.eu/document/download/b644dafe-1385-4b56-98d9-21e7e9f3601b_en?filename) revealed that real-world PHEV emissions in 2021 averaged 139.5 g CO₂/km—approximately 3.5 times higher than their official WLTP rating of 39.5 g/km. This divergence stems directly from infrequent consumer charging, validating our simulated "deadweight penalty". In response, upcoming Euro 6e-bis regulations significantly reduce the statutory Utility Factor (UF) to reflect real electric driving shares.
- **Spatial Heterogeneity of Grid Carbon Intensity**: The lifecycle carbon advantage of BEVs is governed by grid generation mix. According to [European Environment Agency (EEA) data](https://www.eea.europa.eu/en/analysis/indicators/greenhouse-gas-emission-intensity-of-1), the 2024 EU average carbon intensity stood at 183.4 g CO₂e/kWh, ranging from ~36 g/kWh in nuclear- and hydro-powered France to 566 g/kWh in coal-dependent Poland. Any comparative assessment must account for regional charging location and time.

## Conclusions and Future Work

This multi-dimensional analysis delivers clear engineering conclusions:

1. **Powertrain Effectiveness Depends on Duty Cycle**: Pure electric vehicles excel in urban, stop-and-go conditions under a decarbonized grid; fully charged PHEVs offer outstanding short-to-medium range decarbonization but require disciplined charging; HEVs offer passive efficiency gains without behavioural change, though benefits taper under heavy highway load.
2. **The High Cost of Uncharged Electrification**: Operating a PHEV with a depleted battery incurs a quantifiable fuel consumption penalty over a pure petrol car due to unmitigated deadweight.
3. **Data Consistency Is Fundamental to Simulation Integrity**: Establishing conservation checks (mass, stoichiometric conversion, and energy closure) is essential to prevent erroneous design conclusions.

**Future Research Directions**:
- Integrate complete multi-phase WLTP and Real Driving Emissions (RDE) cycles across urban, rural, highway, and mountain routes.
- Implement probabilistic charging behaviour models to synthesize realistic initial-SOC distributions.
- Model long-distance route planning incorporating the [EU Alternative Fuels Infrastructure Regulation (AFIR)](https://transport.ec.europa.eu/transport-themes/clean-transport/alternative-fuels-sustainable-mobility-europe/alternative-fuels-infrastructure/questions-and-answers-regulation-deployment-alternative-fuels-infrastructure-eu-20231804_en), evaluating 60 km fast-charging spacing on TEN-T corridors, dwell times, and grid load.
- Calibrate the model against synchronized CAN bus and On-Board Fuel Consumption Monitoring (OBFCM) data from production vehicles.
