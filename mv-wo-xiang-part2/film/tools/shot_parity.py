# -*- coding: utf-8 -*-
"""单镜「角色 vs 官方骨架」对照卡。

用法：
  python -I film/tools/shot_parity.py <frame.jpg> <out.png> <shotId> <cx> <by> <u> <t>
产出：
  三栏：带骨架描边的镜头裁切 / 原始裁切 / 官方 base；底部标注镜号、时间、比例。
"""
import os
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
OFFICIAL = os.path.join(ROOT, 'character-lock', 'official', 'base-240x256.png')


def main():
    frame_path, out_path, shot_id = sys.argv[1], sys.argv[2], sys.argv[3]
    cx, by, u, t = (float(sys.argv[i]) for i in range(4, 8))

    frame = Image.open(frame_path).convert('RGB')
    # 角色周围留一点空间：宽 19u，高 13u
    half_w, top, bot = 9.5 * u, 11.0 * u, 2.6 * u
    box = (int(cx - half_w), int(by - top), int(cx + half_w), int(by + bot))
    crop = frame.crop(box)
    scale = min(2.0, 700 / max(crop.width, 1))
    cw, ch = int(crop.width * scale), int(crop.height * scale)
    crop2 = crop.resize((cw, ch), Image.LANCZOS)

    # 官方 base：透明背景，裁到剪影，缩放到 15u × 9u
    base = Image.open(OFFICIAL).convert('RGBA')
    bmask = base.split()[-1]
    bb = bmask.getbbox()
    base = base.crop(bb)
    bw, bh = int(15 * u * scale), int(9 * u * scale)
    base_s = base.resize((bw, bh), Image.NEAREST)

    # 第 1 栏：把官方轮廓画到裁切上
    over = crop2.copy()
    outline = Image.new('RGBA', over.size, (0, 0, 0, 0))
    bm = base_s.split()[-1].point(lambda v: 255 if v > 200 else 0)
    # 边缘 = 剪影 − 腐蚀
    er = bm.filter(ImageFilter.MinFilter(5))
    edge = ImageChops.subtract(bm, er).filter(ImageFilter.MaxFilter(3))
    red = Image.new('RGBA', bm.size, (224, 70, 90, 255))
    # 裁切框左上角在 (cx-9.5u, by-11u)；官方剪影从 (cx-7.5u, by-9u) 开始
    over.paste(red, (int(2.0 * u * scale), int(2.0 * u * scale)), edge)

    # 第 3 栏：官方 base 平铺
    panel3 = Image.new('RGB', (cw, ch), (242, 227, 198))
    panel3.paste(base_s, ((cw - bw) // 2, int((ch - bh) / 2)), base_s)

    pad = 18
    head = 54
    W = cw * 3 + pad * 4
    H = ch + head + pad
    canvas = Image.new('RGB', (W, H), (247, 239, 221))
    canvas.paste(over, (pad, head))
    canvas.paste(crop2, (pad * 2 + cw, head))
    canvas.paste(panel3, (pad * 3 + cw * 2, head))

    font_path = os.path.join(ROOT, 'film', 'fonts', 'NotoSansSC.ttf')
    try:
        f1 = ImageFont.truetype(font_path, 22)
        f2 = ImageFont.truetype(font_path, 18)
    except Exception:
        f1 = ImageFont.load_default()
        f2 = f1
    d = ImageDraw.Draw(canvas)
    d.text((pad, 14), f'{shot_id}  t={t:.2f}s  u={u:.1f}px  红=官方轮廓', font=f1, fill=(35, 34, 39))
    d.text((pad * 2 + cw, 14), '渲染帧', font=f1, fill=(35, 34, 39))
    d.text((pad * 3 + cw * 2, 14), '官方 base 15×16', font=f1, fill=(35, 34, 39))
    d.text((pad, H - 26), '同一 cx/by/u 下，红线应与角色外轮廓重合；不重合即走样。', font=f2, fill=(120, 104, 80))

    canvas.save(out_path)
    print('parity card:', out_path)


if __name__ == '__main__':
    main()