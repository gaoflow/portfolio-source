---
title: 'How I Verified My First Finite-Difference Heat-Conduction Model'
year: 2026
date: '2026-01-17'
status: complete
categories: [validation]
tags: [CFD]
summary: 'I used central differences and a Thomas algorithm to solve an internally heated rod, discovered that my original grid study measured only roundoff, then used a manufactured solution to verify second-order convergence and checked conservation and implementation independently.'
role: 'Heat transfer & numerical methods'
duration: 'Independent study'
featured: false
order: 12
studySequence: 6
heroImage: /images/projects/steady-conduction-1d/temperature-profile.svg
---

## Why I started with a one-dimensional rod

This was the first time I moved beyond evaluating a correlation and instead discretised a differential equation, assembled a linear system, and solved for a temperature field.

I deliberately chose a simple problem: a rod of length $L=0.5$ m with constant thermal conductivity $k=167$ W/(m·K) and uniform volumetric heat generation $q'''=2\times10^4$ W/m³. The left boundary is fixed at 350 K. At the right boundary, convection with $h_c=25$ W/(m²·K) transfers heat to an environment at 300 K.

Because the physics is simple, I could derive a closed-form solution and focus on the numerical details: discretisation, boundary-condition assembly, the linear solver, and energy conservation.

## How I discretised the equation

The governing equation is

$$
kT''+q'''=0.
$$

I divided the rod into a uniform grid and used central differences at the interior nodes. At the convective end, I used a half-control-volume balance that includes conduction through the final interior face, heat generation within half a cell, and convection from the surface.

That treatment matters because the physical convective boundary lies half a grid spacing beyond the final node centre. Applying the Robin condition directly at that node would shift the boundary by half a cell.

The discretisation produces a tridiagonal linear system. I implemented the Thomas algorithm from scratch, including forward elimination, back substitution, and explicit zero-pivot checks. The production solution path does not call a library linear solver.

The closed-form solution is

$$
\begin{aligned}
T(x)&=T_{\text{left}}+C_1x-\frac{q'''x^2}{2k},\\[0.5em]
C_1&=\frac{q'''L+\dfrac{h_cq'''L^2}{2k}-h_c(T_{\text{left}}-T_\infty)}
{k+h_cL}.
\end{aligned}
$$

I used this exact solution to check both the calculated temperatures and the assembly of the convective boundary equation.

## My first convergence study measured nothing useful

I originally planned to compare the numerical and closed-form solutions on successively finer grids and observe the error decrease. At $N=160$, however, the maximum error was already only $1.34\times10^{-11}$ K.

That result did not mean the grid was exceptionally good. The exact temperature profile is quadratic, and central differences reproduce a quadratic exactly. At the half-control-volume boundary, the face-flux error also cancels the half-cell heat-generation term. Further refinement therefore reveals floating-point roundoff rather than the truncation-error order of the method.

I did not treat the very small error as proof that the convergence study was complete. Instead, I changed the test problem.

## I used a manufactured solution to verify second-order convergence

I constructed a sinusoidal manufactured solution that satisfies the same fixed-temperature and convective boundary conditions. Unlike the quadratic solution, it cannot be represented exactly by the central-difference scheme, so grid refinement exposes the actual truncation error.

For $N=20/40/80/160$, the maximum errors were

$$
4.81\times10^{-2},
1.20\times10^{-2},
3.00\times10^{-3},
7.51\times10^{-4}\ \text{K}.
$$

A least-squares fit gave an observed order of 2.0002, consistent with the expected second-order behaviour of the central-difference discretisation.

![Manufactured-solution error versus grid spacing](/images/projects/steady-conduction-1d/convergence.svg)

## I also checked energy conservation

The exact tip temperature is 360.446 K. The temperature reaches a maximum of 360.788 K at $x=0.425$ m.

The rod generates 10,000 W/m² per unit cross-sectional area. Of that total, only 1,511 W/m² leaves through the convective end. The remaining 8,489 W/m² conducts back to the fixed-temperature boundary at $x=0$.

When I summed the energy balances of all discrete cells, the relative residual was $1.59\times10^{-12}$. The model therefore preserves the global energy balance as well as matching the pointwise temperature solution.

## The four checks I retained

| Check | Result | Requirement |
|---|---:|---:|
| Maximum error against the closed-form solution at $N=160$ | $1.34\times10^{-11}$ K | $\leq10^{-9}$ K |
| Observed order for the manufactured solution | 2.0002 | 1.8–2.2 |
| Relative energy-balance residual | $1.59\times10^{-12}$ | $\leq10^{-10}$ |
| Difference between Thomas and NumPy dense solutions | $1.1\times10^{-16}$ | $\leq10^{-12}$ |

I compared my Thomas implementation with NumPy’s dense solver on 64 random tridiagonal systems. The maximum difference was $1.1\times10^{-16}$. The implementation also rejects a zero pivot explicitly rather than allowing NaNs to propagate through the calculation.

Each check targets a different failure mode. Comparison with the closed-form solution can reveal sign errors and mistakes in the boundary row. The manufactured solution tests whether the discretisation retains its expected second-order accuracy. The energy balance can expose a non-conservative scheme even when its temperatures appear reasonable. The independent dense solve checks my implementation of the tridiagonal algorithm.

These checks are not interchangeable. My first convergence study failed precisely because I chose a solution that the discretisation could reproduce exactly. Only the sinusoidal manufactured solution allowed me to measure the numerical order.

## What the model still leaves out

The model is one-dimensional and steady, with constant material properties. It does not include temperature-dependent conductivity, contact resistance, or radiation from the end. It also cannot represent multidimensional heat spreading, fins with varying cross-sections, or transient heating.

The manufactured solution is a verification tool, not a physical operating condition. Extending the model to the omitted effects would require new equations, boundary treatments, and verification cases.

## How to run it

```bash
cd projects/steady-conduction-1d
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
python3 scripts/publish_site.py
```
