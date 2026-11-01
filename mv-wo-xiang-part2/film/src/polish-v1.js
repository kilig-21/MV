// verse1 打磨用演出原语：呼吸、眨眼、预备—过冲—回落、视线、表情过渡、走路。
// 呼吸/眨眼/摆动/视线统一走 life.js；本文件只补“动作曲线 + 表情状态机 + 群像”。
import { clamp, lerp, smooth, easeOut, hash } from './ink.js';
import { breath as lifeBreath, blink as lifeBlink, sway as lifeSway, gaze as lifeGaze } from './life.js';

export const TAU = Math.PI * 2;

// 可眨的眼型（闭眼/笑眼/爱心眼不叠眨眼）
const BLINKABLE = new Set([
  'normal', 'look', 'tired', 'wide', 'dot', 'sad', 'sparkle',
  'shock', 'squint', 'side', 'teary', 'dazed',
]);
export const canBlink = eyes => BLINKABLE.has(eyes);

// 眼型家族：同一家族内的切换（竖条↔竖条）可以直接换，不必每次都眨眼
const FAMILY = {
  normal: 'bar', look: 'bar', tired: 'bar', sad: 'bar', teary: 'bar', dot: 'dot',
  wide: 'big', shock: 'big', dazed: 'big', side: 'big',
  squint: 'half', closed: 'closed', happy: 'happy', heart: 'heart', sparkle: 'spark',
};
const sameFamily = (a, b) => FAMILY[a] && FAMILY[a] === FAMILY[b];

// 呼吸：身体上下，返回像素（正值=向上），内部走 life.breath（rig 单位）。
export function breathe(t, seed, u, o = {}) {
  const b = lifeBreath(t, { seed, period: o.period ?? 1.6, amp: o.amp ?? 0.15, phase: o.phase ?? 0 });
  return -b.bodyDy * u;
}

// 呼吸的轻微涨缩（直接给 clawd 的 squash）
export function breatheSquash(t, seed, o = {}) {
  return lifeBreath(t, { seed, period: o.period ?? 1.6, phase: o.phase ?? 0 }).squash;
}

// 短臂待机摆动，单位 rig 单位
export function sway(t, seed, o = {}) {
  return lifeSway(t, { seed, period: o.period ?? 2.4, armAmp: o.amp ?? 0.05, phase: o.phase ?? 0 }).armL;
}

// 重心左右移（像素），站立时用；life.sway 的侧倾是弧度，这里换成像素平移
export function weightShift(t, seed, o = {}) {
  const hz = o.hz ?? (0.18 + hash(seed, 6) * 0.16);
  const ph = hash(seed, 7) * TAU;
  return Math.sin(t * TAU * hz + ph) * (o.amp ?? 3);
}

// 眨眼：返回是否闭眼。统一走 life.blink（2–4 秒一次，0.08s≈2 帧）。
export function blink(t, seed, o = {}) {
  if (o.skip) return false;
  return lifeBlink(t, {
    seed,
    eyes: o.eyes ?? 'normal',
    enabled: o.enabled !== false,
    dur: o.dur ?? 0.08,
    slot: o.slot ?? 3.0,
    jitter: o.jitter ?? 1.0,
    phase: o.phase ?? o.start ?? 0.6,
  }) === 'closed';
}

/**
 * 表情状态机：按时间切换眼神/嘴/眉，并在切换瞬间借一次眨眼挡住跳变。
 * events: [{ at, eyes, mouth, brow, blush, sweat }, ...]，按 at 升序。
 * 返回 { eyes, mouth, brow, blush, sweat, changedAt }
 */
export function face(t, events = [], seed = 1, o = {}) {
  const cur = { eyes: o.eyes ?? 'normal', mouth: o.mouth ?? 'none' };
  for (const k of ['brow', 'blush', 'sweat']) if (o[k] !== undefined) cur[k] = o[k];
  let changedAt = -99;
  let prevEyes = cur.eyes;
  for (const e of events) {
    if (e.at > t + 1e-6) break;
    let changed = false;
    for (const k of ['eyes', 'mouth', 'brow', 'blush', 'sweat']) {
      if (k in e && e[k] !== cur[k]) {
        if (k === 'eyes') { prevEyes = cur.eyes; cur.eyes = e[k]; }
        else cur[k] = e[k];
        if (k === 'eyes' || k === 'mouth') changed = true;
      }
    }
    if (changed && !e.snap) changedAt = e.at;
  }
  let eyes = cur.eyes;
  const blocked = (o.noBlinkIn || []).some(([a, b]) => t >= a && t <= b);
  if (t - changedAt < 0.06 && canBlink(eyes) && !sameFamily(eyes, prevEyes)) eyes = 'closed';  // 跨眼型：眨眼过渡
  else if (canBlink(eyes) && !o.noBlink && !blocked && t >= (o.blinkFrom ?? 0.16)
    && blink(t, seed, { ...(o.blink || {}), eyes })) eyes = 'closed';
  return { eyes, mouth: cur.mouth, brow: cur.brow, blush: cur.blush, sweat: cur.sweat, changedAt };
}

// back-out：末端冲过头再回来
export function backOut(k, s = 1.35) {
  k = clamp(k, 0, 1);
  return 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
}

/**
 * 有意图的动作：预备（反向）→ 快速到位 → 过冲 → 回落。
 * 返回值：起点前 0，预备到 -0.12，到位 1+over，安定后 1。
 * start 是“到位”开始的时刻；pre 是此前的反向预备。
 */
export function gesture(t, start, dur = 0.16, o = {}) {
  const pre = o.pre ?? 0.12;
  const settle = o.settle ?? 0.16;
  const over = o.over ?? 0.05;
  const t0 = start - pre;
  if (t <= t0) return 0;
  if (t < start) return -0.12 * easeOut((t - t0) / pre);
  if (t < start + dur) {
    const k = (t - start) / dur;
    const e = 1 - Math.pow(1 - k, 3);
    return lerp(-0.12, 1 + over, e);
  }
  const s = clamp((t - start - dur) / settle, 0, 1);
  return lerp(1 + over, 1, easeOut(s));
}

// 反向的动作（收回、放下）：从 1 回到 0，同样带预备与回落
export function release(t, start, dur = 0.2, o = {}) {
  return 1 - gesture(t, start, dur, { ...o, over: o.over ?? 0.04 });
}

// 落地回弹：0 → 1 → 0，用于脚落地后的重心下沉
export function bounce(t, at, o = {}) {
  const dur = o.dur ?? 0.22;
  const k = (t - at) / dur;
  if (k < 0 || k > 1) return 0;
  return Math.sin(k * Math.PI) * (1 - k * 0.55) * (o.amp ?? 1);
}

// 视线：先动眼，带一点过冲（延迟 + 平滑走 life.gaze）
export function gaze(t, from, to, at, dur = 0.18) {
  return lifeGaze(t - at, { from, to, lag: dur * 0.45, ramp: dur * 0.55 });
}

// 走路四脚：返回每只脚抬起量与身体上下
export function walkCycle(t, o = {}) {
  const hz = o.hz ?? 10;
  const ph = t * hz + (o.ph ?? 0);
  const amp = o.amp ?? 0.22;
  const legs = [Math.sin(ph), Math.sin(ph + Math.PI), Math.sin(ph + 1.15), Math.sin(ph + Math.PI + 1.15)]
    .map(v => v * amp);
  return { legs, bob: Math.abs(Math.sin(ph)) * (o.bob ?? 3), ph };
}

// 单个路人：独立步频、相位、身高、方向；可选“停下来做别的事”
// 返回 { cx, by, u, legs, bob, rot, look }
export function passerby(t, o) {
  const u = o.u ?? 16;
  const speed = o.speed ?? 300;
  const dir = o.dir ?? 1;
  const span = o.span ?? 2600;
  const phase = o.phase ?? 0;
  let x = o.from + dir * (t * speed + phase);
  if (o.wrap !== false) {
    const lo = -300, hi = span;
    const range = hi - lo;
    x = ((x - lo) % range + range) % range + lo;
  }
  const hz = o.hz ?? (11 + hash(o.seed ?? 1, 1) * 4);
  const ph = t * hz + (o.stepPhase ?? hash(o.seed ?? 1, 2) * TAU);
  const legs = [Math.sin(ph), Math.sin(ph + Math.PI), Math.sin(ph + 1.2), Math.sin(ph + Math.PI + 1.2)]
    .map(v => v * (o.amp ?? 0.2));
  const bob = Math.abs(Math.sin(ph)) * 2.4;
  return { cx: x, by: o.by + (o.bobY ?? 0), u, legs, bob, look: o.look ?? dir, ph };
}

// 取一组按时间出现的事件里“当前段”的下标，用于分组动作
export function phaseAt(t, beats) {
  let i = -1;
  for (let k = 0; k < beats.length; k++) if (t >= beats[k]) i = k;
  return i;
}