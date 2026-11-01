#!/usr/bin/env python
"""Check shot coverage over the 281.551771 s timeline.

Merges shots.json with data/shots-extra/*.json the same way build.mjs does, then
reports gaps, overlaps, missing modules and out-of-range intervals.

    python tools/coverage.py           # full song
    python tools/coverage.py --end 208.24
"""
import argparse
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
TOTAL = 281.551771


def load():
    base = json.loads((HERE / "shots.json").read_text(encoding="utf-8"))
    merged = {s["id"]: s for s in base["shots"]}
    extra = HERE / "data" / "shots-extra"
    if extra.is_dir():
        for f in sorted(extra.glob("*.json")):
            frag = json.loads(f.read_text(encoding="utf-8"))
            for s in frag.get("shots", frag):
                merged[s["id"]] = s
    return sorted(merged.values(), key=lambda s: s["t0"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--end", type=float, default=TOTAL)
    ap.add_argument("--tol", type=float, default=0.012, help="gap tolerance in seconds")
    args = ap.parse_args()

    shots = load()
    problems = 0
    print(f"{len(shots)} shots")

    prev, prev_id = 0.0, "(start)"
    for s in shots:
        if s["t1"] <= s["t0"]:
            print(f"  BAD interval {s['id']}: {s['t0']} -> {s['t1']}")
            problems += 1
        if s["t0"] < prev - 0.001:
            print(f"  OVERLAP {prev_id} ends {prev:.2f} but {s['id']} starts {s['t0']:.2f}")
            problems += 1
        elif s["t0"] - prev > args.tol:
            print(f"  GAP {prev:.2f} -> {s['t0']:.2f} ({s['t0'] - prev:.2f}s) before {s['id']}")
            problems += 1
        mod = HERE / s["module"].lstrip("./")
        if not mod.is_file():
            print(f"  MISSING module {s['id']}: {s['module']}")
            problems += 1
        prev, prev_id = max(prev, s["t1"]), s["id"]

    if args.end - prev > args.tol:
        print(f"  GAP {prev:.2f} -> {args.end:.2f} ({args.end - prev:.2f}s) at the end")
        problems += 1

    print(f"coverage ends {prev:.2f} / {args.end:.2f}")
    print("OK" if problems == 0 else f"{problems} problem(s)")


if __name__ == "__main__":
    main()