# Cursor for C# and .NET in 2026: extensions, debugging and Unity

Published: November 27, 2026 · 11 min read

The first hour of C# in Cursor is more confusing than it should be. You open a solution, Cursor offers extensions you've never heard of, the one you use in VS Code isn't there, and the debugger behaves slightly differently. None of it is hard once you know why. This guide covers the licensing reason behind it, the three C# extensions that do work, a debugging setup that holds up on real solutions, Unity projects, and the rules that make Cursor write C# the way your team does.

## Why Microsoft's C# Dev Kit doesn't work in Cursor


Cursor is built on the open-source VS Code codebase, but several of Microsoft's most popular extensions are not open source. The C# Dev Kit, the official C# extension's proprietary pieces and the vsdbg debugger are licensed for use only in Microsoft products: Visual Studio, VS Code and their hosted variants. Since Microsoft tightened enforcement in April 2025, opening a C# project in a fork showed a message that the extension may be used only with Microsoft Visual Studio Code.


Cursor's response was to rebuild the affected extensions on open alternatives. In May 2025 it published its own C# extension (publisher: Anysphere), with one notable swap: debugging uses Samsung's open-source netcoredbg instead of vsdbg. Cursor staff confirmed again in August 2026 that the C# Dev Kit can't be used in Cursor, so don't spend an afternoon trying to side-load it.


## Your C# extension options in Cursor


There are three realistic choices. Cursor's own C# guide recommends installing one language extension rather than stacking them, plus the .NET Install Tool to manage SDKs.


| Extension | Who maintains it | Strengths | Watch for |
| --- | --- | --- | --- |
| C# (Anysphere) | Cursor | Built for Cursor, debugging via netcoredbg, the default most people end up with | The console option in launch.json is ignored, so interactive console apps can't read stdin under the debugger |
| ReSharper for Cursor | JetBrains | Solution Explorer, NuGet management, unit-test runner, navigation and refactoring from the ReSharper engine | Commercial licence for work (free for non-commercial use, 30-day trial) |
| DotRush | Community (MIT) | Lightweight, Roslyn-based IntelliSense, built-in debugger, test runner, Unity debugging | No Razor, XAML or Blazor support |


A sensible default: start with the Anysphere C# extension for plain ASP.NET Core and library work, choose ReSharper for Cursor if you do Blazor or Razor-heavy work or want the ReSharper toolset, and choose DotRush if you want the lightest option or work in Unity.


## Setup in five steps


1. Install the .NET SDK (Cursor doesn't ship a compiler) and confirm with dotnet --version.
2. Install one C# extension from the table above, plus the .NET Install Tool. Uninstall any older OmniSharp-era extension so two language servers don't fight over the same files.
3. Open the folder that contains your .sln, not an individual project folder. The language server needs the solution to resolve project references.
4. Build once from the terminal with dotnet build. Restore problems surface here more clearly than in the editor, and the agent will use the same command later.
5. If Cursor can't find the SDK (common with per-user installs or several SDKs side by side), point it there explicitly in settings.json and restart:


```
{
  "dotnet.dotnetPath": "C:/Program Files/dotnet/dotnet.exe"
}
```


Pin the SDK per repository with a global.json as well. It costs one file and it means Cursor's agent, CI and every developer build with the same SDK, which removes a whole category of "works on my machine" answers from the agent's suggestions.


## Debugging: what works, and the one known gap


Breakpoints, stepping, watches and the call stack work with netcoredbg. For an ASP.NET Core API, a .vscode/launch.json along these lines is all you need. If your extension generates its own launch configuration, prefer that and compare:


```
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": ".NET Core Launch (web)",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build",
      "program": "${workspaceFolder}/src/Api/bin/Debug/net10.0/Api.dll",
      "cwd": "${workspaceFolder}/src/Api",
      "env": { "ASPNETCORE_ENVIRONMENT": "Development" }
    }
  ]
}
```


And the matching .vscode/tasks.json for the build pre-launch task:


```
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build",
      "type": "process",
      "command": "dotnet",
      "args": ["build", "${workspaceFolder}/MySolution.sln"]
    }
  ]
}
```


The known gap: Cursor's C# extension doesn't yet honour the console setting. internalConsole, integratedTerminal and externalTerminal all end up in the Debug Console, which can't send stdin. If you debug an interactive console app that calls Console.ReadLine(), pass input as arguments or a file while debugging, or run it with dotnet run in the terminal. For web APIs and workers it doesn't matter.


For the inner loop, dotnet watch in the integrated terminal gives you hot reload without a debugger attached. When you need conditional breakpoints in async code or to step into decompiled NuGet sources, that is where Rider is still stronger, and you can keep Cursor's agent while you debug there: see Cursor vs Rider (and Cursor inside Rider).


## Tests: make the terminal the contract


ReSharper for Cursor and DotRush both ship a test runner, and that's pleasant for humans. For the agent, the reliable interface is the CLI: it can run dotnet test, read the output and iterate, whichever extension you installed. Two habits make that loop much tighter on a large solution:


```
# Build with warnings as errors so the agent can't leave nullable warnings behind
dotnet build MySolution.sln -warnaserror

# Run only the tests the change touches, instead of the full suite every turn
dotnet test tests/Orders.Tests --filter "FullyQualifiedName~Orders.Application"
```


Then write that expectation down once, as a rule, rather than typing it into every prompt (more on rules below).


## Unity projects in Cursor


Unity is where the licensing issue bites hardest. Unity's official VS Code integration relies on Microsoft's Unity extension, which carries the same Microsoft-products-only licence as the C# Dev Kit, so you can't install it in Cursor. The working setup uses community tools instead, and it's worth knowing that it sits outside Unity's official support:


1. In Unity, open the Package Manager, choose Add package from git URL, and add https://github.com/boxqkrtm/com.unity.ide.cursor.git. From v2.0.24 the package is named com.boxqkrtm.ide.cursor; remove the old com.unity.ide.cursor name first if you're upgrading.
2. In Edit &gt; Preferences &gt; External Tools (macOS: Unity &gt; Settings), set External Script Editor to Cursor.
3. Run Assets &gt; Open C# Project. Cursor opens the generated solution. Check that typing transform. in a script offers Unity API completions.
4. For debugging, install DotRush, which includes a Unity (Mono) debugger. Create an attach configuration and list your script assemblies explicitly; without userAssemblies, stepping in some projects resumes instead of stepping.


```
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Unity Debugger",
      "type": "unity",
      "request": "attach",
      "userAssemblies": [
        "${workspaceFolder}/Library/ScriptAssemblies/Assembly-CSharp.dll",
        "${workspaceFolder}/Library/ScriptAssemblies/Assembly-CSharp-Editor.dll"
      ]
    }
  ]
}
```


If you use Assembly Definitions, add each assembly's DLL from Library/ScriptAssemblies to that list, or breakpoints in those assemblies won't bind.


Unity also needs its own rules, because the AI's C# instincts come from server-side code. The classic example: Unity overrides == on UnityEngine.Object so that destroyed objects compare equal to null, but the ?. and ?? operators bypass that override. Generic C# training data uses them everywhere. A scoped rule stops it:


```
---
description: Unity scripting conventions
globs: Assets/**/*.cs
alwaysApply: false
---
- Never use ?. or ?? on UnityEngine.Object types (GameObject, Component, ScriptableObject).
  Use explicit `if (thing != null)` or `if (thing)` so Unity's destroyed-object check runs.
- Cache GetComponent<T>() results in Awake/Start; never call it every frame in Update.
- No allocations in Update/FixedUpdate hot paths (LINQ, string concatenation, new lists).
- Serialised fields: [SerializeField] private, not public fields.
```


## Make Cursor write C# the way your team does


Once the tooling works, the next complaint is style drift: exceptions for business failures, DbContext in a controller, a scoped service captured by a singleton. Cursor's project rules fix that. They live in .cursor/rules/*.mdc, are committed with the code, and can be scoped with globs so the EF Core guidance only loads for data-access files. For short instructions that should apply everywhere, a plain AGENTS.md at the repo root works too. (The old single .cursorrules file is legacy; migrate it.)


```
---
description: Build and test expectations for every C# change
alwaysApply: true
---
- After editing C#, run `dotnet build MySolution.sln -warnaserror` and fix every warning you caused.
- Run the narrowest relevant `dotnet test --filter` before declaring the task done.
- Target the SDK in global.json; do not change TargetFramework or package versions unasked.
```


The full map of rule types and how to scope them for a layered .NET solution is in Cursor rules for .NET engineers. The two failure modes worth a dedicated rule first are Scoped-into-Singleton DI captures and throwing instead of returning Result&lt;T&gt;.


## Prefer to stay in Rider or Visual Studio?


You don't have to move editors to use Cursor's agent. Rider 2025.3.2 and later can run Cursor through the Agent Client Protocol (setup in the Rider comparison). If your team lives in full Visual Studio, the realistic comparison is GitHub Copilot, covered in Cursor vs Copilot for C#/.NET.


## FAQ


### Can I use Microsoft's C# Dev Kit in Cursor?

No. The C# Dev Kit, the vsdbg debugger and the Unity extension are licensed only for Microsoft products such as VS Code and Visual Studio. In Cursor, use the Anysphere C# extension, ReSharper for Cursor or DotRush instead.


### Which C# extension should I use in Cursor?

Install one language extension. The Anysphere C# extension is the default for ASP.NET Core and library work. ReSharper for Cursor suits Blazor and Razor work or teams that want ReSharper's tooling. DotRush is the lightest option and includes a Unity debugger, but it doesn't support Razor, XAML or Blazor.


### Does Cursor support .NET debugging?

Yes. Cursor's C# extension debugs with the open-source netcoredbg debugger, so breakpoints, stepping and watches work. One known limitation: it ignores the console setting in launch.json, so interactive console apps can't read stdin under the debugger.


### Can I use Cursor with Unity?

Yes, with community tools. Install the com.boxqkrtm.ide.cursor package from its git URL, set Cursor as Unity's External Script Editor, and use DotRush's Unity debugger with userAssemblies pointing at your script assemblies. This setup is outside Unity's official support.


---

Canonical HTML: https://agentic-architect.dev/blog/11-cursor-csharp-dotnet-setup.html
Site feed: https://agentic-architect.dev/feed.xml
