---
title: 'ESA Space Rider — From Blockout to Blueprint-Exact'
year: 2026
date: '2026-08-14'
status: complete
categories: [design]
tags: [Blender, glTF, 3D]
summary: 'Five version lines—two abandoned—turned a Blender blockout into a ±6 mm Space Rider reconstruction and a 579 KB interactive GLB.'
methodLine: 'Blender · bpy/bmesh pipeline · blueprint-calibrated remapping · glTF/Draco'
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
order: 8
studySequence: 13
model3d: /models/space-rider.glb
heroImage: /images/projects/space-rider-blueprint.png
---

## Context & objectives

The interactive model above — drag to rotate, scroll to zoom — is the delivered v5.051 build of ESA's Space Rider spaceplane, reconstructed in Blender from public material only. It matches the official blueprint to ±6 mm in the side view and ±8.4 mm in the top view over the 4.88 m body, and its final smoothed mesh carries zero concave dents. The brief asked for about 10 cm.

Getting here took five version lines in four weeks of modelling (mid-May to mid-June 2026), plus a packaging and web-delivery phase in August. Two of the five lines were abandoned and rolled back. This article reconstructs that history from the project's own records: what each version tried, what broke, how the failure was found, and what fixed it.

## Why this model exists

The project was my A4 internship mission at Felisiak Ingénierie & Développement, a small engineering company in Paris, April to August 2026. The company prepares satellite launch campaigns at Europe's Spaceport in Kourou, and it is building a catalogue of 3D models so engineers can review operations interactively instead of in slide shows. The models feed a campaign-review application: pick a scenario, see the launcher, pad, and ground means in 3D.

Space Rider was the catalogue's first need. What the company had, in my tutor's words, was an ugly polygonal shape with roughly real proportions. The need was operational: engineers use the models to check sizes and clearances, so about 10 cm of accuracy would do. The constraints were public reference material only, a clean sealed surface, logical parts that can be animated, and FBX delivery for Unity and Blender.

## The reference evidence

ESA publishes unusually complete material on Space Rider, and the first task was deciding what to trust.

| Source | Role |
|---|---|
| Official three-view blueprint | The only shape authority. Calibrated to 276.96 px/m from its own dimension lines. |
| Payload Cargo Bay User Guide (114 pages) | Cargo-bay door size, late-access doors, thruster layout. |
| ESA renders and hardware photos | Paint scheme, logo positions, materials. |
| IXV photos (the predecessor vehicle) | Only for details missing on Space Rider images. Never for shape. |
| ESA infographic | Cross-check of the main dimensions. |

Two rules came out of this audit. The blueprint alone controls shape, because photographs carry lens distortion and artistic licence. And IXV is not Space Rider: the predecessor wears a different paint scheme, so it could inform details but never silhouette.

The calibration deserves one line of detail. The blueprint is an image, so I measured its own 4.6 m dimension callout: 1274 px, giving 276.96 px/m. The top view produced the same value independently. Every later blueprint comparison inherits that number.

## How the history is documented

On June 12, the day after the submission build was saved, the client had me keep only the key versions: 1,472 intermediate blend files and roughly 1,900 renders (10 GB) went to the trash. Eight baseline blends, the 42 pipeline scripts, and the milestone renders survived. The early history therefore lives in dated session-memory records, a 763-line iteration log, audit scripts, file timestamps, and the git log of the documentation phase. The figure below is a timeline because the early renders no longer exist to montage.

![Version road from the v1.0 blockout (May 15) to the 579 KB web GLB (August). The v3 and v4 branches were abandoned and rolled back to the protected v2.720 baseline; dates come from file timestamps, session memory, and the iteration log.](/images/projects/space-rider/version-timeline.svg)

## v1 — the blockout (May 15–16)

**Goal:** a complete vehicle from the reference set. By v1.52 the scene held 149+ objects: a lofted lifting-body reentry module, the AVUM service module with gold rings and 24-bolt flanges, four tanks and a helium sphere, a de Laval nozzle with 36 cooling ribs, four-panel solar wings at 12 m span, navigation lights, decals, and an Earth backdrop.

**What failed:** the client reviewed renders and sent short messages, and each one was a defect. The nose was pointed; real reentry vehicles are blunt, because a sharp tip would concentrate aerodynamic heating. After the nose was shortened, the old nose cap floated outside the new body. A wingtip light sat at x=9 m because its object origin had moved while its mesh had not. A flat cargo-door plate stuck 4 cm out of the curved hull. An early build had invented vertical fins that Space Rider never had, and TPS tiles and panel seams borrowed from the IXV test article sat on the shell, along with twelve brackets and access panels the client wanted gone.

**Fix:** v1.48 rounded the tip, v1.50 resculpted 156 vertices into a dome, v1.52 swept the orphaned geometry, and v1.71–1.74 stripped the shell smooth. After every reshape, an audit script scanned every mesh's world bounding box, because trusting object names had already failed twice. In the same days, the user guide's findings landed — cargo door 1200×718 mm, two late-access doors, hinge brackets from Figure 2-7 — and the sealed-shell directive then deleted most of them again. The goal had moved from engineering view to canonical render.

**Artifact:** the v1.63 blend, 180 KB, the first coherent full vehicle.

## v2 — the canonical shape (May 17–Jun 5)

**Goal:** rebuild the reentry module as the real shape, then converge on it.

v2.15 rebuilt the module from scratch as a bmesh loft: 31 section rings of 16+ vertices, soft chines, a flat heat-shield floor. The client ordered the shell stripped — fins, flaps, door plate, brackets — turning the v1 defect list into standing rules. v2.82 replaced the loft with the iron/wedge silhouette of the ESA pillars artwork: peak at the rear, a monotone fall to a chisel nose, 91 rings of 32 vertices.

Three fixes from this line earned their keep. The right-side decals had rendered mirrored for weeks; v2.281 fixed them with a symmetric FONT-object configuration (port rotated π/2, 0, π; starboard π/2, 0, 0), because the negative-scale trick was the bug. v2.405 moved the white/black TPS boundary into an analytic shader mask driven by object position, ending the staircase where face assignment met subdivision. v2.406 caught the body 11% too tall (1.60 m against the blueprint's 1.438 m) and squashed all 127 module assembly objects with one Sz(0.9) matrix; v2.408 then audited every dimension against blueprint and infographic and matched.

**What failed:** the tail of the line. From v2.870 to v2.999 an autonomous loop accepted micro-passes of 2–8 vertices, x locked, displacements around 5 µm, each save/reopen-audited. It produced version files faster than visible change.

**Artifacts:** v2.720 (June 2), kept as the protected baseline that survives every later rollback, and v2.999 (June 5), the end of the line.

## v3 — the audit-script era (Jun 4–6)

**Goal:** keep polishing the body with a fully gated autonomous loop. Dry-run scans ranked candidate regions; accepted passes moved a handful of vertices; save/reopen audits verified the changed vertex ids against unchanged topology and material slots. Side branches that resurrected rejected materials or un-hid the cargo bay were rejected on audit, with clean `.blend1` backups preserving the mainline. Over 60 passes were accepted in about two days.

**What failed:** there was no global target. Each pass improved a local smoothness score; the model as a whole went nowhere. The iteration log documents motion without progress.

**Diagnosis:** written into the final report — a loop needs a fixed target, and local scores are not one.

**Artifact:** `ITERATION_GOAL.md`, 763 lines of accepted micro-passes, plus the audit scripts v3001–v3030 under `.codex/`.

## v4 — the rejected rebuild (Jun 6–8)

**Goal:** eliminate the nose-tip wrinkle ring by rebuilding the tip radially. The wrinkles went away. So did the things the client cared about: the rebuild shortened the nose, relaxed the belly, and shrank the black paint region.

**Diagnosis:** two accepted properties — proportions and the paint boundary — had been traded for a local shading fix. The client compared v4 against v2.720 and judged it worse. The whole line was rolled back, and the rule stuck: never trade proportions or paint for a local fix.

**Artifact:** none on disk. The line's only residue is the rule, and the restored v2.720 baseline that v5 built on.

## v5 — smooth, sealed, blueprint-exact (Jun 8–15)

v5.000 restarted from the protected v2.720 with comparison cameras locked to the reference views. This line ran 51 versions in a week and became the delivered model.

### The nose and the paint

The nose had to be rounded, convex everywhere, and proportioned like the hardware photos. v5.001 replaced the tip with a tangent-continuous cone cap and gated all twenty smoothing modifiers with a directional vertex group, because smoothing convexifies the upper shell but hooks the lower nose. v5.008 lengthened the nose 19% to match photo proportions. v5.029–031 corrected the profile asymmetry: the blueprint's upper slope is gentle and its chin steep, and the model had the two backwards.

A shader draws the paint boundary as a curve z_b(x): a belly band at z=−0.233 m, a vertical step at the splice station, a crown that leaves about 45% of the nose top white, and a full black tip wrap. v5.018 put body and nose on the same shader line and verified it by ray-casting the line into camera pixels: one straight row at y=554–557, where the previous build had jumped 25 px between segments.

### Diagnosis before geometry

Two expensive defects turned out to be display artifacts. The weld ring around the rebuilt tip was a shading seam: enabling a WeightedNormals modifier after the subdivision removed it with zero vertex moves (v5.011). The dent band on the nose came from inverted face winding on 82% of the base mesh; recalculating normals collapsed the apparent dents and exposed that the concavity metric had been fooled by the same normals (v5.031). Geometry judgments now require a clay override and raking light. Dark materials read as holes, and uniform light washes out ripples.

One operation stayed banned: relaxing a convex surface. A Taubin relax meant to blend the tip dished it instead, leaving 28 concave vertices (v5.009, abandoned). The safe tool only pushes dents out along their normals; it never pulls.

Patch accumulation forced the global rebuilds. Local fixes had left crease bands, so v5.033 refit the whole nose shell in one solve — B-spline sections against a symmetric Fourier series, 91 coefficients, rms 2.6 mm. The tip itself resisted every vertex-level fix, because the cage ended in a crowded pseudo-pole that subdivision creases no matter where the vertices sit. v5.034 deleted the last 1,565 faces and rebuilt the tip as a pole fan laid on the same contraction-law surface as its neighbours. Zero dents on the whole model, for the first time.

### Blueprint-exact

Mid-project, the client promoted the blueprint side view to the single shape standard. The first honest audit after calibration showed the mid-body roof 103 mm too high and the nose 60–180 mm too low. v5.035 remapped the body station by station onto B-spline fits of the traced outline: ≤±6 mm over the full body. Later passes closed the other views — top planform to ±8.4 mm, the tail deck flat at z=0.9444 m — and projected every cross-section onto its fitted ellipse, worst 2.1 mm and 0.5 mm rms, with one documented 8 mm exception in the nose transition where the ellipse rule conflicts with the blueprint front view.

Surface finish got the same treatment. A grid-based clamp left 2.39 mm rms ripples on the white shell; a grid-free analytic clamp cut that to 0.09 mm rms. The telling detail: v5.041's numbers had passed, and only a grazing-light render pair showed why the client still saw waves. Perceptual defects need perceptual verification.

![Final blueprint overlays in the three views: the model against the traced blueprint curves after the v5.035–046 remapping. Side view residual ≤±6 mm, top view ≤±8.4 mm.](/images/projects/space-rider/blueprint-overlay.png)

### Delivery

Client rules deleted whole feature classes. Two hundred eighty rivets went in across v5.013–015 and came out on request; six panel-seam curves followed them. The tail was rebuilt twice, first misreading the blueprint's sloped terrace as capsule (v5.047), then correctly as a flat vertical aft face with a separate docking structure (v5.048). Finally the client asked to close the gap entirely: 157 service-module objects moved forward 0.2505 m into a zero-gap dock. The model sits 0.24 m shorter than the blueprint as a result — an explicit decision, documented as one.

v5.050 (June 11) is the submission build. An automated cleanup removed 249 draft objects — 176 diagnostic cameras, test lights, old seam geometry — and a pixel-difference check against the previous version returned 0.00000. v5.051 (June 15) merges the 119 visible parts into four logical parts for animation and engine import: capsule, service module, left wing, right wing, vertex-identical to v5.050. The client's acceptance was three words: "shape is very nice."

![The delivered v5.050 vehicle with wings deployed: white lifting-body shell, black boot paint, gold AVUM rings, and the four-panel solar wings at 12 m span.](/images/projects/space-rider/final-vehicle.png)

## The web pipeline

The browser model above is a 579 KB derivative of the 14.05 MB authored export, and getting it here took two real fixes.

**The solar arrays came out white.** The authored solar cells use procedural Blender shader nodes, and glTF 2.0 has no way to express them. The first web export carried the geometry across and dropped the shading. The fix is a translation that runs in an isolated web-export workspace, so the release blend stays untouched: the build copies the v5.051 source, replaces the procedural shading with a glTF-native Principled PBR material, exports the GLB, then re-imports the exported file and fails unless the `SolarCell_WebPBR` material exists and stays blue-dominant. The check runs on every build. It guarantees colour and broad PBR response; a full material-equivalence claim would need channel-by-channel texture bakes, which remain the identified follow-up.

**Shipping 579 KB instead of 14.05 MB.** Geometry simplification was the obvious step and I rejected it: simplification creates a second geometric representation, and that representation would need its own fidelity tolerance against the first. This project keeps one source of truth for shape. The site derivative uses gltf-transform's Draco compression with simplification disabled and textures recompressed to WebP at 2048 px, dropping 14,048,124 bytes to 579,460 at the original vertex count. Texture fidelity is the accepted cost. The full blend source, roughly 490 MB with textures, was never a site deliverable.

The release path stays non-destructive end to end:

1. preserve the authored v5.051 release blend;
2. copy it into the isolated web-export workspace;
3. replace the procedural solar-cell shading with Principled PBR;
4. export glTF 2.0 as a binary GLB;
5. re-import the GLB and verify the blue `SolarCell_WebPBR` material;
6. produce the Draco-compressed site derivative without mesh simplification.

## Publication checks

The browser deliverable is accepted only when the model loads without a fallback, orbit and zoom remain usable, the solar arrays render blue, and reduced-motion mode disables automatic rotation. The source release, the web export, and the site derivative remain separate artifacts, so a presentation optimisation cannot silently become the modelling master.

The project closed as an internship deliverable: a written report and a poster for the school defense (stage S11 2026, defense scheduled for September 10), the release package with the 42 pipeline scripts, and the animation-ready variant the client asked for.

## What I took away

Calibrate first. The blueprint's 276.96 px/m was extracted mid-project, after the shape had already been profiled three times against photographs; the final report lists this as the main avoidable rework.

Every metric contains an assumption. Twice the pipeline measured the wrong thing with full confidence: inverted face winding made a concavity metric report dents on convex geometry, and a bucketed constraint printed the ripples it then failed to see. Every check now gets validated against a known-good case before it gates anything.

A loop without a global target grinds local detail forever. v3 accepted over 60 gated passes in two days and the model did not visibly change; v5 ran with the blueprint as a fixed target and reached ±6 mm within days.

Topology problems do not yield to vertex moves. The nose tip survived projection, shrinkwrap, and smoothing attempts, and was fixed only by deleting 1,565 faces and rebuilding the pole.

The delivery format is its own verification problem. Nothing in the modelling pipeline promised that glTF could carry a procedural shader, and the first export proved it could not.

## Scope boundary

This project demonstrates reference-led geometry reconstruction, a scripted Blender hard-surface workflow, material portability to glTF, and interactive 3D delivery. It offers no aerodynamic coefficients, structural analysis, thermal protection design, or manufacturing geometry; those would require different source authority and different validation evidence. The surface is a reconstruction from public material, with no claim of manufacturer CAD or flight-article tolerance. The blend source keeps 124 deliberately hidden functional objects — the cargo-bay interior and spare decals — documented in the release notes, hidden by client preference and restorable in one flag.
