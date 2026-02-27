---
title: 'Building Mobile CI/CD with Ruby'
published: 2026-08-25
summary: 'I designed a Ruby pipeline that automated testing, packaging, and distribution across Android and iOS. Its useful abstraction was a release state machine with shared evidence and separate platform adapters.'
tags: [Ruby, CI/CD, Software Journey]
sourceProjects: []
featured: false
order: 109
---

I designed a custom CI/CD pipeline in Ruby to automate testing, packaging, and distribution across Android and iOS. The language gave me a concise orchestration layer, but the main design decision was elsewhere: share the release policy while keeping platform-specific work behind adapters.

The surviving source does not name the CI vendor, signing service, build-time reduction, or release frequency. I will not fill those gaps with a fashionable toolchain. The reusable part is the pipeline interface.

## Model a release as states

A release has a start, guarded transitions, and a terminal result. Treating it as one long script makes partial failure difficult to reason about.

I prefer explicit states such as prepared, built, tested, signed, approved, distributed, and failed. A transition records its inputs and outputs. A failed test cannot produce a signed artifact. A signing failure does not erase the build evidence. A distribution retry uses the same artifact rather than rebuilding it.

This model makes resumption safe. The pipeline can inspect the recorded state and continue only from a transition whose prerequisites still hold. It can also reject a resume when source, configuration, or credentials have changed.

The state machine belongs to the shared Ruby layer because both platforms need the same release reasoning even when their commands differ.

## Platform commands stay behind adapters

Android and iOS do not share packaging or signing semantics. Hiding those differences under a single pile of conditional statements creates a shallow abstraction: every caller still needs to understand every branch.

A platform adapter should accept a small release request and return a common artifact record. Internally, the Android adapter handles its build system, package type, version rules, and signing path. The iOS adapter handles its own archive, export, profile, and distribution rules.

The shared layer asks each adapter to prepare, build, test, sign, and publish through stable operations. It does not parse platform logs in every workflow step. Each adapter converts native output into a common result with paths, hashes, versions, and failure categories.

This seam also makes platform changes local. A signing rule can change without rewriting approval, notifications, or audit records.

## Configuration needs one direction

Mobile builds often combine repository settings, environment variables, secret storage, release parameters, and platform project files. If several layers can override one another silently, nobody can explain the final artifact.

The pipeline should construct one immutable release configuration at the start. It validates required values, records non-secret inputs, and passes that configuration down. Later steps read it; they do not reinterpret the environment.

Secrets use references rather than values in the record. The adapter resolves the credential at the signing or upload seam, limits its exposure, and avoids echoing it into logs.

Version selection follows the same rule. The release version and build identifiers are decided once, checked against platform constraints, and attached to every artifact and report.

## Evidence travels with the artifact

A green job page is a weak release record. It can expire, and it may describe several attempts.

The pipeline should produce a manifest beside the artifact. At minimum it identifies the source revision, configuration, platform, version, artifact hash, completed gates, and transition timestamps. A later engineer can verify the file without access to the original runner.

Test results and packaging logs can remain separate artifacts linked from the manifest. The summary stays small enough to inspect automatically. Distribution records add destination and release status without changing the binary identity.

This evidence makes cross-platform reporting useful. Android and iOS can differ internally while still answering the same release questions.

## Failure should be typed

A script that exits with status one tells automation that work stopped. It does not tell a release owner what may happen next.

Failures can be grouped by decision: invalid configuration, source build failure, test rejection, signing failure, unavailable external destination, rejected upload, or inconsistent resume state. Some are safe to retry with the same artifact. Others require a source or configuration change and therefore a new release attempt.

The adapter translates platform output into one of these categories and preserves the native log for diagnosis. The shared pipeline uses the category to decide whether retry, resume, or abort is allowed.

Ruby exceptions are implementation mechanics. The release result is the interface.

## Automation protects attention

The pipeline reduced manual release work by executing repeated decisions the same way across Android and iOS. The source record does not support an exact time reduction, so the claim stops there.

The deeper benefit was reviewability. A release owner could inspect one state, one artifact identity, and one set of gate results. Platform knowledge remained necessary inside each adapter, while common policy stopped depending on memory.

Ruby was a practical language for that orchestration. The durable design was a small shared release interface with two real platform adapters behind it.
