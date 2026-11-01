"""Issue CODI-136: pose strips from the locked native sprite.

Only whole-sprite translation and mirror. The body is never cut, redrawn,
or given new joints. Source: flat2d-64.png from CODI-135.
"""
from PIL import Image, ImageDraw
import os

OUT = r"C:/Users/Lenovo/Desktop/ALLCODE/Anima/mv-wo-xiang-part2/character-lock"
MOT = os.path.join(OUT, "motion")
os.makedirs(MOT, exist_ok=True)

src = Image.open(os.path.join(OUT, "flat2d-64.png")).convert("RGBA")
W, H = src.size


def frame(dx=0, dy=0, mirror=False):
    """Whole sprite only: integer translation, optional mirror."""
    pad_x, pad_y = 6, 8
    canvas = Image.new("RGBA", (W + pad_x * 2, H + pad_y * 2), (0, 0, 0, 0))
    canvas.alpha_composite(src, (pad_x + dx, pad_y + dy))
    if mirror:
        canvas = canvas.transpose(Image.FLIP_LEFT_RIGHT)
    return canvas


def strip(name, frames, scale=10):
    pad = 10
    fw, fh = frames[0].size
    out = Image.new("RGBA", (len(frames) * (fw + pad) + pad, fh + 30 + pad), (16, 25, 40, 255))
    d = ImageDraw.Draw(out)
    for i, f in enumerate(frames):
        x = pad + i * (fw + pad)
        out.alpha_composite(f, (x, 26))
        d.text((x, 8), str(i + 1), fill=(230, 220, 190))
    out.resize((out.width * scale, out.height * scale), Image.NEAREST).save(os.path.join(MOT, f"{name}.png"))
    fd = os.path.join(MOT, name)
    os.makedirs(fd, exist_ok=True)
    for i, f in enumerate(frames):
        f.resize((f.width * 4, f.height * 4), Image.NEAREST).save(os.path.join(fd, f"{i:02d}.png"))


# Idle: 1 px breathing.
strip("idle-4f", [frame(), frame(), frame(dy=-1), frame()])

# Walk: crab waddle -- body rocks one pixel left/right and bobs.
walk = [
    frame(dx=-1), frame(dy=-1), frame(dx=1), frame(dy=-1),
    frame(dx=-1), frame(dy=-1), frame(dx=1), frame(dy=-1),
]
strip("walk-8f", walk)
strip("walk-8f-mirror", [f.transpose(Image.FLIP_LEFT_RIGHT) for f in walk])

# Run: faster and wider.
run = [frame(dx=-2, dy=-1), frame(dy=-2), frame(dx=2, dy=-1), frame(dy=-2)]
strip("run-4f", run)

# Jump: crouch, rise, peak, descend, land.
jump = [frame(dy=1), frame(dy=-3), frame(dy=-5), frame(dy=-3), frame(dy=1)]
strip("jump-5f", jump)

# Sit: only lowering on the seat line; no new leg pose.
strip("sit-1f", [frame(dy=2)])

print("saved", MOT, "sprite", src.size)