---
title: "Lights Out, part 3: running the nightshift"
date: 2026-08-11 09:00:00
tags:
 - AI
 - Agentic coding
 - Software development
 - Developer tools
 - Productivity
---

## Meet Dobby

We named our agent Dobby, after the house elf in Harry Potter. It was meant as a joke and turned out to be the most accurate architecture decision we made all year. Dobby is tireless, eager to please, occasionally does the wrong thing with enormous enthusiasm, and, crucially, he is a free elf. He has his own identity, his own set of clothes, and a very short list of things he is actually allowed to do. He works while we sleep.

<figure style="max-width:480px;margin:2rem auto;">
  <img src="/images/dobby/dobby.gif" style="width:100%;height:auto;border-radius:8px;">
  <figcaption style="text-align:center;font-size:0.85rem;color:#6b7280;margin-top:1rem;">Dobby. Tireless, eager, and a free elf.</figcaption>
</figure>

The two previous posts in this series argued that the adoption question is settled and that the discipline you already know is what makes agents useful. This post is the operational one. It is about what it actually takes to have an agent do real work overnight, and about the least glamorous truth of the whole endeavour: the hard part was never the agent.

Let me start with the anti-pattern, because most teams are living in it and calling it adoption.

## Stop working the casino floor

Walk through most engineering orgs that have gone agentic and you will see the same thing. A developer with three terminals open, an agent running in each, and a human whose entire job has quietly become pressing Enter. Approve this command. Approve that edit. Yes, continue. Yes, continue. Yes, continue.

<figure style="max-width:640px;margin:2rem auto;">
  <img src="/images/dobby/casino.gif" alt="" style="width:100%;height:auto;border-radius:8px;">
  <figcaption style="text-align:center;font-size:0.85rem;color:#6b7280;margin-top:1rem;">Engineers are nowadays much like old people in the casino, just slamming the enter button.</figcaption>
</figure>

I call these the casino developers. They are sitting at three slot machines at once, pulling levers, occasionally getting a payout, mostly feeding the machine. It feels like leverage because there is a lot of motion and the tokens are flying. But look at what the human is doing. They are the bottleneck, the babysitter and the audit trail all at once, and they are doing all three badly, because you cannot supervise three streams of confident output at machine speed. Karpathy's warning from part 1 lands here. The discrimination muscle is the only one being used, and it is being used past exhaustion.

Synchronous agentic coding is a trap. It caps your throughput at exactly one distracted human's attention, it turns your best engineers into approval clerks, and it produces the specific brand of plausible garbage that makes people conclude the tools do not work.

The alternative is asynchronous agentic coding. You do not sit next to the agent. You give it a well formed unit of work, a place to do it, an identity to do it with, and a way to hand the result back for review. Then you walk away and do something a human is actually good at. The agent's output arrives as a pull request, on its own schedule, to be reviewed like any other pull request. Nobody pulls a lever. Nobody hits Enter at 2 a.m.

<figure style="max-width:760px;margin:2rem auto;">
  <img src="/images/dobby/dobby_async_task.png" alt="" style="width:100%;height:auto;border-radius:8px;">
  <figcaption style="text-align:center;font-size:0.85rem;color:#6b7280;margin-top:1rem;">Dobby working an asynchronous task on its own, producing a pull request without a human pressing Enter.</figcaption>
</figure>

Everything below is what walking away actually requires. It is more than it sounds.

## The sandbox is the workplace

You cannot walk away from an agent running on your laptop. You just can't. Part 2 spent a whole post on why: the laptop holds your SSH keys, your cloud sessions, your `.env` files, and an agent acting with your identity is one poisoned issue comment away from being an exfiltration tool. Async coding is impossible to do safely on the host, because async means unsupervised, and unsupervised on the host is the Replit story on a timer.

So the first thing Dobby needs is a workplace that is not your machine. You can buy this off the shelf. [Coder](https://coder.com/), [Daytona](https://www.daytona.io/), [Firecracker microVMs](https://firecracker-microvm.github.io/), [Dev Containers](https://containers.dev/) and a plain Kubernetes pod farm all get you there. We ended up building our own, for reasons I will come back to at the end, but the plumbing is not the point. The point is that Dobby's workplace is:

- **Disposable.** Spun up per task, torn down after. A compromised workspace has a lifespan measured in the length of one job, not one laptop's career.
- **Reproducible.** This is where prebuilt images earn their keep. Dobby does not `apt-get` his way to a working environment at midnight and hope the network holds. We ship him prebuilt Docker images that contain the entire stack: language runtimes, build tools, linters, the test harness, the database he tests against, the whole lane from part 2 already painted on. When Dobby starts a job, the bumpers are already up. He is not assembling the bowling alley, he is bowling.
- **Actually able to build the thing.** Here is the wrinkle nobody warns you about. Containers are great until you need to build an iOS app, and Apple's toolchain does not live in a Linux container. So one of Dobby's workspaces is a Mac Mini sitting on a shelf, enrolled as a build node, running Xcode. Same identity model, same guardrails, same disposability where we can manage it, but real Apple silicon, because you cannot `docker run` your way to a signed `.ipa`. If your product touches native mobile, plan for this early. It is the one part of the setup that is physical.

The mental model to hold: you are not giving an agent access to your environment. You are giving it its own environment, purpose built, and treating everything it touches as radioactive.

## The workplace is hostile, so assume it

Now the uncomfortable part, and it is a direct callback to part 2. Dobby's sandbox is not a safe room. It is a hostile environment, and you should design it as though it is already compromised, because by construction it very nearly satisfies all three legs of [Simon Willison's lethal trifecta](https://simonwillison.net/tags/lethal-trifecta/):

1. **Access to private data.** It has your source code checked out, and often more.
2. **Exposure to untrusted content.** Its entire job is reading things people wrote: issue descriptions, PR comments, dependency READMEs, third party API errors, web pages. Any of those can carry instructions.
3. **The ability to communicate externally.** It needs to push branches, call your package registry, hit your APIs.

An agent doing useful work wants all three. That is the whole problem. So the design rule is not prevent the trifecta, you can't, not without lobotomising the agent. The rule is assume the sandbox is hostile and make a full compromise boring. Scoped, short lived credentials only. Egress restricted to an allowlist and logged, and remember from part 2 that the allowlist is itself attack surface. The OpenAI and Hugging Face escape went straight through the one hole they deliberately left. Put nothing in that box you would mind an attacker reading, because you should assume an attacker eventually will. The blast radius of a fully owned Dobby workspace should be one branch, on one repo, that a human still has to review before it goes anywhere.

Which is the perfect segue, because the single most important control is who Dobby actually is.

## Give Dobby his clothes: a scoped identity

In the books, Dobby becomes free the moment he is handed clothes of his own. In our setup, the clothes are a GitHub App.

This is the decision I would fight hardest for if I could only keep one. Dobby does not act as a human. He does not borrow a developer's personal access token. He does not run as a shared service account with the accumulated permissions of a decade. He is his own first class identity, and that identity is scoped down to the exact list of things he needs and nothing else.

Concretely, our Dobby App can:

- Read repository contents and clone.
- Create branches and push to them.
- Open pull requests and comment on them.
- Read issues and project boards.

And, deliberately, our Dobby App cannot:

- **Merge a pull request. Ever.** This is the prohibition everything else rests on. Dobby proposes; a human disposes. The accountability question from part 1, who is responsible when an agent authored the commit, has exactly one clean answer, and it is enforced in the permission model, not in a policy PDF nobody reads. The human who clicks merge owns the change. Full stop.
- Push to protected branches directly.
- Change repository settings, secrets or access.
- Touch anything in production.

A separate machine identity with least privilege is not a new idea. It has been on every cloud governance maturity model for a decade, as I complained in part 2. What is new is that it now carries real weight. When your automation could only run scripts you wrote, an over privileged bot was a latent risk. When your automation is a fast, tireless, remotely suggestible actor reading hostile text all night, that over privileged bot is an incident with a start time. Give the elf his clothes, and hand him as few as he can do the job in.

## How Dobby wakes up: triggers, not babysitting

The casino developer is the trigger. Nothing happens unless a human is pulling the lever. Async means the work has to start itself. Dobby wakes up in exactly three ways:

**Event triggered.** GitHub webhooks. A new issue is labelled for him. A PR gets a review comment asking for a change. A build goes red. Something happens in the repo, and Dobby responds to it, the way a colleague would react to a notification, except he reacts at 3 a.m. and you find out in the morning.

**Chat triggered.** Slack. Someone types a request in a channel, "Dobby, the date formatting on the reports page is off by a day, can you take a look", and he picks it up, opens an issue for himself if there isn't one, and gets to work. This is the lowest friction on ramp and the one non engineers reach for.

**Routine triggered.** Cron. Every weekday at a fixed time, and on a weekly cadence for the housekeeping. This is where the nightshift and the chores live, and I'll come back to both. The routine triggers are the ones that make Dobby feel less like a tool you invoke and more like a member of the team who has standing responsibilities.

<figure style="max-width:820px;margin:2rem auto;">
  <img src="/images/dobby/flow.png" alt="" style="width:100%;height:auto;border-radius:8px;">
  <figcaption style="text-align:center;font-size:0.85rem;color:#6b7280;margin-top:1rem;">Flow diagram of the three ways Dobby is triggered: GitHub events, Slack chat, and routines on a schedule.</figcaption>
</figure>

## The loop: work, review, work again

Here is the mechanism that separates an agent that compounds from an agent that generates work for you.

When Dobby picks up a task, he does not do it once and hand it over. He runs a multi stage loop inside the sandbox before you ever see the output. Do the work. Then switch hats and review that work against an explicit rules checklist: our coding standards, the definition of done, the lint and type gates, and critically, does the test suite actually pass. If the review fails, go back and do the work again. Repeat until it checks out. Only then does a pull request appear.

This is the practical payoff of the bowling lane from part 2. A fast, trustworthy test suite is not there to catch Dobby's mistakes for you. It is there so Dobby can catch his own mistakes and iterate without you. The review stage is the agent grading itself against the bumpers, over and over, at machine speed, in a box you don't have to watch. The difference between this and the casino floor is the whole game: you are delegating the inspection too, not just the typing. What lands in your inbox in the morning is not a first draft. It is a draft that already failed and fixed itself several times overnight.

We run the reviewer as a genuinely separate pass with a genuinely adversarial prompt. Its job is to reject, not to bless. An agent asked "is this good?" says yes. An agent asked "find everything wrong with this against these rules" earns its keep. The output that survives that is not perfect. But it is reviewable, and reviewable is the bar.

*(Getting this loop to behave, the prompts, the checklist, the failure modes, the ways Dobby learned to game his own reviewer, is a whole post in itself. That is **Lights Out, part 4: the lessons learned from configuring a coding agent.** It is the most hard won of the series and it is coming next.)*

## The hard part was never the agent

Now the confession the whole industry is dancing around.

Standing all of the above up, the sandbox, the images, the Mac Mini, the GitHub App, the triggers, the loop, took us weeks. Keeping Dobby usefully busy takes us every single day, and it is the actual job now. The bottleneck in asynchronous agentic coding is not the agent's ability to do work. It is your organisation's ability to specify work well enough to hand off.

This is the thing nobody tells you. When your throughput is no longer bounded by typing speed, it becomes bounded by the quality and quantity of well formed units of work in your backlog. And most backlogs are not that. Most backlogs are a graveyard of one line tickets that mean something only to the person who wrote them, half of which are actually three tasks in a trench coat. A human engineer papers over that with context and a hallway conversation. Dobby cannot have a hallway conversation. He needs the work to be legible.

So the real project became the backlog. We structure it as a strict hierarchy, EPIC then Feature then Issue, and the shape matters, because Dobby works at the leaves. An EPIC is a business outcome. A Feature is a slice of it. An Issue is a single, self contained, testable change. Dobby is not handed EPICs. He is handed leaf node issues that have been ground down to something a tireless junior with no hallway access can actually complete.

Two techniques do the grinding:

- **[Grill-me](https://www.aihero.dev/skills-grill-me).** Before an idea becomes a Feature, we grill it. Relentlessly, adversarially, out loud: what does this actually mean, what breaks, what is the edge case you are waving away, what does done look like, why is this even valuable. It is uncomfortable and it is the point. Half formed ideas die here instead of dying as three of Dobby's confidently wrong PRs. If you cannot survive being grilled about a Feature, it is not ready to be one.
- **[Wayfinder](https://www.aihero.dev/skills-wayfinder).** Once a Feature survives grilling, we use it to chart the path from the fuzzy outcome down to the concrete leaf issues, decomposing until each leaf is small enough, specified enough and independent enough that it could be picked up cold. Wayfinding is the difference between "improve the reports page", which Dobby will interpret in six directions at once, and a stack of issues each doing one knowable thing.

Then the leaves that are genuinely ready, small, specified, testable, low blast radius, get a label: **`GoodForDobby`**. That label is a promise. It means a human has already done the thinking, the decomposition and the grilling, and is confident this can be handed to an unsupervised agent overnight and come back reviewable. Not every issue earns it. The ones that do are Dobby's queue.

Notice what has happened here. The agent didn't eliminate the engineering work. It relocated it, up the stack, out of the editor and into specification, decomposition and review. That is a different job than most developers signed up for, and pretending otherwise is how you end up back on the casino floor.

## Chores: the dependency nightshift

Not all of Dobby's work comes from the backlog. Some of it is standing housekeeping, and dependencies are the clearest win.

Everyone has Dependabot. Dependabot is fine, and Dependabot is also lying to you a little. It opens a PR that bumps a dependency and its green check means the version resolves and the manifest is valid. It does not mean your software still works with this version. Dependabot bumps and shrugs. Most teams then rubber stamp the minor bumps, hoard the major ones in a backlog of dread, and slowly rot.

So one of Dobby's weekly routines is a dependency chore. He scans for what is outdated, including the major version bumps everyone else is avoiding, and here is the difference: he applies the exact same loop as any feature. He makes the change, then runs the full checklist against it, build, lint, types, the whole test suite, and if it goes red, he does the work. He reads the changelog, fixes the breaking calls, updates the code to the new API, and reruns until it is green or until he is confident it cannot be done cleanly and says so. A major version bump becomes a normal, reviewable PR with the migration already done and the tests already passing, instead of a ticket nobody opens for eight months.

This is the bowling lane pointed at the most boring, most neglected, most quietly dangerous corner of the codebase. It is also the single easiest thing to hand an agent, because "make the tests pass on the new version" is a perfectly closed loop. If you are looking for a first real job to give your Dobby, start here.

## The 16:30 handoff: how it actually runs at night

Which leaves the question the whole post has been circling. How do you get an agent to do the right work overnight, and not just work?

Our answer is a routine, and it is the piece I am most fond of. Every weekday at 16:30, Dobby posts in Slack and asks the team what they would like picked up tonight.

It is not a dumb prompt. Before he asks, he looks at what you actually did that day, your commits, your open PRs, the issues you touched, and he comes to the conversation with suggestions. "I saw you left the export feature half finished; the error handling on the CSV path still throws on empty ranges, want me to take that tonight?" "There are three `GoodForDobby` issues on the reports EPIC and a major bump on the date library that is overdue, shall I line those up?" He is proposing a nightshift plan based on the day's evidence.

<figure style="max-width:640px;margin:2rem auto;">
  <img src="/images/dobby/dobby_ask_for_night.png" alt="Dobby posting in Slack at 16:30 asking the team what to pick up overnight, with suggestions based on the day's work." style="width:100%;height:auto;border-radius:8px;">
  <figcaption style="text-align:center;font-size:0.85rem;color:#6b7280;margin-top:1rem;">16:30. Dobby asks what to run tonight, and arrives with suggestions.</figcaption>
</figure>

You review the suggestions the way you would review a junior's plan for their evening. Add some, cut some, reword one because he misread the intent. What you are left with is a small, explicit set of scheduled issues, work you have looked at and consciously chosen to delegate. Then everyone goes home.

And overnight, Dobby works the queue. Each scheduled issue goes into a fresh sandbox, through the loop, work, review against the checklist, work again, until it passes or he gets genuinely stuck and leaves a note explaining why. He cannot merge anything, so nothing lands while you sleep. What lands is a set of pull requests waiting for you in the morning, each one already having survived its own review, each one owned the moment a human clicks merge.

<figure style="max-width:640px;margin:2rem auto;">
  <img src="/images/dobby/dobby_done_night.png" alt="Dobby reporting in the morning that the scheduled nightshift work is done, with pull requests ready for review." style="width:100%;height:auto;border-radius:8px;">
  <figcaption style="text-align:center;font-size:0.85rem;color:#6b7280;margin-top:1rem;">Morning. The queue is done and the pull requests are waiting, each one still needing a human to merge.</figcaption>
</figure>

The rhythm is the thing. The team's day ends with a deliberate, reviewed handoff at 16:30. The night is Dobby's. The morning starts with reviewing proposals, not producing them. Nobody sat at a slot machine. Nobody hit Enter at 2 a.m. The work got specified by humans during the day and executed by an elf at night, and the line between proposed and merged, the line where accountability lives, never moved off a human.

That, finally, is who is running the nightshift. Not an autonomous colleague you have handed the keys to. A tireless, scoped, sandboxed elf, working a queue you filled on purpose, handing everything back for a human to own. The lights are out and something is running in the dark. The trick is that you decided exactly what, before you turned them off.

## The stack, concretely

I have described Dobby in terms of roles: sandbox, identity, triggers, loop. Those are the parts that transfer to your setup regardless of what you build them on. But the tech is the point of this blog, so here is exactly what Dobby is made of, and why we did not just buy it.

We did not use Coder or any of the hosted sandbox products in the end. We built a self hosted orchestrator, for the same reason every security section above exists: we wanted to own every trust boundary in the thing. The whole system is deliberately small.

**The orchestrator (the webhook server).** A dependency free Node.js service, targeting Node 22 and 24, TypeScript and ESM throughout. HTTP is the built-in `node:http` with hand-rolled routing and no framework, so there is no web stack underneath it to poison. Tests run on the built-in `node --test`. State is flat JSON files on disk: tasks, routines, the pipeline graphs, and the router, reply, rescue and planner configs. No database. A small graph engine walks those pipeline graphs and handles fork and join, rescue, rate-limit resume, and a warm-container pool.

**The execution sandbox.** Each pipeline step dispatches a Claude Code agent inside an isolated Docker container: `ubuntu:24.04`, digest-pinned, Docker-in-Docker. Inside runs the pinned Claude Code CLI (`@anthropic-ai/claude-code`). The image bakes in a polyglot toolchain so Dobby never assembles his stack at midnight: Node with pnpm and yarn, Rust, .NET 10, Go, Python, PHP, Java 17 with the Android SDK and Flutter, Playwright and Chromium, the GitHub CLI, and the language servers. The iOS half of that story is the Mac Mini from earlier, because Apple's toolchain is the one thing that does not go in the container.

**Models.** We run Anthropic's Claude, with Opus, Sonnet or Haiku selected per node or per routine, because not every step needs the expensive brain. Nothing about the design is tied to one vendor, though: the model is just the engine inside the sandbox, and the orchestrator, guardrails and identity model around it would work the same behind any capable coding model.

**Access and identity.** The whole surface sits behind [Tailscale](https://tailscale.com/); the dashboard is only reachable over the tailnet, so there is no public front door to attack. Authentication is [Yivi](https://yivi.app/): you disclose a verified email attribute, which mints a cookie session that drives your role and your per-owner scoping. No password to phish, no shared admin login.

**The dashboard.** A [SvelteKit](https://svelte.dev/) app on Svelte 5, prerendered to a static SPA with `adapter-static`, built with Vite, typechecked with `svelte-check`, tested with Vitest. It is the observability and control plane: what is running, what each agent did and why, and the buttons to steer or stop it.

**Ops.** macOS `launchd` runs the webhook. `bin/deploy.sh` does git-pull, rebuild the dashboard, restart, with automatic rollback if the new version comes up unhealthy.

One line, for the people who scrolled straight here: a zero dependency Node and TypeScript `node:http` orchestrator behind Tailscale and Yivi auth, driving coding-agent runs in polyglot Docker sandboxes, with a SvelteKit dashboard and flat-JSON persistence.

---

*Next in this series: **Lights Out, part 4: the lessons learned from configuring a coding agent.** The prompts, the checklists, the failure modes, and all the ways Dobby surprised us: the hard won, unglamorous details of making the loop above actually behave.*

---

## Sources & tools

**Security model: the lethal trifecta and the Rule of Two**

- Simon Willison, "The lethal trifecta for AI agents: private data, untrusted content, and external communication," 16 June 2025: https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/ (and the running tag: https://simonwillison.net/tags/lethal-trifecta/)
- Meta, "Agents Rule of Two: a practical approach to AI agent security," 31 October 2025: https://ai.meta.com/blog/practical-ai-agent-security/
- Simon Willison, "New prompt injection papers: Agents Rule of Two and The Attacker Moves Second," 2 November 2025: https://simonwillison.net/2025/Nov/2/new-prompt-injection-papers/

**Our stack**

- Claude Code CLI (`@anthropic-ai/claude-code`), the agent that runs inside each container: https://code.claude.com/
- Anthropic, "Configure the sandboxed Bash tool" (filesystem and network isolation in Claude Code): https://code.claude.com/docs/en/sandboxing
- Tailscale, the tailnet the whole surface sits behind: https://tailscale.com/
- Yivi (IRMA), verified-attribute authentication: https://yivi.app/
- SvelteKit, the dashboard framework: https://svelte.dev/docs/kit/introduction

**Off-the-shelf sandbox alternatives (we built our own instead)**

- Anthropic, `sandbox-runtime`, OS-level filesystem and network restrictions without a container: https://github.com/anthropic-experimental/sandbox-runtime
- Coder, self hosted development environments: https://coder.com/
- Dev Containers specification (`devcontainer.json`): https://containers.dev/
- Firecracker microVMs: https://firecracker-microvm.github.io/
- Daytona, sandboxes for running AI-generated code: https://www.daytona.io/

**Dobby's identity and triggers**

- GitHub Apps and fine grained permissions: https://docs.github.com/en/apps
- GitHub, "About protected branches" (who can and cannot merge): https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- GitHub, "Available rules for rulesets": https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets
- Anthropic, "Claude Code GitHub Actions" (triggering an agent from issues, PRs, and schedules): https://code.claude.com/docs/en/github-actions
- Microsoft Security, "Securing CI/CD in an agentic world: Claude Code GitHub Action case," 5 June 2026: https://www.microsoft.com/en-us/security/blog/2026/06/05/securing-ci-cd-in-agentic-world-claude-code-github-action-case/

**The Mac Mini build node**

- Configuring a GitHub Actions runner on a Mac mini (Apple Silicon): https://www.scaleway.com/en/docs/tutorials/install-github-actions-runner-mac/
- Whatnot Engineering, "Migrating iOS GitHub Actions to self-hosted M1 Mac runners": https://medium.com/whatnot-engineering/migrating-ios-github-actions-to-self-hosted-m1-macs-runners-f75fbb00ab1b

**Shaping the backlog**

- Matt Pocock, the `/grill-me` skill: https://www.aihero.dev/skills-grill-me
- Matt Pocock, the `/wayfinder` skill: https://www.aihero.dev/skills-wayfinder

**Dependency chores**

- GitHub Dependabot: https://docs.github.com/en/code-security/dependabot

**The callbacks**

- Andrej Karpathy on generation vs. discrimination and the atrophy of manual coding: https://x.com/karpathy/status/2015883857489522876
- *Lights Out, part 1: the insane adoption of agentic coding*, the adoption data and the accountability question.
- *Lights Out, part 2: old school stays king*, the sandbox, the lethal trifecta, and the bowling lane this post builds on.
