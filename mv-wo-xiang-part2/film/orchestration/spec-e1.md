# 第四轮 E1：intro + verse1 + 两个 hook 的表情灵动化

## 依据
先读 `film/orchestration/report-expr-blend.md`（新 API：`expr()` / `browLift()` / `eyeDart()` /
`clawd({eyes:{a,b,p}})` / `browDy`）和 `film/orchestration/POLISH-DOCTRINE.md`。

**你负责**：`i-01`~`i-05`、`v1-01`~`v1-18`、`h1-01`、`h2-01`。

## 用户原话
> 表情还能再活一点吗？前半段就是几个表情僵硬的切换，不够活和动态。
> 不用刻意夸大、也不用做过多表情，就是该什么表情就什么表情，需要一种灵动性。

## 要做的事
1. **把每一处离散表情切换换成渐变**：现在镜头里大量是
   `eyes: cond ? 'wide' : 'normal'` 这种一帧硬切。改成用 `expr(t, keys, {ramp: 0.12–0.22})`，
   让表情在 3–5 帧里过渡过去。
2. **加"过渡前的准备"**：换表情前 2–4 帧，用 `browLift()` 给一个极轻的眉动，或者让眼睛先动、嘴后动。
3. **视线要有跳动感**：看不同东西之间用 `eyeDart(t, keys)`，不要匀速平移（匀速像机器人转头）。
4. **克制**：每镜表情变化 1–3 次就够，次数多反而假。变化要落在歌词的重音上。
5. 这一段整体情绪是"成名之后的外冷内累"：多给 `tired`/`squint`/`side`/`dazed`，少给 `happy`/`sparkle`。
   `v1-14`（安眠药）、`v1-11`（地铁那句）、`v1-13`（八点半）要给到位的疲惫。

## 约束
- 只改这 25 个镜头文件 + 自建 `film/src/expr-e1.js`。
- **不要改** `src/character.js`、`src/life.js`、`src/main.js`、`src/transitions.js`、`build.mjs`、
  `data/shots-extra/*`、其他人的镜头。新增 API 直接 import 用即可。
- 时间码、构图、角色比例都不动——这一轮**只动表情与视线**。

## 验收
- 每个有角色的镜头，围绕每一次表情变化抽连续 6 帧（间隔 0.1 秒）拼表 Read，
  确认是过渡不是跳变；
- `cut --from 20.97 --to 59.44 --name e1` 冒烟；
- 报告写 `film/orchestration/report-e1.md`，列出每镜改了几处表情、ramp 用了多少。
  完成后按 preamble 发 worker_done。