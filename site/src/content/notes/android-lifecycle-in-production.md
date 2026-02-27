---
title: 'Android Lifecycle Rules in Production Code'
published: 2026-08-25
summary: 'Android can replace a screen or process while the user still thinks the same task is open. The engineering response is explicit ownership: state, asynchronous work, and resources must each have a lifetime that the code can explain.'
tags: [Android, Kotlin, Software Journey]
sourceProjects: []
featured: false
order: 105
---

Android can destroy and recreate a screen while the user still believes the same task is open. Code that treats an Activity or Fragment as the task itself will eventually lose state, update a dead view, or retain resources beyond their useful life.

My listed mobile stack includes Java and Kotlin, and the software period in this series began in 2016. I do not have a source-backed incident report for a particular lifecycle failure. The useful account is the model I use to reason about production Android code: every state value, operation, and resource needs an owner whose lifetime matches the work.

## A screen is a temporary projection

A screen displays application state. It should not be the only place where durable task state exists.

Configuration changes can recreate the UI. Navigation can remove it. The process can disappear while the application is in the background. If a user has selected values, loaded a result, or started a multi-step task, the code needs to decide which part survives each event.

Short-lived display details can stay with the view. State needed across recreation belongs in a longer-lived state holder. State needed after process death requires a serializable representation or persistent storage. State owned by the server should be fetched again or reconciled through a defined cache policy.

The mistake is to make everything durable. Persisting transient state creates stale behavior and migration work. The design should classify state by the failure it must survive, then choose the narrowest owner that survives it.

## Asynchronous work needs a lifetime

A request often outlives the gesture that started it. The user can navigate away, rotate the device, sign out, or start a newer request before the first one completes.

The completion handler needs a rule for each case. If the work serves only the current screen, cancel it when that screen ends. If it serves a longer task, move ownership to a module with that lifetime. If a newer request supersedes it, discard the older result even if it returns last.

This is why a reference to a view inside a long-running callback is risky. The callback remembers an object whose lifecycle it does not control. A safer path publishes a result to a state owner; the current UI observes that state only while active.

Coroutines make cancellation and structured ownership easier to express, but syntax does not choose the correct owner. Launching work in a convenient scope can still give it the wrong lifetime. The scope should follow the operation, not the nearest line of code.

## Memory leaks are ownership errors

A memory leak often means that a long-lived object holds a reference to something shorter-lived. A singleton stores an Activity. A listener remains registered after the screen ends. A delayed task captures a view. A cache retains an object whose contents should have been converted into a smaller value.

The garbage collector cannot repair an ownership rule that the object graph contradicts. The code must release the reference or move the required data into an object with the correct lifetime.

This framing makes leak prevention more concrete. For every registration there is an unregister condition. For every callback there is a cancellation or staleness rule. For every cache there is a size and eviction policy. For every context reference there is a reason that its lifetime is safe.

Tools can reveal retained objects, but the fix comes from understanding why the reference remained reachable.

## Process death is part of the contract

Applications often test recreation but assume the process will remain alive. Android makes no such promise.

After process death, in-memory singletons and caches are empty. The restored screen may receive navigation arguments or saved state, but any object that existed only in memory is gone. Code that restores half of a task can be more dangerous than code that restarts it, because the interface looks valid while its dependencies are missing.

A production task needs an explicit restoration policy. It may reconstruct itself from small identifiers, reload authoritative data, resume from persisted progress, or return the user to a safe start. The right answer depends on the cost and semantics of repeating the operation.

Secrets and credentials need separate treatment. Saving UI state provides no reason to serialize sensitive values into a general state bundle. Restoration must preserve the security boundary as well as the user journey.

## Lifecycle tests should force transitions

A happy-path UI test rarely proves lifecycle behavior. The test has to trigger the transition the code claims to handle.

Recreate the screen after entering state. Navigate away while work is active. Return after the result completes. Start two requests and deliver the older one last. Restore with only persisted identifiers. Sign out while a protected operation is waiting.

These tests defend observable outcomes: the latest result wins, a removed screen is not updated, sensitive state disappears after logout, and a restored task either resumes correctly or restarts safely. They do not need to assert internal callback counts or framework details.

The same scenarios improve code review. Instead of asking whether a scope or state holder is fashionable, ask which transition it survives and which result the user sees.

## Ownership is the lifecycle model

Android lifecycle callbacks describe platform events. They do not decide where application state belongs.

The design work is to align lifetimes. Screens own presentation. State holders own task state. repositories or stores own data access. Persistent storage owns only data that must survive the process. Long-running work lives with the task it serves.

When those ownership rules are explicit, lifecycle events become ordinary transitions. When they are implicit, every callback becomes a chance for the application to contradict itself.
