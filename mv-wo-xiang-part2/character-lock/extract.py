"""Issue CODI-135: extract native Clawd from the style library render.

Source of truth: C:/Users/Lenovo/lemo-opuscar/docs/opuscar98.jpg
Only extraction, cropping and pixelation. The body is never redrawn.
"""
from PIL import Image, ImageDraw
import numpy as np
from scipy import ndimage
import os

SRC = r"C:/Users/Lenovo/lemo-opuscar/docs/opuscar98.jpg"
OUT = r"C:/Users/Lenovo/Desktop/ALLCODE/Anima/mv-wo-xiang-part2/character-lock"
os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(np.int16)
r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]

# Character is warm orange against a dark stage.
mask = (r > 80) & (r > g + 20) & (g > b + 6) & (r > b + 30)
lab, n = ndimage.label(mask)
sizes = ndimage.sum(mask, lab, range(1, n + 1))
mask = lab == (int(np.argmax(sizes)) + 1)

# Below the body, the lit floor is warm enough to pass the loose threshold.
# Use a stricter orange test there so the four feet separate from the floor.
ys, xs = np.where(mask)
y_top, y_bot = ys.min(), ys.max()
lower_from = y_top + int((y_bot - y_top) * 0.70)
strict = (r > 120) & (r - g > 45) & (r - b > 55)
mask[lower_from:, :] &= strict[lower_from:, :]

mask = ndimage.binary_closing(mask, structure=np.ones((3, 3)), iterations=1)

# Fill only small holes: the two black eyes. Do NOT fill the large gap
# between the feet, which would swallow the floor into the sprite.
filled = ndimage.binary_fill_holes(mask)
holes = filled & ~mask
hl, hn = ndimage.label(holes)
for i in range(1, hn + 1):
    h = hl == i
    if h.sum() < 8000:
        mask |= h

# The floor strip under the feet is part of the same warm component.
# Cut it at the row where the four feet end; keep only narrow foot columns
# below that row.
ys, xs = np.where(mask)
y_top, y_bot = ys.min(), ys.max()
CUT = y_bot - 14
for y in range(CUT, y_bot + 1):
    row = np.where(mask[y])[0]
    if len(row) == 0:
        continue
    # Drop wide floor runs in the lower strip, keep foot-sized runs.
    runs = np.split(row, np.where(np.diff(row) > 1)[0] + 1)
    keep = np.zeros_like(mask[y])
    for run in runs:
        if len(run) <= 70:
            keep[run] = True
    mask[y] = keep

ys, xs = np.where(mask)
x0, x1 = max(0, xs.min() - 12), min(im.width, xs.max() + 13)
y0, y1 = max(0, ys.min() - 12), min(im.height, ys.max() + 13)

rgb_crop = im.crop((x0, y0, x1, y1))
alpha_crop = (mask[y0:y1, x0:x1] * 255).astype(np.uint8)
rgba = rgb_crop.convert("RGBA")
rgba.putalpha(Image.fromarray(alpha_crop, "L"))
bb = rgba.getbbox()
rgba = rgba.crop(bb)
rgb_crop = rgb_crop.crop((bb[0], bb[1], bb[2], bb[3]))
rgba.save(os.path.join(OUT, "native-alpha.png"))
rgb_crop.save(os.path.join(OUT, "native-crop.png"))

PALETTE = 14
candidates = {"pixel-48": 32, "pixel-64": 43, "pixel-96": 64}
previews = {}

def smooth_top(al, H, W):
    """Flatten the 1-2 px highlight nubs on the body's top edge.

    Only columns whose top edge is within the top 15% are touched, so the
    arms and the rounded corners keep their real silhouette.
    """
    top = np.full(W, H, dtype=int)
    for x in range(W):
        ys = np.where(al[:, x] > 0)[0]
        if len(ys):
            top[x] = ys[0]
    idx = np.where(top < H * 0.15)[0]
    if len(idx):
        med = ndimage.median_filter(top[idx], size=7, mode="nearest")
        for x, t in zip(idx, med):
            al[: int(t), x] = 0
    return al
for name, th in candidates.items():
    tw = max(1, round(th * rgba.width / rgba.height))
    small = rgba.resize((tw, th), Image.BOX)
    rgb = small.convert("RGB").quantize(colors=PALETTE, method=Image.MEDIANCUT, dither=Image.NONE).convert("RGB")
    out = rgb.convert("RGBA")
    al = np.array(small.getchannel("A").point(lambda v: 255 if v >= 110 else 0))
    al = smooth_top(al, out.height, out.width)
    out.putalpha(Image.fromarray(al, "L"))
    out.save(os.path.join(OUT, f"{name}.png"))
    previews[name] = out

sil = rgba.resize((round(64 * rgba.width / rgba.height), 64), Image.BOX)
sil_a = sil.getchannel("A").point(lambda v: 255 if v >= 110 else 0)
sil_img = Image.new("RGBA", sil.size, (0, 0, 0, 0))
sil_img.putalpha(sil_a)
sil_img.resize((sil.width * 8, sil.height * 8), Image.NEAREST).save(os.path.join(OUT, "silhouette-8x.png"))

pad = 24
cell_w = 520
cell_h = 560
sheet = Image.new("RGB", (cell_w * 4, cell_h + pad), (18, 27, 43))
d = ImageDraw.Draw(sheet)

def place(img, idx, label, limit=(460, 460)):
    im2 = img.copy()
    im2.thumbnail(limit, Image.NEAREST)
    x = idx * cell_w + (cell_w - im2.width) // 2
    y = pad + (460 - im2.height) // 2
    sheet.paste(im2, (x, y), im2 if im2.mode == "RGBA" else None)
    d.text((idx * cell_w + 16, 6), label, fill=(230, 220, 190))

place(rgba, 0, "native alpha (extracted)")
place(previews["pixel-48"].resize((previews["pixel-48"].width * 8, previews["pixel-48"].height * 8), Image.NEAREST), 1, "pixel-48 (32px tall)")
place(previews["pixel-64"].resize((previews["pixel-64"].width * 8, previews["pixel-64"].height * 8), Image.NEAREST), 2, "pixel-64 (43px tall)")
place(previews["pixel-96"].resize((previews["pixel-96"].width * 4, previews["pixel-96"].height * 4), Image.NEAREST), 3, "pixel-96 (64px tall)")
sheet.save(os.path.join(OUT, "comparison.png"))

print("native size:", rgba.size)
for k, v in previews.items():
    print(k, v.size)