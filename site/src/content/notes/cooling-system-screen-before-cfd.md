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

I started this project expecting to size a radiator. I ended up rejecting the whole cooling layout.

The important result did not come from CFD. It came from putting the requirements, pump curve, branch losses, radiator behaviour, and transient heat load in the same small model.

That model told me something a detailed duct simulation could never fix: our passive E3 architecture could not supply the inverter with coolant below its required temperature when the radiator inlet air was already 40 °C.

## I did not begin with clean data

I inherited a legacy team report, a hardware shortlist, and numbers that looked precise: 520 W inverter heat, 2.736 kW for two motors, a generic radiator coefficient, and 40 °C ambient.

My first job was to stop confusing precision with proof.

I made a small claim register. Every input became one of four things:

- verified from a primary source;
- produced by my own calculation;
- an assumption kept for sensitivity; or
- unknown and able to block a decision.

That table changed the project before I wrote any model.

The 520 W inverter value, for example, came from $26\,\mathrm{kVA}\times2\%$. Apparent power is not the real operating point, and AMK does not publish a KW26 loss map for our exact torque, speed, and switching state. I kept 520 W as a scenario, not as a measured truth.

The motor data had a similar problem. AMK publishes total motor-loss maps, but total loss is not automatically the heat entering a custom water jacket. The coolant fraction remained unknown.

## One requirement made the passive layout impossible

The AMK documentation gave me usable boundaries:

- KW26 coolant supply at or below 25 °C;
- at least 10 L/min total flow;
- less than 5 K coolant rise;
- each DD5 branch at or below 40 °C;
- at least 4 L/min in each motor branch.

Our design case used 40 °C air entering the radiator.

A passive radiator cannot deliver coolant below the temperature of the air cooling it in steady state. That was the basic contradiction. The inverter wanted at most 25 °C; the available air was already 40 °C.

I still completed the component model because I wanted to know whether hydraulics created another blocker.

## The pump and branch model passed—barely

I digitised the available Boyd radiator, SPAL fan, and Pierburg CWA150 pump curves. I then solved the pump/system intersection instead of using the pump's free-flow number.

The installed operating point was:

| Quantity | Result |
|---|---:|
| Total loop flow | 10.03 L/min |
| Limiting motor branch | 4.16 L/min |
| Pump delivery pressure | 1.61 bar |
| Air point per radiator | 6.56 m³/min at 45.6 Pa |
| Radiator outlet / KW26 inlet | 59.45 °C |

The two flow requirements passed by very little. The temperature requirement failed by a huge margin.

That made the decision simple: **do not buy this combination as the final passive E3 cooling system**.

## I used a transient model to check the short-load story

The team could still argue that thermal mass might carry a short peak. I added an 80-cell coolant model with 2.0 L of coolant and checked the energy balance, mesh size, and time step.

The numerical checks were comfortably smaller than the 0.1 K gate:

- 0.029 K change under spatial refinement;
- 0.018 K change when the time step was halved;
- $5\times10^{-14}$ W energy residual in the steady balance.

A legacy 10-second, 6 kW peak reached 68.18 °C maximum coolant. I kept that result as a sensitivity, not as validation of the real vehicle duty cycle.

The transient model made the NO-GO harder to dismiss. It also showed that the numerical method was not the reason for the thermal failure.

## The next idea was not “buy a bigger radiator”

Once the contradiction was clear, I separated the temperature levels.

The inverter needs a cold loop that may sit below ambient, so it needs active conditioning. The motors can tolerate a warmer passive loop. A two-temperature architecture therefore makes more sense than forcing every component through one loop.

I explored active branches with broad compressor, heat-exchanger, humidity, heat-leak, and coolant-partition assumptions. One screen passed numerically, but 36 application inputs were still missing. I treated it as a research direction, not a bill of materials.

That distinction matters. A model can tell me which architecture deserves more work without approving hardware for purchase.

## What the references taught me

Several rules from this project now follow me into every system model:

- A component rating belongs to its test condition. The KW26 “2 kW” cold-plate rating is not an inverter loss map.
- Total motor loss is not the same as coolant heat.
- A fan's free-air flow is not the installed airflow through a core and duct.
- A product-page maximum is not a system operating point.
- Missing measurements stay visible instead of being replaced with a confident guess.

The missing-data list became part of the result: calorimetry, branch flow, absolute pressure, duty telemetry, and synchronised temperatures.

## Why I now screen before CFD

CFD is useful after the system closes. It can answer where the air enters, how evenly it crosses the core, whether hot air recirculates, where a duct separates, and how cooling exits affect aerodynamics.

CFD should not be asked to rescue:

- insufficient pump head;
- a starved parallel branch;
- an impossible coolant-temperature boundary;
- a fan/core operating point that misses the requirement; or
- a transient heat load that exceeds the system's stored energy and rejection capacity.

Those are system problems first.

The FSAE Cooling project still carries one deliberate limitation: several component curves came from secondary hosts and were biased conservatively. That is enough to reject the passive layout, but not enough to sign off a purchase.

The lesson I kept is straightforward: **use the cheapest honest model to kill a bad architecture early, then spend CFD time on the installation details of the designs that survive.**
