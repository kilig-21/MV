#!/usr/bin/env python
"""Make context-friendly copies of renders/frames before reading them.

Read tool inlines an entire image as base64; 40+ full-size PNG frames will
blow past the 16 MiB request-body limit. This produces small JPEG copies
(or one contact sheet) so a whole shot can be inspected in one read.

    python tools/view-image.py frame.png
    python tools/view-image.py out/*.png --max 640
    python tools/view-image.py out/*.png --grid 4x3 --max 1400
"""
import argparse
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUTDIR = Path(__file__).resolve().parent.parent / ".cache" / "view"


def trim_bars(im, frac=0.5):
    """Crop letterbox bars: keep the band where most pixels are coloured or bright.

    Phone screenshots of video players have UI glyphs scattered over the bars and
    the bars are often dark blue-grey rather than pure black, so score by chroma
    (artwork is saturated) with a luma escape hatch for white/paper areas.
    """
    rgb = im.convert("RGB")
    w, h = rgb.size
    px = rgb.load()
    step_x = max(1, w // 160)
    step_y = max(1, h // 160)
    xs = range(0, w, step_x)
    ys = range(0, h, step_y)

    def content(p):
        r, g, b = p
        return (max(r, g, b) - min(r, g, b)) > 30 or (r + g + b) / 3 > 120

    def row_ok(y):
        vals = [content(px[x, y]) for x in xs]
        return sum(vals) / len(vals) > frac

    def col_ok(x):
        vals = [content(px[x, y]) for y in ys]
        return sum(vals) / len(vals) > frac

    top = next((y for y in ys if row_ok(y)), 0)
    bottom = next((y for y in reversed(list(ys)) if row_ok(y)), h - 1)
    left = next((x for x in xs if col_ok(x)), 0)
    right = next((x for x in reversed(list(xs)) if col_ok(x)), w - 1)
    if (top, left, bottom, right) != (0, 0, h - 1, w - 1):
        im = im.crop((left, top, right + 1, bottom + 1))
    return im


def load(path, max_side, bg, width=None, trim=False):
    im = Image.open(path)
    im.load()
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        flat = Image.new("RGB", im.size, bg)
        flat.paste(im, mask=im.split()[-1])
        im = flat
    else:
        im = im.convert("RGB")
    if trim:
        im = trim_bars(im)
    if width:
        if im.width > width:
            im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    else:
        im.thumbnail((max_side, max_side), Image.LANCZOS)
    return im


def save(im, dest, quality):
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=quality, optimize=True, progressive=True)
    return dest.stat().st_size / 1024


def font(size):
    try:
        return ImageFont.load_default(size=size)
    except TypeError:  # Pillow < 10 has no sized default font
        return ImageFont.load_default()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("images", nargs="+", type=Path)
    ap.add_argument("--max", type=int, default=768, help="longest side in px (default 768)")
    ap.add_argument("--width", type=int, help="scale to this width instead (better for tall images)")
    ap.add_argument("--trim", action="store_true", help="crop black letterbox bars first")
    ap.add_argument("--quality", type=int, default=80, help="JPEG quality (default 80)")
    ap.add_argument("--grid", metavar="COLSxROWS", help="tile all inputs into one contact sheet")
    ap.add_argument("--bg", default="#ffffff", help="background for transparent pixels")
    ap.add_argument("--outdir", type=Path, default=OUTDIR)
    args = ap.parse_args()

    missing = [p for p in args.images if not p.is_file()]
    if missing:
        sys.exit("not found: " + ", ".join(str(p) for p in missing))

    if args.grid:
        try:
            cols, rows = (int(v) for v in args.grid.lower().split("x"))
        except ValueError:
            sys.exit("--grid expects COLSxROWS, e.g. 4x3")
        if cols * rows < len(args.images):
            sys.exit(f"grid {cols}x{rows} holds {cols * rows} cells, got {len(args.images)} images")
        cell = args.max // max(cols, rows)
        pad, label_h = 6, 18
        cw, ch = cell, cell + label_h
        sheet = Image.new("RGB", (cols * cw, rows * ch), args.bg)
        draw = ImageDraw.Draw(sheet)
        fnt = font(14)
        for i, path in enumerate(args.images):
            im = load(path, cell - pad, args.bg)
            cx, cy = i % cols, i // cols
            x = cx * cw + (cw - im.width) // 2
            y = cy * ch + label_h
            sheet.paste(im, (x, y))
            draw.text((cx * cw + 4, cy * ch + 2), f"{i + 1}:{path.stem}", fill="#333333", font=fnt)
        dest = args.outdir / f"sheet-{len(args.images)}-{cols}x{rows}.jpg"
        kb = save(sheet, dest, args.quality)
        print(f"{len(args.images)} images -> {dest} ({sheet.width}x{sheet.height}, {kb:.0f} KB)")
        return

    for path in args.images:
        im = load(path, args.max, args.bg, args.width, args.trim)
        tag = (f"w{args.width}" if args.width else str(args.max)) + ("-trim" if args.trim else "")
        dest = args.outdir / (path.stem + f"-{tag}.jpg")
        before = path.stat().st_size / 1024
        kb = save(im, dest, args.quality)
        print(f"{path.name}: {before:.0f} KB -> {dest} ({im.width}x{im.height}, {kb:.0f} KB)")


if __name__ == "__main__":
    main()