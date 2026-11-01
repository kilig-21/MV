// P4 副歌打磨辅助（c1/c2/c3 共用）
// 只读共享模块，不改它们；这里补的是"节拍网格 / 强弱拍 / 呼吸 / 眨眼 / 关键帧"这类表演工具。
// 节拍来自 assets/source-audio.flac 的实测：自相关在 60–210 秒各段都落在 92.5 BPM，锚点 0.045 秒。
import { clamp, smooth } from './ink.js';

export const BEAT = 0.6485;          // 92.5 BPM
export const BEAT0 = 0.045;          // 全片节拍锚点（秒）
export const BAR = BEAT * 4;

// 第几拍、拍内相位 0..1、小节内第几拍 0..3
export function beatInfo(gt) {
  const x = (gt - BEAT0) / BEAT;
  const n = Math.floor(x);
  return { n, ph: x - n, inBar: ((n % 4) + 4) % 4 };
}

// 每拍衰减包络：1 → 0，sharp 越大越"点"
export function hit(gt, sharp = 6) {
  return Math.exp(-beatInfo(gt).ph * sharp);
}

// 只有每 4 拍的第一拍才有值
export function downHit(gt, sharp = 3.6) {
  const b = beatInfo(gt);
  return b.inBar === 0 ? Math.exp(-b.ph * sharp) : 0;
}

// 小节相位 0..1（2.594 秒一圈），用于"每 4 拍一次大圈"
export function barPhase(gt) {
  return (((gt - BEAT0) / BAR) % 1 + 1) % 1;
}

// 关键帧插值：kf = [[t, v], [t, v, ease], ...]
// 同一数值写两个时间点就是"停住"，用来做 c1 的犹豫停顿。
export function keys(t, kf, ease = smooth) {
  if (t <= kf[0][0]) return kf[0][1];
  for (let i = 1; i < kf.length; i++) {
    if (t <= kf[i][0]) {
      const [t0, v0] = kf[i - 1];
      const [t1, v1, e] = kf[i];
      const u = (t - t0) / Math.max(1e-4, t1 - t0);
      return v0 + (v1 - v0) * (e || ease)(u);
    }
  }
  return kf[kf.length - 1][1];
}

// 离散状态的关键帧（眼型、嘴型不能用数值插值）：取最后一个已到时间点的值
export function state(t, kf) {
  let v = kf[0][1];
  for (const [t0, val] of kf) if (t >= t0) v = val;
  return v;
}

// 过冲：到位后 3–6% 超出再回落
export function backOut(u, s = 1.35) {
  u = clamp(u, 0, 1);
  const v = u - 1;
  return 1 + (s + 1) * v * v * v + s * v * v;
}

// 一下"点"：t0 起 dur 内冲到 1 再回落，用于每个节拍的推力
export function jab(t, t0, dur = 0.22) {
  const u = (t - t0) / dur;
  if (u < 0 || u > 1) return 0;
  return Math.sin(u * Math.PI) ** 1.6;
}

// 呼吸 / 眨眼统一走 life.js（P4 的另一条产线提供），这里只换成副歌镜头好用的形状：
// y/a/r ∈ −1..1，seed 决定每只角色的相位与频率。
import { breath as lifeBreath, blink as lifeBlink, sway as lifeSway, gaze as lifeGaze } from './life.js';

export function breath(gt, seed = 0, speed = 1) {
  const bb = lifeBreath(gt, { seed, period: 1.5 / speed });
  const sw = lifeSway(gt, { seed });
  return { y: bb.bodyDy / 0.15, squash: bb.squash, a: sw.armL / 0.05, r: sw.rot / 0.008 };
}

export function blink(gt, seed = 0, eyes = 'normal', enabled = true) {
  return lifeBlink(gt, { seed, eyes, enabled }) === 'closed';
}

export const gaze = lifeGaze;

// 睁眼：p 0..1 的进度，先闭、再半睁（tired 的横条读作半开）、再落到目标眼型
export function eyeOpen(p, finalEyes) {
  if (p <= 0.34) return 'closed';
  if (p <= 0.74) return 'tired';
  return finalEyes;
}

// 带强弱拍的节拍圈：每拍小圈，每 4 拍一次大圈（更大、更亮、更粗）
export function beatPulse(ctx, x, y, gt, u = 1, o = {}) {
  const color = o.color || '#F1D9A8';
  const b = beatInfo(gt);
  ctx.save();
  // 每拍：两层错相，亮度随拍内相位衰减——不再每帧同亮
  for (let i = 0; i < 2; i++) {
    const k = (b.ph + i * 0.5) % 1;
    ctx.beginPath();
    ctx.globalAlpha = (1 - k) * (o.beatAlpha ?? 0.30) * (1 - i * 0.35);
    ctx.lineWidth = (4 - k * 2) * Math.max(0.7, u * 0.8);
    ctx.strokeStyle = color;
    ctx.ellipse(x, y, (48 + k * 190) * u, (16 + k * 58) * u, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // 每 4 拍：大圈（两圈接续，保持"一下一下"的呼吸）
  const bp = barPhase(gt);
  for (let i = 0; i < 2; i++) {
    const k = (bp + i * 0.5) % 1;
    ctx.beginPath();
    ctx.globalAlpha = (1 - k) * (1 - i * 0.55) * (o.barAlpha ?? 0.62);
    ctx.lineWidth = (8 - k * 5) * Math.max(0.7, u * 0.9);
    ctx.strokeStyle = o.barColor || '#F6C97E';
    ctx.ellipse(x, y, (110 + k * 520) * u, (34 + k * 150) * u, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // 大圈起拍时的一层暖光，把"强拍"再强调一次
  const dh = downHit(gt, 5);
  if (dh > 0.02) {
    ctx.globalAlpha = dh * 0.35;
    ctx.fillStyle = '#F6C97E';
    ctx.beginPath();
    ctx.ellipse(x, y, 150 * u, 44 * u, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// 节拍光点：按拍炸开，强拍更大、更多
export function beatMotes(ctx, x, y, gt, o = {}) {
  const n = o.n || 10;
  const b = beatInfo(gt);
  const big = b.inBar === 0 ? 1.45 : 1;
  for (let i = 0; i < n; i++) {
    const k = (b.ph + i / n) % 1;
    const a = i * 2.399 + (o.seed || 0);
    ctx.save();
    ctx.globalAlpha = (1 - k) * 0.75 * (b.inBar === 0 ? 1.15 : 1);
    ctx.fillStyle = i % 3 ? '#F1D9A8' : '#E8A0A8';
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * (o.r0 || 240) * (1 + k * (o.spread ?? 1.8)) * big,
      y + Math.sin(a) * (o.r0 || 240) * 0.6 * (1 + k * (o.spread ?? 1.8)) * big,
      8 * (1 - k) * big, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 两拍一停（c1）：每 step 秒一次动作，动作 0.2 秒内完成，其余时间保持
export function twoBeat(t, start = 0, step = BEAT * 2, dur = 0.2) {
  const u = (t - start) / step;
  if (u < 0) return 0;
  const i = Math.floor(u);
  return Math.min(1, i + backOut(clamp((u - i) * step / dur, 0, 1)));
}

// 连绵（c3）：没有停点，慢速起落，幅度给足
export function float(gt, seed = 0, speed = 1) {
  const p = seed * 1.9;
  return {
    s: Math.sin(gt * 0.9 * speed + p),
    c: Math.cos(gt * 0.63 * speed + p * 0.7),
    s2: Math.sin(gt * 1.7 * speed + p * 1.3),
  };
}