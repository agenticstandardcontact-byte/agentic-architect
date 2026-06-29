# Seven words that stop Cursor hallucination loops

You have seen this spiral: the AI invents an API that does not exist, you correct it, it apologises and invents a different wrong API, you correct it again, and twenty minutes later you are debugging the assistant instead of your code. The fix is not a longer system prompt. It is a hard stop, seven words. And optionally a rule that enforces the same behaviour before you have to type them.


## What a hallucination loop looks like

It usually starts on a method the model half-remembers. You ask Cursor to wire up a handler against an interface you know exists. It returns something plausible:


```
await _mediator.Send(new ProcessOrderCommand(id), cancellationToken);
```

Clean. Confident. Wrong, ProcessOrderCommand takes a Guid and a CustomerContext, not an int. You point that out. The model agrees, rewrites the call, and quietly changes the command constructor to match its mistake. You correct the constructor. It moves the validation into a private method that calls _db.ValidateOrderAsync, a method that does not exist and never will.

Each turn sounds cooperative. Each turn drifts further from the file on disk. That is a hallucination loop: high confidence, low grounding, escalating wrongness.


## Why "be more careful" never works

Generic instructions, think step by step, double-check your work, do not hallucinate, do not change the failure mode. The model is already trying to satisfy your last correction. The problem is not effort; it is missing evidence. It is answering from pattern completion instead of re-opening the source.

Longer preambles make it worse. You burn tokens on politeness while the model still has not re-read the interface definition three files away. What you need is not encouragement. You need a circuit breaker, the same pattern you use when a retry policy should stop calling a failing downstream service.


## The seven words

When you recognise the loop, two failed fixes on the same symbol, invented members, or repeated apologies without a file quote, paste this and nothing else:

> Stop. Re-read the file. Ask me.

Seven words. No preamble. No new requirements. The phrase does three things:

In practice the next reply is slower and shorter. It quotes real members. It asks whether you meant ProcessOrderCommand or the older SubmitOrderCommand before touching DI registration. That is the behaviour you want from a senior pair, not another speculative patch.


## When to trip the breaker

Use it when any of these are true:

Do not use it for slow but steady progress, one wrong import fixed on the second try is normal. The breaker is for spirals, not single mistakes.


## From manual phrase to automatic rule

Typing the seven words works, but you should not have to remember them at 17:30 on a Thursday. That is what bug-breaker.mdc is for in the Agentic Architect kit: a scoped rule that loads on code files and encodes the same contract:

Because it is directory-scoped like the other kit rules, it does not inflate every prompt. It sits quiet until you are actually editing implementation code, exactly where loops hurt.


## How it pairs with persistence

Hallucination loops are worse when the model has no memory of yesterday's decision. You explain that orders flow through Mediator, not direct repository calls. It forgets by Friday and loops on a repository shortcut again.

The circuit breaker stops the session spiral. persistence.mdc plus LEARNING_LOG.md stops the week-over-week spiral by writing decisions the model re-hydrates on session start. Together they address two different half-lives of the same problem, which is why the kit ships four rules, not one mega-prompt.


## What this does not fix

Honest limits: the breaker will not save a prompt that contradicts your architecture, and it will not replace code review. It also cannot fix context rot at Monday stand-up, that is the Context Tax problem, solved with persistence and scoped boundaries, not a stop phrase.

What it does fix is the most expensive hour in AI-assisted development: the hour you spend as the human circuit breaker while the model confidently ships fiction.

Free download


### Stop Cursor's 3 most common .NET regressions — free

Get the Agentic Architect Starter Kit: 3 Cursor rules that prevent throw instead of Result<T>, captive DI dependencies, and missing AsNoTracking(). Installs in 3 minutes.

Free. No spam. Unsubscribe any time. By subscribing you agree to the Privacy Policy and Terms of Service.
Published: May 20, 2026


---

Canonical HTML: https://agentic-architect.dev/blog/03-cursor-hallucination-loop-breaker.html
Site feed: https://agentic-architect.dev/feed.xml
