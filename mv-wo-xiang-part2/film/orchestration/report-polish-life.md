# 打磨任务 L · 角色生命感与表情系统（report-polish-life）

状态：**完成**。`character.js` 只做加法；新增 `src/life.js`；表情总表已渲染并自查。
其他工人可以立即 import 新眼型/嘴型/眉型和 `life.js`。

## 1. 新增文件与改动

| 文件 | 说明 |
| --- | --- |
| `film/src/character.js` | **只新增** 5 个 eyes、2 个 mouth、1 个 brow 分支；`default`、旧值像素逻辑与 `clawd()` 默认参数完全未动 |
| `film/src/life.js` | 新建。5 个纯函数：`breath` / `blink` / `sway` / `gaze` / `fidget`，顶部有完整文档与最小示例 |
| `film/src/sheets-life.js` | 新建。表情总表绘制（A 眼型 16 格 / B 嘴型 8 格 / C 组合 8 格 / D 16×8 全组合矩阵） |
| `film/life-sheet/index.html` | 新建。独立样张页（不经过 main.js，避免动共享文件） |
| `film/tools/render-life-sheet.mjs` | 新建。渲染入口：静态服务 + Playwright 截图 |
| `film/out/contact-life-expressions.jpg` | **表情总表产物，1920×5520** |

重渲总表：

```bash
node mv-wo-xiang-part2/film/tools/render-life-sheet.mjs
```

## 2. 新表情（一句话说明）

### eyes

| 值 | 说明 |
| --- | --- |
| `shock` | 震惊：奶白眼白 + 缩小的瞳孔 + 每只眼上方一条短压线。 |
| `squint` | 怀疑/半眯：上眼睑压成一条横线，只露下半圆眼。 |
| `side` | 侧目：眼球整体偏向 `look` 的符号方向（`look:0` 默认朝右），瞳孔贴边，身体不动。 |
| `teary` | 委屈：正常竖眼 + 下缘一条淡蓝亮线；可再叠 `sweat`。 |
| `dazed` | 走神：眼白完整、瞳孔上翻且带一点高光，明显不对焦。 |

### mouth

| 值 | 说明 |
| --- | --- |
| `smirk` | 一侧嘴角上扬：微笑弧 + 右嘴角上挑，适合得意/坏笑。 |
| `pout` | 下唇微凸：上唇轻压、下唇向下鼓，适合撒娇/不服气。 |

### brow

| 值 | 说明 |
| --- | --- |
| `angry` | 内低外高（内端压低、外端抬起），与 `up` / `worried` 并存；左右自动镜像。 |

旧值 `normal/wide/look/dot/happy/sad/tired/sparkle/heart/closed/none`、`none/smile/grin/o/wavy/flat`、`brow:up/worried` 的输出路径未改。

## 3. life.js API

所有函数都是纯函数、无副作用、无全局状态，默认 `seed = 7`（与 `clawd()` 一致）；位移单位是 rig 单位 `u`，旋转是弧度。

| API | 返回 | 关键参数（默认） |
| --- | --- | --- |
| `breath(t, o)` | `{ bodyDy, squash }` | `period=1.5s, amp=0.15u, squashAmp=0.012, phase=0, seed=7` |
| `blink(t, o)` | `'closed' \| null` | `slot=3s, jitter=1s, dur=0.08s（≈2 帧）, phase=0, eyes='normal', enabled=true` |
| `sway(t, o)` | `{ armL, armR, rot }` | `period=2.4s, armAmp=0.05u, rotAmp=0.008rad, phase=0, seed=7` |
| `gaze(dt, o)` | `look` 数值 | `from=0, to=0, lag=0.12s, ramp=0.10s`；`dt` = 目标改变后经过的秒数 |
| `fidget(t, o)` | `{ active, kind, amp, side, t, curve, window }` | `period=8s, dur=1s, chance=0.55, kinds=['head','foot','shift'], enabled=true` |

要点：

- `blink` 的窗口按 seed 确定性生成，实际间隔 2–4 秒；当前眼型是 `closed/happy/heart` 时自动返回 `null`。
  台词首帧/情绪最高点传 `{ enabled: false }` 即可停用。
- `breath` 的 `squash` 可直接给 `clawd` 的 `squash`（略小于 1 = 吸气时身体微宽）。
- `gaze` 只负责"眼睛的延迟"：先等 `lag` 秒，再用 `ramp` 秒平滑过去；身体姿态请自己晚 `lag` 秒再动，符合"先动眼、再动身"。
- `fidget` 返回的是开关和参数，不改变身体比例。建议：`head` → 抬一侧短臂；`foot` → `legs` 里某一位 `-0.1u`；`shift` → `cx/bodyDy` 叠 0.1–0.2u。`curve = sin(π·t)` 可直接乘到动作幅度上。
- 群像：每只螃蟹传不同 `seed`（和 `phase`），就自动错开呼吸、眨眼、小动作的相位。

### 最小示例

```js
import { breath, blink, sway, gaze, fidget } from '../src/life.js';
import { clawd } from '../src/character.js';

const t = gt - shot.t0;
const b = breath(t, { seed: 11 });
const s = sway(t, { seed: 11 });
const f = fidget(t, { seed: 11 });
const eyes = blink(t, { seed: 11, eyes: 'normal' }) || 'normal';

clawd(ctx, {
  cx, by, u, seed: 11, color: P.orange,
  bodyDy: b.bodyDy, squash: b.squash,
  armL: s.armL + (f.active && f.kind === 'head' ? -0.45 * f.amp * f.curve * f.side : 0),
  armR: s.armR,
  rot: s.rot,
  legs: f.active && f.kind === 'foot' ? [0, f.side < 0 ? -0.12 * f.curve : 0, 0, f.side > 0 ? -0.12 * f.curve : 0] : [0, 0, 0, 0],
  eyes,
  look: gaze(t - lookChangedAt, { from: 0, to: 0.6 }),
  mouth: 'smile',
});
```

## 4. 验收记录

- `node mv-wo-xiang-part2/film/build.mjs stills --shot v1-12 --times 0.5,1.5` ✅
  产物 `film/out/contact-v1-12.jpg`，夜班车厢与三个角色均正常，旧表情/比例未变。
- 表情总表 ✅ `film/out/contact-life-expressions.jpg`（1920×5520）
  - A：16 种眼型各一格（含 5 个新值），标注中英文名与代码值；
  - B：8 种嘴型各一格（含 `smirk` / `pout`）；
  - C：8 组新组合（惊慌 / 怀疑 / 侧目 / 委屈 / 走神 / 撒娇 / 得意 / 暴怒），验证新值互相叠加仍能读出来；
  - D：16×8 全组合矩阵，每格一帧，行=eyes、列=mouth。
- 已用 `tools/view-image.py` 分区放大自查：新表情在总表尺寸下可辨认。

## 5. 注意

- `shock` 用奶白眼白，深色/饱和身体色上最清楚；`cream` 色角色上眼白对比会弱（仍有一条压线辅助）。
- `side` 的方向由 `look` 的正负决定；`look:0` 时默认朝右。
- 没有改任何 `shots/*.js`、其他 `src/*.js`、`build.mjs`、`shots.json`。