---
title: 'From CFD Claim to Auditable Evidence'
published: 2026-08-18
summary: 'A small evidence-manifest pattern that connects every public engineering number to generated data, an explicit acceptance rule, provenance, and a reproducible command.'
tags: [reproducibility, evidence manifest, automation, technical portfolio]
sourceProjects: [evidence-kit, flowlab, flowrom, airfoil-methods, ground-effect-vlm, fsae-cooling, f1-2026-aero]
featured: false
order: 6
---

A technical article becomes hard to audit when its prose, figures, JSON, and source code can drift independently. The usual symptom is a correct-looking headline number whose generating command, input revision, or acceptance rule cannot be recovered.

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

A simplified record looks like this:

```json
{
  "id": "finest-grid-u-rmse",
  "statement": "The 64² cavity u-centerline RMSE is below 0.01.",
  "metric": {
    "path": "results/validation.json",
    "pointer": "/grids/2/uRmse"
  },
  "expectation": {
    "operator": "<",
    "value": 0.01
  },
  "artifacts": [
    "results/validation.json",
    "results/centerline-comparison.svg"
  ],
  "sourceIds": ["ghia-1982"]
}
```

The article may paraphrase the result, but the manifest defines the auditable boundary.

## Why a JSON pointer is better than copying a number

Copying `0.00286` into Markdown creates a second source of truth. Pointing to `/grids/2/uRmse` in generated JSON lets the audit:

1. load the published result;
2. resolve the exact nested value;
3. apply the declared comparison;
4. record the observed value;
5. fail if the data or schema changes.

The prose is still reviewed for meaning. The number no longer depends on manual synchronisation.

## Expectations must represent the published decision

A passed claim does not mean the engineering design succeeded. It means the published statement matches the evidence.

For a successful validation metric:

```json
{ "operator": "<", "value": 0.01 }
```

For a deliberate production rejection:

```json
{ "operator": "==", "value": false }
```

If `productionMeshQualified` is false and the article says the campaign is NO-GO, that claim should pass. Rewriting the audit so only favourable outcomes can pass would destroy the value of failure evidence.

## Artifacts are part of the claim

A manifest should list every file needed to interpret the result:

- raw or minimally processed histories;
- machine-readable summary JSON or CSV;
- the generated figure shown in the article;
- mesh-quality or solver logs;
- methodology report;
- source data or source identifiers;
- scripts or commands that regenerate the output.

The audit should reject missing files, paths that escape the project root, and unsupported references. It should also hash artifacts so silent replacement is visible.

A valid artifact path is not necessarily sufficient evidence. A screenshot can prove that a plot rendered; it cannot replace the underlying data needed to recompute the metric.

## Source provenance has different forms

A source record can point to:

- a public paper, report, or dataset with URL and citation metadata;
- a repository file with a content hash;
- first-party measured data with calibration and permission records;
- a generated internal artifact with the command that produced it;
- an explicitly unavailable private source, when publication rights prevent release.

Unknown or inaccessible sources must remain visible as limitations. The manifest should not invent a public citation to make the graph look complete.

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

The website should receive generated copies only after the project output passes. Hand-editing a figure or JSON file inside `public/` creates an unaudited fork.

A project-level command should regenerate the complete payload. The portfolio-level command then audits all project manifests and builds the aggregate catalogue.

## Dogfood result from this portfolio

The [Evidence Kit project](/projects/evidence-kit) currently audits six numerical studies:

| Project class | Claims represented |
|---|---|
| analytical and panel validation | Airfoil Methods |
| full-car workflow and NO-GO gate | F1 2026 Aero |
| browser-native numerical validation | FlowLab |
| reduced-order modelling | FlowROM |
| ground-effect low-order model | Ground Effect VLM |
| hydraulic and thermal screening | FSAE Cooling |

The aggregate result is:

| Measure | Count |
|---|---:|
| Projects audited | 6 |
| Claims declared | 31 |
| Claims passing | 31 |
| Project artifacts | 24 |

The mix matters. The catalogue includes successful numerical thresholds and explicit rejection decisions. It does not erase failed engineering outcomes to preserve a perfect audit score.

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

The interface is deliberately narrow: one project manifest in, one observed audit record out. Project solvers do not need to know the portfolio rendering system.

## What the audit cannot establish

Automation cannot decide whether:

- a turbulence model is physically appropriate;
- a validation reference matches the configuration;
- the chosen uncertainty limit is sufficient for the design decision;
- a sensor or source dataset is trustworthy;
- an NDA permits publication;
- an attractive result omitted an important negative case.

Those remain engineering-review questions. The manifest makes the underlying evidence inspectable; it does not replace judgement.

## A publication gate for a new project

Before removing a “sample” label or presenting a headline metric, require:

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

An evidence manifest is not a regulated data-management system, cryptographic attestation service, or substitute for independent replication. It is a compact engineering control for keeping a technical portfolio internally consistent and making claims cheap to challenge.
