# Task: 尾奏 outro（208.24–281.551771，73 秒器乐）

## Target
仓库根 `C:\Users\Lenovo\Desktop\ALLCODE\Anima`，工程 `mv-wo-xiang-part2/film/`。

全片最后 73 秒没有歌词（原曲 281.551771 秒）。这一段目前没有任何镜头，
最终合片时这段会显示"未分配镜头"，必须补上。

先读 `mv-wo-xiang-part2/timeline/lyric-analysis.md` 的 outro 段和全片母题，再动手。

## Change
1. 新建 6 个镜头模块 `film/shots/o-01.js` … `o-06.js`，清单片段
   `film/data/shots-extra/outro.json`（`{ "shots": [...] }`，字段同现有条目，
   `section:"outro"`，`module:"./shots/o-01.js"`）。
2. 时间分段（可微调，总长必须正好接满 208.24–281.55，不许留缝、不许重叠）：
   - o-01 208.24–222.00 城市远景，末班车驶过，余音
   - o-02 222.00–236.00 空车厢，灯管一格一格灭
   - o-03 236.00–249.00 站台长椅，他看着车开走，安静
   - o-04 249.00–261.00 回到 intro 的城市窗灯，镜头拉远
   - o-05 261.00–272.00 制作名单（见下）
   - o-06 272.00–281.55 窗灯一盏盏灭，最后留一点光，黑场
3. 制作名单（o-05）用页面字体绘制，内容固定为：
   - 角色：Clawd on Desk 1.2.0 · rullerzhou-afk · AGPL-3.0-only
   - 歌曲与歌词：法老 / 杨秋儒《我想 part2》
   - 字体：Noto Sans SC · OFL
   - 本片为个人练习作品，不上传版权素材
   做成暗色斜切底框、细米色边、暖米黄字，与字幕风格一致（参考 `src/subtitles.js` 的 `drawCue`）。

## Constraints
- 不要为尾奏新增歌词字幕；timeline 在这一段没有 lines，字幕系统本来就不会画。
- 画风同 `film/style-lock/STYLE_LOCK.md`：1920×1080、24 fps、夜景暖光。
- 角色只用 `clawd()`，官方比例。
- 复用 `src/scenes.js`（cityLine, nightSky, carriage, streetStore, moon, stars）；
  新场景放自建 `film/src/scenes-outro.js`。
- o-06 的最后一帧要能直接接回 intro 的第一帧（城市窗灯），首尾成环。

## Ownership
- 可改：`film/shots/o-0*.js`、`film/data/shots-extra/outro.json`、自建 `film/src/scenes-outro.js`。
- 不要改：`film/shots.json`、`film/build.mjs`、`film/src/` 已有共享模块、其他人的镜头与片段。

## Observable acceptance
```
node mv-wo-xiang-part2/film/build.mjs stills --shot o-01 --times 1,10
node mv-wo-xiang-part2/film/build.mjs cut --from 208.24 --to 281.551771 --name outro
```
- 6 镜 stills 全部跑通；
- `film/out/outro.mp4` 生成，`outro.probe.json` 为 1920×1080 / 24 fps / yuv420p / bt709，
  时长约 73.3 秒；
- 拼一张 `film/out/contact-outro.jpg` 并 Read 确认。

## 汇报
写 `film/orchestration/report-outro.md`：镜号表、名单排版说明、probe 结果、与 intro 的衔接说明。
完成后按 preamble 发 `worker_done`。