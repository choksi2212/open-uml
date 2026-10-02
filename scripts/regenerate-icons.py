#!/usr/bin/env python3
"""
Regenerate app/assets/* from the logo-family masters.

Run this after updating any file in logo-family/png/* (or after a brand
refresh). Uses Pillow only - no ImageMagick required.

  python scripts/regenerate-icons.py

Outputs (all into app/assets/):
  icon.ico         - Windows installer icon (multi-size)
  icon.icns        - macOS DMG icon
  _monogram-light.png / _monogram-dark.png - topbar icon, themed
  social-avatar.png - GitHub/Twitter avatar
  favicon.svg     - copied to public/ for the dev server / browser tab
"""

import shutil
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")

REPO = Path(__file__).resolve().parent.parent
LOGOS = REPO / "logo-family"
ASSETS = REPO / "app" / "assets"
PUBLIC = REPO / "public"


def gen_ico(src: Path, out: Path) -> None:
    img = Image.open(src).convert("RGBA")
    img.save(
        out,
        format="ICO",
        sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )
    print(f"  {out.relative_to(REPO)} ({out.stat().st_size // 1024} KB)")


def gen_icns(src: Path, out: Path) -> None:
    img = Image.open(src).convert("RGBA")
    img.save(
        out,
        format="ICNS",
        sizes=[(16, 16), (32, 32), (64, 64), (128, 128), (256, 256), (512, 512), (1024, 1024)],
    )
    print(f"  {out.relative_to(REPO)} ({out.stat().st_size // 1024} KB)")


def copy(src: Path, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, out)
    print(f"  {out.relative_to(REPO)} ({out.stat().st_size // 1024} KB)")


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)

    print("Regenerating app icons from logo-family masters...")
    # Windows + macOS app icons derive from the light-theme master.
    gen_ico(LOGOS / "png" / "light" / "app-icon-1024.png", ASSETS / "icon.ico")
    gen_icns(LOGOS / "png" / "light" / "app-icon-1024.png", ASSETS / "icon.icns")

    # TopBar full wordmark - mark + "Open UML" traced from Plex Sans,
    # themed via theme prop in TopBar.tsx. SVG stays sharp at any size.
    copy(LOGOS / "svg" / "light" / "wordmark-full.svg", ASSETS / "_wordmark-light.svg")
    copy(LOGOS / "svg" / "dark" / "wordmark-full.svg", ASSETS / "_wordmark-dark.svg")

    # Social avatar - light theme reads on both light and dark GitHub/Twitter.
    copy(LOGOS / "png" / "light" / "social-avatar-400.png", ASSETS / "social-avatar.png")

    # Browser favicon (served from /favicon.svg in dev and prod).
    copy(LOGOS / "svg" / "light" / "monogram.svg", PUBLIC / "favicon.svg")

    print("Done.")


if __name__ == "__main__":
    main()
