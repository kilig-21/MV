# 第四轮 E3：chorus1 + chorus2 表情灵动化（16 镜）

## 依据
先读 `film/orchestration/report-expr-blend.md`（`expr()` / `browLift()` / `eyeDart()` / `{a,b,p}` / `browDy`）
和 `film/orchestration/POLISH-DOCTRINE.md`。
**你负责**：`c1-01`~`c1-08`、`c2-01`~`c2-08`。

## 用户原话
> 不用刻意夸大、也不用做过多表情，就是该什么表情就什么表情，需要一种灵动性。

## 要做的事
1. 把所有离散表情切换改成 `expr()` 渐变（ramp 0.12–0.20，副歌节奏快，可以比主歌短一点）。
2. 副歌是"他在想"，表情要有**期待的成分**，不是全程开心：
   - c1（试探）：`wide` 与 `normal` 交替，带一点不确定；唱到"睡在梦里"才放松。
   - c2（熟练）：`happy`/`sparkle` 为主，但眼睛要跟着动作走，不要一直盯着镜头。
3. "踩疯狂节奏"这类节拍镜：表情可以跟着拍子走，每 2 拍变一次，但要靠 `expr()` 过渡，
   不要每帧硬切。
4. 视线用 `eyeDart()`：看手、看天、看脚下的海，不要固定。
5. 克制：每镜 2–4 次变化（副歌比主歌密一点是允许的），但要落在拍子上。

## 约束
- 只改这 16 个镜头文件 + 自建 `film/src/expr-e3.js`。
- 不要改 `src/character.js`、`src/life.js`、`src/main.js`、`src/transitions.js`、`build.mjs`、别人的镜头。
- 时间码、构图、角色比例不动，只动表情与视线。**c3 不在你的范围**（另有工人）。

## 验收
- 围绕每次表情变化抽连续 6 帧（0.1 秒间隔）拼表 Read，确认是过渡不是跳变；
- `cut --from 62.39 --to 82.63 --name e3a` 与 `--from 124.36 --to 145.93 --name e3b` 冒烟；
- 报告写 `film/orchestration/report-e3.md`，完成后按 preamble 发 worker_done。
---

## 重要：这是重派任务
上一次执行本任务的工人被机器断电中断，`shots/` 里可能已经有改到一半的文件。
开工前先 `git`-less 地检查现状：读一遍你要负责的镜头文件，看是否已经用了 `expr()` / `eyeDart()`，
能接着改就接着改，**不要盲目推倒重写**。改完务必确认每个文件语法完整、能 import。
