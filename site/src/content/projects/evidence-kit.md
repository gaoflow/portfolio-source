---
title: 'Evidence Kit — Claims, Gates & Artifact Hashes'
year: 2026
status: complete
categories: [tooling, validation]
tags: [Python, JSON Pointer, SHA-256, reporting, reproducibility]
summary: 'A manifest-driven audit layer that connects portfolio claims to observed metrics, explicit gates, public sources, and hashed artifacts.'
methodLine: 'JSON manifests · typed gates · RFC 6901 pointers · SHA-256 · HTML/CSV/JSON'
role: 'Tooling & technical communication'
duration: 'Independent build'
heroMetrics:
  - { label: 'Studies audited', value: '6' }
  - { label: 'Claims', value: '31/31' }
  - { label: 'Artifacts', value: '24' }
  - { label: 'Interface', value: '1 call' }
keyOutputs:
  - 'Reduced the caller interface to one catalog build while hiding pointer resolution, typed comparisons, path containment, hashing, and multi-format publication.'
  - 'Dogfooded the same module across six numerical studies; all 31 declared gates pass against 24 project artifacts.'
  - 'Preserves failed claims in reports and exits nonzero instead of selectively publishing successful metrics.'
featured: false
sample: false
order: 3
studySequence: 6
---

## Context & objective

A technical portfolio can contain correct plots and still make weak claims: the metric may not match the sentence, the threshold may have been chosen afterward, the reference may be missing, or the displayed file may not be the one produced by the command.

Evidence Kit turns those relationships into data. Each study declares claims, JSON-pointer metrics, typed expectations, sources, artifacts, methods, limitations, and reproduction commands. One module audits the manifests and publishes both human and machine-readable reports.

## Live evidence catalog

This dashboard is generated from the same manifests used to gate publication. Open any study to inspect observed values, thresholds, source roles, artifact sizes, and SHA-256 fingerprints.

<iframe src="/evidence/" title="Portfolio evidence catalog" style="width:100%;height:760px;border:1px solid #233226;background:#08111f" loading="lazy"></iframe>

## A deliberately small interface

```python
catalog = build_evidence_catalog(
    manifest_paths,
    repository_root,
    output_directory,
)
```

That call hides the implementation details that every project would otherwise duplicate:

- manifest validation and unique project/claim identifiers;
- RFC 6901-style JSON pointer traversal through objects and arrays;
- numeric and boolean gates with `<`, `<=`, `>`, `>=`, and `==`;
- project-directory containment for every local path;
- external HTTPS and hashed repository-source adapters;
- deduplicated artifact hashing;
- per-project HTML, aggregate HTML, catalog JSON, and coverage CSV;
- staged output replacement so partial reports are not published.

The function returns the catalog instead of printing or terminating. The CLI is a thin adapter that prints summary counts and exits nonzero when any claim fails.

## Manifest as a review surface

A claim is not just a sentence. It must name one observed value and one expectation:

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

This makes scope errors reviewable. A claim cannot silently swap a full-state error for a fluctuation error, cite an unknown source, omit its output, or point outside its project directory.

## Dogfood result

The current audit covers six independently evidenced studies:

| Study | Claims passing | Project artifacts |
|---|---:|---:|
| Airfoil Methods | 4 / 4 | 4 |
| F1 2026 Aero | 9 / 9 | 5 |
| FlowLab | 4 / 4 | 4 |
| FlowROM | 4 / 4 | 4 |
| FSAE Cooling | 5 / 5 | 3 |
| Ground Effect VLM | 5 / 5 | 4 |
| **Total** | **31 / 31** | **24** |

The generated `catalog.json` keeps full claim records and SHA-256 values. `coverage.csv` flattens the same data for review or CI ingestion.

## Failure behavior

The toolkit does not remove a failed claim. It writes the observed value and `FAIL` state into the project report, returns `allClaimsPass: false`, and lets the CLI terminate with a nonzero status. Missing artifacts, escaping paths, malformed pointers, duplicate identifiers, unknown sources, and incompatible comparisons are hard errors.

## Verification

Interface-level tests cover successful multi-format publication, nested array pointers, boolean and numeric comparisons, deduplicated hashing, preserved failed gates, and rejected path traversal. `python3 scripts/audit_portfolio.py` is the smoke test: it consumes real project outputs rather than test fixtures.

[Open the machine-readable catalog](/evidence/catalog.json) or [download the coverage matrix](/evidence/coverage.csv).

## Audit pipeline

Publication is a deterministic transformation rather than a manual review checklist:

1. discover each `evidence-manifest.json`;
2. validate project identity, source identifiers, reproduction commands, methods, and limitations;
3. resolve every metric path and JSON pointer;
4. evaluate the typed expectation without coercing booleans into numbers;
5. verify artifact containment and existence;
6. hash artifacts once and reuse the fingerprint across claims;
7. write per-project HTML, aggregate HTML, catalog JSON, coverage CSV, and summary JSON into a staged directory;
8. replace the public output only after the complete catalog succeeds.

The generated site and CI therefore consume the same claim records. A hand-edited HTML pass cannot disagree with the machine-readable result.

## Threat model

The toolkit targets ordinary evidence failures rather than cryptographic authorship. It rejects:

- `../` path traversal or symlink resolution outside a project directory;
- missing metrics, malformed array/object pointers, and incompatible comparisons;
- duplicate project or claim identifiers;
- claims that cite unknown sources or artifacts that do not exist;
- manifests with no methods, limitations, or reproduction commands;
- selective reporting that removes a failed gate from the output.

SHA-256 proves that two published references point to the same bytes; it does not prove that the underlying experiment was designed correctly. Experimental validity remains the responsibility of each project.

## Interface depth

The single public function is intentionally narrower than the implementation behind it. Callers provide manifests, a repository root, and an output directory. They do not manage pointer traversal, typed comparison, hashing, HTML escaping, CSV encoding, or atomic publication.

That is the tooling result: project authors describe evidence in domain terms, while one deep module owns the repetitive integrity mechanics.

## Current boundary

All 31 declared claims pass, but that does not make every project a successful engineering design. FSAE Cooling and F1 qualification intentionally contain NO-GO decisions; their claims pass because the published decision matches the observed evidence. The audit checks traceability and gate evaluation, not whether the engineering outcome is favourable.
