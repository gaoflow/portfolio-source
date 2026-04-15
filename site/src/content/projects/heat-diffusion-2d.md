---
title: 'From Melting Snow on Paving Stones to a Heat Diffusion Solver'
year: 2026
date: '2026-02-07'
status: complete
categories: [validation]
tags: [CFD]
summary: 'One day I caught myself staring at the snow on the paving stones and noticed it melts in a curious, regular pattern, so I dug into why and wrote a 2-D FTCS heat diffusion solver.'
role: 'Numerical methods & validation'
duration: 'Independent study'
featured: false
order: 15
studySequence: 7
heroImage: /images/projects/heat-diffusion-2d/thermal-spreading-infrared.jpg
github: 'https://github.com/gaoflow/heat-diffusion-2d'
---

## It started with snow on paving stones

Paris had a few heavy snowfalls this winter. One day, as I stood staring at the snow on the paving stones, I suddenly noticed a strange pattern in how it melts: the snow over the stones often melts before the snow on the surrounding soil, clearly tracing the outline of every slab. I went back and looked up the reason. Stone and soil conduct heat differently, so the heat stored underground travels up through the slabs faster, and the surface temperature ends up uneven.

![A street in Paris during snowfall](/images/projects/heat-diffusion-2d/paris-snow-video-frame.jpg)

I found this mechanism interesting, and it shows up in other engineering situations too. A heat spreader under a chip or a cooling plate under a battery pack works the same way: a local heat source first concentrates heat in one spot, and conduction through the solid slowly flattens it out. But real melting snow also involves latent heat, uneven snow thickness, and messy material interfaces. Too many variables, too complicated to start with. So I reduced it to a simpler problem to study first: a 2-D metal plate cooled on one side.

## The simplified model: a plate cooled on one side

The reduced model is this: a 2-D metal plate with a uniform initial temperature $T=1$. At $t=0$, the left edge is pressed against a cold source held at $T=0$. The other three edges are fully insulated, so heat inside the plate can only escape through the left side, the one open channel.

I also non-dimensionalized the problem, so the results can be scaled proportionally to any real working condition. The model keeps the core physics of the snow problem — heat diffusing through a solid over time, gradually flattening temperature differences — but drops latent heat, complex geometry, and material interfaces. And it has an exact Fourier series solution, so I can pull out the numerical solution at any moment and check it point by point.

## The solver crashed

I wrote a 2-D explicit heat diffusion (FTCS) solver to watch how the temperature field inside a plate evolves step by step when one side is cooled. The program ran smoothly at first. To make the computation a bit faster, I casually increased the time step $\Delta t$ by a little. For the first few dozen steps, the temperature plot looked very smooth and natural, and the cooling process looked completely reasonable. But a few dozen steps later, the entire numerical matrix collapsed within a few steps and the screen filled with NaN.

What I kept thinking about was this: before diverging, it had produced dozens of seemingly normal, smooth steps. If a numerical algorithm does not fail immediately on its way to collapse, then in a more complex engineering problem, how do we know whether the plot in front of us is right, or already on its way to breaking? To work out why a transient solver suddenly loses control, how to block dangerous parameters before the computation starts, and how to measure temporal accuracy out of mixed errors, I started this investigation.

## 1. Analysing the problem

I first went back to the 2-D heat diffusion equation and the discrete update formula itself:

$$
\frac{\partial T}{\partial t} = \alpha \left( \frac{\partial^2 T}{\partial x^2} + \frac{\partial^2 T}{\partial y^2} \right)
$$

On a square grid ($\Delta x = \Delta y$), the forward-time centred-space (FTCS) algebraic update is:

$$
T_{j,i}^{n+1} = T_{j,i}^{n} + r \left[ (T_{j,i+1}^{n} - 2T_{j,i}^{n} + T_{j,i-1}^{n}) + (T_{j+1,i}^{n} - 2T_{j,i}^{n} + T_{j-1,i}^{n}) \right]
$$

with the dimensionless diffusion number:

$$
r = \frac{\alpha \Delta t}{\Delta x^2}
$$

Why does a larger time step make the program blow up? A Von Neumann stability analysis decomposes the numerical error at any spatial wavelength into Fourier modes and gives the error amplification factor $g$ of a single step:

$$
g = 1 - 4r \left[ \sin^2\left(\frac{k_x \Delta x}{2}\right) + \sin^2\left(\frac{k_y \Delta x}{2}\right) \right]
$$

To keep the computation from diverging, every spatial mode must satisfy $|g| \le 1$. The most dangerous mode, and the easiest one to excite, is the highest-frequency zigzag oscillation at grid scale (neighbouring cells alternating in sign, $\sin^2 = 1$). Substituting this limit case gives the worst-mode amplification factor:

$$
g_{\text{worst}} = 1 - 8r
$$

Requiring $g_{\text{worst}} \ge -1$ gives the hard stability limit of the 2-D explicit FTCS scheme:

$$
r \le 0.25
$$

This explains the root cause of the crash: $r \le 0.25$ is a purely numerical stability limit. Once the time step is a little too large and $r$ becomes 0.26, high-frequency numerical noise gets multiplied at every step by an amplification factor whose absolute value is above 1 ($|g| = 1.08$).

Why did the first few dozen steps look smooth? Because the initial floating-point rounding noise in a computer is extremely small (about $10^{-16}$). Even multiplied by 1.08 each step, by step 50 the noise has only grown to about $10^{-14}$, and the smooth main solution completely covers it. But with exponential growth, past step 100 the noise quickly inflates to the same order of magnitude as the main solution, and within the next few steps it overflows straight into NaN.

![How the worst-mode amplification factor varies with the diffusion number](/images/projects/heat-diffusion-2d/stability-limit.svg)

*The dashed line is the FTCS theoretical stability limit r=0.25; the validation run uses the safe r=0.20*

## 2. Searching the problem

After confirming the theoretical root cause, I searched the relevant literature and industrial practice, focusing on two key questions.

First, how do industrial-grade solvers handle the stability boundary? After reading classic computational heat transfer and CFD references, I found that many teaching scripts and basic tools, when given unsafe input, either run no check at all and let the program diverge, or just print one Warning line to the terminal and keep computing. In an automated engineering pipeline, this easily lets diverged garbage data flow into downstream modules. A reliable design must run a strict defensive check before any computation happens.

Second, how do you verify the first-order accuracy ($O(\Delta t)$) of the time integrator on its own? My first idea was to keep the spatial grid fixed, try different $\Delta t$, and difference the computed results against the Fourier analytical solution to measure the convergence order. But while reading the literature derivations of discretization truncation error, I found that the leading local truncation error of the FTCS scheme is:

$$
\tau = \frac{\alpha \Delta x^2}{12}(6r - 1) \frac{\partial^4 T}{\partial x^4} + \mathcal{O}(\Delta t^2) + \mathcal{O}(\Delta x^4)
$$

The coefficient $(6r - 1)$ of the first term is tightly bound to the diffusion number $r = \alpha \Delta t / \Delta x^2$. When you change $\Delta t$ on a fixed grid, $r$ changes with it, and the weight of the spatial discretization error swings sharply as well. Compared directly against the pure mathematical analytical solution, the total error you compute is a stew of time error and space error mixed together — there is no way to measure a clean temporal convergence order from it.

The standard solution given in the literature: on the same spatial grid, first run a high-precision numerical benchmark with a very small time step, then difference each test case against that benchmark. The subtraction cancels the spatial error completely.

## 3. How I solved it

Based on the analysis and the search results, I made a few changes: block unstable input before the run, guarantee energy conservation in the code structure, and measure accuracy term by term using the analytical solution and a same-grid benchmark.

### Unsafe step sizes simply don't run

Since I knew the $r \le 0.25$ line, the cheapest fix is to make any run that crosses it impossible to start. After the solver receives the grid and the time step, it computes $r$ first. If $r > 0.25$ (say 0.26), it raises `StabilityError`, records the reason, and exits without taking a single step. Warnings are easy to scroll past; by the time the plot suddenly turns into NaN a few hundred steps later, it is too late to go back and investigate.

### Treating every cell as a small room with a heat ledger

I found another, sneakier problem: the curves can look perfectly fine while energy quietly leaks out through the boundaries. My approach is to treat each cell as a small room: how much its temperature changes depends only on how much heat crosses its four walls. Whatever flows out through one wall flows into the neighbouring room, so when I add up the ledger over the whole field, the heat fluxes through the internal walls cancel exactly in pairs. Code written this way can hardly leak heat. I measured it: with all four sides insulated, after 576 steps the total energy drift was 0.0.

### Verification

Finally, how did I confirm the numbers are accurate? I wrote 13 unit tests in total.

First, compare against the exact answer. On a $1 \times 0.2$ plate (grid $100 \times 20$), with the left side at $T=0$, the other three sides insulated, and an initial $T=1$, I used the safe $r = 0.20$ ($\Delta t = 2 \times 10^{-5}$ s) and advanced 2500 steps to $t = 0.05$ s, then compared point by point against the Fourier series analytical solution.

![Temperature profiles inside the plate at different times](/images/projects/heat-diffusion-2d/temperature-profiles.svg)

*As time advances, the influence of the cold left boundary gradually spreads deeper into the plate*

![Overlay of the numerical solution and the Fourier analytical solution at the final time](/images/projects/heat-diffusion-2d/analytical-validation.svg)

*At t=0.05, the numerical values at the grid nodes closely overlap the Fourier analytical curve*

The maximum deviation was $1.384 \times 10^{-5}$, comfortably below the $5 \times 10^{-5}$ threshold I had set beforehand, and the transverse temperature difference across the 20 grid rows was strictly 0.

Then compare against "myself, run with a tiny step on the same grid". As analysed earlier, comparing directly with the analytical solution mixes spatial error and temporal error together. So on the same grid I first ran a high-precision benchmark at $r = 0.001$, then ran four cases at $r = 0.20, 0.10, 0.05, 0.025$, and subtracted the benchmark from each. The grid is the same, so the spatial error cancels; what remains is pure temporal error.

![Convergence of the pure temporal error under time-step refinement](/images/projects/heat-diffusion-2d/temporal-refinement.svg)

*The four time-step refinement tests fit to a measured temporal convergence order of 1.017*

Halving the step four times gave errors of $1.370 \times 10^{-4}$, $6.817 \times 10^{-5}$, $3.374 \times 10^{-5}$, and $1.653 \times 10^{-5}$ — roughly halving each time. The fitted temporal order is 1.017, inside the theoretical band of 0.9–1.1.

| Verification item | Measured result | Acceptance criterion | Result |
|---|---:|---:|:---:|
| Maximum absolute error of the main transient vs the Fourier analytical solution | $L^\infty = 1.384 \times 10^{-5}$ | $\le 5 \times 10^{-5}$ | Pass |
| Temporal convergence order on a fixed grid | 1.017 | 0.9 – 1.1 | Pass |
| Discrete energy drift on a fully insulated grid | 0.0 | $\le 10^{-12}$ | Pass |
| Attempting to run an unsafe step size ($r = 0.26$) | `StabilityError` raised and the reason logged | Must be firmly rejected | Pass |
| Discrete difference across transverse temperature sections of the 2-D grid | 0.0 | $< 10^{-14}$ | Pass |

## Summary

The question I studied: when a surface is suddenly heated or cooled, how long does heat take to work its way in. It turned out to be genuinely useful later, when I was working on an FSAE electric race car: the IGBT modules in the motor inverter and the cold plate of the battery pack have to absorb a peak heat load of 6.0 kW within 10 seconds of hard acceleration. In that short a time, the heat has no chance to reach the outer heatsink at all, so a steady-state calculation is meaningless — only a transient model like this one can show how much heat piles up locally. My shortcoming is just as direct: stability demands $\Delta t \propto \Delta x^2$, so halving the cell size means 4 times as many steps, and a fine grid gets very slow. For a genuinely finer grid, the next step is to switch to an unconditionally stable implicit scheme, such as ADI or Crank-Nicolson.

Looking back: I started from an interesting pattern on the paving stones, reduced it to a metal plate cooled on one side, and wrote a solver — which crashed as soon as I casually enlarged the time step. Following that crash, I found the $r \le 0.25$ line and made unsafe runs impossible to start; I treated each cell as a small room with a heat ledger so energy cannot leak; and I settled the account two ways, against the analytical solution and against a high-precision benchmark on the same grid, to confirm the numbers are right. What an experience!

## Code

All solver code, test cases, and analysis scripts for this project are open source: [gaoflow/heat-diffusion-2d](https://github.com/gaoflow/heat-diffusion-2d)

Local commands:

```bash
git clone https://github.com/gaoflow/heat-diffusion-2d.git
cd heat-diffusion-2d
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
```
