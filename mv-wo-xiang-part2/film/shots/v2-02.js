import { clockWall } from '../src/scenes-verse2.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { line } from '../src/ink.js';
import { breath, sway } from '../src/life.js';
import { face, dart } from '../src/expr-e2.js';
import { pulse } from '../src/polish-v2.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const m = clockWall(ctx, gt);
    // 秒针：一格一格，不等速
    const sec = Math.floor(t * 4) % 60;
    const a = -Math.PI / 2 + sec / 60 * Math.PI * 2;
    line(ctx, m.cx, m.cy, m.cx + Math.cos(a) * m.r * 0.78, m.cy + Math.sin(a) * m.r * 0.78,
      { seed: 260, lw: 3, color: '#E0566E', parts: 1 });
    // 墙下的小螃蟹：等时间，重心左右挪，吸一口气又放下
    // 表情：一直半困（tired），视线先飘向钟（0.40）→ 眼睛 0.52 才跟着变精神
    const e = face(t, [
      { t: 0.00, eyes: 'tired', mouth: 'flat' },
      { t: 0.52, eyes: 'look' },
    ], { ramp: 0.15, seed: 131 });
    const look = dart(t, [{ t: 0, look: 0.18 }, { t: 0.40, look: 0.62 }, { t: 0.78, look: 0.55 }]);
    const sigh = pulse(t - 0.46, 0.34);
    const b = breath(t, { seed: 131, period: 1.9, amp: 0.13 });
    const s = sway(t, { seed: 131, period: 2.8, armAmp: 0.035 });
    clawd(ctx, {
      cx: 380 + Math.sin(t * 0.9 + 0.4) * 3,
      by: 1010,
      u: 20,
      color: P.orange,
      ...e,
      look,
      seed: 131,
      bodyDy: b.bodyDy + sigh * 0.1,
      squash: b.squash,
      armL: s.armL,
      armR: s.armR,
      rot: -0.02 + Math.sin(t * 0.75) * 0.015 + s.rot,
    });
  },
};