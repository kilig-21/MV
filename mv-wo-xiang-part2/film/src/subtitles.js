// 字幕：暗色斜切底框 + 细米色边 + 暖米黄字，居中下方
import { P, FONT } from './palette.js';

const H = 92;          // 框高
const SLANT = 26;      // 斜切量
const PAD_X = 54;
const FONT_PX = 46;

export function cueText(lines, t) {
  for (const l of lines) if (t >= l.t0 && t < l.t1 && !l.meta) return l;
  return null;
}

export function drawCue(ctx, text, o = {}) {
  if (!text) return;
  const alpha = o.alpha ?? 1;
  const y = o.y ?? 944;
  const maxW = o.maxW ?? 1560;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `500 ${FONT_PX}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const tw = Math.min(ctx.measureText(text).width, maxW);
  const w = tw + PAD_X * 2;
  const cx = 960;
  const half = w / 2;
  const top = y - H / 2;

  // 斜切平行四边形
  ctx.beginPath();
  ctx.moveTo(cx - half + SLANT, top);
  ctx.lineTo(cx + half, top);
  ctx.lineTo(cx + half - SLANT, top + H);
  ctx.lineTo(cx - half, top + H);
  ctx.closePath();
  ctx.fillStyle = 'rgba(30,36,48,0.94)';
  ctx.fill();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = 'rgba(232,210,162,0.82)';
  ctx.lineJoin = 'round';
  ctx.stroke();

  // 内侧极细高光（纸感，不发光）
  ctx.beginPath();
  ctx.moveTo(cx - half + SLANT + 5, top + 5);
  ctx.lineTo(cx + half - 5, top + 5);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(247,239,221,0.16)';
  ctx.stroke();

  ctx.fillStyle = P.subText;
  ctx.fillText(text, cx + 1, top + H / 2 + 2, maxW);
  ctx.restore();
}

export function drawSubs(ctx, lines, t) {
  const l = cueText(lines, t);
  if (l) drawCue(ctx, l.text);
}