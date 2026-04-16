---
title: 'Modeling the Real F1 2026 Car with GSD in 3DExperience'
year: 2026
date: '2026-08-24'
status: active
categories: [design]
tags: [Design, CAD, GSD, Surface Modeling]
summary: 'In 3DExperience''s Generative Shape Design, I rebuilt the F1 2026 sidepod and rear wing by creating points, sections, splines, lofts, and trimmed surfaces, and I plan to model the full F1 2026 car next.'
role: 'Independent CAD surface modeling'
duration: 'Sidepod and rear wing complete; full-car surface modeling in progress'
featured: true
order: 0
studySequence: 19
heroImage: /images/projects/3dexperience-rb22/sidepod/sidepod_r1_iso.jpg
cardImageFit: cover
---

After visiting an F1 race in person and seeing the 1:1 model of the F1 2026 car up close, I decided to rebuild the F1 2026 car in 3DExperience.

<div class="not-prose my-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
  <img src="/images/projects/3dexperience-rb22/f1-photos/IMG_4739.jpg" alt="Front three-quarter view of the full-size car model" class="aspect-[3/2] h-full w-full rounded-lg object-cover" decoding="async" />
  <img src="/images/projects/3dexperience-rb22/f1-photos/IMG_4753.jpg" alt="Front view of the full-size car model and its front wing" class="aspect-[3/2] h-full w-full rounded-lg object-cover" decoding="async" />
  <img src="/images/projects/3dexperience-rb22/f1-photos/IMG_4756.jpg" alt="Sidepod and cockpit area of the full-size car model" class="aspect-[3/2] h-full w-full rounded-lg object-cover" loading="lazy" decoding="async" />
  <img src="/images/projects/3dexperience-rb22/f1-photos/IMG_4765.jpg" alt="Rear wing and rear bodywork of the full-size car model" class="aspect-[3/2] h-full w-full rounded-lg object-cover" loading="lazy" decoding="async" />
</div>

## References

My project references Ted L's article [I Built an F1 Car — The 2026 Regulations](https://www.linkedin.com/pulse/i-built-f1-car-2026-regulations-ted-l-dqfnc/). It is a very in-depth article, and I learned a lot from it. The original article records, from a full-car perspective, how the author did geometry creation, regulation trade-offs, and CFD analysis against the 2026 rules.

I roughly followed that article's approach. I planned to first split the car into clear parts and model each part one by one, then run CFD analysis at the end to check the gap between my model and the real car.

I took the sidepod as the first target. In a blank project, I built points, surfaces, section curves, support surfaces, and structural surfaces from scratch. Then I used the same method to finish the rear wing.

## How I built the modeling skeleton from scratch

First, I created the car's centre plane and a set of datum planes distributed along the length of the body, with the centre plane controlling left-right symmetry.

The longitudinal planes carry the sidepod sections (I used the same method later for the rear wing). The horizontal and transverse planes set the floor height, the endplate positions, and the spatial relationships between the surfaces.

Because the body is symmetric, I only needed to finish one side during modeling, and generate the other side through the centre plane at the end.

In GSD, I classified the feature tree by modeling purpose instead of putting every object into a single Geometrical Set. This keeps the current structure organized and makes it easier to grow into a more complex full-car project later. The table below summarizes the groups and their purposes:

| Group | Contents |
|---|---|
| Datums | Car centre plane, longitudinal stations, horizontal planes, and transverse control planes |
| Construction points | Section feature points, boundary endpoints, and local control points |
| Curves | Section splines, guide curves, and closed boundaries |
| Support surfaces | Multi-Sections Surface, Fill, and local extended surfaces |
| Trimming and joining | Split, Trim, Boundary, and Join |
| Final results | The sidepod and rear wing surfaces kept after checks |

With this structure, every surface can be traced back to its own sections and boundaries. When I modify a local region, I only need to go back to the corresponding points or splines, not recreate the whole part. I also gave each part and construction object a proper name, so they are easy to find and search later.

## The basic GSD modeling sequence

Every surface region follows the same build sequence:

```text
Datum planes
→ construction points
→ section splines
→ guide curves or closed boundaries
→ Multi-Sections Surface / Fill
→ Split / Trim
→ Join
→ Symmetry
```

For flat end faces and closed outlines, I build the surface with Fill. For freeform surfaces, sets of section splines form the main body. Between sections, if the change is gentle, I connect them with Multi-Sections Surface. But when I hit a sudden curvature change or a rapidly shrinking outline, I split the region into adjacent smaller surfaces and combine them with Join. For regions with holes, I build the outer support surface first, then project the inner loop onto the support surface and Split it.

I only completed the surfaces and the Join for the right half, and did the symmetry afterwards. This gives me left-side geometry identical to the right, avoids editing both sides at the same time, and keeps the plane of symmetry always controlled by the same centre datum.

## The sidepod

The sidepod is a very complex, large piece of geometry. I divided the whole into the inlet, the shoulder, the undercut region, the maximum width, the waist contraction, and the tail transition. It is hard to do with one big surface, because the top, side, and bottom have different and complex curvature changes at different longitudinal positions. I tried several methods on the sidepod and finally reached a state I am fairly happy with.

First, I created a set of station planes along the body and placed outline points on each plane, to fix the inlet height, shoulder width, bottom outline, and tail contraction. The points on each station are connected by a spline into an open section.

After finishing the main sections, I used Multi-Sections Surface to build the core surface of the sidepod:

- The shoulder and tail change relatively gently, so they can be lofted directly from continuous sections.
- The undercut region and the local turns change quickly, so they need extra local sections.

For flat closing regions and local turns, I used these approaches:

- End faces and local flat regions use a closed spline with Fill.
- Narrow closed regions are patched segment by segment along their boundaries.
- When adjacent sections change quickly, the region is split into a series of two-section surfaces, which are then combined into one continuous surface with Join.

This zoning keeps the main volume of the sidepod while letting the inlet, shoulder, undercut, and tail still be modified independently. Finally, I mirrored the finished right-side surfaces to the other side.

Here are screenshots of what I built:

![Sidepod isometric view](/images/projects/3dexperience-rb22/sidepod/sidepod_r1_iso.jpg)

![Sidepod front view](/images/projects/3dexperience-rb22/sidepod/sidepod_r1_front.jpg)

![Sidepod right view](/images/projects/3dexperience-rb22/sidepod/sidepod_r1_right.jpg)

![Sidepod top view](/images/projects/3dexperience-rb22/sidepod/sidepod_r1_top.jpg)

## The rear wing

The rear wing has a different structure from the sidepod. It is roughly made up of the main plane, the movable flap, the endplates, the central support, and local connecting surfaces. As before, I finished each functional region first and checked the connections between them at the end.

For the main plane, I created section splines at different spanwise positions and connected them with Multi-Sections Surface. When the wingtip and centre regions needed extra control, I added endpoint guides to constrain where the surface boundaries run. The flap uses its own independent section set, so the flap keeps its own position and angle relationships.

### The endplate

For the endplate, I first built the outer contour on a support surface, then formed the main body with Fill and trimmed surfaces. For the region with holes, I finished the outer surface first, then projected the inner loop onto the support surface and Split it. This way the holes are part of the surface's trim structure, not floating decorative lines.

For the central support and the local connecting surfaces, I used planes, extruded surfaces, and Fill respectively. After finishing all the fixed wing surfaces, the flap, the endplates, and the support, I did the final Join and Symmetry to get the complete rear wing.

Screenshots:

![Rear wing isometric view](/images/projects/3dexperience-rb22/rear-wing/iso.jpg)

![Rear wing rear view](/images/projects/3dexperience-rb22/rear-wing/rear.jpg)

![Rear wing side view](/images/projects/3dexperience-rb22/rear-wing/side.jpg)

![Rear wing top view](/images/projects/3dexperience-rb22/rear-wing/top.jpg)

## The parts not yet done

With the sidepod and rear wing done, I will finish the remaining parts with the same approach:

| Modeling region | Planned content |
|---|---|
| Front wing and nose | Main plane, flaps, endplates, nose transition, and local connections |
| Floor and diffuser | Floor body, edge structures, throat, diffuser section, and fences |
| Front and rear suspension | Upper and lower wishbones, pushrod, track rod, and their faired shapes |
| Suspension flow guides | Local flow-guiding surfaces in front of and behind the tyres |
| Quadruplane | Multi-layer flow-guiding wing surfaces and their supports |
| Mirrors | Mirror housings, brackets, and the connection to the sidepod |
| Power unit and gearbox shapes | Packaging boundaries inside the engine cover and the tail contraction |
| Cockpit and Halo | Cockpit opening, headrest area, Halo, and bodywork transitions |
| Tyres and wheel rims | Front and rear tyres, rim faces, and contact-patch geometry |
| Driver helmet | External geometry for the cockpit and airflow blockage |
| Wind tunnel and CFD environment | Geometry needed for the ground, inlet, outlet, and external computational domain |


## CFD plan

Like the article I referenced, after finishing the full-car CAD, I plan to run CFD simulations of the whole car with OpenFOAM. The mesh count may become very large, so I may need to ask my teacher for help or look for sponsorship to see whether I can get enough compute resources.

But first, I will start experimenting with the individual parts. The current idea is to begin with the sidepod and the rear wing:

- Sidepod: focus on the inlet oncoming flow, the flow direction over the shoulder and undercut regions, and the tail's influence on the rear wheel and engine cover area.
- Rear wing: focus on the load on each wing element, the slot-gap flow, the endplate vortices, and the interference of the central support.

For the front wing, floor, suspension, and wheels that come later, I will use consistent inlet conditions, ground and tyre settings, and unified post-processing metrics. A unified setup lets the differences between geometries come mainly from the parts themselves, and avoids the influence of changing the computational domain or boundary conditions. Each part will be checked in its own independent environment for mesh, pressure distribution, surface flow, separation regions, and the main vortex structures.

In the end, I plan to do a full-car level study, analyzing the interactions between upstream and downstream parts. I know there are many difficulties in this, and a single part's results cannot directly stand in for full-car conclusions. Computing part by part helps understand what each region does. But I still need to put all the surfaces into the full-car model and study, from the whole-car perspective, the coupling between the front-wing wake, the tyre wake, the floor, the sidepod, and the rear wing.

To be continued. Progress will be updated in this article.
