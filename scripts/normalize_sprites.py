#!/usr/bin/env python3
"""Create normalized, padded copies of character and enemy sprites.

The live assets are not overwritten. Output is written to assets_normalized/
with the same relative paths as the original assets.
"""

from __future__ import annotations

import argparse
import json
import struct
import sys
import zlib
from dataclasses import asdict
from pathlib import Path

import audit_sprites


def write_png_rgba(path: Path, width: int, height: int, rgba: list[int]) -> None:
    def chunk(kind: bytes, data: bytes) -> bytes:
        crc = zlib.crc32(kind)
        crc = zlib.crc32(data, crc) & 0xffffffff
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", crc)

    raw = bytearray()
    stride = width * 4
    for y in range(height):
        raw.append(0)  # PNG filter type 0.
        start = y * stride
        raw.extend(rgba[start:start + stride])

    png = bytearray()
    png.extend(audit_sprites.PNG_SIGNATURE)
    png.extend(chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)))
    png.extend(chunk(b"IDAT", zlib.compress(bytes(raw), level=9)))
    png.extend(chunk(b"IEND", b""))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(bytes(png))


def transparent_canvas(width: int, height: int) -> list[int]:
    return [0] * (width * height * 4)


def paste_crop(
    canvas: list[int],
    canvas_w: int,
    source: list[int],
    source_w: int,
    bbox: tuple[int, int, int, int],
    dest_x: int,
    dest_y: int,
) -> None:
    left, top, right, bottom = bbox
    crop_w = right - left + 1
    crop_h = bottom - top + 1
    for y in range(crop_h):
        src_start = ((top + y) * source_w + left) * 4
        dst_start = ((dest_y + y) * canvas_w + dest_x) * 4
        canvas[dst_start:dst_start + crop_w * 4] = source[src_start:src_start + crop_w * 4]


def group_audits(root: Path, alpha_threshold: int) -> dict[str, list[audit_sprites.SpriteAudit]]:
    targets = [
        root / "assets" / "characters",
        root / "assets" / "enemies",
    ]
    files = sorted(path for target in targets if target.exists() for path in target.rglob("*.png"))
    audits = [audit_sprites.audit_sprite(path, root, alpha_threshold) for path in files]
    audit_sprites.add_group_warnings(audits)
    grouped: dict[str, list[audit_sprites.SpriteAudit]] = {}
    for audit in audits:
        grouped.setdefault(audit.group, []).append(audit)
    return grouped


def normalize(root: Path, out_root: Path, padding: int, alpha_threshold: int) -> list[dict]:
    grouped = group_audits(root, alpha_threshold)
    manifest: list[dict] = []

    for group, items in sorted(grouped.items()):
        visible_items = [item for item in items if item.bbox is not None]
        if not visible_items:
            continue

        max_content_w = max(item.content_width for item in visible_items)
        max_content_h = max(item.content_height for item in visible_items)
        target_w = max_content_w + padding * 2
        target_h = max_content_h + padding * 2
        target_center_x = target_w / 2
        target_baseline_y = padding + max_content_h - 1

        for item in items:
            source_path = root / item.path
            rel_out = Path(item.path)
            dest_path = out_root / rel_out
            source_w, source_h, rgba = audit_sprites.read_png_rgba(source_path)

            if item.bbox is None:
                canvas = transparent_canvas(target_w, target_h)
                write_png_rgba(dest_path, target_w, target_h, canvas)
                manifest.append({
                    "path": item.path,
                    "group": group,
                    "source_canvas": [source_w, source_h],
                    "output_canvas": [target_w, target_h],
                    "action": "wrote empty transparent canvas because no visible pixels were found",
                })
                continue

            crop_w = item.content_width
            crop_h = item.content_height
            dest_x = round(target_center_x - crop_w / 2)
            dest_y = target_baseline_y - crop_h + 1
            dest_x = max(0, min(target_w - crop_w, dest_x))
            dest_y = max(0, min(target_h - crop_h, dest_y))

            canvas = transparent_canvas(target_w, target_h)
            paste_crop(canvas, target_w, rgba, source_w, item.bbox, dest_x, dest_y)
            write_png_rgba(dest_path, target_w, target_h, canvas)

            manifest.append({
                "path": item.path,
                "group": group,
                "source_canvas": [source_w, source_h],
                "source_bounds": list(item.bbox),
                "output_canvas": [target_w, target_h],
                "placed_at": [dest_x, dest_y],
                "padding": padding,
                "edge_contacts_before": item.edge_contacts,
                "warnings_before": item.warnings,
            })

    return manifest


def write_report(path: Path, manifest: list[dict], out_root: Path) -> None:
    changed_size = [m for m in manifest if m["source_canvas"] != m["output_canvas"]]
    edge_risk = [m for m in manifest if m.get("edge_contacts_before")]

    lines: list[str] = []
    lines.append("# Wizard Adventures Normalized Sprite Copies")
    lines.append("")
    lines.append("Generated by `python scripts/normalize_sprites.py`.")
    lines.append("")
    lines.append("These are non-destructive copies. The live game still uses `assets/` until references are intentionally changed or files are manually replaced.")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append(f"- Output folder: `{out_root.as_posix()}`")
    lines.append(f"- Files written: {len(manifest)}")
    lines.append(f"- Canvas size changed: {len(changed_size)}")
    lines.append(f"- Had edge-contact risk before normalization: {len(edge_risk)}")
    lines.append("")
    lines.append("## Review Notes")
    lines.append("")
    lines.append("- This pass adds transparent breathing room and normalizes animation groups to shared canvas sizes.")
    lines.append("- It can reduce visual jitter and prevent further clipping in rendering.")
    lines.append("- It cannot restore missing feet, hands, hats, or body parts if those pixels were already absent from the source PNG.")
    lines.append("- Review the normalized images before replacing any live asset.")
    lines.append("")
    lines.append("## High-Risk Frames To Visually Review")
    lines.append("")
    if not edge_risk:
        lines.append("None.")
    for item in edge_risk:
        normalized_ref = "../" + (out_root / item["path"]).as_posix()
        original_ref = "../" + item["path"]
        lines.append(f"### `{item['path']}`")
        lines.append("")
        lines.append(f"Original: ![]({original_ref})")
        lines.append("")
        lines.append(f"Normalized: ![]({normalized_ref})")
        lines.append("")
        lines.append(f"- Group: `{item['group']}`")
        lines.append(f"- Source canvas: {item['source_canvas'][0]}x{item['source_canvas'][1]}")
        lines.append(f"- Output canvas: {item['output_canvas'][0]}x{item['output_canvas'][1]}")
        lines.append(f"- Edge contacts before: {', '.join(item['edge_contacts_before'])}")
        lines.append("")

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Create normalized, padded sprite copies.")
    parser.add_argument("--root", default=".", help="Project root. Defaults to current directory.")
    parser.add_argument("--out-root", default="assets_normalized", help="Output folder for normalized copies.")
    parser.add_argument("--padding", type=int, default=12, help="Transparent padding around the largest frame in each group.")
    parser.add_argument("--alpha-threshold", type=int, default=16, help="Alpha threshold considered visible/opaque.")
    parser.add_argument("--manifest", default="docs/normalized-sprites-manifest.json", help="JSON manifest path.")
    parser.add_argument("--report", default="docs/normalized-sprites.md", help="Markdown review report path.")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    out_root = root / args.out_root
    manifest = normalize(root, out_root, args.padding, args.alpha_threshold)

    manifest_path = root / args.manifest
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps({
        "output_root": args.out_root,
        "padding": args.padding,
        "files": manifest,
    }, indent=2), encoding="utf-8")

    write_report(root / args.report, manifest, Path(args.out_root))

    print(f"Wrote {len(manifest)} normalized PNG files to {args.out_root}.")
    print(f"Wrote {args.manifest}.")
    print(f"Wrote {args.report}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
