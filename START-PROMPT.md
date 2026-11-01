# 新对话启动提示词（2026-10-31 画风更新版）

新开一个对话，把下面两段按顺序发给它。第一段是目标，第二段是完整提示词。

---

## 目标词（先发这段）

> 把《我想 part2》做成一支 2D 扁平手绘卡通动画 MV：角色沿用官方 Clawd 的宽扁短肢骨架，按项目里的风格参考做粗黑描边、暖色低饱和、简单几何舞台和丰富表情；画面逐句跟随歌词，动作自然不僵硬；全片夜晚、原歌原声；最终导出 1920×1080 的可播放 mp4。

---

## 完整提示词（再发这段）

```text
你从现在起独立负责《我想 part2》的 2D 动画 MV，直到导出成片。用户不会中途干预，也不会逐条回答你的问题。你要自己推进、自己判断、自己记录。

第一步，先完整读这些文件，不要跳过：
1. C:/Users/Lenovo/Desktop/ALLCODE/Anima/HANDOFF-ADDENDUM-2026-10-31-1140.md（最新，先读这个）
2. C:/Users/Lenovo/Desktop/ALLCODE/Anima/HANDOFF-2026-10-31.md
3. C:/Users/Lenovo/Desktop/ALLCODE/Anima/mv-wo-xiang-part2/style-reference/README.md
4. C:/Users/Lenovo/Desktop/ALLCODE/Anima/mv-wo-xiang-part2/style-reference/ref-subway.png
5. C:/Users/Lenovo/Desktop/ALLCODE/Anima/mv-wo-xiang-part2/style-reference/ref-sunny-split.png
6. C:/Users/Lenovo/Desktop/ALLCODE/Anima/mv-wo-xiang-part2/style-reference/ref-heart-eyes.png
7. C:/Users/Lenovo/Desktop/ALLCODE/Anima/mv-wo-xiang-part2/timeline/timeline.json
8. C:/Users/Lenovo/Desktop/ALLCODE/Anima/mv-wo-xiang-part2/timeline/storyboard-verse1.md

读图前先降采样：每张参考图 600–840 KB，原图直读会把请求体顶到 16 MiB 上限并报 400。这三张是手机截屏、上下有大块播放器黑边，在 Anima 根目录执行
`python tools/view-image.py mv-wo-xiang-part2/style-reference/*.png --width 900 --trim`
然后 Read 生成的 `.cache/view/*-w900-trim.jpg`（每张约 40 KB，已裁掉黑边）。看渲染结果同理，多帧用 `--grid 4x3 --max 1600` 拼联系人表。

第 0 步：先规划，不要直接开做。
- 读 Multica 项目 217be955-cebb-47aa-92f5-94c572837b3f 下的全部 issue（CODI-135 ~ CODI-148）。
- 判断哪些仍然适用，哪些因为画风从“纯像素”改成“粗描边扁平手绘”而过时。
- 允许修改 issue 的标题、描述、优先级、依赖；允许关闭过时项；允许新建 issue。负责人始终保持用户 kilig lee，不要改派给智能体。
- 先把更新后的路线图写进 Multica：阶段目标、依赖、验收、产物路径。至少覆盖：风格样张 → 工程结构 → 第一段 animatic → 首批镜头 → 其余段落 → 合片 → 尾奏。
- 规划完成后再开始风格样张；不要为了规划停下来等用户确认。

如果参考图和旧交接里的“纯像素风”冲突，以参考图和本提示词为准。

目标：
把《我想 part2》做成完整的 2D 动画 MV。画面逐句跟随歌词，每句歌词里的事情要看得见；动作自然、不僵硬；全片夜晚；原歌原声；最终 1920×1080、24 fps、H.264 + AAC。

画风（最重要）：
- 参考 style-reference 的三张图：2D 扁平手绘卡通，粗黑/深色描边，圆角，线条略有手绘抖动。
- 低饱和暖色：米色墙、青蓝窗/座椅、灰粉地面、芥末黄、灰绿、灰粉、淡紫。
- 简单几何舞台：车厢、长椅、窗、门、灯、城市剪影、海和沙，块面清楚，不堆细节。
- 轻微纸感/颗粒可以，但不要脏。
- 不是 3D，不是写实，不强制像素网格。目标是接近参考图的画风，不是一模一样照搬构图。

角色：
- 身体比例沿用官方 Clawd 的宽扁圆角矩形、两只眼睛、两侧单段短臂、四只短脚；不加肘、膝、手掌、鞋，不拉长四肢。
- 可以加粗描边、腮红、笑嘴、眉毛、汗滴、爱心眼、圆眼、睡觉的 Z。
- 表情是重点，不要面瘫。参考图里的小螃蟹有爱心眼、笑嘴、腮红、睡觉的表情，你要做到这个程度。
- 多个角色 = 同一身体换颜色（绿、黄、粉、淡紫等），形状和比例完全一致，只换身体色，可加小配饰。
- 道具（手机、笔、歌词本、药瓶、明信片、耳机、咖啡杯）画成独立物件，挂在左右手挂载点 (0,10)/(15,10) 或场景里，不要为了拿东西改身体。

已经确认、不要再问的事：
- 角色唯一骨架：mv-wo-xiang-part2/character-lock/official/ 的官方 15×16 base；源 SVG 在 official/source-svg/。
- 时间基准：assets/source-audio.flac，281.551771 秒。官方 MV 只作意境参考，不要剪入画面，不要用它的时长。
- 208.24 秒之后是约 73 秒器乐尾奏，最后再做，不阻塞前面。
- 字幕：暗色斜切底框、细米色边、暖米黄字，居中下方；字体用项目内 Noto Sans SC。
- 声音：全程原歌，不新增旁白、环境音、动作音效或配乐，不改速。
- 已否定：v2 的长手臂/肘膝/手掌/长腿；3D；JPEG 或 2D 剧照抠图的角色；paper-moon-mv 的 Remotion 纸艺风格；官方 MV 画面。

硬约束：
- 不要改角色身体，不要为了动作加关节或拉长肢体。
- 不要做成 3D、不要加 3D 光影、不要新增侧面/背面结构。
- 不要重写时间轴；22 行待听校的句子保持原样，除非你有可靠证据。
- 不要删除 v1/v2/v3 历史产物；合格参考是 chorus-preview-v3（只参考字幕和制作管线，不参考它的像素风）。
- 不要只交文字报告。每个阶段都要有可检查的产物：风格样张、contact sheet、单镜 mp4、animatic、或全片片段。

工作方式（重要）：
- 先规划：审查并重整 Multica issue，写出阶段路线图，再开始做。
- 连续推进，不要等用户确认。遇到选择时，选最接近“这句歌词里的具体事情”的方案，并把理由写进对应的 Multica issue 评论。
- 每完成一项，更新 Multica issue 状态，并把产物路径、验证结果写进评论。负责人保持为用户 kilig lee，不要把 issue 改派给智能体。
- 先做 3–5 张风格样张，确认能接近参考图，再做第一段主歌的动态分镜（CODI-146），再做 3–5 个正式镜头（CODI-147）。
- 每个镜头独立可渲染，不要每次全片重渲。
- 每镜输出一张“角色 vs 官方骨架”的对照，防止走样。

优先顺序：
0. 审查并重整 Multica issue 规划（可以改/关/新建），把路线图写进 issue。
1. 读参考图，提取调色板、描边宽度、舞台构成，做 3–5 张风格样张（CODI-139）。
2. 建 shots.json / shots/ / 单镜渲染命令（CODI-138）。
3. 用 storyboard-verse1.md 做第一段主歌 animatic（CODI-146）。
4. 做 3–5 个正式镜头（CODI-147），附角色对照。
5. 按顺序扩展 verse2、chorus1、verse3、chorus2、chorus3（CODI-141/142/143）。
6. 补场景与道具资产库（CODI-145）。
7. 合片、字幕校验、输出（CODI-148）。
8. 尾奏（CODI-144）最后处理。

Multica：
- 项目 ID：217be955-cebb-47aa-92f5-94c572837b3f
- CLI：C:/Users/Lenovo/AppData/Local/Programs/@multicadesktop/resources/app.asar.unpacked/resources/bin/multica.exe
- 常用：issue list --project ... --output json；issue comment add CODI-xxx --content "..."；issue update CODI-xxx --status done --no-start

验收：
- 画风接近参考图：粗描边、暖色、扁平、简单舞台、有纸感。
- 角色比例不变，有表情、有腮红/爱心眼/笑嘴等；多角色只换色。
- 每句歌词有可见的事情或变化；同一背景不连续跨三句。
- 音画同步 ≤ ±0.15 秒；字幕无缺口/重叠。
- 原 FLAC 转码，无新增音效，无改速。
- 1920×1080 / 24 fps / H.264 + AAC；全长解码无错误。

现在开始。先看参考图、做风格样张，再建工程、做第一段主歌的 animatic。不要先向用户汇报计划，直接做；每完成一个阶段再把结果写进 issue。
```

---

## 如果新对话中途卡住，发这段

```text
继续。先读 C:/Users/Lenovo/Desktop/ALLCODE/Anima/HANDOFF-2026-10-31.md 和 mv-wo-xiang-part2/style-reference/README.md，再看当前 Multica issue 的评论，确认上一步的产物路径，然后接着做下一个未完成项。不要重复已经完成的角色、时间轴和第一段分镜；画风以 style-reference 为准；不要改角色比例；遇到选择自己决定并写进 issue。
```