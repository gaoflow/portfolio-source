---
title: 'ESA Space Rider — From Blockout to Blueprint-Exact'
year: 2026
date: '2026-06-15'
status: complete
categories: [design]
tags: [Design]
summary: 'The client-accepted v5.050 model closed at ±6 mm against the blueprint and now loads directly as a 639 KB interactive GLB; v5.051 remains a separate animation-ready derivative.'
role: '3D modelling intern'
duration: '17 weeks'
featured: true
order: 8
studySequence: 16
model3d: /models/space-rider-v5.050.glb
heroImage: /images/projects/space-rider-blueprint.png
---

## Context & objectives

The interactive model above — drag to rotate, scroll to zoom — is derived directly from the client-accepted v5.050 GLB. It is no longer sourced from the v5.051 Web export. The reconstructed body matches the official blueprint to ±6 mm in the side view and ±8.4 mm in the top view over 4.88 m, and its final smoothed mesh carries zero concave dents. The brief asked for about 10 cm.

Getting here took five version lines in four weeks of modelling (mid-May to mid-June 2026), plus a packaging and web-delivery phase in August. Two of the five lines were abandoned and rolled back. This article reconstructs that history from the project's own records: what each version tried, what broke, how the failure was found, and what fixed it.

## Why this model exists

The project was my A4 internship mission at Felisiak Ingénierie & Développement, a small engineering company in Paris, April to August 2026. The company prepares satellite launch campaigns at Europe's Spaceport in Kourou, and it is building a catalogue of 3D models so engineers can review operations interactively instead of in slide shows. The models feed a campaign-review application: pick a scenario, see the launcher, pad, and ground means in 3D.

Space Rider was the catalogue's first need. What the company had, in my tutor's words, was an ugly polygonal shape with roughly real proportions. The need was operational: engineers use the models to check sizes and clearances, so about 10 cm of accuracy would do. The constraints were public reference material only, a clean sealed surface, logical parts that can be animated, and FBX delivery for Unity and Blender.

The catalogue supports launch-campaign preparation at Europe's Spaceport in Kourou. The company's Windows application turns two kinds of background material into an interactive review: the physical launch complex and the operation sequence from payload arrival to launch.

<div class="grid gap-4 sm:grid-cols-2">
  <figure>
    <img src="/images/projects/space-rider/report/a6-process.jpg" alt="Ariane 6 launch complex schematic showing integration halls, fueling facilities, and launch pad" loading="lazy" />
    <figcaption>The launch-complex schematic that inspired the campaign-review application. Source: company documentation reproduced in the Final Submit report.</figcaption>
  </figure>
  <figure>
    <img src="/images/projects/space-rider/report/a6-campaign-flow.jpg" alt="Payload launch campaign flow from arrival and integration through fueling to launch" loading="lazy" />
    <figcaption>A typical D−6 to D0 payload campaign: arrival, integration, fueling, and launch. The 3D catalogue lets reviewers inspect these stages spatially.</figcaption>
  </figure>
</div>

## The reference evidence

ESA publishes unusually complete material on Space Rider, and the first task was deciding what to trust.

| Source | Role |
|---|---|
| Official three-view blueprint | The only shape authority. Calibrated to 276.96 px/m from its own dimension lines. |
| Payload Cargo Bay User Guide (114 pages) | Cargo-bay door size, late-access doors, thruster layout. |
| ESA renders and hardware photos | Paint scheme, logo positions, materials. |
| IXV photos (the predecessor vehicle) | Only for details missing on Space Rider images. Never for shape. |
| ESA infographic | Cross-check of the main dimensions. |

![Official ESA three-view blueprint used as the sole shape authority for the reconstruction.](/images/projects/space-rider/report/official-blueprint.png)

Two rules came out of this audit. The blueprint alone controls shape, because photographs carry lens distortion and artistic licence. And IXV is not Space Rider: the predecessor wears a different paint scheme, so it could inform details but never silhouette.

The calibration deserves one line of detail. The blueprint is an image, so I measured its own 4.6 m dimension callout: 1274 px, giving 276.96 px/m. The top view produced the same value independently. Every later blueprint comparison inherits that number.

![Calibrated side-view blueprint after cropping and tracing. The 4.6 m dimension spans 1274 px, fixing the scale at 276.96 px/m.](/images/projects/space-rider/report/blueprint-calibration.png)

The report also compares the hand-modelled hardware directly with its references. These images matter because the blueprint controls silhouette, while renders and photographs control details, paint, and materials.

<div class="grid gap-4 sm:grid-cols-2">
  <figure>
    <img src="/images/projects/space-rider/report/comparison-tail.png" alt="Reference and reconstructed Space Rider rear structures side by side" loading="lazy" />
    <figcaption>Rear structures: reference at left, hand-modelled service module and propulsion hardware at right.</figcaption>
  </figure>
  <figure>
    <img src="/images/projects/space-rider/report/comparison-wings.png" alt="Reference and reconstructed Space Rider solar wings side by side" loading="lazy" />
    <figcaption>Four-panel solar wings, hinges, latches, and the service-module body.</figcaption>
  </figure>
  <figure>
    <img src="/images/projects/space-rider/report/comparison-full.png" alt="ESA full vehicle render and reconstructed Space Rider model side by side" loading="lazy" />
    <figcaption>Full vehicle with both wings deployed: ESA render at left, reconstructed model at right.</figcaption>
  </figure>
  <figure>
    <img src="/images/projects/space-rider/report/comparison-nose.png" alt="Hardware nose photograph and reconstructed nose and boot paint side by side" loading="lazy" />
    <figcaption>Nose and boot paint. Rivets and the logo plate are absent by explicit client rule.</figcaption>
  </figure>
</div>

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

## What I tried, rejected, and corrected

The Final Submit report retains the unsuccessful work instead of smoothing it into one clean path.

| Attempt | What the evidence showed | Decision |
|---|---|---|
| v3 micro-adjustments | Thousands of checked moves improved local scores but had no fixed global target and produced no visible overall progress. | Roll back to v2.720; require one authoritative target. |
| v4 radial nose rebuild | Removed the wrinkle ring but shortened the nose, relaxed the belly, and shrank the black paint region. | Reject the branch; preserve proportions and paint. |
| Taubin relaxation on the convex shell | Blended one region while creating 28 concave vertices elsewhere. | Ban inward relaxation; allow one-direction push-out only. |
| Treating a weld ring as bad geometry | Weighted Normals removed the ring with zero vertex moves. | Check shading and normals before editing geometry. |
| Reading the nose dent band literally | 82% of the base faces had inverted winding; the concavity metric was measuring the wrong normal direction. | Validate the metric on a known-good case, then recalculate normals. |
| Repeated local surface patches | The patches accumulated into crease bands. | Replace them with one B-spline × Fourier global refit using 91 coefficients. |
| A 4 cm grid-based surface constraint | Printed 2.39 mm rms ripples into the shell even though the numeric gate passed. | Use a grid-free analytic constraint; roughness fell to 0.09 mm rms. |
| Vertex-level nose-tip corrections | The wrinkle remained because the pseudo-pole topology was the cause. | Delete 1,565 faces and rebuild the tip as a clean pole fan. |
| v5.047 sloped rear terrace | Misread docking structure as part of the capsule. | Rebuild v5.048 with a flat vertical aft face and separate docking structure. |
| Rivets and panel seams | 280 rivets and six seam curves added visual noise and contradicted the client's clean-shell rule. | Delete the full feature classes. |

## v5 — smooth, sealed, blueprint-exact (Jun 8–15)

v5.000 restarted from the protected v2.720 with comparison cameras locked to the reference views. This line ran 51 versions in a week and produced the accepted v5.050 geometry plus its v5.051 animation-ready derivative.

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

![Grazing-light comparison before and after the analytic surface constraint. The grid-printed ripple bands visible above are absent below.](/images/projects/space-rider/report/surface-rake-before-after.png)

![Final blueprint overlays in the three views: the model against the traced blueprint curves after the v5.035–046 remapping. Side view residual ≤±6 mm, top view ≤±8.4 mm.](/images/projects/space-rider/blueprint-overlay.png)

### Delivery

Client rules deleted whole feature classes. Two hundred eighty rivets went in across v5.013–015 and came out on request; six panel-seam curves followed them. The tail was rebuilt twice, first misreading the blueprint's sloped terrace as capsule (v5.047), then correctly as a flat vertical aft face with a separate docking structure (v5.048). Finally the client asked to close the gap entirely: 157 service-module objects moved forward 0.2505 m into a zero-gap dock. The model sits 0.24 m shorter than the blueprint as a result — an explicit decision, documented as one.

![Final flat aft face and zero-gap service-module junction introduced after the v5.047 interpretation was rejected.](/images/projects/space-rider/report/tail-junction.png)

v5.050 (June 11) is the submission build and the client-accepted final source. An automated cleanup removed 249 draft objects — including 176 diagnostic cameras, test lights, and old seam geometry — and a pixel-difference check against the previous accepted render returned 0.00000. v5.051 (June 15) is a separate animation-ready derivative: it applies the modifiers and merges 119 visible parts into four logical parts for animation and engine import — capsule, service module, left wing, right wing — while retaining the v5.050 shape. The client's acceptance was three words: \"shape is very nice.\" The later request was operational: \"Join meshes for animation.\"

![The delivered v5.050 vehicle with wings deployed: white lifting-body shell, black boot paint, gold AVUM rings, and the four-panel solar wings at 12 m span.](/images/projects/space-rider/final-vehicle.png)

<div class="grid gap-4 sm:grid-cols-3">
  <figure>
    <img src="/images/projects/space-rider/report/final-perspective.png" alt="Client-accepted Space Rider v5.050 final model in perspective view" loading="lazy" />
    <figcaption>v5.050 perspective.</figcaption>
  </figure>
  <figure>
    <img src="/images/projects/space-rider/report/final-ortho-side.png" alt="Client-accepted Space Rider v5.050 final model in orthographic side view" loading="lazy" />
    <figcaption>v5.050 orthographic side.</figcaption>
  </figure>
  <figure>
    <img src="/images/projects/space-rider/report/final-ortho-top.png" alt="Client-accepted Space Rider v5.050 final model in orthographic top view" loading="lazy" />
    <figcaption>v5.050 orthographic top.</figcaption>
  </figure>
</div>

## Final source, animation derivative, and browser model

**v5.050 is the client-accepted final source file.** `space_rider_v5.050.blend` retains its modifiers and 273-object authoring structure; the release package also contains its FBX and GLB exports, five preview renders, and 42 pipeline scripts.

**v5.051 is the animation-ready derivative.** It starts from v5.050, applies the modifiers, converts text and curve decals to mesh, and joins 119 visible parts into four logical components. The reentry module, service module, left wing, and right wing can then be rigged or imported into Unity without changing the accepted outer shape.

![The v5.051 animation-ready derivative: four logical components prepared for rigging and engine import.](/images/projects/space-rider/report/animation-ready.png)

The interactive model on this page is derived directly from the client-accepted v5.050 GLB. The versioned URL prevents a browser cache from reusing the retired model. v5.051 remains available as a separate animation-ready deliverable; it is not the source loaded by this page.

## The web pipeline

The current browser model starts from `release/space_rider_v5.050.glb`, the portable export beside the client-accepted Blender source. The publication step runs only gltf-transform's Draco command with scene-wide position quantisation. It preserves the source scene hierarchy, meshes, materials, textures, and render vertex count while reducing 11,603,048 bytes to 639,296 bytes.

An earlier browser experiment used the v5.051 Web PBR path. That path solved a real material problem — procedural Blender solar-cell shaders had exported as white — but it is no longer the model published on this page. The animation-ready package remains useful for rigging and Unity; the portfolio viewer now loads the accepted v5.050 export directly.

The active release path is:

1. preserve `space_rider_v5.050.blend` as the client-accepted authoring source;
2. take its release-side portable export, `space_rider_v5.050.glb`;
3. run `gltf-transform draco --quantization-volume scene` without deduplication, instancing, joining, or simplification;
4. publish the immutable, versioned path `/models/space-rider-v5.050.glb`;
5. reject the build if the old `/models/space-rider.glb` returns.

## Publication checks

The browser artifact is accepted only when the versioned v5.050 file exists, its SHA-256 matches the release gate, the obsolete unversioned model is absent, and the page points to the versioned URL. Orbit and zoom remain part of the runtime smoke test. The v5.050 source, v5.051 animation derivative, and site-compressed v5.050 artifact remain separate deliverables.

The project closed as an internship deliverable: a written report and a poster for the school defense (stage S11 2026, defense scheduled for September 10), the release package with the 42 pipeline scripts, and the animation-ready variant the client asked for.

## Final verification from the report

| Check | Target | Measured |
|---|---:|---:|
| Side view against blueprint | ≤±6 mm | within ±6 mm |
| Top view | ≤±8.4 mm | within ±8.4 mm |
| Tail deck | flat | ±0.6 mm |
| Cross-sections | elliptical | worst 2.1 mm; rms 0.5 mm |
| Concave dents | 0 | 0 |
| Surface roughness | — | 0.09 mm rms, reduced from 2.39 mm |
| Submission cleanup | pixel-identical | 0.00000 |

## What I took away

Calibrate first. The blueprint's 276.96 px/m was extracted mid-project, after the shape had already been profiled three times against photographs; the final report lists this as the main avoidable rework.

Every metric contains an assumption. Twice the pipeline measured the wrong thing with full confidence: inverted face winding made a concavity metric report dents on convex geometry, and a bucketed constraint printed the ripples it then failed to see. Every check now gets validated against a known-good case before it gates anything.

A loop without a global target grinds local detail forever. v3 accepted over 60 gated passes in two days and the model did not visibly change; v5 ran with the blueprint as a fixed target and reached ±6 mm within days.

Topology problems do not yield to vertex moves. The nose tip survived projection, shrinkwrap, and smoothing attempts, and was fixed only by deleting 1,565 faces and rebuilding the pole.

The delivery format is its own verification problem. Nothing in the modelling pipeline promised that glTF could carry a procedural shader, and the first export proved it could not.

## Scope boundary

This project demonstrates reference-led geometry reconstruction, a scripted Blender hard-surface workflow, material portability to glTF, and interactive 3D delivery. It offers no aerodynamic coefficients, structural analysis, thermal protection design, or manufacturing geometry; those would require different source authority and different validation evidence. The surface is a reconstruction from public material, with no claim of manufacturer CAD or flight-article tolerance. The blend source keeps 124 deliberately hidden functional objects — the cargo-bay interior and spare decals — documented in the release notes, hidden by client preference and restorable in one flag.
