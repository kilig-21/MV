// 第二轮补充：两处"近乎静止"镜头用的呼吸细节
// 只被 shots/v1-14.js、shots/v2-09.js 引用，不碰已有共享模块。
// 所有函数都是纯绘制，不改变角色比例、场景布局。
import { clamp, hash } from './ink.js';

/**
 * 灯晕：亮度和半径一起缓慢呼吸。
 * 用 'lighter' 叠暖光，alpha 的正弦让帧间差异落在很大的面积上，
 * 画面上看只是灯"轻轻起伏"，不是加动作。
 * o: { x, y, r, period, alpha, swell, rSwell, phase, fade, rgb }
 */
export function lampGlow(ctx, t, o = {}) {
  const x = o.x ?? 880, y = o.y ?? 380, r = o.r ?? 900;
  const period = o.period ?? 1.7;
  const base = (o.alpha ?? 0.16) * clamp(o.fade ?? 1, 0, 1);
  if (base <= 0.0005) return;
  const swell = o.swell ?? 0.5;
  const ph = (o.phase ?? 0) * Math.PI * 2 + (t / period) * Math.PI * 2;
  const a = base * (0.5 + swell * (0.5 + 0.5 * Math.sin(ph)));
  const rr = r * (1 + (o.rSwell ?? 0.02) * Math.sin(ph + 0.7));
  const [cr, cg, cb] = o.rgb ?? [246, 201, 126];
  const tint = al => `rgba(${cr},${cg},${cb},${Math.max(0, al).toFixed(4)})`;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
  g.addColorStop(0, tint(a));
  g.addColorStop(0.45, tint(a * 0.52));
  g.addColorStop(1, tint(0));
  ctx.fillStyle = g;
  ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  ctx.restore();
}

/**
 * 一辆车从窗外开过：一条暖白的光带扫过矩形区域，
 * spill 是窗框外墙上/屋里的一点余光。
 * 返回 0–1 的包络（没在扫的时候是 0）。
 * o: { x, y, w, h, start, dur, dir, peak, band, rgb, spill }
 */
export function carSweep(ctx, t, o = {}) {
  const { x, y, w, h } = o;
  const start = o.start ?? 0;
  const dur = o.dur ?? 0.7;
  const u = (t - start) / dur;
  if (u <= 0 || u >= 1) return 0;
  const env = Math.sin(Math.PI * u);
  const dir = o.dir ?? 1;
  const band = o.band ?? 260;
  const peak = (o.peak ?? 0.45) * env;
  const cx = (dir > 0 ? x - band : x + w + band) + (dir > 0 ? 1 : -1) * (w + band * 2) * u;
  const [cr, cg, cb] = o.rgb ?? [255, 240, 208];
  const tint = al => `rgba(${cr},${cg},${cb},${Math.max(0, al).toFixed(4)})`;

  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(cx - band, y - h * 0.3, cx + band, y + h * 1.3);
  g.addColorStop(0, tint(0));
  g.addColorStop(0.5, tint(peak));
  g.addColorStop(1, tint(0));
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  // 窗外的余光：屋里随着车过亮一下
  if (o.spill) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const ry = y + h * 0.5;
    const rs = band * 2.4;
    const g2 = ctx.createRadialGradient(cx, ry, 0, cx, ry, rs);
    g2.addColorStop(0, tint(peak * o.spill));
    g2.addColorStop(1, tint(0));
    ctx.fillStyle = g2;
    ctx.fillRect(cx - rs, ry - rs * 0.7, rs * 2, rs * 1.4);
    ctx.restore();
  }
  return env;
}

/**
 * 光柱里慢慢飘的灰：每颗有自己的速度、横摆相位和忽明忽暗。
 * o: { x, y, w, h, count, seed, alpha, rise, rgb }
 */
export function dustMotes(ctx, t, o = {}) {
  const { x, y, w, h, count = 22, seed = 1 } = o;
  const rgb = o.rgb ?? [255, 236, 200];
  const alpha = o.alpha ?? 0.34;
  const rise = o.rise ?? 8;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < count; i++) {
    const a1 = hash(seed + i, 1), a2 = hash(seed + i, 2);
    const a3 = hash(seed + i, 3), a4 = hash(seed + i, 4);
    const sp = rise * (0.45 + a1 * 1.1);
    const px = x + a2 * w + Math.sin(t * (0.35 + a3 * 0.45) + a4 * 6.283) * (6 + a4 * 12);
    const py = y + h - ((a3 * h + t * sp) % h);
    const rad = 1.1 + a1 * 1.9;
    const tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * (1.6 + a2 * 1.6) + a4 * 6.283));
    ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(alpha * tw).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

/**
 * 阻尼回弹：合上/放下之后的一次很轻的弹动（逐渐衰减）。
 * u 从 at 开始计时，amp 是初始幅度，freq 是每秒振荡次数，damp 是衰减时间常数。
 */
export function rebound(t, at, amp = 0.05, freq = 24, damp = 0.12) {
  const u = t - at;
  if (u <= 0) return 0;
  return amp * Math.exp(-u / damp) * Math.sin(u * freq);
}