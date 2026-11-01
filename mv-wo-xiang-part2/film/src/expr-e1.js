// expr-e1.js —— E1（intro / verse1 / hook1 / hook2）的表情与视线
//
// 用户这一轮的反馈：「表情还能再活一点吗？前半段就是几个表情僵硬的切换。」
// 所以这里不新增画法，只把已经有的一帧硬切换，换成「看得见的过程」：
//
//   1. 换挡走 life.expr()：3–5 帧过渡（ramp 0.12–0.22），关键帧时间 = 歌词/动作的重音点；
//   2. 眼睛先到、嘴晚到（mouthLag，默认 45 ms ≈ 1 帧），眉毛与眼同步；
//   3. 每次换挡前 2–4 帧，眉毛先抬一下（browLift）；有眉型时才看得见；
//   4. 眨眼只在「静止段」发生 —— 换挡窗口 ±0.14 s 内、或镜头指定的禁眨区间内一律跳过，
//      免得一帧闭眼把过渡劈成两半；
//   5. 视线用 eyeDart 的「停—跳」，不匀速平移；连续跟踪的镜头用 dartTrack 采样成跳看。
//
// 全部建立在 life.js 之上，不改任何共享模块。
//
// 用法：
//   const f = faceE1(t, [
//     { at: 0.00, eyes: 'look', mouth: 'flat' },
//     { at: 0.66, eyes: 'wide', mouth: 'o' },      // 到 0.66 已经是这套，之前 ramp 秒过渡
//     { at: 0.86, eyes: 'side', mouth: 'none' },
//   ], { seed: 30, ramp: 0.14 });
//
//   clawd(ctx, {
//     ...,
//     eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
//     look: f.blinking ? 0 : dart(t, [{ t: 0.3, look: 0.8 }, { t: 1.4, look: -0.6 }]),
//   });

import { expr, browLift, eyeDart, blink as lifeBlink } from './life.js';

// 可眨眼型（闭眼/笑眼/爱心眼不叠眨眼），与 polish-v1 的名单一致
const BLINKABLE = new Set([
  'normal', 'look', 'tired', 'wide', 'dot', 'sad', 'sparkle',
  'shock', 'squint', 'side', 'teary', 'dazed',
]);

const FIELDS = ['eyes', 'mouth', 'brow'];   // clawd() 只对这三个字段做混合

const keyTime = k => (k.at ?? k.t ?? 0);

function normalize(keys) {
  return keys
    .map(k => ({
      t: keyTime(k),
      ramp: k.ramp,
      eyes: k.eyes, mouth: k.mouth, brow: k.brow,
      blush: k.blush, sweat: k.sweat,
    }))
    .sort((a, b) => a.t - b.t);
}

// 逐个关键帧推出「有效的眼/嘴/眉」，并记下真正发生换挡的那几帧。
// 只写了一个字段的关键帧（例如只改 brow）沿用上一帧的其余字段——与 expr 的语义一致。
function walk(ks) {
  const out = [];
  let cur = { eyes: 'normal', mouth: 'none', brow: null };
  for (const k of ks) {
    const nxt = { ...cur };
    for (const f of FIELDS) if (k[f] !== undefined) nxt[f] = k[f];
    out.push({
      t: k.t,
      ramp: k.ramp,
      eyes: nxt.eyes, mouth: nxt.mouth, brow: nxt.brow,
      changed: nxt.eyes !== cur.eyes || nxt.mouth !== cur.mouth,
    });
    cur = nxt;
  }
  return out;
}

// 正在往哪一帧过渡，就用哪一帧的 ramp（expr 的 ramp 只影响当前这一段）。
function rampAt(t, frames, base) {
  let i = 0;
  while (i < frames.length && t >= frames[i].t) i++;
  if (i >= frames.length) return base;
  const r = frames[i].ramp;
  return Number.isFinite(r) ? r : base;
}

/**
 * 带过渡的表情：可直接展开进 clawd()。
 * @param {number} t 镜头内秒数
 * @param {Array<{at?:number,t?:number,eyes?:string,mouth?:string,brow?:string|null,
 *                blush?:boolean,sweat?:boolean,ramp?:number}>} keys
 * @param {object} [o] { ramp=0.18, mouthLag=0.045, seed, blinkFrom, noBlinkIn, blink,
 *                       lift=true, liftAmp=0.26, liftPre=0.14, liftDur=0.34, blush, sweat }
 * @returns {{eyes, mouth, brow, browDy, blush, sweat, blinking}}
 */
export function faceE1(t, keys = [], o = {}) {
  const out = {
    eyes: 'normal', mouth: 'none', brow: null,
    browDy: 0, blush: o.blush, sweat: o.sweat, blinking: false,
  };
  if (!Array.isArray(keys) || !keys.length) return out;

  const ks = normalize(keys);
  const frames = walk(ks);
  const base = o.ramp ?? 0.18;
  const ease = o.ease;
  const lag = o.mouthLag ?? 0.045;

  const atEyes = expr(t, ks, { ramp: rampAt(t, frames, base), ease });
  const atMouth = expr(t - lag, ks, { ramp: rampAt(t - lag, frames, base), ease });

  out.eyes = atEyes.eyes;
  out.brow = atEyes.brow;
  out.mouth = atMouth.mouth;

  // 腮红/汗滴不是混合字段，按「最近一个已经生效的关键帧」直接切
  for (const k of ks) {
    if (k.t > t + 1e-6) break;
    if (k.blush !== undefined) out.blush = k.blush;
    if (k.sweat !== undefined) out.sweat = k.sweat;
  }

  // 换挡前的极轻眉动：落在关键帧前半拍，给「要变脸了」一点预告
  const chg = frames.filter(f => f.changed);
  if (o.lift !== false) {
    const pre = o.liftPre ?? 0.14;
    const amp = o.liftAmp ?? 0.26;
    const dur = o.liftDur ?? 0.34;
    for (const c of chg) out.browDy += browLift(t, { at: c.t - pre, dur, amp });
  }

  // 眨眼：只在静止段。solid 是不含混合的「此刻该是什么眼型」
  const solid = expr(t, ks, { ramp: 0 }).eyes;
  const guard = o.blinkGuard ?? 0.14;
  const nearChange = chg.some(c => Math.abs(t - c.t) < guard);
  const blocked = (o.noBlinkIn || []).some(([a, b]) => t >= a && t <= b);
  if (o.noBlink !== true && BLINKABLE.has(solid) && !nearChange && !blocked
    && t >= (o.blinkFrom ?? 0.16)) {
    const hit = lifeBlink(t, { seed: o.seed ?? 7, eyes: solid, ...(o.blink || {}) });
    if (hit) { out.eyes = 'closed'; out.blinking = true; }
  }

  return out;
}

/** 视线跳看：到 key.t 已经看过去，之前 dur 秒内「啪」地跳过去，其余时间停住。 */
export function dart(t, keys, o = {}) {
  return eyeDart(t, keys, { dur: 0.09, overshoot: 0.12, ...o });
}

/**
 * 把一条连续的视线函数采样成「停半拍—跳一下」。
 * 用在真的跟着移动物体看的地方（例如车窗上掠过的灯箱）：眼睛还是跟着，
 * 但每 step 秒才更新一次位置，读起来是「看一眼、再看一眼」，不是匀速云台。
 */
export function dartTrack(t, fn, o = {}) {
  const step = Math.max(0.12, o.step ?? 0.32);
  const t0 = o.t0 ?? 0;
  const until = o.until ?? t0 + step * 40;
  const lag = o.lag ?? 0.12;
  const keys = [{ t: t0 - 1, look: fn(t0) }];
  for (let s = t0; s <= until + step; s += step) {
    keys.push({ t: s, look: fn(Math.max(t0, s - lag)) });
  }
  return eyeDart(t, keys, { dur: 0.10, overshoot: 0.08, ...(o.dart || {}) });
}