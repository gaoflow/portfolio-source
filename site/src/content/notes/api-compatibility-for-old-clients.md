---
title: 'Designing APIs for Old Mobile Clients'
published: 2026-08-25
summary: 'A backend deploys once; mobile clients update over months. I learned to treat every API change as a compatibility window with explicit defaults, capability checks, and a retirement rule.'
tags: [Android, Backend, Software Journey]
sourceProjects: []
featured: false
order: 110
---

A backend can replace its code in one deployment, but a mobile application cannot replace every installed client at once. An Android API change can create a compatibility window lasting months. During that time, old and new clients share the server, which may itself be rolling out multiple versions.

My long Android experience gives me the client view of this problem, while my listed backend skills give me the server terminology. I do not have a preserved record of one complete API migration, so I will not present a specific failure, fix, or result as my own experience. These are the compatibility rules I retain.

## Define the compatibility window first

![Compatibility window for old clients](/images/notes/systems/api-compatibility-for-old-clients.svg)

The window is defined by both deployed servers and old clients that remain active. Before retiring a field or endpoint, I need to define its new meaning, compatible defaults, capability checks, and the data that will prove old callers are gone.

I do not ask only whether the new client works with the new server. I check every supported combination:

- old client with old server;
- old client with new server;
- new client with old server;
- new client with new server;
- different server versions running behind the same endpoint.

Compatibility works in both directions. The server must handle old clients that omit new fields and decide what to do with unknown fields from new clients. The client must handle missing response fields, expanded enums, and disabled capabilities.

## Additive changes can still break clients

A relatively safe change adds information without changing the meaning of existing information. An old client can often ignore an optional response field, but not every additive change is safe.

Old clients may fail when:

- a new enum value is rejected or reaches the wrong default branch;
- an absent field becomes `null`;
- a `null` field becomes an empty value;
- an existing field keeps its format but changes meaning;
- a value is duplicated, unknown, or outside the expected range.

For each field, I consider what happens when it is missing, unknown, empty, duplicated, or larger than expected. Valid JSON proves only that the transport format is valid, not that application behavior remains correct.

On Android, I keep these decisions in the transport adapter. Unknown values become an explicit `Unknown` state or a clearly bounded fallback. I do not let raw server enums spread through screens, where each feature could invent a different default.

## Evolve requests gradually

Responses are only half of the contract. A new client may send fields that an old backend does not recognize, and a rolling deployment may place different server versions behind one endpoint.

A request parser should select accepted input and reject ambiguity. If a server silently accepts a field that it ignores, the client may believe that field affected the operation. When an unsupported capability would change the result, the response should state that it was not applied.

A new request field can use a server-side default for old clients, but that default must match their previous behavior. Using the default to introduce a new policy silently changes existing applications. A new field should not become required immediately.

Writes also need safe retries. If retrying after a timeout can perform the same operation twice, field and version compatibility are not enough. Writes with duplicate effects need idempotency and an identifier that recognizes the same operation.

## Add a version only for a truly incompatible contract

A versioned path can isolate an incompatible contract, but it also creates parallel interfaces that must be maintained, monitored, and retired.

Small additive changes can usually remain in one version when optional fields, defaults, and unknown values are designed clearly. A new version is worth the cost when resource meaning, authorization, or operation semantics change so much that old and new behavior can no longer coexist clearly.

A client version number is only a weak capability signal. Two builds in the same version family may differ by platform, rollout group, or configuration. When a feature depends on specific behavior, I prefer an explicit capability handshake to a large table of version comparisons.

The server should still record application versions for diagnosis and retirement decisions. It must not trust a client-supplied version for security decisions.

## Give every feature flag a safe off state

A feature flag can stop new behavior without waiting for an application update, but only if every active client works correctly with the flag both on and off.

The off state needs defined UI and data behavior:

- If the write path is disabled while cached controls remain visible, users will repeatedly encounter failures.
- If a response object disappears while an old client assumes it exists, the application may crash.
- If a capability is unavailable, the client needs a clear alternative state instead of repeatedly attempting an impossible action.

Each flag should define its audience, default, rollback behavior, owner, expiry, and removal condition. Permanent, overlapping flags eventually create contracts that nobody can fully explain.

A server-controlled flag does not replace client safeguards. The application must still handle missing capabilities, rejected operations, and stale cached state.

## Prove old callers are gone before removal

I cannot infer retirement from release dates or download counts. Downloads do not prove active use, and a release date does not mean every user has updated.

Server records can show endpoint requests by application version. The measurement window must be long enough to include infrequent users, and any identifier used for measurement must respect privacy.

I remove an old contract only when its callers are gone or the business explicitly accepts the remaining impact. The sequence is:

1. Stop creating new dependencies on the old contract.
2. Announce the support boundary where appropriate.
3. Measure the remaining traffic to the old path.
4. Reject or redirect requests in a controlled way.
5. Confirm that the old path receives no more traffic.
6. Remove the server-side compatibility code.

The client also needs cleanup. Parsers, feature flags, and fallback branches should be removed once they no longer serve any active version. Compatibility code without a retirement rule becomes permanent ambiguity.

## Treat compatibility as shared state

An API is shared state between server deployments and installed applications. Neither side can change its interpretation alone.

The backend must provide stable semantics, compatible defaults, and a measurable retirement process. The Android client must parse responses tolerantly, represent unknown states explicitly, and provide safe fallbacks. Both sides need operation identifiers and version information that supports diagnosis.

The standard I retain is not merely that the new client and new server agree. Every supported combination must continue making correct decisions throughout the transition. Versions and feature flags are tools; compatibility depends on field meaning, default behavior, capability checks, idempotency, and evidence-backed retirement rules.
