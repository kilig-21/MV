// 第二轮细节补强：只给 v2-15 / v3-10 / v3-11 / v3-12 / i-05 / h1-01 用的「前景层次与细节」。
// 规则沿用 STYLE_LOCK.md：平涂块面、粗墨线、圆角、手绘抖动（固定种子、逐帧不沸腾）、
// 光只用加法叠色。这里不写任何真实文字：路牌与招牌一律用笔画形状表达。
import { P } from './palette.js';
import { block, line, poly, curve, glow, rr, rng, clamp, lerp, smooth } from './ink.js';

// ---------------- 小工具 ----------------

// 十六进制混色：k=0 全 a，k=1 全 b
export function mix(a, b, k) {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * clamp(k, 0, 1)));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}

// 按圆角半径走一遍路径（给「先盖色、再填形」用）
function shapePath(ctx, x, y, w, h, r, seed = 1, amp = 1.2) {
  rr(ctx, x, y, w, h, r, seed, amp);
}

// 起笔粗、收笔细的笔画：招牌与路牌的字形由这些笔画拼出来
export function brush(ctx, x1, y1, x2, y2, w1, w2, color) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const a1 = w1 / 2, a2 = w2 / 2;
  const ang = Math.atan2(dy, dx);
  ctx.beginPath();
  ctx.moveTo(x1 + nx * a1, y1 + ny * a1);
  ctx.lineTo(x2 + nx * a2, y2 + ny * a2);
  ctx.arc(x2, y2, a2, ang + Math.PI / 2, ang - Math.PI / 2, true);
  ctx.lineTo(x1 - nx * a1, y1 - ny * a1);
  ctx.arc(x1, y1, a1, ang - Math.PI / 2, ang + Math.PI / 2, true);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

// 由笔画构成的一个「字」：不表音义，只求看得出是笔画搭起来的方块
export function strokeGlyph(ctx, cx, cy, s, seed, color, forceLayout = -1) {
  const R = rng(seed);
  const W = s * 0.92, H = s;
  const L = cx - W / 2, Rt = cx + W / 2, T = cy - H / 2, B = cy + H / 2;
  const w = s * 0.125;
  const b = (x1, y1, x2, y2, w1 = w, w2 = w * 0.72) => brush(ctx, x1, y1, x2, y2, w1, w2, color);
  const box = (x, y, ww, hh) => {
    ctx.save();
    ctx.lineWidth = w * 0.86;
    ctx.strokeStyle = color;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    shapePath(ctx, x, y, ww, hh, w * 0.36, seed + 5, 0.5);
    ctx.stroke();
    ctx.restore();
  };
  const layout = forceLayout >= 0 ? forceLayout : Math.floor(R() * 8);

  if (layout === 0) {
    // 竖主笔 + 三横
    const sx = cx + (R() - 0.5) * W * 0.16;
    b(sx, T, sx, B, w * 1.15, w * 0.85);
    b(L + W * 0.06, T + H * (0.16 + R() * 0.08), Rt - W * 0.04, T + H * 0.20, w * 0.9, w * 0.6);
    b(L, cy, Rt, cy + H * 0.04, w * 1.05, w * 0.7);
    b(L + W * 0.12, B - H * 0.10, Rt - W * 0.10, B - H * 0.07, w * 0.85, w * 0.5);
  } else if (layout === 1) {
    // 包围框 + 内部横画
    box(cx - W * 0.34, T + H * 0.08, W * 0.68, H * 0.76);
    b(cx - W * 0.22, T + H * 0.34, cx + W * 0.22, T + H * 0.36, w * 0.8, w * 0.55);
    b(cx - W * 0.16, T + H * 0.60, cx + W * 0.16, T + H * 0.61, w * 0.8, w * 0.55);
    b(cx + (R() - 0.5) * W * 0.1, T + H * 0.36, cx, T + H * 0.58, w * 0.7, w * 0.45);
  } else if (layout === 2) {
    // 左右结构：左边三笔偏旁，右边竖加两横
    b(cx - W * 0.40, T + H * 0.16, cx - W * 0.32, T + H * 0.26, w * 0.6, w * 0.42);
    b(cx - W * 0.42, T + H * 0.36, cx - W * 0.33, T + H * 0.48, w * 0.6, w * 0.42);
    b(cx - W * 0.44, T + H * 0.66, cx - W * 0.26, T + H * 0.52, w * 0.5, w * 0.72);
    const sx = cx + W * 0.12;
    b(sx, T + H * 0.04, sx, B - H * 0.04, w * 1.1, w * 0.8);
    b(cx + W * 0.02, T + H * 0.30, Rt - W * 0.02, T + H * 0.32, w * 0.85, w * 0.55);
    b(cx + W * 0.02, T + H * 0.68, Rt - W * 0.02, T + H * 0.70, w * 0.85, w * 0.55);
  } else if (layout === 3) {
    // 上下结构：宝盖 + 撇捺
    b(cx - W * 0.04, T + H * 0.02, cx - W * 0.12, T + H * 0.16, w * 0.55, w * 0.32);
    b(L + W * 0.04, T + H * 0.18, Rt - W * 0.04, T + H * 0.20, w * 0.95, w * 0.65);
    b(L + W * 0.10, cy + H * 0.14, Rt - W * 0.10, cy + H * 0.16, w * 0.95, w * 0.65);
    b(cx, cy + H * 0.12, L + W * 0.16, B - H * 0.03, w * 0.85, w * 0.3);
    b(cx, cy + H * 0.12, Rt - W * 0.16, B - H * 0.01, w * 0.85, w * 0.3);
  } else if (layout === 4) {
    // 中竖带钩 + 点 + 长横
    const sx = cx + (R() - 0.5) * W * 0.2;
    b(sx, T + H * 0.04, sx, B - H * 0.20, w * 1.1, w * 0.8);
    b(sx, B - H * 0.20, sx + W * 0.20, B - H * 0.08, w * 0.8, w * 0.35);
    b(cx - W * 0.34, T + H * 0.30, cx - W * 0.22, T + H * 0.22, w * 0.5, w * 0.34);
    b(L + W * 0.02, B - H * 0.16, Rt - W * 0.02, B - H * 0.13, w * 0.9, w * 0.6);
    b(Rt - W * 0.26, T + H * 0.40, Rt - W * 0.06, T + H * 0.62, w * 0.62, w * 0.4);
  } else if (layout === 5) {
    // 木字旁：竖 + 横 + 两撇 + 收笔的钩
    const sx = cx + W * 0.02;
    b(sx, T + H * 0.02, sx, B - H * 0.06, w * 1.1, w * 0.82);
    b(L + W * 0.06, T + H * 0.28, Rt - W * 0.06, T + H * 0.30, w * 1.0, w * 0.7);
    b(sx, T + H * 0.30, L + W * 0.10, cy + H * 0.16, w * 0.78, w * 0.32);
    b(sx, T + H * 0.30, Rt - W * 0.10, cy + H * 0.18, w * 0.78, w * 0.32);
    b(cx - W * 0.36, cy + H * 0.22, cx - W * 0.44, cy + H * 0.36, w * 0.5, w * 0.34);
    b(L + W * 0.04, B - H * 0.14, Rt - W * 0.16, B - H * 0.11, w * 0.8, w * 0.5);
  } else if (layout === 6) {
    // 门框：两根立框 + 上横 + 内部两横
    b(L + W * 0.10, T + H * 0.10, L + W * 0.10, B - H * 0.02, w * 0.9, w * 0.7);
    b(Rt - W * 0.10, T + H * 0.10, Rt - W * 0.10, B - H * 0.02, w * 0.9, w * 0.7);
    b(L + W * 0.10, T + H * 0.10, Rt - W * 0.10, T + H * 0.12, w * 0.9, w * 0.62);
    b(cx - W * 0.20, T + H * 0.38, cx + W * 0.20, T + H * 0.40, w * 0.66, w * 0.42);
    b(cx - W * 0.18, T + H * 0.64, cx + W * 0.18, T + H * 0.65, w * 0.66, w * 0.42);
  } else {
    // 双人旁 + 右边一方一横
    b(cx - W * 0.34, T + H * 0.12, cx - W * 0.24, T + H * 0.30, w * 0.6, w * 0.4);
    b(cx - W * 0.36, T + H * 0.34, cx - W * 0.26, T + H * 0.54, w * 0.55, w * 0.38);
    b(cx - W * 0.32, T + H * 0.22, cx - W * 0.32, B - H * 0.06, w * 0.85, w * 0.6);
    box(cx - W * 0.02, T + H * 0.16, W * 0.34, H * 0.30);
    b(cx + W * 0.02, T + H * 0.58, Rt - W * 0.04, T + H * 0.60, w * 0.8, w * 0.5);
    b(cx + W * 0.02, T + H * 0.76, Rt - W * 0.04, T + H * 0.78, w * 0.7, w * 0.45);
  }

  // 一点点收笔的点
  if (R() < 0.55) {
    const r = w * 0.42;
    ctx.beginPath();
    ctx.arc(cx + (R() - 0.5) * W * 0.6, T + H * (0.1 + R() * 0.16), r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

// 一行「名字」：n 个笔画字并排
export function strokeName(ctx, cx, cy, w, h, seed, color, n = 2, forceLayouts = null) {
  const s = Math.min(h * 0.82, w / (n * 1.16));
  const gap = s * 0.16;
  const total = n * s + (n - 1) * gap;
  for (let i = 0; i < n; i++) {
    const fl = forceLayouts ? (forceLayouts[i] ?? -1) : -1;
    strokeGlyph(ctx, cx - total / 2 + s / 2 + i * (s + gap), cy, s, seed + i * 37, color, fl);
  }
}

// ---------------- 舞台（v2-15） ----------------

// 追光里的浮尘：加法、极低透明度，只在光锥内可见
export function dustMotes(ctx, o = {}) {
  const t = o.t || 0;
  const n = o.count ?? 54;
  const cx = o.cx ?? 960;
  const y0 = o.y0 ?? 150, y1 = o.y1 ?? 770;
  const wTop = o.wTop ?? 150, wBot = o.wBot ?? 430;
  const seed = o.seed ?? 991;
  const col = o.color || 'rgba(255,232,190,0.85)';
  const R = rng(seed);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const by = y0 + R() * (y1 - y0);
    const k = (by - y0) / Math.max(1, y1 - y0);
    const half = lerp(wTop, wBot, k);
    const bx = (R() * 2 - 1) * half;
    const ph = R() * Math.PI * 2;
    const sp = 0.35 + R() * 0.55;
    const rad = 0.9 + R() * 1.7;
    const x = cx + bx + Math.sin(t * 0.5 * sp + ph) * 7;
    const y = by + Math.sin(t * 0.42 * sp + ph * 1.7) * 9;
    const edge = 1 - Math.abs(bx) / half;
    const tw = 0.55 + 0.45 * Math.sin(t * (0.7 + sp) + ph * 2.1);
    ctx.globalAlpha = clamp((0.10 + 0.20 * R()) * edge * tw, 0, 0.5);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// 舞台侧幕（近景一层的深色幕布，给画面左右压边）
export function sideLeg(ctx, side, o = {}) {
  const w = o.w ?? 158;
  const seed = o.seed ?? 501;
  const x0 = side < 0 ? 0 : 1920;
  const dir = side < 0 ? 1 : -1;
  const fill = o.color || '#4A2922';
  poly(ctx, [[x0, 0], [x0 + dir * w, 0], [x0 + dir * (w + 26), 1080], [x0, 1080]],
    { fill, stroke: P.ink, lw: 5, seed });
  for (let i = 1; i <= 4; i++) {
    const k = i / 5;
    curve(ctx, [
      [x0 + dir * (w * k), 0],
      [x0 + dir * (w * k + 8), 340],
      [x0 + dir * (w * k + 2), 700],
      [x0 + dir * (w * k + 26 * k), 1080],
    ], { stroke: i % 2 ? '#38201A' : '#5A332A', lw: 4, amp: 0.8 });
  }
  // 幕布底部的投影，压住台面
  const g = ctx.createLinearGradient(0, 900, 0, 1080);
  g.addColorStop(0, 'rgba(8,10,14,0)');
  g.addColorStop(1, 'rgba(8,10,14,0.45)');
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = g;
  ctx.fillRect(side < 0 ? 0 : 1920 - w, 900, w, 180);
  ctx.restore();
}

// 返送音箱（舞台地面的楔形）
export function wedgeMonitor(ctx, x, by, w, h, facing, seed = 601) {
  const d = facing >= 0 ? 1 : -1;
  // 侧视楔形：底边 + 前立面 + 向后倾斜的喇叭面
  poly(ctx, [
    [x - w / 2, by],
    [x + w / 2, by],
    [x + w / 2 - d * 6, by - h * 0.52],
    [x - w / 2 + d * 34, by - h],
  ], { fill: '#22232A', stroke: P.ink, lw: 4, seed });
  // 喇叭面的亮边
  line(ctx, x - w / 2 + d * 34, by - h, x + w / 2 - d * 6, by - h * 0.52,
    { seed: seed + 3, lw: 3, color: '#43444E', amp: 0.4 });
  // 喇叭：斜面上的一圈网
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.ellipse(x + d * 10, by - h * 0.62, w * 0.20, h * 0.24, -d * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = '#34353D';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#15161A';
  ctx.stroke();
  ctx.restore();
  // 前立面的散热槽
  for (let i = 0; i < 3; i++) {
    line(ctx, x - w * 0.30 + i * 13, by - 8, x - w * 0.30 + i * 13, by - 26,
      { seed: seed + i, lw: 2, color: '#15161A', amp: 0.3 });
  }
  // 地上的线
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(x + d * w * 0.34, by - 4);
  ctx.quadraticCurveTo(x + d * w * 0.52, by - 2, x + d * (w * 0.5 + 26), by + 8);
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = '#1A1B20';
  ctx.stroke();
  ctx.restore();
}

// 地灯：舞台地面上的小灯，向上打一小束光
export function floorUplight(ctx, x, by, t, seed = 631) {
  block(ctx, x - 22, by - 26, 44, 26, 6, '#2B2C31', { stroke: P.ink, lw: 4, seed });
  block(ctx, x - 9, by - 42, 18, 18, 5, '#3A3B42', { stroke: P.ink, lw: 3, seed: seed + 1 });
  const k = 0.8 + 0.2 * Math.sin(t * 2.3 + seed);
  // 向上的光锥
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(0, by - 44, 0, by - 300);
  g.addColorStop(0, `rgba(255,220,160,${0.20 * k})`);
  g.addColorStop(1, 'rgba(255,220,160,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - 10, by - 44);
  ctx.lineTo(x + 10, by - 44);
  ctx.lineTo(x + 62, by - 300);
  ctx.lineTo(x - 62, by - 300);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  glow(ctx, x, by - 44, 46, 'rgba(255,226,170,0.9)', 0.5 * k);
}

// 台面反光：主角脚下与追光池上的几道横向高光
export function floorGloss(ctx, o = {}) {
  const cx = o.cx ?? 960, y = o.y ?? 806, w = o.w ?? 640;
  const seed = o.seed ?? 655;
  const R = rng(seed);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 9; i++) {
    const gy = y + 14 + i * 17 + R() * 8;
    const gw = w * (0.22 + R() * 0.5) * (1 - i * 0.06);
    const gx = cx + (R() - 0.5) * w * 0.7;
    const a = (0.05 + R() * 0.07) * (1 - i / 11);
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(255,226,180,0.9)';
    ctx.fillRect(gx - gw / 2, gy, gw, 1.6 + R() * 1.4);
  }
  ctx.restore();
}

// 观众席剪影：高低不齐，有人举手机、有人侧头说话
export function audienceRow(ctx, o = {}) {
  const t = o.t || 0;
  const x0 = o.x0 ?? 40, x1 = o.x1 ?? 1880;
  const baseY = o.baseY ?? 1064;
  const n = o.n ?? 12;
  const seed = o.seed ?? 1201;
  const color = o.color || '#080D11';
  const rim = o.rim || 'rgba(150,178,190,0.20)';
  const phoneP = o.phone ?? 0.28;
  const hMin = o.hMin ?? 96, hMax = o.hMax ?? 168;
  const R = rng(seed);
  const phones = [];
  const step = (x1 - x0) / n;

  for (let i = 0; i < n; i++) {
    const x = x0 + step * (i + 0.18 + R() * 0.64);
    const h = hMin + R() * (hMax - hMin);
    const hw = h * (0.30 + R() * 0.12);
    const ph = R() * Math.PI * 2;
    const turn = (R() * 2 - 1) * 0.22;          // 侧头说话
    const hasPhone = R() < phoneP;
    const side = R() < 0.5 ? -1 : 1;
    const hand = 0.4 + R() * 0.6;
    const lean = (R() * 2 - 1) * 6;
    const sway = Math.sin(t * 0.7 + ph) * 2.2;
    const hx = x + sway + turn * h * 0.22;
    const shY = baseY - h * 0.55;
    const headR = h * 0.155;
    const headY = baseY - h * 0.79;

    ctx.beginPath();
    ctx.moveTo(x - hw + lean * 0.3, baseY + 18);
    ctx.quadraticCurveTo(x - hw * 0.98, shY + h * 0.12, x - hw * 0.52, shY - h * 0.02);
    ctx.quadraticCurveTo(x - hw * 0.2, shY - h * 0.08, hx, shY - h * 0.06);
    ctx.quadraticCurveTo(x + hw * 0.2, shY - h * 0.08, x + hw * 0.52, shY - h * 0.02);
    ctx.quadraticCurveTo(x + hw * 0.98, shY + h * 0.12, x + hw + lean * 0.3, baseY + 18);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // 头（侧头说话时是微侧的椭圆 + 一点下巴）
    ctx.beginPath();
    ctx.ellipse(hx, headY, headR * (0.92 + Math.abs(turn) * 0.3), headR, turn, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    // 头顶一点冷边光，把前排从背景里分出来
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(hx, headY, headR * 0.99, Math.PI * 1.12, Math.PI * 1.88);
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = rim;
    ctx.stroke();
    ctx.restore();

    if (hasPhone) phones.push([x + side * hw * 0.66, headY - h * 0.34 - 8 * hand, shY, ph, side, x, hw]);
  }

  // 手机：举起来的一块小亮屏 + 一点暖光
  for (const [px, py, shY, ph, side, bx, bhw] of phones) {
    const drift = Math.sin(t * 0.9 + ph) * 2;
    line(ctx, bx + side * bhw * 0.74, shY + 26, px + drift, py + 16, { seed: 1500 + Math.round(bx), lw: 8, color, amp: 0.5, parts: 2 });
    block(ctx, px - 8 + drift, py - 13, 16, 26, 4, '#090E12', { stroke: '#05080A', lw: 2, seed: 1520 + Math.round(bx) });
    ctx.fillStyle = 'rgba(238,222,178,0.88)';
    ctx.fillRect(px - 5 + drift, py - 9, 10, 17);
    glow(ctx, px + drift, py, 48, 'rgba(246,201,126,0.85)', 0.22);
  }
}

// 最前面一排只露头顶的剪影（画在彩色观众之前，制造层次）
export function audienceFront(ctx, o = {}) {
  const xs = o.xs || [200, 520, 790, 1180, 1600, 1820];
  const base = o.baseY ?? 1150;
  const color = o.color || '#05090C';
  const t = o.t || 0;
  const R = rng(o.seed ?? 1701);
  xs.forEach((x, i) => {
    const r = 54 + R() * 26;
    const off = Math.sin(t * 0.6 + i * 1.7) * 2;
    ctx.beginPath();
    ctx.ellipse(x + off, base, r * 1.25, r, 0, Math.PI, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillRect(x - r * 1.25 + off, base, r * 2.5, 120);
    // 前排也有举手机的：屏幕是画面最底下一排小暖点
    if (i === 2 || i === 5) {
      const px = x + off + (i === 2 ? 46 : -46);
      const py = base - r - 34;
      ctx.beginPath();
      ctx.moveTo(x + off + (i === 2 ? 20 : -20), base - r * 0.4);
      ctx.lineTo(px, py + 14);
      ctx.lineWidth = 10;
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.stroke();
      block(ctx, px - 9, py - 13, 18, 27, 4, '#090E12', { seed: 1740 + i });
      ctx.fillStyle = 'rgba(238,222,178,0.9)';
      ctx.fillRect(px - 6, py - 9, 12, 18);
      glow(ctx, px, py, 52, 'rgba(246,201,126,0.85)', 0.22);
    }
  });
}

// ---------------- 胡同（v3-10） ----------------

// 垂下的电线（两点之间挂一道弧）
export function wire(ctx, x1, y1, x2, y2, sag, seed = 1801, o = {}) {
  const n = 12;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const x = lerp(x1, x2, k);
    const y = lerp(y1, y2, k) + Math.sin(k * Math.PI) * sag;
    pts.push([x, y]);
  }
  curve(ctx, pts, { stroke: o.color || '#0C1116', lw: o.lw ?? 3, amp: 0.4 });
  if (o.double) curve(ctx, pts.map(([x, y]) => [x, y + 7]), { stroke: '#0A0E12', lw: 2, amp: 0.4 });
}

// 空调外机
export function acUnit(ctx, x, y, w, h, seed = 1901, o = {}) {
  block(ctx, x, y, w, h, 5, o.color || '#7A7264', { stroke: P.ink, lw: 3, seed });
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(x + w * 0.5, y + h * 0.5, Math.min(w, h) * 0.36, 0, Math.PI * 2);
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = '#4E483E';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + w * 0.5, y + h * 0.5, Math.min(w, h) * 0.20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  for (let i = 0; i < 3; i++) line(ctx, x + 5, y + h + 3 + i * 4, x + w * 0.42, y + h + 3 + i * 4, { seed: seed + i, lw: 1.6, color: '#5B5449', amp: 0.3 });
}

// 晾衣绳 + 衣物（有风，慢慢摆）
export function laundryLine(ctx, x1, y1, x2, y2, sag, seed, t) {
  wire(ctx, x1, y1, x2, y2, sag, seed, { lw: 2, color: '#0B1014' });
  const R = rng(seed + 11);
  const n = 3;
  for (let i = 0; i < n; i++) {
    const k = 0.2 + i * 0.3 + R() * 0.06;
    const x = lerp(x1, x2, k);
    const y = lerp(y1, y2, k) + Math.sin(k * Math.PI) * sag;
    const w = 34 + R() * 30, h = 48 + R() * 34;
    const sw = Math.sin(t * 1.5 + i * 1.4 + R() * 3) * 0.09;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(sw);
    poly(ctx, [
      [-w / 2, 0], [w / 2, 0], [w / 2 + 4, h * 0.72], [0, h], [-w / 2 - 4, h * 0.72],
    ], { fill: i % 2 ? '#5C5A54' : '#6B5F50', stroke: '#0F151A', lw: 2.5, seed: seed + i });
    ctx.restore();
  }
}

// 旧路牌：一根杆 + 两块方向牌，牌面只有笔画
export function streetSign(ctx, x, by, s, seed = 2001, o = {}) {
  const col = o.color || '#4E5257';
  line(ctx, x, by, x, by - s * 1.02, { seed, lw: Math.max(4, s * 0.055), color: '#2A2E33' });
  const plates = [
    { y: by - s * 0.92, w: s * 0.66, h: s * 0.20, dir: 1, seed: seed + 1 },
    { y: by - s * 0.64, w: s * 0.56, h: s * 0.17, dir: -1, seed: seed + 2 },
  ];
  for (const p of plates) {
    const px = p.dir > 0 ? x + s * 0.03 : x - s * 0.03 - p.w;
    // 指向的尖角
    const tip = p.dir > 0
      ? [[px, p.y], [px + p.w, p.y], [px + p.w + s * 0.10, p.y + p.h / 2], [px + p.w, p.y + p.h], [px, p.y + p.h]]
      : [[px + p.w, p.y], [px, p.y], [px - s * 0.10, p.y + p.h / 2], [px, p.y + p.h], [px + p.w, p.y + p.h]];
    poly(ctx, tip, { fill: col, stroke: P.ink, lw: 3, seed: p.seed });
    // 牌面笔画（不写字）
    const gx = px + p.w * 0.5, gy = p.y + p.h * 0.5;
    strokeName(ctx, gx, gy, p.w * 0.62, p.h * 0.62, p.seed + 20, 'rgba(232,222,200,0.85)', 2);
  }
  // 杆顶的锈与一只停着的鸟
  block(ctx, x - s * 0.05, by - s * 1.06, s * 0.10, s * 0.10, 3, '#33383D', { stroke: P.ink, lw: 2, seed: seed + 5 });
}

// 忽明忽暗的灯：不规则，偶尔整个掉一下
export function flicker(t, seed = 1) {
  const R = rng(seed);
  const a = Math.sin(t * 11.3 + R() * 6.28);
  const b = Math.sin(t * 6.1 + R() * 6.28);
  const c = Math.sin(t * 23.7 + R() * 6.28);
  let k = 0.78 + 0.22 * a;
  if (b < -0.55) k *= 0.28;
  if (c < -0.82) k *= 0.6;
  return clamp(k, 0, 1);
}

// 积水：一摊暗水 + 倒影里的几道竖光
export function puddle(ctx, o = {}) {
  const x = o.x ?? 900, y = o.y ?? 990, w = o.w ?? 300, h = o.h ?? 26;
  const seed = o.seed ?? 2101;
  ctx.save();
  ctx.globalAlpha = o.alpha ?? 0.75;
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#0B1116';
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(120,150,160,0.5)';
  ctx.stroke();
  ctx.restore();
  // 倒影：竖向拉长的暖光
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const R = rng(seed);
  for (let i = 0; i < 4; i++) {
    const rx = x + (R() - 0.5) * w * 0.7;
    const rw = 3 + R() * 7;
    const rh = h * (0.25 + R() * 0.5);
    ctx.globalAlpha = (o.light ?? 0.30) * (0.4 + R() * 0.6);
    ctx.fillStyle = i % 2 ? 'rgba(246,201,126,0.9)' : 'rgba(150,190,200,0.7)';
    ctx.fillRect(rx, y - rh * 0.4, rw, rh);
  }
  ctx.restore();
}

// 井盖：路面上的一块圆，给空地一个尺度
export function manhole(ctx, x, y, rx, seed = 2151, o = {}) {
  const ry = rx * 0.34;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = o.color || '#2A3035';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = P.ink;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 0.72, ry * 0.72, 0, 0, Math.PI * 2);
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = '#171C20';
  ctx.stroke();
  for (let i = -2; i <= 2; i++) {
    line(ctx, x + i * rx * 0.26, y - ry * 0.52, x + i * rx * 0.26, y + ry * 0.52,
      { seed: seed + i, lw: 2, color: '#151A1E', amp: 0.2, parts: 2 });
  }
  // 边缘的一点冷反光
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 0.92, ry * 0.9, 0, Math.PI * 0.08, Math.PI * 0.92);
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = '#8FB0BC';
  ctx.stroke();
  ctx.restore();
}

// 路面接缝：几条随透视收窄的横线，把空地分出层次
export function roadSeams(ctx, o = {}) {
  const cx = o.cx ?? 960, yTop = o.yTop ?? 520, yBot = o.yBot ?? 1040;
  const hTop = o.hTop ?? 250, hBot = o.hBot ?? 520;
  const n = o.n ?? 5;
  const seed = o.seed ?? 2171;
  for (let i = 1; i <= n; i++) {
    const k = i / (n + 1);
    const y = lerp(yTop, yBot, k * k * 0.82 + k * 0.18);
    const half = lerp(hTop, hBot, k);
    line(ctx, cx - half * 0.86, y - 2, cx + half * 0.86, y + 1,
      { seed: seed + i, lw: 2.4, color: 'rgba(18,24,28,0.75)', amp: 1.2, parts: 4 });
  }
}

// 路边的小垃圾：一只纸团、一个瓶子
export function streetDebris(ctx, x, y, s, seed = 2181, o = {}) {
  const R = rng(seed);
  ctx.save();
  ctx.globalAlpha = o.alpha ?? 0.9;
  // 纸团
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2;
    const r = s * (0.34 + R() * 0.12);
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.55;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#6E6A60';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = P.ink;
  ctx.stroke();
  // 躺倒的瓶子
  const bx = x + s * 1.1;
  ctx.beginPath();
  ctx.ellipse(bx, y + s * 0.12, s * 0.42, s * 0.15, -0.08, 0, Math.PI * 2);
  ctx.fillStyle = '#3A4A48';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = P.ink;
  ctx.stroke();
  ctx.restore();
}

// 挡路的东西：两只木箱 + 一道斜着的挡板，把右面的去路封住
export function barricade(ctx, x, by, s, seed = 2201) {
  // 木箱
  for (const [dx, dy, k] of [[-0.32, 0, 0.62], [0.22, 0, 0.48], [-0.06, -0.46, 0.42]]) {
    const w = s * 0.62 * k * 2, h = s * 0.52 * k * 2;
    const bx = x + s * dx - w / 2, byy = by + s * dy - h;
    block(ctx, bx, byy, w, h, 4, '#5E4E3C', { stroke: P.ink, lw: 4, seed: seed + Math.round(dx * 100 + dy * 10) });
    line(ctx, bx + 6, byy + 6, bx + w - 6, byy + h - 6, { seed: seed + 3, lw: 3, color: '#4A3C2E', amp: 0.6 });
    line(ctx, bx + w - 6, byy + 6, bx + 6, byy + h - 6, { seed: seed + 4, lw: 3, color: '#4A3C2E', amp: 0.6 });
  }
  // 斜靠的挡板
  ctx.save();
  ctx.translate(x + s * 0.10, by - s * 0.30);
  ctx.rotate(-0.20);
  block(ctx, -s * 0.46, -s * 0.30, s * 0.92, s * 0.26, 4, '#8A7150', { stroke: P.ink, lw: 4, seed: seed + 7 });
  for (let i = 0; i < 3; i++) line(ctx, -s * 0.40 + i * s * 0.30, -s * 0.28, -s * 0.40 + i * s * 0.30, -s * 0.06, { seed: seed + 10 + i, lw: 3, color: '#6E583C', amp: 0.4 });
  ctx.restore();
  // 地上散落的纸箱与垃圾袋
  ctx.beginPath();
  ctx.ellipse(x - s * 0.52, by - 6, s * 0.14, s * 0.10, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#22272B';
  ctx.fill();
  block(ctx, x + s * 0.46, by - s * 0.14, s * 0.22, s * 0.14, 3, '#4E4438', { stroke: P.ink, lw: 3, seed: seed + 14 });
}

// 墙上的杂项：排水管、雨棚、护栏、配电箱、窗框
export function alleyWallDetail(ctx, side, t, o = {}) {
  const seed = o.seed ?? 2301;
  const xs = side < 0 ? 130 : 1690;
  // 竖下来的排水管
  line(ctx, xs, 300, xs + (side < 0 ? 18 : -18), 980, { seed, lw: 9, color: '#1B2228' });
  line(ctx, xs + (side < 0 ? 18 : -18), 300, xs + (side < 0 ? 18 : -18), 980, { seed: seed + 1, lw: 3, color: '#2C343B' });
  // 雨棚
  ctx.save();
  ctx.translate(xs + (side < 0 ? 60 : -60), 470);
  poly(ctx, [[-70, 0], [70, 0], [56, 30], [-56, 30]], { fill: '#3E4A4E', stroke: P.ink, lw: 3, seed: seed + 4 });
  ctx.restore();
  // 配电箱
  block(ctx, side < 0 ? xs + 40 : xs - 96, 640, 56, 70, 4, '#3A4247', { stroke: P.ink, lw: 3, seed: seed + 6 });
  for (let i = 0; i < 3; i++) line(ctx, (side < 0 ? xs + 46 : xs - 90), 656 + i * 16, (side < 0 ? xs + 88 : xs - 48), 656 + i * 16, { seed: seed + 8 + i, lw: 2, color: '#1D2429', amp: 0.3 });

  // 窗：几扇没亮的窗框 + 一扇透出一点暖光的
  const wins = side < 0
    ? [[70, 170, 96, 120, 0], [240, 620, 84, 104, 1], [40, 760, 74, 96, 0]]
    : [[1760, 190, 100, 126, 1], [1560, 720, 86, 104, 0], [1820, 830, 72, 92, 0]];
  for (const [wx, wy, ww, wh, lit] of wins) {
    block(ctx, wx, wy, ww, wh, 4, lit ? '#2E2A24' : '#1A2228', { stroke: P.ink, lw: 3, seed: seed + wx });
    // 窗棂
    line(ctx, wx + ww / 2, wy + 4, wx + ww / 2, wy + wh - 4, { seed: seed + wx + 1, lw: 2, color: '#171D22', amp: 0.3 });
    line(ctx, wx + 4, wy + wh * 0.5, wx + ww - 4, wy + wh * 0.5, { seed: seed + wx + 2, lw: 2, color: '#171D22', amp: 0.3 });
    // 窗台
    block(ctx, wx - 8, wy + wh, ww + 16, 7, 2, '#2A333A', { stroke: P.ink, lw: 2, seed: seed + wx + 3 });
    if (lit) {
      ctx.save();
      ctx.globalAlpha = 0.13 + 0.04 * Math.sin(t * 1.1 + wx);
      ctx.fillStyle = '#B48A4A';
      ctx.fillRect(wx + 5, wy + 5, ww - 10, wh - 10);
      ctx.restore();
      glow(ctx, wx + ww / 2, wy + wh / 2, ww * 0.7, 'rgba(246,201,126,0.6)', 0.10);
    }
  }
}

// ---------------- 城市（v3-11 / v3-12） ----------------

// 贴地的一层薄雾
export function mistBand(ctx, o = {}) {
  const y0 = o.y0 ?? 700, y1 = o.y1 ?? 920;
  const a = o.alpha ?? 0.13;
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, 'rgba(120,158,172,0)');
  g.addColorStop(0.55, `rgba(120,158,172,${a})`);
  g.addColorStop(1, 'rgba(96,134,150,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-300, y0, 2520, y1 - y0);
}

// 鸟群剪影：慢慢掠过，翅膀一上一下
export function birds(ctx, o = {}) {
  const t = o.t || 0;
  const n = o.n ?? 7;
  const seed = o.seed ?? 2401;
  const R = rng(seed);
  const baseX = o.x ?? 300, baseY = o.y ?? 420;
  const span = o.span ?? 900, speed = o.speed ?? 26;
  const color = o.color || '#0A1620';
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < n; i++) {
    const ox = R() * span, oy = (R() - 0.5) * 150;
    const sz = 11 + R() * 10;
    const ph = R() * Math.PI * 2;
    const sp = 1 + R() * 0.5;
    const x = baseX + ((ox + t * speed * sp) % 1500);
    const y = baseY + oy + Math.sin(t * 0.6 + ph) * 10;
    const flap = Math.sin(t * 6.2 * sp + ph);
    ctx.lineWidth = Math.max(2.2, sz * 0.19);
    ctx.beginPath();
    ctx.moveTo(x - sz, y - sz * 0.52 * flap);
    ctx.quadraticCurveTo(x - sz * 0.45, y + sz * 0.18 * flap, x, y);
    ctx.quadraticCurveTo(x + sz * 0.45, y + sz * 0.18 * flap, x + sz, y - sz * 0.52 * flap);
    ctx.stroke();
  }
  ctx.restore();
}

// 街道上极小的车灯流动
export function carLights(ctx, o = {}) {
  const t = o.t || 0;
  const n = o.n ?? 14;
  const seed = o.seed ?? 2501;
  const R = rng(seed);
  const y0 = o.y0 ?? 862, y1 = o.y1 ?? 878;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const lane = i % 2;
    const y = lerp(y0, y1, R());
    const dir = lane ? 1 : -1;
    const sp = 40 + R() * 90;
    const off = R() * 2200;
    const x = ((off + t * sp * dir) % 2200 + 2200) % 2200 - 140;
    const warm = lane === 1;
    const len = 10 + R() * 14;
    // 拖影越远越淡，看起来像在流动
    const g = ctx.createLinearGradient(x - dir * len, y, x, y);
    g.addColorStop(0, warm ? 'rgba(242,206,142,0)' : 'rgba(201,96,90,0)');
    g.addColorStop(1, warm ? 'rgba(242,206,142,0.55)' : 'rgba(201,96,90,0.5)');
    ctx.fillStyle = g;
    ctx.fillRect(x - dir * len, y - 1.4, len, 2.8);
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = warm ? '#F7DDA8' : '#D9776E';
    ctx.fillRect(x, y - 1.2, 3.2, 2.4);
    ctx.globalAlpha = 1;
    // 一点点光晕，让车灯从楼群里跳出来
    glow(ctx, x + 1, y, 16, warm ? 'rgba(255,226,170,0.85)' : 'rgba(210,110,100,0.8)', 0.30);
  }
  ctx.restore();
}

// 近景楼：比远景转得更快的一层剪影，用来做视差
export function nearSkyline(ctx, o = {}) {
  const seed = o.seed ?? 2601;
  const R = rng(seed);
  const base = o.base ?? 980;
  const color = o.color || '#0A161E';
  const top0 = o.top ?? 770;
  const gap = o.gapX || null;
  let x = -260;
  while (x < 2200) {
    const w = 110 + R() * 150;
    const h = 90 + R() * 150;
    const top = top0 + (230 - h) * 0.4;
    const blocked = gap && x + w > gap[0] && x < gap[1];
    if (!blocked) {
      block(ctx, x, top, w, base - top, 3, color, { seed: seed + Math.round(x) });
      // 一两扇小窗，别太整齐
      for (let i = 0; i < 3; i++) {
        if (R() < 0.55) {
          ctx.globalAlpha = 0.30 + R() * 0.25;
          ctx.fillStyle = '#D9A03F';
          ctx.fillRect(x + 14 + R() * (w - 34), top + 18 + R() * (base - top - 40), 6, 8);
          ctx.globalAlpha = 1;
        }
      }
    } else {
      // 跳过这一栋，但随机数照走，保证后面几栋的位置不跳
      for (let i = 0; i < 3; i++) { R(); R(); R(); }
    }
    x += w + 12 + R() * 26;
  }
}

// 屋顶上的小东西：卫星锅、晾衣绳、一只猫
export function roofExtras(ctx, o = {}) {
  const ridge = o.ridge ?? 906;
  const dx = o.dx ?? 0;
  const t = o.t || 0;
  ctx.save();
  ctx.translate(dx, 0);

  // 卫星锅（右边）
  const sx = 1666, sy = ridge - 24;
  line(ctx, sx, sy, sx, sy - 90, { seed: 2701, lw: 4, color: '#0A141B' });
  ctx.save();
  ctx.translate(sx, sy - 96);
  ctx.rotate(-0.5);
  ctx.beginPath();
  ctx.ellipse(0, 0, 44, 22, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#0C1A22';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#081218';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#12242C';
  ctx.fill();
  ctx.restore();

  // 晾衣绳（左边）
  wire(ctx, 236, ridge - 150, 560, ridge - 150, 26, 2711, { lw: 2, color: '#0A141B' });
  const sway = Math.sin(t * 1.4) * 0.06;
  for (let i = 0; i < 3; i++) {
    const x = 300 + i * 92;
    const y = ridge - 150 + Math.sin((x - 236) / 324 * Math.PI) * 26;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(sway * (i % 2 ? 1 : -1));
    poly(ctx, [[-22, 0], [22, 0], [18, 58], [0, 66], [-18, 58]], { fill: '#0E1E26', stroke: '#081218', lw: 2, seed: 2720 + i });
    ctx.restore();
  }

  // 猫：坐在檐口上，尾巴慢慢摆
  const cx2 = 1470, cy2 = ridge - 26;
  ctx.beginPath();
  ctx.ellipse(cx2, cy2 - 20, 20, 26, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#080F14';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx2, cy2 - 52, 16, 0, Math.PI * 2);
  ctx.fill();
  poly(ctx, [[cx2 - 15, cy2 - 56], [cx2 - 11, cy2 - 76], [cx2 - 2, cy2 - 62]], { fill: '#080F14', stroke: false });
  poly(ctx, [[cx2 + 15, cy2 - 56], [cx2 + 11, cy2 - 76], [cx2 + 2, cy2 - 62]], { fill: '#080F14', stroke: false });
  const tail = Math.sin(t * 1.6) * 0.35;
  ctx.save();
  ctx.translate(cx2 + 20, cy2 - 18);
  ctx.rotate(-0.8 + tail);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(30, -12, 26, -44);
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#080F14';
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
  // 猫眼的一点反光
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#C9B06A';
  ctx.fillRect(cx2 - 7, cy2 - 55, 3, 2);
  ctx.fillRect(cx2 + 4, cy2 - 55, 3, 2);
  ctx.restore();

  ctx.restore();
}

// 前景天线的加长版（屋顶上再多一根高杆，画面更有纵深）
export function tallAntenna(ctx, x, ridge, h, seed = 2801) {
  line(ctx, x, ridge - 24, x, ridge - 24 - h, { seed, lw: 4, color: '#080F14' });
  for (let i = 1; i <= 4; i++) {
    const y = ridge - 24 - h * (0.42 + i * 0.13);
    const w = 34 - i * 6;
    line(ctx, x - w, y, x + w, y, { seed: seed + i, lw: 3, color: '#080F14' });
    line(ctx, x - w * 0.6, y + 8, x + w * 0.6, y + 8, { seed: seed + 10 + i, lw: 2, color: '#080F14' });
  }
  ctx.beginPath();
  ctx.arc(x, ridge - 24 - h, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#E0566E';
  ctx.fill();
}

// ---------------- 车窗（i-05） ----------------

// 玻璃内缘：一圈冷色的边，像隔着玻璃看
export function glassEdge(ctx, x, y, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.rect(x + 3, y + 3, w - 6, h - 6);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(176,208,218,0.55)';
  ctx.stroke();
  ctx.restore();
  // 上沿内侧的暗边：玻璃厚度
  ctx.save();
  const g = ctx.createLinearGradient(0, y, 0, y + 26);
  g.addColorStop(0, 'rgba(4,10,14,0.55)');
  g.addColorStop(1, 'rgba(4,10,14,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, 26);
  ctx.restore();
}

// 外面灯条落在玻璃上的高光：跟着车速一起慢下来，但比外面慢半拍
export function glassSheen(ctx, x, y, w, h, travel, t, o = {}) {
  const R = rng(o.seed ?? 2901);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  const SPAN = 2600;
  for (let i = 0; i < 5; i++) {
    const base = R() * SPAN;
    const len = 130 + R() * 260;
    const yy = y + 40 + R() * (h - 80);
    const speed = 0.7 + R() * 0.5;
    const gx = x + ((base - travel * speed) % SPAN + SPAN) % SPAN - 340;
    const a = 0.028 + R() * 0.030;
    const g = ctx.createLinearGradient(gx - len / 2, 0, gx + len / 2, 0);
    g.addColorStop(0, 'rgba(210,232,236,0)');
    g.addColorStop(0.5, `rgba(210,232,236,${a})`);
    g.addColorStop(1, 'rgba(210,232,236,0)');
    ctx.fillStyle = g;
    ctx.fillRect(gx - len / 2, yy - 11, len, 22);
  }
  ctx.restore();
}

// ---------------- 招牌（h1-01） ----------------

// 通电时序：与 scenes-intro.js 的 SIGN_CFG 一致（该模块 2026-10-31 已冻结，此处只读镜像）
export const SIGN_IGNITION = [
  { onAt: 0.26, rise: 0.26, stut: 1, seed: 3 },
  { onAt: 0.96, rise: 0.34, stut: 1, seed: 8 },
  { onAt: 1.21, rise: 0.46, stut: 3, seed: 5 },
  { onAt: 2.14, rise: 0.58, stut: 4, seed: 11, hero: true },
  { onAt: 1.60, rise: 0.18, stut: 1, seed: 2 },
  { onAt: 1.86, rise: 0.30, stut: 2, seed: 7 },
];

// 与 signSpark 同一套起亮曲线：起亮时按镇流器抖
export function igniteAt(t, cfg) {
  if (t < cfg.onAt) return 0;
  const since = t - cfg.onAt;
  if (since > cfg.rise + 0.6) return 1;
  let a = 1;
  if (since < cfg.rise) {
    const k = since / cfg.rise;
    a = 0.16 + 0.84 * smooth(k);
    const f = Math.sin(since * (26 + cfg.seed * 3.1) + cfg.seed * 1.7);
    const gate = -0.35 + (cfg.stut / (cfg.stut + 1)) * 0.45;
    if (f < gate) a *= 0.22;
    else if (f < gate + 0.3) a *= 0.62;
    if (a < 0.1) a = 0.1;
  } else {
    const tail = 1 - (since - cfg.rise) / 0.6;
    a = 1 - Math.max(0, tail) * 0.08 * Math.abs(Math.sin(since * 37 + cfg.seed));
  }
  return clamp(a, 0, 1);
}

// 每块牌子的板型：圆角半径 / 装饰 / 字号密度都不一样
const FRAMES = [
  { r: 8, kind: 'awning' },
  { r: 26, kind: 'chain' },
  { r: 16, kind: 'double' },
  { r: 12, kind: 'hero' },
  { r: 999, kind: 'bolt' },
  { r: 8, kind: 'topBar' },
];

// 在 signWall 画完之后，把六块牌子的「空白面板」重画成笔画字，
// 亮起的一瞬有电流般的抖动，亮定之后只剩很轻的呼吸。
export function signDetail(ctx, signs, t) {
  signs.forEach((sg, i) => {
    const cfg = SIGN_IGNITION[i];
    const on = igniteAt(t, cfg);
    const F = FRAMES[i];
    const r = F.r === 999 ? sg.h / 2 : F.r;

    // 1) 用同种子的底板盖掉原来的三条横杠（与 signWall 逐像素一致）
    block(ctx, sg.x - 10, sg.y - 10, sg.w + 20, sg.h + 20, 10, '#1A262D', { stroke: P.ink, lw: 6, seed: 750 + i });

    // 2) 面板本体
    const face = on > 0.02 ? sg.face : '#39434A';
    block(ctx, sg.x, sg.y, sg.w, sg.h, r, face, { stroke: P.ink, lw: 5, seed: 760 + i });

    if (on > 0.02) {
      // 3) 亮面：暖白薄薄一层
      ctx.save();
      ctx.globalAlpha = 0.16 * on;
      ctx.fillStyle = '#FFF6DE';
      shapePath(ctx, sg.x, sg.y, sg.w, sg.h, r, 760 + i);
      ctx.fill();
      ctx.restore();

      // 4) 笔画：起亮时灰度偏高、亮度抖；亮定后稳定
      const ink = sg.ink;
      const col = on > 0.9 ? ink : mix('#6E6A5E', ink, on);
      const n = sg.hero ? 2 : (sg.w > sg.h * 1.7 ? 3 : 2);
      const jitter = on < 0.985 ? Math.sin(t * 46 + i * 2.7) * 0.9 : 0;
      // 主角牌的名字给一个明确的结构（门框 + 左右），比随机更像「字」
      const force = sg.hero ? [6, 2] : null;
      ctx.save();
      ctx.translate(jitter, 0);
      ctx.globalAlpha = 0.55 + 0.45 * on;
      const gw = sg.w * 0.78, gh = sg.h * (sg.hero ? 0.66 : 0.58);
      strokeName(ctx, sg.x + sg.w / 2, sg.y + sg.h * (sg.hero ? 0.50 : 0.45), gw, gh,
        1400 + i * 19, col, n, force);
      ctx.restore();

      // 名字底下的一条细线 + 一行小字（还是笔画，不写字）
      if (!sg.hero) {
        const uy = sg.y + sg.h * 0.76;
        line(ctx, sg.x + sg.w * 0.20, uy, sg.x + sg.w * 0.80, uy,
          { seed: 1560 + i, lw: 2.2, color: hexA(col, 0.55), amp: 0.4 });
        ctx.save();
        ctx.fillStyle = hexA(col, 0.62);
        for (let k = 0; k < 4; k++) {
          const bw = sg.w * (0.05 + ((k * 37 + i * 13) % 7) * 0.008);
          ctx.fillRect(sg.x + sg.w * (0.30 + k * 0.115), sg.y + sg.h * 0.85, bw, Math.max(2, sg.h * 0.022));
        }
        ctx.restore();
      }

      // 5) 招牌自己的一点内光（外面的光晕由 signWall 负责）
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, sg.x + sg.w / 2, sg.y + sg.h / 2, Math.max(sg.w, sg.h) * 0.55,
        'rgba(255,238,200,0.55)', 0.16 * on);
      ctx.restore();

      // 6) 板型上的小装饰
      frameTrim(ctx, sg, F.kind, i, on);
    }
  });
}

function frameTrim(ctx, sg, kind, i, on) {
  const ink = P.ink;
  if (kind === 'awning') {
    // 上面的遮檐条
    for (let k = 0; k < 3; k++) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      block(ctx, sg.x + 6 + k * ((sg.w - 12) / 3), sg.y - 22, (sg.w - 12) / 3 - 4, 12, 3, k % 2 ? '#8C5A46' : '#A86C52', { stroke: ink, lw: 2, seed: 1450 + i * 3 + k });
      ctx.restore();
    }
  } else if (kind === 'chain') {
    // 两根吊链
    for (const dx of [sg.w * 0.22, sg.w * 0.78]) {
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.ellipse(sg.x + dx, sg.y - 10 - k * 11, 4, 6, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#2A333A';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  } else if (kind === 'double') {
    // 双线边
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    shapePath(ctx, sg.x + 9, sg.y + 9, sg.w - 18, sg.h - 18, Math.max(2, 12), 1460 + i);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = on > 0.5 ? hexA(sg.ink, 0.55) : 'rgba(60,64,66,0.5)';
    ctx.stroke();
    ctx.restore();
  } else if (kind === 'hero') {
    // 主角牌：四角包边 + 下沿一道短线
    for (const [cx2, cy2, sx2, sy2] of [[0, 0, 1, 1], [1, 0, -1, 1], [0, 1, 1, -1], [1, 1, -1, -1]]) {
      const x = sg.x + cx2 * sg.w, y = sg.y + cy2 * sg.h;
      line(ctx, x, y + sy2 * 54, x, y, { seed: 1470 + Math.round(cx2 * 3 + cy2), lw: 6, color: hexA(sg.ink, 0.5) });
      line(ctx, x, y, x + sx2 * 54, y, { seed: 1480 + Math.round(cx2 * 3 + cy2), lw: 6, color: hexA(sg.ink, 0.5) });
    }
  } else if (kind === 'bolt') {
    // 四角铆钉
    for (const [bx, by] of [[12, 12], [sg.w - 12, 12], [12, sg.h - 12], [sg.w - 12, sg.h - 12]]) {
      ctx.beginPath();
      ctx.arc(sg.x + bx, sg.y + by, 4, 0, Math.PI * 2);
      ctx.fillStyle = on > 0.5 ? hexA(sg.ink, 0.5) : '#4A5257';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = ink;
      ctx.stroke();
    }
  } else if (kind === 'topBar') {
    // 顶上一条灯管槽
    block(ctx, sg.x + 14, sg.y + 8, sg.w - 28, 7, 3, on > 0.5 ? 'rgba(255,246,222,0.65)' : '#3C444A', { seed: 1490 + i });
  }
}

function hexA(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}