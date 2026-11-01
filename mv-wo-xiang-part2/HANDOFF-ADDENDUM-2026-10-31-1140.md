# 追加交接 · 2026-10-31 11:40

补 `HANDOFF-2026-10-31.md`（写于 01:31）之后到 11:38 的全部进展。
**与旧交接冲突时，以本文件为准**（旧文件里的验收标准还写着“纯 2D 像素”，已被 `film/style-lock/STYLE_LOCK.md` 取代）。

> 本文件由新对话根据文件时间戳、产物与代码反推整理，未经用户逐条确认；数字均来自实际文件。

## 0. 上一个会话为什么断的

不是代码问题，是上下文超限：

- 报错：`400 Exceeded limit on max bytes to request body : 16777216`（16 MiB）
- 会话 `3ae66e92` 的上下文里堆了 **46 张截图、base64 共 17.0 MB**
- 最后产物 `out/contact-v2probe.jpg` 生成于 11:36，**没来得及查看就断了**

读图纪律：**不要直接 Read 渲染原图**。先跑 `python tools/view-image.py <图...>`（在 Anima 根目录），常用两种：

- 竖长图 / 截屏：`--width 900 --trim`（`--trim` 按彩色度自动裁掉播放器黑边，`style-reference/` 三张 611–839 KB 的截屏裁完只剩 40 KB，画面反而更大更清楚）
- 多帧对比：`--grid 4x3 --max 1600` 拼成一张联系人表

然后 Read `.cache/view/` 里的副本。单张 350 KB 的渲染图压到 19 KB，46 张合计不到 1 MB。

## 1. 已经建成的工程（CODI-138）

`film/`，规范见 `film/SHOT_SPEC.md`：

| 文件 | 作用 |
| --- | --- |
| `build.mjs` | 构建 CLI：`samples` / `stills --shot <id> --times a,b,c` / `shot <id>` / `cut --from --to --name` / `film` |
| `index.html` | 页面，暴露 `window.READY` / `DUR` / `render(t)` |
| `shots.json` | **44 条**记录，覆盖 **20.97–121.50 秒**：verse1 18 + verse2 18 + chorus1 8 |
| `shots/*.js` | 44 个镜头模块，`v1-01…18` / `c1-01…08` / `v2-01…18`，**无缺失** |
| `src/` | `palette` `ink` `character` `props` `scenes` `scenes2` `scenes-verse2` `scenes-verse3` `subtitles` `sheets` `dream` `main` |
| `tools/` | `parity.py` `shot_parity.py` 角色轮廓校验 |
| `data/` | 构建时同步的 `timeline.json` / `modules.json` |
| `out/` | 产物 |

`build.mjs` 依赖：项目内 `.tools/ffmpeg/bin`、`C:/Users/Lenovo/lemo-opuscar`（可用 `LEMO_OPUSCAR_HOME` 覆盖）、Playwright `chromium_headless_shell-1243`。

## 2. 画风与输出规格（CODI-139，已锁定）

`film/style-lock/STYLE_LOCK.md` 是绘制规格正本。要点：

- 1920×1080，24 fps，Canvas 2D → Playwright 逐帧 JPEG(95) → FFmpeg
- H.264 `yuv420p` CRF 14 bt709；音频 AAC 256k / 48 kHz
- 墨线 `#232227`；米色纸 `#E8D5B0`；青蓝 `#4E8FA3`；灰粉 `#8C625E`；芥末黄 `#D9A03F`；主角橙 `#DE886D`；暖灯 `#F6C97E`；夜天 `#16222F→#1E3040→#28414F`
- 角色描边 = 0.30 × rig 单位像素，场景描边 4–6 px，全片夜景

## 3. 角色校验

`film/character-lock/parity-report.json`：

- 官方 `base-240x256.png` vs 渲染：包围盒比例 **1.6667 = 1.6667**，`ratio_delta 0.0`
- **IoU 0.9636**，阈值 0.95，**pass**
- 说明：官方 base 是方角，本片按参考图做圆角，四角损失约 3.6%，故 IoU 上限约 0.964 —— 这是预期值，不是缺陷

## 4. 已渲染并校验的产物

| 产物 | 状态 |
| --- | --- |
| `out/shot-v1-01.mp4` `-09` `-12` `-18` | 已出片，各附 `.probe.json` |
| probe 结果 | 1920×1080、24/1、h264 High、yuv420p、bt709 —— 全部合规 |
| `out/parity-v1-*.png` | 角色对照图 |
| `out/contact-v1-batch.png` | v1 批量联系人表 |
| `out/contact-c1probe.jpg` + `stills-c1probe/` | c1 的 **11 张** stills，02:16 |
| `out/contact-v2probe.jpg` + `stills-v2probe/` | v2 的 **18 张** stills，**11:36，未查看** |

## 5. 分镜文档

`timeline/` 下现有：`storyboard-verse1.md`（10-30）、`storyboard-intro-hooks.md`、`storyboard-verse2.md`、`storyboard-verse3.md`、`storyboard-chorus1.md`（均 02:17）。

## 6. 没做完的

1. `contact-v2probe.jpg` 没看，v2 画面质量未判断
2. **只有 v1 的 4 个镜头出了 mp4**；c1、v2 停在 stills
3. `shots.json` 只到 121.50 秒。**verse3、chorus2、chorus3、intro/hooks、73 秒尾奏都还没有镜头模块**（`scenes-verse3.js` 已写好，但 shots 没建）
4. Multica issue 状态可能没更新：CODI-138 / CODI-139 实际已完成，列表里可能仍标 todo

## 7. 下一步（按顺序，不要等确认）

1. 看 `out/contact-v2probe.jpg`（先 `python tools/view-image.py` 过一道），判断 v2 画面
2. 把 CODI-138 / CODI-139 在 Multica 标 done，评论写产物路径
3. 按 `storyboard-verse3.md` 建 v3 镜头模块；补 intro/hooks、chorus2、chorus3
4. c1、v2 批量出 mp4 并 probe 校验
5. 合片，再处理尾奏

## 8. 时间基准（不变）

`assets/source-audio.flac` 281.551771 秒；歌词段落到 208.24 秒，之后约 73 秒器乐尾奏。