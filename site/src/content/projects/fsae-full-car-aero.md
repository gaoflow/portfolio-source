---
title: 'Template — FSAE Full-Car Aero Evidence Contract'
year: 2026
date: 2026-08
status: complete
categories: [fsae, validation]
tags: [OpenFOAM, RANS, correlation, publication contract]
summary: 'A nine-section contract for turning future Formula Student aero work into a permission-safe, quantitatively defensible case study.'
methodLine: 'Requirements · CFD verification · contribution accounting · correlation'
role: 'Case-study template'
team: 'Not claimed'
duration: 'Publication template'
heroMetrics:
  - { label: 'Published claims', value: '0' }
  - { label: 'Required sections', value: '9' }
keyOutputs:
  - 'Defines the minimum mesh, solver, component, uncertainty, and correlation evidence for a full-car case study.'
  - 'Keeps team permission and NDA boundaries ahead of geometry screenshots or aerodynamic numbers.'
featured: false
sample: true
order: 8
---

> This is **sample content**, not a completed FSAE aerodynamic result. No downforce, drag, mesh-size, or correlation value is claimed. The page stays marked `sample: true` until real work and publication permission satisfy every gate below.

## 1. Permission and scope

Record what the team owns, what the author produced, and what may be published before any technical writing. Geometry, livery, operating maps, competitor comparisons, wind-tunnel data, and track telemetry can each carry different permissions.

An NDA-safe article may describe method and responsibility while withholding geometry and coefficients. Permission must be explicit; the absence of an NDA does not make team work public.

## 2. Engineering objective

Define the vehicle state and the decision before running CFD:

- regulation year and relevant bodywork constraints;
- baseline package and allowed design variables;
- speed, ride height, pitch, yaw, steering, wheel rotation, and moving-ground assumptions;
- the objective metric: load balance, efficiency, sensitivity, or cooling interaction;
- acceptance and rejection thresholds.

"Increase downforce" is not an objective. The study needs a trade-off and an operating envelope.

## 3. Geometry and reference quantities

Document CAD provenance, cleanup operations, symmetry decisions, suppressed details, wheel and ground treatment, and component groups. Freeze reference area, length, coordinate system, coefficient signs, and moment origin before comparing variants.

Component contributions must sum consistently to the whole-car convention. Raw force counts without reference definitions are not portable evidence.

## 4. Numerical methodology

The article must state:

- OpenFOAM and mesher versions;
- steady or transient formulation, and the reason;
- turbulence model, wall treatment, and target and observed $y^+$ regime;
- domain dimensions and blockage;
- inlet turbulence, moving road, rotating wheels, symmetry, and outlet conditions;
- cell count, refinement regions, layer settings, and transition limits;
- discretisation schemes, solver staging, relaxation, and stopping criteria.

Tool names alone establish nothing. Each choice needs a physical or numerical reason.

## 5. Verification before aerodynamics

The minimum mesh gate includes complete `checkMesh` output, no unresolved failed checks, mass balance, finite fields, bounded residual and force histories, and component-output completeness. A three-level grid study should report the exact refinement variable and the observed-order or GCI assumptions, rather than comparing unrelated meshes.

If the mesh fails, coefficient plots remain diagnostic artifacts and cannot be promoted to design evidence.

## 6. Results and contribution accounting

Publish normalised coefficients with uncertainty and the complete operating condition. A useful table separates whole-car and component changes:

| Output | Baseline | Candidate | Difference | Evidence |
|---|---:|---:|---:|---|
| $C_L$ or $SC_L$ | measured value | measured value | computed delta | force history + steady-window rule |
| $C_D$ or $SC_D$ | measured value | measured value | computed delta | same |
| Aero balance | measured value | measured value | computed delta | component force definitions |

Contour images must answer a mechanism question — pressure recovery, separation, leakage, wake interaction. Decoration is not evidence.

## 7. Validation and correlation

Correlation gets its own section. State the independent reference, sensor and calibration uncertainty, test repeatability, configuration match, and comparison metric. Track data require speed, ride, yaw, wind, tyre, and control-state context; wind-tunnel data require blockage, Reynolds scaling, moving-ground, and support-system context.

When no physical reference exists, say so. Mesh independence and convergence are verification, not experimental validation.

## 8. Failures and iterations

Retain diverged runs, rejected mesh strategies, geometry simplifications, and concepts that failed the design gate. For each failure, record the symptom, diagnosis, controlled change, and resulting decision. A development history is stronger evidence than a single polished contour.

## 9. Publication gate

Replace this template only when the case has:

1. written publication permission;
2. owned, versioned inputs and scripts;
3. a passing mesh and solver gate;
4. traceable force and component histories;
5. grid or discretisation evidence;
6. correlation evidence, or an explicit statement that none exists;
7. generated figures and a reproducible report;
8. limitations and failed cases;
9. an evidence manifest connecting each public number to an artifact.

Until then, the honest output is this contract, not invented performance.
