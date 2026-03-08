---
title: 'I Treat Android Lifecycle Problems as Ownership Problems'
published: 2026-08-25
summary: 'Activities, Fragments, and processes can disappear before a task finishes. I handle lifecycle problems by giving the UI, state, asynchronous work, and persistent data owners whose lifetimes match their responsibilities.'
tags: [Android, Kotlin, Software Journey]
sourceProjects: []
featured: false
order: 105
---

A user may think they are still completing the same task even though Android has destroyed and recreated the screen—or terminated the entire process.

When code treats an Activity or Fragment as the task itself, it can lose state, update a dead view, or retain resources longer than the screen.

I do not have a specific production lifecycle incident that I can cite, so I will not invent one. This is the ownership model I later adopted when reviewing Android code.

![Android ownership hierarchy](/images/notes/systems/android-lifecycle-in-production.svg)

## The UI is a temporary projection of state

The UI displays state. It should not be the only place where important state exists.

Short-lived visual details can stay in the view. Task state that must survive rotation or recreation belongs in a more stable state holder. Information that must survive process death needs a serializable representation or persistent storage.

That does not mean persisting everything. Persisting temporary state can create stale behavior and migration work. I first ask which interruption the state must survive, then choose the narrowest suitable owner.

## Asynchronous work does not automatically belong to the screen that started it

A network request often outlives the gesture that started it. The user may leave the screen, rotate the device, sign out, or start a newer request.

If work serves only the current screen, I cancel it when that screen ends. If it serves a longer task, I give the result to a longer-lived state module. If a newer request replaces an older one, I discard the older result even if it returns last.

A long-running callback that directly holds a view is risky. A safer design writes the result to a state holder, while the active UI only observes that state.

Coroutines help express cancellation and structured scopes, but they do not choose the correct owner for me. The scope should follow responsibility for the task, not the nearest convenient line of code.

## Memory leaks usually reveal mismatched lifetimes

A singleton holding an Activity, a listener left registered, or a delayed task capturing a view all have the same problem: a long-lived object references a shorter-lived one.

The garbage collector cannot fix an incorrect reference that is still reachable. The code must release it or copy only the required data into an object with the longer lifetime.

I define an unregister condition for every registration, a cancellation or expiry rule for every callback, and a capacity and eviction policy for every cache. I also require every `Context` reference to explain why its lifetime is safe.

## Process death needs a recovery policy

After process death, singletons, caches, and other in-memory objects are gone. A restored screen may still receive navigation arguments or saved state while missing the dependencies of the original task.

A task can reload authoritative data from a small identifier, continue from persisted progress, or return the user to a safe starting point. The correct choice depends on the cost and meaning of repeating the operation.

Sensitive information must not be placed in a general state bundle merely to restore the screen. Restoring the user journey and protecting credentials are separate boundaries that must both hold.

## Tests must trigger lifecycle changes

Lifecycle tests should not cover only launch-to-success paths. I deliberately test these transitions:

- Recreate the screen after entering state.
- Leave while a task is running.
- Start two requests and deliver the older result last.
- Restore using only persisted identifiers.
- Sign out while a protected operation is waiting.

I check user-visible outcomes: the latest result wins, an invalid screen is not updated, sensitive state disappears after sign-out, and a restored task either continues or restarts safely.

## The ownership table I use

| Object | Suitable owner | Common mistake |
|---|---|---|
| View / Activity | Current screen | Retained by a singleton or delayed task |
| Screen task state | ViewModel or state container | Stored only in widget fields |
| Login session | Application identity layer | Refreshed independently by every screen |
| Long-running task | Persistent task scheduler | Depends on the initiating screen remaining alive |

## The standard I keep

Lifecycle callbacks describe platform events. They do not decide where state belongs.

I align each object’s lifetime with its responsibility: the UI owns presentation, the state layer owns the task, a repository or store owns data access, and persistence holds only the minimum information that must survive process death.

When ownership is clear, rotation, background process death, and navigation become ordinary state transitions. When ownership is unclear, every callback can leave the application in a contradictory state.
