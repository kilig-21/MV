from PIL import Image, ImageDraw
import os

OUT = r"C:/Users/Lenovo/Desktop/ALLCODE/Anima/mv-wo-xiang-part2/character-lock"
src = Image.open(r"C:/Users/Lenovo/lemo-opuscar/styleboard/img/opuscar98/16.jpg").convert("RGB").crop((330, 130, 630, 330))
flat = Image.open(os.path.join(OUT, "flat2d-native.png")).convert("RGBA")
p64 = Image.open(os.path.join(OUT, "flat2d-64.png")).convert("RGBA")
old = Image.open(os.path.join(OUT, "pixel-64.png")).convert("RGBA")

cell = 520
sheet = Image.new("RGB", (cell * 4, 620), (16, 25, 40))
d = ImageDraw.Draw(sheet)

def put(img, i, label, limit=(440, 440)):
    im = img.copy()
    im.thumbnail(limit, Image.NEAREST)
    bg = Image.new("RGBA", im.size, (16, 25, 40, 255))
    if im.mode == "RGBA":
        bg.alpha_composite(im)
        im = bg
    x = i * cell + (cell - im.width) // 2
    y = 40 + (440 - im.height) // 2
    sheet.paste(im.convert("RGB"), (x, y))
    d.text((i * cell + 12, 12), label, fill=(235, 225, 190))

put(src, 0, "author 2D still #16 (Casablanca)")
put(flat, 1, "flat 2D extraction (hat removed)")
put(p64.resize((p64.width * 6, p64.height * 6), Image.NEAREST), 2, "flat2d-64  (43 px tall)")
put(old.resize((old.width * 6, old.height * 6), Image.NEAREST), 3, "previous 3D-derived (rejected)")

sheet.save(os.path.join(OUT, "compare-2d.jpg"), quality=92)
print("saved compare-2d.jpg")