// 第二段主歌的场景。块面清楚，夜景，暖灯。
import { P } from './palette.js';
import { block, line, poly, curve, rr, rng, glow, star, bg, clamp, lerp, smooth } from './ink.js';
import { cityLine, nightSky, moon, stars, floorPlane } from './scenes.js';

// v2-01 窗台上的愿望纸条
export function wishWindow(ctx, t) {
  ctx.fillStyle = '#6E5A48'; ctx.fillRect(0, 0, 1920, 1080);
  // 窗
  const wx = 520, wy = 90, ww = 900, wh = 620;
  block(ctx, wx - 16, wy - 16, ww + 32, wh + 32, 10, '#8E765E', { stroke: P.ink, lw: 8, seed: 1600 });
  ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
  nightSky(ctx, { y: wy, h: wh, top: '#16222F', mid: '#1F3442', low: '#2A4655' });
  stars(ctx, { n: 16, h: 260, seed: 21 });
  cityLine(ctx, { y: wy + 520, seed: 71, minH: 90, maxH: 220, color: '#17313D' });
  ctx.restore();
  line(ctx, wx + ww / 2, wy, wx + ww / 2, wy + wh, { seed: 1601, lw: 6, color: P.ink });
  line(ctx, wx, wy + wh * 0.55, wx + ww, wy + wh * 0.55, { seed: 1602, lw: 6, color: P.ink });
  // 窗台
  block(ctx, wx - 40, wy + wh + 6, ww + 80, 60, 8, '#A98C6A', { stroke: P.ink, lw: 6, seed: 1603 });
  // 台灯
  line(ctx, 1500, 520, 1500, 760, { seed: 1604, lw: 6, color: P.ink });
  poly(ctx, [[1430, 520], [1570, 520], [1540, 450], [1460, 450]], { fill: '#D9A03F', stroke: P.ink, lw: 5, seed: 1605 });
  glow(ctx, 1500, 520, 420, 'rgba(246,201,126,0.5)', 0.55);
  return { sillY: wy + wh + 6, wx, wy, ww, wh };
}

// v2-02 墙上的钟
export function clockWall(ctx, t) {
  ctx.fillStyle = '#5E4A3C'; ctx.fillRect(0, 0, 1920, 1080);
  for (let i = 0; i < 10; i++) line(ctx, i * 210, 0, i * 210, 1080, { seed: 1610 + i, lw: 2, color: '#544234', amp: 2 });
  // 钟
  const cx = 960, cy = 470, r = 220;
  ctx.beginPath(); ctx.arc(cx, cy, r + 18, 0, Math.PI * 2); ctx.fillStyle = '#8E765E'; ctx.fill();
  ctx.lineWidth = 7; ctx.strokeStyle = P.ink; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = '#E8DCC4'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = P.ink; ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    line(ctx, cx + Math.cos(a) * r * 0.82, cy + Math.sin(a) * r * 0.82, cx + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.9,
      { seed: 1620 + i, lw: 5, color: P.ink });
  }
  // 时针 2:40
  line(ctx, cx, cy, cx + Math.cos(-Math.PI / 2 + 2.67 / 12 * Math.PI * 2) * r * 0.45, cy + Math.sin(-Math.PI / 2 + 2.67 / 12 * Math.PI * 2) * r * 0.45,
    { seed: 1630, lw: 9, color: P.ink });
  line(ctx, cx, cy, cx + Math.cos(-Math.PI / 2 + 40 / 60 * Math.PI * 2) * r * 0.72, cy + Math.sin(-Math.PI / 2 + 40 / 60 * Math.PI * 2) * r * 0.72,
    { seed: 1631, lw: 6, color: P.ink });
  // 墙面上的影子
  ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = P.ink;
  ctx.beginPath(); ctx.ellipse(cx + 260, cy + 300, 190, 60, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  floorPlane(ctx, { y: 900, color: '#4A3A30', dark: '#3E3028', vx: 960, vy: 860, bands: false });
  return { cx, cy, r };
}

// v2-03 城市上空：乌云遮住暖灯
export function skyCloud(ctx, t) {
  nightSky(ctx, { y: 0, h: 1080, top: '#0E1A24', mid: '#162A36', low: '#1E3A48' });
  stars(ctx, { n: 30, h: 500, seed: 33 });
  // 城市天际线
  cityLine(ctx, { y: 900, seed: 81, minH: 160, maxH: 380, color: '#122630' });
  // 暖色路灯（像太阳）
  glow(ctx, 700, 360, 300, 'rgba(246,201,126,0.65)', 0.7);
  ctx.beginPath(); ctx.arc(700, 360, 46, 0, Math.PI * 2); ctx.fillStyle = P.lamp; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = P.ink; ctx.stroke();
  return { lamp: { x: 700, y: 360 } };
}

// v2-04 橱窗里的宝钻鞋
export function shopShoes(ctx, t) {
  bg(ctx, '#241E1C');
  // 背景街
  ctx.fillStyle = '#2E3A40'; ctx.fillRect(0, 0, 1920, 760);
  // 橱窗
  const sx = 380, sy = 120, sw = 1160, sh = 700;
  block(ctx, sx - 20, sy - 20, sw + 40, sh + 40, 8, '#3A2E28', { stroke: P.ink, lw: 8, seed: 1640 });
  ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, sw, sh); ctx.clip();
  ctx.fillStyle = '#2A1F1C'; ctx.fillRect(sx, sy, sw, sh);
  // 聚光
  const g = ctx.createRadialGradient(sx + sw / 2, sy + 300, 20, sx + sw / 2, sy + 300, 460);
  g.addColorStop(0, 'rgba(246,201,126,0.55)');
  g.addColorStop(1, 'rgba(246,201,126,0)');
  ctx.fillStyle = g; ctx.fillRect(sx, sy, sw, sh);
  // 展台
  block(ctx, sx + 260, sy + 470, 640, 90, 8, '#5E4232', { stroke: P.ink, lw: 5, seed: 1641 });
  // 鞋（两只，圆头，镶亮片）
  for (const [dx, sc] of [[-1, 1], [1, 1.05]]) {
    const bx = sx + sw / 2 + dx * 190;
    const by = sy + 470;
    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(sc, sc);
    poly(ctx, [[-110, 0], [110, 0], [130, -40], [40, -120], [-70, -110], [-120, -50]],
      { fill: '#E8D5B0', stroke: P.ink, lw: 6, seed: 1650 + dx });
    // 亮片
    const R = rng(1660 + dx);
    for (let i = 0; i < 26; i++) {
      const px = -90 + R() * 190, py = -110 + R() * 100;
      ctx.fillStyle = i % 3 ? '#E8A0A8' : '#F1D9A8';
      ctx.globalAlpha = 0.7 + R() * 0.3;
      ctx.beginPath(); ctx.arc(px, py, 5 + R() * 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // 鞋跟
    block(ctx, 60, -40, 60, 40, 4, '#B98A83', { stroke: P.ink, lw: 4, seed: 1670 + dx });
    ctx.restore();
  }
  ctx.restore();
  block(ctx, sx, sy, sw, sh, 6, null, { stroke: P.ink, lw: 8, seed: 1680 });
  // 玻璃反光
  ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, sw, sh); ctx.clip();
  ctx.globalAlpha = 0.14;
  poly(ctx, [[sx + 80, sy + sh], [sx + 420, sy], [sx + 520, sy], [sx + 180, sy + sh]], { fill: '#DDEEF2', stroke: false });
  ctx.restore();
  // 路面
  block(ctx, 0, 820, 1920, 260, 0, '#5E4A46');
  return { sx, sy, sw, sh, floorY: 830 };
}

// v2-05 台阶
export function stairs(ctx, t) {
  bg(ctx, '#1A2430');
  // 远处楼
  cityLine(ctx, { y: 620, seed: 91, minH: 120, maxH: 320, color: '#162B36' });
  // 台阶：从右下往左上
  const steps = 8;
  for (let i = 0; i < steps; i++) {
    const x = 200 + i * 190;
    const y = 880 - i * 64;
    block(ctx, x, y, 240, 64, 4, i % 2 ? '#8E8280' : '#7A6E6C', { stroke: P.ink, lw: 5, seed: 1700 + i });
    // 路灯光斑
    ctx.save();
    ctx.globalAlpha = i % 2 ? 0.16 : 0.04;
    ctx.fillStyle = P.lamp;
    ctx.fillRect(x, y, 240, 64);
    ctx.restore();
  }
  // 扶手
  line(ctx, 200, 830, 1700, 300, { seed: 1710, lw: 8, color: P.ink });
  return { stepY: (i) => 880 - i * 64 };
}

// v2-06 旧屋里的老人
export function oldRoom(ctx, t) {
  ctx.fillStyle = '#6E5A48'; ctx.fillRect(0, 0, 1920, 1080);
  for (let i = 0; i < 9; i++) line(ctx, i * 230, 0, i * 230, 1080, { seed: 1720 + i, lw: 2, color: '#624F3E', amp: 2 });
  floorPlane(ctx, { y: 820, color: '#4A3A30', dark: '#3E3028', vx: 960, vy: 780, bands: false });
  // 全家福
  block(ctx, 1180, 220, 300, 220, 4, '#E8D5B0', { stroke: P.ink, lw: 6, seed: 1730 });
  for (let i = 0; i < 3; i++) {
    const x = 1240 + i * 90;
    ctx.beginPath(); ctx.arc(x, 330, 34, 0, Math.PI * 2); ctx.fillStyle = ['#DE886D', '#93AE7C', '#E8A0A8'][i]; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = P.ink; ctx.stroke();
  }
  // 椅子
  block(ctx, 700, 620, 340, 30, 8, '#7E5B45', { stroke: P.ink, lw: 5, seed: 1740 });
  block(ctx, 710, 650, 320, 70, 6, '#8E6A52', { stroke: P.ink, lw: 5, seed: 1741 });
  for (const x of [720, 1000]) line(ctx, x, 720, x, 860, { seed: 1750 + x, lw: 6, color: P.ink });
  // 台灯
  line(ctx, 340, 500, 340, 700, { seed: 1760, lw: 6, color: P.ink });
  poly(ctx, [[270, 500], [410, 500], [384, 430], [296, 430]], { fill: '#D9A03F', stroke: P.ink, lw: 5, seed: 1761 });
  glow(ctx, 340, 480, 460, 'rgba(246,201,126,0.5)', 0.6);
  // 小桌
  block(ctx, 160, 700, 360, 160, 8, '#6E4E3A', { stroke: P.ink, lw: 6, seed: 1770 });
  return { chairY: 620 };
}

// v2-07 满街忙人仰头
export function streetCrowd(ctx, t) {
  nightSky(ctx, { y: 0, h: 700 });
  cityLine(ctx, { y: 640, seed: 95, minH: 110, maxH: 280, color: '#16303C' });
  block(ctx, 0, 740, 1920, 340, 0, '#7E5E58');
  block(ctx, 0, 740, 1920, 22, 0, '#9A7A72', { stroke: P.ink, lw: 4, seed: 1780 });
  glow(ctx, 700, 420, 380, 'rgba(246,201,126,0.4)', 0.5);
  // 巨大广告牌（馅饼传单的来源）
  block(ctx, 1180, 220, 520, 220, 8, '#2F4A54', { stroke: P.ink, lw: 7, seed: 1790 });
  return { floorY: 760 };
}

// v2-08 长椅两端
export function bench(ctx, t) {
  bg(ctx, '#16222F');
  // 背景虚化的夜街
  ctx.save(); ctx.globalAlpha = 0.6;
  cityLine(ctx, { y: 700, seed: 97, minH: 80, maxH: 240, color: '#1A3442' });
  ctx.restore();
  block(ctx, 0, 780, 1920, 300, 0, '#3A3A42');
  // 长椅
  block(ctx, 420, 620, 1080, 34, 8, '#6E5A48', { stroke: P.ink, lw: 6, seed: 1800 });
  block(ctx, 420, 654, 1080, 60, 6, '#5E4A3C', { stroke: P.ink, lw: 6, seed: 1801 });
  for (const x of [460, 1460]) line(ctx, x, 714, x, 840, { seed: 1810 + x, lw: 7, color: P.ink });
  // 路灯
  line(ctx, 1680, 300, 1680, 840, { seed: 1820, lw: 8, color: P.ink });
  block(ctx, 1620, 276, 120, 30, 12, P.lamp, { stroke: P.ink, lw: 5, seed: 1821 });
  glow(ctx, 1680, 300, 380, 'rgba(246,201,126,0.45)', 0.5);
  return { seatY: 654 };
}

// v2-10 写词的书桌
export function writingDesk(ctx, t) {
  bg(ctx, '#241E1A');
  ctx.fillStyle = '#4A3A30'; ctx.fillRect(0, 0, 1920, 620);
  block(ctx, 0, 620, 1920, 460, 0, '#6E4E3A');
  line(ctx, 0, 620, 1920, 620, { seed: 1830, lw: 6, color: P.ink });
  // 台灯
  line(ctx, 1500, 260, 1500, 620, { seed: 1831, lw: 7, color: P.ink });
  poly(ctx, [[1410, 260], [1590, 260], [1552, 190], [1448, 190]], { fill: '#D9A03F', stroke: P.ink, lw: 5, seed: 1832 });
  glow(ctx, 1500, 300, 560, 'rgba(246,201,126,0.55)', 0.6);
  // 纸
  for (let i = 0; i < 5; i++) {
    block(ctx, 420 + i * 16, 600 - i * 22, 420, 120, 4, i % 2 ? '#E8DCC4' : '#F2E7D2', { stroke: P.ink, lw: 3, seed: 1840 + i });
    for (let k = 0; k < 3; k++) line(ctx, 450 + i * 16, 636 + k * 24 - i * 22, 800 + i * 16, 636 + k * 24 - i * 22, { seed: 1850 + i * 3 + k, lw: 2, color: '#B9A98D' });
  }
  return { deskY: 620 };
}

// v2-11 四张专辑封面
export function albumWall(ctx, t) {
  bg(ctx, '#2A2320');
  ctx.fillStyle = '#4A3E34'; ctx.fillRect(0, 0, 1920, 900);
  const cols = ['#DE886D', '#4E8FA3', '#D9A03F', '#B9A6D9'];
  cols.forEach((c, i) => {
    const x = 240 + i * 380, y = 220, w = 300, h = 300;
    block(ctx, x, y, w, h, 4, c, { stroke: P.ink, lw: 7, seed: 1860 + i });
    block(ctx, x + 20, y + 20, w - 40, h - 90, 3, 'rgba(0,0,0,0.12)', { seed: 1870 + i });
    block(ctx, x + 20, y + h - 58, w - 40, 16, 4, '#F2E3C6', { seed: 1880 + i });
    block(ctx, x + 20, y + h - 34, w - 120, 10, 4, 'rgba(242,227,198,0.7)', { seed: 1890 + i });
  });
  return { wallY: 520 };
}

// v2-16/17 暖色回忆：父亲与同事
export function warmRoom(ctx, t) {
  ctx.fillStyle = '#8E6E52'; ctx.fillRect(0, 0, 1920, 1080);
  for (let i = 0; i < 9; i++) line(ctx, i * 230, 0, i * 230, 1080, { seed: 1900 + i, lw: 2, color: '#7E6046', amp: 2 });
  floorPlane(ctx, { y: 860, color: '#5E4636', dark: '#4E3A2C', vx: 960, vy: 820, bands: false });
  // 窗（夜里同事下班后的屋子）
  block(ctx, 120, 140, 420, 340, 8, '#6E5440', { stroke: P.ink, lw: 7, seed: 1910 });
  block(ctx, 140, 160, 380, 300, 4, '#20323C', { seed: 1911 });
  // 海报（角色剪影）
  block(ctx, 1320, 160, 300, 380, 3, '#1E2C36', { stroke: P.ink, lw: 7, seed: 1920 });
  ctx.beginPath(); ctx.ellipse(1470, 300, 56, 64, 0, 0, Math.PI * 2); ctx.fillStyle = '#8E6A68'; ctx.fill();
  poly(ctx, [[1380, 390], [1560, 390], [1600, 540], [1340, 540]], { fill: '#8E6A68', stroke: false });
  // 茶几
  block(ctx, 700, 760, 520, 200, 8, '#6E4E3A', { stroke: P.ink, lw: 6, seed: 1930 });
  glow(ctx, 960, 500, 700, 'rgba(246,201,126,0.35)', 0.6);
  return { floorY: 860 };
}

// v2-18 空场
export function emptyVenue(ctx, t) {
  bg(ctx, '#101820');
  ctx.fillStyle = '#1A2833'; ctx.fillRect(0, 0, 1920, 820);
  block(ctx, 0, 820, 1920, 260, 0, '#242428');
  // 一排排折叠椅（只画前面两排）
  for (let r = 0; r < 2; r++) {
    for (let i = 0; i < 9; i++) {
      const x = 120 + i * 200 + r * 40, y = 860 + r * 90;
      block(ctx, x, y, 130, 20, 4, '#3A3E44', { stroke: P.ink, lw: 4, seed: 1940 + r * 9 + i });
      block(ctx, x + 10, y + 20, 110, 40, 4, '#32363C', { stroke: P.ink, lw: 3, seed: 1960 + r * 9 + i });
    }
  }
  // 顶灯
  line(ctx, 960, 0, 960, 200, { seed: 1980, lw: 5, color: P.ink });
  block(ctx, 900, 200, 120, 40, 14, '#F2E3C6', { stroke: P.ink, lw: 5, seed: 1981 });
  glow(ctx, 960, 240, 620, 'rgba(246,201,126,0.5)', 0.6);
  return { floorY: 900 };
}