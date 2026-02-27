---
title: 'One Release Pipeline for Android and iOS'
published: 2026-08-25
summary: 'I automated testing, packaging, and distribution for Android and iOS with Ruby. One pipeline worked because it unified release evidence and approvals while leaving signing, packaging, and store behavior inside platform adapters.'
tags: [Android, iOS, CI/CD, Software Journey]
sourceProjects: []
featured: false
order: 118
---

I designed a Ruby CI/CD pipeline that automated testing, packaging, and distribution across Android and iOS. “One pipeline” did not mean one set of platform commands. It meant one release decision supported by two platform adapters.

The source record does not preserve the internal service names or cycle-time reduction. This article focuses on the cross-platform contract that can be defended.

## Share the release request

Both platforms need a source revision, product version, target environment, release channel, and approval context. Those values belong in one immutable release request.

The request is created before either platform builds. Validation rejects missing or contradictory inputs. Each adapter receives the same product decision and converts it into platform-specific configuration.

This prevents drift such as Android and iOS shipping different feature configuration under one release label. Some platform differences remain intentional; they should be visible fields or adapter policy rather than hidden environment state.

The request contains references to credentials, never the secret values themselves. Each adapter resolves only the credentials it needs at the narrow operation that needs them.

## Keep packaging native

Android and iOS use different project systems, artifacts, signing identities, version constraints, and distribution destinations. A shared wrapper should not pretend those concepts are interchangeable.

The Android adapter owns its package build, signing, artifact verification, and upload rules. The iOS adapter owns archive, export, provisioning, signing, and its distribution rules. Each returns a common artifact record: platform, version, build identifier, source revision, file hash, and completed gates.

The shared pipeline can then compare evidence without parsing native logs. Platform diagnostics remain attached for engineers who need them.

This is a deep module when callers request “build the approved Android artifact” and do not need to know the command sequence. It is shallow when every workflow branch passes platform flags through several layers.

## Gates share meaning, not implementation

Both releases need evidence that the source builds, critical behavior passes, and the packaged artifact starts. The tests that establish those claims differ.

A shared gate name can describe the observable contract. `package-smoke` means install or launch the signed release artifact and exercise its start path. The Android and iOS adapters implement that gate with their native tools.

Results use a common status and evidence link. A missing gate is distinct from a failed gate. Approval should never treat “not run” as “passed because this platform is different.”

Platform-only gates remain explicit. Provisioning validation may belong only to iOS; an Android manifest or package rule may belong only to Android. The release summary can still show the difference clearly.

## Distribution is independently recoverable

One platform store can be unavailable while the other artifact is valid. The pipeline should preserve independent platform state under one release.

Building both artifacts again because one upload failed creates unnecessary risk. The failed distribution step can retry the same verified artifact. If product policy requires synchronized availability, the shared layer can hold both rollouts until each platform reaches the approved state.

Rollback also differs. Store controls, installed versions, and review delays are platform-specific. The common release plan records the intended response, while each adapter reports which recovery actions are actually available.

The product owner can then decide from real state rather than assuming that “stop rollout” means the same operation everywhere.

## Evidence needs a common manifest

The final release manifest should answer which source produced each artifact, which gates passed, which signing class was used, who approved distribution, and where each platform currently stands.

A parent release identifier links the Android and iOS artifact records. Each child keeps its own immutable hash and transition history. Updating an iOS upload status does not mutate the Android artifact identity.

This structure supports diagnosis after release. A support report can be tied to the exact platform artifact, while product reporting can still discuss one coordinated release.

The manifest also shows asymmetry. If one platform skipped a test or used a different feature configuration, the difference cannot hide behind a shared green status.

## One policy, two adapters

The Ruby orchestration layer earned its place by centralizing release policy: inputs, evidence, approval, state, and audit. Platform adapters retained the implementation details that genuinely varied.

Trying to erase those differences would have spread conditionals through the pipeline. Duplicating the entire pipeline would have let policy drift. The small common interface held the stable decision, and the two adapters made the seam real.

That is what “one release pipeline” means to me: one accountable product transition, with each platform allowed to remain itself.
