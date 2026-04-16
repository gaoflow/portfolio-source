---
title: 'How I Built My First Potential-Flow Models from Complex Potentials'
year: 2025
date: '2025-11-08'
status: complete
categories: [component-cfd]
tags: [CFD]
summary: 'Exploring the problem of flow around a cylinder'
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

It felt like magic to me. Why can a few invisible "points" add up to an entire flow field? And how does the sign in front of the vortex decide which way the lift points? After the lecture, I went through the theory again using the course material and what I found online, and wrote a very small "potential-flow sandbox" to check it item by item, working only with simple 2D, inviscid, incompressible flow. It also laid the groundwork for the airfoil panel method and vortex lattice method I built later. Those rely on the same sources, doublets, vortices, and the Kutta–Joukowski relation, and a wrong velocity direction or circulation sign at this level is much harder to find inside a larger model.

Picture water flowing around a round bridge pier. Far from the pier, the water moves roughly left to right. Right in front of the pier, it slows down and splits into two branches that pass above and below. If the two branches are perfectly symmetric, there is one point of zero velocity at the front and one at the back — the stagnation points. Now give the whole flow a slight clockwise rotation: the two sides no longer move at the same speed. One side gets faster and its pressure drops; the other side slows down and its pressure rises. The result is an upward net force.

I computed this process with code: uniform flow plus a doublet gives the cylinder flow, and after adding a clockwise point vortex, the streamlines are no longer symmetric between top and bottom; both stagnation points (orange dots) are pushed into the lower half of the cylinder, and that is where the upward lift $L'$ comes from:

![Cylinder flow from uniform flow, a doublet, and a clockwise point vortex: asymmetric streamlines, both orange stagnation points in the lower half of the cylinder, arrow marking the upward lift](/images/projects/potential-flow-sandbox/cylinder-lift-hero.svg)

## Combining four elementary flows into a cylinder

The potential-flow equation is linear, so simple flows can be added directly. I implemented four elementary flows first: uniform flow carries the whole fluid in one direction; a source pushes fluid outward from a point; a doublet can be understood as a source and a sink placed very close together; a point vortex makes the fluid rotate around a point. Here is what their streamlines look like:

![Streamline sketches of the four elementary flows: uniform flow, source, doublet, point vortex](/images/projects/potential-flow-sandbox/elementary-flows.svg)
*Schematic streamlines of the four elementary flows, drawn directly from the complex-potential formulas. The vortex arrows run clockwise.*

Written as complex potentials $W(z)$ with $z=x+iy$, the velocity follows from

$$
\frac{dW}{dz}=u-iv
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

The figure below shows the case without circulation: fluid arrives from the left, passes around the cylinder, and the two orange dots are the front and rear stagnation points. This picture only shows what the flow looks like.

![Streamlines of cylinder flow without circulation: fluid arrives from the left, passes around the cylinder, and the orange dots are the front and rear stagnation points](/images/projects/potential-flow-sandbox/streamlines-cylinder.svg)

## Checking the elementary flows and the cylinder boundary

I started with a few hand-checkable locations for the four elementary flows. Uniform flow must have the same velocity everywhere. A source must point radially outward, with magnitude falling as $1/r$. A vortex must be tangential, also falling as $1/r$. The doublet velocity is checked directly against the derivative of its complex potential. That pins down the lowest-level formulas and directions first.

Then I combined uniform flow and the doublet into the cylinder. On the cylinder surface, the normal velocity should be close to zero and the stream function should stay constant; at a distance of $1000R$, the velocity should return to the uniform free stream. Only when both the surface and the far field agree can I say the two elementary flows really did build a cylinder.

With those two layers of checks passing, I computed the pressure coefficient from the surface velocity. Without circulation, the analytical answer is $C_p=1-4\sin^2\theta$. At the measurement points on the cylinder surface, the largest difference between the program and this curve was $2.66\times10^{-15}$. That difference is very small. The program and the analytical formula already agree down to the limit of the computer's floating-point representation.

## Checking circulation, stagnation points, and lift direction

Once the vortex is added, the thing most worth actively checking is the sign. Even if the sign in front of the vortex is flipped, the streamlines can still look perfectly smooth, but the rotation direction and the lift direction flip together.

I use the aerodynamic convention: positive $\Gamma$ means clockwise circulation, corresponding to the upward lift given by

$$
L'=\rho U\Gamma
$$

My numerical contour runs counter-clockwise, so recovering the "clockwise is positive" circulation from the line integral takes one more sign flip. I therefore checked three things at once: the vortex velocity on the right side of the cylinder should point downward; the closed integral should recover a positive $\Gamma$; and the pressure-integrated lift should point upward. The lift case uses $U=1$, $R=1$, $\rho=1.225$, and $\Gamma=2\pi$ throughout. The header image is the flow field computed for these parameters. From $\sin\theta=-\Gamma/(4\pi UR)$, the stagnation points should move from $0^\circ$ and $180^\circ$ without circulation to $-30^\circ$ and $-150^\circ$. The two stagnation points the program found were $-150.0^\circ$ and $-30.0^\circ$, at most $8.9\times10^{-16}$ rad away from the theoretical angles. This error is still very small.

I also ran a contour integral on a closed circle at $r=2.5R$. Uniform flow and the doublet should each contribute zero circulation around the full loop, so whatever remains can only come from the vortex. The integral recovered a circulation of 6.3. The imposed value $2\pi$ also rounds to 6.3 at one decimal, and the two differ by only $8.9\times10^{-16}$. Finally, I integrated the pressure using the surface points. The computed lift per unit span was 7.7, exactly matching the theoretical $\rho U\Gamma$ value, pointing upward.

## Finally checking whether the RK4 is really fourth-order

A single smooth streamline only proves the plot looks nice; it does not prove the RK4 is written correctly. Even with a broken term, one trajectory at step size 0.01 can look very much like the right answer. The more reliable test is to halve the step size repeatedly and watch how the error falls.

The streamline starts at $(-3,1.2)$ and marches along the local velocity direction with fixed-step RK4. It should stay on the same analytical stream-function value the whole way. I halved the step from 0.08 down to 0.005, re-traced the entire streamline each time, and recorded the maximum stream-function drift. For a fourth-order method, halving the step should shrink the error to about $1/16$ of its previous value.

![Measured stream-function drift as the RK4 step size is halved](/images/projects/potential-flow-sandbox/rk4-convergence.svg)

At the acceptance step size of 0.01, the maximum drift was $2.56\times10^{-12}$; at 0.005, the drift shrank to $1/16.0$ of that, giving an observed convergence order of 4.003. The five dots in the figure all come from actual runs, and the dashed line is the fourth-order reference. So the result is still very good.

The figure below shows only the case without circulation. The solid line is theory; the dots are values the program sampled from the velocity field.

![Theoretical surface pressure coefficient curve versus computed points](/images/projects/potential-flow-sandbox/cp-comparison.svg)

## The difference between ideal streamlines and a real wake

The pressure-integrated drag is zero. But this is not a prediction for a bridge pier or a real cylinder: my potential-flow model removes viscosity, and this zero-drag result is d'Alembert's paradox. There is no boundary layer, no separation, and no wake in the model, and a real cylinder's drag comes mainly from exactly these phenomena.

One point that's easy to confuse is worth clearing up here: cylinder flow and the Kármán vortex street are the same geometry but two different physics. What this article computes is the idealized version — no viscosity, a front-to-back symmetric flow field, zero drag. The real, viscous flow separates behind the cylinder and sheds a vortex street, which takes a Navier–Stokes CFD solver to compute; that is what I did in a separate project.

This vortex street doesn't only show up in laboratories; you can see it in the atmosphere too. In November 2012, NASA's Terra satellite watched the wind sweep past Yakushima Island, Japan, and the cloud layer downstream rolled into a long train of alternating vortices. The island is a giant "cylinder" here, while the ideal potential-flow figure above is symmetric front to back and has no real wake at all.

![Satellite image of the Kármán vortex street downstream of Yakushima Island](/images/projects/potential-flow-sandbox/source/karman-vortex-street-yakushima-2012.jpg)

## A follow-up from later work

When I later built the Hess–Smith airfoil panel method and the ground-effect vortex lattice method, I again used the superposition of sources, doublets, and vortices and the Kutta–Joukowski lift. When I needed to check a lift direction, I came back to this article. I went back to this cylinder, which has closed-form answers, and checked the derivatives, the clockwise and counter-clockwise conventions, the stagnation points, and the RK4 order. Only then did I move on to the more complicated geometry normals, boundary matrices, and 3D meshes. With this article as a base, when sign problems come up later, I don't have to doubt the whole model from scratch. Troubleshooting goes much faster.

## Code

The project code is at [gaoflow/potential-flow-sandbox](https://github.com/gaoflow/potential-flow-sandbox)

```bash
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
python3 scripts/publish_site.py
```

## Further reading

- [ERAU: Potential Flows](https://eaglepubs.erau.edu/introductiontoaerospaceflightvehicles/chapter/potential-flows/) builds from elementary potential flows through superposition to cylinder flow, good for matching the formulas to flow pictures.
- [Oregon State: Potential Flows](https://open.oregonstate.education/intermediate-fluid-mechanics/chapter/potential-flows/) explains the velocity potential, the stream function, and the elementary solutions in an open textbook.
- [Wikipedia: Potential flow around a circular cylinder](https://en.wikipedia.org/wiki/Potential_flow_around_a_circular_cylinder) collects the velocity, pressure, and d'Alembert's paradox for cylinder potential flow, handy for checking the analytical relations used here.
