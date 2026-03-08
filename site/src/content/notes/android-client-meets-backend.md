---
title: 'When the Android Client Meets the Backend'
published: 2026-08-25
summary: 'A mobile API must tell the application whether identity is valid, a write completed, a retry is safe, and what an older client should do next.'
tags: [Android, Backend, Software Journey]
sourceProjects: []
featured: false
order: 102
---

An API is useful only when the client can make the correct decision from its response. Valid JSON is not enough. An Android application also needs to know whether to retry, ask the user to sign in, keep cached data, show a partial result, or stop.

I came to backend development from the mobile side, so I judge an interface by one question: what can the application do next with this response?

![Mobile API decision interface](/images/notes/systems/android-client-meets-backend.svg)

## Failure is part of the contract

A timeout, invalid input, expired authentication, and a server error cannot all mean “network failure.”

A timeout means the client does not know whether the server completed the operation. Invalid input means retrying the same values is pointless. Expired authentication may require a refresh or a new login. A server error should not trigger unlimited automatic retries.

When the backend returns one generic failure, the interface has to guess. I instead expect stable result categories with only the information needed for the next client decision. Internal exceptions and database details stay on the server.

## Login is not a Boolean

With concurrent requests, one request may discover an expired token while another is still in flight. A third may arrive before a refresh finishes.

If every request starts its own refresh, they race. If a failed refresh leaves old credentials in place, the application can enter a loop.

I treat authentication as a state machine: authenticated, refreshing, unauthenticated, and failed. The names are less important than the boundary: one component owns the transitions. Other requests wait for its decision or fail explicitly.

## JSON has versions

Mobile clients do not all update at once. After one server change, old application versions may remain active for months or longer.

Adding an optional field is usually safer than changing the meaning of an existing one. Removing an enum value, changing null semantics, or reusing a field can preserve valid JSON while breaking an older client’s behavior.

At the network boundary, I convert transport objects into application values. The parser handles missing fields and unknown enum values. Screens and storage use the stable internal model instead of passing raw JSON through the application.

This conversion layer also gives me a direct test seam for old, current, and partially missing payloads.

## Write retries need a stable identity

Reads are often safe to retry. Writes can create duplicate payments, messages, orders, or gifts.

After a timeout, the client does not know whether the server committed the operation. An operation ID or idempotency key must remain unchanged across retries, and the server must recognize it.

The interface can prevent rapid repeated taps, but only the server can provide the final guarantee because it sees all accepted operations.

## Logs must cross the client-server boundary

The client knows the device, application version, connection changes, and final interface state. The server knows request processing, dependencies, persistence, and the final decision.

A shared request ID or operation ID connects both sides of one action without recording credentials or personal data. Without that identifier, debugging becomes a comparison of timestamps and guesses.

## Convert responses into finite results first

The interface should not build behavior directly from HTTP status codes. I first convert each response into a small set of domain results, then let a state machine decide what happens next:

```kotlin
sealed interface SubmitResult {
  data class Accepted(val operationId: String) : SubmitResult
  data object Rejected : SubmitResult
  data object Reauthenticate : SubmitResult
  data class Unknown(val retryToken: String?) : SubmitResult
}
```

This type only illustrates the interface design. It does not claim that Lao You used these specific class names.

## The standard I kept

A backend should expose the smallest stable decision interface. The client should convert it once and explicitly handle success, rejection, authentication changes, and unknown outcomes.

Server frameworks and databases can change. What the mobile application depends on is stable meaning across failure, delay, and version changes.
