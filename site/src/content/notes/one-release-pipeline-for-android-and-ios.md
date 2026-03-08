---
title: 'One Release Pipeline for Android and iOS'
published: 2026-08-25
summary: 'I automated testing, packaging, and distribution for Android and iOS with Ruby. One pipeline worked because it unified release evidence and approvals while leaving signing, packaging, and store behavior inside platform adapters.'
tags: [Android, iOS, CI/CD, Software Journey]
sourceProjects: []
featured: false
order: 118
---

I had to coordinate Android and iOS as one product release even though their builds, signing, artifacts, and store behavior were different. Copying two complete pipelines would let release policy drift. Forcing both platforms through the same commands would spread conditionals throughout the workflow.

I designed and implemented a Ruby CI/CD pipeline that automated testing, packaging, and distribution for both platforms. “One pipeline” meant one release decision handled by two independent platform adapters, not one set of platform commands.

![Dual-platform release strategy](/images/notes/systems/one-release-pipeline-for-android-and-ios.svg)

## Start with one release request

Before either platform started building, the pipeline created one immutable release request containing:

- Source revision
- Product version
- Target environment
- Release channel
- Approval context

Validation rejected missing or contradictory inputs. Both adapters received the same product decision and translated it into platform-specific configuration.

This prevented Android and iOS from shipping different feature configurations under one release label. Necessary platform differences became explicit request fields or adapter policies rather than hidden environment state.

The request stored credential references, never secret values. Each adapter resolved only the credentials required for the specific operation it was performing.

## Keep native build and signing behavior inside adapters

Android and iOS have different project systems, artifact formats, signing identities, version constraints, and distribution destinations. I did not use a shared wrapper that pretended these concepts were interchangeable.

The Android adapter handled:

- Gradle builds
- APK or AAB artifacts
- Package signing
- Artifact validation
- Android channel or store upload rules

The iOS adapter handled:

- Xcode builds and archives
- IPA export
- Provisioning profiles
- Signing
- iOS distribution rules

Both adapters returned the same artifact record structure:

- Platform
- Version
- Build identifier
- Source revision
- File hash
- Completed gates

The shared pipeline could compare structured evidence without parsing native logs. Platform diagnostics remained attached to the artifact record for engineers troubleshooting a failure.

I treated each adapter as a deep module. A caller could request “build the approved Android artifact” without knowing the internal command sequence. If every workflow branch had to pass platform flags through several layers, the adapter would become shallow and platform details would leak across the pipeline.

## Share gate meaning, not gate implementation

Both platforms had to show that the source built, critical behavior had been verified, and the packaged artifact could start. The tools and tests used to prove those claims were platform-specific.

I used shared gate names for observable contracts. For example, `package-smoke` meant installing or launching the signed release artifact and checking its startup path. Each adapter implemented that gate with its native tools.

Both platforms returned common gate statuses and evidence links. A failed gate and a gate that did not run remained separate states. Approval could not treat “not run” as a pass just because the platform was different.

Platform-only gates stayed explicit. Provisioning profile validation might apply only to iOS, while an Android manifest or package rule might apply only to Android. The release summary showed these differences instead of hiding them behind one shared green status.

## Correct the shared boundary

I rejected two designs that were likely to fail.

The first tried to erase platform differences. Signing, artifact formats, and store rules then became conditionals scattered across the pipeline, while callers needed to understand more platform detail.

The second duplicated the entire pipeline. That preserved native behavior but also duplicated release identity, gate meaning, approvals, and state management, allowing policy to drift over time.

I corrected the design by narrowing the shared boundary:

| Shared layer | Platform adapter layer |
|---|---|
| Release identity | Gradle or Xcode builds |
| Evidence gates | APK, AAB, or IPA artifacts |
| Approvals | Platform-specific signing identities |
| Release state and history | Platform-specific stores or distribution channels |

The Ruby orchestration layer managed stable product decisions: inputs, evidence, approvals, and state. The adapters retained implementation details that genuinely differed by platform.

## Retry distribution without rebuilding valid artifacts

Android and iOS kept independent state within the same release. One platform’s store could be unavailable while the other platform’s built and verified artifact remained valid.

An upload failure therefore did not automatically rebuild both platforms. The failed distribution step could retry with the same verified artifact, avoiding a new artifact and unnecessary risk.

If product policy required both platforms to become available together, the shared layer could hold the release until Android and iOS had both reached the approved state. Waiting did not discard either platform’s completed build, validation, or approval evidence.

Recovery also differed by platform. Store controls, versions already installed by users, and review delays affected the actions that were actually available. The common release plan recorded the intended response, while each adapter returned the recovery options available at that time. The product owner could then decide from the real platform state rather than assuming that “stop rollout” meant the same thing on Android and iOS.

This describes the failures and recovery paths supported by the pipeline. The available material does not record a specific store incident that I personally handled.

## Link two independent artifacts in one release manifest

The final release manifest answered:

- Which source revision produced each platform artifact?
- Which gates passed?
- What kind of signing was used?
- Who approved distribution?
- What was the current state of Android and iOS?

A parent release identifier linked the Android and iOS artifact records. Each platform record kept its own immutable file hash and state transition history. Updating an iOS upload status did not change the identity of the Android artifact.

This made it possible to connect later support issues to the exact platform artifact while still viewing both artifacts as one coordinated product release.

The manifest also exposed asymmetry. If one platform skipped a test or used a different feature configuration, the difference could not hide behind a shared success state.

## Result and retained limit

The Ruby pipeline coordinated Android and iOS through one release request, one set of evidence gates, shared approval rules, and a common state model. The platform adapters still handled native builds, signing, artifact validation, and distribution.

The result was:

- Android and iOS received the same product release decision.
- Each platform built, signed, and distributed its own artifact.
- A distribution failure on one platform did not invalidate the other platform’s artifact or evidence.
- Failed uploads could retry without rebuilding a verified artifact.
- Platform differences remained visible instead of being hidden by a common status.
- Product owners could coordinate one release while engineers retained each platform’s real state.

The available material does not preserve internal service names, the specific signing services, release frequency, or any measured cycle-time reduction. I therefore cannot provide those details, quantify the benefit, or claim that a particular store incident occurred.

The standard I kept was simple: a unified pipeline should not mean unified platform commands. It should share stable release policy, evidence, approvals, and state while leaving signing, packaging, and store behavior inside platform adapters. To me, one release pipeline is one accountable product transition that still respects the real constraints of Android and iOS.
