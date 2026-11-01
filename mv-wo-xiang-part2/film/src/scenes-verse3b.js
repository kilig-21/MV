// 第三段主歌后半（v3-11 ~ v3-19）叠加层：
// 只做已有场景之上的「窗灯 / 屋顶 / 粉笔 / 雨 / 声波」，不重画主舞台。
import { P } from './palette.js';
import { block, line, poly, rng, glow, clamp, smooth, lerp } from './ink.js';
import { cityLine, floorPlane } from './scenes.js';
import { clawd } from './character.js';

// ---------------- 城市窗灯：一层层亮 ----------------
// t 是镜内秒；from/to 是「最下面一层」到「最上面一层」的亮起时间。
// 窗按「一栋楼」成组排布，避免整齐的点阵感。
export function cityLightsOn(ctx, t, o = {}) {
  const horizon = o.horizon ?? 900;
  const from = o.from ?? 0, to = o.to ?? 0.6;
  const R = rng(o.seed ?? 3100);
  const warm = o.color || '#E3B36A';
  let bx = -170, bi = 0;
  while (bx < 2120) {
    const bw = 110 + R() * 190;
    const bh = 150 + R() * 280;
    const top = horizon - bh;
    const cols = Math.max(1, Math.floor(bw / 58));
    const rows = Math.max(2, Math.floor(bh / 62));
    const litP = 0.40 + R() * 0.28;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const on = R() <= litP;
        const warmOne = R() < 0.12;
        const jitter = R();
        if (!on) continue;
        const wx = bx + 22 + c * 56;
        const wy = top + 26 + r * 60;
        if (wy > horizon - 28) continue;
        // 底层先亮，上层后亮
        const layer = (rows - 1 - r) / Math.max(1, rows - 1);
        const delay = from + layer * (to - from) * 0.78 + jitter * 0.22;
        const k = clamp((t - delay) / 0.28, 0, 1);
        if (k <= 0) continue;
        const s = smooth(k);
        ctx.save();
        ctx.globalAlpha = (0.30 + 0.32 * jitter + 0.34 * s) * (0.55 + 0.45 * s);
        ctx.fillStyle = warmOne ? P.lamp : warm;
        ctx.fillRect(wx, wy, 13, 16);
        ctx.restore();
      }
    }
    bx += bw + 16 + R() * 34;
    bi++;
  }
  // 街灯：地平线上一排，亮得比窗早
  for (let i = 0; i < 9; i++) {
    const k = clamp((t - from * 0.5 - i * 0.03) / 0.3, 0, 1);
    if (k <= 0) continue;
    ctx.save();
    ctx.globalAlpha = 0.55 * smooth(k);
    ctx.fillStyle = P.lamp;
    ctx.beginPath();
    ctx.arc(80 + i * 230, horizon - 6, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // 整片城市被点亮的一层薄暖光（很轻，别把夜景冲淡）
  const p = clamp((t - from) / Math.max(0.01, to - from), 0, 1);
  ctx.save();
  ctx.globalAlpha = 0.05 + 0.05 * p;
  glow(ctx, 960, horizon - 160, 640, 'rgba(246,201,126,0.55)', 1);
  ctx.restore();
}

// ---------------- 前景屋顶（视差层） ----------------
export function rooftops(ctx, o = {}) {
  const ridge = o.ridge ?? 900;
  const dx = o.dx ?? 0;
  const dark = o.color || '#0A141B';
  ctx.save();
  ctx.translate(dx, 0);
  // 屋顶主体：盖住画面底部
  block(ctx, -340, ridge, 2600, 320, 0, dark);
  // 檐口
  block(ctx, -340, ridge - 24, 2600, 32, 6, '#0D1A22', { stroke: '#081218', lw: 3, seed: o.seed ?? 3200 });
  // 檐口的一道冷光：把屋面和城市分开
  line(ctx, -340, ridge - 25, 2260, ridge - 25, { seed: (o.seed ?? 3200) + 7, lw: 3, color: '#2A3D48', amp: 0.6, parts: 5 });
  // 屋顶上的水箱 / 烟囱（都不挡住中间放角色的位置）
  for (const [x, w, h] of [[120, 150, 74], [1720, 170, 62], [820, 120, 48]]) {
    block(ctx, x, ridge - 24 - h, w, h + 12, 4, '#0B161E', { stroke: '#081218', lw: 3, seed: 3201 + x });
    block(ctx, x + w * 0.28, ridge - 24 - h - 14, w * 0.44, 18, 4, '#0C1820', { seed: 3211 + x });
  }
  // 天线
  for (const x of [400, 1500]) {
    line(ctx, x, ridge - 24, x, ridge - 196, { seed: 3220 + x, lw: 3.5, color: '#0A141B' });
    line(ctx, x - 26, ridge - 160, x + 26, ridge - 160, { seed: 3230 + x, lw: 3, color: '#0A141B' });
    line(ctx, x - 16, ridge - 186, x + 16, ridge - 186, { seed: 3240 + x, lw: 2.5, color: '#0A141B' });
    ctx.beginPath();
    ctx.arc(x, ridge - 198, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#E0566E'; ctx.fill();
  }
  ctx.restore();
}

// ---------------- 粉笔画：小孩 ----------------
export function chalkChild(ctx, x, y, s = 1, a = 1) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = '#E7DDC8';
  ctx.fillStyle = 'rgba(231,221,200,0.18)';
  ctx.lineWidth = 7 * s;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 头
  ctx.beginPath(); ctx.arc(x, y - 232 * s, 46 * s, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // 头发两撮
  ctx.beginPath(); ctx.moveTo(x - 30 * s, y - 268 * s); ctx.lineTo(x - 10 * s, y - 284 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 30 * s, y - 268 * s); ctx.lineTo(x + 10 * s, y - 284 * s); ctx.stroke();
  // 脸
  ctx.fillStyle = '#E7DDC8';
  ctx.beginPath(); ctx.arc(x - 15 * s, y - 238 * s, 5.4 * s, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 15 * s, y - 238 * s, 5.4 * s, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y - 219 * s, 18 * s, Math.PI * 0.18, Math.PI * 0.82); ctx.stroke();
  // 连衣裙
  ctx.beginPath();
  ctx.moveTo(x - 36 * s, y - 184 * s);
  ctx.lineTo(x + 36 * s, y - 184 * s);
  ctx.lineTo(x + 58 * s, y - 78 * s);
  ctx.lineTo(x - 58 * s, y - 78 * s);
  ctx.closePath();
  ctx.fillStyle = 'rgba(231,221,200,0.14)';
  ctx.fill(); ctx.stroke();
  // 手臂：右手伸向螃蟹
  ctx.beginPath(); ctx.moveTo(x - 36 * s, y - 170 * s); ctx.quadraticCurveTo(x - 82 * s, y - 152 * s, x - 98 * s, y - 124 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 36 * s, y - 170 * s); ctx.quadraticCurveTo(x + 86 * s, y - 156 * s, x + 106 * s, y - 132 * s); ctx.stroke();
  // 腿
  ctx.beginPath(); ctx.moveTo(x - 24 * s, y - 78 * s); ctx.lineTo(x - 28 * s, y - 8 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 24 * s, y - 78 * s); ctx.lineTo(x + 28 * s, y - 8 * s); ctx.stroke();
  // 鞋
  ctx.lineWidth = 9 * s;
  ctx.beginPath(); ctx.moveTo(x - 40 * s, y - 5 * s); ctx.lineTo(x - 22 * s, y - 5 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 22 * s, y - 5 * s); ctx.lineTo(x + 40 * s, y - 5 * s); ctx.stroke();
  ctx.restore();
}

// 粉笔画：螃蟹（直接复用 clawd，只换粉笔色、不要墨线）
export function chalkCrab(ctx, cx, by, u, a = 1) {
  ctx.save();
  ctx.globalAlpha = a;
  clawd(ctx, {
    cx, by, u, color: '#E2D8C2', noInk: true, amp: 1.6,
    eyes: 'dot', mouth: 'smile', seed: 3151,
  });
  ctx.restore();
}

// ---------------- 雨 ----------------
export function rainStreaks(ctx, t, o = {}) {
  const n = o.n ?? 96;
  const R = rng(o.seed ?? 3300);
  const H = 1300;
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x0 = R() * 2100 - 90;
    const y0 = R() * H;
    const sp = 760 + R() * 620;
    const len = 34 + R() * 62;
    const w = 2 + R() * 1.6;
    const y = ((y0 + t * sp) % H) - 80;
    const x = x0 - y * 0.075;
    ctx.globalAlpha = 0.14 + R() * 0.22;
    ctx.strokeStyle = o.color || 'rgba(176,204,214,0.9)';
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - len * 0.075, y + len);
    ctx.stroke();
  }
  ctx.restore();
}

// 雨水在墙上往下淌的湿痕
export function wetRuns(ctx, t, o = {}) {
  const R = rng(o.seed ?? 3310);
  ctx.save();
  for (let i = 0; i < 14; i++) {
    const x = 160 + R() * 1600;
    const y0 = 150 + R() * 260;
    const len = 160 + R() * 420;
    const ph = (t * (0.10 + R() * 0.12) + R()) % 1;
    const grow = smooth(clamp(ph * 2.4, 0, 1));
    ctx.globalAlpha = 0.10 + R() * 0.10;
    ctx.strokeStyle = 'rgba(196,220,228,0.9)';
    ctx.lineWidth = 2 + R() * 3;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y0 + len * grow);
    ctx.stroke();
  }
  ctx.restore();
}

// 用「湿掉的擦除前沿」裁切粉笔画：wipeY 以上被雨冲掉
export function clipWashBelow(ctx, wipeY) {
  ctx.beginPath();
  ctx.moveTo(-40, 1160);
  ctx.lineTo(-40, wipeY);
  for (let x = -40; x <= 1960; x += 140) {
    const k = (x / 140) % 2 ? 16 : -12;
    ctx.lineTo(x, wipeY + k + Math.sin(x * 0.012) * 9);
  }
  ctx.lineTo(1960, 1160);
  ctx.closePath();
  ctx.clip();
}

// ---------------- 对戒的地面小舞台 ----------------
export function ringStage(ctx, t) {
  ctx.fillStyle = '#1C1714';
  ctx.fillRect(0, 0, 1920, 1080);
  // 后墙
  block(ctx, 0, 0, 1920, 880, 0, '#2B221D');
  block(ctx, 0, 0, 1920, 96, 0, '#231B17');
  // 地面
  floorPlane(ctx, { y: 860, color: '#3B2C24', dark: '#2E211A', vx: 960, vy: 820, bands: false });
  // 顶光
  glow(ctx, 960, 760, 660, 'rgba(246,201,126,0.40)', 0.62);
  // 光落地面的椭圆
  ctx.save();
  ctx.globalAlpha = 0.20;
  ctx.fillStyle = P.lamp;
  ctx.beginPath(); ctx.ellipse(960, 872, 520, 60, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  return { floorY: 860 };
}

// ---------------- 声波（同心圆） ----------------
export function soundRipples(ctx, x, y, t, o = {}) {
  const n = o.count ?? 3;
  const period = o.period ?? 2.2;
  const r0 = o.r0 ?? 90, r1 = o.r1 ?? 1400;
  const flat = o.flat ?? 0.7;
  const start = o.start ?? 0;
  if (t <= start) return;
  for (let i = 0; i < n; i++) {
    const ph = ((t - start) / period + i / n) % 1;
    const r = r0 + ph * (r1 - r0);
    ctx.save();
    ctx.globalAlpha = Math.pow(1 - ph, 1.4) * (o.alpha ?? 0.42);
    ctx.strokeStyle = o.color || 'rgba(246,201,126,0.9)';
    ctx.lineWidth = (o.lw ?? 5) * (1 - ph * 0.55);
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * flat, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// ---------------- 夜里的楼（v3-19 拉远后的外壳） ----------------
export function buildingFacade(ctx, a) {
  if (a <= 0) return;
  const x = 470, y = 96, w = 980, h = 984;
  ctx.save();
  ctx.globalAlpha = a;
  block(ctx, x, y, w, h, 6, '#24343E', { stroke: P.ink, lw: 6, seed: 3400 });
  // 屋顶檐口
  block(ctx, x - 36, y - 38, w + 72, 46, 6, '#1C2A33', { stroke: P.ink, lw: 5, seed: 3401 });
  // 屋顶天线 + 航空灯
  line(ctx, x + w * 0.74, y - 38, x + w * 0.74, y - 132, { seed: 3402, lw: 4, color: P.ink });
  line(ctx, x + w * 0.74 - 26, y - 108, x + w * 0.74 + 26, y - 108, { seed: 3403, lw: 3, color: P.ink });
  ctx.beginPath();
  ctx.arc(x + w * 0.74, y - 136, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#E0566E'; ctx.fill();
  // 楼的入口与屋面
  block(ctx, 884, 840, 152, 172, 4, '#16262F', { stroke: P.ink, lw: 5, seed: 3405 });
  block(ctx, 902, 856, 116, 156, 3, '#E3B36A', { seed: 3406 });
  glow(ctx, 960, 1000, 240, 'rgba(246,201,126,0.5)', 0.45);
  // 侧面一段更暗的楼体
  block(ctx, x - 132, y + 210, 132, h - 210, 4, '#1E2C35', { seed: 3404 });
  ctx.restore();
}

// 楼下窗户：按到声波源的距离依次亮
export function buildingWindows(ctx, t, a, o = {}) {
  if (a <= 0) return;
  const x = 470, y = 96, w = 980;
  const cx = o.cx ?? 960, cy = o.cy ?? 380;
  const t0 = o.start ?? 1.9;
  const cols = 5, rows = 3;
  const wx0 = x + 76, wy0 = 500;
  const gapX = (w - 152) / (cols - 1), gapY = 110;
  const R = rng(o.seed ?? 3416);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = wx0 + c * gapX - 48;
      const wy = wy0 + r * gapY;
      const mx = wx + 48, my = wy + 52;
      const delay = t0 + Math.hypot(mx - cx, my - cy) / 1100 * 1.35;
      const k = smooth(clamp((t - delay) / 0.34, 0, 1));
      const tone = R();
      const lit = tone > 0.62 ? '#E3B36A' : tone > 0.3 ? '#C9975A' : '#F0C988';
      ctx.save();
      ctx.globalAlpha = a;
      block(ctx, wx, wy, 96, 104, 3, k > 0 ? lit : '#16262F', { stroke: P.ink, lw: 3.5, seed: 3410 + r * 8 + c });
      if (k > 0 && k < 1) {
        ctx.globalAlpha = a * (1 - k) * 0.8;
        glow(ctx, mx, my, 90, 'rgba(246,201,126,0.8)', 1);
      }
      ctx.restore();
    }
  }
}

// 街道（楼的底座）
export function streetBand(ctx, y = 1010) {
  block(ctx, 0, y, 1920, 1080 - y, 0, '#2B363C');
  line(ctx, 0, y, 1920, y, { seed: 3420, lw: 4, color: P.ink });
  for (let i = 0; i < 7; i++) {
    line(ctx, 60 + i * 300, y + 34, 260 + i * 300, y + 34, { seed: 3421 + i, lw: 3, color: '#3E4A50' });
  }
}

// 夜城远景（v3-19 背景）
export function nightSkyline(ctx) {
  cityLine(ctx, { y: 884, seed: 155, minH: 150, maxH: 340, color: '#10242E' });
  cityLine(ctx, { y: 936, seed: 156, minH: 80, maxH: 210, color: '#0C1B24' });
}