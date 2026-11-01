import { nightStreet } from '../src/scenes2.js';
import { clawd, groundShadow } from '../src/character.js';
import { pen } from '../src/props.js';
import { P } from '../src/palette.js';
import { smooth, star, block, line, clamp } from '../src/ink.js';
import { breathe, sway, gesture, bounce, weightShift } from '../src/polish-v1.js';
import { faceE1, dart } from '../src/expr-e1.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const d = shot.t1 - shot.t0;
    nightStreet(ctx, gt);

    // ---- 粉丝：把杂志往前送，之后一直举着等 ----
    const push = gesture(t, 0.24, 0.2, { pre: 0.14, over: 0.05 });
    const fanBob = breathe(t, 90, 19, { amp: 0.2 });
    const fanF = faceE1(t, [
      { at: 0.00, eyes: 'happy', mouth: 'smile' },
      { at: 1.34, eyes: 'wide', mouth: 'o', ramp: 0.08 },
      { at: 1.62, eyes: 'happy', mouth: 'smile', ramp: 0.14 },
    ], { seed: 90, ramp: 0.14, blush: true, blinkFrom: 0.7, noBlinkIn: [[1.30, 1.45]] });
    clawd(ctx, {
      cx: 560 - push * 6, by: 900 - fanBob + bounce(t, 0.44, { dur: 0.2, amp: 1 }) * 2, u: 19,
      color: P.pink, eyes: fanF.eyes, mouth: fanF.mouth, brow: fanF.brow, browDy: fanF.browDy,
      blush: true, seed: 90,
      look: fanF.blinking ? 0 : dart(t, [
        { t: 0.00, look: 0.90 },
        { t: 1.30, look: 0.80 },
        { t: 1.62, look: 0.95 },
      ], { dur: 0.09 }),
      armR: -0.4 - 0.5 * push,
      armL: sway(t, 93, { amp: 0.05 }),
      legs: [0, -0.05 - 0.04 * Math.sin(t * 6), 0, -0.05],
    });

    // 杂志（被推近一点，签名落在纸面上）
    const mx = 700 + 40 * push;
    block(ctx, mx, 700, 230, 280, 6, '#E8D5B0', { stroke: P.ink, lw: 5, seed: 980 });
    block(ctx, mx + 20, 726, 190, 132, 3, '#B9A6D9', { seed: 981 });
    for (let i = 0; i < 3; i++) line(ctx, mx + 26, 872 + i * 30, mx + 204, 872 + i * 30, { seed: 982 + i, lw: 3, color: '#A79E8A' });

    // ---- 背景里举手机拍的人：自己的节奏 ----
    {
      const bob = breathe(t, 94, 16, { amp: 0.18 });
      const raise = smooth((t - 0.42) / 0.25);
      const lower = smooth((t - 1.7) / 0.3);
      const bgF = faceE1(t, [
        { at: 0.00, eyes: 'normal', mouth: 'none' },
        { at: 1.95, eyes: 'look', mouth: 'none', ramp: 0.16 },   // 放下手机、低头看片子
      ], { seed: 94, ramp: 0.16, blinkFrom: 0.4 });
      clawd(ctx, {
        cx: 1560, by: 918 - bob, u: 16, color: P.lav, seed: 94,
        eyes: bgF.eyes, mouth: bgF.mouth, brow: bgF.brow, browDy: bgF.browDy,
        look: bgF.blinking ? 0 : dart(t, [
          { t: 0.00, look: -0.90 },
          { t: 1.98, look: 0.70 },
        ], { dur: 0.10 }),
        armL: -0.1 - 0.9 * raise * (1 - lower),
        armR: sway(t, 95, { amp: 0.04 }),
        rot: Math.sin(t * 1.7) * 0.006,
      });
      if (raise > 0.2 && lower < 0.8) {
        block(ctx, 1402, 800 - 32 * raise + 32 * lower, 36, 60, 6, '#2C2F36', { stroke: P.ink, lw: 3, seed: 96 });
        block(ctx, 1406, 806 - 32 * raise + 32 * lower, 28, 48, 4, '#DCE9EC', { seed: 97 });
      }
    }

    // ---- 主角：签名 ----
    const signOn = smooth((t - 0.35) / 0.25) * (1 - smooth((t - 2.04) / 0.28));
    const pause = 1 - 0.65 * (smooth((t - 1.1) / 0.1) * (1 - smooth((t - 1.5) / 0.16)));
    const wig = Math.sin(t * 7.3) * 0.09 + Math.sin(t * 4.1 + 1) * 0.04;

    const armL = -0.42 - 0.3 * signOn * pause + wig * signOn;
    const bob = breathe(t, 89, 23, { amp: 0.18 });
    const shift = weightShift(t, 89, { amp: 2 });
    const recoil = smooth((t - 1.34) / 0.14) * (1 - smooth((t - 1.62) / 0.24));

    const f = faceE1(t, [
      { at: 0.00, eyes: 'look', mouth: 'flat' },
      { at: 0.42, eyes: 'squint', mouth: 'flat', ramp: 0.14 },    // 读一遍要签的什么
      { at: 1.34, eyes: 'wide', mouth: 'o', ramp: 0.09 },         // 闪光灯
      { at: 1.95, eyes: 'tired', mouth: 'flat', brow: 'worried', ramp: 0.20 },
    ], { seed: 89, ramp: 0.16, blinkFrom: 0.9, noBlinkIn: [[1.28, 1.5], [2.25, 2.6]] });

    groundShadow(ctx, 1150 + shift, 952, 23, { alpha: 0.16 });

    clawd(ctx, {
      cx: 1150 + shift - recoil * 6, by: 950 - bob - recoil * 3, u: 23,
      color: P.orange,
      eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
      look: f.blinking ? 0 : dart(t, [
        { t: 0.00, look: -0.85 },
        { t: 1.34, look: 0.80 },
        { t: 1.80, look: -0.60 },
        { t: 2.24, look: 0.55 },
      ], { dur: 0.10 }),
      seed: 89,
      armL,
      armR: -0.08 + sway(t, 98, { amp: 0.04 }),
      rot: 0.012 * smooth((t - 0.3) / 0.3) * (1 - smooth((t - 1.15) / 0.3)) - 0.02 * recoil,
      squash: 0.992,
    });

    // 笔跟着手：尖在纸面上走
    const penX = 1150 + shift - 7.5 * 23 - 16 + Math.sin(t * 7.3) * 12 * signOn;
    const penY = 950 - bob - 5 * 23 + armL * 23 + 16 + Math.cos(t * 5.7) * 7 * signOn;
    pen(ctx, penX, penY, 16, -0.62);

    // 笔迹：已经签下的那一小段
    if (signOn > 0) {
      ctx.save();
      ctx.globalAlpha = 0.7 * signOn;
      ctx.strokeStyle = P.ink;
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(820, 872);
      ctx.bezierCurveTo(842, 858, 856, 884, 874, 868);
      const g = clamp(signOn, 0, 1);
      ctx.bezierCurveTo(886, 856, 894 + 12 * g, 880, 908, 864);
      ctx.stroke();
      ctx.restore();
    }

    // 闪光灯：一次（相机的在右上，手机的在右中）
    const f1 = Math.max(0, 1 - Math.abs(t - 1.35) / 0.12);
    if (f1 > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = f1 * 0.9;
      star(ctx, 1560, 380, 40, 5, 4, '#FFF6DE');
      ctx.globalAlpha = f1 * 0.12;
      ctx.fillStyle = '#FFF6DE'; ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }
    const f2 = Math.max(0, 1 - Math.abs(t - 1.38) / 0.09);
    if (f2 > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = f2 * 0.5;
      star(ctx, 1420, 786, 22, 3, 4, '#FFF6DE');
      ctx.restore();
    }
  },
};