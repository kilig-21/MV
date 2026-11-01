## 最终状态：已冻结（2026-10-29 完成，2026-10-31 描述校正）

角色唯一源是官方 **Clawd on Desk 1.2.0**（作者 `rullerzhou-afk`，AGPL-3.0-only）的
`clawd-static-base.svg`，**15×16 像素网格**，纯 2D 矩形骨架。

> 本 issue 原描述写的是「从 `docs/opuscar98.jpg` 3D 渲染图裁切并像素化」。那条路线已作废：
> 3D 封面派生角色被用户否定。真实来源是官方 SVG，见 `character-lock/official/rig.json`。

## 冻结的骨架（不得改动）

| 部件 | 坐标 / 尺寸 |
| --- | --- |
| 身体 | x2, y6, 11×7 |
| 左臂 / 右臂 | x0, y9, 2×2 / x13, y9, 2×2 |
| 四脚 | x3 / 5 / 9 / 11, y13, 1×2 |
| 左眼 / 右眼 | x4, y8, 1×2 / x10, y8, 1×2 |
| 地面阴影 | x3, y15, 9×1, 50% 黑 |
| 身体色 | `#DE886D` |
| 挂载点 | 左 (0,10)、右 (15,10) |

## 产物

- `character-lock/official/source-svg/`（官方 SVG 原文件）
- `character-lock/official/rig.json`（部件坐标、挂载点、档位）
- `character-lock/official/base-15x16 / 30x32 / 60x64 / 120x128 / 240x256.png`
- `character-lock/official/pose-sheet.png`、`poses.py`、`motion.py`

## 2026-10-31 追加说明

画风改为「粗描边扁平手绘」后，**比例仍是这份骨架**，只是渲染方式从像素格改为圆角矩形 + 粗描边。
比例校验改为轮廓 IoU（见 CODI-150），不再要求像素对齐。

## 不要重开

骨架已冻结。任何镜头都不得另画身体、不得加肘/膝/手掌/鞋、不得拉长四肢。
