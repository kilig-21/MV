// 第三轮修复 A 的共用表演原语。
// 这一轮反复出现的四件事，做成可复用的小函数，避免 8 个镜头各写一套：
//   1) 视线先到：眼睛滞后 0.10–0.15 s 再平滑过去（转调 life.gaze）；
//   2) 屏幕特写取景：整块手机屏按比例放大平移，并返回坐标映射给叠加层用；
//   3) 抬头：1–2 帧向下预备 → 抬起 → 一点过冲（角色没有独立头部，用全身给）；
//   4) 三帧睁眼 + 一条「视线落点」的点线。
import { clamp, lerp, easeOut } from './ink.js';
import { gaze as lifeGaze } from './life.js';

// 视线：at 是「目标出现」的时刻。lag 给 0.10–0.15 s（眼睛先动），ramp 是眼睛平滑过去的时间。
export function lookAt(t, at, from, to, o = {}) {
  return lifeGaze(t - at, { from, to, lag: o.lag ?? 0.12, ramp: o.ramp ?? 0.14 });
}

// 屏幕特写：把固定坐标画出来的手机界面整体放大 / 平移，返回场景坐标 → 画面坐标的映射。
// 叠加层（点击涟漪、高光、弹层）必须用返回的 x()/y() 或同样的 scale 画，否则会错位。
export function framedScene(ctx, draw, o = {}) {
  const scale = o.scale ?? 1;
  const tx = o.tx ?? 0;
  const ty = o.ty ?? 0;
  const ax = o.ax ?? 960, ay = o.ay ?? 540;
  ctx.save();
  ctx.translate(tx, ty);
  ctx.translate(ax, ay);
  ctx.scale(scale, scale);
  ctx.translate(-ax, -ay);
  draw(ctx);
  ctx.restore();
  return {
    scale,
    x: v => tx + ax + (v - ax) * scale,
    y: v => ty + ay + (v - ay) * scale,
  };
}

/**
 * 抬头。角色没有独立头部，用「整体上浮 + 轻微后仰 + 身体拉长」三件事一起给。
 * 返回可直接喂给 clawd 的量：
 *   k      0=原样，会先到 -0.12（向下预备 1–2 帧），再到 1+over，最后稳在 1
 *   rot    by 用的旋转偏移（负=后仰）
 *   rise   rig 单位，负=身体上浮（乘 u 当像素用）
 *   squash 身体拉长
 */
export function headLift(t, at, o = {}) {
  const pre = o.pre ?? 0.12;
  const dur = o.dur ?? 0.26;
  const over = o.over ?? 0.18;
  const t0 = at - pre;
  let k = 0;
  if (t > t0) {
    if (t < at) k = -0.12 * easeOut((t - t0) / pre);
    else if (t < at + dur) k = lerp(-0.12, 1 + over, easeOut((t - at) / dur));
    else k = lerp(1 + over, 1, easeOut(clamp((t - at - dur) / 0.30, 0, 1)));
  }
  return {
    k,
    rot: -(o.rotAmp ?? 0.042) * k,
    rise: -(o.riseAmp ?? 0.5) * k,
    squash: 1 + (o.squashAmp ?? 0.028) * k,
  };
}

// 三帧睁眼：closed → squint → tired → look（每帧 1/24 s）
export function openEyes(t, at) {
  const dt = t - at;
  if (dt < 0) return 'closed';
  if (dt < 0.042) return 'squint';
  if (dt < 0.084) return 'tired';
  return 'look';
}

// 视线落点：从脸到目标的一串小点，k=0..1 时由近及远逐颗出现。
// 用于「抬头看牌子」「看海报」这种需要一个可见落点的时刻。
export function sightDots(ctx, from, to, o = {}) {
  const k = clamp(o.k ?? 0, 0, 1);
  if (k <= 0.001) return;
  const n = o.n ?? 6;
  ctx.save();
  ctx.fillStyle = o.color ?? '#F1D9A8';
  for (let i = 1; i <= n; i++) {
    const u = (i / (n + 1)) * k;
    if (u <= 0.02) continue;
    const x = lerp(from[0], to[0], u);
    const y = lerp(from[1], to[1], u);
    ctx.globalAlpha = (o.alpha ?? 0.5) * Math.min(1, k * 1.6) * (1 - u * 0.55);
    ctx.beginPath();
    ctx.arc(x, y, (o.r ?? 4) * (1 - u * 0.42), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}