---
title: 'Working Through a Jet Combustor by Hand'
image: /images/notes/covers/jet-combustor-thermochemistry.svg
published: 2026-05-21
summary: 'My combustion class left me with one number I wanted to understand properly: why a lean, preheated dodecane flame lands near a turbine inlet temperature instead of melting everything behind it.'
tags: [Combustion]
sourceProjects: []
featured: false
order: 7
---

This note started with one number from my combustion class: **1832 K**.

That is the adiabatic flame temperature I get when n-dodecane burns with twice the stoichiometric air and the compressor delivers that air at 700 K. The number sits close to a realistic turbine inlet temperature. I wanted to understand how it came out of the chemistry instead of treating it as something a software package prints.

So I rebuilt the calculation from scratch and wrote a small Python script to check every step.

## My first pass was just atom counting

I used n-dodecane, $C_{12}H_{26}$, as a simple stand-in for kerosene. Balancing one mole of fuel gives 18.5 moles of oxygen. With nitrogen included, that becomes about 88.1 moles of stoichiometric air, or 14.9 kg of air per kilogram of fuel.

The air factor $\lambda$ is simply real air divided by stoichiometric air. At $\lambda=2$, the combustor gets twice the minimum air. The excess oxygen stays in the exhaust instead of taking part in the main reaction.

That immediately explained something from the lecture that had sounded like a design detail: a jet combustor cannot send all of its air through one intense flame zone. The primary zone stays near the mixture needed for a stable flame. More air enters later to cool the liner and dilute the gas before the turbine.

## Then I checked the heat release

I used NIST formation enthalpies for liquid dodecane, carbon dioxide, and water. Hess's law gave:

| Result | Value |
|---|---:|
| Lower heating value | 44.1 MJ/kg |
| Higher heating value | 47.5 MJ/kg |
| NIST combustion enthalpy check | within 0.2 kJ/mol |

The last line mattered to me. My calculated higher heating value was $-8085.8$ kJ/mol; the NIST measurement is $-8086.0\pm1.2$ kJ/mol. That agreement told me I had not made a silent sign or phase mistake before moving on to temperature.

## The flame-temperature result finally made physical sense

I fitted simple temperature-dependent heat-capacity laws to NIST Shomate data and solved the adiabatic energy balance. The script produced:

| Case | Adiabatic temperature |
|---|---:|
| $\lambda=1$, reactants at 298 K | 2410 K |
| $\lambda=2$, reactants at 298 K | 1505 K |
| $\lambda=1$, air at 700 K | 2683 K |
| $\lambda=2$, air at 700 K | 1832 K |

A stoichiometric, preheated flame reaches 2683 K in this simple model. That is far beyond the temperature I would want to hand to a turbine. Doubling the air brings it down to 1832 K. Solving the calculation backwards gives $\lambda\approx2.07$ for a target of 1800 K.

This was the moment the combustor layout stopped looking arbitrary. The primary zone exists to keep the flame alive. The dilution air exists to make the turbine survive. The two needs fight each other, so the chamber stages the air instead of mixing everything at the inlet.

## The leftover oxygen also explained the afterburner

At $\lambda=2$, the dry exhaust still contains about 10.9 mol% oxygen. That is why an afterburner can inject more fuel downstream of the turbine and still burn it. The main combustor deliberately leaves oxygen unused.

The same calculation says the exhaust flow is about 30.8 kg per kilogram of fuel. A relatively small change in fuel flow therefore changes the temperature of a very large air stream. That made the course note about fuel-flow temperature control much easier to remember.

## What I had to keep honest

The neat numbers are still an idealised model.

- I used linear heat-capacity fits. The integrated enthalpy error stays around 1.1% in the worst species check, but the real curves are not straight.
- I ignored dissociation. Above about 2000 K, carbon dioxide and water start taking energy back into chemical bonds. The 2410 K and 2683 K values are therefore upper-bound-type numbers, not measured flame temperatures.
- I assumed complete combustion, adiabatic walls, ideal gases, and air as $O_2+3.76N_2$.
- Kerosene is a blend; n-dodecane is only a single-component stand-in.

These limits do not make the exercise useless. They tell me which conclusions are safe. The lean, preheated case explains the right temperature scale and the role of staged air. The stoichiometric high-temperature cases tell me where equilibrium chemistry and heat loss must enter next.

## What I kept from the exercise

The most useful part was not memorising 1832 K. It was learning a chain I can rebuild:

1. balance the reaction;
2. check the heat release against a primary data source;
3. add the sensible enthalpy carried by hot compressor air;
4. solve for flame temperature;
5. compare it with the turbine limit; and
6. state what the simplified chemistry leaves out.

The calculation now lives in `research/combustion-thermo/verify_thermo.py`. It runs 21 checks and prints the table, so I can change an assumption without losing track of the arithmetic.
