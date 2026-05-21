"""Quick check that .env syndication keys work (run after load-marketing-env.ps1)."""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request


def ok(msg: str) -> None:
    print(f"  OK  {msg}")


def fail(msg: str) -> None:
    print(f"  FAIL {msg}")


def check_devto() -> bool:
    key = os.environ.get("DEVTO_API_KEY", "").strip()
    if not key:
        fail("DEVTO_API_KEY missing")
        return False
    req = urllib.request.Request(
        "https://dev.to/api/users/me",
        headers={
            "api-key": key,
            "Accept": "application/vnd.forem.api-v1+json",
            "User-Agent": "agentic-architect-local-test",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            resp.read()
        ok("dev.to API key accepted")
        return True
    except urllib.error.HTTPError as e:
        fail(f"dev.to returned {e.code}")
        return False


def check_bluesky() -> bool:
    handle = os.environ.get("BLUESKY_HANDLE", "").strip()
    password = os.environ.get("BLUESKY_APP_PASSWORD", "").strip()
    if not handle or not password:
        fail("BLUESKY_HANDLE or BLUESKY_APP_PASSWORD missing")
        return False
    payload = json.dumps({"identifier": handle, "password": password}).encode()
    req = urllib.request.Request(
        "https://bsky.social/xrpc/com.atproto.server.createSession",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            session = json.loads(resp.read().decode())
        ok(f"Bluesky session for {session.get('handle', handle)}")
        return True
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else ""
        fail(f"Bluesky login failed ({e.code}): {body[:200]}")
        return False


def skip_hashnode() -> bool:
    print("  SKIP Hashnode (API disabled — cross-post manually on hashnode.com)")
    return True


def main() -> int:
    print("Syndication secret checks (values from current environment):\n")
    results = [check_devto(), skip_hashnode(), check_bluesky()]
    print()
    if all(results):
        print("All configured providers passed.")
        print("Copy the same names/values to GitHub Actions secrets for CI workflows.")
        return 0
    print("Fix failures in .env, then re-run:")
    print("  . .\\scripts\\load-marketing-env.ps1")
    print("  python scripts\\test-syndication-secrets.py")
    return 1


if __name__ == "__main__":
    sys.exit(main())
