---
title: 'FSAE Cooling — From Reference Hunting to a NO-GO Decision'
image: /images/notes/covers/cooling-system-screen-before-cfd.svg
published: 2026-08-18
summary: 'How I turned a legacy cooling report, manufacturer limits and incomplete component curves into a traceable model that rejected our passive E3 concept before procurement.'
tags: [FSAE, cooling, hydraulics, thermal modelling]
sourceProjects: [fsae-cooling]
featured: false
order: 5
---

A system-level screen rejected my FSAE cooling architecture before any CFD ran: the hydraulic intersection, radiator map, and transient energy balance together show the passive E3 layout cannot hold its temperature boundary. Detailed radiator CFD cannot rescue an infeasible architecture. Spend inexpensive models to reject bad architectures first, then spend CFD on the surviving installation questions.

## How I researched our team concept

I did not start with a clean specification. I started with a legacy cooling report, a shortlist of hardware and numbers that looked precise: 520 W inverter heat, 2.736 kW for two motors, a generic radiator coefficient, and 40 °C ambient. My first task was to stop treating precision as proof.

I built a claim register before changing the model. Every input became one of four things: **verified** from a primary source, **screened** by a deterministic calculation, **assumption** kept only for sensitivity, or **unknown** that blocks a decision. That simple table changed the project more than any solver.

The source audit overturned two starting assumptions:

1. The 520 W inverter value came from $26\,\mathrm{kVA}\times2\%$. Apparent power is not the vehicle's real-power operating point, and AMK publishes no KW26 loss map versus torque, speed or switching state. I kept 520 W only as a labelled scenario.
2. The DD5 is rated at 12.3 kW, not 26 kW. AMK's archived 80/100/120 °C workbooks contain total motor-loss maps, but the temperature label is undefined and total loss is not the heat entering our user-designed water jacket. The liquid fraction stayed unknown.

The primary AMK manual gave constraints I could use without interpretation: KW26 coolant supply at or below 25 °C, at least 10 L/min and less than 5 K rise; each DD5 branch at or below 40 °C, at least 4 L/min and less than 5 K rise. Once I put those limits beside our 40 °C radiator-inlet air case, the main contradiction was visible before any component calculation: a passive radiator cannot supply 25 °C coolant from 40 °C air in steady state.

I still ran the component screen because the team needed to know whether hydraulics created a second blocker. Digitised Boyd, SPAL and CWA150 curves gave 10.03 L/min total and 4.16 L/min in the limiting motor branch. Both flow gates pass, but barely. The thermal boundary still fails, so the correct team decision was to reject the passive E3 architecture rather than buy parts that meet isolated catalogue points.

The next branch was not “use a bigger radiator.” I separated the temperature levels: an actively conditioned KW26 loop below ambient and a passive higher-temperature DD5 loop. E7 explored broad COP, humidity, heat-leak and coolant-partition assumptions. E8 replaced part of that envelope with public compressor, plate-heat-exchanger, pump and fan curves. It passes its declared numerical screen, but 36 application inputs remain blocked, so it is a research direction rather than a bill of materials.

## What the references taught me

- A component rating is conditional. The KW26 2 kW cold-plate figure belongs to 25 °C and 10 L/min; it is not an inverter loss map.
- A motor's total-loss workbook does not define coolant heat. Copper, iron, magnet and mechanical losses need a jacket partition model or calorimetry.
- Free-flow fan volume is not installed airflow. The operating point comes from the fan and system pressure curves together.
- Formula Student rules define legality, not the vehicle's thermal duty cycle. Our 40 °C case is an internal design envelope, not an FSG rule.
- A public curve is usable only with its exact part number, axes, rating condition and interpolation boundary. A product-page maximum cannot support a system decision.
- Missing data must stay visible. The acquisition plan—calorimetry, branch flow, absolute pressure, duty telemetry and synchronized temperatures—is part of the engineering result.

## Start with requirements, not a preferred component

Freeze the operating envelope first:

- engine or motor heat rejection across the duty cycle;
- ambient-temperature and altitude range;
- maximum coolant inlet and outlet temperatures;
- permitted pressure and pump-power budgets;
- package volume and hose-routing limits;
- fan electrical budget and low-speed operating requirement;
- coolant specification and property range;
- single-fault or degraded-mode requirement;
- sensor uncertainty and control strategy.

A component catalogue is not a requirement. Selecting a radiator and pump first produces a system that looks adequate only because the target moved to fit the hardware.

## The hydraulic operating point is an intersection

A pump delivers its headline flow only in isolation. Installed, the operating point sits where pump head equals total system loss:

$$
\Delta p_{pump}(\dot V) = \Delta p_{system}(\dot V).
$$

A screening network should include:

- straight-pipe friction;
- bends, contractions, expansions, and fittings;
- radiator pressure drop;
- cold plate or engine-jacket pressure drop;
- valves, filters, and branch restrictions;
- coolant properties at relevant temperature;
- parallel-path flow splitting.

For a branch $i$, a simple resistance representation is

$$
\Delta p_i = K_i \dot V_i^2,
$$

with equal pressure drop across parallel branches and total flow conserved. The coefficient is only as credible as its source and operating range, but the network exposes gross imbalance before any 3-D solve.

## Couple the air and liquid sides

Radiator heat rejection depends on both coolant flow and air mass flow. A useful reduced-order relation is

$$
\dot Q = UA\,\Delta T_{lm},
$$

or an effectiveness–NTU form when inlet states and capacity rates are known. Evaluate the core map at the system operating point, never at an isolated catalogue maximum.

The air side needs its own intersection:

- fan pressure-rise curve;
- radiator and duct pressure loss;
- vehicle ram pressure;
- bypass and recirculation paths;
- fan duty and electrical limits.

A fan can have ample free-air flow and still starve the core once installation resistance is added.

## Add transient energy before geometry detail

A steady heat balance cannot answer a short high-load event. A finite-volume coolant model tracks the energy stored in coolant and wall volumes:

$$
\rho c_p V\frac{dT}{dt} = \dot m c_p(T_{in}-T) + \dot Q_{source} - \dot Q_{rejected}.
$$

The model should preserve:

- total energy across every time step;
- consistent advection direction;
- temperature-dependent properties where they matter over the envelope;
- pump and fan state changes;
- the difference between peak temperature and final temperature;
- time-step and spatial sensitivity.

The goal is to learn whether thermal mass and system flow give enough margin to justify detailed installation work — full CFD fidelity is not the point.

## Evidence from the FSAE cooling screen

The [FSAE Cooling study](/projects/fsae-cooling) couples digitised curves for one candidate set (Boyd 6310G3 radiator, SPAL VA99-series fan, Pierburg CWA150 pump) with a hydraulic network, radiator-side screening, and an 80-cell transient coolant model holding 2.0 L of coolant.

Its E3-envelope (40 °C ambient) baseline reports:

| Quantity | Result |
|---|---:|
| Total loop flow | 10.03 L/min |
| Limiting motor-branch flow | 4.16 L/min |
| Pump delivery pressure | 1.61 bar |
| Air point per radiator | 6.56 m³/min at 45.6 Pa |
| Baseline radiator outlet (KW26 inlet) | 59.45 °C |
| Final decision | NO-GO for the passive E3 architecture |

Both hydraulic gates pass: 10.03 L/min against a 10 L/min requirement, 4.16 L/min against a 4 L/min branch minimum. The architecture still fails, because steady passive cooling cannot deliver coolant below the radiator-inlet air temperature. The KW26 inlet boundary has no feasible passive solution at 40 °C ambient.

The transient checks qualify the numerics at screening scale. Baseline heat rejection of 3061.5 W closes to a $5\times10^{-14}$ W energy residual. A 20/40/80/160-cell refinement halves the steady error against theory at each step (0.312, 0.156, 0.078, 0.038 K). The selected model differs by 0.029 K across spatial refinement and 0.018 K across a halved time step, inside the declared 0.1 K gate. A legacy 10 s, 6 kW peak case reaches 68.18 °C maximum coolant, retained as sensitivity evidence rather than validation.

The branch analysis then shows what a screen is for. The strict passive branch is rejected on thermodynamic grounds. The changed-envelope branch survives only if ambient stays below roughly −5 to 13 °C — not E3. The recommended branch is a two-temperature active architecture: a conditioned KW26 loop needing an estimated 0.5–2.0 kW of evaporator capacity, separate from the DD5 loop. Production air-path CFD stays gated until one replacement branch passes the same screen.

## Why a NO-GO screen is valuable

A low-order model can reject an architecture for reasons detailed CFD should never be asked to fix:

- pump head is insufficient at the required flow;
- parallel branches starve a critical component;
- radiator liquid-side capacity is inadequate;
- the fan/core intersection misses the low-speed requirement;
- transient thermal mass cannot cover the duty cycle;
- electrical or package limits invalidate the combination.

CFD enters after these constraints close, to answer installation questions:

- inlet pressure recovery and distortion;
- core-face flow uniformity;
- fan/core interaction;
- hot-air recirculation;
- exit placement and aerodynamic coupling;
- duct separation and leakage;
- local component temperatures.

## The handoff contract to CFD

The system screen should hand CFD:

1. required air and coolant mass-flow ranges;
2. core pressure-loss and heat-transfer maps with provenance;
3. fan and pump operating points;
4. heat loads and transient duty cycles;
5. acceptable maldistribution and pressure-drop limits;
6. packaging boundaries and permitted geometry variables;
7. temperature-dependent fluid properties;
8. sensor locations and a correlation plan;
9. the design decisions CFD is allowed to change.

Without this handoff, CFD may polish a beautiful duct around a non-viable system.

## Evidence quality matters more than model complexity

The cooling screen retains one limitation on purpose: the component curves are secondary-hosted and conservatively biased. That keeps the result below procurement approval. Final component selection needs first-party curves or measured hydraulic and thermal data.

This is the correct authority boundary. A reproducible reduced-order result can support architecture rejection while remaining insufficient for hardware sign-off.

## Source trail

- [Revision 12 engineering report](/documents/fsae-cooling-system-design.pdf) — equations, envelopes, candidate register and rejected paths.
- [Machine-audited cooling claims](/evidence/fsae-cooling.html) — five public statements tied to JSON metrics and artifacts.
- AMK PDK 205481, version 2022/15 — KW26 and DD5 cooling conditions, derating and control-electronics boundary ([official PDF](https://www.amk-motion.com/amk-dokucd/dokucd/en/content/resources/pdf-dateien/pdk_205481_kw26-s5-fse-4q_en_.pdf)).
- Boyd 6310G3, SPAL VA99 and Pierburg CWA150 curves — component-level inputs only; the note keeps their provenance and installation limits separate.
- Internal claim register — the controlling record for verified, screened, assumed and unknown inputs. It prevents a secondary-hosted curve or legacy calculation from silently becoming a purchase claim.

## Boundary of this note

The equations above are screening forms. Compressibility, cavitation, phase change, complex coolant mixtures, strongly temperature-dependent maps, or coupled control dynamics may need higher-order treatment. The sequencing stands: establish system feasibility first, then use CFD where spatial flow physics controls the remaining decision.
