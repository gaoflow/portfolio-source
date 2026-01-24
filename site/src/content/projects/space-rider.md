---
title: 'ESA Space Rider — Blender Model'
year: 2026
date: 2026-01
status: complete
categories: [design]
tags: [Blender, glTF, 3D]
summary: 'A detailed Blender reconstruction of the ESA Space Rider spaceplane, built from public blueprints and the official payload user guide.'
methodLine: 'Blender · hard-surface modelling · glTF export'
role: 'Modeller'
duration: '1 semester'
heroMetrics:
  - { label: 'Format', value: 'glTF/GLB' }
  - { label: 'Web bundle', value: '579 KB' }
keyOutputs:
  - 'Reconstructed a real aerospace vehicle from public blueprint views and the ESA payload guide.'
  - 'Published the v5.051 model as a web-native GLB with a verified blue solar-array PBR material.'
  - 'Reduced transfer size from 14.05 MB to 579 KB with non-simplifying Draco compression.'
featured: true
sample: false
order: 8
studySequence: 5
model3d: /models/space-rider.glb
heroImage: /images/projects/space-rider-blueprint.png
---

## Context & objectives

A modelling study of the ESA Space Rider — the European uncrewed lifting-body spaceplane — built in Blender from public engineering references: the official blueprint and the Space Rider Payload Cargo Bay User Guide. The goal was a dimensionally faithful exterior suitable for presentation and interactive display.

## Methodology

Hard-surface modelling in Blender, cross-checked against the reference blueprint views. The web version above uses the latest v5.051 joined export with web-compatible PBR materials in glTF 2.0 (GLB). Its site derivative uses Draco geometry compression without simplification, reducing the transfer asset from 14.05 MB to 579 KB while retaining the original render-vertex count. Drag to rotate and scroll to zoom.

## Results

The interactive model is embedded above. The project was submitted with a written report and a poster (school presentation, stage S11 2026).

## Failures & iterations

The `.blend` source (~490 MB with full texture set) is far too heavy for the web. The authored GLB is 14.05 MB; the shipped, non-simplified Draco derivative is 579 KB. Geometry fidelity was prioritised over texture detail for interactive use.

## Reference hierarchy

The modelling workflow separates geometric references from visual references. Orthographic blueprint views control silhouette, planform, major openings, and relative proportions. The ESA payload guide constrains the vehicle context and cargo-bay interpretation. Public photographs help resolve transitions that are ambiguous in line drawings, but perspective images do not override the orthographic construction.

This hierarchy matters because a visually plausible model can still drift dimensionally when every view is treated as equally authoritative. The final surface is a reconstruction from public material—not manufacturer CAD and not a claim of flight-article tolerance.

## Geometry workflow

The body was developed as a hard-surface model with repeated cross-checks between top, side, and front views. Large lifting-body surfaces and control-surface breaks were established before local details. Symmetry was retained as long as possible so that changes to the primary shape propagated consistently.

The release path is deliberately non-destructive:

1. preserve the authored v5.051 `.blend` release;
2. copy it into an isolated web-export workspace;
3. replace Blender-only procedural solar-cell shading with glTF-compatible Principled PBR;
4. export glTF 2.0 as a binary GLB;
5. re-import the GLB and verify that the `SolarCell_WebPBR` material exists and remains blue-dominant;
6. produce a separate Draco-compressed site derivative without mesh simplification.

## Web-delivery decision

The 14.05 MB authored GLB preserves the modelling output but is expensive for a project page. Geometry simplification would reduce transfer cost further, yet it would also introduce a second geometric representation that requires its own fidelity tolerance. The selected 579 KB derivative therefore compresses geometry without changing the render-vertex count.

Texture fidelity is intentionally reduced. The current web material preserves the solar-array colour and broad PBR response; it does not reproduce the authored procedural microstructure. A full material-equivalence claim would require baking and validating base-colour, roughness, metallic, and normal maps.

## Publication checks

The browser deliverable is accepted only when the model loads without a fallback, orbit and zoom remain usable, the solar arrays render blue rather than white, and reduced-motion mode disables automatic rotation. The source release, web export, and site derivative remain separate artifacts so a presentation optimisation cannot silently become the modelling master.

## Scope boundary

This project demonstrates reference-led geometry reconstruction, Blender hard-surface workflow, material portability, and interactive 3D delivery. It does not provide aerodynamic coefficients, structural analysis, thermal protection design, or manufacturing geometry. Those would require different source authority and validation evidence.
