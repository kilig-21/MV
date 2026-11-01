// 第二轮 · chorus2 内部差异化专用。
// 目的：同一段副歌里八镜要有八个空间，不能"同一套构图换颜色"。
// 这里只放 c2 新机位要用的层：虚线灯、俯视海、低机位票面、玻璃反光、前景云等。
// 共享模块（dream / scenes-chorus23 / ink）只读，不在这里改。
import { P } from './palette.js';
import { block, line, poly, curve, rr, rng, glow, clamp, smooth, lerp } from './ink.js';

// ---------- 背景：被虚化的城市灯（c2-02） ----------
// 不用滤镜：没有墨线、低对比、三五层同心圆叠出来的"失焦灯团"。
export function bokehCity(ctx, t, o = {}) {
  const y = o.y ?? 720;
  const R = rng(o.seed || 501);

  // 楼影：只给色块，不给线，读作"焦外"
  ctx.save();
  for (let i = 0; i < 10; i++) {
    const bx = -140 + i * 230 + R() * 50;
    const bw = 140 + R() * 200;
    const bh = 150 + R() * 400;
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = i % 2 ? '#16303C' : '#122B36';
    ctx.fillRect(bx, y - bh, bw, bh + 380);
  }

  // 几扇模糊窗：小方块，压得很低
  for (let i = 0; i < 26; i++) {
    ctx.globalAlpha = 0.18 + R() * 0.16;
    ctx.fillStyle = R() < 0.7 ? '#E3B36A' : '#9FC3CE';
    ctx.fillRect(-80 + R() * 2080, y - 420 + R() * 380, 8 + R() * 14, 10 + R() * 16);
  }
  ctx.restore();

  // 灯团：远→近三层，越靠外越淡
  const L = [
    [300, 650, 78], [560, 500, 46], [860, 700, 96], [1130, 470, 54],
    [1420, 660, 84], [1710, 520, 44], [220, 420, 36], [1010, 300, 30],
    [760, 250, 24], [1560, 380, 22],
  ];
  for (let i = 0; i < L.length; i++) {
    const [x, yy, r] = L[i];
    const tw = 0.78 + 0.22 * Math.sin(t * 1.1 + i * 1.7);
    const rgb = i % 4 === 0 ? '232,160,168' : i % 3 === 0 ? '220,233,236' : '246,201,126';
    // 灯团：一层大光晕 + 一点实心芯，边缘散开，读作"失焦"
    glow(ctx, x + Math.sin(t * 0.4 + i) * 6, yy, r * 1.5, `rgba(${rgb},1)`, 0.11 * tw);
    ctx.beginPath();
    ctx.arc(x, yy, r * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb},${(0.3 * tw).toFixed(3)})`;
    ctx.fill();
  }
}

// ---------- 前景：近视差雨丝 ----------
export function fgRain(ctx, t, n = 14, o = {}) {
  const a = o.alpha ?? 0.5;
  const dir = o.dir ?? -1;
  const R = rng(o.seed || 611);
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const sp = (o.speed ?? 1500) * (0.7 + R() * 0.9);
    const x0 = R() * 2300;
    const y = ((R() * 1320 + t * sp) % 1320) - 140;
    const x = ((x0 - t * sp * 0.16 * dir) % 2300 + 2300) % 2300 - 200;
    ctx.globalAlpha = a * (0.3 + R() * 0.7);
    ctx.strokeStyle = i % 5 ? 'rgba(220,233,236,0.9)' : 'rgba(246,201,126,0.85)';
    ctx.lineWidth = 2.6 + (i % 4) * 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 9 * dir, y + 140 + (i % 5) * 26);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- 音符 ----------
export function noteMark(ctx, x, y, s, color, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, s, s * 0.78, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(s * 0.72, -s * 3.0, s * 0.44, s * 3.0);
  ctx.beginPath();
  ctx.moveTo(s * 1.16, -s * 3.0);
  ctx.quadraticCurveTo(s * 2.25, -s * 2.35, s * 1.55, -s * 1.38);
  ctx.quadraticCurveTo(s * 1.8, -s * 2.35, s * 1.16, -s * 2.28);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// 绕角色一圈的音符：front=false 画后半圈（在角色身后），front=true 画前半圈（挡住角色）
export function noteOrbit(ctx, o, phase = 0, front = false) {
  const cx = o.cx ?? 960, cy = o.cy ?? 620;
  const rx = o.rx ?? 430, ry = o.ry ?? 210;
  const t = o.t ?? 0;
  const n = o.n ?? 11;
  // 环的轨迹：只画后半圈那条淡淡的椭圆，让"绕成环"读得出来
  if (!front && o.ring) {
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#F1D9A8';
    ctx.setLineDash([14, 20]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, Math.PI * 0.55, Math.PI * 0.45, false);
    ctx.stroke();
    ctx.restore();
  }
  for (let i = 0; i < n; i++) {
    const a = phase + i * (Math.PI * 2 / n);
    const sy = Math.sin(a);
    if ((sy > 0) !== front) continue;
    const k = 0.52 + 0.48 * (sy + 1) / 2;
    noteMark(
      ctx,
      cx + Math.cos(a) * rx,
      cy + sy * ry - Math.abs(Math.sin(t * 1.1 + i)) * 7,
      (o.size ?? 17) * k,
      i % 3 === 0 ? P.pink : i % 3 === 1 ? P.cream : P.lamp,
      Math.cos(a) * 0.24,
    );
  }
}

// ---------- 低机位：车票平台只留"上沿 + 前脸"（c2-01 / c2-03） ----------
export function lowTicket(ctx, x, y, w, t, o = {}) {
  const bob = Math.sin(t * 1.2 + (o.phase || 0)) * 6;
  const yy = y + bob;
  const h = o.h ?? 74;
  ctx.save();
  ctx.translate(x, yy);
  ctx.rotate((o.rot || 0) + Math.sin(t * 0.7 + (o.phase || 0)) * 0.008);
  // 前脸（从下往上看，看见票的厚度）
  block(ctx, -w / 2, -h, w, h, 12, o.color || '#C9AE84', { stroke: P.ink, lw: 7, seed: o.seed || 611, amp: 1.6 });
  // 上沿一条亮面
  block(ctx, -w / 2, -h, w, 12, 6, '#E8D5B0', { stroke: P.ink, lw: 4, seed: (o.seed || 611) + 1, amp: 0.8 });
  // 撕齿
  const n = Math.max(7, Math.round(w / 62));
  ctx.fillStyle = 'rgba(28,34,40,0.55)';
  for (let i = 1; i < n; i++) {
    const px = -w / 2 + (w / n) * i;
    ctx.beginPath(); ctx.arc(px, -h, 6, 0, Math.PI); ctx.closePath(); ctx.fill();
  }
  // 印刷线
  line(ctx, -w / 2 + 34, -h * 0.52, w / 2 - 34, -h * 0.52, { seed: (o.seed || 611) + 2, lw: 3, color: 'rgba(120,100,70,0.45)', amp: 1.4 });
  ctx.restore();
  return yy - h;
}

// ---------- 车票地面：透视铺满下半屏（c2-04） ----------
export function ticketFloor(ctx, t, o = {}) {
  const farY = o.farY ?? 520, nearY = o.nearY ?? 1120;
  const farW = o.farW ?? 900, nearW = o.nearW ?? 2600;
  const cx = o.cx ?? 960;
  ctx.save();
  // 票面
  poly(ctx, [
    [cx - farW / 2, farY], [cx + farW / 2, farY],
    [cx + nearW / 2, nearY], [cx - nearW / 2, nearY],
  ], { fill: o.color || '#E8D5B0', stroke: P.ink, lw: 7, seed: o.seed || 641, amp: 1.2 });
  // 透视里的印刷线
  for (let i = 1; i < 5; i++) {
    const k = i / 5;
    const y = lerp(farY, nearY, k * k);
    const w = lerp(farW, nearW, k * k);
    line(ctx, cx - w / 2 + 24, y, cx + w / 2 - 24, y, { seed: 642 + i, lw: 3, color: 'rgba(120,100,70,0.35)', amp: 1.2, parts: 5 });
  }
  // 票根竖撕线
  const tx = cx + lerp(farW, nearW, 0.72) * 0.5 - 60;
  line(ctx, cx + farW * 0.34, farY, cx + nearW * 0.34, nearY, { seed: 648, lw: 4, color: 'rgba(120,100,70,0.4)', amp: 1.6, parts: 6 });
  ctx.restore();
  return farY;
}

// ---------- 俯视海面：没有地平线（c2-05） ----------
export function seaTop(ctx, t, o = {}) {
  const cx = o.cx ?? 960, cy = o.cy ?? 660;
  ctx.fillStyle = o.base || '#20414E';
  ctx.fillRect(0, 0, 1920, 1080);

  // 横向水纹：平涂线，越往下越疏
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < 15; i++) {
    const y = 40 + i * 76;
    const drift = Math.sin(t * 0.7 + i * 0.9) * 26;
    ctx.globalAlpha = 0.09 + (i % 3) * 0.03;
    line(ctx, -60 + drift, y, 1980 + drift, y,
      { seed: 900 + i, lw: 3, color: i % 2 ? 'rgba(190,220,225,1)' : 'rgba(240,220,180,1)', amp: 2.4, parts: 6 });
  }
  ctx.restore();

  // 平台周围一圈圈扩散的涟漪
  for (let k = 0; k < 4; k++) {
    const p = ((t * 0.3 + k / 4) % 1);
    ctx.beginPath();
    ctx.globalAlpha = (1 - p) * 0.26;
    ctx.lineWidth = 4 - p * 2;
    ctx.strokeStyle = '#BEDCE1';
    ctx.ellipse(cx, cy, 100 + p * 980, 36 + p * 360, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // 高空的冷光：水面上几处缓动的光斑
  glow(ctx, 340, 260, 380, 'rgba(190,220,225,0.5)', 0.16);
  glow(ctx, 1520, 380, 420, 'rgba(246,201,126,0.5)', 0.12);
}

// 俯视里的一座岛：从水里升起，k = 0→1
export function islandTop(ctx, x, y, s, k, t, o = {}) {
  k = clamp(k, 0, 1);
  if (k <= 0.002) return;
  const R = rng(o.seed || 721);
  const w = 300 * s, h = 160 * s;
  const yy = y + (1 - k) * 26;

  // 水下扩散的浪圈
  for (let i = 0; i < 2; i++) {
    const p = (k * 0.7 + i * 0.4) % 1;
    ctx.beginPath();
    ctx.globalAlpha = (1 - p) * 0.5 * k;
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#CFE6E9';
    ctx.ellipse(x, yy + h * 0.28, w * (0.36 + p * 0.9), h * (0.16 + p * 0.4), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // 岛体：一圈不规则边缘
  const pts = [];
  const n = 10;
  const grow = 0.5 + 0.5 * k;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2;
    const j = 1 + (R() * 2 - 1) * 0.2;
    pts.push([x + Math.cos(a) * w * 0.5 * j * grow, yy + Math.sin(a) * h * 0.5 * j * grow]);
  }
  poly(ctx, pts, { fill: o.fill || '#2B4A50', stroke: P.ink, lw: 5, seed: o.seed || 722, amp: 1.6 });

  // 岛顶：受光的岩台
  ctx.globalAlpha = 0.85 * k;
  poly(ctx, pts.map(([px, py]) => [x + (px - x) * 0.66, yy + (py - yy) * 0.62 - 5]),
    { fill: o.top || '#3D6158', stroke: null, seed: 723, amp: 1.2 });
  ctx.globalAlpha = 1;

  // 岛上一点暖色小屋，让"岛"有尺度
  if (k > 0.45) {
    const hs = 10 * s;
    block(ctx, x - hs, yy - hs * 1.6, hs * 2, hs * 1.5, 2, '#D9C6A4', { stroke: P.ink, lw: 3, seed: 724, amp: 0.6 });
    ctx.fillStyle = P.lamp;
    ctx.fillRect(x - hs * 0.35, yy - hs * 1.15, hs * 0.7, hs * 0.55);
  }
}

// 前景浪头：压住画面下缘（c2-05）
export function waveCrest(ctx, x, y, w, t, o = {}) {
  const a = o.alpha ?? 0.95;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.62, 1100);
  for (let i = 0; i <= 9; i++) {
    const px = x - w * 0.52 + (w / 9) * i;
    const py = y + Math.sin(t * 0.9 + i * 0.8) * 24 + Math.sin(i * 2.1) * 16;
    ctx.lineTo(px, py);
  }
  ctx.lineTo(x + w * 0.62, 1100);
  ctx.closePath();
  ctx.fillStyle = o.fill || '#17343F';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = P.ink;
  ctx.lineJoin = 'round';
  ctx.stroke();
  // 浪尖白
  ctx.globalAlpha = a * 0.55;
  for (let i = 0; i < 5; i++) {
    const px = x - w * 0.34 + i * w * 0.17;
    line(ctx, px, y + Math.sin(t * 0.9 + i) * 18, px + 44, y + 20 + Math.sin(t * 0.9 + i) * 18,
      { seed: 730 + i, lw: 4, color: '#DCE9EC', amp: 2 });
  }
  ctx.restore();
}

// ---------- 前景飘纸 ----------
export function scraps(ctx, t, n = 7, o = {}) {
  const R = rng(o.seed || 811);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const sp = (o.speed ?? 260) * (0.5 + R());
    const x = ((R() * 2300 - t * sp) % 2300 + 2300) % 2300 - 200;
    const y = (o.y0 ?? 120) + R() * (o.span ?? 760) + Math.sin(t * 0.8 + i) * 26;
    const s = 12 + R() * 18;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * (0.6 + R()) + i);
    ctx.globalAlpha = 0.55 + R() * 0.35;
    ctx.fillStyle = i % 3 ? '#E8D5B0' : '#E8A0A8';
    ctx.fillRect(-s / 2, -s / 3, s, s * 0.66);
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = P.ink;
    ctx.strokeRect(-s / 2, -s / 3, s, s * 0.66);
    ctx.restore();
  }
  ctx.restore();
}

// ---------- 俯视浮岛（c2-07） ----------
export function islandTopView(ctx, cx, cy, w, h, t, o = {}) {
  const R = rng(o.seed || 931);
  const outer = [], n = 16;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2;
    const j = 1 + (R() * 2 - 1) * 0.07;
    outer.push([cx + Math.cos(a) * w * 0.5 * j, cy + Math.sin(a) * h * 0.5 * j]);
  }
  poly(ctx, outer, { fill: o.rim || '#3A5B52', stroke: P.ink, lw: 7, seed: 932, amp: 2 });

  const inner = outer.map(([x, y]) => [cx + (x - cx) * 0.84, cy + (y - cy) * 0.8 - 6]);
  poly(ctx, inner, { fill: o.top || '#6F855D', stroke: P.ink, lw: 4, seed: 933, amp: 1.4 });

  // 草与土：几笔就够，别画满
  ctx.save();
  ctx.strokeStyle = '#4E6647';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (let i = 0; i < 10; i++) {
    const a = R() * Math.PI * 2, rad = 0.55 + R() * 0.35;
    const gx = cx + Math.cos(a) * w * 0.42 * rad;
    const gy = cy + Math.sin(a) * h * 0.38 * rad;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + (R() * 2 - 1) * 10, gy - 12 - R() * 12);
    ctx.stroke();
  }
  ctx.restore();

  // 岛的边缘一圈受光
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 10, w * 0.5, h * 0.5, 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#9FB89A';
  ctx.stroke();
  ctx.restore();

  return { cx, cy, w, h };
}

// 一团盖在身上的云（c2-07 前景）
export function cloudPuff(ctx, x, y, s, t, o = {}) {
  const a = o.alpha ?? 0.95;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = o.fill || '#DCE3DA';
  ctx.beginPath();
  ctx.ellipse(x, y, 120 * s, 52 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 96 * s, y + 10 * s, 78 * s, 40 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 92 * s, y + 12 * s, 84 * s, 42 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 20 * s, y - 34 * s, 76 * s, 42 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = a * 0.55;
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#A9BDB4';
  ctx.beginPath();
  ctx.ellipse(x + 20 * s, y - 34 * s, 74 * s, 40 * s, 0, Math.PI * 1.1, Math.PI * 1.85);
  ctx.stroke();
  ctx.restore();
}

// ---------- 玻璃反光（c2-08） ----------
export function glassOverlay(ctx, t, o = {}) {
  const x = o.x ?? 388, y = o.y ?? -10, w = o.w ?? 1144, h = o.h ?? 1100;
  ctx.save();

  // 斜向高光带
  ctx.globalAlpha = 0.10;
  ctx.fillStyle = '#DCE9EC';
  const band = (a, b, c, dd) => {
    ctx.beginPath();
    ctx.moveTo(x + w * a, y + h); ctx.lineTo(x + w * b, y);
    ctx.lineTo(x + w * c, y); ctx.lineTo(x + w * dd, y + h);
    ctx.closePath(); ctx.fill();
  };
  band(0.05, 0.28, 0.38, 0.15);
  band(0.42, 0.62, 0.68, 0.48);

  // 外面的灯落在玻璃上的光斑
  const R = rng(921);
  for (let i = 0; i < 16; i++) {
    const px = x + R() * w, py = y + R() * h;
    ctx.globalAlpha = 0.09 + R() * 0.15;
    ctx.fillStyle = i % 3 ? 'rgba(246,201,126,1)' : 'rgba(220,233,236,1)';
    ctx.beginPath();
    ctx.arc(px, py + Math.sin(t * 0.7 + i) * 4, 3 + R() * 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // 一条镜面反光横过去
  ctx.globalAlpha = 0.11;
  ctx.fillStyle = '#F7EFDD';
  ctx.fillRect(x, y + h * 0.3 + Math.sin(t * 0.5) * 5, w, 26);
  ctx.restore();
}

// ---------- 云从画面下缘压上来（c2-01） ----------
// 画在角色之后，作为前景：k = 0→1
export function pressCloudFront(ctx, t, k, o = {}) {
  const y0 = 1120 - k * 150;
  const R = rng(o.seed || 1041);
  for (let i = 0; i < 5; i++) {
    const x = -120 + i * 470 + R() * 90;
    const y = y0 + (i % 2) * 44 + Math.sin(t * 0.8 + i) * 8;
    const s = 0.95 + (i % 3) * 0.18;
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = i % 2 ? '#234451' : '#1D3A47';
    ctx.beginPath();
    ctx.ellipse(x, y, 230 * s, 74 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 170 * s, y + 20 * s, 150 * s, 56 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 170 * s, y + 24 * s, 165 * s, 58 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 60 * s, y - 52 * s, 140 * s, 62 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // 受光的顶边
    ctx.globalAlpha = 0.32;
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#7FA3AF';
    ctx.beginPath();
    ctx.ellipse(x + 60 * s, y - 52 * s, 138 * s, 60 * s, 0, Math.PI * 1.08, Math.PI * 1.9);
    ctx.stroke();
    ctx.restore();
  }
}

// ---------- 远景城市：只有窗灯和一条屋脊线（c2-06） ----------
export function distantCity(ctx, t, o = {}) {
  const y = o.y ?? 640;
  const scroll = o.scroll ?? t * 26;
  const R = rng(o.seed || 1051);
  ctx.save();
  ctx.globalAlpha = o.alpha ?? 0.9;
  let x = -140 - ((scroll % 300) + 300) % 300;
  while (x < 2060) {
    const w = 90 + R() * 130;
    const h = 60 + R() * 170;
    ctx.fillStyle = '#1A3543';
    ctx.fillRect(x, y - h, w, h + 6);
    for (let c = 0; c < Math.floor(w / 46); c++) {
      for (let r = 0; r < Math.floor(h / 52); r++) {
        if (R() < 0.3) {
          ctx.globalAlpha = (o.alpha ?? 0.9) * (0.4 + R() * 0.45);
          ctx.fillStyle = R() < 0.75 ? '#E3B36A' : '#9FC3CE';
          ctx.fillRect(x + 16 + c * 46, y - h + 18 + r * 52, 11, 14);
          ctx.globalAlpha = o.alpha ?? 0.9;
        }
      }
    }
    x += w + 16 + R() * 26;
  }
  ctx.restore();

  // 雾：把远城压灰，形成纵深
  const g = ctx.createLinearGradient(0, y - 230, 0, y + 60);
  g.addColorStop(0, 'rgba(47,85,102,0)');
  g.addColorStop(1, 'rgba(47,85,102,0.55)');
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, y - 230, 1920, 290);
  ctx.restore();
}