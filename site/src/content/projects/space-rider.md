---
title: 'ESA Space Rider — Blender Model'
year: 2026
status: complete
categories: [design]
tags: [Blender, glTF, 3D]
summary: 'A detailed Blender reconstruction of the ESA Space Rider spaceplane, built from public blueprints and the official payload user guide.'
methodLine: 'Blender · hard-surface modelling · glTF export'
role: 'Modeller'
duration: '1 semester'
heroMetrics:
  - { label: 'Format', value: 'glTF/GLB' }
  - { label: 'Web bundle', value: '14.0 MB' }
keyOutputs:
  - 'Hard-surface modelling of a real aerospace vehicle from engineering references (blueprints, ESA payload guide).'
  - 'Web-native delivery: exported to glTF and embedded as an interactive viewer on this site.'
featured: true
sample: false
order: 8
studySequence: 1
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
