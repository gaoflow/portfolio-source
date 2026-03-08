---
title: 'My Code Standard Changed When I Started Building Production Android Apps'
published: 2026-08-25
summary: 'After I began building Android products in August 2016, compiling and running were no longer enough. Code also had to handle lifecycle interruptions, old data, network failures, multiple client versions, and maintainers unfamiliar with the original implementation.'
tags: [Android, Software Journey]
sourceProjects: []
featured: false
order: 101
---

In August 2016, I began working on production Android development in Beijing. I quickly learned that personal programs and real products have different standards for completion.

A personal program can be good enough once it runs on my device. A production app runs across devices, system versions, and unreliable networks. It also has to handle old data and multiple client versions.

I do not have a preserved account of a dramatic first release, so I will not invent a specific incident. What I can document is how I changed my definition of finished code.

## Android does not give the app full control

The system can pause an activity, recreate a screen, restrict background work, revoke permissions, or terminate the process. The user still expects to continue the same task.

A screen therefore cannot be the only owner of important state. A network callback cannot assume its original view still exists. Background work cannot depend on a component with a shorter lifetime.

I began requiring explicit ownership for every piece of state and work: who keeps it, how long it can live, where its result goes if the destination disappears, and what minimum input is needed for recovery.

![Production Android delivery boundaries](/images/notes/systems/starting-production-android-development.svg)

## External input is also an interface

Android code receives more than method parameters. It also receives server responses, stored data from older versions, deep links, user text, permissions, locale settings, and results that may arrive at unexpected times.

Fields can be missing. Requests can finish after the user leaves. Old storage can contain values the new version no longer recognizes.

I moved validation to the boundary where uncertain input becomes application state. Beyond that boundary, feature code should rely on simpler, more stable internal values instead of repeatedly interpreting raw data in every screen.

## Small boundaries make long-term change easier

Backend fields, libraries, platform rules, and product language all change. If raw JSON flows directly into several screens, one renamed field can require changes across the app.

I came to value small adapter boundaries. A screen asks for a result instead of assembling a network request. A feature uses domain values instead of transport structures. A caller does not need to know whether data came from memory, disk, or a server.

The goal is not a more elaborate architecture diagram. It is to reduce the number of places that must change together.

## Releases and rollback belong in the design

Mobile users do not all upgrade on the same day. Some remain on old versions for a long time, so a server may need to support several client generations at once.

New behavior needs safe defaults. Stored formats need migration paths. A staged rollout needs a way to disable a feature. Error logs need device, version, and input context.

I later worked on release automation for Android and iOS, but the same limit remained: automated packaging cannot make a feature safe when it has no compatible path or rollback plan.

## Readability affects recovery

When a production problem appears, the next engineer needs to find the failed assumption quickly. Names should expose state and intent. Side effects should be clear. Errors should lead to defined states instead of being swallowed.

This applies to my own code too. Memory is not documentation. If a module only makes sense while its author remembers the original discussion, it already carries maintenance debt.

## Four questions I keep for production features

Every feature should answer at least these questions:

1. Where does the input come from?
2. Who owns the state?
3. How does it recover after a system interruption?
4. How does failure become a result the user can understand and continue from?

| Scenario | Unsafe approach | Clearer approach |
|---|---|---|
| Screen rotation | Restart the request with the activity | Give the work to a stable state owner |
| Process death | Keep the only copy of state in memory | Persist the minimum input needed for recovery |
| Network change | Treat a timeout as a business failure | Distinguish an unknown result from an explicit rejection |
| Old client version | Assume the API and app ship together | Use compatible defaults and capability checks |

These are engineering rules I developed later, not evidence of one specific incident.

## The standard I kept

Production Android taught me to evaluate code over time. One successful call is not enough. A user path should remain understandable, recoverable, and changeable through input changes, lifecycle interruptions, release upgrades, and handoffs between engineers.
