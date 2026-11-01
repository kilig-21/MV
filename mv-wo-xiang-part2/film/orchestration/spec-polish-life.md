# 打磨任务 L：角色生命感与表情系统（character.js）

## 范围
`mv-wo-xiang-part2/film/src/character.js`，以及新建 `mv-wo-xiang-part2/film/src/life.js`。
**你是唯一可以改 character.js 的人**，其他五个工人同时在改各自的镜头文件，但都不会碰这个文件。

先读 `film/orchestration/POLISH-DOCTRINE.md`、`film/style-lock/STYLE_LOCK.md`、`timeline/lyric-analysis.md`。

## 要做的事

### 1. 扩充表情词表（只加不改，现有调用必须继续有效）
在现有 `eyes`（normal/wide/look/dot/happy/sad/tired/sparkle/heart/closed/none）基础上新增：
- `shock`：震惊——瞳孔缩小 + 眼白露出 + 上方一条短压线。
- `squint`：怀疑/半眯——上眼睑压低，只露下半个眼。
- `side`：侧目——两只眼整体偏移到一侧，不带动身体（配合 `look` 用）。
- `teary`：委屈——眼睛正常但下缘有一条亮线，可叠 `sweat`。
- `dazed`：走神——瞳孔不对焦，轻微上翻。
`mouth` 新增 `smirk`（一侧嘴角上扬）、`pout`（下唇微凸）。
`brow` 新增 `angry`（内低外高，与现有 `up`/`worried` 并存）。
所有新值都不能破坏旧值；`switch` 里没有匹配时保持原默认行为。

### 2. 新建 `life.js`：可复用的"活着"参数
导出（命名自定，但要有说明）：
- `breath(t, o)` → `{ bodyDy, squash }`：低频呼吸，周期/相位/幅度可配，默认幅度要小（±0.15u 量级）。
- `blink(t, o)` → `'closed' | null`：按 seed 生成 2–4 秒一次的眨眼窗口，返回该帧是否该闭眼。
- `sway(t, o)` → `{ armL, armR, rot }`：短臂轻摆 + 极轻的重心侧倾。
- `gaze(dt)` → 视线延迟：给定目标方向与时间差，返回应该用的 `look` 值（带 0.08–0.15 秒滞后）。
- `fidget(t, o)` → 随机小动作（挠头、点脚、换重心）的开关与参数，供镜头选用。
全部纯函数、无副作用、不依赖全局状态；参数默认值与 `clawd()` 一致。

### 3. 文档
在 `life.js` 顶部写清楚每个函数的用法与一个最小示例，便于其他工人直接 import。

## 约束
- 不许改角色的身体比例、脚数、手臂段数——15×16 冻结。
- 不许改 `clawd()` 已有参数的语义与默认值；只做"新增"。
- 不要动其他 `src/*.js` 与任何 `shots/*.js`。

## 验收
- 新建 `film/src/sheets-life.js` 或复用现有 sheets 机制，渲染一张**表情总表**：
  每个 eyes/mouth 组合一帧，标注名字，输出 `film/out/contact-life-expressions.jpg`。
- 用 `node mv-wo-xiang-part2/film/build.mjs stills --shot v1-12 --times 0.5,1.5` 确认旧镜头没被改坏。
- Read 自己的总表确认表情能读出来。

## 汇报
写 `film/orchestration/report-polish-life.md`：新增的 API 清单、每个表情的一句话说明、示例代码、
表情总表路径。完成后按 preamble 发 worker_done。**做完要尽快报，其他工人等着用你的新表情。**