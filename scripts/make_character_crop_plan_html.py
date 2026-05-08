#!/usr/bin/env python3
"""Render crop-plan boxes over character source sheets."""

from __future__ import annotations

import base64
import html
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PLAN = ROOT / "docs" / "crop-plan-character-sheets.json"
OUT = ROOT / "docs" / "character-crop-plan.html"


def data_uri(path: Path) -> str:
    return "data:image/png;base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def main() -> int:
    plan = json.loads(PLAN.read_text(encoding="utf-8"))
    sections: list[str] = []
    for sheet, info in plan["sheets"].items():
        boxes: list[str] = []
        for target, rect in info["targets"].items():
            x, y, w, h = rect
            label = Path(target).name
            boxes.append(
                f'<div class="box" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px">'
                f'<span>{html.escape(label)}</span></div>'
            )
        sections.append(f"""
        <section>
          <h2>{html.escape(sheet)}</h2>
          <div class="sheetFrame">
            <img src="{data_uri(ROOT / sheet)}" alt="{html.escape(sheet)}">
            {''.join(boxes)}
          </div>
        </section>
        """)

    doc = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Wizard Adventures Character Crop Plan</title>
  <style>
    body {{ margin: 0; font-family: Arial, sans-serif; background: #0f172a; color: #f8fafc; }}
    header {{ position: sticky; top: 0; z-index: 5; padding: 16px 20px; background: #111827; border-bottom: 1px solid rgba(255,255,255,.18); }}
    h1 {{ margin: 0 0 8px; font-size: 24px; }}
    p {{ margin: 0; color: #cbd5e1; }}
    section {{ padding: 18px 20px 30px; border-bottom: 1px solid rgba(255,255,255,.16); }}
    h2 {{ margin: 0 0 12px; }}
    .sheetFrame {{
      position: relative;
      width: 1448px;
      height: 1086px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,.25);
    }}
    .sheetFrame img {{ display: block; width: 1448px; height: 1086px; }}
    .box {{
      position: absolute;
      border: 3px solid #ff1744;
      background: rgba(255, 23, 68, .08);
      box-shadow: 0 0 0 1px rgba(255,255,255,.85) inset;
    }}
    .box span {{
      position: absolute;
      left: 0;
      top: -20px;
      padding: 2px 4px;
      background: #ff1744;
      color: white;
      font-size: 11px;
      white-space: nowrap;
    }}
  </style>
</head>
<body>
  <header>
    <h1>Character Crop Plan</h1>
    <p>These red boxes are the proposed explicit crop lines. Edit docs/crop-plan-character-sheets.json to adjust any box before extraction.</p>
  </header>
  {''.join(sections)}
</body>
</html>
"""
    OUT.write_text(doc, encoding="utf-8")
    print(f"Wrote {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
