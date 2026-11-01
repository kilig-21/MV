# W0 · 表情过渡系统（expr blend）

日期：2026-11-01 · 状态：完成，可供分镜工人使用

## 一句话

`clawd()` 的 `eyes` / `mouth` / `brow` 现在除字符串外还接受混合值 `{ a, b, p }`；
`life.js` 新增 `expr()` / `browLift()` / `eyeDart()` 三个纯函数，按关键帧算出这些混合值。
字符串入参走的老路径**一个字节都没变**（6 镜 × 2 帧逐字节比对一致）。

---

## 1. API

### 1.1 `clawd()` 的混合值（`src/character.js`，只加不改）

```js
eyes:  'normal'                             // 老写法，行为完全不变
eyes:  { a: 'normal', b: 'wide', p: 0.35 }  // 先以 1-p 画 a，再以 p 叠画 b
```

- `p <= 0` 等价于纯 `a`，`p >= 1` 等价于纯 `b`，非数值按 0 处理；
- 三个字段（`eyes` / `mouth` / `brow`）各自独立混合，互不牵连；
- `brow` 的 `a` / `b` 可以是 `null`（= 不画），所以“眉毛淡入/淡出”也是连续过渡；
- 有混合字段时，画面按「眼 / 眉 / 嘴 / 腮红+汗滴」四层各画一次（四层不重叠、不依赖彼此的
  canvas 状态，像素结果与单次顺序绘制一致）；没有混合字段时仍是原来那一次调用。

**新增一个可选参数**：`browDy`（rig 单位，负 = 向上，默认 0）——整条眉毛的上下偏移，
给 `browLift()` 用。默认 0 时算法与之前逐像素相同。

### 1.2 `expr(t, keys, o)` → 直接展开进 `clawd()`

```js
import { expr } from '../src/life.js';

const e = expr(t, [
  { t: 0.0, eyes: 'normal', mouth: 'flat' },
  { t: 0.8, eyes: 'squint', mouth: 'smirk' },
  { t: 1.6, eyes: 'wide',   mouth: 'o'   },
], { ramp: 0.18 });

clawd(ctx, { cx, by, u, seed: 11, color: P.orange, ...e });
```

- **关键帧语义是 end-at-key**：`t >= key.t` 时已经完全是这套表情，过渡占用 `key.t` **之前**的
  `ramp` 秒。想和歌词点对齐就直接把时间点当关键帧时间写，不用自己再往前挪。
- `ramp` 默认 `0.18` 秒（24fps ≈ 4.3 帧，符合 POLISH-DOCTRINE 第 6 条「2–4 帧」）；每次调用可覆盖。
- 未写的字段沿用上一关键帧的值；第一个关键帧之前等同于第一个关键帧；最后一个关键帧之后停住
  （关键帧时间可以超出镜头长度）。
- 两端相同的字段直接返回原字符串，不会走混合路径。
- `o.ease` 可换缓动（默认 smoothstep）。
- 纯函数，无副作用、无全局状态；输出恒为 `{ eyes, mouth, brow }` 三个键
  （默认 `'normal'` / `'none'` / `null`，与 `clawd()` 的默认值一致）。

### 1.3 `browLift(t, { at, dur, amp })` → `browDy`

```js
brow: 'up',
browDy: browLift(t, { at: 1.20, dur: 0.32, amp: 0.35 }),
```

- 返回 rig 单位的 y 偏移（负 = 向上），窗口外返回 0；
- 0.32 处到顶（起得快、落得慢），不是对称的正弦；
- 默认 `amp = 0.35u`，`dur = 0.32s`。要配合 `brow:'up' | 'worried' | 'angry'` 才看得见。

### 1.4 `eyeDart(t, keys, o)` → `look`

```js
look: eyeDart(t, [{ t: 0, look: 0 }, { t: 0.6, look: 0.9 }, { t: 1.3, look: -0.7 }]),
// 或简写：
look: eyeDart(t, [0, 0.9, -0.7], { step: 0.7 }),
```

- 每个关键帧是「啪地看过去」，到 `key.t` 时已经到位；之前 `dur`（默认 0.08s = 2 帧）内完成，
  其余时间是停顿——比 `gaze()` 的匀速平移更像真人的跳看；
- 内部用 `easeOutCubic` + 中段 `overshoot`（默认 0.15，比例值）落定，不会匀速滑过去；
- 两个关键帧间隔小于 `dur` 时，`dur` 自动压到间隔。

---

## 2. 实测：发灰问题

样张按 24fps 逐帧抽了最难的 `normal → shock`（眼白 + 缩瞳 + 压线全变），
序列的 p 值是：

```
过渡前 p=0.00 ｜ 42ms p=0.00 ｜ 83ms p=0.14 ｜ 125ms p=0.44 ｜ 167ms p=0.78 ｜ 208ms p=0.98
```

（`out/expr-frames-shock.jpg`，6 格覆盖 0.21s，每格相隔 1/24s）

**实测结论：**

- 只有 **1 帧**（p≈0.44）明显发灰——`wide`/`shock` 的米白眼白以半透明压在半透明的墨色眼型上，
  混出来是灰盘；p≈0.14 那帧只是墨条上浮一层淡淡米色，读作“眼睛正在睁开”，不脏。
- 没有按任务里的备选方案退化成 `p<0.5 只画 a、p>=0.5 只画 b`：那样会在 25% 和 75% 两格之间
  变成真正的硬切，违反 POLISH-DOCTRINE「表情切换用 2–4 帧过渡，不要瞬间跳变」，
  而且用户这次反馈的正是“硬切”。**1 帧（41ms）的半透明在成片尺度（u≈20，眼睛约 20px 宽）
  读作一次快速过渡，不是一段灰糊。**
- 缓解手段是默认缓动用 smoothstep：在过渡窗口两端停留更久、中段更快，
  把“同时半透明”的时间压到 1 帧。
- 如果某个镜头仍嫌那一帧，可以把 `ramp` 压到 `0.10–0.14`（2–3 帧），灰帧更短；
  不建议再短，会退回硬切。

另外已知：`brow:'up' → 'angry'` 这种两条形状差别很大的眉毛，50% 那一帧是两条半透明线叠在
一起，会读成“粗一点的乱线”约 1 帧。同样只在 1 帧内出现。

---

## 3. 回归比对

改 `character.js` 前先把原文件备份到 `film/out/_expr-baseline/character.js.orig`，
然后对 **v1-01 / v2-05 / c1-03 / c3-05 / v3-13 / h2-01** 各渲染 t=0.30 和 t=0.90 两帧
（`node build.mjs stills --shot <id> --times 0.3,0.9`），改动前后逐字节 md5 比对：

```
OK v1-01 t=0.3  OK v1-01 t=0.9
OK v2-05 t=0.3  OK v2-05 t=0.9
OK c1-03 t=0.3  OK c1-03 t=0.9
OK c3-05 t=0.3  OK c3-05 t=0.9
OK v3-13 t=0.3  OK v3-13 t=0.9
OK h2-01 t=0.3  OK h2-01 t=0.9
```

12/12 完全一致。（先验证过渲染本身是确定性的：同一镜同一时刻重复渲染 md5 相同。）
基线图留在 `film/out/_expr-baseline/<shot>/t_0.3.jpg | t_0.9.jpg`，可随时复核。

没有改任何 `shots/*.js`、`main.js`、`transitions.js`、`build.mjs`、`shots.json`、`data/shots-extra/*`。

---

## 4. 样张

| 文件 | 内容 |
|---|---|
| `film/out/contact-expr-blend.jpg`（1920×2262） | 6 组表情 × 5 帧（过渡前 / 25% / 50% / 75% / 过渡后），每格标注实际 p；下面两条时间轴分别测 `eyeDart`（6 格跳看）和 `browLift`（6 格抬起—落回） |
| `film/out/expr-frames-shock.jpg`（1920×520） | `normal → shock` 按 24fps 逐帧（6 帧 = 0.25s），用来看中间帧糊不糊 |

6 组分别是：`normal→wide`、`wide→normal`、`normal→squint`、`happy→sad`、`normal→shock`、
`normal→smirk/up → squint/grin/angry`（嘴+眉同时过渡）。

重跑：

```bash
node mv-wo-xiang-part2/film/tools/render-expr-sheet.mjs            # 主样张
node mv-wo-xiang-part2/film/tools/render-expr-sheet.mjs --frames   # 24fps 逐帧条
```

页面源：`film/expr-sheet/index.html`、`film/expr-sheet/frames.html`，
绘制逻辑：`film/src/expr-demo.js`。

---

## 5. 给分镜工人的用法建议

- 表情变化别再一帧切：把每个情绪写成关键帧，交给 `expr()`。
- 说话/疑问/想起什么 → `browLift()` 叠在 `brow:'up'` 上，`dur: 0.25–0.4`。
- “看这里—看那里” → `eyeDart()`，关键帧放在视线真正落定的时刻。
- 眨眼仍然用 `blink()`；它返回 `'closed'`，是字符串，会走无混合的快速路径——**眨眼不要包进 expr**，
  否则会被拉成 0.18 秒的慢闭眼。需要“眨眼也带过渡”时，用 `expr` 里夹一个 `{ eyes: 'closed' }`
  关键帧，并把那次调用的 `ramp` 调小（0.06–0.08）即可。