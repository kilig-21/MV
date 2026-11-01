# Task: verse3 前半（v3-01 ~ v3-10）

## Target
仓库根 `C:\Users\Lenovo\Desktop\ALLCODE\Anima`，工程在 `mv-wo-xiang-part2/film/`。

你负责第三段主歌的前 10 个镜头（145.93–166.41 秒），分镜表在
`mv-wo-xiang-part2/timeline/storyboard-verse3.md`，只做 v3-01 到 v3-10。

## Change
1. 新建 10 个镜头模块 `mv-wo-xiang-part2/film/shots/v3-01.js` … `v3-10.js`。
2. 新建清单片段 `mv-wo-xiang-part2/film/data/shots-extra/verse3a.json`，
   形如 `{ "shots": [ {...}, ... ] }`，每个元素带这些字段，照抄现有条目风格：
   `id, t0, t1, lyric, section:"verse3", scene, camera, action, change, transition, module:"./shots/v3-01.js", assets`
3. t0/t1 严格用分镜表里的时间，不要自己估。
4. 每镜至少渲染 2 帧核对，最后拼一张总表。

## Constraints
- 1920×1080，24 fps，全片夜景；画风以 `film/style-lock/STYLE_LOCK.md` 为准，先读它。
- 角色只能用 `src/character.js` 的 `clawd()`：官方 15×16 宽扁比例，**不许拉长四肢、不许加肘膝手掌**。
- 必须用上已有场景函数，不要重画背景：`src/scenes-verse3.js` 已导出
  `splitWorld, streetEnd, bookGlow, dawnBird, tunnel, roofAntenna, tinyRoom, familyTable, blockedDoor, maze, cityWide, crowdUniform, queue, chalkWall, ringWindow, gramophone`。
- 动作要自然：走路用四脚交替相位，停下要有轻微 squash/bob，不要硬切姿势。
- 每句歌词对应的事必须看得见；不许一镜到底站着不动。
- 多角色 = 同一 `clawd()` 换 `color`，形状比例完全一致。

## Ownership
- 你可以改：`film/shots/v3-0*.js`、`film/shots/v3-10.js`、`film/data/shots-extra/verse3a.json`、
  以及自己新建的 `film/src/scenes-verse3a.js`（需要新场景时）。
- **不要改**：`film/shots.json`、`film/build.mjs`、`film/src/{palette,ink,character,props,scenes,scenes2,scenes-verse2,scenes-verse3,subtitles,dream}.js`、
  其他人的 `film/shots/*.js`、`film/data/shots-extra/` 下别人的 json。

## Observable acceptance
在 `C:\Users\Lenovo\Desktop\ALLCODE\Anima` 下：

```
node mv-wo-xiang-part2/film/build.mjs stills --shot v3-01 --times 0.4,1.5
```

十镜全部跑通、无报错，每镜生成 `film/out/contact-v3-XX.jpg`。然后用

```
python tools/view-image.py mv-wo-xiang-part2/film/out/contact-v3-*.jpg --grid 5x2 --max 1800
```

把结果拼成一张，**Read 那张拼图**逐镜确认：角色比例、表情、夜景暖光、分镜内容对得上。
不合格就改，改完重渲染重看。

## 汇报
写 `mv-wo-xiang-part2/film/orchestration/report-verse3a.md`：镜号表、每镜一句画面说明、
拼图路径、与分镜的偏差。完成后按 preamble 发 `worker_done`，三句话摘要说清做完了什么。