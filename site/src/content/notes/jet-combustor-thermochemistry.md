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

One number from my combustion class stayed with me: **1832 K**.

That is the adiabatic flame temperature I get when n-dodecane burns with twice the stoichiometric air and the compressor delivers the air at 700 K. It is close to a realistic turbine inlet temperature. Rather than accept it as a software output, I rebuilt the calculation from scratch and wrote a small Python script to check each step.

## I started with atoms and air flow

![Jet combustor thermochemistry calculation chain](/images/notes/systems/jet-combustor-thermochemistry.svg)

I worked from atom conservation through standard formation enthalpies, inlet preheating, temperature-dependent sensible enthalpy, adiabatic temperature, and residual oxygen. The order matters because a unit or reference-state error carries through to the final result.

I used n-dodecane, $C_{12}H_{26}$, as a simple stand-in for kerosene. Balancing one mole of fuel requires 18.5 moles of oxygen. Including nitrogen gives about 88.1 moles of stoichiometric air, or 14.9 kg of air per kilogram of fuel.

The air factor $\lambda$ is the actual air flow divided by the stoichiometric air flow. At $\lambda=2$, the combustor receives twice the minimum air required for complete combustion. The excess oxygen remains in the exhaust rather than taking part in the main reaction.

This explains why a jet combustor does not send all its air through one intense flame zone. The primary zone needs a mixture that can sustain a stable flame. The remaining air enters later to cool the liner and reduce the gas temperature before it reaches the turbine.

## I checked the heat release against NIST data

I used NIST standard formation enthalpies for liquid dodecane, carbon dioxide, and water, then applied Hess’s law.

| Result | Value |
|---|---:|
| Lower heating value | 44.1 MJ/kg |
| Higher heating value | 47.5 MJ/kg |
| NIST combustion enthalpy check | within 0.2 kJ/mol |

My calculated higher heating value was $-8085.8$ kJ/mol. The NIST measurement is $-8086.0\pm1.2$ kJ/mol. That agreement let me rule out a hidden sign or phase error before solving for temperature.

## I put inlet preheating and product sensible heat into one balance

The atom balance and excess-air factor set the product amounts. Standard formation enthalpies set the reference-state reaction energy. Inlet preheating and product sensible heat then enter the same equation through temperature integrals:

$$
\sum n_p\left[\Delta h_f^\circ+\int_{298}^{T_{ad}}c_p(T)\,dT\right]
=
\sum n_r\left[\Delta h_f^\circ+\int_{298}^{T_{in}}c_p(T)\,dT\right].
$$

I fitted simple temperature-dependent heat-capacity laws to NIST Shomate data. During root finding, I changed only the unknown adiabatic temperature, $T_{ad}$; the balanced species amounts stayed fixed. This let me check atom conservation, Hess’s law, and sensible-enthalpy integration separately instead of hiding them inside one black-box result.

## The temperatures explained staged air admission

The script produced:

| Case | Adiabatic temperature |
|---|---:|
| $\lambda=1$, reactants at 298 K | 2410 K |
| $\lambda=2$, reactants at 298 K | 1505 K |
| $\lambda=1$, air at 700 K | 2683 K |
| $\lambda=2$, air at 700 K | 1832 K |

In this simplified model, a stoichiometric flame with air preheated to 700 K reaches 2683 K. That is far above the temperature I would want to send into a turbine. Doubling the air lowers the result to 1832 K. Solving backwards gives $\lambda\approx2.07$ for a target temperature of 1800 K.

The combustor layout then made physical sense. The primary zone keeps the flame stable, while later dilution air brings the temperature into a range the turbine can tolerate. Those needs conflict, so all the air cannot be mixed with the fuel at the inlet.

Temperature-dependent $c_p$ also matters. Compared with a constant-heat-capacity model, it limits the predicted high temperatures more realistically.

## Residual oxygen explained the afterburner

At $\lambda=2$, the dry exhaust still contains about 10.9 mol% oxygen. This follows directly from the elemental balance rather than from an extra assumption. Oxidiser therefore remains downstream of the main combustor, allowing an afterburner to inject more fuel after the turbine and continue combustion.

The same calculation gives about 30.8 kg of exhaust flow per kilogram of fuel. A relatively small change in fuel flow can therefore change the temperature of a much larger air stream. That made the course material on fuel-flow temperature control easier to understand.

The 10.9 mol% result is only the elemental-balance result from this simplified model. It does not validate real engine emissions or turbine inlet temperatures.

## The model has clear limits

These neat results are not measured flame temperatures.

- I used linear heat-capacity fits. The integrated enthalpy error remained around 1.1% in the worst species check, but real heat-capacity curves are not straight.
- I ignored dissociation. Above about 2000 K, carbon dioxide and water begin storing energy in chemical bonds again, so neglecting dissociation overpredicts flame temperature. The 2410 K and 2683 K results are upper-bound-type values.
- I assumed constant-pressure, adiabatic conditions, so I did not model wall heat loss or pressure drop.
- I assumed complete combustion, ideal gases, and air represented as $O_2+3.76N_2$.
- Real kerosene is a mixture. N-dodecane is only a single-component substitute, so its stoichiometry and heating-value details differ.

These limits define what I can safely conclude. The lean, preheated case explains the right temperature scale and the purpose of staged air. The hotter stoichiometric cases show where equilibrium chemistry and heat loss need to enter next.

## I kept a calculation chain I can repeat

The useful result was not memorising 1832 K. It was keeping a process I can derive and check again:

1. Balance the reaction.
2. Check the heat release against primary NIST data.
3. Add the sensible enthalpy carried by hot compressor air.
4. Solve for the adiabatic flame temperature.
5. Compare the result with the turbine temperature limit.
6. State what the simplified chemistry leaves out.

The calculation lives in `research/combustion-thermo/verify_thermo.py`. It runs 21 checks and prints the result table, so I can change an assumption without losing track of the arithmetic.
