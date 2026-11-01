// E4 · verse3 表情灵动化的共用小工具
//
// 这一段的原则是「该什么表情就什么表情」：每镜 1–3 次变化，
// 过渡 0.14–0.24 秒，换表情之前先用眉毛或视线做 2–4 帧预备。
// 这里只包一层 life.js 的纯函数，不引入任何状态。
import { expr, browLift, eyeDart } from './life.js';

// 三种过渡长度：
//   soft  —— 情绪慢慢落下来（知足、释然、孤独）
//   std   —— 一般变化
//   quick —— 惊吓、惊觉这种必须快但仍不是硬切的变化
export const RAMP = { soft: 0.24, std: 0.18, quick: 0.14 };

/**
 * expr 的薄封装：关键帧时间 = 「已经完全是这套表情」的时刻，
 * 过渡占用它之前的 ramp 秒（end-at-key，见 report-expr-blend.md）。
 */
export function face(t, keys, ramp = RAMP.std) {
  return expr(t, keys, { ramp });
}

/**
 * 眨眼叠加。眨眼本来就是 2 帧的硬闭眼，允许直接打断正在进行的渐变，
 * 松开后回到当时的混合值——这比「渐变期间不眨眼」更像活人。
 * 但要记得别把 'closed' 写进 expr 的关键帧（会被拉成 0.18 秒的慢闭眼）。
 */
export function withBlink(e, b) {
  return b ? { ...e, eyes: b } : e;
}

/** 视线跳看：每个关键帧给一个落点，到位前 0.08 秒内完成。 */
export function glance(t, keys, o = {}) {
  return eyeDart(t, keys, o);
}

/**
 * 换表情前的 2–4 帧预备：眉毛先抬一下。
 * 只在当前有眉毛（brow: 'up' | 'worried' | 'angry'）时才看得见，
 * 所以通常把它放在 brow 出现的那一帧之前一点。
 */
export function prep(t, at, o = {}) {
  return browLift(t, { at, dur: o.dur ?? 0.30, amp: o.amp ?? 0.30 });
}

/** 一镜里可能有两次以上预备，窗口不重叠就直接相加。 */
export function sum(...vals) {
  let out = 0;
  for (const v of vals) out += v || 0;
  return out;
}