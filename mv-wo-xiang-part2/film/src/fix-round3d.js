// 第三轮修复 D（verse3）共用的新画面层 —— 只被 v3-11 / v3-12 引用。
// 评审 B：「两镜是同一张城市图，上半 55–60% 是纯夜空，主角只占画宽 7.5%」。
// 这里换成屋顶机位：天空只留画高 35%，城市压到中景，近景屋顶（女儿墙＋水箱＋天线）
// 占左下，主角站近景屋脊、x=35%、占画高 15%。
// 共享场景（scenes-verse3.js）一个字没动，全部是新画的层。
import { P } from './palette.js';
import { block, line, rng, clamp, lerp, smooth, glow } from './ink.js';
import { moon } from './scenes.js';
import { bird } from './scenes-verse3a.js';
import { carLights } from './detail-r2.js';

export const SKY_H = 378;      // 天空只占画高 35%
export const ROOF_Y = 800;     // 近景屋脊（角色脚底所在）
export const HERO_X = 672;     // 主角 x = 35%
export const HERO_U = 18;      // 9u = 162px = 画高 15%
export const HERO_BY = ROOF_Y;

// ---------------- 天：只到画高 35% ----------------
function skyLow(ctx, o = {}) {
  // 兜底夜色：v3-12 旋转时四角也不能露底
  ctx.fillStyle = '#081119';
  ctx.fillRect(-760, -760, 3440, 2600);

  const g = ctx.createLinearGradient(0, -120, 0, SKY_H + 26);
  g.addColorStop(0, '#0A1622');
  g.addColorStop(0.56, '#152C3C');
  g.addColorStop(1, '#2C4A59');
  ctx.fillStyle = g;
  ctx.fillRect(-760, -760, 3440, SKY_H + 786);

  // 地平线以下先铺城市暗底：旋转时露出的都是暗块，不是天
  ctx.fillStyle = '#0F222C';
  ctx.fillRect(-760, SKY_H + 22, 3440, 1600);

  // 星：只长在天空那一条里
  const R = rng(o.seed ?? 141);
  for (let i = 0; i < 34; i++) {
    const x = R() * 2260 - 170, y = R() * (SKY_H - 132) + 10;
    const s = R() < 0.82 ? 2 : 3;
    ctx.globalAlpha = 0.20 + R() * 0.40;
    ctx.fillStyle = R() < 0.25 ? P.lamp : P.cream;
    ctx.fillRect(x, y, s, s);
  }
  ctx.globalAlpha = 1;

  // 地平线上的城市光雾：把楼底和天分开
  const hz = ctx.createLinearGradient(0, SKY_H - 170, 0, SKY_H + 130);
  hz.addColorStop(0, 'rgba(246,201,126,0)');
  hz.addColorStop(0.52, 'rgba(232,190,126,0.11)');
  hz.addColorStop(1, 'rgba(150,172,178,0.06)');
  ctx.fillStyle = hz;
  ctx.fillRect(-760, SKY_H - 170, 3440, 300);
}

// ---------------- 一层楼群（窗和楼同一套随机，窗不会离体） ----------------
function skyline(ctx, o = {}) {
  const base = o.base ?? 700;
  const seed = o.seed ?? 143;
  const minH = o.minH ?? 120, maxH = o.maxH ?? 280;
  const color = o.color || '#122832', color2 = o.color2 || color;
  const win = o.win || '#E3B36A';
  const litP = o.litP ?? 0.28;
  const t = o.t ?? 0, from = o.from ?? 0, to = o.to ?? 0.6;
  const R = rng(seed);
  const out = [];
  let x = -200;
  while (x < 2200) {
    const w = 96 + R() * 176;
    const h = minH + R() * (maxH - minH);
    const top = base - h;
    ctx.fillStyle = R() < 0.5 ? color : color2;
    ctx.fillRect(x, top, w, h + 6);
    // 楼顶一条冷边
    ctx.save();
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = '#2A3D48';
    ctx.fillRect(x, top, w, 2);
    ctx.restore();

    const cols = Math.max(1, Math.floor(w / 54));
    const rows = Math.max(1, Math.floor(h / 56));
    const wx0 = x + 14 + Math.max(0, (w - cols * 54)) * 0.32;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const on = R() <= litP;
        const jit = R();
        if (!on) continue;
        const wy = top + 18 + r * 56;
        if (wy > base - 18) continue;
        // 底层先亮、上层后亮
        const layer = (rows - 1 - r) / Math.max(1, rows - 1);
        const delay = from + layer * (to - from) * 0.8 + jit * 0.2 * (to - from);
        const k = smooth(clamp((t - delay) / 0.26, 0, 1));
        if (k <= 0) continue;
        ctx.save();
        ctx.globalAlpha = 0.18 + 0.62 * k * (0.55 + 0.45 * jit);
        ctx.fillStyle = jit < 0.16 ? P.lamp : win;
        ctx.fillRect(wx0 + c * 54, wy, 11, 14);
        ctx.restore();
      }
    }
    out.push({ x, w, top, h });
    x += w + (o.gap ? o.gap[0] + R() * (o.gap[1] - o.gap[0]) : 12 + R() * 28);
  }
  return out;
}

// ---------------- 夹在中景楼群和近景屋顶之间的那条街 ----------------
function streetStrip(ctx, t) {
  const y = 762;
  ctx.fillStyle = '#16272F';
  ctx.fillRect(-520, y - 2, 2960, ROOF_Y - y + 12);
  // 很远的街灯：一排暖点
  for (let i = 0; i < 13; i++) {
    const x = -80 + i * 176;
    ctx.save();
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = P.lamp;
    ctx.beginPath();
    ctx.arc(x, y + 24, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // 更远处的车灯在流动
  carLights(ctx, { t, n: 12, y0: y + 10, y1: y + 28, seed: 2507 });
}

// ---------------- 近景屋顶：女儿墙＋水箱＋天线 ----------------
export function roofDeck(ctx, o = {}) {
  const ridge = o.ridge ?? ROOF_Y;
  const dx = o.dx ?? 0;
  const t = o.t ?? 0;
  ctx.save();
  ctx.translate(dx, 0);

  // 屋面：一整块，盖住画框底部
  ctx.fillStyle = '#0A141B';
  ctx.fillRect(-620, ridge, 3160, 1100);
  // 城市的光落在屋脊下方：屋面不是一块死黑
  const spill = ctx.createLinearGradient(0, ridge, 0, ridge + 96);
  spill.addColorStop(0, 'rgba(246,201,126,0.13)');
  spill.addColorStop(1, 'rgba(246,201,126,0)');
  ctx.fillStyle = spill;
  ctx.fillRect(-620, ridge, 3160, 96);
  // 屋脊的冷光边
  line(ctx, -620, ridge - 2, 2540, ridge - 2, { seed: 7210, lw: 3, color: '#2E4450', amp: 0.6, parts: 9 });
  // 屋面上的瓦缝（很淡，横移时能读出行程）
  for (let i = 0; i < 6; i++) {
    line(ctx, -420 + i * 460, ridge + 30, -120 + i * 460, 1080, { seed: 7215 + i, lw: 2, color: '#152932', amp: 1.2, parts: 3 });
  }

  // ---- 左下：女儿墙 ----
  const ptop = 686;
  block(ctx, -90, ptop, 650, ridge - ptop + 10, 3, '#0C1A22');
  block(ctx, -102, ptop - 20, 674, 24, 5, '#112530');
  line(ctx, -102, ptop - 20, 572, ptop - 20, { seed: 7211, lw: 2.5, color: '#37525F', amp: 0.6 });
  line(ctx, -70, ptop + 42, 548, ptop + 42, { seed: 7212, lw: 2, color: '#17303C', amp: 1.1 });
  line(ctx, -70, ptop + 80, 548, ptop + 80, { seed: 7213, lw: 2, color: '#17303C', amp: 1.1 });

  // ---- 水箱 ----
  const wx = 84, ww = 192, wh = 104;
  const wtop = ptop - 20 - wh;
  for (const lx of [wx + 28, wx + ww - 28]) {
    line(ctx, lx, ptop - 12, lx, wtop + wh - 4, { seed: 7220 + Math.round(lx), lw: 5, color: '#081218' });
  }
  block(ctx, wx, wtop, ww, wh, 10, '#0D1D26', { stroke: '#081218', lw: 3, seed: 7223 });
  block(ctx, wx + 12, wtop - 16, ww - 24, 18, 6, '#102530', { stroke: '#081218', lw: 3, seed: 7224 });
  line(ctx, wx + ww * 0.5, wtop + 10, wx + ww * 0.5, wtop + wh - 10, { seed: 7225, lw: 2, color: '#173440' });
  // 水箱上的一点冷反光
  line(ctx, wx + 16, wtop + 16, wx + ww - 22, wtop + 16, { seed: 7226, lw: 2, color: '#1B3A47', amp: 0.5 });

  // ---- 天线 ----
  const ax = 452, atop = 356;
  line(ctx, ax, ptop - 12, ax, atop, { seed: 7227, lw: 4, color: '#08101A' });
  for (let i = 0; i < 4; i++) {
    const y = atop + 46 + i * 52;
    const w = 46 - i * 7;
    line(ctx, ax - w, y, ax + w, y, { seed: 7230 + i, lw: 3, color: '#08101A' });
  }
  line(ctx, ax - 164, ptop + 4, ax - 6, atop + 158, { seed: 7235, lw: 1.6, color: '#0A141E' });
  // 顶端的红色航空灯：慢慢闪
  const pulse = 0.5 + 0.5 * Math.sin(t * 1.9);
  ctx.save();
  ctx.globalAlpha = 0.5 + 0.5 * pulse;
  ctx.beginPath();
  ctx.arc(ax, atop - 4, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#E0566E';
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

// ---------------- 屋顶机位的一整座城 ----------------
export function roofCity(ctx, o = {}) {
  const t = o.t ?? 0;
  const seed = o.seed ?? 143;

  skyLow(ctx, { seed });

  if (o.moon) {
    const [mx, my, mr] = o.moon;
    moon(ctx, mx, my, mr, '#152C3C');
  }

  // 远层楼群：基线 660，楼顶 330–490（几栋高的会戳进天空，天际线才有起伏）
  skyline(ctx, {
    base: 660, seed: seed + 11, minH: 170, maxH: 330,
    color: '#122A36', color2: '#153342', litP: 0.26, gap: [10, 34],
    t, from: 0.06, to: 0.72,
  });

  // 远层与中层之间的一层薄雾：两层楼群才分得开
  const fog = ctx.createLinearGradient(0, 470, 0, 700);
  fog.addColorStop(0, 'rgba(140,172,186,0)');
  fog.addColorStop(0.5, 'rgba(140,172,186,0.10)');
  fog.addColorStop(1, 'rgba(120,152,168,0)');
  ctx.fillStyle = fog;
  ctx.fillRect(-600, 470, 3120, 230);

  // 中层楼群：基线 762，更暗更近，楼与楼之间留出缝
  skyline(ctx, {
    base: 762, seed: seed + 23, minH: 70, maxH: 172,
    color: '#0A1A22', color2: '#0C1E27', litP: 0.34, gap: [30, 78],
    t, from: 0.0, to: 0.58,
  });

  streetStrip(ctx, t);

  if (o.deck !== false) roofDeck(ctx, { t, dx: o.deckDx ?? 0 });
  return { ridge: ROOF_Y };
}

// ---------------- 空天里掠过的鸟（3–4 只，从左到右） ----------------
const FLIGHT = [
  { x0: -40, y0: 196, s: 30, sp: 318, ph: 0.0 },
  { x0: -148, y0: 248, s: 24, sp: 312, ph: 1.15 },
  { x0: 118, y0: 132, s: 26, sp: 328, ph: 2.2 },
  { x0: -214, y0: 288, s: 21, sp: 334, ph: 3.35 },
];

// tb：从 v3-11 开场算起的秒数（两镜共用一条轨迹，接得上）
export function crossingBirds(ctx, tb, o = {}) {
  const n = o.n ?? FLIGHT.length;
  for (let i = 0; i < n; i++) {
    const b = FLIGHT[i];
    const x = b.x0 + b.sp * tb;
    if (x < -300 || x > 2240) continue;
    const y = b.y0 + Math.sin(tb * 0.8 + b.ph) * 7;
    const flap = 0.5 + 0.5 * Math.sin(tb * 6.6 + b.ph * 2.1);
    bird(ctx, x, y, b.s, flap, '#070E16');
  }
}