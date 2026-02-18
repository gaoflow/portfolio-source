---
title: 'A Failed Mesh Is Engineering Data, Not a Missing Screenshot'
image: /images/notes/covers/mesh-failure-is-engineering-data.svg
published: 2026-08-18
summary: 'How to turn repeated full-car meshing failures into a bounded diagnosis, reject unsafe solver launches, and specify the topology change required for the next campaign.'
tags: [OpenFOAM, snappyHexMesh, topology, NO-GO]
sourceProjects: [f1-2026-aero]
featured: true
order: 3
---

A meshing campaign succeeds when the volume mesh satisfies the contract the solver and the decision require — producing cells is not the bar. On complex full-car geometry, `snappyHexMesh` can complete while leaving skew faces, non-manifold interactions, missing layers, leakage, or a boundary that no longer matches the intended vehicle. Launching the solver anyway converts a known geometry problem into a harder numerical one.

## Define the zero-failure gate first

Write the production gate before parameter sweeps begin. At minimum it records:

- geometry revision and byte-identical source hashes;
- watertightness and self-intersection checks per surface;
- domain closure and intended inside/outside regions;
- complete `checkMesh -allTopology -allGeometry` output;
- allowed cell count and memory envelope;
- maximum aspect ratio, non-orthogonality, and skewness limits;
- counts of highly non-orthogonal and highly skew faces;
- layer coverage, thickness, and quality requirements;
- boundary patch names and areas;
- whether a solver launch is permitted.

The gate returns a machine-readable verdict. A warning copied into a log but omitted from the decision record is no gate.

## "Bad CAD" is four different problems

The fix depends on the failure layer.

### Source-surface defects

Open shells, duplicate triangles, zero-area facets, self-intersections, inconsistent normals, overlapping solids. Measure them before meshing, because downstream smoothing can hide, move, or duplicate them.

### Topology defects

Two individually closed solids can overlap in a way that defines no valid fluid boundary. Surface smoothing cannot resolve the Boolean meaning of that intersection. The remedy is topology replacement, Boolean reconstruction, or engineer-directed simplification — more snap iterations will not help.

### Volume-mesh defects

Poor refinement transitions, excessive non-orthogonality, negative volumes, disconnected regions, and face-interior skew can arise after the boundary is understood. These may respond to castellated refinement, transition control, feature treatment, or local geometry work.

### Boundary-layer defects

Collapsed or missing layers need their own diagnosis. Layer failure may be acceptable on explicitly excluded features, but only if coverage and wall treatment still match the turbulence-model contract.

## Change one hypothesis at a time

A useful meshing sweep maps each variant to one engineering hypothesis:

| Controlled change | Hypothesis tested |
|---|---|
| base-cell refinement | background discretisation is too coarse to represent the feature |
| local surface level | the boundary needs more resolution before snapping |
| feature-angle or extracted edges | explicit feature guidance is missing or harmful |
| transition smoothing | abrupt refinement produces residual skew |
| snap controls | point motion cannot reach the target without damaging cells |
| surface repair | a bounded geometry defect can be corrected without changing topology |
| alternative mesher | the installed topology path, rather than resolution, is the blocker |

Changing every control together may produce a better mesh. It produces no reusable diagnosis.

## Preserve source geometry while testing repair

A repair candidate needs a bidirectional surface-deviation contract. Measuring only candidate-to-source distance can miss source regions that vanished. Record:

- source and candidate unique vertices and triangle counts;
- source-to-candidate maximum distance;
- candidate-to-source maximum distance;
- symmetric RMS and high-percentile deviation;
- bounding-box change;
- triangle connectivity preservation when required;
- self-intersection and closure status.

The deviation budget belongs to the engineering requirement. "Looks unchanged" is unmeasurable, and a geometrically close surface can still carry different topology.

## What the twenty-path F1 campaign established

The [F1 2026 full-car project](/projects/f1-2026-aero) tested twenty bounded routes: nineteen completed OpenFOAM mesh outcomes plus one external topology attempt.

The strongest uniform-envelope mesh held 5,207,960 cells and improved the extrema to:

| Metric | Best bounded result |
|---|---:|
| Maximum aspect ratio | 26.306 |
| Maximum non-orthogonality | 64.999° |
| Maximum skewness | 8.785 |
| Remaining face-interior skew failures | 8 |

This is improvement, not qualification. Eight failed faces still violate the zero-failure gate.

Six bounded surface-repair candidates then tested a 0.1 mm deviation contract. Five retained triangle connectivity within budget. The near-zero-deviation candidate (`lambda-mu-0p001`, 0.0000017 mm) and the budget-edge candidate (`lambda-mu-0p15`, 0.08368 mm) produced identical volume-mesh verdicts: 5,322,222 cells, fifteen highly skew faces, one failed check. Both NO-GO.

The evidence rejects two tempting conclusions:

1. **A smoother surface means a better volume mesh.** It did not remove the blocking failures.
2. **Closer to the deviation budget means closer to success.** The budget-edge repair changed nothing downstream.

## Why another mesher did not fix topology

An external Gmsh 4.12.1 route separated `snappyHexMesh` behaviour from source-boundary topology. To avoid OpenCASCADE Boolean subtraction on the intersecting multi-solid assembly, the campaign meshed the full domain from discrete STL surface loops. Gmsh imported 14 surfaces, tetrahedralised 3,689,664 nodes into 7,379,556 written elements in 309 s at about 10 GiB peak memory — and wrote zero volume elements, rejecting overlapping facets on one discrete surface.

That narrows the diagnosis: the blocker is no single `snappyHexMesh` parameter. The source assembly offers no unambiguous, conformal fluid boundary to either installed meshing route.

## The correct NO-GO decision

The campaign therefore blocks:

- the gated qualification solve;
- the 25–35 million-cell production baseline;
- mesh, roughness, and turbulence-model sensitivity studies;
- public aerodynamic ranking from the rejected meshes.

It still supports narrower claims:

- the STEP-to-OpenFOAM pipeline and force-output plumbing execute;
- bounded mesh variants and repair candidates were compared consistently;
- the failure is reproducible and localised to topology/mesh qualification;
- the next input requirement is known.

The next campaign needs replacement or engineer-directed simplification of the overlapping source topology, or a genuinely different conformal or hex-dominant meshing backend. Re-running the same control family would add compute, not information.

## What to publish when the mesh fails

A credible failure report includes:

1. source hashes and a geometry inventory;
2. the acceptance contract;
3. a variant matrix with exactly one controlled change per row;
4. complete mesh-quality output, not selected maxima;
5. plots that locate failed faces and relevant surface defects;
6. repair-deviation measurements;
7. unsuccessful external routes;
8. the explicit solver-launch decision;
9. the topology or tooling change required next.

The failure becomes useful when another engineer can avoid repeating the same search space.

## Boundary of this note

The numerical limits above belong to one bounded campaign; they are not universal OpenFOAM tolerances. Other solvers, discretisations, wall treatments, and geometries need different contracts. The transferable result is the diagnostic method: preserve geometry, isolate hypotheses, retain failures, and never let a completed mesher bypass a failed qualification gate.
