import { blockedDoor } from '../src/scenes-verse3.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth } from '../src/ink.js';
import { breath, sway } from '../src/life.js';
import { face, prep, dart } from '../src/expr-e2.js';
import { gesture } from '../src/polish-v2.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    blockedDoor(ctx, gt);
    // 朋友摊手：先沉一下肩，再把两只短臂甩开
    const sh = gesture(t - 0.26, { antic: 0.1, dur: 0.26, over: 0.07 }) * (1 - smooth((t - 0.8) / 0.18));
    const speaking = smooth((t - 0.3) / 0.12) * (1 - smooth((t - 0.78) / 0.12));
    const bf = breath(t, { seed: 180, period: 1.6, amp: 0.13 });
    const sf = sway(t, { seed: 180, period: 2.4, armAmp: 0.03 });
    // 朋友：眉先抬（0.26 s 预备）→ 0.34 s 张嘴摊手说 → 0.84 s 嘴落回笑
    const ef = face(t, [
      { t: 0.00, eyes: 'normal', mouth: 'smile', brow: null },
      { t: 0.26, brow: 'up' },
      { t: 0.34, mouth: 'o' },
      { t: 0.84, mouth: 'smile' },
    ], { ramp: 0.13, seed: 180 });
    clawd(ctx, {
      cx: 780,
      by: 900,
      u: 24,
      color: P.pink,
      ...ef,
      browDy: prep(t, [0.34], { antic: 0.10, dur: 0.28, amp: 0.26 }),
      look: dart(t, [{ t: 0, look: 0.6 }, { t: 0.62, look: 0.72 }]),
      seed: 180,
      bodyDy: bf.bodyDy - sh * 0.06,
      squash: bf.squash,
      armL: -1.1 * sh + sf.armL,
      armR: -1.1 * sh + sf.armR,
      rot: -0.05 * sh + sf.rot,
    });
    // 他：不看朋友，眼睛先飘开，又忍不住瞟回来一眼
    const peek = smooth((t - 0.72) / 0.16) * (1 - smooth((t - 0.94) / 0.16));
    const bs = breath(t, { seed: 181, period: 2.2, amp: 0.12 });
    const ss = sway(t, { seed: 181, period: 3.1, armAmp: 0.02 });
    // 他：本来不看朋友，忍不住瞟一眼又移开（视线啪地回来，嘴始终抿着）
    clawd(ctx, {
      cx: 1180,
      by: 900,
      u: 22,
      color: P.orange,
      eyes: 'tired',
      look: dart(t, [{ t: 0, look: -0.6 }, { t: 0.80, look: 0.0 }, { t: 1.02, look: -0.6 }]),
      mouth: 'flat',
      seed: 181,
      bodyDy: bs.bodyDy,
      squash: bs.squash,
      rot: 0.03 + ss.rot,
      armL: ss.armL,
      armR: ss.armR,
    });
  },
};