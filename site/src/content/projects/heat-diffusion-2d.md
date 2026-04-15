---
title: 'Why One Larger Time Step Broke My 2-D Heat Solver'
year: 2026
date: '2026-02-07'
status: complete
categories: [validation]
tags: [CFD]
summary: 'I built a 2-D explicit FTCS heat-diffusion solver, watched an unsafe time step destroy an otherwise plausible temperature field, and then used a Fourier series and targeted tests to work out what I could trust.'
role: 'Numerical methods & validation'
duration: 'Independent study'
featured: false
order: 15
studySequence: 7
heroImage: /images/projects/heat-diffusion-2d/thermal-spreading-infrared.jpg
github: 'https://github.com/gaoflow/heat-diffusion-2d'
---

## Why I wanted to watch heat move

My previous heat-conduction model answered a steady question: after enough time has passed, what temperature does each point settle at? That was useful, but it skipped the part I found most interesting. A cold patch spreads. A hot spot fades. Different parts of an object respond at different times.

This project was my first attempt in this study sequence to solve a partial differential equation that changes with time. I wanted to see that change happen one small step at a time instead of asking a black-box solver for the final field.

The immediate trigger was less tidy. During an early coding session, I increased the time step $\Delta t$ by what looked like a small amount. The temperature field looked reasonable at first, and then within a few steps it collapsed into a screen full of `NaN` values. The code had run long enough to produce a believable picture before it failed.

That bothered me more than an immediate syntax error. A smooth colour plot can be completely wrong. I wanted to understand why the update became unstable, make the solver refuse unsafe input before starting, and build checks that could catch mistakes even when the result looked plausible.

## What heat diffusion looks like outside a graph

Heat diffusion is easy to miss because the material itself does not move. One everyday trace appears after snowfall. Paving slabs can show through the snow before the nearby ground does because heat stored below reaches the surface at different rates through different materials. The outlines of the buried slabs become visible as the snow melts — a real example of heat moving through solids.

In practical engineering—such as a copper heat spreader underneath a CPU or an inverter baseplate on an electric vehicle—heat diffusion follows the exact same physical law: heat spreads spontaneously from high-temperature zones to low-temperature zones, flattening all thermal gradients.

My numerical test removes most real-world complexity to provide a reliable benchmark with a known mathematical solution.

## I reduced the problem to one warm plate

Imagine a thin metal plate that starts at one uniform temperature, normalised to $T=1$. Its left edge touches a cold block held at $T=0$. The other three edges (top, bottom, right) are insulated, so heat can leave only through the left side.

These are normalised temperatures rather than literal kelvin values. Because the heat equation is linear, the resulting non-dimensional temperature distribution can be scaled to any realistic temperature pair.

The setup is simpler than a real cold plate or heatsink. It leaves out air convection, contact resistance, internal heat generation, and temperature-dependent thermal properties. I chose it because it has an exact analytical solution from Fourier series. That gave me an independent mathematical reference for the code.

I set one core question for the project:

> Can I write a simple explicit 2-D solver that follows the correct transient, keeps all heat inside a fully insulated plate, and refuses an unsafe time step before the calculation starts?

## One time step means four heat exchanges

The model solves the two-dimensional heat equation:

$$
\frac{\partial T}{\partial t} = \alpha \left( \frac{\partial^2 T}{\partial x^2} + \frac{\partial^2 T}{\partial y^2} \right),
$$

where $T$ is temperature and $\alpha$ is thermal diffusivity. In plain language, a cell changes temperature when it is hotter or colder than the cells around it.

I split the plate into square cells ($\Delta x = \Delta y$) and stored one temperature at the centre of each cell. Under the forward-time centred-space (FTCS) method, a cell exchanges heat with its left, right, top, and bottom neighbours:

$$
T_{j,i}^{n+1} = T_{j,i}^{n} + r \left[ (T_{j,i+1}^{n} - 2T_{j,i}^{n} + T_{j,i-1}^{n}) + (T_{j+1,i}^{n} - 2T_{j,i}^{n} + T_{j-1,i}^{n}) \right],
$$

with the dimensionless diffusion number:

$$
r = \frac{\alpha \Delta t}{\Delta x^2}.
$$

My code calculates the update as temperature differences across cell faces. This form makes the heat bookkeeping easy to inspect: heat that leaves one interior cell enters its neighbour as the same floating-point value. Those internal exchanges cancel when I sum the whole grid, guaranteeing discrete energy conservation.

At a fixed-temperature edge, I use a linear ghost cell so that the requested temperature lies on the boundary face. At an insulated edge, I set the normal face flux to zero, directly preventing any heat from crossing that edge.

## The time step has a hard limit: $r \leq 0.25$

The diffusion number $r$ compares the amount of diffusion allowed in one update with the size of a grid cell. A larger time step raises $r$. A finer grid also raises it because $\Delta x$ is squared in the denominator.

For a square 2-D grid, Von Neumann analysis gives the amplification factor:

$$
g = 1 - 4r \left[ \sin^2\left(\frac{k_x \Delta x}{2}\right) + \sin^2\left(\frac{k_y \Delta x}{2}\right) \right].
$$

The most rapidly alternating grid pattern (checkerboard noise) is the dangerous mode. Keeping every mode within $|g| \leq 1$ requires:

$$
r \leq 0.25.
$$

This is a numerical stability limit for FTCS, not a physical law. Beyond it, tiny grid-scale errors grow after every update. A run may look smooth at the start because those errors begin small before growing exponentially.

![Worst-mode amplification against diffusion number](/images/projects/heat-diffusion-2d/stability-limit.svg)
*The dashed boundary is $r=0.25$. The validation run uses $r=0.20$. A requested run at $r=0.26$ lies outside the stable range*

I check $r$ before allocating memory or starting the integration. A request at $r=0.26$ raises `StabilityError` and records why it was refused. A request at or below $r=0.25$ is accepted.

I chose a hard stop instead of a warning because an unstable field may look convincing for a while. Refusing the run is part of the solver's contract.

## I built the checks from small to large

I did not start with the full analytical comparison. That would have made a failure harder to locate. I added the pieces in this order:

1. Created a square, cell-centred grid and rejected grids whose cell widths did not match in $x$ and $y$.
2. Implemented fixed-temperature and zero-flux boundary conditions.
3. Held the two ends of a channel at fixed temperatures and ran it to steady state to confirm a straight linear profile.
4. Insulated all four sides of a plate to verify that total discrete energy does not drift.
5. Used a cosine-shaped temperature field whose decay rate can be calculated exactly for the discrete update.
6. Compared the full transient with the analytical slab solution.
7. Refined the time step on a fixed grid to isolate temporal accuracy.

The test suite contains 13 behavioural tests, each targeted at a specific mistake.

## The full transient matched the analytical solution

For the main validation case, I used a $1 \times 0.2$ plate with $\alpha = 1.0$. The $100 \times 20$ grid has square cells with $\Delta x = 0.01$. The plate starts at $T=1$. The west face stays at $T=0$, and the other three faces are insulated.

I ran at $r=0.20$ to $t=0.05$, taking 2,500 explicit steps. The temperature profiles illustrate how cooling spreads from the left boundary into the solid:

![Temperature profiles at different times across the plate](/images/projects/heat-diffusion-2d/temperature-profiles.svg)
*Temperature profiles at $t=0.01, 0.02, 0.03, 0.04, 0.05$ showing the cooling wave propagating from the left wall into the plate*

Because the setup has no variation along $y$, the 2-D calculation should reproduce the 1-D slab transient:

$$
\theta(x,t) = \sum_{n=0}^{\infty} \frac{4}{(2n+1)\pi} \sin(\lambda_n x) \exp(-\alpha \lambda_n^2 t), \qquad \lambda_n = \frac{(2n+1)\pi}{2L}.
$$

Here $\theta = (T - T_w)/(T_0 - T_w)$. The code stops adding terms when the next term's envelope falls below $10^{-14}$.

![Numerical and analytical temperature profiles at the final time](/images/projects/heat-diffusion-2d/analytical-validation.svg)
*At $t=0.05$, the numerical markers lie on the analytical curve. The largest difference is $1.384 \times 10^{-5}$ on the $100 \times 20$ grid*

I had set the acceptance limit to $5 \times 10^{-5}$ before running the code. The measured maximum error ($1.384 \times 10^{-5}$) passed comfortably. The field also stayed uniform across $y$ with variation under $10^{-14}$.

## My first refinement plan mixed two errors

After the analytical comparison passed, I wanted to verify that FTCS was first-order accurate in time. My first plan sounded simple: keep the grid fixed, halve the time step several times, and compare each result with the analytical solution.

However, writing out the leading truncation error revealed:

$$
\tau = \frac{\alpha \Delta x^2}{12}(6r - 1) \frac{\partial^4 T}{\partial x^4} + \mathcal{O}(\Delta t^2) + \mathcal{O}(\Delta x^4).
$$

The coefficient of the spatial truncation term depends on $r = \alpha \Delta t / \Delta x^2$. Changing the time step changes $r$, which alters how the spatial error appears in the total error. A direct comparison with the analytical solution would mix time error and space error together.

To isolate the temporal order, I kept the same $100 \times 20$ grid and produced a fine-time numerical reference at $r=0.001$. I then compared runs at:

$$
r \in \{0.20,\ 0.10,\ 0.05,\ 0.025\}
$$

with that reference at $t=0.02$. Because all calculations use the exact same spatial grid, their shared spatial error cancels upon subtraction.

![Maximum temperature difference against time-step size](/images/projects/heat-diffusion-2d/temporal-refinement.svg)
*Halving the time step roughly halves the error. A least-squares fit gives an observed temporal order of 1.017, well within the acceptance band of 0.9 to 1.1*

The four maximum differences were $1.370 \times 10^{-4}$, $6.817 \times 10^{-5}$, $3.374 \times 10^{-5}$, and $1.653 \times 10^{-5}$. This isolated study cleanly measured the expected first-order convergence.

## Three focused checks looked for specific bugs

I maintained three targeted checks to isolate distinct implementation risks:

### 1. Does an insulated plate keep its heat?
A $48 \times 48$ insulated grid with a two-mode temperature field was advanced for 576 steps at $r=0.2$. The pattern flattened, but the total discrete energy stayed at 300.0 with relative drift of 0.0 (tolerance $10^{-12}$). This verified the pairwise face-flux cancellation.

### 2. Does the update use the right signs and neighbours?
An insulated grid was initialized with a discrete cosine mode. The theoretical discrete amplification factor per FTCS step is:

$$
g = 1 - 4r \sin^2\left(\frac{\pi}{2 n_x}\right).
$$

The automated test verified this decay rate to within $10^{-14}$, catching any potential index offsets or sign flips.

### 3. Does a one-dimensional field stay one-dimensional?
Copying a 1-D profile across 20 rows and advancing from $t=0.01$ to $t=0.04$ maintained zero difference across rows (tolerance $10^{-14}$), confirming translational symmetry.

## The results I kept

| Verification metric | Observed result | Acceptance criteria | Status |
|---|---:|---:|:---:|
| Main transient error vs Fourier analytical solution | $L^\infty = 1.384 \times 10^{-5}$ | $\leq 5 \times 10^{-5}$ | Pass |
| Observed temporal convergence order | 1.017 | 0.9 – 1.1 | Pass |
| 576-step insulated grid discrete energy drift | 0.0 | $\leq 10^{-12}$ | Pass |
| Rejection of unsafe input ($r = 0.26$) | `StabilityError` raised and logged | Must reject | Pass |
| 2-D transverse profile variation | 0.0 | $< 10^{-14}$ | Pass |

## Where this model is useful

This plate model captures a fundamental question in thermal engineering: when a surface is suddenly heated or cooled, how long does the solid take to respond?

I later applied these verified transient principles to Formula Student electric vehicle design, assessing short-duration heat spikes in inverter IGBT modules and battery cold plates (such as 6.0 kW peak thermal loads over 10 seconds). In such short bursts, steady-state approximations fail, and transient heat diffusion models are essential for estimating local heat accumulation.

## What the model still leaves out

The explicit method becomes expensive as the grid is refined because $\Delta t \propto \Delta x^2$. Halving the cell width requires four times as many time steps. The main 0.05-second case already required 2,500 steps.

The code also assumes constant, isotropic diffusivity on uniform Cartesian grids, omitting convection, radiation, temperature-dependent conductivity, and internal heat generation. For larger systems, moving to implicit schemes (such as Crank-Nicolson or ADI) is the logical next step.

## Code and reproduction

The source code and test suite are open source on GitHub: [gaoflow/heat-diffusion-2d](https://github.com/gaoflow/heat-diffusion-2d)

```bash
git clone https://github.com/gaoflow/heat-diffusion-2d.git
cd heat-diffusion-2d
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
```
