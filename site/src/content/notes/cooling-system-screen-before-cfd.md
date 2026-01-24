---
title: 'Screen the Cooling System Before Spending CFD Compute'
published: 2026-08-18
summary: 'Why pump, branch, radiator, fan, and transient thermal constraints should be closed as a system before detailed airflow CFD is allowed to optimise the installation.'
tags: [FSAE, cooling, hydraulics, thermal modelling]
sourceProjects: [fsae-cooling]
featured: false
order: 5
---

Detailed radiator CFD cannot rescue an infeasible cooling architecture. Before resolving ducts, cores, and hot-air recirculation, the system must establish that its hydraulic and thermal operating points can satisfy the vehicle requirement.

This is a model-ordering problem: use inexpensive models to reject bad architectures, then spend CFD on the surviving installation questions.

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

A component catalogue is not a requirement. Selecting a radiator and pump first can create a system that appears adequate only because the target moved around the hardware.

## The hydraulic operating point is an intersection

A pump does not deliver its headline flow once installed. The operating point is where pump head equals total system loss:

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

with equal pressure drop across parallel branches and total flow conservation. The coefficient is only as credible as its source and operating range, but the network exposes gross imbalance before a 3-D solve.

## Couple the air and liquid sides

Radiator heat rejection depends on both coolant flow and air mass flow. A useful reduced-order relation is

$$
\dot Q = UA\,\Delta T_{lm},
$$

or an effectiveness–NTU form when inlet states and capacity rates are known. The core map must be evaluated at the system operating point, not at an isolated catalogue maximum.

The air side needs its own intersection:

- fan pressure-rise curve;
- radiator and duct pressure loss;
- vehicle ram pressure;
- bypass and recirculation paths;
- fan duty and electrical limits.

A fan can have adequate free-air flow and still deliver insufficient core flow after installation resistance is added.

## Add transient energy before geometry detail

A steady heat balance cannot answer a short high-load event. A finite-volume coolant model can track the energy stored in coolant and wall/control volumes:

$$
\rho c_p V\frac{dT}{dt} = \dot m c_p(T_{in}-T) + \dot Q_{source} - \dot Q_{rejected}.
$$

The model should preserve:

- total energy across every time step;
- consistent advection direction;
- temperature-dependent properties if they matter over the envelope;
- pump and fan state changes;
- the difference between peak temperature and final temperature;
- time-step and spatial sensitivity.

The purpose is not to imitate full CFD. It is to determine whether thermal mass and system flow provide enough margin to justify detailed installation work.

## Evidence from the FSAE cooling screen

The [FSAE Cooling study](/projects/fsae-cooling) couples digitised component curves, a hydraulic network, radiator-side screening, and an 80-cell transient coolant model.

Its baseline reports:

| Quantity | Result |
|---|---:|
| Main-loop flow | 10.03 L/min |
| Motor-branch flow | 4.61 L/min |
| Peak radiator outlet temperature | 59.45 °C |
| Final decision | NO-GO for passive E3 architecture |

The transient discretisation checks report a 0.029 K spatial difference and a 0.018 K time-step difference for the selected comparison. This establishes numerical stability at the scale relevant to the screening result.

The key engineering result is not a component temperature screenshot. The unchanged 40 °C passive E3 architecture is rejected before procurement because the system-level operating point and margin do not support it.

## Why a NO-GO screen is valuable

A low-order model can reject an architecture for reasons that detailed CFD should not be asked to fix:

- pump head is insufficient at the required flow;
- parallel branches starve a critical component;
- radiator liquid-side capacity is inadequate;
- fan/core intersection misses the low-speed requirement;
- transient thermal mass cannot cover the duty cycle;
- electrical or package limits invalidate the combination.

CFD should enter after these constraints close, to answer installation questions such as:

- inlet pressure recovery and distortion;
- core-face flow uniformity;
- fan/core interaction;
- hot-air recirculation;
- exit placement and aerodynamic coupling;
- duct separation and leakage;
- local component temperatures.

## The handoff contract to CFD

The system screen should provide CFD with:

1. required air and coolant mass-flow ranges;
2. core pressure-loss and heat-transfer maps with provenance;
3. fan and pump operating points;
4. heat loads and transient duty cycles;
5. acceptable maldistribution and pressure-drop limits;
6. packaging boundaries and permitted geometry variables;
7. temperature-dependent fluid properties;
8. sensor locations and correlation plan;
9. the design decisions CFD is allowed to change.

Without this handoff, CFD may optimise an attractive duct around a non-viable system.

## Evidence quality matters more than model complexity

The cooling screen explicitly retains a limitation: the component curves are secondary-hosted and conservatively biased. That prevents the result from becoming procurement approval. Final component selection needs first-party curves or measured hydraulic and thermal data.

This is the correct authority boundary. A reproducible reduced-order result can support architecture rejection while remaining insufficient for hardware sign-off.

## Boundary of this note

The equations above are screening forms. Compressibility, cavitation, phase change, complex coolant mixtures, highly temperature-dependent maps, or coupled control dynamics may require higher-order treatment. The sequencing remains: establish system feasibility first, then use CFD where spatial flow physics controls the remaining decision.
