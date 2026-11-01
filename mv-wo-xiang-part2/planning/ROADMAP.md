# 《我想 part2》2D 动画 MV · 路线图（2026-10-31 重整）

> 本文件是 Multica 项目 `217be955-cebb-47aa-92f5-94c572837b3f` 的路线图正本。
> 画风以 `style-reference/` 三张参考图为准：2D 扁平手绘卡通、粗描边、暖色低饱和、简单几何舞台、角色有表情、多角色换色。
> 角色骨架唯一源：`character-lock/official/` 的官方 Clawd 15×16 base。时间唯一源：`assets/source-audio.flac`，281.551771 秒。

## 一、总原则

1. **画面跟歌词走**：每句歌词对应一件看得见的事或一个看得见的变化；同一背景不连续跨三句。
2. **不改身体**：比例、部件数量、短肢、四脚永远不变；表情只改眼睛/嘴/腮红等局部。
3. **一镜一模块**：每镜独立渲染，不重渲全片；每镜附「角色 vs 官方骨架」对照。
4. **原声**：全程原 FLAC，无旁白/环境音/动作音效/配乐，不改速。
5. **不为等确认停下**：遇到选择选最贴近歌词具体事情的方案，理由写进对应 issue 评论。

## 二、技术基线

| 项 | 锁定值 |
| --- | --- |
| 画布 | 1920×1080，`deviceScaleFactor=1` |
| 帧率 | 24 fps |
| 渲染 | Canvas 2D + Playwright 逐帧（复用 `lemo-opuscar/core/render` still/video） |
| 描边 | 深墨 `#232227`，角色描边≈身高 3%，场景 4–6 px |
| 纸感 | 一次性噪声层，2–4% 不透明度 + 极轻暗角，不脏 |
| 字幕 | 斜切深底框 + 细米色边 + 暖米黄字，居中下方，Noto Sans SC |
| 声音 | 原 FLAC → AAC 256k / 48 kHz |
| 成片 | H.264 yuv420p bt709 + AAC，全长可解码 |

## 三、阶段

### S0 规划重整（CODI-149）
- 目标：审查 CODI-135~148，改/关/新建，把路线图写进 Multica。
- 产物：`planning/ROADMAP.md`、各 issue 描述与评论。
- 状态：本次完成。

### S1 风格样张（CODI-139）
- 目标：把参考图的画风落成可复用绘制原语 + 5 张样张。
- 内容：调色板、描边规则、圆角与手绘抖动、纸感、字幕样式、夜景变体。
- 产物：`film/src/palette.js`、`film/style-lock/STYLE_LOCK.md`、`film/style-lock/sample-01..05.png`、`film/style-lock/contact-sheet.jpg`。
- 验收：粗描边、暖色低饱和、扁平、简单舞台、有纸感；字幕清晰；角色比例不变。
- 依赖：无。

### S2 工程结构（CODI-138）
- 目标：`shots.json` + `shots/` + 单镜渲染 CLI + contact sheet + `SHOT_SPEC.md`。
- 产物：`film/`（index.html、src/、shots/、shots.json、build.mjs、README.md）。
- 验收：新增一镜只加一条记录 + 一个模块；单镜 stills/mp4 可独立输出；contact sheet 带镜号与时间码。
- 依赖：S1 的绘制原语。

### S3 角色表情与多角色（CODI-150）
- 目标：在官方骨架上做表情库（点眼/竖眼/笑眼/圆眼/爱心眼/睡觉 Z/腮红/笑嘴/眉毛/汗滴）与 6 套换色。
- 产物：`film/src/character.js`、`film/character-lock/expressions.png`、`film/character-lock/parity-*.png`（含轮廓 IoU）。
- 验收：任意表情下轮廓与官方 base 一致（IoU ≥ 0.97）；多角色只换色，形状完全一致。
- 依赖：S1。

### S4 第一段主歌 animatic（CODI-146）
- 目标：20.97–59.44 秒，18 句，按 `timeline/storyboard-verse1.md` 出动态分镜，配原声与最终字幕。
- 产物：`film/out/animatic-verse1.mp4`、逐镜 contact sheet、`film/out/animatic-verse1.probe.json`。
- 验收：每句有可见动作；转场链成立；音画同步 ≤ ±0.15 s；字幕无缺口/重叠。
- 依赖：S2、S3。

### S5 首批正式镜头（CODI-147）
- 目标：第一段主歌里 4 个正式镜头（地铁车厢、便利店倒影、舞台光、唱片声波），验证画质与一致性。
- 产物：`film/out/shot-v1-12.mp4` 等单镜 mp4 + stills + `parity-v1-12.png`。
- 验收：单镜 2–6 秒，画面能独立回答对应歌词；角色不走样；画风接近参考图。
- 依赖：S4。

### S6 其余段落（CODI-151 主 issue + 5 个子 issue）
- 顺序：intro/hook → verse2 → chorus1 → verse3 → chorus2+chorus3。
- 每段先出文字分镜（CODI-141/142/143 已有表），再出 animatic，再出正式镜头。
- 产物：`film/out/animatic-*.mp4`、`film/out/shot-*.mp4`、分段 contact sheet。
- 验收：段内每句有归属镜头；三次副歌并排看有递进；同背景不连续跨三句。
- 依赖：S5。

### S7 场景与道具资产库（CODI-145）
- 目标：把反复出现的场景/道具固化为可复用模块，镜头只做引用、位移、调色。
- 产物：`film/src/scene/*.js`、`film/src/props/*.js`、`film/asset-library/contact-sheet.jpg`、`ASSETS.md`。
- 依赖：S5（与 S6 并行）。

### S8 合片与输出（CODI-148）
- 目标：全片拼接、字幕校验、音画同步、技术校验、成片。
- 产物：`film/out/wo-xiang-part2.mp4`、`wo-xiang-part2.srt`、`probe.json`、`decode-check.log`、`contact-sheet-full.jpg`。
- 验收：1920×1080 / 24 fps / H.264+AAC；全长解码无错误；音画同步 ≤ ±0.15 s；字幕无缺口/重叠。
- 依赖：S6、S7；尾奏未定时先留占位。

### S9 尾奏（CODI-144）
- 208.24–281.552 秒，约 73 秒器乐。最后做，不阻塞前面。

## 四、issue 对照

| 编号 | 原状态 | 处理 | 新状态 |
| --- | --- | --- | --- |
| CODI-135 | done | 描述改为“官方 SVG base 冻结”事实记录 | done |
| CODI-136 | done | 保留；评论说明动作库沿用运动曲线，材质重画 | done |
| CODI-137 | in_progress | 保留；22 行待听校不阻塞，标注为已知残差 | in_progress |
| CODI-138 | todo | 重写为 S2 扁平手绘工程结构 | todo → 进行 |
| CODI-139 | in_progress | 重写为 S1 画风锁定 + 5 张样张（去像素化） | in_progress |
| CODI-140 | in_progress | 分镜表已完成；自查冻结 4 个待确认项 | done |
| CODI-141 | todo | 更新为 S6 verse2 分镜 + 镜头，去掉“等用户确认” | todo |
| CODI-142 | todo | 同上，verse3 | todo |
| CODI-143 | todo | 同上，三次副歌（结尾方向由接手 agent 决定并记录） | todo |
| CODI-144 | todo | 保留，暂缓 | todo |
| CODI-145 | todo | 更新为扁平手绘资产库 | todo |
| CODI-146 | todo | 更新为 S4 animatic | todo |
| CODI-147 | todo | 更新为 S5 首批正式镜头 | todo |
| CODI-148 | todo | 更新为 S8 合片 | todo |
| CODI-149 | 新建 | S0 路线图与 issue 重整 | in_progress → done |
| CODI-150 | 新建 | S3 表情库与多角色配色 | todo |
| CODI-151 | 新建 | S6 其余段落镜头制作（父） | todo |
| CODI-152~156 | 新建 | S6 子 issue（intro/hook、verse2、chorus1、verse3、chorus2+3） | todo |

## 五、过时内容（已从 issue 移除）

- “世界层 320×180、像素化、最近邻放大、禁止抗锯齿、禁止半透明”作为唯一画风目标。
- “把 opuscar98.jpg 裁切并像素化”作为角色来源。
- “等用户确认后才进入下一阶段”的阻塞式验收；改为接手 agent 自查 + 把判断写进评论。