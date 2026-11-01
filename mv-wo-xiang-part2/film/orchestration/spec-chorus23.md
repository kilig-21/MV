# Task: chorus2 + chorus3（c2-01~08, c3-01~08）

## Target
仓库根 `C:\Users\Lenovo\Desktop\ALLCODE\Anima`，工程 `mv-wo-xiang-part2/film/`。
分镜表 `mv-wo-xiang-part2/timeline/storyboard-chorus1.md`（三段副歌都在里面，你只做后两段）。

## Change
1. 新建 16 个镜头模块：`film/shots/c2-01.js`…`c2-08.js`、`film/shots/c3-01.js`…`c3-08.js`。
2. 清单片段：`film/data/shots-extra/chorus23.json`，`{ "shots": [...] }`，字段同现有条目。
3. 时间：chorus2 = 124.36–145.40，chorus3 = 188.28–208.24。
   歌词行时间从 `mv-wo-xiang-part2/timeline/timeline.json` 的 `lines` 里按 section 取：
   - chorus2 行首：124.36, 128.24, 129.90, 133.53, 135.06, 138.75, 140.26（7 句）
   - chorus3 行首：188.28, 190.47, 192.15, 195.59, 197.21, 200.90, 202.57, 206.42（8 句）
   第一镜从段首开始，每句一镜，最后一镜收在该段结束时间；chorus2 最后 140.26 到 145.40 可以拆成「唱」+「醒」两镜。

## Constraints
- 沿用 chorus1 的八个动作结构，但**整体放大一档**：平台更大、海更宽、云床变浮岛、音符从身体里长出来而不是耳机。
- chorus3 最亮最远：梦境升到城市上空，海与城叠在一起，纸舟变成唱片封套折成的大船，结尾回到夜班车厢睁眼收束。
- 复用 `src/dream.js`（dreamSky, sea, ticketPlatform, paperBoat, windLines, rainLines, noteIcons, cloudBed, beatRings）与 `src/scenes.js`（carriage 等）；缺什么在自建 `src/scenes-chorus23.js` 里补，不要改共享模块。
- 角色只用 `clawd()`，官方比例，不许拉长四肢。
- 先读 c1-01.js ~ c1-08.js 当模板，再写 c2/c3，保持代码风格一致。
- 1920×1080，24 fps，全片夜景。

## Ownership
- 可改：`film/shots/c2-*.js`、`film/shots/c3-*.js`、`film/data/shots-extra/chorus23.json`、自建 `film/src/scenes-chorus23.js`。
- 不要改：`film/shots.json`、`film/build.mjs`、`film/src/` 已有共享模块、`film/shots/c1-*.js` 与其他人的文件。

## Observable acceptance
```
node mv-wo-xiang-part2/film/build.mjs stills --shot c2-01 --times 0.6,2.0
```
16 镜全部跑通，每镜出 `film/out/contact-cX-XX.jpg`；然后
```
python tools/view-image.py mv-wo-xiang-part2/film/out/contact-c2-*.jpg mv-wo-xiang-part2/film/out/contact-c3-*.jpg --grid 4x4 --max 1800
```
**Read 拼图**逐镜确认，不合格重做。

## 汇报
写 `film/orchestration/report-chorus23.md`：镜号表、每镜一句说明、拼图路径、与 chorus1 的差异。
完成后按 preamble 发 `worker_done`。