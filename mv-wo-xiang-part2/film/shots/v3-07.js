import { tinyRoom } from '../src/scenes-verse3.js';
import { clawd, groundShadow } from '../src/character.js';
import { P } from '../src/palette.js';
import { lerp, smooth, clamp, glow, poly } from '../src/ink.js';
import { walkLegs, walkBob, settle } from '../src/scenes-verse3a.js';
import { breath, blink } from '../src/life.js';
import { face, glance, prep, withBlink } from '../src/expr-e4.js';
import { prepOut } from '../src/polish-v3.js';

// v3-07 缺乏物质会不太舒服但他懂得知足——小屋里坐下，把灯调亮一点，表情放松
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    tinyRoom(ctx, gt);

    // 走进来 → 坐下
    const walkP = smooth(Math.min(t, 1.12) / 1.12);
    const x = lerp(430, 790, walkP);
    const by = 890;
    const walking = 1 - smooth((t - 1.05) / 0.18);
    const ph = t * 10.5;
    const bob = walkBob(ph, 2.3) * walking;
    const sit = smooth((t - 1.16) / 0.3);
    const squash = (1 - 0.12 * sit) * settle(t, 1.46, 10, 0.045);

    const wl = walkLegs(ph, 0.26 * walking);
    const tuck = [0, -0.34, 0, -0.34];
    const legs = wl.map((v, i) => lerp(v, tuck[i], sit));

    // 伸手把灯调亮：先抬到位、停一下、再收回（不是一条直线过去又回来）
    const raiseK = clamp((t - 1.82) / 0.40, 0, 1);
    const dropK = smooth(clamp((t - 2.42) / 0.30, 0, 1));
    const reach = prepOut(raiseK, 0.18, 0.10) * (1 - dropK);
    // 灯管接触不良，亮的时候闪两下才稳住
    const flick = 1 - 0.55 * Math.exp(-Math.max(0, t - 1.98) * 9) * Math.abs(Math.sin((t - 1.98) * 34));
    const bright = smooth(clamp((t - 1.96) / 0.42, 0, 1)) * (t > 1.96 ? flick : 1);
    const b = breath(t, { seed: 306, period: 1.5, amp: 0.14, squashAmp: 0.009 });
    const lookAtLamp = smooth(clamp((t - 1.70) / 0.18, 0, 1));

    // 知足：坐下后收着的笑（happy），灯亮起来那一下睁圆（sparkle + o），再慢慢收回笑眼。
    // 视线落在右边的灯罩上，比表情早 3 帧抬头；1.80 的抬眉是灯亮前的预备。
    const look = glance(t, [
      { t: 0.00, look: 0.50 },
      { t: 1.46, look: 0.58 },      // 灯的方向
      { t: 1.88, look: 0.74 },
    ], { dur: 0.10 });
    const e = face(t, [
      { t: 0.00, eyes: 'normal', mouth: 'none', brow: null },
      { t: 1.32, eyes: 'happy', mouth: 'smile', brow: null },
      { t: 2.06, eyes: 'sparkle', mouth: 'o', brow: 'up' },
      { t: 2.78, eyes: 'happy', mouth: 'smile', brow: null },
    ], 0.20);
    const eb = withBlink(e, blink(t, { seed: 306, enabled: t < 1.18 }));

    groundShadow(ctx, x, by + 4, 25, { alpha: 0.17, w: 6 });
    clawd(ctx, {
      cx: x, by: by - bob, u: 25,
      color: P.orange,
      ...eb,
      look,
      browDy: prep(t, 1.84, { amp: 0.34 }),
      blush: sit > 0.6,
      seed: 306, rot: 0.015 + 0.02 * lookAtLamp * (1 - sit),
      squash: squash * b.squash, legs,
      bodyDy: b.bodyDy,
      armR: -1.3 * reach,
      armL: 0.08 * (1 - sit),
    });

    // 灯：灯罩变亮 + 光晕扩大
    if (bright > 0) {
      ctx.save();
      ctx.globalAlpha = 0.8 * bright;
      poly(ctx, [[840, 480], [960, 480], [940, 420], [860, 420]],
        { fill: '#F8D89A', stroke: P.ink, lw: 4, seed: 2151 });
      ctx.restore();
      glow(ctx, 900, 490, 620, 'rgba(246,201,126,0.75)', 0.30 + 0.35 * bright);
      // 地上多一圈暖光
      ctx.save();
      ctx.globalAlpha = 0.20 * bright;
      ctx.fillStyle = P.lamp;
      ctx.beginPath();
      ctx.ellipse(900, 906, 300, 62, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // 屋里整体暖一点
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.05 * bright;
      ctx.fillStyle = '#F6C97E';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }
  },
};