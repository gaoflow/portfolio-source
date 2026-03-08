---
title: 'When 90% Coverage Became an Infinite Interval'
image: /images/notes/covers/airfrans-conformal-ood.svg
published: 2026-08-24
summary: 'I went looking for a practical way to make CFD surrogate predictions safer. I ended up with an infinite interval, a failed hypothesis, and a much clearer idea of what uncertainty estimates can and cannot do.'
tags: [CFD]
sourceProjects: []
featured: true
order: 7
---

I wanted to solve a specific problem: a CFD surrogate can give confident but unreliable predictions for a new airfoil, a different Reynolds number, or an angle of attack outside its training range. I expected my first paper to end with a better uncertainty method. Instead, it ended with an infinite interval.

This was not a calculation error. I had asked for a 90% groupwise conformal interval, but one physical group contained only eight calibration labels. The method needed at least nine. The only honest answer was: **refuse to give a finite interval**.

That refusal changed the paper and the way I think about reliability in CFD machine learning.

## I framed an experiment that could fail

I did not begin with AirfRANS. I first compared five research directions that I could realistically pursue on one workstation:

- uncertainty under distribution shift;
- active learning;
- conservation correction;
- symbolic turbulence closure; and
- OpenFOAM mutation testing.

I chose uncertainty first because average accuracy could not answer the question I cared about: when a model reaches an important edge case, does it know that it may be wrong?

[AirfRANS](https://arxiv.org/abs/2212.07564) gave me a practical test. It contains 1,000 two-dimensional RANS simulations around NACA airfoils. The official score archive also provides drag and lift truth alongside predictions from MLP, GraphSAGE, PointNet, and Graph U-Net models. I could examine uncertainty behaviour without first spending weeks retraining networks.

I wrote the research question as:

> Can group-aware calibration improve the worst physical group without making the intervals wider than ordinary split conformal or discarding more than half the cases?

I deliberately chose a question that could have a clear answer of “no.”

## I checked coverage, width, and retention together

A narrow interval looks reassuring, but it is meaningless if it misses the truth. A wide interval may cover everything while offering no help with a design decision. A selector can also keep only easy cases and quietly reject the difficult conditions that matter most.

I therefore tracked three things from the start:

- whether coverage stayed near the declared 90%;
- whether intervals remained narrow enough to be useful; and
- how many cases remained after abstention.

![Calibration decisions under distribution shift.](/images/notes/systems/when-90-percent-coverage-became-infinite.svg)

I treated refusal as a formal output. If coverage, interval width, or retention stopped being useful for a decision, I would not publish a precise-looking interval. An infinite interval may cover the truth, but it has no engineering resolution. A narrow interval that keeps only easy cases removes the difficult conditions from the evaluation.

I also limited the claim in advance. This experiment used labels from a deployment-like target pool. It could not prove that calibration on source data would remain valid under any future distribution shift.

## I checked the data before defining the shifts

The raw OpenFOAM archive was 66.40 GiB. The processed dataset was 9.34 GiB compressed, while the coefficient score archive was only 36.46 MB.

I started with the smaller score archive and read the larger archive’s manifest remotely. This saved disk space and revealed a more important issue: all 1,000 geometry parameter tuples were unique. I could not define “unseen geometry” as a different simulation ID. I needed a genuinely held-out region of geometry space.

The compact prediction files linked 673 unique cases. I did not reconstruct the remaining 327, so I limited every custom conclusion to those 673 cases.

I then fixed two difficult target shifts:

- a thickness shift with 463 source cases and 210 target cases;
- a joint Reynolds–angle-of-attack shift with 78 source cases and 97 target corner cases.

Within each physical group, I used 20% of the target pool to set a label-free threshold, 40% for conformal calibration, and the remaining cases for evaluation. I fixed the random seeds, groups, predictors, 90% target coverage, and the rule that minimum group retention had to remain above 50%.

I fixed these choices before seeing the results so that I could not move the goalposts later.

## Ordinary calibration improved coverage, but the stronger idea failed

The full run produced:

- 57,200 detailed group rows;
- 884 summaries; and
- 260 split-wise worst-group summaries.

The first result was encouraging. Ordinary conformal calibration with target labels repaired much of the severe undercoverage in the raw spread diagnostic:

| Shift | Raw spread | Pooled absolute calibration |
|---|---:|---:|
| AoA | 0.585 | 0.910 |
| Reynolds | 0.554 | 0.904 |
| Thickness | 0.736 | 0.904 |
| Joint Reynolds–AoA | 0.510 | 0.923 |

The group-aware method I cared about more did not succeed. It could not produce results that were finite, narrower, and better on both custom tasks.

Normalising by model spread often made the intervals wider. Equal-group weighting did not rescue the comparison. Abstention improved interval widths on some official tasks, but it did not produce a meaningful win on the custom tasks.

![Primary AirfRANS operating points across official and custom shifts.](/images/notes/airfrans-conformal-ood/primary-operating-points.png)

*This figure stopped the result from becoming a clean success story. The joint Mondrian result says REFUSAL instead of presenting infinity as a normal operating point.*

## Eight calibration labels forced a refusal

At 90% nominal coverage, a corrected groupwise conformal interval needs at least

$$
n_{\min}(\delta)=\left\lceil\frac{1-\delta}{\delta}\right\rceil=9
$$

calibration cases.

One group in the joint physical shift had only eight. The failure was concentrated in a small number of groups, but it was enough to make the main hypothesis fail.

I could have used an uncorrected quantile, changed the split, or redefined the groups. Each option was tempting, but the stopping rule was already fixed. I kept the infinite result and marked the main hypothesis as failed.

The output had clear limits:

| Output | What I can conclude | What I cannot conclude |
|---|---|---|
| Finite interval with adequate coverage | Calibration closes for the current group | An unseen distribution is equally reliable |
| Infinite interval | There is not enough calibration data for a finite guarantee | The predictor must be wrong |
| Low retention | The method rejected many target conditions | The retained cases represent the full target pool |

The infinite interval was not an inconvenient plotting value. It was the method’s formal answer to insufficient evidence.

## I increased the calibration fraction without rewriting the result

After completing the main analysis, I ran a separate sensitivity check. I did not change the original conclusion.

Increasing the calibration fraction from 40% to 60% raised the smallest group from 8 to 13 labels and made every Mondrian absolute interval finite. The trade-off was direct: more labels went into calibration, fewer cases remained for evaluation, and the smallest evaluation group fell to four cases.

![Calibration-fraction sensitivity for the joint physical shift.](/images/notes/airfrans-conformal-ood/calibration-fraction-sensitivity.png)

*Changing the label budget removes this refusal. It does not make 60% a universally better split.*

This check showed only that the label budget changed the feasibility of the current split. It did not show that 60% was generally optimal. I came away with a firm lesson: **the calibration budget is part of the method**, not an administrative choice to make after finishing the model.

For later diagnostics, I also added eight labels to separate error sources under the thickness, AoA, and joint shifts. I did not use them to train a more favourable replacement after seeing the main results. They entered only the follow-up diagnostics and did not change the frozen main analysis.

## I checked small groups, predictor choice, and case identity

I did not tune alternative methods against results I had already inspected. I added clearly separated checks to understand the failure.

### Worst-group coverage is sensitive to small samples

Taking the lowest coverage across several small groups creates a downward bias. I built simple binomial references to distinguish ordinary small-sample variation from a real group problem.

This did not remove the group failures, but it kept me from treating every low-coverage result as the same kind of problem.

### Calibration cannot repair predictor bias

The original custom predictor was a random forest. In a follow-up check, I replaced it with bootstrap polynomial ridge regression and saw a sharp change in lift error under the joint shift.

![Predictor error sensitivity under thickness and joint shifts.](/images/notes/airfrans-conformal-ood/predictor-sensitivity.png)

*For the joint shift, range-normalised lift RMSE fell from 0.125 with the random forest to 0.037 with bootstrap ridge. Drag RMSE fell from 0.225 to 0.125.*

This stopped me from blaming the conformal layer for everything. Calibration wraps the predictor. It cannot remove point-prediction bias or create a useful uncertainty ranking from nothing.

### Different task names can hide reused cases

I also checked simulation identities. The so-called full-test reference pool reused 41 AoA target cases and 103 Reynolds target cases.

After I removed them, the transfer intervals remained wide and uneven across groups. The check did not reverse the conclusion, but it showed how easily label reuse can hide behind a different task name. I now check case identities before any transfer experiment instead of trusting split names alone.

## What the experiment does and does not show

The experiment supports several limited conclusions:

1. Labels from a target pool can repair severe undercoverage.
2. Good marginal coverage does not guarantee a useful worst group.
3. A method can follow its statistical rule correctly and still refuse because a group is too small.
4. The number of calibration labels changes whether the method is feasible.
5. Predictor error and uncertainty ranking still matter after calibration.
6. Case identities must be checked before transfer experiments.
7. An infinite interval is information.

It does not show that:

- calibration using labels from a deployment-like target pool automatically generalises to any future distribution shift;
- a finite interval with adequate coverage guarantees reliability on an unseen distribution;
- an infinite interval means the predictor is wrong;
- cases retained after abstention represent all target conditions; or
- a 60% calibration split is always better than a 40% split.

## The standard I kept

I began by looking for a better calibration method that could make CFD surrogates safer. I finished with a more useful negative result.

The failure made me preserve the split rules, the missing field endpoint, the identity overlap, and the unsuccessful method. It also showed me that reliability cannot be reduced to one coverage number.

If I continue this work, I will start with a fresh, untouched target pool and plan the label budget before comparing methods. My next question is no longer “Which interval method wins?” It is:

> What evidence must exist before an interval deserves to guide an engineering decision?

The code, data lineage, tests, figures, and archived paper package are in the [Paper 1 repository](https://github.com/gaoflow/airfrans-conformal-ood-audit), release `v1.0.2`, commit `12c42a582f3190591ac7f5fcdc19c1bfb93355e5`.
