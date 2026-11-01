import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, block } from '../src/ink.js';
import { breath, sway } from '../src/life.js';
import { face, prep } from '../src/expr-e2.js';
import { pulse, albumWallStage, droppingCover } from '../src/polish-v2.js';

const COVERS = [
  { x: 240, c: '#DE886D' },
  { x: 620, c: '#4E8FA3' },
  { x: 1000, c: '#D9A03F' },
  { x: 1380, c: '#B9A6D9' },
];

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    albumWallStage(ctx);

    // 四张封面一张张落下，不同时出现
    const starts = [0.26, 0.74, 1.22, 1.70];
    COVERS.forEach((cv, i) => {
      const k = smooth((t - starts[i]) / 0.34);
      if (k <= 0) return;
      droppingCover(ctx, cv.x, 220, 300, 300, k, cv.c, 1860 + i * 10);
      // 落地的灰
      if (k >= 1) {
        const settle = (t - starts[i] - 0.34) / 0.2;
        if (settle > 0 && settle < 1) {
          block(ctx, cv.x - 10, 516, 320, 8, 4, 'rgba(40,32,28,0.18)', { seed: 1895 + i });
        }
      }
    });

    // 他抬头看，每落一张眼皮抬一下，最后一张亮一下眼
    const step = smooth(t / (shot.t1 - shot.t0));
    const flinch = starts.reduce((a, s) => a + pulse(t - s - 0.3, 0.22), 0);
    const shine = smooth((t - 1.9) / 0.2);
    const b = breath(t, { seed: 174, period: 1.7, amp: 0.14 });
    const s = sway(t, { seed: 174, armAmp: 0.03 });
    // 四张封面一张张落下，眼皮跟着一张张抬；最后一张（1.90 s）眼睛才亮起来。
    // 亮起来之前先抬一下眉（0.14 s），嘴角等到 2.02 s 才松（不要大笑）。
    const e = face(t, [
      { t: 0.00, eyes: 'wide', mouth: 'none' },
      { t: 1.76, brow: 'up' },
      { t: 1.90, eyes: 'sparkle' },
      { t: 2.02, mouth: 'smile' },
      { t: 2.44, brow: null },
    ], { ramp: 0.16, seed: 174 });
    clawd(ctx, {
      cx: 960 - 160 + step * 160,
      by: 896,
      u: 24,
      color: P.orange,
      ...e,
      browDy: prep(t, [1.90], { antic: 0.13, dur: 0.30, amp: 0.30 }),
      look: 1,
      seed: 174,
      bodyDy: b.bodyDy - flinch * 0.06,
      squash: b.squash,
      armR: -0.7 - flinch * 0.12 + s.armR,
      armL: s.armL,
      rot: 0.01 + flinch * 0.012 + s.rot,
    });
  },
};