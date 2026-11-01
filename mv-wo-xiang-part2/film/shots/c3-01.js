import { dreamSky, windLines } from '../src/dream.js';
import { bigTicket, cloudBank, farMoon, skylineBelow, motes, horizonGlow } from '../src/scenes-chorus23.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth } from '../src/ink.js';
import { keys, backOut, breath, beatPulse, float } from '../src/polish-chorus.js';
import { expr, eyeDart, browLift } from '../src/life.js';
import { blinkOn, RAMP } from '../src/expr-e5.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    // 三段副歌里最亮的一层天；月小、远，挂在左上
    dreamSky(ctx, gt, { top: '#1B3343', mid: '#2C5666', low: '#3C6E7B', moonX: -400, moonY: -400, moonR: 1 });
    farMoon(ctx, 300, 128, 36, '#1F3B4B');

    // 城在很远的下面，只留一层灯
    skylineBelow(ctx, gt, { y: 1010, scroll: gt * 40 });

    // 平台与城之间是一层云海
    const gather = smooth(t / (d * 0.6));
    const banks = [[150, 654, 0.85], [640, 692, 1.0], [1160, 666, 0.9], [1660, 700, 0.8]];
    for (let i = 0; i < banks.length; i++) {
      const [bx, by, bs] = banks[i];
      cloudBank(ctx, bx + Math.sin(gt * 0.5 + i) * 14, by - gather * 12, bs * (0.94 + 0.06 * gather), { alpha: 0.62 + 0.2 * gather, fill: '#48707F' });
    }

    horizonGlow(ctx, 700, { alpha: 0.8 });
    windLines(ctx, gt, 11, 0.26 + 0.34 * gather);
    motes(ctx, gt, 66, { alpha: 0.85, y0: 1030 });

    // 巨大的车票平台升到城市上空
    const top = bigTicket(ctx, 960, 560, 760, gt, { phase: 0, seed: 241 });

    // c3 没有停点：一口气张开、张开以后还在继续往外走（连续慢波，不是一拍一顶）
    const raise = keys(t, [[0, -0.05], [0.28, 0.10], [1.55, -1.38, backOut], [2.19, -1.46]]);
    const f = float(gt, 320, 0.8);
    const b = breath(gt, 320, 0.85);

    // 释然的笑：先抬一下眉（准备），再让视线顺着翻上来的云看向更远的城，
    // 嘴角晚 0.25 秒才跟上；最后一帧收在笑眼上。四处变化都走过渡，不硬切。
    const e = blinkOn(expr(t, [
      { t: 0.00, eyes: 'happy', mouth: 'smile', brow: null },
      { t: 1.15, brow: 'up' },
      { t: 1.30, eyes: 'side' },
      { t: 1.55, mouth: 'grin' },
      { t: 2.00, eyes: 'happy', brow: null },
    ], { ramp: RAMP }), t, { seed: 328 });

    clawd(ctx, {
      cx: 960, by: top + 6 + f.s * 3 + b.y * 3, u: 30,
      color: P.orange,
      ...e,
      blush: true,
      seed: 320,
      // 眼睛看向远处的城，而不是镜头：1.2 秒向云瞥一下，再放回最远处
      look: eyeDart(t, [
        { t: 0.00, look: -0.80 },
        { t: 1.20, look: -0.52 },
        { t: 2.00, look: -0.92 },
      ], { dur: 0.10, overshoot: 0.10 }),
      browDy: browLift(t, { at: 1.15, dur: 0.34, amp: 0.30 }),
      rot: 0.02 * f.c,
      armL: raise + 0.05 * f.s2 + b.a * 0.05,
      armR: raise - 0.05 * f.s2 - b.a * 0.05,
      squash: 1.02 - 0.02 * Math.abs(f.s),
    });
    beatPulse(ctx, 960, top + 6, gt, 0.9, { beatAlpha: 0.24, barAlpha: 0.5 });
  },
};