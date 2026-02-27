---
title: 'What Twenty Failed Meshes Taught Me'
image: /images/notes/covers/mesh-failure-is-engineering-data.svg
published: 2026-07-30
summary: 'I kept changing snappyHexMesh settings until the evidence became clear: the blocker was not one bad parameter. It was the topology of the full-car source geometry.'
tags: [OpenFOAM]
sourceProjects: [f1-2026-aero]
featured: true
order: 3
---

For a while, my F1 full-car project looked like a folder full of missing results. I had no clean production mesh, no final aerodynamic comparison, and no impressive contour to put at the top of the page.

What I did have was a series of failed meshes.

Once I stopped treating those failures as wasted runs, they became the most useful part of the campaign.

## I first made one rule: no solver launch after a failed mesh gate

`snappyHexMesh` finishing is not the same as the mesh being usable. It can write millions of cells and still leave skew faces, broken layers, leaks, or a boundary that no longer means what the CAD meant.

I wrote down the checks that had to pass before the solver was allowed to start: geometry hashes, closed surfaces, complete `checkMesh` output, cell and memory limits, non-orthogonality, skewness, patch names, patch areas, and layer coverage.

This rule felt strict when I was impatient to run the car. It saved me from turning a known geometry problem into a confusing solver problem.

## “Bad CAD” was too vague to help

I learned to separate four failure types.

- A **surface defect** is a hole, duplicate triangle, zero-area facet, bad normal, or self-intersection.
- A **topology problem** happens when individually closed solids overlap but do not describe one unambiguous fluid boundary.
- A **volume-mesh problem** is created by refinement, transitions, snapping, or cell quality after the boundary is understood.
- A **layer problem** concerns collapsed or missing wall cells and the turbulence treatment they were meant to support.

The distinction matters because the fixes are different. More snap iterations may help a volume-mesh problem. They cannot decide the Boolean meaning of two overlapping solids.

## I changed one idea at a time

The campaign eventually covered twenty bounded routes: nineteen OpenFOAM outcomes and one external topology attempt.

I treated each run as one question. Was the base mesh too coarse? Did one surface need more refinement? Were extracted features helping or hurting? Was the refinement transition too abrupt? Could a small surface repair remove the blocker without changing the shape?

The best uniform-envelope mesh reached 5,207,960 cells and improved the worst numbers to:

| Check | Best result |
|---|---:|
| Maximum aspect ratio | 26.306 |
| Maximum non-orthogonality | 64.999° |
| Maximum skewness | 8.785 |
| Face-interior skew failures left | 8 |

That was progress, but it was not a pass. Eight failed faces still meant **NO-GO**.

## The surface repairs gave me a useful surprise

I then tried six bounded repair candidates with a 0.1 mm deviation limit.

One candidate barely moved the surface at all: 0.0000017 mm maximum deviation. Another sat close to the budget edge at 0.08368 mm. They produced the same downstream verdict: 5,322,222 cells, fifteen highly skew faces, and one failed check.

That killed two assumptions I had been carrying:

1. a smoother surface must create a better volume mesh;
2. using more of the allowed geometry-change budget must move me closer to success.

Neither was true here. The repair changed triangle positions, but the blocking topology stayed.

## I tried another mesher to challenge my own diagnosis

I did not want to blame `snappyHexMesh` without a control. I tried Gmsh 4.12.1 on the same multi-solid assembly.

Gmsh imported 14 surfaces, generated 3,689,664 nodes, wrote 7,379,556 elements in 309 seconds, and used about 10 GiB of memory. It still produced zero volume elements because overlapping facets left the discrete boundary ambiguous.

That result narrowed the problem. It was not one OpenFOAM parameter family. Two different meshing routes could not find a valid fluid volume from the source assembly.

## The project ended with a requirement, not a number

I blocked the production solve, the 25–35 million-cell baseline, and every sensitivity study that depended on that baseline. I also refused to publish aerodynamic rankings from the rejected meshes.

The campaign still established useful things:

- the STEP-to-OpenFOAM pipeline runs;
- the force-output plumbing works;
- bounded variants can be compared consistently;
- the blocker is repeatable; and
- the next input requirement is clear.

The next campaign needs replacement geometry or engineer-directed simplification of the overlapping source topology. Repeating the same control sweep would add compute, not information.

## What I now save from every failed mesh

I keep the source hash, geometry inventory, exact parameter change, full mesh-quality output, failed-face locations, surface-deviation measurements, and solver-launch decision. I also keep unsuccessful alternative routes.

That record means I do not have to rediscover the same dead ends six months later. More importantly, another engineer can see why the run stopped instead of finding only an empty results folder.

The numbers in this note belong to one car and one bounded campaign. They are not universal OpenFOAM limits. The lesson I am keeping is simpler: **a failed mesh can still finish the engineering decision if I record why it failed and what has to change next.**
