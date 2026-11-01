# 打磨任务 P4：三次副歌二十四镜（c1-01~08、c2-01~08、c3-01~08）

## 范围
`mv-wo-xiang-part2/film/shots/c1-*.js`、`c2-*.js`、`c3-*.js`，时间 62.39–82.63 / 124.36–145.93 / 188.28–208.24。
先读 `film/orchestration/POLISH-DOCTRINE.md`、`timeline/lyric-analysis.md` 的副歌段、`film/style-lock/STYLE_LOCK.md`、
`report-chorus23.md`（三次逐层放大的方案，不要改回去）。

## 这一段的问题
副歌是想象力爆发，动作幅度大，但现在的动作是"到位就停"，缺少持续张力；
而且三次副歌的情绪应该递进：**c1 试探、c2 熟练、c3 开阔**，现在三次的表情几乎一样。

重点修：
- c1：动作要留一点犹豫（抬手到一半有半帧停顿），表情是期待+不确定（`wide` 与 `normal` 交替）。
- c2：动作连贯到底、幅度更大，表情是享受（`happy`/`sparkle`），嘴角持续上扬。
- c3：动作最舒展，表情是释然（`happy` → 结尾 `closed` 一秒），眼神看向远方而不是镜头。
- 三段的同类动作（抬手、跑、踩节奏、跳上舟）要有不同的节奏型：
  c1 两拍一停，c2 一拍一动，c3 连绵不断。
- "踩疯狂节奏"的节拍圈不能每帧同亮，要有强弱拍（每 4 拍一次大圈）。
- 结尾回车厢睁眼那三镜（c1-08 / c2-08 / c3-08）：睁眼的速度要一次比一次慢，第三次最慢，
  配合"醒在梦境"的留恋。

## 验收
每镜 3 帧 stills + 三段各跑一次 `cut` 冒烟（`--name polish-c1/c2/c3`）+ 整段拼图自查。
报告写 `film/orchestration/report-polish-chorus.md`。完成后按 preamble 发 worker_done。