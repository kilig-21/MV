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
