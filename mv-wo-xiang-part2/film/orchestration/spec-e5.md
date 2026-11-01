# 第四轮 E5：chorus3 + 尾奏 o-03 表情灵动化

## 依据
先读 `film/orchestration/report-expr-blend.md`（`expr()` / `browLift()` / `eyeDart()` / `{a,b,p}` / `browDy`）
和 `film/orchestration/POLISH-DOCTRINE.md`。
**你负责**：`c3-01`~`c3-08`、`o-03`。

## 用户原话
> 不用刻意夸大、也不用做过多表情，就是该什么表情就什么表情，需要一种灵动性。

## 要做的事
1. 把所有离散表情切换改成 `expr()` 渐变（ramp 0.14–0.22）。
2. c3 是三次副歌里最开阔的一次，情绪是**释然**：
   前几镜 `happy` 但眼神看向远方（不是镜头），结尾 `醒在梦境` 是慢睁眼 + 一点留恋（`closed` → `normal` 慢过渡）。
3. `o-03` 站台长椅：他目送列车，表情是平静里带一点空——`dazed` 或 `side`，
   列车走后视线落到地上的报纸。不要做悲伤表演。
4. 视线用 `eyeDart()`；`o-03` 的转头配合视线（先眼后头，间隔 0.1 秒）。
5. 克制：c3 每镜 2–4 次变化，o-03 全镜 2 次就够。

## 约束
- 只改这 9 个镜头文件 + 自建 `film/src/expr-e5.js`。
- 不要改 `src/character.js`、`src/life.js`、`src/main.js`、`src/transitions.js`、`build.mjs`、别人的镜头。
- **`o-04` 正在被另一个工人重做，不要碰它**；`o-01/02/05/06a/06b` 也不要动。
- 时间码、构图、角色比例不动，只动表情与视线。

## 验收
- 围绕每次表情变化抽连续 6 帧（0.1 秒间隔）拼表 Read；
- `cut --from 188.28 --to 208.24 --name e5` 冒烟；
- 报告写 `film/orchestration/report-e5.md`，完成后按 preamble 发 worker_done。