---
title: 'How I Built My First Potential-Flow Models from Complex Potentials'
year: 2025
date: '2025-11-08'
status: complete
categories: [component-cfd]
tags: [CFD]
summary: 'Starting from the question of how water gets around a round bridge pier, I combined four elementary flows into potential flow around a cylinder, then checked the boundary, pressure, stagnation points, circulation, lift, and RK4 convergence one layer at a time.'
role: 'Aerodynamics fundamentals'
duration: 'Independent build'
featured: false
order: 14
studySequence: 2
heroImage: /images/projects/potential-flow-sandbox/cylinder-lift-hero.svg
github: 'https://github.com/gaoflow/potential-flow-sandbox'
---

## First hearing about cylinder flow

In a fluid mechanics lecture, the professor used flow around a cylinder as the example: add a uniform flow and an elementary flow called a doublet, and a few lines of formulas on the blackboard produced the flow field around a cylinder; add a point vortex, and you could even compute lift.

It felt like magic. Why can a few invisible "points" add up to an entire flow field? And how does the sign in front of the vortex decide which way the lift points? After the lecture, I went through the theory again using the course material and what I found online, and wrote a very small "potential-flow sandbox" to check it item by item, working only with simple 2D, inviscid, incompressible flow. It also laid the groundwork for the panel method and vortex lattice method I built later — those rely on the same sources, doublets, vortices, and the Kutta–Joukowski relation, and a wrong velocity direction or circulation sign at this level is much harder to find inside a larger model.

Picture water flowing around a round bridge pier. Far from the pier, the water moves roughly left to right. Right in front of the pier, it slows down and splits into two branches that pass above and below. If the two branches are perfectly symmetric, there is one point of zero velocity at the front and one at the back — the stagnation points. Now give the whole flow a slight clockwise rotation: the two sides no longer move at the same speed. One side gets faster and its pressure drops; the other side slows down and its pressure rises. The result is an upward net force.

I computed this process with code: uniform flow plus a doublet gives the cylinder flow, and after adding a clockwise point vortex, the streamlines are no longer symmetric between top and bottom; both stagnation points (orange dots) are pushed into the lower half of the cylinder, and that is where the upward lift $L'$ comes from:

![Cylinder flow from uniform flow, a doublet, and a clockwise point vortex: asymmetric streamlines, both orange stagnation points in the lower half of the cylinder, arrow marking the upward lift](/images/projects/potential-flow-sandbox/cylinder-lift-hero.svg)

## The one question I wanted to answer

After stacking the elementary flows into cylinder flow, can this code respect the cylinder boundary and get the pressure, stagnation points, circulation, lift, and streamlines right at the same time?

## Combining four elementary flows into a cylinder

The potential-flow equation is linear, so simple flows can be added directly. I implemented four elementary flows first: uniform flow carries the whole fluid in one direction; a source pushes fluid outward from a point; a doublet can be understood as a source and a sink placed very close together; a point vortex makes the fluid rotate around a point. Here is what their streamlines look like:

![Streamline sketches of the four elementary flows: uniform flow, source, doublet, point vortex](/images/projects/potential-flow-sandbox/elementary-flows.svg)
*Schematic streamlines of the four elementary flows, drawn directly from the complex potentials in this section; this is not an acceptance figure. The vortex arrows run clockwise, matching the positive-circulation convention used in the text.*

Written as complex potentials $W(z)$ with $z=x+iy$, the velocity follows from

$$
\frac{dW}{dz}=u-iv.
$$

The four potentials are:

$$
\begin{aligned}
W_{\text{uniform}} &= Uz, &
W_{\text{source}} &= \frac{m}{2\pi}\ln z,\\
W_{\text{doublet}} &= \frac{\mu}{2\pi z}, &
W_{\text{vortex}} &= \frac{i\Gamma}{2\pi}\ln z.
\end{aligned}
$$

Adding uniform flow and a doublet "pushes open" the streamline that used to pass through the center. The circle of radius $R$ becomes a streamline that the flow cannot cross. Adding a point vortex then gives cylinder flow with circulation:

$$
W(z)=U\left(z+\frac{R^2}{z}\right)+\frac{i\Gamma}{2\pi}\ln z.
$$

The figure below shows the case without circulation: fluid arrives from the left, passes around the cylinder, and the two orange dots are the stagnation points. The picture only shows what the flow looks like; whether it is computed correctly still has to be checked.

![Streamlines of cylinder flow without circulation: fluid arrives from the left, passes around the cylinder, and the orange dots are the front and rear stagnation points](/images/projects/potential-flow-sandbox/streamlines-cylinder.svg)

## Check the elementary flows first, then the cylinder boundary

I started with a few hand-checkable locations for the four elementary flows. Uniform flow must have the same velocity everywhere. A source must point radially outward, with magnitude falling as $1/r$. A vortex must be tangential, also falling as $1/r$. The doublet velocity is checked directly against the derivative of its complex potential. That pins down the lowest-level formulas and directions first.

Then I combined uniform flow and the doublet into the cylinder. On the cylinder surface, the normal velocity should be close to zero and the stream function should stay constant; at a distance of $1000R$, the velocity should return to the uniform free stream. Only when both the surface and the far field agree can I say the two elementary flows really did build a cylinder.

With those two layers passing, I computed the pressure coefficient from the surface velocity. Without circulation, the analytical answer is $C_p=1-4\sin^2\theta$. Across 4097 measurement points on the cylinder surface, the largest difference between the program and this curve was $2.66\times10^{-15}$.

## Then circulation, stagnation points, and lift direction

Once the vortex is added, the thing most worth actively checking is the sign. If the sign in front of the vortex is flipped, the program does not crash and the streamlines can still look smooth — but the rotation direction and the lift direction flip together.

I use the aerodynamic convention: positive $\Gamma$ means clockwise circulation, which gives upward lift through

$$
L'=\rho U\Gamma.
$$

My numerical contour runs counter-clockwise, so recovering the "clockwise is positive" circulation from the line integral takes one more sign flip. I therefore checked three things at once: the vortex velocity on the right side of the cylinder should point downward; the closed integral should recover a positive $\Gamma$; and the pressure-integrated lift should point upward.

The lift case uses $U=1$, $R=1$, $\rho=1.225$, and $\Gamma=2\pi$ throughout — the header image is the flow field for exactly these parameters. From $\sin\theta=-\Gamma/(4\pi UR)$, the stagnation points should move from $0^\circ$ and $180^\circ$ without circulation to $-30^\circ$ and $-150^\circ$.

The two stagnation points the program found were $-150.0^\circ$ and $-30.0^\circ$, at most $8.9\times10^{-16}$ rad away from the theoretical angles.

I also ran a 4096-point contour integral on a circle at $r=2.5R$. Uniform flow and the doublet should each contribute zero circulation around the loop, so whatever remains can only come from the vortex. The integral recovered a circulation of 6.3 — the imposed value $2\pi$ also rounds to 6.3 at one decimal, and the two differ by only $8.9\times10^{-16}$.

Finally, I integrated pressure over 8192 surface points. The computed lift per unit span was 7.7, identical to the $\rho U\Gamma$ value (0.0 relative error), pointing upward. I kept the result only after all three routes agreed on the same sign.

## Finally: is the RK4 really fourth-order?

A single smooth streamline only proves the plot looks nice; it does not prove the RK4 is written correctly. Even with a broken term, one trajectory at step size 0.01 can look very much like the right answer. The more reliable test is to halve the step size repeatedly and watch how the error falls.

The streamline starts at $(-3,1.2)$ and marches along the local velocity direction with fixed-step RK4. It should stay on the same analytical stream-function value the whole way. I halved the step from 0.08 down to 0.005, re-traced the entire streamline each time, and recorded the maximum stream-function drift. For a fourth-order method, halving the step should shrink the error to about $1/16$ of its previous value.

![Measured stream-function drift as the RK4 step size is halved](/images/projects/potential-flow-sandbox/rk4-convergence.svg)

At the acceptance step size of 0.01, the maximum drift was $2.56\times10^{-12}$; at 0.005, the drift shrank to $1/16.0$ of that, giving an observed convergence order of 4.003. The five dots in the figure all come from actual runs, and the dashed line is the fourth-order reference.

## The results I kept

The project keeps 12 behavior tests. The analysis script then regenerates the data, the figures, and five acceptance results in one pass. A result stays in this article only if every earlier check passed.

| Check | Result | Requirement |
|---|---:|---:|
| Surface $C_p$ versus $1-4\sin^2\theta$ | $2.66\times10^{-15}$ | $<10^{-12}$ |
| Stagnation points versus analytical angles | $8.9\times10^{-16}$ rad | $<10^{-9}$ rad |
| Circulation recovered by closed-contour integration | $8.9\times10^{-16}$ | $<10^{-9}$ |
| RK4 stream-function drift at step 0.01 | $2.56\times10^{-12}$ | $<10^{-6}$ |
| Pressure-integrated lift versus $\rho U\Gamma$ | 0.0 relative error | $<10^{-9}$ |

The figure below shows only the case without circulation. The solid line is theory; the dots are values the program sampled from the velocity field.

![Theoretical surface pressure coefficient curve versus computed points](/images/projects/potential-flow-sandbox/cp-comparison.svg)

The drag is zero to machine precision.

## Where ideal streamlines and a real wake differ

"Zero drag" is not a prediction for a bridge pier or a real cylinder. The potential-flow model removes viscosity, and this zero-drag result is d'Alembert's paradox. There is no boundary layer, no separation, and no wake in the model — yet those are exactly where most of a real cylinder's drag comes from.

One confusion is worth clearing up here: cylinder flow and the Kármán vortex street are the same geometry but two different physics. What this article computes is the idealized version — no viscosity, a symmetric front-to-back flow field, zero drag. The real, viscous flow separates behind the cylinder and sheds a vortex street, which takes a Navier–Stokes CFD solver to compute; that is what I did in a separate project.

This vortex street does not only show up in laboratories — the atmosphere produces it too. In November 2012, NASA's Terra satellite watched the wind sweep past Yakushima Island, Japan, and the cloud layer downstream rolled into a long train of alternating vortices. The island is a giant "cylinder" here, while the ideal potential-flow figure above is symmetric front to back and has no real wake at all.

![Satellite image of the Kármán vortex street downstream of Yakushima Island](/images/projects/potential-flow-sandbox/source/karman-vortex-street-yakushima-2012.jpg)

The circulation is also something I type in by hand. This sandbox can only answer "given this circulation, how do the pressure and lift change?"; it cannot answer why a real airfoil chooses a particular circulation — an airfoil model needs the Kutta condition for that. It only handles 2D, incompressible, irrotational, inviscid flow, so it says nothing about finite-span bodies, compressibility, or real turbulence.

Machine-precision error does not mean the model is close to reality either. It only means the code faithfully reproduces this set of ideal equations. Analytical solutions are great for checking an implementation; real physics still needs experiments and more complete models.

## How this sandbox earned its keep later

When I later built the Hess–Smith airfoil panel method and the ground-effect vortex lattice method, I used the same superposition of sources, doublets, and vortices and the same Kutta–Joukowski lift. Whenever I needed to check a lift direction, I could come back to this cylinder with its closed-form answers, verify the derivatives, the clockwise/counter-clockwise conventions, the stagnation points, and the RK4 order — and only then go look at the more complicated geometry normals, boundary matrices, and 3D meshes.

## How to reproduce

The code is at [gaoflow/potential-flow-sandbox](https://github.com/gaoflow/potential-flow-sandbox). The three commands below run the tests, recompute the metrics and the four SVG figures, and then sync the results to the site:

```bash
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
python3 scripts/publish_site.py
```

The analysis script exits with a non-zero status if any acceptance check fails, so the published figures and `analysis.json` always come from the same passing run.

## Further reading

- [ERAU: Potential Flows](https://eaglepubs.erau.edu/introductiontoaerospaceflightvehicles/chapter/potential-flows/) builds from elementary potential flows through superposition to cylinder flow — good for matching the formulas to flow pictures.
- [Oregon State: Potential Flows](https://open.oregonstate.education/intermediate-fluid-mechanics/chapter/potential-flows/) explains the velocity potential, the stream function, and the elementary solutions in an open textbook.
- [Wikipedia: Potential flow around a circular cylinder](https://en.wikipedia.org/wiki/Potential_flow_around_a_circular_cylinder) collects the velocity, pressure, and d'Alembert's paradox for cylinder potential flow — handy for checking the analytical relations used here.
