// 道具：独立物件，挂在挂载点或场景里，从不为了拿东西改身体
import { P } from './palette.js';
import { block, line, poly } from './ink.js';

// 通用：以 (x,y) 为中心，s = 每 rig 单位像素
export function headphones(ctx, cx, bodyTop, u, o = {}) {
  const col = o.color || P.tealDeep;
  const cy = bodyTop + u * 0.9;       // 耳罩中心：身体顶部下方一点
  ctx.save();
  // 头梁：贴着身体顶部
  ctx.beginPath();
  ctx.lineWidth = u * 0.34;
  ctx.strokeStyle = P.ink;
  ctx.arc(cx, cy, u * 5.6, Math.PI * 1.03, Math.PI * 1.97);
  ctx.stroke();
  ctx.beginPath();
  ctx.lineWidth = u * 0.18;
  ctx.strokeStyle = col;
  ctx.arc(cx, cy, u * 5.6, Math.PI * 1.03, Math.PI * 1.97);
  ctx.stroke();
  // 耳罩：略高于身体中线，夹在两侧
  for (const s of [-1, 1]) {
    block(ctx, cx + s * 6.5 * u - u * 0.72, cy - u * 1.1, u * 1.44, u * 2.2, u * 0.66, col,
      { stroke: P.ink, lw: Math.max(3, u * 0.22), seed: 610 + s, amp: u * 0.04 });
  }
  ctx.restore();
}

export function phone(ctx, x, y, u, o = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(o.rot || 0);
  block(ctx, -u * 1.5, -u * 2.6, u * 3.0, u * 5.2, u * 0.45, '#2C2F36',
    { stroke: P.ink, lw: Math.max(3, u * 0.22), seed: 620 });
  block(ctx, -u * 1.2, -u * 2.25, u * 2.4, u * 4.4, u * 0.25, o.screen || '#DCE9EC',
    { stroke: P.ink, lw: Math.max(2, u * 0.12), seed: 621 });
  if (o.glow) {
    ctx.globalAlpha = 0.5; ctx.fillStyle = '#CDE7EE';
    ctx.fillRect(-u * 1.2, -u * 2.25, u * 2.4, u * 4.4);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

export function pen(ctx, x, y, u, rot = -0.5) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  block(ctx, -u * 0.22, -u * 3.4, u * 0.44, u * 5.4, u * 0.2, '#D9A03F',
    { stroke: P.ink, lw: Math.max(3, u * 0.18), seed: 630 });
  poly(ctx, [[-u * 0.22, u * 2.0], [u * 0.22, u * 2.0], [0, u * 2.7]], { fill: P.ink, stroke: false });
  ctx.restore();
}

export function letter(ctx, x, y, u, o = {}) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(o.rot || 0);
  block(ctx, -u * 2.4, -u * 1.6, u * 4.8, u * 3.2, u * 0.15, o.color || P.cream,
    { stroke: P.ink, lw: Math.max(3, u * 0.2), seed: 640 + (o.seed || 0) });
  ctx.beginPath();
  ctx.moveTo(-u * 2.4, -u * 1.6); ctx.lineTo(0, u * 0.2); ctx.lineTo(u * 2.4, -u * 1.6);
  ctx.lineWidth = Math.max(2, u * 0.14); ctx.strokeStyle = P.ink; ctx.stroke();
  if (o.stamp) {
    block(ctx, u * 1.2, -u * 1.25, u * 0.85, u * 0.95, u * 0.1, P.pink,
      { stroke: P.ink, lw: Math.max(2, u * 0.1), seed: 641 });
  }
  ctx.restore();
}

export function pillBottle(ctx, x, y, u, o = {}) {
  ctx.save();
  ctx.translate(x, y);
  block(ctx, -u * 1.5, -u * 2.2, u * 3.0, u * 4.4, u * 0.4, '#D8CFB6',
    { stroke: P.ink, lw: Math.max(3, u * 0.22), seed: 650 });
  block(ctx, -u * 1.6, -u * 3.0, u * 3.2, u * 1.0, u * 0.3, '#4E8FA3',
    { stroke: P.ink, lw: Math.max(3, u * 0.22), seed: 651 });
  block(ctx, -u * 1.0, -u * 0.9, u * 2.0, u * 1.8, u * 0.1, P.cream, { seed: 652 });
  ctx.restore();
}

export function coffee(ctx, x, y, u, o = {}) {
  ctx.save();
  ctx.translate(x, y);
  block(ctx, -u * 1.2, -u * 2.0, u * 2.4, u * 3.4, u * 0.3, '#E8DCC4',
    { stroke: P.ink, lw: Math.max(3, u * 0.2), seed: 660 });
  block(ctx, -u * 1.2, -u * 2.0, u * 2.4, u * 0.7, u * 0.2, '#8C625E', { stroke: P.ink, lw: Math.max(3, u * 0.18), seed: 661 });
  ctx.beginPath();
  ctx.lineWidth = Math.max(3, u * 0.18); ctx.strokeStyle = P.ink;
  ctx.arc(u * 1.35, -u * 0.4, u * 0.7, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.restore();
}

export function notebook(ctx, x, y, u, o = {}) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(o.rot || 0);
  block(ctx, -u * 2.6, -u * 1.8, u * 5.2, u * 3.6, u * 0.15, '#F2E3C6',
    { stroke: P.ink, lw: Math.max(3, u * 0.2), seed: 670 });
  for (let i = 0; i < 4; i++) line(ctx, -u * 1.9, -u * 1.0 + i * u * 0.62, u * 1.6, -u * 1.0 + i * u * 0.62,
    { seed: 671 + i, lw: Math.max(1.5, u * 0.08), color: '#A78E6C', amp: u * 0.03 });
  ctx.restore();
}

export function suitcase(ctx, x, y, u, o = {}) {
  ctx.save();
  ctx.translate(x, y);
  block(ctx, -u * 2.4, -u * 4.2, u * 4.8, u * 6.2, u * 0.5, '#2F4A54',
    { stroke: P.ink, lw: Math.max(3, u * 0.22), seed: 680 });
  line(ctx, -u * 2.4, -u * 1.6, u * 2.4, -u * 1.6, { seed: 681, lw: Math.max(3, u * 0.16), color: P.ink });
  ctx.beginPath();
  ctx.lineWidth = Math.max(3, u * 0.18); ctx.strokeStyle = P.ink;
  ctx.arc(0, -u * 4.2, u * 0.8, Math.PI, 0); ctx.stroke();
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.arc(s * u * 1.7, u * 2.2, u * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = '#2C2F36'; ctx.fill(); ctx.lineWidth = Math.max(2, u * 0.1); ctx.strokeStyle = P.ink; ctx.stroke();
  }
  ctx.restore();
}

// 声波：由唱片长出的弧线
export function soundWaves(ctx, x, y, u, t, o = {}) {
  const n = o.count || 5, col = o.color || 'rgba(241,217,168,0.85)';
  ctx.save();
  for (let i = 0; i < n; i++) {
    const k = (t * 0.5 + i / n) % 1;
    ctx.beginPath();
    ctx.lineWidth = Math.max(2, u * 0.1 * (1 - k * 0.5));
    ctx.strokeStyle = col;
    ctx.globalAlpha = 1 - k * 0.85;
    ctx.arc(x, y, u * (1.6 + k * 9), -Math.PI * 0.92, -Math.PI * 0.08);
    ctx.stroke();
  }
  ctx.restore();
}

// 音符（五线谱感），低饱和
export function note(ctx, x, y, u, color = P.lamp) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(x, y, u * 0.55, u * 0.42, -0.35, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(x + u * 0.4, y - u * 2.4, u * 0.2, u * 2.3);
  ctx.beginPath();
  ctx.moveTo(x + u * 0.6, y - u * 2.4);
  ctx.quadraticCurveTo(x + u * 1.5, y - u * 2.0, x + u * 1.1, y - u * 1.2);
  ctx.quadraticCurveTo(x + u * 1.25, y - u * 1.9, x + u * 0.6, y - u * 2.0);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}