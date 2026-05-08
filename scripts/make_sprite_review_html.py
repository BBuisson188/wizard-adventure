#!/usr/bin/env python3
"""Build a self-contained sprite review HTML page with embedded images."""

from __future__ import annotations

import base64
import html
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT_PATH = ROOT / "docs" / "asset-audit.json"
MANIFEST_PATH = ROOT / "docs" / "normalized-sprites-manifest.json"
OUT_PATH = ROOT / "docs" / "sprite-review.html"


def image_data_uri(path: Path) -> str:
    data = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:image/png;base64,{data}"


def main() -> int:
    audit = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    normalized_by_path = {item["path"]: item for item in manifest["files"]}

    audits = sorted(
        audit["audits"],
        key=lambda item: (
            {"HIGH": 0, "MEDIUM": 1, "LOW": 2, "OK": 3}.get(item["severity"], 9),
            item["path"],
        ),
    )

    rows = []
    for item in audits:
        rel = item["path"]
        original = ROOT / rel
        normalized = ROOT / "assets_normalized" / rel
        if not original.exists() or not normalized.exists():
            continue
        warnings = "<br>".join(html.escape(w) for w in item["warnings"]) or "none"
        contacts = ", ".join(item["edge_contacts"]) or "none"
        normalized_meta = normalized_by_path.get(rel, {})
        out_canvas = normalized_meta.get("output_canvas", ["?", "?"])
        src_canvas = normalized_meta.get("source_canvas", [item["width"], item["height"]])
        rows.append(f"""
        <article class="card severity-{html.escape(item['severity'].lower())}">
          <header>
            <strong>{html.escape(rel)}</strong>
            <span>{html.escape(item['severity'])}</span>
          </header>
          <div class="compare">
            <figure>
              <figcaption>Original<br>{src_canvas[0]}x{src_canvas[1]}</figcaption>
              <div class="spriteBox"><img src="{image_data_uri(original)}" alt="Original {html.escape(rel)}"></div>
            </figure>
            <figure>
              <figcaption>Normalized<br>{out_canvas[0]}x{out_canvas[1]}</figcaption>
              <div class="spriteBox"><img src="{image_data_uri(normalized)}" alt="Normalized {html.escape(rel)}"></div>
            </figure>
          </div>
          <p><b>Edge contacts:</b> {html.escape(contacts)}</p>
          <p><b>Warnings:</b><br>{warnings}</p>
        </article>
        """)

    doc = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Wizard Adventures Sprite Review</title>
  <style>
    body {{
      margin: 0;
      font-family: Arial, sans-serif;
      background: #111827;
      color: #eef2ff;
    }}
    header.page {{
      position: sticky;
      top: 0;
      z-index: 2;
      padding: 16px 20px;
      background: #0f172a;
      border-bottom: 1px solid rgba(255,255,255,.15);
    }}
    h1 {{ margin: 0 0 8px; font-size: 24px; }}
    .summary {{ color: #cbd5e1; }}
    main {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(430px, 1fr));
      gap: 16px;
      padding: 16px;
    }}
    .card {{
      border: 1px solid rgba(255,255,255,.16);
      border-radius: 8px;
      background: #1f2937;
      overflow: hidden;
    }}
    .card > header {{
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 12px;
      background: #273449;
      border-bottom: 1px solid rgba(255,255,255,.12);
      font-size: 13px;
    }}
    .severity-high > header span {{ color: #fecaca; }}
    .severity-medium > header span {{ color: #fde68a; }}
    .severity-low > header span {{ color: #bfdbfe; }}
    .compare {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding: 12px;
    }}
    figure {{ margin: 0; }}
    figcaption {{
      min-height: 34px;
      color: #cbd5e1;
      font-size: 12px;
      text-align: center;
    }}
    .spriteBox {{
      min-height: 220px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(255,255,255,.2);
      background-color: #334155;
      background-image:
        linear-gradient(45deg, rgba(255,255,255,.18) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(255,255,255,.18) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(255,255,255,.18) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(255,255,255,.18) 75%);
      background-size: 24px 24px;
      background-position: 0 0, 0 12px, 12px -12px, -12px 0;
    }}
    img {{
      max-width: 95%;
      max-height: 210px;
      image-rendering: pixelated;
      object-fit: contain;
      filter: drop-shadow(0 3px 6px rgba(0,0,0,.4));
    }}
    p {{
      margin: 0;
      padding: 0 12px 10px;
      color: #dbeafe;
      font-size: 13px;
      line-height: 1.35;
    }}
  </style>
</head>
<body>
  <header class="page">
    <h1>Wizard Adventures Sprite Review</h1>
    <div class="summary">Self-contained page. Original versus normalized copies, with checkerboard backgrounds so transparent PNGs are visible.</div>
  </header>
  <main>
    {''.join(rows)}
  </main>
</body>
</html>
"""
    OUT_PATH.write_text(doc, encoding="utf-8")
    print(f"Wrote {OUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
