"""CODI-136 pose sheet on the official 15x16 Clawd grid.

All poses are integer offsets of the official rects, plus props drawn at the
arm grip points. No body part is redrawn.
"""
from PIL import Image, ImageDraw
import os

OUT = r"C:/Users/Lenovo/Desktop/ALLCODE/Anima/mv-wo-xiang-part2/character-lock/official"
W, H = 15, 16
BODY = (222, 136, 109, 255)
INK = (0, 0, 0, 255)
SHADOW = (0, 0, 0, 127)
LEGS = [(3, 13), (5, 13), (9, 13), (11, 13)]


def draw(dx=0, dy=0, legs=(0, 0, 0, 0), arms=(0, 0), eye_h=(1, 1), prop=None):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([3, 15, 11, 15], fill=SHADOW)
    for (lx, ly), lift in zip(LEGS, legs):
        d.rectangle([lx + dx, ly + dy, lx + dx, ly + dy + (1 - lift)], fill=BODY)
    d.rectangle([2 + dx, 6 + dy, 12 + dx, 12 + dy], fill=BODY)
    for (ax, ay), lift in zip([(0, 9), (13, 9)], arms):
        d.rectangle([ax + dx, ay + dy - lift, ax + dx + 1, ay + dy + 1 - lift], fill=BODY)
    d.rectangle([4 + dx, 8 + dy, 4 + dx, 8 + dy + eye_h[0] - 1], fill=INK)
    d.rectangle([10 + dx, 8 + dy, 10 + dx, 8 + dy + eye_h[1] - 1], fill=INK)
    if prop:
        prop(d, dx, dy)
    return im


def phone(d, dx, dy):
    x, y = 12 + dx, 6 + dy
    d.rectangle([x, y, x + 2, y + 4], fill=(20, 32, 45, 255))
    d.rectangle([x, y, x + 2, y], fill=(64, 96, 110, 255))
    d.rectangle([x, y + 1, x + 2, y + 3], fill=(111, 211, 199, 255))


def pen(d, dx, dy):
    x, y = 13 + dx, 7 + dy
    d.rectangle([x, y, x, y + 3], fill=(30, 40, 50, 255))
    d.rectangle([x, y + 4, x, y + 4], fill=(220, 180, 120, 255))


def book(d, dx, dy):
    x, y = -1 + dx, 8 + dy
    d.rectangle([x, y, x + 2, y + 3], fill=(226, 211, 176, 255))
    d.rectangle([x, y, x + 2, y], fill=(160, 120, 90, 255))
    d.rectangle([x, y + 1, x + 2, y + 1], fill=(180, 160, 130, 255))


poses = [
    ("stand", draw()),
    ("sit", draw(dy=1, legs=(1, 1, 1, 1))),
    ("squat", draw(dy=1, legs=(1, 1, 1, 1), arms=(0, 0))),
    ("walk A", draw(dx=-1, legs=(1, 0, 0, 1), arms=(0, 1))),
    ("walk B", draw(dy=-1, arms=(1, 0))),
    ("jump", draw(dy=-3, legs=(1, 1, 1, 1))),
    ("turn", draw().transpose(Image.FLIP_LEFT_RIGHT)),
    ("tired eyes", draw(eye_h=(1, 1))),
    ("wide eyes", draw(eye_h=(3, 3))),
    ("happy eyes", draw(eye_h=(1, 1), dy=-1)),
    ("phone", draw(prop=phone)),
    ("pen", draw(prop=pen)),
    ("lyric book", draw(prop=book)),
    ("book + phon", draw(prop=book)),
]

cell = 120
cols = 7
rows = (len(poses) + cols - 1) // cols
sheet = Image.new("RGBA", (cell * cols, (cell + 18) * rows), (24, 43, 67, 255))
d = ImageDraw.Draw(sheet)
for i, (name, im) in enumerate(poses):
    big = im.resize((W * 6, H * 6), Image.NEAREST)
    x = (i % cols) * cell + (cell - big.width) // 2
    y = (i // cols) * (cell + 18) + 24
    sheet.alpha_composite(big, (x, y))
    d.text(((i % cols) * cell + 6, (i // cols) * (cell + 18) + 6), name, fill=(235, 225, 190))
sheet.convert("RGB").save(os.path.join(OUT, "pose-sheet.png"))

for name, im in poses:
    safe = name.replace(" ", "-").replace("+", "and")
    im.resize((W * 8, H * 8), Image.NEAREST).save(os.path.join(OUT, f"pose-{safe}.png"))

print("poses", len(poses), "saved to", OUT)