---
title: 'Reconstructing a 3D Spacecraft Model in Blender from ESA Blueprints'
year: 2026
date: '2026-06-15'
status: complete
categories: [design]
tags: [design]
summary: 'During my 17-week internship in 2026, I reconstructed a 3D model of the Space Rider spacecraft in Blender based on publicly available European Space Agency blueprints and technical documentation.'
role: '3D Modeling Intern'
duration: '17 weeks'
featured: true
order: 8
studySequence: 16
model3d: /models/space-rider-v5.050.glb
heroImage: /images/projects/space-rider/reference/esa-earth-render.jpg
cardImageFit: cover
---

## Project Overview

From April to August 2026, I completed a 17-week internship at Felisiak Ingénierie & Développement in Paris. The company was building a 3D asset catalog for Europe's Spaceport in Kourou, French Guiana, enabling engineers to inspect launch vehicles, launch pads, ground facilities, and operational workflows directly within mission review applications.

Space Rider was my first full modeling assignment, as well as the most critical one. At the time, the company had only a rough polygonal mesh with roughly correct proportions but lacking accurate surface curvature and fidelity (which I ultimately discarded rather than built upon).

In short, my task was to reconstruct an accurate 3D model of the Space Rider spacecraft in Blender using exclusively publicly available documentation, targeting a geometric tolerance of approximately 10 cm.

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/reference/esa-official-render.jpg" alt="ESA official Space Rider concept render" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">ESA official Space Rider orbital concept render</figcaption>
</figure>

<video controls class="my-8 w-full rounded-xl shadow-sm" preload="metadata">
  <source src="/videos/projects/space-rider/esa-space-rider-1.mp4" type="video/mp4">
</video>

## Reference Materials

ESA's three-view orthographic blueprints served as the sole geometric truth for vehicle contours. The official User Guide was used to position cargo bay doors, service access panels, and reaction control thrusters; ESA conceptual renders and hardware photographs guided livery boundaries and material properties; photographs of the predecessor IXV vehicle were referenced strictly to resolve obscure hardware details without dictating Space Rider's outer mold line.

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/report/official-blueprint.png" alt="ESA three-view blueprint" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">ESA official three-view blueprint</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/report/blueprint-calibration.png" alt="Blueprint scale calibration" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Blueprint 4.6 m calibration (276.96 px/m)</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/reference/esa-infographic.jpg" alt="ESA Space Rider infographic" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">ESA official infographic</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/reference/user-guide-cover.jpg" alt="Space Rider User Guide cover" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Space Rider User Guide cover</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/reference/ixv.jpg" alt="Predecessor IXV vehicle" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Predecessor IXV experimental demonstrator reference</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/reference/esa-earth-render.jpg" alt="ESA Space Rider orbital concept render" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">ESA official orbital concept render</figcaption>
</figure>

<video controls class="my-8 w-full rounded-xl shadow-sm" preload="metadata">
  <source src="/videos/projects/space-rider/esa-space-rider-2.mp4" type="video/mp4">
</video>

## Version 1 (v1)

Version 1 was primarily an exploratory draft, though the final output was unacceptable for production. In just two days, I built out the full vehicle assembly: re-entry module, service module, propellant tanks, nozzles, solar arrays, navigation lights, and decals.

However, inspecting the renders revealed numerous flaws: the nose was far too pointed; cargo bay doors protruded unnaturally from the fuselage curvature; wingtip lights ended up in the wrong coordinates; and the model inadvertently featured vertical stabilizers (which do not exist on Space Rider) alongside thermal protection tile details borrowed erroneously from IXV.

I reshaped the sharp nose into a blunt dome, purged detached objects from the main body, and deleted the erroneous vertical fin, flaps, door panels, and surplus brackets.

My takeaway from v1 was that high visual completeness does not equal geometric correctness. Adding fine details too early makes subsequent proportional corrections vastly more expensive.

## Version 2 (v2)

In v2, I established the canonical vehicle geometry by rebuilding the re-entry module from scratch. Early iterations used only 31 cross-sectional rings; I increased this to 91 rings with 32 vertices each, capturing the wedge profile that slopes monotonically from the tall aft section toward the chiseled nose.

This iteration also resolved three lingering issues:

- Fixed the right-hand decal mirroring problem by configuring independent left and right text objects;
- Replaced per-face thermal protection system (TPS) material assignments with a position-driven analytical shader;
- Discovered an 11% excess in fuselage height, compressed the overall geometry, and re-calibrated all dimensions against the blueprints.

Once v2.720 was complete, the vehicle possessed its intended form. It became our protected baseline—every subsequent branch rollback returned to this milestone.

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v2-720-cinematic.jpg" alt="v2.720 protected baseline full vehicle render" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">v2.720 protected baseline vehicle geometry</figcaption>
</figure>

## Version 3 (v3)

Starting with v3, I set up an automated inspection loop: selecting target regions, modifying a minimal number of vertices per cycle, saving and reloading, and evaluating changes in topology, materials, and vertex positions.

However, after running more than 60 iterations—each passing automated checks—the model showed virtually no discernible improvement. Local smoothness scores kept rising, but without a fixed global objective guiding the convergence path.

This branch was ultimately abandoned and rolled back to v2. The bottleneck in that workflow was evident: an optimization loop that only refines local metrics without anchoring to a global ground truth like orthographic blueprints can iterate endlessly without approaching the final deliverable. In AI-assisted workflows, defining unambiguous, verifiable criteria is critical.

## Version 4 (v4)

In v4, I tried radial reconstruction to eliminate pinch wrinkles at the nose apex. While the wrinkles disappeared, the nose became artificially shortened, the ventral curvature flattened, and the black TPS boundary contracted.

Side-by-side comparison between v4 and v2.720 showed that the new version was inferior overall, prompting another complete branch rollback.

Following this rollback, I instituted a strict rule: never sacrifice verified global proportions and livery boundaries to resolve localized surface imperfections.

## Version 5 (v5)

My core principle for v5 became: diagnose display artifacts first before touching geometry. Retaining v2.720 as the foundation, I first locked the camera strictly to the blueprint overlay view.

During this process, two seemingly severe geometric defects turned out not to be geometric at all. A visible weld seam across the nose tip was merely a shading artifact that vanished instantly once Weighted Normals were enabled—without moving a single vertex. A depression band across the nose was caused by inverted winding order on 82% of the base faces, which resolved after recalculating normal vectors.

From that point on, I switched viewport shading to a clay material under raking light before evaluating geometry. Dark materials disguise flat planes as depressions, while uniform lighting conceals surface waviness. I banned Taubin smoothing, which had previously collapsed convex nose sections into multiple dimples, restricting subsequent cleanup strictly to outward normal-based depression corrections.

When fine manual vertex adjustments eventually produced a crease line across the nose, I adopted a different approach: fitting the entire nose in a single analytical pass using B-spline cross-sections combined with symmetric Fourier series (91 coefficients in total, achieving a fitting RMS of 2.6 mm).

A minor crease remained at the tip because the control cage terminated in a pseudo-pole. This confirmed that the underlying topology was flawed, meaning vertex shifting could never resolve the issue. I deleted the terminal face loop entirely and rebuilt the apex into a clean polar fan, achieving zero surface dimples for the first time. Topological flaws cannot be solved by simply tweaking vertices!

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v5.015-wide.jpg" alt="v5.015 milestone full vehicle render" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">v5.015 milestone vehicle</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v5.027-wide.jpg" alt="v5.027 milestone full vehicle render" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">v5.027 milestone vehicle</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v5.044-wide.jpg" alt="v5.044 milestone full vehicle render" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">v5.044 milestone vehicle</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v5.049-wide.jpg" alt="v5.049 milestone full vehicle render" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">v5.049 milestone vehicle</figcaption>
</figure>

## Blueprints as the Ultimate Ground Truth

During the first rigorous blueprint overlay inspection, I identified substantial deviations: the mid-fuselage roof was 103 mm too high, while the nose was 60–180 mm too low.

I remapped the fuselage along its longitudinal stations onto B-spline curves fitted directly to blueprint profiles. Following this adjustment, side-view deviations were bounded within ±6 mm, and top-view deviations within ±8.4 mm.

Every cross-section was also projected onto fitted ellipses for verification, resulting in a worst-case discrepancy of 2.1 mm and an RMS deviation of 0.5 mm.

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/blueprint-overlay.png" alt="Final blueprint overlay verification" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Final blueprint overlay verification (side view ±6 mm / top view ±8.4 mm)</figcaption>
</figure>

Surface smoothing followed the same analytical rigor. An initial 4 cm grid-based limiter passed all numerical checks but left visible ripples with 2.39 mm RMS across the outer shell. Transitioning to a mesh-free analytical limiter reduced surface roughness to 0.09 mm RMS.

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/report/surface-rake-before-after.png" alt="Raking light comparison before and after analytical surface constraints" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Raking light surface ripple comparison before and after analytical constraints</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/report/animation-ready.png" alt="v5.051 animation-ready four-component model" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">v5.051 animation-ready four-component model</figcaption>
</figure>

## Final Verification and Deliverable Metrics

The final model satisfied all client delivery tolerances:

| Inspection Item | Result |
|---|---:|
| Side view vs. blueprint | Within ±6 mm |
| Top view vs. blueprint | Within ±8.4 mm |
| Aft deck planarity | ±0.6 mm |
| Cross-section ellipse fit | Worst-case 2.1 mm, RMS 0.5 mm |
| Number of dimples / depressions | 0 |
| Surface roughness | 0.09 mm RMS (reduced from 2.39 mm) |
| Pre/post cleanup pixel difference | 0.00000 |

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/final-vehicle.png" alt="Client-accepted v5.050 Space Rider" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Client-accepted v5.050 Space Rider final model</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v5-050-side.jpg" alt="v5.050 final side view" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Final side view profile</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v5-050-persp.jpg" alt="v5.050 final perspective view" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Final perspective view</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/detail-flap.jpg" alt="Flap detail" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Body flap detail</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/detail-nozzle.jpg" alt="Nozzle detail" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Thruster nozzle detail</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/detail-wings-full.jpg" alt="Wing surface detail" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Wing surface detail</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/detail-tail.jpg" alt="Tail detail" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Aft section detail</figcaption>
</figure>
