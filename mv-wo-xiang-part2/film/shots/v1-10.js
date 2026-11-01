import { rehearsal } from '../src/scenes2.js';
import { clawd, groundShadow } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth } from '../src/ink.js';
import { breathe, bounce, weightShift } from '../src/polish-v1.js';
import { faceE1, dart } from '../src/expr-e1.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const d = shot.t1 - shot.t0;
    rehearsal(ctx, gt);

    // 独自练习：动作比现在笨拙——两拍之后脚下打滑，慌忙找回来
    const ph = t * 5.5;
    const slip = smooth((t - 0.5) / 0.08) * (1 - smooth((t - 0.62) / 0.1));
    const catchUp = bounce(t, 0.66, { dur: 0.3, amp: 1 });
    const wob = Math.sin(ph) * 0.45 + Math.sin(ph * 0.5) * 0.1;
    const flail = slip * 0.35 + catchUp * 0.12;

    const bob = breathe(t, 94, 26, { amp: 0.18 });
    const shift = weightShift(t, 94, { amp: 3 });
    groundShadow(ctx, 760, 902, 26, { alpha: 0.2 });

    const f = faceE1(t, [
      { at: 0.00, eyes: 'normal', mouth: 'flat' },
      { at: 0.50, eyes: 'wide', mouth: 'o', ramp: 0.10 },          // 打滑
      { at: 0.80, eyes: 'tired', mouth: 'pout', brow: 'angry', ramp: 0.14 },   // 站稳了，不服
      { at: 1.06, eyes: 'tired', mouth: 'wavy', brow: 'worried', ramp: 0.16 },
    ], { seed: 94, ramp: 0.14, blinkFrom: 0.86, noBlinkIn: [[0.48, 0.72]] });

    clawd(ctx, {
      cx: 760 + shift, by: 900 - bob + slip * 9 - catchUp * 3, u: 26,
      color: P.orange,
      eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
      look: f.blinking ? 0 : dart(t, [
        { t: 0.00, look: 0.25 },
        { t: 0.54, look: 0.02 },
        { t: 0.90, look: 0.30 },
      ], { dur: 0.09 }),
      seed: 94,
      armL: wob + flail,
      armR: -wob - flail,
      legs: [
        Math.sin(ph) * 0.2 + slip * 0.3,
        -Math.sin(ph) * 0.2 - slip * 0.1,
        Math.sin(ph + 1) * 0.2,
        -Math.sin(ph + 1) * 0.2 - catchUp * 0.1,
      ],
      rot: -0.02 * shift / 3 + slip * 0.035,
      squash: 1 + slip * 0.02 - catchUp * 0.006,
    });

    // 打滑那一瞬的汗
    if (slip > 0.2) {
      ctx.save();
      ctx.globalAlpha = 0.7 * slip;
      ctx.fillStyle = '#8FBAC6';
      ctx.beginPath();
      ctx.ellipse(760 + 52, 690 - slip * 12, 7, 11, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 灯下的灰：慢慢飘，给空房间一点体积
    ctx.save();
    for (let i = 0; i < 14; i++) {
      const seed = i * 37.3;
      const x = 640 + ((seed * 13) % 620) + Math.sin(t * 0.5 + i) * 8;
      const y = 220 + ((seed * 7) % 520) + ((t * (7 + i % 5)) % 60) - 30;
      ctx.globalAlpha = 0.05 + (i % 4) * 0.02;
      ctx.fillStyle = '#E8D5B0';
      ctx.beginPath();
      ctx.arc(x, y, 1.6 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 顶灯闪一下，最后灭掉
    const flick = (Math.sin(gt * 23) > 0.6 ? 0.12 : 0) + smooth((t - (d - 0.45)) / 0.45) * 0.55;
    ctx.save();
    ctx.globalAlpha = Math.min(0.7, flick);
    ctx.fillStyle = '#12100E';
    ctx.fillRect(0, 0, 1920, 1080);
    ctx.restore();
  },
};