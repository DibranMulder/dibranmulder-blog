# While You Blinked

### Lights Out, part 1: the insane adoption of agentic coding

On 5 February 2026, SemiAnalysis opened a research note with a sentence that should have rattled every engineering manager in Europe:

> "4% of GitHub public commits are being authored by Claude Code right now. At the current trajectory, we believe that Claude Code will be 20%+ of all daily commits by the end of 2026. While you blinked, AI consumed all of software development."

Read that again, because the framing matters. Not "4% of commits were AI-assisted." Not "4% of developers use AI." Four percent of all public commits on the world's largest code host, *authored* by a single product from a single vendor. One tool. One year after its research preview.

We are now in late July 2026. Roughly halfway through the window of that projection. And it is worth being honest about something: I could not find a credible, methodologically transparent update to that number. There are SEO blogs claiming Claude Code has passed 9% of global public commits this month. They cite nobody. Discard them. The 4% figure stands as the last serious measurement I can point at, and even that comes from a firm modelling the number rather than GitHub publishing it.

Which is itself part of the story. The single most consequential shift in how software gets made is happening faster than our ability to measure it.

## The people who build the tools have already surrendered

If the commit data feels abstract, the practitioner quotes do not.

Ryan Dahl — the creator of Node.js, not a man given to hype — posted in January: "the era of humans writing code is over. Disturbing for those of us who identify as SWEs, but no less true. That's not to say SWEs don't have work to do, but writing syntax directly is not it." Seven million views.

Boris Cherny, who built Claude Code, says of his own team: "Pretty much 100% of our code is written by Claude Code + Opus 4.5."

Malte Ubl, CTO of Vercel, describes his job with a precision that should make you uncomfortable: "my new primary job" is "to tell AI what it did wrong."

And Andrej Karpathy — the man who coined "vibe coding" — reports the thing nobody wants to say out loud: "I've already noticed that I am slowly starting to atrophy my ability to write code manually. Generation (writing code) and discrimination (reading code) are different capabilities in the brain."

That last quote is the one I'd pin above my desk. It is not a complaint about the tools. It is an early clinical note on what the tools do to us. Hold onto it — a later post in this series is entirely about it.

Meanwhile David Heinemeier Hansson, of Rails, writes elegies: "Writing Ruby code by hand in a text editor feels like such a luxury. Maybe this will soon be a lost art."

When the authors of your runtime, your framework, and your tooling all independently announce the end of an era within eight weeks of each other, that is not a hype cycle. That is a phase change.

## The gap where your competitors live

Here is the number from all this research that I find most actionable, and it is not the 4%.

The Stack Overflow 2025 Developer Survey found **84% of developers using AI** in some form — and only **31% using coding agents**.

Eighty-four versus thirty-one. That gap is the entire competitive landscape of the next eighteen months.

Because those are not two points on the same curve. Autocomplete and agentic delegation are different activities requiring different skills, different review practices, different team structures, and a different definition of what a developer's day looks like. The 84% bought a faster typewriter. The 31% are learning to run a team of tireless, overconfident junior engineers who never sleep and never learn from yesterday.

Most organisations I talk to think they are in the second group because they bought licences. They are in the first group. Buying Copilot seats is not agentic adoption, any more than buying Jira made anyone agile.

And the enterprise money has already moved. Accenture signed a multi-year partnership with Anthropic to train **30,000 professionals** on Claude — the largest Claude Code deployment to date at the time of announcement — aimed squarely at financial services, life sciences, healthcare, and the public sector. Those are the regulated, conservative, change-averse industries. They are not waiting for your architecture board to finish deliberating.

## The Torvalds arc

If you want a single narrative that captures how completely the ground has shifted in twenty months, follow Linus Torvalds.

**October 2024.** In an interview at the time of Open Source Summit Europe, he calls the AI industry "90% marketing and 10% reality" and says his approach is to "basically ignore it." He adds: "In five years, things will change, and at that point we'll see what AI is getting used every day for real workloads."

He gave himself five years. It took roughly eighteen months.

**November 2025.** At Open Source Summit Korea he is "fairly positive" about vibe coding as a way for people to "get computers to do something that maybe they couldn't do otherwise" — but warns it "may be a horrible, horrible idea from a maintenance standpoint." He is still not using AI-assisted coding himself. He complains about maintainers drowning in "bugs and security notices that are… made up by people who misuse AI."

**January 2026.** He publishes AudioNoise. From his own README: "the python visualizer tool has been basically written by vibe-coding… I cut out the middle-man -- me -- and just used Google Antigravity to do the audio sample visualizer."

**17 May 2026.** In the Linux 7.1-rc4 announcement, the pain is operational and specific: "the continued flood of AI reports has basically made the security list almost entirely unmanageable, with enormous duplication due to different people finding the same things with the same tools." His conclusion is not prohibition, it is engineering discipline: "AI tools are great, but only if they actually help, rather than cause unnecessary pain and pointless make-believe work. Feel free to use them, but use them in a way that is productive and makes for a better experience."

**20 May 2026.** On stage with Dirk Hohndel at Open Source Summit North America, he asks the room who is using AI to code. His read: "yeah, pretty much everybody." He reports kernel commit volume up around **20% for the past two releases**, which he attributes to AI tooling lowering the barrier to writing a patch. And he delivers the best deflationary line anyone has produced on this subject: "AI will increase your productivity by a factor of 10. And I claim that compilers increase your productivity by a factor of a thousand. So AI is great, but AI is not changing programming."

He also identifies exactly where the real problem sits: "The conflict is not that AI is bad, the conflict is then that there are some social checkpoints and social pain points that come with this new tool." And: "I'm actually very positive about this whole thing."

**Mid-July 2026.** On the linux-media list, in a thread about wiring Patchwork up to an AI review bot, someone invokes recommendations that projects should support contributors who reject LLM tooling outright. Torvalds puts his foot down:

> "I realize that some people really dislike AI, but this is an area where I'm willing to absolutely put my foot down as the top-level maintainer. Linux is not one of those anti-AI projects, and if somebody has issues with that, they can do the open-source thing and fork it. Or just walk away."

> "AI is a tool, just like other tools we use. And it's clearly a useful one. It may not have been that 'clearly' even just a year ago, but it's no longer in question today. There are other questions around AI (like what the economy of it will actually look like in the end), but 'is it useful' is no longer one of those questions. Anybody who doubts that clearly hasn't actually used it."

And then the line that is the actual thesis of this entire blog series:

> "But the solution is not to put your head in the sand and sing 'La La La, I can't hear you' at the top of your voice like some people seem to do. The solution is to make sure those LLM tools _help_ maintainers instead of just causing them pain."

Be precise about what he did and did not say, because the internet was not. He did not mandate AI. He did not say maintainers must accept generated patches. The kernel's own documentation is strict in the other direction: AI agents **must not** add `Signed-off-by` tags, because only a human can certify the Developer Certificate of Origin. A human reviews, a human signs, a human takes "full responsibility for the contribution." Generated work gets "additional scrutiny in proportion to how much of it was generated," and maintainers may reject a series outright if you cannot defend it.

What Torvalds said is narrower and far more interesting: *you no longer get to argue about whether. You only get to argue about how.*

## The bot that finds bugs your humans missed

One more data point, because it is the one that ends the "AI code is slop" conversation in its current form.

Sashiko is an agentic kernel patch reviewer, announced in March 2026 and now reviewing traffic on kernel mailing lists. Its creator, Roman Gushchin, measured it against a thousand recent upstream issues identified by `Fixes:` tags:

> "Sashiko was able to find 53% of bugs based on a completely unfiltered set of 1,000 recent upstream issues using 'Fixes:' tags. Some might say that 53% is not that impressive, but 100% of these issues were missed by human reviewers."

One hundred percent of them got through the most scrutinised code review process in the history of software.

Andrew Morton's reaction was the correct engineering reaction: "Rule #1 is, surely, 'don't add bugs'. This thing finds bugs. If its hit rate is 50% then that's plenty high enough… That's a really high hit rate! How can we possibly not use this, if we care about Rule #1?"

And the pushback was equally correct. Within a month Sashiko had produced over 10,000 reviews averaging some 3,500 words per patch, with a false-positive rate its own author put in the neighbourhood of 20%. Lorenzo Stoakes, on the proposal to make responses to every bot comment mandatory: "Andrew, for crying out loud. Please don't do this."

Both men are right. That is the whole problem in miniature. The tool creates real value and real load, and the load lands on humans who did not choose it. Nothing in your Definition of Done, your sprint ceremony, or your team topology was designed for an actor that generates 3,500 words of plausible review commentary per patch at four in the morning.

## What this series is about

So: the adoption question is settled. It happened faster than the measurement infrastructure, faster than Torvalds's own five-year estimate, and faster than any governance framework you have written.

What is emphatically *not* settled is everything downstream. Who is accountable when the commit was authored by an agent and merely approved by a human? What does a sprint mean when the work happens overnight and continuously? What happens to the craft of engineering when, as Karpathy warns, the generation muscle atrophies while the discrimination muscle becomes the only one that pays? What does a team look like when its throughput is bounded by review capacity rather than typing capacity?

Torvalds framed it as well as anyone: "you need to understand not just your prompts, but you need to understand your end result, because that's the only way you can maintain it long term."

That is the uncomfortable middle we now live in. The machines write. We are still responsible. And almost none of our processes, org charts, or professional identities have caught up.

Lights out. Let's see what's actually running in the dark.

---

*Next in this series: **Who is running the nightshift?** — what it actually means to have agents working while your team sleeps, and why nobody owns the output.*

---

## Sources

- SemiAnalysis, "Claude Code is the Inflection Point," 5 February 2026 — https://newsletter.semianalysis.com/p/claude-code-is-the-inflection-point (Dahl, Cherny, Ubl, Karpathy and DHH quotes, Stack Overflow figures and the Accenture deal are all cited via this note; originals linked within it)
- Stack Overflow Developer Survey 2025 — https://survey.stackoverflow.co/2025
- Accenture / Anthropic partnership announcement — https://newsroom.accenture.com/news/2025/accenture-and-anthropic-launch-multi-year-partnership-to-drive-enterprise-ai-innovation-and-value-across-industries
- Torvalds, "90% marketing and 10% reality," TFiR interview, published 17 October 2024 — https://tfir.io/linus-torvalds-on-the-kernel-genai-evs-programming-languages-and-more/
- Torvalds on vibe coding, Open Source Summit Korea, The Register, 18 November 2025 — https://www.theregister.com/2025/11/18/linus_torvalds_vibe_coding/
- Torvalds, AudioNoise README — https://github.com/torvalds/AudioNoise
- Torvalds, Linux 7.1-rc4 release announcement, 17 May 2026 — https://lwn.net/Articles/1073192/
- Torvalds & Hohndel keynote, Open Source Summit NA, LWN, 25 May 2026 — https://lwn.net/Articles/1073761/
- Torvalds, "Linux is not one of those anti-AI projects," linux-media list, mid-July 2026 — https://lore.kernel.org/linux-media/CAHk-=wi4zC+Ze8e+p3tMv8TtG_80KzsZ1syL9anBtmEh5Z40vg@mail.gmail.com/ (reproduced verbatim at https://www.phoronix.com/news/Linux-Is-Not-Anti-AI)
- Linux kernel, `Documentation/process/coding-assistants.rst` — https://docs.kernel.org/process/coding-assistants.html
- Linux kernel, "Guidelines for Tool-Generated Content" — https://docs.kernel.org/process/generated-content.html
- Sashiko announcement and Gushchin's 53% measurement, LWN, 19 March 2026 — https://lwn.net/Articles/1063303/
- Sashiko in the mm workflow (Morton / Stoakes exchange, review volume), LWN, 31 March 2026 — https://lwn.net/Articles/1064830/
