---
title: 'The Force Trace Looked Flat. It Still Was Not the Answer.'
image: /images/notes/covers/force-coefficient-convergence.svg
published: 2026-08-02
summary: 'I stopped averaging the last 100 OpenFOAM iterations and wrote a rule for choosing the window, carrying correlation into the uncertainty, and refusing unstable component histories.'
tags: [OpenFOAM]
sourceProjects: [f1-2026-aero]
featured: true
order: 2
---

My first approach to an OpenFOAM force history was simple: zoom in on the end, decide where it looked flat, and average the last 100 points.

That worked until I changed the plot scale.

The “steady” region moved. One component force was still drifting, and the averaging window included a solver change. More importantly, neighbouring samples were correlated, so the usual standard error produced an interval that was too optimistic.

I stopped choosing the answer by eye and wrote an explicit rule.

## I check the coefficient definition first

For lift and drag, the coefficient depends on force, density, speed, and reference area:

$$
C_D=\frac{F_D}{\tfrac12\rho U_\infty^2A_{ref}},
\qquad
C_L=\frac{F_L}{\tfrac12\rho U_\infty^2A_{ref}}.
$$

Before averaging anything, I record:

- reference area and reference length;
- lift and drag directions;
- moment centre;
- patch groups;
- ground and wheel treatment;
- sign convention.

A beautifully converged coefficient with the wrong patches or reference area is still wrong.

## I do not use residuals as a substitute for force checks

Residuals show whether the field equations are being solved. Force histories show what the integrated outputs are doing. They can support different conclusions.

I have seen residuals continue to fall while a coefficient drifted. I have also seen small residuals beside a sudden force jump caused by a setup or patch-definition problem.

I no longer treat the final residual screenshot as evidence that an aerodynamic value is ready to use.

## I keep every numerical transition in the history

Scheme changes, relaxation changes, restarts, mesh updates, mapped fields, and patch-definition changes can all alter the statistics of a force history.

I do not combine samples from before and after these events in one averaging window. The earliest allowed window starts after the last material change and after the resulting transient has decayed.

This also prevents a favourable stopping point from becoming the hidden reason a case looks good.

## The rule I use now

![Force coefficient release gate](/images/notes/systems/force-coefficient-convergence.svg)

The process fixes the signs and reference quantities first, identifies numerical events, and then estimates an interval for correlated samples. A stable mean alone is not enough to show that the difference between two cases is credible.

For every force and moment channel, I:

1. exclude known setup and transition regions;
2. generate several possible window starts, all ending at the same final sample;
3. fit a trend and reject windows with too much drift;
4. compare the early and late parts of each window;
5. estimate uncertainty with batch means instead of treating every sample as independent;
6. require all critical channels to pass;
7. choose the earliest passing window.

I save more than the mean. I keep the chosen start, sample count, drift statistic, batch construction, interval, and every candidate window that failed.

If no window passes, I do not force the history into a steady-load result.

## I use batch means for correlated samples

Neighbouring CFD samples often rise and fall together. If I treat 200 samples as 200 independent observations, I underestimate the uncertainty in the mean and produce a confidence interval that the data did not earn.

I divide the retained history into contiguous batches, average each batch, and estimate uncertainty from the spread of those batch means:

$$
\bar{x}_j=\frac{1}{m}\sum_{i=(j-1)m+1}^{jm}x_i,
\qquad
\bar{x}=\frac{1}{B}\sum_{j=1}^{B}\bar{x}_j.
$$

If the window contains $N=Bm$ samples and each batch contains $m$ samples, I calculate the standard error from the $B$ batch means rather than directly from all $N$ raw samples.

The batches must be long enough to absorb the main autocorrelation, but I still need enough batches to estimate their spread. There is no universal batch length. The selected history must support the choice.

I handle common failures as follows:

| Check | Action if it fails |
|---|---|
| Candidate window crosses a restart or scheme change | Split the history; do not calculate one combined mean |
| Mean is stable but the confidence interval remains wide | Run for longer |
| Difference between two cases is smaller than the combined interval | Report only the direction, or do not rank the cases |
| Residuals are low but the force continues to drift | Do not use the steady-load result |

The interval describes sampling uncertainty within the retained history. It does not tell me whether the turbulence model or mesh represents the real car.

In the full F1 campaign, a simple tail-window calculation produced confidence intervals as low as 0.3%–0.6%, while a block bootstrap produced intervals of 3%–5%. That difference showed that sampling noise and window drift could not be collapsed into one “convergence” number.

## The F1 pilot exposed the problem with the final sample

The F1 2026 full-car project retained 301 corrected coefficient samples from iterations 100 to 400. I tracked seven outputs: whole car, body, floor, front wing, rear wing, front tyres, and rear tyres.

The rule selected a 31-sample window beginning at iteration 370:

| Quantity | Mean | Relative interval |
|---|---:|---:|
| $C_D$ | 0.2581 | 0.64% |
| $C_L$ | −0.3019 | 0.59% |

The final sample was $C_D=0.2609$ and $C_L=-0.3068$, visibly different from the window means. That is the practical reason I do not use the last sample directly.

The same project retained a worse failure. An earlier setup produced a maximum $|C_L|$ of 10099 against a gate limit of 10. The residual panels did not make the problem obvious, but the front-wing force definition was corrupted.

I kept both the corrected history and the failed one.

## I qualify each case before comparing variants

Before comparing two cases, I qualify each history separately and then carry the uncertainty into the difference.

If the aerodynamic delta is the same size as the sampling or numerical uncertainty, I do not call it a “small improvement.” I state:

**No resolved difference under this procedure.**

I also retain failures where:

- no window passes;
- different components require incompatible windows;
- a restart creates a step;
- the interval remains too wide for the design question.

These failures tell me whether to run more iterations, correct the setup, or reject the case.

## A stable mean is not validation

The corrected force history let me verify the signs, retained data, window selection, and averaging process. I still labelled the results as pilot output.

The project used a coarse mesh, and the reference area was provisional. The later mesh study ended in NO-GO. A stable average can hide a bad mesh; in this project, the averaging process was verifiable while the mesh still failed validation.

The force plot is only the presentation. What I retain is the rule that turns a raw history into a clear conclusion—and the boundary that makes me refuse an answer when the evidence is not strong enough.
