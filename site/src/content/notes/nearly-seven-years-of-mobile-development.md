---
title: 'What Nearly Seven Years of Mobile Development Changed'
published: 2026-08-25
summary: 'From August 2016 through March 2023, I moved from building Lao You’s initial core to managing mobile development around a product used by more than two million people. The enduring change was how I define a finished decision.'
tags: [Android, Leadership, Software Journey]
sourceProjects: []
featured: false
order: 120
---

When a mobile product must support real users, old versions, varied devices, and continuous releases, returning the correct value is no longer enough. Rare failures affect more people at scale, faster delivery creates more production paths, and code that only its original author can explain is difficult to maintain.

From August 2016 through March 2023, I worked in mobile software development for nearly seven years. I built Lao You from scratch and wrote 70% of its initial core code. I led a product that reached more than two million users, developed voiceprint and real-time gift features, automated Android and iOS delivery with Ruby, implemented mobile security controls, integrated React Native, built a hotfix mechanism, and later served as Mobile Application Development Manager.

The most lasting change was not learning more tools. It was redefining when an engineering decision is finished.

## I expanded “finished” from a correct return value to a real outcome

![Mobile engineering definition of done](/images/notes/systems/nearly-seven-years-of-mobile-development.svg)

Early in a project, a method that returns the expected value can feel complete. In production, the code must also handle uncertain input, lifecycle transitions, old stored state, network delay, and different release artifacts.

When an assumption fails, the user still needs a defined outcome. Even if the team cannot reproduce the problem on a device at hand, it needs enough information to understand what happened.

I therefore came to prefer modules with small interfaces and explicit terminal states. Callers should know what result they will receive and how failure appears. They should not need to understand the storage format, transport library, thread model, or rendering scheduler.

I began to define completion at four levels:

| Stage | Completion condition |
|---|---|
| Local implementation | Inputs and outputs are correct |
| Production feature | Platform interruptions and failures can be handled |
| Large-scale release | Metrics, cohorts, and stop conditions are observable |
| Team ownership | Other engineers can modify, release, and recover it independently |

I consider code finished only when the next layer can make the right decision from its result.

## More than two million users made rare failures matter

At more than two million users, a path that fails for a very small fraction can still affect many people. Device and operating-system diversity also makes local success a weak sample.

My correction was not to add defensive code without limit. It was to define clear behavioral boundaries:

- Unknown server values need an explicit state.
- Queues need limits.
- Background work needs an owner.
- Releases need stop conditions.
- Logs need to identify the artifact and operation without collecting user information.

Scale also made compatibility more important. Old mobile clients remain in use while the backend evolves. Data written by one version may outlive that version. A safe change must cover the period when old and new versions coexist and include a retirement plan.

The exact failure percentage matters less than the habit: define how the system should behave before it reaches the edge of the tested path.

## I paired faster delivery with identification and recovery

CI/CD, React Native, and hotfix delivery shorten the path from source code to users, but they also increase the number of ways a change can enter production. Speed alone does not solve this problem. Without controls, it moves waiting time from before release into diagnosis. A team may save minutes before release and lose hours afterward.

I learned to design delivery speed together with artifact identification, compatibility constraints, and rollback capability.

A release artifact should be traceable to:

- source code
- configuration
- tests
- signing
- approval

A dynamic patch should declare its compatible application versions and its last-known-good state. A JavaScript bundle should negotiate the native capabilities it depends on instead of assuming that every client exposes the same interfaces.

Recovery also needs to be designed with the feature. On mobile, rollback may mean stopping distribution, disabling behavior through a compatible server path, or shipping a corrected artifact. It does not always mean restoring an earlier copy of the code.

“We will fix it quickly” is not a recovery mechanism. A real recovery path must exist before the failure occurs.

## I narrowed my mobile security claims

I implemented code and resource obfuscation as well as SSL pinning. These controls can increase the cost of static inspection and narrow the network connections an application trusts. They cannot make an application keep permanent secrets on a device controlled by someone else.

Once I accepted that limit, I moved durable authority to the server.

The client can:

- validate input for timely feedback
- protect short-lived credentials
- report bounded risk signals

The backend is responsible for verifying:

- identity
- authorization
- operation state
- replay behavior

This also changed how I describe security work. Instead of saying broadly that an application is secure, I state which attack path a control addresses, what remains possible after implementation, and what recovery plan exists if the control fails.

Precise boundaries do not weaken a security result. They show reviewers what the control does and does not solve.

## I moved from writing core code to transferring decision-making ability

Writing 70% of Lao You’s initial core gave me extensive context and direct control. Becoming a Mobile Application Development Manager required the opposite movement: making that context inspectable and transferring control to others.

I turned that responsibility into several practical standards:

- A review should teach a reusable rule, not only identify the current problem.
- Delegation should define the outcome, constraints, required evidence, and local decision authority.
- A repeated defect should lead to a stronger interface or automated gate, not another reminder.
- Foundational code should not be safe to change only by its original author.
- Release and recovery should not depend on one person always being available.

The team becomes more capable when other engineers can change foundational code, challenge old assumptions, and release safely without waiting for the original author. My own line count can fall while overall engineering throughput rises.

This does not mean a manager no longer needs technical depth. A manager still needs to recognize lifecycle ownership, compatibility risk, release evidence, and false confidence about security. The difference is that technical depth should improve shared decisions rather than pull every implementation task back to the manager.

## I now use these questions to decide whether work is finished

Nearly seven years of mobile development changed my default questions:

- Who owns this state?
- Which old version still depends on it?
- What evidence is enough to support release?
- What happens after a timeout?
- Can a modified client grant itself authority?
- Can another engineer explain and reverse this decision?

These questions apply beyond Android. They also shaped how I later approached technical study and engineering systems: interfaces before implementation details, evidence before confidence, and a refusal path when the available information cannot support the result.

## Limits of this record

I can confirm my mobile software work from August 2016 through March 2023, my authorship of 70% of Lao You’s initial core code, my work around a product with more than two million users, and my mobile application development management responsibility.

This software period ended in March 2023. The next documented stage began in April 2023, when I studied French full time at Alliance Française de Beijing.

The available records do not account for the period from June 2024 through August 2025, and they do not support any description of a specific departure event. I will not fill those gaps with an invented transition story.
