import { P } from '../src/palette.js';
import { clawd } from '../src/character.js';
import { bg, smooth, glow } from '../src/ink.js';
import { breath, sway } from '../src/life.js';
import { face, prep } from '../src/expr-e2.js';
import { pulse } from '../src/polish-v2.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    bg(ctx, '#2A2320');
    glow(ctx, 960, 300, 800, 'rgba(246,201,126,0.25)', 0.6);
    // 从疲惫到定下来：先抬眼，再抬下巴，最后嘴唇抿住
    const firm = smooth((t - 0.42) / 0.3);
    const chin = smooth((t - 0.5) / 0.32);
    const shake = pulse(t - 0.66, 0.2);
    const b = breath(t, { seed: 175, period: 1.9, amp: 0.11 });
    const s = sway(t, { seed: 175, period: 3.4, armAmp: 0.025 });
    // 近景：先垂眼（tired）→ 眉 0.34 s 先抬起来做预备 → 0.44 s 眼睛才定住 → 0.74 s 抿住嘴
    const e = face(t, [
      { t: 0.00, eyes: 'tired', mouth: 'flat', brow: null },
      { t: 0.34, brow: 'up' },
      { t: 0.44, eyes: 'look' },
      { t: 0.74, mouth: 'none' },
    ], { ramp: 0.18, seed: 175, guard: 0.10 });
    clawd(ctx, {
      cx: 960,
      by: 980,
      u: 54,
      color: P.orange,
      ...e,
      browDy: prep(t, [0.44], { antic: 0.12, dur: 0.30, amp: 0.34 }),
      seed: 175,
      bodyDy: b.bodyDy - chin * 0.05,
      squash: b.squash,
      rot: -0.008 + shake * 0.016 + s.rot,
      armL: s.armL,
      armR: s.armR,
    });
  },
};