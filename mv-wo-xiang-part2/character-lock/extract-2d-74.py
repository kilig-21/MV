"""CODI-135 (2D source, option B): flat 2D Clawd from the styleboard still
for A Beautiful Mind (no.74). Front-facing, flat colour, no hat covering
the body. The bow tie and pen are costume, not body; they are removed by
flattening the interior and keeping only the two eyes.
"""
from PIL import Image
import numpy as np
from scipy import ndimage
import os

SRC = r"C:/Users/Lenovo/lemo-opuscar/styleboard/img/opuscar98/74.jpg"
OUT = r"C:/Users/Lenovo/Desktop/ALLCODE/Anima/mv-wo-xiang-part2/character-lock"
os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(np.int16)
r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]

mask = (r > 105) & (r - g > 32) & (g - b > 8) & (r - b > 50)
lab, n = ndimage.label(mask)
sizes = ndimage.sum(mask, lab, range(1, n + 1))
mask = lab == (int(np.argmax(sizes)) + 1)
mask = ndimage.binary_fill_holes(mask)
mask = ndimage.binary_closing(mask, structure=np.ones((3, 3)), iterations=1)

ys, xs = np.where(mask)
mask = mask[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
rgb = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]

sel = mask & (rgb[:, :, 0] > 120) & (rgb[:, :, 0] < 235) & (rgb[:, :, 1] > 60) & (rgb[:, :, 1] < 165)
body_color = np.median(rgb[sel], axis=0).astype(np.uint8)

# Eyes are the two tall dark bars in the upper half. Everything else dark
# inside the body (bow tie, pen) is costume and gets the body colour.
dark = mask & (rgb[:, :, 0] < 80) & (rgb[:, :, 1] < 80) & (rgb[:, :, 2] < 80)
dl, dn = ndimage.label(dark)
eyes = np.zeros_like(dark)
H = mask.shape[0]
for i in range(1, dn + 1):
    m = dl == i
    yy, xx = np.where(m)
    if len(yy) < 12:
        continue
    h = yy.max() - yy.min() + 1
    w = xx.max() - xx.min() + 1
    if h >= w * 1.4 and yy.mean() < H * 0.62 and m.sum() > 25:
        eyes |= ndimage.binary_fill_holes(m)

flat = np.zeros((*mask.shape, 4), dtype=np.uint8)
flat[mask, 0] = body_color[0]
flat[mask, 1] = body_color[1]
flat[mask, 2] = body_color[2]
flat[mask, 3] = 255
flat[eyes, 0:3] = (8, 8, 10)
flat_img = Image.fromarray(flat, "RGBA")
flat_img.save(os.path.join(OUT, "flat2d-native.png"))
print("eyes", int(eyes.sum()), "body", body_color.tolist(), "size", flat_img.size)

def smooth_top(al, H, W):
    top = np.full(W, H, dtype=int)
    for x in range(W):
        yy = np.where(al[:, x] > 0)[0]
        if len(yy):
            top[x] = yy[0]
    idx = np.where(top < H * 0.12)[0]
    if len(idx):
        med = ndimage.median_filter(top[idx], size=5, mode="nearest")
        for x, t in zip(idx, med):
            al[: int(t), x] = 0
    return al

for name, th in [("flat2d-48", 32), ("flat2d-64", 43), ("flat2d-96", 64)]:
    tw = max(1, round(th * flat_img.width / flat_img.height))
    small = flat_img.resize((tw, th), Image.BOX)
    al = np.array(small.getchannel("A").point(lambda v: 255 if v >= 110 else 0))
    al = smooth_top(al, th, tw)
    arr = np.array(small)
    dk = (arr[:, :, 0] < 90) & (arr[:, :, 1] < 90) & (arr[:, :, 2] < 90) & (al > 0)
    arr[al > 0, 0] = body_color[0]
    arr[al > 0, 1] = body_color[1]
    arr[al > 0, 2] = body_color[2]
    arr[dk, 0:3] = (8, 8, 10)
    arr[:, :, 3] = al
    out = Image.fromarray(arr, "RGBA")
    out.save(os.path.join(OUT, f"{name}.png"))
    big = out.resize((out.width * 8, out.height * 8), Image.NEAREST)
    bg = Image.new("RGBA", big.size, (205, 205, 205, 255))
    bg.alpha_composite(big)
    bg.convert("RGB").save(os.path.join(OUT, f"{name}@8x.png"))
    print(name, out.size)