#!/usr/bin/env python3
"""Clean extracted character crops and install them into live assets.

The source sheets have a baked checkerboard background. This script removes
background-like pixels that are connected to the crop border, preserving bright
character pixels that are enclosed by outlines/clothing details.
"""

from __future__ import annotations

import argparse
import json
import shutil
import struct
import sys
import zlib
from collections import deque
from datetime import datetime
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


def is_background_like(r: int, g: int, b: int) -> bool:
    # Baked checkerboard background is very bright, low saturation, and nearly neutral.
    mx = max(r, g, b)
    mn = min(r, g, b)
    return mx >= 218 and (mx - mn) <= 22


def remove_border_background(width: int, height: int, rgba: list[int]) -> list[int]:
    out = rgba[:]
    seen = bytearray(width * height)
    q: deque[int] = deque()

    def enqueue(idx: int) -> None:
        if seen[idx]:
            return
        r, g, b, a = out[idx * 4:idx * 4 + 4]
        if a > 0 and is_background_like(r, g, b):
            seen[idx] = 1
            q.append(idx)

    for x in range(width):
        enqueue(x)
        enqueue((height - 1) * width + x)
    for y in range(height):
        enqueue(y * width)
        enqueue(y * width + width - 1)

    removed = bytearray(width * height)
    while q:
        idx = q.popleft()
        removed[idx] = 1
        x = idx % width
        y = idx // width
        neighbors = []
        if x > 0:
            neighbors.append(idx - 1)
        if x < width - 1:
            neighbors.append(idx + 1)
        if y > 0:
            neighbors.append(idx - width)
        if y < height - 1:
            neighbors.append(idx + width)
        for n in neighbors:
            enqueue(n)

    # Transparent background plus a small soft edge for fringe pixels directly
    # adjacent to removed background.
    for idx, value in enumerate(removed):
        if value:
            out[idx * 4 + 3] = 0

    for y in range(height):
        for x in range(width):
            idx = y * width + x
            if removed[idx]:
                continue
            r, g, b, a = out[idx * 4:idx * 4 + 4]
            if a == 0:
                continue
            near_removed = False
            for ny in range(max(0, y - 1), min(height, y + 2)):
                for nx in range(max(0, x - 1), min(width, x + 2)):
                    if removed[ny * width + nx]:
                        near_removed = True
                        break
                if near_removed:
                    break
            if near_removed and is_background_like(r, g, b):
                out[idx * 4 + 3] = min(a, 60)
    return out


def trim_transparent(width: int, height: int, rgba: list[int], padding: int) -> tuple[int, int, list[int]]:
    xs: list[int] = []
    ys: list[int] = []
    for y in range(height):
        for x in range(width):
            if rgba[(y * width + x) * 4 + 3] > 12:
                xs.append(x)
                ys.append(y)
    if not xs:
        return width, height, rgba
    left = max(0, min(xs) - padding)
    right = min(width - 1, max(xs) + padding)
    top = max(0, min(ys) - padding)
    bottom = min(height - 1, max(ys) + padding)
    out_w = right - left + 1
    out_h = bottom - top + 1
    out = [0] * (out_w * out_h * 4)
    for row in range(out_h):
        src = ((top + row) * width + left) * 4
        dst = row * out_w * 4
        out[dst:dst + out_w * 4] = rgba[src:src + out_w * 4]
    return out_w, out_h, out


def add_canvas_padding(width: int, height: int, rgba: list[int], padding: int) -> tuple[int, int, list[int]]:
    if padding <= 0:
        return width, height, rgba
    out_w = width + padding * 2
    out_h = height + padding * 2
    out = [0] * (out_w * out_h * 4)
    for row in range(height):
        src = row * width * 4
        dst = ((row + padding) * out_w + padding) * 4
        out[dst:dst + width * 4] = rgba[src:src + width * 4]
    return out_w, out_h, out


def main() -> int:
    parser = argparse.ArgumentParser(description="Clean and install character crop candidates.")
    parser.add_argument("--manifest", default="docs/character-crops-manifest.json")
    parser.add_argument("--clean-root", default="assets_candidates/character_crops_clean")
    parser.add_argument("--backup-root", default=None)
    parser.add_argument("--install", action="store_true", help="Replace live assets after writing clean candidates.")
    parser.add_argument("--trim-padding", type=int, default=8)
    parser.add_argument("--final-padding", type=int, default=12)
    args = parser.parse_args()

    manifest = json.loads((ROOT / args.manifest).read_text(encoding="utf-8"))
    clean_root = ROOT / args.clean_root
    backup_root = ROOT / (args.backup_root or f"assets_backup/characters_before_recrop_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
    records = []

    for item in manifest["files"]:
        candidate = ROOT / item["candidate"]
        target = ROOT / item["target"]
        width, height, rgba = audit_sprites.read_png_rgba(candidate)
        cleaned = remove_border_background(width, height, rgba)
        out_w, out_h, cleaned = trim_transparent(width, height, cleaned, args.trim_padding)
        out_w, out_h, cleaned = add_canvas_padding(out_w, out_h, cleaned, args.final_padding)
        clean_path = clean_root / item["target"]
        write_png_rgba(clean_path, out_w, out_h, cleaned)

        record = dict(item)
        record["clean_candidate"] = clean_path.relative_to(ROOT).as_posix()
        record["clean_size"] = [out_w, out_h]
        records.append(record)

        if args.install:
            backup_path = backup_root / item["target"]
            backup_path.parent.mkdir(parents=True, exist_ok=True)
            if target.exists() and not backup_path.exists():
                shutil.copy2(target, backup_path)
            shutil.copy2(clean_path, target)

    out_manifest = ROOT / "docs/character-crops-clean-manifest.json"
    out_manifest.write_text(json.dumps({
        "clean_root": args.clean_root,
        "installed": args.install,
        "backup_root": backup_root.relative_to(ROOT).as_posix() if args.install else None,
        "files": records,
    }, indent=2), encoding="utf-8")

    print(f"Wrote {len(records)} cleaned PNGs to {args.clean_root}.")
    if args.install:
        print(f"Backed up original character assets to {backup_root.relative_to(ROOT).as_posix()}.")
        print("Installed cleaned character crops into live assets.")
    print("Wrote docs/character-crops-clean-manifest.json.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
