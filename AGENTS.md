# Anima 项目交接入口

继续《我想 part2》像素 MV 之前，先读取 **`mv-wo-xiang-part2/HANDOFF-ADDENDUM-2026-10-31-1140.md`（最新，补记 11:38 之前的全部进展）**，再读 `mv-wo-xiang-part2/HANDOFF-2026-10-31.md`（01:31 版，其中“纯像素”类验收标准已被 `mv-wo-xiang-part2/film/style-lock/STYLE_LOCK.md` 取代）和 `mv-wo-xiang-part2/PROJECT_CONTEXT.md`（2026-10-29 的历史背景）。新对话的启动提示词见 `mv-wo-xiang-part2/START-PROMPT.md`。

**2026-11-01 11:55 起，全片已完成并经过四轮打磨**：92 镜覆盖 0–281.551771 秒，成片在 `mv-wo-xiang-part2/film/out/wo-xiang-part2.mp4`（1920×1080 / 24 fps / H.264 + AAC）。当前状态、验收记录、已知限制与重跑方法看 `mv-wo-xiang-part2/film/orchestration/STATUS.md` 和 `ASSEMBLY.md`，各段工人的报告在同目录 `report-*.md`，外部评审清单在 `review-*.md`。

做下一支 MV 之前，先读根目录的 **`WORKFLOW-LESSONS.md`**（编排方式、上下文字节、表现力写法、质检手段、失败模式，可直接改造成 skill）。

- 角色唯一源：`mv-wo-xiang-part2/character-lock/official/` 的官方 Clawd on Desk **15×16 像素 base**，已冻结。v2 的长手臂与关节腿、3D 封面版、JPEG 抠图版均已否定。
- 当前阶段：用户已授权新对话独立推进全片，不中途干预。不要再回到“只讨论不制作”。
- 最新画风参考：`mv-wo-xiang-part2/style-reference/`（2D 扁平手绘卡通、粗描边、暖色、简单舞台、小螃蟹有表情、多角色换色）。角色比例仍以官方 base 为准。
- 早期的 `chorus-preview*` 原型已于 2026-11-01 删除（历史文档里仍会提到，路径已不存在，只作记录看）。
- 最新优先级：整个画面随歌词推进；动作自然但不改身体；每句歌词里的事情看得见。
- 时间基准：`assets/source-audio.flac` 281.551771 秒；官方 MV 只作意境参考。
- 用户的后续明确要求优先。不要把交接文档中的助手提议当成用户已批准的决定。
- 项目事实保存在项目中，不据此自动写入个人全局记忆。
- 其他目录/项目的任务应按其自身指令处理，不把这支 MV 的约束套用到无关工作。
- 看图不要直接 Read 渲染原图（单张 PNG 转 base64 后 300–600 KB，40 多张就会撞上 API 的 16 MiB 请求体上限，报 `400 Exceeded limit on max bytes to request body`）。先跑 `python tools/view-image.py <图...>` 生成 768px JPEG 副本，或多帧用 `--grid 4x3 --max 1600` 拼成一张联系人表，再 Read `.cache/view/` 里的产物。用 `/context` 查看占用。
