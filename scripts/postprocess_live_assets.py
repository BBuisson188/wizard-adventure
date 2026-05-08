#!/usr/bin/env python3
"""Polish live assets after crop extraction.

Fixes two gameplay-facing problems:
- Gameplay tiles should not carry broad transparent padding because it makes
  adjacent blocks look separated even though collision boxes touch.
- Character frames should be normalized per animation group so changing from
  idle to run does not visually scale or drift inside the game's fixed draw box.
"""

from __future__ import annotations

import argparse
import re
import shutil
import struct
import sys
import zlib
from datetime import datetime
from pathlib import Path
from statistics import median

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


def alpha_bbox(width: int, height: int, rgba: list[int], threshold: int = 16) -> tuple[int, int, int, int] | None:
    xs: list[int] = []
    ys: list[int] = []
    for y in range(height):
        for x in range(width):
            if rgba[(y * width + x) * 4 + 3] >= threshold:
                xs.append(x)
                ys.append(y)
    if not xs:
        return None
    return min(xs), min(ys), max(xs), max(ys)


def crop_to_bbox(width: int, height: int, rgba: list[int], bbox: tuple[int, int, int, int], padding: int) -> tuple[int, int, list[int]]:
    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(width - 1, right + padding)
    bottom = min(height - 1, bottom + padding)
    out_w = right - left + 1
    out_h = bottom - top + 1
    out = [0] * (out_w * out_h * 4)
    for row in range(out_h):
        src = ((top + row) * width + left) * 4
        dst = row * out_w * 4
        out[dst:dst + out_w * 4] = rgba[src:src + out_w * 4]
    return out_w, out_h, out


def paste_crop(canvas: list[int], canvas_w: int, source: list[int], source_w: int, bbox: tuple[int, int, int, int], dest_x: int, dest_y: int) -> None:
    left, top, right, bottom = bbox
    crop_w = right - left + 1
    crop_h = bottom - top + 1
    for row in range(crop_h):
        src = ((top + row) * source_w + left) * 4
        dst = ((dest_y + row) * canvas_w + dest_x) * 4
        canvas[dst:dst + crop_w * 4] = source[src:src + crop_w * 4]


def backup(paths: list[Path], backup_root: Path) -> None:
    for path in paths:
        rel = path.relative_to(ROOT)
        dest = backup_root / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        if path.exists() and not dest.exists():
            shutil.copy2(path, dest)


def tighten_tiles(tile_padding: int, backup_root: Path) -> int:
    tile_paths = sorted((ROOT / "assets" / "tiles").glob("*.png"))
    backup(tile_paths, backup_root)
    count = 0
    for path in tile_paths:
        width, height, rgba = audit_sprites.read_png_rgba(path)
        bbox = alpha_bbox(width, height, rgba)
        if not bbox:
            continue
        out_w, out_h, out = crop_to_bbox(width, height, rgba, bbox, tile_padding)
        write_png_rgba(path, out_w, out_h, out)
        count += 1
    return count


def character_group(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    parts = rel.split("/")
    stem = path.stem
    match = re.match(r"^(baby|old|white)_([a-z]+)", stem)
    form = match.group(1) if match else stem.split("_")[0]
    action = match.group(2) if match else stem
    return f"{parts[2]}/{form}/{action}"


def normalize_characters(frame_padding: int, backup_root: Path) -> int:
    char_paths = sorted((ROOT / "assets" / "characters").rglob("*.png"))
    backup(char_paths, backup_root)

    groups: dict[str, list[Path]] = {}
    for path in char_paths:
        groups.setdefault(character_group(path), []).append(path)

    count = 0
    for paths in groups.values():
        frames = []
        for path in paths:
            width, height, rgba = audit_sprites.read_png_rgba(path)
            bbox = alpha_bbox(width, height, rgba)
            if bbox:
                left, top, right, bottom = bbox
                frames.append({
                    "path": path,
                    "width": width,
                    "height": height,
                    "rgba": rgba,
                    "bbox": bbox,
                    "content_w": right - left + 1,
                    "content_h": bottom - top + 1,
                    "center": (left + right) / 2,
                    "baseline": bottom,
                })
        if not frames:
            continue

        target_w = max(f["content_w"] for f in frames) + frame_padding * 2
        target_h = max(f["content_h"] for f in frames) + frame_padding * 2
        target_center = target_w / 2
        target_baseline = target_h - frame_padding - 1

        for f in frames:
            canvas = [0] * (target_w * target_h * 4)
            dest_x = round(target_center - f["content_w"] / 2)
            dest_y = round(target_baseline - f["content_h"] + 1)
            dest_x = max(0, min(target_w - f["content_w"], dest_x))
            dest_y = max(0, min(target_h - f["content_h"], dest_y))
            paste_crop(canvas, target_w, f["rgba"], f["width"], f["bbox"], dest_x, dest_y)
            write_png_rgba(f["path"], target_w, target_h, canvas)
            count += 1
    return count


def main() -> int:
    parser = argparse.ArgumentParser(description="Post-process live tile and character assets.")
    parser.add_argument("--tile-padding", type=int, default=1)
    parser.add_argument("--character-padding", type=int, default=16)
    parser.add_argument("--backup-root", default=None)
    args = parser.parse_args()

    backup_root = ROOT / (args.backup_root or f"assets_backup/postprocess_live_assets_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
    tile_count = tighten_tiles(args.tile_padding, backup_root)
    character_count = normalize_characters(args.character_padding, backup_root)
    print(f"Tightened {tile_count} tile PNGs.")
    print(f"Normalized {character_count} character PNGs.")
    print(f"Backups written to {backup_root.relative_to(ROOT).as_posix()}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
