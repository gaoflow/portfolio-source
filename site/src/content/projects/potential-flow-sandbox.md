---
title: 'Potential Flow Sandbox — Complex Potentials and Circulation'
year: 2025
date: '2025-11-08'
status: complete
categories: [component-cfd]
tags: [CFD]
summary: 'I wrote uniform flow, a source, a doublet, and a point vortex as complex potentials, then combined them into cylinder flow with circulation and checked each step against analytical pressure, stagnation points, circulation, lift, and RK4 convergence order.'
role: 'Aerodynamics fundamentals'
duration: 'Independent build'
featured: false
order: 14
studySequence: 2
heroImage: /images/projects/potential-flow-sandbox/streamlines-cylinder.svg
---

## Origin: the complex-potential magic on the chalkboard

The origin of this sandbox was a fluid mechanics lecture where the professor wrote down the complex potentials for sources, doublets, and point vortices, then claimed: 'Superpose these simple singularities, and you get complete flow around a cylinder with lift.'

It felt like a mathematical trick: how could adding idealized singularities produce physical lift? How do circulation sign conventions and velocity fields align to machine precision?

To prove the theory to myself—and to establish an unshakeable foundation before building higher-order panel and vortex lattice solvers—I built this standalone potential-flow sandbox. It handles 2D, inviscid, incompressible flow, verifying every identity directly against closed-form analytic solutions.

## Building the elementary flows

I represented each elementary flow with a complex potential $W(z)$, where $z=x+iy$ and the velocity follows from

$$
\frac{dW}{dz}=u-iv.
$$

The four elementary flows are

$$
\begin{aligned}
W_{\text{uniform}} &= Uz, &
W_{\text{source}} &= \frac{m}{2\pi}\ln z,\
W_{\text{doublet}} &= \frac{\mu}{2\pi z}, &
W_{\text{vortex}} &= \frac{i\Gamma}{2\pi}\ln z.
\end{aligned}
$$

Complex potentials can be added directly. Combining uniform flow with a doublet produces flow around a circular cylinder; adding a point vortex gives cylinder flow with circulation:

$$
W(z)=U\left(z+\frac{R^2}{z}\right)+\frac{i\Gamma}{2\pi}\ln z.
$$

The required doublet moment is $\mu=2\pi U R^2$. Because both the geometry and flow field have analytical solutions, I could test the implementation against theory rather than against another numerical method.

## The first silent failure: circulation sign

Reversing the sign of the vortex term does not make the program fail. The velocity magnitude, pressure distribution, and streamlines can still look reasonable, but the lift points in the opposite direction.

I use the convention that positive $\Gamma$ means clockwise circulation. Under this convention,

$$
L'=\rho U\Gamma
$$

gives upward lift. My contour integration runs counter-clockwise, so recovering $\Gamma$ requires an additional sign change.

I added a dedicated test for this convention. Uniform flow and the doublet should each contribute zero circulation, so a closed contour integral at $r=2.5R$ must recover only the point-vortex contribution. This checks the same sign convention through an independent calculation.

## The second silent failure: plausible streamlines

I used RK4 to trace streamlines. A smooth trajectory at a step size of 0.01 is not enough to show that the integrator retains fourth-order accuracy. An incorrect implementation could still remain close to the analytical streamline at one chosen step size.

The meaningful check was to halve the step size repeatedly. A correct RK4 implementation should reduce the error by approximately a factor of 16 each time. In my test, halving the step reduced the streamfunction drift to $1/16.0$ of its previous value, giving an observed convergence order of 4.003.

This tests how the algorithm behaves as the step size changes rather than relying on a streamline that merely looks smooth.

## Analytical checks and retained results

I checked the implementation against five analytical relationships:

| Check | Result | Requirement |
|---|---:|---:|
| Surface $C_p$ versus $1-4\sin^2\theta$ | $2.66\times10^{-15}$ | $<10^{-12}$ |
| Stagnation points versus analytical angles | $8.9\times10^{-16}$ rad | $<10^{-9}$ rad |
| Circulation recovered by closed-contour integration | $8.9\times10^{-16}$ | $<10^{-9}$ |
| RK4 streamfunction drift at step 0.01 | $2.56\times10^{-12}$ | $<10^{-6}$ |
| Pressure-integrated lift versus $\rho U\Gamma$ | 0.0 relative error | $<10^{-9}$ |

The lift case used $U=1$, $R=1$, $\rho=1.225$, and $\Gamma=2\pi$. Adding circulation moved the stagnation points from $0^\circ$ and $180^\circ$ to $-30^\circ$ and $-150^\circ$.

Across 4097 stations on the cylinder surface, the maximum difference in $C_p$ was $2.66\times10^{-15}$. A 4096-point contour integration at $r=2.5R$ returned a circulation of 6.283185307179585, compared with the imposed value of 6.283185307179586.

![Surface pressure coefficient compared with the analytical distribution](/images/projects/potential-flow-sandbox/cp-comparison.svg)

## Why zero drag is not a successful prediction

The pressure-integrated lift agrees with the Kutta–Joukowski relation, while the drag is zero to machine precision. This is not a successful prediction of real cylinder drag; it is d'Alembert's paradox.

Potential flow contains no viscosity or boundary layer, so it cannot reproduce the separation and wake that dominate the drag of a real cylinder.

The circulation is also imposed rather than predicted. This model shows how a specified circulation changes the pressure field and lift, but it does not explain why a real airfoil acquires a particular value of $\Gamma$. A later airfoil model will need a Kutta condition to determine that circulation.



## Practical applications: foundational verification for panel methods and VLM

When developing the Hess–Smith airfoil panel method (Airfoil Methods) and the vortex lattice method (Ground Effect VLM), the higher-level algorithms rely fundamentally on source/vortex superpositions and the Kutta–Joukowski theorem. Debugging those directly on complex wing geometries risks confusing normal-vector conventions, matrix assembly bugs, or sign errors with fundamental theory mistakes.

Using this potential-flow sandbox to verify complex-potential derivatives, circulation sign conventions, stagnation points, and 4th-order streamline tracking to machine precision provided an unshakeable foundation for every subsequent aerodynamic solver.

## What I learned

The most important errors in this project would not have caused a crash. A reversed circulation sign gives lift with the correct magnitude but the wrong direction, while an integrator with degraded order can still produce a plausible streamline at one step size.

I no longer treat a reasonable-looking streamline plot as validation. I check sign conventions through both contour integration and lift direction, and I check the integrator through a step-halving convergence experiment.

This model reaches machine-precision agreement because it is linear and has closed-form solutions. Panel methods, vortex-lattice methods, and practical CFD do not offer the same convenience, so I chose to verify this foundation before adding more complicated geometry and physics.

## Code and reproduction

The source code is open source on GitHub: [gaoflow/potential-flow-sandbox](https://github.com/gaoflow/potential-flow-sandbox)

```bash
git clone https://github.com/gaoflow/potential-flow-sandbox.git
cd potential-flow-sandbox
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
```
