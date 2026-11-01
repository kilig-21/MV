# 纸月 MV

- 横屏新版：`PaperMoonLandscape`，1920×1080，30 fps，723 帧（24.1 秒）。
- 竖屏旧版：`PaperMoonMV`，720×1280；源码快照位于 `versions/portrait-v1/`。
- 原视频只用于提取前 24.1 秒音轨；未使用原视频图像。
- 所有新画面由 React + SVG 绘制；纸张边缘、阴影、颗粒为 SVG 滤镜。
- 九段分镜保持用户提供的时间：0 / 3.6 / 5.7 / 7.4 / 10.4 / 13.8 / 17.3 / 20.2 / 22.4 / 24.1 秒。
- 层内节奏采用音频能量分析得到的约 140 BPM 候选值，未完成逐句起唱的人工校准。
- `paper-effects.wav` 为本地合成的轻量纸张、浪涌过渡音效。

启动预览：`npm run dev -- --no-open`，打开 `/PaperMoonLandscape`。

已保存旧版：`out/paper-moon-portrait-v1.mp4`。
横屏导出：`out/paper-moon-landscape-v2.mp4`。
