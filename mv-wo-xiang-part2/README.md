# 我想 part2 · 像素 MV

用户提供歌曲与 LRC，主角指定为 Clawd 小螃蟹。当前阶段：十秒副歌样片 v3 已获用户认可，完整 MV 仍在讨论，尚未制作完成。

继续前先读父目录的 [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md)，其中区分已确认方向、用户纠正和未定稿提议。最新首要标准是画面跟着歌词走；神情辅助，外观保持短肢 Clawd。

合格样片：[wo-xiang-chorus-v3.mp4](chorus-preview-v3/wo-xiang-chorus-v3.mp4)。纯 2D 像素、完整像素字幕、原歌原声，整只角色在不同音符间跳跃。v1 内容变化不足、v2 肢体变形，均保留作历史对照，不作为当前标准。

音频素材保存在 assets/，已从 Git 跟踪中排除。用户原始文件保持只读。
NCM 转换使用 ncmdump-py 1.1.6（MIT），工具安装在父项目 .tools/ncm-deps。
来源：https://github.com/ww-rm/ncmdump-py

prepare_audio.py 禁用库的在线封面获取；转换过程完全在本机进行。为适配 Python 3.13，使用 Pillow 代替已移除的 imghdr 查询图片格式。
转换结果和原文件校验记录见 audio-preparation.json。
