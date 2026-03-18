---
title: 'Heat Diffusion 2-D — Explicit FTCS with a Hard Stability Gate'
year: 2026
date: '2026-02-07'
status: complete
categories: [validation]
tags: [CFD]
summary: 'My explicit FTCS heat-diffusion solver matches the analytical slab transient to 1.38e−5 and refuses any run outside its r≤0.25 stability bound.'
role: 'Numerical methods & validation'
duration: 'Independent study'
featured: false
order: 15
studySequence: 7
heroImage: /images/projects/heat-diffusion-2d/temperature-field.svg
---

## Origin: a tiny time-step increase blew the field into NaN

The origin of this solver was a coding session where I slightly increased the time step $\Delta t$. For the first dozens of steps, the transient cooling plate looked plausible; at step 100, the temperature field instantaneously blew up into a screen full of NaNs.

That experience demonstrated that the Von Neumann stability boundary ($r \le 0.25$) is an unforgiving physical constraint, not mere textbook theory.

To understand exactly why explicit solvers explode beyond this threshold, and how to isolate pure temporal error from spatial discretization, I built this guarded 2D explicit FTCS heat diffusion solver.

## How I updated the temperature

I used a uniform Cartesian grid of square, cell-centred control volumes. I wrote the explicit FTCS update as differences between the four face fluxes:

$$
\begin{aligned}
T_{j,i}^{n+1}
&=T_{j,i}^{n}
+r\big[
\Delta T_{x,\,i+1/2}
-\Delta T_{x,\,i-1/2}\
&\qquad+
\Delta T_{y,\,j+1/2}
-\Delta T_{y,\,j-1/2}
\big],
\qquad
r=\frac{\alpha\Delta t}{\Delta x^2}.
\end{aligned}
$$

Writing the update this way makes conservation structural. The same interior-face contribution leaves one cell and enters its neighbour, so the contributions cancel in pairs when I sum over the whole grid.

For fixed-temperature boundaries, I used a linear ghost cell. For insulated boundaries, I set the normal face flux to exactly zero instead of copying a boundary temperature.

Von Neumann analysis gives the amplification factor

$$
g=1-4r\left[
\sin^2\left(\frac{k_x\Delta x}{2}\right)
+\sin^2\left(\frac{k_y\Delta y}{2}\right)
\right].
$$

On a square two-dimensional grid, the explicit stability limit is therefore

$$
r\leq0.25.
$$

## Why the solver rejects unstable input

The most dangerous behaviour for an explicit solver is not an immediate error. It is a run that appears reasonable for hundreds of steps before the temperature begins to diverge.

I therefore check $r$ before allocating the time arrays or starting the integration. If a user requests $r=0.26$, `check_stability` raises `StabilityError` and records the reason for the refusal. The solver does not generate a result that initially looks plausible and then blows up.

I treat this as part of the solver’s input contract, not as an optional warning.

## Comparing the solver with an analytical transient

My reference case was a slab with a uniform initial temperature. The west face was held at a fixed temperature, while the other three faces were insulated. I used a $100\times20$ grid, $r=0.2$, and a final time of 0.05 s.

The one-dimensional analytical transient is represented by the Fourier series

$$
\begin{aligned}
\theta(x,t)
&=\sum_{n=0}^{\infty}
\frac{4}{(2n+1)\pi}
\sin(\lambda_n x)
e^{-\alpha\lambda_n^2t},\
\lambda_n
&=\frac{(2n+1)\pi}{2L}.
\end{aligned}
$$

I truncated the series when the remaining term envelope fell below $10^{-14}$. Since $|\sin|\leq1$, this also bounds the neglected tail.

At $t=0.05$ s, the maximum difference between the numerical and analytical temperatures was

$$
L^\infty=1.384\times10^{-5},
$$

which was below my predefined requirement of $5\times10^{-5}$. Because the upper and lower boundaries were insulated, the two-dimensional solution remained exactly uniform in the transverse direction.

## Why my first temporal-refinement plan was wrong

FTCS is first-order accurate in time and second-order accurate in space. My initial plan was to keep the grid fixed, reduce the time step, and compare every result directly with the analytical solution.

That comparison would not isolate temporal accuracy. The leading error contains the coupled term

$$
\frac{\alpha\Delta x^2}{12}(6r-1)\,\frac{\partial^4T}{\partial x^4}.
$$

Because its coefficient depends on $r$, changing the time step also changes how the spatial truncation error appears in the total error. A direct comparison with the analytical solution would therefore mix spatial and temporal effects and could assign spatial error to the time integrator.

I corrected the study by using a fine-time numerical solution on the same grid as the reference. I set the reference to $r=10^{-3}$ and compared it with runs at

$$
r\in\{0.20,\ 0.10,\ 0.05,\ 0.025\}.
$$

The shared spatial error largely cancels when solutions on the same grid are differenced. The observed temporal order was 1.017, consistent with first-order time integration.

![Error versus time step with a first-order reference line](/images/projects/heat-diffusion-2d/temporal-refinement.svg)

## Separate checks for conservation and indexing errors

The analytical transient does not test every part of the implementation independently, so I added two more targeted checks.

First, I ran a grid with insulated boundaries on every side. After 576 steps, the drift in discrete total energy was 0.0. This directly checks that interior fluxes cancel in pairs and that no energy enters or leaves through the boundaries.

Second, I used a discrete cosine mode on the insulated grid. This mode is an exact eigenvector of the discrete FTCS operator, with theoretical per-step amplification

$$
g=1-4r\sin^2\left(\frac{\pi}{2n_x}\right).
$$

The solver reproduced this amplification factor to $10^{-14}$. This test can expose sign or indexing mistakes that might appear only as an unclear change in the error constant during a comparison with the analytical solution.

## Results I retained

| Check | Observed result | Requirement |
|---|---:|---:|
| Maximum error against the analytical series at $t=0.05$ s | $1.384\times10^{-5}$ | $\leq5\times10^{-5}$ |
| Temporal order on a fixed grid | 1.017 | 0.9–1.1 |
| Energy drift after 576 steps on an insulated grid | 0.0 | $\leq10^{-12}$ |
| Attempted run at $r=0.26$ | Refused and logged | Must refuse |
| Transverse variation in the two-dimensional field | 0.0 | $<10^{-14}$ |

Each check answers a different question. The analytical solution checks the overall temperature field and boundary treatment. The fine-time reference isolates temporal order. The insulated case checks conservation. The discrete mode checks signs and indexing. The stability gate verifies that invalid input is rejected before integration begins.

## Limits and further work

The explicit scheme requires

$$
\Delta t\propto\Delta x^2
$$

to remain within $r\leq0.25$. As the grid is refined, the number of required time steps therefore grows quickly. The 0.05 s production validation required 2500 steps.

The current model supports only constant isotropic diffusivity, uniform Cartesian grids with square cells, fixed-temperature boundaries, and zero-flux boundaries. It does not include advection, heat sources, phase change, non-uniform materials, or non-uniform grids.

Extending the solver beyond these limits would require new numerical treatment and new validation cases rather than assuming that the present checks still apply unchanged.



## Practical applications: transient thermal diffusion in inverter modules and battery cold plates

During hard acceleration or peak discharge bursts, inverter IGBT modules and battery cold plates face rapid transient heat spikes (e.g. 6.0 kW peak over 10 seconds). Steady-state models fail to capture this heat accumulation.

This 2D explicit solver computes transient heat spreading and diffusion delays, while its automated $r \le 0.25$ Von Neumann stability guards and temporal order validation prevent subtle numerical blowups during transient thermal screening.

## What I learned

I originally expected temporal refinement to be a straightforward comparison with the analytical solution. Deriving the truncation term first showed that the comparison would not isolate the error I wanted to measure. Replacing the analytical reference with a fine-time result on the same grid allowed me to measure temporal order without folding the shared spatial error into it.

I also learned to treat refusal as a valid numerical result. Rejecting the $r=0.26$ case is part of correct solver behaviour; the user should not have to discover an invalid time step only after the solution diverges.

## Code and reproduction

The source code is open source on GitHub: [gaoflow/heat-diffusion-2d](https://github.com/gaoflow/heat-diffusion-2d)

```bash
git clone https://github.com/gaoflow/heat-diffusion-2d.git
cd heat-diffusion-2d
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
```
