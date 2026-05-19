# 🚀 Launch Day Playbook

> Everything below is **copy-paste-ready**. Don't write a single word on launch day — just paste, customise the obvious bits, and post.

## ⚡ The 24-hour plan

**Target launch day: a Tuesday or Wednesday.** Highest traffic window across all platforms.

| Time (UK) | Time (ET) | Action | Why |
|---|---|---|---|
| 12:00 AM Tue | 7:00 PM Mon | **Product Hunt launch live** | Goes live at midnight PT for max upvote runway |
| 8:00 AM Tue | 3:00 AM Tue | **X / Twitter thread** | Catches EU morning + US east coast wakeup |
| 1:00 PM Tue | 8:00 AM Tue | **Show HN** | Front page algo loves Tue 7–10 AM ET |
| 1:30 PM Tue | 8:30 AM Tue | **r/cursor** | Smaller sub, post first — easier to get sticky |
| 2:00 PM Tue | 9:00 AM Tue | **LinkedIn post** | Senior-engineer audience wakes up |
| 2:30 PM Tue | 9:30 AM Tue | **r/dotnet** + **r/csharp** | Tech-led angle (not product-led) |
| 3:00 PM Tue | 10:00 AM Tue | **dev.to article goes live** | Picks up traffic all week |
| 5:00 PM Tue | 12:00 PM Tue | **Lobsters submission** (if you have an invite) | Stricter crowd, slow burn |
| Throughout | Throughout | **Respond to every comment within 30 min** | Algorithms reward early engagement |

---

## 📰 Show HN

**Submit at:** https://news.ycombinator.com/submit

**Title (max 80 chars):**
```
Show HN: Stop your AI from forgetting your architecture every morning
```

**URL:**
```
https://agenticstandardcontact-byte.github.io/agentic-architect/
```

**First comment** (post this YOURSELF within 30 seconds of submitting — HN algo prioritises threads with author engagement):
```
Hey HN — I'm a senior .NET dev. I kept noticing I was spending the first
15 minutes of every Cursor session re-explaining my codebase to the AI:
DI patterns, project boundaries, why we use Mediator and Result<T>,
which folder owns infrastructure concerns. I called it the "Context Tax."

So I built a 4-rule persistence framework (.mdc files Cursor reads
natively) plus a Learning Log protocol that auto-maintains a markdown
"brain" the AI re-hydrates on every session start.

The hard part wasn't the rules — it was getting the AI to actually
*write to* the log when it learned something, and to *re-read it* on
session start without bloating the token budget. The trick was scoping
rules to directories so only the relevant ones load per file.

The other novel piece is a "circuit breaker" rule: when the AI hits the
same wall twice in a row, it forces a re-read of the file instead of
doubling down on the same wrong answer. That's been the single biggest
quality-of-life improvement, oddly.

Free repo with a starter rule, paid kit (£19.99) has all four rules
plus the persistence engine and Learning Log template.

Happy to answer anything about the persistence pattern itself — I think
it generalises well beyond .NET.
```

**If someone asks "isn't this just X?"** — be technical, not defensive:
> Honest answer: yes, you could write the equivalent in a weekend. The
> value is two-fold — (1) the scoping pattern that keeps the token
> budget sane, and (2) maintaining it as your architecture evolves.
> The Lite rule on the repo is free; if you want to roll your own from
> there, please do — and tell me what you change so I can learn from it.

---

## 🟠 r/cursor

**Submit at:** https://reddit.com/r/cursor/submit

**Title:**
```
My fix for AI context rot in long .NET projects — 4 .mdc rules + a Learning Log
```

**Body** (Reddit hates marketing — lead with technical contribution, soft-mention the paid kit at the bottom):
```
Senior .NET dev here. Long projects, lots of architectural opinion.
Cursor was burning the first 15 minutes of every session on me
re-explaining the codebase.

I packaged the pattern I've been refining into 4 scoped .mdc rules
plus a Learning Log protocol. Sharing here because I want to know
what other heavy Cursor users on real codebases think of the approach.

Three things I'd love feedback on:

1. **Directory-scoped rule loading.** Each .mdc declares globs so only
the relevant rules activate per file. The DI auditor doesn't fire on
controllers; the controller-thinness rule doesn't fire on Startup.cs.
Token budget stays sane.

2. **Persistent Learning Log.** A root-level LEARNING_LOG.md the AI
auto-appends to whenever it learns an architectural decision. On
session start it gets re-hydrated. Effectively gives the AI long-term
memory across sessions.

3. **Circuit breaker pattern.** A rule that detects repeated failed
attempts on the same problem and forces a re-read of the file instead
of letting the AI double down on the wrong answer.

Free starter rule + write-up here:
https://agenticstandardcontact-byte.github.io/agentic-architect/

Honest disclosure: there's a paid full version (£19.99 one-time, MIT-
licensed) — but the Lite rule and the patterns are free. Mostly
posting because I want to know if anyone else has solved the
"AI drift on long projects" problem differently.
```

---

## 🟣 r/dotnet & r/csharp

**Submit at:** https://reddit.com/r/dotnet/submit and https://reddit.com/r/csharp/submit

**These subs DON'T like product pitches. Lead with a *real technical pattern*** — the DI auditor catching Scoped→Singleton bugs is the strongest hook because it's a bug they've all shipped.

**Title:**
```
A Cursor rule that catches Scoped→Singleton DI bugs before they ship
```

**Body:**
```
Quick share for anyone using Cursor (or any AI assistant) on a serious
.NET codebase.

One bug class that's killed me historically is captured-dependency
lifetime conflicts — e.g. injecting a Scoped repo into a Singleton
hosted service, or accidentally capturing IMemoryCache (Singleton)
inside a Scoped service via a closure.

I wrote a .mdc rule for Cursor that audits suggestions before they
land. It flags:

- Scoped injected into Singleton (the classic)
- Captured Scoped dependencies in HostedService
- HttpClient instantiation instead of IHttpClientFactory
- DateTime.Now in business logic (mock-hostile)
- async void outside event handlers
- Task.Result / .Wait() on async paths

The reason it works better than a generic "be careful with DI" prompt
is that it loads only on files that are actually doing DI setup
(Program.cs, Startup.cs, ServiceCollectionExtensions.cs) so the AI's
context budget stays tight.

Free sample rule + the rest of the framework here:
https://github.com/agenticstandardcontact-byte/agentic-architect

Disclosure: full kit with three more rules is a £19.99 one-time
purchase. The sample rule and the pattern are free.

Curious what other anti-patterns you'd add to the auditor.
```

---

## 💼 LinkedIn

**Important:** Put the link in the **first comment**, not the post body. LinkedIn's algo punishes posts with external URLs.

**Post:**
```
Senior .NET engineers using Cursor — a question:

How much of your morning is just re-explaining your architecture
to the AI?

For me it was 15+ minutes. Every. Single. Day.

So I built a 4-rule persistence framework that locks architectural
decisions into Cursor's "long-term memory."

The Learning Log protocol auto-maintains a markdown file the AI
re-hydrates on session start. No more drift. No more "we use
Mediator and Result<T> in this project..." preamble for the
hundredth time.

The four rules:

→ arch-core.mdc — enforces SOLID boundaries, prevents big-ball-of-mud
→ dotnet-di.mdc — audits constructor injection + service lifetimes
→ bug-breaker.mdc — circuit breaker for AI hallucination loops
→ persistence.mdc — the engine that maintains the Learning Log

One-time £19.99. MIT-licensed. Lifetime updates.

Link in the first comment 👇
```

**First comment (you post this immediately):**
```
👉 https://agenticstandardcontact-byte.github.io/agentic-architect/

Free starter rule on the GitHub repo if you want to try the pattern first.
```

---

## 🐦 X / Twitter thread (7 tweets)

**Tweet 1:**
```
Senior .NET devs using Cursor: how much of your morning is just
re-explaining your codebase to the AI?

For me it was 15 minutes a day.

I called it the "Context Tax." Here's how I eliminated it.

🧵
```

**Tweet 2:**
```
Cursor (like every AI tool right now) has no persistent memory
between sessions.

Every new chat starts fresh. Every architectural decision your team
has ever made — gone the moment you close the window.

The AI isn't stupid. It's amnesiac.
```

**Tweet 3:**
```
The naive fix is a long preamble at the top of every prompt.

Three reasons it fails:
• Token bloat
• Discipline decay (you'll skip it within a week)
• Static — your architecture evolves, the preamble doesn't

You don't need a longer prompt. You need *persistence*.
```

**Tweet 4:**
```
So I built a 4-rule framework — .mdc files Cursor reads natively:

• arch-core — boundary enforcement
• dotnet-di — DI lifetime auditor
• bug-breaker — circuit breaker for hallucination loops
• persistence — engine that maintains LEARNING_LOG.md across sessions
```

**Tweet 5:**
```
The killer feature is the Learning Log.

It's just a markdown file. The AI appends to it when it learns
something architectural. On session start, it re-reads it.

Effectively long-term memory for your project. No external service.
No database. Commits to your repo.
```

**Tweet 6:**
```
The other trick: directory-scoped rule loading.

The DI auditor only fires on Startup.cs, Program.cs,
ServiceCollectionExtensions.cs. Not every prompt.

Token budget stays sane. AI stays sharp.
```

**Tweet 7:**
```
Free starter rule + full kit (£19.99 one-time, MIT-licensed):

https://agenticstandardcontact-byte.github.io/agentic-architect/

If anyone else has solved AI drift on long projects differently,
I'd love to hear it.
```

---

## 📝 dev.to article

**Cross-post link:** https://dev.to/new

**Use the content from `blog/01-the-context-tax.html`** — it's already written. Just paste the body into dev.to's markdown editor.

**Important — set the canonical URL** in dev.to's settings tab to:
```
https://agenticstandardcontact-byte.github.io/agentic-architect/blog/01-the-context-tax.html
```

This tells Google "the original lives at my site" so your domain gets the SEO juice, not dev.to.

**Tags to add on dev.to:**
```
csharp, dotnet, ai, productivity
```

**Cross-post the same article to:**
- Hashnode (with canonical_url set)
- Medium (last — Medium has the weakest SEO)

---

## 🦞 Lobsters (if invited)

**Submit at:** https://lobste.rs/stories/new

**Title:**
```
Stop the "Context Tax": persistent AI memory for Cursor on .NET projects
```

**Tags:** `programming`, `ai`, `practices`

Be ready for very technical scrutiny — Lobsters is the smartest crowd you'll post to. Be honest about trade-offs.

---

## 🏷 Product Hunt

**Submit at:** https://www.producthunt.com/posts/new

**Tagline (60 chars):**
```
Stop your AI from forgetting your architecture every morning
```

**Description:**
```
Senior .NET engineers using Cursor lose 15+ minutes every session
re-explaining their codebase to the AI. Agentic Architect is a 4-rule
persistence framework + Learning Log protocol that locks your
architectural decisions into Cursor's long-term memory. One-time £19.99.
```

**Pre-launch checklist:**
- Add a "Hunter" (someone with 200+ followers — ask in PH community)
- Schedule launch for **12:01 AM PST Tuesday** (timezone: America/Los_Angeles)
- Have 5–10 friends ready to upvote in the first hour (algo-critical)
- First comment: paste your Show HN comment

---

## 📬 Newsletter pitch (cold email template)

Pitch these newsletters — they pick up 1–2 dev tools per issue:

| Newsletter | Pitch URL |
|---|---|
| **C# Digest** | https://csharpdigest.net (contact form on site) |
| **The .NET News** | https://dotnetnews.com (DM editor on X) |
| **Pointer** | https://www.pointer.io/p/submit-link/ |
| **TLDR Dev** | https://tldr.tech/dev (use submit form) |
| **Console** | https://console.dev (form on site) |

**Cold email template:**
```
Subject: A persistence framework for Cursor (.mdc rules + Learning Log)

Hi [Editor's first name],

Long-time reader. I think your [audience type] would find this useful:

I built a 4-rule persistence framework for Cursor that solves AI
context-loss on long .NET projects. The novel piece is a "Learning Log"
protocol that gives the AI long-term memory across sessions via a
markdown file it auto-maintains.

Free starter rule and writeup here:
https://agenticstandardcontact-byte.github.io/agentic-architect/

Happy to write a custom intro/blurb if it would help. No worries
either way — figured it was worth surfacing.

Cheers,
[Your name]
```

---

## 🎯 30-day content engine

After launch, post **one short rule a day** for 30 days. Mix:

- 1 deep-dive every Friday (publish on `/blog/` and cross-post)
- 4 short tips Mon–Thu (X + LinkedIn, short-form)

Topic ideas (steal these):
1. "The Scoped→Singleton DI bug your AI just suggested"
2. "Why your AI keeps putting EF Core in your Domain layer"
3. "The 7-word prompt that stops Cursor's hallucination loops"
4. "Cursor + Result<T>: teaching the AI not to throw"
5. "The hidden cost of monolithic prompt files (and the fix)"
6. "How to make Cursor refuse anti-patterns instead of suggesting them"
7. "ADRs for your AI: the Learning Log pattern"
8. "Stop telling Cursor about your Mediator pattern. Show it."
9. "Why `IConfiguration` reads inside business logic are an AI tell"
10. "The DI lifetime audit prompt every senior should be using"

Each post ends with: `Part of the Agentic Architect kit → [link]`

After 30 days you'll have:
- 30 indexed pages on Google
- 30 X threads / LinkedIn posts you can re-pin
- 4–6 full dev.to articles ranking for long-tail queries
- A measurable Tuesday traffic flywheel

---

## ✅ Day-of-launch checklist

- [ ] OG image looks right when you paste the URL into Slack/Discord/X (quick test)
- [ ] All CTAs go to Gumroad — click each one
- [ ] Lead magnet Gumroad product exists at `/l/arch-core-lite` (free, email required)
- [ ] Analytics is firing (GoatCounter dashboard shows your own visit)
- [ ] GitHub repo description, website, topics all set
- [ ] Pinned tweet is the thread above
- [ ] LinkedIn profile mentions you're launching
- [ ] Slack/Discord status updated with the link

Post in this order. Within 30 min reply to every comment. Within 24h thank everyone who shared.

Good luck. 🍀
