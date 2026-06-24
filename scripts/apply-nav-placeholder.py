#!/usr/bin/env python3
"""Replace duplicated header.nav HTML with the shared nav shell."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from nav_template import render_nav_shell

NAV_RE = re.compile(r"<header class=\"nav\">.*?</header>", re.DOTALL)

INLINE_NAV_SCRIPT = re.compile(
    r"\n  <script>\n  \(function \(\) \{\n"
    r"    var btn = document\.querySelector\('\.nav-toggle'\);\n"
    r"    var menu = document\.querySelector\('\.nav-links-panel'\);\n"
    r".*?\n  \}\)\(\);\n  </script>",
    re.DOTALL,
)

SCRIPT_JS = '  <script src="../script.js" defer></script>'
SCRIPT_JS_ROOT = '  <script src="script.js" defer></script>'


def section_for(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    if rel.startswith("blog/"):
        return "blog"
    if rel.startswith("hardware/"):
        return "hardware"
    if rel.startswith("learn/"):
        return "learn"
    return "root"


def script_tag_for(path: Path) -> str:
    rel = path.relative_to(ROOT)
    depth = len(rel.parts) - 1
    return SCRIPT_JS if depth else SCRIPT_JS_ROOT


def ensure_script_js(text: str, path: Path) -> str:
    tag = script_tag_for(path)
    text = INLINE_NAV_SCRIPT.sub("", text)
    if "script.js" in text:
        return text
    if "</body>" in text:
        return text.replace("</body>", f"{tag}\n</body>", 1)
    return text


def main() -> None:
    changed: list[str] = []
    for path in sorted(ROOT.rglob("*.html")):
        if "node_modules" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        if 'class="nav"' not in text and "class=\"nav\"" not in text:
            continue
        if "nav-skip-inject" in text or 'class="nav-brand"' in text:
            continue

        placeholder = render_nav_shell(section=section_for(path))
        updated = NAV_RE.sub(placeholder, text, count=1)
        updated = ensure_script_js(updated, path)
        if updated != text:
            path.write_text(updated, encoding="utf-8")
            changed.append(str(path.relative_to(ROOT)))

    print(f"Updated {len(changed)} files:")
    for name in changed:
        print(f"  {name}")


if __name__ == "__main__":
    main()
