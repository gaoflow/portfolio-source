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

My F1 full-car project stalled at the meshing stage. I had no clean production mesh, no final aerodynamic comparison, and no contour plot worth showing. The most complete results in the folder were a series of failed meshes.

At first, I kept adjusting `snappyHexMesh` in search of one bad parameter. After twenty bounded routes, the evidence pointed elsewhere: the real blocker was overlapping, ambiguous topology in the full-car source geometry.

## I made one rule: no solver launch after a failed mesh check

![Mesh-failure response chain](/images/notes/systems/mesh-failure-is-engineering-data.svg)

`snappyHexMesh` finishing successfully does not mean the mesh is usable. It can write millions of cells while leaving highly skewed faces, broken layers, leaks, or boundaries that no longer express the intended CAD meaning.

Before launching the solver, I required the mesh to pass checks for:

- geometry hashes;
- closed surfaces;
- complete `checkMesh` output;
- cell-count and memory limits;
- non-orthogonality;
- skewness;
- patch names;
- patch areas;
- layer coverage.

Each mesh variant changed one named assumption. When a check failed, I carried the defect location and parameter change into the next run instead of using the solver to hide a known mesh problem.

This felt strict when I wanted to run the full car, but it stopped a geometry problem from becoming a harder-to-explain solver problem.

## I split “bad CAD” into four different problems

“Bad CAD” was too vague to guide the next step. I separated failures into four types:

- A **surface defect** is a hole, duplicate triangle, zero-area facet, bad normal, or self-intersection.
- A **topology problem** occurs when individually closed solids overlap without defining one clear, unambiguous fluid boundary.
- A **volume-mesh problem** concerns refinement, transitions, snapping, or cell quality after the boundary meaning is clear.
- A **layer problem** concerns collapsed or missing wall cells that cannot support the intended turbulence treatment.

These problems need different fixes. More snap iterations may improve a volume mesh, but they cannot decide the Boolean meaning of two overlapping solids.

## I used the same checks across twenty routes

The campaign covered twenty bounded routes: nineteen OpenFOAM outcomes and one external topology attempt.

I treated each run as a specific question:

- Was the base mesh too coarse?
- Did one surface need more refinement?
- Were extracted features helping or hurting?
- Was the refinement transition too abrupt?
- Could a small surface repair remove the blocker without changing the shape?

The best uniform-envelope mesh reached 5,207,960 cells and improved the worst quality measures to:

| Check | Best result |
|---|---:|
| Maximum aspect ratio | 26.306 |
| Maximum non-orthogonality | 64.999° |
| Maximum skewness | 8.785 |
| Face-interior skew failures left | 8 |

That was progress, but not a pass. Eight failed faces still meant **NO-GO**.

Improving one measure was not enough. One candidate reduced the highly skewed faces from 97 to 7 but increased the number of failed checks from one to two, so I still rejected it. Other variants only moved defect clusters from the front wing to other parts. A changed location did not mean the problem was solved; I still had to record the defects and inspect the topological coupling between parts.

## Six surface repairs did not change the underlying problem

I then tried six bounded surface-repair candidates with a 0.1 mm deviation limit.

One candidate barely moved the surface, with a maximum deviation of 0.0000017 mm. Another came close to the deviation budget at 0.08368 mm.

Both produced exactly the same downstream result:

- 5,322,222 cells;
- 15 highly skewed faces;
- one failed check.

This comparison overturned two assumptions:

1. a smoother surface must produce a better volume mesh;
2. using more of the allowed geometry-change budget must move me closer to success.

Neither assumption held for this car and this campaign. The repairs moved triangles but did not change the blocking topology. Both the near-zero-deviation candidate and the candidate near the 0.1 mm limit left 15 highly skewed faces, so further smoothing within the same deviation budget was no longer an evidence-backed route.

## Gmsh reproduced the same class of failure

I did not want to blame `snappyHexMesh` without a comparison, so I tried Gmsh 4.12.1 on the same multi-solid assembly.

Gmsh imported 14 surfaces, generated 3,689,664 nodes, wrote 7,379,556 elements in 309 seconds, and used about 10 GiB of memory. It still produced zero volume elements because overlapping facets left the discrete boundary ambiguous.

This was not a successful alternative, but it narrowed the diagnosis. The problem was not limited to one OpenFOAM parameter family. Two different meshing routes could not find a valid fluid volume from the source assembly.

## I stopped the calculations the evidence could not support

I did not launch the production solve, the 25–35 million-cell baseline, or any sensitivity study that depended on that baseline. I also refused to publish aerodynamic performance rankings from rejected meshes.

The campaign produced no final aerodynamic numbers, but it established that:

- the STEP-to-OpenFOAM pipeline runs;
- the force-output path works;
- bounded variants can be compared consistently;
- the blocker is repeatable;
- the requirements for the next input are clear.

The next attempt needs replacement geometry or engineer-directed simplification of the overlapping source topology. Changing the meshing backend is another possibility. Repeating the same control sweep would add compute, not information.

## What I now keep from every failed mesh

I retain:

- the source-file hash;
- the geometry inventory;
- the exact parameter change;
- the complete mesh-quality output;
- failed-face locations;
- surface-deviation measurements;
- the solver-launch decision;
- unsuccessful alternative routes.

These records stop me from rediscovering the same dead ends six months later. They also let another engineer see why the work stopped instead of finding only a folder with no final result.

The numbers here belong to one car and one bounded campaign. They are not universal OpenFOAM limits. The standard I am keeping is simple: a failed mesh can still support an engineering decision if I record why it failed and what must change next.
