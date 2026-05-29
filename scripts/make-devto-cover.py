"""Generate a dev.to-sized cover image (1000x420) that fits their aspect ratio.

Run from repo root:
    python scripts/make-devto-cover.py

Outputs: og-image-devto.jpg
"""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1000, 420
BG = (11, 15, 23)         # #0b0f17 — site dark navy
ORANGE = (255, 138, 61)   # #ff8a3d — brand accent
WHITE = (255, 255, 255)
MUTED = (180, 200, 215)
BTN_TEXT = (20, 14, 8)


def find_font(candidates, size):
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def main():
    img = Image.new("RGBA", (W, H), BG + (255,))

    # Soft orange glow in the top-right (mimics the existing OG image styling)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for r, a in [(420, 18), (320, 32), (220, 48)]:
        od.ellipse((W - r, -r // 2, W + r // 2, r), fill=(255, 138, 61, a))
    img = Image.alpha_composite(img, overlay)

    # Subtle horizontal accent line (under the headline)
    draw = ImageDraw.Draw(img)

    bold = [r"C:\Windows\Fonts\arialbd.ttf", r"C:\Windows\Fonts\segoeuib.ttf"]
    regular = [r"C:\Windows\Fonts\arial.ttf", r"C:\Windows\Fonts\segoeui.ttf"]

    font_headline = find_font(bold, 64)
    font_body = find_font(regular, 22)
    font_button = find_font(bold, 24)
    font_kicker = find_font(bold, 16)

    # Kicker
    draw.text((60, 50), "AGENTIC ARCHITECT", font=font_kicker, fill=ORANGE, spacing=4)

    # Headline — two lines
    draw.text((60, 90), "Stop paying the", font=font_headline, fill=WHITE)
    draw.text((60, 165), "Context Tax.", font=font_headline, fill=ORANGE)

    # Subtitle
    draw.text(
        (60, 255),
        "Persistence framework for Cursor —",
        font=font_body,
        fill=MUTED,
    )
    draw.text(
        (60, 285),
        "built for senior C#/.NET engineers.",
        font=font_body,
        fill=MUTED,
    )

    # CTA pill — Founder's Edition £9.00
    btn_label = "Founder's Edition  ·  £9.00 one-time  →"
    bbox = draw.textbbox((0, 0), btn_label, font=font_button)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    pad_x, pad_y = 24, 14
    btn_w = text_w + 2 * pad_x
    btn_h = text_h + 2 * pad_y
    btn_x = 60
    btn_y = 340
    draw.rounded_rectangle(
        (btn_x, btn_y, btn_x + btn_w, btn_y + btn_h),
        radius=10,
        fill=ORANGE,
    )
    draw.text(
        (btn_x + pad_x, btn_y + pad_y - 4),
        btn_label,
        font=font_button,
        fill=BTN_TEXT,
    )

    # Convert to RGB and save
    out = img.convert("RGB")
    out_path = "og-image-devto.jpg"
    out.save(out_path, "JPEG", quality=90, optimize=True)
    print(f"Saved {out_path} ({W}x{H}), {os.path.getsize(out_path)} bytes")


if __name__ == "__main__":
    main()
