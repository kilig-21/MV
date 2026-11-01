"""Official Clawd on Desk base (15x16 pixel grid) -> pose strips + prop demo.

Parts and coordinates come from assets/svg/clawd-static-base.svg:
  torso 2,6 11x7 | arms 0,9 and 13,9 2x2 | legs 3,13 5,13 9,13 11,13 1x2
  eyes 4,8 and 10,8 1x2 | shadow 3,15 9x1
Only integer pixel offsets; no body part is redrawn.
"""
from PIL import Image, ImageDraw
import os

OUT = r"C:/Users/Lenovo/Desktop/ALLCODE/Anima/mv-wo-xiang-part2/character-lock/official"
MOT = os.path.join(OUT, "motion")
os.makedirs(MOT, exist_ok=True)

W, H = 15, 16
BODY = (222, 136, 109, 255)
INK = (0, 0, 0, 255)
SHADOW = (0, 0, 0, 127)
LEGS = [(3, 13), (5, 13), (9, 13), (11, 13)]


def draw(dx=0, dy=0, legs=(0, 0, 0, 0), arms=(0, 0), blink=False, prop=None):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([3, 15, 11, 15], fill=SHADOW)
    # Legs: a 1 px lift shortens the leg by one pixel.
    for (lx, ly), lift in zip(LEGS, legs):
        d.rectangle([lx + dx, ly + dy, lx + dx, ly + dy + (1 - lift)], fill=BODY)
    # Torso
    d.rectangle([2 + dx, 6 + dy, 12 + dx, 12 + dy], fill=BODY)
    # Arms
    for (ax, ay), lift in zip([(0, 9), (13, 9)], arms):
        d.rectangle([ax + dx, ay + dy - lift, ax + dx + 1, ay + dy + 1 - lift], fill=BODY)
    # Eyes
    eh = 0 if blink else 1
    d.rectangle([4 + dx, 8 + dy, 4 + dx, 8 + dy + eh], fill=INK)
    d.rectangle([10 + dx, 8 + dy, 10 + dx, 8 + dy + eh], fill=INK)
    if prop:
        prop(d, dx, dy)
    return im


def phone(d, dx, dy):
    # Held at the right arm tip; screen faces the viewer.
    x, y = 12 + dx, 6 + dy
    d.rectangle([x, y, x + 2, y + 4], fill=(20, 32, 45, 255))
    d.rectangle([x, y, x + 2, y], fill=(64, 96, 110, 255))
    d.rectangle([x, y + 1, x + 2, y + 3], fill=(111, 211, 199, 255))


def strip(name, frames, scale=8):
    pad = 6
    fw, fh = frames[0].size
    out = Image.new("RGBA", (len(frames) * (fw + pad) + pad, fh + 18 + pad), (24, 43, 67, 255))
    dd = ImageDraw.Draw(out)
    for i, f in enumerate(frames):
        x = pad + i * (fw + pad)
        out.alpha_composite(f, (x, 16))
        dd.text((x, 4), str(i + 1), fill=(230, 220, 190))
    out = out.resize((out.width * scale, out.height * scale), Image.NEAREST)
    out.save(os.path.join(MOT, f"{name}.png"))
    fd = os.path.join(MOT, name)
    os.makedirs(fd, exist_ok=True)
    for i, f in enumerate(frames):
        f.resize((f.width * scale, f.height * scale), Image.NEAREST).save(os.path.join(fd, f"{i:02d}.png"))


# Idle: 1 px breathing, blink on the last frame.
idle = [draw(), draw(), draw(dy=-1), draw(dy=-1, blink=True)]

# Walk: crab waddle. Body rocks; diagonal leg pairs lift.
walk = [
    draw(dx=-1, legs=(1, 0, 0, 1), arms=(0, 1)),
    draw(dy=-1, legs=(0, 0, 0, 0), arms=(1, 0)),
    draw(dx=1, legs=(0, 1, 1, 0), arms=(0, 1)),
    draw(dy=-1, legs=(0, 0, 0, 0), arms=(1, 0)),
    draw(dx=-1, legs=(1, 0, 0, 1), arms=(0, 1)),
    draw(dy=-1, legs=(0, 0, 0, 0), arms=(1, 0)),
    draw(dx=1, legs=(0, 1, 1, 0), arms=(0, 1)),
    draw(dy=-1, legs=(0, 0, 0, 0), arms=(1, 0)),
]

run = [
    draw(dx=-2, dy=-1, legs=(1, 1, 0, 0), arms=(1, 1)),
    draw(dy=-2, legs=(0, 0, 0, 0), arms=(1, 1)),
    draw(dx=2, dy=-1, legs=(0, 0, 1, 1), arms=(1, 1)),
    draw(dy=-2, legs=(0, 0, 0, 0), arms=(1, 1)),
]

jump = [draw(dy=1), draw(dy=-2, legs=(1, 1, 1, 1)), draw(dy=-4, legs=(1, 1, 1, 1)), draw(dy=-2, legs=(1, 1, 1, 1)), draw(dy=1)]

strip("idle-4f", idle)
strip("walk-8f", walk)
strip("run-4f", run)
strip("jump-5f", jump)

# Prop demo: same base, phone at the right grip.
strip("phone-demo-4f", [draw(prop=phone), draw(dy=-1, prop=phone), draw(dy=-1, blink=True, prop=phone), draw(prop=phone)])

# Big single preview.
base = draw()
base.resize((W * 16, H * 16), Image.NEAREST).save(os.path.join(OUT, "base-16x.png"))
print("saved", MOT)
print("base", base.size)