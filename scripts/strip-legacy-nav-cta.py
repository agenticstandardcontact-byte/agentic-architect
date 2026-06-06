#!/usr/bin/env python3
"""Remove legacy single .nav-cta from HTML (replaced by script.js nav-ctas)."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAT = re.compile(
    r'\s*<a class="btn btn-primary btn-sm nav-cta"[^>]*>.*?</a>\s*',
    re.DOTALL,
)


def main() -> None:
    changed = []
    for path in sorted(ROOT.rglob("*.html")):
        text = path.read_text(encoding="utf-8")
        if "nav-cta" not in text:
            continue
        updated = PAT.sub("\n", text)
        if updated != text:
            path.write_text(updated, encoding="utf-8")
            changed.append(path.relative_to(ROOT))
    print(f"Stripped nav-cta from {len(changed)} files")


if __name__ == "__main__":
    main()
