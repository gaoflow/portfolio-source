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

## Why I made this model

From April to August 2026, I worked as a 3D modelling intern at Felisiak Ingénierie & Développement in Paris. The company was building a catalogue of 3D models for Europe's Spaceport in Kourou, French Guiana. Engineers would use the catalogue in a mission-review application to inspect launch vehicles, launch pads, ground facilities, and operational sequences.

Space Rider was my first complete model. The company initially had a polygonal shape with roughly correct proportions but not enough surface quality or detail.

My brief was to reconstruct the vehicle from public references, create a clean sealed exterior, organise its parts for animation and engine import, and deliver it as FBX for Unity and Blender. The required geometric accuracy was about 10 cm.

This is not ESA manufacturer CAD or a measurement of a flight article. It is a public-reference reconstruction made for a mission-review application.

## Choosing the references that could control the shape

I treated ESA's three-view blueprint as the only authority for the vehicle's overall shape. I used the Payload Cargo Bay User Guide to check cargo-bay doors, late-access doors, and thruster positions. ESA renders and hardware photographs informed the paint, markings, and materials. Photographs of the predecessor IXV vehicle were used only when Space Rider details were unclear, never to determine the silhouette.

| Source | How I used it |
|---|---|
| ESA three-view blueprint | Overall outline and principal dimensions |
| Payload Cargo Bay User Guide | Door and thruster layout |
| ESA renders and hardware photographs | Paint, markings, and materials |
| IXV photographs | Missing details only, not Space Rider's shape |

I calibrated the blueprint from its marked 4.6 m dimension. A span of 1274 px represented 4.6 m, giving a scale of 276.96 px/m. The side and top views independently produced the same scale.

![Official ESA three-view blueprint used as the sole shape authority.](/images/projects/space-rider/report/official-blueprint.png)

![Blueprint calibration using the marked 4.6 m dimension, which spans 1274 px and gives a scale of 276.96 px/m.](/images/projects/space-rider/report/blueprint-calibration.png)

I should have completed this calibration at the start. Instead, I promoted the blueprint to the sole shape standard midway through the project, after I had already reshaped the body three times from photographs. That was the main source of avoidable rework.

## v1: completing the vehicle exposed the shape problems

I built the first complete version in two days. It included the reentry module, service module, tanks, nozzle, solar wings, navigation lights, and decals.

The client review showed that completeness was not the same as accuracy. The nose was too sharp, the cargo-bay door projected from the curved body, and a wingtip light had moved to the wrong position. I had also added vertical fins that Space Rider does not have and thermal-protection details taken from IXV.

I replaced the pointed nose with a blunt rounded dome and removed geometry that had become detached from the body. At the client's request, I also deleted the fins, flaps, door panel, and unnecessary brackets.

This version taught me that adding detail too early only makes later proportion changes more expensive.

## v2: rebuilding the standard shape

For v2, I rebuilt the reentry module from scratch. The early body used 31 section rings. I later increased it to 91 rings with 32 vertices per ring to form the wedge profile: highest at the rear and falling monotonically toward the chisel-shaped nose.

This branch resolved three persistent problems:

- The right-side decals had been mirrored for weeks. I corrected them by giving the left and right text objects independent orientations.
- I replaced face-by-face assignment along the black-and-white thermal-protection boundary with an analytic shader controlled by position.
- The body was 11% too tall, so I compressed it and checked its dimensions again against the blueprint.

v2.720 became the protected baseline used for every later rollback.

## v3: many checked changes without real progress

In v3, I built an automated audit loop. It selected a candidate area, moved a small number of vertices, saved and reopened the file, and then checked the topology, materials, and changed vertices.

More than 60 adjustment passes were accepted in two days, but the model showed almost no visible overall improvement. Local smoothness scores kept getting better because the loop had no fixed global target.

I abandoned the branch. Its useful result was a clear rule: an automated loop can work indefinitely without approaching the final shape if it optimises local measurements without an authoritative target such as the blueprint.

## v4: fixing a wrinkle while damaging the proportions

v4 attempted to remove the wrinkle around the nose tip through a radial rebuild. The wrinkle disappeared, but the operation also shortened the nose, loosened the belly curve, and reduced the black-painted area.

The client compared v4 with v2.720 and judged the newer version worse, so I rolled back the entire branch.

That failure established another rule: I could not sacrifice accepted proportions or paint boundaries to solve a local surface problem.

## v5: diagnosing display problems before editing geometry

I restarted v5 from v2.720 and locked the comparison cameras to the blueprint views.

Two apparently serious defects turned out not to be geometric. A weld-like ring around the nose tip was a shading seam; enabling Weighted Normals removed it without moving any vertices. A dented band around the nose came largely from reversed face winding on 82% of the base faces. Recalculating the normals substantially corrected the result.

After that, I checked the body with a clay material and raking light before changing its geometry. Dark materials could make areas look like holes, while even lighting could hide surface waves.

I also rejected Taubin relaxation after it pulled the convex nose inward and created 28 concave points. Later correction tools were limited to pushing dents outward along their normals rather than pulling the surface inward.

## Replacing local patches with a global rebuild

Repeated local vertex edits gradually created bands of creases. In v5.033, I replaced those patches with a single global fit of the entire nose. The method combined B-spline sections with a symmetric Fourier series using 91 coefficients and achieved an rms fit of 2.6 mm.

The tip still creased because the end of the control cage formed a pseudo-pole. Moving vertices could not correct the underlying topology. In v5.034, I deleted the final 1,565 faces and rebuilt the tip as a clean pole fan. For the first time, the model reached zero concave dents.

This confirmed that a topology problem cannot be solved by continuing to move vertices.

## Converging on the blueprint

The first strict blueprint comparison showed that the middle of the body was 103 mm too high, while the nose was 60–180 mm too low.

I remapped the body station by station onto B-spline fits of the blueprint outline. The final side-view deviation remained within ±6 mm, and the top-view deviation remained within ±8.4 mm.

I also projected each cross-section onto a fitted ellipse. The worst difference was 2.1 mm, with an rms of 0.5 mm. I retained one documented 8 mm exception in the nose transition because the ellipse rule conflicted with the blueprint's front view.

![Final blueprint overlay after the body was remapped to the traced reference outlines.](/images/projects/space-rider/blueprint-overlay.png)

Surface finishing required the same change from local numerical success to a reliable global method. A constraint based on a 4 cm grid passed its numerical checks but printed visible waves into the shell, leaving 2.39 mm rms roughness. Replacing it with a grid-free analytic constraint reduced the roughness to 0.09 mm rms.

![Raking-light comparison before and after the analytic surface constraint.](/images/projects/space-rider/report/surface-rake-before-after.png)

## Removing details was part of the result

I added 280 rivets and six panel-seam curves during development. The client judged that they added visual noise, so I removed both feature classes completely.

I also rebuilt the tail twice. In the first attempt, I misread the docking structure shown in the blueprint as part of the reentry module. The second version used a flat vertical aft face and kept the docking structure separate.

Finally, I moved the entire service module forward by 0.2505 m to create a zero-gap connection. This made the finished vehicle 0.24 m shorter than the blueprint. It was an explicit client operational decision, not a measurement error.

![Final vertical aft face and zero-gap service-module connection.](/images/projects/space-rider/report/tail-junction.png)

## v5.050 and v5.051

v5.050 was submitted and accepted by the client on June 11. It is the final authoring source and retains its modifiers and 273-object modelling structure.

v5.051 is a separate animation-ready derivative. I applied the modifiers, converted text and curves to meshes, and joined 119 visible objects into four logical components:

- reentry module;
- service module;
- left wing;
- right wing.

This structure is easier to rig and import into Unity without changing the accepted outer shape.

![The v5.051 animation-ready derivative organised into four logical components.](/images/projects/space-rider/report/animation-ready.png)

The interactive model on this page is the v5.050 GLB, not v5.051. Its browser publication step uses only Draco compression and scene-wide position quantisation. It does not simplify, join, deduplicate, or instance the meshes.

The file was reduced from 11,603,048 bytes to 639,296 bytes while retaining the scene hierarchy, meshes, materials, and textures.

## Final verification

| Check | Result |
|---|---:|
| Side view against blueprint | Within ±6 mm |
| Top view against blueprint | Within ±8.4 mm |
| Tail deck flatness | ±0.6 mm |
| Cross-section ellipse fit | Worst 2.1 mm; rms 0.5 mm |
| Concave dents | 0 |
| Surface roughness | 0.09 mm rms, reduced from 2.39 mm |
| Pixel difference after cleanup | 0.00000 |

![Client-accepted Space Rider v5.050 model.](/images/projects/space-rider/final-vehicle.png)

## What I learned

First, I need to establish the authoritative reference before modelling. I extracted the blueprint scale of 276.96 px/m only midway through the project, after reshaping the body three times from photographs.

Second, every metric needs validation against a known-good case. Reversed normals caused the concavity check to measure the wrong thing, while the coarse grid constraint passed its numerical gate despite leaving visible waves.

Third, automation needs a global target. v3 accepted more than 60 checked passes without visible overall progress. v5 converged only after I locked the work to the blueprint.

Fourth, topology problems require topology changes. The nose tip resisted projection, smoothing, and vertex edits until I removed 1,565 faces and rebuilt the pole.

Finally, the delivery format needs its own verification. A procedural Blender solar material appeared white in the first glTF export, showing that a model can be correct in Blender and still fail after engine export.

## Limits

This project demonstrates public-reference geometry reconstruction, Blender modelling, version rollback, surface inspection, and interactive 3D delivery.

It does not provide aerodynamic coefficients, structural analysis, thermal-protection design, or manufacturing geometry. I do not claim that the model reaches ESA manufacturer-CAD accuracy or flight-article tolerances.
