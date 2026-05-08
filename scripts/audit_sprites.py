#!/usr/bin/env python3
"""Audit Wizard Adventures sprite PNGs for crop and alignment issues.

This intentionally uses only the Python standard library so it can run on a
fresh Windows machine without Pillow or npm packages.
"""

from __future__ import annotations

import argparse
import json
import re
import struct
import sys
import zlib
from dataclasses import dataclass, asdict
from pathlib import Path
from statistics import median


PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


@dataclass
class SpriteAudit:
    path: str
    group: str
    width: int
    height: int
    bbox: tuple[int, int, int, int] | None
    content_width: int
    content_height: int
    margins: dict[str, int]
    center_x: float | None
    baseline_y: int | None
    opaque_pixels: int
    alpha_pixels: int
    edge_contacts: list[str]
    warnings: list[str]


def paeth(a: int, b: int, c: int) -> int:
    p = a + b - c
    pa = abs(p - a)
    pb = abs(p - b)
    pc = abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    if pb <= pc:
        return b
    return c


def read_png_rgba(path: Path) -> tuple[int, int, list[int]]:
    data = path.read_bytes()
    if not data.startswith(PNG_SIGNATURE):
        raise ValueError("not a PNG file")

    pos = len(PNG_SIGNATURE)
    width = height = bit_depth = color_type = None
    palette: list[tuple[int, int, int]] = []
    trans_palette: list[int] = []
    trans_rgb: tuple[int, int, int] | None = None
    compressed = bytearray()

    while pos < len(data):
      if pos + 8 > len(data):
          raise ValueError("truncated PNG chunk header")
      length = struct.unpack(">I", data[pos:pos + 4])[0]
      chunk_type = data[pos + 4:pos + 8]
      chunk_data = data[pos + 8:pos + 8 + length]
      pos += 12 + length

      if chunk_type == b"IHDR":
          width, height, bit_depth, color_type, compression, filter_method, interlace = struct.unpack(">IIBBBBB", chunk_data)
          if compression != 0 or filter_method != 0:
              raise ValueError("unsupported PNG compression/filter method")
          if interlace != 0:
              raise ValueError("interlaced PNGs are not supported")
          if bit_depth != 8:
              raise ValueError(f"unsupported bit depth {bit_depth}; expected 8")
      elif chunk_type == b"PLTE":
          palette = [tuple(chunk_data[i:i + 3]) for i in range(0, len(chunk_data), 3)]
      elif chunk_type == b"tRNS":
          if color_type == 3:
              trans_palette = list(chunk_data)
          elif color_type == 2 and len(chunk_data) >= 6:
              trans_rgb = tuple(v >> 8 for v in struct.unpack(">HHH", chunk_data[:6]))
      elif chunk_type == b"IDAT":
          compressed.extend(chunk_data)
      elif chunk_type == b"IEND":
          break

    if width is None or height is None or bit_depth is None or color_type is None:
        raise ValueError("missing IHDR")

    channels_by_type = {
        0: 1,  # grayscale
        2: 3,  # RGB
        3: 1,  # indexed color
        4: 2,  # grayscale + alpha
        6: 4,  # RGBA
    }
    if color_type not in channels_by_type:
        raise ValueError(f"unsupported color type {color_type}")

    channels = channels_by_type[color_type]
    stride = width * channels
    raw = zlib.decompress(bytes(compressed))
    expected = (stride + 1) * height
    if len(raw) < expected:
        raise ValueError("decompressed image data is shorter than expected")

    rows: list[bytearray] = []
    offset = 0
    prev = bytearray(stride)
    for _ in range(height):
        filter_type = raw[offset]
        offset += 1
        row = bytearray(raw[offset:offset + stride])
        offset += stride
        recon = bytearray(stride)
        for i, value in enumerate(row):
            left = recon[i - channels] if i >= channels else 0
            up = prev[i]
            up_left = prev[i - channels] if i >= channels else 0
            if filter_type == 0:
                out = value
            elif filter_type == 1:
                out = value + left
            elif filter_type == 2:
                out = value + up
            elif filter_type == 3:
                out = value + ((left + up) // 2)
            elif filter_type == 4:
                out = value + paeth(left, up, up_left)
            else:
                raise ValueError(f"unsupported PNG row filter {filter_type}")
            recon[i] = out & 0xff
        rows.append(recon)
        prev = recon

    rgba: list[int] = []
    for row in rows:
        for x in range(width):
            base = x * channels
            if color_type == 0:
                gray = row[base]
                rgba.extend((gray, gray, gray, 255))
            elif color_type == 2:
                r, g, b = row[base:base + 3]
                alpha = 0 if trans_rgb == (r, g, b) else 255
                rgba.extend((r, g, b, alpha))
            elif color_type == 3:
                idx = row[base]
                r, g, b = palette[idx] if idx < len(palette) else (0, 0, 0)
                alpha = trans_palette[idx] if idx < len(trans_palette) else 255
                rgba.extend((r, g, b, alpha))
            elif color_type == 4:
                gray, alpha = row[base:base + 2]
                rgba.extend((gray, gray, gray, alpha))
            elif color_type == 6:
                rgba.extend(row[base:base + 4])
    return width, height, rgba


def sprite_group(path: Path, root: Path) -> str:
    rel = path.relative_to(root).as_posix()
    parts = rel.split("/")
    if parts[0] == "assets" and len(parts) >= 4 and parts[1] == "characters":
        stem = path.stem
        match = re.match(r"^(baby|old|white)_([a-z]+)", stem)
        action = match.group(2) if match else stem
        return f"characters/{parts[2]}/{stem.split('_')[0]}/{action}"
    if parts[0] == "assets" and len(parts) >= 4 and parts[1] == "enemies":
        stem = path.stem
        action = re.sub(r"_\d+$", "", stem)
        return f"enemies/{parts[2]}/{action}"
    return "/".join(parts[:-1])


def audit_sprite(path: Path, root: Path, alpha_threshold: int) -> SpriteAudit:
    width, height, rgba = read_png_rgba(path)
    xs: list[int] = []
    ys: list[int] = []
    alpha_pixels = 0
    opaque_pixels = 0

    for y in range(height):
        for x in range(width):
            alpha = rgba[(y * width + x) * 4 + 3]
            if alpha > 0:
                alpha_pixels += 1
            if alpha >= alpha_threshold:
                opaque_pixels += 1
                xs.append(x)
                ys.append(y)

    rel = path.relative_to(root).as_posix()
    warnings: list[str] = []
    edge_contacts: list[str] = []
    if not xs:
        warnings.append("no opaque pixels found")
        return SpriteAudit(rel, sprite_group(path, root), width, height, None, 0, 0,
                           {"left": width, "right": width, "top": height, "bottom": height},
                           None, None, opaque_pixels, alpha_pixels, edge_contacts, warnings)

    left, right = min(xs), max(xs)
    top, bottom = min(ys), max(ys)
    margins = {
        "left": left,
        "right": width - 1 - right,
        "top": top,
        "bottom": height - 1 - bottom,
    }
    content_width = right - left + 1
    content_height = bottom - top + 1
    center_x = (left + right) / 2
    baseline_y = bottom

    for edge, margin in margins.items():
        if margin == 0:
            edge_contacts.append(edge)
            warnings.append(f"opaque pixels touch {edge} edge")
        elif margin <= 2:
            warnings.append(f"only {margin}px margin on {edge} edge")

    fill_ratio = opaque_pixels / (width * height)
    if alpha_pixels == width * height:
        warnings.append("no transparent pixels; likely full-frame crop, baked background, or missing alpha")
    if fill_ratio < 0.08:
        warnings.append(f"very sparse sprite content ({fill_ratio:.1%} opaque)")
    if margins["top"] > height * 0.35 or margins["bottom"] > height * 0.35:
        warnings.append("large vertical whitespace")
    if margins["left"] > width * 0.35 or margins["right"] > width * 0.35:
        warnings.append("large horizontal whitespace")

    return SpriteAudit(rel, sprite_group(path, root), width, height, (left, top, right, bottom),
                       content_width, content_height, margins, center_x, baseline_y,
                       opaque_pixels, alpha_pixels, edge_contacts, warnings)


def add_group_warnings(audits: list[SpriteAudit]) -> None:
    by_group: dict[str, list[SpriteAudit]] = {}
    for audit in audits:
        by_group.setdefault(audit.group, []).append(audit)

    for group, items in by_group.items():
        if len(items) < 2:
            continue
        widths = {item.width for item in items}
        heights = {item.height for item in items}
        if len(widths) > 1 or len(heights) > 1:
            for item in items:
                item.warnings.append(f"group canvas sizes differ: {sorted(widths)} x {sorted(heights)}")

        baselines = [item.baseline_y for item in items if item.baseline_y is not None]
        centers = [item.center_x for item in items if item.center_x is not None]
        if baselines:
            baseline_med = median(baselines)
            for item in items:
                if item.baseline_y is not None:
                    drift = item.baseline_y - baseline_med
                    if abs(drift) >= 4:
                        item.warnings.append(f"baseline differs from group median by {drift:+.1f}px")
        if centers:
            center_med = median(centers)
            for item in items:
                if item.center_x is not None:
                    drift = item.center_x - center_med
                    if abs(drift) >= 5:
                        item.warnings.append(f"horizontal center differs from group median by {drift:+.1f}px")


def severity(audit: SpriteAudit) -> str:
    if audit.edge_contacts:
        return "HIGH"
    if any("baseline differs" in w or "center differs" in w for w in audit.warnings):
        return "MEDIUM"
    if audit.warnings:
        return "LOW"
    return "OK"


def write_markdown(path: Path, audits: list[SpriteAudit]) -> None:
    counts = {"HIGH": 0, "MEDIUM": 0, "LOW": 0, "OK": 0}
    for audit in audits:
        counts[severity(audit)] += 1

    lines: list[str] = []
    lines.append("# Wizard Adventures Sprite Asset Audit")
    lines.append("")
    lines.append("Generated by `python scripts/audit_sprites.py`.")
    lines.append("")
    lines.append("This report flags measurable crop and alignment issues. It cannot prove that anatomy is artistically correct; frames with missing feet or body parts usually show up as edge-contact or tiny-margin warnings.")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append(f"- Files scanned: {len(audits)}")
    lines.append(f"- High priority: {counts['HIGH']}")
    lines.append(f"- Medium priority: {counts['MEDIUM']}")
    lines.append(f"- Low priority: {counts['LOW']}")
    lines.append(f"- No automatic warnings: {counts['OK']}")
    lines.append("")

    for level in ("HIGH", "MEDIUM", "LOW"):
        subset = [audit for audit in audits if severity(audit) == level]
        lines.append(f"## {level} Priority")
        lines.append("")
        if not subset:
            lines.append("None.")
            lines.append("")
            continue
        for audit in subset:
            margin_text = ", ".join(f"{k}:{v}" for k, v in audit.margins.items())
            bbox_text = audit.bbox if audit.bbox is not None else "none"
            image_ref = "../" + audit.path
            lines.append(f"### `{audit.path}`")
            lines.append("")
            lines.append(f"![{audit.path}]({image_ref})")
            lines.append("")
            lines.append(f"- Group: `{audit.group}`")
            lines.append(f"- Canvas: {audit.width}x{audit.height}")
            lines.append(f"- Opaque bounds: {bbox_text}")
            lines.append(f"- Margins: {margin_text}")
            lines.append("- Warnings:")
            for warning in audit.warnings:
                lines.append(f"  - {warning}")
            lines.append("")

    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit Wizard Adventures character and enemy sprites.")
    parser.add_argument("--root", default=".", help="Project root. Defaults to current directory.")
    parser.add_argument("--out", default="docs/asset-audit.md", help="Markdown report path.")
    parser.add_argument("--json-out", default="docs/asset-audit.json", help="JSON report path.")
    parser.add_argument("--alpha-threshold", type=int, default=16, help="Alpha threshold considered visible/opaque.")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    targets = [
        root / "assets" / "characters",
        root / "assets" / "enemies",
    ]
    files = sorted(path for target in targets if target.exists() for path in target.rglob("*.png"))
    audits: list[SpriteAudit] = []
    failures: list[tuple[str, str]] = []

    for file in files:
        try:
            audits.append(audit_sprite(file, root, args.alpha_threshold))
        except Exception as exc:  # Keep scanning so one bad PNG does not hide the rest.
            failures.append((file.relative_to(root).as_posix(), str(exc)))

    add_group_warnings(audits)

    out = root / args.out
    json_out = root / args.json_out
    out.parent.mkdir(parents=True, exist_ok=True)
    json_out.parent.mkdir(parents=True, exist_ok=True)
    write_markdown(out, audits)
    json_out.write_text(json.dumps({
        "files_scanned": len(audits),
        "failures": failures,
        "audits": [asdict(audit) | {"severity": severity(audit)} for audit in audits],
    }, indent=2), encoding="utf-8")

    print(f"Scanned {len(audits)} PNG files.")
    if failures:
        print(f"Failed to parse {len(failures)} files:")
        for file, reason in failures:
            print(f"  {file}: {reason}")
    high = sum(1 for audit in audits if severity(audit) == "HIGH")
    medium = sum(1 for audit in audits if severity(audit) == "MEDIUM")
    low = sum(1 for audit in audits if severity(audit) == "LOW")
    print(f"Warnings: {high} high, {medium} medium, {low} low.")
    print(f"Wrote {out.relative_to(root)}")
    print(f"Wrote {json_out.relative_to(root)}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
