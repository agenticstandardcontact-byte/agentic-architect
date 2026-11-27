# How to use Cursor AI with Entity Framework Core (without blowing up your database)

Published: May 30, 2026 · 9 min read

You ask Cursor to add a simple API endpoint. It generates a working controller. You glance at the EF Core code. .Include().ThenInclude().ThenInclude() — three levels deep, no AsNoTracking(), and a ToListAsync() that materialises 50,000 rows. Congratulations: your AI assistant just authored a production incident. Here's how to stop it — permanently, automatically, before the code hits your PR.

## The silent database killer in your AI pair programmer


Cursor AI is genuinely excellent at generating .NET code. It understands your domain models, your repository patterns, your controller structure. But there's one area where it consistently fails — and fails dangerously — and that's Entity Framework Core.


The reason is simple: Cursor's training data contains millions of EF Core examples from blog posts, Stack Overflow answers, and GitHub repos. Most of those examples are simplified for readability, not production-grade. They omit AsNoTracking() for brevity. They eager-load entire object graphs because the author wanted to show .Include() syntax. They call .ToList() before filtering because the example was 10 rows.


The AI faithfully reproduces these patterns. And your production database pays the price.


## The 4 EF Core patterns Cursor gets wrong — every time


After auditing ~200 AI-generated EF Core code blocks across a production .NET solution, four failure patterns appeared with alarming consistency. Here they are, ranked by production impact:


### 1. Missing AsNoTracking on read-only queries


The most common and most expensive mistake. Cursor generates read endpoints that materialise entities into the change tracker — even though the result is serialised to JSON and never updated. Every single query builds a snapshot of every returned entity in memory. On a list endpoint returning 500 rows with 10 navigation properties each, that's thousands of tracked instances for data that will never change.


```
// ❌ Cursor-generated: tracks every entity in memory
var products = await _context.Products
    .Include(p => p.Category)
    .Include(p => p.Supplier)
    .ToListAsync();

// ✅ Production: read-only query, zero change tracker overhead
var products = await _context.Products
    .AsNoTracking()
    .Include(p => p.Category)
    .Include(p => p.Supplier)
    .ToListAsync();
```


### 2. Unbounded eager loading chains


Cursor loves .Include().ThenInclude(). Give it a model with navigation properties and it will eagerly load the entire object graph — often 4-5 levels deep. What should be a 2-join query becomes a Cartesian explosion that brings back megabytes of redundant data.


```
// ❌ Cursor-generated: eager-loads the entire database
var orders = await _context.Orders
    .Include(o => o.Customer)
        .ThenInclude(c => c.Address)
    .Include(o => o.LineItems)
        .ThenInclude(li => li.Product)
            .ThenInclude(p => p.Supplier)
    .ToListAsync();

// ✅ Production: projection to exactly what the client needs
var orders = await _context.Orders
    .Select(o => new OrderDto
    {
        Id = o.Id,
        CustomerName = o.Customer.Name,
        Total = o.LineItems.Sum(li => li.Price * li.Quantity)
    })
    .AsNoTracking()
    .ToListAsync();
```


### 3. N+1 queries disguised as clean code


The insidious one. Cursor writes a clean-looking loop that iterates over entities and accesses navigation properties. It looks fine — no .Include() problems here. But every property access triggers a lazy-load round-trip to the database. 100 entities = 101 queries.


```
// ❌ Cursor-generated: looks clean, generates N+1 queries
var blogs = await _context.Blogs.ToListAsync();
foreach (var blog in blogs)
{
    Console.WriteLine($"{blog.Name}: {blog.Posts.Count} posts");
    // Each .Posts access = 1 database round-trip 💀
}

// ✅ Production: single query with projection
var blogStats = await _context.Blogs
    .Select(b => new { b.Name, PostCount = b.Posts.Count })
    .AsNoTracking()
    .ToListAsync();
```


### 4. Client-side evaluation after Where


Cursor sometimes writes LINQ expressions that EF Core can't translate to SQL. Instead of throwing, EF Core silently switches to client-side evaluation — pulling all rows into memory and filtering in C#. The query works. The database dies.


```
// ❌ Cursor-generated: custom method triggers client eval
var active = await _context.Users
    .Where(u => IsActiveUser(u))  // EF Core can't translate this
    .ToListAsync();
    // → Pulls ALL users into memory, then filters in C#

// ✅ Production: translatable expression
var active = await _context.Users
    .Where(u => u.LastLoginDate >= DateTime.UtcNow.AddDays(-30))
    .AsNoTracking()
    .ToListAsync();
```


## The fix: a rule-based guardrail that catches these before PR


You could manually review every AI-generated EF Core line. Or you could install a set of Cursor rules that prevent the AI from generating these patterns in the first place. The Agentic Architect kit includes an ef-core-reads.mdc rule specifically designed to stop these four failures:


- AsNoTracking by default: the rule mandates .AsNoTracking() on every query that doesn't call .SaveChanges[Async](). Cursor learns this as a baseline.
- Include depth limit: maximum 2-level .Include() chain enforced. Anything deeper must use .Select() projections — which are more efficient anyway.
- No lazy loading in loops: the rule marks any foreach over entity results as a violation template. Cursor auto-suggests projection instead.
- EF Core 9 configure warnings: the rule includes a DbContext configuration snippet that throws on client-side evaluation, making the failure visible at dev time, not production.


## How the rule works inside Cursor


The ef-core-reads.mdc rule is directory-scoped. It activates only when Cursor's agent is working inside your data-access project — typically src/YourApp.Infrastructure/ or wherever your DbContext and repositories live. This means it doesn't burn tokens when you're editing controllers, domain models, or unit tests.


When active, the rule inserts itself into Cursor's context window as a system-level constraint. The AI treats it like a non-negotiable instruction — the same way it treats 'don't generate Python in a .cs file.' Because the rule is re-attached whenever a data-access file is in context, you're no longer relying on the model remembering yesterday's correction.


## What changes once the EF Core rule is loaded


| Pattern | Ungoverned AI output | With the rule in context |
| --- | --- | --- |
| Read-only queries | Tracked entities returned to the API layer | AsNoTracking() or a Select projection to a DTO |
| Deep Include chains | Whole object graphs loaded "just in case" | Bounded depth, or a projection of only the needed columns |
| Loops over navigation properties | N+1 queries hidden behind lazy loading | Related data loaded up front in one query |
| Untranslatable expressions | Filtering after materialisation in memory | Filters kept in the translated SQL, flagged when they can't be |


None of these is exotic. They are the defaults the model falls back to when nothing in its context says otherwise, which is why a short, scoped rule changes the output so reliably. Your SQL logs and query plans are the place to confirm it on your own codebase.


## Install the EF Core guardrail in 60 seconds


The Agentic Architect kit ships with a ready-to-use ef-core-reads.mdc rule. Here's the install flow:


1. Download the kit (free 3-rule starter or full 9-rule pack — £9).
2. Copy ef-core-reads.mdc into your .cursor/rules/ directory, nested inside a data-access subfolder.
3. Open any file in your Infrastructure project. Cursor picks up the rule automatically.
4. Write your next prompt normally. Watch the AI start adding AsNoTracking() without you asking.


## Beyond EF Core: the complete database safety net


The ef-core-reads.mdc rule is one of nine in the full kit. Together they form a complete Cursor persistence framework for .NET:


- result-pattern.mdc — prevents throw inside domain logic, enforces Result throughout the pipeline.
- di-scoping.mdc — catches captive dependencies, singleton-service-holding-scoped, and the MediatR-injecting-HttpClient anti-pattern.
- ef-core-reads.mdc — the database guardrail described above.
- api-conventions.mdc — enforces consistent controller patterns, status codes, and ProblemDetails responses.
- testing-patterns.mdc — ensures AAA structure, test-data builder usage, and real-context integration tests.
- domain-model.mdc — prevents anemic domain models, enforces encapsulation and value-object usage.
- logging.mdc — structured logging with semantic names, no string interpolation in log messages.
- null-guard.mdc — nullable reference type discipline, null-guard at API boundaries.
- performance.mdc — async-all-the-way, Span for hot paths, benchmark structure.


## Why rules beat code review for AI-generated EF Core code


The natural instinct is to catch these in code review. But there are two problems with that approach.


First, speed. If Cursor generates a few hundred lines of data-access code in a session and most of its read queries are missing AsNoTracking(), you end up annotating query sites by hand in every review. That's review labour, not creative work.


Second, consistency. A human reviewer catches what they notice. The rule catches what it's programmed to catch — every time. No fatigue, no Friday-afternoon misses, no "I'll let this one slide because it's a small endpoint." The rule is uniform.


## AI pair programming needs guardrails, not guidelines


Cursor AI is not a junior developer you mentor. It's a pattern-matching engine with access to every bad code example ever published. Mentoring it — correcting the same mistakes session after session — is the Context Tax we described in Post 06. The only sustainable approach is rule-based guardrails that prevent the bad patterns from ever reaching your screen.


EF Core is just the most expensive example. The same principle applies to DI scoping, error handling, API conventions, and every other area where the AI's training data contains simplified-for-blog-post patterns. Install the rules once. Let the AI conform to your standards — not the internet's.


Query hygiene is half the problem. The other half is Cursor not knowing what your schema looks like in the first place: guessing column names, inventing navigation properties, writing migrations against a model it never read. That's covered in How to stop Cursor forgetting your database schema.


---

Canonical HTML: https://agentic-architect.dev/blog/07-cursor-efcore-patterns.html
Site feed: https://agentic-architect.dev/feed.xml
