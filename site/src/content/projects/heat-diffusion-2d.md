---
title: 'Why One Larger Time Step Broke My 2-D Heat Solver'
year: 2026
date: '2026-02-07'
status: complete
categories: [validation]
tags: [CFD]
summary: 'I built a small 2-D heat-diffusion solver, watched an unsafe time step destroy an otherwise plausible result, and then used an analytical solution and targeted tests to work out what I could trust.'
role: 'Numerical methods & validation'
duration: 'Independent study'
featured: false
order: 15
studySequence: 7
heroImage: /images/projects/heat-diffusion-2d/temperature-profiles.svg
github: 'https://github.com/gaoflow/heat-diffusion-2d'
---

## Why I wanted to watch heat move

My previous heat-conduction model answered a steady question: after enough time has passed, what temperature does each point settle at? That was useful, but it skipped the part I found more interesting. A cold patch spreads. A hot spot fades. Different parts of an object respond at different times.

This project was my first attempt in the study sequence to solve a partial differential equation that changes with time. I wanted to see that change happen one small step at a time instead of asking a library solver for the final field.

The immediate trigger was less tidy. During an early coding session, I increased the time step by what looked like a small amount. The temperature field looked reasonable at first, then collapsed into `NaN` values. The code had run long enough to produce a believable picture before it failed.

That bothered me more than an immediate error. A smooth colour plot can be wrong. I wanted to understand why the update became unstable, make the solver refuse unsafe input, and build checks that could catch mistakes even when the result looked plausible.

## What heat diffusion looks like outside a graph

Heat diffusion is easy to miss because the material itself does not move. One everyday trace appears after snowfall. Paving slabs can show through the snow before the nearby ground does because heat stored below reaches the surface at different rates.

![Snow melting at different rates above paving slabs and nearby ground](/images/projects/heat-diffusion-2d/snow-melting-over-paving-stones.jpg)

*The outlines of the paving slabs become visible as the snow melts. This is a real example of heat moving through solids, not a validation image for my solver. Photo by [Martinvl](https://commons.wikimedia.org/wiki/User:Martinvl), from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:SnowMeltingOnPavingStones.jpg), licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)*

My numerical test removes most of that real-world complexity. It uses one material, a simple shape, and idealised boundaries. That gives me a problem with a known answer.

## I reduced the problem to one warm plate

Imagine a thin metal plate that starts at one uniform temperature. Its left edge touches a cold block. The other three edges are insulated, so heat can leave only through the left side. Cooling starts there and moves into the plate.

I used normalised temperatures. The plate starts at $T=1$, and the cold edge stays at $T=0$. These are not literal kelvin values. Because this version of the heat equation is linear, the result can be rescaled to another pair of temperatures.

The setup is simpler than a real tray, heatsink, or battery cold plate. It leaves out heat loss to air, contact resistance, internal heat generation, and changes in material properties. I chose it because the temperature has an analytical solution. That gave me an independent reference for the code.

I set one question for the project:

> Can I write a simple explicit 2-D solver that follows the correct transient, keeps all heat inside a fully insulated plate, and refuses an unsafe time step before the calculation starts?

## One time step means four heat exchanges

The model solves the two-dimensional heat equation,

$$
\frac{\partial T}{\partial t}
=\alpha\left(
\frac{\partial^2 T}{\partial x^2}
+\frac{\partial^2 T}{\partial y^2}
\right),
$$

where $T$ is temperature and $\alpha$ is thermal diffusivity. In plain language, a cell changes temperature when it is hotter or colder than the cells around it.

I split the plate into square cells and stored one temperature at the centre of each cell. During one time step, a cell exchanges heat with its left, right, top, and bottom neighbours. The forward-time centred-space method, or FTCS, writes that update as

$$
T_{j,i}^{n+1}=T_{j,i}^{n}
+r\left[
\left(T_{j,i+1}^{n}-2T_{j,i}^{n}+T_{j,i-1}^{n}\right)
+\left(T_{j+1,i}^{n}-2T_{j,i}^{n}+T_{j-1,i}^{n}\right)
\right],
$$

with

$$
r=\frac{\alpha\Delta t}{\Delta x^2}.
$$

My code calculates the same update as temperature differences across cell faces. This form makes the heat bookkeeping easy to inspect. Heat that leaves one interior cell enters its neighbour as the same floating-point value. Those internal exchanges cancel when I sum the whole grid.

At a fixed-temperature edge, I use a linear ghost cell so that the requested temperature lies on the boundary face. At an insulated edge, I set the normal face flux to zero. This directly says that no heat crosses that edge.

## The time step has a hard limit

The diffusion number $r$ compares the amount of diffusion allowed in one update with the size of a grid cell. A larger time step raises $r$. A finer grid also raises it because $\Delta x$ is squared in the denominator.

For a square 2-D grid, Von Neumann analysis gives the amplification factor

$$
g=1-4r\left[
\sin^2\left(\frac{k_x\Delta x}{2}\right)
+\sin^2\left(\frac{k_y\Delta x}{2}\right)
\right].
$$

The most rapidly alternating grid pattern is the dangerous one. Keeping every mode within $|g|\leq1$ requires

$$
r\leq0.25.
$$

This is a numerical stability limit for FTCS, not a physical law. Beyond it, tiny grid-scale errors can grow after every update. A run may look smooth at the start because those errors begin small.

![Worst-mode amplification against diffusion number](/images/projects/heat-diffusion-2d/stability-limit.svg)

*The dashed boundary is $r=0.25$. The validation run uses $r=0.20$. A requested run at $r=0.26$ lies outside the stable range*

I check $r$ before starting the integration. A request at $r=0.26$ raises `StabilityError` and records why it was refused. A request exactly at $r=0.25$ is accepted.

I chose a hard stop instead of a warning because the unstable field may look useful for a while. Refusing the run is part of the numerical result.

## I built the checks from small to large

I did not start with the full analytical comparison. That would have made a failure harder to locate. I added the pieces in this order:

1. I created a square, cell-centred grid and rejected grids whose cell widths did not match in $x$ and $y$.
2. I implemented fixed-temperature and zero-flux boundaries.
3. I held the two ends of a channel at fixed temperatures and ran it to steady state. The result had to become a straight temperature line.
4. I insulated all four sides of a plate. Its temperature could spread out, but its total heat could not change.
5. I used a cosine-shaped temperature field whose decay rate can be calculated exactly for the discrete update.
6. I compared the full transient with the analytical slab solution.
7. I refined the time step to measure temporal accuracy.

The test suite now has 13 behavioural tests. Each one looks for a specific problem: an unsafe time step, a shifted index, a wrong boundary sign, a non-conservative update, or a validation study that measures the wrong error.

## The full transient matched the analytical solution

For the main case, I used a $1\times0.2$ plate with $\alpha=1$. The $100\times20$ grid has square cells with $\Delta x=0.01$. The plate starts at $T=1$. The west face stays at $T=0$, and the other three faces are insulated.

I ran at $r=0.2$ to $t=0.05$. This required 2500 explicit steps. Because the setup has no variation along $y$, the 2-D calculation should reproduce the one-dimensional slab transient

$$
\theta(x,t)=\sum_{n=0}^{\infty}
\frac{4}{(2n+1)\pi}
\sin(\lambda_n x)
e^{-\alpha\lambda_n^2t},
\qquad
\lambda_n=\frac{(2n+1)\pi}{2L}.
$$

Here $\theta=(T-T_w)/(T_0-T_w)$. The code stops adding terms when the next term's envelope falls below $10^{-14}$. I then compare the analytical temperature with every cell centre in the numerical result.

![Numerical and analytical temperature profiles at the final time](/images/projects/heat-diffusion-2d/analytical-validation.svg)

*At $t=0.05$, the numerical markers lie on the analytical curve at this scale. The largest difference is $1.384\times10^{-5}$ on the $100\times20$ grid*

I had set the acceptance limit to $5\times10^{-5}$ before using the result. The measured error passed that limit. The field also stayed exactly uniform across $y$. Any transverse pattern would have pointed to an indexing or boundary error.

## My first refinement plan mixed two errors

After the analytical comparison passed, I wanted to check that FTCS was first-order accurate in time. My first plan sounded simple: keep the grid fixed, halve the time step several times, and compare each result with the analytical solution.

Before running that study, I wrote out the leading truncation error. It contains

$$
\frac{\alpha\Delta x^2}{12}(6r-1)
\frac{\partial^4T}{\partial x^4}.
$$

The coefficient depends on $r$. Changing the time step changes $r$, so it also changes how the spatial error appears in the total error. A direct comparison with the analytical solution would mix time error and space error. It would not isolate the temporal order I wanted to measure.

I changed the experiment. I kept the same $100\times20$ grid for every run and produced a fine-time numerical reference at $r=0.001$. I compared runs at

$$
r\in\{0.20,\ 0.10,\ 0.05,\ 0.025\}
$$

with that reference at $t=0.02$. All five calculations use the same spatial grid, so most of their shared spatial error cancels when I subtract the fields.

![Maximum temperature difference against time-step size](/images/projects/heat-diffusion-2d/temporal-refinement.svg)

*Halving the time step roughly halves the error. A least-squares fit gives an observed temporal order of 1.017, inside the acceptance band of 0.9 to 1.1*

The four maximum differences were $1.370\times10^{-4}$, $6.817\times10^{-5}$, $3.374\times10^{-5}$, and $1.653\times10^{-5}$. The corrected study measured the expected first-order behaviour.

This was the main change in my research process. The solver had passed its first comparison, but my planned refinement study could not answer the next question. I had to change the reference, not the result.

## Three focused checks looked for different bugs

The analytical profile tests the complete calculation. I kept three smaller checks because each one isolates a different part of the code.

### Does an insulated plate keep its heat?

I started a $48\times48$ insulated grid with a smooth two-mode temperature pattern and advanced it for 576 steps at $r=0.2$. The pattern flattened, but the initial and final discrete energies were both 300.0. The relative drift was 0.0 in double precision, against a limit of $10^{-12}$.

This test checks the face-flux bookkeeping. No heat can cross the outer boundary, and every interior exchange should cancel when the cells are summed.

### Does the update use the right signs and neighbours?

I initialised an insulated grid with a discrete cosine mode. For this field, one FTCS step should multiply the whole pattern by a known factor,

$$
g=1-4r\sin^2\left(\frac{\pi}{2n_x}\right).
$$

The automated test compares the computed decay with this exact discrete rate to an absolute tolerance of $10^{-12}$. It can expose a wrong sign or a shifted index that a final colour map might hide.

### Does a one-dimensional field stay one-dimensional?

I copied an analytical 1-D profile across all 20 rows, started at $t=0.01$, and advanced it to $t=0.04$. The maximum difference between rows remained 0.0, with a declared tolerance of $10^{-14}$. The final maximum error against the analytical profile was $8.60\times10^{-6}$.

Together, the checks answer separate questions about accuracy, time integration, conservation, indexing, and boundary treatment.

## The results I kept

| Question | Observed result | Requirement |
|---|---:|---:|
| Does the main transient match the analytical slab? | $L^\infty=1.384\times10^{-5}$ | $\leq5\times10^{-5}$ |
| Does the time-step study show first-order behaviour? | Order 1.017 | 0.9–1.1 |
| Does a fully insulated grid conserve discrete energy? | Relative drift 0.0 | $\leq10^{-12}$ |
| Does the solver reject an unsafe input? | $r=0.26$ refused | Must refuse |
| Does a 1-D field remain uniform across the 2-D grid? | Variation 0.0 | $<10^{-14}$ |

These are not five versions of the same test. The analytical comparison checks the complete transient. The refinement study checks time accuracy. The insulated case checks conservation. The cosine mode checks the update operator. The rejection test checks the calculation before it begins.

## Where this model is useful

The plate example captures a common engineering question: after one surface is suddenly cooled or heated, how long does the rest of a solid take to respond? The same basic transient appears in plates, heatsink bases, cold plates, and thin enclosure walls.

This solver is a transparent learning and verification tool. Every update is visible, small grids run quickly, and the analytical case gives a baseline for checking boundary conditions and time-step logic.

It is not a complete inverter-module or battery-pack design model. A real design may need three-dimensional geometry, internal heat generation, convection, contact resistance, cooling flow, and temperature-dependent material data. This project gives me a tested numerical building block for those later models.

## What the model still leaves out

The explicit method becomes expensive as the grid is refined. Its stability rule requires

$$
\Delta t\propto\Delta x^2.
$$

If I halve the cell width, I need about four times as many steps to cover the same physical time. The main $0.05$-second validation already needed 2500 steps.

The code also assumes constant, isotropic diffusivity and a uniform Cartesian grid made of square cells. It supports fixed-temperature and zero-flux boundaries. It does not include convection boundaries, internal heat sources, phase change, moving material, or non-uniform properties.

Adding those effects would change the numerical treatment. A source term needs a new balance and new reference cases. Non-uniform materials change the face fluxes. Larger models may need an implicit or semi-implicit time integrator, followed by a new set of validation tests.

## Code and reproduction

The source code is open source on GitHub: [gaoflow/heat-diffusion-2d](https://github.com/gaoflow/heat-diffusion-2d)

```bash
git clone https://github.com/gaoflow/heat-diffusion-2d.git
cd heat-diffusion-2d
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
```

## What I learned

Numerical instability can be deceptive. The early frames of a bad calculation may look smooth, so the stability limit belongs in the input checks before the first time step.

The refinement study taught me a second lesson. The analytical solution was the strongest reference for the full transient, but it was the wrong reference for isolating time error on a fixed grid. The reference has to match the question.

I now treat validation as a sequence of small questions aimed at different ways the code can fail. That made this modest solver more useful than a single successful plot or animation.
