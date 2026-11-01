// 尾奏（outro）专用场景：与 intro 同源的城市窗灯、末班车、车厢灯灭、隧道车尾、制作名单底框。
// 只补 scenes.js 没有的；天空、星星、月亮、楼群、车厢仍走 scenes.js。
import { P } from './palette.js';
import { block, line, poly, rng, glow, clamp, lerp, smooth, easeOut, hash } from './ink.js';
import { nightSky, stars, moon, cityLine } from './scenes.js';
import { cityWindowsIO } from './polish-intro-outro.js';

// ---------------- 城市窗灯：可亮可灭 ----------------
// 打磨后与 intro 共用 polish-intro-outro.cityWindowsIO（同一份楼群与窗位数据），
// 这样 o-04 / o-06 的最后一帧仍能和 intro 的第一帧对齐，首尾成环。
export function cityWindows(ctx, o = {}) {
  return cityWindowsIO(ctx, o);
}

// ---------------- 城市底部冷雾 + 零星街灯（与 i-01 同一层） ----------------
export function cityHaze(ctx, o = {}) {
  const y = o.y ?? 790;
  const t = o.t ?? 0;
  ctx.save();
  ctx.globalAlpha = 0.5;
  const haze = ctx.createLinearGradient(0, y, 0, 1080);
  haze.addColorStop(0, 'rgba(40,65,79,0)');
  haze.addColorStop(1, 'rgba(28,48,60,0.85)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, y, 1920, 1080 - y);
  ctx.restore();

  const R = rng(902);
  for (let i = 0; i < 7; i++) {
    const x = ((R() * 2200 - t * 28) % 2200 + 2200) % 2200 - 140;
    const y2 = 860 + R() * 170;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#E3B36A';
    ctx.fillRect(x, y2, 10, 4);
    ctx.globalAlpha = 0.10;
    ctx.beginPath(); ctx.arc(x + 5, y2 + 2, 26, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ---------------- 与 intro 同源的城市全景（可拉远、可压暗） ----------------
export function introCity(ctx, o = {}) {
  const scrollT = o.scrollT ?? 0;
  const litP = o.litP ?? 1;
  const offP = o.offP ?? 0;
  const zoom = o.zoom ?? 1;
  const zx = o.zx ?? 960, zy = o.zy ?? 760;
  const fade = o.fade ?? 0;

  if (zoom !== 1) {
    ctx.save();
    ctx.translate(zx, zy);
    ctx.scale(zoom, zoom);
    ctx.translate(-zx, -zy);
  }

  nightSky(ctx, {});
  stars(ctx, { n: 42, h: 470, seed: 5 });
  moon(ctx, 330, 168, 50, P.sky);
  cityLine(ctx, { y: 650, seed: 21, minH: 120, maxH: 280, color: '#12222D', scroll: scrollT * 10 });
  cityLine(ctx, { y: 742, seed: 34, minH: 70, maxH: 180, color: '#152A35', scroll: scrollT * 16 });

  const res = cityWindows(ctx, {
    litP, offP, y: 828, scroll: scrollT * 24, seed: 71,
    offSpan: o.offSpan ?? 7,
    litSpan: o.litSpan ?? 4.4,
  });

  cityHaze(ctx, { y: 790, t: scrollT });

  if (zoom !== 1) ctx.restore();

  if (fade > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(fade, 0, 1);
    ctx.fillStyle = '#08101A';
    ctx.fillRect(0, 0, 1920, 1080);
    ctx.restore();
  }
  return res;
}

// ---------------- 城市高架桥 ----------------
export function viaduct(ctx, o = {}) {
  const y = o.y ?? 806;
  const scroll = o.scroll ?? 0;

  // 桥墩（先画，被桥面压住）
  for (let i = 0; i < 7; i++) {
    const x = -120 + i * 336;
    block(ctx, x, y + 6, 80, 152, 6, '#16262F', { stroke: '#0D1A22', lw: 3, seed: 650 + i });
    block(ctx, x - 16, y + 134, 112, 28, 4, '#12212A', { seed: 660 + i });
  }
  // 桥面
  block(ctx, -40, y - 28, 2000, 36, 4, '#223541', { stroke: P.ink, lw: 5, seed: 641 });
  line(ctx, -40, y - 30, 1960, y - 30, { seed: 642, lw: 3, color: '#3E5A66', amp: 0.8 });
  // 栏杆
  for (let i = 0; i < 16; i++) {
    const x = 30 + i * 124 - (((scroll % 124) + 124) % 124);
    line(ctx, x, y - 47, x, y - 30, { seed: 643 + i, lw: 3, color: '#2C4551', amp: 0.6 });
  }
  line(ctx, -40, y - 47, 1960, y - 47, { seed: 669, lw: 2.4, color: '#2C4551', amp: 0.6, parts: 8 });
}

// ---------------- 末班车（车头朝右，车底坐在桥面上） ----------------
export function lastTrain(ctx, o = {}) {
  const x = o.x ?? 0;          // 车头（右端）
  const y = o.y ?? 780;        // 车底基线
  const len = o.len ?? 640;
  const h = o.h ?? 76;
  const a = o.alpha ?? 1;
  const left = x - len;
  ctx.save();
  ctx.globalAlpha = clamp(a, 0, 1);

  // 车身
  block(ctx, left, y - h, len, h, 10, '#223A47', { stroke: P.ink, lw: 5, seed: 671 });
  // 车顶亮边
  block(ctx, left + 4, y - h, len - 8, 6, 3, '#3C5A67', { seed: 670 });
  // 车头斜切
  poly(ctx, [[x - 52, y - h], [x, y - h], [x, y - h * 0.4], [x - 16, y]], { fill: '#223A47', stroke: P.ink, lw: 5, seed: 672 });
  // 裙边
  block(ctx, left + 10, y - 17, len - 26, 11, 4, '#2A4551', { seed: 673 });
  // 车窗：暖格
  for (let i = 0; i < 6; i++) {
    const wx = left + 70 + i * 92;
    if (wx + 62 > x - 40) break;
    block(ctx, wx, y - h + 19, 62, 26, 5, '#F0C57E', { seed: 674 + i });
    ctx.save();
    ctx.globalAlpha = 0.22 * a;
    ctx.fillStyle = '#FFF3D6';
    ctx.fillRect(wx, y - h + 19, 62, 26);
    ctx.restore();
  }
  // 车门缝
  line(ctx, left + len * 0.56, y - h + 12, left + len * 0.56, y - 8, { seed: 681, lw: 3, color: '#0C161C' });
  // 集电弓
  line(ctx, left + len * 0.74, y - h, left + len * 0.7, y - h - 22, { seed: 682, lw: 3, color: P.ink });
  line(ctx, left + len * 0.7, y - h - 22, left + len * 0.8, y - h - 18, { seed: 683, lw: 3, color: P.ink });

  // 前灯 + 一束落在桥面上的光
  const hx = x - 16, hy = y - h * 0.52;
  const beam = ctx.createLinearGradient(hx, 0, hx + 320, 0);
  beam.addColorStop(0, 'rgba(255,238,190,0.30)');
  beam.addColorStop(1, 'rgba(255,238,190,0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(hx, hy); ctx.lineTo(hx + 320, y - 26);
  ctx.lineTo(hx + 320, y + 2); ctx.lineTo(hx, y);
  ctx.closePath(); ctx.fill();
  glow(ctx, hx, hy, 130, 'rgba(255,238,190,0.8)', 0.5);
  ctx.beginPath(); ctx.arc(hx, hy, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#FFF4D2'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = P.ink; ctx.stroke();

  // 尾灯
  ctx.beginPath(); ctx.arc(left + 8, y - h * 0.52, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#C0564E'; ctx.fill();
  ctx.restore();
  return { left, right: x, top: y - h, bottom: y };
}

// ---------------- 车厢灯管熄灭（在 scenes.carriage 之上盖回顶棚色） ----------------
// k: 0 = 亮着，1 = 全灭；中间值拿来抖
export function lampOff(ctx, x, y, k, seed = 210) {
  const kk = clamp(k, 0, 1);
  if (kk <= 0) return;

  // 先把光池压掉
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 0, x, y, 340);
  g.addColorStop(0, `rgba(10,16,22,${0.55 * kk})`);
  g.addColorStop(0.55, `rgba(10,16,22,${0.32 * kk})`);
  g.addColorStop(1, 'rgba(10,16,22,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 340, y - 340, 680, 680);
  ctx.restore();

  // 灯座：盖回顶棚色，再按亮度重画
  ctx.fillStyle = '#A98C64';
  ctx.fillRect(x - 28, 84, 56, 40);
  line(ctx, x, 76, x, 88, { seed: seed + 3, lw: 5, color: P.ink, amp: 0.4 });
  const fill = kk > 0.85 ? '#8A8B84' : kk > 0.45 ? '#7C7E79' : P.lamp;
  block(ctx, x - 20, 88, 40, 30, 14, fill, { stroke: P.ink, lw: 5, seed });
  if (kk < 0.5) glow(ctx, x, 110, 300, 'rgba(246,201,126,0.5)', 0.5 * (1 - kk * 2));
}

// ---------------- 座位上留下的报纸 ----------------
export function seatNewspaper(ctx, x, y, t, o = {}) {
  const a = o.alpha ?? 1;
  // 几组不成整数倍的正弦叠在一起：翻动的节奏碎，不像匀速扇风
  const flap = 0.5
    + 0.26 * Math.sin(t * 0.70 + 1.2)
    + 0.16 * Math.sin(t * 1.83 + 0.4)
    + 0.09 * Math.sin(t * 3.71 + 2.2)
    + 0.05 * Math.sin(t * 7.13 + 0.9);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(x, y + (flap - 0.5) * 2.2);
  ctx.rotate((o.rot ?? -0.07) + flap * 0.018);
  block(ctx, -96, -52, 192, 104, 4, '#EDE4D0', { stroke: P.ink, lw: 4, seed: o.seed ?? 41 });
  line(ctx, 0, -50, 0, 50, { seed: 42, lw: 2, color: '#B9AC93' });
  for (let r = 0; r < 4; r++) {
    ctx.fillStyle = '#A99C84';
    ctx.fillRect(-76, -36 + r * 20, 60, 5);
    ctx.fillRect(14, -36 + r * 20, 64, 5);
  }
  ctx.fillStyle = '#8E8170';
  ctx.fillRect(-76, -48, 52, 8);
  ctx.restore();
}

// ---------------- 站台上滚过的一个纸杯 ----------------
export function paperCup(ctx, x, y, rot, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  poly(ctx, [[-20, -46], [20, -46], [13, 0], [-13, 0]], { fill: '#E8D5B0', stroke: P.ink, lw: 4, seed: 515 });
  block(ctx, -24, -52, 48, 10, 5, '#F2E3C6', { stroke: P.ink, lw: 3, seed: 516 });
  ctx.restore();
}

// ---------------- 隧道里开走的车尾：缩小、变暗、两盏红灯 ----------------
export function departingTrain(ctx, k, o = {}) {
  const e = easeOut(clamp(k, 0, 1));
  const a = 1 - smooth((clamp(k, 0, 1) - 0.62) / 0.38);
  if (a <= 0) return;
  const vpX = 1620, vpY = 502;
  const w = lerp(380, 20, Math.pow(e, 1.15));
  const h = w * 0.95;
  const cx = lerp(1580, vpX, e);
  const cy = lerp(540, vpY, e);

  ctx.save();
  // 只画在隧道口里
  ctx.beginPath(); ctx.rect(1372, 186, 548, 574); ctx.clip();
  ctx.globalAlpha = a;

  glow(ctx, cx, cy, w * 0.9, 'rgba(255,235,190,0.5)', 0.34 * a);
  // 车身（车尾正面）
  block(ctx, cx - w / 2, cy - h / 2, w, h, Math.max(2, w * 0.05), '#16262F', { stroke: P.ink, lw: 5, seed: 696 });
  // 车顶亮边
  block(ctx, cx - w * 0.42, cy - h / 2 + 4, w * 0.84, Math.max(2, h * 0.035), Math.max(1, w * 0.02), '#314A56', { seed: 695 });

  if (w > 70) {
    // 目的地牌：车尾上方的小灯箱
    block(ctx, cx - w * 0.15, cy - h * 0.43, w * 0.3, Math.max(3, h * 0.055), 2, '#E8D5B0', { stroke: P.ink, lw: 2, seed: 694 });
    // 车尾窗：暗玻璃 + 米色窗框
    const ww = w * 0.54, wh = h * 0.32;
    block(ctx, cx - ww / 2, cy - h * 0.29, ww, wh, Math.max(2, w * 0.03), '#1B3542', { stroke: P.ink, lw: 3, seed: 697 });
    ctx.save();
    ctx.globalAlpha = 0.35 * a;
    ctx.fillStyle = '#C9A469';
    ctx.fillRect(cx - ww / 2 + 4, cy - h * 0.29 + 4, ww - 8, wh * 0.34);
    ctx.restore();
    // 腰线
    block(ctx, cx - w * 0.41, cy + h * 0.06, w * 0.82, Math.max(3, h * 0.035), 2, '#D9A03F', { seed: 698 });
    // 门缝
    line(ctx, cx, cy + h * 0.02, cx, cy + h * 0.4, { seed: 699, lw: 2.6, color: '#0A1218' });
  }

  // 两盏小尾灯：放在车身下角，不做成圆眼睛
  const lw2 = Math.max(3, w * 0.06), lh2 = Math.max(2.4, h * 0.035);
  for (const dx of [-w * 0.34, w * 0.34]) {
    ctx.save();
    ctx.globalAlpha = 0.20 * a;
    ctx.fillStyle = '#E0566E';
    ctx.beginPath();
    ctx.ellipse(cx + dx, cy + h * 0.42, lw2 * 1.2, lh2 * 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    block(ctx, cx + dx - lw2 / 2, cy + h * 0.42 - lh2 / 2, lw2, lh2, 1, '#E0566E', { seed: 700 });
  }
  ctx.restore();
}

// ---------------- 制作名单：暗色斜切底框 + 细米色边 + 暖米黄字 ----------------
const CREDITS = [
  { text: '角色：Clawd on Desk 1.2.0 · rullerzhou-afk · AGPL-3.0-only', size: 34, at: 0.45, y: 406 },
  { text: '歌曲与歌词：法老 / 杨秋儒《我想 part2》', size: 40, at: 1.15, y: 492 },
  { text: '字体：Noto Sans SC · OFL', size: 32, at: 1.85, y: 570 },
  { text: '本片为个人练习作品，不上传版权素材', size: 28, at: 2.7, y: 682, note: true },
];

export function creditPanel(ctx, t, o = {}) {
  const alpha = smooth(t / 0.7);
  if (alpha <= 0) return;
  const cx = 960;
  const topY = 312, botY = 754;
  const slant = 52;

  let maxW = 0;
  for (const l of CREDITS) {
    ctx.font = `500 ${l.size}px NotoSansSC`;
    maxW = Math.max(maxW, ctx.measureText(l.text).width);
  }
  const half = Math.min((maxW + 150) / 2, 690);
  const rise = (1 - smooth(t / 0.9)) * 14;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(0, rise);

  // 斜切平行四边形
  ctx.beginPath();
  ctx.moveTo(cx - half + slant, topY);
  ctx.lineTo(cx + half, topY);
  ctx.lineTo(cx + half - slant, botY);
  ctx.lineTo(cx - half, botY);
  ctx.closePath();
  ctx.fillStyle = 'rgba(30,36,48,0.94)';
  ctx.fill();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = 'rgba(232,210,162,0.82)';
  ctx.lineJoin = 'round';
  ctx.stroke();

  // 内侧极细高光（纸感，不发光）
  ctx.beginPath();
  ctx.moveTo(cx - half + slant + 6, topY + 6);
  ctx.lineTo(cx + half - 6, topY + 6);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(247,239,221,0.16)';
  ctx.stroke();

  // 小标题和落款之间的分隔线
  ctx.beginPath();
  ctx.moveTo(cx - 250, 626);
  ctx.lineTo(cx + 250, 626);
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = 'rgba(232,210,162,0.30)';
  ctx.stroke();

  // 文字：一行行浮上来
  CREDITS.forEach(l => {
    const k = smooth((t - l.at) / 0.55);
    if (k <= 0) return;
    ctx.globalAlpha = alpha * k;
    ctx.font = `500 ${l.size}px NotoSansSC`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = l.note ? 'rgba(241,217,168,0.72)' : P.subText;
    ctx.fillText(l.text, cx, l.y + (1 - k) * 12, (half - 45) * 2);
  });

  ctx.restore();
}

// 供镜头取用的名单文案（报告里也引用同一份）
export const CREDIT_LINES = CREDITS.map(l => l.text);