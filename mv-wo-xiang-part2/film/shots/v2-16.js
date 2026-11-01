import { warmRoom } from '../src/scenes-verse2.js';
import { sonPoster } from '../src/scenes-fix.js';
import { clawd } from '../src/character.js';
import { headphones } from '../src/props.js';
import { P } from '../src/palette.js';
import { smooth, lerp, clamp, curve, glow } from '../src/ink.js';
import { breath, sway } from '../src/life.js';
import { pulse } from '../src/polish-v2.js';
import { eyesAt } from '../src/fix-round3b.js';
import { face, dart, styleSwap } from '../src/expr-e2.js';

// v2-16 递耳机：父亲把耳机递过去，同事接住、戴上。
// 两人都有明确的视线落点：父亲看同事 → 看耳机 → 再看同事；同事看父亲 → 看耳机 → 闭眼听。

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    const push = 1.0 + 0.045 * smooth(t / d);
    ctx.save();
    ctx.translate(940, 700);
    ctx.scale(push, push);
    ctx.translate(-940, -700);
    warmRoom(ctx, gt);
    sonPoster(ctx);
    glow(ctx, 1470, 340, 300, 'rgba(246,201,126,0.5)', 0.22 * smooth((t - 1.2) / 0.6));

    // 父亲抬手 → 停在半空 0.26 秒 → 递过去
    const hold = smooth((t - 0.32) / 0.2);
    const give = smooth((t - 0.78) / 0.3);
    const wear = smooth((t - 1.42) / 0.36);
    const after = smooth((t - 1.10) / 0.4);
    const nod = pulse(t - 1.68, 0.34);
    const bf = breath(t, { seed: 200, period: 1.9, amp: 0.13 });
    const sf = sway(t, { seed: 200, period: 3.0, armAmp: 0.03 });
    const cxF = 700, byF = 900, uF = 24;
    const rotF = -0.01 + hold * 0.06 + nod * 0.02 + sf.rot;
    const squashF = bf.squash;
    clawd(ctx, {
      cx: cxF, by: byF, u: uF,
      color: P.sage,
      eyes: 'none',
      mouth: 'smile',
      blush: true,
      seed: 200,
      bodyDy: bf.bodyDy - nod * 0.08,
      squash: squashF,
      armR: -1.9 * hold + 1.5 * after + sf.armR,
      armL: 0.1 + sf.armL,
      rot: rotF,
    });
    // 父亲的视线：先落在同事身上，递过去时「啪」地跟到耳机上，戴好以后再看同事
    const fg = clamp(dart(t, [{ t: 0.00, look: 0 }, { t: 0.52, look: 1 }, { t: 1.30, look: 0.15 }], { dur: 0.12 }), 0, 1);
    eyesAt(ctx, {
      cx: cxF, by: byF, u: uF, rot: rotF, squash: squashF, body: P.sage,
      style: 'open',
      yaw: 0.80,
      pitch: lerp(-0.10, 0.42, fg) * (1 - after) + 0.02,
      lid: 0.06,
      wide: 0.96,
    });

    // 同事：接的瞬间愣一帧（身体真的停一帧），然后压住笑，把耳机戴上。
    // 眼睛在愣神前 2 帧先睁大、之后 5 帧慢慢落回；笑是 0.20 s 压出来的，不是大笑。
    const fr = Math.floor(t * 24);
    const freeze = fr === 25;
    const listening = smooth((t - 1.12) / 0.25);
    const stun = smooth((t - 0.955) / 0.085) * (1 - smooth((t - 1.08) / 0.22));
    const ec = face(t, [
      { t: 0.00, mouth: 'flat' },
      { t: 1.30, mouth: 'smile' },
    ], { ramp: 0.20, blink: false });
    const bc = breath(t, { seed: 201, period: 2.2, amp: 0.12 });
    const sc = sway(t, { seed: 201, period: 2.8, armAmp: 0.025 });
    const cxC = 1180, byC = 900, uC = 22;
    const rotC = sc.rot;
    const squashC = bc.squash;
    clawd(ctx, {
      cx: cxC, by: byC, u: uC,
      color: '#9A9498',
      eyes: 'none',
      mouth: freeze ? 'none' : ec.mouth,
      seed: 201,
      bodyDy: bc.bodyDy + (freeze ? 0 : listening * 0.02),
      squash: squashC,
      armL: -0.85 * hold + 0.5 * give + sc.armL,
      armR: -0.70 * give + sc.armR,
      rot: rotC,
    });
    // 视线跟着耳机走（1.02 s 落定），戴好以后眼型从「睁着听」换成「笑眼」，
    // 换的那一帧用一次两帧的眨眼挡过去，不是硬切。
    const cg = clamp(dart(t, [{ t: 0.00, look: 0 }, { t: 1.02, look: 1 }], { dur: 0.10 }), 0, 1);
    eyesAt(ctx, {
      cx: cxC, by: byC, u: uC, rot: rotC, squash: squashC, body: '#9A9498',
      style: styleSwap(t, 1.34, 'open', 'smile'),
      yaw: lerp(-0.72, -0.30, cg),
      pitch: lerp(0.05, 0.55, cg) * (1 - listening),
      lid: 0,
      wide: 0.94 + 0.24 * stun,
    });

    // 耳机：从父亲手里到同事头上，线始终连着最近的那只手
    const hu = lerp(14, 22, wear);
    const hx = 860 + 40 * hold + 90 * give + (1180 - 990) * wear;
    const hy = 700 + (722 - 700) * wear;
    headphones(ctx, hx, hy - 0.9 * hu, hu, { color: P.tealDeep });
    const ex = lerp(865, 1035, give);
    const ey = lerp(690, 706, give);
    curve(ctx, [
      [hx - 0.95 * hu, hy + 0.12 * hu],
      [hx - 0.7 * hu, hy + 0.95 * hu],
      [(hx - 0.95 * hu + ex) / 2, hy + 1.05 * hu],
      [ex, ey],
    ], { stroke: P.tealDeep, lw: 3 });
    ctx.restore();
  },
};
