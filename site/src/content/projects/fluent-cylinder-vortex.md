---
title: 'Coursework: Fluent Vortex Shedding — Triggering the Kármán Street'
year: 2026
date: '2026-03-12'
status: complete
categories: [component-cfd, validation]
tags: [CFD]
summary: 'I triggered the Re=150 Kármán street with a velocity perturbation; the measured St=0.155 passes its gate while coarse-mesh dissipation leaves 29% drag error.'
role: 'Simulation & report lead'
team: 'ESILV MMN1 group — Bing Gao, Nicolas Chang, Daphné Baray'
duration: '4 weeks'
academic:
  institution: 'ESILV'
  course: 'Computational Fluid Dynamics'
  assignment: 'TD2 steady and transient flow past a cylinder'
  note: 'The second tutorial of the same ESILV CFD module, again as a group of three. I set up the steady and transient cylinder cases, triggered the vortex street with a deliberate velocity patch, and wrote the report. Later I rebuilt the force histories by digitising the archived Fluent monitors, verified the endpoints against the exported force reports, and packaged the result as a self-contained reproduction bundle.'
  requirements:
    - 'Solve steady laminar cylinder flow at Re=40 and check convergence, mass balance and drag.'
    - 'Run a transient Re=150 case and trigger symmetry breaking with a controlled velocity perturbation.'
    - 'Record lift and drag histories and identify the Kármán vortex street.'
    - 'Compare the force result with the supplied experimental reference and discuss the discrepancy.'
  media:
    - src: '/images/projects/fluent-cylinder-vortex/assignment-workflow.svg'
      alt: 'Workflow from steady cylinder flow to a perturbed transient case and Strouhal extraction'
      caption: 'The brief becomes a controlled experiment: establish the steady case, perturb symmetry, monitor forces, then extract St and error.'
    - src: '/images/projects/fluent-cylinder-vortex/vortex-evolution.gif'
      alt: 'Animated sequence of the cylinder wake developing into a staggered vortex street'
      caption: 'Four retained Fluent frames show the imposed asymmetry growing into the developed Kármán street.'
featured: true
order: 17
studySequence: 9
heroImage: /images/projects/fluent-cylinder-vortex/force-history.svg
---

## Context & objective

A cylinder at Re=150 sheds vortices; the simulation only shows it if you break the symmetry that keeps the wake attached. This project ran flow past a unit-diameter cylinder in ANSYS Fluent at two Reynolds numbers — steady at Re=40, transient at Re=150 — and the transient case produced a clean Kármán street with a measured Strouhal number of 0.155. The drag came out 29.3% below the experimental chart value, and the deficit traces to numerical dissipation on a deliberately coarse tutorial mesh.

This was the second CFD tutorial of the ESILV MMN1 module, done as a group of three. I set up the simulations, ran the monitors, and wrote the report; the numbers below come from that report and from the Fluent force exports, which I re-parsed for this article.

## Setup: two Reynolds numbers, one mesh

Both cases share one fluid domain and one quad mesh: 20,200 nodes, about 100 elements on the cylinder edge, within the tutorial requirement of 20,000 ±10%. The inlet is a uniform x-velocity (2 m/s for Re=40, 1 m/s for Re=150), the cylinder is a no-slip wall, and the domain is wide enough that the outer streamlines stay straight — the boundaries do not touch the wake. The physics change through velocity and viscosity only, with $\rho = 1$ kg/m³ and $D = 1$ m throughout.

| Case | $V$ [m/s] | $\mu$ [Pa·s] | Regime | Run |
|---|---:|---:|---|---|
| Re = 40 | 2 | 0.05 | steady, symmetric | 53 iterations to residuals $< 10^{-6}$ |
| Re = 150 | 1 | 0.00667 | transient, shedding | 400 steps × 0.2 s = 80 s |

For the transient run I refined the downstream region with Fluent's Adapt tool so the wake keeps some resolution as vortices convect out, and set the transient residual target to $10^{-3}$.

## The kick: breaking symmetry on purpose

A numerically perfect setup is symmetric: same mesh top and bottom, uniform inlet, no round-off asymmetry worth the name. Left alone, the Re=150 wake still destabilizes eventually, but "eventually" can eat most of an 80 s run. So I forced the issue.

After initialization, I patched a uniform $+0.2$ m/s y-velocity into the downstream quadrant $X > 0.5$ m, $Y > 0$ using Fluent's patch tool. The check is arithmetic: the patched region's peak velocity magnitude reads $\sqrt{1^2 + 0.2^2} \approx 1.02$ m/s, exactly what the initial contour showed. The patch seeds a cross-stream imbalance the flow already wants to amplify at this Reynolds number; it sets the phase of the first shedding cycle, not the frequency. The street that develops is the flow's own.

This is the piece of the setup I would defend in a review. The perturbation is large enough to act within a few convective times and small enough — 0.2 m/s against a 1 m/s free stream, 4% of the dynamic pressure — to leave no trace in the developed regime: once shedding locks in, the lift oscillation is centered on zero with symmetric amplitude, which a persistent artificial bias would distort.

## Steady Re=40: the symmetric baseline

The steady case is the control experiment. At Re=40 the flow is steady and perfectly symmetric about the centerline: the streamlines close into two stationary recirculation loops behind the cylinder, the vorticity field is antisymmetric (positive on top, negative on the bottom), and the lift is zero by symmetry — the pressure on the upper half cancels the lower half exactly.

The centerline velocity profile confirms the setup mechanically: velocity falls to zero at the front stagnation point, goes negative through the recirculation zone, and recovers to the 2 m/s free stream downstream.

The drag split at this Reynolds number:

| Component | Force [N] | Coefficient |
|---|---:|---:|
| Pressure | 2.0100 | 3.2816 |
| Viscous | 1.0615 | 1.7330 |
| **Total** | **3.0714** | **5.0146** |

Pressure already dominates, and that dominance is exactly where the error will live at Re=150.

## What the force history shows

![Lift and drag coefficient histories at Re=150, digitized from the archived Fluent monitors and verified against the exported force reports](/images/projects/fluent-cylinder-vortex/force-history.svg)

The lift history is the street's fingerprint. For an unsteady wake the number that matters is the Strouhal number, $St = fD/U$ — shedding frequency made non-dimensional — so the point of the history is to extract a period from it. After the impulsive start, $C_L$ grows through a short transient and locks into a regular oscillation about zero with amplitude $\pm 0.117$ — vortices shedding alternately from the top and bottom surfaces.

Counting upward zero-crossings in the developed regime ($t > 40$ s) gives a mean period of 6.44 s over six cycles, so $f = 0.155$ Hz and $St = 0.155$.

The drag history shows the start-up spike (an artifact of the impulsive start), then settles to a mean near 0.9. In the full-resolution Fluent monitor the drag oscillates at twice the lift frequency — each lift cycle passes two vortices — but the archived drag screenshot spans 0–7 N and the ripple is roughly 0.01 N, below the pixel scale of the image. The regenerated figure therefore shows the settled mean rather than the 2× ripple; I flag that rather than redraw what the pixels cannot support.

The mechanism is visible in the pressure field: each shed vortex is a travelling low-pressure core, and because the cores alternate between the upper and lower wake, they pull the cylinder up and down in turn. That is the oscillating lift, read straight off the contours.

One provenance note. The raw Fluent monitor text exports were not retained from the tutorial; what survives is two force reports (final time step) and screenshots of the monitors. The figure above is digitized from those screenshots, with the endpoints verified against the force reports: digitized final $C_L$ of 0.075 against the report's 0.069, digitized final drag of 0.555 N against the report's 0.565 N. The regeneration script treats these checks as hard gates.

## The 29% drag error

The featured result is a failure, quantified. At the final time step Fluent reports:

| Component | Force [N] | Coefficient |
|---|---:|---:|
| Pressure | 0.4385 | 0.7159 |
| Viscous | 0.1269 | 0.2072 |
| **Total** | **0.5654** | **0.9231** |

The experimental chart value at Re=150 is $C_D \approx 1.6$, a drag force of 0.8 N under the run conditions. The simulation lands 29.3% low. Pressure drag is 78% of the total, so the shortfall lives in the pressure field: base suction behind the cylinder is too shallow.

The steady case fails the same way. At Re=40 the computed drag is 3.07 N against 4.2 N from the chart ($C_D \approx 2.1$), an error of 26.9%. Two Reynolds numbers, same direction, same magnitude of error — that is a systematic bias, so the explanation has to live in the discretization. It does: a coarse mesh with a loose transient tolerance ($10^{-3}$, and the continuity residual plateaued just above it) dissipates.

The shedding vortices lose strength as they form, the low-pressure cores in the wake fill in, and the pressure difference across the cylinder shrinks. A converged residual history is evidence the solver finished; the 29% gap is evidence the mesh and tolerances were not good enough.

Parsing the exports turned up a second, quieter trap. Both force reports imply the same coefficient conversion: $C_D = F_D / 0.6125$, while $\frac{1}{2}\rho U^2 D$ evaluates to 2.0 for the Re=40 run and 0.5 for the Re=150 run. Fluent's reference values were set once and did not follow the run conditions, so comparing the reported *coefficients* against a textbook chart mixes reference definitions. The comparisons above are done on forces, where the reference area cancels — the only defensible level for this data.

## Iteration: how the error estimate converged

The 29.3% figure was not the first answer. The group's Word draft read the experimental chart at $Re=150$ as $C_D \approx 1.2$, put the gap at 23.8%, and explained it with the standard pair: an instantaneous value against a time-averaged chart, and a 2-D simulation against a 3-D experiment. Both explanations are true in general and predicted nothing here. The submitted report re-read the chart at $\approx 1.6$, recomputed the gap from the final-step force (0.5654 N against 0.8 N), and landed on 29.3% with a diagnosis that does make predictions: the deficit lives in pressure drag (78% of the total), and it should repeat at $Re=40$.

It does, at 26.9% — which is what promoted dissipation from excuse to explanation.

The steady case failed the same way in miniature. The draft matched the *pressure* coefficient 3.2816 to a chart reading of 3.28, declared agreement, and dismissed the total 5.0146 as a reference-values default. The chart plots total drag, so the agreement was a coincidence of definitions. The fix was structural: compare forces, where the reference values cancel — the rule the rest of this article follows.

The draft also settled the provenance question by accident. Two of its sections quote two different "final" drags for the same run — 0.5654 N in one, 0.5601 N ($C_D = 0.9145$) in the other — because two people read the monitor at different instants of a shedding cycle. The submitted report standardized on the exported final-step force reports, and the digitization gates above exist to hold the figures to that standard.

## Verification

| Check | Result |
|---|---|
| Steady convergence | 53 iterations, all residuals $< 10^{-6}$ |
| Transient residuals (Re=150) | x/y-velocity $< 10^{-3}$ each step; continuity plateaus just above $10^{-3}$, bounded and periodic |
| Mass conservation (Re=40) | inlet–outlet imbalance $5.84 \times 10^{-9}$ kg/s |
| Digitized vs reported final $C_L$ | 0.075 vs 0.069 (gate: $< 0.02$) |
| Digitized vs reported final drag | 0.555 N vs 0.565 N (gate: $< 0.03$ N) |
| Coefficient conversion consistency | $F/C_D = 0.6125$ in both reports (gate: $< 0.1\%$) |
| Shedding period regularity | six cycles, std 0.03 s |

## Street development

Four frames from the report's y-velocity animation show the sequence the force history compresses into curves. Report figures, copied as archived. One caveat carried over from the report: the vorticity contours in the original document plot magnitude, so clockwise and counter-clockwise cores render in the same colors — the alternating arrangement is visible, the opposite rotation directions are masked.

<div class="grid gap-3 sm:grid-cols-2">
  <figure>
    <img src="/images/projects/fluent-cylinder-vortex/animation-0001.png" alt="Initial nearly symmetric cylinder wake after the impulsive start" loading="lazy">
    <figcaption>1. Initial transient: separation is still nearly symmetric.</figcaption>
  </figure>
  <figure>
    <img src="/images/projects/fluent-cylinder-vortex/animation-0002.png" alt="Cylinder wake beginning to roll up after the imposed asymmetry" loading="lazy">
    <figcaption>2. The velocity kick seeds the first uneven roll-up.</figcaption>
  </figure>
  <figure>
    <img src="/images/projects/fluent-cylinder-vortex/animation-0003.png" alt="Alternating cylinder-wake structures detaching downstream" loading="lazy">
    <figcaption>3. Alternating structures detach from each side.</figcaption>
  </figure>
  <figure>
    <img src="/images/projects/fluent-cylinder-vortex/animation-0004.png" alt="Developed staggered Karman vortex street" loading="lazy">
    <figcaption>4. The wake reaches a developed staggered street.</figcaption>
  </figure>
</div>

## Limitations

One mesh, no refinement study, so the 29% bias is diagnosed but not bounded. One time step (0.2 s, about 32 steps per shedding period), no temporal refinement check. The continuity residual plateaued above the $10^{-3}$ target; I accepted it because the maxima stayed bounded and periodic, but a tighter run would cost little and answer more. The force history is digitized from screenshots because the raw monitor exports were not kept — endpoints match the force reports, but sub-pixel features like the 2× drag ripple are lost.

The Strouhal estimate rests on six cycles. The laminar solver is the right model at Re=150 — the wake is laminar — but the mesh does not resolve the boundary layer that sets the separation points.

## Reproduce

Download the [self-contained reproduction bundle](/downloads/fluent-cylinder-vortex-reproduction.zip), unzip it, then run `python3 -m pip install -r requirements.txt` and `python3 scripts/rebuild.py`. The bundle contains the retained lift/drag CSVs, source register and rebuild script; it recomputes the shedding period and $St$, checks the final lift, keeps the 29.3% drag gap visible, writes `results/reproduction.json`, and regenerates the force-history SVG. It exits nonzero if any gate fails.

The earlier acquisition script (`research/esilv-cfd/plot_vortex_forces.py`) digitised the archived Fluent monitors and cross-checked their endpoints against the private final force reports. Those originals are hashed in the private ESILV archive; they are not required for the public rebuild.

## What I took away

The first explanation of a discrepancy is usually a list of generic CFD excuses; ours were "instantaneous vs averaged" and "2D vs 3D", and neither survived contact with the force split. The dissipation story did, because it says where the error lives (pressure, 78% of the total) and where else it should appear ($Re=40$, 26.9%).

I also learned to treat a matching number as a suspect: pressure $C_D$ of 3.2816 against a chart's 3.28 felt like validation and was a definition error, so comparing forces first — where reference values cancel — is now my default.