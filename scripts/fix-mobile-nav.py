#!/usr/bin/env python3
"""Add hamburger nav + script.js to all site HTML pages."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

HAMBURGER_BTN = (
    '<button type="button" class="nav-toggle" aria-expanded="false" '
    'aria-controls="navMenu" aria-label="Open menu">'
    '<span class="nav-toggle-icon" aria-hidden="true">'
    '<span></span><span></span><span></span></span></button>'
)

OLD_BTN = re.compile(
    r'<button type="button" class="nav-toggle"[^>]*>Menu</button>',
    re.I,
)

INLINE_NAV_SCRIPT = re.compile(
    r'\s*<script>\s*\(function\s*\(\)\s*\{[^<]*nav-toggle[^<]*</script>',
    re.S,
)

SKIP = {"google155117aeb0b20527.html", "daily-rules.html"}


def script_src(html_path: Path) -> str:
    depth = len(html_path.relative_to(ROOT).parts) - 1
    prefix = "../" * depth if depth else ""
    return f'{prefix}script.js'


def ensure_script(content: str, src: str) -> str:
    tag = f'<script src="{src}" defer></script>'
    if tag in content:
        return content
    content = INLINE_NAV_SCRIPT.sub("", content)
    if "</body>" in content:
        return content.replace("</body>", f"  {tag}\n</body>", 1)
    return content + f"\n{tag}\n"


def fix_nav(content: str) -> str:
    content = OLD_BTN.sub(HAMBURGER_BTN, content)

    # nav-links without panel -> add toggle + panel classes
    if 'class="nav-links"' in content and "nav-links-panel" not in content:
        content = content.replace(
            '<nav class="nav-links" aria-label="Primary">',
            f'{HAMBURGER_BTN}\n      <nav id="navMenu" class="nav-links nav-links-panel" aria-label="Primary">',
            1,
        )
    elif 'nav-links-panel' in content and "nav-toggle-icon" not in content:
        content = OLD_BTN.sub(HAMBURGER_BTN, content)

    return content


def main() -> None:
    changed = []
    for path in sorted(ROOT.rglob("*.html")):
        if path.name in SKIP:
            continue
        text = path.read_text(encoding="utf-8")
        if "nav-inner" not in text and "nav-toggle" not in text:
            continue
        updated = fix_nav(text)
        updated = ensure_script(updated, script_src(path))
        if updated != text:
            path.write_text(updated, encoding="utf-8")
            changed.append(path.relative_to(ROOT))
    print(f"Updated {len(changed)} files:")
    for p in changed:
        print(f"  - {p}")


if __name__ == "__main__":
    main()
