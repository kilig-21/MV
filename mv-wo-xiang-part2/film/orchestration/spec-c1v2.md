# Task: c1 + v2 审查、修正、出片

## Target
仓库根 `C:\Users\Lenovo\Desktop\ALLCODE\Anima`，工程 `mv-wo-xiang-part2/film/`。

现状：`film/shots/c1-01..08.js`（8 镜）与 `film/shots/v2-01..18.js`（18 镜）模块已写好，
但只有 stills 探针图，**从未渲染过 mp4**：

- `film/out/contact-v2probe.jpg`（v2 的 18 张 stills，11:36 生成，没人看过）
- `film/out/stills-c1probe/`（c1 的 11 张 stills，02:16）

## Change
1. 先审查这两批 stills：角色比例是否守官方 15×16、有没有长肢、表情是否到位、夜景暖光、
   构图是否穿帮（角色出画、道具飘、阴影错位）。用
   `python tools/view-image.py <图> --grid ...` 拼成小图看，不要直接 Read 原图。
2. 有问题的镜头改 `film/shots/c1-XX.js` / `v2-XX.js`，修完重渲染确认。
3. 把 c1 的 8 镜与 v2 的 18 镜**全部渲染成 mp4**：
   `node mv-wo-xiang-part2/film/build.mjs shot c1-01`
   每镜产出 `film/out/shot-c1-01.mp4` 与 `.probe.json`。
4. 重新生成 c1 与 v2 的 contact sheet（每镜取 2 帧），供总指挥验收。

## Constraints
- 只改 `film/shots/c1-*.js`、`film/shots/v2-*.js`；需要新场景就新建 `film/src/scenes-fix.js`。
- 不要改：`film/shots.json`、`film/build.mjs`、`film/src/` 里已有共享模块、
  `film/shots/v1-*.js`、`v3-*.js`、`c2-*.js`、`c3-*.js`、`i-*.js`、`h*-01.js`（别的工人在做）。
- 不要动 `film/out/` 里已有的 v1 产物。
- 画风以 `film/style-lock/STYLE_LOCK.md` 为准；角色只用 `clawd()`，官方比例。

## Observable acceptance
- 26 个 mp4 全部存在，每个 `.probe.json` 满足：1920×1080、`avg_frame_rate` 24/1、
  `pix_fmt` yuv420p、`color_space` bt709。
- 一张 c1+v2 总拼图，Read 过并逐镜确认。
- 若某镜确实改不动，不要硬交付：在报告里写清镜号与原因。

## 汇报
写 `film/orchestration/report-c1v2.md`：审查结论、改了哪些镜、26 个 mp4 清单、probe 校验结果、
拼图路径、遗留问题。完成后按 preamble 发 `worker_done`。