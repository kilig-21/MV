// 尾奏第二轮（o-01 ~ o-06b）专用场景。
// 只新增，不改动 scenes.js / scenes-intro.js / scenes-outro.js 等共享模块。
// 目标：让 73 秒有真正的段落感 —— 高架 / 车厢 / 站台 / 童年地面 / 亮窗拉远 / 名单 / 熄灯。
import { P } from './palette.js';
import { block, line, poly, rng, glow, clamp, lerp, smooth, easeOut } from './ink.js';
import { nightSky, stars, moon, cityLine } from './scenes.js';
import { clawd } from './character.js';
import { breath } from './life.js';

// ============================================================
// o-01 城市高架：城市在后景，列车在近景驶过
// ============================================================

function carR2(ctx, x, y, dir) {
  ctx.save();
  ctx.translate(x, y);
  if (dir < 0) ctx.scale(-1, 1);
  block(ctx, -30, -20, 60, 20, 7, '#23343E', { stroke: P.ink, lw: 3, seed: 880 });
  block(ctx, -16, -29, 34, 11, 5, '#2C4551', { seed: 881 });
  glow(ctx, 30, -7, 66, 'rgba(255,240,200,0.9)', 0.42);
  ctx.fillStyle = '#FFF2CC';
  ctx.fillRect(25, -11, 9, 6);
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = '#FFE9B8';
  ctx.fillRect(-104, -7, 72, 2);
  ctx.restore();
  ctx.fillStyle = '#C0564E';
  ctx.fillRect(-28, -12, 5, 4);
  ctx.restore();
}

function nightTrain(ctx, x, base, h) {
  const carW = 430, gap = 18, cars = 4;
  const len = cars * carW + (cars - 1) * gap;
  const left = x - len;

  const hx = x - 12, hy = base - h * 0.5;
  ctx.save();
  const beam = ctx.createLinearGradient(hx, 0, hx + 460, 0);
  beam.addColorStop(0, 'rgba(255,238,190,0.20)');
  beam.addColorStop(1, 'rgba(255,238,190,0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(hx, hy - 12);
  ctx.lineTo(hx + 460, base - 46);
  ctx.lineTo(hx + 460, base + 10);
  ctx.lineTo(hx, hy + 14);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  glow(ctx, hx, hy, 150, 'rgba(255,244,210,0.95)', 0.52);

  for (let c = 0; c < cars; c++) {
    const cx0 = left + c * (carW + gap);
    if (cx0 > 1960 || cx0 + carW < -40) continue;

    block(ctx, cx0, base - h, carW, h, 14, '#223A47', { stroke: P.ink, lw: 5, seed: 820 + c });
    block(ctx, cx0 + 4, base - h, carW - 8, 8, 3, '#3C5A67', { seed: 830 + c });
    block(ctx, cx0 + 10, base - 22, carW - 22, 12, 4, '#2A4551', { seed: 840 + c });

    for (let w = 0; w < 4; w++) {
      const wx = cx0 + 30 + w * 100, wy = base - h + 32;
      // 车窗连成一串流动的光：每扇窗向车后拖一段
      ctx.save();
      const tg = ctx.createLinearGradient(wx - 110, 0, wx + 10, 0);
      tg.addColorStop(0, 'rgba(246,201,126,0)');
      tg.addColorStop(1, 'rgba(246,201,126,0.36)');
      ctx.fillStyle = tg;
      ctx.fillRect(wx - 110, wy + 2, 120, 32);
      ctx.restore();

      block(ctx, wx, wy, 76, 34, 7, '#F0C57E', { seed: 850 + c * 10 + w });
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#FFF3D6';
      ctx.fillRect(wx + 4, wy + 4, 68, 12);
      ctx.restore();
      glow(ctx, wx + 38, wy + 17, 66, 'rgba(246,201,126,0.55)', 0.22);
      // 桥下湿街的倒影
      glow(ctx, wx + 38, base + 152, 54, 'rgba(246,201,126,0.5)', 0.11);
    }

    line(ctx, cx0 + carW * 0.52, base - h + 14, cx0 + carW * 0.52, base - 12, { seed: 860 + c, lw: 3, color: '#0C161C' });
    line(ctx, cx0 + 8, base - h + 1, cx0 + carW - 8, base - h + 1, { seed: 870 + c, lw: 2, color: '#4E6E7A', amp: 0.4 });
  }

  // 车尾红灯
  ctx.beginPath(); ctx.arc(left + 8, base - h * 0.55, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#C0564E'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = P.ink; ctx.stroke();
}

export function cityHighway(ctx, o = {}) {
  const t = o.t ?? 0;

  nightSky(ctx, {});
  stars(ctx, { n: 34, h: 430, seed: 31 });
  moon(ctx, 1590, 84, 40, P.sky);

  cityLine(ctx, { y: 610, seed: 21, minH: 110, maxH: 270, color: '#0F1D27', scroll: t * 4 });
  cityLine(ctx, { y: 700, seed: 47, minH: 70, maxH: 190, color: '#132733', scroll: t * 7 });

  // 中景楼块：城市压在后景，窗灯稀疏
  const MB = rng(618);
  for (let i = 0; i < 9; i++) {
    const x = -140 + i * 232 + (MB() * 30 - 15);
    const w = 170 + MB() * 90;
    const top = 566 + MB() * 150;
    block(ctx, x, top, w, 844 - top, 5, i % 2 ? '#152B37' : '#18313D', { stroke: P.ink, lw: 4, seed: 700 + i });
    if (MB() < 0.55) block(ctx, x + w * 0.55, top - 26, 42, 24, 4, '#12242E', { seed: 720 + i });
    const cols = Math.floor((w - 24) / 46), rows = Math.floor((880 - top) / 54);
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      if (MB() < 0.2) {
        ctx.globalAlpha = 0.42 + MB() * 0.34;
        ctx.fillStyle = MB() < 0.6 ? '#E3B36A' : '#BFD6DA';
        ctx.fillRect(x + 20 + c * 46, top + 26 + r * 54, 11, 14);
      }
    }
    ctx.globalAlpha = 1;
  }

  // 楼群的暖色底光：这一段比 o-06b 的冷城市更暖
  const warmth = ctx.createLinearGradient(0, 420, 0, 780);
  warmth.addColorStop(0, 'rgba(217,160,63,0)');
  warmth.addColorStop(0.72, 'rgba(217,160,63,0.05)');
  warmth.addColorStop(1, 'rgba(217,160,63,0.10)');
  ctx.fillStyle = warmth;
  ctx.fillRect(0, 420, 1920, 360);

  // 车灯扫过楼面：一团被横向拉长的暖光跟着车头走
  const k = clamp((t - 0.9) / 5.0, 0, 1);
  const headX = -1650 + 5100 * (0.10 * k * k + 0.90 * k);
  if (k > 0 && k < 1) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const sw = ctx.createLinearGradient(headX - 520, 0, headX + 100, 0);
    sw.addColorStop(0, 'rgba(255,230,180,0)');
    sw.addColorStop(0.78, 'rgba(255,230,180,0.09)');
    sw.addColorStop(1, 'rgba(255,230,180,0)');
    ctx.fillStyle = sw;
    ctx.fillRect(headX - 520, 480, 620, 470);
    ctx.restore();
  }

  const DECK = 780;

  // 桥下街面
  const street = ctx.createLinearGradient(0, DECK + 44, 0, 1080);
  street.addColorStop(0, '#0D1A22');
  street.addColorStop(1, '#1C2E38');
  ctx.fillStyle = street;
  ctx.fillRect(0, DECK + 44, 1920, 1080 - DECK - 44);

  // 街边几团暖光（便利店 / 路灯从桥下漏出来）
  for (let i = 0; i < 3; i++) {
    const lx = 320 + i * 640;
    glow(ctx, lx, 960, 220, 'rgba(246,201,126,0.55)', 0.16);
    glow(ctx, lx + 120, 1050, 90, 'rgba(246,201,126,0.5)', 0.10);
  }

  // 桥墩
  for (let i = 0; i < 6; i++) {
    const x = -80 + i * 390;
    block(ctx, x, DECK + 24, 112, 1080 - DECK - 24, 8, '#0B161D', { stroke: '#050B0F', lw: 5, seed: 730 + i });
    block(ctx, x - 16, DECK + 10, 144, 24, 5, '#0F1E27', { seed: 740 + i });
  }
  // 桥墩间的横撑
  for (const yy of [898, 986]) {
    for (let i = 0; i < 5; i++) {
      const x = -80 + i * 390 + 112;
      line(ctx, x, yy, x + 278, yy, { seed: 745 + i + yy, lw: 6, color: '#0A141A', amp: 1 });
    }
  }
  // 桥底的一条暖反光
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.fillStyle = '#F6C97E';
  ctx.fillRect(0, DECK + 44, 1920, 10);
  ctx.restore();

  // 湿路面、车道线
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.fillStyle = '#9FC3CE';
  ctx.fillRect(0, 976, 1920, 50);
  ctx.restore();
  for (let i = 0; i < 7; i++) block(ctx, 60 + i * 290, 1038, 130, 8, 4, '#42525A', { seed: 810 + i });

  // 桥下驶过的车辆（与列车反向）
  carR2(ctx, 1820 - ((t * 210) % 2500), 1010, -1);
  carR2(ctx, 1080 + ((t * 150 + 700) % 2300), 1050, -1);

  // 桥面
  block(ctx, -40, DECK - 6, 2000, 50, 4, '#223541', { stroke: P.ink, lw: 5, seed: 750 });
  line(ctx, -40, DECK - 8, 1960, DECK - 8, { seed: 751, lw: 3, color: '#3E5A66', amp: 0.7 });

  // 栏杆
  for (let i = 0; i < 18; i++) {
    const x = 20 + i * 112;
    line(ctx, x, DECK - 42, x, DECK - 6, { seed: 760 + i, lw: 3, color: '#2C4551', amp: 0.5 });
  }
  line(ctx, -40, DECK - 42, 1960, DECK - 42, { seed: 780, lw: 2.4, color: '#2C4551', amp: 0.6, parts: 10 });

  // 桥上路灯
  for (let i = 0; i < 3; i++) {
    const x = 220 + i * 620;
    line(ctx, x, DECK - 6, x, DECK - 96, { seed: 790 + i, lw: 4, color: P.ink });
    line(ctx, x, DECK - 96, x + 42, DECK - 96, { seed: 795 + i, lw: 4, color: P.ink });
    block(ctx, x + 30, DECK - 100, 40, 12, 6, P.lamp, { stroke: P.ink, lw: 3, seed: 800 + i });
    glow(ctx, x + 50, DECK - 94, 130, 'rgba(246,201,126,0.55)', 0.32);
  }

  // 末班车
  if (k > 0 && k < 1) {
    // 车后的风线
    ctx.save();
    ctx.globalAlpha = 0.20 * (1 - smooth((k - 0.86) / 0.14));
    for (let i = 0; i < 5; i++) {
      const yy = 790 + i * 16;
      const x0 = headX - 1560 - i * 50;
      line(ctx, x0, yy, x0 - 160, yy, { seed: 900 + i, lw: 2, color: '#B9CBD0', amp: 1 });
    }
    ctx.restore();
    nightTrain(ctx, headX, DECK, 168);
  }

  // 车走以后：桥面留一条暖光，慢慢退掉
  const trail = smooth((t - 5.9) / 0.4) * (1 - smooth((t - 7.3) / 1.1));
  if (trail > 0.01) {
    ctx.save();
    ctx.globalAlpha = 0.16 * trail;
    const g = ctx.createLinearGradient(0, DECK - 140, 0, DECK + 6);
    g.addColorStop(0, 'rgba(246,201,126,0)');
    g.addColorStop(0.6, 'rgba(246,201,126,0.55)');
    g.addColorStop(1, 'rgba(246,201,126,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, DECK - 140, 1920, 146);
    ctx.restore();
  }

  // 余音：桥面上几点往上升的暖光
  const echo = smooth((t - 6.3) / 0.8) * (1 - smooth((t - 8.5) / 0.9));
  if (echo > 0.01) {
    const R = rng(77);
    for (let i = 0; i < 6; i++) {
      const bx = 380 + R() * 1160;
      const ph = R();
      const rise = ((t - 6.3) * 36 * (0.5 + R()) + ph * 120) % 120;
      ctx.globalAlpha = echo * 0.5 * (1 - rise / 120);
      ctx.fillStyle = '#F1D9A8';
      ctx.fillRect(bx + Math.sin(t * 0.8 + i) * 12, DECK - 100 - rise, 3, 3);
    }
    ctx.globalAlpha = 1;
  }

  // 底部的冷雾把桥墩吞掉一半
  const haze = ctx.createLinearGradient(0, 820, 0, 1080);
  haze.addColorStop(0, 'rgba(40,65,79,0)');
  haze.addColorStop(1, 'rgba(28,48,60,0.55)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 820, 1920, 260);

  // 前景：横过画面的几根电线和两盏吊灯（这条街的记号，别处没有）
  const wire = (y0, sag, seed, lw) => {
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const u = i / 16;
      const x = -40 + 2000 * u;
      const y = y0 + Math.sin(Math.PI * u) * sag + Math.sin(u * 9 + seed) * 1.6;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.lineWidth = lw;
    ctx.strokeStyle = '#0A141A';
    ctx.lineCap = 'round';
    ctx.stroke();
  };
  wire(126, 54, 1.2, 4);
  wire(168, 70, 2.7, 3);
  wire(214, 46, 4.1, 2.4);

  // 街边店招的暖光，压在最下沿
  const SR = rng(955);
  for (let i = 0; i < 5; i++) {
    const sx = 90 + SR() * 1740;
    const sy = 1048 + SR() * 20;
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = i % 2 ? '#E3B36A' : '#BFD6DA';
    ctx.fillRect(sx, sy, 26, 7);
    ctx.globalAlpha = 0.10;
    ctx.beginPath(); ctx.arc(sx + 13, sy + 4, 34, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ============================================================
// o-02 车厢：吊环随减速摆，镜头缓慢横移
// ============================================================

export function hangStraps(ctx, t, o = {}) {
  const xs = o.xs ?? [430, 840, 1250, 1660];
  const base = o.y ?? 126;
  const tilt = o.tilt ?? 0;
  xs.forEach((x, i) => {
    const ph = i * 1.7 + 0.6;
    const sw = Math.sin(t * Math.PI * 2 / 2.1 + ph) * 0.05 + tilt;
    ctx.save();
    ctx.translate(x, base);
    ctx.rotate(sw);
    line(ctx, 0, 0, 0, 56, { seed: 910 + i, lw: 5, color: '#5E5345', amp: 0.4 });
    block(ctx, -18, 56, 36, 48, 13, '#E8D5B0', { stroke: P.ink, lw: 4, seed: 915 + i });
    block(ctx, -11, 64, 22, 26, 9, '#CFB891', { seed: 916 + i });
    ctx.restore();
  });
}

// ============================================================
// o-03 站台：一张被风推着走的报纸
// ============================================================

export function blownNewspaper(ctx, t, o = {}) {
  const x0 = o.x0 ?? 700, x1 = o.x1 ?? 1120, y0 = o.y ?? 818;
  const env = smooth((t - 2.6) / 0.5) * (1 - smooth((t - 7.7) / 0.7));
  const k = smooth(clamp((t - 3.0) / 2.9, 0, 1));
  const hop = Math.abs(Math.sin((t - 3.0) * 2.35));
  const x = lerp(x0, x1, easeOut(k)) + Math.sin(t * 1.7) * 14 * env;
  const y = y0 - (8 + 22 * hop) * env;
  const rot = -0.12 + (0.26 * Math.sin((t - 3.0) * 2.0) + 0.05) * env;
  const fl = 0.5 + 0.5 * Math.sin(t * (1.9 + 0.6 * env) + 0.8);

  ctx.save();
  // 影子
  ctx.save();
  ctx.globalAlpha = 0.13 * (0.4 + env * 0.6);
  ctx.fillStyle = P.ink;
  ctx.beginPath(); ctx.ellipse(x + 6, y0 + 30, 72, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  ctx.translate(x, y);
  ctx.rotate(rot);
  block(ctx, -70, -46, 140, 92, 3, '#E7DCC6', { stroke: P.ink, lw: 4, seed: 1160 });
  line(ctx, 0, -44, 0, 44, { seed: 1161, lw: 2, color: '#B9AC93' });
  for (let r = 0; r < 3; r++) {
    ctx.fillStyle = '#A99C84';
    ctx.fillRect(-56, -30 + r * 22, 42, 5);
    ctx.fillRect(12, -30 + r * 22, 48, 5);
  }
  ctx.fillStyle = '#8E8170';
  ctx.fillRect(-56, -42, 38, 7);

  // 被风掀起的一角
  const lf = clamp(env * (0.25 + 0.75 * fl) * 1.4, 0, 1);
  if (lf > 0.02) {
    ctx.save();
    ctx.translate(70, -46);
    ctx.rotate(-0.30 * lf);
    poly(ctx, [[0, 0], [-30 * lf, -30 * lf], [-34 * lf, 3 * lf], [0, 18 * lf]], { fill: '#F2E9D5', stroke: P.ink, lw: 2, seed: 1162 });
    ctx.restore();
  }
  ctx.restore();
}

// ============================================================
// o-04 童年视角：车站地面高度，轨道伸向隧道
// ============================================================

function drawFoot(ctx, x, y, w, h, rot, seed) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  block(ctx, 0, 0, w, h, Math.min(w, h) * 0.46, P.orange, { stroke: P.ink, lw: 8, seed });
  ctx.strokeStyle = P.ink;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = 1; i <= 3; i++) {
    const tx = 14 + (w - 28) * i / 4;
    ctx.beginPath();
    ctx.moveTo(tx, 5);
    ctx.lineTo(tx + 2, h * 0.26);
    ctx.stroke();
  }
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = '#FFF3D6';
  ctx.beginPath();
  ctx.ellipse(w * 0.42, h * 0.32, w * 0.24, h * 0.15, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

export function childhoodEdge(ctx, o = {}) {
  const t = o.t ?? 0;

  // 顶棚
  ctx.fillStyle = '#232A2E';
  ctx.fillRect(0, 0, 1920, 96);
  block(ctx, 0, 96, 1920, 12, 0, '#3A4448', { stroke: P.ink, lw: 4, seed: 1001 });

  // 顶灯：沿纵深一格格缩小
  const lamps = [[250, 250, 26, 1], [760, 170, 22, 0.8], [1140, 110, 18, 0.62], [1390, 60, 14, 0.45]];
  lamps.forEach(([x, w, h, a], i) => {
    line(ctx, x + w / 2, 0, x + w / 2, 30, { seed: 1010 + i, lw: 3, color: P.ink });
    block(ctx, x, 30, w, h, 8, '#EBDDB4', { stroke: P.ink, lw: 3, seed: 1020 + i });
    ctx.save();
    ctx.globalAlpha = 0.18 * a;
    const g = ctx.createLinearGradient(0, 56, 0, 96);
    g.addColorStop(0, 'rgba(246,201,126,0.8)');
    g.addColorStop(1, 'rgba(246,201,126,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 40, 56, w + 80, 40);
    ctx.restore();
  });

  // 墙面瓷砖
  ctx.fillStyle = '#BDB7A3';
  ctx.fillRect(0, 108, 1920, 532);
  for (let r = 0; r < 7; r++) line(ctx, 0, 156 + r * 68, 1920, 156 + r * 68, { seed: 1030 + r, lw: 1.6, color: '#A9A38F', amp: 0.7, parts: 10 });
  const xs = [30, 200, 360, 510, 650, 780, 900, 1010, 1110, 1200, 1280, 1350];
  xs.forEach((x, i) => line(ctx, x, 108, x, 640, { seed: 1040 + i, lw: 1.5, color: '#A9A38F', amp: 0.5 }));
  block(ctx, 0, 560, 1920, 80, 0, '#3F7079', { stroke: P.ink, lw: 4, seed: 1060 });
  line(ctx, 0, 578, 1920, 578, { seed: 1061, lw: 2, color: '#5D8A90' });

  // 海报
  block(ctx, 150, 210, 250, 300, 6, '#F1E5C9', { stroke: P.ink, lw: 6, seed: 1070 });
  ctx.save();
  ctx.beginPath(); ctx.rect(150, 210, 250, 300); ctx.clip();
  poly(ctx, [[170, 470], [260, 300], [330, 470]], { fill: '#C98A6E', stroke: false });
  ctx.fillStyle = '#4E8FA3';
  ctx.fillRect(180, 250, 190, 34);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = '#A99C84';
    ctx.fillRect(180, 330 + i * 30, 150 - i * 20, 8);
  }
  ctx.restore();

  // 隧道口
  block(ctx, 1372, 250, 420, 470, 42, '#7E7C74', { stroke: P.ink, lw: 7, seed: 1080 });
  ctx.save();
  ctx.beginPath(); ctx.rect(1394, 272, 376, 448); ctx.clip();
  ctx.fillStyle = '#0A1116';
  ctx.fillRect(1394, 272, 376, 448);
  const deep = ctx.createLinearGradient(1394, 0, 1770, 0);
  deep.addColorStop(0, 'rgba(30,46,54,0.7)');
  deep.addColorStop(0.45, 'rgba(8,14,18,0.92)');
  deep.addColorStop(1, 'rgba(3,6,8,1)');
  ctx.fillStyle = deep;
  ctx.fillRect(1394, 272, 376, 448);
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = 0.38 - i * 0.08;
    ctx.fillStyle = '#C9B98E';
    ctx.fillRect(1430 + i * 52, 340 - i * 8, 20, 8);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  block(ctx, 1394, 272, 376, 448, 34, null, { stroke: P.ink, lw: 6, seed: 1085 });

  // 站台地面
  ctx.fillStyle = '#6E5C58';
  ctx.fillRect(0, 640, 1920, 440);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 640, 1920, 440); ctx.clip();
  for (let i = -3; i <= 9; i++) line(ctx, 920 + i * 260, 1080, 1520, 720, { seed: 1090 + i, lw: 1.8, color: '#5C4A46', amp: 1.2, parts: 4 });
  for (let i = 0; i < 4; i++) line(ctx, 0, 700 + i * 82, 1920, 700 + i * 82, { seed: 1100 + i, lw: 1.6, color: '#5C4A46', amp: 0.8 });
  ctx.restore();

  // 站台边缘 + 黄线
  const ex0 = 520, ey0 = 1080, ex1 = 1450, ey1 = 716;
  poly(ctx, [[ex0, ey0], [ex1, ey1], [ex1 + 34, ey1 + 2], [ex0 + 124, ey0]], { fill: '#C9A24E', stroke: false });
  line(ctx, ex0, ey0, ex1, ey1, { seed: 1110, lw: 5, color: P.ink });
  line(ctx, ex0 + 124, ey0, ex1 + 34, ey1 + 2, { seed: 1111, lw: 4, color: '#8A6E38' });

  // 轨道坑
  const pit = [[ex0 + 124, ey0], [ex1 + 34, ey1 + 2], [1920, 700], [1920, 1080]];
  poly(ctx, pit, { fill: '#141F26', stroke: P.ink, lw: 4 });

  // 轨道与枕木（裁剪在轨道坑里）
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pit[0][0], pit[0][1]);
  ctx.lineTo(pit[1][0], pit[1][1]);
  ctx.lineTo(pit[2][0], pit[2][1]);
  ctx.lineTo(pit[3][0], pit[3][1]);
  ctx.closePath(); ctx.clip();

  for (let i = 0; i < 13; i++) {
    const q = Math.pow(i / 12, 1.55);
    const y = lerp(1080, 724, q);
    const xa = lerp(760, 1478, q), xb = lerp(1180, 1558, q);
    line(ctx, xa, y, xb, y + (1 - q) * 12, { seed: 1120 + i, lw: lerp(11, 3, q), color: '#4A3E3A', amp: 1 });
  }
  line(ctx, 760, 1080, 1478, 724, { seed: 1140, lw: 12, color: '#8FA6AC' });
  line(ctx, 1180, 1080, 1558, 722, { seed: 1141, lw: 12, color: '#8FA6AC' });
  line(ctx, 760, 1076, 1478, 720, { seed: 1142, lw: 3, color: '#D6E4E6', amp: 0.4 });
  line(ctx, 1180, 1076, 1558, 718, { seed: 1143, lw: 3, color: '#D6E4E6', amp: 0.4 });
  ctx.restore();

  // 隧道深处：慢慢亮起来的一盏车头灯（童年记忆里驶来的车）
  const ap = smooth(clamp((t - 4.2) / 6.4, 0, 1));
  if (ap > 0.01) {
    const gx = lerp(1452, 1512, ap), gy = lerp(600, 700, ap);
    glow(ctx, gx, gy, 28 + 92 * ap, 'rgba(255,236,190,1)', 0.12 + 0.45 * ap);
    ctx.beginPath();
    ctx.arc(gx, gy, 4 + 9 * ap, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF4D2';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = P.ink;
    ctx.stroke();
    ctx.save();
    ctx.globalAlpha = 0.22 * ap;
    line(ctx, 1010, 1010, 1478, 744, { seed: 1150, lw: 3, color: '#FFF0C8', amp: 0.5 });
    line(ctx, 1330, 1030, 1540, 750, { seed: 1151, lw: 2.4, color: '#FFF0C8', amp: 0.5 });
    ctx.restore();
  }

  // 远处的两张小海报 / 站名牌
  block(ctx, 900, 300, 132, 170, 5, '#F1E5C9', { stroke: P.ink, lw: 4, seed: 1075 });
  ctx.fillStyle = '#A99C84';
  for (let i = 0; i < 3; i++) ctx.fillRect(916, 330 + i * 34, 100 - i * 12, 7);
  block(ctx, 1140, 330, 150, 44, 6, '#2F4A54', { stroke: P.ink, lw: 4, seed: 1078 });

  // 前景报纸（最大的一张，几乎贴着镜头）
  ctx.save();
  ctx.translate(238, 946);
  ctx.rotate(-0.16 + 0.02 * Math.sin(t * 1.4));
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = P.ink;
  ctx.beginPath(); ctx.ellipse(26, 26, 292, 58, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  block(ctx, -250, -160, 500, 320, 4, '#E7DCC6', { stroke: P.ink, lw: 6, seed: 1163 });
  line(ctx, 0, -158, 0, 158, { seed: 1164, lw: 3, color: '#B9AC93' });
  for (let r = 0; r < 5; r++) {
    ctx.fillStyle = '#A99C84';
    ctx.fillRect(-215, -110 + r * 48, 170, 9);
    ctx.fillRect(35, -110 + r * 48, 180, 9);
  }
  ctx.fillStyle = '#8E8170';
  ctx.fillRect(-215, -140, 150, 14);
  const flA = 0.5 + 0.5 * Math.sin(t * 1.9 + 0.6);
  const lf = 0.3 + 0.7 * flA;
  ctx.save();
  ctx.translate(250, -160);
  ctx.rotate(-0.16 * lf);
  poly(ctx, [[0, 0], [-80 * lf, -70 * lf], [-92 * lf, 8 * lf], [0, 40 * lf]], { fill: '#F2E9D5', stroke: P.ink, lw: 3, seed: 1165 });
  ctx.restore();
  ctx.restore();

  // 第二张：更远一点，被风推着走
  const k2 = smooth(clamp((t - 2.4) / 5.2, 0, 1));
  ctx.save();
  ctx.translate(760 + 210 * k2, 1006 - 20 * Math.abs(Math.sin((t - 2.4) * 1.9)) * (1 - k2 * 0.5));
  ctx.rotate(0.12 + 0.12 * Math.sin(t * 2.1));
  block(ctx, -110, -70, 220, 140, 4, '#EDE4D0', { stroke: P.ink, lw: 4, seed: 1166 });
  line(ctx, 0, -68, 0, 68, { seed: 1167, lw: 2, color: '#B9AC93' });
  for (let r = 0; r < 3; r++) {
    ctx.fillStyle = '#A99C84';
    ctx.fillRect(-92, -48 + r * 34, 70, 6);
    ctx.fillRect(18, -48 + r * 34, 74, 6);
  }
  ctx.restore();

  // 前景的脚：低机位，脚掌朝向轨道
  const bob = Math.sin(t * 0.95) * 2.5;
  ctx.save();
  ctx.globalAlpha = 0.20;
  ctx.fillStyle = P.ink;
  ctx.beginPath(); ctx.ellipse(900, 1078, 300, 44, -0.05, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  drawFoot(ctx, 690, 996 + bob, 168, 104, -0.06, 1170);
  drawFoot(ctx, 906, 1024 + bob, 176, 108, 0.04, 1175);

  // 地面上的风：几道很淡的横线，从站台深处吹向镜头
  ctx.save();
  ctx.globalAlpha = 0.12;
  for (let i = 0; i < 4; i++) {
    const yy = 830 + i * 54 + Math.sin(t * 1.8 + i) * 5;
    const x0 = ((t * 150 + i * 420) % 2000) - 60;
    line(ctx, x0, yy, x0 + 120, yy + 3, { seed: 1180 + i, lw: 2.2, color: '#D8C9B0', amp: 1 });
  }
  ctx.restore();
}

// ============================================================
// o-05 一扇亮窗：从窗里看见他，再退到整栋楼
// ============================================================

function buildingWindows(ctx, o) {
  const { x, y, w, h, cols, rows, seed, t } = o;
  const R = rng(seed);
  const gapX = (w - 80) / cols;
  const gapY = (h - 100) / rows;
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    const ww = Math.min(120, gapX - 40);
    const wh = Math.min(90, gapY - 30);
    const wx = x + 40 + c * gapX;
    const wy = y + 50 + r * gapY;
    // 主楼里给大窗留出的洞口
    if (o.hero && wx + ww > 1170 && wx < 1410 && wy + wh > 235 && wy < 465) continue;

    const a0 = R(), a1 = R(), a2 = R();
    const lit = a0 < 0.30;
    const offAt = 2.6 + a1 * 8.4;
    const on = lit && t < offAt;
    block(ctx, wx, wy, ww, wh, 5, on ? '#E8B96E' : '#203844', { stroke: P.ink, lw: 3, seed: seed + c * 10 + r });
    if (on) {
      ctx.save();
      ctx.globalAlpha = 0.34;
      ctx.fillStyle = '#FFF0CC';
      ctx.fillRect(wx + 4, wy + 4, ww - 8, wh * 0.34);
      ctx.restore();
      glow(ctx, wx + ww / 2, wy + wh / 2, 62, 'rgba(246,201,126,0.45)', 0.10 + a2 * 0.12);
    } else {
      ctx.save();
      ctx.globalAlpha = 0.09;
      ctx.fillStyle = '#9FC3CE';
      ctx.fillRect(wx + 6, wy + 6, ww - 12, wh * 0.2);
      ctx.restore();
    }
  }
}

function roomWindow(ctx, o) {
  const { x, y, w, h, t } = o;

  // 外框
  block(ctx, x - 10, y - 10, w + 20, h + 20, 8, '#C9B08A', { stroke: P.ink, lw: 6, seed: 1400 });

  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();

  // 室内：暖墙 + 地板
  ctx.fillStyle = '#E8C08A';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#D3A469';
  ctx.fillRect(x, y + h * 0.62, w, h * 0.38);

  // 后墙上的小画
  block(ctx, x + 14, y + 18, 34, 26, 3, '#E8D5B0', { stroke: '#8C6A46', lw: 2, seed: 1401 });

  // 窗帘
  block(ctx, x, y, 20, h, 4, '#EED9B4', { stroke: '#B08A5C', lw: 2, seed: 1402 });
  block(ctx, x + w - 20, y, 20, h, 4, '#EED9B4', { stroke: '#B08A5C', lw: 2, seed: 1403 });

  // 他坐在窗前（先画人，再让桌子挡住下半身）
  const b = breath(t, { seed: 481, period: 2.4, amp: 0.07 });
  clawd(ctx, {
    cx: x + 82, by: y + h * 0.735,
    u: 6.2, color: P.orange, seed: 481,
    eyes: 'normal', look: -0.25, mouth: 'smile',
    bodyDy: b.bodyDy, squash: b.squash,
  });

  // 桌子
  block(ctx, x + 26, y + h * 0.66, 116, 12, 4, '#8C5E45', { stroke: P.ink, lw: 3, seed: 1404 });
  line(ctx, x + 38, y + h * 0.66 + 12, x + 38, y + h, { seed: 1405, lw: 3, color: '#8C5E45' });
  line(ctx, x + 130, y + h * 0.66 + 12, x + 130, y + h, { seed: 1406, lw: 3, color: '#8C5E45' });

  // 台灯
  line(ctx, x + 112, y + h * 0.64, x + 112, y + h * 0.5, { seed: 1407, lw: 3, color: P.ink });
  block(ctx, x + 99, y + h * 0.455, 28, 15, 6, '#F6C97E', { stroke: P.ink, lw: 2, seed: 1408 });
  glow(ctx, x + 113, y + h * 0.5, 48, 'rgba(246,201,126,0.85)', 0.5);

  // 窗棂：横档 + 竖梃，让「一扇窗」一眼读得出来
  block(ctx, x, y + h * 0.27, w, 9, 2, '#8C6A46', { stroke: '#6B4E3A', lw: 2, seed: 1409 });
  block(ctx, x + w * 0.78, y, 9, h, 2, '#8C6A46', { stroke: '#6B4E3A', lw: 2, seed: 1412 });

  // 玻璃反光
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.fillStyle = '#FFF6DC';
  poly(ctx, [[x - 20, y + h], [x + w * 0.45, y - 20], [x + w * 0.62, y - 20], [x + w * 0.1, y + h]], { stroke: false });
  ctx.restore();
  ctx.restore();

  // 窗框内缘与窗台
  block(ctx, x, y, w, h, 4, null, { stroke: '#6B4E3A', lw: 3, seed: 1410 });
  glow(ctx, x + w / 2, y + h / 2, 230, 'rgba(246,201,126,0.55)', 0.18);
  block(ctx, x - 18, y + h + 8, w + 36, 16, 4, '#C9B08A', { stroke: P.ink, lw: 4, seed: 1411 });
}

export function windowCity(ctx, o = {}) {
  const t = o.t ?? 0;

  nightSky(ctx, {});
  stars(ctx, { n: 40, h: 460, seed: 55 });
  moon(ctx, 420, 150, 44, P.sky);

  cityLine(ctx, { y: 600, seed: 61, minH: 120, maxH: 300, color: '#0F1D27', scroll: 6 });
  cityLine(ctx, { y: 690, seed: 72, minH: 70, maxH: 190, color: '#132733', scroll: 10 });

  // 远处城市的冷雾（压在城市与近楼之间）
  const haze = ctx.createLinearGradient(0, 690, 0, 1080);
  haze.addColorStop(0, 'rgba(40,65,79,0)');
  haze.addColorStop(1, 'rgba(20,34,43,0.72)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 690, 1920, 390);

  // 左侧邻楼
  block(ctx, 560, 300, 340, 820, 8, '#172B36', { stroke: P.ink, lw: 6, seed: 1200 });
  buildingWindows(ctx, { x: 560, y: 300, w: 340, h: 820, cols: 3, rows: 6, seed: 1210, t });

  // 主楼
  block(ctx, 940, 120, 920, 1000, 10, '#1A2E3A', { stroke: P.ink, lw: 7, seed: 1230 });
  for (let r = 0; r < 7; r++) line(ctx, 948, 168 + r * 135, 1852, 168 + r * 135, { seed: 1240 + r, lw: 2.5, color: '#12232C', amp: 0.8 });

  // 楼顶：檐口、水箱、天线
  block(ctx, 960, 86, 880, 40, 6, '#142733', { stroke: P.ink, lw: 5, seed: 1250 });
  block(ctx, 1010, 34, 130, 58, 8, '#1B303C', { stroke: P.ink, lw: 5, seed: 1251 });
  line(ctx, 1090, 34, 1090, 4, { seed: 1252, lw: 4, color: P.ink });
  line(ctx, 1620, 86, 1620, 20, { seed: 1253, lw: 3, color: P.ink });
  line(ctx, 1600, 40, 1640, 40, { seed: 1254, lw: 2, color: P.ink });

  // 窗与那扇亮窗
  buildingWindows(ctx, { x: 940, y: 120, w: 920, h: 960, cols: 5, rows: 7, seed: 1260, t, hero: true });
  roomWindow(ctx, { x: 1190, y: 258, w: 190, h: 182, t });

  // 右侧邻楼
  block(ctx, 1880, 250, 120, 880, 6, '#162A35', { stroke: P.ink, lw: 5, seed: 1300 });

  // 城市低处的零星街灯
  const R = rng(913);
  for (let i = 0; i < 5; i++) {
    const x = 60 + R() * 460;
    const y = 900 + R() * 120;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#E3B36A';
    ctx.fillRect(x, y, 10, 4);
    ctx.globalAlpha = 0.10;
    ctx.beginPath(); ctx.arc(x + 5, y + 2, 24, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ============================================================
// o-06a 制作名单：暗色斜切框，逐行淡入
// ============================================================

const CREDITS_R2 = [
  { text: '角色：Clawd on Desk 1.2.0 · rullerzhou-afk · AGPL-3.0-only', size: 34, at: 0.7, y: 398 },
  { text: '歌曲与歌词：法老 / 杨秋儒《我想 part2》', size: 40, at: 2.9, y: 484 },
  { text: '字体：Noto Sans SC · OFL', size: 32, at: 4.9, y: 566 },
  { text: '本片为个人练习作品，不上传版权素材', size: 28, at: 6.9, y: 662, note: true },
];

export function creditPanelR2(ctx, t) {
  const inA = smooth(t / 0.8);
  const outA = 1 - smooth((t - 12.0) / 0.85);
  const alpha = inA * outA;
  if (alpha <= 0.002) return;

  const cx = 960;
  const topY = 300, botY = 748;
  const slant = 58;

  let maxW = 0;
  for (const l of CREDITS_R2) {
    ctx.font = `500 ${l.size}px NotoSansSC`;
    maxW = Math.max(maxW, ctx.measureText(l.text).width);
  }
  const half = Math.min((maxW + 170) / 2, 700);
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

  // 内侧细高光
  ctx.beginPath();
  ctx.moveTo(cx - half + slant + 6, topY + 6);
  ctx.lineTo(cx + half - 6, topY + 6);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(247,239,221,0.16)';
  ctx.stroke();

  // 分隔线
  ctx.beginPath();
  ctx.moveTo(cx - 250, 620);
  ctx.lineTo(cx + 250, 620);
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = 'rgba(232,210,162,0.30)';
  ctx.stroke();

  // 一行行浮上来
  CREDITS_R2.forEach(l => {
    const k = smooth((t - l.at) / 0.7);
    if (k <= 0) return;
    ctx.globalAlpha = alpha * k;
    ctx.font = `500 ${l.size}px NotoSansSC`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = l.note ? 'rgba(241,217,168,0.72)' : P.subText;
    ctx.fillText(l.text, cx, l.y + (1 - k) * 14, (half - 45) * 2);
  });

  ctx.restore();
}

export const CREDIT_LINES_R2 = CREDITS_R2.map(l => l.text);