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

I thought my first paper would end with a better uncertainty method. Instead, it ended with an infinite interval.

That sounds like a failed calculation. It was not. The calculation was doing exactly what it should. I had asked for a 90% groupwise conformal interval, but one physical group contained only eight calibration labels. The method needed at least nine. The only honest answer was: **refuse to give a finite interval**.

That refusal changed the paper. It also changed the way I think about reliability in CFD machine learning.

## How I found the question

I did not start from AirfRANS. I first compared five research ideas that I could realistically do on one workstation: uncertainty under distribution shift, active learning, conservation correction, symbolic turbulence closure, and OpenFOAM mutation testing.

The uncertainty idea came first because it matched a problem I already cared about. A surrogate can look accurate on average and still become overconfident on a new airfoil, a different Reynolds number, or an angle of attack outside its training range. In an aerodynamic design loop, those edge cases are often the cases that matter.

[AirfRANS](https://arxiv.org/abs/2212.07564) gave me a practical way to test this. It contains 1,000 two-dimensional RANS simulations around NACA airfoils. More importantly, the official score archive already included drag and lift truth plus predictions from MLP, GraphSAGE, PointNet, and Graph U-Net models. I could audit the uncertainty behaviour before spending weeks retraining networks.

The question I wrote down was simple:

> Can group-aware calibration improve the worst physical group without making the intervals wider than ordinary split conformal or throwing away more than half the cases?

I wanted a question that could tell me “no.”

## Why I became interested

A narrow uncertainty interval looks reassuring, but that alone tells me nothing. It might miss the truth. A wide interval might cover everything but be useless for a design decision. A selector might keep only the easy cases and quietly reject the ones I actually need.

I therefore kept three things together from the start:

- coverage near the declared 90%;
- interval width; and
- how many cases remained after abstention.

I also kept the claim modest. This experiment used labels from a deployment-like target pool. It was not proof that a model calibrated on source data stays valid under any future shift.

## The first real work was a data audit

The raw OpenFOAM archive was 66.40 GiB. The processed dataset was 9.34 GiB compressed. The coefficient score archive was only 36.46 MB.

I began with the small archive and read the large archive's manifest remotely. That saved disk space, but the more important result was conceptual: every one of the 1,000 geometry parameter tuples was unique. “Unseen geometry” could not simply mean “a different simulation ID.” I had to define a real held-out region of geometry space.

The compact prediction files linked 673 unique cases. I did not reconstruct the other 327, so I limited every custom claim to those 673 cases.

I then froze two difficult target shifts:

- a thickness shift with 463 source cases and 210 target cases;
- a joint Reynolds–angle-of-attack shift with 78 source cases and 97 target corner cases.

For every physical group, I split the target pool into 20% for setting a label-free threshold, 40% for conformal calibration, and the rest for evaluation. I fixed the seeds, groups, predictors, 90% target coverage, and the rule that minimum group retention had to stay above 50%.

The point of freezing this early was to stop myself from moving the goalposts later.

## Then I ran the experiment

The full run produced 57,200 detailed group rows, 884 summaries, and 260 split-wise worst-group summaries.

The first result was encouraging. Ordinary target-labelled conformal calibration repaired much of the bad undercoverage of the raw spread diagnostic:

| Shift | Raw spread | Pooled absolute calibration |
|---|---:|---:|
| AoA | 0.585 | 0.910 |
| Reynolds | 0.554 | 0.904 |
| Thickness | 0.736 | 0.904 |
| Joint Reynolds–AoA | 0.510 | 0.923 |

But the stronger idea did not survive. Group-aware methods did not give me a finite, narrower, better result on both custom tasks. Normalising by the model spread often made intervals wider. Equal-group weighting did not rescue the comparison. Abstention helped some official-task widths, but it did not produce a useful custom-task win.

![Primary AirfRANS operating points across official and custom shifts.](/images/notes/airfrans-conformal-ood/primary-operating-points.png)

*This is the figure where the story stopped being a clean success. The joint Mondrian result says REFUSAL instead of pretending that infinity is a normal operating point.*

## Eight labels changed the paper

At 90% nominal coverage, a corrected groupwise conformal interval needs at least

$$
n_{\min}(\delta)=\left\lceil\frac{1-\delta}{\delta}\right\rceil=9
$$

calibration cases.

One joint-shift group had eight.

The tempting response would have been to use an uncorrected quantile, change the split, or redefine the group. I did none of those because the stop rule had already been written. I kept the infinity and marked the main hypothesis as failed.

Later, I ran a separate sensitivity check without changing the original decision. Moving from 40% to 60% calibration increased the smallest group from 8 to 13 labels and made every Mondrian-absolute interval finite. The trade-off was obvious: more calibration labels meant fewer cases left to evaluate, and the smallest evaluation group fell to four cases.

![Calibration-fraction sensitivity for the joint physical shift.](/images/notes/airfrans-conformal-ood/calibration-fraction-sensitivity.png)

*Changing the label budget removes the refusal. It does not make 60% a universally better split.*

This was the result I kept thinking about after the run: **the calibration budget is part of the method**. It is not an administrative detail chosen after the model is finished.

## I looked for what else was hiding inside the failure

I did not tune a replacement method on the inspected results. I added clearly labelled follow-up checks to understand why the result looked the way it did.

First, taking the minimum coverage over several small groups is biased downward. I built simple binomial references so I could separate ordinary small-sample wobble from a real group problem.

Second, I tested another predictor. The original custom model was a random forest; the follow-up used bootstrap polynomial ridge. The joint-shift lift error changed sharply:

![Predictor error sensitivity under thickness and joint shifts.](/images/notes/airfrans-conformal-ood/predictor-sensitivity.png)

*For the joint shift, range-normalised lift RMSE fell from 0.125 with the random forest to 0.037 with bootstrap ridge. Drag fell from 0.225 to 0.125.*

That stopped me from blaming the conformal layer for everything. Calibration wraps the predictor; it cannot remove point-prediction bias or invent a useful uncertainty ranking.

Third, I checked simulation identities. The so-called full-test reference pool reused 41 AoA target cases and 103 Reynolds target cases. After removing them, the transfer intervals remained wide and group-imbalanced. The check did not reverse the conclusion, but it showed how easily label reuse can hide behind a different task name.

## What I actually learned

I began with the idea that a better calibration scheme might make a CFD surrogate safer. I finished with a less glamorous but more useful list:

1. Target labels can repair severe undercoverage.
2. Good marginal coverage does not guarantee a useful worst group.
3. A method can be correct and still refuse because the group is too small.
4. The number of calibration labels changes the method's feasibility.
5. Predictor error and uncertainty ranking still matter after calibration.
6. Case identities must be checked before any transfer experiment.
7. An infinite interval is information, not an inconvenient plotting value.

The negative result was more useful than a tuned success would have been. It made me keep the split contract, the missing field endpoint, the identity overlap, and the failed method visible.

If I continue this work, I will start with a fresh untouched target pool and plan the label budget before comparing methods. The next question is no longer “Which interval method wins?” It is “What evidence has to exist before an interval deserves to guide an engineering decision?”

The code, data lineage, tests, figures, and archived paper package are in the [Paper 1 repository](https://github.com/gaoflow/airfrans-conformal-ood-audit), release `v1.0.2`, commit `12c42a582f3190591ac7f5fcdc19c1bfb93355e5`.
