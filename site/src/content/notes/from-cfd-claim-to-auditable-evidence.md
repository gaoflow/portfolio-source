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

The same number kept appearing in four places: a JSON file, a figure, a report, and a project page.

Then I reran the analysis.

The JSON changed. The figure changed. The sentence in Markdown did not.

After enough of these small mismatches, I stopped trusting myself to keep every copy in sync. I built a tiny evidence manifest instead.

## I wanted every public number to point somewhere

A sentence on the site can still sound natural, but the number inside it should come from one machine-readable location.

For each quantitative claim, I now record:

- a stable ID;
- the sentence I am trying to support;
- the JSON file and exact path to the value;
- the comparison that should pass;
- the files needed to inspect the result; and
- the sources or scripts that produced it.

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

The article can paraphrase the result. The manifest tells me which value the sentence depends on.

## A pointer is safer than another copied number

If I paste `0.00286` directly into Markdown, I have created a second source of truth.

If I point to `/cases/2/uCenterlineRmse`, the audit can load the JSON, find the exact value, compare it with 0.01, and fail if the file or schema changes.

I still have to judge whether RMSE is the right metric and whether 1% is a sensible gate. The script only stops the publication surfaces from drifting apart.

## A passing audit does not mean the design succeeded

This distinction mattered in my F1 project.

One claim says the 25–35 million-cell production baseline has **not** completed. The expected value is `false`. The claim passes because the page honestly reports the NO-GO state.

That changed how I thought about automated checks. The test should not reward only good outcomes. It should reward agreement between the public statement and the evidence.

A failed mesh, rejected architecture, or infinite interval can all pass the publication audit if the page says exactly that.

## I now treat files as part of the claim

A screenshot proves that a plot rendered. It does not let me recompute the number.

For an important result, I keep the minimally processed data, JSON or CSV summary, generated figure, relevant logs, source identifiers, and regeneration command together. The audit checks that the files exist, stay inside the project, and have not been silently replaced.

This also stopped another bad habit: hand-editing a figure in `public/` because it looked slightly better. The project now generates the publication copy only after the source result passes.

My preferred flow is:

```text
owned inputs
  → analysis
  → JSON / CSV results
  → figures and report
  → claim audit
  → portfolio copy
```

One command per project makes the route repeatable.

## Dogfooding it on my own portfolio

The portfolio audit currently checks 76 claims across 17 projects and 54 project artifacts.

Those claims include successful numerical checks and deliberate rejections. The F1 NO-GO statements pass because the evidence confirms the rejection. The cooling page passes because the hydraulic numbers and temperature failure match the published text. The Airfoil Methods page passes because its measured and predicted values resolve to the same generated tables used by the figures.

The audit checks a narrow set of things:

- the manifest is well formed;
- the metric path exists;
- the comparison gives the recorded result;
- the required files exist;
- duplicate or malformed claims are rejected; and
- the aggregate JSON, CSV, and HTML can be rebuilt.

That narrowness is intentional. Solvers and analysis scripts do not need to understand the website.

## What the script cannot decide for me

The manifest cannot tell me whether a turbulence model is appropriate, a tunnel case really matches my geometry, a sensor is trustworthy, or an NDA allows publication.

It also cannot catch an important negative result I chose not to include.

Those are engineering and judgement problems. The tool only makes the evidence easier to inspect and harder to miscopy.

## The habit I am keeping

Before I put a headline number on a project page, I now ask:

1. Can one command recreate it?
2. Is the result stored in JSON or CSV instead of only in prose?
3. Does the claim point to that exact value?
4. Are the figure and report built from the same data?
5. Will the audit fail if I rerun the project and forget to update the page?

This is a small amount of structure, not a grand data platform. It exists because I know I will forget a manual copy eventually.

The best part is that challenging a number is now cheap. I can open the claim, follow the pointer, rerun the command, and see whether the sentence still deserves to be there.
