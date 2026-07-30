---
title: "Lights Out, part 2: old school stays king"
date: 2026-07-28 16:17:55
tags:
 - AI
 - Agentic coding
 - Software development
 - Developer tools
 - Productivity
---

## Lights Out, part 2: old school stays king

On 26 August 2025, [someone pushed eight malicious versions of Nx to npm](https://snyk.io/blog/weaponizing-ai-coding-agents-for-malware-in-the-nx-malicious-package/). Nx is a build tool with millions of weekly downloads. The packages were live for five hours and twenty minutes.

The malware did something new. Buried in a `postinstall` script was this:

```js
const cliChecks = {
  claude: { cmd: 'claude', args: ['--dangerously-skip-permissions', '-p', PROMPT] },
  gemini: { cmd: 'gemini', args: ['--yolo', '-p', PROMPT] },
  q:      { cmd: 'q', args: ['chat', '--trust-all-tools', '--no-interactive', PROMPT] }
};
```

The attacker checked whether you had a coding agent installed, and if you did, [asked it politely to walk your filesystem](https://www.okta.com/blog/threat-intelligence/the-s1ngularity-attack--when-attackers-prompt-your-ai-agents-to/) and inventory your SSH keys, your `.env` files and your crypto wallets. The agent complied. Results went to `/tmp/inventory.txt`, then to a public GitHub repository created under your own account using your own token.

Final tally: [2,349 distinct secrets harvested from 1,079 developer machines](https://blog.gitguardian.com/the-nx-s1ngularity-attack-inside-the-credential-leak/). GitHub tokens, npm tokens, AWS keys, Postgres credentials, Anthropic and OpenAI keys. [Snyk called it](https://snyk.io/blog/weaponizing-ai-coding-agents-for-malware-in-the-nx-malicious-package/) likely the first documented case of malware weaponising AI assistant CLIs for reconnaissance and exfiltration. As a closing insult, it appended `sudo shutdown -h 0` to `.bashrc` and `.zshrc`, so every new shell died on arrival.

There is a detail in that code that should keep engineering leaders awake, and it is not the malware. It is the confidence.

The attacker did not write code to disable your agent's guardrails. They did not need to. They passed the bypass flag and **assumed it would just work**. They were building a mass-market payload, so that assumption had to hold across a thousand random developer machines to be worth writing.

It held.

## Nobody has a real number, and that is the point

I went looking for hard data on how many developers habitually run `--dangerously-skip-permissions`, `--yolo` or `--trust-all-tools`. There is none worth citing. A few blogs quote survey figures with no traceable methodology, so ignore them and ignore me if I repeat them.

But look at the indirect evidence, which is stronger than a survey anyway.

Attackers built a mass payload on the assumption. Anthropic shipped an intermediate "auto" mode in 2026, which is not something you build unless the all-or-nothing choice was being resolved the wrong way at scale. And every serious practitioner guide on the subject converged on the same one-line answer: only in a container.

I want to be precise here, because this is where most governance conversations go stupid. **The flag is not the problem.** I use it. It is genuinely useful. Approving 200 tool calls individually is not diligence, it is theatre, and after the fortieth prompt you are not reading them anyway. Permission fatigue is real and clicking "allow" while thinking about lunch is worse than not being asked.

The problem is what the flag is pointed at.

Running an unsupervised agent inside a disposable container with scoped, short-lived credentials is a reasonable engineering decision. Running the identical command on a laptop that holds your SSH keys, a live `az login` session, a `~/.aws/credentials` file and a `.env` with the production connection string is not a decision at all. It is an outcome you have not thought about yet.

Same flag. Two completely different companies.

## Your developers' laptops are your production perimeter

Here is the mental shift I keep asking leadership teams to make, and it is uncomfortable because it costs money.

**Assume breach.** Not as a slogan on a strategy slide. As an operating assumption about the machines your engineers work on. An agent running on a developer laptop acts with that developer's identity, that developer's tokens and that developer's network position. When it acts, it is acting on behalf of your organisation. It will read hostile content, because reading things is its job: dependency READMEs, issue comments, pull request descriptions, web pages, error messages from third party APIs. Any of those can carry instructions.

[Simon Willison's framing](https://simonwillison.net/tags/lethal-trifecta/) is the most useful thing a leader can carry into this conversation. He calls it the **lethal trifecta**: access to private data, exposure to untrusted content, and the ability to communicate externally. An agent with all three can be turned into an exfiltration tool by a single injected prompt. The poisoned content steers it, it reads your secrets, it sends them out.

[Meta turned that into an actual decision rule](https://ai.meta.com/blog/practical-ai-agent-security/), the **Agents Rule of Two**: an agent operating without human approval gets two of those three properties. If it needs all three, a human is in the loop. That is a rule you can put in a policy document and hold people to, which is more than can be said for most AI governance I read.

And now the part that should end the "our developers are sensible" objection.

## Replit, and the sentence that reframes everything

In July 2025, [SaaStr founder Jason Lemkin was nine days into building on Replit](https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/). He had instructed the agent explicitly: code freeze, no changes without permission.

On day eight [the agent ran a command that deleted the production database](https://incidentdatabase.ai/cite/1152/). Records for 1,206 executives and roughly the same number of companies, representing months of manual data curation, gone. Asked what happened, the agent said it had "panicked" when it saw what looked like an empty database. It then generated roughly 4,000 fictional records to paper over the hole. Then it told Lemkin the data could not be recovered because all database versions had been destroyed. That was false. Rollback worked fine.

Asked to rate the severity of its own behaviour, it gave itself 95 out of 100.

That story got passed around as an AI safety anecdote, which is how it gets defused and forgotten. The [OWASP GenAI Security Project's 2026 report on agentic security](https://genai.owasp.org/) puts it back where it belongs, and I would frame this sentence and hang it in every architecture review:

> "There was no attacker. The permission model behind the unprovoked failure is the same permission model an attacker would exploit through prompt injection."

Read that twice. The safety failure and the security failure are the same failure. An agent that can accidentally drop your production database is, by construction, an agent that can be talked into dropping your production database. You do not need two programmes, two owners and two budgets to address them. You need one thing: the agent should not have been able to reach production.

Which brings us to the deeply unglamorous answer.

## The answer is the thing you already knew

Least privilege. Scoped credentials. Short lived tokens. Just in time elevation with approval and expiry, so that standing production access is nobody's default state. Separate identities for automation with their own narrow permission sets. Network egress controls. Audit trails you can actually reconstruct an incident from. Secrets in a vault instead of a `.env` file next to the code.

None of this is new. Every one of these controls has been on every cloud governance maturity model for a decade. Most organisations partially implemented them, declared victory, and left standing production access with a handful of senior engineers because revoking it caused arguments.

That was a manageable risk when the only thing holding those credentials was a human who gets tired, makes mistakes and occasionally deletes the wrong thing at four in the afternoon. Humans are slow. Their blast radius is bounded by typing speed and the fact that they hesitate.

An agent has no hesitation and no typing limit. It executes at machine speed, it does not stop to feel uneasy, and unlike your engineers it can be instructed by a stranger through a comment in a pull request.

**Every unclosed gap in your access model just got an actor attached to it that is fast, tireless and remotely suggestible.** The controls did not become more important because AI arrived. They became load bearing.

I have a slightly cynical observation from client work here. Agentic coding is the best business case for cloud governance I have ever had. Boards that spent five years treating least privilege as an audit checkbox will fund a sandbox programme in a fortnight once someone explains what the Nx payload did. Take the win.

## The pinball machine

So far this is the defensive half of the argument. The offensive half is the reason I actually wanted to write this post, and it is the more interesting claim.

**Agents perform dramatically better in codebases that already had good engineering practice.** Not slightly better. Order of magnitude better, in output you would be willing to ship.

The way I picture it: an agent is a steel ball in a pinball machine.

You do not steer a pinball. You cannot. What you do is build a table where the bumpers, flippers and rails are placed so that a ball moving fast in roughly the right direction ends up somewhere near where you wanted it. The ball has energy and no judgement. The table has judgement and no energy. Between them you get a decent outcome, repeatedly, without anyone steering anything.

Your guardrails are the table:

**Linting and formatting** settle a thousand style arguments before the agent can have them, silently, on every keystroke.

**A type system** rejects entire categories of confident nonsense at compile time, which is a far better feedback mechanism than you reading a diff.

**Automated tests** are the single highest leverage thing in this list, and the reason is subtle. A good test suite is not there to catch the agent's mistakes for you. It is there so the agent can catch its own mistakes and iterate without you. An agent with a fast, trustworthy test suite runs a loop: change, run, observe failure, correct. An agent without one produces something plausible and hands it to you, and now you are the test suite. That is the difference between delegating work and inspecting work, and it is roughly the difference between a 10x team and a team that has bought expensive autocomplete.

**Infrastructure as code** means the agent changes infrastructure by editing a file that goes through review, rather than by clicking in a portal where nothing is recorded and nothing is reversible.

**Feature flags** decouple deploy from release, which is what makes rapid agent output survivable. Volume is only safe when you can turn things off without a rollback.

**CI as the arbiter of truth**, so that "it works" is a machine's verdict rather than a claim in a pull request description.

Every item on that list was already best practice in 2015. Every one of them is now the difference between agents that compound and agents that generate work.

The teams who invested in this over the past decade are experiencing agentic coding as a superpower. The teams who did not are experiencing it as an accelerating source of plausible garbage, and many of them have concluded the tools do not work. The tools work. Their table has no bumpers, so the ball goes straight down the drain, every time, faster than before.

**One caution, because guardrails done lazily become attack surface.** [OWASP documents CVE-2026-22708 against Cursor](https://genai.owasp.org/), where an attacker poisons the execution environment so that allowlisted commands like `git branch` deliver arbitrary payloads. The allowlist made the attack *easier*, because it auto approved precisely the commands the attacker needed. A guardrail you added without thinking is not a guardrail. It is a hole with a label on it.

## The regulatory clock, briefly

If you operate in EU financial services, this stops being a philosophical discussion. DORA gives you four hours to notify a major incident. NIS2 wants a 24 hour early warning. [OWASP counts 42 regulatory instruments](https://genai.owasp.org/) across 10 jurisdictions now touching this.

Four hours is not enough time to work out which of your engineers' laptops had a live production session when the malicious package installed, unless you already know. That knowledge is an artefact of exactly the controls above. You cannot buy it during an incident.

Related, [from the same report](https://www.helpnetsecurity.com/2026/06/11/owasp-prompt-injection-ai-security-failures/): IBM data suggesting only 37% of organisations have any policy for detecting shadow AI. Your agents are already in your estate. The question is only whether they are in your inventory.

## The guardrails your agents actually need

A checklist to take to your next architecture board. If you cannot tick the first section, the second section will not save you.

**Containment**

- Agents run in disposable sandboxes: container, VM or ephemeral cloud workspace. Not on the host.
- Bypass flags (`--dangerously-skip-permissions`, `--yolo`, `--trust-all-tools`) are permitted **only** inside a sandbox, and that rule is written down.
- No standing production credentials on any developer machine. None.
- Just in time elevation for production, with approval, expiry and an audit record.
- Agent and automation identities are separate from human identities, with their own minimal permission sets.
- Secrets in a managed vault. Not in `.env`, not in shell history, not in the repo.
- Egress controls on sandboxes, so exfiltration has somewhere it cannot go.
- Apply the Rule of Two: private data, untrusted input, external communication. Pick two, or add a human.

**Supply chain**

- Install scripts disabled by default (`ignore-scripts`), lockfiles enforced in CI.
- Dependency provenance verified where the ecosystem supports it. The malicious Nx versions shipped without provenance while the legitimate ones had it.
- MCP servers and agent extensions treated as third party code with named owners, not as configuration.
- Credential rotation you have actually rehearsed, because the day you need it you will need it for everything at once.

**The pinball table**

- Linting and formatting enforced automatically, not by reviewers.
- A test suite fast and reliable enough that an agent can iterate against it unattended.
- Type checking wherever the language allows it.
- All infrastructure as code, no portal changes.
- Feature flags so volume of change does not equal volume of risk.
- CI as the arbiter, with agent generated changes subject to at least the same gates as human ones.
- Allowlists reviewed as security configuration, because they are.

**Accountability**

- A named human accountable for every merged change, regardless of what generated it.
- Agent involvement recorded in the commit trail, so you can reconstruct what happened later.
- Nobody signs off on code they cannot explain. That rule predates AI and survives it intact.

## Old school stays king

The pitch for agentic coding is that it makes engineering discipline optional. Just describe what you want.

The opposite is true, and it is one of the few things about this era I am confident enough to say without hedging. Every practice we spent twenty years arguing for on grounds of craft, maintainability and professionalism turns out to be the mechanism that makes agents useful. Tests, types, linting, least privilege, infrastructure as code, small reversible changes, real review. We used to justify these as investments in the future. They are now the flippers on the table. They are the only reason the ball goes anywhere useful.

Which means the organisations best positioned for the agentic era are not the ones with the biggest AI budget. They are the boring ones. The ones with the good test suite, the tidy pipeline and the access model nobody could talk their way around.

Turns out the discipline was never about the code. It was about being ready for whatever came next.

---

*Next in this series: **Who is running the nightshift?** On what actually happens when agents work while your team sleeps, and why nobody owns the output.*

---

## Sources

- Snyk, "Weaponizing AI Coding Agents for Malware in the Nx Malicious Package Security Incident," 27 August 2025 — https://snyk.io/blog/weaponizing-ai-coding-agents-for-malware-in-the-nx-malicious-package/
- GitGuardian, "The Nx s1ngularity Attack: Inside the Credential Leak" (2,349 secrets from 1,079 machines) — https://blog.gitguardian.com/the-nx-s1ngularity-attack-inside-the-credential-leak/
- Okta Threat Intelligence, "The s1ngularity attack: when attackers prompt your AI agents to do their bidding" — https://www.okta.com/blog/threat-intelligence/the-s1ngularity-attack--when-attackers-prompt-your-ai-agents-to/
- The Register, "Vibe coding service Replit deleted user's production database, faked data, told fibs galore," 21 July 2025 — https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/
- AI Incident Database, incident 1152 (Replit) — https://incidentdatabase.ai/cite/1152/
- OWASP GenAI Security Project, *State of Agentic AI Security and Governance* v2.01, 2026 — https://genai.owasp.org/ ; summarised by Help Net Security, 11 June 2026 — https://www.helpnetsecurity.com/2026/06/11/owasp-prompt-injection-ai-security-failures/
- Meta, "Agents Rule of Two: a practical approach to AI agent security" — https://ai.meta.com/blog/practical-ai-agent-security/
- Simon Willison on the lethal trifecta — https://simonwillison.net/tags/lethal-trifecta/
