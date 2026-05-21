#!/usr/bin/env python3
"""Replace text social pills with self-hosted brand icon links (nav + footer only)."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

ICON_BLOCK_ROOT = """<div class="social-links" aria-label="Follow on social">
          <a class="social-link" href="https://dev.to/agentic_standard" target="_blank" rel="noopener noreferrer" aria-label="Follow on dev.to">
            <img src="icons/devto.svg" width="20" height="20" alt="" decoding="async" />
          </a>
          <a class="social-link" href="https://bsky.app/profile/agentic-architect.bsky.social" target="_blank" rel="noopener noreferrer" aria-label="Follow on Bluesky">
            <img src="icons/bluesky.svg" width="20" height="20" alt="" decoding="async" />
          </a>
        </div>"""

ICON_BLOCK_BLOG = ICON_BLOCK_ROOT.replace('src="icons/', 'src="../icons/')

OLD = re.compile(
    r'<div class="social-links" aria-label="Follow on social">.*?</div>',
    re.DOTALL,
)

for path in sorted(ROOT.glob("**/*.html")):
    if "google" in path.name or path.name == "404.html":
        continue
    text = path.read_text(encoding="utf-8")
    if "social-links" not in text:
        continue
    block = ICON_BLOCK_BLOG if path.parent.name == "blog" else ICON_BLOCK_ROOT
    new_text, count = OLD.subn(block, text)
    if count:
        path.write_text(new_text, encoding="utf-8")
        print(f"{path.relative_to(ROOT)}: {count}")
