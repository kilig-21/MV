"""CODI-137: build the FLAC-based timeline from the local LRC.

The LRC is used as the initial timing. It has not been beat-aligned to the
FLAC yet, so every line is marked calibrated=false until checked by ear.
"""
import re, json, os, csv

ROOT = r"C:/Users/Lenovo/Desktop/ALLCODE/Anima/mv-wo-xiang-part2"
LRC = os.path.join(ROOT, "assets", "lyrics.lrc")
OUT = os.path.join(ROOT, "timeline")
os.makedirs(OUT, exist_ok=True)

DURATION = 281.551771
FPS = 24

SECTIONS = [
    ("intro", 0.0, 20.97),
    ("verse1", 20.97, 59.44),
    ("hook1", 59.44, 62.39),
    ("chorus1", 62.39, 82.63),
    ("verse2", 83.32, 121.50),
    ("hook2", 121.50, 124.36),
    ("chorus2", 124.36, 145.40),
    ("verse3", 145.93, 188.12),
    ("chorus3", 188.28, 208.24),
    ("outro", 208.24, DURATION),
]

raw = open(LRC, "rb").read().decode("utf-8-sig")
rows = []
for line in raw.splitlines():
    m = re.match(r"\[(\d+):(\d+)[.:](\d+)\](.*)", line)
    if not m:
        continue
    ms = int(m.group(1)) * 60000 + int(m.group(2)) * 1000 + int(m.group(3).ljust(3, "0")[:3])
    text = m.group(4).strip()
    if text:
        rows.append([ms / 1000.0, text])

rows.sort(key=lambda r: r[0])

def section_of(t):
    for name, a, b in SECTIONS:
        if a <= t < b:
            return name
    return "outro"

lines = []
for i, (t0, text) in enumerate(rows):
    nxt = rows[i + 1][0] if i + 1 < len(rows) else 208.24
    t1 = min(nxt, 208.24)
    if t1 <= t0:
        t1 = t0 + 1.0
    lines.append({
        "i": i + 1,
        "t0": round(t0, 3),
        "t1": round(t1, 3),
        "dur": round(t1 - t0, 3),
        "text": text,
        "section": section_of(t0),
        "meta": text.startswith("编曲"),
        "calibrated": False,
    })

timeline = {
    "source_audio": "assets/source-audio.flac",
    "duration": DURATION,
    "fps": FPS,
    "timebase": "FLAC 281.551771 s",
    "lrc_last_lyric": 208.24,
    "outro_seconds": round(DURATION - 208.24, 3),
    "calibrated": False,
    "note": "LRC 时间作为初版，尚未逐句对齐 FLAC；使用前需人工校准，误差目标 ±0.15 s。",
    "sections": [{"name": n, "t0": a, "t1": round(b, 3), "dur": round(b - a, 3)} for n, a, b in SECTIONS],
    "lines": lines,
}
with open(os.path.join(OUT, "timeline.json"), "w", encoding="utf-8") as f:
    json.dump(timeline, f, ensure_ascii=False, indent=2)

# Human-readable section table.
md = ["# FLAC 全曲分段表（初版）", "",
      f"- 音频：`{timeline['source_audio']}`，{DURATION:.3f} 秒",
      f"- 歌词：`assets/lyrics.lrc`，有效行 {len(lines)}，最后一句 {lines[-1]['t0']:.2f} 秒",
      f"- 尾奏：208.24 – {DURATION:.3f} 秒（{timeline['outro_seconds']:.2f} 秒）",
      "- 状态：**未校准**。LRC 时间仅作初版，需逐句对齐 FLAC。", ""]
for name, a, b in SECTIONS:
    sec = [x for x in lines if x["section"] == name and not x["meta"]]
    md.append(f"## {name}  {a:.2f} – {b:.2f} 秒（{b-a:.2f} 秒，{len(sec)} 句）")
    if name == "outro":
        md.append("")
        md.append("器乐尾奏，LRC 无歌词。尾奏画面方案见 CODI-144，暂缓。")
        md.append("")
        continue
    md.append("")
    md.append("| # | t0 | t1 | 歌词 |")
    md.append("| --- | --- | --- | --- |")
    for x in sec:
        md.append(f"| {x['i']} | {x['t0']:.2f} | {x['t1']:.2f} | {x['text']} |")
    md.append("")
with open(os.path.join(OUT, "lyrics-sections.md"), "w", encoding="utf-8") as f:
    f.write("\n".join(md))

# Storyboard template.
with open(os.path.join(OUT, "storyboard-template.csv"), "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["shot_id", "section", "t0", "t1", "lyric", "scene", "camera", "action", "change", "transition", "status"])
    for x in lines:
        if x["meta"]:
            continue
        w.writerow([f"{x['section']}-{x['i']:02d}", x["section"], f"{x['t0']:.2f}", f"{x['t1']:.2f}", x["text"], "", "", "", "", "", "todo"])

print("lines", len(lines), "sections", len(SECTIONS))
print("outro", round(DURATION - 208.24, 3))
print("saved", OUT)