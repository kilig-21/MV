// 第四轮 E5 专用表情工具（c3-01～08 + o-03）。
// 只做两件 expr() 之外的事：① 把眨眼叠在混合表情上而不拆掉过渡；② 让头/身晚 0.1 秒跟上眼睛。
import { blink as lifeBlink } from './life.js';

export const RAMP = 0.18;        // c3 默认过渡 ≈ 4.3 帧 @24fps（E5 规定 0.14–0.22）

/**
 * 混合值当前读作哪一种眼型（取 p 过半的那一侧）。
 * @param {string|{a:string,b:string,p:number}|null} eyes
 * @returns {string|null}
 */
export function eyeName(eyes) {
  if (eyes == null || typeof eyes === 'string') return eyes;
  return eyes.p >= 0.5 ? eyes.b : eyes.a;
}

/**
 * 在 expr() 的结果上叠一次眨眼：只换 eyes，mouth / brow 的过渡原样保留。
 * 眨眼是 1–2 帧的事，故意不进 expr（见 report-expr-blend §5）。
 * @param {{eyes:*,mouth:*,brow:*}} e expr() 的返回值
 * @param {number} t 镜头内秒数
 * @param {object} [o] { seed, slot, jitter, phase, enabled }
 */
export function blinkOn(e, t, o = {}) {
  const closed = lifeBlink(t, {
    seed: o.seed ?? 7,
    eyes: eyeName(e.eyes),
    slot: o.slot ?? 3.0,
    jitter: o.jitter ?? 1.0,
    phase: o.phase ?? 0,
    enabled: o.enabled !== false,
  });
  return closed ? { ...e, eyes: 'closed' } : e;
}

/**
 * 把一组关键帧整体后移 dt 秒：同一张表给头和眼睛各用一次，
 * 视线落定 0.1 秒后头才转过去（E5 要求的「先眼后头」）。
 * @param {Array<object>} keys
 * @param {number} [dt=0.1]
 */
export function lag(keys, dt = 0.1) {
  return keys.map(k => ({ ...k, t: k.t + dt }));
}