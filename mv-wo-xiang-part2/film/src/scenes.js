// 场景：简单几何舞台，块面清楚，不堆细节。全部夜景。
import { P } from './palette.js';
import { block, line, poly, curve, rr, rng, glow, star, bg, seg, clamp, lerp, hash } from './ink.js';

// ---------------- 通用 ----------------

export function nightSky(ctx, o = {}) {
  const y0 = o.y ?? 0, h = o.h ?? 1080;
  ctx.fillStyle = o.top || P.sky;
  ctx.fillRect(0, y0, 1920, h * 0.5);
  ctx.fillStyle = o.mid || P.sky2;
  ctx.fillRect(0, y0 + h * 0.5, 1920, h * 0.28);
  ctx.fillStyle = o.low || P.sky3;
  ctx.fillRect(0, y0 + h * 0.78, 1920, h * 0.22);
}

export function stars(ctx, o = {}) {
  const n = o.n ?? 34, seed = o.seed ?? 3;
  const R = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = R() * 1920, y = R() * (o.h ?? 420);
    const s = R() < 0.85 ? 2 : 3;
    ctx.globalAlpha = 0.28 + R() * 0.4;
    ctx.fillStyle = R() < 0.25 ? P.lamp : P.cream;
    ctx.fillRect(x, y, s, s);
  }
  ctx.globalAlpha = 1;
}

export function moon(ctx, x, y, r, sky = P.sky) {
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#EBDDB4'; ctx.fill();
  // 咬掉一块：用天空色，避免 destination-out 把背景一起擦掉
  ctx.beginPath(); ctx.arc(x - r * 0.52, y - r * 0.2, r * 0.9, 0, Math.PI * 2);
  ctx.fillStyle = sky; ctx.fill();
  // 只描外缘
  ctx.beginPath(); ctx.arc(x, y, r, Math.PI * 0.36, Math.PI * 1.72);
  ctx.lineWidth = 4; ctx.strokeStyle = P.ink; ctx.lineCap = 'round'; ctx.stroke();
  ctx.restore();
}

export function cityLine(ctx, o = {}) {
  const baseY = o.y ?? 700, seed = o.seed ?? 11, scroll = o.scroll ?? 0;
  const color = o.color || '#16303C', win = o.win || '#E3B36A';
  const R = rng(seed);
  let x = -160 - ((scroll % 260) + 260) % 260;
  let i = 0;
  while (x < 2100) {
    const w = 110 + R() * 150;
    const h = (o.minH ?? 90) + R() * (o.maxH ?? 240);
    const top = baseY - h;
    ctx.fillStyle = color;
    ctx.fillRect(x, top, w, h + 6);
    // 窗灯：稀疏，不要满屏
    const cols = Math.floor(w / 52), rows = Math.floor(h / 58);
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      if (R() < 0.22) {
        ctx.globalAlpha = 0.45 + R() * 0.4;
        ctx.fillStyle = win;
        ctx.fillRect(x + 20 + c * 52, top + 24 + r * 58, 12, 15);
      }
    }
    ctx.globalAlpha = 1;
    x += w + 20 + R() * 30;
    i++;
  }
}

export function floorPlane(ctx, o = {}) {
  const y = o.y ?? 760, color = o.color || P.floor, dark = o.dark || P.floorDark;
  ctx.fillStyle = color;
  ctx.fillRect(0, y, 1920, 1080 - y);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, y, 1920, 1080 - y); ctx.clip();
  const vx = o.vx ?? 960, vy = o.vy ?? y - 40;
  for (let i = -3; i <= 3; i++) {
    const x = vx + i * 520;
    line(ctx, vx + (x - vx) * 0.25, y, x, 1080, { seed: 900 + i, lw: 2.4, color: dark, amp: 1.4, parts: 4 });
  }
  if (o.bands !== false) {
    line(ctx, 0, y + 150, 1920, y + 150, { seed: 777, lw: 2, color: dark, amp: 1.2 });
    line(ctx, 0, y + 300, 1920, y + 300, { seed: 778, lw: 2, color: dark, amp: 1.2 });
  }
  ctx.restore();
  line(ctx, 0, y, 1920, y, { seed: 776, lw: 4, color: P.ink, amp: 0.8 });
}

// ---------------- 地铁车厢 ----------------
export function carriage(ctx, t, o = {}) {
  const scroll = o.scroll ?? 0;

  // 顶棚
  block(ctx, 0, 0, 1920, 126, 0, '#A98C64');
  line(ctx, 0, 126, 1920, 126, { seed: 12, lw: 5, color: P.ink });
  for (let i = 0; i < 4; i++) {
    line(ctx, 160 + i * 520, 126, 220 + i * 520, 0, { seed: 40 + i, lw: 3, color: '#93794F', amp: 2 });
  }

  // 墙
  ctx.fillStyle = '#DFC8A0';
  ctx.fillRect(0, 126, 1920, 640);
  // 墙板接缝：只在门两侧，不要每扇窗都切
  for (const x of [40, 1200, 1860]) line(ctx, x, 126, x, 766, { seed: x, lw: 3, color: '#C6AE86', amp: 2 });
  // 踢脚线
  block(ctx, 0, 726, 1920, 44, 0, '#C6AE86', { stroke: P.ink, lw: 4, seed: 5 });

  const winY = 186, winH = 430;
  const wins = [[70, 520], [640, 520], [1480, 370]];

  // 线路图条
  block(ctx, 70, 140, 1090, 34, 10, '#2F4A54', { stroke: P.ink, lw: 3, seed: 6 });
  for (let i = 0; i < 9; i++) {
    ctx.beginPath(); ctx.arc(120 + i * 120, 157, 7, 0, Math.PI * 2);
    ctx.fillStyle = i === 4 ? P.mustard : '#9FB4B8'; ctx.fill();
  }

  wins.forEach(([x, w], i) => {
    block(ctx, x - 7, winY - 7, w + 14, winH + 14, 8, '#C9B08A', { stroke: P.ink, lw: 6, seed: 30 + i });
    ctx.save();
    ctx.beginPath(); ctx.rect(x, winY, w, winH); ctx.clip();
    ctx.fillStyle = '#2C4A5A'; ctx.fillRect(x, winY, w, winH);
    ctx.fillStyle = '#24404F'; ctx.fillRect(x, winY + winH * 0.46, w, winH * 0.54);
    const R = rng(300 + i);
    let bx = x - 60 - ((scroll * (0.4 + i * 0.14)) % 160);
    while (bx < x + w + 60) {
      const bw = 48 + R() * 80, bh = 80 + R() * 170;
      ctx.fillStyle = '#183241';
      ctx.fillRect(bx, winY + winH - bh, bw, bh);
      for (let k = 0; k < 4; k++) if (R() < 0.4) {
        ctx.fillStyle = 'rgba(227,179,106,0.85)';
        ctx.fillRect(bx + 10 + (k % 2) * 22, winY + winH - bh + 18 + Math.floor(k / 2) * 30, 8, 11);
      }
      bx += bw + 16;
    }
    const g = ctx.createLinearGradient(x, winY, x + w, winY + winH);
    g.addColorStop(0, 'rgba(190,220,230,0.15)');
    g.addColorStop(0.5, 'rgba(190,220,230,0.02)');
    g.addColorStop(1, 'rgba(190,220,230,0.12)');
    ctx.fillStyle = g; ctx.fillRect(x, winY, w, winH);
    ctx.restore();
    block(ctx, x, winY, w, winH, 5, null, { stroke: P.ink, lw: 5, seed: 60 + i });
    line(ctx, x + w / 2, winY, x + w / 2, winY + winH, { seed: 80 + i, lw: 4, color: P.ink, amp: 0.5 });
  });

  // 门
  block(ctx, 1210, 186, 210, 540, 6, '#DCC49C', { stroke: P.ink, lw: 6, seed: 91 });
  line(ctx, 1315, 186, 1315, 726, { seed: 92, lw: 5, color: P.ink });
  block(ctx, 1272, 420, 86, 130, 6, '#3E7C92', { stroke: P.ink, lw: 4, seed: 93 });
  block(ctx, 1296, 452, 38, 66, 4, '#6FA8B8', { seed: 94 });

  // 长椅
  const seatY = 700;
  block(ctx, 40, seatY - 122, 1130, 132, 18, '#5C8C99', { stroke: P.ink, lw: 6, seed: 101 });
  block(ctx, 28, seatY - 12, 1154, 58, 16, '#7FA5AC', { stroke: P.ink, lw: 6, seed: 102 });
  block(ctx, 28, seatY + 46, 1154, 40, 10, '#3D6B78', { stroke: P.ink, lw: 5, seed: 103 });
  for (const x of [330, 660, 990]) line(ctx, x, seatY + 2, x, seatY + 44, { seed: x, lw: 3, color: P.tealDeep, amp: 1 });

  // 地面
  floorPlane(ctx, { y: 770, color: '#7E5A57', dark: '#6A4A47', vx: 900, vy: 720, bands: true });

  // 车窗落在站台地面的冷光
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.fillStyle = '#9FC3CE';
  for (const [x, w] of wins) ctx.fillRect(x + 20, 770, w - 40, 310);
  ctx.restore();

  // 吊灯
  for (let i = 0; i < 3; i++) {
    const x = 260 + i * 560;
    line(ctx, x, 0, x, 88, { seed: 200 + i, lw: 5, color: P.ink, amp: 0.6 });
    block(ctx, x - 20, 88, 40, 30, 14, P.lamp, { stroke: P.ink, lw: 5, seed: 210 + i });
    glow(ctx, x, 110, 300, 'rgba(246,201,126,0.5)', 0.5);
  }

  // 竖杆
  line(ctx, 1170, 126, 1170, 770, { seed: 250, lw: 8, color: '#8C7A5E', amp: 0.5 });
  line(ctx, 1194, 126, 1194, 770, { seed: 251, lw: 8, color: '#8C7A5E', amp: 0.5 });

  // 站名牌
  block(ctx, 780, 140, 220, 40, 8, '#2F4A54', { stroke: P.ink, lw: 4, seed: 260 });
  ctx.fillStyle = P.cream;
  ctx.font = '500 24px NotoSansSC';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('下一站', 890, 161);

  return {
    seatY,
    floorY: 770,
    windows: wins.map(([x, w]) => ({ x, y: winY, w, h: winH })),
  };
}

// ---------------- 夜街 + 便利店 ----------------
export function streetStore(ctx, t, o = {}) {
  nightSky(ctx, { y: 0, h: 720 });
  stars(ctx, { n: 20, h: 280 });
  moon(ctx, 250, 150, 44, P.sky);

  cityLine(ctx, { y: 600, seed: 21, minH: 120, maxH: 300, color: '#16303C' });
  cityLine(ctx, { y: 690, seed: 33, minH: 70, maxH: 190, color: '#1B3543' });

  // 人行道
  block(ctx, 0, 700, 1920, 380, 0, '#8A6A64');
  block(ctx, 0, 700, 1920, 26, 0, '#A98A80', { stroke: P.ink, lw: 4, seed: 41 });
  for (let i = 0; i < 6; i++) line(ctx, i * 340 + 80, 726, i * 340 + 190, 1080, { seed: 50 + i, lw: 1.8, color: '#78564F', amp: 1 });

  // 便利店：底边坐落在人行道线上
  const sx = 900, sy = 196, sw = 860, sh = 504;
  ctx.save();
  ctx.beginPath(); ctx.rect(sx, sy, sw, sh); ctx.clip();
  ctx.fillStyle = '#E8C08A'; ctx.fillRect(sx, sy, sw, sh);
  ctx.fillStyle = '#D3A469'; ctx.fillRect(sx, sy + sh * 0.66, sw, sh * 0.34);
  for (let r = 0; r < 3; r++) {
    const yy = sy + 62 + r * 116;
    block(ctx, sx + 46, yy, sw - 300, 80, 4, '#B98A4E', { stroke: P.ink, lw: 4, seed: 80 + r });
    for (let c = 0; c < 5; c++) {
      const R = rng(90 + r * 10 + c);
      ctx.fillStyle = ['#D9A03F', '#A8C48C', '#E8A0A8', '#4E8FA3', '#B9A6D9', '#F2E3C6'][Math.floor(R() * 6)];
      ctx.fillRect(sx + 66 + c * 88, yy + 16, 38, 44);
    }
  }
  block(ctx, sx + sw - 250, sy + 40, 210, sh - 120, 10, '#CFE0E2', { stroke: P.ink, lw: 5, seed: 125 });
  for (let k = 0; k < 4; k++) line(ctx, sx + sw - 240, sy + 90 + k * 74, sx + sw - 55, sy + 90 + k * 74, { seed: 126 + k, lw: 3, color: '#8FAEB4' });
  block(ctx, sx + sw - 236, sy + sh - 118, 196, 118, 6, '#8C6A46', { stroke: P.ink, lw: 5, seed: 120 });
  ctx.restore();
  block(ctx, sx, sy, sw, sh, 6, null, { stroke: P.ink, lw: 7, seed: 130 });
  line(ctx, sx + sw * 0.52, sy, sx + sw * 0.52, sy + sh, { seed: 131, lw: 5, color: P.ink });

  ctx.save();
  ctx.beginPath(); ctx.rect(sx, sy, sw, sh); ctx.clip();
  ctx.globalAlpha = 0.18;
  poly(ctx, [[sx + 60, sy + sh], [sx + 320, sy], [sx + 412, sy], [sx + 152, sy + sh]], { fill: '#DDEEF2', stroke: false });
  poly(ctx, [[sx + 520, sy + sh], [sx + 690, sy], [sx + 742, sy], [sx + 572, sy + sh]], { fill: '#DDEEF2', stroke: false });
  ctx.restore();

  block(ctx, sx + 220, sy - 116, 420, 82, 10, '#E8D5B0', { stroke: P.ink, lw: 7, seed: 140 });
  ctx.fillStyle = '#2F4A54';
  ctx.font = '500 40px NotoSansSC';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('24H', sx + 430, sy - 74);

  glow(ctx, sx + sw * 0.5, 700, 620, 'rgba(246,201,126,0.42)', 0.55);

  line(ctx, 300, 330, 300, 726, { seed: 150, lw: 9, color: P.ink });
  line(ctx, 300, 336, 356, 322, { seed: 152, lw: 7, color: P.ink });
  block(ctx, 330, 300, 88, 26, 12, P.lamp, { stroke: P.ink, lw: 6, seed: 151 });
  glow(ctx, 374, 320, 300, 'rgba(246,201,126,0.55)', 0.5);

  return { glass: { x: sx, y: sy, w: sw, h: sh }, floorY: 726 };
}

// ---------------- 舞台 ----------------
export function stage(ctx, t, o = {}) {
  const flash = o.flash ?? 0;
  bg(ctx, '#101A21');

  // 后墙：蓝绿暗部，不做脏灰
  ctx.fillStyle = '#22333D'; ctx.fillRect(0, 0, 1920, 780);
  for (let i = 0; i < 8; i++) line(ctx, i * 280, 0, i * 280, 780, { seed: 305 + i, lw: 2, color: '#1C2B34', amp: 2 });

  // 光锥（加法）：外圈柔光 + 内圈硬边
  const cone = (x0, x1, y0b, y1b, col, alpha) => {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    ctx.moveTo(x0, 0); ctx.lineTo(x1, 0); ctx.lineTo(y1b, 780); ctx.lineTo(y0b, 780);
    ctx.closePath();
    const g = ctx.createLinearGradient(960, 0, 960, 780);
    g.addColorStop(0, col.replace('ALPHA', alpha));
    g.addColorStop(1, col.replace('ALPHA', alpha * 0.15));
    ctx.fillStyle = g; ctx.fill();
    ctx.restore();
  };
  cone(770, 1150, 300, 1560, 'rgba(180,136,72,ALPHA)', 0.55);
  cone(840, 1080, 420, 1440, 'rgba(226,182,110,ALPHA)', 0.40);

  // 地面
  block(ctx, 0, 780, 1920, 300, 0, '#332E2C');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const pg = ctx.createRadialGradient(960, 800, 10, 960, 800, 520);
  pg.addColorStop(0, 'rgba(190,146,86,0.60)');
  pg.addColorStop(1, 'rgba(190,146,86,0)');
  ctx.fillStyle = pg;
  ctx.beginPath(); ctx.ellipse(960, 800, 520, 90, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  line(ctx, 0, 780, 1920, 780, { seed: 300, lw: 5, color: P.ink });

  // 侧幕
  for (const side of [0, 1]) {
    const x0 = side ? 1920 : 0, dir = side ? -1 : 1;
    poly(ctx, [[x0, 0], [x0 + dir * 300, 0], [x0 + dir * 210, 900], [x0, 900]],
      { fill: '#7E4638', stroke: P.ink, lw: 5, seed: 310 + side });
    for (let i = 1; i < 6; i++) {
      const k = i / 6;
      curve(ctx, [
        [x0 + dir * (300 * k), 0],
        [x0 + dir * (268 * k + 14), 300],
        [x0 + dir * (236 * k + 8), 620],
        [x0 + dir * (210 * k), 900],
      ], { stroke: i % 2 ? '#67382D' : '#8E5142', lw: 4 });
    }
  }

  // 檐幕
  block(ctx, 0, 0, 1920, 90, 0, '#6E3E33');
  for (let i = 0; i < 16; i++) curve(ctx, [[i * 120 - 40, 90], [i * 120, 58], [i * 120 + 40, 90]], { stroke: '#5E3228', lw: 3 });
  line(ctx, 0, 90, 1920, 90, { seed: 331, lw: 4, color: P.ink });

  // 顶灯
  for (let i = 0; i < 3; i++) {
    const x = 810 + i * 150;
    block(ctx, x - 32, 90, 64, 26, 8, '#3A3A3E', { stroke: P.ink, lw: 4, seed: 340 + i });
    glow(ctx, x, 116, 170, 'rgba(255,226,160,0.6)', 0.55);
  }

  // 音箱
  for (const x of [90, 1580]) {
    block(ctx, x, 700, 250, 320, 8, '#22242A', { stroke: P.ink, lw: 5, seed: 350 + x });
    for (const [dx, dy, r] of [[80, 90, 38], [80, 200, 26]]) {
      ctx.beginPath(); ctx.arc(x + dx, 700 + dy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#31333A'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = P.ink; ctx.stroke();
    }
  }

  // 台下观众：只露头顶，给舞台一个尺度
  for (let i = 0; i < 9; i++) {
    const x = 60 + i * 220 + (i % 2) * 40;
    ctx.beginPath();
    ctx.arc(x, 1080, 52, Math.PI, 0);
    ctx.fillStyle = '#0C1216'; ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x, 1080, 70, 46, 0, Math.PI, 0);
    ctx.fill();
  }

  if (flash > 0) {
    const spots = [[210, 700], [92, 560], [420, 750], [1710, 660], [1830, 530], [1500, 740], [620, 820], [1300, 810]];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    spots.forEach(([x, y], i) => {
      const k = clamp(flash * (0.7 + (i % 3) * 0.15), 0, 1);
      ctx.globalAlpha = k;
      star(ctx, x, y, 16 + (i % 2) * 6, 2.4, 4, '#FFF6DE');
      ctx.beginPath(); ctx.arc(x, y, 5 + (i % 3) * 2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF'; ctx.fill();
    });
    ctx.restore();
    ctx.fillStyle = `rgba(255,246,222,${0.10 * flash})`;
    ctx.fillRect(0, 0, 1920, 1080);
  }
  return { floorY: 780 };
}

// ---------------- 卧室 ----------------
export function bedroom(ctx, t, o = {}) {
  ctx.fillStyle = '#CBB18A'; ctx.fillRect(0, 0, 1920, 700);
  for (let i = 0; i < 13; i++) line(ctx, i * 150 + 60, 0, i * 150 + 60, 700, { seed: 400 + i, lw: 1.6, color: '#C0A67D', amp: 2 });
  block(ctx, 0, 700, 1920, 40, 0, '#B39A78', { stroke: P.ink, lw: 4, seed: 401 });
  floorPlane(ctx, { y: 740, color: '#6E4E4B', dark: '#5A3E3B', vx: 960, vy: 700, bands: false });

  // 窗（左）
  const wx = 110, wy = 140, ww = 360, wh = 340;
  block(ctx, wx - 10, wy - 10, ww + 20, wh + 20, 8, '#BCA279', { stroke: P.ink, lw: 7, seed: 410 });
  ctx.save();
  ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
  ctx.fillStyle = '#22414F'; ctx.fillRect(wx, wy, ww, wh);
  const R = rng(411);
  for (let i = 0; i < 5; i++) {
    const bx = wx + R() * 300, bw = 54 + R() * 70, bh = 90 + R() * 140;
    ctx.fillStyle = '#17313D'; ctx.fillRect(bx, wy + wh - bh, bw, bh);
    for (let k = 0; k < 4; k++) if (R() < 0.4) { ctx.fillStyle = 'rgba(227,179,106,0.9)'; ctx.fillRect(bx + 12 + (k % 2) * 22, wy + wh - bh + 18 + Math.floor(k / 2) * 28, 9, 12); }
  }
  ctx.fillStyle = 'rgba(210,228,230,0.08)'; ctx.fillRect(wx, wy, ww, wh);
  ctx.restore();
  line(ctx, wx + ww / 2, wy, wx + ww / 2, wy + wh, { seed: 412, lw: 5, color: P.ink });
  line(ctx, wx, wy + wh / 2, wx + ww, wy + wh / 2, { seed: 413, lw: 5, color: P.ink });
  block(ctx, wx - 20, wy + wh + 8, ww + 40, 16, 4, '#B39A78', { stroke: P.ink, lw: 4, seed: 414 });

  // 海报（床沿上方，只做剪影，不写文字）
  const px = 580, py = 140, pw = 250, ph = 310;
  block(ctx, px, py, pw, ph, 3, '#1E2C36', { stroke: P.ink, lw: 7, seed: 440 });
  ctx.save();
  ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip();
  ctx.fillStyle = '#2E4450'; ctx.fillRect(px, py, pw, ph);
  ctx.beginPath(); ctx.ellipse(px + pw / 2, py + 104, 44, 52, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#8E6A68'; ctx.fill();
  poly(ctx, [[px + 44, py + 168], [px + pw - 44, py + 168], [px + pw, py + ph], [px, py + ph]], { fill: '#8E6A68', stroke: false });
  ctx.fillStyle = 'rgba(246,201,126,0.10)'; ctx.fillRect(px, py, pw, 30);
  ctx.restore();
  block(ctx, px - 10, py - 12, 40, 16, 3, '#E8D5B0', { stroke: P.ink, lw: 3, seed: 441 });
  block(ctx, px + pw - 30, py - 12, 40, 16, 3, '#E8D5B0', { stroke: P.ink, lw: 3, seed: 442 });

  // 床头柜 + 台灯
  const nx = 880, ny = 720, nw = 210, nh = 180;
  block(ctx, nx, ny, nw, nh, 8, '#7E5B45', { stroke: P.ink, lw: 6, seed: 430 });
  line(ctx, nx + 16, ny + 92, nx + nw - 16, ny + 92, { seed: 433, lw: 3, color: '#5E4232' });
  ctx.beginPath(); ctx.arc(nx + nw / 2, ny + 130, 7, 0, Math.PI * 2); ctx.fillStyle = '#5E4232'; ctx.fill();
  line(ctx, nx + 70, ny - 90, nx + 70, ny, { seed: 431, lw: 5, color: P.ink });
  poly(ctx, [[nx + 30, ny - 90], [nx + 110, ny - 90], [nx + 92, ny - 140], [nx + 48, ny - 140]], { fill: '#D9A03F', stroke: P.ink, lw: 4, seed: 432 });
  glow(ctx, nx + 70, ny - 90, 300, 'rgba(246,201,126,0.55)', 0.55);

  // 唱机：窗下的木箱上
  const rx = 300, ry = 800;
  block(ctx, rx - 110, ry, 220, 120, 6, '#6E4E3A', { stroke: P.ink, lw: 6, seed: 450 });
  line(ctx, rx - 92, ry + 56, rx + 92, ry + 56, { seed: 453, lw: 3, color: '#4E3428' });
  block(ctx, rx - 96, ry - 40, 192, 44, 5, '#3A3A3E', { stroke: P.ink, lw: 5, seed: 451 });
  ctx.beginPath(); ctx.arc(rx - 26, ry - 50, 44, 0, Math.PI * 2);
  ctx.fillStyle = '#141820'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = P.ink; ctx.stroke();
  ctx.beginPath(); ctx.arc(rx - 26, ry - 50, 12, 0, Math.PI * 2); ctx.fillStyle = P.mustard; ctx.fill();
  line(ctx, rx + 22, ry - 74, rx + 58, ry - 92, { seed: 452, lw: 5, color: P.ink });

  // 床（右）
  const bx = 960, bw = 900, top = 720;
  block(ctx, bx + 840, 590, 60, 280, 6, '#7E5B45', { stroke: P.ink, lw: 6, seed: 424 });   // 床头板
  block(ctx, bx, top, bw, 76, 8, '#E0CDA8', { stroke: P.ink, lw: 6, seed: 421 });          // 床垫
  block(ctx, bx, top + 76, bw, 60, 6, '#8E6A68', { stroke: P.ink, lw: 6, seed: 420 });     // 床架
  for (const x of [bx + 40, bx + bw - 70]) block(ctx, x, top + 136, 26, 62, 4, '#5E4232', { stroke: P.ink, lw: 4, seed: 426 + x });
  block(ctx, bx + 640, top - 130, 230, 86, 24, '#E8D5B0', { stroke: P.ink, lw: 6, seed: 423 }); // 枕头

  return {
    bedY: top, floorY: 780, bed: { x: bx, w: bw, top },
    record: { x: rx - 26, y: ry - 50 }, poster: { x: px, y: py, w: pw, h: ph },
  };
}

// 被子：盖在角色下半身，镜头里在角色之后调用
export function bedBlanket(ctx, b, o = {}) {
  const y = o.y ?? b.top - 96, h = o.h ?? 200;
  block(ctx, b.x, y, b.w, h, 16, '#B98A83', { stroke: P.ink, lw: 6, seed: 480 });
  block(ctx, b.x + 8, y, b.w - 16, 44, 14, '#D9C6A4', { stroke: P.ink, lw: 4, seed: 481 });
  line(ctx, b.x + 22, y + 108, b.x + b.w - 22, y + 108, { seed: 482, lw: 3, color: '#9A6F6A' });
}

// ---------------- 手机屏幕 ----------------
export function phoneScreen(ctx, o = {}) {
  bg(ctx, '#101720');
  const x = 560, y = 120, w = 800, h = 840;
  block(ctx, x - 22, y - 22, w + 44, h + 44, 54, '#2C2F36', { stroke: P.ink, lw: 8, seed: 500 });
  block(ctx, x, y, w, h, 40, '#E8DCC4', { stroke: P.ink, lw: 5, seed: 501 });
  block(ctx, x + 330, y + 18, 140, 22, 12, '#2C2F36', { seed: 502 });
  return { x, y, w, h };
}