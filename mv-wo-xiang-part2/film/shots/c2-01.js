import { dreamSky, windLines } from '../src/dream.js';
import { cloudBank, motes, horizonGlow } from '../src/scenes-chorus23.js';
import { cityLine } from '../src/scenes.js';
import { pressCloudFront, fgRain } from '../src/polish-chorus-r2.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { lerp, smooth } from '../src/ink.js';
import { keys, backOut, breath, beatInfo, beatPulse, downHit } from '../src/polish-chorus.js';
import { rakedTicket } from '../src/fix-round3c.js';
import { exprE3, withBlink, dart, browAt } from '../src/expr-e3.js';

// c2 的「呼风唤雨」：换低机位，不再是 c1-01 的居中同构图。
// 票面从画面左下角斜着入画，角色压到左三分之一，月亮移出画外；
// 前 0.6 秒镜头向上摇，远处的城和云海从票面后升进画面。
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    const tilt = smooth(t / 0.6);             // 0→1，前 0.6 秒完成上摇
    const camDy = lerp(300, 0, tilt);         // 远景从票面后升起，0.6 s 完成上摇

    // 天占满画面；月亮已经摇出画外
    dreamSky(ctx, gt, { top: '#0F1B27', mid: '#1D3745', low: '#2A4C5C', moonX: -600, moonY: -400, moonR: 1 });
    horizonGlow(ctx, 806 + camDy, { alpha: 0.5 });

    // 远处的城：上摇过程中从票面后升出来，之后慢慢横移
    ctx.save();
    ctx.globalAlpha = 0.92;
    cityLine(ctx, { y: 812 + camDy, seed: 211, scroll: gt * 26, color: '#183441', minH: 90, maxH: 230, win: '#E3B36A' });
    ctx.restore();
    ctx.save();
    const fog = ctx.createLinearGradient(0, 600 + camDy, 0, 900 + camDy);
    fog.addColorStop(0, 'rgba(47,85,102,0)');
    fog.addColorStop(1, 'rgba(47,85,102,0.55)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, 580 + camDy, 1920, 340);
    ctx.restore();

    // 云海压在城市前，跟着上摇幅度小一点（视差）
    const gather = keys(t, [[0, 0.1], [0.7, 0.55], [1.4, 1.0]]);
    const puff = 1 + 0.03 * downHit(gt, 3);
    const far = [
      [200, 900, 1.15, 0.5],
      [740, 872, 1.35, 0.62],
      [1360, 892, 1.05, 0.56],
      [1790, 940, 0.85, 0.5],
    ];
    for (let i = 0; i < far.length; i++) {
      const [bx, by, bs, ba] = far[i];
      cloudBank(ctx, lerp(bx, bx + (960 - bx) * 0.10, gather), by + camDy * 0.55 - gather * 26,
        bs * (0.92 + 0.08 * gather) * puff, { alpha: ba });
    }

    // 风从下往上刮
    windLines(ctx, gt, 8, 0.18 + 0.42 * gather);
    motes(ctx, gt, 40, { alpha: 0.7, y0: 1080 });

    // 票面：下缘从左下角入画，向右上退去
    const tick = rakedTicket(ctx, gt, { seed: 641, scroll: gt * 90 + 60, phase: 0, lift: 10 * tilt });
    // 角色站在票面远边上：x = 470 → 左三分之一
    const cxT = 470;
    const topT = tick.far((cxT - 150) / (1730 - 150));

    // 抬手呼风：比 c1 更大，云跟着被调上来
    const raise = keys(t, [
      [0.00, 0.05], [0.16, 0.13], [0.74, -1.15, backOut], [1.00, -1.26], [1.34, -1.17],
    ]);
    const bi = beatInfo(gt);
    const pump = Math.exp(-bi.ph * 4.2);
    const alt = bi.inBar % 2 === 0 ? 1 : -1;
    const b = breath(gt, 220);
    const lift = Math.sin(t * 1.8) * 4 + b.y * 3.6;

    // 表情：抬手时还收着（happy + smile），城升起来才亮眼（sparkle + grin），
    // 眉毛在「哇」的一下轻轻抬起——比 c1 笃定，但仍有期待。
    const e = withBlink(gt, 220, exprE3(t, [
      { t: 0.00, eyes: 'happy', mouth: 'grin' },
      { t: 1.00, eyes: 'happy', mouth: 'smile' },
      { t: 1.90, eyes: 'sparkle', mouth: 'grin', brow: 'up' },
      { t: 3.20, eyes: 'sparkle', mouth: 'smile', brow: null },
    ]));
    const browDy = browAt(t, [{ at: 1.94, dur: 0.34, amp: 0.20 }]);
    // 先看自己举起的手，再抬眼看升上来的城
    const look = dart(t, [
      { t: 0.05, look: -0.35 }, { t: 0.48, look: -0.55 },
      { t: 1.15, look: 0.22 }, { t: 2.60, look: 0.05 },
    ]);

    clawd(ctx, {
      cx: cxT, by: topT + 3 + lift, u: 44,
      color: P.orange,
      ...e, browDy, blush: true,
      seed: 220,
      look,
      armL: raise + 0.11 * alt * pump + b.a * 0.05,
      armR: raise - 0.08 * alt * pump - b.a * 0.05,
      rot: -0.02 + b.r * 0.012,
      squash: 1.02 + 0.02 * pump,
    });

    // 前景：云从画面下缘压上来，最后盖住脚下半边
    const press = keys(t, [[0.0, 0.08], [0.9, 0.40], [2.0, 0.70], [3.6, 0.90]]);
    pressCloudFront(ctx, gt, press, { seed: 1041 });
    fgRain(ctx, gt, 12, { alpha: 0.3, dir: 1, seed: 617 });

    beatPulse(ctx, cxT, topT + 20, gt, 1.0, { beatAlpha: 0.24, barAlpha: 0.5 });
  },
};