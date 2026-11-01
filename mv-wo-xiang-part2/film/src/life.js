// life.js —— 可复用的「活着」参数（纯函数，无副作用、无全局状态）
//
// 这一层只算数，不画东西：镜头把返回值喂给 clawd() 的既有参数即可。
// 所有默认值与 clawd() 保持一致：seed 默认 7，身体位移/手臂偏移的单位是 rig 单位（1u），
// 旋转是弧度。默认幅度都刻意很小——生活感来自「一直有、但看不太出来」。
//
// 依赖：无。可以直接 `import { breath, blink, sway, gaze, fidget } from '../src/life.js'`。
//
// ── 最小示例（一个镜头里让角色一直在呼吸、偶尔眨眼、手臂轻摆）──
//
//   import { breath, blink, sway, gaze } from '../src/life.js';
//   import { clawd } from '../src/character.js';
//
//   const t = gt - shot.t0;                 // 镜头内秒数
//   const b = breath(t, { seed: 11 });      // { bodyDy, squash }
//   const s = sway(t, { seed: 11 });        // { armL, armR, rot }
//   const eyes = blink(t, { seed: 11, eyes: 'normal' }) || 'normal';
//   clawd(ctx, {
//     cx, by, u, seed: 11, color: P.orange,
//     bodyDy: b.bodyDy, squash: b.squash,
//     armL: s.armL, armR: s.armR, rot: s.rot,
//     eyes, look: gaze(t - lookChangedAt, { from: 0, to: 0.6 }),
//     mouth: 'smile',
//   });
//
// ── 每个函数 ──
//
// breath(t, o) -> { bodyDy, squash }
//   低频呼吸。bodyDy 直接给 clawd 的 bodyDy（负值=身体略上浮），
//   squash 直接给 clawd 的 squash（1=原样，略小于 1 = 吸气时身体微宽）。
//   o: { period=1.5 秒, amp=0.15u, squashAmp=0.012, phase=0 圈, seed=7 }
//   同一场景的多个角色传不同 seed/phase，就不会同相位。
//
// blink(t, o) -> 'closed' | null
//   按 seed 生成 2–4 秒一次的眨眼窗口；命中时返回 'closed'，否则 null。
//   直接写成 `eyes: blink(t, { eyes: currentEyes }) || currentEyes`。
//   o: { seed=7, slot=3 秒, jitter=1 秒, dur=0.08 秒, phase=0 秒,
//        eyes='normal', enabled=true }
//   当前眼型是 closed/happy/heart 时不眨眼（返回 null）。台词首帧/情绪最高点
//   传 enabled:false 即可停用。
//
// sway(t, o) -> { armL, armR, rot }
//   短臂轻摆 + 极轻的重心侧倾。armL/armR 给 clawd 的同名参数（单位 u，
//   正=向下），rot 给 clawd 的 rot（弧度，绕脚底旋转）。
//   o: { period=2.4 秒, armAmp=0.05u, rotAmp=0.008rad, phase=0 圈, seed=7 }
//
// gaze(dt, o) -> number（look 值）
//   视线延迟：dt = 「目标方向改变」之后经过的秒数。返回这一帧该用的 look。
//   0.08–0.15 秒滞后之后再用 0.1–0.15 秒平滑过去，避免眼睛瞬移。
//   o: { from=0 原 look, to=0 目标 look, lag=0.12 秒, ramp=0.10 秒 }
//   典型：眼睛先动、身体后动——gaze 放在 clawd 的 look，身体姿态晚 lag 秒再改。
//
// fidget(t, o) -> { active, kind, amp, side, t, curve, window }
//   随机小动作的开关与参数（挠头 / 点脚 / 换重心），由镜头自己决定怎么用。
//   o: { seed=7, period=8 秒, dur=1.0 秒, chance=0.55, phase=0 秒,
//        kinds=['head','foot','shift'], enabled=true }
//   active=false 时 kind=null；active=true 时 t 是窗口内进度 0–1，
//   curve = sin(π·t)（0→1→0，可直接乘到动作幅度上），side = ±1。
//   建议：head → 抬一侧短臂；foot → 抬一只脚（clawd.legs 某一位 -0.1u）；
//   shift → 给 bodyDy/cx 叠 0.1–0.2u 的横向或高度偏移。各角色用不同 seed。
//
// expr(t, keys, o) -> { eyes, mouth, brow }（可直接展开进 clawd()）
//   按关键帧输出表情。关键帧是「到这一时刻已经变成这套表情」，过渡发生在前 ramp 秒
//   （end-at-key，和歌词点对齐时最省事）。未写的字段沿用上一关键帧。
//   o: { ramp=0.18 秒, ease=平滑曲线 }
//   输出值要么是原字符串（两端相同，没有过渡），要么是 { a, b, p } 混合值。
//
// browLift(t, o) -> number（给 clawd 的 browDy，单位 rig u，负=向上）
//   一次短促的「抬起—落回」。要配合 brow:'up'/'worried'/'angry' 一起用。
//   o: { at=0 开始秒, dur=0.32 秒, amp=0.35u }
//
// eyeDart(t, keys, o) -> number（给 clawd 的 look）
//   视线在几个方向之间「啪」地跳过去，中间停住，不是匀速平移。
//   keys: [{ t, look }] 或简写 [look0, look1, ...]（用 o.step 等距）；
//   同样 end-at-key：到 t 已经看过去了，之前 dur 秒内完成跳动。
//   o: { dur=0.08 秒, step=0.8 秒, overshoot=0.15, t0=0 秒 }

const TAU = Math.PI * 2;
const NUM = (v, d) => (Number.isFinite(v) ? v : d);
const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = v => { v = clamp01(v); return v * v * (3 - 2 * v); };

// 32 位确定性散列，返回 [0,1)。同一个 (seed, n) 永远同一个值。
function hash01(seed, n) {
  let a = (Math.imul(seed | 0, 374761393) + Math.imul(n | 0, 668265263) + 0x9E3779B9) >>> 0;
  a = Math.imul(a ^ (a >>> 13), 1274126177) >>> 0;
  return ((a ^ (a >>> 16)) >>> 0) / 4294967296;
}

/**
 * 低频呼吸。
 * @param {number} t 时间（秒）
 * @param {object} [o] { period, amp, squashAmp, phase, seed }
 * @returns {{bodyDy:number, squash:number}}
 */
export function breath(t, o = {}) {
  const period = NUM(o.period, 1.5);
  const amp = NUM(o.amp, 0.15);
  const squashAmp = NUM(o.squashAmp, 0.012);
  const phase = NUM(o.phase, 0) + hash01(NUM(o.seed, 7), 1) * 0.35;  // seed 给每只螃蟹一点相位差
  const ph = TAU * (t / period + phase);
  return {
    bodyDy: -amp * Math.sin(ph),
    squash: 1 - squashAmp * Math.sin(ph),   // 吸气（上浮）时身体略宽
  };
}

/**
 * 眨眼：命中窗口返回 'closed'，否则 null。
 * @param {number} t 时间（秒）
 * @param {object} [o] { seed, slot, jitter, dur, phase, eyes, enabled }
 * @returns {'closed'|null}
 */
export function blink(t, o = {}) {
  if (o.enabled === false) return null;
  // 当前眼型已经是闭眼/笑眼/爱心眼时不再叠眨眼
  if (o.eyes === 'closed' || o.eyes === 'happy' || o.eyes === 'heart') return null;
  const seed = NUM(o.seed, 7);
  const slot = Math.max(0.5, NUM(o.slot, 3.0));      // 平均间隔 3s
  const jitter = Math.min(Math.max(0, NUM(o.jitter, 1.0)), slot * 0.45); // 起始点抖动 → 间隔 2–4s
  const dur = Math.max(1 / 48, NUM(o.dur, 0.08));     // 0.08s ≈ 2 帧 @24fps
  const phase = NUM(o.phase, 0);
  const local = t - phase;
  if (local < 0) return null;
  const k = Math.floor(local / slot);
  const start = k * slot + hash01(seed, k) * jitter;
  return local >= start && local < start + dur ? 'closed' : null;
}

/**
 * 短臂轻摆 + 极轻的重心侧倾。
 * @param {number} t 时间（秒）
 * @param {object} [o] { period, armAmp, rotAmp, phase, seed }
 * @returns {{armL:number, armR:number, rot:number}}
 */
export function sway(t, o = {}) {
  const period = NUM(o.period, 2.4);
  const armAmp = NUM(o.armAmp, 0.05);
  const rotAmp = NUM(o.rotAmp, 0.008);
  const phase = NUM(o.phase, 0) + hash01(NUM(o.seed, 7), 2) * 0.5;
  const ph = TAU * (t / period + phase);
  return {
    armL: armAmp * Math.sin(ph),
    armR: -armAmp * Math.sin(ph),
    rot: rotAmp * Math.sin(ph * 0.43 + 1.2),   // 重心侧倾比手臂慢一倍多
  };
}

/**
 * 视线延迟：目标方向改变后，先等 lag 秒，再用 ramp 秒平滑过去。
 * @param {number} dt 目标改变后经过的秒数
 * @param {object} [o] { from, to, lag, ramp }
 * @returns {number} 该帧的 look 值
 */
export function gaze(dt, o = {}) {
  const from = NUM(o.from, 0);
  const to = NUM(o.to, from);
  const lag = NUM(o.lag, 0.12);          // 0.08–0.15 秒
  const ramp = Math.max(0.016, NUM(o.ramp, 0.10));
  if (!(dt > lag)) return from;
  return from + (to - from) * smooth((dt - lag) / ramp);
}

/**
 * 随机小动作：挠头 / 点脚 / 换重心。
 * @param {number} t 时间（秒）
 * @param {object} [o] { seed, period, dur, chance, phase, kinds, enabled }
 * @returns {{active:boolean, kind:string|null, amp:number, side:number,
 *            t:number, curve:number, window:{start:number,end:number}|null}}
 */
export function fidget(t, o = {}) {
  const idle = { active: false, kind: null, amp: 0, side: 1, t: 0, curve: 0, window: null };
  if (o.enabled === false) return idle;
  const seed = NUM(o.seed, 7);
  const period = Math.max(1, NUM(o.period, 8.0));
  const dur = Math.min(Math.max(0.2, NUM(o.dur, 1.0)), period * 0.5);
  const chance = Math.min(Math.max(0, NUM(o.chance, 0.55)), 1);
  const phase = NUM(o.phase, 0);
  const kinds = Array.isArray(o.kinds) && o.kinds.length ? o.kinds : ['head', 'foot', 'shift'];
  const local = t - phase;
  if (local < 0) return idle;

  const k = Math.floor(local / period);
  if (hash01(seed, k * 7 + 3) > chance) return idle;          // 这一轮不做小动作
  const offset = hash01(seed, k * 7 + 4) * (period - dur);
  const start = k * period + offset;
  if (local < start || local >= start + dur) return idle;

  const t01 = (local - start) / dur;
  const kind = kinds[Math.floor(hash01(seed, k * 7 + 5) * kinds.length) % kinds.length];
  return {
    active: true,
    kind,
    amp: 0.6 + 0.4 * hash01(seed, k * 7 + 6),
    side: hash01(seed, k * 7 + 7) < 0.5 ? -1 : 1,
    t: t01,
    curve: Math.sin(Math.PI * t01),
    window: { start: start + phase, end: start + phase + dur },
  };
}

// ── 表情过渡 ────────────────────────────────────────────────────────

const EXPR_FIELDS = ['eyes', 'mouth', 'brow'];
const EXPR_BASE = { eyes: 'normal', mouth: 'none', brow: null };   // clawd 的默认表情

/**
 * 关键帧表情 → 可直接展开进 clawd() 的 { eyes, mouth, brow }。
 * 关键帧语义：t ≥ key.t 时已经是这一套表情，过渡占用 key.t 之前的 ramp 秒。
 * @param {number} t 时间（秒）
 * @param {Array<{t:number, eyes?:string, mouth?:string, brow?:string|null}>} keys
 * @param {object} [o] { ramp=0.18, ease=平滑曲线 }
 * @returns {{eyes:(string|object), mouth:(string|object), brow:(string|object|null)}}
 */
export function expr(t, keys, o = {}) {
  const ramp = Math.max(0, NUM(o.ramp, 0.18));
  const ease = typeof o.ease === 'function' ? o.ease : smooth;
  const now = NUM(t, 0);

  // 没有关键帧：返回 clawd 的默认表情，镜头行为与不传一样。
  if (!Array.isArray(keys) || !keys.length) return { ...EXPR_BASE };

  // 先按时间排序，再把每个关键帧里没写的字段填成上一关键帧的值。
  const sorted = keys.slice().sort((x, y) => NUM(x.t, 0) - NUM(y.t, 0));
  let cur = { ...EXPR_BASE };
  const frames = sorted.map(k => {
    for (const f of EXPR_FIELDS) if (k[f] !== undefined) cur[f] = k[f];
    return { t: NUM(k.t, 0), v: { ...cur } };
  });

  // i = 第一个「t 大于当前时刻」的关键帧（即正在往它过渡的那一帧）
  let i = 0;
  while (i < frames.length && now >= frames[i].t) i++;
  if (i === 0) return { ...frames[0].v };          // 第一帧之前：就是第一帧
  if (i >= frames.length) return { ...frames[i - 1].v };   // 最后一帧之后：停住

  const prev = frames[i - 1].v, next = frames[i].v;
  const start = frames[i].t - ramp;
  if (!(now > start)) return { ...prev };          // 还没进过渡窗口
  const p = ease(clamp01((now - start) / Math.max(ramp, 1e-9)));

  const out = {};
  for (const f of EXPR_FIELDS) out[f] = prev[f] === next[f] ? prev[f] : { a: prev[f], b: next[f], p };
  return out;
}

/**
 * 一次短促的眉毛抬起再落回（给 clawd 的 browDy）。
 * @param {number} t 时间（秒）
 * @param {object} [o] { at=0, dur=0.32, amp=0.35 }
 * @returns {number} rig 单位的 y 偏移，负值=向上，0=不动
 */
export function browLift(t, o = {}) {
  const at = NUM(o.at, 0);
  const dur = Math.max(0.06, NUM(o.dur, 0.32));
  const amp = NUM(o.amp, 0.35);
  const lt = NUM(t, 0) - at;
  if (lt <= 0 || lt >= dur) return 0;
  const x = lt / dur;
  // 0.32 处到顶：起得快、落得慢，抬起来才有「弹」一下的感觉
  const up = x < 0.32 ? smooth(x / 0.32) : 1 - smooth((x - 0.32) / 0.68);
  return -amp * up;
}

/**
 * 视线快速跳看（给 clawd 的 look）：每个关键帧是一次「跳过去」，中间是停顿。
 * @param {number} t 时间（秒）
 * @param {Array<{t:number, look:number}|number>} keys
 * @param {object} [o] { dur=0.08, step=0.8, overshoot=0.15, t0=0 }
 * @returns {number} 该帧的 look 值
 */
export function eyeDart(t, keys, o = {}) {
  const now = NUM(t, 0);
  if (!Array.isArray(keys) || !keys.length) return NUM(o.look, 0);
  const dur = Math.max(1 / 48, NUM(o.dur, 0.08));
  const step = Math.max(1 / 48, NUM(o.step, 0.8));
  const over = NUM(o.overshoot, 0.15);
  const t0 = NUM(o.t0, 0);

  // [{ t, look }] 与 [look0, look1, ...] 两种写法都收
  const ks = keys.map((k, i) => (typeof k === 'number'
    ? { t: t0 + i * step, look: k }
    : { t: NUM(k.t, 0), look: NUM(k.look, 0) })).sort((a, b) => a.t - b.t);

  if (now < ks[0].t) return ks[0].look;
  let i = 0;
  while (i < ks.length && now >= ks[i].t) i++;
  if (i >= ks.length) return ks[ks.length - 1].look;

  const from = ks[i - 1].look, to = ks[i].look, end = ks[i].t;
  const span = Math.min(dur, end - ks[i - 1].t);
  const start = end - span;
  if (now < start) return from;                    // 停顿：还没开始跳
  const x = clamp01((now - start) / Math.max(span, 1e-9));
  const e = 1 - Math.pow(1 - x, 3);                // 前 2 帧就到九成，像「啪」地看过去
  const bulge = over * Math.sin(Math.PI * x);      // 中段略过一点，落定更自然
  return from + (to - from) * (e + bulge);
}