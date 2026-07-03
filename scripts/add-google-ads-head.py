#!/usr/bin/env python3
"""Add google-ads-head.js after uet-head.js in HTML files (UTF-8 safe)."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP = {"google155117aeb0b20527.html"}


def patch_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if "google-ads-head.js" in text:
        return False
    if "uet-head.js" not in text:
        return False

    for prefix in ("../", ""):
        needle = f'<script src="{prefix}uet-head.js"></script>'
        insert = (
            f'{needle}\n'
            f'  <script src="{prefix}google-ads-head.js"></script>'
        )
        if needle in text:
            text = text.replace(needle, insert, 1)
            path.write_text(text, encoding="utf-8", newline="\n")
            return True
    return False


def main() -> None:
    changed: list[str] = []
    for path in sorted(ROOT.rglob("*.html")):
        if path.name in SKIP or "node_modules" in path.parts:
            continue
        if patch_file(path):
            changed.append(str(path.relative_to(ROOT)))
    print(f"Patched {len(changed)} file(s)")
    for name in changed:
        print(f"  {name}")


if __name__ == "__main__":
    main()
