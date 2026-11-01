// verse2 打磨用的表演手法：呼吸、眨眼、预备—过量—回落，以及「曾经有人」的小道具。
// 共享模块不动，这里只补充镜头里缺的东西。
import { P } from './palette.js';
import { block, line, clamp, lerp, smooth, easeOut } from './ink.js';

// 呼吸：一直有、看不太出来。phase/freq 每个角色都不同，避免同频。
export function breathe(t, phase = 0, freq = 0.85, amp = 1.6) {
  return Math.sin((t * freq + phase) * Math.PI * 2) * amp;
}

// 眨眼：1–2 帧。times 用镜头内秒数；情绪最高点不要传。
export function blink(t, times, hold = 0.085) {
  for (const b of times) if (t >= b && t < b + hold) return true;
  return false;
}

// 表情切换：在切换点闪过 2 帧闭眼，避免瞬间跳变。
export function morph(t, at, from, to, hold = 0.085) {
  if (t < at - hold) return from;
  if (t < at + hold) return 'closed';
  return to;
}

// 单次脉冲：u ∈ (0, dur) 时 0→1→0，用来做点头、气口、敲笔。
export function pulse(u, dur = 0.3) {
  if (u <= 0 || u >= dur) return 0;
  return Math.sin(u / dur * Math.PI);
}

// 预备—过量—回落：返回 0 → 1+over → 1。u 为相对动作开始的时间。
// antic 秒内先反向准备，dur 秒内到位并过冲，随后 0.14 秒回落。
export function gesture(u, o = {}) {
  const antic = o.antic ?? 0.12;
  const dur = o.dur ?? 0.28;
  const over = o.over ?? 0.05;
  if (u <= -antic) return 0;
  if (u < 0) return -0.06 * smooth((u + antic) / antic);
  if (u < dur) return easeOut(u / dur) * (1 + over);
  const back = (u - dur) / 0.14;
  if (back < 1) return lerp(1 + over, 1, smooth(back));
  return 1;
}

// 半杯冷掉的咖啡：杯口一点旧渍，没有热气 —— 「曾经有人」。
export function halfCup(ctx, x, y, u, o = {}) {
  const seed = o.seed || 701;
  // 杯底在长椅面上留下的浅圈
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.beginPath();
  ctx.ellipse(x, y + u * 0.18, u * 1.7, u * 0.38, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#241A14';
  ctx.fill();
  ctx.restore();
  // 杯身
  block(ctx, x - u * 1.15, y - u * 2.0, u * 2.3, u * 2.05, u * 0.3, '#E8DCC4',
    { stroke: P.ink, lw: Math.max(3, u * 0.22), seed });
  // 只剩一半的冷咖啡
  block(ctx, x - u * 1.03, y - u * 1.05, u * 2.06, u * 0.92, u * 0.16, '#4A3226', { seed: seed + 1 });
  // 杯口
  ctx.beginPath();
  ctx.ellipse(x, y - u * 2.0, u * 1.15, u * 0.32, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#D6C8AE'; ctx.fill();
  ctx.lineWidth = Math.max(3, u * 0.2); ctx.strokeStyle = P.ink; ctx.stroke();
  // 杯沿上一点旧口红印
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.arc(x + u * 0.42, y - u * 2.06, u * 0.24, Math.PI * 0.15, Math.PI * 0.85);
  ctx.lineWidth = Math.max(2, u * 0.14);
  ctx.strokeStyle = '#C9657A'; ctx.stroke();
  ctx.restore();
  // 把手
  ctx.beginPath();
  ctx.lineWidth = Math.max(3, u * 0.2); ctx.strokeStyle = P.ink;
  ctx.arc(x + u * 1.25, y - u * 1.15, u * 0.55, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
}

// 扣在长椅上的相框：背面朝上，露出照片一角（两个人）—— 空位不是一开始就空的。
export function flippedFrame(ctx, x, y, w, h, rot = 0.1, seed = 710) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  // 从底下露出的一角照片
  ctx.save();
  ctx.globalAlpha = 0.9;
  block(ctx, -w * 0.52, -h * 0.55, w * 0.3, h * 0.5, 3, '#E8DCC4', { seed: seed + 5 });
  ctx.beginPath();
  ctx.arc(-w * 0.36, -h * 0.36, w * 0.07, 0, Math.PI * 2);
  ctx.fillStyle = '#DE886D'; ctx.fill();
  ctx.beginPath();
  ctx.arc(-w * 0.24, -h * 0.35, w * 0.06, 0, Math.PI * 2);
  ctx.fillStyle = '#E8A0A8'; ctx.fill();
  ctx.restore();
  // 相框背面
  block(ctx, -w / 2, -h, w, h, 6, '#6E4A34', { stroke: P.ink, lw: 4, seed });
  block(ctx, -w / 2 + 8, -h + 8, w - 16, h - 16, 4, '#5A3C2A', { seed: seed + 1 });
  // 收起来的小支架
  line(ctx, -w * 0.18, -h + 12, -w * 0.3, 4, { seed: seed + 2, lw: 5, color: P.ink });
  ctx.restore();
}

// v2-11 用：只画墙，四张封面由镜头自己一张张放下。
export function albumWallStage(ctx) {
  ctx.fillStyle = '#2A2320'; ctx.fillRect(0, 0, 1920, 1080);
  ctx.fillStyle = '#4A3E34'; ctx.fillRect(0, 0, 1920, 900);
  line(ctx, 0, 900, 1920, 900, { seed: 1901, lw: 6, color: P.ink });
  ctx.fillStyle = '#3A3028'; ctx.fillRect(0, 900, 1920, 180);
}

// 一张唱片封面从上方落下、落地压一下。k 为 0..1 的落程。
export function droppingCover(ctx, x, y, w, h, k, color, seed) {
  const drop = (1 - easeOut(k)) * 300;
  const squash = k >= 1 ? 1 : 1;
  const land = clamp((k - 0.92) / 0.08, 0, 1);
  const sy = 1 - 0.05 * Math.sin(land * Math.PI);
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2 - drop);
  ctx.rotate((1 - easeOut(k)) * 0.12);
  ctx.scale(1, sy * squash);
  block(ctx, -w / 2, -h / 2, w, h, 4, color, { stroke: P.ink, lw: 7, seed });
  block(ctx, -w / 2 + 20, -h / 2 + 20, w - 40, h - 90, 3, 'rgba(0,0,0,0.12)', { seed: seed + 1 });
  block(ctx, -w / 2 + 20, h / 2 - 58, w - 40, 16, 4, '#F2E3C6', { seed: seed + 2 });
  block(ctx, -w / 2 + 20, h / 2 - 34, w - 120, 10, 4, 'rgba(242,227,198,0.7)', { seed: seed + 3 });
  ctx.restore();
}