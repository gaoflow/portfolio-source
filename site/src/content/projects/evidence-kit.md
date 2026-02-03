---
title: 'Evidence Kit — Claims, Gates & Artifact Hashes'
year: 2026
date: 2026-07
status: complete
categories: [tooling, validation]
tags: [Python, JSON Pointer, SHA-256, reporting, reproducibility]
summary: 'A manifest-driven audit layer that ties every portfolio claim to an observed metric, a typed gate, a cited source, and a SHA-256-hashed artifact — 51 of 51 claims currently pass.'
methodLine: 'JSON manifests · typed gates · RFC 6901 pointers · SHA-256 · HTML/CSV/JSON'
role: 'Tooling & technical communication'
duration: 'Independent build'
heroMetrics:
  - { label: 'Studies audited', value: '11' }
  - { label: 'Claims', value: '51/51' }
  - { label: 'Artifacts', value: '38' }
  - { label: 'Interface', value: '1 call' }
keyOutputs:
  - 'Reduced the caller interface to one catalog build while hiding pointer resolution, typed comparisons, path containment, hashing, and multi-format publication.'
  - 'Dogfooded the same module across eleven numerical studies; all 51 declared gates pass against 38 project artifacts.'
  - 'Preserves failed claims in reports and exits nonzero instead of selectively publishing successful metrics.'
featured: false
order: 3
studySequence: 15
---

## Context & objective

Correct plots can still support weak claims. The metric may not match the sentence, the threshold may have been chosen after the result was known, the reference may be missing, or the displayed file may not be the one the command produced.

Evidence Kit turns those relationships into data. Each study declares claims, JSON-pointer metrics, typed expectations, sources, artifacts, methods, limitations, and reproduction commands. One module audits every manifest and publishes both human- and machine-readable reports. Across the eleven studies in this portfolio, all 51 declared claims currently pass against 38 hashed artifacts.

## Live evidence catalog

This dashboard is generated from the same manifests that gate publication. Open any study to inspect observed values, thresholds, source roles, artifact sizes, and SHA-256 fingerprints.

<iframe src="/evidence/" title="Portfolio evidence catalog" style="width:100%;height:760px;border:1px solid #233226;background:#08111f" loading="lazy"></iframe>

## One public call

```python
catalog = build_evidence_catalog(
    manifest_paths,
    repository_root,
    output_directory,
)
```

That call hides what every project would otherwise reimplement:

- manifest validation with unique project and claim identifiers;
- RFC 6901 pointer traversal through objects and arrays;
- typed numeric and boolean gates: `<`, `<=`, `>`, `>=`, `==`;
- containment of every local path inside its project directory;
- external HTTPS and hashed repository-source adapters;
- deduplicated artifact hashing;
- per-project HTML, aggregate HTML, catalog JSON, and coverage CSV;
- staged output replacement, so a partial report never publishes.

The function returns the catalog instead of printing or exiting. The CLI is a thin adapter that prints summary counts and exits nonzero when any claim fails. Callers supply manifests, a repository root, and an output directory; they never touch pointer traversal, comparison typing, hashing, HTML escaping, CSV encoding, or atomic publication. That is the tooling result: authors describe evidence in domain terms, and one deep module owns the repetitive integrity mechanics.

## Manifest as a review surface

A claim must name one observed value and one expectation:

```json
{
  "id": "pod-holdout-error",
  "statement": "Rank-8 POD reconstructs held-out fluctuations below 2% relative error.",
  "metric": {
    "path": "results/analysis.json",
    "pointer": "/pod/holdoutRelativeFluctuationErrors/8",
    "display": ".3%"
  },
  "expectation": {"operator": "<=", "value": 0.02},
  "artifacts": ["results/analysis.json", "results/pod-spectrum.svg"],
  "sourceIds": ["generator", "analysis"]
}
```

Scope errors become reviewable. A claim cannot silently swap a full-state error for a fluctuation error, cite an unknown source, omit its output, or point outside its project directory.

## Dogfood result

The current audit covers eleven independently evidenced studies:

| Study | Claims passing | Project artifacts |
|---|---:|---:|
| Airfoil Methods | 4 / 4 | 4 |
| Dimensionless Numbers | 4 / 4 | 2 |
| F1 2026 Aero | 9 / 9 | 5 |
| FlowLab | 4 / 4 | 4 |
| FlowROM | 4 / 4 | 4 |
| FSAE Cooling | 5 / 5 | 3 |
| Ground Effect VLM | 5 / 5 | 4 |
| Heat Diffusion 2D | 4 / 4 | 3 |
| Pipe Flow Sizing | 4 / 4 | 3 |
| Potential Flow Sandbox | 4 / 4 | 3 |
| Steady Conduction 1D | 4 / 4 | 3 |
| **Total** | **51 / 51** | **38** |

The generated `catalog.json` keeps full claim records and SHA-256 values. `coverage.csv` flattens the same data for review or CI ingestion.

## The audit grew with the portfolio

The first published audit covered six projects, 27 claims, and 21 deduplicated artifacts. Five foundational solver studies — dimensionless numbers, 1D conduction, pipe sizing, potential flow, and 2D heat diffusion — then entered the same manifest contract with four claims each. The original six manifests deepened alongside them as the cooling decision and the F1 qualification campaign produced new evidence. The catalog now covers eleven studies, 51 claims, and 38 artifacts.

Growth tested the contract in both directions. Each new study had to express its results as pointer-addressable metrics with typed thresholds and named artifacts before its article numbers could enter the site. Existing claims were re-audited on every run: artifacts are re-hashed, so a silently regenerated figure or JSON file fails the audit instead of drifting.

## Failure behavior

A failed claim stays in the report. The toolkit writes the observed value and a `FAIL` state into the project page, returns `allClaimsPass: false`, and lets the CLI exit nonzero. Missing artifacts, escaping paths, malformed pointers, duplicate identifiers, unknown sources, and incompatible comparisons are hard errors.

## Audit pipeline

Publication is a deterministic transformation, not a manual review checklist:

1. discover each `evidence-manifest.json`;
2. validate project identity, source identifiers, reproduction commands, methods, and limitations;
3. resolve every metric path and JSON pointer;
4. evaluate the typed expectation without coercing booleans into numbers;
5. verify artifact containment and existence;
6. hash each artifact once and reuse the fingerprint across claims;
7. write per-project HTML, aggregate HTML, catalog JSON, coverage CSV, and summary JSON into a staged directory;
8. replace the public output only after the complete catalog succeeds.

The generated site and CI consume the same claim records, so a hand-edited HTML pass cannot disagree with the machine-readable result.

## Threat model

The toolkit targets ordinary evidence failures rather than cryptographic authorship. It rejects:

- `../` path traversal or symlinks resolving outside a project directory;
- missing metrics, malformed array or object pointers, and incompatible comparisons;
- duplicate project or claim identifiers;
- claims that cite unknown sources or artifacts that do not exist;
- manifests with no methods, limitations, or reproduction commands;
- selective reporting that removes a failed gate from the output.

SHA-256 proves that two published references point to the same bytes. It says nothing about whether the underlying experiment was designed well; experimental validity remains the responsibility of each project.

## Verification

Interface-level tests cover successful multi-format publication, nested array pointers, boolean and numeric comparisons, deduplicated hashing, preserved failed gates, and rejected path traversal. `python3 scripts/audit_portfolio.py` is the smoke test: it consumes real project outputs rather than test fixtures.

[Open the machine-readable catalog](/evidence/catalog.json) or [download the coverage matrix](/evidence/coverage.csv).

## Current boundary

All 51 declared claims pass. That does not make every project a successful engineering design: FSAE Cooling and the F1 qualification campaign intentionally end in NO-GO decisions, and their claims pass because the published decision matches the observed evidence. The audit checks traceability and gate evaluation. Whether the engineering outcome is favourable is a separate question, answered by each study itself.

## What I took away

The manifest contract absorbed five new studies and a near-doubling of claims without a second audit format; the work per study stayed at writing one honest JSON file. The claims I now trust most belong to the projects that failed: the cooling and F1 manifests pass their gates because each claim states the decision the evidence supports, including NO-GO. Writing manifests changed how I write results — a number that cannot name its JSON file, pointer, and threshold does not survive contact with the audit, so it does not reach the article.
