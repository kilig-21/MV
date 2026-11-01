import { bookGlow } from '../src/scenes-verse3.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, clamp, glow, poly } from '../src/ink.js';
import { breath, blink } from '../src/life.js';
import { face, glance, prep, withBlink } from '../src/expr-e4.js';

// v3-03 他代表智慧——书页自己翻了一页，光落在角色脸上
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    const m = bookGlow(ctx, gt);
    const cx = m.cx, cy = m.cy;

    // 书页自己翻起来：绕书脊立起，0.62 秒内完成
    const q = smooth((t - 0.10) / 0.42);
    if (q > 0 && q < 0.999) {
      const th = q * Math.PI * 0.62;
      const cs = Math.cos(th), sn = Math.sin(th);
      const W = 420 * cs;
      const lift = 210 * sn;
      // 页影
      ctx.save();
      ctx.globalAlpha = 0.18 * (1 - q);
      poly(ctx, [[cx, cy - 60 + 16], [cx + W, cy + 16 - lift], [cx + W, cy + 96 - lift], [cx, cy + 40 + 16]],
        { fill: P.ink, stroke: false });
      ctx.restore();
      // 纸页
      poly(ctx, [
        [cx, cy - 60],
        [cx + W, cy - lift],
        [cx + W, cy + 90 * cs - lift],
        [cx, cy + 40],
      ], { fill: '#F7EFDD', stroke: P.ink, lw: 5, seed: 2055, amp: 0.8 });
      // 页上的字迹随页面压缩
      for (let i = 0; i < 3; i++) {
        const yy = cy + 4 + i * 16;
        ctx.beginPath();
        ctx.globalAlpha = 0.75 * (1 - q * 0.5);
        ctx.strokeStyle = '#B9A98D';
        ctx.lineWidth = 2;
        ctx.moveTo(cx + 26, yy + 2);
        ctx.lineTo(cx + W * 0.92, yy + 2 - lift * 0.92);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // 翻页后书更亮
    const k = smooth((t - 0.42) / 0.3);
    const b = breath(t, { seed: 303, period: 1.25, amp: 0.12, squashAmp: 0.009 });
    // 被光打到的一下：先往后缩一点，再凑回来（0.1 秒的惊）
    const flinch = Math.sin(Math.PI * clamp((t - 0.42) / 0.26, 0, 1));
    if (k > 0) glow(ctx, cx, cy - 30, 380, 'rgba(246,201,126,0.85)', 0.55 * k);

    // 角色在桌边，被书光照到脸
    const u = 30, bx = 1640, by = 750;
    // 翻页是「意外」，不是惊吓：眉先抬（0.50），眼睛从普通睁到圆（0.60），
    // 到镜尾才到最亮的震惊。视线先落到翻起来的页角上，比表情早 2 帧。
    const look = glance(t, [
      { t: 0.00, look: -0.55 },
      { t: 0.44, look: -0.72 },     // 翻起来的那一页
    ], { dur: 0.09 });
    const e = face(t, [
      { t: 0.00, eyes: 'normal', mouth: 'none', brow: null },
      { t: 0.36, eyes: 'normal', mouth: 'flat', brow: null },
      { t: 0.62, eyes: 'wide', mouth: 'o', brow: 'up' },
      { t: 0.84, eyes: 'shock', mouth: 'o', brow: 'up' },
    ], 0.16);
    const eb = withBlink(e, blink(t, { seed: 303, enabled: t < 0.4 }));

    clawd(ctx, {
      cx: bx - 6 * flinch, by: by - 3 * flinch, u,
      color: P.orange,
      ...eb,
      look,
      browDy: prep(t, 0.50, { amp: 0.34 }),
      seed: 303, rot: -0.02 + 0.035 * flinch,
      armL: -0.25 - 0.35 * k,
      squash: b.squash, bodyDy: b.bodyDy,
    });
    if (k > 0) {
      const fx = bx - 1.2 * u, fy = by - 6.4 * u;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, fx, fy, 6.2 * u, 'rgba(246,201,126,0.62)', 0.5 * k);
      ctx.restore();
    }

    // 从书里升起的几点光（智慧的微光）
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.55 + i * 0.33) % 1;
      const a = (1 - ph) * 0.7 * k;
      if (a <= 0) continue;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(cx - 140 + i * 140, cy - 120 - ph * 220, 3 + (1 - ph) * 3, 0, Math.PI * 2);
      ctx.fillStyle = '#F7DDA8';
      ctx.fill();
      ctx.restore();
    }
  },
};