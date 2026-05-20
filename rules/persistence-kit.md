🚀 Stop Cursor Context Rot. Professional .MDC Persistence Rules for Senior .NET Architects. Enforce SOLID, Result Patterns, and Clean Architecture automatically.

Get the Full Persistence Suite on Gumroad →

The Daily Tip Content (For rules-library.md)
Copy this text below. I have removed the complex code blocks to make it easier for you to select and copy on your mobile browser:

Rule 1: The Result Pattern
Stop using nulls for flow control. Use a Result object to force Cursor to handle success and failure cases explicitly. This prevents 90% of AI-generated logic errors in Web APIs.

Rule 2: Persistence Boundaries
Never let the AI write database logic in your Controllers. Enforce a strict boundary where all IQueryable access stays in the Infrastructure layer. This keeps your business logic "pure" and readable for the LLM.

Rule 3: Structured Logging
Enforce ILogger with structured templates. Never use string interpolation in logs. This ensures that when you feed logs back into Cursor for debugging, the AI recognizes the patterns immediately.

Rule 4: Validator Enforcement
Every MediatR Request must have a FluentValidation rule. Force the AI to check the validator before writing handler logic. This prevents "context rot" where the AI forgets your business constraints.

Rule 5: Minimal API Groups
Use MapGroup and EndPoints for .NET 9 services. It keeps the context window lean and focused, helping the AI provide more accurate code suggestions than it can with massive, bloated Controllers.

Rule 6: TimeProvider Injection
Never let Cursor hardcode DateTime.Now or DateTime.UtcNow in business logic. Inject TimeProvider (or your own IClock) instead. This makes time deterministic for tests and stops the AI reaching for static APIs whenever it generates time-aware code.

Rule 7: IHttpClientFactory Discipline
Refuse new HttpClient() in any generated code. Force Cursor to inject IHttpClientFactory or a typed client. The classic socket-exhaustion bug is exactly the kind of footgun an AI hands you without realising.

Rule 8: CancellationToken Propagation
Every async method in your codebase should accept and forward a CancellationToken. Make it a rule that any new async signature without one is flagged. Stops the AI from quietly losing cancellation half-way down a call chain.

Rule 9: Scoped Capture in Singleton
The single most expensive .NET runtime bug: a Singleton holding a Scoped service. Cursor cheerfully writes this without warning. Audit constructor parameters of any class registered as Singleton — if any are typically Scoped (DbContext, repositories, MediatR sender), flag it before merge.

Rule 10: AsNoTracking for Reads
Every read-only EF Core query should call AsNoTracking. Add a rule that recognises query methods returning DTOs (not entities) and inserts the call. Cursor never does this by default and your read perf degrades silently across releases.

Rule 11: Rethrow, Don't throw ex
throw ex resets the stack trace. throw preserves it. Cursor gets this wrong about 40 percent of the time when generating catch blocks. Rewrite any naked throw ex to throw unless the exception has been explicitly wrapped.

Rule 12: IOptionsSnapshot Over Raw Config
Business code should never call IConfiguration directly. Strongly-typed IOptions or IOptionsSnapshot bindings only. The AI loves to "just grab the config value" — refuse it and force a settings class with validation attributes.

Rule 13: Strongly-Typed IDs
OrderId as record struct OrderId(Guid Value) beats raw Guid everywhere. Stops the AI passing a CustomerId where an OrderId was expected — a bug the compiler can't catch with primitive obsession but catches instantly with domain primitives.

Rule 14: Sealed By Default
Mark every class sealed unless inheritance is explicitly planned. Stops Cursor inventing accidental inheritance hierarchies "for flexibility." Small but measurable virtual-call perf wins too.

Rule 15: Records for Value Objects, Classes for Entities
Value objects (Money, Address, Coordinates) should be records. Entities with identity (Order, Customer) should be classes with an Id. Cursor mixes these constantly. A rule that classifies based on the presence or absence of an identity property keeps the distinction honest.

Rule 16: async void Outside Event Handlers
async void is a deadlock and unhandled-exception trap everywhere except UI event handlers. The AI uses it routinely for "fire and forget" — wrong answer every time. Flag it on sight.

Rule 17: ConfigureAwait false in Libraries
Library code (non-ASP.NET) should ConfigureAwait false on every awaited Task. ASP.NET Core code should not. Cursor mixes the two contexts in the same solution. Detect the project type and enforce the right default.

Rule 18: WebApplicationFactory for Integration Tests
In-memory EF Core providers lie. Use WebApplicationFactory with Testcontainers (SQL Server, Postgres) for real integration coverage. Cursor defaults to UseInMemoryDatabase — it passes locally and ships the bug to production. Flag the in-memory provider in test projects.

Rule 19: NetArchTest for Boundaries
Architectural rules belong in tests, not in code review. Encode them as NetArchTest assertions ("no class in Domain references EntityFrameworkCore") and they fail your build instead of your standup. Add the corresponding test whenever a new layer or project is introduced.

Rule 20: Source-Generated JSON Serialisation
Reflection-based System.Text.Json is fine for prototypes. For hot paths and AOT, use JsonSerializable source generation. Cursor never thinks of this on its own — add a rule that flags new DTO classes and asks whether they should be source-generated.

Rule 21: Channels for Producer Consumer
System.Threading.Channels beats BlockingCollection and beats roll-your-own queue plus SemaphoreSlim. The AI reaches for ConcurrentQueue every time and stitches it together by hand. A rule that detects producer/consumer patterns and proposes Channel will save you a class.

Rule 22: BackgroundService Over Task.Run
Long-running work in ASP.NET Core goes in a BackgroundService, not Task.Run inside a controller. Cursor will happily fire Task.Run and call it "async work" — your request thread will die mid-execution and you'll never know why. Catch Task.Run outside test code and propose a hosted service.

Rule 23: No Bool Flag Parameters
SendEmail(string to, bool isHtml) should be SendHtmlEmail and SendPlainEmail. Bool flags hide branching that belongs in the type system. Flag any method signature with two or more bool parameters as a refactor candidate.

Rule 24: ValueTask Only When Justified
ValueTask is a perf optimisation for hot paths that often return synchronously. It is not a drop-in for Task. Cursor swaps them around without thinking. Flag ValueTask returns and ask whether the method is actually mostly synchronous. If not, revert to Task.

Rule 25: ActivitySource for OpenTelemetry
Logs alone won't debug a distributed system. Add a static readonly ActivitySource per project and wrap every external call (DB, HTTP, queue) in StartActivity. Cursor never adds OTEL spans on its own — give it a rule that recognises external-call patterns and proposes the trace.
