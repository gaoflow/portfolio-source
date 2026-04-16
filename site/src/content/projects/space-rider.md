---
title: 'Rebuilding a 3D Model in Blender from Satellite Blueprints'
year: 2026
date: '2026-06-15'
status: complete
categories: [design]
tags: [Design]
summary: 'During my 17-week internship in 2026, I rebuilt a 3D model of the Space Rider spacecraft from blueprints and reference information published by the European Space Agency.'
role: '3D modelling intern'
duration: '17 weeks'
featured: true
order: 8
studySequence: 16
model3d: /models/space-rider-v5.050.glb
heroImage: /images/projects/space-rider/reference/esa-earth-render.jpg
cardImageFit: cover
---

## About the model

From April to August 2026, I interned for 17 weeks at Felisiak Ingénierie & Développement in Paris. The company is building a catalogue of 3D models for Europe's Spaceport in Kourou, French Guiana, so that engineers can look at launch vehicles, launch pads, ground facilities, and operational procedures directly inside a mission-review application.

Space Rider was the first complete model task I was given, and the most important one. At the time, the company only had a polygonal shape with roughly correct proportions but not enough surface quality or detail (in the end I did not reuse it).

In short, my actual job was to rebuild the Space Rider model in Blender using only public references. The required geometric accuracy was about 10 cm.

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/reference/esa-official-render.jpg" alt="ESA official Space Rider concept image" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">ESA official Space Rider orbital concept render</figcaption>
</figure>

<video controls class="my-8 w-full rounded-xl shadow-sm" preload="metadata">
  <source src="/videos/projects/space-rider/esa-space-rider-1.mp4" type="video/mp4">
</video>

## References

ESA's three-view blueprint was the only authority for the shape. The user guide fixed the positions of the cargo-bay doors, access doors, and thrusters; ESA renders and hardware photographs let me infer the paint and materials; photographs of the predecessor IXV could only fill in details that were genuinely unreadable, never decide Space Rider's shape.

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
  <img src="/images/projects/space-rider/reference/user-guide-cover.jpg" alt="Space Rider user guide cover" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Space Rider user guide cover</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/reference/ixv.jpg" alt="The predecessor IXV vehicle" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Reference for the predecessor IXV demonstrator</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/reference/esa-earth-render.jpg" alt="ESA Space Rider orbital concept render" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">ESA official orbital concept render</figcaption>
</figure>

<video controls class="my-8 w-full rounded-xl shadow-sm" preload="metadata">
  <source src="/videos/projects/space-rider/esa-space-rider-2.mp4" type="video/mp4">
</video>

## v1

v1 was mainly an attempt at modelling, and the result was almost unacceptable. I spent only two days on the first version and built the entire vehicle, including the reentry module, service module, tanks, nozzle, solar wings, navigation lights, and decals.

But just looking at the renders, there were a lot of problems: the nose was too sharp; the cargo-bay door bulged out of the curved surface; a wingtip light had ended up in the wrong place; and the model had a vertical tail fin that Space Rider does not have at all, plus thermal-tile details taken over from IXV.

I changed the sharp nose to a blunt rounded dome, cleaned up the objects that had come loose from the body, and deleted the fin, flaps, door panels, and extra brackets.

What I thought after the first version was that a high level of completeness is not the same as a correct shape. The earlier you add detail, the more expensive the later proportion changes become.

## v2

In v2 I redid the standard shape: I rebuilt the reentry module from scratch. The early version used only 31 section rings; I later raised it to 91 rings with 32 vertices per ring, and only then did I get the wedge profile, high at the rear and falling monotonically toward the chisel-shaped nose.

This version also fixed three problems that had been dragging on:

- I solved the right-side decals that had been mirrored all along. In the end I gave the left and right text objects their own independent orientations;
- the black-and-white TPS boundary used to be painted face by face with materials; I changed it to an analytic shader driven by position;
- after comparing, I found the body was 11% too tall, so I compressed it as a whole and checked the dimensions against the blueprint again.

When v2.720 was done, it roughly had the shape it should have. So it became the protected baseline. Every later rollback went back to here.

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v2-720-cinematic.jpg" alt="v2.720 protected-baseline full-vehicle render" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">v2.720 protected-baseline full-vehicle shape</figcaption>
</figure>

## v3

In v3 I tried using Claude Code to set up an automatic checking loop: pick a candidate region, move only a small number of vertices per round, save and reopen, then check the topology, materials, and vertex changes.

But after more than 60 rounds, every round passed the checks while the model showed almost no visible progress. The local smoothness score kept going up, but there was no fixed global target telling it where to go.

This branch was finally abandoned as a whole and rolled back to v2. I think Claude Code is flawed by design here. If a loop only optimises local metrics and has no global target like the blueprint, it can keep working forever without ever getting closer to the finish. Giving AI coding a clear, verifiable goal is very important.

## v4

In v4 I again tried Claude Code, this time using a radial rebuild to remove the wrinkles at the nose tip. The wrinkles did disappear, but the nose was shortened, the belly curve went slack, and the black-painted area shrank.

When I put v4 side by side with v2.720, the conclusion was that the new version was worse, so the whole branch was rolled back once more.

After this rollback, I gave the AI a rule: do not sacrifice already-accepted proportions and paint boundaries to solve a local surface problem.

## v5

My principle for v5 changed to checking display problems first and touching geometry only after. v5 carried on from v2.720, and this time the first rule was to lock the cameras onto the blueprint comparison views.

In the process, two defects that looked serious turned out not to be geometry problems at all. The welded-looking ring at the nose tip turned out to be a shading seam; with Weighted Normals turned on, it disappeared without moving a single vertex. The dented band around the nose was there because 82% of the base faces had reversed winding; recalculating the normals once improved it a lot.

From then on, before judging the geometry I first switched the material to clay and lit it with raking light. Dark materials easily make flat areas look like holes, and even lighting hides ripples. I banned Taubin relaxation, which had once pulled the convex nose inward into a lot of concave points. After that, the only safe tool I allowed was pushing dents outward along their normals.

But later a new problem came up: I kept moving local vertices and slowly stacked a band of creases into the surface. So I changed my thinking: fit the whole nose in one pass, using B-spline sections plus a symmetric Fourier series, specifically 91 coefficients in total, with an rms fit of 2.6 mm.

But in the end the nose tip still had creases, because the end of the control cage was a pseudo-pole. That meant the topology itself was wrong, and moving vertices could not cure the problem. So I deleted all the last faces and rebuilt the tip as a clean pole fan. At that point the model reached zero dents for the first time. A topology problem cannot be solved by moving more vertices!

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v5.015-wide.jpg" alt="v5.015 stage full-vehicle render" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">v5.015 stage full vehicle</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v5.027-wide.jpg" alt="v5.027 stage full-vehicle render" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">v5.027 stage full vehicle</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v5.044-wide.jpg" alt="v5.044 stage full-vehicle render" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">v5.044 stage full vehicle</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v5.049-wide.jpg" alt="v5.049 stage full-vehicle render" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">v5.049 stage full vehicle</figcaption>
</figure>

## The blueprint is king

In the first strict blueprint comparison I found: the top of the middle body was 103 mm too high, and the nose was 60–180 mm too low.

Station by station along the body, I remapped it onto B-spline fits of the blueprint outline. After the change, the side view stayed within ±6 mm and the top view within ±8.4 mm.

Each cross-section was also projected onto a fitted ellipse for checking: the worst difference was 2.1 mm, with an rms of 0.5 mm.
<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/blueprint-overlay.png" alt="Final blueprint overlay result" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Final blueprint overlay check (side ±6 mm / top ±8.4 mm)</figcaption>
</figure>

Surface smoothing went the same way. At first I used a constraint based on a 4 cm grid; the numerical checks all passed, but the shell kept visible ripples of 2.39 mm rms. After switching to a grid-free analytic constraint, the roughness dropped to 0.09 mm rms.

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/report/surface-rake-before-after.png" alt="Raking-light comparison before and after the analytic surface constraint" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Raking-light ripple comparison before and after the analytic surface constraint</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/report/animation-ready.png" alt="v5.051 animation-ready four-component version" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">v5.051 animation-ready four-component version</figcaption>
</figure>

## The final comparison

These comparison errors basically met the final delivery requirements:

| Check | Result |
|---|---:|
| Side view against blueprint | Within ±6 mm |
| Top view against blueprint | Within ±8.4 mm |
| Tail deck flatness | ±0.6 mm |
| Cross-section ellipse fit | Worst 2.1 mm, rms 0.5 mm |
| Number of dents | 0 |
| Surface roughness | 0.09 mm rms, down from 2.39 mm |
| Pixel difference before and after cleanup | 0.00000 |

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/final-vehicle.png" alt="The client-accepted v5.050 Space Rider" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">The client-accepted final v5.050 Space Rider</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v5-050-side.jpg" alt="v5.050 final side-view shape" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Final side-view outline</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/v5-050-persp.jpg" alt="v5.050 final perspective shape" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Final perspective shape</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/detail-flap.jpg" alt="Flap detail" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Flap detail</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/detail-nozzle.jpg" alt="Nozzle detail" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Nozzle detail</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/detail-wings-full.jpg" alt="Wing detail" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Wing detail</figcaption>
</figure>

<figure class="not-prose my-8">
  <img src="/images/projects/space-rider/versions/detail-tail.jpg" alt="Tail detail" class="w-full rounded-xl object-cover shadow-sm" loading="lazy" />
  <figcaption class="mt-2 text-center text-xs text-muted">Tail detail</figcaption>
</figure>
