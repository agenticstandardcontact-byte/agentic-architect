#!/usr/bin/env python3
"""Remove all social link markup from site HTML."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOCIAL = re.compile(
    r'\s*<div class="social-links" aria-label="Follow on social">.*?</div>\s*',
    re.DOTALL,
)
NAV_END = re.compile(
    r'<div class="nav-end">\s*(<a class="btn btn-primary btn-sm nav-cta"[^>]*>Get the Kit</a>)\s*</div>',
)

for path in sorted(ROOT.glob("**/*.html")):
    if path.name in ("404.html",) or "google" in path.name:
        continue
    text = path.read_text(encoding="utf-8")
    if "social-links" not in text and "nav-end" not in text:
        continue
    text = SOCIAL.sub("\n", text)
    text = NAV_END.sub(r"\1", text)
    path.write_text(text, encoding="utf-8")
    print(f"updated {path.relative_to(ROOT)}")
