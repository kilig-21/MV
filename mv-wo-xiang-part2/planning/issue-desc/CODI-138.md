## 阶段目标（S2）

把全片拆成互相独立、可单独渲染和替换的镜头单元。上一版 10 秒样片「整段写成一个函数」的结构不再重演。

画风已从纯像素改为 **2D 扁平手绘（粗描边 / 暖色低饱和）**，所以本 issue 的工程基线随之重写。

## 工程结构

`mv-wo-xiang-part2/film/`

```
film/
  index.html            # 唯一页面，暴露 window.READY / window.DUR / window.render(t)
  build.mjs             # 单镜 stills / 单镜 mp4 / 整段 / contact sheet / 合片
  shots.json            # 一条记录 = 一个镜头
  shots/                # 每镜一个 ES 模块，导出 draw(ctx, t, shot)
  src/
    palette.js          # 调色板（CODI-139）
    ink.js              # 描边、圆角矩形、手绘抖动、纸感
    character.js        # 角色绘制与表情（CODI-150）
    subtitles.js        # 字幕渲染
    scene/              # 场景模块（CODI-145）
    props/              # 道具模块（CODI-145）
  out/                  # 单镜与整段产物
```

## shots.json 字段

`id, t0, t1, lyric, section, scene, camera, action, change, transition, assetRefs, module`

## 需要完成

- [ ] 统一镜头接口：`draw(ctx, t, shot)`，t 为全局秒，模块内部用 `t - shot.t0`。
- [ ] `node film/build.mjs film --q shot=v1-12` 只渲染一个镜头：stills + 该镜 mp4。
- [ ] `node film/build.mjs cut --from 20.97 --to 59.44` 渲染一段并接原声。
- [ ] contact sheet：一屏 12 格，标注镜号与时间码。
- [ ] `film/SHOT_SPEC.md`：新增镜头的步骤、允许/禁止事项。
- [ ] 每镜自动输出「角色 vs 官方骨架」对照图。

## 验收标准

- 新增一个镜头 = 加一条 shots.json 记录 + 一个模块，不改其他镜头。
- 单镜渲染不依赖全片。
- contact sheet 能准确标注镜头 id 与时间码。
- 镜头模块不能私自绘制角色身体，只能调用 `src/character.js`。

## 产物路径

`film/**`、`film/SHOT_SPEC.md`、`film/out/contact-*.jpg`

## 依赖

S1 的绘制原语（CODI-139）。无前置阻塞内容。
