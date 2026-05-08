#!/usr/bin/env python3
"""Build a self-contained review page for extracted character crop candidates."""

from __future__ import annotations

import base64
import html
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "docs" / "character-crops-manifest.json"
OUT = ROOT / "docs" / "character-crops-review.html"


def data_uri(path: Path) -> str:
    return "data:image/png;base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def main() -> int:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    cards = []
    for item in manifest["files"]:
        candidate = ROOT / item["candidate"]
        live = ROOT / item["target"]
        cards.append(f"""
        <article>
          <header>{html.escape(item['target'])}</header>
          <div class="compare">
            <figure>
              <figcaption>Current live PNG</figcaption>
              <div class="spriteBox"><img src="{data_uri(live)}" alt="Current {html.escape(item['target'])}"></div>
            </figure>
            <figure>
              <figcaption>New raw-sheet crop</figcaption>
              <div class="spriteBox"><img src="{data_uri(candidate)}" alt="Candidate {html.escape(item['target'])}"></div>
            </figure>
          </div>
          <p><b>Sheet:</b> {html.escape(item['sheet'])}</p>
          <p><b>Crop:</b> {item['crop']}</p>
          <p><b>Candidate size:</b> {item['size'][0]}x{item['size'][1]}</p>
        </article>
        """)

    doc = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Wizard Adventures Character Crop Review</title>
  <style>
    body {{ margin: 0; font-family: Arial, sans-serif; background: #0f172a; color: #f8fafc; }}
    .page {{ position: sticky; top: 0; z-index: 3; padding: 16px 20px; background: #111827; border-bottom: 1px solid rgba(255,255,255,.16); }}
    h1 {{ margin: 0 0 8px; font-size: 24px; }}
    .page p {{ margin: 0; color: #cbd5e1; }}
    main {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(430px, 1fr)); gap: 14px; padding: 14px; }}
    article {{ background: #1f2937; border: 1px solid rgba(255,255,255,.16); border-radius: 8px; overflow: hidden; }}
    article > header {{ padding: 9px 10px; background: #273449; font-size: 13px; overflow-wrap: anywhere; }}
    .compare {{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 10px; }}
    figure {{ margin: 0; }}
    figcaption {{ min-height: 30px; color: #cbd5e1; text-align: center; font-size: 12px; }}
    .spriteBox {{
      min-height: 215px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(255,255,255,.2);
      background-color: #475569;
      background-image:
        linear-gradient(45deg, rgba(255,255,255,.16) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(255,255,255,.16) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(255,255,255,.16) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(255,255,255,.16) 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0;
    }}
    img {{ max-width: 96%; max-height: 205px; object-fit: contain; image-rendering: pixelated; }}
    p {{ margin: 0; padding: 0 10px 8px; color: #dbeafe; font-size: 12px; }}
  </style>
</head>
<body>
  <header class="page">
    <h1>Character Crop Review</h1>
    <p>Compares current live PNGs against new raw-sheet crops from your crop boxes. These candidates still have baked checkerboard backgrounds; this page is for checking pose isolation and crop accuracy.</p>
  </header>
  <main>{''.join(cards)}</main>
</body>
</html>
"""
    OUT.write_text(doc, encoding="utf-8")
    print(f"Wrote {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
