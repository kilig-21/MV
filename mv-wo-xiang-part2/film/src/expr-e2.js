// expr-e2.js —— 第四轮 E2（verse2 十八镜）共用的表情/视线工具。
//
// 只用 life.js 已有的纯函数，不碰 character.js：
//   face()   表情关键帧 → 可展开进 clawd()，顺带处理眨眼，并保证不在过渡窗口里眨
//   prep()   换表情前 2–4 帧的眉毛预备（browLift 叠出来的「弹一下」）
//   dart()   视线跳看（eyeDart 的 E2 默认参数：短、稳、不过分甩）
//   styleSwap()  eyesAt 的 style 切换（'smile' ↔ 'open' 这类）：在切换点眨两帧
import { expr, blink, eyeDart, browLift } from './life.js';

// 3–5 帧 @24fps。个别镜头可覆盖。
export const RAMP = 0.16;

/**
 * 表情关键帧 + 眨眼。
 * @param {number} t
 * @param {Array<{t:number, eyes?:string, mouth?:string, brow?:string|null}>} keys
 * @param {object} [o] { ramp, ease, seed, guard=0.13, blink=true, slot, jitter }
 * @returns {{eyes:(string|object), mouth:(string|object), brow:(string|object|null)}}
 */
export function face(t, keys, o = {}) {
  const e = expr(t, keys, { ramp: o.ramp ?? RAMP, ease: o.ease });
  if (o.blink === false) return e;
  // blink() 只认字符串：混合值取目标端，happy/closed 时它自己会拒绝眨。
  const cur = typeof e.eyes === 'string' ? e.eyes : e.eyes.b;
  // 关键帧前后 guard 秒内不眨：眨眼是硬切，落在渐变里会读成顿一下。
  const guard = o.guard ?? 0.13;
  const near = keys.some(k => Math.abs(t - (k.t ?? 0)) < guard);
  const closed = blink(t, {
    seed: o.seed ?? 7, eyes: cur, enabled: !near,
    slot: o.slot ?? 3.2, jitter: o.jitter ?? 0.9,
  });
  return closed ? { ...e, eyes: closed } : e;
}

/**
 * 换表情前的眉毛预备：在真正变表情前 antic 秒抬手，antic+dur 前落回。
 * 要看得见必须同时让 brow 变成 'up' / 'worried'（可在 face() 里提前一个关键帧）。
 * @param {number} t
 * @param {number[]} times 真正变表情的时刻（镜头内秒）
 * @param {object} [o] { antic=0.12, dur=0.30, amp=0.30 }
 * @returns {number} 给 clawd 的 browDy（负=向上）
 */
export function prep(t, times, o = {}) {
  const antic = o.antic ?? 0.12;
  const dur = o.dur ?? 0.30;
  const amp = o.amp ?? 0.30;
  let v = 0;
  for (const at of times) v += browLift(t, { at: at - antic, dur, amp });
  return v;
}

/**
 * 视线跳看。可当 clawd.look，也可当 eyesAt 的 yaw/pitch 的 0–1 权重。
 * @param {number} t
 * @param {Array<{t:number, look:number}|number>} keys
 * @param {object} [o] { dur=0.09, step, overshoot=0.12, t0 }
 */
export function dart(t, keys, o = {}) {
  return eyeDart(t, keys, { dur: o.dur ?? 0.09, overshoot: o.overshoot ?? 0.12, step: o.step, t0: o.t0 });
}

/**
 * eyesAt 的 style 切换：切换点前后各眨 dur 秒（默认 0.07 ≈ 1.7 帧），
 * 避免 'smile'→'open' 这种两条形状差很远的硬切。
 */
export function styleSwap(t, at, before, after, o = {}) {
  const d = o.dur ?? 0.07;
  if (t < at - d) return before;
  if (t < at + d) return 'shut';
  return after;
}