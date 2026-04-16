---
title: 'Studying Ground Effect with Image Vortices'
year: 2026
date: '2026-04-25'
status: complete
categories: [validation, tooling]
tags: [CFD]
summary: 'I wrote a ground-effect VLM tool'
role: 'Aerodynamics & numerical methods'
duration: 'Independent study'
featured: false
order: 6
studySequence: 13
heroImage: /images/projects/ground-effect-vlm/reference/faa-wake-vortex-generation.svg
github: 'https://github.com/gaoflow/ground-effect-vlm'
---

## Ground effect in F1

Whenever you watch F1, you always hear about "ground effect". The closer a wing gets to the ground, the stronger the downforce usually is. The questions I was curious about were: the ground is just a flat road, so why does it change the force on a wing above it? And once the wing gets too close, why do the results stop being trustworthy?

On a real car, the floor, tyres, diffuser and gap leaks all affect the airflow at the same time. Putting the whole car straight into a model actually makes it harder to see what the ground itself does. So I used the method of image vortices to write a low-order vortex lattice method (VLM) tool, and started by studying one simple rectangular wing.

The 2022 to 2025 F1 cars [used shaped Venturi floor tunnels to strengthen ground effect](https://www.formula1.com/en/latest/article/10-things-you-need-to-know-about-the-all-new-2022-f1-car.4OLg8DrXyzHzdoGrbqp6ye):

<figure>
  <img src="/images/projects/ground-effect-vlm/reference/f1-2022-concept.webp" alt="Official Formula 1 image of the 2022 concept car" loading="lazy">
  <figcaption><a href="https://www.formula1.com/en/latest/article/10-things-you-need-to-know-about-the-all-new-2022-f1-car.4OLg8DrXyzHzdoGrbqp6ye">F1 2022 concept car.</a></figcaption>
</figure>

The 2026 regulations [switch to a flatter floor and a larger diffuser](https://www.formula1.com/en/latest/article/2026-regulations-explained-all-you-need-to-know-about-f1s-new-aerodynamics.7IAt0auc32UkCEFE5ypkTB). Ground effect has not disappeared; it is just weaker than under the previous rules. The picture below looks at the rear of the car and is likewise only background.

<figure>
  <img src="/images/projects/ground-effect-vlm/reference/f1-2026-rear-floor.webp" alt="Official Formula 1 image of the 2026 car's rear and floor" loading="lazy">
  <figcaption><a href="https://www.formula1.com/en/latest/article/2026-regulations-explained-all-you-need-to-know-about-f1s-new-aerodynamics.7IAt0auc32UkCEFE5ypkTB">F1 2026 rear floor and diffuser.</a></figcaption>
</figure>

## Simplifying the problem to one rectangular wing

Take the simplest possible model: a thin rectangular wing meeting the airflow at a fixed angle. At the start it is far above the ground; then it comes down bit by bit, with everything else unchanged. I wanted to watch three things: 1 how the loading changes along the span, 2 how much the total lift grows, 3 how much induced drag you pay for the same lift.

I did not import CAD, and I did not model the floor of any particular F1 generation — all of that was too complex. I used the simplest geometry for a first exploration. In the code, my wing has no thickness, no sweep and no twist. The chord is $c=1$, the span is $b=4c$, and the angle of attack is fixed at $4^\circ$. This simplification lets me change only the height above the ground, without bringing in tyres, diffuser and body interference. Flip the wing over and the force direction becomes what F1 calls downforce; I care more about how the ground changes the loading, so whether the force points up or down does not affect the near-ground mechanism discussed here.

Because the model is so simple, I treat it as trend-watching only. It has no viscosity and no flow separation, so it cannot predict at which ride height a real car would stall.

## What is a vortex, and how does it form?

Put simply, a vortex is a blob of air spinning around some centre. Air can flow backwards while it spins. Smoke, cloud and water vapour can make the rotation visible, but the smoke itself is not the vortex; it just moves with the air.

When a wing makes lift, the pressure is lower on the upper surface and higher on the lower surface. Near the tip, the high-pressure air below spills around the tip towards the low-pressure region above. After the air leaves the wing it keeps rolling up, and in the end forms two trailing vortices, one on each side, spinning in opposite directions. [NASA's explanation of downwash](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/downwash-effects-on-lift/) and the [FAA's wake-turbulence note](https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap7_section_4.html) describe this process.

To make the formation process easier to see, I asked AI, and it returned a very easy-to-follow animation that I thought worked really well, so I put it here too. The animation first draws how the pressure difference drives the flow around the tip, then how that flow rolls up into a trailing vortex.

<iframe class="article-demo" src="/labs/ground-effect-vortex/" title="Wingtip vortex formation animation" loading="lazy"></iframe>

## So how does VLM represent a wing?

A real wake does not grow into a few straight lines by itself. To keep the computation cheap, VLM approximates the lift and downwash of a small piece of wing with a horseshoe vortex. The crosswise segment in the middle of the horseshoe is called the bound vortex, and the two long lines behind it are the trailing vortices. I cut the rectangular wing evenly into 64 segments along the span and put one horseshoe vortex on each. The bound vortex sits on the quarter-chord line, the control points that check whether air passes through the wing sit on the three-quarter-chord line, and the trailing vortices extend 80 chords downstream.

When solving, every vortex affects the velocity everywhere else. Putting all these mutual influences together gives a set of simultaneous equations:

$$
A\Gamma=b
$$

The matrix $A$ records the influence between the vortices, and $\Gamma$ is the still-unknown circulation on the 64 segments. The $b$ on the right-hand side is the boundary condition; it just happens to share a letter with the span $b$ from earlier. After solving for the circulations, I compute lift with the Kutta–Joukowski theorem, then add up the circulation and the downwash from the trailing vortices along the span to estimate the induced drag.

## How image vortices represent the ground

The ground makes only one basic demand on the airflow: **air cannot go through it. In velocity terms, the vertical velocity on the ground must be zero.**

My approach is to place a set of image vortices below the ground. Each image vortex mirrors the position of the real vortex above and has the opposite circulation direction. The vertical velocity the real vortex creates on the ground is cancelled by the image vortex. This satisfies the no-penetration condition without meshing the ground.

The figure below shows the same relationship with a two-dimensional vortex. The $\Gamma$ above the ground is the real vortex, the $-\Gamma$ below is the image vortex, and both are a distance $b$ from the ground.

<figure>
  <img src="/images/projects/ground-effect-vlm/reference/mit-vortex-near-wall.gif" alt="Image-vortex-at-a-wall schematic from MIT's potential-flow course" loading="lazy">
  <figcaption><a href="https://web.mit.edu/fluids-modules/www/potential_flows/LecturesHTML/lec1011/node37.html">MIT method of images.</a></figcaption>
</figure>

I first put the wing at $h/c=50$ to get a baseline almost unaffected by the ground. Then I lowered the height step by step down to $h/c=0.25$, computing 14 states in total. Here $h$ is the distance from the quarter-chord line to the ground.

## Watching how the loading changes along the span

After solving the circulations, I first compared the loading shapes. Each curve below is divided by its own maximum circulation, so they can only be compared for how the loading is distributed along the span, not for the total lift.

<figure>
  <img src="/images/projects/ground-effect-vlm/span-loading.svg" alt="Normalised span loading at different heights above the ground" loading="lazy">
  <figcaption>Normalised span loading.</figcaption>
</figure>

As the height drops, the curves fill out near the wingtips. The ground does not just amplify the total load; it also changes how the load is shared along the span.

## Looking at the three numbers separately

The left plot shows how much the lift at fixed angle of attack grows relative to free air, and the right plot shows how the induced-drag cost per unit lift changes. The horizontal axis is $h/c$ in both; smaller numbers mean the wing is closer to the ground.

<figure>
  <img src="/images/projects/ground-effect-vlm/ground-sweep.svg" alt="Lift amplification and induced-drag cost per unit lift as height above the ground changes" loading="lazy">
  <figcaption>Ride-height sweep.</figcaption>
</figure>

The free-air baseline is $C_L=0.2615$ and $C_{D_i}=0.00549$. Once the wing comes down to $h/c=0.5$, $C_L$ grows by 32.4% to 0.3461. The absolute induced drag grows by only 1.7%, to 0.00559. At the same time, $C_{D_i}/C_L^2$ falls by 41.9%.

Simply put, the third number drops a lot mainly because the denominator $C_L^2$ got bigger; it does not mean the absolute drag went down. So I can conclude that for the same amount of lift, the induced-drag cost is lower. But the claim that "as soon as a wing gets close to the ground, its absolute drag drops" is not supported.

## Deviations in the data

After getting the trends, I checked once more whether the image vortices really blocked the ground, then whether the wing returns to free air when it is far away, and finally the theoretical magnitude, panel refinement and left–right symmetry. I used ChatGPT to help me compare the deviations:

| Check | Result | Requirement |
|---|---:|---:|
| Ground normal-velocity residual | 0.0 | $<10^{-12}$ |
| Lift difference between $h/c=50$ and free air | 0.00335% | $<0.1$% |
| Lift-slope difference from the Prandtl estimate | 11.01% | $<12$% |
| Lift change from 64 to 96 panels | 0.258% | $<1$% |
| Left–right loading symmetry error | $1.94\times10^{-16}$ | $<10^{-12}$ |

The solver also checks the vertical velocity directly at 27 points on the ground; the sampling positions are 3 streamwise coordinates by 9 spanwise coordinates. The residual is zero, which means the image boundary works as intended. The difference between $h/c=50$ and free air is only 0.00335%, which means the ground influence disappears far away.

The left plot below compares the free-air lift slope with the Prandtl estimate; the right plot checks whether the result stays stable when more panels are used at $h/c=1$.

<figure>
  <img src="/images/projects/ground-effect-vlm/verification.svg" alt="Free-air lift slope and spanwise panel-refinement checks" loading="lazy">
  <figcaption>Solver verification.</figcaption>
</figure>

The lift-curve slope still differs by 11.01%. I did not calibrate it away. When the panels go from 64 to 96, the lift changes by only 0.258%, so refining the panels further would not remove this gap either. I think it mainly comes from the simplifications of the model itself.

## Doubts about the lowest height

At $h/c=0.25$, the model gives $C_L=0.5419$, 2.07 times the free-air value, and the conventional span-efficiency indicator reaches 2.59.

In a linear model, the image vortices have no flow-separation limit. Keep lowering the height and the numbers just get bigger, but the model has not gained any new real physics. The conventional free-air efficiency expression exceeds one here because the ground changed the boundary conditions. This value can only be used to compare trends; it cannot be read as an ordinary aircraft Oswald efficiency.

So I set $h/c=0.25$ as the lower bound of the sweep. It is where I chose to stop extrapolating, not an experimentally confirmed failure height. This model can neither explain real separation and stall, nor judge at which ride height they would appear.

## Summary

The model I built assumes steady, incompressible, inviscid and zero-thickness flow. It has no road boundary layer, no body blockage, no pressure recovery and no flow separation. I only treat it as a low-cost tool for checking direction, magnitude and the numerical pipeline. For the real situation, a real car, the study has to be far more complex than mine — it would also need finite thickness, chordwise loading, a moving-ground boundary layer, ride-height and pitch variation, tyres, leakage, a diffuser, grid sensitivity and flow separation, among other things.

## Code and running it

This project is open source on GitHub: [gaoflow/ground-effect-vlm](https://github.com/gaoflow/ground-effect-vlm)

```bash
git clone https://github.com/gaoflow/ground-effect-vlm.git
cd ground-effect-vlm
python3 -m unittest discover -s tests -v
python3 scripts/analyse.py
```
