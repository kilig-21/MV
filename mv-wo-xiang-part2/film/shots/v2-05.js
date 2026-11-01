import { stairs } from '../src/scenes-verse2.js';
import { clawd, groundShadow } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, block } from '../src/ink.js';
import { breath, sway } from '../src/life.js';
import { face, dart } from '../src/expr-e2.js';
import { pulse } from '../src/polish-v2.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const m = stairs(ctx, gt);
    // 上楼不是匀速：先上两级，在第二级停半拍看自己的鞋，再继续
    let step;
    if (t < 1.05) step = smooth(t / 1.05) * 2;
    else if (t < 1.52) step = 2;
    else step = 2 + smooth((t - 1.52) / 1.2) * 4.2;
    const i = Math.min(7, Math.floor(step));
    const frac = step - i;
    const x = 300 + step * 190;
    const y = 880 - i * 64 - smooth(frac) * 64 - Math.abs(Math.sin(frac * Math.PI)) * 14;

    // 停下时有一只脚在台阶上轻点两下
    const pauseT = t - 1.08;
    const tap = pauseT > 0 && pauseT < 0.44 ? Math.max(0, Math.sin(pauseT / 0.22 * Math.PI * 2)) : 0;
    const ph = gt * 10;
    const lifts = step === 2 && t >= 1.05
      ? [-0.14 * tap, 0, 0, 0]
      : [Math.sin(ph) * 0.25, -Math.sin(ph) * 0.25, Math.sin(ph + 1) * 0.25, -Math.sin(ph + 1) * 0.25];

    const lookShoe = smooth((t - 1.1) / 0.25) * (1 - smooth((t - 1.42) / 0.2));
    const b = breath(t, { seed: 141, period: 1.5, amp: 0.12 });
    const s = sway(t, { seed: 141, armAmp: 0.04 });
    // 表情：看鞋的时候只是眼睛下去，嘴角 1.36 s 才跟着弯一下，1.74 s 收回（0.14 s 过渡）
    const e = face(t, [
      { t: 0.00, eyes: 'normal', mouth: 'none' },
      { t: 1.36, mouth: 'smile' },
      { t: 1.74, mouth: 'none' },
    ], { ramp: 0.14, seed: 141 });
    groundShadow(ctx, x, y - 6, 18, { alpha: 0.16, w: 6 });
    clawd(ctx, {
      cx: x,
      by: y,
      u: 18,
      color: P.orange,
      ...e,
      // 视线比身体早 2 帧落到台阶上的鞋：停半拍时是「啪」地低头看，不是慢慢平移
      look: dart(t, [{ t: 0, look: 0.8 }, { t: 1.12, look: -0.5 }, { t: 1.52, look: 0.8 }]),
      seed: 141,
      legs: lifts,
      bodyDy: b.bodyDy + lookShoe * 0.18,
      squash: b.squash,
      rot: -0.05 + lookShoe * 0.05 + s.rot,
      armL: s.armL,
      armR: s.armR,
    });
    // 布鞋：四脚各一只，跟着抬脚
    const RIGX = [3, 5, 9, 11];
    RIGX.forEach((rx, k) => {
      const fx = x + (rx + 0.5 - 7.5) * 18;
      const fy = y + lifts[k] * 18;
      block(ctx, fx - 17, fy - 8, 34, 10, 4, '#3E3632', { stroke: P.ink, lw: 3, seed: 260 + k });
      block(ctx, fx - 15, fy - 1, 30, 4, 2, '#E8D5B0', { seed: 270 + k });
    });
  },
};