import { dreamSky, sea, noteIcons } from '../src/dream.js';
import { recordBoat, farMoon, motes, horizonGlow } from '../src/scenes-chorus23.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, lerp } from '../src/ink.js';
import { breath, float } from '../src/polish-chorus.js';
import { expr, eyeDart } from '../src/life.js';
import { blinkOn, RAMP } from '../src/expr-e5.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    dreamSky(ctx, gt, { top: '#1B3343', mid: '#2E5A6A', low: '#427785', moonX: -400, moonY: -400, moonR: 1 });
    farMoon(ctx, 300, 150, 34, '#1F3B4C');
    sea(ctx, gt, { y: 800 });
    horizonGlow(ctx, 802, { alpha: 0.9 });

    // 唱片封套折成的大船从左边驶进来，黑胶帆立在船头
    const k = smooth(t / (d * 0.55));
    const bx = lerp(560, 1000, k);
    const boat = recordBoat(ctx, bx, 800, 340, gt, { phase: 0, sailX: -0.26 });

    const f = float(gt, 325, 0.85);
    const b = breath(gt, 325, 0.9);

    // 船身稳下来以后，目光从近处的船头放到最远的海天线上，再落回船里。
    const e = blinkOn(expr(t, [
      { t: 0.00, eyes: 'happy', mouth: 'smile' },
      { t: 0.85, eyes: 'side' },
      { t: 1.45, eyes: 'happy' },
    ], { ramp: RAMP }), t, { seed: 331 });

    // 角色站在船尾的票面上：不抓不扶，手臂自然张开，随船慢慢起伏
    clawd(ctx, {
      cx: bx + 215 + f.c * 3, by: boat.deck + 14 + f.s * 3 + b.y * 2, u: 19,
      color: P.orange,
      ...e,
      blush: true,
      seed: 325,
      // 船头朝前，他看的也是前方——镜头只看到四分之三张脸
      look: eyeDart(t, [
        { t: 0.00, look: 0.62 },
        { t: 0.85, look: 0.92 },
        { t: 1.45, look: 0.74 },
      ], { dur: 0.10, overshoot: 0.12 }),
      legs: [0, -0.18, 0, -0.18],
      rot: Math.sin(gt * 0.7) * 0.02 + f.c * 0.015,
      armL: -0.45 - 0.08 * f.s + b.a * 0.05,
      armR: -0.45 + 0.08 * f.s - b.a * 0.05,
      squash: 1.01 - 0.012 * Math.abs(f.s),
    });

    // 从唱片里飘出来的音符
    noteIcons(ctx, gt, 10, 0.5);
    motes(ctx, gt, 26, { alpha: 0.5, y0: 1020 });
  },
};