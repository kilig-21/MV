# Anima · 第一束动势

15 秒瑞士动态排版试片，1920×1080、24 fps，中文画面文字、原创电子音乐和印刷音效，无配音。

- 成片：`anima-first-light.mp4`
- 海报：`poster.jpg`
- 接触表：`contact-sheet.jpg`
- 导演方案：`TREATMENT.md`
- 素材来源与许可：`CREDITS`

在项目根目录运行 `node anima-first-light/build.mjs` 即可重新构建；或在影片目录运行 `bash build.sh` / `./build.ps1`。
只输出预览帧：`node anima-first-light/build.mjs --stills`。

复用本机 `C:/Users/Lenovo/lemo-opuscar` 的核心工具与 Python 环境，使用父项目 `.tools/ffmpeg/bin`。
可通过 `LEMO_OPUSCAR_HOME`、`PLAYWRIGHT_CHROME` 覆盖共享库和浏览器位置。
页面通过仓库本地服务器访问，`?preview=1` 开启实时循环画面；离线渲染不依赖网络。

影片有意没有旁白，因此没有 SRT。文字属于画面排版。
