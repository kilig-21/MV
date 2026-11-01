import { dawnBird } from '../src/scenes-verse3.js';
import { P } from '../src/palette.js';
import { clamp, lerp, smooth, glow, line } from '../src/ink.js';
import { bird } from '../src/scenes-verse3a.js';

// v3-04 代表黎明降临前的鸣鸟——鸟的剪影掠过城市天线，天边亮起一线
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    const m = dawnBird(ctx, gt);

    // 天边先亮一线（在鸟飞过之前就开始）
    const dawn = smooth(t / (d * 0.85));
    ctx.save();
    const g = ctx.createLinearGradient(0, m.horizon - 130, 0, m.horizon + 40);
    g.addColorStop(0, 'rgba(120,110,96,0)');
    g.addColorStop(0.62, `rgba(196,158,110,${0.20 * dawn})`);
    g.addColorStop(1, `rgba(241,217,168,${0.55 * dawn})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, m.horizon - 130, 1920, 170);
    ctx.restore();
    // 地平线那一条随鸟飞过而拉长
    line(ctx, 0, m.horizon - 2, 1920, m.horizon - 2,
      { seed: 2071, lw: 4 + 4 * dawn, color: `rgba(247,221,168,${0.35 + 0.45 * dawn})`, amp: 1 });
    glow(ctx, 960, m.horizon - 30, 560, 'rgba(241,217,168,0.7)', 0.35 * dawn);

    // 鸟从左边掠过天线，向右边出画；飞过时压到亮起来的天边一线前
    const p = clamp(t / d, 0, 1);
    const bx = lerp(-160, 2100, p);
    const dip = Math.sin(p * Math.PI) * 132;
    const by = 552 + dip;
    const flap = 0.45 + 0.55 * Math.abs(Math.sin(t * 15));
    const s = lerp(84, 100, p);
    // 天光在翅膀上留一道暖边，暗剪影才读得出来
    ctx.save();
    ctx.globalAlpha = 0.5;
    bird(ctx, bx, by - s * 0.05, s * 1.09, flap, 'rgba(247,221,168,0.75)');
    ctx.restore();
    // 最近的两次展翅带一点残影
    ctx.save();
    ctx.globalAlpha = 0.18;
    bird(ctx, bx - Math.cos(t * 15) * 30, by - 4, s * 0.94, 1 - flap, '#0A141C');
    ctx.restore();
    bird(ctx, bx, by, s, flap, '#0A141C');

    // 更远处一只更小的，跟着同一个方向
    const p2 = clamp((t - 0.25) / d, 0, 1);
    ctx.save();
    ctx.globalAlpha = 0.6;
    bird(ctx, lerp(120, 1980, p2), 648 + Math.sin(p2 * Math.PI) * 46, 40,
      0.5 + 0.5 * Math.abs(Math.sin(t * 17 + 1.4)), '#0C1620');
    ctx.restore();

    // 天边一线尽头的一小团暖光
    glow(ctx, 1560, m.horizon - 10, 300, 'rgba(246,201,126,0.6)', 0.30 * smooth((t - 0.7) / 0.6));
  },
};