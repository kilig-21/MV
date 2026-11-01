# Task: verse3 后半（v3-11 ~ v3-19）

## Target
仓库根 `C:\Users\Lenovo\Desktop\ALLCODE\Anima`，工程在 `mv-wo-xiang-part2/film/`。

你负责第三段主歌的后 9 个镜头（166.41–188.28 秒），分镜表在
`mv-wo-xiang-part2/timeline/storyboard-verse3.md`，只做 v3-11 到 v3-19。

## Change
1. 新建 9 个镜头模块 `mv-wo-xiang-part2/film/shots/v3-11.js` … `v3-19.js`。
2. 新建清单片段 `mv-wo-xiang-part2/film/data/shots-extra/verse3b.json`，
   形如 `{ "shots": [ {...}, ... ] }`，字段照现有条目：
   `id, t0, t1, lyric, section:"verse3", scene, camera, action, change, transition, module:"./shots/v3-11.js", assets`
3. t0/t1 严格用分镜表时间；最后一镜结束对齐 188.28。

## Constraints
- 1920×1080，24 fps，全片夜景；先读 `film/style-lock/STYLE_LOCK.md`。
- 角色只用 `src/character.js` 的 `clawd()`，官方 15×16 宽扁比例，不许拉长四肢、不许加肘膝手掌。
- 复用 `src/scenes-verse3.js` 已有场景：`cityWide, crowdUniform, queue, chalkWall, ringWindow, gramophone, maze` 等，不要重画。
- v3-11 / v3-12 是城市慢横移与旋转，v3-19 是拉远收尾——注意镜头运动要有连续性，不要抖。
- 每句歌词对应的事必须看得见；动作自然，四脚交替相位，停下有 squash/bob。
- 多角色 = 同一 `clawd()` 换 `color`。

## Ownership
- 可改：`film/shots/v3-11.js`…`v3-19.js`、`film/data/shots-extra/verse3b.json`、自建的 `film/src/scenes-verse3b.js`。
- 不要改：`film/shots.json`、`film/build.mjs`、`film/src/` 里已有的共享模块、其他人的镜头与片段。

## Observable acceptance
```
node mv-wo-xiang-part2/film/build.mjs stills --shot v3-11 --times 0.5,1.2
```
九镜全部跑通、每镜生成 `film/out/contact-v3-XX.jpg`，然后
```
python tools/view-image.py mv-wo-xiang-part2/film/out/contact-v3-1*.jpg --grid 3x3 --max 1600
```
**Read 拼图**逐镜确认比例、表情、夜景、分镜内容。不合格重做。

## 汇报
写 `mv-wo-xiang-part2/film/orchestration/report-verse3b.md`：镜号表、每镜一句说明、拼图路径、偏差。
完成后按 preamble 发 `worker_done`。