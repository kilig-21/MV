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
