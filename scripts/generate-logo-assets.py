#!/usr/bin/env python3
"""Generate favicon, PWA, and OG assets from public/images/LogoGreen2025.png."""
from pathlib import Path
import base64
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/images/LogoGreen2025.png"
BRAND = (0, 53, 39)


def resize_contain(img: Image.Image, size: int) -> Image.Image:
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    img_rgba = img.convert("RGBA")
    img_rgba.thumbnail((size, size), Image.Resampling.LANCZOS)
    x = (size - img_rgba.width) // 2
    y = (size - img_rgba.height) // 2
    out.paste(img_rgba, (x, y), img_rgba)
    return out


def build_og(img: Image.Image) -> Image.Image:
    out = Image.new("RGB", (1200, 630), BRAND)
    img_rgb = img.convert("RGB")
    max_w, max_h = 520, 420
    scale = min(max_w / img.width, max_h / img.height)
    w, h = int(img.width * scale), int(img.height * scale)
    resized = img_rgb.resize((w, h), Image.Resampling.LANCZOS)
    x = (1200 - w) // 2
    y = (630 - h) // 2
    out.paste(resized, (x, y))
    return out


def main() -> None:
    img = Image.open(SRC)
    (ROOT / "public/icons").mkdir(parents=True, exist_ok=True)

    sizes = {
        ROOT / "public/favicon-32.png": 32,
        ROOT / "public/icons/apple-touch-icon.png": 180,
        ROOT / "public/icons/icon-192.png": 192,
        ROOT / "public/icons/icon-512.png": 512,
    }
    for path, size in sizes.items():
        resize_contain(img, size).save(path, optimize=True)

    favicon_32 = resize_contain(img, 32)
    favicon_32.save(ROOT / "public/favicon.ico", format="ICO", sizes=[(32, 32)])

    build_og(img).save(ROOT / "public/images/og-default.png", optimize=True)

    buf = __import__("io").BytesIO()
    favicon_32.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    (ROOT / "public/favicon.svg").write_text(
        f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Green Office 2026">
  <image width="32" height="32" href="data:image/png;base64,{b64}"/>
</svg>
""",
        encoding="utf-8",
    )
    print("Generated logo assets from LogoGreen2025.png")


if __name__ == "__main__":
    main()
