---
title: 'Designing APIs for Old Mobile Clients'
published: 2026-08-25
summary: 'A backend deploys once; mobile clients update over months. I learned to treat every API change as a compatibility window with explicit defaults, capability checks, and a retirement rule.'
tags: [Android, Backend, Software Journey]
sourceProjects: []
featured: false
order: 110
---

A backend can replace its code in one deployment. A mobile application cannot replace every installed client at once. API design for Android therefore includes a period when old and new clients use the server together.

My mobile work gives me the client side of this problem, while my listed backend skills give me the server vocabulary. I do not have a preserved account of one migration, so this article states the compatibility rules rather than inventing an outage.

## Add meaning before removing it

The safest API changes expand what a client may understand without changing the meaning of what it already receives.

An optional response field can be ignored by an old client. A new enum value is more dangerous because an old parser may reject it or fall into the wrong default. Changing a field from absent to `null`, or from `null` to an empty value, can alter UI behavior even when the JSON remains valid.

Compatibility needs semantic review. For each field, ask what an old client does when the value is missing, unknown, empty, duplicated, or larger than expected. The transport type is only the first constraint.

On Android, a transport adapter should contain those decisions. Unknown values become an explicit `Unknown` state or a bounded fallback. Raw server enums should not spread into screens where each feature invents its own behavior.

## Requests need tolerant evolution too

A new client may send fields that an old backend does not know. A rolling backend deployment can also place different server versions behind one endpoint.

The request parser should select accepted input and reject ambiguity. Silently accepting a field that the current server ignores can mislead the client into believing the operation used it. A response should make unsupported capability visible when it changes the result.

Default values deserve care. A server-side default can preserve old clients, but only if it matches their previous behavior. Reusing a default to introduce a new policy silently changes existing applications.

Write operations also need idempotency where a retry can duplicate effects. Compatibility across versions is useless when a timeout causes the same action twice.

## Version numbers are one tool

A versioned path can separate incompatible contracts. It also creates parallel interfaces that need maintenance, monitoring, and a retirement plan.

Small additive changes often fit one version when optionality and unknown values are designed well. A new version earns its cost when the resource meaning, authorization model, or operation semantics change enough that coexistence inside one contract becomes harder to explain.

Client version is a weak capability signal. Two builds can share a version family while differing by platform, rollout, or configuration. When a feature depends on a specific behavior, an explicit capability handshake can be clearer than a large table of version comparisons.

The server should still record application version for diagnosis and retirement analysis. It should not trust that value for security decisions.

## Feature flags need compatible off states

A feature flag can stop new behavior without waiting for an application update. That works only when both states are valid for every active client.

The off state needs a defined UI result and data behavior. Turning off a write path while leaving cached controls visible creates repeated failures. Removing a response object may crash a client that assumed it always existed.

Flags also need ownership and expiry. A permanent pile of overlapping flags creates contracts that nobody can enumerate. Each flag should name its audience, default, rollback behavior, and removal condition.

A server-controlled flag does not replace client safeguards. The application should still handle missing capability, rejected action, and stale cached state.

## Retirement requires evidence

An old contract can be removed only when its callers are gone or an explicit business decision accepts the remaining impact.

Download counts do not prove active use. Server records can show requests by application version and endpoint. The measurement window must be long enough to include infrequent users, and the identifier must remain privacy-conscious.

Retirement then follows a sequence: stop creating new dependencies, announce the boundary where relevant, measure remaining traffic, reject or redirect in a controlled way, and remove the compatibility code after the old path is quiet.

The client needs its own cleanup. Parsers, flags, and fallback branches that no longer serve an active version should disappear. Compatibility code without a retirement rule becomes permanent ambiguity.

## Compatibility is shared state

An API is shared state between server deployments and installed applications. Neither side can change its interpretation alone.

The backend owns stable semantics and observable retirement. The Android client owns tolerant parsing, explicit unknown states, and safe fallbacks. Both sides need operation identity and diagnosable versions.

This view changed how I evaluate an API change. The question is not whether the new client and new server agree. It is whether every supported pairing can still make a correct decision during the transition.
