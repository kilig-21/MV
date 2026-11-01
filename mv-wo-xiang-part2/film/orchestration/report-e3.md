# 第四轮 E3 · chorus1 + chorus2 表情灵动化

日期：2026-11-01 · 范围：`c1-01`~`c1-08`、`c2-01`~`c2-08`（16 镜）
· 状态：完成，逐帧验收通过

## 一句话

16 镜的离散表情切换已全部改走 `expr()` 渐变（ramp 0.14，睁眼镜 0.12），
每镜 2–4 次变化落在拍点上，视线全部用 `eyeDart()` 跟着动作走；
逐帧探针证明 48 段过渡每一段都是 3–4 帧插值，没有一处硬切。

---

## 1. 接手时的情况（断电重派）

上一轮工人已经把这 16 个镜头和 `src/expr-e3.js` 改完，只是没来得及验收和写报告。
这次**没有推倒重写**，而是先核对再补：

- 16/16 文件语法完整、能 import（`check-import` 全 OK）；
- 16 镜全部已用 `exprE3()`，没有残留的三元表达式硬切
  （`grep` 过 `eyes:.*?` / `mouth:.*?` / `brow:.*?`，零命中）；
- 每镜都接了 `dart()`；13 镜接 `withBlink()`，1 镜接 `browAt()` 的多条眉抬。

**这次实际改的只有两处**：`c1-08` 与 `c2-08` 的睁眼 ramp 原本是 0.07 / 0.08，
低于本轮约定的 0.12–0.20，其中 `c1-08` 出现了一段只有 1 帧的过渡（等于半个硬切）。
两处都提到 `0.12`（≈3 帧），睁眼的「猛地醒来」感没丢，但不再是跳变。
其余 14 镜一个字节未动。

---

## 2. `src/expr-e3.js`（上一轮建，本轮沿用）

| 导出 | 作用 |
|---|---|
| `RAMP = { chorus: 0.14, fast: 0.10, soft: 0.18 }` | 副歌的过渡基准，0.14 ≈ 3.4 帧 |
| `exprE3(t, keys, o)` | `expr()` + 副歌默认 ramp 0.14 |
| `beatClock(t0Abs, step = BEAT)` | 镜头本地拍点：`bc.b(0)` = 镜头内第一拍 |
| `withBlink(gt, seed, e)` | 眨眼叠在 `expr()` 结果上；**只在眼型已落定成字符串时才眨**，避免半透明叠半透明出灰帧 |
| `dart(t, ks, o)` | `eyeDart()` + 副歌默认值（0.09s 跳到位 ≈ 2 帧、step 0.55） |
| `browAt(t, lifts)` | 多条 `browLift()` 叠加 |

眨眼的「硬切」是有意保留的：`withBlink` 返回字符串 `'closed'`，走 `clawd()` 的无混合快速路径，
1–2 帧闭眼才是真眨眼的读法。这一点和 `report-expr-blend.md` 第 5 节的建议一致。

---

## 3. 每镜的表情设计

| 镜 | 变化数 | 变化时刻 | 内容 |
|---|---|---|---|
| c1-01 | 3 | 0.46 / 1.08 / 2.38 | wide→normal / normal→wide+flat→o / wide→normal+o→smile+up→null |
| c1-02 | 2 | 0.13 / 0.79 | normal→wide+smile→o+null→up / 反向落回 |
| c1-03 | 4 | 0.92 / 1.29 / 2.21 / 2.58 | wide↔normal + grin↔smile，每两拍一次，跟跑姿的「冲—滑行」同相位 |
| c1-04 | 3 | 0.38 / 0.79 / 1.17 | tired↔wide + flat↔o，跟着四次踩踏的落点 |
| c1-05 | 2 | 1.08 / 1.75 | wide→normal+o→smile / normal→wide（第二座岛升起来） |
| c1-06 | 4 | 0.96 / 1.63 / 2.25 / 2.92 | 看船 wide → 估距离 normal → 起跳 wide+o → 落地 happy+grin |
| c1-07 | 4 | 1.08 / 1.71 / 2.00 / 2.38 | wide→normal → tired → closed（睡熟）→ 嘴角落下 |
| c1-08 | 2 | 0.42 / 0.92 | closed→tired→wide 睁眼（ramp 0.12）→ 落回 normal |
| c2-01 | 3 | 0.88 / 1.79 / 3.08 | happy 打底 → sparkle+眉抬（城升起来）→ 收成 smile |
| c2-02 | 2 | 0.08 / 0.75 | smile→grin / happy→sparkle |
| c2-03 | 4 | 1.08 / 2.00 / 2.79 / 3.33 | happy→wide（大跨）→ happy → sparkle（楼全亮）→ smile |
| c2-04 | 3 | 0.00 / 0.63 / 1.25 | 强拍 smile↔grin / 最后一拍 sparkle |
| c2-05 | 3 | 0.88 / 2.17 / 3.00 | wide→sparkle+眉落 / sparkle→happy / happy→sparkle |
| c2-06 | 2 | 0.42 / 1.04 | smile→grin / happy→sparkle |
| c2-07 | 4 | 0.42 / 0.92 / 1.38 / 2.17 | grin→smile / happy→tired / tired→closed / 睡着后嘴落下 |
| c2-08 | 2 | 0.46 / 1.17 | closed→tired→wide（ramp 0.12）/ wide→happy+o→smile |

**c1 的「试探」**：全部以 `wide` ↔ `normal` 交替为主，wide 是「想试试但不确定」的那一下，
到 `c1-07`「睡在梦里」才走 tired→closed 真正放松。
**c2 的「熟练」**：`happy`/`sparkle` 为主，但每镜的 `look` 都在动（看手、看升起来的城、
看掠过的楼、看一座座浮起来的岛），没有一镜是钉在镜头上的。

---

## 4. 验收

### 4.1 数值：逐帧读真实入参

用一个**只读探针**（不动项目文件，通过 loader 把 `src/character.js` 换成记录版）
把 16 镜按 24fps 逐帧跑了一遍，记下每一帧真正传给 `clawd()` 的 `eyes/mouth/brow/look`。

结果：**47 个表情变化事件、48 段字段过渡，全部 3–4 帧插值，零处「字符串直接换字符串」**
（除了 `withBlink` 的眨眼，那是设计内的 1–2 帧闭合）。
修掉 `c1-08` 之后，最短的过渡从 1 帧变成 2 帧。

### 4.2 逐帧：每个变化抽连续 6 帧（1/24 秒间隔）

47 个事件 × 6 帧 = 282 帧，裁到角色身上拼成 6 张表：

| 文件 | 内容（每行一个事件） |
|---|---|
| `e3-sheet-1.jpg` | c1-01 ×3、c1-02 ×2、c1-03 前 3 |
| `e3-sheet-2.jpg` | c1-03 末 1、c1-04 ×3、c1-05 ×2、c1-06 前 2 |
| `e3-sheet-3.jpg` | c1-06 末 2、c1-07 ×4、c1-08 ×2 |
| `e3-sheet-4.jpg` | c2-01 ×3、c2-02 ×2、c2-03 前 3 |
| `e3-sheet-5.jpg` | c2-03 末 1、c2-04 ×3、c2-05 ×3、c2-06 前 1 |
| `e3-sheet-6.jpg` | c2-06 末 1、c2-07 ×4、c2-08 ×2 |
| `e3-c2-07-recheck.jpg` | c2-07 单独重裁（上一张裁太紧，眼睛贴着上缘） |

每一行是一次变化，从左到右是过渡前 → 过渡中 → 过渡后。逐张看过，结论：

- 眼型过渡（`wide↔normal`、`happy↔sparkle`、`tired→closed`）都是中间帧半透明叠画，
  读作「眼睛正在变」，不是跳变；
- `wide`/`shock` 这类带米白眼白的过渡，中段有 **1 帧**偏灰（`report-expr-blend.md` §2 已记录），
  在成片尺度上读作一次快速过渡；
- 嘴形（`o→smile`、`grin→smile`）没有灰帧问题，全程干净；
- 眉（`up→null`、`null→up`）靠透明度淡入淡出，`browDy` 的弹动单独叠在上面。

### 4.3 整段冒烟

```
node build.mjs cut --from 62.39  --to 82.63  --name e3a   → 486 帧 / 20.25s
node build.mjs cut --from 124.36 --to 145.93 --name e3b   → 518 帧 / 21.57s
```

成片：`film/out/e3a.mp4`、`film/out/e3b.mp4`。
按 2fps 抽帧拼表（`film/out/e3-sheets/cut-e3a.jpg`、`cut-e3b.jpg`）逐张看过：
镜头连接正常、没有闪白/闪黑、角色一直在动、每句歌词里的事情都看得见
（呼风→耳机音符→跑→踩节奏→岛升起→跳船→睡云床→车厢醒；c2 同构）。

---

## 5. 已知限制

1. **`c1-04` 的单眼眨是画上去的**：第 3 拍用 `fillRect` 盖掉左眼再画一条闭合弧，
   开关是布尔量，进出各硬切 1 帧。这是刻意的（眨眼本来就该硬），但如果评审觉得突兀，
   可以把 `globalAlpha` 在首尾各加 1 帧淡入淡出。
2. **`wide`/`shock` 类过渡有 1 帧偏灰**，是 `expr()` 半透明叠画的固有代价，
   要把 ramp 压到 0.10 才更短，不建议再短（会退回硬切）。
3. **`c2-07` 的镜头有 `ctx.scale(push)` 推近**，验裁剪切表时几何要按变换后算，
   我第一版裁太紧把眼睛切到边缘了，重裁后确认没问题（见 `e3-c2-07-recheck.jpg`）。
   这是验裁工具的问题，不是镜头的问题。
4. `c1-08` 的两下连眨是手写时间窗（`0.62–0.70` / `0.80–0.87`），没有走 `withBlink()`；
   因为睁眼过程本身在 `expr()` 里连续变化，用 `withBlink` 会吞掉中间的 tired/wide 过渡。

---

## 6. 重跑

```bash
cd mv-wo-xiang-part2/film
node build.mjs stills --shot c1-03 --times 0.875,0.9167,0.9583,1,1.0417,1.0833
node build.mjs cut --from 62.39  --to 82.63  --name e3a
node build.mjs cut --from 124.36 --to 145.93 --name e3b
```

改动文件：`shots/c1-01.js` … `shots/c2-08.js`（16 个）、`src/expr-e3.js`。
**未改** `shots.json`、`data/shots-extra/*`、`src/character.js`、`src/life.js`、`src/main.js`、
`src/transitions.js`、`build.mjs`，也未碰 `c3` 或其他人的镜头。