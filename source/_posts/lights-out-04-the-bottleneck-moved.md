---
title: "Lights Out, part 4: the bottleneck moved"
date: 2026-10-30 09:00:00
tags:
 - AI
 - Agentic coding
 - Software development
 - Theory of Constraints
 - Security
 - Productivity
---

## Eight times the code, a third faster

At AI Engineer New York this month, [Laurie Voss](https://www.youtube.com/watch?v=kspZP5BgkEU&t=386s), co-founder of npm and now at Arize, put up a number that belongs on every engineering leader's wall. Teams using coding agents are producing roughly eight times more code, and shipping roughly thirty percent faster.

Eight times the output. A third faster delivery. So where did the rest go?

It went into a queue. It is sitting there right now: in your open pull requests, in a CI pipeline that takes half an hour, in a backlog of one line tickets nobody has refined, and increasingly on a security dashboard that turns redder every week. The code got cheap. Getting it shipped, trusted and kept safe did not.

In part 3 I confessed that the hard part of running Dobby was never the agent. It was the backlog, the review, the loop around him. This post generalises that confession. If you want to understand where your agentic speed-up is leaking, and where it will leak next, there is a forty year old book about a factory that explains it better than anything written about AI.

## A forty year old book about a factory

In 1984 Eliyahu Goldratt published *The Goal*, a business novel about a plant manager called Alex Rogo who has three months to save his factory. The most famous scene in it is not in the factory at all. It is a scout hike.

Alex takes his son's troop on a hike and watches the line of boys stretch out over miles. The fast kids race ahead, the slow kids fall behind, and the troop as a whole moves exactly as fast as its slowest member, a heavy kid called Herbie with an overloaded backpack. Telling the fast kids to walk faster does nothing. It only stretches the line. What works is putting Herbie at the front, so the troop moves at his pace and stays together, and then taking the weight out of Herbie's backpack and spreading it over the others.

That is the Theory of Constraints in one hike. The throughput of any system is set by a single constraint. Goldratt puts it bluntly: an hour lost at a bottleneck is an hour lost for the whole system, and an hour saved at a non-bottleneck is a mirage.

For fifty years of software, Herbie was obvious. Herbie was writing code. Every tool, framework, IDE, methodology and hiring plan we built was a way of lightening that backpack. Agile ceremonies, story points, pair programming, ten-x engineers: all of it existed to protect the scarcest thing in the building, which was developer time at a keyboard.

Then agents did not just lighten Herbie's backpack. They turned Herbie into the fastest kid on the hike. And exactly as the book predicts, the line did not get shorter. It stretched out somewhere else.

[GitLab's Bill Staples](https://about.gitlab.com/blog/when-code-is-abundant/) makes the same point from the vendor side: speeding up generation alone will simply move the queue. Producing code is getting cheap. Trusting it is not.

## The five focusing steps

Goldratt did not stop at the diagnosis. He gave a procedure, the five focusing steps, and it translates to a software organisation almost one to one.

1. **Identify the constraint.** Not where people are busiest. Where work waits the longest.
2. **Exploit the constraint.** Squeeze all waste out of that one step before you spend a cent on it. Every minute the constraint spends on something only a machine needed to do is a minute lost for the whole system.
3. **Subordinate everything else to the constraint.** The rest of the system runs at the constraint's pace. Producing more than the constraint can absorb is not productivity, it is inventory.
4. **Elevate the constraint.** Only now add capacity: tooling, automation, people.
5. **Repeat, and do not let inertia become the constraint.** Once you have fixed it, the constraint moves. The policies you made for the old one become the new problem.

The order matters, and almost everyone gets it wrong. Steps 2 and 3 are cheap and fast. Step 4 costs money, so it feels like action, so it is the one organisations jump to. Buy another AI review tool. Hire two more seniors. Roll out an agent to more teams. All of that before anyone has looked at where the work is actually waiting.

## Find the constraint in the data, not in the vibe

The busiest people in your organisation are not necessarily the constraint. Your developers may feel swamped and still be waiting on review half the day. The only reliable way to find Herbie is to look at where work sits idle.

That requires something boring: a timestamp on every state transition. Idea, refined, ready, in progress, in review, verified, released, in use. Once you have those, you can separate waiting time from working time per stage, and you will almost certainly find that work spends most of its life waiting. That waiting is where the throughput is.

Here is what the picture looks like for most teams I talk to right now.

<figure style="max-width:760px;margin:2rem auto;">
<svg viewBox="0 0 820 460" role="img" aria-labelledby="sdlcTitle sdlcDesc" style="width:100%;height:auto;display:block;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;">
<title id="sdlcTitle">The development lifecycle as a chain: review is the constraint now, and fixing vulnerabilities jumps the queue.</title>
<desc id="sdlcDesc">Eight stages in a loop. Intent and spec, build by agents, review, verification, release, operate and use, vulnerabilities, fix first, which feeds back to the top of the backlog. Build is no longer a constraint. Review is the constraint now. Intent and spec is the next constraint. Vulnerabilities and fixing them are a new constraint that takes priority over new work, driven by more code and a growing number of CVEs.</desc>
<defs>
<linearGradient id="sdlcPanel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17203a"/><stop offset="1" stop-color="#0d1428"/></linearGradient>
<marker id="sdlcArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#8b97ae"/></marker>
</defs>
<rect x="20" y="20" width="780" height="420" rx="28" fill="url(#sdlcPanel)" stroke="#33406a" stroke-width="3"/>
<text x="50" y="62" fill="#e6ebf5" font-size="17" font-weight="700">Review is the constraint now; fixing vulnerabilities jumps the queue</text>
<g font-size="12" fill="#9aa6c4">
<rect x="50" y="84" width="16" height="11" rx="3" fill="#1e3a8a" stroke="#6ea8fe" stroke-width="2"/><text x="74" y="94">the constraint now</text>
<rect x="210" y="84" width="16" height="11" rx="3" fill="#4a1d2a" stroke="#ff6b81" stroke-width="2"/><text x="234" y="94">new constraint, takes priority</text>
<rect x="430" y="84" width="16" height="11" rx="3" fill="none" stroke="#5b6a96" stroke-width="1.5" stroke-dasharray="3 3"/><text x="454" y="94">no longer a constraint</text>
</g>
<g fill="none" stroke="#8b97ae" stroke-width="1.5">
<path d="M205 162H235" marker-end="url(#sdlcArrow)"/>
<path d="M395 162H425" marker-end="url(#sdlcArrow)"/>
<path d="M585 162H615" marker-end="url(#sdlcArrow)"/>
<path d="M695 194V270" marker-end="url(#sdlcArrow)"/>
<path d="M615 302H585" marker-end="url(#sdlcArrow)"/>
<path d="M425 302H395" marker-end="url(#sdlcArrow)"/>
<path d="M235 302H205" marker-end="url(#sdlcArrow)"/>
<path d="M125 270V194" marker-end="url(#sdlcArrow)"/>
<path d="M315 360V334" marker-end="url(#sdlcArrow)"/>
</g>
<g text-anchor="middle">
<rect x="45" y="130" width="160" height="64" rx="10" fill="#1d2848" stroke="#4a5784" stroke-width="1.5"/>
<text x="125" y="157" fill="#e6ebf5" font-size="14" font-weight="700">Intent and spec</text>
<text x="125" y="178" fill="#9aa6c4" font-size="12">next constraint</text>
<rect x="235" y="130" width="160" height="64" rx="10" fill="none" stroke="#5b6a96" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="315" y="157" fill="#e6ebf5" font-size="14" font-weight="700">Build (agents)</text>
<text x="315" y="178" fill="#9aa6c4" font-size="12">no longer a constraint</text>
<rect x="425" y="130" width="160" height="64" rx="10" fill="#1e3a8a" stroke="#6ea8fe" stroke-width="2.5"/>
<text x="505" y="157" fill="#ffffff" font-size="14" font-weight="700">Review</text>
<text x="505" y="178" fill="#dbe7ff" font-size="12">the constraint now</text>
<rect x="615" y="130" width="160" height="64" rx="10" fill="#1d2848" stroke="#4a5784" stroke-width="1.5"/>
<text x="695" y="157" fill="#e6ebf5" font-size="14" font-weight="700">Verification</text>
<text x="695" y="178" fill="#9aa6c4" font-size="12">becoming visible</text>
<rect x="615" y="270" width="160" height="64" rx="10" fill="#1d2848" stroke="#4a5784" stroke-width="1.5"/>
<text x="695" y="297" fill="#e6ebf5" font-size="14" font-weight="700">Release</text>
<text x="695" y="318" fill="#9aa6c4" font-size="12">next in line</text>
<rect x="425" y="270" width="160" height="64" rx="10" fill="#1d2848" stroke="#4a5784" stroke-width="1.5"/>
<text x="505" y="297" fill="#e6ebf5" font-size="14" font-weight="700">Operate and use</text>
<text x="505" y="318" fill="#9aa6c4" font-size="12">next in line</text>
<rect x="235" y="270" width="160" height="64" rx="10" fill="#4a1d2a" stroke="#ff6b81" stroke-width="2.5"/>
<text x="315" y="297" fill="#ffffff" font-size="14" font-weight="700">Vulnerabilities</text>
<text x="315" y="318" fill="#ffd6dc" font-size="12">new constraint</text>
<rect x="45" y="270" width="160" height="64" rx="10" fill="#4a1d2a" stroke="#ff6b81" stroke-width="2.5"/>
<text x="125" y="297" fill="#ffffff" font-size="14" font-weight="700">Fix first</text>
<text x="125" y="318" fill="#ffd6dc" font-size="12">ahead of new work</text>
<text x="315" y="380" fill="#e6ebf5" font-size="12.5">More code = a bigger attack surface</text>
<text x="315" y="400" fill="#9aa6c4" font-size="12">~50,000 CVEs in 2025, ~66,000 forecast for 2026</text>
</g>
<text x="135" y="236" fill="#9aa6c4" font-size="12">top of the backlog</text>
</svg>
<figcaption style="text-align:center;font-size:0.85rem;color:#6b7280;margin-top:1rem;">The lifecycle is a chain, not a list of departments. What surfaces in production comes back around and pushes new work out of the way.</figcaption>
</figure>

And here is what to look for at each stage:

| Stage | Signal that it is the constraint | What to measure |
| --- | --- | --- |
| Intent and spec | Agents idle or producing the wrong thing; lots of PRs rejected on intent, not on code | Wait time in "ready"; % of PRs rejected on functionality |
| Build | Refined backlog keeps growing; reviewers waiting for work | Wait time in "ready for dev" |
| Review | Open PRs pile up; days until first response; reviews getting shallower | Time to first review; open PRs per reviewer |
| Verification / CI | People waiting on pipelines; flaky tests ignored | CI duration p50/p90; % red builds |
| Release and operations | Merged code waits to ship; incidents after release go up | Time from merge to production; change failure rate |
| Security fixes | Planned features slip because of patching; critical vulns stay open; dependency drift grows | % of capacity on remediation; time to fix known-exploited vulns |
| In use | Features are live and nobody knows if they work | Time to first usage data per feature |

Notice what is not on this list: lines of code, number of PRs, percentage of AI-generated commits. Those were always weak proxies. With agents they are actively misleading, because they go up on their own and hide the queue behind them.

## Review: exploit before you elevate

For almost every team I see right now, Herbie is review. More changes, bigger changes, arriving faster than the people who can actually judge them can read. And review has a nasty failure mode under pressure: it does not slow down, it gets shallower. The queue stays the same length and the quality of what passes through drops. That is worse than a visible queue.

**Exploit.** Part 2 was about the bowling lane, and this is where it pays off. The reviewer must never be the test suite. If a human is spending review time on formatting, on a missing null check a type checker would catch, on whether the tests pass, that is constraint time spent on work a machine should have done. Tests, types, linting, formatting, static analysis and dependency scanning are green before a human looks, every time, no exceptions. CI is the arbiter of whether something works, not a sentence in the PR description. The human reviews what only a human can: is this the right change, does it fit the architecture, what is the risk.

This is not theory. In the GitLab post, Amplitude reports PR cycle time dropping from 5.2 hours to 44 minutes while frontend CI went from about thirty minutes to three or four. Fixing the pipeline around the constraint did more than any model upgrade would have.

**Subordinate.** This is the step that feels wrong, and it is the most valuable one. If review is the constraint, then generating more code than you can review is not productivity. It is inventory, and inventory rots: it conflicts, it goes stale, it gets reviewed in a hurry. So put a WIP limit on open pull requests per team, keep changes small and reversible behind feature flags, and when the review queue is full, the agents stop. Idle agents are fine. An overloaded constraint is not.

Dobby's 16:30 handoff from part 3 turns out to be exactly this. The nightshift queue is sized to what the team can review the next morning, not to what Dobby could theoretically produce overnight. We did not design it as Theory of Constraints. It just turned out that was the only version that worked.

**Elevate.** Only now add capacity, and add it as automation, not headcount. Define risk classes for changes, with explicit, executable criteria for which classes can merge without a human: dependency bumps that pass the full suite, documentation, generated tests. Then treat those criteria as security configuration, because that is what they are. A guardrail you added without thinking is not a guardrail. It is a hole with a label on it.

**The line that does not move.** Agent changes pass at least the same gates as human ones. Agent involvement is recorded in the commit trail. Every merged change has a named human who owns it, and nobody signs off on code they cannot explain. That puts a hard ceiling on how far you can elevate review, and that ceiling is a feature. It is the thing that makes the whole system trustworthy enough to run at night.

## Upstream: the backlog is waiting in the wings

Fix review and Herbie moves. In our case he moved upstream, exactly where part 3 said he would: into the supply of well formed work.

An agent is only as good as the unit of work it is handed. When review stops being the bottleneck, the next symptom is agents doing the wrong thing quickly: PRs that pass every check and still get rejected because the intent was misunderstood. That is a constraint in specification, not in code.

Exploiting it looks like what we described with the `GoodForDobby` label. Grill ideas before they become features. Decompose features until the leaves can be picked up cold. Write acceptance criteria that are testable, ideally as tests. Put the context agents need, the architecture decisions and conventions, into versioned files like `AGENTS.md` so humans and agents work from the same rules. The people who used to write the code now write the intent and judge the outcome. That is a different job, and most teams have not trained for it.

## The vulnpocalypse jumps the queue

Here is the constraint nobody planned for, and it behaves differently from all the others.

The number of published vulnerabilities is exploding. There were roughly 40,000 CVEs in 2024 and close to 50,000 in 2025, a record. FIRST's mid-year forecast for 2026 is around 66,000, with the first half of the year running nearly fifty percent ahead of 2025, according to [Trend Micro's analysis](https://www.trendmicro.com/en_us/research/26/g/making-sense-of-the-vulnpocalypse.html). The NVD only fully analysed about 28 percent of what was disclosed in 2025. The gap between disclosure and exploitation is shrinking from weeks to hours.

Two forces drive this, and agents feed both of them:

- **More software, more attack surface.** Agents produce more code, pull in more dependencies and spin up more services. Every line you generate is a line you will have to patch, upgrade and defend for years.
- **Better bug finding, on both sides.** Frontier models have become very good at surfacing latent bugs. Defenders use that. So do attackers.

In Theory of Constraints terms, remediation is expedite work. It does not wait in the queue. It cuts it. A known-exploited vulnerability in production does not get scheduled for next sprint; it pre-empts whatever was in progress, and it pulls on exactly the stages that are already scarce: review and release. Every hour spent fixing is an hour taken off feature throughput, and you cannot subordinate it, because the attacker does not care about your WIP limit.

That is why it deserves its own pass through the five steps:

1. **Identify.** Measure how much capacity already goes to remediation and how long critical vulnerabilities stay open. Most teams have no idea, because patch work hides inside other tickets.
2. **Exploit.** Triage on exploitability, not on volume. Known-exploited first (the CISA KEV catalogue), then by EPSS score. Only about five percent of published CVEs are ever seen exploited. Raw CVE counts are noise.
3. **Subordinate.** Reserve fixed capacity for remediation, so it stops blowing up the plan every week. And shrink the surface: fewer dependencies, delete features and services nobody uses, and do not generate code just because you can. The cheapest line of code to secure is the one you never generated.
4. **Elevate.** Point agents at the fix itself. Dobby's dependency nightshift from part 3 is exactly this: major bumps with the migration done and the tests green, waiting as a normal PR. Add continuous, AI-driven scanning of your own code and infrastructure, so you find the bug before somebody else's model does.
5. **Repeat.** Hold remediation capacity against actual inflow every quarter. That inflow is going up.

And once again, the bowling lane is the precondition. With a fast test suite, infrastructure as code and feature flags, a patch is a routine change. Without them, every patch is a risky little project, and you will have tens of thousands of them.

## The order in which agents eat

The most useful slide in Voss's talk was a simple list he called *what agents eat, and in what order*. Writing code: collapsed. Reviewing and maintaining code: going soon. Shipping to production and scaling: next on the chopping block. Deciding what to build, defining "good", making it delightful: possibly safe.

Read that list as a forecast of where your constraint will be.

<figure style="max-width:760px;margin:2rem auto;">
<svg viewBox="0 0 820 520" role="img" aria-labelledby="eatTitle eatDesc" style="width:100%;height:auto;display:block;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;">
<title id="eatTitle">Agents take over work in a fixed order, and the constraint moves with them.</title>
<desc id="eatDesc">Four stages from top to bottom, after Laurie Voss. Collapsed: writing code, no longer a constraint. Going soon: reviewing and maintaining code, the constraint now, so invest in machine verification and auto-merge rather than more reviewers. Next: shipping to production and scaling, automate now or it becomes the next queue. Possibly safe: deciding what to build, defining good and making it delightful, where the constraint finally lands.</desc>
<defs>
<linearGradient id="eatPanel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17203a"/><stop offset="1" stop-color="#0d1428"/></linearGradient>
<marker id="eatArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#8b97ae"/></marker>
</defs>
<rect x="20" y="20" width="780" height="480" rx="28" fill="url(#eatPanel)" stroke="#33406a" stroke-width="3"/>
<text x="50" y="62" fill="#e6ebf5" font-size="17" font-weight="700">Agents eat the work in order; the constraint moves with them</text>
<text x="50" y="84" fill="#9aa6c4" font-size="12">After Laurie Voss, AI Engineer New York, October 2026. Top to bottom.</text>
<g fill="#9aa6c4" font-size="12"><text x="155" y="114" text-anchor="middle">Stage</text><text x="270" y="114">What agents take over</text><text x="500" y="114">What it means for you</text></g>
<path d="M58 132V474" stroke="#8b97ae" stroke-width="1.5" marker-end="url(#eatArrow)"/>
<rect x="80" y="126" width="700" height="72" rx="10" fill="#1d2848" stroke="#4a5784" stroke-width="1.5"/>
<rect x="80" y="210" width="700" height="72" rx="10" fill="#1e3a8a" stroke="#6ea8fe" stroke-width="2.5"/>
<rect x="80" y="294" width="700" height="72" rx="10" fill="#1d2848" stroke="#4a5784" stroke-width="1.5"/>
<rect x="80" y="378" width="700" height="92" rx="10" fill="#1d2848" stroke="#4a5784" stroke-width="1.5"/>
<g stroke="#33406a"><path d="M240 134V190M480 134V190M240 218V274M480 218V274M240 302V358M480 302V358M240 386V462"/></g>
<g font-size="14" font-weight="700" fill="#e6ebf5" text-anchor="middle">
<text x="160" y="167">Collapsed</text>
<text x="160" y="243" fill="#ffffff">Going soon</text>
<text x="160" y="335">Next</text>
<text x="160" y="429">Possibly safe</text>
</g>
<text x="160" y="263" text-anchor="middle" font-size="12" fill="#dbe7ff">the constraint now</text>
<g font-size="13.5" fill="#e6ebf5">
<text x="256" y="167">Writing code</text>
<text x="256" y="241" fill="#ffffff">Reviewing and</text><text x="256" y="259" fill="#ffffff">maintaining code</text>
<text x="256" y="325">Shipping to production,</text><text x="256" y="343">scaling</text>
<text x="256" y="408">Deciding what to build,</text><text x="256" y="426">defining "good",</text><text x="256" y="444">making it delightful</text>
</g>
<g font-size="12.5" fill="#c8d0e4">
<text x="496" y="157">Not a constraint any more.</text><text x="496" y="175">Stop steering on developer speed.</text>
<text x="496" y="241" fill="#ffffff">Invest in machine verification and</text><text x="496" y="259" fill="#ffffff">auto-merge, not in more reviewers.</text>
<text x="496" y="325">Automate pipeline, release and ops now,</text><text x="496" y="343">or they become the next queue.</text>
<text x="496" y="408">Where the constraint finally lands:</text><text x="496" y="426">intent, specs and acceptance criteria</text><text x="496" y="444">become the craft.</text>
</g>
</svg>
<figcaption style="text-align:center;font-size:0.85rem;color:#6b7280;margin-top:1rem;">The constraint is not a fixed property of your organisation. It is a moving target, and you can see where it is heading.</figcaption>
</figure>

Three things follow from that.

**Theory of Constraints is a rhythm, not a project.** The analysis you do this quarter is wrong in six months. Goldratt's fifth step, do not let inertia become the constraint, has never been more literal. The policies you build to protect today's bottleneck will be in the way when it moves.

**Do not hire for a temporary constraint.** If review is your bottleneck, the reflex is to hire more senior reviewers. But review is on the list of things agents are eating next. Permanent headcount for a constraint that will partly dissolve within a year or two is inertia with a salary. Invest instead in the things that stay valuable wherever Herbie ends up: verification, observability, governed records of who approved what, and the security fundamentals from part 2.

**Build toward the final constraint now.** Somewhere at the bottom of that list, the constraint lands on the one thing nobody expects agents to take over soon: deciding what is worth building and what good looks like. Voss calls the role that remains the product engineer. If that is where the bottleneck is heading, the most strategic thing you can do today is train your engineers to be good at it, while the agents are still busy eating review.

## What I measure now

If you take one practical thing from this post, take the dashboard. Stop reporting lines of code, PR counts and percentages of AI-written commits. Start with these:

- **Lead time from idea to production**, end to end, with **wait time per stage** underneath it. That shows you where Herbie is.
- **Cost per accepted change**, as GitLab defines it: generation, environment, context, verification, review, remediation and governance together. A cheap PR that takes three review rounds and a hotfix is not cheap.
- **CI duration**, p50 and p90. If it runs well past five minutes, fixing it probably matters more than changing models.
- **Share of capacity spent on remediation**, and **time to fix known-exploited vulnerabilities**.

And one meeting, once a quarter, with one question on the agenda: where does work wait the longest now, and is our money still going there?

## The lights are out, the queue is not

The first three posts in this series were about whether to let the agents in, how to keep them from burning the house down, and how to have one work the nightshift. This one is about a quieter realisation. Agents did not remove the bottleneck from software development. They moved it, and they will keep moving it, faster than most organisations change their processes.

That is not a reason for gloom. It is a reason for a different kind of management. The question is no longer how fast can we write code. It is where is Herbie today, and what is the cheapest thing we can do about it before he moves again.

The lights are out. Something is running in the dark. Make sure it is not just filling a queue.

---

*Next in this series: **Lights Out, part 5: the lessons learned from configuring a coding agent.** The prompts, the checklists, the failure modes, and all the ways Dobby surprised us.*

---

## Sources

**The talk and the article that started this post**

- Laurie Voss, "AI Writes the Code. So What's Left for Engineers?", AI Engineer New York, October 2026: https://www.youtube.com/watch?v=kspZP5BgkEU&t=386s
- Bill Staples, "When code is abundant", GitLab, 24 August 2026 (cost per accepted change, the Amplitude figures, the 90-day recommendations): https://about.gitlab.com/blog/when-code-is-abundant/

**Theory of Constraints**

- Eliyahu M. Goldratt and Jeff Cox, *The Goal: A Process of Ongoing Improvement*, 1984 (the five focusing steps and Herbie's hike)

**The vulnerability numbers**

- Johnny Hand, "Volume Is Not Risk: Making Sense of the 'Vulnpocalypse'", Trend Micro, 21 July 2026: https://www.trendmicro.com/en_us/research/26/g/making-sense-of-the-vulnpocalypse.html
- Computer Weekly, "CVE volumes may plausibly reach 100,000 this year", on FIRST's 2026 forecast: https://www.computerweekly.com/news/366638949/CVE-volumes-may-plausibly-reach-100000-this-year
- CISA, Known Exploited Vulnerabilities Catalog: https://www.cisa.gov/known-exploited-vulnerabilities-catalog
- FIRST, Exploit Prediction Scoring System (EPSS): https://www.first.org/epss/

**The callbacks**

- *Lights Out, part 2: old school stays king*, the bowling lane, CI as arbiter, and the accountability rules this post leans on.
- *Lights Out, part 3: running the nightshift*, Dobby, the `GoodForDobby` backlog, the dependency nightshift and the 16:30 handoff.
