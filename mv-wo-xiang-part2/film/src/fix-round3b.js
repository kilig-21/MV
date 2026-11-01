// 第三轮修复 B 专用工具。只被 v2-03 / v2-07 / v2-09 / v2-10 / v2-16 / v2-17 / o-03 引用。
//
// 这一轮最大的问题是「角色在看镜头，而不是在看他正在做的事」。
// clawd() 的 look 只能把眼位左右平移，画不出「抬眼 / 垂眼」，所以这里在同一套 rig 坐标上
// 补一层可控视线的眼睛：眼心 x = ±3u、y = -6u（= rig 4.5 / 10.5, 9），嘴 y = -3.8u（rig 11.2）。
// 不引入新画法：眼白、瞳孔、高光的尺寸与 character.js 的 dazed / side 完全一致。
import { P } from './palette.js';
import { block, line, poly, rng, clamp, lerp, smooth } from './ink.js';
import { grip } from './character.js';

export const TAU = Math.PI * 2;
export const c01 = v => clamp(v, 0, 1);

// 目标改变后延迟 lag 秒，再用 dur 秒平滑过去。视线永远比身体早。
export function easeTo(t, from, to, start, dur = 0.2, lag = 0) {
  return from + (to - from) * smooth((t - start - lag) / dur);
}

// 一次「到位后停住」的脉冲：u ∈ (0, dur) 时 0→1→0
export function bump(u, dur = 0.3) {
  if (u <= 0 || u >= dur) return 0;
  return Math.sin(u / dur * Math.PI);
}

// ---------------------------------------------------------------- 眼睛

function eyeShape(ctx, x, y, u, o) {
  const body = o.body || P.orange;
  const yaw = o.yaw || 0;
  const pitch = o.pitch || 0;        // <0 抬眼，>0 垂眼
  const lid = c01(o.lid || 0);
  // 眼位本身也跟着偏一点（像 character.js 的 look），再叠瞳孔位移：
  // 只看瞳孔动会显得"眼睛没转"，两个一起动才读得出在看哪儿。
  const ex = x + yaw * 0.13 * u;
  const ey2 = y - pitch * 0.07 * u;
  const px = ex + yaw * 0.26 * u;
  const py = ey2 + pitch * 0.30 * u;
  const st = o.style || 'open';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (st === 'bar') {
    const h = (o.barH || 1.9) * u, w = 0.92 * u;
    ctx.beginPath();
    ctx.roundRect(ex - w / 2, y - h / 2 + (o.barShift || 0) * u, w, h, Math.min(w, h) / 2);
    ctx.fillStyle = P.ink; ctx.fill();
    return;
  }
  if (st === 'shut') {
    ctx.beginPath();
    ctx.lineWidth = 0.26 * u; ctx.strokeStyle = P.ink;
    ctx.arc(x, y - 0.15 * u, 0.55 * u, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
    return;
  }
  if (st === 'smile') {
    ctx.beginPath();
    ctx.lineWidth = 0.34 * u; ctx.strokeStyle = P.ink;
    ctx.arc(x, y + 0.25 * u, 0.62 * u, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    return;
  }
  if (st === 'dot') {
    ctx.beginPath(); ctx.arc(x, y, 0.42 * u, 0, TAU); ctx.fillStyle = P.ink; ctx.fill();
    return;
  }
  if (st === 'squint') {
    ctx.beginPath();
    ctx.moveTo(x - 0.62 * u, y - 0.02 * u);
    ctx.quadraticCurveTo(x, y + 1.0 * u, x + 0.62 * u, y - 0.02 * u);
    ctx.closePath();
    ctx.fillStyle = P.ink; ctx.fill();
    ctx.beginPath();
    ctx.lineWidth = 0.22 * u; ctx.strokeStyle = P.ink;
    ctx.moveTo(x - 0.7 * u, y - 0.13 * u); ctx.lineTo(x + 0.7 * u, y - 0.13 * u);
    ctx.stroke();
    return;
  }

  // 默认：眼白 + 瞳孔（dazed / side 的同一套尺寸）
  const rx = (o.wide || 1) * 0.58 * u, ry = (o.wide || 1) * 0.72 * u;
  ctx.beginPath(); ctx.ellipse(ex, ey2, rx, ry, 0, 0, TAU);
  ctx.fillStyle = o.sclera || P.cream; ctx.fill();
  ctx.lineWidth = 0.13 * u; ctx.strokeStyle = P.ink; ctx.stroke();
  ctx.beginPath(); ctx.arc(px, py, (o.pupil || 0.25) * u, 0, TAU);
  ctx.fillStyle = P.ink; ctx.fill();
  ctx.beginPath(); ctx.arc(px + 0.1 * u, py - 0.1 * u, 0.07 * u, 0, TAU);
  ctx.fillStyle = o.sclera || P.cream; ctx.fill();

  if (lid > 0.01) {
    // 上眼睑：用身体色盖住眼白上半，再压一条墨线
    const lidY = ey2 - ry + lid * ry * 2;
    ctx.save();
    ctx.beginPath(); ctx.ellipse(ex, ey2, rx, ry, 0, 0, TAU); ctx.clip();
    ctx.fillStyle = body;
    ctx.fillRect(ex - rx - 2, ey2 - ry - 2, rx * 2 + 4, lidY - (ey2 - ry) + 2);
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(ex - rx * 0.96, lidY);
    ctx.quadraticCurveTo(ex, lidY + 0.1 * u, ex + rx * 0.96, lidY);
    ctx.lineWidth = 0.13 * u; ctx.strokeStyle = P.ink; ctx.stroke();
  }
}

function eyeTick(ctx, x, y, u, o) {
  // 一根细睫毛 / 感叹线，用在「忽然看见」的一帧
  ctx.beginPath();
  ctx.lineWidth = 0.14 * u; ctx.strokeStyle = P.ink;
  ctx.moveTo(x, y - 0.82 * u); ctx.lineTo(x, y - 1.08 * u);
  ctx.stroke();
}

/**
 * 在 clawd() 之后画一双有视线的眼睛。调用方给 clawd 传 eyes:'none'。
 * o: { cx, by, u, rot, squash, body, style, yaw, pitch, lid, wide, sides:[左,右] }
 */
export function eyesAt(ctx, o) {
  const u = o.u || 26;
  ctx.save();
  ctx.translate(o.cx ?? 960, o.by ?? 800);
  if (o.rot) ctx.rotate(o.rot);
  const sx = o.squash ? 1 / o.squash : 1, sy = o.squash || 1;
  ctx.scale(sx, sy);
  const per = o.sides || [null, null];
  let i = 0;
  for (const side of [-1, 1]) {
    const s = per[i++] || {};
    const x = side * 3 * u;
    const y = -6 * u;
    // 单眼眨眼：s.shut 把这一只眼改成闭眼
    const merged = { ...o, ...s, style: s.shut ? 'shut' : (s.style || o.style) };
    eyeShape(ctx, x, y, u, merged);
    if (s.tick || o.tick) eyeTick(ctx, x, y, u, merged);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- 手与笔

// clawd 的变换链是 translate → rotate → scale，所以局部点先缩放再旋转。
export function handAt(cx, by, u, rot = 0, side = 'left', squash = 1) {
  const g = grip(cx, by, u, side);          // 未变换时的握点
  let dx = g.x - cx, dy = g.y - by;
  const sx = squash ? 1 / squash : 1, sy = squash || 1;
  dx *= sx; dy *= sy;
  const c = Math.cos(rot), s = Math.sin(rot);
  return { x: cx + dx * c - dy * s, y: by + dx * s + dy * c };
}

// 从手心画到笔尖：长度由两点距离决定，永远连在手上。
// 返回实际笔尖位置（用于在纸上落笔），保证"写的线"与"笔尖"是同一个点。
export function penTo(ctx, hand, tip, o = {}) {
  const dx = tip.x - hand.x, dy = tip.y - hand.y;
  const len = Math.hypot(dx, dy) || 1;
  const grip = o.grip ?? 3.05;                             // 握点在笔杆靠近尾端的位置
  const u = clamp(len / (grip + 2.7), o.minU ?? 7, o.maxU ?? 20);
  const th = Math.atan2(hand.x - tip.x, tip.y - hand.y);   // local +y 指向笔尖
  const x = tip.x + 2.7 * u * Math.sin(th);
  const y = tip.y - 2.7 * u * Math.cos(th);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(th);
  block(ctx, -u * 0.22, -u * 3.4, u * 0.44, u * 5.4, u * 0.2, o.color || '#D9A03F',
    { stroke: P.ink, lw: Math.max(3, u * 0.18), seed: o.seed || 630 });
  poly(ctx, [[-u * 0.22, u * 2.0], [u * 0.22, u * 2.0], [0, u * 2.7]], { fill: P.ink, stroke: false });
  // 笔杆上的一圈笔夹，看得出笔尖朝哪儿
  block(ctx, -u * 0.24, -u * 2.1, u * 0.48, u * 0.28, u * 0.1, 'rgba(35,34,39,0.55)', { seed: (o.seed || 630) + 3 });
  ctx.restore();
  return { x: x - 2.7 * u * Math.sin(th), y: y + 2.7 * u * Math.cos(th) };
}

// ---------------------------------------------------------------- 云

// 横向云带：一排互相重叠的扁椭圆（本片云的语言见 scenes-chorus23.cloudBank），
// 剪影天然是起伏的绒边，不是一块硬边板子。下暗上亮两层 + 顶缘一道受光弧。
export function cloudSlab(ctx, o) {
  const x0 = o.x0, x1 = o.x1, y = o.yTop, h = o.h;
  const R = rng(o.seed || 1);
  const n = Math.max(4, Math.round((x1 - x0) / 150));
  const step = (x1 - x0) / n;
  const lumps = [];
  for (let i = 0; i < n; i++) {
    lumps.push({
      cx: x0 + step * (i + 0.5) + (R() * 2 - 1) * step * 0.22,
      cy: y + h * (0.48 + (R() * 2 - 1) * 0.13),
      rx: step * (0.78 + R() * 0.55),
      ry: h * (0.40 + R() * 0.26),
      up: (R() * 2 - 1),
    });
  }
  ctx.save();
  ctx.globalAlpha = o.alpha ?? 0.95;
  // 暗层：整个云带的底
  ctx.fillStyle = o.fill;
  ctx.beginPath();
  for (const L of lumps) ctx.ellipse(L.cx, L.cy, L.rx, L.ry, 0, 0, TAU);
  ctx.fill();
  // 亮层：上半部的受光面
  if (o.light) {
    ctx.globalAlpha = (o.alpha ?? 0.95) * 0.85;
    ctx.fillStyle = o.light;
    ctx.beginPath();
    for (const L of lumps) {
      ctx.ellipse(L.cx + L.rx * 0.08, L.cy - L.ry * 0.42 + L.up * 6, L.rx * 0.74, L.ry * 0.62, 0, 0, TAU);
    }
    ctx.fill();
  }
  // 顶缘受光弧：几段，不连续，免得变成描边
  if (o.rim) {
    ctx.globalAlpha = (o.alpha ?? 0.95) * (o.rimAlpha ?? 0.3);
    ctx.lineWidth = o.rimW ?? 5;
    ctx.strokeStyle = o.rim;
    ctx.lineCap = 'round';
    for (let i = 0; i < lumps.length; i += 2) {
      const L = lumps[i];
      ctx.beginPath();
      ctx.ellipse(L.cx, L.cy - L.ry * 0.42 + L.up * 6, L.rx * 0.72, L.ry * 0.58,
        0, Math.PI * 1.12, Math.PI * 1.86);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- 桌面

// 斜着铺开的桌面：远边两端 y 不同，镜头在左侧就左低右高，反之亦然。
export function deskPlane(ctx, o = {}) {
  const farL = o.farL ?? 560, farR = o.farR ?? 430;
  ctx.fillStyle = o.wall || '#4A3A30';
  ctx.fillRect(0, 0, 1920, 1080);
  // 墙面顶部的暗带，免得整块墙一样亮
  ctx.fillStyle = o.wallLow || '#42342B';
  ctx.fillRect(0, 0, 1920, 150);
  poly(ctx, [[0, farL], [1920, farR], [1920, 1080], [0, 1080]],
    { fill: o.top || '#6E4E3A', seed: o.seed || 1830 });
  line(ctx, 0, farL, 1920, farR, { seed: (o.seed || 1830) + 1, lw: 6, color: P.ink });
  // 桌面的透视接缝：顺着远边斜率走，营造角度
  for (let i = 1; i <= 3; i++) {
    const y0 = lerp(farL, 1080, i / 4.2);
    line(ctx, 0, y0, 1920, farR + (y0 - farL), { seed: (o.seed || 1830) + 10 + i, lw: 1.6, color: 'rgba(35,34,39,0.16)' });
  }
  // 桌面反光：一条很淡的横向亮带
  if (o.sheen !== false) {
    ctx.save();
    ctx.globalAlpha = 0.10;
    poly(ctx, [[120, farL + 60], [1500, farR + 40], [1560, farR + 120], [90, farL + 140]],
      { fill: '#F6C97E', stroke: false });
    ctx.restore();
  }
}
