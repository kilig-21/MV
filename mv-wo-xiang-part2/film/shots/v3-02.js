import { streetEnd } from '../src/scenes-verse3.js';
import { clawd, groundShadow } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, lerp, clamp, glow } from '../src/ink.js';
import { breath, blink } from '../src/life.js';
import { face, glance, withBlink } from '../src/expr-e4.js';
import { prepOut } from '../src/polish-v3.js';
import { walkLegs, walkBob, settle } from '../src/scenes-verse3a.js';

// v3-02 这答案已经明了——分割线消失，角色朝街尽头那盏灯走了一步
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    streetEnd(ctx, gt);

    // 走一步：向灯（画面深处）移动，身体随之略小
    // 迈步前先往回收一点（反向预备），再走
    const p = prepOut(clamp((t - 0.10) / 0.92, 0, 1), 0.16, 0.06);
    const b = breath(t, { seed: 302, period: 1.2, amp: 0.12, squashAmp: 0.009 });
    const x = lerp(400, 566, p);
    const by = lerp(1008, 934, p);
    const u = lerp(27, 23, p);
    const walking = 1 - smooth((t - 0.94) / 0.16);
    const ph = t * 10.5;
    const bob = walkBob(ph, 2.4) * walking;
    const squash = settle(t, 1.0, 10, 0.075);
    // 答案明了：先从自问的眯眼里松开，走到灯下才笑出来。
    // 视线比表情早 2 帧落到灯上；眨眼只放在不在过渡的时候。
    const look = glance(t, [
      { t: 0.00, look: 0.35 },
      { t: 0.20, look: 0.80 },      // 街尽头那盏灯
    ], { dur: 0.09 });
    const e = face(t, [
      { t: 0.00, eyes: 'squint', mouth: 'flat', brow: null },
      { t: 0.34, eyes: 'normal', mouth: 'none', brow: null },
      { t: 1.12, eyes: 'normal', mouth: 'smile', brow: null },
    ], 0.18);
    const eb = withBlink(e, blink(t, { seed: 302, enabled: t > 1.28 }));

    groundShadow(ctx, x, by + 4, u, { alpha: 0.16, w: 6.2 });
    clawd(ctx, {
      cx: x, by: by - bob, u,
      color: P.orange,
      ...eb,
      look,
      seed: 302, rot: -0.02,
      squash: squash * b.squash,
      bodyDy: b.bodyDy,
      legs: walkLegs(ph, 0.26 * walking),
      armL: 0.12 * walking, armR: -0.12 * walking,
    });

    // 站定后，灯把它照亮一点：脚下多一圈暖光
    const k = smooth((t - 0.95) / 0.4);
    if (k > 0) {
      ctx.save();
      ctx.globalAlpha = 0.30 * k;
      ctx.fillStyle = P.lamp;
      ctx.beginPath();
      ctx.ellipse(x, by + 8, u * 5.4, u * 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
};