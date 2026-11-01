"""CODI-135 (2D source): flat 2D Clawd from the styleboard still for
Casablanca (no.16). The source is a 2D illustration; the orange body is
flattened to one colour, the eyes kept, and the grey hat / white paper
trimmed away. No body part is redrawn.
"""
from PIL import Image
import numpy as np
from scipy import ndimage
import os

SRC = r"C:/Users/Lenovo/lemo-opuscar/styleboard/img/opuscar98/16.jpg"
OUT = r"C:/Users/Lenovo/Desktop/ALLCODE/Anima/mv-wo-xiang-part2/character-lock"
os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(np.int16)
r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]

mask = (r > 110) & (r - g > 35) & (g - b > 10) & (r - b > 55)
lab, n = ndimage.label(mask)
sizes = ndimage.sum(mask, lab, range(1, n + 1))
mask = lab == (int(np.argmax(sizes)) + 1)

# The hat brim and white paper touch the top edge. Cut a thin band, then
# keep only the widest horizontal body band.
mask[:14, :] = False
mask = ndimage.binary_closing(mask, structure=np.ones((3, 3)), iterations=1)
ys, xs = np.where(mask)
mask = mask[ys.min():ys.max() + 1, xs.min():xs.max() + 1]

# Fill the notch left by the hat brim along the top edge of the body.
h_crop, w_crop = mask.shape
for yy in range(0, min(12, h_crop)):
    xx = np.where(mask[yy])[0]
    if len(xx) > 1:
        mask[yy, xx.min():xx.max() + 1] = True

# Fill small holes that are not the eyes: none expected, but keep safe.
filled = ndimage.binary_fill_holes(mask)
holes = filled & ~mask
hl, hn = ndimage.label(holes)
for i in range(1, hn + 1):
    h = hl == i
    if h.sum() < 3000:
        mask |= h

# Sample the body colour from bright orange pixels.
body_px = (mask) & (r[ys.min():ys.max() + 1, xs.min():xs.max() + 1] > 140)
# r/g/b were not cropped; recompute on the cropped array for sampling.
rgb_crop = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
sel = mask & (rgb_crop[:, :, 0] > 120) & (rgb_crop[:, :, 0] < 235) & (rgb_crop[:, :, 1] > 60) & (rgb_crop[:, :, 1] < 165)
body_color = np.median(rgb_crop[sel], axis=0).astype(np.uint8)

# Eyes: near-black pixels inside the body. Fill any highlight specks so the
# eyes stay solid vertical bars.
eyes = mask & (rgb_crop[:, :, 0] < 70) & (rgb_crop[:, :, 1] < 70) & (rgb_crop[:, :, 2] < 70)
el, en = ndimage.label(eyes)
comps = []
for i in range(1, en + 1):
    m = el == i
    if m.sum() > 100:
        comps.append((int(m.sum()), ndimage.binary_fill_holes(m)))
comps.sort(key=lambda kv: -kv[0])
eyes = np.zeros_like(eyes)
for _, m in comps[:2]:
    eyes |= m

flat = np.zeros((*mask.shape, 4), dtype=np.uint8)
flat[mask, 0] = body_color[0]
flat[mask, 1] = body_color[1]
flat[mask, 2] = body_color[2]
flat[mask, 3] = 255
flat[eyes] = (8, 8, 10, 255)

# The source is a front-facing 2D illustration; the hat brim cuts the top
# right corner. Mirror the clean left half onto the right so the body is a
# symmetrical front view. This reuses the author's own pixels, no redraw.
half = flat.shape[1] // 2
for xx in range(half, flat.shape[1]):
    flat[:, xx] = flat[:, flat.shape[1] - 1 - xx]

flat_img = Image.fromarray(flat, "RGBA")
flat_img.save(os.path.join(OUT, "flat2d-native.png"))

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
    # Hard alpha, then keep the flat body colour and black eyes only.
    al = np.array(small.getchannel("A").point(lambda v: 255 if v >= 110 else 0))
    al = smooth_top(al, th, tw)
    arr = np.array(small)
    dark = (arr[:, :, 0] < 90) & (arr[:, :, 1] < 90) & (arr[:, :, 2] < 90) & (al > 0)
    arr[al > 0, 0] = body_color[0]
    arr[al > 0, 1] = body_color[1]
    arr[al > 0, 2] = body_color[2]
    arr[dark, 0:3] = (8, 8, 10)
    arr[:, :, 3] = al
    out = Image.fromarray(arr, "RGBA")
    out.save(os.path.join(OUT, f"{name}.png"))

    big = out.resize((out.width * 8, out.height * 8), Image.NEAREST)
    bg = Image.new("RGBA", big.size, (205, 205, 205, 255))
    bg.alpha_composite(big)
    bg.convert("RGB").save(os.path.join(OUT, f"{name}@8x.png"))
    print(name, out.size)

print("native", flat_img.size, "body", body_color.tolist())