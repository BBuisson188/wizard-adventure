#!/usr/bin/env python3
"""Build a self-contained review page for raw sprite sheets and extracted assets."""

from __future__ import annotations

import base64
import html
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "docs" / "raw-sheet-review.html"


def data_uri(path: Path) -> str:
    return "data:image/png;base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def section_for_sheet(sheet: Path, related_dirs: list[Path]) -> str:
    assets: list[Path] = []
    for folder in related_dirs:
        if folder.exists():
            assets.extend(sorted(folder.rglob("*.png")))

    thumbs = []
    for asset in assets:
        rel = asset.relative_to(ROOT).as_posix()
        thumbs.append(f"""
          <figure class="thumb">
            <div class="spriteBox"><img src="{data_uri(asset)}" alt="{html.escape(rel)}"></div>
            <figcaption>{html.escape(rel)}</figcaption>
          </figure>
        """)

    rel_sheet = sheet.relative_to(ROOT).as_posix()
    return f"""
      <section>
        <h2>{html.escape(rel_sheet)}</h2>
        <div class="sheetWrap">
          <img class="sheet" src="{data_uri(sheet)}" alt="{html.escape(rel_sheet)}">
        </div>
        <h3>Current Extracted PNGs</h3>
        <div class="thumbGrid">{''.join(thumbs)}</div>
      </section>
    """


def main() -> int:
    sections = [
        section_for_sheet(ROOT / "assets/raw/finn_spritesheet.png", [ROOT / "assets/characters/finn"]),
        section_for_sheet(ROOT / "assets/raw/nora_spritesheet.png", [ROOT / "assets/characters/nora"]),
        section_for_sheet(ROOT / "assets/raw/basic_enemies_sheet.png", [
            ROOT / "assets/enemies/cursed_book",
            ROOT / "assets/enemies/armored_beetle",
            ROOT / "assets/enemies/snapping_vine",
        ]),
        section_for_sheet(ROOT / "assets/raw/advanced_enemies_owl_sheet.png", [
            ROOT / "assets/enemies/goblin_spell_thrower",
            ROOT / "assets/enemies/cursed_scroll_rocket",
            ROOT / "assets/enemies/owl_helper",
        ]),
    ]

    doc = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Wizard Adventures Raw Sheet Review</title>
  <style>
    body {{
      margin: 0;
      font-family: Arial, sans-serif;
      background: #0f172a;
      color: #f8fafc;
    }}
    header {{
      position: sticky;
      top: 0;
      z-index: 4;
      padding: 16px 20px;
      background: #111827;
      border-bottom: 1px solid rgba(255,255,255,.16);
    }}
    h1 {{ margin: 0 0 8px; font-size: 24px; }}
    p {{ margin: 0; color: #cbd5e1; line-height: 1.4; }}
    section {{ padding: 18px 20px 30px; border-bottom: 1px solid rgba(255,255,255,.16); }}
    h2 {{ margin: 0 0 12px; font-size: 20px; }}
    h3 {{ margin: 18px 0 10px; color: #dbeafe; }}
    .sheetWrap {{
      overflow: auto;
      border: 1px solid rgba(255,255,255,.22);
      background-color: #334155;
      background-image:
        linear-gradient(45deg, rgba(255,255,255,.16) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(255,255,255,.16) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(255,255,255,.16) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(255,255,255,.16) 75%);
      background-size: 24px 24px;
      background-position: 0 0, 0 12px, 12px -12px, -12px 0;
      max-height: 82vh;
    }}
    .sheet {{
      display: block;
      max-width: none;
      width: 1448px;
      height: 1086px;
      image-rendering: auto;
    }}
    .thumbGrid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
      gap: 12px;
    }}
    .thumb {{
      margin: 0;
      border: 1px solid rgba(255,255,255,.16);
      background: #1f2937;
      border-radius: 8px;
      overflow: hidden;
    }}
    .spriteBox {{
      height: 145px;
      display: grid;
      place-items: center;
      background-color: #475569;
      background-image:
        linear-gradient(45deg, rgba(255,255,255,.16) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(255,255,255,.16) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(255,255,255,.16) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(255,255,255,.16) 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0;
    }}
    .thumb img {{
      max-width: 95%;
      max-height: 135px;
      object-fit: contain;
      image-rendering: pixelated;
    }}
    figcaption {{
      padding: 8px;
      min-height: 44px;
      color: #cbd5e1;
      font-size: 11px;
      overflow-wrap: anywhere;
    }}
  </style>
</head>
<body>
  <header>
    <h1>Wizard Adventures Raw Sheet Review</h1>
    <p>Self-contained. Use this to compare the raw source sheets against the currently extracted PNGs and decide whether bad frames can be re-cropped or need new art.</p>
  </header>
  {''.join(sections)}
</body>
</html>
"""
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(doc, encoding="utf-8")
    print(f"Wrote {OUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
