// 绘制原语：圆角块面、手绘抖动、粗描边、纸感
// 规则见 STYLE_LOCK.md：粗墨线、圆角、线条略有手绘抖动、块面清楚
import { P } from './palette.js';

export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
export const seg = (t, a, b) => smooth((t - a) / (b - a));
export const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
export const easeIn = t => Math.pow(clamp(t, 0, 1), 3);

// 固定种子的确定性随机：同一物件每帧抖动一致，不沸腾
export function rng(seed) {
  let a = (seed * 2654435761) >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const hash = (seed, i) => rng((seed * 7919 + i * 104729) >>> 0)();

// 圆角矩形路径，四角带轻微手绘偏移
export function rr(ctx, x, y, w, h, r, seed = 1, amp = 1.2) {
  const R = rng(seed * 31 + 7);
  const j = () => (R() * 2 - 1) * amp;
  const x0 = x + j() * 0.35, y0 = y + j() * 0.35;
  const x1 = x + w + j() * 0.35, y1 = y + h + j() * 0.35;
  r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  ctx.beginPath();
  ctx.moveTo(x0 + r, y0);
  ctx.lineTo(x1 - r, y0);
  ctx.quadraticCurveTo(x1, y0, x1, y0 + r);
  ctx.lineTo(x1, y1 - r);
  ctx.quadraticCurveTo(x1, y1, x1 - r, y1);
  ctx.lineTo(x0 + r, y1);
  ctx.quadraticCurveTo(x0, y1, x0, y1 - r);
  ctx.lineTo(x0, y0 + r);
  ctx.quadraticCurveTo(x0, y0, x0 + r, y0);
  ctx.closePath();
}

// 填色 + 描边（核心：所有块面都走这里，保证线宽一致）
export function block(ctx, x, y, w, h, r, fill, o = {}) {
  if (w <= 0 || h <= 0) return null;
  rr(ctx, x, y, w, h, r, o.seed || 1, o.amp ?? 1.2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (o.stroke) {
    ctx.lineWidth = o.lw ?? 5;
    ctx.strokeStyle = o.stroke;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }
  return null;
}

// 手绘直线：分成几段，每段垂直方向轻微偏移
export function line(ctx, x1, y1, x2, y2, o = {}) {
  const R = rng((o.seed || 1) * 53 + 11);
  const amp = o.amp ?? 0.8;
  const n = o.parts ?? 3;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const k = (i === 0 || i === n) ? 0 : (R() * 2 - 1) * amp;
    const x = x1 + dx * u + nx * k, y = y1 + dy * u + ny * k;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.lineWidth = o.lw ?? 4;
  ctx.strokeStyle = o.color || P.ink;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

// 手绘多边形（山、屋顶、波浪、纸舟）
export function poly(ctx, pts, o = {}) {
  const R = rng((o.seed || 1) * 97 + 3);
  const amp = o.amp ?? 0.9;
  ctx.beginPath();
  pts.forEach(([x, y], i) => {
    const k = (i === 0 || i === pts.length - 1) ? 0 : amp;
    const xx = x + (R() * 2 - 1) * k, yy = y + (R() * 2 - 1) * k;
    i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
  });
  if (o.closed !== false) ctx.closePath();
  if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); }
  if (o.stroke) {
    ctx.lineWidth = o.lw ?? 4; ctx.strokeStyle = o.stroke;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
  }
}

// 自由曲线：手绘抖动
export function curve(ctx, pts, o = {}) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
  }
  const L = pts[pts.length - 1];
  ctx.lineTo(L[0], L[1]);
  if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); }
  if (o.stroke !== false) {
    ctx.lineWidth = o.lw ?? 4; ctx.strokeStyle = o.stroke || P.ink;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
  }
}

// 星芒（闪光灯、星星）
export function star(ctx, x, y, ro, ri, n, fill, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = rot + i * Math.PI / n;
    const r = i % 2 ? ri : ro;
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
}

// 全屏底色（平涂，不做渐变脏污）
export function bg(ctx, color) { ctx.fillStyle = color; ctx.fillRect(0, 0, 1920, 1080); }

// 纸感：一次性噪声层 + 极轻暗角。low opacity，不脏。
let grainCanvas = null, vignette = null;
export function buildPaper(ctx) {
  if (grainCanvas) return;
  const W = 1920, H = 1080;
  grainCanvas = document.createElement('canvas');
  grainCanvas.width = W; grainCanvas.height = H;
  const g = grainCanvas.getContext('2d');
  const img = g.createImageData(W, H);
  const R = rng(20261031);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = R();
    // 一半偏暗、一半偏暖，形成纸纤维颗粒
    const dark = v < 0.5;
    img.data[i] = dark ? 96 : 255;
    img.data[i + 1] = dark ? 84 : 246;
    img.data[i + 2] = dark ? 68 : 228;
    img.data[i + 3] = Math.floor(R() * (dark ? 16 : 12));
  }
  g.putImageData(img, 0, 0);

  vignette = document.createElement('canvas');
  vignette.width = 480; vignette.height = 270;
  const vg = vignette.getContext('2d');
  const grd = vg.createRadialGradient(240, 135, 70, 240, 135, 310);
  grd.addColorStop(0, 'rgba(0,0,0,0)');
  grd.addColorStop(1, 'rgba(8,10,14,0.30)');
  vg.fillStyle = grd; vg.fillRect(0, 0, 480, 270);
}

export function paper(ctx) {
  buildPaper();
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(grainCanvas, 0, 0, 1920, 1080);
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.drawImage(vignette, 0, 0, 1920, 1080);
  ctx.restore();
}

// 暖光晕（台灯、路灯、舞台）：低饱和，不用 3D 光
export function glow(ctx, x, y, r, color, a = 0.35) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}