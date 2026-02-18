---
title: 'From CFD Claim to Auditable Evidence'
image: /images/notes/covers/from-cfd-claim-to-auditable-evidence.svg
published: 2026-08-18
summary: 'A small evidence-manifest pattern that connects every public engineering number to generated data, an explicit acceptance rule, provenance, and a reproducible command.'
tags: [reproducibility, evidence manifest, automation, technical portfolio]
sourceProjects: [evidence-kit, flowlab, flowrom, airfoil-methods, ground-effect-vlm, fsae-cooling, f1-2026-aero]
featured: false
order: 6
---

Every public number on this site is backed by a claim record that an audit script resolves, evaluates, and re-checks on demand — 76 claims across 17 projects currently pass. Without that link, prose, figures, JSON, and source code drift independently.

An evidence manifest makes the claim itself executable.

## Treat the claim as a typed record

A useful claim contains more than a sentence. It identifies:

- a stable claim ID;
- the exact public statement;
- a machine-readable metric location;
- an operator and expected value or limit;
- every artifact required to inspect it;
- source and method provenance;
- the result observed by the audit;
- pass or fail state.

A real record from the FlowLab manifest:

```json
{
  "id": "u-centerline-rmse",
  "statement": "The finest-grid streamwise centerline RMSE is below 1% of lid speed.",
  "metric": {
    "path": "results/validation.json",
    "pointer": "/cases/2/uCenterlineRmse"
  },
  "expectation": {
    "operator": "<=",
    "value": 0.01
  },
  "artifacts": [
    "results/validation.json",
    "results/centerline-validation.svg"
  ],
  "sourceIds": ["ghia-1982", "solver", "validator"]
}
```

The article may paraphrase the result. The manifest defines the auditable boundary.

## Why a JSON pointer beats copying a number

Copying `0.00286` into Markdown creates a second source of truth. Pointing to `/cases/2/uCenterlineRmse` in generated JSON lets the audit:

1. load the published result;
2. resolve the exact nested value;
3. apply the declared comparison;
4. record the observed value;
5. fail if the data or schema changes.

The prose still gets reviewed for meaning. The number no longer depends on manual synchronisation.

## Expectations must represent the published decision

A passed claim means the published statement matches the evidence — it says nothing about whether the engineering design succeeded.

For a successful validation metric:

```json
{ "operator": "<=", "value": 0.01 }
```

For a deliberate production rejection, the F1 manifest carries:

```json
{
  "id": "baseline-boundary",
  "metric": { "path": "results/pilot-analysis.json", "pointer": "/baseline/completed" },
  "expectation": { "operator": "==", "value": false }
}
```

The 25–35 million-cell baseline has not completed, the article says so, and the claim passes. Rewriting the audit so only favourable outcomes can pass would destroy the value of failure evidence.

## Artifacts are part of the claim

A manifest should list every file needed to interpret the result:

- raw or minimally processed histories;
- machine-readable summary JSON or CSV;
- the generated figure shown in the article;
- mesh-quality or solver logs;
- methodology report;
- source data or source identifiers;
- scripts or commands that regenerate the output.

The audit rejects missing files, paths that escape the project root, and unsupported references. It hashes artifacts so silent replacement becomes visible.

A valid artifact path is not automatically sufficient evidence. A screenshot proves a plot rendered; it cannot replace the underlying data needed to recompute the metric.

## Source provenance has different forms

A source record can point to:

- a public paper, report, or dataset with URL and citation metadata;
- a repository file with a content hash;
- first-party measured data with calibration and permission records;
- a generated internal artifact with the command that produced it;
- an explicitly unavailable private source, when publication rights prevent release.

Unknown or inaccessible sources stay visible as limitations. The manifest never invents a public citation to make the graph look complete.

## One build should generate every publication surface

The safest publication flow is:

```text
owned inputs
  → deterministic analysis
  → machine-readable results
  → figures and report
  → evidence audit
  → site publication copy
```

The website receives generated copies only after the project output passes. Hand-editing a figure or JSON file inside `public/` creates an unaudited fork.

A project-level command regenerates the complete payload. The portfolio-level command then audits all project manifests and builds the aggregate catalogue.

## Dogfood result from this portfolio

The [Evidence Kit project](/projects/evidence-kit) audits eleven numerical studies:

| Project | Class | Claims |
|---|---|---:|
| Airfoil Methods | analytical and panel validation | 4 |
| F1 2026 Aero | full-car workflow and NO-GO gate | 9 |
| FlowLab | lattice-Boltzmann cavity validation | 4 |
| FlowROM | reduced-order modelling | 4 |
| Ground Effect VLM | ground-effect low-order model | 5 |
| FSAE Cooling | hydraulic and thermal screening | 5 |
| Dimensionless Numbers | dimensionless-number toolkit with dimensional guards | 4 |
| Steady Conduction 1-D | finite differences vs analytical | 4 |
| Heat Diffusion 2-D | explicit FTCS vs analytical | 4 |
| Pipe Flow Sizing | verified friction and pump intersection | 4 |
| Potential Flow Sandbox | complex-potential verification | 4 |

The aggregate result:

| Measure | Count |
|---|---:|
| Projects audited | 17 |
| Claims declared | 76 |
| Claims passing | 76 |
| Project artifacts | 54 |

The mix matters. The catalogue includes successful numerical thresholds and explicit rejection decisions — the F1 NO-GO claims pass because the evidence confirms the rejection, not despite it.

## What the audit checks

The current small-interface audit verifies:

- manifest schema and project identity;
- metric pointer resolution;
- numeric, Boolean, and equality comparisons;
- required artifacts and root containment;
- content hashing;
- duplicate and malformed claims;
- source references;
- retention of failed claim states;
- aggregate JSON, CSV, and HTML publication.

The interface is deliberately narrow: one project manifest in, one observed audit record out. Project solvers never need to know the portfolio rendering system.

## What the audit cannot establish

Automation cannot decide whether:

- a turbulence model is physically appropriate;
- a validation reference matches the configuration;
- the chosen uncertainty limit is sufficient for the design decision;
- a sensor or source dataset is trustworthy;
- an NDA permits publication;
- an attractive result omitted an important negative case.

Those remain engineering-review questions. The manifest makes the underlying evidence inspectable; judgement still has to be supplied.

## A publication gate for a new project

Before presenting a headline metric, require:

1. owned implementation and versioned inputs;
2. one command that regenerates results and figures;
3. explicit numerical acceptance criteria;
4. a manifest for every public quantitative statement;
5. raw failure retention;
6. traceable sources and publication permission;
7. an honest limitations section;
8. a portfolio-level audit with nonzero exit on mismatch.

This gate is stricter than visual review and cheaper than reconstructing provenance after publication.

## Boundary of this note

An evidence manifest is a compact control for keeping a technical portfolio internally consistent and making claims cheap to challenge. It is no regulated data-management system, cryptographic attestation service, or substitute for independent replication.
