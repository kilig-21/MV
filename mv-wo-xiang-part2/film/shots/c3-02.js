import { dreamSky, sea, noteIcons } from '../src/dream.js';
import { bigTicket, farMoon, noteSprout, skylineBelow, motes, horizonGlow } from '../src/scenes-chorus23.js';
import { clawd } from '../src/character.js';
import { soundWaves } from '../src/props.js';
import { P } from '../src/palette.js';
import { smooth } from '../src/ink.js';
import { breath, float } from '../src/polish-chorus.js';
import { expr, eyeDart } from '../src/life.js';
import { blinkOn, RAMP } from '../src/expr-e5.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    dreamSky(ctx, gt, { top: '#1B3343', mid: '#2E5A6A', low: '#3F7280', moonX: -400, moonY: -400, moonR: 1 });
    farMoon(ctx, 1620, 142, 34, '#1F3D4D');
    sea(ctx, gt, { y: 950 });
    horizonGlow(ctx, 940, { alpha: 0.75 });
    skylineBelow(ctx, gt, { y: 1050, scroll: gt * 30 });

    // 脚下留一截票面，人是站在票上的
    const top = bigTicket(ctx, 960, 906, 1500, gt, { phase: 5, seed: 242, h: 76 });

    const push = 1 + 0.055 * smooth(t / d);
    ctx.save();
    ctx.translate(960, 540);
    ctx.scale(push, push);
    ctx.translate(-960, -540);

    const f = float(gt, 321, 0.9);
    const b = breath(gt, 321, 0.9);

    // 音符一长出来就看过去：眼睛先亮（sparkle），顺着音符飘走的方向笑开，
    // 拿到远处的城以后再回到笑眼。两处变化各 4 帧过渡。
    // 大特写 + 情绪最高点不眨（POLISH-DOCTRINE §2）：sparkle 那一段关掉眨眼。
    const e = blinkOn(expr(t, [
      { t: 0.00, eyes: 'happy', mouth: 'smile' },
      { t: 0.50, eyes: 'sparkle' },
      { t: 1.00, eyes: 'happy', mouth: 'grin' },
    ], { ramp: 0.17 }), t, { seed: 329, enabled: !(t > 0.55 && t < 1.10) });

    clawd(ctx, {
      cx: 960, by: top + 8 + f.s * 3 + b.y * 2.6, u: 48,
      color: P.orange,
      ...e,
      blush: true,
      seed: 321,
      // 先看指尖，再顺着音符望向远处的城
      look: eyeDart(t, [
        { t: 0.00, look: 0.48 },
        { t: 0.50, look: 0.78 },
        { t: 1.10, look: 0.62 },
      ], { dur: 0.09, overshoot: 0.10 }),
      rot: 0.015 * f.c,
      armL: -0.34 - 0.1 * f.s - b.a * 0.05,
      armR: -0.34 + 0.1 * f.s + b.a * 0.05,
      squash: 1.01 - 0.015 * Math.abs(f.s),
    });

    // 音符从身体里长出来，比第二段更多、更高，一直往外飘
    soundWaves(ctx, 960, top - 8 * 48, 42, gt, { count: 5, color: 'rgba(241,217,168,0.45)' });
    noteSprout(ctx, 960, top + 8, 48, t, { n: 10, delay: 0.01, stagger: 0.055, grow: 0.55, spread: 0.33 });
    ctx.restore();

    noteIcons(ctx, gt, 10, 0.4);
    motes(ctx, gt, 30, { alpha: 0.5, y0: 1040 });
  },
};