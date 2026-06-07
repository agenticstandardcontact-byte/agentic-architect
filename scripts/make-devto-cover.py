"""Generate social / dev.to cover images from the kit marketing art.

Run from repo root:
    python scripts/make-devto-cover.py

Source: assets/ai-kit-main.png
Outputs:
  og-image.jpg       — 1200x630 Open Graph / LinkedIn (site-wide og:image)
  og-image-devto.jpg — 1000x420 dev.to cover (workflows use ?v=N — bump N after updates)
"""
from pathlib import Path

from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
SOURCE = REPO_ROOT / "assets" / "ai-kit-main.png"
OUT_OG = REPO_ROOT / "og-image.jpg"
OUT_DEVTO = REPO_ROOT / "og-image-devto.jpg"


def fit_cover(img: Image.Image, width: int, height: int) -> Image.Image:
    """Center-crop resize so the frame is filled."""
    img = img.convert("RGBA")
    src_w, src_h = img.size
    scale = max(width / src_w, height / src_h)
    resized = img.resize((int(src_w * scale), int(src_h * scale)), Image.LANCZOS)
    left = (resized.width - width) // 2
    top = (resized.height - height) // 2
    return resized.crop((left, top, left + width, top + height))


def save_jpeg(cover: Image.Image, path: Path) -> None:
    cover.convert("RGB").save(path, "JPEG", quality=90, optimize=True)
    print(f"Saved {path} ({cover.width}x{cover.height}), {path.stat().st_size} bytes")


def main():
    if not SOURCE.exists():
        raise SystemExit(f"Missing cover source: {SOURCE}")
    src = Image.open(SOURCE)
    save_jpeg(fit_cover(src, 1200, 630), OUT_OG)
    save_jpeg(fit_cover(src, 1000, 420), OUT_DEVTO)


if __name__ == "__main__":
    main()
