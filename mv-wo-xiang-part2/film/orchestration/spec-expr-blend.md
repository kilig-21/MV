# 任务 W0：表情过渡系统（clawd 表情可插值）

## 为什么做
用户反馈"表情像几个僵硬的表情在切换"。根因：`clawd()` 的 `eyes`/`mouth`/`brow` 是离散字符串，
任何表情变化都是**一帧内的硬切**。要在两套表情之间做 0.1–0.25 秒的过渡，就必须让它们能按比例混合。

## 目标文件
- `mv-wo-xiang-part2/film/src/character.js`（唯一允许改的共享文件，**只做加法**）
- `mv-wo-xiang-part2/film/src/life.js`（新增函数）
- 可新建 `film/src/expr-demo.js` 与一张样张页面用于验证

先读 `film/orchestration/POLISH-DOCTRINE.md`、`film/src/character.js` 现有实现、
`film/src/life.js` 现有 5 个函数。

## 要做的事

### 1. `clawd()` 支持混合值（只加不改）
让 `o.eyes` / `o.mouth` / `o.brow` 除了接受原来的字符串，也接受：

```js
{ a: 'normal', b: 'wide', p: 0.35 }
```

语义：先以 `1 - p` 的透明度画 `a`，再以 `p` 的透明度画 `b`（同一个位置上叠）。
`p<=0` 等价于纯 `a`，`p>=1` 等价于纯 `b`；字符串入参的行为必须与现在**逐像素相同**。
实现要点：
- 把现有 eyes 的 `switch` 抽成一个内部函数 `drawEyes(state)`，在 `ctx.save()/restore()` 里设 `globalAlpha` 调两次；
- mouth、brow 同理；
- 注意 `wide`/`shock` 这类带眼白的眼型两次叠画不能发灰：先画 a 再画 b 时，b 的填充是不透明的，只有 b 的边缘会与 a 混，
  这在 0.1 秒的过渡里读起来正好是"眨眼间变化"。如果实测发灰，就在 p<0.5 时只画 a、p>=0.5 时只画 b，
  并把中间值改成用一个极短的额外过渡层处理——**以实测效果为准，不要教条**。

### 2. `life.js` 新增 `expr(t, keys, o)` 
按关键帧返回可以直接塞进 `clawd()` 的混合值：

```js
const e = expr(t, [
  { t: 0.0, eyes: 'normal', mouth: 'flat' },
  { t: 0.8, eyes: 'squint', mouth: 'smirk' },
  { t: 1.6, eyes: 'wide',   mouth: 'o'   },
], { ramp: 0.18 });   // 0.18 秒内从上一套过渡到下一套
clawd(ctx, { ...e, ... });
```
- `ramp` 默认 0.18 s，可被每次调用覆盖；
- 未指定的字段沿用上一关键帧的值；
- 关键帧时间可以超出镜头长度（镜头末尾的表情会自然停在最后一段）；
- 纯函数、无副作用。

### 3. 顺带补两个"微表情"工具（也是纯函数）
- `browLift(t, { at, dur, amp })`：给眉毛一个短促的抬起再落回，用于"说话轻点/疑问/想起什么"；
- `eyeDart(t, keys, o)`：视线在几个方向之间快速跳（0.06–0.1 秒完成），中间有停顿，
  比匀速平移自然，用于"看这里—看那里"。

## 验收
- 建一个样张页（可复用 `life-sheet/` 的做法），把同一只螃蟹在 6 组表情之间做 0.18 秒过渡，
  每组抽 5 帧（过渡前、25%、50%、75%、过渡后），拼成一张总表 `film/out/contact-expr-blend.jpg`；
- **回归**：随机挑 6 个现有镜头（`v1-01 / v2-05 / c1-03 / c3-05 / v3-13 / h2-01`）各渲染一帧，
  与改动前的产物肉眼比对，必须完全一致（字符串入参路径不能变）；
- Read 自己的拼接表确认过渡是连续的，不是两帧之间跳。

## 约束
- `character.js` **只加不改**：字符串入参的行为、默认值、比例、描边、表情像素位置都不能变。
- 不要改任何 `shots/*.js`（那是下一波工人的活）。
- 不要改 `main.js`、`transitions.js`、`build.mjs`、`shots.json`、`data/shots-extra/*`。

## 汇报
写 `film/orchestration/report-expr-blend.md`：API 说明、最小示例、实测发灰问题怎么解决的、
回归比对结论、过渡总表路径。完成后按 preamble 发 worker_done，**尽快报，四个分镜工人等着用**。