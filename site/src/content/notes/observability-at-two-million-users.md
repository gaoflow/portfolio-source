---
title: 'Observability after Two Million Users'
published: 2026-08-25
summary: 'Lao You reached more than two million users. At that scale, a rare condition becomes a real support problem, so mobile observability must connect application version, device state, operation identity, and user-visible outcome without collecting the user.'
tags: [Android, Observability, Software Journey]
sourceProjects: []
featured: false
order: 114
---

Lao You has more than two million users. At that scale, a condition affecting only a small percentage of users can become a real support problem. My challenge is to identify the version, state transition, and operation involved when I cannot reproduce the condition on my own device.

I can confirm the user count, but not when Lao You crossed that threshold. I also have no documented incident, crash rate, or observability product to cite. I will not invent those details or claim unproven improvements from operating at this scale.

My lesson is not to record everything. I need the shortest useful chain from a user-visible outcome to the context that explains the code path, then to an exact build. Usernames, message bodies, and voice content do not belong in that chain.

## Start with what the user actually saw

![Mobile observability correlation chain](/images/notes/systems/observability-at-two-million-users.svg)

Crashes are easy to notice because the process ends unexpectedly. Many costly failures do not crash:

- a button stays disabled;
- a request enters a loop;
- a gift never renders;
- the login state disagrees with the server;
- a migration silently drops a setting.

I define explicit outcomes for important flows. Depending on the operation, these can include started, completed, cancelled, rejected, timed out, and superseded.

Recording only “clicked” and “error” is not enough. It hides the intermediate steps, so I cannot tell where the operation stopped. Scattering logs across screens also creates duplicate events while missing background paths.

I instead record state transitions at module boundaries, where the decision is clearest. One clear operation owner records one terminal result rather than letting several screens describe the same action.

A stable operation ID connects client transitions with backend processing without storing request payloads or user content.

## Keep only the context that explains the code path

A diagnostic event can include:

- application version;
- build ID;
- operating-system version;
- device class;
- feature configuration;
- relevant module state;
- operation ID;
- terminal state.

It usually does not need:

- usernames;
- message bodies;
- voice samples or voice content;
- tokens;
- complete server responses.

Each correlation key answers a different question:

| Correlation key | Question it answers |
|---|---|
| build ID | Which code produced this event? |
| operation ID | Which steps belonged to the same user action? |
| release cohort | Does the new release differ from the stable baseline? |
| state transition | Where did the operation stop? |
| artifact hash | Do the symbols and source match? |

I use bounded categories where possible. A connection result might be offline, timeout, authentication, rejected, server, parsing, or cancelled. Free-form exception text can still help diagnosis, but stable categories make rates comparable across versions.

Release and hotfix IDs matter too. Two devices with the same store version can behave differently because of a dynamic release or hotfix. Every event produced after activation should include the active artifact ID.

Mobile applications can remain offline for long periods. If a log queue has no capacity or retention limit, observability becomes its own storage and performance defect. I therefore limit both queue size and event age.

## Use aggregation to judge impact

One stack trace describes one failure. Aggregation can show whether failures concentrate around the same fingerprint, application version, device family, or rollout state.

Crash grouping is only an initial hypothesis:

- obfuscation changes names unless symbol mappings are preserved;
- different root causes can converge on the same framework frame;
- one root cause can produce several stacks.

I also aggregate non-crash outcomes. Completion rates, timeout rates, repeated retries, and invalid state transitions can reveal a broken feature that never throws an exception.

With more than two million users, raw counts are easy to misread. A frequent but harmless warning may outnumber a severe failure in a small new rollout. A rate needs an appropriate denominator, such as:

- active sessions;
- attempted operations;
- eligible devices;
- users exposed to the feature.

Two million users make low-probability failures relevant to many real people. However, without a documented incident or monitoring data, I can describe this method but cannot give actual improvement figures.

## Compare releases against a baseline

A metric becomes actionable only when I can compare it with a previous stable period or an audience that was not exposed to the release.

The release history should record when an artifact entered each rollout stage. I can then compare crashes and operation outcomes by artifact instead of relying only on calendar dates.

I define stop conditions before rollout. Otherwise, unfavorable data can invite explanations for continuing rather than applying the original standard.

Sampling should not treat every event equally. Routine success events can be sampled to control cost. Rare terminal errors, integrity failures, and security-relevant transitions may need complete capture where privacy and cost limits allow it.

A dashboard is useful only when someone knows what action follows a threshold. Without a defined action, it is only a visual archive.

## Keep a path back to the exact code

A useful event identifies the module and state transition that failed. Source maps, symbol files, build manifests, and artifact hashes connect runtime output to the exact code.

From there, I can reconstruct the sequence with controlled test input. The goal is a minimal reproducer or a bounded explanation, not a guess based on one device model.

If a condition depends on stale data or an older version, the fix may belong in compatibility parsing or server behavior rather than the latest screen code. Operation IDs and version context keep that possibility visible.

Each diagnosis should improve the event design. If an investigation lacks a category, invariant, or state transition, I add that missing signal so the next investigation can be shorter. I do not correct the gap by dumping every local object, which would increase noise, cost, and privacy risk.

## Observe the software, not the person

Scale increases the temptation to collect more data, and it also increases the privacy cost of a poor decision.

I prefer telemetry that describes software state: artifact, capability, transition, duration, result category, and bounded device context. Sensitive content stays out of routine telemetry. It should be handled only through a separate, explicit support flow with user consent and retention controls.

Two million users make rare software states important. They do not make each user’s data an acceptable debugging resource. My retained standard is to narrow the failure while collecting less.
