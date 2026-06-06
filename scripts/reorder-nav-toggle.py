#!/usr/bin/env python3
"""Move nav-toggle to after nav-cta in all pages (hamburger rightmost in DOM)."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOGGLE_RE = re.compile(
    r'<button type="button" class="nav-toggle"[^>]*>.*?</button>\s*',
    re.DOTALL,
)


def reorder(content: str) -> str:
    m = TOGGLE_RE.search(content)
    if not m or 'nav-cta' not in content:
        return content
    toggle = m.group(0)
    content = content[: m.start()] + content[m.end() :]
    # Insert toggle after nav-cta link (before closing nav-inner div)
    cta_m = re.search(
        r'(<a class="btn[^"]*nav-cta"[^>]*>.*?</a>)',
        content,
        re.DOTALL,
    )
    if not cta_m:
        return content
    insert_at = cta_m.end()
    return content[:insert_at] + "\n      " + toggle.strip() + content[insert_at:]


def main() -> None:
    changed = []
    for path in sorted(ROOT.rglob("*.html")):
        text = path.read_text(encoding="utf-8")
        if "nav-toggle" not in text:
            continue
        updated = reorder(text)
        if updated != text:
            path.write_text(updated, encoding="utf-8")
            changed.append(path.relative_to(ROOT))
    print(f"Reordered {len(changed)} files")
    for p in changed:
        print(f"  {p}")


if __name__ == "__main__":
    main()
