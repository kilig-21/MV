import { phoneApps } from '../src/scenes2.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, block, clamp } from '../src/ink.js';
import { breathe, sway, gesture, weightShift } from '../src/polish-v1.js';
import { faceE1, dart } from '../src/expr-e1.js';
import { framedScene } from '../src/fix-round3a.js';

const TAPS = [0.34, 1.04, 1.74];

// 评审 B：v1-16 角色贴右画框、右臂出画，屏幕也只占 58%。屏幕放大到 60%、左移一点，
// 角色整体收到 x≈0.90 且右臂离框 8 px。
const VIEW = { scale: 1.03, tx: 0, ty: 0, ax: 960, ay: 540 };

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const d = shot.t1 - shot.t0;

    ctx.fillStyle = '#141C22';
    ctx.fillRect(0, 0, 1920, 1080);
    const map = framedScene(ctx, c => phoneApps(c, gt), VIEW);

    // 从健身房带进来的那一点绿光，很快退掉
    const gymLight = 1 - smooth(t / 0.45);
    if (gymLight > 0) {
      ctx.save();
      ctx.globalAlpha = 0.10 * gymLight;
      ctx.fillStyle = '#8FE0C8';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }

    // 三次点击：每次都有抬手前的预备与点完的回弹
    let tap = 0;
    TAPS.forEach(at => {
      if (t <= at - 0.12) return;
      let g = gesture(t, at, 0.1, { pre: 0.12, over: 0.14, settle: 0.1 });
      g -= 0.3 * smooth((t - at - 0.1) / 0.12);
      tap = Math.max(tap, clamp(g, -0.2, 1.15));
    });
    const deflate = smooth((t - 2.12) / 0.4);

    const bob = breathe(t, 108, 30, { amp: 0.16 });
    const shift = weightShift(t, 108, { amp: 2 });

    const f = faceE1(t, [
      { at: 0.00, eyes: 'tired', mouth: 'flat' },
      { at: 0.30, eyes: 'squint', mouth: 'flat', ramp: 0.13 },     // 盯着第一个图标
      { at: 1.20, eyes: 'dazed', mouth: 'none', ramp: 0.20 },      // 中间走神
      { at: 2.10, eyes: 'tired', mouth: 'pout', brow: 'worried', ramp: 0.20 },
    ], { seed: 108, ramp: 0.18, blinkFrom: 0.7, noBlinkIn: [[0.25, 0.5], [0.95, 1.2], [1.65, 1.9]] });

    // 视线在三个图标之间「点一下、看一眼」，都没离开屏幕
    const look = f.blinking ? 0 : dart(t, [
      { t: 0.00, look: -1.00 },
      { t: 0.34, look: -0.55 },
      { t: 1.04, look: -0.15 },
      { t: 1.24, look: 0.35 },
      { t: 1.74, look: -0.40 },
      { t: 2.10, look: -0.85 },
    ], { dur: 0.10 });

    // 角色完整：右缘 1912，离框 8 px；左缘 1567，与屏幕外框（1557）留 10 px
    clawd(ctx, {
      cx: 1740 + shift * 0.4 - tap * 4,
      by: 1080 - bob + deflate * 3,
      u: 23,
      color: P.orange,
      eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
      look,
      seed: 108,
      armL: -0.1 - 0.62 * tap * (1 - deflate * 0.85),
      armR: sway(t, 109, { amp: 0.04 }),
      rot: -0.008 * tap + deflate * 0.012,
      squash: 0.996 - deflate * 0.01,
    });

    // 每个图标亮一下：光圈 + 一次点击涟漪（跟着屏幕一起缩放）
    TAPS.forEach((at, i) => {
      const ax = map.x(560 + i * 300 + 110);
      const ay = map.y(440);
      const k = smooth((t - at) / 0.16);
      if (k <= 0) return;
      const fade = 1 - smooth((t - at - 0.4) / 0.5) * 0.7;
      const sz = 236 * map.scale;
      ctx.save();
      ctx.globalAlpha = 0.30 * k * fade;
      block(ctx, ax - sz / 2, ay - sz / 2, sz, sz, 52, '#FFF6DE', { seed: 1540 + i });
      ctx.globalAlpha = 0.5 * k * fade;
      ctx.strokeStyle = P.cream;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ax, ay, (118 + 16 * (1 - k)) * map.scale, 0, Math.PI * 2);
      ctx.stroke();
      const ringK = clamp((t - at) / 0.3, 0, 1);
      if (ringK < 1) {
        ctx.globalAlpha = 0.45 * (1 - ringK);
        ctx.beginPath();
        ctx.arc(ax, ay, (26 + 58 * ringK) * map.scale, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    });

    // 进度条：点开一个，就多走一点
    const prog = [0.7, 0.4, 0.55];
    TAPS.forEach((at, i) => {
      const k = smooth((t - at) / 0.5);
      if (k <= 0) return;
      const w = 220 * (prog[i] + 0.06 * k) * map.scale;
      ctx.save();
      ctx.globalAlpha = 0.55 * k;
      block(ctx, map.x(560 + i * 300), map.y(630), w, 18 * map.scale, 9, '#F2C97E', { seed: 1530 + i });
      ctx.restore();
    });

    // 屏幕熄灭：接下一镜的床沿海报
    const off = smooth((t - 2.2) / 0.3);
    if (off > 0) {
      ctx.save();
      ctx.globalAlpha = 0.9 * off;
      ctx.fillStyle = '#0C1116';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }
  },
};