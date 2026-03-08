---
title: 'Learning Rails from the Mobile Side'
published: 2026-08-25
summary: 'Android taught me to see an API as responses and failure states. Ruby on Rails made me trace the other half: routes, transactions, authentication, and the point where server state becomes a mobile decision.'
tags: [Ruby on Rails, Backend, Software Journey]
sourceProjects: []
featured: false
order: 106
---

On Android, I could see response shapes, authentication failures, retries, and compatibility problems with old clients. I could not see how the server produced those outcomes. Rails helped me trace a request backward through routing, authentication, authorization, application rules, transactions, and persistent state.

## I traced one request across its boundaries

![Rails request lifecycle](/images/notes/systems/learning-rails-from-the-mobile-side.svg)

A response seen by a mobile client may pass through routing, identity checks, application rules, transactions, and serialization. If the operation moves to background work, the server must also expose its later state.

I summarize a create operation like this:

```text
POST /operations
  → parameter parsing and identity
  → application rules
  → database transaction
  → versioned response
  → optional background-job state
```

This separation clarified the role of each layer. A route maps an HTTP method and path to an entry point. Input adaptation, authorization, transactions, and response serialization need their own boundaries. Otherwise database fields, business rules, and the mobile contract all become tied to one controller.

## I keep controllers at the transport boundary

Rails routes name operations and connect HTTP methods and paths to application behavior. Their conventions affect how clients interpret retries, caching, and failures:

- `GET` should read without changing durable state.
- `POST` usually creates something or starts an operation.
- `PATCH` changes part of an existing resource.
- `DELETE` removes or deactivates a resource.

The design starts to fail when business decisions accumulate in controllers. Rules then depend on the whole web stack, become harder to test alone, and may be implemented differently when a second route needs the same behavior.

I treat a controller as an adapter instead. HTTP input enters on one side, the controller invokes an application rule, and a clear application result becomes an HTTP response. The controller should not make the business decision itself.

## Transactions changed what success means to me

On Android, a successful response can look like the end of an operation. Rails showed me that server-side success also depends on whether durable state changed as one complete decision.

Suppose an operation updates two records and creates an operation record. If the first update commits and the second fails, returning an error does not restore the earlier state. A transaction defines the writes that must succeed or fail together.

That distinction made me ask:

- Which facts must always remain consistent?
- Which states may become eventually consistent?
- When two requests race, which rules must the database protect?

Application validation can provide a clearer error, but it cannot replace database constraints that protect uniqueness and references.

Rails makes common persistence code concise, but that convenience can hide costs. I still need to examine the SQL-level result: query count, lock duration, transaction scope, and the difference between loading one record and loading a collection one row at a time.

A successful transaction only means that persistent state changed atomically. The mobile client may still need a stable operation ID, explicit failure types, and queryable background status.

## I separate authentication from authorization

The server must first determine who sent a request and then decide whether that identity may perform the operation. These are separate questions.

Authentication establishes a user or session. Authorization evaluates ownership, role, resource state, and policy. A logged-in user may still be forbidden from changing a particular resource.

Combining the two can produce vague errors or permissions that are too broad. Android needs stable, distinct outcomes:

- An expired session may require credential refresh or another login.
- A forbidden operation should remain forbidden after a retry.

If both return the same generic error, the client has to guess and may repeatedly enter the authentication flow.

Rails filters are useful for applying common authentication checks. Resource-specific authorization belongs close to the operation rule and should be testable without constructing a browser request.

## I treat serialization as a compatibility boundary

A Rails model usually contains more information than a mobile response should expose. Returning model objects directly can leak database field names, nullability details, internal states, and fields that later become difficult to remove.

A response serializer gives the public API its own shape. It can:

- keep fields stable while storage changes;
- omit sensitive values;
- make optional values explicit;
- verify that older Android clients can still understand the response.

The request path needs the same care. Parameters are untrusted input. The server should select accepted fields, validate their meaning, and reject ambiguous or invalid operations before they reach persistence.

This boundary lets both sides evolve at different speeds. The database serves the current backend, while the API must serve several generations of clients.

## I treat background work as a queryable state machine

Some operations take too long to keep a request open. The server can accept the work, return an operation identifier, and finish processing it in the background.

Moving work to a job does not solve the whole problem because it changes the client contract. Android needs to know whether the operation is:

- queued;
- running;
- complete;
- failed;
- safe to retry.

A job system that exposes only a permanent “processing” state gives neither the client nor the user a reliable next action.

The operation state should be durable and outlive the worker process. Retried jobs need idempotent behavior or another guard against duplicate effects. Failure must become an explicit, queryable state that clients and support staff can inspect.

I therefore see background work as another state machine with public transitions, not as a thread detached from the request.

## The standard I retained

Android showed me the consequences of backend decisions. Rails helped me divide the server path into clear boundaries: routing, input adaptation, authentication, authorization, application rules, transactions, response serialization, and background-job state.

The approaches that fail are equally clear: putting business rules in controllers, relying on application validation instead of database constraints, mixing authentication with authorization, exposing models directly, and starting background work without queryable state. The correction is to give each layer a limited and explicit promise.

Rails can generate much of this structure quickly, but engineering judgment still determines what each layer guarantees. A clear server contract lets a mobile client act without guessing, while clear client-side state handling exposes backend failures before they become user confusion.

My resume lists Ruby and Ruby on Rails, but the available information does not establish when I learned each concept, which production systems used them, or which databases were involved. This is the technical model I formed from Rails, not a reconstruction of undocumented project experience.
