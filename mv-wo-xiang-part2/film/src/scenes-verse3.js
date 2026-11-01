// 第三段主歌的场景
import { P } from './palette.js';
import { block, line, poly, curve, rr, rng, glow, star, bg, clamp, lerp, smooth } from './ink.js';
import { cityLine, nightSky, stars, moon, floorPlane, carriage } from './scenes.js';

// v3-01 左右分割：街道 / 舞台
export function splitWorld(ctx, t) {
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, 960, 1080); ctx.clip();
  nightSky(ctx, { y: 0, h: 1080 });
  cityLine(ctx, { y: 760, seed: 111, minH: 120, maxH: 320, color: '#16303C' });
  block(ctx, 0, 820, 960, 260, 0, '#6E4E4B');
  ctx.restore();

  ctx.save();
  ctx.beginPath(); ctx.rect(960, 0, 960, 1080); ctx.clip();
  ctx.fillStyle = '#22333D'; ctx.fillRect(960, 0, 960, 1080);
  block(ctx, 960, 0, 960, 780, 0, '#1B2730');
  poly(ctx, [[1920, 0], [1660, 0], [1720, 900], [1920, 900]], { fill: '#7E4638', stroke: P.ink, lw: 5, seed: 1990 });
  block(ctx, 960, 780, 960, 300, 0, '#332E2C');
  line(ctx, 960, 780, 1920, 780, { seed: 1991, lw: 5, color: P.ink });
  ctx.restore();

  // 分割线
  line(ctx, 960, 0, 960, 1080, { seed: 1992, lw: 6, color: '#F1D9A8', amp: 1 });
}

// v3-02 街尽头的一盏灯
export function streetEnd(ctx, t) {
  nightSky(ctx, { y: 0, h: 1080 });
  cityLine(ctx, { y: 700, seed: 112, minH: 140, maxH: 340, color: '#16303C' });
  // 一条向里收的街
  poly(ctx, [[0, 1080], [760, 760], [1160, 760], [1920, 1080]], { fill: '#5E4E4A', stroke: false });
  for (let i = 0; i < 7; i++) line(ctx, 960 + (i - 3) * 300, 1080, 960 + (i - 3) * 46, 760, { seed: 2000 + i, lw: 2.5, color: '#4E3E3C' });
  glow(ctx, 960, 700, 260, 'rgba(246,201,126,0.7)', 0.75);
  ctx.beginPath(); ctx.arc(960, 700, 22, 0, Math.PI * 2); ctx.fillStyle = P.lamp; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = P.ink; ctx.stroke();
  return { floorY: 900 };
}

// v3-03 发光的书
export function bookGlow(ctx, t) {
  bg(ctx, '#1A1612');
  ctx.fillStyle = '#2E2620'; ctx.fillRect(0, 0, 1920, 1080);
  // 书桌
  block(ctx, 0, 740, 1920, 340, 0, '#4A3A30');
  line(ctx, 0, 740, 1920, 740, { seed: 2010, lw: 6, color: P.ink });
  // 摊开的书
  const cx = 960, cy = 760;
  poly(ctx, [[cx - 420, cy], [cx, cy - 60], [cx, cy + 40], [cx - 420, cy + 90]], { fill: '#F2E7D2', stroke: P.ink, lw: 6, seed: 2020 });
  poly(ctx, [[cx + 420, cy], [cx, cy - 60], [cx, cy + 40], [cx + 420, cy + 90]], { fill: '#E8DCC4', stroke: P.ink, lw: 6, seed: 2021 });
  for (let i = 0; i < 4; i++) {
    line(ctx, cx - 380, cy + 24 + i * 16, cx - 60, cy + 6 + i * 16, { seed: 2030 + i, lw: 2, color: '#B9A98D' });
    line(ctx, cx + 60, cy + 6 + i * 16, cx + 380, cy + 24 + i * 16, { seed: 2040 + i, lw: 2, color: '#B9A98D' });
  }
  glow(ctx, cx, cy, 320, 'rgba(246,201,126,0.6)', 0.7);
  return { cx, cy };
}

// v3-04 黎明前的鸟
export function dawnBird(ctx, t) {
  // 最深的夜，天边一线
  ctx.fillStyle = '#0E1A24'; ctx.fillRect(0, 0, 1920, 1080);
  const g = ctx.createLinearGradient(0, 500, 0, 760);
  g.addColorStop(0, 'rgba(24,44,58,1)');
  g.addColorStop(0.65, 'rgba(46,74,88,1)');
  g.addColorStop(1, 'rgba(120,110,96,0.55)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 800);
  ctx.fillStyle = '#0C1620'; ctx.fillRect(0, 800, 1920, 280);
  cityLine(ctx, { y: 800, seed: 120, minH: 100, maxH: 300, color: '#0A141C' });
  // 天线
  for (const x of [300, 1500, 1700]) {
    line(ctx, x, 800, x, 560, { seed: 2050 + x, lw: 5, color: '#0A141C' });
    line(ctx, x - 30, 640, x + 30, 640, { seed: 2060 + x, lw: 4, color: '#0A141C' });
  }
  // 天边一线
  line(ctx, 0, 760, 1920, 760, { seed: 2070, lw: 6, color: 'rgba(241,217,168,0.5)', amp: 1 });
  return { horizon: 760 };
}

// v3-05 地下通道
export function tunnel(ctx, t) {
  bg(ctx, '#171310');
  // 砖墙
  ctx.fillStyle = '#3E332A'; ctx.fillRect(0, 0, 1920, 880);
  const R = rng(2080);
  for (let r = 0; r < 9; r++) for (let c = 0; c < 12; c++) {
    const x = c * 160 + (r % 2) * 80, y = r * 98;
    block(ctx, x + 4, y + 4, 152, 90, 3, R() < 0.5 ? '#453A30' : '#3E332A', { stroke: '#2E251E', lw: 2, seed: 2080 + r * 12 + c });
  }
  floorPlane(ctx, { y: 880, color: '#2A2320', dark: '#221C18', vx: 960, vy: 840, bands: false });
  // 旧地铁图
  block(ctx, 420, 220, 620, 380, 4, '#1E2C36', { stroke: P.ink, lw: 6, seed: 2100 });
  return { map: { x: 420, y: 220, w: 620, h: 380 } };
}

// v3-06 屋顶天线
export function roofAntenna(ctx, t) {
  nightSky(ctx, { y: 0, h: 1080 });
  stars(ctx, { n: 24, h: 460, seed: 131 });
  cityLine(ctx, { y: 820, seed: 132, minH: 160, maxH: 360, color: '#142A36' });
  // 屋面
  block(ctx, 0, 840, 1920, 60, 0, '#4A4A50', { stroke: P.ink, lw: 5, seed: 2110 });
  // 天线
  line(ctx, 1200, 840, 1200, 320, { seed: 2111, lw: 8, color: P.ink });
  for (let i = 0; i < 4; i++) line(ctx, 1130, 420 + i * 70, 1270, 420 + i * 70, { seed: 2120 + i, lw: 5, color: P.ink });
  // 红色指示灯
  ctx.beginPath(); ctx.arc(1200, 316, 12, 0, Math.PI * 2); ctx.fillStyle = '#E0566E'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = P.ink; ctx.stroke();
  return { floorY: 840, antennaX: 1200 };
}

// v3-07 很小的房间
export function tinyRoom(ctx, t) {
  ctx.fillStyle = '#6E5A48'; ctx.fillRect(0, 0, 1920, 820);
  floorPlane(ctx, { y: 820, color: '#4A3A30', dark: '#3E3028', vx: 960, vy: 780, bands: false });
  // 床
  block(ctx, 1100, 640, 620, 180, 10, '#7E5B45', { stroke: P.ink, lw: 6, seed: 2130 });
  block(ctx, 1110, 620, 600, 46, 10, '#E0CDA8', { stroke: P.ink, lw: 5, seed: 2131 });
  // 行李箱
  block(ctx, 340, 660, 260, 180, 10, '#2F4A54', { stroke: P.ink, lw: 6, seed: 2140 });
  line(ctx, 340, 720, 600, 720, { seed: 2141, lw: 4, color: P.ink });
  // 灯
  line(ctx, 900, 480, 900, 660, { seed: 2150, lw: 5, color: P.ink });
  poly(ctx, [[840, 480], [960, 480], [940, 420], [860, 420]], { fill: '#D9A03F', stroke: P.ink, lw: 4, seed: 2151 });
  glow(ctx, 900, 480, 420, 'rgba(246,201,126,0.5)', 0.55);
  return { floorY: 840 };
}

// v3-08 家人饭桌
export function familyTable(ctx, t) {
  ctx.fillStyle = '#7E6650'; ctx.fillRect(0, 0, 1920, 900);
  for (let i = 0; i < 9; i++) line(ctx, i * 220, 0, i * 220, 900, { seed: 2160 + i, lw: 2, color: '#6E5944', amp: 2 });
  floorPlane(ctx, { y: 900, color: '#4E3A2C', dark: '#3E2E22', vx: 960, vy: 860, bands: false });
  // 桌
  block(ctx, 520, 700, 880, 90, 10, '#8E6A4A', { stroke: P.ink, lw: 6, seed: 2170 });
  block(ctx, 560, 790, 60, 160, 4, '#6E4E3A', { seed: 2171 });
  block(ctx, 1300, 790, 60, 160, 4, '#6E4E3A', { seed: 2172 });
  // 热汤
  block(ctx, 860, 640, 200, 70, 14, '#D8CFB6', { stroke: P.ink, lw: 5, seed: 2180 });
  glow(ctx, 960, 620, 240, 'rgba(246,201,126,0.45)', 0.6);
  // 墙上的全家福
  block(ctx, 120, 160, 300, 200, 4, '#E8D5B0', { stroke: P.ink, lw: 6, seed: 2190 });
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.arc(190 + i * 80, 260, 28, 0, Math.PI * 2);
    ctx.fillStyle = ['#93AE7C', '#DE886D', '#E8A0A8'][i]; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = P.ink; ctx.stroke();
  }
  return { tableY: 700 };
}

// v3-09 被挡住的门
export function blockedDoor(ctx, t) {
  bg(ctx, '#241E1A');
  ctx.fillStyle = '#4A3E34'; ctx.fillRect(0, 0, 1920, 900);
  floorPlane(ctx, { y: 900, color: '#332A24', dark: '#2A221D', vx: 960, vy: 860, bands: false });
  // 门框
  block(ctx, 660, 160, 600, 740, 6, '#5E4432', { stroke: P.ink, lw: 8, seed: 2200 });
  block(ctx, 700, 200, 520, 660, 4, '#3A2A20', { seed: 2201 });
  glow(ctx, 960, 400, 320, 'rgba(246,201,126,0.35)', 0.5);
  return { doorY: 860 };
}

// v3-10 迷宫窄路
export function maze(ctx, t) {
  bg(ctx, '#141A20');
  // 两侧高墙
  for (let i = 0; i < 4; i++) {
    const w = 380 - i * 40;
    block(ctx, i * 60, 0, w, 1080, 0, i % 2 ? '#2A333A' : '#232C33');
    block(ctx, 1920 - i * 60 - w, 0, w, 1080, 0, i % 2 ? '#2A333A' : '#232C33');
  }
  // 路面
  poly(ctx, [[420, 1080], [700, 500], [1220, 500], [1500, 1080]], { fill: '#3A4248', stroke: false });
  line(ctx, 420, 1080, 700, 500, { seed: 2210, lw: 4, color: P.ink });
  line(ctx, 1500, 1080, 1220, 500, { seed: 2211, lw: 4, color: P.ink });
  // 路口的暗
  block(ctx, 700, 420, 520, 90, 0, '#0E1418');
  return { floorY: 980 };
}

// v3-11/12 城市全景
export function cityWide(ctx, t, o = {}) {
  nightSky(ctx, { y: 0, h: 1080, top: '#0E1A24', mid: '#172C3A', low: '#223F4E' });
  stars(ctx, { n: 40, h: 560, seed: 141 });
  moon(ctx, 1600, 160, 52, '#172C3A');
  cityLine(ctx, { y: 900, seed: 143, minH: 180, maxH: 420, color: '#122832' });
  cityLine(ctx, { y: 960, seed: 144, minH: 100, maxH: 240, color: '#0E2029' });
  return { horizon: 900 };
}

// v3-13 一模一样的人群
export function crowdUniform(ctx, t) {
  bg(ctx, '#2A333A');
  block(ctx, 0, 760, 1920, 320, 0, '#3A3F42');
  // 一排排灰色小螃蟹
  for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) {
    const x = 100 + i * 210 + (r % 2) * 60, y = 840 + r * 80;
    block(ctx, x, y - 100, 130, 100, 20, r === 1 && i === 4 ? P.orange : '#9A9498', { stroke: P.ink, lw: 4, seed: 2220 + r * 9 + i });
    ctx.fillStyle = P.ink;
    ctx.fillRect(x + 34, y - 66, 8, 22);
    ctx.fillRect(x + 88, y - 66, 8, 22);
  }
  return { floorY: 840 };
}

// v3-14 上班队列
export function queue(ctx, t) {
  bg(ctx, '#1E2A33');
  // 大楼
  block(ctx, 0, 0, 1920, 1080, 0, '#2A3A44');
  block(ctx, 520, 380, 880, 700, 0, '#33454F', { stroke: P.ink, lw: 7, seed: 2230 });
  block(ctx, 760, 560, 400, 520, 0, '#1A2730', { stroke: P.ink, lw: 6, seed: 2231 });
  // 地
  block(ctx, 0, 900, 1920, 180, 0, '#3A4248');
  return { floorY: 920 };
}

// v3-15 墙上的粉笔画
export function chalkWall(ctx, t, o = {}) {
  // 扁平大块砖：只靠分缝分块，不做纹理和随机明暗（v3-15 用）
  bg(ctx, '#241F1B');
  ctx.fillStyle = '#3A332D'; ctx.fillRect(0, 0, 1920, 1080);
  const tones = ['#443C35', '#3F3831', '#483F38'];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
    const x = c * 290 + (r % 2) * 145 - 140, y = r * 190;
    block(ctx, x + 5, y + 5, 280, 180, 5, tones[(r * 3 + c) % 3], { seed: 2240 + r * 7 + c });
  }
  // 顶部一层暖光，避免整面墙掉进暗部
  const g = ctx.createLinearGradient(0, 0, 0, 520);
  g.addColorStop(0, 'rgba(246,201,126,0.13)');
  g.addColorStop(1, 'rgba(246,201,126,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 520);
  return { wall: true };
}

// v3-16 橱窗里的戒指
export function ringWindow(ctx, t) {
  bg(ctx, '#1A1412');
  ctx.fillStyle = '#2E2620'; ctx.fillRect(0, 0, 1920, 820);
  // 橱窗
  block(ctx, 420, 160, 1080, 620, 6, '#3A2E28', { stroke: P.ink, lw: 8, seed: 2250 });
  ctx.save(); ctx.beginPath(); ctx.rect(440, 180, 1040, 580); ctx.clip();
  ctx.fillStyle = '#241C18'; ctx.fillRect(440, 180, 1040, 580);
  const g = ctx.createRadialGradient(960, 470, 10, 960, 470, 380);
  g.addColorStop(0, 'rgba(246,201,126,0.55)');
  g.addColorStop(1, 'rgba(246,201,126,0)');
  ctx.fillStyle = g; ctx.fillRect(440, 180, 1040, 580);
  // 戒指
  ctx.beginPath(); ctx.arc(960, 470, 70, 0, Math.PI * 2);
  ctx.lineWidth = 18; ctx.strokeStyle = '#F1D9A8'; ctx.stroke();
  ctx.lineWidth = 4; ctx.strokeStyle = P.ink; ctx.stroke();
  ctx.beginPath(); ctx.arc(960, 400, 20, 0, Math.PI * 2); ctx.fillStyle = '#E8A0A8'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = P.ink; ctx.stroke();
  ctx.restore();
  block(ctx, 440, 180, 1040, 580, 4, null, { stroke: P.ink, lw: 6, seed: 2251 });
  // 台面
  block(ctx, 0, 820, 1920, 260, 0, '#4A3A32');
  return { floorY: 840 };
}

// v3-18/19 留声机
export function gramophone(ctx, t) {
  bg(ctx, '#171310');
  ctx.fillStyle = '#2E2620'; ctx.fillRect(0, 0, 1920, 840);
  floorPlane(ctx, { y: 840, color: '#241E18', dark: '#1E1914', vx: 960, vy: 800, bands: false });
  // 小桌
  block(ctx, 560, 700, 800, 140, 8, '#5E4432', { stroke: P.ink, lw: 6, seed: 2260 });
  // 留声机
  block(ctx, 760, 640, 400, 70, 6, '#3A2E28', { stroke: P.ink, lw: 5, seed: 2270 });
  ctx.beginPath(); ctx.arc(900, 660, 90, 0, Math.PI * 2); ctx.fillStyle = '#141820'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = P.ink; ctx.stroke();
  ctx.beginPath(); ctx.arc(900, 660, 22, 0, Math.PI * 2); ctx.fillStyle = P.mustard; ctx.fill();
  // 喇叭
  poly(ctx, [[1140, 620], [1260, 520], [1360, 580], [1200, 690]], { fill: '#C9A24E', stroke: P.ink, lw: 6, seed: 2271 });
  line(ctx, 1060, 650, 1150, 610, { seed: 2272, lw: 6, color: P.ink });
  // 窗
  block(ctx, 100, 180, 360, 320, 6, '#3A2E28', { stroke: P.ink, lw: 7, seed: 2280 });
  block(ctx, 116, 196, 328, 288, 3, '#16262F', { seed: 2281 });
  glow(ctx, 900, 620, 520, 'rgba(246,201,126,0.35)', 0.5);
  return { floorY: 860, record: { x: 900, y: 660 } };
}