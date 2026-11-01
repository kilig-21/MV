# 合片与验收 runbook

所有分段镜头到位后的收尾流程。命令都在 `C:\Users\Lenovo\Desktop\ALLCODE\Anima` 下执行。

## 1. 覆盖检查（每次改完镜头都要跑）

```
python mv-wo-xiang-part2/film/tools/coverage.py
```

合格标准：`OK`，覆盖结束 = 281.55，无 GAP / OVERLAP / MISSING module。
尾奏没做时只剩最后 73 秒一个 GAP，属预期。

## 2. 抽查单个镜头

```
node mv-wo-xiang-part2/film/build.mjs stills --shot v3-05 --times 0.8,2.0
python tools/view-image.py mv-wo-xiang-part2/film/out/stills-v3-05/t_0.8.jpg --width 900
```

看图一律走 `tools/view-image.py`，读 `.cache/view/` 的副本，不要直接 Read 原图。

## 3. 整片采样自查（不渲染视频，快）

```
node mv-wo-xiang-part2/film/build.mjs still-range --from 1 --to 280 --step 8 --name qa
python tools/view-image.py mv-wo-xiang-part2/film/out/contact-qa.jpg --width 1400
```

一次出一张 35 帧的总览，用来抓「未分配镜头」、构图重复、亮度断层。

## 4. 出成片

```
node mv-wo-xiang-part2/film/build.mjs film
```

产出 `mv-wo-xiang-part2/film/out/wo-xiang-part2.mp4` + `.probe.json`。

验收：
- `.probe.json`：1920×1080、`avg_frame_rate` 24/1、`pix_fmt` yuv420p、`color_space` bt709
- 时长 ≈ 281.55 s
- `ffmpeg -v error -i out/wo-xiang-part2.mp4 -f null -` 无输出（全长解码无错误）
- 音画同步：抽 3 个歌词起点，确认字幕出现时间与唱句一致（±0.15 s）

## 5. 补尾奏时

`o-01` 必须从 208.24 起，`o-06` 结束对齐 281.551771，中间不许有缝。
o-05 是制作名单，内容是固定的（见 `orchestration/spec-outro.md`）。

## 6. 交付

成片放 `mv-wo-xiang-part2/film/out/wo-xiang-part2.mp4`。
Multica 上把 CODI-148（合片）标 done 并写上该路径与 probe 结果。