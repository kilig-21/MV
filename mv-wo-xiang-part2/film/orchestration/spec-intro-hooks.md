# Task: intro + 两个 hook（i-01~05, h1-01, h2-01）

## Target
仓库根 `C:\Users\Lenovo\Desktop\ALLCODE\Anima`，工程 `mv-wo-xiang-part2/film/`。
分镜表 `mv-wo-xiang-part2/timeline/storyboard-intro-hooks.md`。

## Change
1. 新建 7 个镜头模块：`film/shots/i-01.js`…`i-05.js`、`film/shots/h1-01.js`、`film/shots/h2-01.js`。
2. 清单片段 `film/data/shots-extra/intro-hooks.json`，`{ "shots": [...] }`，字段同现有条目。
3. 时间严格照分镜表：
   - i-01 0.00–4.40, i-02 4.40–8.80, i-03 8.80–13.20, i-04 13.20–17.08, i-05 17.08–20.97
   - h1-01 59.44–62.39, h2-01 121.50–124.36
4. intro 没有歌词、没有标题卡；开头 17.08 那句是编曲信息，**不上字幕**（字幕系统会自动处理，你不要加）。

## Constraints
- 1920×1080，24 fps，全片夜景。
- 复用 `src/scenes.js`：`nightSky, stars, moon, cityLine, carriage, streetStore`；缺的放自建 `src/scenes-intro.js`。
- 角色只用 `clawd()`；i-01~i-04 基本没人（可以有远景剪影），i-05 才出现在车窗倒影里。
- 开场要慢、要冷，灯一盏盏亮；i-05 的倒影眨一下眼收尾，直接接 v1-01 同一条街。
- hook 是两个「推门」动作：招牌逐个亮 → 角色抬头；站名灯箱掠过 → 眼神跟随。
- 先读 `film/shots/v1-01.js` 与 `c1-01.js` 当模板。

## Ownership
- 可改：`film/shots/i-0*.js`、`h1-01.js`、`h2-01.js`、`film/data/shots-extra/intro-hooks.json`、自建 `film/src/scenes-intro.js`。
- 不要改：`film/shots.json`、`film/build.mjs`、`film/src/` 已有共享模块、其他人的镜头与片段。

## Observable acceptance
```
node mv-wo-xiang-part2/film/build.mjs stills --shot i-01 --times 0.5,3.0
```
7 镜全部跑通、每镜出 `film/out/contact-<id>.jpg`；然后
```
python tools/view-image.py mv-wo-xiang-part2/film/out/contact-i-*.jpg mv-wo-xiang-part2/film/out/contact-h1-01.jpg mv-wo-xiang-part2/film/out/contact-h2-01.jpg --grid 4x2 --max 1600
```
**Read 拼图**确认，不合格重做。

## 汇报
写 `film/orchestration/report-intro-hooks.md`：镜号表、每镜一句说明、拼图路径、偏差。
完成后按 preamble 发 `worker_done`。