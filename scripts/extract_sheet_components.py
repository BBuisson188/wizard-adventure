#!/usr/bin/env python3
"""Extract alpha-connected sprite candidates from raw sprite sheets.

This is for fixing crowded-sheet crop contamination: instead of slicing a
regular grid, it finds separated visible components in each raw PNG and writes
candidate crops with transparent padding.
"""

from __future__ import annotations

import argparse
import base64
import html
import json
import struct
import sys
import zlib
from collections import deque
from pathlib import Path

import audit_sprites


ROOT = Path(__file__).resolve().parents[1]


def write_png_rgba(path: Path, width: int, height: int, rgba: list[int]) -> None:
    def chunk(kind: bytes, data: bytes) -> bytes:
        crc = zlib.crc32(kind)
        crc = zlib.crc32(data, crc) & 0xffffffff
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", crc)

    raw = bytearray()
    stride = width * 4
    for y in range(height):
        raw.append(0)
        raw.extend(rgba[y * stride:(y + 1) * stride])

    out = bytearray()
    out.extend(audit_sprites.PNG_SIGNATURE)
    out.extend(chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)))
    out.extend(chunk(b"IDAT", zlib.compress(bytes(raw), level=9)))
    out.extend(chunk(b"IEND", b""))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(bytes(out))


def data_uri(path: Path) -> str:
    return "data:image/png;base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def find_components(width: int, height: int, rgba: list[int], alpha_threshold: int, min_pixels: int) -> list[dict]:
    visible = bytearray(width * height)
    for i in range(width * height):
        if rgba[i * 4 + 3] >= alpha_threshold:
            visible[i] = 1

    seen = bytearray(width * height)
    components: list[dict] = []
    for start in range(width * height):
        if not visible[start] or seen[start]:
            continue

        q: deque[int] = deque([start])
        seen[start] = 1
        pixels: list[int] = []
        min_x = width
        max_x = 0
        min_y = height
        max_y = 0

        while q:
            idx = q.popleft()
            pixels.append(idx)
            x = idx % width
            y = idx // width
            min_x = min(min_x, x)
            max_x = max(max_x, x)
            min_y = min(min_y, y)
            max_y = max(max_y, y)

            if x > 0:
                n = idx - 1
                if visible[n] and not seen[n]:
                    seen[n] = 1
                    q.append(n)
            if x < width - 1:
                n = idx + 1
                if visible[n] and not seen[n]:
                    seen[n] = 1
                    q.append(n)
            if y > 0:
                n = idx - width
                if visible[n] and not seen[n]:
                    seen[n] = 1
                    q.append(n)
            if y < height - 1:
                n = idx + width
                if visible[n] and not seen[n]:
                    seen[n] = 1
                    q.append(n)

        if len(pixels) >= min_pixels:
            components.append({
                "pixels": pixels,
                "pixel_count": len(pixels),
                "bbox": [min_x, min_y, max_x, max_y],
            })

    components.sort(key=lambda c: (c["bbox"][1], c["bbox"][0]))
    return components


def crop_component(width: int, height: int, rgba: list[int], component: dict, padding: int) -> tuple[int, int, list[int], list[int]]:
    left, top, right, bottom = component["bbox"]
    crop_left = max(0, left - padding)
    crop_top = max(0, top - padding)
    crop_right = min(width - 1, right + padding)
    crop_bottom = min(height - 1, bottom + padding)
    out_w = crop_right - crop_left + 1
    out_h = crop_bottom - crop_top + 1
    out = [0] * (out_w * out_h * 4)

    component_pixels = set(component["pixels"])
    for idx in component["pixels"]:
        x = idx % width
        y = idx // width
        out_x = x - crop_left
        out_y = y - crop_top
        src = idx * 4
        dst = (out_y * out_w + out_x) * 4
        out[dst:dst + 4] = rgba[src:src + 4]

    return out_w, out_h, out, [crop_left, crop_top, crop_right, crop_bottom]


def process_sheet(sheet: Path, out_dir: Path, alpha_threshold: int, min_pixels: int, padding: int) -> list[dict]:
    width, height, rgba = audit_sprites.read_png_rgba(sheet)
    components = find_components(width, height, rgba, alpha_threshold, min_pixels)
    sheet_slug = sheet.stem
    records: list[dict] = []

    for i, component in enumerate(components, start=1):
        out_w, out_h, crop, crop_box = crop_component(width, height, rgba, component, padding)
        filename = f"{i:03d}_{sheet_slug}_{crop_box[0]}_{crop_box[1]}_{crop_box[2]}_{crop_box[3]}.png"
        out_path = out_dir / sheet_slug / filename
        write_png_rgba(out_path, out_w, out_h, crop)
        records.append({
            "id": i,
            "sheet": sheet.relative_to(ROOT).as_posix(),
            "path": out_path.relative_to(ROOT).as_posix(),
            "component_bbox": component["bbox"],
            "crop_box": crop_box,
            "output_size": [out_w, out_h],
            "pixel_count": component["pixel_count"],
        })
    return records


def write_html(records_by_sheet: dict[str, list[dict]], out_path: Path) -> None:
    sections: list[str] = []
    for sheet, records in records_by_sheet.items():
        cards: list[str] = []
        for record in records:
            path = ROOT / record["path"]
            cards.append(f"""
            <article>
              <div class="spriteBox"><img src="{data_uri(path)}" alt="{html.escape(record['path'])}"></div>
              <h3>{record['id']:03d}</h3>
              <p><b>Crop:</b> {record['crop_box']}</p>
              <p><b>Component:</b> {record['component_bbox']}</p>
              <p><b>Size:</b> {record['output_size'][0]}x{record['output_size'][1]}</p>
              <p class="path">{html.escape(record['path'])}</p>
            </article>
            """)
        sections.append(f"""
        <section>
          <h2>{html.escape(sheet)} ({len(records)} components)</h2>
          <div class="grid">{''.join(cards)}</div>
        </section>
        """)

    doc = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Wizard Adventures Sheet Component Crops</title>
  <style>
    body {{ margin: 0; font-family: Arial, sans-serif; color: #eef2ff; background: #0f172a; }}
    header {{ position: sticky; top: 0; z-index: 3; padding: 16px 20px; background: #111827; border-bottom: 1px solid rgba(255,255,255,.16); }}
    h1 {{ margin: 0 0 8px; font-size: 24px; }}
    header p {{ margin: 0; color: #cbd5e1; }}
    section {{ padding: 18px 20px 28px; border-bottom: 1px solid rgba(255,255,255,.14); }}
    h2 {{ margin: 0 0 14px; }}
    .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; }}
    article {{ background: #1f2937; border: 1px solid rgba(255,255,255,.16); border-radius: 8px; overflow: hidden; }}
    .spriteBox {{
      height: 175px; display: grid; place-items: center;
      background-color: #475569;
      background-image:
        linear-gradient(45deg, rgba(255,255,255,.16) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(255,255,255,.16) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(255,255,255,.16) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(255,255,255,.16) 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0;
    }}
    img {{ max-width: 96%; max-height: 165px; object-fit: contain; image-rendering: pixelated; }}
    h3 {{ margin: 8px 10px 6px; color: #fde68a; }}
    p {{ margin: 0 10px 6px; font-size: 12px; color: #dbeafe; }}
    .path {{ color: #a5b4fc; overflow-wrap: anywhere; padding-bottom: 8px; }}
  </style>
</head>
<body>
  <header>
    <h1>Wizard Adventures Sheet Component Crops</h1>
    <p>These are alpha-connected crop candidates from raw sheets. Use the ID/crop box for clean re-extraction instead of crowded grid slicing.</p>
  </header>
  {''.join(sections)}
</body>
</html>
"""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(doc, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract connected sprite crop candidates from raw sheets.")
    parser.add_argument("--padding", type=int, default=10)
    parser.add_argument("--alpha-threshold", type=int, default=16)
    parser.add_argument("--min-pixels", type=int, default=250)
    parser.add_argument("--out-dir", default="assets_candidates/sheet_components")
    parser.add_argument("--manifest", default="docs/sheet-components-manifest.json")
    parser.add_argument("--html", default="docs/sheet-components.html")
    args = parser.parse_args()

    sheets = [
        ROOT / "assets/raw/finn_spritesheet.png",
        ROOT / "assets/raw/nora_spritesheet.png",
        ROOT / "assets/raw/basic_enemies_sheet.png",
        ROOT / "assets/raw/advanced_enemies_owl_sheet.png",
    ]
    out_dir = ROOT / args.out_dir
    records_by_sheet: dict[str, list[dict]] = {}
    all_records: list[dict] = []
    for sheet in sheets:
        records = process_sheet(sheet, out_dir, args.alpha_threshold, args.min_pixels, args.padding)
        records_by_sheet[sheet.relative_to(ROOT).as_posix()] = records
        all_records.extend(records)

    manifest = {
        "padding": args.padding,
        "alpha_threshold": args.alpha_threshold,
        "min_pixels": args.min_pixels,
        "records": all_records,
    }
    manifest_path = ROOT / args.manifest
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    write_html(records_by_sheet, ROOT / args.html)
    print(f"Wrote {len(all_records)} component crops to {args.out_dir}.")
    print(f"Wrote {args.manifest}.")
    print(f"Wrote {args.html}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
