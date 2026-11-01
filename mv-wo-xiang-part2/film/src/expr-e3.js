// 第四轮 E3 · chorus1 / chorus2 表情灵动化辅助。
//
// 这一轮不改身体、不改构图，只把「离散表情切换」换成 expr() 渐变，
// 并给每镜 2–4 次落在拍点上的变化。共享模块（life / polish-chorus / ink）只读。
//
// 节奏基准同 polish-chorus：BEAT = 0.6485s（92.5 BPM），锚点 BEAT0 = 0.045s。
import { expr, eyeDart, browLift, blink as lifeBlink } from './life.js';
import { BEAT, BEAT0 } from './polish-chorus.js';

// 副歌的 ramp：比主歌短一点。0.14 ≈ 3.4 帧，落在 POLISH-DOCTRINE 的 2–4 帧里。
export const RAMP = { chorus: 0.14, fast: 0.10, soft: 0.18 };

/**
 * expr() 的副歌默认值：ramp 0.14。
 * 关键帧语义仍是「到 t 时已经是这套表情」（过渡在 t 之前完成），所以直接把拍点写进去。
 */
export function exprE3(t, keys, o = {}) {
  return expr(t, keys, { ...o, ramp: o.ramp ?? RAMP.chorus });
}

/**
 * 镜头本地拍点。b(0) = 镜头开始后的第一拍，b(-1) = 镜头前最后一拍。
 * step 可传 BEAT * 2（每 2 拍）或 BEAT * 4（每小节）。
 * @param {number} t0Abs 镜头在整片里的起始时间
 * @param {number} [step]
 * @returns {{k0:number, b:(n?:number)=>number, abs:(n?:number)=>number}}
 */
export function beatClock(t0Abs, step = BEAT) {
  const k0 = Math.ceil((t0Abs - BEAT0) / step - 1e-6);
  return {
    k0,
    b: (n = 0) => Math.round((BEAT0 + (k0 + n) * step - t0Abs) * 10000) / 10000,
    abs: (n = 0) => BEAT0 + (k0 + n) * step,
  };
}

/**
 * 眨眼叠在 expr() 的结果上。
 * 只在眼型是字符串（已经落定、不在过渡里）时眨：
 * 半透明闭眼叠在半透明眼型上会出一帧灰，report-expr-blend 里已注明。
 */
export function withBlink(gt, seed, e, o = {}) {
  if (o.enabled === false) return e;
  if (typeof e.eyes !== 'string' || e.eyes === 'closed') return e;
  if (lifeBlink(gt, { seed, eyes: e.eyes, slot: o.slot, jitter: o.jitter }) !== 'closed') return e;
  return { ...e, eyes: 'closed' };
}

/** eyeDart() 的副歌默认值：0.09s 跳到位（≈2 帧），中间留停顿。 */
export function dart(t, ks, o = {}) {
  return eyeDart(t, ks, { dur: 0.09, step: 0.55, ...o });
}

/** 多条 browLift 叠加（同一条眉毛上可以同时挂「看到」和「用力」两下）。 */
export function browAt(t, lifts) {
  let y = 0;
  for (let i = 0; i < lifts.length; i++) y += browLift(t, lifts[i]);
  return y;
}