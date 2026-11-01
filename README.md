# MV

用代码做的音乐视频。目前收录：《我想 part2》2D 手绘动画 MV。

成片在 [Releases](../../releases) 里，直接下载 `wo-xiang-part2.mp4`。

---

## 《我想 part2》MV

- 4 分 41 秒，1920×1080 / 24 fps / H.264 + AAC
- 92 个镜头，全部由 Canvas 2D 逐帧绘制，无剪辑软件、无外部素材
- 角色：官方 Clawd on Desk 15×16 骨架，比例冻结
- 画面逐句跟随歌词；三次副歌逐层放大；首尾成环

## 目录

```
mv-wo-xiang-part2/
  assets/            原曲音频（不入库）
  timeline/          对轨时间轴、歌词分析、各段分镜
  style-lock/        画风规范（色值、描边、画幅、编码）
  character-lock/    角色基准与轮廓校验
  film/              渲染工程
    index.html       页面：window.READY / DUR / render(t)
    build.mjs        构建 CLI：stills / shot / cut / film / still-range
    shots/           每个镜头一个模块
    src/             调色、原语、角色、场景、字幕、表情、转场
    orchestration/   并行制作的规格、报告、评审清单、合片手册
tools/view-image.py  读图前的降采样工具
WORKFLOW-LESSONS.md  这套流程的经验总结（可复用）
```

## 重新出片

需要 Playwright 的 chromium-headless-shell 与 ffmpeg（项目内 `.tools/ffmpeg` 或系统 PATH）。

```bash
node mv-wo-xiang-part2/film/build.mjs film
# -> mv-wo-xiang-part2/film/out/wo-xiang-part2.mp4
```

单镜预览：

```bash
node mv-wo-xiang-part2/film/build.mjs stills --shot v1-01 --times 0.5,1.5
python tools/view-image.py mv-wo-xiang-part2/film/out/stills-v1-01/t_0.5.jpg --width 900
```

## 说明

- 角色：Clawd on Desk 1.2.0，作者 `rullerzhou-afk`，AGPL-3.0-only。
- 歌曲与歌词：法老 / 杨秋儒《我想 part2》，版权归原作者。本项目为个人练习作品，不上传版权素材。
- 字体：Noto Sans SC，OFL。
- 制作方式与经验见 `WORKFLOW-LESSONS.md`。