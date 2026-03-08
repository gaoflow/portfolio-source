---
title: 'How I Compared Energy Use and CO₂ Across Four Powertrains'
year: 2025
date: '2025-12-06'
status: complete
categories: [tooling, validation]
tags: [Coding]
summary: 'I parameterised the course-provided point-by-point Excel simulator, built the Spa cycle, ran four powertrain scenarios, and post-processed the results with pandas. A charged PHEV used the least fuel on the Spa ECO lap, but an empty battery made it thirstier than the conventional petrol car.'
role: 'Individual parameter study and post-processing'
duration: '4 weeks'
academic:
  institution: 'ESILV'
  course: 'Powertrains & Vehicle Dynamics'
  assignment: 'Energy consumption and CO₂ simulation across driving cycles'
  note: 'The original course brief required a team of three to complete the base model and presentation, with each student adding an individual parameter study. My traceable work includes the Excel parameterisation, Spa speed profile, scenario runs for all four powertrains, pandas post-processing, and the studies of initial SOC and empty-battery dead weight. The surviving archive does not record the other two students’ names, so I do not speculate about the team roster.'
  requirements:
    - 'Run ICE, BEV, HEV and PHEV versions of one vehicle over supplied Spa, NEDC and WLTP-style cycles.'
    - 'Resolve inertia, rolling resistance, aerodynamic drag and grade at each cycle point.'
    - 'Report fuel, electrical energy and CO₂ per distance for each architecture.'
    - 'Complete an individual parameter study; this submission investigates battery SOC and empty-battery dead weight.'
  media:
    - src: '/images/projects/powertrain-cycle-simulation/source/original-assignment-page-1.webp'
      alt: 'First page of the original powertrain-cycle course assignment'
      caption: 'The original brief asks students to compare ICE, BEV, HEV and PHEV vehicles over specified cycles and report energy use and CO₂ per distance. It also states that the base presentation is team work for three students and that each student must add an individual parameter study.'
    - src: '/images/projects/powertrain-cycle-simulation/assignment-workflow.svg'
      alt: 'Cycle inputs passing through road-load and powertrain calculations to energy and carbon dioxide outputs'
      caption: 'The assignment chain: speed, grade and distance become road-load forces, followed by wheel power, powertrain energy and CO₂.'
    - src: '/images/projects/powertrain-cycle-simulation/spa-eco-profile.svg'
      alt: 'Spa ECO speed and elevation profiles plotted against lap distance'
      caption: 'The Spa input is highly nonuniform. Every acceleration, braking zone and elevation change enters the point-by-point model.'
featured: false
order: 20
studySequence: 4
heroImage: /images/projects/powertrain-cycle-simulation/cycle-comparison.svg
---

## What I wanted to find out

The course asked us to compare four versions of the same vehicle under the same driving conditions: a conventional petrol car, or ICE; a hybrid electric vehicle, or HEV; a plug-in hybrid, or PHEV; and a battery electric vehicle, or BEV.

The base model and presentation were assigned to a team of three, while each student also had to complete an individual parameter study. The course supplied the point-by-point Excel simulator, adapted from a ULiege vehicle-performance teaching project.

My traceable contribution covers the vehicle parameterisation, the Spa speed profile, the four powertrain scenarios, CSV and pandas post-processing, and two PHEV studies: the effect of initial state of charge and the penalty of carrying an empty battery.

## How I turned a lap into energy use

The model is backward-facing and quasi-static. I first define the vehicle's speed and the road grade at each point, then work backwards to calculate the power that the wheels and powertrain must provide.

For the Spa ECO profile, I estimated cornering speed from the tyre friction limit:

$$
v=\sqrt{\mu gR}.
$$

ECO mode limits the 0–100 km/h acceleration time to 20 seconds, braking deceleration to 0.4 g, and top speed to 90 km/h. SPORT mode allows faster acceleration, raises braking to about 0.6 g, and sets top speed according to engine capability. I found the SPORT braking points by iteration.

At each trajectory point, the model calculates four road-load terms:

$$
F=ma+fmg+\frac{1}{2}\rho C_xSv^2+mg\sin\theta.
$$

These terms represent inertia, rolling resistance, aerodynamic drag, and grade resistance. Wheel power is $Fv$. The model then uses drivetrain efficiency, engine efficiency, and the fuel's lower heating value to calculate fuel consumption. Petrol CO₂ is based on an emission factor of 2392 g per litre.

The hybrid models add a motor and battery efficiency chain. In my parameterisation, battery efficiency is 0.95 and motor efficiency is 0.90. The PHEV uses the battery first and progressively brings in the engine when the available charge is no longer sufficient.

## Vehicle parameters

The course reference ICE is a compact car weighing about 1300 kg, with $C_x=0.31$, a frontal area of 2.69 m², 115 CV, and a five-speed gearbox.

My own parameterisation used Peugeot 308 data. The petrol version weighs 1280 kg. The hybrid version adds a 50 kg electric machine and a 110 kg, 12.4 kWh battery. Its electric motor is rated at 81 kW.

The main 4×3 comparison uses the reference vehicle from the assignment. The SOC and empty-battery mass studies use my 308 parameterisation. Absolute values should therefore be compared within each study, not across the parameter-set boundary.

## Two problems in the exported data

My first pandas import failed because every parsed column became `NaN`. The exported files used French regional formatting: semicolons separated the fields, while commas marked decimal values. The default `read_csv` settings could not interpret that structure correctly.

I corrected the loader so that it detects the separator and converts decimal commas before processing the numerical columns.

A second problem was less obvious. Summing the point-by-point fuel column in a CSV produced exactly twice the total recorded in the summary workbook. The workbook's own fuel and CO₂ values remained internally consistent. For example, a 7.0 km lap at 225.6 g CO₂/km gives 1579.2 g of CO₂ over the lap. This showed that the discrepancy came from the point-by-point export's counting convention rather than the normalised workbook result.

I therefore retained the normalised results from the summary workbooks. I checked all 15 petrol-vehicle rows by multiplying fuel consumption in l/100km by 23.92 to recover CO₂ in g/km. I also checked that each SOC workbook total agreed with its per-kilometre result over the same 7.0 km distance.

## Results across four powertrains

| Cycle | ICE | HEV | PHEV | BEV |
|---|---|---|---|---|
| Spa ECO | 10.27 l / 245.7 g | 9.05 l / 216.5 g | 1.43 l / 34.2 g | 21.00 kWh / 96.7 g |
| Spa SPORT | 15.60 l / 373.1 g | 15.19 l / 363.3 g | 8.19 l / 196.0 g | 32.68 kWh / 148.4 g |
| NEDC | 6.62 l / 158.3 g | 6.46 l / 154.5 g | 0.79 l / 18.9 g | 15.30 kWh / 67.3 g |

Fuel consumption is in l/100km, BEV energy consumption is in kWh/100km, and CO₂ is in g/km.

Three results stand out.

First, the HEV improvement is small. On Spa SPORT, it saves 0.41 l/100km compared with the ICE. On NEDC, the saving is only 0.16 l/100km. The 1.5 kWh buffer battery can smooth the engine load, but it cannot transfer much energy, while its additional mass offsets part of the benefit.

Second, the charged PHEV has a clear advantage. It uses 86% less fuel than the ICE on Spa ECO and 88% less on NEDC because the battery covers almost the whole cycle.

Third, cycle severity affects every architecture. The Spa SPORT ICE result is roughly twice its NEDC consumption. BEV energy use rises from 15.30 kWh/100km on NEDC to 32.68 kWh/100km on Spa SPORT. Aerodynamic drag grows with $v^2$, while the power needed to overcome it grows approximately with $v^3$, so high speed and aggressive acceleration increase energy demand for all four powertrains.

## How initial charge changes the PHEV result

I reran the Spa ECO cycle at four initial states of charge:

| Initial SOC | Fuel consumption (l/100km) | CO₂ (g/km) |
|---|---:|---:|
| 0, empty | 10.9 | 260.0 |
| 0.25 | 8.5 | 202.2 |
| 0.30 | 5.3 | 126.3 |
| 1.00, full | 0.0 | 1.2 |

![Effect of initial PHEV state of charge on fuel consumption and CO₂](/images/projects/powertrain-cycle-simulation/soc-sensitivity.svg)

The largest change occurs between SOC 0.25 and 0.30. Once the battery can no longer cover the whole lap, the engine runs for increasingly long sections. As SOC falls further, the PHEV behaves more like a heavier HEV.

The remaining 1.2 g/km at full charge comes from the small amount of fuel still recorded by the controller. The complete lap CSV contains 0.006 l of fuel use in that case.

## Why an empty battery becomes a mass penalty

The battery and electric machine add about 160 kg. When the battery has charge, that mass provides electric-driving capability. Once the battery is empty, the engine must carry the additional weight without receiving the same electric benefit.

| Cycle | PHEV charged | PHEV empty |
|---|---|---|
| Spa ECO | 1.43 l / 34.2 g | 11.32 l / 270.6 g |
| Spa SPORT | 8.19 l / 196.0 g | 17.13 l / 409.4 g |
| NEDC | 0.79 l / 18.9 g | 7.20 l / 171.5 g |

![Charged and empty-battery PHEV comparison](/images/projects/powertrain-cycle-simulation/deadweight-comparison.svg)

The empty PHEV uses more fuel than the conventional ICE on all three cycles. On Spa ECO, the comparison is 11.32 against 10.27 l/100km. On NEDC, it is 7.20 against 6.62 l/100km.

This is why a representative PHEV fuel figure cannot be separated from its initial SOC. The results of 1.43 and 11.32 l/100km come from the same parameterised vehicle; the difference is whether the battery begins the cycle with enough charge.

## Limits

The model assumes that the vehicle follows the prescribed speed profile exactly. It does not include gear-shift transients, wheel slip, thermal state, or a driver model. I also found the SPORT braking points through manual iteration.

The BEV CO₂ results depend on one assumed grid carbon intensity. Working backwards from the workbook gives about 450 g CO₂/kWh. If I instead use the assignment's French value of 56 g/kWh, the BEV's NEDC result falls from 67.3 to about 8 g/km. The powertrain ranking remains the same, but the difference between the architectures changes substantially.

Excel makes the row-by-row calculations transparent, but it is fragile as a long-term engineering solver. Regional number formats, manual discretisation, and the lack of version control all increase the chance of errors.

The project also uses two parameter sets. The 4×3 comparison and the individual 308 studies support comparisons within their respective tables, but their absolute results should not be mixed.

## What I learned

This project showed me why hybrid performance cannot be reduced to one representative fuel-consumption figure. The conclusion changes with the PHEV's initial charge, the severity of the driving cycle, and whether the additional battery mass still provides useful electric propulsion.

It also changed how I treat post-processing. A spreadsheet can contain a complete calculation while its exports, regional formatting, or summary conventions still produce incorrect final numbers. Parsing and cross-checking the outputs are therefore part of the model, not just presentation work.

## Regenerating the figures

`python3 research/esilv-powertrain/plot_cycle_results.py` reads the three summary workbooks in `research/esilv-powertrain/data/`, prints the parsed tables, and regenerates the main comparison, SOC, and empty-battery figures.
