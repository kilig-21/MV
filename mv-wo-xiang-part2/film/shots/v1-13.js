import { carriage } from '../src/scenes.js';
import { clawd, groundShadow } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, block } from '../src/ink.js';
import { breathe, sway, gesture, weightShift } from '../src/polish-v1.js';
import { faceE1, dart } from '../src/expr-e1.js';

// 乘客各自的时间轴：停下看手机的人，运动时间要扣掉停顿
function movingTime(t, pauses = []) {
  let s = t;
  for (const [a, b] of pauses) if (t > a) s -= Math.min(t - a, b - a);
  return s;
}

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const d = shot.t1 - shot.t0;
    const m = carriage(ctx, gt, { scroll: gt * 50 });

    // 车门打开时涌进来的站台光（接上一镜的到站）
    const doorLight = smooth(t / 0.25) * (1 - smooth((t - 1.5) / 0.6));
    if (doorLight > 0) {
      ctx.save();
      ctx.globalAlpha = 0.14 * doorLight;
      ctx.fillStyle = '#CFE6EA';
      ctx.fillRect(1160, 120, 420, 900);
      ctx.globalAlpha = 0.08 * doorLight;
      ctx.fillStyle = '#F6C97E';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }

    // ---- 人群：方向、深度、步频、是否走神都不同 ----
    const people = [
      { x0: 2040, dir: -1, sp: 470, y: 806, seed: 130, col: P.sage, pause: [[0.62, 1.34]] },
      { x0: -180, dir: 1, sp: 360, y: 822, seed: 131, col: P.pink, pause: [] },
      { x0: 1500, dir: -1, sp: 330, y: 858, seed: 132, col: P.lav, pause: [], glance: [1.05, 1.5] },
      { x0: 2280, dir: -1, sp: 510, y: 872, seed: 133, col: P.mustard, pause: [] },
      { x0: -320, dir: 1, sp: 430, y: 890, seed: 134, col: P.teal, pause: [[1.72, 2.02]], bump: true },
      { x0: 1030, dir: 1, sp: 300, y: 846, seed: 135, col: '#C9A96E', pause: [] },
      { x0: -80, dir: 1, sp: 390, y: 912, seed: 136, col: '#8FAE9A', pause: [] },
      { x0: 1900, dir: -1, sp: 280, y: 930, seed: 137, col: '#B98A83', pause: [[0.3, 0.55]] },
    ].sort((a, b) => a.y - b.y);

    people.forEach((q, i) => {
      const u = 13 + (q.y - 780) * 0.06;
      const tt = movingTime(t, q.pause);
      const range = 2800;
      let x = q.x0 + q.dir * q.sp * tt;
      x = ((x + 300) % range + range) % range - 300;
      const stopped = q.pause.some(([a, b]) => t >= a && t < b);
      const hz = 10 + (q.seed % 5) * 0.9;
      const ph = t * hz + q.seed * 0.7;
      const legs = [Math.sin(ph), Math.sin(ph + Math.PI), Math.sin(ph + 1.15), Math.sin(ph + Math.PI + 1.15)]
        .map(v => v * (stopped ? 0.03 : 0.19));
      const bob = stopped ? breathe(t, q.seed, u, { amp: 0.1 }) : Math.abs(Math.sin(ph)) * 2.6;
      const bump = q.bump && t > 1.72 && t < 2.1;
      const stumble = bump ? Math.max(0, 1 - Math.abs(t - 1.86) / 0.12) : 0;

      // 路人也有 2–3 帧的过渡：停下来看手机、回头、被撞一下，都不是一帧切过去
      const pKeys = [{ at: 0.00, eyes: 'normal', mouth: 'none' }];
      for (const [a, b] of q.pause) {
        pKeys.push({ at: a, eyes: 'look', mouth: 'none', ramp: 0.10 },
          { at: b, eyes: 'normal', mouth: 'none', ramp: 0.12 });
      }
      if (q.glance) pKeys.push({ at: q.glance[0], eyes: 'side', mouth: 'none', ramp: 0.12 },
        { at: q.glance[1], eyes: 'normal', mouth: 'none', ramp: 0.12 });
      if (q.bump) pKeys.push({ at: 1.78, eyes: 'wide', mouth: 'o', ramp: 0.08 },
        { at: 2.04, eyes: 'normal', mouth: 'none', ramp: 0.14 });
      const pf = faceE1(t, pKeys, { seed: q.seed, ramp: 0.12, blinkFrom: 0.2 });

      if (q.y > 880) groundShadow(ctx, x, q.y + 4, u, { alpha: 0.10, w: 5.6 });
      clawd(ctx, {
        cx: x, by: q.y - bob + stumble * 4, u,
        color: q.col,
        eyes: pf.eyes,
        mouth: pf.mouth,
        look: q.dir,
        seed: q.seed,
        legs: [legs[0], legs[1], legs[2], legs[3]],
        armL: -0.08 + legs[0] * 0.5,
        armR: -0.08 - legs[1] * 0.5,
        rot: (stopped ? 0.02 : 0) + stumble * 0.05,
        flip: q.dir < 0,
        squash: 1 + stumble * 0.01,
      });
      // 停下来看手机的那只：手里一块亮屏
      if (stopped) {
        block(ctx, x + q.dir * 28 - 14, q.y - 4.6 * u, 28, 44, 5, '#2C2F36', { stroke: P.ink, lw: 3, seed: 140 + i });
        block(ctx, x + q.dir * 28 - 10, q.y - 4.6 * u + 5, 20, 34, 3, '#DCE9EC', { seed: 150 + i });
      }
      // 蹭到主角的那只：肩膀过去时轻轻一撞
      if (bump && x > 1500 && x < 1690) {
        ctx.save();
        ctx.globalAlpha = 0.5 * stumble;
        ctx.strokeStyle = P.ink;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(1600, 790);
        ctx.lineTo(1582, 800);
        ctx.stroke();
        ctx.restore();
      }
    });

    // ---- 主角：被挤在门边 ----
    const squeeze = smooth(t / 0.9);
    const jostle = Math.sin(t * 9) * 3 * squeeze;
    const bob = breathe(t, 99, 22, { amp: 0.16 });
    const shift = weightShift(t, 99, { amp: 2.4 });
    const brush = Math.max(0, 1 - Math.abs(t - 1.86) / 0.18);       // 被人擦过

    const f = faceE1(t, [
      { at: 0.00, eyes: 'tired', mouth: 'flat' },
      { at: 0.40, eyes: 'closed', mouth: 'flat', ramp: 0.10 },    // 被人挤得闭一下眼
      { at: 0.62, eyes: 'tired', mouth: 'flat', ramp: 0.10 },
      { at: 1.34, eyes: 'side', mouth: 'none', ramp: 0.16 },      // 斜眼扫一下周围
      { at: 2.34, eyes: 'dazed', mouth: 'none', brow: 'worried', ramp: 0.22 },
    ], { seed: 99, ramp: 0.16, blinkFrom: 0.8, noBlinkIn: [[0.34, 0.72], [1.2, 1.5], [2.3, 2.7]] });

    // 抬手看手机（8:30）→ 放下 → 抬头看人
    const raise = gesture(t, 1.02, 0.2, { pre: 0.14, over: 0.06 }) * (1 - smooth((t - 1.95) / 0.22));
    const look = f.blinking ? 0 : dart(t, [
      { t: 0.00, look: -0.55 },
      { t: 1.30, look: -0.95 },
      { t: 2.06, look: 0.60 },
    ], { dur: 0.11 });

    groundShadow(ctx, 1620, 902, 22, { alpha: 0.18 });
    clawd(ctx, {
      cx: 1620 + jostle + shift * 0.5 + brush * 4, by: 900 - bob, u: 22,
      color: P.orange,
      eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
      look,
      seed: 99,
      armL: -0.12 - 0.5 * raise,
      armR: sway(t, 101, { amp: 0.05 }) + brush * 0.1,
      legs: [0, -0.04, 0, -0.04],
      rot: -0.02 * squeeze + Math.sin(t * 9) * 0.008 * squeeze + brush * 0.02,
      squash: 0.968 + bob * 0.002,
    });

    // 手机在他左手里：屏幕上是 8:30
    if (raise > 0.05) {
      const px = 1620 + jostle - 8.2 * 22;
      const py = 900 - bob - 4.6 * 22 - 20 * raise;
      ctx.save();
      ctx.globalAlpha = Math.min(1, raise * 1.6);
      ctx.translate(px, py);
      ctx.rotate(-0.08 - 0.05 * raise);
      block(ctx, -46, -70, 92, 140, 14, '#2C2F36', { stroke: P.ink, lw: 5, seed: 155 });
      block(ctx, -38, -62, 76, 124, 9, '#DCE9EC', { stroke: P.ink, lw: 3, seed: 156 });
      ctx.fillStyle = '#2B2A2E';
      ctx.font = '700 38px NotoSansSC';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('8:30', 0, 4);
      ctx.fillStyle = '#8A7E6A'; ctx.font = '400 15px NotoSansSC';
      ctx.fillText('晚安', 0, 42);
      ctx.restore();
      // 屏幕光落在它脸上
      ctx.save();
      ctx.globalAlpha = 0.10 * raise;
      ctx.fillStyle = '#CFE6EA';
      ctx.fillRect(1450, 760, 260, 180);
      ctx.restore();
    }
  },
};