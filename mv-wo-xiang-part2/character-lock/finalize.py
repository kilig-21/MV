"""Issue CODI-135: finalize the character reference sheet.

Input : native-alpha.png (extracted from docs/opuscar98.jpg)
Output: sheet.png, pixel-64@8x.png, pixel-48@10x.png, pixel-96@5x.png,
        mirror.png, feet-map.json, sheet.md
No body is redrawn. Only extraction, pixelation and measurement.
"""
from PIL import Image, ImageDraw
import numpy as np
from scipy import ndimage
import json, os

OUT = r"C:/Users/Lenovo/Desktop/ALLCODE/Anima/mv-wo-xiang-part2/character-lock"
native = Image.open(os.path.join(OUT, "native-alpha.png")).convert("RGBA")

def up(img, k):
    return img.resize((img.width * k, img.height * k), Image.NEAREST)

p48 = Image.open(os.path.join(OUT, "pixel-48.png")).convert("RGBA")
p64 = Image.open(os.path.join(OUT, "pixel-64.png")).convert("RGBA")
p96 = Image.open(os.path.join(OUT, "pixel-96.png")).convert("RGBA")

up(p48, 10).save(os.path.join(OUT, "pixel-48@10x.png"))
up(p64, 8).save(os.path.join(OUT, "pixel-64@8x.png"))
up(p96, 5).save(os.path.join(OUT, "pixel-96@5x.png"))

# Horizontal mirror is allowed: it changes no geometry, only handedness.
mirror = p64.transpose(Image.FLIP_LEFT_RIGHT)
up(mirror, 8).save(os.path.join(OUT, "pixel-64-mirror@8x.png"))

# Measure proportions on the native extraction.
a = np.asarray(native)
alpha = a[:, :, 3] > 0
ys, xs = np.where(alpha)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
w, h = x1 - x0 + 1, y1 - y0 + 1

# Eye geometry: near-black pixels inside the body.
rgb = a[:, :, :3].astype(int)
dark = (rgb[:, :, 0] < 60) & (rgb[:, :, 1] < 60) & (rgb[:, :, 2] < 60) & alpha
lab, n = ndimage.label(dark)
eyes = []
for i in range(1, n + 1):
    m = lab == i
    if 200 < m.sum() < 20000:
        yy, xx = np.where(m)
        eyes.append({
            "cx": round(float(xx.mean()), 1),
            "cy": round(float(yy.mean()), 1),
            "w": int(xx.max() - xx.min() + 1),
            "h": int(yy.max() - yy.min() + 1),
        })
eyes.sort(key=lambda e: e["cx"])

# Four feet: connected components in the lower region, separated from the body.
feet_zone = alpha.copy()
feet_zone[: int(h * 0.70)] = False
fl, fn = ndimage.label(feet_zone)
feet = []
for i in range(1, fn + 1):
    m = fl == i
    if m.sum() > 300:
        yy, xx = np.where(m)
        feet.append({
            "x0": int(xx.min()), "x1": int(xx.max()),
            "y0": int(yy.min()), "y1": int(yy.max()),
            "cx": round(float(xx.mean()), 1),
            "pixels": int(m.sum()),
        })
feet.sort(key=lambda f: f["x0"])

# Silhouette agreement between native and pixel-64.
def sil(img):
    aa = np.asarray(img)[:, :, 3] > 0
    return aa

nat_s = sil(native.resize(p64.size, Image.BOX))
pix_s = sil(p64)
inter = np.logical_and(nat_s, pix_s).sum()
union = np.logical_or(nat_s, pix_s).sum()
iou = inter / union if union else 0

# Palette used by the 64px asset.
colors = p64.getdata()
palette = {}
for r_, g_, b_, a_ in colors:
    if a_ > 0:
        key = "#%02x%02x%02x" % (r_, g_, b_)
        palette[key] = palette.get(key, 0) + 1
palette = sorted(((k, int(v)) for k, v in palette.items()), key=lambda kv: -kv[1])

info = {
    "source": "C:/Users/Lenovo/lemo-opuscar/docs/opuscar98.jpg",
    "native_px": [int(w), int(h)],
    "aspect_w_over_h": round(float(w) / float(h), 4),
    "eyes": eyes,
    "feet": feet,
    "pixel64_size": list(p64.size),
    "pixel64_silhouette_iou_vs_native": round(float(iou), 4),
    "pixel64_palette": palette,
    "allowed": [
        "整体平移",
        "整体旋转（不超过 8 度）",
        "整体缩放",
        "轻微挤压拉伸（不超过 8%）",
        "水平镜像",
        "四只脚在原地上下小幅位移",
        "眼睛局部像素替换（不改变眼睛尺寸与位置）",
    ],
    "forbidden": [
        "重画身体轮廓",
        "增加肘、膝、手掌、鞋",
        "拉长短臂或短脚",
        "改变宽高比",
        "新增侧面或背面结构",
    ],
}
with open(os.path.join(OUT, "character.json"), "w", encoding="utf-8") as f:
    json.dump(info, f, ensure_ascii=False, indent=2)

# Sheet.
S = 3
cell = 620
rows = 2
sheet = Image.new("RGB", (cell * 2, 700 * rows + 60), (16, 25, 40))
d = ImageDraw.Draw(sheet)

def put(img, idx, row, label, limit=(520, 520)):
    im2 = img.copy()
    im2.thumbnail(limit, Image.NEAREST)
    x = (idx % 2) * cell + (cell - im2.width) // 2
    y = row * 700 + 50 + (520 - im2.height) // 2
    sheet.paste(im2, (x, y), im2)
    d.text(((idx % 2) * cell + 14, row * 700 + 10), label, fill=(235, 225, 190))

put(native, 0, 0, "native extraction (3/4 front, the only angle available)")
put(up(p48, 8), 1, 0, "pixel-48  (32 px tall, far shots)")
put(up(p64, 6), 0, 1, "pixel-64  (43 px tall, main)")
put(up(p96, 4), 1, 1, "pixel-96  (64 px tall, close-ups)")

# Silhouette overlay inset.
ov = Image.new("RGBA", p64.size, (0, 0, 0, 0))
ov_np = np.zeros((p64.height, p64.width, 4), dtype=np.uint8)
ov_np[nat_s, 0] = 240
ov_np[pix_s, 1] = 220
ov_np[np.logical_and(nat_s, pix_s), 2] = 120
ov_np[..., 3] = 255
ov = Image.fromarray(ov_np, "RGBA")
ovb = ov.resize((ov.width * 8, ov.height * 8), Image.NEAREST)
sheet.paste(ovb, (cell + (cell - ovb.width) // 2, 700 + 50 + 180), ovb)
d.text((cell + 14, 700 + 10), f"silhouette overlay  red=native green=pixel64  IoU={iou:.3f}", fill=(235, 225, 190))

sheet.save(os.path.join(OUT, "sheet.png"))

print(json.dumps({
    "native": [int(w), int(h)],
    "aspect": round(w / h, 4),
    "eyes": eyes,
    "feet_count": int(len(feet)),
    "feet": feet,
    "iou": round(float(iou), 4),
    "palette": palette[:14],
}, ensure_ascii=False, indent=2))