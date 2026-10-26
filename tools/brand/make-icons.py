"""Rebuild every icon and social preview image from the logo mark.

When the logo changes, replace public/brand/bliss-mark.svg (keep it square,
with the mark filling the whole canvas), then run from the project folder:

    python tools/brand/make-icons.py

It writes:
    public/brand/bliss-icon.svg   rounded cream tile with the mark (SVG favicon)
    public/favicon.ico            16, 32 and 48 px
    public/icon-192.png           Android and PWA
    public/icon-512.png           Android, PWA and Google's business logo
    public/apple-touch-icon.png   iPhone home screen (square; iOS rounds it)
    public/og-en.png, og-id.png   social preview images (from og-en.html, og-id.html)

Needs Python with Pillow (pip install pillow) and Google Chrome or Microsoft
Edge, which draws the SVG and the preview pages. Set CHROME to its path if it
is not in the usual place.
"""
import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
BRAND = ROOT / "public" / "brand"
HERE = Path(__file__).resolve().parent

# Tile look, measured from the designer's bliss-icon.png
TILE_COLOR = "#F6F4F0"
CORNER = 0.286  # corner radius as a share of the width
MARK = 0.5625  # mark size as a share of the width, centred


def chrome() -> str:
    candidates = [
        os.environ.get("CHROME", ""),
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        shutil.which("google-chrome") or "",
        shutil.which("chromium") or "",
    ]
    for c in candidates:
        if c and Path(c).exists():
            return c
    raise SystemExit("Chrome or Edge not found. Set CHROME to its path.")


def screenshot(html: Path, out: Path, width: int, height: int, transparent: bool = False) -> None:
    args = [
        chrome(), "--headless=new", "--disable-gpu", "--hide-scrollbars",
        f"--window-size={width},{height}", "--virtual-time-budget=3000",
        f"--screenshot={out}", html.as_uri(),
    ]
    if transparent:
        args.insert(4, "--default-background-color=00000000")
    subprocess.run(args, check=True, capture_output=True)


def tile_svg(radius: float) -> str:
    mark = (BRAND / "bliss-mark.svg").read_text(encoding="utf8")
    view = re.search(r'viewBox="([\d.\s]+)"', mark).group(1).split()
    size = float(view[2])
    inner = re.search(r"<svg[^>]*>(.*)</svg>", mark, re.S).group(1).strip()
    offset = size * (1 - MARK) / 2
    return (
        f'<svg width="{size:g}" height="{size:g}" viewBox="0 0 {size:g} {size:g}" fill="none" xmlns="http://www.w3.org/2000/svg">\n'
        f'<rect width="{size:g}" height="{size:g}" rx="{round(size * radius)}" fill="{TILE_COLOR}"/>\n'
        f'<g transform="translate({offset:g} {offset:g}) scale({MARK})">\n{inner}\n</g>\n</svg>\n'
    )


def render_svg(svg: str, tmp: Path, name: str) -> Image.Image:
    (tmp / f"{name}.svg").write_text(svg, encoding="utf8")
    html = tmp / f"{name}.html"
    html.write_text(
        f'<!doctype html><body style="margin:0;background:transparent">'
        f'<img src="{name}.svg" width="1024" height="1024" style="display:block"></body>',
        encoding="utf8",
    )
    png = tmp / f"{name}.png"
    screenshot(html, png, 1024, 1024, transparent=True)
    return Image.open(png).convert("RGBA")


def main() -> None:
    rounded_svg = tile_svg(CORNER)
    (BRAND / "bliss-icon.svg").write_text(rounded_svg, encoding="utf8")

    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        rounded = render_svg(rounded_svg, tmp, "rounded")
        square = render_svg(tile_svg(0), tmp, "square").convert("RGB")

    public = ROOT / "public"
    rounded.resize((192, 192), Image.LANCZOS).save(public / "icon-192.png", optimize=True)
    rounded.resize((512, 512), Image.LANCZOS).save(public / "icon-512.png", optimize=True)
    square.resize((180, 180), Image.LANCZOS).save(public / "apple-touch-icon.png", optimize=True)
    rounded.save(public / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

    for lang in ("en", "id"):
        screenshot(HERE / f"og-{lang}.html", public / f"og-{lang}.png", 1200, 630)

    print("Icons and preview images updated in public/.")


if __name__ == "__main__":
    main()
