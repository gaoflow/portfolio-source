---
title: 'The Cooling Model That Told Me Not to Buy the Parts'
image: /images/notes/covers/cooling-system-screen-before-cfd.svg
published: 2025-12-28
summary: 'I started with a radiator, fan, pump, and several confident-looking numbers. A simple system model showed that the passive layout was impossible before CFD or procurement could make it expensive.'
tags: [Thermal]
sourceProjects: [fsae-cooling]
featured: false
order: 5
---

I only meant to size a radiator and decide whether to buy an existing radiator, fan, and pump combination. Instead, I rejected the entire passive E3 cooling layout.

The design case used 40 °C air, while the AMK KW26 inverter required coolant supply at or below 25 °C. No passive radiator could resolve that temperature contradiction.

The decisive result did not come from CFD. It came from a small system model that combined component requirements, the pump curve, parallel-branch losses, radiator behaviour, and transient heat load. I used it to check whether the temperature boundaries and operating points could all hold at once.

![Cooling-system screening before CFD](/images/notes/systems/cooling-system-screen-before-cfd.svg)

The model exposed something a more detailed duct simulation could not fix: with 40 °C air entering the radiator, a passive system could not supply the inverter with coolant below 25 °C.

## I first checked where the numbers came from

I inherited a legacy team report, a hardware shortlist, and several precise-looking numbers:

- 520 W of inverter heat;
- 2.736 kW from two motors;
- a generic radiator coefficient;
- 40 °C ambient air.

Before modelling, I stopped treating precision as proof. I classified every input as:

- supported by a primary source;
- calculated by me;
- assumed only for sensitivity analysis; or
- unknown and potentially able to block a decision.

That changed the direction of the work before the model was complete.

The 520 W inverter value came from:

\[
26\,\mathrm{kVA}\times2\%
\]

Apparent power is not the vehicle’s real operating point. AMK also does not publish a KW26 loss map for our specific torque, speed, and switching state. I therefore kept 520 W as one scenario, not as measured heat generation.

The motor data had the same problem. AMK publishes total motor-loss maps, but total loss does not necessarily enter the custom water jackets. The fraction transferred to the coolant remained unknown.

## The temperature boundary rejected the passive layout

The AMK documentation provided several usable limits:

- KW26 coolant supply at or below 25 °C;
- at least 10 L/min total system flow;
- less than 5 K coolant temperature rise;
- each DD5 branch at or below 40 °C;
- at least 4 L/min through each motor branch.

Our design case used 40 °C air entering the radiator.

In steady state, a passive radiator cannot cool its coolant below the temperature of the cooling air. Increasing radiator size, refining the duct, or running higher-fidelity CFD could not make 40 °C air deliver 25 °C coolant.

That contradiction was enough to reject the architecture. I still completed the component model to see whether the hydraulic system had other problems.

## I solved the installed pump operating point

I digitised the available curves for the Boyd radiator, SPAL fan, and Pierburg CWA150 pump. I then solved the intersection of the pump curve and system resistance curve instead of using the pump’s unrestricted free-flow value.

The calculated operating point was:

| Quantity | Result |
|---|---:|
| Total loop flow | 10.03 L/min |
| Limiting motor-branch flow | 4.16 L/min |
| Pump delivery pressure | 1.61 bar |
| Air operating point per radiator | 6.56 m³/min at 45.6 Pa |
| Radiator outlet / KW26 inlet temperature | 59.45 °C |

The total flow exceeded the 10 L/min requirement by only 0.03 L/min. The limiting motor branch exceeded its 4 L/min requirement by only 0.16 L/min. Both hydraulic limits passed narrowly, while the 59.45 °C KW26 inlet temperature was far above the 25 °C maximum.

My procurement conclusion was direct: **do not buy this combination as the final passive E3 cooling system**.

That did not prove that every candidate component was unusable. It only showed that this combination could not meet the system requirements in the current passive architecture.

## I checked whether thermal mass could absorb a short peak

The team could still argue that the coolant’s thermal capacity might carry a short peak even if the steady-state temperature failed. I built a transient model with 80 cells and 2.0 L of coolant, then checked its energy balance, spatial resolution, and time step.

I used 0.1 K as the threshold for meaningful numerical change. Every check was well below it:

- spatial refinement changed the result by 0.029 K;
- halving the time step changed it by 0.018 K;
- the steady-state energy-balance residual was \(5\times10^{-14}\) W.

Under a legacy 10-second, 6 kW peak case, the maximum coolant temperature reached 68.18 °C.

I kept that result as a sensitivity study because the 10-second, 6 kW load had not been validated against a real vehicle duty cycle. It did not prove that the car would reach 68.18 °C in operation. It did show that short-term heat storage did not automatically rescue the layout, and that mesh or time-step error was not causing the thermal failure.

## I separated the inverter and motors into two temperature levels

After confirming the contradiction, I did not move straight to a larger radiator.

The inverter may require coolant below ambient temperature, so its low-temperature loop needs active conditioning. The motors can accept warmer coolant and can remain on a passive heat-rejection loop. A two-temperature architecture made more sense than forcing every component to share one temperature level.

I examined that direction in three stages:

- **E3** tested the existing passive architecture. The conflict between 40 °C ambient air and the 25 °C KW26 inlet limit rejected that architecture, but did not reject every candidate component.
- **E7** split the system into an active low-temperature loop and a passive high-temperature loop. I swept 0.5–2.3 kW of evaporator capacity with different COP assumptions. Some cases closed the energy balance, but that was not enough to select a chiller.
- **E8** used public catalogue data to build a steady-state reference and calculate the boundaries between feasible and infeasible fan performance, heat-exchanger UA, loop pressure loss, and DD5 heat load. It tested whether the equations closed with public data; it did not approve procurement or vehicle use.

I also varied compressor performance, heat exchangers, humidity, heat leak, and the fraction of component heat entering the coolant over broad ranges. One active-cooling case passed the numerical screen, but 36 application-specific inputs were still missing. I treated it as a direction worth studying, not as a bill of materials.

Five interacting variable groups in E8 also showed why separate one-variable limits could not be combined into a feasible system. A “last feasible point” found while changing one variable might be incompatible with the corresponding point from another sweep. The system model exposed those couplings instead of combining unrelated best cases.

## CFD should answer installation questions

Installation-level CFD becomes useful only after the system-level temperature, flow, and energy conditions can all hold together. It can then answer:

- where the cooling air enters;
- whether flow is uniform across the radiator core;
- whether hot air recirculates;
- where the duct separates;
- how cooling exits affect aerodynamics;
- how flow divides through frozen geometry.

CFD cannot create a missing heat load or rescue:

- insufficient pump head;
- a starved parallel branch;
- an impossible coolant-temperature boundary;
- a fan/core operating point that misses the requirement;
- a transient load beyond the system’s heat-storage and rejection capacity.

Those conditions belong in the system model first. Otherwise, CFD only describes an impossible design in greater detail.

## The result could stop a purchase, but not approve one

Several component curves came from secondary sources, and I applied conservative biases to them.

The available evidence was enough to reject the passive layout because the conflict between 40 °C air and 25 °C coolant did not depend on detailed component curves. It was not enough to approve new hardware or release a vehicle cooling system.

Further design work still needed:

- calorimetry;
- branch-flow measurements;
- absolute-pressure measurements;
- real duty-cycle telemetry;
- time-synchronised temperature data.

The missing-data list was itself a model result. I preferred to state what remained unknown rather than replace it with a plausible-looking guess.

## The rules I kept

This work left me with several rules that I now carry into other system models:

- A component rating only applies under its stated test conditions. The KW26 cold plate’s “2 kW” rating is not an inverter loss map.
- Total motor loss is not the same as heat transferred to the coolant.
- A fan’s free-air flow is not its installed flow through a core and duct.
- A product-page maximum is not a system operating point.
- Missing measurements must stay visible instead of being replaced by a confident guess.
- Showing that an architecture deserves more study is not the same as approving hardware for purchase.

The lesson was simple: **use the cheapest honest model to eliminate an impossible architecture early, then spend CFD time on the installation details of designs that remain feasible.**
