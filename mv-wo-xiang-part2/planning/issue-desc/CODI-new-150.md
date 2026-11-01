## 阶段目标（S3）

在官方 15×16 骨架上，把角色做成扁平手绘的单一绘制模块，支持表情与换色。
这是全片「不面瘫」和「多角色」的基础设施。

## 必须支持的部件（全部来自 `character-lock/official/rig.json` 的比例）

- 身体：圆角矩形，x2 y6, 11×7 → 统一描边（≈身高 3%）
- 短臂：左右各 2×2，可上下/前后 1–2 px
- 四脚：x3 / 5 / 9 / 11, 1×2，可交替抬起
- 眼睛：默认黑色竖条；支持 点眼 / 竖眼 / 圆眼 / 笑眼（^ ^）/ 爱心眼 / 睡觉（闭眼 + Z）/ 惊讶圆眼
- 嘴：无 / 微笑弧 / 张嘴笑 / 小 o 形 / 波浪嘴
- 附加：腮红、眉毛、汗滴、爱心气泡

## 多角色

同一身体换色，形状与比例完全一致：
绿 `#A8C48C`、黄 `#E0A93F`、粉 `#E8A0A8`、淡紫 `#B9A6D9`、主角橙 `#DE886D`、青 `#4E8FA3`。
只允许换身体色 + 小配饰（围巾/耳机/帽子），不得改轮廓。

## 需要完成

- [ ] `film/src/character.js`：`drawClawd(ctx, x, yBottom, {scale, color, eyes, mouth, blush, look, armL, armR, legs, squash, rotate})`。
- [ ] 单一边缘描边：外形用并集轮廓描边，**不能**出现部件之间的内线。
- [ ] 表情总表 `film/character-lock/expressions.png`（至少 8 种）。
- [ ] 换色总表 `film/character-lock/palette-characters.png`（6 色同一姿势）。
- [ ] 与官方 `base-240x256.png` 的轮廓对照 + IoU 脚本（`film/tools/parity.py`）。
- [ ] 动态姿势：走 / 跑 / 站 / 坐 / 跳 / 蹲 / 转身，沿用 CODI-136 的帧序与曲线。

## 验收

- 任意表情、任意颜色下，轮廓与官方 base 的 IoU ≥ 0.97。
- 眼睛数量始终 2；四脚始终 4；两臂始终 2；无肘膝手掌。
- 表情在小尺寸（画面里 120 px 高）仍可辨认。

## 产物路径

`film/src/character.js`、`film/character-lock/*.png`、`film/tools/parity.py`

## 依赖

CODI-135 的 rig、CODI-139 的描边/调色板。
