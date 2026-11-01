"""CODI-137: automatic alignment check between LRC timings and the FLAC.

No ASR. We build a vocal-band onset envelope and correlate it with pulses at
the LRC line starts. This finds a global offset and flags lines whose nearest
onset is far away. It is an aid, not a substitute for listening.
"""
import json, os
import numpy as np
import soundfile as sf
from scipy import signal

ROOT = r"C:/Users/Lenovo/Desktop/ALLCODE/Anima/mv-wo-xiang-part2"
FLAC = os.path.join(ROOT, "assets", "source-audio.flac")
TL = os.path.join(ROOT, "timeline", "timeline.json")
OUT = os.path.join(ROOT, "timeline")
os.makedirs(OUT, exist_ok=True)

data, sr = sf.read(FLAC, always_2d=True)
mono = data.mean(axis=1).astype(np.float32)
print("sr", sr, "dur", len(mono) / sr)

# Resample to 22050 for analysis.
target = 22050
g = np.gcd(sr, target)
x = signal.resample_poly(mono, target // g, sr // g).astype(np.float32)
fs = target

# STFT, then vocal-band spectral flux.
f, t, Z = signal.stft(x, fs=fs, nperseg=2048, noverlap=1536, boundary=None)
mag = np.abs(Z)
band = (f >= 300) & (f <= 3500)
flux = np.maximum(0.0, np.diff(mag[band], axis=1)).sum(axis=0)
flux = np.convolve(flux, np.ones(3) / 3, mode="same")
flux = (flux - flux.mean()) / (flux.std() + 1e-9)
hop = (2048 - 1536) / fs
frame_t = (np.arange(len(flux)) + 1) * hop

tl = json.load(open(TL, encoding="utf-8"))
lines = [l for l in tl["lines"] if not l["meta"]]
starts = np.array([l["t0"] for l in lines])

# Global lag search using section starts (stronger anchors).
anchors = [20.97, 62.39, 83.32, 124.36, 145.93, 188.28]
pulse = np.zeros_like(flux)
for s in anchors:
    i = int(s / hop)
    if 0 <= i < len(pulse):
        pulse[max(0, i - 1):i + 2] += 1.0
# Cross-correlation across +/- 2 s.
max_lag = int(2.0 / hop)
lags = np.arange(-max_lag, max_lag + 1)
scores = []
for lag in lags:
    if lag >= 0:
        a = flux[lag:]; b = pulse[:len(a)]
    else:
        a = flux[:lag]; b = pulse[-lag:]
    n = min(len(a), len(b))
    scores.append(float(np.dot(a[:n], b[:n]) / n))
scores = np.array(scores)
best = int(np.argmax(scores))
lag_s = lags[best] * hop
print("global lag", round(lag_s, 3), "s score", round(float(scores[best]), 2))

# Per-line nearest onset offset.
# Peak-pick the envelope.
peaks, props = signal.find_peaks(flux, distance=max(1, int(0.18 / hop)), height=1.2)
peak_t = frame_t[peaks]
offsets = []
for s in starts:
    if len(peak_t) == 0:
        offsets.append(0.0); continue
    j = int(np.argmin(np.abs(peak_t - s)))
    off = float(peak_t[j] - s)
    offsets.append(off if abs(off) <= 0.45 else 999.0)
offsets = np.array(offsets)
valid = offsets[np.abs(offsets) < 900]
print("lines", len(starts), "valid", len(valid))
if len(valid):
    print("median", round(float(np.median(valid)), 3), "mean", round(float(np.mean(valid)), 3),
          "within 0.15", int((np.abs(valid) <= 0.15).sum()), "/", len(valid))

result = {
    "analysis_sr": fs,
    "hop_seconds": round(hop, 4),
    "global_lag_seconds": round(lag_s, 3),
    "global_score": round(float(scores[best]), 3),
    "anchors": anchors,
    "lines": len(starts),
    "valid_lines": int(len(valid)),
    "median_offset": round(float(np.median(valid)), 3) if len(valid) else None,
    "within_015": int((np.abs(valid) <= 0.15).sum()) if len(valid) else 0,
    "offsets": [round(float(o), 2) if abs(o) < 900 else None for o in offsets],
    "note": "自动对齐只作为参考；仍需人工听校。",
}
json.dump(result, open(os.path.join(OUT, "calibration.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("saved calibration.json")