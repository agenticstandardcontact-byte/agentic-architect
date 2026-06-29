# The Context Tax: Why every Cursor session costs you 15 minutes

There's a hidden cost senior engineers pay every morning when they open Cursor. It compounds quietly, it doesn't show up on any dashboard, and at a typical senior billing rate it's worth thousands of pounds a year. I call it the Context Tax. Below: why it happens, what it costs, and the four-rule setup I use to cut it down.


## The 15-minute problem

Open Cursor on Monday morning. New chat. You're picking up where you left off Friday, adding a caching layer to OrderService. You type:

> "Add Redis caching to this method."

And the AI returns something technically correct, but architecturally wrong. It instantiates ConnectionMultiplexer directly in the service constructor. It uses IMemoryCache as if your project doesn't already register IDistributedCache. It writes a synchronous wrapper around an async call.

You sigh. You type the preamble. Again.

> "This project uses Mediator and Result<T>. We register caching through IDistributedCache in /Infrastructure/Caching. Don't reach into ConnectionMultiplexer directly. Don't put any caching logic in the Service layer, wrap it via a decorator in Infrastructure. And we never instantiate dependencies, we inject them via constructor."

Three paragraphs. Maybe four. By the time the AI has the context it needs to actually be useful, you've spent fifteen minutes typing what your codebase has already shown it dozens of times before.

That's the Context Tax.


## Why it happens

Cursor, like every other AI coding tool right now, has no persistent memory between sessions. Each new chat starts fresh. Every architectural decision your team has ever made, every refactor your codebase has ever absorbed, every "we tried that, it doesn't work for us", gone the moment you close the window.

The AI isn't stupid. It's amnesiac.

Worse: even within a session, the AI's understanding of your architecture is a fragile probability cloud. By Wednesday afternoon it has "forgotten" the convention it followed on Monday. It starts suggesting patterns that violate your boundaries. You correct it. It double-downs. You correct it again. It loops on the same hallucination, burning tokens, burning your time.

This is what I call AI drift, and on a long project it's the single biggest reason senior engineers go from "Cursor is incredible" to "I've turned the autocomplete off."


## The cost

Let's do the uncomfortable math.

On a five-engineer team that's the cost of a junior hire.


## The instinct that doesn't work

The obvious response is to write a long system prompt with all your conventions and paste it at the top of every new chat. Most senior engineers I know have tried this. It fails for three reasons:

You don't need a longer prompt. You need persistence.


## What persistence actually looks like

Once you stop thinking of Cursor as a chat-bot and start treating it as a stateful pair-programmer, the AI needs three things to behave like a senior:

None of these are exotic. They're standard senior-engineering moves applied to the AI itself.


## The four-rule architecture

I packaged the pattern I've been using on real .NET codebases into four .mdc files Cursor reads natively:

The whole thing lives in .cursor/rules/ and a single root-level LEARNING_LOG.md. Zero config. Zero build step. Commit it to your repo, your whole team gets the same baseline.


## What "after" looks like

Monday morning, two months in. New chat:

> "Add Redis caching to OrderService."

The AI responds:

> "Detected Scoped lifetime conflict with IMemoryCache (Singleton). Following Log Entry #27: 'Prefer IDistributedCache abstraction in /Infrastructure/Caching.' Applying decorator pattern via Scrutor per arch-core.mdc §3..."

No preamble. No correction loop. The AI already knows.

Free download


### Stop Cursor's 3 most common .NET regressions — free

Get the Agentic Architect Starter Kit: 3 Cursor rules that prevent throw instead of Result<T>, captive DI dependencies, and missing AsNoTracking(). Installs in 3 minutes.

Free. No spam. Unsubscribe any time. By subscribing you agree to the Privacy Policy and Terms of Service.
Published: May 18, 2026


---

Canonical HTML: https://agentic-architect.dev/blog/01-the-context-tax.html
Site feed: https://agentic-architect.dev/feed.xml
