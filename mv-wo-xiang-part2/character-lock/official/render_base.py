"""Render the official Clawd on Desk base SVG (15x16 pixel grid) exactly.

Source: D:/Coding/tmp/clawd-asar-extract/assets/svg/clawd-static-base.svg
The SVG is a pixel-grid drawing made of integer rects, so we can rasterise
it without a browser and without any anti-aliasing.
"""
import xml.etree.ElementTree as ET
from PIL import Image
import json, os

SRC = r"D:/Coding/tmp/clawd-asar-extract/assets/svg/clawd-static-base.svg"
OUT = r"C:/Users/Lenovo/Desktop/ALLCODE/Anima/mv-wo-xiang-part2/character-lock/official"
os.makedirs(OUT, exist_ok=True)

NS = "{http://www.w3.org/2000/svg}"
tree = ET.parse(SRC)
root = tree.getroot()
W, H = 15, 16

def hex_rgba(fill, opacity):
    fill = (fill or "#000000").lstrip("#")
    if len(fill) == 3:
        fill = "".join(c * 2 for c in fill)
    r, g, b = int(fill[0:2], 16), int(fill[2:4], 16), int(fill[4:6], 16)
    a = int(255 * float(opacity))
    return (r, g, b, a)

def walk(node, inherited_fill, inherited_opacity, parts):
    fill = node.get("fill", inherited_fill)
    opacity = node.get("opacity", inherited_opacity)
    if node.tag == NS + "rect":
        x = float(node.get("x", 0)); y = float(node.get("y", 0))
        w = float(node.get("width", 0)); h = float(node.get("height", 0))
        parts.append((x, y, w, h, hex_rgba(fill, opacity), node.get("id", "")))
    for child in node:
        walk(child, fill, opacity, parts)

parts = []
walk(root, "#000000", "1", parts)

img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
px = img.load()
for x, y, w, h, col, _ in parts:
    for yy in range(int(round(y)), int(round(y + h))):
        for xx in range(int(round(x)), int(round(x + w))):
            if 0 <= xx < W and 0 <= yy < H:
                # simple source-over
                r, g, b, a = col
                if a == 255:
                    px[xx, yy] = (r, g, b, 255)
                else:
                    br, bg, bb, ba = px[xx, yy]
                    na = a + ba * (255 - a) // 255
                    if na:
                        px[xx, yy] = (
                            (r * a + br * ba * (255 - a) // 255) // na,
                            (g * a + bg * ba * (255 - a) // 255) // na,
                            (b * a + bb * ba * (255 - a) // 255) // na,
                            na,
                        )

img.save(os.path.join(OUT, "base-15x16.png"))

for k in (2, 4, 8, 16):
    img.resize((W * k, H * k), Image.NEAREST).save(os.path.join(OUT, f"base-{W*k}x{H*k}.png"))

# Preview on the MV night background.
prev = img.resize((W * 8, H * 8), Image.NEAREST)
bg = Image.new("RGBA", (prev.width + 32, prev.height + 32), (24, 43, 67, 255))
bg.alpha_composite(prev, (16, 16))
bg.convert("RGB").save(os.path.join(OUT, "base-preview.png"))

rig = {
    "source": "https://github.com/rullerzhou-afk/clawd-on-desk (AGPL-3.0) / assets/svg/clawd-static-base.svg",
    "viewBox": [0, 0, W, H],
    "body": "#DE886D",
    "parts": {p[5]: {"x": p[0], "y": p[1], "w": p[2], "h": p[3]} for p in parts if p[5]},
    "grip": {
        "left": {"x": 0, "y": 10},
        "right": {"x": 15, "y": 10}
    },
    "scales": {"native": [15, 16], "x4": [60, 64], "x8": [120, 128], "x16": [240, 256]}
}
with open(os.path.join(OUT, "rig.json"), "w", encoding="utf-8") as f:
    json.dump(rig, f, ensure_ascii=False, indent=2)

print("parts", len(parts))
for p in parts:
    print(p[5], p[0], p[1], p[2], p[3], p[4])