---
title: 'When Is a Force Coefficient Actually Converged?'
published: 2026-08-07
summary: 'A reproducible route from raw OpenFOAM force histories to a declared averaging window, uncertainty interval, and an honest decision about what the coefficients can support.'
tags: [OpenFOAM, forceCoeffs, uncertainty, batch means]
sourceProjects: [f1-2026-aero]
featured: true
order: 2
---

A force coefficient earns trust when its definition is frozen, its averaging window comes from a rule, and its interval accounts for autocorrelation. A flat-looking trace proves none of these: the apparent calm may depend on plot scale, hand-picked bounds, correlated samples, or a late change in numerical settings.

## Start with the coefficient definition

Before analysing the history, freeze the quantities used to non-dimensionalise it. For drag and lift,

$$
C_D = \frac{F_D}{\tfrac{1}{2}\rho U_\infty^2 A_{ref}},
\qquad
C_L = \frac{F_L}{\tfrac{1}{2}\rho U_\infty^2 A_{ref}}.
$$

The case record must identify:

- density and velocity used by `forceCoeffs`;
- reference area and length;
- lift and drag directions;
- moment centre and axis;
- included patches and component groups;
- whether moving-ground and rotating-wall forces are treated consistently;
- coefficient sign convention.

A correct mean of the wrong patch group is still wrong. Reconcile component sums with the whole-car definition before any statistical processing.

## Residual convergence and force convergence answer different questions

Equation residuals measure the algebraic progress of the field solution. Integrated coefficients respond to the field that remains after that solve, including physical or numerical oscillation.

| Residuals | Forces | Interpretation |
|---|---|---|
| falling | drifting | field equations are solving, but the aerodynamic output is not stationary |
| flat | stationary | possible steady state; still needs a declared interval |
| oscillatory | periodic | physical or numerical cycle; a mean needs correlation-aware uncertainty |
| small | discontinuous | usually a setup, restart, patch, or reference-definition change |

Publishing the final residual panel establishes nothing about the force result.

## Preserve every numerical transition

A force history should carry event markers for changes that alter its statistics:

- first-order to higher-order schemes;
- turbulence initialisation or correction;
- relaxation changes;
- restart from a mapped field;
- geometry, mesh, patch, or reference updates;
- solver or time-step changes.

Samples on opposite sides of such a transition belong to different populations. The earliest admissible window begins after the last material transition, once the subsequent transient has decayed.

## Why the last-N-samples rule is weak

"Average the final 100 iterations" is reproducible but indefensible. It can:

- hide a drift longer than the selected window;
- change the uncertainty when output frequency changes;
- treat autocorrelated samples as independent;
- select a different physical duration across cases;
- reward a run stopped at a favourable phase.

A better rule evaluates candidate windows against stationarity and uncertainty criteria fixed before comparing variants.

## A practical steady-window procedure

For each force or moment channel:

1. **Define the admissible start.** Exclude setup transitions and known transient regions.
2. **Generate candidate starts.** Each candidate extends to the same final sample.
3. **Test drift.** Fit a linear trend and normalise its total window change by the mean magnitude or a declared engineering scale.
4. **Test mean stability.** Compare early and late sub-window means.
5. **Estimate correlated uncertainty.** Use batch means or another method that respects temporal correlation.
6. **Require all critical channels to pass.** A stable whole-car coefficient does not excuse an unstable component balance.
7. **Choose by rule, not appearance.** For example, select the earliest passing candidate to maximise retained evidence.

The procedure should return the chosen start, sample count, mean, interval, drift statistic, batch construction, and every failed candidate alongside the winning mean.

## Batch means in engineering terms

Suppose a retained history contains $N$ correlated samples. Divide it into $b$ contiguous batches of $m$ samples, compute one mean per batch, then estimate uncertainty from the spread of those batch means.

$$
\bar{x}_j = \frac{1}{m}\sum_{i=(j-1)m+1}^{jm}x_i,
\qquad
\bar{x} = \frac{1}{b}\sum_{j=1}^{b}\bar{x}_j.
$$

The interval comes from the batch-mean variance, not the raw-sample variance. Batches must be long enough that adjacent batch means are approximately independent. More batches sharpen the interval estimate; longer batches reduce residual correlation. The history must support both.

Batch means quantify sampling uncertainty in the retained history. They say nothing about physical accuracy.

## Worked evidence from the F1 pilot

The [F1 2026 full-car project](/projects/f1-2026-aero) retains 301 corrected coefficient samples spanning iterations 100–400, across seven force outputs (whole car plus body, floor, front and rear wings, front and rear tyres). The batch-means rule selects a 31-sample window starting at $t = 370$:

| Quantity | Mean | Relative confidence interval |
|---|---:|---:|
| $C_D$ | 0.2581 | 0.64% |
| $C_L$ | -0.3019 | 0.59% |

The terminal values ($C_D = 0.2609$, $C_L = -0.3068$) still differ visibly from the window means, which is exactly why a rule beats an eyeball.

The same project preserves the counterexample. An earlier uncorrected run produced a maximum $|C_L|$ of 10099 against a gate limit of 10 — a front-wing force-definition corruption that residual plots had hidden. Both runs stay in the record.

These figures verify the coefficient pipeline: signs, data retention, window selection, averaging. They stay labelled as pilot output because the mesh is coarse, its reference area is provisional, and the later mesh-qualification campaign remains NO-GO. A stable average can hide a bad mesh. Both were true here.

## Compare variants only after per-case qualification

Qualify each history independently first. Then compare means with uncertainty carried into the delta.

A useful report includes:

- baseline and candidate window rules;
- means and intervals for both cases;
- absolute and relative delta;
- combined uncertainty assumption;
- component contribution changes;
- evidence that reference quantities and operating states are identical.

If the observed delta is the same scale as numerical or sampling uncertainty, the correct conclusion is "no resolved difference under this protocol".

## Failure modes worth publishing

A strong convergence report retains cases where:

- drift never falls below the limit;
- different channels select incompatible windows;
- a component coefficient steps after a patch change;
- the interval remains too wide for the design delta;
- batch means remain correlated;
- apparent convergence disappears when the y-axis is rescaled;
- a restart creates an undocumented discontinuity.

These failures decide the next action: more iterations, a corrected setup, different sampling, or rejection of the case.

## Minimum publication payload

A reader should receive:

1. raw force and moment history;
2. event markers and scheme transitions;
3. coefficient definitions and patch groups;
4. machine-readable selected-window metadata;
5. mean, drift, sample count, batches, and interval;
6. plots generated from the same retained data;
7. the mesh and model qualification state;
8. the exact decision the statistics permit.

The plotted line is presentation. The reusable artifact is the rule that converts raw history into a bounded claim.

## Boundary of this note

No single batch length, drift limit, or interval threshold applies to every RANS or transient case. The right sampling method depends on stationarity, output cadence, dominant time scales, and the decision margin. This note defines what must be exposed; it prescribes no universal tolerances.
