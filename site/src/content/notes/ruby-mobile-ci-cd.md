---
title: 'Building Mobile CI/CD with Ruby'
published: 2026-08-25
summary: 'I designed a Ruby pipeline that automated testing, packaging, and distribution across Android and iOS. Its useful abstraction was a release state machine with shared evidence and separate platform adapters.'
tags: [Ruby, CI/CD, Software Journey]
sourceProjects: []
featured: false
order: 109
---

Android and iOS need to follow the same release rules, but they build, sign, package, and distribute software differently. When I put those steps into one long script, a partial failure made it hard to tell which artifacts were still valid and which steps were safe to retry.

I addressed this by designing a custom Ruby CI/CD pipeline to automate testing, packaging, and distribution across both platforms. Ruby provided a concise orchestration layer. The important abstraction was a shared release policy with platform-specific work behind separate adapters.

The surviving source does not identify the CI vendor, signing service, store interface, build-time reduction, or release frequency. I will not fill those gaps with undocumented tools or numbers. The supported benefits are repeatable execution, less manual release work, verifiable release state and artifacts, and clearer failure recovery.

## Model each release as a state machine

![Ruby release state machine](/images/notes/systems/ruby-mobile-ci-cd.svg)

I modeled a release as a process with a start, guarded state transitions, and a final result rather than a script that always runs from beginning to end.

States can include prepared, built, tested, signed, approved, distributed, and failed. Each transition records its inputs and outputs and follows explicit preconditions:

- A failed test cannot produce a signed artifact.
- A signing failure does not erase an existing build record.
- A distribution retry uses the same artifact instead of rebuilding it.
- A failure on one platform does not erase a valid artifact from the other.

The simplified flow is:

```text
requested → tested → built → signed → distributed
                 ↘ failed(retryable / terminal)
```

This separation lets the pipeline resume safely. It checks the recorded state and continues only where the prerequisites still hold. If the source, configuration, or credentials have changed, it can reject the resume and require a new release attempt.

I kept the state machine in the shared Ruby layer because Android and iOS need the same release decisions even when their commands differ.

## Keep platform differences behind adapters

Android and iOS do not share packaging or signing semantics. Hiding those differences inside many conditional branches would still require every caller to understand both platforms.

I gave each platform adapter a small release request and required it to return a common artifact record:

- The Android adapter handles its build system, package type, version rules, and signing process.
- The iOS adapter handles its archive, export, provisioning profiles, and distribution rules.

The shared layer asks each adapter to prepare, build, test, sign, and publish through stable operations. It does not parse native platform logs at every workflow step. Each adapter converts its native output into a common result containing the artifact path, hash, version, and failure category.

This boundary also keeps platform changes local. A signing rule can change without forcing changes to approvals, notifications, or release records.

## Pass configuration in one direction

Mobile builds often combine repository settings, environment variables, secret storage, release parameters, and platform project files. If several layers can silently override one another, it becomes difficult to explain how an artifact was produced.

I construct one immutable release configuration at the start of the pipeline. The pipeline validates required values, records non-secret inputs, and passes the same configuration down. Later steps can read it, but they cannot reinterpret the environment or silently replace earlier decisions.

The release record stores secret references rather than secret values. An adapter resolves a credential only at the signing or upload boundary. This limits exposure and avoids writing credentials to logs.

I apply the same rule to versions. The release version and build identifiers are selected once, checked against platform constraints, and attached to every artifact and release record.

## Keep verifiable information with each artifact

A green job page is not a reliable release record. It can expire, combine several attempts, or fail to prove which file was finally distributed.

I therefore place a manifest beside each artifact. At minimum, it contains:

- Source revision
- Release configuration
- Target platform
- Version
- Artifact hash
- Completed gates
- A timestamp for each state transition

This lets a later engineer verify the file and its release path without access to the original runner.

Test results and packaging logs can remain as separate artifacts linked from the manifest. The manifest stays small enough for automated checks. After distribution, the record adds the destination and release status without changing the binary’s identity.

The common format also keeps cross-platform information consistent. Android and iOS can differ internally while answering the same questions: which source and configuration were used, which gates passed, which artifact was created, and where it was distributed.

## Turn failures into decisions

A nonzero exit status says that work stopped. It does not tell the release owner whether to retry, resume, or start again.

I classify failures by the decision they require:

- Invalid configuration
- Source build failure
- Failed tests
- Signing failure
- Unavailable external distribution destination
- Rejected upload
- Inconsistent resume state

Some failures, such as a temporarily unavailable distribution destination, can be retried safely with the same artifact. Others require a source or configuration change and must begin a new release attempt.

Each adapter converts native platform output into one of these common categories while preserving the native log for diagnosis. The shared pipeline then uses the category to allow a retry, resume, or abort.

Ruby exceptions are only an implementation mechanism. The release result is the pipeline’s external interface.

## Result, limits, and retained standard

The pipeline reduced manual release work by applying repeated release decisions in the same way across Android and iOS. A release owner could inspect one explicit state, one artifact identity, and one set of gate results instead of reconstructing the process from memory.

The surviving source does not support a specific build-time reduction, a change in release frequency, or a benefit tied to any named CI product. It also does not identify the signing services or store interfaces. I therefore limit the result to repeatable execution, verifiable state and artifacts, less manual release work, and clearer recovery from failure.

Ruby was practical for this orchestration, but the language was not the lasting lesson. I retained a small shared release interface backed by two adapters that preserve real platform knowledge. The shared layer owns the release request, configuration, artifact information, approvals, and state. Each adapter owns its platform’s commands and rules. This keeps the release policy consistent without pretending Android and iOS are the same system.
