import { subwayPlatform } from '../src/scenes-intro.js';
import { departingTrain } from '../src/scenes-outro.js';
import { blownNewspaper } from '../src/scenes-outro-r2.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { clamp, smooth, glow, line } from '../src/ink.js';
import { breath, blink, sway, eyeDart } from '../src/life.js';
import { keys } from '../src/polish-chorus.js';
import { eyesAt, bump } from '../src/fix-round3b.js';

// o-03 站台长椅。
// 车尾缩进隧道时他把头转过去目送（先转眼再转头）；车走完，视线落到地上那张被风推着走的报纸，
// 再慢慢转回正前方。中间一次 0.4 秒的深呼吸。
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;

    // 极慢推近，但不打扰他
    const push = 1.03 + 0.06 * smooth(t / d);
    ctx.save();
    ctx.translate(660, 660);
    ctx.scale(push, push);
    ctx.translate(-660, -660);

    // 顶灯在 5.8 s 闪一下（列车出站带起的电压波动）
    const flick = (t > 5.80 && t < 5.93) || (t > 6.01 && t < 6.09) ? 1 : 0;
    subwayPlatform(ctx, { t, head: 0, flick });

    // 车开进隧道：5.2 秒走完，之后站台空下来
    departingTrain(ctx, clamp(t / 5.2, 0, 1));

    // 被风推着走的报纸
    blownNewspaper(ctx, t, { x0: 690, x1: 1110, y: 818 });

    // 车走时带过来的一点风
    const wind = 1 - smooth((t - 3.4) / 3.0);
    if (wind > 0.02) {
      ctx.save();
      ctx.globalAlpha = 0.15 * wind;
      for (let i = 0; i < 5; i++) {
        const yy = 330 + i * 92 + Math.sin(t * 2.6 + i) * 6;
        const x0 = 1820 - ((t * 240 + i * 160) % 1300);
        line(ctx, x0, yy, x0 - 90, yy - 4, { seed: 780 + i, lw: 2.2, color: '#C9D8DC', amp: 1 });
      }
      ctx.restore();
    }

    // ---- 他 ----
    const u = 24, cx = 330, by = 684;
    const b = breath(t, { seed: 351, period: 2.1, amp: 0.09 });
    const sw = sway(t, { seed: 351, period: 3.4, armAmp: 0.016, rotAmp: 0.004 });

    // 目送：眼睛先跳过去（0.50），头/身 0.10 秒后才跟（0.60）；
    // 车走完，视线从隧道落到地上那张报纸（5.40），最后慢慢收回正前（7.30 / 7.40）。
    // 眼型本身不换，靠 yaw/pitch/lid 说话：开场和收尾是半垂、瞳孔略上飘的对不上焦（dazed），
    // 目送列车时是 side 的侧目——全程不做悲伤表演。
    const yaw = eyeDart(t, [
      { t: 0.00, look: 0.12 },
      { t: 0.50, look: 0.95 },
      { t: 5.40, look: 0.78 },
      { t: 7.30, look: 0.10 },
    ], { dur: 0.12, overshoot: 0.10 });
    const pitch = eyeDart(t, [
      { t: 0.00, look: -0.55 },   // 瞳孔略上飘：平静里的那点空
      { t: 0.50, look: -0.10 },   // 对上车尾
      { t: 5.40, look: 1.30 },    // 落到地上的报纸
      { t: 7.30, look: 0.10 },
    ], { dur: 0.14, overshoot: 0.08 });
    const lid = keys(t, [[0.00, 0.34], [0.50, 0.20], [5.40, 0.30], [7.30, 0.34]]);

    const turn = smooth((t - 0.60) / 0.55);              // 头/身 0.10 秒后跟上
    const back = smooth((t - 7.40) / 1.30);              // 最后慢慢回到正前
    const rot = 0.02 + 0.30 * turn * (1 - back * 0.84) + sw.rot;
    // 中间一次深呼吸：0.4 秒吸进去，再慢慢放掉
    const inhale = bump(t - 6.55, 0.9) * 0.11;
    const eyeBlink = blink(t, { seed: 351, eyes: 'open', slot: 2.4, jitter: 0.7, phase: 1.1, enabled: t < 8.6 });

    clawd(ctx, {
      cx: cx + turn * 10 * (1 - back * 0.6), by, u,
      color: P.orange,
      eyes: 'none',
      look: 0,
      mouth: 'flat',
      seed: 351,
      bodyDy: b.bodyDy - inhale + turn * (1 - back) * 0.05,
      squash: b.squash,
      rot,
      armL: sw.armL - turn * (1 - back) * 0.05,
      armR: sw.armR + turn * 0.06,
      legs: [0, -0.16, 0, -0.16],
    });
    eyesAt(ctx, {
      cx: cx + turn * 10 * (1 - back * 0.6), by, u, rot, squash: b.squash, body: P.orange,
      style: eyeBlink ? 'shut' : 'open',
      yaw, pitch, lid,
      wide: 0.94,
    });

    // 站台顶灯落在他身上的一点暖
    glow(ctx, cx + 2 * u, by - 5 * u, 330, 'rgba(246,201,126,0.35)', 0.26);

    // 车走远以后，站台自己慢慢暗下来
    const dim = 0.13 * smooth((t - 6.8) / 4.0);
    if (dim > 0.002) {
      ctx.save();
      ctx.globalAlpha = dim;
      ctx.fillStyle = '#08101A';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }

    ctx.restore();
  },
};