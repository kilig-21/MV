// 尾奏 o-04 专用场景：低机位站台。
// 镜头不再贴在地面上只看脚，而是把机位压到角色身高一半左右，
// 让人完整站在站台线旁：轨道斜穿画面右下去隧道，背后墙面高处有一扇会亮起来的窗。
// 只被 shots/o-04.js 引用；不改动任何共享模块。
import { P } from './palette.js';
import { block, line, poly, rng, glow, clamp, lerp, smooth, easeOut } from './ink.js';

const W = 1920, H = 1080;
const VPX = 1700, VPY = 740;          // 站台边缘的消失点（隧道口）
const EDGE_A = [520, 1080];           // 近端站台边缘
const EDGE_B = [VPX, VPY];
const WALL_BASE = 740;

const WIN = { x: 1090, y: 248, w: 126, h: 152 };
const WIN_ON = 5.15;                  // 窗亮起来的时刻（镜头内秒）

const edgeY = x => EDGE_A[1] + (x - EDGE_A[0]) * (EDGE_B[1] - EDGE_A[1]) / (EDGE_B[0] - EDGE_A[0]);

// 站台边缘的黄色警示带：沿边缘线往站台内侧（左上）平移 22px
function safetyBand(ctx) {
  const dx = EDGE_B[0] - EDGE_A[0], dy = EDGE_B[1] - EDGE_A[1];
  const len = Math.hypot(dx, dy);
  const nx = -dy / len, ny = dx / len;          // 指向右下（轨道侧）
  const off = 22;
  const inner = [[EDGE_A[0] - nx * off, EDGE_A[1] - ny * off],
                 [EDGE_B[0] - nx * off, EDGE_B[1] - ny * off]];
  poly(ctx, [EDGE_A, EDGE_B, inner[1], inner[0]], { fill: '#C9A24E', stroke: false });
  line(ctx, EDGE_A[0], EDGE_A[1], EDGE_B[0], EDGE_B[1], { seed: 2110, lw: 4, color: P.ink });
  line(ctx, inner[0][0], inner[0][1], inner[1][0], inner[1][1], { seed: 2111, lw: 2.4, color: '#8A6E38' });
}

// 墙上的高窗：先暗着，5.15 s 亮起；亮起后向站台地面漏一片暖光
function highWindow(ctx, t) {
  const on = smooth((t - WIN_ON) / 0.34);
  const bloom = smooth((t - 6.0) / 4.6);        // 亮起来以后慢慢再暖一点，最后几秒不僵住
  const { x, y, w, h } = WIN;

  // 墙上的光晕
  if (on > 0.005) {
    glow(ctx, x + w / 2, y + h / 2, 190 + 70 * on + 40 * bloom, 'rgba(246,201,126,0.9)', 0.10 + 0.20 * on + 0.07 * bloom);
    ctx.save();
    ctx.globalAlpha = (0.10 + 0.04 * bloom) * on;
    const pool = ctx.createRadialGradient(x + w / 2, y + h / 2, 20, x + w / 2, y + h / 2, 360);
    pool.addColorStop(0, 'rgba(246,201,126,0.9)');
    pool.addColorStop(1, 'rgba(246,201,126,0)');
    ctx.fillStyle = pool;
    ctx.fillRect(x - 320, y - 300, w + 640, h + 600);
    ctx.restore();
  }

  // 外框与窗台
  block(ctx, x - 9, y - 9, w + 18, h + 18, 7, '#C9B08A', { stroke: P.ink, lw: 6, seed: 2120 });
  block(ctx, x - 16, y + h + 6, w + 32, 13, 4, '#C9B08A', { stroke: P.ink, lw: 4, seed: 2121 });

  // 玻璃：暗的时候是冷色反光，亮的时候是暖光
  ctx.fillStyle = '#1E3440';
  ctx.fillRect(x, y, w, h);
  if (on > 0.005) {
    ctx.save();
    ctx.globalAlpha = on;
    ctx.fillStyle = '#F0C57E';
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 0.55 * on;
    ctx.fillStyle = '#FFF0CC';
    ctx.fillRect(x + 4, y + 4, w - 8, h * 0.32);
    ctx.restore();
  } else {
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#9FC3CE';
    ctx.fillRect(x + 6, y + 6, w - 12, h * 0.18);
    ctx.restore();
  }

  // 夜里一直没关的半边窗帘
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#EED9B4';
  ctx.fillRect(x + 3, y + 3, 14, h - 6);
  ctx.restore();

  // 窗棂
  block(ctx, x + w * 0.63, y, 6, h, 1, '#8C6A46', { seed: 2122 });
  block(ctx, x, y + h * 0.44, w, 6, 1, '#8C6A46', { seed: 2123 });
  block(ctx, x, y, w, h, 3, null, { stroke: '#6B4E3A', lw: 3, seed: 2124 });

  // 亮起来以后，窗台上的暖光
  if (on > 0.005) glow(ctx, x + w / 2, y + h + 4, 128, 'rgba(246,201,126,0.9)', 0.34 * on);
  return on;
}

// 从窗口落到站台地面的一片暖光
function windowSpill(ctx, on) {
  if (on <= 0.005) return;
  ctx.save();
  ctx.globalAlpha = 0.09 * on;
  ctx.beginPath();
  ctx.moveTo(WIN.x + 8, WALL_BASE);
  ctx.lineTo(WIN.x + WIN.w + 40, WALL_BASE);
  ctx.lineTo(WIN.x + WIN.w + 250, 1042);
  ctx.lineTo(WIN.x - 190, 1010);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, WALL_BASE, 0, 1040);
  g.addColorStop(0, 'rgba(246,201,126,0.95)');
  g.addColorStop(1, 'rgba(246,201,126,0)');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}

// 隧道里的车尾灯：o-03 的车刚走，这里只留一小段余灯
function tailLight(ctx, t) {
  const k = clamp(t / 2.3, 0, 1);
  const a = 1 - smooth(k);
  if (a <= 0.01) return;
  const x = lerp(1568, 1632, k), y = lerp(688, 704, k);
  const s = lerp(1, 0.55, k);
  ctx.save();
  ctx.globalAlpha = a;
  block(ctx, x - 26 * s, y - 34 * s, 52 * s, 40 * s, 7 * s, '#16262F', { stroke: P.ink, lw: 2.4, seed: 2130 });
  for (const dx of [-17, 17]) {
    glow(ctx, x + dx * s, y + 2 * s, 22 * s, 'rgba(224,86,110,0.9)', 0.5);
    ctx.beginPath();
    ctx.arc(x + dx * s, y + 2 * s, 3.2 * s, 0, Math.PI * 2);
    ctx.fillStyle = '#E0566E'; ctx.fill();
  }
  ctx.restore();
}

/**
 * 低机位站台背景。
 * o: { t }
 * 返回 { windowOn }，给镜头决定角色脸上的补光。
 */
export function lowPlatform(ctx, o = {}) {
  const t = o.t ?? 0;

  // ---- 墙面（站台背后的同一面墙）----
  ctx.fillStyle = '#BDB7A3';
  ctx.fillRect(0, 96, W, WALL_BASE - 96);
  for (let r = 0; r < 10; r++) line(ctx, 0, 130 + r * 62, W, 130 + r * 62, { seed: 2100 + r, lw: 1.6, color: '#A9A38F', amp: 0.7, parts: 10 });
  for (let c = 0; c < 14; c++) line(ctx, c * 148, 96, c * 148, WALL_BASE, { seed: 2140 + c, lw: 1.5, color: '#A9A38F', amp: 0.5 });

  // 下部蓝绿护墙
  block(ctx, 0, 612, W, WALL_BASE - 612, 0, '#3F7079', { stroke: P.ink, lw: 4, seed: 2160 });
  line(ctx, 0, 630, W, 630, { seed: 2161, lw: 2, color: '#5D8A90' });
  line(ctx, 0, WALL_BASE, W, WALL_BASE, { seed: 2162, lw: 4, color: P.ink });

  // 海报（左后方，不抢主体）
  block(ctx, 252, 232, 218, 306, 6, '#F1E5C9', { stroke: P.ink, lw: 6, seed: 2170 });
  ctx.save();
  ctx.beginPath(); ctx.rect(252, 232, 218, 306); ctx.clip();
  poly(ctx, [[270, 506], [352, 330], [438, 506]], { fill: '#C98A6E', stroke: false });
  ctx.fillStyle = '#4E8FA3';
  ctx.fillRect(278, 268, 166, 30);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = '#A99C84';
    ctx.fillRect(278, 352 + i * 30, 132 - i * 18, 8);
  }
  ctx.restore();

  // 站名牌（不写站名）
  block(ctx, 770, 196, 224, 62, 8, '#2F4A54', { stroke: P.ink, lw: 5, seed: 2175 });
  for (let i = 0; i < 3; i++) block(ctx, 800 + i * 62, 216, 44, 18, 5, '#9FB4B8', { seed: 2176 + i });

  // 那扇窗
  const windowOn = highWindow(ctx, t);

  // ---- 隧道口 ----
  block(ctx, 1440, 250, 480, 490, 44, '#7E7C74', { stroke: P.ink, lw: 7, seed: 2180 });
  ctx.save();
  ctx.beginPath(); ctx.rect(1462, 268, 436, 452); ctx.clip();
  ctx.fillStyle = '#0A1116';
  ctx.fillRect(1462, 268, 436, 452);
  const deep = ctx.createLinearGradient(1462, 0, 1920, 0);
  deep.addColorStop(0, 'rgba(34,54,64,0.72)');
  deep.addColorStop(0.46, 'rgba(8,14,18,0.92)');
  deep.addColorStop(1, 'rgba(3,6,8,1)');
  ctx.fillStyle = deep;
  ctx.fillRect(1462, 268, 436, 452);
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = 0.36 - i * 0.08;
    ctx.fillStyle = '#C9B98E';
    ctx.fillRect(1498 + i * 54, 330 - i * 8, 20, 8);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  block(ctx, 1462, 268, 436, 452, 34, null, { stroke: P.ink, lw: 5, seed: 2185 });
  // 隧道壁上的红色信号灯
  ctx.beginPath(); ctx.arc(1488, 312, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#C0564E'; ctx.fill();
  ctx.lineWidth = 2.4; ctx.strokeStyle = P.ink; ctx.stroke();
  tailLight(ctx, t);

  // ---- 顶棚 ----
  ctx.fillStyle = '#232A2E';
  ctx.fillRect(0, 0, W, 96);
  block(ctx, 0, 96, W, 12, 0, '#3A4448', { stroke: P.ink, lw: 4, seed: 2190 });

  // 吊灯：近的一支大、远的一支小
  for (const L of [[250, 74, 250, 22], [930, 66, 176, 17]]) {
    const [x, y, w, h] = L;
    line(ctx, x + w / 2, 0, x + w / 2, y, { seed: 2195 + x, lw: 3, color: P.ink });
    block(ctx, x, y, w, h, 8, '#EBDDB4', { stroke: P.ink, lw: 3, seed: 2200 + x });
    glow(ctx, x + w / 2, y + h / 2, w * 1.5, 'rgba(246,201,126,0.55)', 0.16);
  }

  // ---- 站台地面 ----
  const floorPts = [[0, WALL_BASE], [VPX, VPY], [EDGE_A[0], EDGE_A[1]], [0, 1080]];
  poly(ctx, floorPts, { fill: '#6E5C58', stroke: false });
  ctx.save();
  ctx.beginPath();
  floorPts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath(); ctx.clip();
  for (let i = -2; i <= 8; i++) line(ctx, VPX, VPY, 500 + i * 210, 1080, { seed: 2210 + i, lw: 1.8, color: '#5C4A46', amp: 1.1, parts: 5 });
  for (let r = 0; r < 3; r++) line(ctx, 0, 790 + r * 96, 1500, 790 + r * 96 - r * 30, { seed: 2220 + r, lw: 1.5, color: '#5C4A46', amp: 0.8 });
  ctx.restore();

  // ---- 轨道坑 ----
  const pit = [[EDGE_A[0], EDGE_A[1]], [VPX, VPY], [W, VPY], [W, 1080]];
  poly(ctx, pit, { fill: '#141F26', stroke: false });
  ctx.save();
  ctx.beginPath();
  pit.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath(); ctx.clip();

  // 枕木与两条钢轨，近大远小
  for (let i = 0; i < 14; i++) {
    const q = Math.pow(i / 13, 1.55);
    const y = lerp(1080, 746, q);
    const xa = lerp(700, 1660, q), xb = lerp(1040, 1712, q);
    line(ctx, xa, y, xb, y + (1 - q) * 10, { seed: 2230 + i, lw: lerp(13, 3, q), color: '#4A3E3A', amp: 1 });
  }
  line(ctx, 700, 1080, 1660, 743, { seed: 2250, lw: 12, color: '#8FA6AC' });
  line(ctx, 1040, 1080, 1712, 743, { seed: 2251, lw: 12, color: '#8FA6AC' });
  line(ctx, 700, 1076, 1660, 739, { seed: 2252, lw: 3, color: '#D6E4E6', amp: 0.4 });
  line(ctx, 1040, 1076, 1712, 739, { seed: 2253, lw: 3, color: '#D6E4E6', amp: 0.4 });
  ctx.restore();
  poly(ctx, [EDGE_A, EDGE_B, [EDGE_B[0], EDGE_B[1] + 14], [EDGE_A[0] - 6, EDGE_A[1]]], { fill: '#3A2F2C', stroke: false });
  safetyBand(ctx);

  // 窗光落到地面
  windowSpill(ctx, windowOn);

  // ---- 尾声的浮尘 ----
  if (windowOn > 0.02) {
    const R = rng(2244);
    for (let i = 0; i < 9; i++) {
      const bx = 1010 + R() * 330;
      const rise = ((t * 9 * (0.4 + R()) + R() * 260) % 300);
      ctx.globalAlpha = windowOn * 0.30 * (1 - rise / 300);
      ctx.fillStyle = '#F1D9A8';
      ctx.fillRect(bx + Math.sin(t * 0.7 + i) * 9, 760 - rise, 3, 3);
    }
    ctx.globalAlpha = 1;
  }

  // 车刚走时的一点风线
  const wind = 1 - smooth((t - 0.4) / 2.4);
  if (wind > 0.02) {
    ctx.save();
    ctx.globalAlpha = 0.12 * wind;
    for (let i = 0; i < 4; i++) {
      const yy = 470 + i * 84 + Math.sin(t * 2.2 + i) * 5;
      const x0 = 1760 - ((t * 230 + i * 180) % 1500);
      line(ctx, x0, yy, x0 - 100, yy - 3, { seed: 2260 + i, lw: 2, color: '#C9D8DC', amp: 1 });
    }
    ctx.restore();
  }

  return { windowOn };
}

// 前景报纸：被车风推着从画面左下角滑过去，最后停在站台线内侧。
// 只占左下很小一块（约 2% 画面），不挡角色。
export function slidingNewspaper(ctx, t) {
  const start = 1.05, end = 7.1;
  const k = smooth(clamp((t - start) / (end - start), 0, 1));
  const e = easeOut(k);
  const x = lerp(-150, 400, e);
  const y = lerp(1038, 1002, e) - Math.abs(Math.sin((t - start) * 2.15)) * 16 * (1 - k * 0.55);
  const rot = -0.13 + 0.07 * Math.sin(t * 1.55 + 0.4);
  const flap = 0.32 + 0.68 * Math.abs(Math.sin(t * 1.9 + 0.7));
  const sc = 0.86 + 0.14 * k;
  if (x < -140) return;

  ctx.save();
  // 影子
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = P.ink;
  ctx.beginPath();
  ctx.ellipse(x + 14, y + 56, 128 * sc, 20 * sc, rot, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(sc, sc);

  block(ctx, -118, -74, 236, 148, 4, '#E7DCC6', { stroke: P.ink, lw: 5, seed: 2270 });
  line(ctx, 3, -72, 3, 72, { seed: 2271, lw: 2.6, color: '#B9AC93' });
  for (let r = 0; r < 4; r++) {
    ctx.fillStyle = '#A99C84';
    ctx.fillRect(-100, -54 + r * 30, 84, 6);
    ctx.fillRect(24, -54 + r * 30, 82, 6);
  }
  ctx.fillStyle = '#8E8170';
  ctx.fillRect(-100, -68, 72, 9);

  // 被风掀起的一角
  ctx.save();
  ctx.translate(118, -74);
  ctx.rotate(-0.42 * flap);
  poly(ctx, [[0, 0], [-46 * flap, -40 * flap], [-52 * flap, 6 * flap], [0, 24 * flap]], { fill: '#F2E9D5', stroke: P.ink, lw: 2.4, seed: 2272 });
  ctx.restore();
  ctx.restore();
}