---
title: 'ESILV Powertrain Course Assignment: Comparing Four Powertrain Architectures'
year: 2025
date: '2025-12-06'
status: complete
categories: [tooling, validation]
tags: [Powertrain simulation]
summary: 'For our ESILV Powertrain course assignment, we used the teacher-supplied cycle and powertrain data to compare ICE, HEV, PHEV, and BEV energy use and CO₂.'
role: 'Course-assignment modelling, validation, and interpretation'
duration: '4 weeks'
academic:
  institution: 'ESILV'
  course: 'Powertrains & Vehicle Dynamics'
  assignment: 'Energy consumption and CO₂ simulation across driving cycles'
  requirements:
    - 'Run ICE, BEV, HEV, and PHEV versions of one vehicle over the supplied Spa and NEDC cycles.'
    - 'Resolve inertia, rolling resistance, aerodynamic drag, and grade at each cycle point.'
    - 'Report fuel, electrical energy, and CO₂ per distance for each architecture.'
    - 'Investigate how PHEV state of charge and depleted-battery mass change the result.'
featured: false
order: 20
studySequence: 4
heroImage: /images/projects/powertrain-cycle-simulation/spa-francorchamps-aerial.jpg
cardImageFit: cover
---

## Course data and assignment requirements

The teacher did not ask us to write a complex vehicle simulator from scratch. Instead, we were provided with extensive baseline simulation data. Most of the calculation relationships were already in place. Our task was to understand these datasets, configure appropriate parameters, verify the results, and compare energy consumption and CO₂ across powertrains.

The supplied data was comprehensive and covered:
- Powertrain architectures and vehicles: Conventional internal combustion engine (ICE), hybrid electric (HEV), plug-in hybrid (PHEV), and battery electric (BEV) models, including specific vehicle mass, motor power, battery capacity, engine efficiency maps, and transmission gear ratios for vehicles such as the Peugeot 308.
- Driving modes and circuits: Distance, elevation, and speed profiles for Belgium's Spa circuit under both economical (ECO) and aggressive (SPORT) driving modes, as well as European standard certification cycles such as NEDC and WLTP.
- Baseline operating characteristics: Acceleration and braking distances for various 0–100 km/h times, engine load-efficiency curves, and PHEV initial state of charge (SOC) settings from 0% to 100%.

We utilized this data by reading the vehicle's speed, elevation, and distance at each point, calculating acceleration, grade, rolling resistance, aerodynamic drag, and inertial forces, resolving the required wheel power, and converting that demand into fuel, electricity, and CO₂ based on component conversion efficiencies. On this basis, we could adjust vehicle mass, frontal area, drag coefficient, transmission efficiency, and initial SOC to evaluate the four powertrains and examine the sensitivity of PHEV performance to initial charge and depleted-battery mass.

## How we made the comparison fair

A fair comparison needs the same route and speed trace. Otherwise, a difference in consumption could come from the driver or the route rather than the powertrain. We therefore asked every vehicle model to follow the same prescribed trace. We used the supplied backward quasi-static model.

In plain terms, we started with the vehicle's speed, elevation, and distance at each point. We worked backwards to find the force needed at the wheels, then the wheel power, and finally the fuel or electricity required by each powertrain.

The broad 4×3 comparison uses the course reference model. The focused SOC and depleted-battery study uses a Peugeot 308 parameter set. We therefore interpret absolute values within each study rather than mixing the two sets.

For the focused Peugeot 308 study, the baseline parameter records used these inputs:

| Input | ICE | PHEV |
|---|---:|---:|
| Aerodynamic drag coefficient | 0.28 | 0.28 |
| Frontal area | 2.25 m² | 2.25 m² |
| Wheel diameter | 0.64 m | 0.64 m |
| Base vehicle mass | 1280 kg | 1443 kg |
| Electric motor mass | — | 50 kg |
| Archived battery mass | — | 110 kg |
| Maximum engine power | 96 kW | 110 kW |
| Gear ratios | 13.5 / 7.1 / 4.8 / 3.6 / 2.7 | 13.5 / 7.1 / 4.8 / 3.6 / 2.7 |
| Battery capacity | — | 12.4 kWh |
| Electric motor power | — | 81 kW |
| Battery / motor efficiency | — | 0.95 / 0.90 |

Using the same aerodynamics, wheels, and gear ratios makes the effects of architecture, mass, and energy management easier to compare. The power and mass values still differ, so this is not a perfect component-for-component controlled experiment.

For Spa, we estimated corner speed from the tyre-friction limit:

$$
v=\sqrt{\mu gR}.
$$

Here, $\mu$ is the tyre–road friction coefficient, $g$ is gravitational acceleration, and $R$ is corner radius. The ECO profile used a 20 s 0–100 km/h acceleration, 0.4 g braking, and a 90 km/h maximum speed. SPORT allowed faster acceleration, about 0.6 g braking, and a maximum speed set by engine capability. We placed the SPORT braking points by manual iteration.

![Spa ECO speed and elevation profile](/images/projects/powertrain-cycle-simulation/spa-eco-profile.svg)

At each point, we calculated road load with:

$$
F=ma+fmg+\frac{1}{2}\rho C_xSv^2+mg\sin\theta.
$$

The four terms are inertia, rolling resistance, aerodynamic drag, and grade resistance. Wheel power is $Fv$. The model then applies drivetrain and conversion efficiencies to calculate fuel or electrical energy. Petrol CO₂ uses 2392 g per litre of fuel. The hybrid calculations also include the motor and battery efficiency chain. The PHEV uses available battery energy before relying more heavily on its engine.

## How we checked the numbers

Before comparing the outputs, we had to decide which exported values we could trust. The files used a regional number format, and our first reading did not preserve the decimal values correctly. We also found that the point-by-point fuel sum was exactly twice the summary record.

We did not use the doubled total. After putting the numbers into one format, we kept only the results that agreed with one another. Fuel use and fuel-derived CO₂ had to match the 2392 g/l factor. The per-kilometre value also had to reproduce the total record when applied to the 7.0 km lap. Only values whose energy, CO₂, distance, and totals all agreed entered the comparison.

## What the four powertrains showed

| Cycle | ICE | HEV | PHEV | BEV |
|---|---|---|---|---|
| Spa ECO | 10.27 l / 245.7 g | 9.05 l / 216.5 g | 1.43 l / 34.2 g | 21.00 kWh / 96.7 g |
| Spa SPORT | 15.60 l / 373.1 g | 15.19 l / 363.3 g | 8.19 l / 196.0 g | 32.68 kWh / 148.4 g |
| NEDC | 6.62 l / 158.3 g | 6.46 l / 154.5 g | 0.79 l / 18.9 g | 15.30 kWh / 67.3 g |

Fuel consumption is in l/100km, BEV energy consumption is in kWh/100km, and CO₂ is in g/km. The ICE, HEV, and PHEV CO₂ values are fuel-derived tailpipe emissions. The BEV value is an electricity-side scenario result, not a tailpipe value.

![Four powertrains across three driving cycles](/images/projects/powertrain-cycle-simulation/cycle-comparison.svg)

The HEV improvement is modest in these cases. It saves 0.41 l/100km relative to the ICE on Spa SPORT and 0.16 l/100km on NEDC. Its small buffer battery can smooth engine operation and recover some braking energy, but its limited energy capacity and added mass constrain the benefit.

The PHEV with usable charge uses much less fuel: 86% less than the ICE on Spa ECO and 88% less on NEDC. These are fuel and tailpipe-CO₂ comparisons, not full life-cycle claims, because the table excludes the emissions associated with charging the PHEV.

Harder driving increased energy use for every architecture. The Spa SPORT ICE result is about twice its NEDC fuel consumption, while BEV electricity use rises from 15.30 to 32.68 kWh/100km. Aerodynamic drag grows with $v^2$, and the power needed to overcome it grows approximately with $v^3$. High speed and strong acceleration therefore raise demand whatever the energy source.

![BEV energy use on NEDC and Spa](/images/projects/powertrain-cycle-simulation/bev-cycle-energy.png)

The PHEV looks best in the table, but only while it has usable charge. That led to the next question: how much did the starting state of charge change the result?

## How starting SOC changed the PHEV

We tested 11 initial SOC values on Spa ECO, from 0% to 100% in 10% steps. The table keeps the transition points and endpoints.

| Initial SOC | Fuel consumption (l/100km) | CO₂ (g/km) |
|---:|---:|---:|
| 0% | 11.3 | 270.7 |
| 10% | 11.3 | 270.7 |
| 20% | 9.1 | 218.7 |
| 30% | 3.7 | 88.3 |
| 40% | 1.4 | 34.2 |
| 100% | 1.4 | 34.2 |

Every tested point from 40% through 100% rounded to the same result: 1.4 l/100km and 34.2 g/km. For this vehicle on this 7.0 km cycle, the transition lies roughly between 20% and 40% initial SOC. It is not an exact or universal threshold. Below this range, the engine supplies a rapidly growing share of traction energy. Above it, more starting charge does not lower the rounded fuel result for this lap.

The SOC traces also show how the controller behaves during the lap. From initial values of 0%, 10%, and 20%, SOC rises and ends at about 6%, 16%, and 22%. The 30% case also finishes near 22%, while the 40% case falls to about 28%. In plain terms, the model protects or rebuilds some charge when SOC is low and draws more traction power from the battery when SOC is higher. These values describe this control logic on this lap only.

The low-SOC results raised another question. What happens when the vehicle still carries the battery and motor mass but has little usable electric energy?

## What happened when the battery was depleted

| Cycle | PHEV with charge | PHEV depleted |
|---|---|---|
| Spa ECO | 1.43 l / 34.2 g | 11.32 l / 270.6 g |
| Spa SPORT | 8.19 l / 196.0 g | 17.13 l / 409.4 g |
| NEDC | 0.79 l / 18.9 g | 7.20 l / 171.5 g |

With the battery depleted, the PHEV uses more fuel than the ICE on Spa ECO: 11.32 versus 10.27 l/100km. The same reversal appears on NEDC: 7.20 versus 6.62 l/100km.

![PHEV with usable charge and with a depleted battery](/images/projects/powertrain-cycle-simulation/deadweight-comparison.svg)

Extra mass increases the energy needed for acceleration and rolling resistance. Regenerative braking can recover part of the vehicle's kinetic energy, but it cannot remove rolling losses or the conversion losses incurred as energy passes through the motor and battery. With little usable battery energy left, the engine carries that mass without receiving the full electric-driving benefit.

In the defence presentation, cumulative wheel traction energy over the 7 km lap ends at about 1.9 kWh for the petrol case and about 2.3 kWh for both hybrid cases. These approximate, model-specific values show the mass effect at the wheels. Changing the starting SOC changes where the energy comes from, but it does not change the wheel energy needed to move the same heavier PHEV along the same speed trace.

The Spa topography plot adds another detail: PHEV SOC stays roughly between 29% and 32% and briefly rises during several braking or descending sections. This is consistent with regeneration recovering some energy. The plot does not quantify how much energy was recovered, however, and it cannot prove that altitude alone caused each SOC increase.

![Spa elevation and battery SOC](/images/projects/powertrain-cycle-simulation/spa-topography-soc.png)

## What the model cannot tell us

These results stay inside the model's boundaries. The vehicle follows a prescribed speed trace exactly. The model does not include shift transients, tyre slip, a driver model, cabin loads, thermal behaviour, or component ageing. We set the SPORT braking points by manual iteration, so the trajectory includes our judgement. Regeneration follows simplified control and efficiency assumptions; the model does not show that all physically available braking energy can be recovered.

The parameter records also differ between the earlier files and the final presentation. The records list a 110 kg battery and a total mass of about 1683 kg. The presentation reports 165.3 kg and 1718 kg. It also labels 1443 kg as the hybrid unladen mass, then adds the battery and motor masses to reach 1718 kg. We therefore compare absolute values only within the same dataset or study. Cross-study absolute comparisons require one unified parameter set, and the simulated mass components need explicit definitions next time.

## How to read these results in Europe

The model boundaries matter when we put the results into a European context. NEDC gives us a common laboratory case, but the [European Commission explains that WLTP represents real driving better](https://climate.ec.europa.eu/news-other-reads/news/car-and-van-manufacturers-meet-co2-emissions-targets-2016-2018-01-18_en). WLTP became mandatory for new vehicle types in September 2017 and for all new passenger cars in September 2018. EU CO₂ targets have used WLTP since 2021. Our NEDC result is therefore a comparison case, not a prediction of present-day European use.

PHEV charging behaviour also changes how a PHEV should be read. The [European Commission's first real-world monitoring report](https://climate.ec.europa.eu/document/download/b644dafe-1385-4b56-98d9-21e7e9f3601b_en?filename) reported that 2021 PHEVs averaged 139.5 g CO₂/km in real use and 39.5 g/km under WLTP. The real-world value was 3.5 times higher. Actual charging and the electric share of travel are central to this gap, and EU utility-factor revisions apply in stages from 2025 and 2027. Our SOC sweep shows why the starting charge and charging assumption must be stated with a PHEV result.

The electricity mix changes the BEV result as well. Earlier records used a fixed factor of about 450 g CO₂/kWh. The [European Environment Agency reports](https://www.eea.europa.eu/en/analysis/indicators/greenhouse-gas-emission-intensity-of-1) an EU average of 183.44 g CO₂e/kWh in 2024, 11% below 2023. National values ranged from 36 in France to 566 in Poland. A European BEV comparison must therefore state the country, time period, and accounting boundary. Our BEV table is one electricity scenario, not a universal carbon ranking.

## What the course assignment showed

With those limits in place, the original question has a clear answer. The powertrain, driving cycle, and available battery charge all changed the result. The PHEV with usable charge had the lowest fuel and tailpipe-CO₂ values in the retained cases, but the depleted PHEV used more fuel than the ICE on Spa ECO and NEDC. Harder speed traces increased energy use for every architecture. The BEV carbon value depended on the assumed electricity mix.

The data check was part of that answer. We kept the results whose fuel, CO₂, distance, and summary data agreed, rather than every value we could export.

## What we would study next in Europe

The following items are future work, not completed parts of this assignment:

- Replace NEDC with WLTP and measured European urban, rural, motorway, and mountain trips.
- Model charging behaviour, utility factors, and realistic initial-SOC distributions instead of one starting condition.
- Use country- and time-dependent electricity intensity instead of one fixed factor, especially for systems as different as France and Poland.
- Add ambient temperature, cabin heating and cooling, battery and engine thermal states, and battery ageing.
- Add route-level charging opportunities. Under the [EU Alternative Fuels Infrastructure Regulation](https://transport.ec.europa.eu/transport-themes/clean-transport/alternative-fuels-sustainable-mobility-europe/alternative-fuels-infrastructure/questions-and-answers-regulation-deployment-alternative-fuels-infrastructure-eu-20231804_en), consecutive light-duty charging pools on the TEN-T network are to be no more than 60 km apart. A cross-border study could test route, dwell time, charger power, and availability.
- Validate the model with a real vehicle using on-board fuel consumption monitoring (OBFCM) or synchronized CAN data, then quantify error by cycle and operating condition.
