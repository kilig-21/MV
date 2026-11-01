# -*- coding: utf-8 -*-
"""One-off: rewrite Multica issue descriptions + create the new roadmap issues."""
import json, os, subprocess, sys

M = r"C:/Users/Lenovo/AppData/Local/Programs/@multicadesktop/resources/app.asar.unpacked/resources/bin/multica.exe"
PROJ = "217be955-cebb-47aa-92f5-94c572837b3f"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "issue-desc")
os.makedirs(OUT, exist_ok=True)

def run(args, capture=True):
    r = subprocess.run([M] + args, capture_output=capture, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        print("FAIL", args[:4], r.stdout[-800:], r.stderr[-800:])
        raise SystemExit(1)
    return r.stdout

def desc_file(key, text):
    p = os.path.join(OUT, key + ".md")
    with open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(text.strip() + "\n")
    return p

UPDATES = {}
CREATES = {}

# ---------------------------------------------------------------- CODI-135
UPDATES["CODI-135"] = dict(
    title="01｜【P0·done】官方 Clawd 15×16 骨架基准（冻结）",
    status="done", priority="high",
    description="""
## 最终状态：已冻结（2026-10-29 完成，2026-10-31 描述校正）

角色唯一源是官方 **Clawd on Desk 1.2.0**（作者 `rullerzhou-afk`，AGPL-3.0-only）的
`clawd-static-base.svg`，**15×16 像素网格**，纯 2D 矩形骨架。

> 本 issue 原描述写的是「从 `docs/opuscar98.jpg` 3D 渲染图裁切并像素化」。那条路线已作废：
> 3D 封面派生角色被用户否定。真实来源是官方 SVG，见 `character-lock/official/rig.json`。

## 冻结的骨架（不得改动）

| 部件 | 坐标 / 尺寸 |
| --- | --- |
| 身体 | x2, y6, 11×7 |
| 左臂 / 右臂 | x0, y9, 2×2 / x13, y9, 2×2 |
| 四脚 | x3 / 5 / 9 / 11, y13, 1×2 |
| 左眼 / 右眼 | x4, y8, 1×2 / x10, y8, 1×2 |
| 地面阴影 | x3, y15, 9×1, 50% 黑 |
| 身体色 | `#DE886D` |
| 挂载点 | 左 (0,10)、右 (15,10) |

## 产物

- `character-lock/official/source-svg/`（官方 SVG 原文件）
- `character-lock/official/rig.json`（部件坐标、挂载点、档位）
- `character-lock/official/base-15x16 / 30x32 / 60x64 / 120x128 / 240x256.png`
- `character-lock/official/pose-sheet.png`、`poses.py`、`motion.py`

## 2026-10-31 追加说明

画风改为「粗描边扁平手绘」后，**比例仍是这份骨架**，只是渲染方式从像素格改为圆角矩形 + 粗描边。
比例校验改为轮廓 IoU（见 CODI-150），不再要求像素对齐。

## 不要重开

骨架已冻结。任何镜头都不得另画身体、不得加肘/膝/手掌/鞋、不得拉长四肢。
""")

# ---------------------------------------------------------------- CODI-136
UPDATES["CODI-136"] = dict(
    title="02｜【P0·done】原生比例角色动作库（走/跑/站/坐/跳/蹲/转身）",
    status="done", priority="high",
    description="""
## 状态：已完成（保留）

动作库已交付，产物在 `character-lock/motion/`：
`idle-4f`、`walk-8f`、`walk-8f-mirror`、`run-4f`、`jump-5f`、`sit-1f` 的 png 与逐帧目录。

## 硬约束（继续有效）

- 只允许整体位移、整体旋转（≤8°）、整体缩放、轻微 squash & stretch（≤8%）。
- 不允许新增关节、拉长肢体，不允许画手掌、手肘、膝盖、鞋。
- 走路、跑步时四只短脚必须可见，不能变成两条腿。

## 2026-10-31 画风变更后的处理

像素 sprite 不再直接贴进画面；**沿用它的运动曲线与帧序**，在扁平手绘的矢量骨架上重放
（四脚交替、身体 1 px 起伏、短臂 1–2 px 摆动）。素材本身保留，不删除。

表情扩展与多角色换色见 CODI-150。
""")

# ---------------------------------------------------------------- CODI-137
UPDATES["CODI-137"] = dict(
    title="03｜【P0】以 FLAC 为基准的全曲时间轴与歌词分段",
    status="in_progress", priority="high",
    description="""
## 状态：可用，保留 in_progress（残差已量化，不阻塞制作）

## 唯一时间基准

`assets/source-audio.flac`，**281.551771 秒**，96 kHz / 24 bit / 立体声。
官方 MV 271.125 秒，只作意境参考，**不得**剪入画面或用它的时长。

## 已完成

- `timeline/timeline.json`：82 句 t0/t1/text/section + `sections` + `calibration`。
- `timeline/lyrics-sections.md`：人类可读分段表。
- `timeline/calibration.json`：自动对齐结果。
- 段落起点偏差 ≤ 0.17 s，无全局偏移（不要整体平移）；逐句中位偏差 0.017 s。

## 已知残差（不阻塞）

- **22 行待人工听校**。没有可靠证据前保持原样，不猜、不重写。
- 59/79 行已在 ±0.15 s 内。
- 原「标注每段重音/鼓点」未做；当前不排期，动作落点用段落/句边界与音乐直觉处理。

## 产物路径

`timeline/timeline.json`、`timeline/lyrics-sections.md`、`timeline/calibration.json`

## 验收

任取一句，字幕与起唱同步误差 ≤ ±0.15 s；82 句全部有归属段落，无缺口、无重叠。
""")

# ---------------------------------------------------------------- CODI-138
UPDATES["CODI-138"] = dict(
    title="04｜【P0】【S2】扁平手绘渲染工程：shots.json / 单镜渲染 / contact sheet",
    status="todo", priority="high",
    description="""
## 阶段目标（S2）

把全片拆成互相独立、可单独渲染和替换的镜头单元。上一版 10 秒样片「整段写成一个函数」的结构不再重演。

画风已从纯像素改为 **2D 扁平手绘（粗描边 / 暖色低饱和）**，所以本 issue 的工程基线随之重写。

## 工程结构

`mv-wo-xiang-part2/film/`

```
film/
  index.html            # 唯一页面，暴露 window.READY / window.DUR / window.render(t)
  build.mjs             # 单镜 stills / 单镜 mp4 / 整段 / contact sheet / 合片
  shots.json            # 一条记录 = 一个镜头
  shots/                # 每镜一个 ES 模块，导出 draw(ctx, t, shot)
  src/
    palette.js          # 调色板（CODI-139）
    ink.js              # 描边、圆角矩形、手绘抖动、纸感
    character.js        # 角色绘制与表情（CODI-150）
    subtitles.js        # 字幕渲染
    scene/              # 场景模块（CODI-145）
    props/              # 道具模块（CODI-145）
  out/                  # 单镜与整段产物
```

## shots.json 字段

`id, t0, t1, lyric, section, scene, camera, action, change, transition, assetRefs, module`

## 需要完成

- [ ] 统一镜头接口：`draw(ctx, t, shot)`，t 为全局秒，模块内部用 `t - shot.t0`。
- [ ] `node film/build.mjs film --q shot=v1-12` 只渲染一个镜头：stills + 该镜 mp4。
- [ ] `node film/build.mjs cut --from 20.97 --to 59.44` 渲染一段并接原声。
- [ ] contact sheet：一屏 12 格，标注镜号与时间码。
- [ ] `film/SHOT_SPEC.md`：新增镜头的步骤、允许/禁止事项。
- [ ] 每镜自动输出「角色 vs 官方骨架」对照图。

## 验收标准

- 新增一个镜头 = 加一条 shots.json 记录 + 一个模块，不改其他镜头。
- 单镜渲染不依赖全片。
- contact sheet 能准确标注镜头 id 与时间码。
- 镜头模块不能私自绘制角色身体，只能调用 `src/character.js`。

## 产物路径

`film/**`、`film/SHOT_SPEC.md`、`film/out/contact-*.jpg`

## 依赖

S1 的绘制原语（CODI-139）。无前置阻塞内容。
""")

# ---------------------------------------------------------------- CODI-139
UPDATES["CODI-139"] = dict(
    title="05｜【P0】【S1】锁定扁平手绘画风、字幕与输出规格 + 5 张风格样张",
    status="in_progress", priority="high",
    description="""
## 阶段目标（S1）

把 `style-reference/` 三张参考图的画风落成可复用的绘制原语和 5 张样张，之后所有镜头不得各自为政。

> 原描述里的「纯 2D 像素画风、320×180 世界层、最近邻放大、禁止抗锯齿」已作废。
> 新画风：2D 扁平手绘卡通、粗黑/深色描边、圆角、线条略有手绘抖动、暖色低饱和、简单几何舞台、轻微纸感。

## 要锁定的东西

- [x] 调色板：米色墙 `#F2E3C6`、青蓝 `#4E8FA3`、深青 `#2F6F82`、灰粉地面 `#B98A83`、
      芥末黄 `#E0A93F`、灰绿 `#A8C48C`、灰粉角色 `#E8A0A8`、淡紫角色 `#B9A6D9`、
      描边 `#2B2A2E`、字幕底 `#1E2430`、字幕字 `#F1D9A8`，外加夜景压低版。
- [x] 描边规则：角色描边 ≈ 身高 3%，场景 4–6 px，圆角半径 ≈ 短边 12–20%。
- [x] 手绘抖动：每物件固定种子、低频位移 1–2 px，不做逐帧沸腾。
- [x] 纸感：一次性噪声层 2–4% + 极轻暗角，不脏。
- [x] 字幕：暗色斜切平行四边形底框、细米色边、暖米黄字、居中下方；Noto Sans SC；长句换行规则。
- [x] 输出：1920×1080 / 24 fps / H.264 + AAC，bt709。

## 5 张风格样张（必须真渲染，不是文字）

1. `sample-01` 夜班地铁车厢内（参考 subway 的车厢结构，但内容是本片的）
2. `sample-02` 便利店玻璃与倒影（夜街）
3. `sample-03` 舞台侧幕与闪光灯（远景）
4. `sample-04` 表情样张：爱心眼 / 笑眼 / 睡觉 / 圆眼 + 绿黄粉淡紫四角色
5. `sample-05` 卧室：2Pac 海报、唱片声波

## 验收标准

- 任意两张并排看：描边粗细、色板、颗粒一致。
- 字幕在 1920×1080 下清晰、有斜切底框、无缺口。
- 角色比例与官方 base 一致（轮廓 IoU ≥ 0.97）。
- 与参考图并排看，属于同一种画风。

## 产物路径

`film/style-lock/STYLE_LOCK.md`、`film/style-lock/sample-01..05.png`、`film/style-lock/contact-sheet.jpg`

## 依赖

无。角色绘制原语与 CODI-150 共用 `film/src/character.js`。
""")

# ---------------------------------------------------------------- CODI-140
UPDATES["CODI-140"] = dict(
    title="06｜【P1·done】第一段主歌文字分镜表（20.97–59.44 秒）",
    status="done", priority="medium",
    description="""
## 状态：已完成并冻结（18 句）

产物：`timeline/storyboard-verse1.md`

段落：20.97–59.44 秒，18 句。每句都有时间码、景别、画面内容、动作/变化、转场。

## 2026-10-31 处理

- 画风从纯像素改为**粗描边扁平手绘**；镜头内容不变。表格第 6 行「风格」已按新画风理解。
- 原表末尾 4 个「需要用户确认」项，由接手 agent 自行决定并记录在 issue 评论：
  1. Black God → 唱片声波 + 剪影，不具象成人。
  2. 「骨子里」→ 旧耳机线 + 地铁线路图的光，不改外形。
  3. 洛杉矶 → 机场 + 棕榈树 + 山脊剪影，不加文字招牌。
  4. 舞台 → 侧幕 + 闪光灯，全夜景。
- animatic 阶段若发现某句信息量过大，改表并在评论里写理由，不直接改代码。

## 验收

遮住歌词只看表格，能猜出大致唱的是哪句；18 句全部有归属镜头，无「待定」。
""")

# ---------------------------------------------------------------- CODI-141
UPDATES["CODI-141"] = dict(
    title="07｜【P1】【S6】第二段主歌分镜与镜头（83.32–121.50 秒）",
    status="todo", priority="medium",
    description="""
## 阶段目标（S6 · verse2）

文字分镜 + animatic + 正式镜头。画风按 `style-reference/` 的粗描边扁平手绘，全片夜晚。

## 覆盖歌词

83.32「他还有很多梦想必须实现」→ 121.50「他希望自己名字伴随你的每个日夜」，17 句（以 `timeline/timeline.json` 为准）。

## 重点内容

- 梦想与时间：「但需要时间」。
- 乌云遮太阳：想看见太阳却总有乌云。
- 布鞋与宝钻鞋：别人要镶钻红灯绿酒之鞋，他偏偏钟爱布鞋迈步每个台阶。
- 外公说谦逊；满街忙人等馅饼。
- 错失爱情、把心事埋藏。
- 埋头写词、不喘息；「即使即刻逝世也能出版四张专辑」。
- 父亲递耳机给同事，自豪儿子是说唱巨星——只作为想象，不拍成已发生。
- 结尾重复「希望名字伴随每个日夜」。

## 要求

- 表格字段同 `timeline/storyboard-verse1.md`：时间码 / 景别构图 / 画面内容 / 动作变化 / 转场。
- 从「光鲜」转向「代价」，镜头可以更慢，但不能连续三句同一构图。
- 父亲段用一个镜头即可，不扩展。
- 白天意象（太阳、宝钻鞋的霓虹）在夜景里用灯光/霓虹/屏幕表达，不切白天。

## 验收（自查，不等用户）

- 遮住歌词能猜出段落大意与关键句。
- 17 句全部有归属镜头。
- animatic 每句有可见动作；音画同步 ≤ ±0.15 s。

## 产物路径

`timeline/storyboard-verse2.md`、`film/out/animatic-verse2.mp4`、`film/out/shot-*.mp4`

## 依赖

CODI-139（画风）、CODI-138（工程）、CODI-146/147（管线已验证）。
""")

# ---------------------------------------------------------------- CODI-142
UPDATES["CODI-142"] = dict(
    title="08｜【P1】【S6】第三段主歌分镜与镜头（145.93–188.12 秒）",
    status="todo", priority="medium",
    description="""
## 阶段目标（S6 · verse3）

全曲情绪最重、最接近创作者自白的部分。文字分镜 + animatic + 正式镜头。

## 覆盖歌词

145.93「他到底属于哪？」→ 188.12，约 20 句（以 `timeline/timeline.json` 为准）。

## 重点内容

- 身份回答：属于哪、答案已明、代表智慧、黎明降临前的鸣鸟。
- 地下时期的光辉与寻宝。
- 走向伟大、感知讯号。
- 缺乏物质但不舒服、懂得知足；只有家人才是神赐福的完美艺术。
- 愤怒不会让人升华，只会迷路。
- 无论身处何方、世界多疯狂，别让俗套生活掩盖锋芒。
- 公文包、上班队列、天真随年龄退却。
- 欲望无法拒绝，但不要与恶魔交换对戒。
- 失意时留声机还有音乐，循环伴随每个日夜。

## 要求

- 表格字段同行 06。
- 允许更长镜头和留白，但不能连续三句同一构图。
- 「恶魔 / 对戒」的具体视觉：**由接手 agent 决定并写进评论**，不走宗教化、不出现具象恶魔。
  默认方案：两只小螃蟹交换一枚戒指形霓虹，戒指光熄灭，影子拉长——只暗示，不点明。

## 验收（自查）

- 20 句全部有归属镜头。
- 关键抽象句（属于哪、鸣鸟、恶魔）有具体可拍的视觉方案。
- 黎明意象不破坏「全片夜晚」：用天边一线微光，不做日出。

## 产物路径

`timeline/storyboard-verse3.md`、`film/out/animatic-verse3.mp4`、`film/out/shot-*.mp4`

## 依赖

CODI-139、CODI-138、CODI-147。
""")

# ---------------------------------------------------------------- CODI-143
UPDATES["CODI-143"] = dict(
    title="09｜【P1】【S6】三次副歌分镜与镜头（62.39 / 124.36 / 188.28 秒）",
    status="todo", priority="medium",
    description="""
## 阶段目标（S6 · chorus）

三次副歌歌词相同，画面必须逐次打开，不能重复同一段动画。

## 覆盖区间

- chorus1：62.39–82.63（呼风唤雨 / 用奇妙旋律 / 一日千里 / 踩疯狂节奏 / 遨游四海 / 让音乐做舟 / 睡在梦里 / 醒在梦境）
- chorus2：124.36–145.40
- chorus3：188.28–208.24

## 要求

- 每句对应一个明确动作或场景变化，不允许整段只是「在音符上跳」。
- 三次递进：第一次试探、第二次熟练、第三次开阔。
- 音符、风、雨、舟、海等幻想元素必须**由生活物件长出**（耳机线、车票、唱片、被子、窗），不能凭空出现。
- 每次的「醒在梦境」都要有收束，三次处理不能完全一样。
- 结尾方向由接手 agent 决定并记录：默认「回到地铁睁眼」，与 verse1 的地铁形成闭环，不做「仍在梦里」的二重反转。

## 验收（自查）

- 三次副歌并排看，能看出差异。
- 每句都有可执行的动作或场景，不是抽象情绪。
- 副歌里的幻想段仍保持全片夜晚基调（更亮、更暖，但不切白天）。

## 产物路径

`timeline/storyboard-chorus1.md`、`timeline/storyboard-chorus2.md`、`timeline/storyboard-chorus3.md`、
`film/out/animatic-chorus1.mp4` 等、`film/out/shot-*.mp4`

## 依赖

CODI-139、CODI-138、CODI-147。建议在 verse2 之后做。
""")

# ---------------------------------------------------------------- CODI-144
UPDATES["CODI-144"] = dict(
    title="10｜【P3】【S9】尾奏 208.24–281.55 秒画面方案（暂缓）",
    status="todo", priority="low",
    description="""
## 背景

FLAC 在最后一句歌词（208.24 秒「醒在梦境」）之后仍有约 **73.312 秒**器乐尾奏，LRC 无对应歌词。
官方 MV 的额外画面不作为依据。

## 状态

用户明确说这一段最后再做。本 issue 不排期、不阻塞前面任何工作。

## 启动后再做

- [ ] 确认尾奏是纯器乐，还是包含未录入歌词。
- [ ] 画面方向：继续叙事 / 留白收尾 / 只保留环境与角色静默。
- [ ] 给出 2–3 个方案并选定一个，写理由。

## 验收

选定方案后进入分镜与制作。当前保持 todo。

## 依赖

无，属收尾项。合片时若未完成，先留占位并在 CODI-148 标注。
""")

# ---------------------------------------------------------------- CODI-145
UPDATES["CODI-145"] = dict(
    title="11｜【P1】【S7】扁平手绘场景与道具资产库",
    status="todo", priority="medium",
    description="""
## 阶段目标（S7）

把反复出现的场景和道具做成可复用模块，避免每个镜头重画，保证全片一致。
画风：粗描边、扁平、暖色低饱和、简单几何块面，**每个场景分前景/中景/背景三层**。

## 清单（按歌词实际需要增删）

- 场景：夜班地铁车厢（内/窗外）、夜街与便利店、出租屋卧室、小舞台侧幕、健身房、地下排练室、
  机场登机口、码头/江边、音符梦境、纸舟水面。
- 道具：手机（含三个学英语 App 界面）、耳机、蓝围巾、布鞋、2Pac 海报、安眠药瓶、歌词本与笔、
  台灯、留声机、明信片、签名笔、行李箱、泡面、合同、旧相机。
- 角色配件：耳机与围巾沿用 A 方案，不新增。

## 要求

- 每个资产一个 ES 模块，导出 `draw(ctx, t, opts)`，标注原生尺寸、色板、静态/可动。
- 镜头只允许引用、位移、缩放、调色；不重绘结构。
- 角色相关资产只能来自 `film/src/character.js`。

## 验收

- 每个场景至少一张入库图 + 使用说明。
- 同一场景在两个镜头里并排看，结构一致。
- 资产 contact sheet 一屏可看全。

## 产物路径

`film/src/scene/*.js`、`film/src/props/*.js`、`film/asset-library/ASSETS.md`、`film/asset-library/contact-sheet.jpg`

## 依赖

CODI-139 的绘制原语。可与 S6 并行。
""")

# ---------------------------------------------------------------- CODI-146
UPDATES["CODI-146"] = dict(
    title="12｜【P1】【S4】第一段主歌 animatic（20.97–59.44 秒）",
    status="todo", priority="medium",
    description="""
## 阶段目标（S4）

用 `timeline/storyboard-verse1.md` 的 18 句，做一版**扁平手绘**的动态分镜，配原声与最终字幕，
检验节奏、信息量和「画面跟歌词走」。

## 需要完成

- [ ] 18 格全部有画面（可以是简化版场景，但必须用最终画风的原语，不是像素草图）。
- [ ] 按 t0/t1 排到 FLAC 上，输出 20.97–59.44 秒片段。
- [ ] 字幕按最终样式叠加（斜切底框 + 米黄字）。
- [ ] 每格至少一个可见动作或变化，不允许整句定格。
- [ ] 输出逐镜时间条、contact sheet、probe。

## 检查点

- 哪句信息太多看不清；哪句停太久、哪句切太快。
- 转场链是否成立：玻璃反光 → 手机 → LAX → 合同 → 抽屉 → 便利店 → 签名 → 明信片 → 舞台 → 排练室 → 身体 → 地铁 → 人群 → 8:30 → 健身房 → App → 海报 → 唱片。
- 同一背景不得连续跨三句。

## 验收（自查，不等用户）

- 播放时不看歌词也大致知道在唱什么。
- 音画同步 ≤ ±0.15 s，字幕无缺口/重叠。
- 角色比例与官方骨架一致。

## 产物路径

`film/out/animatic-verse1.mp4`、`film/out/animatic-verse1.probe.json`、`film/out/contact-verse1.jpg`

## 依赖

CODI-138（工程）、CODI-139（画风）、CODI-150（角色表情）。
""")

# ---------------------------------------------------------------- CODI-147
UPDATES["CODI-147"] = dict(
    title="13｜【P1】【S5】首批正式镜头（4 镜，附角色对照）",
    status="todo", priority="medium",
    description="""
## 阶段目标（S5）

animatic 通过后，先做 4 个正式镜头，验证画质、管线与角色一致性，再批量推进。

## 镜头选择（第一段主歌）

1. `v1-01` 便利店玻璃倒影（近景，夜街）— 21.89 s 前，约 0.92 s 太短，扩到 1.5 s 内做动作接。
2. `v1-12` 夜班地铁车厢（中景）— 41.39–44.05。
3. `v1-09` 舞台侧幕与闪光（远景，慢拉）— 36.15–37.51。
4. `v1-18` 唱片与声波（特写，慢拉）— 56.69–59.44。

覆盖：近景 / 中景 / 远景 / 特写，室内外各一。

## 需要完成

- [ ] 每镜独立模块，引用 `src/character.js` 与资产模块，不另画角色。
- [ ] 输出 stills、单镜 mp4（1920×1080 / 24 fps）、与原声对齐的片段。
- [ ] 每镜附「角色轮廓 vs 官方 base」对照图（含 IoU 数值）。
- [ ] 记录渲染耗时与可复用点。

## 验收标准

- 角色与官方 base 一致（IoU ≥ 0.97），无长肢、无关节。
- 画面能独立回答对应歌词。
- 画风接近 `style-reference/`：粗描边、暖色低饱和、扁平、有纸感。
- 字幕在该镜时间码内正确显示。

## 产物路径

`film/out/shot-v1-01.mp4`、`shot-v1-12.mp4`、`shot-v1-09.mp4`、`shot-v1-18.mp4`、
`film/out/parity-v1-*.png`、`film/out/contact-v1-batch.jpg`

## 依赖

CODI-146 通过；使用 CODI-135 / 136 / 139 / 150 的资产。
""")

# ---------------------------------------------------------------- CODI-148
UPDATES["CODI-148"] = dict(
    title="14｜【P2】【S8】全片合片、字幕校验与输出",
    status="todo", priority="medium",
    description="""
## 阶段目标（S8）

所有镜头完成后，按 FLAC 时间轴合片，做完整技术校验与交付。

## 需要完成

- [ ] 按 `timeline.json` 的时间码拼接，无黑帧、无重复帧、无音画漂移。
- [ ] 字幕全片连续：无缺口、无重叠、无错字；逐句核对 LRC 文本。
- [ ] 音频为原 FLAC 转码（AAC 256k / 48 kHz），无新增音效、无改速。
- [ ] 输出 1920×1080 / 24 fps / H.264 yuv420p bt709 + AAC。
- [ ] 全长解码无错误（`ffmpeg -v error -i out.mp4 -f null -` 无输出）。
- [ ] 抽查关键时间点：画面切点与歌词起唱误差 ≤ ±0.15 s。
- [ ] 输出 full contact sheet、片尾 credits（角色来源、字体许可、歌曲版权说明）。
- [ ] 尾奏（CODI-144）若未定，先留占位并在本 issue 标注。

## 验收标准

- 全片播放音画同步 ≤ ±0.15 s。
- 无角色走样镜头（每镜 parity 图齐全）。
- 同一背景不连续跨三句（全片复查）。
- 全长解码无错误。

## 产物路径

`film/out/wo-xiang-part2.mp4`、`film/out/wo-xiang-part2.srt`、`film/out/wo-xiang-part2.probe.json`、
`film/out/decode-check.log`、`film/out/contact-sheet-full.jpg`

## 依赖

S6 全部镜头、S7 资产库；尾奏不阻塞。
""")

# ---------------------------------------------------------------- new issues
CREATES["CODI-new-149"] = dict(
    title="00｜【P0】【S0】路线图与 issue 重整（2026-10-31）",
    status="done", priority="high",
    description="""
## 阶段目标（S0）

画风从「纯像素」改为「2D 扁平手绘、粗描边、暖色低饱和」后，审查 CODI-135~148，
清理过时内容，补上缺失的环节，把完整路线图写进 Multica。

## 处理结果

| issue | 处理 |
| --- | --- |
| CODI-135 | 描述校正为「官方 SVG 15×16 base 冻结」，删除 opuscar98.jpg 3D 派生路线 |
| CODI-136 | 保留 done；说明运动曲线沿用、材质重画 |
| CODI-137 | 保留 in_progress；22 行待听校标注为已知残差 |
| CODI-138 | 重写为 S2 扁平手绘工程结构 |
| CODI-139 | 重写为 S1 画风锁定 + 5 张样张（去像素化） |
| CODI-140 | 冻结 18 句分镜表，4 个待确认项由接手 agent 定案 |
| CODI-141/142/143 | 改为「分镜 + 镜头」，去掉阻塞式「等用户确认」 |
| CODI-144 | 保留暂缓 |
| CODI-145 | 改为扁平手绘资产库 |
| CODI-146/147/148 | 按新画风与阶段重写 |
| CODI-150 | 新建：表情库与多角色配色（原缺口） |
| CODI-151~156 | 新建：其余段落镜头制作（原缺口——141/142/143 只覆盖文字分镜，没有镜头制作项） |
| 新增 | intro（0–20.97）与 hook 段原本无人负责，纳入 CODI-152 |

## 路线图正本

`planning/ROADMAP.md`

S1 风格样张 → S2 工程结构 → S3 表情库 → S4 第一段 animatic → S5 首批镜头 →
S6 其余段落 → S7 资产库 → S8 合片 → S9 尾奏。

## 关键判断

- 纯像素世界层 320×180、最近邻放大、禁止抗锯齿等规则**不再是画风目标**，只保留「角色比例来自官方 base」。
- 所有 issue 的验收去掉「用户确认后才继续」；由接手 agent 自查并把理由写进评论。
- 负责人保持 `kilig lee`，不改派给智能体。
""")

CREATES["CODI-new-150"] = dict(
    title="15｜【P1】【S3】角色表情库与多角色配色（粗描边扁平版）",
    status="todo", priority="high",
    description="""
## 阶段目标（S3）

在官方 15×16 骨架上，把角色做成扁平手绘的单一绘制模块，支持表情与换色。
这是全片「不面瘫」和「多角色」的基础设施。

## 必须支持的部件（全部来自 `character-lock/official/rig.json` 的比例）

- 身体：圆角矩形，x2 y6, 11×7 → 统一描边（≈身高 3%）
- 短臂：左右各 2×2，可上下/前后 1–2 px
- 四脚：x3 / 5 / 9 / 11, 1×2，可交替抬起
- 眼睛：默认黑色竖条；支持 点眼 / 竖眼 / 圆眼 / 笑眼（^ ^）/ 爱心眼 / 睡觉（闭眼 + Z）/ 惊讶圆眼
- 嘴：无 / 微笑弧 / 张嘴笑 / 小 o 形 / 波浪嘴
- 附加：腮红、眉毛、汗滴、爱心气泡

## 多角色

同一身体换色，形状与比例完全一致：
绿 `#A8C48C`、黄 `#E0A93F`、粉 `#E8A0A8`、淡紫 `#B9A6D9`、主角橙 `#DE886D`、青 `#4E8FA3`。
只允许换身体色 + 小配饰（围巾/耳机/帽子），不得改轮廓。

## 需要完成

- [ ] `film/src/character.js`：`drawClawd(ctx, x, yBottom, {scale, color, eyes, mouth, blush, look, armL, armR, legs, squash, rotate})`。
- [ ] 单一边缘描边：外形用并集轮廓描边，**不能**出现部件之间的内线。
- [ ] 表情总表 `film/character-lock/expressions.png`（至少 8 种）。
- [ ] 换色总表 `film/character-lock/palette-characters.png`（6 色同一姿势）。
- [ ] 与官方 `base-240x256.png` 的轮廓对照 + IoU 脚本（`film/tools/parity.py`）。
- [ ] 动态姿势：走 / 跑 / 站 / 坐 / 跳 / 蹲 / 转身，沿用 CODI-136 的帧序与曲线。

## 验收

- 任意表情、任意颜色下，轮廓与官方 base 的 IoU ≥ 0.97。
- 眼睛数量始终 2；四脚始终 4；两臂始终 2；无肘膝手掌。
- 表情在小尺寸（画面里 120 px 高）仍可辨认。

## 产物路径

`film/src/character.js`、`film/character-lock/*.png`、`film/tools/parity.py`

## 依赖

CODI-135 的 rig、CODI-139 的描边/调色板。
""")

CREATES["CODI-new-151"] = dict(
    title="16｜【P1】【S6】其余段落镜头制作（父 issue）",
    status="todo", priority="medium",
    description="""
## 阶段目标（S6）

第一段主歌之外的全部有词段落 + 前奏，按顺序做成 animatic 与正式镜头。

## 顺序

1. intro 0–20.97 + hook1 59.44–62.39 + hook2 121.50–124.36（CODI-152）
2. verse2 83.32–121.50（CODI-153）
3. chorus1 62.39–82.63（CODI-154）
4. verse3 145.93–188.12（CODI-155）
5. chorus2 124.36–145.40 + chorus3 188.28–208.24（CODI-156）

## 共同要求

- 每段先文字分镜（CODI-141/142/143 已覆盖 verse2/verse3/副歌；intro 与 hook 在本组内新写）。
- 每段出 animatic（配原声 + 最终字幕），再出正式镜头。
- 每句有可见动作；同一背景不连续跨三句。
- 每镜附角色对照；单镜可独立渲染。

## 验收

- 五段全部有 animatic 与正式镜头，`shots.json` 里无缺号。
- 全片从 0 到 208.24 秒无空镜。
- 各段画风一致（描边、色板、颗粒）。

## 依赖

CODI-147 验证完管线后开始。
""")

CREATES["CODI-new-152"] = dict(
    title="17｜【P1】【S6.1】intro 与 hook 段（0–20.97 / 59.44–62.39 / 121.50–124.36）",
    status="todo", priority="medium",
    description="""
## 覆盖

- intro：0–20.97 s（无正式歌词，17.08 有一句 meta 文本）
- hook1：59.44–62.39（1 句）
- hook2：121.50–124.36（1 句）

这三段此前没有人负责，是路线图补上的缺口。

## 方向

- intro：夜晚城市 → 一列地铁进站 → 车窗里的 Clawd。用环境建立「全片夜晚 + 蓝绿城市 + 暖灯」，
  17.08 秒那句 meta 文本如为歌词则出字幕，否则只做画面。
- hook：两句短句，各一个动作落点，作为 verse → chorus 的推门动作。
- 不做标题卡、不做演职员表（放片尾）。

## 产物

`timeline/storyboard-intro-hooks.md`、`film/out/animatic-intro.mp4`、`film/out/animatic-hook1.mp4`、`film/out/shot-*.mp4`

## 验收

- intro 不空镜、不重复同一构图超过 8 秒。
- 与 verse1 开头（v1-01 夜街）在空间上接得上。

## 依赖

CODI-147。
""")

CREATES["CODI-new-153"] = dict(
    title="18｜【P1】【S6.2】verse2 镜头制作（83.32–121.50）",
    status="todo", priority="medium",
    description="""
## 覆盖

verse2 全段 17 句，文字分镜见 CODI-141 的产物 `timeline/storyboard-verse2.md`。

## 需要完成

- [ ] animatic（配原声 + 字幕）`film/out/animatic-verse2.mp4`
- [ ] 正式镜头，逐镜 mp4 + stills + 角色对照
- [ ] 更新 `shots.json` 并为每镜填 scene/action/change/transition

## 验收

每句有归属镜头；父亲段只一镜；全段无连续三句同构图；音画同步 ≤ ±0.15 s。

## 依赖

CODI-141 的分镜表、CODI-147 的管线。
""")

CREATES["CODI-new-154"] = dict(
    title="19｜【P1】【S6.3】chorus1 镜头制作（62.39–82.63）",
    status="todo", priority="medium",
    description="""
## 覆盖

第一次副歌 8 句。文字分镜见 CODI-143 的 `timeline/storyboard-chorus1.md`。

## 方向

第一次副歌是「试探」：幻想元素刚长出来，角色动作还笨拙，梦境空间小、边界清楚。

## 需要完成

- [ ] animatic `film/out/animatic-chorus1.mp4`
- [ ] 正式镜头 + 角色对照
- [ ] 与 verse2 / verse1 的转场（hook1 → chorus1，chorus1 → verse2）对齐

## 验收

每句有动作；结尾「醒在梦境」有收束；与 chorus2/chorus3 并排能看出差别。

## 依赖

CODI-143、CODI-147。
""")

CREATES["CODI-new-155"] = dict(
    title="20｜【P1】【S6.4】verse3 镜头制作（145.93–188.12）",
    status="todo", priority="medium",
    description="""
## 覆盖

verse3 全段约 20 句，文字分镜见 CODI-142 的 `timeline/storyboard-verse3.md`。

## 需要完成

- [ ] animatic `film/out/animatic-verse3.mp4`
- [ ] 正式镜头 + 角色对照
- [ ] 「恶魔 / 对戒」按 CODI-142 定下的方案执行，不加宗教符号

## 验收

20 句全部有镜头；抽象句有具体视觉；全段夜晚；音画同步 ≤ ±0.15 s。

## 依赖

CODI-142、CODI-147。
""")

CREATES["CODI-new-156"] = dict(
    title="21｜【P1】【S6.5】chorus2 + chorus3 镜头制作（124.36–145.40 / 188.28–208.24）",
    status="todo", priority="medium",
    description="""
## 覆盖

第二次（124.36–145.40）与第三次（188.28–208.24）副歌，各 8 句。

## 方向

- chorus2「熟练」：梦境空间变大，动作更顺，色彩更暖。
- chorus3「开阔」：最亮、最远，结尾回到地铁睁眼，与 verse1 的 v1-12 形成闭环，
  然后接尾奏（CODI-144）。

## 需要完成

- [ ] 两段 animatic
- [ ] 两段正式镜头 + 角色对照
- [ ] chorus3 结尾与尾奏的衔接点（208.24 s）确认

## 验收

三次副歌并排看有明显递进；chorus3 收束完整，可直接进入尾奏。

## 依赖

CODI-143、CODI-154。
""")

# ---------------------------------------------------------------- apply
def apply():
    results = []
    for key, spec in UPDATES.items():
        p = desc_file(key, spec["description"])
        args = ["issue", "update", key, "--description-file", p,
                "--title", spec["title"], "--priority", spec["priority"],
                "--status", spec["status"], "--no-start", "--output", "json"]
        out = run(args)
        j = json.loads(out)
        results.append((key, "updated", j.get("identifier"), j.get("status")))

    for key, spec in CREATES.items():
        p = desc_file(key, spec["description"])
        args = ["issue", "create", "--project", PROJ, "--title", spec["title"],
                "--description-file", p, "--priority", spec["priority"],
                "--status", spec["status"], "--assignee", "kilig lee",
                "--output", "json"]
        out = run(args)
        j = json.loads(out)
        results.append((key, "created", j.get("identifier"), j.get("id")))
    print(json.dumps(results, ensure_ascii=False, indent=1))

if __name__ == "__main__":
    apply()