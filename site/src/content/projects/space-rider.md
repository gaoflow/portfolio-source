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
studySequence: 6
model3d: /models/space-rider.glb
heroImage: /images/projects/space-rider-blueprint.png
---

## Context & objectives

The interactive model above — drag to rotate, scroll to zoom — is a 579 KB web derivative of a 14.05 MB authored export, with the solar arrays verifiably blue in the browser. Getting there took two real fixes, detailed below: the first export rendered the arrays white, and the first delivery format was far too heavy for a project page.

The subject is the ESA Space Rider, the European uncrewed lifting-body spaceplane, reconstructed in Blender from public engineering references: the official blueprint views and the Space Rider Payload Cargo Bay User Guide. The goal was a dimensionally faithful exterior suitable for presentation and interactive display — a modelling study, with no aerodynamic or structural claim attached.

## Reference hierarchy

The workflow separates geometric references from visual ones. Orthographic blueprint views control silhouette, planform, major openings, and relative proportions. The ESA payload guide constrains the vehicle context and cargo-bay interpretation. Public photographs help resolve transitions that are ambiguous in line drawings, but a perspective image never overrides the orthographic construction.

The hierarchy exists because a visually plausible model can still drift dimensionally when every view is treated as equally authoritative. The final surface is a reconstruction from public material, with no claim of manufacturer CAD or flight-article tolerance.

## Geometry workflow

The body was developed as a hard-surface model with repeated cross-checks between top, side, and front views. Large lifting-body surfaces and control-surface breaks were established before local details. Symmetry was retained as long as possible so that changes to the primary shape propagated consistently.

## Iteration: the solar arrays came out white

The authored solar cells use procedural Blender shader nodes, and glTF 2.0 has no way to express them. The first web export carried the geometry across and dropped the shading: the arrays rendered white on the page.

The fix is a translation, not a simplification, and it runs in an isolated web-export workspace so the release `.blend` stays untouched. The build copies the v5.051 release, replaces the Blender-only procedural shading with a glTF-native Principled PBR material, exports the GLB, then re-imports the exported file and verifies that the `SolarCell_WebPBR` material exists and remains blue-dominant. The check runs on every build, and browser acceptance adds a human look: the arrays render blue, not white.

This fix guarantees colour and broad PBR response. It does not reproduce the authored procedural microstructure; a full material-equivalence claim would require baking and validating base-colour, roughness, metallic, and normal maps channel by channel.

## Iteration: shipping 579 KB instead of 14.05 MB

The authored GLB is 14.05 MB — workable as an archive, expensive as a web page. Geometry simplification was the obvious next step and I rejected it: simplification creates a second geometric representation, and that representation would need its own fidelity tolerance against the first. This project keeps one source of truth for shape.

The site derivative therefore uses Draco geometry compression with simplification disabled, dropping the transfer asset from 14.05 MB to 579 KB at the original render-vertex count. Texture fidelity is the accepted cost. The full `.blend` source, roughly 490 MB with its texture set, is not part of the site deliverable at all.

The release path stays non-destructive end to end:

1. preserve the authored v5.051 `.blend` release;
2. copy it into the isolated web-export workspace;
3. replace the procedural solar-cell shading with Principled PBR;
4. export glTF 2.0 as a binary GLB;
5. re-import the GLB and verify the blue `SolarCell_WebPBR` material;
6. produce the Draco-compressed site derivative without mesh simplification.

## Publication checks

The browser deliverable is accepted only when the model loads without a fallback, orbit and zoom remain usable, the solar arrays render blue, and reduced-motion mode disables automatic rotation. The source release, the web export, and the site derivative remain separate artifacts, so a presentation optimisation cannot silently become the modelling master.

The project was submitted with a written report and a poster (school presentation, stage S11 2026).

## Scope boundary

This project demonstrates reference-led geometry reconstruction, a Blender hard-surface workflow, material portability to glTF, and interactive 3D delivery. It offers no aerodynamic coefficients, structural analysis, thermal protection design, or manufacturing geometry; those would require different source authority and different validation evidence.
