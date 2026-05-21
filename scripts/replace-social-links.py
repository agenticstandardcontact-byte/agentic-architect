#!/usr/bin/env python3
"""One-off: replace SVG social <ul> blocks with visible text pill links."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OLD = re.compile(
    r'<ul class="(?:nav-social|foot-social|announce-social)" aria-label="Follow on social">.*?</ul>',
    re.DOTALL,
)
NEW = """<div class="social-links" aria-label="Follow on social">
          <a class="social-link" href="https://dev.to/agentic_standard" target="_blank" rel="noopener noreferrer">dev.to</a>
          <a class="social-link" href="https://bsky.app/profile/agentic-architect.bsky.social" target="_blank" rel="noopener noreferrer">Bluesky</a>
        </div>"""

for path in sorted(ROOT.glob("**/*.html")):
    if path.name == "404.html" or "google" in path.name:
        continue
    text = path.read_text(encoding="utf-8")
    if "nav-social" not in text and "foot-social" not in text:
        continue
    new_text, count = OLD.subn(NEW, text)
    if count:
        path.write_text(new_text, encoding="utf-8")
        print(f"{path.relative_to(ROOT)}: {count}")
