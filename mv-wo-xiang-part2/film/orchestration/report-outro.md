# 尾奏 outro 制作报告（208.24 – 281.551771）

日期：2026-10-31 ｜ 工程：`mv-wo-xiang-part2/film/`
成片：`film/out/outro.mp4`（73.31 s）｜ probe：`film/out/outro.probe.json`
总览：`film/out/contact-outro.jpg`

## 1. 镜号表

六镜首尾相接，合计 **73.311771 s**，与时间轴 208.24–281.551771 完全对齐，无空隙、无重叠。

| 镜号 | 时间（全局） | 时长 | 场景 | 画面与动作 |
| --- | --- | --- | --- | --- |
| o-01 | 208.24–222.00 | 13.76 s | 城市远景·高架 | 夜空、月、两层楼群；高架桥上一列末班车自左向右驶过（暖色车窗 + 前灯落在桥面）。车走后桥面留下一条暖光带，6 点暖光缓缓上升，余音散掉 |
| o-02 | 222.00–236.00 | 14.00 s | 空车厢 | `carriage()` 空车厢。车在减速（850→20 px/s）。座位上留着别人忘下的报纸，一只纸杯先倒下再滚到过道中间。三根顶灯分别在 2.7 / 6.7 / 10.8 s 抖两下后熄灭 |
| o-03 | 236.00–249.00 | 13.00 s | 站台长椅 | 站台长椅，他坐着看车开走。车尾缩进隧道（车尾窗、目的地牌、腰线、两盏小尾灯），红灯消失后他的眼睛慢慢落下来；9.05 s 眨一次眼，站台随后暗 0.14 |
| o-04 | 249.00–261.00 | 12.00 s | 城市窗灯·回到 intro | 与 i-01 同一套城市（同 seed、同构图），镜头从 1.30 拉到 1.00，落回开场机位；开头 0.9 s 从站台的黑里浮出 |
| o-05 | 261.00–272.00 | 11.00 s | 制作名单 | 压暗到 0.66 的城市当底，斜切底框内四行制作信息依次浮上来 |
| o-06 | 272.00–281.551771 | 9.551771 s | 城市窗灯·熄灭 | 同一片城市，窗灯 0.7–8.7 s 一盏盏灭；中右一扇暖灯压到最后（6.8 s 起给光晕，约 7.6 s 熄，余晖 0.95 s 散尽），8.45 s 起压暗，最后一帧停在 0.72 |

覆盖校验：全片 92 个镜头从 0 到 281.551771 首尾严格连续（脚本检查通过）。

## 2. 制作名单排版（o-05）

用页面字体 `NotoSansSC`（`index.html` 的 `@font-face`，本地 `fonts/NotoSansSC.ttf`，OFL），Canvas 2D 直接绘制，字号与行距固定。

**底框**（与 `src/subtitles.js` 的 `drawCue` 同一套语言）
- 斜切平行四边形，斜切量 52 px；上边 y = 312，下边 y = 754
- 宽度按最长一行文字实测后定为 `min(文字宽 + 150, 1380)`，居中于 x = 960
- 底 `rgba(30,36,48,0.94)`，细米色边 `rgba(232,210,162,0.82)` 2.2 px，内侧 1 px 高光 `rgba(247,239,221,0.16)`
- 第三、四行之间一条 500 px 宽的分隔线，`rgba(232,210,162,0.30)` 1.4 px

**四行文字**（内容固定，未增删）

| 行 | 内容 | 字号 | y | 淡入起点 |
| --- | --- | --- | --- | --- |
| 1 | 角色：Clawd on Desk 1.2.0 · rullerzhou-afk · AGPL-3.0-only | 34 px | 406 | 0.45 s |
| 2 | 歌曲与歌词：法老 / 杨秋儒《我想 part2》 | 40 px | 492 | 1.15 s |
| 3 | 字体：Noto Sans SC · OFL | 32 px | 570 | 1.85 s |
| 4 | 本片为个人练习作品，不上传版权素材 | 28 px（0.72 不透明度） | 682 | 2.70 s |

- 字色暖米黄 `#F1D9A8`；每行 0.55 s 淡入并从下方 12 px 浮上来；底板本身 0.7 s 淡入、上浮 14 px
- 长行用 `fillText` 的 `maxWidth = 框宽 - 90` 兜底，保证不越出斜切边

## 3. 渲染与 probe

```
node mv-wo-xiang-part2/film/build.mjs stills --shot o-01 --times 1,10
node mv-wo-xiang-part2/film/build.mjs cut --from 208.24 --to 281.551771 --name outro
```

6 镜 stills 全部通过（`contact-o-01…o-06.jpg`）。`outro.mp4` 共 1759 帧：

| 项 | 值 |
| --- | --- |
| 视频 | h264 · 1920×1080 · yuv420p · 24/1 fps · color_space bt709 · range tv · 1759 帧 · 73.291667 s |
| 音频 | aac · 48 kHz · 2 ch · 246 kb/s · 73.311771 s |
| 容器 | 73.311771 s · 48,579,406 B（约 46.3 MiB） |

说明：本机 ffprobe 对 `color_transfer` / `color_primaries` 报 `None`，与项目既有产物
`out/animatic-verse1.probe.json` 一致；实际编码参数为 `-colorspace bt709 -color_primaries bt709 -color_trc bt709`，
`color_space=bt709`、`range=tv` 均正确。成片时长 73.29 s（1759 帧 ÷ 24），与任务要求“约 73.3 秒”一致。

## 4. 与 intro 的衔接（首尾成环）

o-04 与 o-06 没有另画一套城市，而是复用 `scenes-outro.introCity()`：`nightSky`、`stars(seed 5)`、
`moon(330,168,50)`、`cityLine(seed 21 / 34)`、近层楼群 `seed 71 / baseY 828`、`cityHaze(seed 902)`
全部与 i-01 逐项一致。o-06 固定 `scrollT = 0`（不横移），所以窗灯的布局与 i-01 第 0 帧同坐标。

- **逐像素校验**：o-06 的最后一帧（t = 9.5）与 i-01 第 0 帧渲染静帧相比，`mean abs diff = 0.0`，`max = 0`（完全一致）。
- **成片校验**：从 `outro.mp4` 抽最后一帧与 i-01 第 0 帧比，`mean abs diff = 3.33`（H.264 与 full→tv 转换的误差），肉眼无差。
- o-06 结尾的压暗值就是 i-01 开场 `rise = 1` 时的 `0.72`，颜色同为 `#08101A`；因此 281.55 s 的“黑场”同时就是 0.00 s 的“从暗里浮出来”，循环播放时看不出接缝。
- o-04 的拉远终点是 1.00，机位与 i-01 相同，观众先在 outro 里“退回”开场的位置，再由 o-06 把灯一盏盏关掉。

## 5. 实现与文件

新增：
- `film/shots/o-01.js` … `o-06.js`
- `film/data/shots-extra/outro.json`（`section:"outro"`，时间与上表一致）
- `film/src/scenes-outro.js`：`cityWindows`（可亮可灭，布局与 `scenes-intro.cityWindowsLit` 同 RNG 序列）、`introCity`、`cityHaze`、`viaduct`、`lastTrain`、`lampOff`、`seatNewspaper`、`paperCup`、`departingTrain`、`creditPanel`

复用但未改动：`scenes.js`（nightSky / stars / moon / cityLine / carriage）、`scenes-intro.js`（subwayPlatform）、
`character.js`（clawd，官方 15×16 比例）、`subtitles.js`（样式参照）、`build.mjs`、`shots.json`。

其他说明：
- 尾奏没有新增歌词字幕；timeline 在 208.24 之后没有 lines，`drawSubs` 自然不会画。
- o-02 的整片压暗按“每灭一根 0.065”递增（最多约 0.20），避免整体发灰；三根灯各自带一束光锥，灭灯时是“这一格的光没了”。
- o-03 的推镜为 1.08→1.12（焦点 700,650），保证长椅与隧道口同时在画内。
- `film/data/shots-all.json`、`film/data/modules.json` 由 `build.mjs` 每次运行时自动重写，已包含 o-01…o-06。

## 6. 复看入口

- 总览：`film/out/contact-outro.jpg`（o-01 t=6 / o-02 t=8 / o-03 t=0.5 / o-04 t=6 / o-05 t=6 / o-06 t=7.5）
- 单镜：`film/out/stills-o-0*/`、`film/out/contact-o-0*.jpg`
- 成片抽帧：`film/out/outro-check/`