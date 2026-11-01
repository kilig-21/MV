// verse3 前半（v3-01 ~ v3-10）共用的小动作与画面元素。
// 只做「增量」：背景仍由 scenes-verse3.js 提供，这里不重画任何场景。
import { P } from './palette.js';
import { line, clamp, smooth, lerp, block, glow } from './ink.js';
import { floorPlane } from './scenes.js';

// ---- v3-05 地下通道（扁平块面版）----
// STYLE_LOCK：室内是亮米色墙 + 青蓝，平涂不渐变；地铁图是画面唯一光源。
export function tunnelWarm(ctx, t) {
  // 墙：整片米色，只用几道接缝分块
  ctx.fillStyle = '#E8D5B0';
  ctx.fillRect(0, 0, 1920, 880);
  // 两侧靠里的墙段压一档（平涂，不是渐变）
  block(ctx, 0, 0, 150, 880, 0, '#D8C39C');
  block(ctx, 1770, 0, 150, 880, 0, '#D8C39C');
  // 顶棚
  block(ctx, 0, 0, 1920, 120, 0, '#B39A78');
  line(ctx, 0, 120, 1920, 120, { seed: 2700, lw: 5, color: P.ink, amp: 0.8 });
  // 墙面的分块接缝（很轻，不做出纹理感）
  for (let i = 1; i <= 7; i++) {
    line(ctx, i * 240, 120, i * 240, 700, { seed: 2710 + i, lw: 2.5, color: '#CFB891', amp: 0.6, parts: 3 });
  }
  line(ctx, 0, 400, 1920, 400, { seed: 2720, lw: 2.5, color: '#CFB891', amp: 0.6, parts: 5 });
  // 青蓝腰线
  block(ctx, 0, 700, 1920, 180, 0, P.teal);
  block(ctx, 0, 700, 1920, 46, 0, P.tealDeep);
  line(ctx, 0, 700, 1920, 700, { seed: 2730, lw: 5, color: P.ink });
  line(ctx, 0, 880, 1920, 880, { seed: 2731, lw: 5, color: P.ink });
  // 地
  floorPlane(ctx, { y: 880, color: '#8C625E', dark: '#684845', vx: 960, vy: 840, bands: false });

  // 旧地铁图：暖色框 + 深青蓝图面
  block(ctx, 396, 176, 648, 440, 6, P.mustardDim, { stroke: P.ink, lw: 7, seed: 2100 });
  block(ctx, 424, 204, 592, 384, 4, '#1C3C49', { stroke: P.ink, lw: 4, seed: 2101 });
  // 图上的站名短线（平涂小条）
  for (let i = 0; i < 5; i++) {
    block(ctx, 448 + i * 112, 234, 64, 10, 4, 'rgba(232,213,176,0.55)', { seed: 2740 + i });
  }
  // 地图的光：整幅画唯一光源
  glow(ctx, 720, 396, 620, 'rgba(246,201,126,0.85)', 0.55);
  glow(ctx, 720, 396, 300, 'rgba(247,221,168,0.9)', 0.45);
  // 地上的光斑（平涂椭圆）
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = P.lamp;
  ctx.beginPath();
  ctx.ellipse(760, 960, 420, 90, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  return { map: { x: 424, y: 204, w: 592, h: 384 } };
}

// ---- 走路：四脚交替相位（与 v2-05 同一手法，幅度随速度淡出）----
export function walkLegs(ph, amp = 0.25) {
  return [
    Math.sin(ph) * amp,
    -Math.sin(ph) * amp,
    Math.sin(ph + 1.05) * amp,
    -Math.sin(ph + 1.05) * amp,
  ];
}

// 走路时的小起伏（像素）
export function walkBob(ph, amp = 2.2) {
  return Math.abs(Math.sin(ph)) * amp;
}

// 停下时的阻尼 squash：围绕 1 轻微回弹，不硬切
export function settle(t, ts, k = 9, amp = 0.06) {
  if (t <= ts) return 1;
  const e = Math.exp(-k * (t - ts));
  return 1 - amp * e * Math.cos((t - ts) * 17);
}

// ---- v3-04 鸣鸟剪影 ----
// 两片向上的月牙翼 + 小身体 + 短尾；flap 0=平展 1=高扬
export function bird(ctx, x, y, s, flap, color = '#0A141C') {
  const h = s * (0.22 + 0.78 * flap);
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(dir * s * 0.10, 0);
    ctx.quadraticCurveTo(dir * s * 0.50, -h * 0.95, dir * s, -h * 0.55);
    ctx.quadraticCurveTo(dir * s * 0.58, -h * 0.22, dir * s * 0.14, h * 0.12);
    ctx.closePath();
    ctx.fill();
  }
  // 身体
  ctx.beginPath();
  ctx.ellipse(0, h * 0.04, s * 0.21, s * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  // 尾
  ctx.beginPath();
  ctx.moveTo(-s * 0.14, h * 0.02);
  ctx.lineTo(-s * 0.40, h * 0.20);
  ctx.lineTo(-s * 0.06, h * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ---- v3-08 热气 ----
export function steam(ctx, x, y, t, o = {}) {
  const n = o.n || 3, h = o.h || 130, amp = o.amp || 14;
  const col = o.color || 'rgba(240,228,205,0.85)';
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const ph = (t * 0.5 + i / n) % 1;
    const yy = y - ph * h;
    const xx = x + Math.sin(ph * 5.2 + i * 2.1) * amp;
    ctx.beginPath();
    ctx.globalAlpha = (o.alpha ?? 0.55) * (1 - ph);
    ctx.lineWidth = Math.max(3, 6 * (1 - ph * 0.45));
    ctx.strokeStyle = col;
    ctx.moveTo(xx, yy);
    ctx.quadraticCurveTo(xx + amp * 0.8, yy - 26, xx - amp * 0.3, yy - 46);
    ctx.stroke();
  }
  ctx.restore();
}

// ---- v3-05 地铁图：线路随角色位置亮起 ----
export function subwayRoute(ctx, map, p, t) {
  const pts = [
    [map.x + map.w * 0.10, map.y + map.h * 0.78],
    [map.x + map.w * 0.28, map.y + map.h * 0.56],
    [map.x + map.w * 0.46, map.y + map.h * 0.63],
    [map.x + map.w * 0.60, map.y + map.h * 0.38],
    [map.x + map.w * 0.80, map.y + map.h * 0.30],
    [map.x + map.w * 0.90, map.y + map.h * 0.14],
  ];
  const segs = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    segs.push({ a, b, L, d0: total });
    total += L;
  }
  // 底图：暗色线路
  for (let i = 0; i < segs.length; i++) {
    line(ctx, segs[i].a[0], segs[i].a[1], segs[i].b[0], segs[i].b[1],
      { seed: 2600 + i, lw: 7, color: '#2A4450' });
  }
  // 已亮长度
  const lit = clamp(p, 0, 1) * total;
  ctx.save();
  ctx.lineCap = 'round';
  for (const s of segs) {
    if (lit <= s.d0) break;
    const k = clamp((lit - s.d0) / s.L, 0, 1);
    const ex = lerp(s.a[0], s.b[0], k), ey = lerp(s.a[1], s.b[1], k);
    const g = ctx.createLinearGradient(s.a[0], s.a[1], ex, ey);
    g.addColorStop(0, 'rgba(246,201,126,0.95)');
    g.addColorStop(1, 'rgba(247,221,168,0.95)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 15; ctx.globalAlpha = 0.22;
    ctx.beginPath(); ctx.moveTo(s.a[0], s.a[1]); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.lineWidth = 6; ctx.globalAlpha = 0.95;
    ctx.beginPath(); ctx.moveTo(s.a[0], s.a[1]); ctx.lineTo(ex, ey); ctx.stroke();
  }
  // 通过的车站亮一个点
  ctx.globalAlpha = 1;
  for (const s of segs) {
    if (lit < s.d0) break;
    const pulse = 0.55 + 0.45 * Math.sin(t * 6 + s.d0 * 0.05);
    ctx.beginPath();
    ctx.arc(s.a[0], s.a[1], 12, 0, Math.PI * 2);
    ctx.fillStyle = '#F7DDA8'; ctx.globalAlpha = pulse; ctx.fill();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 3; ctx.strokeStyle = P.ink; ctx.stroke();
  }
  ctx.restore();
}

// ---- v3-08 碗与夹菜 ----
export function bowl(ctx, x, y, s, o = {}) {
  const w = s, h = s * 0.55;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - w, y - h * 0.2);
  ctx.lineTo(x + w, y - h * 0.2);
  ctx.quadraticCurveTo(x + w * 0.82, y + h, x, y + h);
  ctx.quadraticCurveTo(x - w * 0.82, y + h, x - w, y - h * 0.2);
  ctx.closePath();
  ctx.fillStyle = o.fill || '#EDE2CC';
  ctx.fill();
  ctx.lineWidth = 3.5; ctx.strokeStyle = P.ink; ctx.stroke();
  // 碗里的饭/菜
  ctx.beginPath();
  ctx.ellipse(x, y - h * 0.18, w * 0.86, h * 0.34, 0, Math.PI, Math.PI * 2);
  ctx.fillStyle = o.food || '#F6EFDD';
  ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = P.ink; ctx.stroke();
  if (o.fill2) {
    ctx.beginPath();
    ctx.ellipse(x + w * 0.1, y - h * 0.32, w * 0.42, h * 0.22, -0.1, 0, Math.PI * 2);
    ctx.fillStyle = o.fill2; ctx.fill();
  }
  ctx.restore();
}

// 夹起来的一小团菜（沿抛物线飞行）
export function bite(ctx, x, y, s, color = '#93AE7C') {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, s, s * 0.78, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill();
  ctx.lineWidth = Math.max(2.5, s * 0.2); ctx.strokeStyle = P.ink; ctx.stroke();
  ctx.restore();
}