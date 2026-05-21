#!/usr/bin/env python3
"""Open awesome-dotnet list PRs for Agentic Architect (neutral copy)."""
from __future__ import annotations

import base64
import json
import subprocess
import sys

ORG = "agenticstandardcontact-byte"
REPO_URL = "https://github.com/agenticstandardcontact-byte/agentic-architect"
LINE = (
    f"* [Agentic Architect]({REPO_URL}) - Cursor `.mdc` persistence framework "
    "and Learning Log protocol for senior C#/.NET teams."
)
LINE_COMMERCIAL = LINE + " **[$]**"
APPS_LINE = (
    f"**[Agentic Architect]({REPO_URL})** (**Cursor / AI tooling**) (**MIT**) - "
    "Directory-scoped `.mdc` rules and Learning Log protocol for C#/.NET teams using Cursor."
)

PR_BODY = """## Summary

Adds [Agentic Architect](https://github.com/agenticstandardcontact-byte/agentic-architect) — an open-source Cursor persistence framework for senior C#/.NET teams.

## What it provides

- Directory-scoped `.mdc` rules (SOLID boundaries, DI lifetime checks, hallucination circuit-breaker, session persistence)
- A `LEARNING_LOG.md` protocol so architectural context survives across Cursor sessions
- Free sample rule at `.cursor/rules/arch-core-lite.mdc` (MIT)

## Why include it

Fills a gap for **.NET-specific Cursor configuration** — most awesome-list AI entries are model SDKs or general LLM libraries, not IDE persistence for production C# codebases.

## Links

- Repository: https://github.com/agenticstandardcontact-byte/agentic-architect
- Site: https://agenticstandardcontact-byte.github.io/agentic-architect/
"""


def gh_json(cmd: list[str]):
    return json.loads(subprocess.check_output(["gh", *cmd], text=True))


def gh_api(method: str, path: str, body: dict | None = None):
    cmd = ["gh", "api", path, "-X", method]
    if body is None:
        return gh_json(cmd)
    p = subprocess.run(
        cmd + ["--input", "-"],
        input=json.dumps(body),
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(p.stdout) if p.stdout.strip() else {}


def ensure_fork(upstream: str) -> str:
    owner, name = upstream.split("/")
    fork = f"{ORG}/{name}"
    try:
        gh_json(["repo", "view", fork, "--json", "defaultBranchRef"])
    except subprocess.CalledProcessError:
        print(f"  forking {upstream}...")
        subprocess.check_call(["gh", "repo", "fork", upstream, "--clone=false", "--remote=false"])
    return fork


def open_pr(upstream: str, fork: str, branch: str, base: str) -> str:
    pulls = gh_json(
        [
            "api",
            f"repos/{upstream}/pulls",
            "-f",
            f"head={ORG}:{branch}",
            "-f",
            "state=open",
        ]
    )
    if pulls:
        url = pulls[0]["html_url"]
        print(f"  PR already open: {url}")
        return url
    pr = gh_api(
        "POST",
        f"repos/{upstream}/pulls",
        {
            "title": "Add Agentic Architect — Cursor persistence for .NET",
            "head": f"{ORG}:{branch}",
            "base": base,
            "body": PR_BODY,
        },
    )
    print(f"  opened: {pr['html_url']}")
    return pr["html_url"]


def process(upstream: str, old: str, new: str, message: str) -> str | None:
    owner, name = upstream.split("/")
    fork = ensure_fork(upstream)
    branch = "add-agentic-architect"

    upstream_readme = gh_json(["api", f"repos/{upstream}/contents/README.md"])
    content = base64.b64decode(upstream_readme["content"]).decode("utf-8")
    if "agentic-architect" in content.lower():
        print("  SKIP: already listed upstream")
        return None
    if old not in content:
        raise ValueError("Anchor not found in README")
    updated = content.replace(old, new, 1)

    fork_repo = gh_json(["api", f"repos/{fork}"])
    base = fork_repo["default_branch"]
    base_sha = gh_json(["api", f"repos/{fork}/git/ref/heads/{base}"])["object"]["sha"]

    try:
        gh_json(["api", f"repos/{fork}/git/ref/heads/{branch}"])
    except subprocess.CalledProcessError:
        gh_api("POST", f"repos/{fork}/git/refs", {"ref": f"refs/heads/{branch}", "sha": base_sha})

    try:
        fork_readme = gh_json(
            ["api", f"repos/{fork}/contents/README.md", "-f", f"ref={branch}"]
        )
        file_sha = fork_readme["sha"]
    except subprocess.CalledProcessError:
        file_sha = upstream_readme["sha"]

    gh_api(
        "PUT",
        f"repos/{fork}/contents/README.md",
        {
            "message": message,
            "content": base64.b64encode(updated.encode()).decode(),
            "sha": file_sha,
            "branch": branch,
        },
    )
    return open_pr(upstream, fork, branch, base)


def main() -> int:
    jobs = [
        (
            "quozd/awesome-dotnet",
            "## Artificial Intelligence\n* [LLamaSharp]",
            f"## Artificial Intelligence\n{LINE_COMMERCIAL}\n* [LLamaSharp]",
            "Add Agentic Architect to Artificial Intelligence",
        ),
        (
            "thangchung/awesome-dotnet-core",
            "### IDE\n* [Mono]",
            f"### IDE\n{LINE}\n* [Mono]",
            "Add Agentic Architect to IDE",
        ),
        (
            "bharatdwarkani/awesome-dotnet-core-applications",
            "[**Awesome collection of .NET Core Static Analyzers**]",
            f"{APPS_LINE}\n\n[**Awesome collection of .NET Core Static Analyzers**]",
            "Add Agentic Architect to Sample & Reference Applications",
        ),
    ]

    urls: list[str] = []
    for upstream, old, new, message in jobs:
        print(f"\n=== {upstream} ===")
        try:
            url = process(upstream, old, new, message)
            if url:
                urls.append(url)
        except Exception as exc:
            print(f"  ERROR: {exc}", file=sys.stderr)

    print("\n--- Done ---")
    for url in urls:
        print(url)
    return 0 if urls else 1


if __name__ == "__main__":
    sys.exit(main())
