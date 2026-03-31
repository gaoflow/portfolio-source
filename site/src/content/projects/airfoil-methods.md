---
title: 'I Compared Two Airfoil Models with NASA—and the Simpler One Was Closer'
year: 2026
date: '2026-02-28'
status: complete
categories: [validation, tooling]
tags: [CFD]
summary: 'I used one NACA 0012 case to show, step by step, what thin-airfoil theory and a Hess–Smith panel method can predict. The simpler model matched NASA’s linear lift slope more closely; the pressure and drag results explain why the more detailed model is still useful—and where both models fail.'
role: 'Aerodynamic methods & validation'
duration: 'Independent study'
featured: false
order: 7
studySequence: 8
heroImage: /images/projects/airfoil-methods/source/nasa-ltpt-exterior-1971.jpg
github: 'https://github.com/gaoflow/airfoil-methods'
---

## Why I built a small model before running more CFD

My starting problem was practical. A three-dimensional RANS calculation for a race-car wing can take hours, and a design study may contain dozens of candidate sections, angles, and mesh settings. I did not want to spend those hours only to discover that the geometry had the wrong sign, the expected lift scale was unreasonable, or the pressure loading looked obviously wrong.

So I went back to two much cheaper methods:

- thin-airfoil theory, which reduces the airfoil to a line and gives a lift estimate almost immediately;
- a Hess–Smith panel method, which keeps the airfoil shape and calculates pressure around its surface.

I then compared both models with one public wind-tunnel series for the NACA 0012 airfoil. My question was not “Which method wins?” It was: **what question can each method answer honestly before I need viscous CFD?**

## The whole project in one 4.18° example

Before describing the solver, it helps to look at one ordinary data point.

NACA 0012 is a symmetric airfoil: the first two digits, `00`, mean it has no camber, and `12` means its maximum thickness is 12% of the chord. An angle of attack of $4.18^\circ$ means that the incoming flow meets the chord line at a small upward angle.

At that angle, all three comparisons use the same Mach number, $M=0.15$. The NASA measurement also has a Reynolds number of $5.97\times10^6$ and free boundary-layer transition.

| At $\alpha=4.18^\circ$ | Lift coefficient, $C_l$ | Difference from NASA |
|---|---:|---:|
| NASA wind tunnel | 0.4520 | — |
| Thin-airfoil theory + compressibility correction | 0.4636 | +2.6% |
| Hess–Smith panel method + compressibility correction | 0.5096 | +12.8% |

The lift coefficient is not a force by itself. It is the force after removing air density, speed, and reference area:

$$
L=\frac{1}{2}\rho V^2 S C_l.
$$

That is why I can compare a formula, a numerical model, and a wind-tunnel test using the same dimensionless number.

The result already contains the main lesson. The one-line theory is closer to the measured lift at this angle. The panel method is less accurate for this single number, but it can also show *where* low and high pressure occur on the airfoil. That extra information is the reason to keep it.

## What I actually did

I kept the workflow small enough that every step could be checked:

1. I transcribed one internally consistent set of NASA measurements instead of mixing points from different tests.
2. I generated the NACA 0012 coordinates from the standard four-digit geometry equation.
3. I calculated lift with thin-airfoil theory.
4. I built a Hess–Smith source-and-vortex panel solver and integrated its surface pressure.
5. I checked symmetry, zero-angle lift, pressure drag, and panel refinement before looking at agreement with NASA.
6. I compared the models first in the nearly linear lift range, then at high angle of attack and in drag—the places where inviscid assumptions should become visible.

This order mattered. If I had started by comparing curves, a coding error, an under-resolved surface, and missing physics could all have looked like the same “model error.”

## I chose one wind-tunnel series and did not mix conditions

The experimental reference is Table I of Charles L. Ladson’s [NASA TM-4074](https://ntrs.nasa.gov/citations/19880019495). The report contains a large NACA 0012 database covering several Mach numbers, Reynolds numbers, and transition settings. I used only the 16-point free-transition series at $M=0.15$ and $Re=5.97\times10^6$, from $-4.05^\circ$ to $17.35^\circ$.

The opening photograph shows the Langley Low-Turbulence Pressure Tunnel in 1971, a few years before this NACA 0012 test programme. NASA’s [facility history](https://www.nasa.gov/history/low-turbulence-pressure-tunnel-building-582a/) identifies it as photograph L-71-6093. The large pressure shell allowed the tunnel to vary Reynolds number without changing Mach number in lockstep.

Those conditions need some explanation:

- Mach number compares flow speed with the speed of sound. At $M=0.15$, compressibility is small but not exactly zero, so I applied a Prandtl–Glauert correction to both inviscid models.
- Reynolds number compares inertia with viscosity. It influences the boundary layer, transition, drag, and separation, even though the two models in this project do not solve those viscous effects.
- Free transition means NASA did not force the boundary layer to become turbulent at a fixed chordwise position.

I copied the values from the table rather than digitising a plotted curve. Lift and pitching moment in the report came from integrated surface pressures; drag came from a wake survey. That distinction becomes important later because my panel method also integrates pressure, but it has no viscous wake.

The TM-4074 model spanned the tunnel between rotating circular sidewall plates. The small end view in the drawing shows the NACA 0012 section and its quarter-chord mounting point.

![NASA TM-4074 drawing of the NACA 0012 model mounted between the wind-tunnel sidewalls](/images/projects/airfoil-methods/source/nasa-tm4074-airfoil-mount.png)

*NASA TM-4074, figure 1: NACA 0012 model installation*

A separate NASA Langley NACA 0012 model makes the measurement hardware easier to see. The small holes near midspan are pressure orifices, and the tube bundles carry those pressures to the instruments. This model came from another NASA test, so it is not the larger TM-4074 model or the source of the data used here.

![NASA Langley photograph of a pressure-tapped NACA 0012 wind-tunnel model and its tubing](/images/projects/airfoil-methods/source/nasa-naca0012-pressure-tap-model.webp)

*NASA Langley pressure-tapped NACA 0012 model*

The photograph comes from [NASA NTRS 19880005556](https://ntrs.nasa.gov/citations/19880005556), printed page 233.

NASA reports repeatability at zero angle of 0.0002 in $C_d$, 0.004 in normal-force coefficient, and 0.0002 in moment coefficient. Repeatability tells me how closely repeated measurements agreed; it is not the same as a complete uncertainty estimate for every point. I therefore use NASA as the experimental reference, not as an error-free truth source.

## Model 1: turn the airfoil into one line

For a symmetric airfoil, thin-airfoil theory gives

$$
C_l=2\pi\alpha,
$$

with $\alpha$ in radians. At $4.18^\circ$, the incompressible result is 0.4584. The Prandtl–Glauert factor at $M=0.15$ is 1.0114, which raises the estimate slightly to 0.4636.

This model is useful precisely because it is so stripped down. It gives me a sign, a scale, and a linear lift slope. It does not know that NACA 0012 is 12% thick. It cannot tell me the surface pressure, drag, transition point, or stall angle.

I treat it as a first arithmetic check, not as a small CFD solver.

## Model 2: replace the smooth surface with short straight panels

The panel method keeps the NACA 0012 outline. I split the upper and lower surfaces into 160 straight segments, with more points near the leading and trailing edges where the geometry and pressure change quickly.

The implementation follows the source-and-circulation family introduced by Hess and Smith. In plain language, I ask the solver to find two things:

- one source strength on each panel, which keeps flow from passing through the solid surface;
- one shared vortex-sheet strength, which supplies the circulation needed to create lift.

At the midpoint of every panel, the velocity normal to the surface must be zero. At the trailing edge, I apply a Kutta condition so the upper- and lower-surface flow leaves consistently instead of wrapping around the sharp edge. These conditions form one linear system, which I solve for the unknown strengths.

I evaluated the influence of one panel on another using 12-point Gauss–Legendre quadrature. A panel acting on its own midpoint is singular, so I used the analytical half-jump term instead of asking numerical quadrature to integrate through the singularity.

Once I have the tangential surface velocity, I calculate pressure coefficient from

$$
C_p=1-\left(\frac{V_t}{V_\infty}\right)^2.
$$

Lower $C_p$ means stronger suction. Integrating that pressure around the airfoil gives lift, pressure drag, and quarter-chord pitching moment.

![Upper- and lower-surface pressure coefficients from the panel method at 4.18 degrees](/images/projects/airfoil-methods/pressure-distribution.svg)

*Surface pressure coefficient at 4.18°*

The vertical axis is inverted by aerodynamic convention, so stronger suction appears higher. At positive angle of attack, the upper surface carries the stronger suction. This pressure distribution is the panel method’s main extra value. Thin-airfoil theory gave me one lift number; the panel method lets me inspect how the loading is distributed along the chord.

## I checked the implementation before judging the physics

I first checked whether the generated outline closed at the trailing edge, stayed symmetric, and reached 12% thickness. At zero angle, the symmetric airfoil produced lift indistinguishable from zero. Its pressure drag also stayed near zero, which is the expected inviscid result.

Then I changed the surface from 40 to 80, 160, and 240 panels. At $4^\circ$, the lift values were 0.48646, 0.48727, 0.48773, and 0.48788. Moving from 160 to 240 panels changed $C_l$ by only 0.0307%.

![Lift coefficient at 4 degrees as the panel count increases from 40 to 240](/images/projects/airfoil-methods/panel-refinement.svg)

*Lift coefficient at 4° as panel count increases*

This check answers a narrow but important question: was the later disagreement with NASA mainly caused by using too few panels? The answer was no. It does not mathematically prove that every line of the solver is correct, but it makes panel count a very unlikely explanation for a 13.83% lift-slope error.

More panels can converge the same inviscid equations more tightly. They cannot repair a wrong Kutta condition, and they cannot add viscosity or separation to equations that do not contain them.

## The simpler model was closer over the full linear range

I fitted a straight line to the declared comparison range, $-4.1^\circ\leq\alpha\leq10.2^\circ$.

| Result | NASA | Thin airfoil + P–G | Hess–Smith + P–G |
|---|---:|---:|---:|
| Lift slope per degree | 0.10684 | 0.11092 | 0.12162 |
| Slope error | — | 3.81% | 13.83% |
| Linear-range $C_l$ RMSE | — | 0.0226 | 0.0824 |

![NASA lift measurements compared with thin-airfoil theory and the Hess–Smith panel method](/images/projects/airfoil-methods/lift-validation.svg)

*NASA lift measurements and two inviscid predictions*

I had expected the geometry-resolved model to win. It did not. Thin-airfoil theory was closer to the measured integral lift slope, even though it ignored thickness entirely.

The conclusion is not that panel methods are useless. It is that extra model detail only helps when that detail addresses the output I care about. The panel method added a pressure distribution and geometry sensitivity. It did not add the viscous boundary-layer effects that influence the measured lift slope.

## High angle of attack exposed the missing physics

Across all 16 NASA points, the panel-model lift RMSE increased from 0.082 in the linear range to 0.225.

At $17.35^\circ$, NASA measured $C_l=1.660$, while the panel model predicted 2.085. The measured curve was already bending away from the inviscid straight-line trend, but the panel solution kept climbing because it has no boundary layer and no way to separate the flow from the surface.

This dataset ends at $17.35^\circ$ and the listed lift has not yet fallen, so it does not show a complete post-stall curve. I therefore use it to demonstrate high-angle nonlinearity and the growing influence of separation—not to claim that I measured the exact stall angle.

This is a model-form limit. Refining the surface only gives a more precise answer to the inviscid problem. Predicting the real high-angle behaviour requires a method that includes viscosity, transition, and separation.

## Near-zero pressure drag was a warning, not a good prediction

The mismatch is even clearer in drag. Near zero lift, NASA measured $C_d$ around 0.0065. At $17.35^\circ$, it measured 0.0275. The panel method’s pressure drag stayed below 0.0008 over the plotted range.

NASA measured drag with a rake downstream of the model. Its closely spaced probes sampled the momentum loss through the wake, which an inviscid panel method does not contain.

![NASA TM-4074 drawing of the wake-survey rake behind the airfoil](/images/projects/airfoil-methods/source/nasa-tm4074-wake-rake.png)

*NASA TM-4074, figure 2: wake-survey rake*

![NASA wake-survey drag compared with the panel method's near-zero pressure drag](/images/projects/airfoil-methods/drag-blind-spot.svg)

*NASA drag measurements and panel-method pressure drag*

This is d’Alembert’s paradox in a practical plot: ideal, steady, inviscid potential flow produces no net drag on a closed body. The small non-zero panel values are discretisation error, not a prediction of real aerodynamic drag.

At the simple $4.18^\circ$ example, NASA measured $C_d=0.0076$, while the panel pressure drag was about 0.00021. A result can therefore look numerically clean and still answer the wrong physical question.

## What I would use each method for

| Method | What I trust it to do | What I would not ask it to do |
|---|---|---|
| Thin-airfoil theory | Check lift sign, rough linear lift slope, and order of magnitude | Surface pressure, thickness effects, drag, or high-angle behaviour |
| Hess–Smith panel method | Check a single-element 2D geometry, inspect $C_p$, compare inviscid loading, and calculate integrated inviscid loads | Skin-friction drag, transition, separated flow, stall, or a multi-element wing without extending the formulation |
| NASA wind-tunnel series | Show measured NACA 0012 behaviour at this exact Mach, Reynolds number, and transition condition | Stand in for another airfoil, another Reynolds number, or a three-dimensional race-car wing |

For early design work, I would use the two low-order models as filters and debugging tools. They can reject a reversed geometry, a wrong angle convention, an implausible lift scale, or an extreme pressure spike before I build a costly mesh.

I would not use this code to rank candidate sections by real drag or stall margin. I would also not claim that this single-element solver directly handles an FSAE multi-element wing. Those jobs need a formulation built for multiple elements and, for drag and separation, a viscous method with suitable grid and model-sensitivity studies.

## What this project does not prove

This comparison covers one symmetric airfoil, one Mach number, one Reynolds number, and one transition condition. It does not validate cambered sections, rough surfaces, laminar separation bubbles, flap gaps, ground effect, or three-dimensional wings.

The tests check useful behaviours, but they are not a formal proof of the solver. Agreement at zero angle and convergence with panel count could still coexist with a shared modelling or implementation mistake. The external NASA comparison reduces that risk, while the pressure and drag failures make the remaining capability boundary visible.

My strongest conclusion is therefore modest: the code is useful as a fast inviscid checking tool within the demonstrated range. It is not a replacement for viscous analysis or experiments.

## Code and reproduction

The source code is open source on GitHub: [gaoflow/airfoil-methods](https://github.com/gaoflow/airfoil-methods)

```bash
git clone https://github.com/gaoflow/airfoil-methods.git
cd airfoil-methods
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
```

The analysis script regenerates the metrics and figures. It exits with an error if the geometry, linear-lift comparison, panel-refinement check, or explicit drag blind-spot check falls outside the declared limits.

## References—and what each one supports

1. Charles L. Ladson, [*Effects of Independent Variation of Mach and Reynolds Numbers on the Low-Speed Aerodynamic Characteristics of the NACA 0012 Airfoil Section*](https://ntrs.nasa.gov/citations/19880019495), NASA TM-4074, 1988. I use Table I for the 16 measured lift, drag, and moment points and the report text for the tunnel conditions and repeatability statement.
2. J. L. Hess and A. M. O. Smith, [*Calculation of Potential Flow About Arbitrary Bodies*](https://www.sciencedirect.com/science/article/pii/0376042167900036), *Progress in Aerospace Sciences*, volume 8, 1967, pages 1–138. This is the historical method reference for representing a body with distributed singularities; it does not validate my particular implementation, which is why I also kept behavioural tests and the NASA comparison.
