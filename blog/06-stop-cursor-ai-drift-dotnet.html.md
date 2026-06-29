# How to stop Cursor AI forgetting your .NET architecture (the $9 fix)

Published: May 30, 2026 · 8 min read

Your Cursor session starts. You type your first prompt. The AI confidently suggests instantiating HttpClient inside your repository — the exact anti-pattern you banned six months ago. You sigh, type 'actually we use typed HttpClients registered via DI,' and burn 15 minutes re-teaching an AI that was supposed to help you. This is the Context Tax. Every .NET developer using Cursor pays it. Here's how to stop.

## The Context Tax: what it costs you every morning


The Context Tax is the fifteen minutes you spend re-explaining your codebase to Cursor at the start of every session. You describe your DI conventions, your Clean Architecture layers, your EF Core patterns, your Result pipeline. Cursor nods along. You build a feature. Session ends. Next morning? Back to square one.


Multiply that by 250 working days and you're losing 62 hours a year — nearly two full working weeks — just re-establishing context. At a senior contractor rate of £75/hr, that's £4,650 of lost time. Per developer.


## Why Cursor's built-in rules aren't enough


Cursor supports a .cursor/rules/ directory. You can drop .mdc files in there and the AI reads them. So why doesn't that solve the problem?


### 1. Monolithic rules dump tokens, not context


Most public Cursor rules repos give you a single rules.mdc file that gets loaded on every prompt. Every. Single. Prompt. That's 2,000+ tokens of preamble before your actual instruction. Your fast-request budget evaporates on rules that aren't even relevant to the file you're editing.


### 2. Rules describe — they don't persist


A rule that says "use Result not exceptions" tells Cursor what to do. But it doesn't tell Cursor why you chose that pattern, what you tried before it, or what edge cases you hit. That's state. And rules alone don't carry state.


### 3. No circuit breaker on hallucinations


When Cursor gets stuck — and it will — it doesn't know when to stop. It invents methods that don't exist, doubles down on wrong answers, and burns tokens in a loop. There's no built-in mechanism to say "step back and re-read the file."


## The fix: directory-scoped rules + a stateful Learning Log


The solution to context drift isn't a bigger prompt file. It's a persistence protocol — a system that loads only the right rules for the right files, and maintains a Learning Log that the AI reads, updates, and carries across sessions.


Here's what that looks like in practice. When you open a file in ~/api/Services/, only the DI auditor and architecture boundary rules activate. When you're in the data layer, only the EF Core read-pattern enforcer kicks in. And every architectural decision you make gets logged — so tomorrow morning, the AI picks up right where you left off.


## The 4 rules that make Cursor stateful


The Agentic Architect framework ships four specialist .mdc rules. Each solves a specific failure mode of the Context Tax.


### arch-core.mdc — The Boundary Guardian


Enforces your Clean Architecture layers. No DbContext in controllers. No business logic in repositories. No crossing layer boundaries without explicit justification. The AI starts every prompt already knowing your SOLID boundaries.


- SOLID compliance audits on every AI suggestion
- Layer boundary enforcement (Presentation / Application / Domain / Infrastructure)
- Anti-pattern early-warning — catches the 'Big Ball of Mud' before it starts


### dotnet-di.mdc — The DI Auditor


A dedicated dependency injection auditor that catches Scoped → Singleton capture bugs during AI code generation. Knows IServiceCollection, Scrutor, Autofac, and the Microsoft DI container cold.


- Lifetime mismatch detection (Scoped injected into Singleton)
- Constructor-injection best-practice enforcement
- Module registration discipline — prevents spaghetti registrations


### bug-breaker.mdc — The Hallucination Killer


A circuit-breaker that detects when the AI is looping on a bad solution. Forces Cursor to step back, re-read the file, and ask you — instead of inventing methods that don't exist and burning through your token budget.


- Loop-detection on repeated failed attempts
- Forced context re-read protocol — stops the spiral
- Token waste prevention — fewer tokens burned on hallucinations


### persistence.mdc — The Learning Log Engine ★


The crown jewel. This rule maintains a LEARNING_LOG.md file at your project root — a living document that records every architectural decision, refactor reason, constraint discovery, and 'we tried that, don't do it again' lesson. Each session starts with the AI auto-hydrating from the log.


- ADR-style decision logging (architectural decisions get timestamped entries)
- Session-start hydration — AI reads the log before processing any prompt
- Cross-session continuity — the AI remembers decisions from last week, last month


## What the rules actually prevent (real drift examples)


These aren't hypothetical. These are the specific regressions the framework catches that raw Cursor will happily generate.


| The Drift | What Cursor Does | What the Rules Do |
| --- | --- | --- |
| throw instead of Result | Cursor defaults to try/catch/throw in controllers — ignores your Result convention set 6 months ago | arch-core.mdc blocks throw in controllers. dotnet-di.mdc requires Result through your pipeline. |
| Captive DI dependencies | AI injects a Scoped DbContext into a Singleton cache service — compiles fine, explodes at runtime | dotnet-di.mdc catches the lifetime mismatch during generation and blocks the suggestion. |
| Missing AsNoTracking() | Cursor generates reads that track every entity — memory balloons, queries slow | ef-core-reads.mdc enforces AsNoTracking() on all query-only operations. |
| Hallucination spiral | AI invents IOrderRepository.FindByLegacyCode(), code doesn't compile, AI invents another method to fix it | bug-breaker.mdc detects 3+ failed attempts on the same file, forces a re-read, and asks you. |


## Install in 60 seconds. No build step. No config.


1. Download the kit — you get the full .cursor/rules/ folder and a pre-seeded LEARNING_LOG.md.
2. Drop into your project root — .cursor/rules/ auto-detects. No CLI commands. No build tools.
3. Run the hydrate prompt once — the AI reads your codebase, seeds the Learning Log with existing patterns, and starts tracking from there.


## All 9 specialist rules, one £9.00 payment


The full kit ships with all 9 production-tested .mdc rules — the 4 described above plus 5 more covering Result pattern discipline, EF Core performance patterns, MediatR conventions, and more. MIT-licensed. Commit them. Share them with your team. Modify them. They're yours.


- 9 specialist .mdc rules — directory-scoped, token-efficient
- Pre-seeded LEARNING_LOG.md template
- Quickstart PDF — install and hydrate in 60 seconds
- Lifetime updates — new rules and protocol upgrades free forever
- MIT-licensed — no subscription, no cloud lock-in, no vendor dependency
- 30-day no-questions refund — if it doesn't stop the Context Tax, get your money back


## Built for senior .NET engineers, not beginners


This framework assumes you already have a Clean Architecture/DDD codebase, you use Cursor daily, and you're tired of the AI forgetting your conventions. If you're learning C# for the first time, come back when you have architecture to protect.


If you're a Staff Engineer who's spent the last 6 months building a MediatR pipeline with Result and orchestrated handlers — and Cursor still suggests throw new Exception() in your controllers — this is for you.


---

Canonical HTML: https://agentic-architect.dev/blog/06-stop-cursor-ai-drift-dotnet.html
Site feed: https://agentic-architect.dev/feed.xml
