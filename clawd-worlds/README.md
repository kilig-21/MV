# Clawd · 穿过三种世界

22 秒角色短片，1920×1080、24 fps：琥珀默片小镇、纸艺森林、霓虹夜城。
用户参考为首页 OPUSCAR 98；这支短片借鉴跨画风角色冒险的形式，原创故事与场景，不是原演示的删节或原版重渲染。

主角为用户要求的 Claude Code 小螃蟹 Clawd；本片为非官方致敬，与 Anthropic 无隶属或背书关系。

成片 `clawd-worlds.mp4`，海报 `poster.jpg`，接触表 `contact-sheet.jpg`，字幕 `clawd-worlds.srt`。
声音为原创合成音乐与程序音效，无配音。字体、工具、角色说明见 `CREDITS`。

重建：在父项目根目录执行 `node clawd-worlds/build.mjs`。
关键帧：`node clawd-worlds/build.mjs --stills`；只重新合成现有画面与声音：`node clawd-worlds/build.mjs --master`。
也可运行 `build.ps1` 或在 Git Bash 中运行 `build.sh`。

默认复用 `C:/Users/Lenovo/lemo-opuscar`，可通过 `LEMO_OPUSCAR_HOME` 覆盖；浏览器可通过 `PLAYWRIGHT_CHROME` 指定。
需要 WebGL2、共享库核心依赖和父项目内的便携 FFmpeg。渲染时不需联网。
