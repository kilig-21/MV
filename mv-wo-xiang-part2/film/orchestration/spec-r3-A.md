# 第三轮修复 A：verse1 + hook1 + i-05

## 依据
外部评审写了两份清单，先完整读：
- `film/orchestration/review-A-performance.md`（表里属于你镜头的行）
- `film/orchestration/review-B-composition.md`（表里属于你镜头的行）

**你负责的镜头**：`v1-02`、`v1-11`、`v1-14`、`v1-16`、`v1-17`、`v1-18`、`h1-01`、`i-05`。
把两份表里这 8 个镜头的**每一行**都落实，不要挑着做。

## 核心问题（评审原话摘要）
- `v1-14`：安眠药只靠道具，人没有演——整镜没有拿瓶、没有吞咽、没有躺下。
- `v1-11`：全片最重的一句，前 0.8 秒闭眼不动，睁眼是一帧硬切。
- `v1-17`：「睁开眼睛」但眼睛本来就是睁的。
- `h1-01`：招牌亮起时他从不抬头看自己名字那块牌子。
- `i-05`：倒影太小、淹没在暗玻璃里，读不出是倒影。
- `v1-02` / `v1-16`：屏幕特写里手臂被画框切掉一条边。

## 通用规律（评审指出的系统性缺口）
角色在**看镜头**，而不是在**看他正在做的事**。每处都要先给视线落点：眼睛先到，身体再到（
`life.js` 的 `gaze()` 可以直接用，`lag` 给 0.10–0.15 s）。

## 约束
- 只改这 8 个镜头文件 + 自建 `film/src/fix-round3a.js`。
- **不要改** `src/main.js`、`src/transitions.js`、`src/character.js`、`src/life.js`、`build.mjs`、
  `data/shots-extra/*.json` 里别人的片段、其他镜头。
- 时间码不要动（改时间码会打乱全片覆盖）。

## 验收
- 8 镜各 4 帧 stills；
- `cut --from 13.20 --to 23.17 --name r3a-a`（i-05 与 v1-02）与
  `--from 36.15 --to 59.44 --name r3a-b`（v1-09~18）冒烟；
- 每镜用原尺寸（`--width 960`）Read 一次，确认表情读得出来；
- 报告写 `film/orchestration/report-round3-A.md`，完成后按 preamble 发 worker_done。