---
title: 'Judging New Technology through GDG Beijing'
published: 2026-08-25
summary: 'I helped organize GDG Beijing from 2015 through March 2023, including free events with more than 200 attendees. Community attention taught me where to look; production constraints taught me what to adopt.'
tags: [GDG, Community, Software Journey]
sourceProjects: []
featured: false
order: 119
---

I served part-time as a core organizer of Google Developer Group Beijing from November 2015 through March 2023 for this series. The events were free, regularly drew more than 200 attendees, and included experts from Google and Silicon Valley.

That community work exposed me to new technology early. It also taught me that an engaging talk, a crowded room, and a useful production decision are three different forms of evidence.

## A talk reveals a question

A strong technical talk can show that a problem has a new solution shape. It can explain an interface, demonstrate a workflow, and expose tradeoffs that documentation hides.

It cannot prove that the solution fits my product. A demonstration controls device, data, network, team knowledge, release path, and time. Production inherits all the conditions the demonstration leaves out.

I learned to leave an event with a question rather than a verdict. Which existing constraint does this technology remove? Which new runtime, dependency, skill, or failure mode does it add? What small test would expose the largest unknown?

That framing preserves the value of community learning without turning attention into adoption pressure.

## Adoption needs a named problem

A technology proposal should begin with a current cost. Slow UI iteration, duplicated platform work, unsafe release steps, broad module coupling, or poor diagnosis are concrete problems. “Modernize the stack” is not.

The cost needs evidence. How often does the problem occur? Which users or engineers feel it? What does the current workaround consume? A precise baseline lets a prototype compete with the existing system rather than with an idealized blank project.

The proposed technology then gets one job. If it claims to reduce delivery time, measure the complete path through build, test, integration, and review. If it claims cross-platform reuse, include the native bridge and platform exceptions. If it claims performance, exercise the packaged application on representative devices.

A small win on the named problem supports the next test. A full rewrite needs more evidence.

## Community maturity differs from product maturity

A healthy community can answer questions, publish examples, and find defects quickly. That reduces adoption risk. It does not guarantee stable interfaces or a release policy that matches a long-lived mobile product.

I look for maintenance ownership, upgrade notes, compatibility policy, security response, and examples that cover failure paths. Repository activity is useful when it connects to those responsibilities; a high count alone says little.

The team also matters. A technology with strong external support can still be a poor fit if nobody can review its production behavior. Training and ownership belong in the adoption cost.

Community events help identify people who have operated the technology beyond a demo. Their failure stories are often more valuable than another feature list.

## A prototype should be disposable

The cheapest useful prototype answers one risky question and can be deleted.

For a mobile technology, that may mean integrating one bounded screen, measuring package and startup cost, exercising process recreation, or passing one release artifact through the existing pipeline. The prototype should touch the difficult seam early. Building only the happy UI postpones the decision.

A prototype needs rejection criteria. If bridge errors remain untyped, if the artifact exceeds a budget, or if old clients cannot coexist, the result can be “do not adopt.” That is progress because the team paid a small amount for a clear boundary.

Production code comes later, after the interface and operational cost are known. Keeping prototype shortcuts out of the main architecture prevents curiosity from becoming accidental commitment.

## Timing is part of correctness

A technically sound choice can still be wrong during a critical release, team transition, or unresolved incident.

Adoption consumes review attention and creates two systems during the transition. The current platform must remain maintainable until the new path proves it can replace the old one. A clean cutover requires callers, tooling, documentation, and recovery to move together.

Waiting also has cost. A small compatibility adapter or isolated new module can create a reversible entry point when the evidence is strong enough. The decision should state why now, why this scope, and what ends the experiment.

## Community expands options; engineering narrows them

GDG Beijing gave me broad exposure and direct contact with people exploring new tools. Production mobile work supplied the filters: user impact, compatibility, release evidence, team ownership, and recovery.

I no longer ask whether a technology is exciting or popular. I ask which observed problem it solves, what proof would change my mind, and whether the team can remove it if the answer is no.

Community helps me find possibilities. Engineering decides which possibility earns a place in the product.
