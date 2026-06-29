# Teach Cursor Result<T> instead of throwing

If your team already models failures as Result<T>, ErrorOr<T>, or railway-style responses, Cursor will still reach for throw and null on the next prompt. That is not malice, it is training bias. Here is why it happens, what it costs, and how scoped rules teach the AI to match the error model you already paid for.


## The default the model learned

Most C# examples on the public internet, tutorials, StackOverflow, even Microsoft docs samples, use exceptions for business failures and null for "not found". Ask Cursor to add an endpoint that rejects duplicate orders and you will get something like:


```
public async Task<OrderDto> CreateAsync(CreateOrderRequest request, CancellationToken ct) { var existing = await _db.Orders.FirstOrDefaultAsync(o => o.Reference == request.Reference, ct); if (existing is not null) throw new ConflictException("Order reference already exists"); var order = Order.Create(request); await _db.SaveChangesAsync(ct); return order.ToDto(); }
```

Readable. Familiar. Architecturally wrong if your Application layer already returns Result<OrderDto> and your API maps errors to ProblemDetails without catching domain exceptions in every controller.


## What breaks when the AI throws anyway

Senior teams moved to explicit results precisely to make failure visible. The AI undoing that in one autocomplete is expensive.


## What good looks like in a MediatR codebase

Same feature, result-shaped:


```
public async Task<Result<OrderDto>> Handle(CreateOrderCommand cmd, CancellationToken ct) { var exists = await _orders.ExistsByReferenceAsync(cmd.Reference, ct); if (exists) return Result.Conflict<OrderDto>("Order reference already exists"); var create = Order.Create(cmd); if (create.IsError) return create.Errors; await _orders.AddAsync(create.Value, ct); return create.Value.ToDto(); }
```

The endpoint stays thin:


```
app.MapPost("/orders", async (CreateOrderCommand cmd, ISender sender, CancellationToken ct) => { var result = await sender.Send(cmd, ct); return result.Match(Results.Created, Results.Problem); });
```

No try/catch for "customer not found". No null return that the caller forgets to check. The signature documents the contract.


## Why telling it once does not stick

You paste "we use Result pattern, do not throw for business errors" into chat. It complies for that file. Three prompts later, on a validator or a repository method, it throws NotFoundException again because:

This is the same persistence problem as the Context Tax, applied to error modelling. You need the convention to reload when the relevant layer opens, not when you remember to lecture the model.


## The rule contract (what to encode)

A useful Cursor rule for result-shaped codebases does not need to mandate a specific NuGet package. It should:

arch-core.mdc in the Agentic Architect kit encodes the "match existing Result / ErrorOr / OneOf patterns" clause on Application and API-adjacent files. It is the boundary guardian applied to control flow, not just folder placement.


## A prompt you can use today (before the full kit)

Until rules are committed, pin this at the top of any handler or endpoint edit:

> Business failures are Result errors, not exceptions. Match the Result/ErrorOr type already used in this project. Map to HTTP at the API boundary only.

Short. Boring. Repeatable. It cuts throw regressions roughly in half in my experience, but discipline still decays without scoped .mdc files and a LEARNING_LOG.md entry the model reads on session start.


## Log the decision once, enforce it forever

When you adopt Results team-wide, add one Learning Log line the persistence engine can re-hydrate:


```
## ADR-014 — Application errors are Results - Handlers return Result<T> / ErrorOr<T>; no throw for business rules. - API maps via Match / ToProblemDetails; controllers stay thin. - Exceptions: infrastructure only (timeouts, corruption).
```

Next Monday, the model sees the ADR before it suggests throw new InvalidOperationException("duplicate") in a handler that has returned Results for six months.


## Pair with the other failure modes

Result discipline does not replace DI lifetime audits (Scoped?Singleton capture) or hallucination breakers (seven-word stop phrase). It addresses a third failure mode: silent style regression, code that compiles, looks professional, and slowly erodes the conventions your team chose on purpose.

Free download


### Stop Cursor's 3 most common .NET regressions — free

Get the Agentic Architect Starter Kit: 3 Cursor rules that prevent throw instead of Result<T>, captive DI dependencies, and missing AsNoTracking(). Installs in 3 minutes.

Free. No spam. Unsubscribe any time. By subscribing you agree to the Privacy Policy and Terms of Service.
Published: May 21, 2026


---

Canonical HTML: https://agentic-architect.dev/blog/04-cursor-result-not-throw.html
Site feed: https://agentic-architect.dev/feed.xml
