# 角色基准板 · CODI-135 / CODI-136（官方 Clawd 桌宠版）

## 最终采用的来源

本机安装了 **Clawd on Desk 1.2.0**（`D:/ALLAPPS/components/Clawd on Desk/`），它的 `app.asar` 里有官方 Clawd 素材：

- 基础角色：`assets/svg/clawd-static-base.svg`
- 官方动画：`clawd-idle-living.svg`、`clawd-mini-crabwalk.svg`、`clawd-happy.svg`、`clawd-sleeping.svg`、`clawd-headphones-groove.svg`、`clawd-working-typing.svg`、`clawd-coffee-hand.svg` 等
- 配饰：`assets/accessories/*.svg`（帽子、光环等）

基础角色本身就是 **15×16 的像素网格**，用整数矩形绘制，不是 3D 渲染，也不是从剧照抠图。这是目前最接近 Clawd 本尊的 2D 源。

之前的两个实验版本（3D 封面派生、2D 剧照抠图）保留在父目录，仅作对比，不再采用。

## 官方 base 的网格

| 部件 | 坐标 / 尺寸 |
| --- | --- |
| 身体 torso | x 2, y 6, 11 × 7 |
| 左臂 | x 0, y 9, 2 × 2 |
| 右臂 | x 13, y 9, 2 × 2 |
| 四脚 | x 3 / 5 / 9 / 11, y 13, 1 × 2 |
| 左眼 | x 4, y 8, 1 × 2 |
| 右眼 | x 10, y 8, 1 × 2 |
| 地面阴影 | x 3, y 15, 9 × 1, 50% 黑 |
| 身体色 | `#DE886D` |
| 眼睛 | `#000000` |

宽扁身体、两只黑色竖眼、两侧单段短臂、四只短脚，没有肘、膝、手掌、鞋。

## 高清输出

`official/` 目录：

| 文件 | 尺寸 | 用途 |
| --- | --- | --- |
| `base-15x16.png` | 15 × 16 | 原生网格 |
| `base-30x32.png` | 30 × 32 | ×2 |
| `base-60x64.png` | 60 × 64 | ×4 |
| `base-120x128.png` | 120 × 128 | ×8，主用 |
| `base-240x256.png` | 240 × 256 | ×16，特写 |
| `base-preview.png` | — | 夜景背景预览 |
| `rig.json` | — | 部件坐标、挂载点、缩放档 |

整数倍最近邻放大，硬边，无抗锯齿。需要多大就取对应档，不会再出现 JPEG 抠图的糊边。

## 可挂道具

`rig.json` 定义了两个挂载点：

- 左手：`(0, 10)`
- 右手：`(15, 10)`

道具作为独立 sprite 画在挂载点，不改变身体。`motion/phone-demo-4f.png` 是右手拿手机的示例。

## 动作条

`official/motion/`：

- `idle-4f.png`：呼吸 + 眨眼
- `walk-8f.png`：螃蟹式左右摇摆，对角腿交替
- `run-4f.png`
- `jump-5f.png`
- `phone-demo-4f.png`

全部只做整数像素位移，不切身体、不加关节。官方动画 SVG 里还有现成的 crabwalk、idle、happy、sleeping、typing、coffee 等动作，后续可直接参考或逐帧导出。

## 许可与署名

Clawd on Desk 1.2.0，作者 `rullerzhou-afk`，许可证 **AGPL-3.0-only**。本项目为个人 MV 使用，片尾会署名；不把桌宠素材包单独再分发或上传到公开仓库。

## 下一步

1. 确认采用官方 base（15×16）作为唯一角色源。
2. 确认后冻结 CODI-135，CODI-136 用官方动画补齐 idle / walk / jump / 坐 / 拿道具。
3. 进入 CODI-137 全曲时间轴与 CODI-140 第一段主歌分镜表。