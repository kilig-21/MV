# 画风对照静帧

本次仅生成两个用于讨论的静帧，不制作 MV 或改动已讨论的故事。
同一场景：深夜地铁里的听歌小螃蟹，蓝围巾、耳机与旁边的包；窗外的城市刚开始变成水面和星光。
同一歌词：他会循环播放伴随你的每个日夜。

- A-pure-pixel.png：320×180 场景画布，最近邻放大；复杂中文字采用 640×360 的像素字形网格保证可读性，再整体放大到 1920×1080。
- B-hd-2d.png：同一个 64×64 像素角色置于立体列车模型，像素纹理、实用灯光、阴影、景深和弱辉光；歌词采用协调的暗蓝、浅金色底板。

复现：`node mv-wo-xiang-part2/style-study/render.mjs`，需要现有 Lemo-Opuscar 库、浏览器和 WebGL2。
这些是实际绘制代码的输出，不是 ImageGen 概念图。角色、场景为本项目原创绘制。
使用 Lemo-Opuscar 的 core/lib.js、core/three/post.js 与 core/render/page.mjs（MIT）；Three.js（MIT）；Noto Sans SC（OFL，见 fonts/OFL.txt）。
歌词来自用户提供的 LRC，仅用于此次 MV 风格评审。未上传歌曲或 MV 到外部服务。
