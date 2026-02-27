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

My first instinct with a force history was simple: zoom in on the end, decide where it looked flat, and average the last hundred points.

That worked until I changed the plot scale.

The “steady” part moved. A component force was still drifting. A solver transition sat inside the window. The samples were correlated, so the usual standard error was too optimistic.

I stopped choosing the answer by eye and wrote a rule.

## I freeze the coefficient before touching the history

For lift and drag, the coefficient depends on the force, density, speed, and reference area:

$$
C_D=\frac{F_D}{\tfrac12\rho U_\infty^2A_{ref}},
\qquad
C_L=\frac{F_L}{\tfrac12\rho U_\infty^2A_{ref}}.
$$

Before averaging anything, I record the reference area and length, lift and drag directions, moment centre, patch groups, ground and wheel treatment, and sign convention.

A beautifully converged coefficient with the wrong patches or reference area is still wrong.

## Residuals and forces told me different stories

Residuals show whether the field equations are being solved. The force trace shows what the integrated output is doing.

I have seen residuals fall while a coefficient drifted. I have also seen small residuals beside a sudden force jump caused by a setup or patch-definition problem.

That is why I no longer use the final residual screenshot as proof that an aerodynamic number is ready.

## I keep every numerical transition on the plot

Scheme changes, relaxation changes, restarts, mesh updates, mapped fields, and patch-definition changes can all change the statistics of a force history.

Samples before and after one of those events do not belong in the same average. My earliest allowed window starts after the last material transition and after its new transient has decayed.

This also stops a favourable stopping point from becoming the hidden reason a case looks good.

## The rule I use now

For every force and moment channel, I:

1. exclude known setup and transition regions;
2. generate several possible window starts, all ending at the same last sample;
3. fit a trend and reject windows with too much drift;
4. compare early and late parts of each window;
5. estimate uncertainty with batch means instead of treating every sample as independent;
6. require all critical channels to pass; and
7. choose the earliest passing window.

The output is not just a mean. I save the chosen start, sample count, drift statistic, batch construction, interval, and every candidate window that failed.

## Why I use batch means

Neighbouring CFD samples often move together. If I pretend they are independent, I get a narrow confidence interval that the data did not earn.

I split the retained history into contiguous batches, average each batch, and estimate uncertainty from the spread of those batch means:

$$
\bar{x}_j=\frac{1}{m}\sum_{i=(j-1)m+1}^{jm}x_i,
\qquad
\bar{x}=\frac{1}{b}\sum_{j=1}^{b}\bar{x}_j.
$$

The batches need to be long enough to reduce the remaining correlation. I also need enough batches to estimate their spread. There is no universal batch length; the history has to support the choice.

This interval describes sampling uncertainty inside the retained history. It does not tell me whether the turbulence model or mesh represents the real car.

## What happened in my F1 pilot

The [F1 2026 full-car project](/projects/f1-2026-aero) kept 301 corrected coefficient samples from iterations 100 to 400. I tracked seven outputs: whole car, body, floor, front and rear wings, and front and rear tyres.

The rule selected a 31-sample window beginning at iteration 370:

| Quantity | Mean | Relative interval |
|---|---:|---:|
| $C_D$ | 0.2581 | 0.64% |
| $C_L$ | −0.3019 | 0.59% |

The final values were $C_D=0.2609$ and $C_L=-0.3068$. They were visibly different from the window means. That is the practical reason I do not publish the last sample.

The same project kept an uglier example. An earlier setup produced a maximum $|C_L|$ of 10099 against a gate limit of 10. The front-wing force definition was corrupted even though the residual panels did not make the error obvious.

Both histories remain in the record.

## A stable mean did not qualify the car

The corrected force history let me verify signs, data retention, window selection, and averaging. I still labelled it as pilot output.

The mesh was coarse, the reference area was provisional, and the later mesh campaign ended in NO-GO. A stable average can hide a bad mesh. In this project, both facts were true at once.

## What I compare between variants

I qualify each history separately before comparing two cases. Then I carry the uncertainty into the difference.

If the aerodynamic delta is the same size as the sampling or numerical uncertainty, my conclusion is not “small improvement.” It is: **no resolved difference under this procedure**.

I also keep failures where no window passes, different components choose incompatible windows, a restart creates a step, or the interval remains too wide for the design question. Those cases tell me whether I need more iterations, a corrected setup, or a rejected case.

The line on the plot is only the presentation. The reusable part is the rule that turns a raw history into a claim I can defend later.
