---
title: 'Template — NDA-Safe CFD Batch Automation Case Study'
year: 2026
date: 2026-08
status: complete
categories: [tooling]
tags: [Python, OpenFOAM, automation, publication contract]
summary: 'An evidence checklist for publishing CFD automation work without inventing performance numbers or exposing protected geometry and results.'
methodLine: 'Configuration · orchestration · machine gates · failure retention'
role: 'Case-study template'
duration: 'Publication template'
heroMetrics:
  - { label: 'Published claims', value: '0' }
  - { label: 'Required sections', value: '8' }
keyOutputs:
  - 'Separates publishable workflow architecture from protected case inputs and aerodynamic results.'
  - 'Defines the evidence required before turnaround, batch-size, or reliability claims can be published.'
nda: true
featured: false
sample: true
order: 9
---

> This page is an explicit **template**, not a claim that the described wrapper has been implemented in this repository. It remains visible to show the publication contract for future NDA-safe tooling work.

## 1. Engineering problem

Start with the manual workflow being replaced. Name the repeated decisions, the handoffs that create errors, and the operator time being consumed. Do not begin with “I wrote a Python wrapper”; begin with the engineering bottleneck.

An acceptable publication states which stages are automated—case generation, geometry staging, meshing, decomposition, solver launch, monitoring, post-processing, report generation—and which decisions still require an engineer.

## 2. Public architecture

The NDA-safe architecture can normally disclose module boundaries without exposing geometry or performance:

```text
validated config
      ↓
case materialisation → mesh gate → solver gate → result gate
      ↓                  ↓             ↓             ↓
 run manifest        quality JSON   field checks   report/artifacts
```

The article should name the configuration schema, state machine, process-isolation boundary, and output contract. It should not publish customer/team paths, CAD, map values, setup-specific coefficients, or screenshots that reveal protected geometry.

## 3. Configuration contract

Document fields by class rather than dumping a private configuration:

- geometry and case-template identifiers;
- operating condition and reference quantities;
- meshing controls and resource limits;
- solver phases and stopping conditions;
- required function objects and post-processing outputs;
- retry policy, if retries genuinely exist;
- provenance fields: tool version, configuration hash, source revision, and run identifier.

Every default shown in the article must come from a public example or be labelled illustrative. A schema count is published only after the actual schema is committed and machine-counted.

## 4. Execution and failure semantics

A useful automation case explains what happens when a stage fails. Mesh rejection must block solving. A nonzero solver exit, non-finite field, incomplete log, missing coefficient stream, or failed physical gate must remain visible in the run manifest.

“Unattended” is not the same as “unmonitored.” The real evidence should show timeouts, captured exit codes, partial-artifact handling, and deterministic resumption. Automatic retries must not turn a physically invalid case into a green run.

## 5. Verification evidence

Before this template is replaced, the implementation needs:

1. unit tests for configuration validation and command construction;
2. an integration case whose expected mesh/solver/post-processing artifacts are known;
3. a deliberately failed mesh and solver case proving downstream stages remain blocked;
4. a run-manifest schema with timestamps, revisions, exit codes, and checksums;
5. a reproducible report command;
6. CI that exercises logic without pretending a mocked solver is CFD validation.

## 6. Capability and scale

Turnaround reduction, batch size, and reliability are results—not adjectives. Publish them only with a defined baseline:

| Claim | Required observation |
|---|---|
| Manual-time reduction | same workflow scope, timed before/after, operator time separated from compute |
| Batch capacity | completed/failed case count, hardware, wall time, and concurrency |
| Reliability | repeated runs plus explicit failure denominator |
| Reproducibility | identical configuration/source hashes and matching gated outputs |

Protected values can be normalised or reported as bounded ranges only if the employer/team permits it. Otherwise omit the number rather than inventing a substitute.

## 7. NDA-safe result format

Use the RMZC pattern: **Role, Method, scale class, Conclusion**. A defensible short version can describe ownership, interfaces, the number of workflow stages, and what decision the tool automated. Aerodynamic coefficients, geometry, customer identifiers, and operating maps remain absent.

The sentence “details available on request” is not evidence. Public evidence should still include owned generic code, tests, a synthetic or open benchmark case, architecture diagrams, and failure behaviour.

## 8. Replacement gate

This page stays marked `sample: true` until an owned implementation, executable benchmark, generated artifacts, limitations section, and evidence manifest exist. Only then may the sample badge and zero-claim metric be removed.
