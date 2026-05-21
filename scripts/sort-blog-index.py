"""Sort blog/index.html post cards by date (newest first). Essays before daily rules on the same day."""
from __future__ import annotations

import re
import sys
from pathlib import Path

PAGE = Path(__file__).resolve().parent.parent / "blog" / "index.html"
MARKER = "<!-- DAILY-RULE-INSERTION-POINT -->"
POST_CARD_RE = re.compile(r'(<li class="post-card"[^>]*>.*?</li>)', re.DOTALL)
DATE_RE = re.compile(r'data-date="(\d{4}-\d{2}-\d{2})"|datetime="(\d{4}-\d{2}-\d{2})"')


def post_sort_key(li_html: str) -> tuple[str, int]:
    m = DATE_RE.search(li_html)
    if not m:
        raise ValueError(f"post-card missing date: {li_html[:120]!r}...")
    date = m.group(1) or m.group(2)
    is_essay = bool(re.search(r'<a href="0\d+-', li_html))
    return (date, 1 if is_essay else 0)


def sort_post_list(page_html: str) -> str:
    ul_m = re.search(r"<ul class=\"post-list\">(.*?)</ul>", page_html, re.DOTALL)
    if not ul_m:
        raise ValueError("post-list <ul> not found")
    inner = ul_m.group(1)
    marker_m = re.search(r"(\s*<!-- DAILY-RULE-INSERTION-POINT -->\s*\n)", inner)
    if not marker_m:
        raise ValueError(f"Marker {MARKER!r} not found inside post-list")
    marker = marker_m.group(1)
    rest = inner[marker_m.end() :]
    cards = POST_CARD_RE.findall(rest)
    if not cards:
        raise ValueError("No post-card entries found")
    suffix = POST_CARD_RE.sub("", rest).strip()
    cards.sort(key=post_sort_key, reverse=True)
    items_block = "\n\n          ".join(cards)
    new_inner = f"{marker}          {items_block}"
    if suffix:
        new_inner += f"\n\n          {suffix}"
    return (
        page_html[: ul_m.start()]
        + "<ul class=\"post-list\">"
        + new_inner
        + "\n\n        </ul>"
        + page_html[ul_m.end() :]
    )


def main() -> int:
    html = PAGE.read_text(encoding="utf-8")
    sorted_html = sort_post_list(html)
    if sorted_html == html:
        print("blog/index.html already sorted")
    else:
        PAGE.write_text(sorted_html, encoding="utf-8")
        print("Sorted blog/index.html (newest first)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
