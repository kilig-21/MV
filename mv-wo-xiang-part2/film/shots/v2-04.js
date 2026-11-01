import { shopShoes } from '../src/scenes-verse2.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, glow } from '../src/ink.js';
import { breath, sway } from '../src/life.js';
import { face, prep, dart } from '../src/expr-e2.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const m = shopShoes(ctx, gt);
    // 橱窗灯一亮一暗
    const flick = 0.10 + 0.10 * Math.sin(gt * 7);
    ctx.save();
    ctx.globalAlpha = flick;
    ctx.fillStyle = P.lamp;
    ctx.fillRect(m.sx, m.sy, m.sw, m.sh);
    ctx.restore();
    glow(ctx, 380, 800, 300, 'rgba(246,201,126,0.25)', 0.5);

    // 绿螃蟹：凑近玻璃，抬手去指那双鞋
    const lean = smooth((t - 0.55) / 0.5);
    const bg1 = breath(t, { seed: 140, period: 1.6, amp: 0.13 });
    const sw1 = sway(t, { seed: 140, armAmp: 0.03 });
    // 绿螃蟹：一直张着嘴看，凑近以后眼睛才「亮」起来（0.14 s 过渡）
    const e1 = face(t, [
      { t: 0.00, eyes: 'wide', mouth: 'o' },
      { t: 0.90, brow: 'up' },
      { t: 1.02, eyes: 'sparkle' },
    ], { ramp: 0.14, seed: 140 });
    clawd(ctx, {
      cx: 380 - lean * 14,
      by: m.floorY + 40,
      u: 17,
      color: P.sage,
      ...e1,
      browDy: prep(t, [1.02], { antic: 0.12, dur: 0.30, amp: 0.26 }),
      look: dart(t, [{ t: 0, look: 0.35 }, { t: 0.64, look: 0.75 }]),
      seed: 140,
      bodyDy: bg1.bodyDy,
      squash: bg1.squash,
      rot: -0.04 * lean + sw1.rot,
      armR: -0.35 - lean * 0.55 + sw1.armR,
      armL: sw1.armL,
    });
    // 紫螃蟹：先看鞋，再看同伴一眼，又看回鞋
    const glance = smooth((t - 1.0) / 0.22) * (1 - smooth((t - 1.4) / 0.22));
    const bg2 = breath(t, { seed: 141, period: 2.0, amp: 0.12 });
    const sw2 = sway(t, { seed: 141, armAmp: 0.03 });
    // 紫螃蟹：看鞋 → 瞟同伴一眼 → 又看回鞋。视线先跳，眼型和嘴角 0.13 s 才跟上
    const e2 = face(t, [
      { t: 0.00, eyes: 'normal', mouth: 'none' },
      { t: 1.02, eyes: 'side', mouth: 'smile' },
      { t: 1.46, eyes: 'normal', mouth: 'none' },
    ], { ramp: 0.13, seed: 141 });
    clawd(ctx, {
      cx: 620 + Math.sin(t * 1.0 + 0.9) * 2,
      by: m.floorY + 44,
      u: 17,
      color: P.lav,
      ...e2,
      look: dart(t, [{ t: 0, look: 0.6 }, { t: 1.00, look: -0.9 }, { t: 1.46, look: 0.6 }]),
      seed: 141,
      bodyDy: bg2.bodyDy,
      squash: bg2.squash,
      rot: 0.03 + sw2.rot,
      armL: -0.15 + sw2.armL,
    });
  },
};