# GLM 5.2 vs Claude Fable 5: agentic coding at a fraction of the cost

Published: July 7, 2026 · 6 min read

I gave GLM 5.2 and Claude Fable 5 the same real job: redesign a project plan and start implementing it. Fable 5 finished in about 9 minutes and cost me a little over $10. GLM 5.2 took about 17 minutes and cost $2.76. The open model was slower, no question. But the output was just as good for this task, and it cost roughly a quarter as much. That math has me excited about running agents on open weights this year.

## The task and the numbers


Same prompt on both, same repo context, same agent harness. The job wasn't a toy benchmark. It was the kind of thing I actually do in a working week: take a half-formed project plan, restructure it, and start writing the code. Here's what each run looked like.


| Model | Time | API cost | Output quality |
| --- | --- | --- | --- |
| Claude Fable 5 | about 9 min | over $10.00 | Clean plan, usable first pass at the code |
| GLM 5.2 | about 17 min | $2.76 | Equally good plan and first pass for this task |


Fable 5 is clearly the faster model, and on raw benchmarks it's the stronger one too. What surprised me was how little that mattered for this task. GLM 5.2's plan was just as workable, and the code it produced was fine. I went in expecting to pay the Fable 5 tax for quality and came out thinking I'd overpaid.


## What each model actually is


Two different labs, two different bets. Fable 5 is Anthropic's top generally available model, a new tier above Opus they're calling Mythos-class. GLM 5.2 is Z.ai's (formerly Zhipu) open-weight coding flagship, with the weights out under MIT.


|  | Claude Fable 5 | GLM 5.2 |
| --- | --- | --- |
| Maker | Anthropic | Z.ai (Zhipu) |
| Released | June 9, 2026 | June 13, 2026 |
| Tier | Mythos-class (above Opus) | Open weights, MIT licence |
| Architecture | Closed | Sparse MoE, about 40B active / 753B total |
| Context window | 1M tokens | 1M tokens |
| Max output | 128K tokens | 128K tokens |
| Model ID | claude-fable-5 | GLM-5.2 (Z.ai API / HF weights) |


## The pricing, per million tokens


This is where the story changes. Fable 5 is $10 in and $50 out per million tokens. GLM 5.2 is $1.40 in and $4.40 out. Cached input is where Fable 5 claws some back, but it's still several times more expensive.


| Per 1M tokens | Claude Fable 5 | GLM 5.2 | Ratio |
| --- | --- | --- | --- |
| Input | $10.00 | $1.40 | about 7x |
| Output | $50.00 | $4.40 | about 11x |
| Cached input | $1.00 | $0.26 | about 4x |
| Batch input | $5.00 | (vendor batch) | n/a |
| Batch output | $25.00 | (vendor batch) | n/a |


Agentic loops are output-heavy. The model reads your files, thinks, edits, reads again. Most of the token spend is output, which is exactly where Fable 5 is most expensive. That's why my $10+ run vs $2.76 run lined up so closely with the output-price ratio.


## Where Fable 5 wins


On benchmarks, Fable 5 is ahead and it's not subtle. Anthropic puts it state-of-the-art on CursorBench and FrontierBench, and it's the first to break 90 percent on their core analytics benchmark. The independent numbers agree:


- SWE-bench Verified: 95.0% for Fable 5. GLM 5.2 doesn't publish a comparable Verified number.
- SWE-bench Pro: 80.0% for Fable 5 vs 62.1 for GLM 5.2. Same suite, Fable 5 clearly ahead.
- FrontierCode / FrontierBench: Fable 5 takes the #1 spot. GLM 5.2 scores 74.4 on FrontierSWE, which is strong for an open model but behind Fable 5.
- Speed. In my run, Fable 5 finished in roughly half the wall-clock time.


If you're doing the hardest long-horizon refactors, the ones where a model has to hold a plan together across many steps and a wrong turn costs you an hour of cleanup, Fable 5 is the safer pick. The gap on SWE-bench Pro is real.


## Where GLM 5.2 wins


Price is the obvious one, but it's not the only one. GLM 5.2 is the top open-weight model on the Artificial Analysis Intelligence Index (51, fifth overall, with Fable 5, Opus 4.8, and GPT-5.5 ahead of it). For an open model that's a serious showing.


- SWE-bench Pro 62.1 beats GPT-5.5's 58.6 on the same suite. That's the headline number Z.ai published, and it holds up.
- Terminal-Bench 2.1: 81.0, up from GLM 5.1's 62.0. Big jump on shell-and-tool work.
- 1M context, usable. Z.ai trained for long context specifically, and the 1M window isn't just a spec-sheet number.
- MIT weights. You can self-host. No per-token bill at all if you have the GPUs, and no vendor lock-in.
- Cost. My run came in at roughly a quarter of Fable 5's price for output-equivalent work.


The GLM Coding Plan subscription is reportedly about a tenth of Anthropic's Claude Code and Claude Max tiers, if you'd rather pay a flat fee than meter tokens. For someone running agents all day, that alone changes the economics.


## The honest verdict


Fable 5 is the better model. The benchmarks say so and my run felt that way too, faster and a touch more confident on the hard parts. If the task is hard and a wrong step is expensive, pay for Fable 5.


But most of my agent runs aren't that. They're plan-and-implement, refactor-and-test, the bread and butter where good-enough plus cheap wins on volume. For those, GLM 5.2 is now my default. $2.76 instead of $10-plus per run means I can let the agent loop without watching the meter, and that changes how I work. An open model that's this close, this much cheaper, and self-hostable is the thing I've been waiting for open weights to deliver.


If you're running agents on closed frontier models and wincing at the bill, give GLM 5.2 a real task this week and compare. I'd guess you keep Fable 5 for the hard ones and switch the rest.


---

Canonical HTML: https://agentic-architect.dev/blog/09-glm-5-2-vs-claude-fable-5.html
Site feed: https://agentic-architect.dev/feed.xml
