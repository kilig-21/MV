// intro / outro 打磨专用：窗灯的「不规律」演法。
// 整段只有这一份实现，i-01（亮起）与 o-06（熄灭）都走它：
// 楼群、窗位、起亮时刻、熄灭顺序来自同一组 RNG，所以 o-06 的最后一帧
// 仍然是 i-01 的第一帧（两帧都是全暗 + 同样的 0.72 暗场）。
import { P } from './palette.js';
import { block, line, rng, hash, clamp, smooth } from './ink.js';

const WARM = ['#E3B36A', '#EBC98F', '#D9A057', '#E6BE7D'];
const COOL = ['#BFD6DA', '#A9C7CF', '#CBDFE2', '#B4CCD2'];

// o.litP   点亮进度 0→1（i-01）
// o.offP   熄灭进度 0→1（o-06）
// o.litSpan / o.offSpan  进度 1 对应的秒数（用来把进度换算回「已经亮了几秒」）
export function cityWindowsIO(ctx, o = {}) {
  const litP = o.litP ?? 1;
  const offP = o.offP ?? 0;
  const litSpan = o.litSpan ?? 4.0;
  const offSpan = o.offSpan ?? 7.0;
  const baseY = o.y ?? 770;
  const scroll = o.scroll ?? 0;
  const seed = o.seed ?? 71;
  const R = rng(seed);

  // 楼群按世界坐标排布：镜头缓移时窗灯的「亮起时刻」不变
  let wx = -160;
  const wins = [];
  let i = 0, k = 0;
  while (wx < 2500) {
    const w = 130 + R() * 150;
    const h = 150 + R() * 320;
    const top = baseY - h;
    const x = wx - scroll;
    const col = i % 2 ? '#14303C' : '#183240';
    block(ctx, x, top, w, h + 40, 4, col, { stroke: P.ink, lw: 4, seed: seed + i, amp: 1.4 });
    // 屋顶水箱 / 天线剪影
    if (R() < 0.5) block(ctx, x + w * 0.58, top - 32, 42, 28, 4, col, { stroke: P.ink, lw: 3, seed: seed + 90 + i });
    if (R() < 0.4) line(ctx, x + w * 0.28, top, x + w * 0.28, top - 54, { seed: seed + 150 + i, lw: 3, color: P.ink, amp: 1 });

    const cols = Math.max(1, Math.floor((w - 30) / 54));
    const rows = Math.max(1, Math.floor((h - 52) / 62));
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const a0 = R(), b0 = R(), c0 = R(), d0 = R(), e0 = R();
      // 起亮时刻：分三簇 + 尾段零星，簇内再随机 —— 相邻两窗的间隔永远不相等
      let th;
      if (a0 < 0.21) th = 0.02 + b0 * 0.12;
      else if (a0 < 0.47) th = 0.23 + b0 * 0.27;
      else if (a0 < 0.76) th = 0.57 + b0 * 0.25;
      else th = 0.85 + b0 * 0.14;

      const h1 = hash(seed * 13 + 5, k);
      const h2 = hash(seed * 29 + 7, k);
      const h3 = hash(seed * 41 + 11, k);
      const warm = c0 < 0.57;
      wins.push({
        x: x + 18 + c * 54, y: top + 26 + r * 62, th,
        color: (warm ? WARM : COOL)[Math.floor(h1 * 3.999)],
        bri: 0.52 + d0 * 0.44,                 // 每扇窗亮度不同
        warm,
        // 少数窗亮一下就灭（持续时间也是随机的）
        life: e0 < 0.13 ? 0.4 + h2 * 1.6 : Infinity,
        // 起亮速度不同：有的「啪」一下，有的像灯管要预热
        riseDur: h3 < 0.28 ? 0.34 + h2 * 0.5 : 0.06 + h2 * 0.16,
        // 起亮时的抖动：强度、频率、相位各自不同
        flk: h1 < 0.3 ? 0.35 + h2 * 0.5 : 0,
        flkFreq: 22 + h3 * 48,
        flkPh: h1 * 6.28,
        // 熄灭前的抖：时长、节奏也不同
        preOff: 0.18 + h2 * 0.5,
        offFreq: 20 + h3 * 44,
        offPh: h1 * 6.28 * 3,
        offFade: 0.16 + h1 * 0.3,
        hero: false,
      });
      k++;
    }
    wx += w + 16 + R() * 26;
    i++;
  }

  // 熄灭顺序：成簇 + 长空档，不按等距铺开；中右留一扇压到最后
  let heroK = 0, bestD = Infinity;
  for (let j = 0; j < wins.length; j++) {
    const d2 = Math.pow(wins[j].x - 985, 2) + Math.pow(wins[j].y - 880, 2);
    if (d2 < bestD) { bestD = d2; heroK = j; }
  }
  for (let j = 0; j < wins.length; j++) {
    const r0 = hash(seed * 3 + 11, j);
    const r1 = hash(seed * 5 + 19, j);
    let q;
    if (r0 < 0.20) q = 0.02 + r1 * 0.07;        // 先灭的一小撮
    else if (r0 < 0.46) q = 0.19 + r1 * 0.26;
    else if (r0 < 0.71) q = 0.53 + r1 * 0.20;
    else q = 0.76 + r1 * 0.17;                  // 尾段稀疏，间隔被拉开
    wins[j].offAt = q;
  }
  if (wins[heroK]) {
    const hw = wins[heroK];
    hw.offAt = 0.95;
    hw.warm = true;
    hw.hero = true;
    hw.color = '#F2C887';
    hw.bri = 0.98;
    hw.preOff = 0.62;                            // 最后那盏「将灭未灭」抖得更久
    hw.offFreq = 26;
    hw.offPh = 1.7;
  }

  let litCount = 0;
  for (const win of wins) {
    let a = 0;
    if (litP > win.th) {
      const since = (litP - win.th) * litSpan;
      a = smooth(since / win.riseDur) * win.bri;
      if (win.flk && since < 0.55) {
        const f = Math.sin(since * win.flkFreq + win.flkPh);
        if (f < -0.1) a *= 1 - win.flk * (0.6 + 0.4 * smooth((0.55 - since) / 0.55));
      }
      // 亮一下又灭
      if (win.life < 90 && since > win.life) a *= 1 - smooth((since - win.life) / 0.22);
    }
    if (offP > 0) {
      const left = (win.offAt - offP) * offSpan;   // 还剩几秒灭
      if (left <= 0) continue;
      if (left < win.preOff) {
        const st = win.preOff - left;
        const f = Math.sin(st * win.offFreq + win.offPh);
        if (win.hero) {
          // 将灭未灭：先暗到几乎看不见，再回一口气
          if (f > 0.62) a *= 0.10;
          else if (f > 0.2) a *= 0.45;
        } else if (f > 0.3) a *= 0.26;
        else if (f > 0.02) a *= 0.66;
        a *= 0.3 + 0.7 * smooth(left / win.offFade);
      }
    }
    if (a <= 0.004) continue;
    ctx.globalAlpha = clamp(a, 0, 1);
    ctx.fillStyle = win.color;
    ctx.fillRect(win.x, win.y, 14, 18);
    litCount++;
  }
  ctx.globalAlpha = 1;

  return { hero: wins[heroK], litCount, total: wins.length, wins };
}

// ---------------- 车灯扫过墙面（i-02） ----------------
// 只做光：一块被横向拉长的光斑贴着立面滑过去，后面跟一条更亮的灯罩切线。
// 不要做成从天上打下来的聚光灯——车灯是低的、横着扫的。
export function carLightOnWall(ctx, o = {}) {
  const x = o.x ?? 0;          // 光斑中心
  const a = o.a ?? 1;          // 整体强度
  const top = o.top ?? 170;
  const bottom = o.bottom ?? 706;
  const cy = o.cy ?? 452;
  if (a <= 0.002) return;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, top, 1920, bottom - top); ctx.clip();

  // 宽光斑：横向拉长的椭圆，垂直方向收得比水平快
  ctx.save();
  ctx.translate(x, cy);
  ctx.scale(2.05, 1);
  let g = ctx.createRadialGradient(0, 0, 0, 0, 0, 230);
  g.addColorStop(0, `rgba(255,246,224,${0.13 * a})`);
  g.addColorStop(0.42, `rgba(255,238,198,${0.085 * a})`);
  g.addColorStop(1, 'rgba(255,238,198,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, 230, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // 更亮的一条芯：灯罩切线，横着的一道软边
  ctx.save();
  ctx.translate(x + 120, cy + 30);
  ctx.scale(0.9, 1);
  g = ctx.createRadialGradient(0, 0, 0, 0, 0, 150);
  g.addColorStop(0, `rgba(255,250,234,${0.16 * a})`);
  g.addColorStop(0.5, `rgba(255,246,220,${0.07 * a})`);
  g.addColorStop(1, 'rgba(255,246,220,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, 150, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  ctx.restore();
}