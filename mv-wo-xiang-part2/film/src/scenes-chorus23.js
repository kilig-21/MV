// 副歌 2 / 3 的升级场景：chorus1 的每一格都放大一档。
// 平台更大、海更宽、云床变浮岛、纸舟变唱片封套大船，音符从身体里长出来。
// chorus1 的底子留在 dream.js，这里只补新增物件，不改共享模块。
import { P } from './palette.js';
import { block, line, poly, curve, rng, glow, clamp, smooth } from './ink.js';
import { cityLine } from './scenes.js';

// 海天交界的一条暖光带：c3「最亮」靠它，不用 3D 光晕
export function horizonGlow(ctx, y, o = {}) {
  const g = ctx.createLinearGradient(0, y - 240, 0, y + 140);
  g.addColorStop(0, 'rgba(246,201,126,0)');
  g.addColorStop(0.62, o.color || 'rgba(246,201,126,0.24)');
  g.addColorStop(1, 'rgba(246,201,126,0)');
  ctx.save();
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.fillStyle = g;
  ctx.fillRect(0, y - 240, 1920, 380);
  ctx.restore();
}

// 风与雨在第二段副歌变成上升的光点
export function motes(ctx, t, n = 46, o = {}) {
  const R = rng(o.seed || 53);
  const span = o.span ?? 960;
  const y0 = o.y0 ?? 1000;
  const speed = o.speed ?? 120;
  const sway = o.sway ?? 20;
  const base = o.alpha ?? 0.75;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const bx = R() * 1920;
    const ph = R();
    const sp = 0.35 + R() * 1.3;
    const sz = R() < 0.72 ? 3 : 5;
    const tint = R();
    const rise = ((t * speed * sp + ph * span) % span + span) % span;
    const y = y0 - rise;
    const x = bx + Math.sin(t * (0.5 + sp * 0.4) + i * 1.7) * sway;
    const k = rise / span;
    ctx.globalAlpha = base * Math.min(1, k * 5) * (1 - k * 0.55);
    ctx.fillStyle = tint < 0.12 ? '#E8A0A8' : tint < 0.28 ? '#DCE9EC' : '#F1D9A8';
    ctx.fillRect(x, y, sz, sz);
  }
  ctx.restore();
}

// 远处的岛：chorus1 只升起三座，这里一排
export function farIslands(ctx, t, o = {}) {
  const y = o.y ?? 840;
  const rise = clamp(o.rise ?? 1, 0, 1);
  const n = o.n ?? 5;
  const gap = o.gap ?? 380;
  const x0 = o.x0 ?? 240;
  for (let i = 0; i < n; i++) {
    const x = x0 + i * gap + Math.sin(t * 0.25 + i * 2.1) * 10;
    const h = (70 + ((i * 53) % 120)) * (0.22 + 0.78 * rise);
    const w = 130 + ((i * 97) % 120);
    poly(ctx, [[x - w, y + 4], [x - w * 0.5, y - h], [x + w * 0.45, y - h * 0.86], [x + w, y + 4]],
      { fill: o.color || '#284B59', stroke: P.ink, lw: 4, seed: 910 + i, amp: 1.4 });
    ctx.save();
    ctx.globalAlpha = 0.6 * rise;
    ctx.fillStyle = '#E3B36A';
    ctx.fillRect(x - 8, y - h - 4, 6, 10);
    ctx.globalAlpha = 0.22 * rise;
    ctx.fillRect(x - 8, y + 8, 4, 26);
    ctx.restore();
  }
}

// 浮岛：chorus1 的云床在 2/3 段长成一整片会飘的岛
export function floatingIsland(ctx, x, y, w, t, o = {}) {
  const bob = Math.sin(t * 0.9 + (o.phase || 0)) * 6;
  const top = y + bob;
  ctx.save();
  ctx.translate(x, top);

  // 岛底垂下来的雾，先画在最后面
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#8FA6AE';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(-w * 0.3 + i * w * 0.22, 110 + (i % 2) * 26, 120 - i * 12, 30, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 两侧云团
  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.fillStyle = o.cloud || '#7E9AA4';
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(s * (w * 0.5 + 6 + i * 54), 6 + i * 24 + s * 10, 120 - i * 18, 42 - i * 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // 岩体：一块朝下收尖的岛
  poly(ctx, [
    [-w / 2, -6], [-w * 0.42, 40], [-w * 0.24, 96], [-w * 0.04, 132],
    [w * 0.16, 126], [w * 0.34, 84], [w * 0.44, 34], [w / 2, -6],
  ], { fill: o.rock || '#6B5A48', stroke: P.ink, lw: 6, seed: o.seed || 71, amp: 2 });
  for (let i = 0; i < 3; i++) {
    line(ctx, -w * 0.36 + i * w * 0.06, 16 + i * 30, w * 0.3 - i * w * 0.03, 26 + i * 30,
      { seed: 72 + i, lw: 3, color: '#57483A', amp: 2.4, parts: 4 });
  }

  // 台面：旧被子一样的一整片，云床长成岛顶
  block(ctx, -w / 2 - 18, -70, w + 36, 66, 24, o.top || '#E6DCC6',
    { stroke: P.ink, lw: 6, seed: 73, amp: 1.4 });
  line(ctx, -w / 2 - 4, -44, w / 2 + 4, -44, { seed: 74, lw: 3, color: '#C9B08A', amp: 1.6, parts: 4 });
  line(ctx, -w / 2 + 30, -24, w / 2 - 30, -24, { seed: 75, lw: 2.4, color: '#C9B08A', amp: 1.4, parts: 3 });

  // 岛顶的小草：只做几笔，告诉观众这是「地」
  ctx.save();
  ctx.strokeStyle = '#6F855D';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  const R = rng(o.seed || 71);
  for (let i = 0; i < 5; i++) {
    const gx = -w * 0.42 + R() * w * 0.84;
    ctx.beginPath();
    ctx.moveTo(gx, -70);
    ctx.lineTo(gx + (R() * 2 - 1) * 8, -86 - R() * 10);
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore();
  return { topY: top - 70 };
}

// 海与城叠在一起：楼从水里长出来，窗灯在水面拖出倒影
export function citySea(ctx, t, o = {}) {
  const y = o.y ?? 820;
  const scroll = o.scroll ?? 0;
  const seed = o.seed ?? 61;
  const minH = o.minH ?? 100, maxH = o.maxH ?? 260;

  // 倒影：镜像画一层，再用海色压暗
  ctx.save();
  ctx.beginPath(); ctx.rect(0, y, 1920, 1080 - y); ctx.clip();
  ctx.translate(0, y * 2);
  ctx.scale(1, -1);
  cityLine(ctx, { y, seed, scroll, color: o.refColor || '#1D3A47', minH, maxH, win: o.win });
  ctx.restore();

  ctx.save();
  const veil = ctx.createLinearGradient(0, y, 0, 1080);
  veil.addColorStop(0, 'rgba(36,66,79,0.62)');
  veil.addColorStop(0.5, 'rgba(36,66,79,0.78)');
  veil.addColorStop(1, 'rgba(36,66,79,0.9)');
  ctx.fillStyle = veil;
  ctx.fillRect(0, y, 1920, 1080 - y);
  ctx.restore();

  // 城本体
  cityLine(ctx, { y, seed, scroll, color: o.color || '#1E3A47', minH, maxH, win: o.win });

  // 水线 + 横纹
  line(ctx, 0, y, 1920, y, { seed: 77, lw: 4, color: 'rgba(190,220,225,0.38)', amp: 0.8 });
  for (let i = 0; i < 6; i++) {
    const yy = y + 26 + i * 42;
    line(ctx, 0, yy, 1920, yy, { seed: 780 + i, lw: 2.5, color: 'rgba(190,220,225,0.15)', amp: 2.6, parts: 5 });
  }
}

// 俯瞰的城：缩得很低、只留一层窗灯和雾
export function skylineBelow(ctx, t, o = {}) {
  const y = o.y ?? 1000;
  const top = y - 260;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, top, 1920, 1080 - top); ctx.clip();
  cityLine(ctx, { y, seed: o.seed ?? 91, scroll: o.scroll ?? 0, color: o.color || '#142B37', minH: 60, maxH: 170, win: o.win || '#E3B36A' });
  ctx.restore();

  // 高空的雾：远，所以只压一层薄纱
  const g = ctx.createLinearGradient(0, top, 0, y + 30);
  g.addColorStop(0, 'rgba(47,85,102,0.05)');
  g.addColorStop(1, 'rgba(47,85,102,0.42)');
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, top, 1920, y + 30 - top);
  ctx.restore();

  // 城市灯海：几团暖光
  for (let i = 0; i < 5; i++) {
    glow(ctx, 240 + i * 400, y - 50, 280, 'rgba(246,201,126,0.4)', 0.22);
  }
}

// 枕头：垫在角色背后，说明这是「床」
export function pillow(ctx, x, y, w, h = 62) {
  block(ctx, x - w / 2, y - h, w, h, h * 0.4, '#E8D5B0', { stroke: P.ink, lw: 6, seed: 76, amp: 1.2 });
  line(ctx, x - w * 0.32, y - h * 0.55, x + w * 0.32, y - h * 0.55, { seed: 77, lw: 2.6, color: '#C9B08A', amp: 1 });
}

// 被子：盖在角色下半身，镜头里在角色之后调用
export function quilt(ctx, x, y, w, h = 110, color = '#B98A83') {
  block(ctx, x - w / 2, y - h, w, h, 20, color, { stroke: P.ink, lw: 6, seed: 78, amp: 1.4 });
  block(ctx, x - w / 2 + 8, y - h, w - 16, 38, 16, '#D9C6A4', { stroke: P.ink, lw: 4, seed: 79, amp: 1.2 });
  line(ctx, x - w / 2 + 24, y - h * 0.45, x + w / 2 - 24, y - h * 0.45, { seed: 80, lw: 3, color: '#9A6F6A', amp: 1.2 });
}

// 黑胶音符头：一粒头 + 一根杆 + 一面旗
function noteHead(ctx, x, y, s, color, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, s, s * 0.76, -0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(s * 0.66, -s * 3.1, s * 0.42, s * 3.1);
  ctx.beginPath();
  ctx.moveTo(s * 1.08, -s * 3.1);
  ctx.quadraticCurveTo(s * 2.2, -s * 2.4, s * 1.52, -s * 1.42);
  ctx.quadraticCurveTo(s * 1.74, -s * 2.4, s * 1.08, -s * 2.32);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// 音符从身体里长出来，不再挂在耳机上
export function noteSprout(ctx, cx, by, u, t, o = {}) {
  const n = o.n ?? 7;
  const top = by - 9 * u;
  const tilt = o.tilt || 0;
  const spread = o.spread ?? 0.36;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i - (n - 1) / 2) * spread + tilt;
    const delay = (o.delay ?? 0.04) + i * (o.stagger ?? 0.1);
    const k = smooth((t - delay) / (o.grow ?? 0.6));
    if (k <= 0) continue;
    const len = (3.2 + (i % 3) * 0.8) * u * k;
    const ex = cx + Math.cos(a) * len * 0.66;
    const ey = top + Math.sin(a) * len;
    const sx = cx + Math.cos(a) * u * 0.9;
    const sy = top + Math.sin(a) * u * 0.3 + u * 0.2;
    const bend = 10 * Math.sin(t * 1.6 + i * 1.3);
    curve(ctx, [
      [sx, sy],
      [cx + Math.cos(a) * len * 0.32 + bend, top + Math.sin(a) * len * 0.56],
      [ex, ey],
    ], { stroke: o.stem || P.ink, lw: Math.max(2.4, u * 0.085) });
    noteHead(ctx, ex, ey, u * (0.34 + (i % 2) * 0.05), i % 3 === 1 ? '#E8A0A8' : '#EBDDB4', a * 0.5 + 0.22);
  }
}

// 唱片封套折成的大船：船身是折起来的封套，黑胶立起来当帆
export function recordBoat(ctx, x, y, s, t, o = {}) {
  const bob = Math.sin(t * 1.2 + (o.phase || 0)) * 6;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate(Math.sin(t * 0.7) * 0.022);

  const rx = s * (o.sailX ?? 0.1), ry = -s * 0.04, rr = s * 0.54;

  // 桅杆 + 封套旗，先画，船身后来压住底边
  line(ctx, rx, ry, rx, -s * 1.1, { seed: 806, lw: Math.max(4, s * 0.02), color: P.ink, amp: 0.6 });
  poly(ctx, [[rx, -s * 1.08], [rx + s * 0.6, -s * 0.78], [rx, -s * 0.52]],
    { fill: P.pink, stroke: P.ink, lw: 5, seed: 807, amp: 0.8 });

  // 黑胶帆
  ctx.beginPath(); ctx.arc(rx, ry, rr, 0, Math.PI * 2);
  ctx.fillStyle = '#1A1E26'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = P.ink; ctx.stroke();
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(rx, ry, rr * (0.52 + i * 0.13), 0, Math.PI * 2);
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = 'rgba(241,217,168,0.16)';
    ctx.stroke();
  }
  // 标签
  ctx.beginPath(); ctx.arc(rx, ry, rr * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = P.mustard; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = P.ink; ctx.stroke();
  ctx.beginPath(); ctx.arc(rx, ry, rr * 0.07, 0, Math.PI * 2);
  ctx.fillStyle = '#1A1E26'; ctx.fill();

  // 船身：折起来的封套，折角朝下
  poly(ctx, [[-s, -4], [s, -4], [s * 0.62, s * 0.5], [-s * 0.62, s * 0.5]],
    { fill: '#262A33', stroke: P.ink, lw: 7, seed: 801, amp: 1.4 });
  // 内页露出的白边
  poly(ctx, [[-s, -6], [s * 0.42, -6], [s * 0.24, -s * 0.16], [-s * 0.72, -s * 0.16]],
    { fill: '#F2E3C6', stroke: P.ink, lw: 4, seed: 802, amp: 0.8 });
  // 折痕 + 封套边线
  line(ctx, -s * 0.94, -6, s * 0.94, -6, { seed: 803, lw: 3, color: '#4A4E58', amp: 0.6 });
  line(ctx, -s * 0.55, -4, -s * 0.42, s * 0.44, { seed: 804, lw: 3, color: '#3E424C', amp: 0.8 });
  line(ctx, s * 0.55, -4, s * 0.42, s * 0.44, { seed: 805, lw: 3, color: '#3E424C', amp: 0.8 });

  // 船尾小旗
  line(ctx, -s * 0.84, -6, -s * 0.84, -s * 0.62, { seed: 808, lw: 4, color: P.ink, amp: 0.5 });
  poly(ctx, [[-s * 0.84, -s * 0.6], [-s * 0.5, -s * 0.5], [-s * 0.84, -s * 0.36]],
    { fill: '#F2E3C6', stroke: P.ink, lw: 4, seed: 809, amp: 0.8 });

  // 船头水花
  ctx.save();
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 3; i++) {
    line(ctx, -s * 1.5 - i * 46, s * 0.3 + i * 16, -s * 1.02, s * 0.3 + i * 16,
      { seed: 810 + i, lw: 3.4, color: '#DCE9EC', amp: 2 });
  }
  ctx.restore();

  ctx.restore();
  return { deck: y + bob - 8 };
}

// 大车票平台：chorus2 起平台更大，票面细节也放大到看得见
export function bigTicket(ctx, x, y, w, t, o = {}) {
  const bob = Math.sin(t * 1.2 + (o.phase || 0)) * 6;
  const yy = y + bob;
  const h = o.h ?? 64;
  const top = yy - h;
  ctx.save();
  ctx.translate(x, yy);
  ctx.rotate((o.rot || 0) + Math.sin(t * 0.7 + (o.phase || 0)) * 0.01);

  // 票面
  block(ctx, -w / 2, -h, w, h, 10, o.color || '#E8D5B0',
    { stroke: P.ink, lw: 6, seed: o.seed || 11, amp: 1.4 });

  // 上下撕齿
  const n = Math.max(8, Math.round(w / 56));
  ctx.fillStyle = 'rgba(28,34,40,0.5)';
  for (let i = 1; i < n; i++) {
    const px = -w / 2 + (w / n) * i;
    ctx.beginPath(); ctx.arc(px, -h, 5, 0, Math.PI); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(px, 0, 5, Math.PI, Math.PI * 2); ctx.closePath(); ctx.fill();
  }

  // 票根撕线
  const tx = w / 2 - w * 0.22;
  for (let i = 0; i < 7; i++) {
    const dy = -h + 8 + i * (h - 16) / 6;
    line(ctx, tx, dy, tx, dy + 5, { seed: 900 + i, lw: 3, color: 'rgba(120,100,70,0.7)', parts: 1, amp: 0.4 });
  }

  // 印刷线
  line(ctx, -w / 2 + 30, -h * 0.62, tx - 26, -h * 0.62, { seed: 15, lw: 2.6, color: 'rgba(120,100,70,0.45)', amp: 1 });
  line(ctx, -w / 2 + 30, -h * 0.3, tx - 26, -h * 0.3, { seed: 16, lw: 2.6, color: 'rgba(120,100,70,0.45)', amp: 1 });

  // 票根上的印章
  const sx = tx + (w / 2 - tx) / 2, sy = -h / 2;
  ctx.beginPath(); ctx.arc(sx, sy, h * 0.3, 0, Math.PI * 2);
  ctx.lineWidth = 3.4; ctx.strokeStyle = 'rgba(214,96,116,0.8)'; ctx.stroke();
  ctx.beginPath(); ctx.arc(sx, sy, h * 0.13, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(214,96,116,0.7)'; ctx.fill();

  ctx.restore();
  return top;   // 票面
}

// 云团：平涂加一层受光，不是半透明雾
export function cloudBank(ctx, x, y, s, o = {}) {
  const a = o.alpha ?? 0.9;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = o.fill || '#3C5E6D';
  ctx.beginPath();
  ctx.ellipse(x, y, 220 * s, 78 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 160 * s, y + 24 * s, 150 * s, 56 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 160 * s, y + 26 * s, 160 * s, 54 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 60 * s, y - 46 * s, 140 * s, 66 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = a * 0.4;
  ctx.strokeStyle = '#7FA3AF';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.ellipse(x + 60 * s, y - 46 * s, 138 * s, 64 * s, 0, Math.PI * 1.1, Math.PI * 1.85);
  ctx.stroke();
  ctx.restore();
}

// 远处的月：自己画，天空色由调用方给，避免咬口和天空对不上
export function farMoon(ctx, x, y, r, sky = '#1E3B4B') {
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#EBDDB4'; ctx.fill();
  ctx.beginPath(); ctx.arc(x - r * 0.52, y - r * 0.2, r * 0.9, 0, Math.PI * 2);
  ctx.fillStyle = sky; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r, Math.PI * 0.36, Math.PI * 1.72);
  ctx.lineWidth = Math.max(3, r * 0.08);
  ctx.strokeStyle = P.ink; ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}

// 醒：白光先罩住，再退去；返回 0→1 的清醒度
export function wakeFlash(ctx, t, o = {}) {
  const k = smooth(t / (o.dur ?? 0.42));
  ctx.save();
  ctx.globalAlpha = (1 - k) * (o.peak ?? 0.92);
  ctx.fillStyle = o.color || '#F1D9A8';
  ctx.fillRect(0, 0, 1920, 1080);
  ctx.restore();
  return k;
}