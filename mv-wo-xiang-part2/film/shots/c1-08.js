import { carriage } from '../src/scenes.js';
import { clawd } from '../src/character.js';
import { headphones } from '../src/props.js';
import { P } from '../src/palette.js';
import { smooth, glow } from '../src/ink.js';
import { breath } from '../src/polish-chorus.js';
import { exprE3, dart } from '../src/expr-e3.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    const m = carriage(ctx, gt, { scroll: gt * 20 });

    // 从梦里醒过来：先是白，再落到车厢
    const wake = smooth(t / 0.45);
    const u = 18, cx = 372;
    const by = m.seatY + 46;

    // c1 的睁眼最快：0.40 秒开始，0.14 秒内闭→半睁→全开（ramp 0.12，约 3 帧一步），
    // 中间夹两下没睡醒的连眨，最后落回 normal。
    const e = exprE3(t, [
      { t: 0.00, eyes: 'closed', mouth: 'none' },
      { t: 0.40, eyes: 'closed', mouth: 'none' },
      { t: 0.52, eyes: 'tired', mouth: 'o' },
      { t: 0.62, eyes: 'wide', mouth: 'o' },
      { t: 1.02, eyes: 'normal', mouth: 'flat' },
    ], { ramp: 0.12 });
    const blinkHere = (t > 0.62 && t < 0.70) || (t > 0.80 && t < 0.87);
    const eyes = blinkHere ? 'closed' : e.eyes;
    const b = breath(gt, 128, 1.1);

    // 惊醒时身体弹一下
    const jolt = t > 0.46 ? Math.exp(-(t - 0.46) * 9) * Math.sin((t - 0.46) * 30) : 0;

    clawd(ctx, {
      cx, by: by + b.y * 1.4 - jolt * 2, u,
      color: P.orange,
      ...e, eyes,
      seed: 127,
      look: dart(t, [{ t: 0.02, look: 0 }, { t: 0.82, look: -0.25 }, { t: 1.40, look: -0.10 }]),
      legs: [0, -0.16, 0, -0.16],
      squash: 1 + (1 - wake) * 0.02 + jolt * 0.03,
    });
    headphones(ctx, cx, by - 9 * u + b.y * 1.4, u, { color: P.tealDeep });

    // 梦的余辉
    glow(ctx, cx, by - 5 * u, 300, 'rgba(246,201,126,0.5)', 0.45 * (1 - wake * 0.7));
    if (wake < 0.6) {
      ctx.save();
      ctx.globalAlpha = (0.6 - wake) * 1.2;
      ctx.fillStyle = '#F1D9A8';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }
  },
};