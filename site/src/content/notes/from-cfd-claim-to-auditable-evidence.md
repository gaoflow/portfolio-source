---
title: 'I Got Tired of Copying Numbers into Markdown'
image: /images/notes/covers/from-cfd-claim-to-auditable-evidence.svg
published: 2026-08-22
summary: 'A small tooling habit that stopped my figures, JSON files, and project pages from disagreeing every time I reran an analysis.'
tags: [Coding]
sourceProjects: [flowlab, flowrom, airfoil-methods, ground-effect-vlm, fsae-cooling, f1-2026-aero]
featured: false
order: 6
---

The same number often appeared in four places: a JSON file, a figure, a report, and a project page.

The problem came after I reran an analysis. The JSON changed. The figure changed. The sentence in Markdown did not. After enough of these mismatches, I stopped trusting myself to keep every copy in sync.

I built a small evidence manifest instead. It connects published numbers to machine-readable results and checks that the required files still exist and the values still meet the stated conditions.

## I made every number traceable to its source

![Evidence chain for a CFD claim](/images/notes/systems/from-cfd-claim-to-auditable-evidence.svg)

I want to trace a published number back to a generated metric, then to the analysis script and source data. A screenshot proves that a plot was rendered once, but it cannot replace that chain.

For each quantitative claim, I now record:

- a stable ID;
- the sentence I am trying to support;
- the JSON file and exact path to the value;
- the comparison that should pass;
- the files needed to inspect the result; and
- the source or script that produced it.

One FlowLab record looks like this:

```json
{
  "id": "u-centerline-rmse",
  "statement": "The finest-grid centerline RMSE is below 1% of lid speed.",
  "metric": {
    "path": "results/validation.json",
    "pointer": "/cases/2/uCenterlineRmse"
  },
  "expectation": { "operator": "<=", "value": 0.01 },
  "artifacts": [
    "results/validation.json",
    "results/centerline-validation.svg"
  ]
}
```

The article can still describe the result in natural language. The manifest tells me exactly which value that sentence depends on.

## I stopped copying the same number into Markdown

If I paste `0.00286` directly into Markdown, I create a second source of truth. When the analysis changes, that copy does not change with it.

Instead, I point to `/cases/2/uCenterlineRmse`. An automated check can load the JSON, find the exact value, compare it with 0.01, and fail if the file location or data structure changes.

This does not tell me whether RMSE is the right metric or whether 1% is a sensible threshold. It only prevents one result from becoming several conflicting numbers across the published material.

## I let result changes flow through to figures and text

I want one recalculation to trigger the checks that follow it, rather than making me search manually for every affected page.

If an analysis script changes `results.json`, the recorded file hash changes too. Figures that depend on the field need to be regenerated, and text that refers to the figure or number needs to be checked again. Directly overwriting a final PNG breaks that chain, so I no longer do it.

A fuller record can look like this:

```text
claim_id: f1.second_order.cl_bias
value_pointer: results/analysis.json#/numerics/cl_bias_percent
source_artifact: second-order/postProcessing/forceCoeffs
figure: first_order_bias.svg
status: bounded-trend
```

Along with the value, I record the denominator, sign, scope, and evidence status when they matter. That lets me check not only whether two numbers match, but also whether a result has been used outside the conditions where it applies.

When parts disagree, I want a clear outcome:

| Mismatch | Response |
|---|---|
| Markdown number differs from JSON | Build fails |
| Figure exists but its input is missing | File check fails |
| Source file hash changes | Dependent claims need to be checked again |
| Metric passes but the stated use exceeds its scope | I must judge whether the wording is still true |

## A passing check does not mean the design succeeded

This distinction mattered in my F1 project.

One claim says that the 25–35 million-cell production baseline has **not** completed. Its expected value is `false`. The check passes because the project page accurately reports the NO-GO state, not because the design succeeded.

That changed how I thought about automation. A check should not reward only good results. It should test whether the public statement agrees with the evidence.

A failed mesh, rejected architecture, or infinite interval can pass if the page describes it accurately. `PASS` means the source chain is consistent. It does not mean the design worked.

## I stopped editing published figures by hand

I used to edit a figure directly in `public/` if I thought it looked slightly better. That was quick, but it separated the final image from the data and script that produced it.

For an important result, I now keep these items together:

- minimally processed data;
- a JSON or CSV summary;
- the generated figure;
- relevant logs;
- source identifiers; and
- the regeneration command.

Automated checks confirm that the files exist, remain inside the project, and have not been silently replaced. A project generates its portfolio copy only after the source result passes its checks.

My preferred flow is:

```text
owned inputs
  → analysis
  → JSON / CSV results
  → figures and report
  → claim checks
  → portfolio copy
```

One command per project makes that route repeatable.

## I use it on my own portfolio

The portfolio checks currently cover 76 claims across 17 projects and 54 project artifacts.

They include both successful numerical conditions and deliberate rejections:

- the F1 NO-GO statements pass because the evidence confirms the rejection;
- the cooling page passes because the hydraulic data and temperature failure match the published wording; and
- the Airfoil Methods page passes because its measured and predicted values point to the same generated tables used by the figures.

The checks remain deliberately narrow. They currently confirm that:

- the manifest is well formed;
- the metric path exists;
- the comparison matches the recorded result;
- the required files exist;
- duplicate or malformed claims are rejected; and
- the combined JSON, CSV, and HTML can be regenerated.

Solvers and analysis scripts do not need to understand the website. They only need to produce clear, structured results that later steps can read.

## The tool cannot make engineering decisions for me

The manifest cannot tell me whether:

- a turbulence model is appropriate;
- a wind-tunnel condition really matches my geometry;
- a sensor is trustworthy; or
- an NDA allows me to publish something.

It also cannot detect an important negative result that I deliberately chose not to include.

Those remain questions of engineering judgement and honest communication. The tool only makes published claims easier to inspect and harder to corrupt through copying and pasting.

## I check five things before publishing a number

Before I put a headline number on a project page, I ask:

1. Can one command recreate it?
2. Is the result stored in JSON or CSV instead of only in prose?
3. Does the claim point to that exact value?
4. Are the figure and report generated from the same data?
5. Will the check fail if I rerun the project and forget to update the page?

This is a small amount of structure, not a grand data platform. It exists because I know I will eventually forget to update a manually copied number.

The main improvement is that challenging a number is now cheap. I can open its record, follow the pointer, rerun the command, and decide whether the sentence still deserves to remain on the page.
