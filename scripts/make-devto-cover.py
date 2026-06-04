"""Generate dev.to cover image (1000x420) from the kit marketing art.

Run from repo root:
    python scripts/make-devto-cover.py

Source: assets/ai-kit-main.png
Outputs: og-image-devto.jpg (dev.to workflows use .../og-image-devto.jpg?v=N — bump N after in-place JPEG updates)
"""
from pathlib import Path

from PIL import Image

W, H = 1000, 420
REPO_ROOT = Path(__file__).resolve().parent.parent
SOURCE = REPO_ROOT / "assets" / "ai-kit-main.png"
OUT = REPO_ROOT / "og-image-devto.jpg"


def fit_cover(img: Image.Image, width: int, height: int) -> Image.Image:
    """Center-crop resize so the frame is filled (dev.to 1000x420)."""
    img = img.convert("RGBA")
    src_w, src_h = img.size
    scale = max(width / src_w, height / src_h)
    resized = img.resize((int(src_w * scale), int(src_h * scale)), Image.LANCZOS)
    left = (resized.width - width) // 2
    top = (resized.height - height) // 2
    return resized.crop((left, top, left + width, top + height))


def main():
    if not SOURCE.exists():
        raise SystemExit(f"Missing cover source: {SOURCE}")
    cover = fit_cover(Image.open(SOURCE), W, H)
    cover.convert("RGB").save(OUT, "JPEG", quality=90, optimize=True)
    print(f"Saved {OUT} from {SOURCE} ({W}x{H}), {OUT.stat().st_size} bytes")


if __name__ == "__main__":
    main()
