// 场景（续）：第一段主歌其余镜头用。同一套原语，块面清楚。
import { P } from './palette.js';
import { block, line, poly, curve, rr, rng, glow, star, bg, clamp, lerp, hash } from './ink.js';
import { nightSky, stars, moon, cityLine, floorPlane } from './scenes.js';

// ---------------- 机场登机口 ----------------
export function airport(ctx, t, o = {}) {
  // 室内墙
  ctx.fillStyle = '#3A4A52'; ctx.fillRect(0, 0, 1920, 1080);
  ctx.fillStyle = '#2E3E46'; ctx.fillRect(0, 0, 1920, 120);
  block(ctx, 0, 120, 1920, 16, 0, '#243037', { stroke: P.ink, lw: 3, seed: 700 });

  // 落地窗
  const wx = 90, wy = 170, ww = 1160, wh = 560;
  block(ctx, wx - 14, wy - 14, ww + 28, wh + 28, 10, '#56676E', { stroke: P.ink, lw: 7, seed: 701 });
  ctx.save();
  ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
  nightSky(ctx, { y: wy, h: wh, top: '#1A2C3A', mid: '#233B4A', low: '#2C4654' });
  stars(ctx, { n: 14, h: 200, seed: 77 });
  // 远山
  poly(ctx, [[wx, wy + 430], [wx + 260, wy + 300], [wx + 520, wy + 380], [wx + 800, wy + 280], [wx + 1100, wy + 400], [wx + ww, wy + 360], [wx + ww, wy + wh], [wx, wy + wh]],
    { fill: '#25414E', stroke: false });
  // 棕榈树
  const palms = [[wx + 120, wy + 500], [wx + 1030, wy + 500]];
  palms.forEach(([px, py], i) => {
    ctx.strokeStyle = '#16292F'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(px + 18, py - 110, px + 30, py - 210); ctx.stroke();
    for (let k = -2; k <= 2; k++) {
      ctx.beginPath(); ctx.lineWidth = 9;
      ctx.moveTo(px + 30, py - 210);
      ctx.quadraticCurveTo(px + 30 + k * 46, py - 256 - Math.abs(k) * 8, px + 30 + k * 74, py - 236 - Math.abs(k) * 16);
      ctx.stroke();
    }
  });
  // 停机坪
  ctx.fillStyle = '#22333C'; ctx.fillRect(wx, wy + 470, ww, wh - 470);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = 'rgba(241,217,168,0.5)'; ctx.fillRect(wx + 60 + i * 140, wy + 540, 54, 6); }
  // 停着的飞机：机身 + 机翼 + 尾翼 + 舷窗
  const ax = wx + 560, ay = wy + 452;
  ctx.fillStyle = '#D8D2C4';
  block(ctx, ax - 210, ay - 34, 420, 68, 34, '#D8D2C4', { stroke: P.ink, lw: 5, seed: 705 });
  poly(ctx, [[ax + 150, ay - 20], [ax + 210, ay - 92], [ax + 250, ay - 92], [ax + 232, ay - 16]],
    { fill: '#C9C3B5', stroke: P.ink, lw: 4, seed: 706 });
  poly(ctx, [[ax - 120, ay + 12], [ax + 40, ay + 66], [ax + 120, ay + 66], [ax + 10, ay + 18]],
    { fill: '#C9C3B5', stroke: P.ink, lw: 4, seed: 707 });
  ctx.fillStyle = '#F6E9C8';
  for (let i = 0; i < 7; i++) ctx.fillRect(ax - 170 + i * 46, ay - 14, 14, 9);
  ctx.fillStyle = '#8E9A9E';
  ctx.beginPath(); ctx.arc(ax - 196, ay + 30, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(ax - 150, ay + 30, 9, 0, Math.PI * 2); ctx.fill();
  // 窗反光
  ctx.fillStyle = 'rgba(200,225,232,0.08)'; ctx.fillRect(wx, wy, ww, wh);
  ctx.restore();
  line(ctx, wx + ww * 0.35, wy, wx + ww * 0.35, wy + wh, { seed: 702, lw: 5, color: P.ink });
  line(ctx, wx + ww * 0.7, wy, wx + ww * 0.7, wy + wh, { seed: 703, lw: 5, color: P.ink });

  // 地面
  floorPlane(ctx, { y: 780, color: '#5E6A70', dark: '#4A555B', vx: 960, vy: 700, bands: true });

  // 指示牌
  block(ctx, 1320, 200, 420, 120, 10, '#1E3A46', { stroke: P.ink, lw: 6, seed: 710 });
  ctx.fillStyle = P.cream; ctx.font = '500 40px NotoSansSC';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('LAX', 1360, 240);
  ctx.font = '400 24px NotoSansSC'; ctx.fillStyle = '#BFD2D6';
  ctx.fillText('登机口 B12  ·  23:40', 1360, 288);

  // 候机椅
  for (let i = 0; i < 4; i++) {
    const x = 1380 + i * 128;
    block(ctx, x, 620, 108, 18, 8, '#6B7A80', { stroke: P.ink, lw: 4, seed: 720 + i });
    block(ctx, x + 8, 638, 92, 80, 6, '#5A676D', { stroke: P.ink, lw: 4, seed: 730 + i });
    line(ctx, x + 16, 718, x + 16, 790, { seed: 740 + i, lw: 5, color: P.ink });
  }
  glow(ctx, 960, 300, 700, 'rgba(246,201,126,0.16)', 0.5);
  return { floorY: 790 };
}

// ---------------- 桌前（俯拍 / 中近景） ----------------
export function deskRoom(ctx, t, o = {}) {
  bg(ctx, '#4A3A34');
  // 墙面
  ctx.fillStyle = '#9A7A62'; ctx.fillRect(0, 0, 1920, 420);
  for (let i = 0; i < 12; i++) line(ctx, i * 170, 0, i * 170, 420, { seed: 760 + i, lw: 2, color: '#7E604C', amp: 2 });
  // 桌面（俯视：占下半）
  block(ctx, 0, 380, 1920, 700, 0, '#A87E5E');
  for (let i = 0; i < 6; i++) line(ctx, 0, 420 + i * 110, 1920, 420 + i * 110, { seed: 770 + i, lw: 2, color: '#96704F', amp: 2 });
  line(ctx, 0, 380, 1920, 380, { seed: 780, lw: 5, color: P.ink });

  // 合同与信封
  block(ctx, 260, 470, 520, 330, 6, '#E8DCC4', { stroke: P.ink, lw: 5, seed: 781 });
  for (let i = 0; i < 7; i++) line(ctx, 300, 520 + i * 34, 740, 520 + i * 34, { seed: 782 + i, lw: 2.5, color: '#B9A98D', amp: 1.4, parts: 5 });
  block(ctx, 640, 700, 120, 70, 4, '#B98A83', { stroke: P.ink, lw: 3, seed: 790 }); // 印章
  block(ctx, 830, 520, 340, 220, 6, '#D9C6A4', { stroke: P.ink, lw: 5, seed: 791 });
  poly(ctx, [[830, 520], [1000, 640], [1170, 520]], { stroke: P.ink, lw: 4, fill: null });

  // 手机（余额）
  block(ctx, 1260, 430, 210, 360, 26, '#2C2F36', { stroke: P.ink, lw: 6, seed: 800 });
  block(ctx, 1276, 448, 178, 324, 16, '#DCE9EC', { stroke: P.ink, lw: 3, seed: 801 });
  ctx.fillStyle = '#4E8FA3'; ctx.font = '500 44px NotoSansSC'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('¥ 286,000', 1365, 560);
  ctx.fillStyle = '#6E7A80'; ctx.font = '400 22px NotoSansSC';
  ctx.fillText('余额', 1365, 500);

  // 泡面
  block(ctx, 660, 780, 200, 150, 18, '#E8D5B0', { stroke: P.ink, lw: 5, seed: 810 });
  block(ctx, 672, 770, 176, 44, 12, '#D9C6A4', { stroke: P.ink, lw: 4, seed: 811 });
  ctx.fillStyle = '#B98A83'; ctx.font = '500 26px NotoSansSC';
  ctx.fillText('面', 760, 866);

  // 台灯
  line(ctx, 1620, 300, 1620, 420, { seed: 820, lw: 6, color: P.ink });
  poly(ctx, [[1560, 300], [1680, 300], [1656, 250], [1584, 250]], { fill: '#D9A03F', stroke: P.ink, lw: 5, seed: 821 });
  glow(ctx, 1620, 300, 380, 'rgba(246,201,126,0.45)', 0.55);
  return { deskY: 400 };
}

// ---------------- 抽屉内部 ----------------
export function drawer(ctx, t, o = {}) {
  bg(ctx, '#2A2320');
  // 抽屉外框
  block(ctx, 0, 0, 1920, 190, 0, '#5E4432');
  block(ctx, 0, 890, 1920, 190, 0, '#5E4432');
  block(ctx, 0, 0, 150, 1080, 0, '#5E4432');
  block(ctx, 1770, 0, 150, 1080, 0, '#5E4432');
  // 抽屉内部
  block(ctx, 150, 150, 1620, 780, 6, '#8E6A4A');
  for (let i = 0; i < 5; i++) line(ctx, 150, 250 + i * 150, 1770, 250 + i * 150, { seed: 850 + i, lw: 3, color: '#7A5A3E', amp: 2 });
  line(ctx, 150, 190, 1770, 190, { seed: 860, lw: 5, color: P.ink });
  // 旧相机
  block(ctx, 430, 520, 360, 230, 26, '#2C2F36', { stroke: P.ink, lw: 7, seed: 870 });
  ctx.beginPath(); ctx.arc(610, 630, 84, 0, Math.PI * 2); ctx.fillStyle = '#3A3D44'; ctx.fill();
  ctx.lineWidth = 8; ctx.strokeStyle = P.ink; ctx.stroke();
  ctx.beginPath(); ctx.arc(610, 630, 46, 0, Math.PI * 2); ctx.fillStyle = '#1B2A33'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = '#6FA8B8'; ctx.stroke();
  block(ctx, 760, 546, 74, 40, 8, '#3A3D44', { stroke: P.ink, lw: 4, seed: 871 });
  // 便签 8000
  block(ctx, 960, 420, 300, 200, 4, '#E8D5B0', { stroke: P.ink, lw: 4, seed: 880 });
  ctx.fillStyle = '#2B2A2E'; ctx.font = '700 92px NotoSansSC'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('8000', 1110, 520);
  // 打印稿
  block(ctx, 1290, 600, 340, 260, 3, '#D9D2BE', { stroke: P.ink, lw: 4, seed: 881 });
  for (let i = 0; i < 6; i++) line(ctx, 1320, 650 + i * 30, 1600, 650 + i * 30, { seed: 882 + i, lw: 2, color: '#A79E8A', amp: 1.2 });
  // 一点从缝里透进来的光
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = P.lamp;
  ctx.fillRect(150, 150, 1620, 60);
  ctx.restore();
  return { inner: { x: 150, y: 150, w: 1620, h: 780 } };
}

// ---------------- 便利店收银台 ----------------
export function storeCounter(ctx, t, o = {}) {
  // 背景货架
  bg(ctx, '#C9A96E');
  block(ctx, 0, 0, 1920, 560, 0, '#D8B87C');
  for (let r = 0; r < 2; r++) {
    block(ctx, 60, 90 + r * 190, 1800, 140, 4, '#B98A4E', { stroke: P.ink, lw: 5, seed: 900 + r });
    for (let c = 0; c < 10; c++) {
      const R = rng(910 + r * 10 + c);
      ctx.fillStyle = ['#D9A03F', '#A8C48C', '#E8A0A8', '#4E8FA3', '#B9A6D9'][Math.floor(R() * 5)];
      ctx.fillRect(96 + c * 172, 116 + r * 190, 74, 74);
    }
  }
  // 柜台
  block(ctx, 0, 620, 1920, 460, 0, '#8C6A46');
  block(ctx, 0, 620, 1920, 40, 0, '#A8815A', { stroke: P.ink, lw: 5, seed: 920 });
  // 扫码器
  block(ctx, 560, 520, 170, 110, 10, '#2F4A54', { stroke: P.ink, lw: 5, seed: 930 });
  block(ctx, 590, 548, 110, 40, 6, '#7EDCE0', { seed: 931 });
  // 便当
  block(ctx, 840, 540, 260, 120, 14, '#E8DCC4', { stroke: P.ink, lw: 5, seed: 940 });
  block(ctx, 860, 556, 90, 88, 8, '#B98A83', { seed: 941 });
  block(ctx, 960, 556, 110, 88, 8, '#E8D5B0', { seed: 942 });
  // 价格牌
  block(ctx, 1190, 520, 210, 90, 8, '#E8D5B0', { stroke: P.ink, lw: 4, seed: 950 });
  ctx.fillStyle = '#2B2A2E'; ctx.font = '500 34px NotoSansSC'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('¥ 18', 1295, 566);
  glow(ctx, 960, 200, 900, 'rgba(246,201,126,0.30)', 0.55);
  return { counterY: 630 };
}

// ---------------- 夜街（签名） ----------------
export function nightStreet(ctx, t, o = {}) {
  nightSky(ctx, { y: 0, h: 700 });
  stars(ctx, { n: 16, h: 240, seed: 61 });
  moon(ctx, 1700, 150, 40, P.sky);
  cityLine(ctx, { y: 640, seed: 55, minH: 100, maxH: 280, color: '#16303C' });
  // 店面墙
  block(ctx, 0, 400, 1920, 340, 0, '#5E4652');
  for (let i = 0; i < 5; i++) block(ctx, 60 + i * 380, 450, 260, 200, 8, '#3A4A52', { stroke: P.ink, lw: 5, seed: 960 + i });
  glow(ctx, 300, 470, 240, 'rgba(246,201,126,0.35)', 0.5);
  // 人行道
  block(ctx, 0, 740, 1920, 340, 0, '#8A6A64');
  block(ctx, 0, 740, 1920, 24, 0, '#A98A80', { stroke: P.ink, lw: 4, seed: 970 });
  for (let i = 0; i < 6; i++) line(ctx, i * 340 + 120, 764, i * 340 + 220, 1080, { seed: 971 + i, lw: 2, color: '#78564F', amp: 1 });
  return { floorY: 770 };
}

// ---------------- 门口 / 明信片 ----------------
export function doorway(ctx, t, o = {}) {
  bg(ctx, '#6E4E4B');
  // 走廊墙
  ctx.fillStyle = '#8E6E58'; ctx.fillRect(0, 0, 1920, 760);
  for (let i = 0; i < 10; i++) line(ctx, i * 210, 0, i * 210, 760, { seed: 1000 + i, lw: 2, color: '#7E604C', amp: 2 });
  floorPlane(ctx, { y: 760, color: '#6E4E4B', dark: '#5A3E3B', vx: 960, vy: 700, bands: true });
  // 门
  block(ctx, 620, 120, 680, 680, 6, '#7E5B45', { stroke: P.ink, lw: 8, seed: 1010 });
  block(ctx, 650, 150, 620, 420, 4, '#8E6A52', { seed: 1011 });
  ctx.beginPath(); ctx.arc(1215, 520, 14, 0, Math.PI * 2); ctx.fillStyle = P.mustard; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = P.ink; ctx.stroke();
  // 门缝的光
  ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = P.lamp;
  ctx.fillRect(620, 792, 680, 10); ctx.restore();
  return { door: { x: 620, y: 120, w: 680, h: 680 }, floorY: 800 };
}

// ---------------- 地下排练室 ----------------
export function rehearsal(ctx, t, o = {}) {
  bg(ctx, '#2E2A26');
  // 水泥墙
  ctx.fillStyle = '#5E564C'; ctx.fillRect(0, 0, 1920, 780);
  for (let i = 0; i < 8; i++) line(ctx, 0, 90 + i * 90, 1920, 90 + i * 90, { seed: 1100 + i, lw: 2, color: '#423C35', amp: 2 });
  floorPlane(ctx, { y: 780, color: '#3E3832', dark: '#332E29', vx: 960, vy: 720, bands: false });
  // 顶灯
  line(ctx, 960, 0, 960, 130, { seed: 1110, lw: 6, color: P.ink });
  block(ctx, 880, 130, 160, 52, 18, '#F2E3C6', { stroke: P.ink, lw: 5, seed: 1111 });
  glow(ctx, 960, 190, 700, 'rgba(246,201,126,0.55)', 0.75);
  // 旧海报
  block(ctx, 1380, 240, 260, 320, 3, '#3A4A52', { stroke: P.ink, lw: 6, seed: 1120 });
  ctx.fillStyle = '#5E7A80'; ctx.font = '500 40px NotoSansSC'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('排练', 1510, 360);
  // 椅子
  block(ctx, 300, 560, 240, 26, 8, '#7E5B45', { stroke: P.ink, lw: 5, seed: 1130 });
  block(ctx, 310, 586, 220, 60, 6, '#8E6A52', { stroke: P.ink, lw: 5, seed: 1131 });
  for (const x of [320, 500]) line(ctx, x, 646, x, 780, { seed: 1140 + x, lw: 6, color: P.ink });
  // 地上的汗渍
  ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#1B1815';
  ctx.beginPath(); ctx.ellipse(760, 880, 150, 40, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  // 墙角的旧音箱
  block(ctx, 60, 620, 180, 200, 8, '#242428', { stroke: P.ink, lw: 5, seed: 1150 });
  return { floorY: 800 };
}

// ---------------- 床头（8:30 / 安眠药） ----------------
export function bedside(ctx, t, o = {}) {
  bg(ctx, '#3A3330');
  // 墙
  ctx.fillStyle = '#6E5A48'; ctx.fillRect(0, 0, 1920, 760);
  for (let i = 0; i < 9; i++) line(ctx, i * 230, 0, i * 230, 760, { seed: 1200 + i, lw: 2, color: '#624F3E', amp: 2 });
  floorPlane(ctx, { y: 760, color: '#4A3A34', dark: '#3E302B', vx: 960, vy: 700, bands: false });
  // 窗（霓虹）
  const wx = 1240, wy = 140, ww = 500, wh = 420;
  block(ctx, wx - 12, wy - 12, ww + 24, wh + 24, 6, '#5E4A3C', { stroke: P.ink, lw: 7, seed: 1210 });
  ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
  ctx.fillStyle = '#1E2A36'; ctx.fillRect(wx, wy, ww, wh);
  // 霓虹
  ctx.globalAlpha = 0.9;
  block(ctx, wx + 60, wy + 60, 120, 300, 10, '#E0566E', { seed: 1211 });
  block(ctx, wx + 240, wy + 160, 160, 90, 10, '#6FBFD0', { seed: 1212 });
  block(ctx, wx + 260, wy + 300, 150, 70, 10, '#D9A03F', { seed: 1213 });
  ctx.globalAlpha = 1;
  ctx.restore();
  line(ctx, wx + ww / 2, wy, wx + ww / 2, wy + wh, { seed: 1214, lw: 5, color: P.ink });
  // 床头柜
  block(ctx, 300, 620, 620, 300, 10, '#7E5B45', { stroke: P.ink, lw: 7, seed: 1220 });
  line(ctx, 300, 730, 920, 730, { seed: 1221, lw: 3, color: '#5E4232' });
  // 闹钟
  block(ctx, 360, 500, 260, 140, 18, '#2C2F36', { stroke: P.ink, lw: 6, seed: 1230 });
  ctx.fillStyle = '#E0566E'; ctx.font = '700 64px NotoSansSC'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('8:30', 490, 572);
  // 药瓶
  block(ctx, 700, 470, 130, 180, 20, '#D8CFB6', { stroke: P.ink, lw: 6, seed: 1240 });
  block(ctx, 690, 440, 150, 44, 14, '#4E8FA3', { stroke: P.ink, lw: 5, seed: 1241 });
  block(ctx, 720, 520, 90, 80, 6, '#E8D5B0', { seed: 1242 });
  ctx.fillStyle = '#2B2A2E'; ctx.font = '400 22px NotoSansSC';
  ctx.fillText('睡前 1 粒', 765, 560);
  // 台灯
  line(ctx, 880, 380, 880, 620, { seed: 1250, lw: 6, color: P.ink });
  poly(ctx, [[820, 380], [940, 380], [916, 320], [844, 320]], { fill: '#D9A03F', stroke: P.ink, lw: 5, seed: 1251 });
  glow(ctx, 880, 360, 380, 'rgba(246,201,126,0.45)', 0.55);
  return { tableY: 620 };
}

// ---------------- 健身房 ----------------
export function gym(ctx, t, o = {}) {
  bg(ctx, '#2A3338');
  ctx.fillStyle = '#55646C'; ctx.fillRect(0, 0, 1920, 760);

  // 镜子
  block(ctx, 80, 120, 700, 520, 6, '#5E7A84', { stroke: P.ink, lw: 8, seed: 1300 });
  ctx.save(); ctx.beginPath(); ctx.rect(80, 120, 700, 520); ctx.clip();
  const g = ctx.createLinearGradient(80, 120, 780, 640);
  g.addColorStop(0, 'rgba(210,235,240,0.26)');
  g.addColorStop(0.55, 'rgba(210,235,240,0.08)');
  g.addColorStop(1, 'rgba(210,235,240,0.18)');
  ctx.fillStyle = g; ctx.fillRect(80, 120, 700, 520);
  ctx.restore();

  // 地面
  floorPlane(ctx, { y: 760, color: '#3A4247', dark: '#2F363B', vx: 960, vy: 700, bands: false });

  // 跑步机
  block(ctx, 980, 600, 780, 90, 12, '#2C3236', { stroke: P.ink, lw: 6, seed: 1310 });
  block(ctx, 1000, 540, 740, 66, 8, '#4E585E', { stroke: P.ink, lw: 5, seed: 1311 });
  for (let i = 0; i < 12; i++) line(ctx, 1020 + i * 60, 546, 1020 + i * 60, 600, { seed: 1350 + i, lw: 3, color: '#343B40' });
  // 立柱 + 扶手 + 仪表
  line(ctx, 1680, 400, 1680, 600, { seed: 1312, lw: 9, color: P.ink });
  line(ctx, 1580, 400, 1700, 400, { seed: 1313, lw: 9, color: P.ink });
  block(ctx, 1420, 320, 280, 130, 10, '#1E262B', { stroke: P.ink, lw: 6, seed: 1320 });

  // 哑铃架（镜子前的地面）
  for (let i = 0; i < 2; i++) {
    block(ctx, 170, 880 + i * 60, 380, 26, 10, '#2C3236', { stroke: P.ink, lw: 4, seed: 1330 + i });
    for (let k = 0; k < 3; k++) block(ctx, 210 + k * 116, 838 + i * 60, 76, 44, 8, '#4A5054', { stroke: P.ink, lw: 4, seed: 1340 + k + i * 3 });
  }

  glow(ctx, 1500, 320, 620, 'rgba(200,230,230,0.18)', 0.7);
  glow(ctx, 420, 300, 560, 'rgba(200,230,230,0.12)', 0.6);
  return { floorY: 760, beltY: 546, mirror: { x: 80, y: 120, w: 700, h: 520 } };
}

// ---------------- 手机：付费墙 / App ----------------
export function phonePaywall(ctx, t, o = {}) {
  bg(ctx, '#101720');
  const x = 540, y = 90, w = 840, h = 900;
  block(ctx, x - 24, y - 24, w + 48, h + 48, 60, '#2C2F36', { stroke: P.ink, lw: 8, seed: 1400 });
  block(ctx, x, y, w, h, 44, '#F2E6CE', { stroke: P.ink, lw: 5, seed: 1401 });
  block(ctx, x + 350, y + 18, 140, 20, 10, '#2C2F36', { seed: 1402 });
  // 歌词页
  ctx.fillStyle = '#2B2A2E'; ctx.font = '500 38px NotoSansSC'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('他们说他变了', 960, 240);
  ctx.fillStyle = '#8A7E6A'; ctx.font = '400 26px NotoSansSC';
  for (let i = 0; i < 4; i++) ctx.fillText('·····', 960, 300 + i * 44);
  // 付费墙
  block(ctx, x + 40, 470, w - 80, 330, 20, '#1E2430', { stroke: P.ink, lw: 5, seed: 1410 });
  ctx.fillStyle = P.subText; ctx.font = '500 40px NotoSansSC';
  ctx.fillText('歌词不再免费', 960, 540);
  ctx.font = '700 76px NotoSansSC';
  ctx.fillText('¥ 8', 960, 630);
  block(ctx, x + 150, 690, 260, 76, 14, '#D9A03F', { stroke: P.ink, lw: 5, seed: 1420 });
  ctx.fillStyle = '#2B2A2E'; ctx.font = '500 32px NotoSansSC';
  ctx.fillText('开通会员', x + 280, 730);
  block(ctx, x + 440, 690, 220, 76, 14, 'transparent', { stroke: P.ink, lw: 4, seed: 1421 });
  ctx.fillStyle = '#6E6658'; ctx.font = '400 30px NotoSansSC';
  ctx.fillText('关闭', x + 550, 730);
  return { x, y, w, h };
}

export function phoneApps(ctx, t, o = {}) {
  bg(ctx, '#141C22');
  const x = 400, y = 120, w = 1120, h = 840;
  block(ctx, x - 20, y - 20, w + 40, h + 40, 54, '#2C2F36', { stroke: P.ink, lw: 8, seed: 1500 });
  block(ctx, x, y, w, h, 40, '#E8DCC4', { stroke: P.ink, lw: 5, seed: 1501 });
  ctx.fillStyle = '#2B2A2E'; ctx.font = '500 40px NotoSansSC'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('学习', 960, 200);
  const apps = [['词', '#D9A03F'], ['听', '#4E8FA3'], ['说', '#A8C48C']];
  apps.forEach(([label, color], i) => {
    const ax = 560 + i * 300;
    block(ctx, ax, 330, 220, 220, 46, color, { stroke: P.ink, lw: 6, seed: 1510 + i });
    ctx.fillStyle = '#F7EFDD'; ctx.font = '700 92px NotoSansSC';
    ctx.fillText(label, ax + 110, 440);
    ctx.fillStyle = '#5E5648'; ctx.font = '400 24px NotoSansSC';
    ctx.fillText(['Vocabulary', 'Listening', 'Speaking'][i], ax + 110, 590);
  });
  // 进度条
  for (let i = 0; i < 3; i++) {
    block(ctx, 560 + i * 300, 630, 220, 18, 9, '#C9BFA8', { seed: 1520 + i });
    block(ctx, 560 + i * 300, 630, 220 * [0.7, 0.4, 0.55][i], 18, 9, P.mustard, { seed: 1530 + i });
  }
  return { apps };
}

// ---------------- 身体近景（线路图 / 耳机线） ----------------
export function bodyCloseup(ctx, t, o = {}) {
  bg(ctx, '#1E2A33');
  // 背景虚化成车厢灯带
  for (let i = 0; i < 4; i++) {
    ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = P.lamp;
    ctx.fillRect(0, 120 + i * 220, 1920, 60); ctx.restore();
  }
  // 地面
  block(ctx, 0, 860, 1920, 220, 0, '#2A3138');
  line(ctx, 0, 860, 1920, 860, { seed: 1600, lw: 4, color: P.ink });
  return { floorY: 880 };
}