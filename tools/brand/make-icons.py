"""Rebuild the social preview images (public/og-en.png, og-id.png) from
og-en.html and og-id.html, which show public/brand/bliss-mark.svg.

The favicon and app icons are not made here. They are the logo kit's
social/bliss-profile-white-on-dark.png (kept as tools/brand/icon-source.png),
resized; see the README, "Logo and icons".

Run from the project folder:

    python tools/brand/make-icons.py

Needs Google Chrome or Microsoft Edge, which draws the preview pages. Set
CHROME to its path if it is not in the usual place.
"""
import os
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent


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


def main() -> None:
    public = ROOT / "public"
    for lang in ("en", "id"):
        screenshot(HERE / f"og-{lang}.html", public / f"og-{lang}.png", 1200, 630)
    print("Preview images updated in public/.")


if __name__ == "__main__":
    main()
