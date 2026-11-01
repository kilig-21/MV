# SHOT_SPEC · 镜头单元规范

对应 issue：CODI-138（S2）

## 1. 目录

```
film/
  index.html          页面；暴露 window.READY / DUR / render(t)
  shots.json          一条记录 = 一个镜头
  shots/<id>.js       每镜一个模块，导出 { draw(ctx, t, shot) }
  src/
    palette.js        调色板与角色换色
    ink.js            原语：圆角块面、手绘线、纸感、光
    character.js      角色绘制、表情、特效
    props.js          道具
    scenes.js         主场景（车厢 / 夜街 / 舞台 / 卧室 / 手机）
    scenes2.js        其他场景（机场 / 桌前 / 抽屉 / 收银台 / 排练室 / 床头 / 健身房 / 手机界面）
    subtitles.js      字幕
    sheets.js         技术样张（表情 / 换色 / 轮廓校验）
  data/               构建时同步：timeline.json、modules.json
  out/                产物
  tools/parity.py     角色轮廓校验
  build.mjs           渲染 CLI
```

## 2. shots.json 字段

| 字段 | 说明 |
| --- | --- |
| `id` | `v1-01` / `c1-03` / `o-02` 之类，段前缀 + 两位序号 |
| `t0` / `t1` | 全局秒，来自 `timeline/timeline.json`，精确到 0.01 |
| `lyric` | 这一句的歌词 |
| `section` | verse1 / hook / chorus1 / verse2 / … |
| `scene` | 场景名 |
| `camera` | 景别与运动 |
| `action` | 画面里发生什么 |
| `change` | 这一格的**可见变化**（不允许「站着」） |
| `transition` | 到下一镜的接法 |
| `module` | 相对 `shots/` 的路径 |
| `assets` | 用到的场景 / 道具 |

## 3. 镜头模块接口

```js
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;        // 镜内时间
    // 画背景 → 画角色 → 画道具 → 画光效
  }
};
```

- `gt` 是全局秒，`shot` 是 shots.json 里的那条记录。
- 模块**不得**自己画角色身体，只能调用 `clawd()`。
- 模块**不得**自己叠字幕或纸感；由 `main.js` 统一处理。
- 模块**不得**引用全局状态；同一帧反复渲染必须结果一致。

## 4. 命令

```bash
# 单镜 stills（镜内时间，从 0 开始）
node mv-wo-xiang-part2/film/build.mjs stills --shot v1-12 --times 0,0.8,1.6

# 单镜 mp4（自动接原声）
node mv-wo-xiang-part2/film/build.mjs shot v1-12

# 一段（全局时间，自动接原声）
node mv-wo-xiang-part2/film/build.mjs cut --from 20.97 --to 59.44 --name animatic-verse1

# 整片
node mv-wo-xiang-part2/film/build.mjs film

# 风格样张 / 轮廓校验
node mv-wo-xiang-part2/film/build.mjs samples
node mv-wo-xiang-part2/film/build.mjs parity
```

页面查询参数：

- `?shot=<id>`：只渲染该镜，`window.DUR` = 该镜时长。
- `?from=<a>&to=<b>`：渲染一段，`DUR` = b−a，`render(t)` 的 t 从 0 起。
- `?from=&to=&abs=1`：同上，但 `render(t)` 的 t 是全局秒（扫图用）。
- `?sample=<n>`：风格样张。
- `?sheet=expressions|palette|parity`：技术表。

## 5. 新增镜头的步骤

1. 在 `shots.json` 里加一条记录（字段齐全）。
2. 在 `shots/` 新建 `<id>.js`，导出 `draw`。
3. `build.mjs stills --shot <id>` 看 3 帧。
4. 确认「这句歌词里的具体事情」在画面里看得见。
5. 跑 `build.mjs shot <id>` 出单镜 mp4，记录渲染耗时。

不需要改任何其他镜头。

## 6. 禁止

- 在镜头里重画角色、改比例、加关节。
- 用 `Math.random()`；一律用 `rng(seed)` 保证可复现。
- 一镜里塞两句歌词（除非明确是延长镜）。
- 同一背景连续跨三句不变化。
- 为了「好看」而加 3D 光影或厚涂。
- 直接改 `data/timeline.json`（它是构建时从 `timeline/timeline.json` 复制的）。