---
title: 'Observability after Two Million Users'
published: 2026-08-25
summary: 'Lao You reached more than two million users. At that scale, a rare condition becomes a real support problem, so mobile observability must connect application version, device state, operation identity, and user-visible outcome without collecting the user.'
tags: [Android, Observability, Software Journey]
sourceProjects: []
featured: false
order: 114
---

Lao You reached more than two million users. The source record does not say when it crossed that threshold or which observability products we used, so I will not invent either. The scale still changes the engineering question: how can a team diagnose a condition it cannot reproduce on its own devices?

The answer is not “log everything.” Mobile observability needs enough structure to connect a user-visible failure to a version, state transition, and operation while keeping personal data out of general telemetry.

## Start with an observable outcome

A crash is observable because the process ends unexpectedly. Many costly failures do not crash. A button remains disabled, a request loops, a gift never renders, a login state disagrees with the server, or a migration silently drops a setting.

Each important flow needs a defined outcome. Started, completed, cancelled, rejected, timed out, and superseded are examples. The exact set belongs to the operation. Recording only “clicked” and “error” leaves the middle invisible.

The application should emit those transitions at the module seam where the decision is known. Scattered screen logs often duplicate events or miss background paths. One operation owner can record one terminal result.

A stable operation identifier ties client transitions to backend processing without requiring payload contents in the log.

## Context should explain the code path

An error report needs the application version, build identifier, operating-system version, device class, feature configuration, and relevant module state. It rarely needs a username, message body, voice sample, token, or full server response.

Context should use bounded categories where possible. A connection result can be offline, timeout, authentication, rejected, server, parsing, or cancelled. Free-form exception text remains useful for diagnosis, but categories make rates comparable across versions.

Release and hotfix identifiers matter because two devices with the same store version may run different dynamic behavior. The active artifact identity belongs in every report produced after activation.

Logs also need size and retention limits. A mobile application can operate offline for long periods; an unbounded queue turns observability into a storage and performance defect.

## Aggregation changes priority

One stack trace describes one failure. Aggregation shows whether many failures share a fingerprint, version, device family, or rollout state.

Crash grouping is imperfect. Obfuscation changes names unless symbol mappings are preserved. Different root causes can meet at one framework frame. One root cause can produce several stacks. A group remains a starting hypothesis, not a diagnosis.

Non-crash outcomes need aggregation too. Completion rate, timeout rate, repeated retry, and state-transition violations can reveal a broken feature that never throws.

At more than two million users, raw counts can mislead. A common harmless warning may outnumber a severe failure in a small new rollout. Rates need denominators such as active sessions, attempted operations, eligible devices, or exposed users.

## Release comparison needs a baseline

A metric becomes actionable when the team can compare it with a prior stable period or an unexposed audience.

The release record should identify when an artifact entered each rollout stage. Observability can then compare crash and operation outcomes by artifact rather than by calendar day alone. Stop conditions defined before rollout prevent the team from rationalizing a bad change after seeing the data.

Sampling must preserve the failures that govern the decision. Routine success events can be sampled. Rare terminal errors, integrity failures, or security-relevant transitions may need complete capture within privacy and cost limits.

A dashboard is useful only when an owner knows what action follows a threshold. Otherwise it becomes a visual archive.

## Diagnosis needs a path back to code

A useful report identifies the module and transition that failed. Source maps, symbol files, build manifests, and artifact hashes connect runtime output to the exact code.

The engineer can then reconstruct the sequence with controlled test input. The goal is a minimal reproducer or a bounded explanation, not a guess based on one device model.

When the condition depends on stale data or an old version, the fix may live in compatibility parsing or server behavior rather than the latest screen code. Operation identity and version context keep that possibility visible.

The diagnosis should improve the observable contract. Add the missing category, invariant, or transition record that would have shortened the investigation. Avoid adding a dump of every local object.

## Observe the system, not the person

Scale increases the temptation to collect more data. It also increases the privacy cost of a bad choice.

I prefer telemetry that describes software state: artifact, capability, transition, duration, result category, and bounded device context. Sensitive content stays out unless a separate, explicit support flow requires it with consent and retention controls.

Two million users made rare software states important. It did not make each user's data an acceptable debugging resource. Good observability narrows the failure while collecting less.
