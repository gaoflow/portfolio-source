---
title: 'When 90% Coverage Became an Infinite Interval'
image: /images/notes/covers/airfrans-conformal-ood.svg
published: 2026-08-24
summary: 'How I turned a question about reliable CFD surrogates into a falsifiable AirfRANS audit—and why the negative result taught me more about calibration budgets, physical groups, predictor error, and data lineage than a cleaner success would have.'
tags: [CFD]
sourceProjects: []
featured: true
order: 7
---

My first paper began with a result I did not want: the most theoretically careful groupwise interval was infinite.

That refusal became the centre of the work. It forced me to separate four questions that I had initially treated as one: Is the point predictor good enough? Does its uncertainty rank difficult cases? Are the physical groups large enough for conformal calibration? Does the evaluation design support the claim I want to make?

The finished paper is titled *Auditing target-labeled conformal prediction intervals for AirfRANS aerodynamic coefficients under physical shift*. This is the personal record behind it: how I found the question, why it held my attention, how the study changed one audit at a time, and what survived after the original hypothesis failed.

## How I found the question

I did not begin by choosing a favourite neural network. I began with a shortlist of five AI-native CFD research directions and asked which one a single researcher could make falsifiable, reproducible, and useful without generating a new DNS, LES, or large three-dimensional campaign.

The shortlist contained conformal uncertainty under distribution shift, goal-driven active learning, conservation projection, symbolic turbulence closure, and OpenFOAM mutation testing. The first idea ranked highest because it joined three things I cared about:

- a real aerodynamic failure mode—geometry, Reynolds number, or angle of attack leaving the training regime;
- a precise statistical claim that could be accepted or rejected; and
- public predictions that made a workstation-scale audit possible.

The practical opening came from [AirfRANS](https://arxiv.org/abs/2212.07564), a public set of 1,000 two-dimensional RANS simulations around parameterised NACA airfoils. Its official score archive already contained drag and lift truth, prediction means, and model-to-model spread for MLP, GraphSAGE, PointNet, and Graph U-Net baselines. That meant I could study interval behaviour before committing to expensive retraining.

The question became narrow enough to test:

> Under physically defined target shifts, can group-aware conformal calibration and a fixed abstention rule improve worst-group empirical coverage without making intervals wider than ordinary split conformal or rejecting more than half of a group?

I was deliberately asking for a result that could fail.

## Why it became interesting to me

A surrogate that reports a low average error is not automatically trustworthy in a design loop. A racing or aerodynamic workflow cares about the cases near the edge of the envelope: a new wing geometry, a different ride height, a higher Reynolds number, or an angle of attack that was sparse in training. A point prediction can remain smooth while its error grows silently.

Uncertainty intervals look like a solution, but the interval itself can fail in less obvious ways. It can be too narrow. It can achieve nominal coverage only by becoming too wide to guide a decision. It can look balanced on average while one physical group remains exposed. It can reject so many cases that the retained set is no longer operationally useful.

That trade-off interested me more than another accuracy leaderboard. I wanted to know whether a simple reliability layer could survive three engineering constraints at once:

1. coverage near the declared 90% level;
2. finite, competitive interval width; and
3. useful retention after abstention.

The attraction was also methodological. Conformal prediction has a clean finite-sample story under exchangeability, but an aerodynamic extrapolation task is exactly where exchangeability becomes difficult to defend. I had to keep the claim modest: this was a target-pool empirical audit using target labels, not a theorem that source-calibrated intervals remain valid after arbitrary deployment shift.

## I audited the data before writing the method

The first useful decision was about storage, not statistics. The processed AirfRANS archive was 9.34 GiB compressed; the raw OpenFOAM archive was 66.40 GiB and outside my disk envelope. The coefficient score archive was only 36.46 MB.

I range-read the processed archive's central directory and manifest instead of downloading everything. That audit established the official split counts and exposed a subtle point: all 1,000 geometry parameter tuples were unique. “Unseen geometry” could not mean “a different simulation ID”—that condition was vacuous. I needed a frozen region of geometry space.

The compact score lineage exposed 673 unique identities across the full, Reynolds, and angle-of-attack test artifacts. The remaining 327 catalog cases were not reconstructed. I therefore limited every custom claim to the 673-case artifact-linked subset instead of pretending it represented the entire catalog.

Two custom shifts followed:

- **Thickness extrapolation:** 463 source cases and 210 target cases, split into thin-near, thin-far, thick-near, and thick-far groups.
- **Joint Reynolds–AoA extrapolation:** 78 source cases and 97 corner target cases, split into four low/high Reynolds and low/high angle-of-attack groups. Another 498 cases belonged to neither side of this exact contract.

That data audit changed the study before any final outcome was inspected. It also set a pattern I kept through the paper: define identities, units, boundaries, exclusions, and group counts before interpreting a metric.

## I froze a rule that could stop me

The primary protocol used a group-stratified 20/40/40 target partition:

- 20% to set a label-free uncertainty threshold;
- 40% for conformal calibration; and
- the remainder for evaluation.

Nominal coverage was 90%. The custom predictor was a 300-tree random forest with five fixed outer seeds; each custom task used 20 target-split seeds. Official AirfRANS contexts used four released architectures, two coefficients, and 50 target-split seeds.

The stop rule mattered more than any individual method. A group-aware candidate had to improve the coverage–width frontier over pooled absolute split conformal on both custom tasks. Required intervals had to be finite, and minimum group retention had to stay at or above 50%. Splits, seeds, groups, targets, and surrogates could not be selected after seeing outcomes.

This constraint prevented the most tempting form of overfitting: changing the research question after the preferred method lost.

## The run produced a negative paper

The frozen experiment produced 57,200 detailed group rows, 884 method/group summaries, and 260 split-wise worst-group summaries.

Target-labeled pooled calibration repaired much of the severe undercoverage of the uncalibrated spread diagnostic:

| Target shift | Spread diagnostic marginal coverage | Pooled absolute marginal coverage |
|---|---:|---:|
| Official AoA | 0.585 | 0.910 |
| Official Reynolds | 0.554 | 0.904 |
| Thickness | 0.736 | 0.904 |
| Joint Reynolds–AoA | 0.510 | 0.923 |

That was the encouraging part. The harder result was that no group-aware method produced a finite coverage–width improvement on both custom tasks while satisfying the retention rule. Normalising by released spread often widened the intervals. Equal-group weighting did not rescue the frontier. Selection reduced width in some official-task settings but did not create a reliable custom-task improvement.

![Primary AirfRANS operating points across official and custom shifts.](/images/notes/airfrans-conformal-ood/primary-operating-points.png)

*The internally recorded primary operating points. Squares show macro-average group coverage; triangles show split-wise group minima. The joint Mondrian-normalised cell is marked as refusal rather than plotted as ordinary finite coverage.*

## The moment that changed the paper: eight labels

At 90% nominal coverage, a finite corrected conformal rank needs at least

$$
n_{\min}(\delta)=\left\lceil\frac{1-\delta}{\delta}\right\rceil=9
$$

calibration cases in a group.

One joint-shift group had only eight calibration labels under the recorded 40% allocation. The corrected rank exceeded the available scores. The theorem-compatible interval radius was therefore infinite.

This was not a numerical crash and not a plotting inconvenience. It was the correct refusal for the design I had chosen. Replacing infinity with an uncorrected empirical quantile would have produced a nicer chart and a weaker claim.

The failure taught me that the calibration split is not bookkeeping. Label allocation controls rank feasibility, evaluation resolution, and whether the method has a finite operating point at all.

A post-primary fixed-evaluation sensitivity made that mechanism visible. Raising the calibration fraction from 40% to 60% increased the smallest joint-group calibration count from 8 to 13 and removed every Mondrian-absolute refusal for both predictors. The price was a smaller evaluation set; the smallest evaluation group then had only four cases.

![Calibration-fraction sensitivity for the joint physical shift.](/images/notes/airfrans-conformal-ood/calibration-fraction-sensitivity.png)

*At 40% calibration, Mondrian cells refuse. At 60%, finite operating points appear. This is a budget effect, not evidence that 60% is uniformly optimal.*

## I did not “repair” the failed hypothesis

Once the primary rule failed, the honest next step was diagnosis, not replacement. I kept the negative decision and added analyses with explicit post-primary labels.

Three diagnoses mattered most.

### 1. The minimum statistic was biased downward

Taking the minimum empirical coverage across several small evaluation groups creates downward bias even when every case has the same true 90% coverage probability. I added a common-nominal binomial reference and a rank-aware Mondrian reference so that a low observed minimum was not automatically blamed on the method.

The common expected group minimum was 0.883 for Reynolds, 0.873 for AoA, 0.830 for thickness, and 0.801 for the joint task. The joint result still could not be treated as a finite comparison because every recorded split contained rank refusal.

### 2. Predictor failure and calibration failure were mixed

The custom analysis initially used a random forest. I added a separate bootstrap polynomial-ridge predictor as a sensitivity, without changing the primary verdict.

![Predictor error sensitivity under thickness and joint shifts.](/images/notes/airfrans-conformal-ood/predictor-sensitivity.png)

*The random-forest joint-shift failure was not shared by bootstrap ridge. Joint lift range-normalised RMSE fell from 0.125 to 0.037; joint drag fell from 0.225 to 0.125.*

This result stopped me from attributing every bad interval to the conformal layer. Calibration wraps a predictor; it does not erase predictor bias or manufacture a useful difficulty ranking.

### 3. Identity reuse can hide inside a “reference” task

The full-test reference pool overlapped 41 identities with the AoA target and 103 with the Reynolds target. I reran the residual-transfer analysis after removing those identities, leaving reference pools of 159 and 97 cases.

The disjoint rerun preserved the main interpretation: normalised transfer retained higher coverage but at extreme target-range-normalised width, especially for Reynolds. Removing overlap materially worsened Reynolds absolute transfer. A reference dataset is not independent merely because it has a different task name.

## What I concluded

The paper's result is not “conformal prediction works” or “conformal prediction fails.” The conclusions are narrower and more useful:

1. **Target labels can repair severe empirical undercoverage.** Pooled absolute calibration moved marginal coverage close to 0.90 in all four audited shifts.
2. **Marginal coverage does not guarantee a useful worst-group operating point.** Group balance, width, and finite availability must be reported separately.
3. **Calibration budget is part of the method.** At 90% nominal coverage, eight labels force refusal; thirteen can make the same groupwise construction finite.
4. **Infinity is a valid result.** It should not be converted into a coverage marker or hidden with an uncorrected quantile.
5. **The predictor remains in the loop.** Point error and spread–error ranking can dominate what calibration is able to recover.
6. **Identity lineage must be audited before transfer.** Different arrays or task names can still reuse the same physical cases.
7. **This is not source-to-OOD validity.** Calibration consumed labels from deployment-like target pools; the results are empirical benchmarks on a fixed, physically grouped subset.

## What the work changed in me

I started the project looking for a reliability layer. I ended it thinking more about experimental contracts.

The most important decisions happened before and after the main run: auditing the 71 GB raw archive out of scope; replacing a vacuous identity-based geometry split with a thickness-region contract; freezing a stop rule; retaining infinity; separating primary from post-primary analyses; and checking case identities before transfer.

The paper became stronger when I stopped trying to make every figure look like success. A negative result can still support a concrete engineering recommendation: design calibration budgets against conformal-rank requirements, expose refusal, and test the predictor before interpreting its interval.

If I continue this line of work, I would start with a fresh untouched target and a method that states its shift or selection assumptions explicitly. I would also plan label allocation before any model comparison. The next question is no longer “Which interval method wins?” It is “What evidence and budget are required before an interval can be trusted as an engineering object?”

The reproducibility package, source manifests, tests, figures, tables, and archived release are available in the [Paper 1 repository](https://github.com/gaoflow/airfrans-conformal-ood-audit). The public package identifies release `v1.0.2` and fixed commit `12c42a582f3190591ac7f5fcdc19c1bfb93355e5`.
