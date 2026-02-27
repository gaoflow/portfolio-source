---
title: 'Starting Production Android Development'
published: 2026-08-25
summary: 'I began working on production Android software in Beijing in August 2016. The lasting lesson was that application code has to survive change: devices, releases, network failures, and engineers who were not present when it was written.'
tags: [Android, Software Journey]
sourceProjects: []
featured: false
order: 101
---

I began the software-career period documented in this series in Beijing in August 2016. Production Android work changed the standard I used to judge code: compiling was only the entry condition. The application also had to remain understandable after requirements, devices, dependencies, and people changed.

I do not have a preserved account of one dramatic first release, so I will not manufacture one. What I can describe is the engineering shift. A private program can assume a clean start and a patient author. A mobile product runs on hardware I do not control, receives data I did not create, and keeps state longer than the code that produced it.

## The device owns part of the program

An Android application shares control with the operating system. The system can pause an activity, recreate a screen, restrict background work, revoke a permission, or remove a process. The user still expects the same task to continue.

That changes how I think about ownership. A screen cannot be the only owner of information that must survive the screen. A callback cannot assume that its original view still exists. A background operation cannot depend on a component whose lifetime is shorter than the operation.

These rules sound obvious when written down. They become useful only when they shape the code. State needs an explicit owner. Work needs a lifetime. Every transition needs a defined result when the destination has disappeared.

## Inputs are part of the design

Production code accepts input from more places than a method signature suggests. It receives server responses, stored values from older versions, deep links, user text, device settings, locale choices, permissions, and timing.

I learned to treat those inputs as part of the module interface. A field can be absent. A request can finish after the user leaves. A stored enum can contain a value introduced by a later version. The safe question is not “does this work with my sample?” It is “what happens when one assumption is false?”

This does not mean wrapping every line in defensive code. It means putting validation at the seam where uncertain data becomes application state. Past that seam, the rest of the module should be allowed to rely on a smaller set of invariants.

## Small boundaries make change cheaper

A mobile application built over years cannot keep every early decision. Libraries change. Platform rules change. Product language changes. Backend responses evolve. The code remains workable when those changes stop at a narrow boundary.

I came to value modules that hide their storage, transport, or platform details. A screen should ask for a result instead of assembling a network request. A feature should depend on a stable domain value instead of the raw JSON shape. A caller should not need to know whether data came from memory, disk, or a server.

This is less about architecture diagrams than about reducing the number of places that must change together. If a backend field rename requires edits across several screens, the transport shape has leaked. If a dependency upgrade touches every feature, the dependency has no adapter. Production pressure exposes these leaks because each scattered edit creates another opportunity for disagreement.

## Releaseability belongs inside the code

A feature is incomplete when the only safe deployment plan is “hope the new version works.” Mobile releases have long feedback loops. Users update at different times, and some keep old versions for months. A server may have to support several client generations at once.

That reality affects implementation. New behavior needs a safe default. Stored data needs a migration path. A partial rollout needs a way to disable a feature without waiting for another store review. Logs and error reports need enough context to distinguish a code defect from a device, version, or data problem.

I later worked on release automation across Android and iOS, but the principle starts earlier: code should be designed to enter and leave production safely. Packaging automation cannot rescue a feature that has no fallback or compatible data path.

## Readability is operational work

Readable code is sometimes described as a courtesy to future maintainers. In a production application it also reduces recovery time. When an error reaches users, the engineer reading the module needs to locate the failed assumption before making the next release worse.

Names should expose state and intent. Side effects should be visible. Error handling should end in a defined state rather than a swallowed exception. Comments should explain a constraint that the code cannot express, not repeat the code in another language.

The same standard applies to code I wrote myself. Memory is not documentation. A module that only makes sense while its author remembers the surrounding conversation is already carrying debt.

## The standard I kept

Production Android development taught me to evaluate code over time. The useful unit is not one successful execution. It is the path from uncertain input, through state changes and platform interruptions, to a release that another engineer can inspect and change.

That standard followed me into larger features, backend work, delivery automation, and team leadership. The technologies changed. The question remained stable: when the environment stops matching the happy path, does the code still make its decision clearly?
