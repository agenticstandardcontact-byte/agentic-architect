# The Scoped?Singleton DI bug your AI just suggested (and how to catch it)

Of all the bugs that ship to production silently, the captured-dependency lifetime bug is one of the most expensive. It compiles. It passes your tests. It runs fine in dev. Then in production, under load, it starts corrupting data across requests. And AI assistants suggest it constantly. I'll walk through why, and the one Cursor rule that catches it before merge.


## The bug, in 30 lines

You ask Cursor to add caching to OrderService. It gives you this:


```
// OrderService.cs public class OrderService : IOrderService { private readonly IMemoryCache _cache; private readonly OrderDbContext _db; public OrderService(IMemoryCache cache, OrderDbContext db) { _cache = cache; _db = db; } public async Task<Order?> GetAsync(int id, CancellationToken ct) { if (_cache.TryGetValue(id, out Order? cached)) return cached; var order = await _db.Orders.FindAsync(new object[] { id }, ct); if (order is not null) _cache.Set(id, order, TimeSpan.FromMinutes(5)); return order; } } // Program.cs builder.Services.AddDbContext<OrderDbContext>(...); builder.Services.AddScoped<IOrderService, OrderService>(); builder.Services.AddMemoryCache(); // ? registers IMemoryCache as Singleton
```

Looks correct. Compiles. Tests pass. Shipped.


## What actually happens at runtime

IMemoryCache is registered as Singleton, one instance for the entire app's lifetime. OrderService is registered as Scoped, one instance per HTTP request.

On its own, that's fine. The problem is what you cached: an Order entity, which is in turn attached to OrderDbContext, also Scoped. The cache, alive for the lifetime of the application, now holds a reference to an entity attached to a DbContext that was disposed when the original request ended.

Now request #2 comes in. It hits the cache, gets the order, mutates a property. Then request #3 hits the cache, sees the mutation, and decides to write something else based on it. Then request #4 wakes up the entity's dispose-tracking and explodes with ObjectDisposedException, but only sometimes, depending on the GC pressure that day.

Welcome to the longest debugging session of your year.


## Why AI assistants suggest this constantly

The patterns the AI has seen most often in its training data, short examples, blog tutorials, StackOverflow answers, almost always omit DI registration. A typical "caching with IMemoryCache" snippet looks like ten lines, with no reference to where the service is registered or with what lifetime.

The AI learned the surface pattern ("inject IMemoryCache, call .Set") without the surrounding constraint ("…unless the consumer is Scoped and the cached value graph reaches into Scoped infrastructure"). When you ask it to add caching to your codebase, it pattern-matches against the surface form. The constraint is invisible to it.

This isn't a "the AI is dumb" critique. Most senior developers ship this exact bug at least once. The patterns in the wild teach the wrong lesson.


## The five lifetime traps to teach the AI

If you're going to enforce one set of rules on AI-suggested .NET code, make it these:


### 1. Scoped or Transient injected into Singleton

The classic. A Singleton constructor takes IRepository<T> (Scoped). The Singleton captures it forever. Requests share state. Data corrupts.

The rule: when adding a constructor parameter, check the parameter type's registered lifetime. If the consumer is Singleton and the parameter is Scoped/Transient, refuse and surface the issue.


### 2. DbContext captured by anything Singleton

Special case of #1 but worth its own callout. DbContext is always Scoped, it has to be, it tracks per-request state. Any Singleton that captures a DbContext is a bug. If you need DB access from a Singleton, inject IServiceScopeFactory and create a scope per operation.


### 3. Cached entities still attached to a DbContext

The bug from the example. The cache outlives the DbContext, but holds a graph that depends on it.

The rule: what goes into long-lived caches must be either (a) AsNoTracking()'d, (b) projected to a DTO, or (c) detached explicitly.


### 4. HttpClient instantiated with new

A long-running app that does new HttpClient() on every call leaks sockets, eventually exhausting the connection pool. Even worse: a Singleton that captures a single HttpClient reuses DNS forever.

The rule: always inject IHttpClientFactory and call CreateClient(name). Never new HttpClient() outside of one-shot scripts.


### 5. Hosted services touching Scoped dependencies directly

IHostedService is Singleton-by-construction. Inject a Scoped repo into one and it'll be alive for the lifetime of the process, every "scoped" operation will share state. Worse, the DbContext will leak.

The rule: in any BackgroundService or IHostedService, never inject Scoped dependencies directly. Inject IServiceScopeFactory and create a scope per unit of work.


## The Cursor rule that catches all five

The dotnet-di.mdc rule in Agentic Architect codifies the above. When Cursor is editing a file where DI is happening, Program.cs, Startup.cs, ServiceCollectionExtensions.cs, any class constructor, the rule activates and audits suggestions for:

The trick is the scoping: it loads only on files where DI is actually happening, not on every prompt. Your token budget stays sane. The AI stays sharp on the file you're actually in.


## The bigger pattern: enforce, don't suggest

The reframe that took me a year of using AI assistants to internalize is this: generic prompts ask the AI to suggest good patterns. Scoped rules force it to enforce them.

"Be careful with DI lifetimes" is a suggestion. The AI will agree, nod sagely, then ship the captured-Scoped bug an hour later when you're tired.

"Before suggesting any constructor change, audit the lifetime contract" is a rule. The AI now has a checklist. It pauses, runs the check, and either suggests a boundary-respecting alternative or asks you a targeted question, instead of confidently shipping the bug.

The first time the AI catches a Scoped-into-Singleton in code you wrote, the kit pays for itself.

Free download


### Stop Cursor's 3 most common .NET regressions — free

Get the Agentic Architect Starter Kit: 3 Cursor rules that prevent throw instead of Result<T>, captive DI dependencies, and missing AsNoTracking(). Installs in 3 minutes.

Free. No spam. Unsubscribe any time. By subscribing you agree to the Privacy Policy and Terms of Service.
Published: May 19, 2026


---

Canonical HTML: https://agentic-architect.dev/blog/02-scoped-singleton-di-bug.html
Site feed: https://agentic-architect.dev/feed.xml
