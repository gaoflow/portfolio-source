---
title: "I Wrote About 70% of Lao You's Initial Core Code—Then Had to Let Go"
published: 2026-08-25
summary: 'I built Lao You from scratch and wrote about 70% of its initial core code. That figure describes only the early project; the harder task was turning code I knew personally into a shared system that a team could understand, change, and maintain.'
tags: [Android, Architecture, Software Journey]
sourceProjects: []
featured: false
order: 103
---

The 70% figure needs a qualifier: I wrote **about 70% of Lao You's initial core code**. I did not write 70% of every later version, and I did not build the mature product alone.

I started the application from scratch and later led its growth to more than two million users. My main lesson was that early personal ownership had to become shared team ownership.

![Responsibility spreading from the initial core](/images/notes/systems/writing-seventy-percent-of-laoyou.svg)

## Starting from scratch still creates constraints

A new project has no legacy code, but it quickly creates contracts: where network data becomes application state, who owns identity, how screens share information, and how failures are reported.

Early shortcuts stop being local once several features depend on them. An authentication shortcut affects every screen. Storing raw server objects ties old releases to transport formats. Hidden global state makes tests depend on execution order.

I had to move the product forward without making every later change affect the whole application.

## I moved change behind stable interfaces

Core modules serve many features, so they can spread complexity quickly. If every caller must understand their internals, centralizing the code has not hidden the change.

I gradually pulled that change back into clear boundaries:

| Boundary | What it hides |
|---|---|
| Network adapter | Field, error, and version differences |
| Identity state | Sign-in, expiry, refresh, and recovery |
| Persistence | Storage formats and migrations |
| Feature interface | Internal mechanisms callers do not need to understand |

The network layer returned application-level results instead of exposing library types. The session module answered identity questions in one place. Storage migrations stayed inside the persistence boundary.

This kept transport, storage, and dependency changes in limited areas. Tests could replace dependencies without starting the entire application.

## More than two million users exposed early assumptions

The available record does not say which Lao You release crossed two million users, so I cannot attach that milestone to a specific version.

The scale still made rare conditions real: unusual devices, old clients, different network conditions, and stored data surviving across releases.

A faulty mobile release also does not disappear immediately. It remains installed until users update again. A fix may therefore require backend compatibility, a feature switch, or a new release that can coexist with older versions.

At that scale, data migrations, unknown enum values, task lifetimes, and logging context could no longer depend on what I remembered.

## My context became a bottleneck

Writing much of the initial code gave me a large amount of background knowledge. That became a risk when decisions had to return to me because the context existed only in my head.

I needed engineers who had not participated in the early design to be able to review and change the code safely. Each module had to state what it owned, required, returned, and how it failed. Names had to expose state, changes had to remain limited in scope, and release behavior had to be inspectable through logs and artifacts.

Transferable ownership did not require everyone to understand every module. It required clear enough boundaries that an engineer could modify one part without reconstructing years of unwritten history.

## What 70% proves—and what it does not

The figure shows that I carried most of Lao You's initial core implementation and built much of its foundation myself.

It does not prove that every architectural decision was correct. It does not diminish the work of later engineers, and it does not mean that lines of code equal value.

As the product matured, a small compatibility fix, a clear code review, or a release that could be rolled back could matter more than writing a large new module.

## The standard I retained

My goal stopped being to preserve the largest share of the code. It became making sure the system and team did not need to send every problem back to the original author.

The initial core fulfilled its purpose only when other engineers could understand, replace, and improve it while the product continued to run reliably.
