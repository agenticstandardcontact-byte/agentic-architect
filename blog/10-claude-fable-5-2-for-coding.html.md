# Claude Fable 5.2 for coding: price, effort levels, and when to use it

Published: November 27, 2026 · 10 min read

Anthropic shipped Claude Fable 5.2 and Claude Mythos 5.2 on 9 November 2026, and Cursor put Fable 5.2 in its model picker the same day. It is the top model on the Artificial Analysis Intelligence Index, it's 20% cheaper per token than Fable 5.1, and it can still burn through a budget faster than anything else you can select. This is the practical version for people who write production code: the verified numbers, what an agent run really costs at each effort level, and when it's worth reaching for on a .NET codebase.

## Fable 5.2 vs Mythos 5.2: one model, two doors


The naming confuses people, so start here. Anthropic says Fable 5.2 and Mythos 5.2 are the same underlying model. Fable is the generally available version with strong cybersecurity and biology safeguards. Mythos has more permissive safeguards in those domains and is only available to organisations verified through Anthropic's Cyber and Life Sciences Verification Programs. Both share the same specifications and the same price.


For everyday software work, the distinction rarely matters: you will be using Fable. The one place you might notice it is security-adjacent work, where Fable's safeguards block most cybersecurity tasks. More on what Cursor does when that happens below.


## The facts at a glance


|  | Claude Fable 5.2 |
| --- | --- |
| Released | 9 November 2026 (Mythos 5.2 the same day) |
| API model ID | claude-fable-5-2 |
| Context window / max output | 1M tokens / 128K tokens |
| Price per 1M tokens | $8 input / $40 output (Fable 5.1 was $10 / $50) |
| Prompt cache | Reads $0.20 per 1M tokens; writes $10 per 1M (Cursor's published rates) |
| Fast mode | Up to 2.5x faster generation at $16 / $80 per 1M tokens |
| Effort levels | Low, medium, high, extra high (xhigh), max |
| Where | Claude apps and API, Amazon Bedrock, Google Cloud, Microsoft Foundry, and Cursor |


## What changed from Fable 5.1 (and from Fable 5)


If you last looked at this line when Fable 5 launched in June, three things moved:


- Price. $8 in / $40 out per million tokens, down 20% from the $10 / $50 that Fable 5 and Fable 5.1 charged.
- Speed. Anthropic says outputs arrive up to 30% faster than Fable 5.1, and its safeguards produce fewer unnecessary blocks.
- Coding results. On Anthropic's own table, FrontierCode 2.0 (would maintainers merge the change?) went from 32.4% on Fable 5.1 to 49.1% at xhigh effort, ahead of Opus 5.5's 45.5%. FrontierSWE v2 went from 56.3% to 69.9%. On CursorBench, Cursor's own benchmark of real coding tasks, Fable 5.2 scored 60.0% at max effort and 56.9% at default, up from 49.2% for Fable 5.1.


Two caveats keep that honest. The headline tables are vendor-reported and use each model's best effort setting. And leadership is fragile: one day after launch, Cursor reported Gemini 4 Carbon at high effort edging past Fable 5.2 on CursorBench with 60.4%. Treat any "#1" as a snapshot.


## The Artificial Analysis index, and why effort is the real price dial


The independent number people search for is the Artificial Analysis Intelligence Index. Fable 5.2 at max effort scores 65, first on the leaderboard as of late November 2026. But the index also shows what each effort level costs per task, and that's the table worth pinning above your desk:


| Fable 5.2 effort | AA Intelligence Index | Cost per index task | Reading |
| --- | --- | --- | --- |
| Low | 54 | $3.10 | Cheap, still competitive with mid-tier frontier models |
| Medium | 56 | $3.80 | Anthropic's default in Claude apps and Claude Code |
| High | 62 | $9.08 | Cursor's recommended starting point; beats Opus 5.5 at max (59) |
| Extra high | 62 | $14.83 | Same score as high for about 63% more money |
| Max | 65 | $26.54 | Top of the index, roughly 2.9x the cost of high |


Three things fall out of that. First, high is the sweet spot: it scores above Opus 5.5 at its maximum setting (59 at $10.04 per task) for slightly less money. Second, extra high buys nothing on this index, so don't make it your default. Third, the model is verbose: Artificial Analysis counted 275M output tokens across the index at max effort, against a median of roughly 65M for comparable models. In agent loops, output is where the money goes, and output is the expensive side of the price sheet.


Cursor's docs add a practical note: Fable 5.2 always thinks before answering and decides how long on its own, so there is no thinking toggle, only the effort setting. Its effort levels behave differently from Fable 5.1's, so don't carry an old setting over. Start at high.


## What a real agent run costs: the arithmetic


Per-token prices are abstract until you run the numbers on a session shape you recognise. Take a medium-sized .NET task: the agent reads a handful of handlers, a DbContext configuration and a test project, then iterates for about 20 turns. Assume each turn re-sends roughly 50K tokens of context (1M input tokens in total) and the model writes 80K output tokens across the session, including its thinking. This is illustrative arithmetic, not a measurement:


| Scenario | Input cost | Output cost | Total |
| --- | --- | --- | --- |
| No prompt caching | 1M x $8 = $8.00 | 80K x $40 = $3.20 | $11.20 |
| 90% of input served from cache (100K written, 900K read) | $1.00 + $0.18 = $1.18 | $3.20 | about $4.40 |
| Same session at max effort (output roughly triples) | $1.18 | about $9.60 | about $10.80 |


The lessons generalise. Caching does most of the work on input; Cursor manages it for you, but a stable prefix (the same rules, the same instructions, at the start of every request) is what makes caching effective. On output, the effort setting is the multiplier. And whatever plan you're on, Fable 5.2 is a third-party model in Cursor: on The X Subscription it bills at these rates from prepaid credit, and on legacy plans it draws from the Other Models pool. Set a spending cap before you leave it running overnight.


## When Fable 5.2 earns its place over Opus 5.5 on .NET work


Anthropic's own advice is to start most coding with Claude Opus 5.5, its "strongest daily driver", and move up to Fable for the most ambitious, open-ended work. Cursor puts Fable 5.2's per-token rates at roughly twice Opus 5.5's. That framing maps well onto a senior .NET workload:


| Task | Reach for | Why |
| --- | --- | --- |
| New endpoint, handler, validator and tests following existing patterns | Opus 5.5 or Sonnet 5.5 | Pattern-following work; Fable's extra judgment is wasted |
| Hunting a captive dependency or lifetime bug across 30 projects | Fable 5.2 (high) | Long-horizon reasoning over a messy dependency graph |
| Migrating a legacy module to a new architecture or framework | Fable 5.2 (high or xhigh) | The "otherwise-infeasible migration" class Anthropic designed it for |
| Ambiguous spec: "make the order pipeline idempotent" | Fable 5.2 | It asks better questions and plans before touching files |
| Bulk mechanical edits (rename, add CancellationToken everywhere) | A cheaper model | Correctness comes from the compiler and tests, not the model |


There's also a middle path Anthropic calls Advisor and Orchestrator: Fable 5.2 plans and reviews while cheaper models do the typing. In practice that means using Fable for the plan and the final review of a large change, and a cheaper model for the implementation in between.


## Using Fable 5.2 in Cursor: three gotchas


1. Privacy Mode and Enterprise accounts don't see it by default. Because Anthropic retains Fable inputs and outputs for up to 30 days for harm-prevention review (not for training), the model is off for teams with Privacy Mode and for all Enterprise customers until an admin approves the data-retention policy. The approval applies team-wide. Personal accounts without Privacy Mode have it on by default.
2. Requests can fall back to Opus. When a request trips Fable's security guardrails, Cursor routes it to Claude Opus automatically instead of erroring. Useful, but if you're comparing model output on security-adjacent code (auth, crypto, input validation), know that you might not be looking at Fable.
3. It's metered on top of your plan. As above: Fable 5.2 isn't part of Cursor's included usage on The X Subscription. Check the usage page after your first serious session, not after the month closes.


## A smarter model still doesn't remember your architecture


Here's the part the benchmark tables don't cover. Fable 5.2 exercises noticeably better judgment, and testers report it says "I don't know" instead of inventing an answer. But every session still starts empty. It doesn't know that your Domain project must never reference Microsoft.EntityFrameworkCore, that business failures return Result&lt;T&gt; instead of throwing, or that you rejected MediatR pipelines for logging three months ago, unless that knowledge is in the context it receives.


Better judgment applied to missing context just produces more confident drift. The fix is the same for every model: committed, scoped rules plus a decision log the agent reads at the start of the session. A rule like this behaves identically whether the picker says Fable, Opus or GLM:


```
---
description: Layer boundaries for the Domain project
globs: src/Domain/**/*.cs
alwaysApply: false
---
- Domain has no references to EF Core, HttpClient, IConfiguration or ASP.NET Core.
- Business rule violations return Result<T>; never throw for expected failures.
- Read LEARNING_LOG.md before proposing a new pattern; cite the ADR you are following.
```


That's the problem described in The Context Tax and the framework in How to stop Cursor forgetting your .NET architecture. A stable rule set has a second benefit with an expensive model: it's a stable prefix, which is exactly what makes prompt caching pay.


## Fable 5.2 or an open-weight model for cost-sensitive runs?


If most of your agent runs are plan-and-implement work rather than hard migrations, the cost gap to open-weight models is large: GLM 5.2 lists at $1.40 in / $4.40 out, so Fable 5.2's output tokens cost about nine times as much. Our GLM 5.2 vs Claude Fable 5 comparison walks through a real run on both. The conclusion holds with 5.2: pay for Fable where a wrong step is expensive, and default to something cheaper where it isn't.


## Sources


- Anthropic, Introducing Claude Fable 5.2 and Claude Mythos 5.2 (9 Nov 2026) and the Fable 5.2 model overview: release date, model ID, context, pricing, fast mode, benchmark table, Opus 5.5 guidance.
- Cursor docs, Claude Fable 5.2: effort guidance, Privacy Mode and Enterprise opt-in, data retention, automatic fallback to Opus, cache rates, billing on X Subscription and legacy plans.
- Cursor launch post (9 Nov 2026): CursorBench 60.0% at max, 56.9% at default, 49.2% for Fable 5.1. Gemini 4 Carbon 60.4% reported 10 Nov 2026.
- Artificial Analysis, Claude Fable 5.2 model page and leaderboard (checked 27 Nov 2026): Intelligence Index by effort level, cost per task, output-token totals.


## FAQ


### What is the difference between Claude Fable 5.2 and Claude Mythos 5.2?

They are the same underlying model with the same specifications and pricing. Fable 5.2 is generally available and has stronger cybersecurity and biology safeguards; Mythos 5.2 is restricted to organisations verified through Anthropic's Cyber and Life Sciences Verification Programs.


### How much does Claude Fable 5.2 cost?

$8 per million input tokens and $40 per million output tokens, 20% less than Fable 5.1. Prompt-cache reads cost $0.20 per million tokens. Optional fast mode costs $16 / $80 per million tokens.


### What is Fable 5.2's Artificial Analysis Intelligence Index score?

65 at max effort, the top score on the index as of late November 2026. It scores 62 at high and extra high, 56 at medium and 54 at low, with cost per index task ranging from $3.10 at low to $26.54 at max.


### Is Claude Fable 5.2 available in Cursor?

Yes, since 9 November 2026. It is on by default for personal accounts without Privacy Mode. Teams with Privacy Mode and Enterprise accounts need an admin to approve Anthropic's data-retention policy first. It is billed as a third-party model on top of Cursor's included usage.


### Fable 5 vs Fable 5.2: what's the difference?

Fable 5.2 is cheaper ($8/$40 versus $10/$50 per million tokens), faster, and scores substantially higher on coding benchmarks such as FrontierCode 2.0 and CursorBench. Both have a 1M-token context window and 128K-token output limit.


---

Canonical HTML: https://agentic-architect.dev/blog/10-claude-fable-5-2-for-coding.html
Site feed: https://agentic-architect.dev/feed.xml
