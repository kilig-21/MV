import { dreamSky, sea, ticketPlatform } from '../src/dream.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { clamp } from '../src/ink.js';
import { keys, backOut, breath, hit } from '../src/polish-chorus.js';
import { exprE3, withBlink, beatClock, dart, browAt } from '../src/expr-e3.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    dreamSky(ctx, gt, { moonX: 300, moonY: 170, moonR: 50 });
    sea(ctx, gt, { y: 760 });

    // 海面张开：三座岛错开升起，每座升上来时带一下过冲和一圈水花
    for (let i = 0; i < 3; i++) {
      const t0 = 0.25 + i * 0.22;
      const p = backOut(clamp((t - t0) / 0.55, 0, 1), 1.1);
      if (p <= 0.01) continue;
      const x = 380 + i * 560;
      const h = 60 + i * 30;
      const y = 770 + (1 - p) * 130;
      ctx.save();
      ctx.globalAlpha = 0.9 * clamp(p, 0, 1);
      ctx.fillStyle = '#33545F';
      ctx.beginPath();
      ctx.ellipse(x, y, 190, h, 0, Math.PI, 0);
      ctx.fill();
      // 出水那一圈：只在刚冒出来的一小段时间里
      const splash = clamp(1 - Math.abs(p - 1) * 5, 0, 1);
      if (splash > 0.02) {
        ctx.globalAlpha = 0.35 * splash;
        ctx.strokeStyle = '#CFE2E6'; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(x, 776, 200 + (1 - splash) * 90, 20, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    const py = ticketPlatform(ctx, 960, 760, 420, gt, { phase: 2, seed: 45 });

    // 张臂：先探出去半程、停一下，再张开——c1 的犹豫
    const open = keys(t, [
      [0.00, -0.12],
      [0.30, -0.44],
      [0.40, -0.44],
      [0.78, -0.86, backOut],
      [1.05, -0.72],
    ]);
    const sway = Math.sin(gt * 1.1) * 0.045;
    const b = breath(gt, 124);
    const gust = hit(gt, 3.2);       // 风一阵一阵地推

    // 表情：海面张开那一下 wide（惊叹），第二座岛升上来时再抬一次眼，最后落回 normal。
    const bc = beatClock(shot.t0);
    const e = withBlink(gt, 125, exprE3(t, [
      { t: 0.00, eyes: 'wide', mouth: 'o', brow: 'up' },
      { t: bc.b(1), eyes: 'normal', mouth: 'smile', brow: null },
      { t: bc.b(2), eyes: 'wide', mouth: 'smile' },
    ]));
    const browDy = browAt(t, [
      { at: 0.30, dur: 0.30, amp: 0.16 },
      { at: bc.b(1), dur: 0.28, amp: 0.10 },
    ]);
    const look = dart(t, [
      { t: 0.05, look: 0.50 }, { t: 0.60, look: 0.15 },
      { t: 1.20, look: -0.45 }, { t: 2.00, look: 0.20 },
    ]);

    clawd(ctx, {
      cx: 960, by: py - 8 + b.y * 3, u: 25,
      color: P.orange,
      ...e, browDy,
      seed: 124,
      rot: sway + b.r * 0.012,
      look,
      armL: open - 0.05 * gust + b.a * 0.05,
      armR: open - 0.05 * gust - b.a * 0.05,
      squash: 1 + 0.01 * b.y,
    });
  },
};