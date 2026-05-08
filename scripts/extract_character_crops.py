#!/usr/bin/env python3
"""Extract character frames from explicit crop-plan coordinates.

This writes review candidates only. It does not overwrite live assets.
"""

from __future__ import annotations

import argparse
import json
import struct
import sys
import zlib
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


def crop_rgba(source_w: int, source_h: int, rgba: list[int], rect: list[int]) -> tuple[int, int, list[int]]:
    x, y, w, h = [int(v) for v in rect]
    x = max(0, min(source_w - 1, x))
    y = max(0, min(source_h - 1, y))
    w = max(1, min(source_w - x, w))
    h = max(1, min(source_h - y, h))
    out = [0] * (w * h * 4)
    for row in range(h):
        src_start = ((y + row) * source_w + x) * 4
        dst_start = row * w * 4
        out[dst_start:dst_start + w * 4] = rgba[src_start:src_start + w * 4]
    return w, h, out


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract character crops from crop-plan JSON.")
    parser.add_argument("--plan", default="docs/crop-plan-character-sheets.json")
    parser.add_argument("--out-root", default="assets_candidates/character_crops")
    parser.add_argument("--manifest", default="docs/character-crops-manifest.json")
    args = parser.parse_args()

    plan_path = ROOT / args.plan
    plan = json.loads(plan_path.read_text(encoding="utf-8"))
    out_root = ROOT / args.out_root
    manifest: list[dict] = []

    for sheet, info in plan["sheets"].items():
        sheet_path = ROOT / sheet
        source_w, source_h, rgba = audit_sprites.read_png_rgba(sheet_path)
        for target, rect in info["targets"].items():
            w, h, crop = crop_rgba(source_w, source_h, rgba, rect)
            out_path = out_root / target
            write_png_rgba(out_path, w, h, crop)
            manifest.append({
                "sheet": sheet,
                "target": target,
                "candidate": out_path.relative_to(ROOT).as_posix(),
                "crop": rect,
                "size": [w, h],
            })

    manifest_path = ROOT / args.manifest
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps({
        "plan": args.plan,
        "out_root": args.out_root,
        "files": manifest,
    }, indent=2), encoding="utf-8")
    print(f"Wrote {len(manifest)} character crop candidates to {args.out_root}.")
    print(f"Wrote {args.manifest}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
