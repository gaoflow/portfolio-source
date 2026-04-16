---
title: 'Modeling the Real F1 2026 Car with GSD in 3DExperience'
year: 2026
date: '2026-08-24'
status: active
categories: [design]
tags: [Design, CAD, GSD, Surface Modeling]
summary: "In 3DExperience's Generative Shape Design, I rebuilt the F1 2026 sidepod and rear wing by creating points, sections, splines, lofts, and trimmed surfaces, and I plan to model the full F1 2026 car next."
role: 'Solo CAD surface modeling'
duration: 'Sidepod and rear wing complete; full-car surface modeling in progress'
featured: true
order: 0
studySequence: 19
heroImage: /images/projects/3dexperience-rb22/sidepod/sidepod_r1_iso.jpg
cardImageFit: cover
---

After visiting an F1 race in person and seeing the 1:1 model of the F1 2026 car up close, I decided to rebuild the F1 2026 car in 3DExperience.

<div class="not-prose my-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
  <img src="/images/projects/3dexperience-rb22/f1-photos/IMG_4739.jpg" alt="Three-quarter front view of the real car model" class="aspect-[3/2] h-full w-full rounded-lg object-cover" decoding="async" />
  <img src="/images/projects/3dexperience-rb22/f1-photos/IMG_4753.jpg" alt="Front view and front wing of the real car model" class="aspect-[3/2] h-full w-full rounded-lg object-cover" decoding="async" />
  <img src="/images/projects/3dexperience-rb22/f1-photos/IMG_4756.jpg" alt="Sidepod and cockpit area of the real car model" class="aspect-[3/2] h-full w-full rounded-lg object-cover" loading="lazy" decoding="async" />
  <img src="/images/projects/3dexperience-rb22/f1-photos/IMG_4765.jpg" alt="Rear wing and rear bodywork of the real car model" class="aspect-[3/2] h-full w-full rounded-lg object-cover" loading="lazy" decoding="async" />
</div>

## References

My project references Ted L's article ["I Built an F1 Car — The 2026 Regulations"](https://www.linkedin.com/pulse/i-built-f1-car-2026-regulations-ted-l-dqfnc/). This is a very thorough article, and I learned a lot from it. The original piece records how the author built geometry, handled regulatory tradeoffs, and ran CFD analysis for a full vehicle under the 2026 rules.

I followed a similar workflow. I plan to break the vehicle down into distinct components, model each component one by one, and run CFD analysis at the end to check the gap between my model and the real car.

First, I took the sidepod as my first target. In a blank project, I built points, surfaces, section curves, support faces, and structural surfaces from scratch, then used the same method to draw the rear wing.

## Building the modeling skeleton from scratch

First, I built the vehicle centerline plane and a set of reference planes along the longitudinal axis, using the centerline plane to control symmetry.

The longitudinal planes carry the sidepod sections (I used the same method later for the rear wing). The horizontal and transverse planes set the floor height, endplate positions, and spatial relationships between surfaces.

Because the bodywork is symmetric, I only needed to model one side during construction, then mirror it across the centerline plane at the end.

In GSD, I organized the feature tree by modeling purpose instead of putting all objects into a single Geometrical Set. This keeps the current structure organized and makes it easy to expand into a full-car project later. The table below summarizes each group and its purpose:

| Group | Contents |
|---|---|
| Reference | Vehicle centerline plane, longitudinal stations, horizontal planes, and transverse control planes |
| Construction points | Section feature points, boundary endpoints, and local control points |
| Curves | Section splines, guide curves, and closed boundaries |
| Support surfaces | Multi-Sections Surfaces, Fills, and local extension faces |
| Split & Join | Split, Trim, Boundary, and Join |
| Final results | Sidepod and rear wing surfaces retained after inspection |

With this structure, every surface traces back to its own sections and boundaries. When modifying a local area, I only need to go back to the corresponding point or spline without rebuilding the whole component. I also named each component and construction object properly for easy searching and retrieval.

## Basic modeling sequence in GSD

Every surface region follows the same construction sequence:

```text
Reference planes
→ Construction points
→ Section Splines
→ Guide curves or closed boundaries
→ Multi-Sections Surface / Fill
→ Split / Trim
→ Join
→ Symmetry
```

For planar end faces and closed contours, I used Fill to build surfaces. For freeform surfaces, I built them primarily from sets of section splines. Between sections, if the transition is smooth, I connected them with Multi-Sections Surfaces; when meeting sharp curvature changes or rapid contour contractions, I split the area into smaller adjacent surfaces and merged them with Join. For regions with holes, I built the outer support surface first, projected the inner loop onto it, and performed a Split.

I only completed the right-hand surfaces and Join before mirroring. This produces a left-side geometry identical to the right, avoids modifying both sides at once, and ensures the symmetry plane stays controlled by the same central reference.

## Sidepod

The sidepod is a large, complex shape. I divided the overall geometry into the inlet, shoulder, undercut region, maximum width, waist contraction, and tail transition. It is hard to build with a single large surface because the top surface, side, and bottom have different curvature changes at different longitudinal stations. I tried several methods on the sidepod before reaching a result I was satisfied with.

First, I built a set of station planes along the longitudinal axis and placed contour points on each plane to set the inlet height, shoulder width, bottom profile, and tail contraction. Points at each station were connected with a spline to form an open section.

After completing the main sections, I built the core sidepod surfaces with Multi-Sections Surface:

- The shoulder and tail change smoothly, so continuous sections can be lofted directly.
- The undercut region and local transitions change rapidly, so extra local sections were added.

For planar cap areas and local transitions, I used these approaches:

- End faces and local planar areas use closed splines with Fill.
- Small narrow closed regions are surfaced segment by segment based on boundaries.
- When adjacent sections change rapidly, I split the region into a series of two-section surfaces and combined them into a continuous surface with Join.

This partitioning keeps the main volume of the sidepod while allowing the inlet, shoulder, undercut, and tail to be modified independently. Finally, I mirrored the finished right-side surface to the left.

Here are screenshots of the result:

![Isometric view of the sidepod](/images/projects/3dexperience-rb22/sidepod/sidepod_r1_iso.jpg)
![Front view of the sidepod](/images/projects/3dexperience-rb22/sidepod/sidepod_r1_front.jpg)
![Right view of the sidepod](/images/projects/3dexperience-rb22/sidepod/sidepod_r1_right.jpg)
![Top view of the sidepod](/images/projects/3dexperience-rb22/sidepod/sidepod_r1_top.jpg)

## Rear wing

The rear wing structure differs from the sidepod. It is made of the main element, flap, endplates, central support, and local transition surfaces. I completed each functional area first, then checked the connections between them.

For the main element, I built section splines at different spanwise positions and connected them with Multi-Sections Surface. When the wingtips and central region needed extra control, I added endpoint guide curves to constrain the boundary flow. The flap used an independent set of sections to preserve its own position and angle.

### Endplate

For the endplate, I built the outer contour on a support surface first, then used Fill and trimmed surfaces to form the main body. For regions with cutouts, I completed the outer surface first, then projected the inner loop onto the support surface and performed a Split. This makes the cutouts part of the trimmed surface structure rather than floating lines.

For the central support and local transition faces, I built them with planes, extruded surfaces, and Fill. After finishing the main element, flap, endplates, and support, I ran Join and Symmetry to get the complete rear wing.

Here are screenshots of the result:

![Isometric view of the rear wing](/images/projects/3dexperience-rb22/rear-wing/iso.jpg)
![Rear view of the rear wing](/images/projects/3dexperience-rb22/rear-wing/rear.jpg)
![Side view of the rear wing](/images/projects/3dexperience-rb22/rear-wing/side.jpg)
![Top view of the rear wing](/images/projects/3dexperience-rb22/rear-wing/top.jpg)

## Unfinished components

After finishing the sidepod and rear wing, I will complete the remaining parts with the same approach:

| Component | Planned content |
|---|---|
| Front wing and nose | Main element, flaps, endplates, nose transition, and local connections |
| Floor and diffuser | Main floor, edge structures, throat, diffuser section, and fences |
| Front and rear suspension | Upper/lower wishbones, pushrod, track rod, and fairing geometry |
| Suspension vanes | Local flow-deflection surfaces ahead of and behind tires |
| Quadruplane | Multi-element vanes and mounting structures |
| Mirrors | Housing, stalks, and sidepod mounting interfaces |
| Powertrain & gearbox packaging | Engine cover internal clearance boundary and tail contraction |
| Cockpit and Halo | Cockpit opening, headrest area, Halo, and bodywork transitions |
| Tires and wheels | Front/rear tires, rim surfaces, and contact patch geometry |
| Helmet | External driver helmet geometry for cockpit blockage |
| Wind tunnel & CFD domain | Ground, inlet, outlet, and external domain geometry |

## CFD plans

Like the article I referenced, after finishing the full-car CAD, I plan to run full-vehicle CFD simulations in OpenFOAM. The mesh size may be very large then, and I might need to ask my professor for help or find sponsorship to secure enough compute resources.

First, though, I will test individual components. My current plan is to start with the sidepod and rear wing:

- Sidepod: Focus on inlet flow, flow direction over the shoulder and undercut, and the tail's effect on the rear tires and engine cover region.
- Rear wing: Focus on element loads, slot flow, endplate vortices, and central support interference.

For the front wing, floor, suspension, and wheels later, I will use consistent inlet conditions, ground/tire settings, and unified post-processing metrics. Keeping settings uniform ensures that differences come primarily from the geometry itself rather than domain or boundary changes. Each component will be checked in its own environment for mesh quality, pressure distribution, surface flow, separation zones, and primary vortex structures.

Finally, I plan to run full-vehicle studies to analyze interaction between upstream and downstream components. I know there are many difficulties ahead, and individual component results cannot replace full-vehicle conclusions. Computing components individually helps clarify each area's role, but in the end, all surfaces must be assembled into the full car to study coupling between the front wing wake, tire wakes, floor, sidepod, and rear wing from a full-vehicle perspective.

To be continued; progress will be updated in this article.
