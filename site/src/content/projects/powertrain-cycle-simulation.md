---
title: 'Coursework: Powertrain Cycles — Energy & CO₂ Simulation'
year: 2025
date: '2025-12-06'
status: complete
categories: [tooling, validation]
tags: [Coding]
summary: 'In my simulation a charged PHEV uses 1.43 l/100km on the Spa ECO lap versus 10.27 for the ICE; an empty battery makes it the thirstiest case.'
role: 'Solo project'
duration: '4 weeks'
academic:
  institution: 'ESILV'
  course: 'Powertrains & Vehicle Dynamics'
  assignment: 'Energy consumption and CO₂ simulation across driving cycles'
  note: 'A solo four-week assignment for the Powertrains & Vehicle Dynamics course at ESILV. I parameterised the course-provided Excel simulators, built the Spa speed profiles from the track geometry, ran all four powertrain architectures over each cycle, and post-processed the exports with pandas. The individual parameter study — battery charge and the empty-battery dead-weight penalty — was my own choice of investigation.'
  requirements:
    - 'Run ICE, BEV, HEV and PHEV versions of one vehicle over supplied Spa, NEDC and WLTP-style cycles.'
    - 'Resolve inertia, rolling resistance, aerodynamic drag and grade at each cycle point.'
    - 'Report fuel, electrical energy and CO₂ per distance for each architecture.'
    - 'Complete an individual parameter study; this submission investigates battery SOC and empty-battery dead weight.'
  media:
    - src: '/images/projects/powertrain-cycle-simulation/assignment-workflow.svg'
      alt: 'Cycle inputs passing through road-load and powertrain calculations to energy and carbon dioxide outputs'
      caption: 'The assignment chain: speed, grade and distance become road-load forces, then wheel power, powertrain energy and CO₂.'
    - src: '/images/projects/powertrain-cycle-simulation/spa-eco-profile.svg'
      alt: 'Spa ECO speed and elevation profiles plotted against lap distance'
      caption: 'The actual Spa input is highly nonuniform. Every acceleration, braking zone and elevation change feeds the point-by-point model.'
featured: false
order: 20
studySequence: 4
heroImage: /images/projects/powertrain-cycle-simulation/cycle-comparison.svg
---

## Context & objective

A plug-in hybrid on the Spa-Francorchamps ECO lap burns 1.43 l/100km against the petrol car's 10.27 — until its battery runs flat, at which point the same car burns 11.32 and becomes the worst of the four powertrains. That swing, and where each architecture lands on CO₂, is what this project measures.

The exercise: simulate ICE, HEV, PHEV, and BEV versions of one reference car over three speed profiles — Spa-Francorchamps driven gently (ECO), driven hard (SPORT), and the NEDC homologation cycle — and reduce each run to l/100km or kWh/100km and g CO₂/km. I did the work solo over four weeks; the point-by-point Excel simulators were the course-provided toolchain, adapted from Prof. Duysinx's vehicle-performance project at ULiege.

## Toolchain

The simulators are Excel workbooks: one worksheet per vehicle, one row per trajectory point, formulas chained left to right. Each run exports time, distance, altitude, speed, engaged gear, the four resistance forces, wheel and engine power, engine efficiency, and per-point fuel and CO₂. My part was parameterisation, scenario definition, and analysis. I set the vehicle parameters (a Peugeot 308 1.2 PureTech for the ICE and hybrid variants), built the speed profiles from the track geometry, ran each powertrain over each cycle, and exported the results to CSV.

Analysis happened outside Excel. Two pandas scripts clean the exports — French locale means semicolon separators and comma decimals — then integrate fuel and CO₂ along the cycle and plot cumulative curves. Three summary workbooks hold the final numbers: the 4×3 comparison, the SOC sweep, and the dead-weight study. The figures in this article are regenerated from those workbooks by the script linked under Reproduce.

## Method

The model is backward-facing and quasi-static. The speed profile is fixed first; the powertrain then supplies whatever the profile demands.

**Speed profile.** Corner speeds come from the tyre friction limit, $v=\sqrt{\mu g R}$, with the two fastest corners of Spa treated as straights. On the ECO profile, acceleration is capped at 0–100 kph in 20 s, braking at 0.4 g, and top speed at 90 kph. On SPORT, acceleration follows engine capability, braking rises to about 0.6 g, and top speed is whatever the engine can pull — finding the braking points takes iteration.

**Point-by-point dynamics.** The trajectory is discretised into points (the Spa lap covers 7.0 km of trajectory points in the export). At each point the model sums four resistances:

$$
\begin{aligned} F &= \underbrace{m\,a}_{\text{inertia}} + \underbrace{f\,m\,g}_{\text{rolling}} \\[0.5em] &\quad + \underbrace{\tfrac{1}{2}\rho\, C_x S\, v^2}_{\text{aero}} + \underbrace{m\,g\sin\theta}_{\text{grade}} \end{aligned}
$$

Wheel power is $F \cdot v$; engine power divides by the transmission efficiency (95%). Fuel flow follows from engine efficiency and the fuel's lower heating value; CO₂ follows at 2392 g per litre of petrol. Hybrid variants add an electric machine and battery with their own efficiency chain (battery 0.95, motor 0.90 in my parameterisation), and the PHEV draws the battery down before calling the engine.

**Vehicles.** The reference ICE is a 1300 kg compact (Cx 0.31, 2.69 m², 115 CV, five gears). The BEV carries a 125 kW peak motor and a 22 kWh battery at 1460 kg. The hybrids share the ICE car's engine and body, plus an electric machine and battery sized per the brief: roughly 1.5 kWh for the HEV, 10–20 kWh for the PHEV.

My parameterisation used the 308 data: 1280 kg for the petrol car, the hybrid adding a 50 kg machine and a 110 kg, 12.4 kWh battery with an 81 kW motor.

## Results: four powertrains, three cycles

| Cycle | ICE | HEV | PHEV | BEV |
|---|---|---|---|---|
| Spa ECO | 10.27 l / 245.7 g | 9.05 l / 216.5 g | 1.43 l / 34.2 g | 21.00 kWh / 96.7 g |
| Spa SPORT | 15.60 l / 373.1 g | 15.19 l / 363.3 g | 8.19 l / 196.0 g | 32.68 kWh / 148.4 g |
| NEDC | 6.62 l / 158.3 g | 6.46 l / 154.5 g | 0.79 l / 18.9 g | 15.30 kWh / 67.3 g |

Fuel in l/100km, BEV energy in kWh/100km, CO₂ in g/km.

![Energy and CO₂ per powertrain per cycle](/images/projects/powertrain-cycle-simulation/cycle-comparison.svg)

Three observations carry the weight:

1. **The HEV barely helps.** On Spa SPORT it saves 0.41 l/100km over the ICE; on NEDC, 0.16. A 1.5 kWh buffer smooths load points but cannot move much energy, so the car pays the added mass for little return.
2. **The PHEV dominates when charged.** It burns 86% less fuel than the ICE on Spa ECO and 88% less on NEDC, because the battery covers most of the cycle outright.
3. **Cycle severity hits everyone.** SPORT roughly doubles ICE fuel over NEDC, and the BEV shows the same signal in its own units: 15.30 kWh/100km on NEDC becomes 32.68 on SPORT. The aero term grows with $v^2$ and the power demand with $v^3$; the model shows it directly, since ECO and SPORT share the car and the track.

## SOC sensitivity: the PHEV's split personality

The PHEV's headline number depends entirely on where the battery starts. I re-ran the Spa ECO lap at four initial charge states:

| Initial SOC | Fuel (l/100km) | CO₂ (g/km) |
|---|---:|---:|
| 0 (empty) | 10.9 | 260.0 |
| 0.25 | 8.5 | 202.2 |
| 0.30 | 5.3 | 126.3 |
| 1.00 (full) | 0.0 | 1.2 |

![Fuel and CO₂ against initial battery charge](/images/projects/powertrain-cycle-simulation/soc-sensitivity.svg)

The curve is steepest between 0.25 and 0.30, where the battery stops covering the lap's energy and the engine takes over for longer stretches. Below that knee the PHEV degrades toward a heavy HEV; at empty it burns 16% more than the petrol car in the same parameterisation (9.4 l/100km). The residual 1.2 g/km at full charge comes from the small fuel use the controller still logs — 0.006 l over the whole lap in the CSV export.

## Dead weight: carrying a flat battery

The empty-battery case deserves its own look because it is the PHEV's real-world failure mode: the battery and motor become 160 kg of ballast the engine must drag around.

| Cycle | PHEV charged | PHEV empty |
|---|---|---|
| Spa ECO | 1.43 l / 34.2 g | 11.32 l / 270.6 g |
| Spa SPORT | 8.19 l / 196.0 g | 17.13 l / 409.4 g |
| NEDC | 0.79 l / 18.9 g | 7.20 l / 171.5 g |

![Charged versus empty-battery PHEV](/images/projects/powertrain-cycle-simulation/deadweight-comparison.svg)

On every cycle the empty PHEV burns more than the plain ICE (11.32 vs 10.27 on Spa ECO, 7.20 vs 6.62 on NEDC). The gap is exactly the mass penalty: same engine, same body, more kilograms. A PHEV that is never plugged in is worse than the car it replaced — the simulation says so in plain numbers.

## Verification & failures

Three checks survived the analysis; one bug did not get caught until late.

- **Fuel–CO₂ consistency.** In every petrol row across the comparison and dead-weight workbooks (fifteen rows), CO₂ equals fuel multiplied by 23.92 g/km per l/100km — the brief's 2392 g/l petrol factor. The workbooks carry no hidden corrections.
- **CSV against workbook.** Summing the per-point fuel column of the petrol CSV export gives exactly twice the workbook total. The workbook is self-consistent (1579.2 g CO₂ over the 7.0 km lap at 225.6 g/km), so the export apparently counts each segment twice. I use the workbook values everywhere and quote only normalised units, which are insensitive to that convention.
- **SOC totals.** Each SOC run's workbook total matches its per-km figure over the same 7.0 km (for example 884.2 g at 126.3 g/km for SOC 0.30).

The failure: my first pandas import of the CSV exports returned all-NaN columns. The files are French-locale — semicolon separators, comma decimals — and `read_csv` with defaults parsed nothing. The fix (separator sniffing plus comma-to-dot conversion) is in the loader scripts, and it is the reason every number in this article passed through the summary workbooks as a second check.

## Limitations

- **Quasi-static, backward-facing.** The model assumes the car follows the speed profile exactly. No gear-shift transients, no wheel slip, no thermal state, no driver model. SPORT braking points were iterated by hand.
- **Excel as the solver.** One formula chain per row is transparent but fragile: comma-decimal exports, manual discretisation, no version control. I caught the locale issue only when the pandas import produced NaN columns.
- **Standard cycles are kind to hybrids.** NEDC's gentle accelerations flatter electrified powertrains; real driving sits closer to the SPORT column.
- **The BEV's CO₂ is one assumption.** Dividing the workbook's EV emissions by its energy use implies a grid intensity of roughly 450 g CO₂/kWh. The brief's own reference table lists 250 g/kWh (EU average) and 56 g/kWh (France 2023). On French electricity the BEV's NEDC figure would drop from 67.3 to about 8 g/km; the ranking survives, the margin does not.
- **Two parameter sets.** The 4×3 comparison uses the brief's reference car; the SOC and dead-weight studies use my 308 parameterisation. Absolute numbers are comparable within a study, not across the boundary.

## What I took away

Excel taught me the model because nothing hides: one formula chain per row, every intermediate force and power inspectable. It broke at the borders — French-locale CSV exports that parsed to NaN columns, manual discretisation, no version control — and that failure is why every number here passes through the summary workbooks as a second check. The dead-weight runs also changed how I read PHEV claims: the 1.43 l/100km headline is a battery-charge assumption, and the same car at 11.32 l/100km is the thirstiest of the four on that lap.

## Reproduce

`python3 research/esilv-powertrain/plot_cycle_results.py` reads the three summary workbooks in `research/esilv-powertrain/data/` and regenerates all three figures as SVG. The script prints the parsed tables, so the workbook values can be checked against the article without opening Excel. The raw simulator CSV exports (per-point force, power, fuel, and CO₂ along each lap) sit with the course files; the pandas loaders in that directory handle their semicolon/comma locale.
