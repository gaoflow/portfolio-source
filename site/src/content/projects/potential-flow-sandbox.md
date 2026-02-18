---
title: 'Potential Flow Sandbox — Complex Potentials and Circulation'
year: 2025
date: '2025-11-08'
status: complete
categories: [component-cfd]
tags: [CFD]
summary: 'I implemented the classical elementary flows as complex potentials, superposed them into cylinder flow with circulation, and verified every available analytical identity.'
role: 'Aerodynamics fundamentals'
duration: 'Independent build'
featured: false
order: 14
studySequence: 2
heroImage: /images/projects/potential-flow-sandbox/streamlines-cylinder.svg
---

## Context & objective

Every identity this layer of theory claims checks out at machine precision: surface $C_p$ to $2.66\times10^{-15}$, circulation recovery to $8.9\times10^{-16}$, Kutta–Joukowski lift exact in sign and magnitude. The panel method in [Airfoil Methods](/projects/airfoil-methods) and the vortex-lattice code in [Ground Effect VLM](/projects/ground-effect-vlm) both assume that sources, doublets, and vortices are exact, that superposition is legitimate, and that circulation means lift. Rather than import those assumptions, I built the layer they rest on and verified every identity it claims.

This study closes the analytical fluids set before the later panel and vortex-lattice work. The deliverable is a small sandbox: elementary flows written as complex potentials, superposed into flow past a circular cylinder with and without circulation, with an RK4 streamline tracer checked against the analytical streamfunction.

## Method

Each elementary flow is a complex potential $W(z)$, $z = x + iy$, with the physical velocity from $dW/dz = u - iv$:

$$
\begin{aligned} W_{\text{uniform}} &= Uz, & W_{\text{source}} &= \frac{m}{2\pi}\ln z,\\[0.5em] W_{\text{doublet}} &= \frac{\mu}{2\pi z}, & W_{\text{vortex}} &= \frac{i\Gamma}{2\pi}\ln z.\end{aligned}
$$

Superposing the stream, a doublet of moment $\mu = 2\pi U R^2$, and the vortex gives cylinder flow with circulation:

$$
W(z) = U\!\left(z + \frac{R^2}{z}\right) + \frac{i\Gamma}{2\pi}\ln z .
$$

The linearity that permits this superposition is the same linearity the panel and vortex-lattice methods exploit; the difference is that here the superposed field has a closed form, so the implementation can be tested to machine precision rather than to experimental scatter.

![Streamlines around the cylinder at both circulations](/images/projects/potential-flow-sandbox/streamlines-cylinder.svg)

## Iteration: designing tests for failures that stay silent

Two failure modes in this code produce plausible output, so the test suite is built around them explicitly.

**The sign of circulation.** A sign error in the vortex term crashes nothing and fails no residual; it returns a lift vector of the right magnitude pointing down. The sandbox adopts the aerodynamics convention — positive $\Gamma$ clockwise, the convention under which $L' = \rho U \Gamma$ points upward — and a unit test pins the sign so a later refactor cannot flip it quietly. The convention also follows the code into the integration: the trapezoid sum evaluates the contour counter-clockwise, so recovering $\Gamma$ takes a sign flip. One line, easy to get wrong, and invisible to every residual-based check. The contour-integral check isolates the same term from the other direction: the uniform and doublet parts contribute zero circulation, so whatever the integral returns at $r = 2.5R$ belongs to the vortex alone.

**The order of the tracer.** A small streamline drift at one step size would prove little, because a broken integrator can still hug the analytical line at $h = 0.01$. The real check is the halving experiment: drift falls by a factor of 16.0 when the step halves, an observed convergence order of 4.003. That pins the RK4 truncation behaviour, where a single small number would have been luck.

The third deliberate choice is interpretive. Integrated surface pressure gives zero drag to machine precision — d'Alembert's paradox. I recorded it as a limitation of the model class, not as a successful drag prediction.

## Validation

Five checks, each against theory rather than another numerical method:

| Check | Observed | Gate |
|---|---:|---:|
| Surface $C_p$ vs $1 - 4\sin^2\theta$ | $2.66\times10^{-15}$ | $<10^{-12}$ |
| Stagnation angles vs $\sin\theta = -\Gamma/(4\pi U R)$ | $8.9\times10^{-16}$ rad | $<10^{-9}$ rad |
| Contour-integral circulation vs imposed $\Gamma$ | $8.9\times10^{-16}$ | $<10^{-9}$ |
| RK4 streamfunction drift, step 0.01 | $2.56\times10^{-12}$ | $<10^{-6}$ |
| Integrated lift vs $\rho U \Gamma$ | 0.0 relative | $<10^{-9}$ |

The lift case imposes $\Gamma = 2\pi U R$, moving the stagnation points from $0^\circ, 180^\circ$ to $-30^\circ, -150^\circ$; the figure marks the located points on top of the traced field.

![Surface Cp: velocity-field evaluation against the analytical distribution](/images/projects/potential-flow-sandbox/cp-comparison.svg)

## Quantitative results

With $U = 1$, $R = 1$, $\rho = 1.225$, and $\Gamma = 2\pi$:

- surface $C_p$ from $|dW/dz|$ matches $1 - 4\sin^2\theta$ to $2.66\times10^{-15}$ over 4097 stations;
- stagnation points are recovered at $-30.00000000000005^\circ$ and $-149.99999999999997^\circ$ by bisecting the signed tangential surface speed;
- a 4096-point contour integral at $r = 2.5R$ returns $6.283185307179585$ against the imposed $6.283185307179586$;
- the RK4 tracer's maximum streamfunction drift is $2.56\times10^{-12}$ at step 0.01 over 720 samples around the body;
- integrated surface pressure gives $L' = 7.6969$ per unit span, equal to $\rho U \Gamma$ at integration precision, upward for positive $\Gamma$, with zero drag to machine precision.

## Limitations

The model is inviscid, irrotational, incompressible, and strictly two-dimensional. There is no boundary layer, so the real flow's separation and wake — which dominate an actual cylinder's drag — are absent by construction. Circulation is imposed, not predicted: nothing here explains why a lifting body carries a particular $\Gamma$; that requires the Kutta condition introduced with the airfoil work.

## What I took away

The failures this code invited were all silent: a flipped circulation sign returns a lift of the right magnitude pointing down, and a broken integrator can still hug one streamline at one step size. The two tests that matter — the pinned sign convention and the halving experiment with its factor-16 drift drop — exist because a single plausible-looking number would have proved nothing. Machine-precision agreement was achievable here only because the theory is linear with closed forms; the panel method has no such luxury, which is why I verified this layer before building on it.

## Reproduce

```bash
cd projects/potential-flow-sandbox
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
python3 scripts/publish_site.py
```

Twelve unit tests pin the elementary-flow hand values, surface impermeability, far-field decay, circulation sign, and the tracer's fourth-order convergence. `analyse.py` regenerates `results/analysis.json` and both figures and exits nonzero if any gate fails. The committed [technical report](/documents/potential-flow-sandbox-report.html) records the equations, gates, and sources.
