// 第三轮修复 C · 三次副歌专用工具。
//
// 解决问题：c1/c2/c3 的「跑」原本是同一个动作模板，只有背景和摆幅差别；
// 这里把三遍副歌拆成三种**节奏型**，并补上背面跟拍 / 侧向剪影 / 低机位票面
// 需要的绘制件。共享模块（character / ink / dream / scenes-chorus23 …）只读。
//
// 三种跑法（摆幅按评审给的 0.12 / 0.16 / 0.20 逐遍放大）：
//   c1 「两拍冲、一拍收力滑行」——脚步在滑行段几乎停住，手臂只在冲的两拍摆。
//   c2 「碎步—大跨」——一拍里两下小碎步，拍尾拉开成一次大跨。
//   c3 「连绵冲刺」——没有停点，步频比前两遍都快，四拍一次长呼吸。
//
// 摆幅换算：评审给的 0.12 / 0.16 / 0.20 是 rig 单位，而手臂件本身只有 2u 高，
// 0.12u ≈ 3px，直接照搬等于没动。这里保留 3 : 4 : 5 的比例 ×4 换成
// 0.48 / 0.64 / 0.80 u，和现有腿部 0.34–0.72u 的落差同一量级。
import { clawd } from './character.js';
import { P } from './palette.js';
import { BEAT } from './polish-chorus.js';
import { clamp, smooth, line, glow } from './ink.js';

const TAU = Math.PI * 2;

export const SWING = { c1: 0.48, c2: 0.64, c3: 0.80 };   // = 0.12/0.16/0.20 × 4

// 拍内相位 0..1（锚点与 polish-chorus 的 BEAT0 一致）
const beatPh = t => ((((t - 0.045) / BEAT) % 1) + 1) % 1;

// 三种节奏的角速度（rad/s）。积分成步相位，脚、手臂、身体起伏都走同一个相位，
// 所以「节奏型」变化在画面上是全身一致的，而不是脚变了、手没变。
const OMEGA = {
  c1: t => {
    const w = BEAT * 2;
    const p = ((((t - 0.1) % w) + w) % w) / w;
    // 两拍冲：前 72% 全速；最后一拍收力滑行，只剩 10% 速度
    return (TAU / BEAT) * (0.16 + 0.84 * (p < 0.72 ? 1 : 0.10));
  },
  c2: t => {
    const ph = beatPh(t);
    // 一拍里两个加速峰（两下小碎步），后半拍被拉长成大跨
    const g1 = Math.exp(-(((ph - 0.07) / 0.12) ** 2));
    const g2 = Math.exp(-(((ph - 0.40) / 0.13) ** 2));
    return (TAU / BEAT) * (0.48 + 1.05 * g1 + 0.70 * g2);
  },
  c3: t => {
    const bar = ((((t - 0.045) / (BEAT * 4)) % 1) + 1) % 1;
    // 连绵：基础步频已经比前两遍快，四拍里再缓缓加一档，没有收力段
    return (TAU / BEAT) * (1.55 + 0.28 * smooth(bar) + 0.22 * Math.exp(-(((beatPh(t) / 0.16) ** 2))));
  },
};

// 跑动强度（0..1）：给前倾、表情、幅度用
const VEL = {
  c1: t => {
    const w = BEAT * 2;
    const p = ((((t - 0.1) % w) + w) % w) / w;
    return p < 0.72 ? 1 : 0.12;
  },
  c2: t => 0.62 + 0.38 * Math.exp(-(((beatPh(t) - 0.07) / 0.30) ** 2)),
  c3: t => 0.84 + 0.16 * Math.sin(t * TAU / (BEAT * 4)),
};

// 从 0 积分到 t。dt=0.02、t≤4s 时每帧约 200 次，代价可以忽略。
function integrate(om, t, dt = 0.02) {
  if (t <= 0) return 0;
  const n = Math.ceil(t / dt);
  let s = 0;
  for (let i = 0; i < n; i++) s += om(Math.min(t, i * dt + dt * 0.5)) * dt;
  return s;
}

/**
 * 一次跑动采样。
 * @returns {{phase:number, steps:number, dist:number, v:number}}
 *   phase：腿/臂的相位（rad）；steps：完整步循环数；dist：∫v dt（给背景滚动）；
 *   v：当前跑动强度 0..1。
 */
export function runCycle(kind, t) {
  const om = OMEGA[kind];
  const phase = integrate(om, t);
  return { phase, steps: phase / TAU, dist: integrate(VEL[kind], t), v: VEL[kind](t) };
}

// 最近 n 帧的平均强度：表情/眼型用它做 6–8 帧过渡，避免一帧硬切
export function smoothV(kind, t, n = 7, dt = 0.04) {
  let s = 0;
  for (let i = 0; i < n; i++) s += VEL[kind](t - i * dt);
  return s / n;
}

const LEG_AMP = { c1: 0.34, c2: 0.50, c3: 0.64 };

/** 腿与手臂的反相摆动（单位 rig u），三遍副歌共用一套相位、不同节奏与幅度。 */
export function runLimbs(kind, t) {
  const c = runCycle(kind, t);
  const s = Math.sin(c.phase);
  const s2 = Math.sin(c.phase + 1.3);
  const a = LEG_AMP[kind];
  const sw = SWING[kind] * (0.45 + 0.55 * c.v);
  return {
    c,
    legs: [s * a * c.v, -s * a * c.v, s2 * a * c.v, -s2 * a * c.v],
    // 与腿反相：腿压下去那一拍，同侧手臂往上抬
    armL: -s * sw,
    armR: s * sw - 0.04,
  };
}

// ── 背面：外壳接缝。正视图关掉表情后，靠这几笔读作「背对镜头」 ──
export function backShell(ctx, cx, by, u) {
  ctx.save();
  ctx.strokeStyle = P.ink;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.75;
  // 中缝
  ctx.lineWidth = 0.10 * u;
  ctx.beginPath();
  ctx.moveTo(cx, by - 8.55 * u);
  ctx.lineTo(cx, by - 2.5 * u);
  ctx.stroke();
  // 两道横向壳纹
  for (const [dy, w] of [[-7.0, 2.7], [-4.9, 3.3]]) {
    ctx.beginPath();
    ctx.moveTo(cx - w * u, by + dy * u);
    ctx.quadraticCurveTo(cx, by + (dy + 0.4) * u, cx + w * u, by + dy * u);
    ctx.stroke();
  }
  // 内嵌的壳板轮廓：和正面的脸区分开
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 0.07 * u;
  ctx.beginPath();
  ctx.moveTo(cx - 5.2 * u, by - 3.0 * u);
  ctx.lineTo(cx - 5.2 * u, by - 7.6 * u);
  ctx.quadraticCurveTo(cx, by - 9.0 * u, cx + 5.2 * u, by - 7.6 * u);
  ctx.lineTo(cx + 5.2 * u, by - 3.0 * u);
  ctx.stroke();
  // 壳上的三点花纹
  ctx.globalAlpha = 0.34;
  ctx.fillStyle = P.ink;
  for (const dx of [-2.2, 0, 2.2]) {
    ctx.beginPath();
    ctx.arc(cx + dx * u, by - 3.55 * u, 0.28 * u, 0, TAU);
    ctx.fill();
  }
  // 上缘一道被前方光打亮的边（背面跟拍时太阳在前方，只亮肩线）
  ctx.globalAlpha = 0.75;
  ctx.strokeStyle = '#F6C97E';
  ctx.lineWidth = 0.13 * u;
  ctx.beginPath();
  ctx.moveTo(cx - 4.9 * u, by - 8.75 * u);
  ctx.quadraticCurveTo(cx, by - 9.45 * u, cx + 4.9 * u, by - 8.75 * u);
  ctx.stroke();
  ctx.restore();
}

/** 背面跟拍用的角色：没有脸，壳纹 + 肩线光。 */
export function clawdBack(ctx, o) {
  const u = o.u || 30;
  const cx = o.cx ?? 960, by = o.by ?? 900;
  // 身后一团暖光，让深色背面从天空里浮出来
  glow(ctx, cx, by - 4.5 * u, u * 3.4, 'rgba(246,201,126,0.9)', 0.22);
  clawd(ctx, { ...o, eyes: 'none', mouth: 'none', brow: null, blush: false });
  backShell(ctx, cx, by, u);
}

// ── 侧向剪影：暗色身体 + 暖色轮廓光 + 迎着行进方向的一只亮眼 ──
export function clawdSilhouette(ctx, o) {
  const u = o.u || 20;
  const cx = o.cx ?? 960, by = o.by ?? 700;
  const dir = o.faceDir ?? -1;               // -1 = 朝左
  // 逆光：先在身后打一团暖光
  glow(ctx, cx + dir * 1.2 * u, by - 5 * u, u * 5.0, 'rgba(246,201,126,0.95)', 0.5);
  clawd(ctx, {
    ...o,
    color: o.silColor || '#2A2226',
    eyes: 'none', mouth: 'none', brow: null, blush: false,
  });
  // 迎光侧的轮廓线（上缘 + 前缘）
  ctx.save();
  ctx.strokeStyle = 'rgba(246,201,126,0.95)';
  ctx.lineCap = 'round';
  ctx.lineWidth = 0.14 * u;
  ctx.beginPath();
  ctx.moveTo(cx - 5.6 * u, by - 8.6 * u);
  ctx.quadraticCurveTo(cx, by - 9.5 * u, cx + 5.6 * u, by - 8.6 * u);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + dir * 7.6 * u, by - 7.6 * u);
  ctx.lineTo(cx + dir * 7.6 * u, by - 3.4 * u);
  ctx.stroke();
  ctx.restore();
  // 单只亮眼：剪影里唯一的脸部信息，读作「朝向」
  ctx.save();
  ctx.fillStyle = '#F7EFDD';
  ctx.beginPath();
  ctx.ellipse(cx + dir * 4.3 * u, by - 6.2 * u, 0.36 * u, 0.30 * u, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = P.ink;
  ctx.beginPath();
  ctx.arc(cx + dir * 4.45 * u, by - 6.2 * u, 0.16 * u, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/**
 * 低机位票面：下缘从左下角入画、向右上退去的四边票面。
 * 近边（画面下缘那条）带撕齿与票的厚度，远边是角色站立的工作面。
 * @returns {{farY:number, nearY:number}} 远边在左右两端的 y，便于把角色放上去
 */
export function rakedTicket(ctx, t, o = {}) {
  const scroll = o.scroll ?? 0;
  const bob = Math.sin(t * 1.1 + (o.phase || 0)) * 3;
  const lift = bob + (o.lift ?? 0);
  // 四个角：左下角入画（近左），向右上退
  const nL = [o.nLx ?? -80, 1120 + lift];
  const nR = [o.nRx ?? 1660, 1030 + lift];
  const fR = [o.fRx ?? 1730, 902 + lift];
  const fL = [o.fLx ?? 150, 966 + lift];
  const R = (o.seed || 641) % 97;

  ctx.save();
  // 票的厚度：近边往下一块暗面
  ctx.beginPath();
  ctx.moveTo(nL[0], nL[1]);
  ctx.lineTo(nR[0], nR[1]);
  ctx.lineTo(nR[0], nR[1] + 34);
  ctx.lineTo(nL[0], nL[1] + 38);
  ctx.closePath();
  ctx.fillStyle = '#7E6748';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = P.ink;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // 票面
  ctx.beginPath();
  ctx.moveTo(nL[0], nL[1]);
  ctx.lineTo(nR[0], nR[1]);
  ctx.lineTo(fR[0], fR[1]);
  ctx.lineTo(fL[0], fL[1]);
  ctx.closePath();
  ctx.fillStyle = o.color || '#E8D5B0';
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = P.ink;
  ctx.stroke();

  // 票面印刷线：跟着透视走，scroll 让它们往后跑
  ctx.save();
  ctx.clip();
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 4; i++) {
    const k = (0.18 + i * 0.22 + ((scroll % 210) / 210) * 0.22) % 1;
    const x0 = fL[0] + (nL[0] - fL[0]) * k, y0 = fL[1] + (nL[1] - fL[1]) * k;
    const x1 = fR[0] + (nR[0] - fR[0]) * k, y1 = fR[1] + (nR[1] - fR[1]) * k;
    line(ctx, x0 + 30, y0, x1 - 26, y1, { seed: 660 + i + R, lw: 3, color: 'rgba(120,100,70,0.55)', amp: 1.2, parts: 5 });
  }
  // 竖向撕线
  const tx0 = fL[0] + (fR[0] - fL[0]) * 0.78, ty0 = fL[1] + (fR[1] - fL[1]) * 0.78;
  const tx1 = nL[0] + (nR[0] - nL[0]) * 0.78, ty1 = nL[1] + (nR[1] - nL[1]) * 0.78;
  line(ctx, tx0, ty0, tx1, ty1, { seed: 671, lw: 4, color: 'rgba(120,100,70,0.5)', amp: 1.4, parts: 6 });
  // 票根印章
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.arc(tx0 + (tx1 - tx0) * 0.45, ty0 + (ty1 - ty0) * 0.45, 26, 0, TAU);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(214,96,116,0.8)';
  ctx.stroke();
  ctx.restore();

  // 近边撕齿：一排半圆，跟着 scroll 慢慢挪
  ctx.fillStyle = 'rgba(28,34,40,0.55)';
  for (let i = 0; i < 18; i++) {
    const k = ((i * 92 + scroll * 0.6) % (nR[0] - nL[0])) / (nR[0] - nL[0]);
    if (k <= 0 || k >= 1) continue;
    const px = nL[0] + (nR[0] - nL[0]) * k;
    const py = nL[1] + (nR[1] - nL[1]) * k;
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  return { farY: fL[1], nearY: nL[1], far: k => fL[1] + (fR[1] - fL[1]) * k };
}