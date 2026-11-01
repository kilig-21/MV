import { bench } from '../src/scenes-verse2.js';
import { clawd, groundShadow } from '../src/character.js';
import { P } from '../src/palette.js';
import { lerp, smooth } from '../src/ink.js';
import { breath, sway } from '../src/life.js';
import { face, prep, dart } from '../src/expr-e2.js';
import { pulse, halfCup, flippedFrame } from '../src/polish-v2.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const m = bench(ctx, gt);
    const seatY = m.seatY;

    // 空位不是一开始就空的：半杯冷咖啡、扣着的相框
    halfCup(ctx, 852, seatY - 2, 17, { seed: 701 });
    flippedFrame(ctx, 972, seatY - 6, 86, 70, 0.12, 710);

    // 他先坐着，看着前面；她起身离开
    const bo = breath(t, { seed: 170, period: 2.1, amp: 0.13 });
    const so = sway(t, { seed: 170, period: 3.0, armAmp: 0.03 });
    // 视线比身体早：先动眼（啪地看过去），0.13 秒后才转肩
    // 表情：半困 → 她起身时清醒过来 → 她走出画后走神（每次 0.16 s 过渡，不眨眼硬切）
    const e = face(t, [
      { t: 0.00, eyes: 'tired', mouth: 'flat' },
      { t: 1.02, eyes: 'normal' },
      { t: 2.04, eyes: 'dazed' },
    ], { ramp: 0.16, seed: 170, guard: 0.10 });
    // 手抬到一半，停住，再放下 —— 迟疑，不是悲伤表演
    const reach = smooth((t - 1.22) / 0.26) * (1 - smooth((t - 1.64) / 0.3));
    const swallow = pulse(t - 1.5, 0.3);
    groundShadow(ctx, 640, seatY + 40, 20, { alpha: 0.16 });
    clawd(ctx, {
      cx: 640,
      by: seatY + 30,
      u: 20,
      color: P.orange,
      ...e,
      browDy: prep(t, [2.04], { antic: 0.12, dur: 0.30, amp: 0.26 }),
      look: dart(t, [{ t: 0, look: 0.25 }, { t: 1.09, look: 0.95 }, { t: 2.07, look: -0.15 }]),
      seed: 170,
      legs: [0, -0.12, 0, -0.12],
      bodyDy: bo.bodyDy + swallow * 0.1,
      squash: bo.squash,
      armR: -0.55 * reach + so.armR,
      armL: so.armL,
      rot: 0.01 + so.rot,
    });

    // 她：先坐着一会儿，再起身；走到一半回头看一次，然后走出去
    const rise = smooth((t - 1.0) / 0.3);
    let ox = 1240;
    let moving = 0;
    if (t > 1.04 && t < 1.4) { ox = 1240 + smooth((t - 1.04) / 0.36) * 120; moving = 1; }
    else if (t >= 1.4 && t < 1.66) { ox = 1360; moving = 0; }
    else if (t >= 1.66) { ox = 1360 + smooth((t - 1.66) / 0.4) * 300; moving = 1; }
    const lookBack = smooth((t - 1.36) / 0.16) * (1 - smooth((t - 1.66) / 0.16));
    const walk = moving ? Math.abs(Math.sin(gt * 10)) * 3 : 0;
    const bp = breath(t, { seed: 171, period: 1.5, amp: 0.12 });
    groundShadow(ctx, ox, seatY + 46, 18, { alpha: 0.14 });
    // 她：走开时才回头。眼型/嘴 0.13 s 过渡，视线在回头前半拍就甩过去
    const eh = face(t, [
      { t: 0.00, eyes: 'normal', mouth: 'none' },
      { t: 1.40, eyes: 'side', mouth: 'flat' },
      { t: 1.70, eyes: 'normal', mouth: 'none' },
    ], { ramp: 0.13, seed: 171, guard: 0.10 });
    clawd(ctx, {
      cx: ox,
      by: seatY + 38 - rise * 16 - walk,
      u: 18,
      color: P.pink,
      ...eh,
      look: dart(t, [{ t: 0, look: 1 }, { t: 1.38, look: -0.9 }, { t: 1.70, look: 1 }]),
      seed: 171,
      legs: moving ? [Math.sin(gt * 10) * 0.2, -Math.sin(gt * 10) * 0.2, 0, 0] : [0, 0, 0, 0],
      bodyDy: bp.bodyDy,
      squash: bp.squash,
      rot: -0.03 * lookBack,
    });
  },
};