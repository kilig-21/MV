import { storeCounter } from '../src/scenes2.js';
import { clawd } from '../src/character.js';
import { phone } from '../src/props.js';
import { P } from '../src/palette.js';
import { smooth, block, line } from '../src/ink.js';
import { breathe, sway, gesture, weightShift } from '../src/polish-v1.js';
import { faceE1, dart } from '../src/expr-e1.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const d = shot.t1 - shot.t0;
    storeCounter(ctx, gt);

    // 收银员：自己的节奏——先看顾客、抬手示意、扫码、低头看小票
    {
      const bob = breathe(t, 88, 17, { amp: 0.18 });
      const lean = smooth((t - 0.42) / 0.22);
      const f = faceE1(t, [
        { at: 0.00, eyes: 'happy', mouth: 'smile' },
        { at: 0.44, eyes: 'normal', mouth: 'smile', ramp: 0.13 },
        { at: 0.68, eyes: 'look', mouth: 'none', ramp: 0.12 },
      ], { seed: 88, ramp: 0.13, blush: true, blinkFrom: 0.3 });
      clawd(ctx, {
        cx: 1450 - lean * 8, by: 610 - bob, u: 17,
        color: P.sage, eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
        blush: true, seed: 88,
        look: f.blinking ? 0 : dart(t, [
          { t: 0.00, look: -0.50 },
          { t: 0.62, look: -0.62 },
        ], { dur: 0.09 }),
        armR: -0.18 - 0.55 * gesture(t, 0.30, 0.16, { pre: 0.12, over: 0.07 }) + 0.25 * smooth((t - 0.62) / 0.18),
        armL: sway(t, 89, { amp: 0.05 }),
        rot: lean * 0.012,
      });
    }

    // 后面理货的另一只：背对，完全不管柜台
    {
      const bob = breathe(t, 90, 13, { amp: 0.2 });
      const stack = smooth((t - 0.38) / 0.3);
      clawd(ctx, {
        cx: 1752, by: 604 - bob, u: 13, color: P.teal, seed: 90,
        eyes: 'none', mouth: 'none', flip: true,
        legs: [0, -0.06 - stack * 0.08, 0, -0.06],
        armL: -0.1 - stack * 0.5, armR: -0.1 - stack * 0.5,
        rot: Math.sin(t * 2.1) * 0.006,
      });
      block(ctx, 1722, 520 - bob - stack * 8, 60, 44, 5, '#C9A96E', { stroke: P.ink, lw: 4, seed: 91 });
    }

    // 顾客：先把手机抬到扫码口，再落下
    const raise = gesture(t, 0.24, 0.18, { pre: 0.12, over: 0.06 });
    const drop = smooth((t - 0.56) / 0.2);
    const bob = breathe(t, 87, 27, { amp: 0.18 });
    const shift = weightShift(t, 87, { amp: 2.4 });

    const f = faceE1(t, [
      { at: 0.00, eyes: 'normal', mouth: 'flat' },
      { at: 0.20, eyes: 'look', mouth: 'none', ramp: 0.12 },
      { at: 0.42, eyes: 'squint', mouth: 'flat', ramp: 0.11 },    // 扫码绿光刺了一下
      { at: 0.70, eyes: 'tired', mouth: 'smile', ramp: 0.16 },    // 客气但不真的笑
    ], { seed: 87, ramp: 0.12, blinkFrom: 0.44, noBlinkIn: [[0.40, 0.50]] });

    clawd(ctx, {
      cx: 660 + shift, by: 980 - bob + drop * 2, u: 27,
      color: P.orange,
      eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
      look: f.blinking ? 0 : dart(t, [
        { t: 0.00, look: 0.85 },
        { t: 0.24, look: 0.92 },
        { t: 0.62, look: 0.50 },
      ], { dur: 0.09 }),
      seed: 87,
      armR: -0.22 - 0.55 * raise * (1 - drop * 0.8),
      armL: sway(t, 92, { amp: 0.05 }),
      rot: -0.008 * raise,
    });

    // 手机跟着手走：抬起 → 对着扫码口 → 放下
    const u = 20;
    const hx = 660 + shift + 7.5 * 27;
    const hy = 980 - bob - 5 * 27 - 20 * (0.55 * raise) + 18 * drop;
    phone(ctx, hx - 26, hy, u, { rot: -0.14 + 0.1 * raise, glow: true });

    // 扫码成功：一道绿光 + 小票吐出
    const scan = smooth((t - 0.42) / 0.14);
    if (scan > 0) {
      ctx.save();
      ctx.globalAlpha = 0.55 * scan * (1 - smooth((t - 0.52) / 0.16) * 0.5);
      ctx.fillStyle = '#7EDCE0';
      ctx.fillRect(565, 530, 160, 10);
      ctx.restore();
    }
    const print = smooth((t - 0.5) / 0.3);
    if (print > 0) {
      const wig = Math.sin(t * 18) * (1 - print) * 2;
      block(ctx, 1180, 620, 80, 200 * print, 4, '#F7EFDD', { stroke: P.ink, lw: 4, seed: 952 });
      for (let i = 0; i < 5; i++) if (i / 5 < print) {
        line(ctx, 1190, 650 + i * 30 + wig, 1250, 650 + i * 30, { seed: 953 + i, lw: 2, color: '#B9A98D' });
      }
    }
  },
};