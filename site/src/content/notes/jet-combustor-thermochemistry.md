---
title: 'Combustion Course Notes — Jet Combustor Thermochemistry'
image: /images/notes/covers/jet-combustor-thermochemistry.svg
published: 2026-05-21
summary: 'First-principles thermochemistry of a jet combustor burning n-dodecane: stoichiometry, Hess-law heating values, and adiabatic flame temperatures at lambda = 1 and lambda = 2 with 700 K compressor preheat, every figure verified against NIST data by a script.'
tags: [Combustion]
sourceProjects: []
featured: false
order: 7
---

Burn n-dodecane with twice the stoichiometric air and 700 K compressor-delivery air, and the adiabatic flame temperature settles at 1832 K. That sits inside the 1700–2000 K band where modern turbines accept their inlet gas. This note rebuilds that number from first principles, and every figure in it is printed by a verification script that checks itself against NIST data and exits nonzero on failure.

## The course in six tools

The ESILV *Chemical Reaction & Combustion* course (MMN1, 2025–2026) assembles combustor arithmetic from six pieces. The worked chain below uses each of them once.

- **Stoichiometry.** Fix the fuel coefficient at 1 and balance atoms: C_xH_yO_z + (x + y/4 − z/2) O₂ → x CO₂ + (y/2) H₂O. For dodecane that gives 18.5 mol O₂ per mole of fuel.
- **Air factor.** λ = real air ÷ stoichiometric air. Combustion in air writes the oxidiser as O₂ + 3.76 N₂, and with λ > 1 the excess (λ − 1) × 18.5 mol O₂ survives into the exhaust.
- **Hess's law.** The reaction enthalpy at 298 K is a sum of standard formation enthalpies, products minus reactants.
- **LHV vs HHV.** Water vapour in the products gives the lower heating value, liquid water the higher one. A turbine never condenses its exhaust, so LHV is the working number.
- **Kirchhoff and the flame temperature.** Assume adiabatic, constant-pressure, complete combustion: the 298 K reaction enthalpy plus the reactants' sensible enthalpy heats the products. With Cp(T) laws the balance becomes an equation in the flame temperature.
- **Equilibrium.** K(T), the reaction quotient, Le Chatelier's law: the machinery for dissociation and partial equilibria. I did not use it here — the boundary section prices that omission.

## Why a jet combustor runs lean

A stoichiometric kerosene flame would destroy the turbine behind it. The combustor's architecture exists to hold a stable flame while diluting its exhaust down to a temperature the blades survive.

The binding constraint is the turbine inlet temperature. MIT's Unified Engineering propulsion notes let it range up to 2000 K and work an example at 1800 K. The blades survive above their alloy's melting point because compressor air is pumped through them and out through surface holes as a cooling film. The course says the same from the combustor side: the chamber is built from nickel or cobalt alloys, sometimes ceramics, and its exit temperature is controlled with wall cooling and fuel flow.

My computed adiabatic flame temperature at λ = 1 is 2410 K — several hundred kelvin above the turbine limit even after discounting the model's known overestimation. So the combustor must run lean overall. Routing all of that air through the flame zone would blow the flame off its holder, and the course treats flame blowing as a real failure mode. The resolution is staged air, and the slides state it in one sentence: "The air is in strong excess to avoid damaging the blades of the turbine. But that much air would blow the flame, consequently only a fraction of the air is introduced for the ignition of the flame. The rest of the air comes later." A primary zone burns near stoichiometry where the flame is strongest; dilution and liner-cooling air enter downstream and mix the gas down toward the turbine limit.

The flame itself is a diffusion flame in the classical chamber. Fuel and air enter separately, so flashback into the injector is structurally impossible; the price is soot formed in the fuel-rich core, which must be oxidised before the exit. Premix burners mix cleanly and need minimal excess air, but they can flash back. The course assigns each architecture its failure mode, and the choice between them is a choice of which failure you manage.

The excess air never goes to waste. At λ = 2 the dry exhaust still carries 10.9 mol% O₂. That leftover oxygen is what an afterburner burns: the course describes extra fuel injected downstream of the turbine, ignited by the excess air the main combustion left behind. Part of the staged air also films the liner walls, keeping the metal below its limit while the core gas stays hot.

## Worked numbers, verified against NIST

Every number in this section is printed by `research/combustion-thermo/verify_thermo.py`. The script asserts each value against an expected magnitude within a stated tolerance and exits nonzero if any check fails.

The data are published values from the NIST Chemistry WebBook (SRD 69, fetched 2026-08-18), the source the course slides point to. Formation enthalpies at 298 K: C₁₂H₂₆(l) −352.1, CO₂(g) −393.51, H₂O(g) −241.826, H₂O(l) −285.830 kJ/mol. Heat capacities come from the NIST-JANAF Shomate fits (Chase 1998); the script collapses each into a linear law Cp = a + b·T by least squares over 300–3000 K:

| Species | a (J/mol/K) | b (J/mol/K²) |
|---|---|---|
| N₂ | 29.293 | 0.00304 |
| O₂ | 30.696 | 0.00338 |
| CO₂ | 44.989 | 0.00701 |
| H₂O(g) | 33.230 | 0.00835 |

Before trusting any flame temperature, the script cross-checks the enthalpy chain itself: the Hess-law HHV computes to −8085.8 kJ/mol against NIST's directly measured combustion enthalpy of −8086.0 ± 1.2 kJ/mol for liquid dodecane. Agreement inside 0.2 kJ/mol means the formation-enthalpy inputs are consistent, so the flame-temperature results inherit that confidence.

The verified table, copied from the script output:

| Quantity                             |    Value | Unit   |
|--------------------------------------|----------|--------|
| Stoich. O2 per mol fuel              |     18.5 | mol    |
| Stoich. air per mol fuel             |     88.1 | mol    |
| Stoich. air-fuel ratio (mass)        |     14.9 | kg/kg  |
| Reaction enthalpy 298 K, LHV basis   |    -7514 | kJ/mol |
| LHV (water vapour)                   |     44.1 | MJ/kg  |
| HHV (water liquid)                   |     47.5 | MJ/kg  |
| Fuel vaporisation enthalpy           |     61.2 | kJ/mol |
| T_ad, lambda=1, reactants 298 K      |     2410 | K      |
| T_ad, lambda=2, reactants 298 K      |     1505 | K      |
| T_ad, lambda=1, air preheat 700 K    |     2683 | K      |
| T_ad, lambda=2, air preheat 700 K    |     1832 | K      |
| lambda for 1800 K exit, air 700 K    |     2.07 | -      |
| O2 in dry exhaust, lambda=2          |     10.9 | mol%   |
| CO2 in dry exhaust, lambda=2         |      7.1 | mol%   |
| Exhaust per kg fuel, lambda=2        |     30.8 | kg/kg  |

Three reads on these numbers. First, preheat is worth real temperature: raising the air from 298 to 700 K adds 327 K at λ = 2, because 176 mol of air per mole of fuel carries a large sensible enthalpy. 700 K is a plausible compressor delivery; MIT's turbojet example at pressure ratio 25 lands near 750 K from a 300 K inlet. Second, λ = 2 with that preheat produces 1832 K, and the inverse solve puts λ = 2.07 exactly on 1800 K. That is the sizing arithmetic a combustor designer runs when setting the dilution-air split against a turbine limit. Third, the exhaust is 30.8 kg per kilogram of fuel, so a small fuel flow trims the temperature of a large air stream. That is why the course lists fuel-flow modulation as the combustor's temperature control.

## Boundary of the model

- **Linear Cp.** Against the full Shomate curves, the linear laws misprice the sensible-enthalpy integral from 298 to 2500 K by 1.1% in the worst case (CO₂). The script checks the integral because that is the quantity the energy balance consumes. Pointwise, CO₂'s curvature costs about 5% near 1500 K.
- **No dissociation.** Above roughly 2000 K, CO₂ and H₂O partially dissociate and absorb energy, and the course is explicit that adiabatic flame temperatures overestimate real flames, which also radiate. Treat 2410 K at λ = 1 as an upper bound. The λ = 2 results sit below 1900 K, where the error is smaller, and the equilibrium tools from the course map are the way to do better.
- **Idealised balance.** Complete combustion, adiabatic walls, ideal gases, air as O₂ + 3.76 N₂, fuel as liquid at 298 K with vaporisation folded into the LHV basis (61.2 kJ/mol, 0.8% of the heat release).
- **Surrogate fuel.** Kerosene is a blend; I used n-dodecane as a single-component stand-in, a standard choice in combustion coursework. For scale, MIT's notes use 42.8 MJ/kg for a conventional hydrocarbon fuel where the script computes 44.1 MJ/kg for pure C₁₂H₂₆.

Reproduce: `python3 research/combustion-thermo/verify_thermo.py` prints the table above and runs 21 checks; it exits 0 only if every value sits within its stated tolerance.
