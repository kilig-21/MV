import { signWall } from '../src/scenes-intro.js';
import { clawd, groundShadow } from '../src/character.js';
import { P } from '../src/palette.js';
import { glow, smooth, lerp } from '../src/ink.js';
import { breath, sway } from '../src/life.js';
import { signDetail } from '../src/detail-r2.js';
import { headLift, sightDots } from '../src/fix-round3a.js';
import { faceE1, dart } from '../src/expr-e1.js';

// h1-01 招牌一块块亮起，最后一块是一个名字的形状；它亮时角色抬头看那块牌子
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;

    // 中景转特写：最后一块亮之前开始推近。
    // 推近的落点从原来的 (1124,400) 收回来一点——原来推到最后一帧人物被下画框切掉，
    // 抬头这个动作发生在画外。现在牌子和人一起留在画里。
    const zt = smooth((t - 1.5) / 1.15);
    const z = 1 + 0.22 * zt;
    const fx = lerp(960, 1030, zt), fy = lerp(540, 470, zt);

    ctx.save();
    ctx.translate(960, 540);
    ctx.scale(z, z);
    ctx.translate(-fx, -fy);

    const m = signWall(ctx, { t });
    // 面板换掉：三条横杠改成由笔画搭起来的「名字的形状」，
    // 亮起的一瞬带一点电流抖，亮定后稳定（不写字，只给笔画的骨架）
    signDetail(ctx, m.signs, t);

    // 角色站在人行道上，面向最后一块招牌。最后那块 2.14 s 开始通电：
    // 2.02 先动眼睛，2.14 再抬头——抬头前有 2 帧向下的预备。
    const hl = headLift(t, 2.14, { pre: 0.09, dur: 0.26, over: 0.20, riseAmp: 0.55, squashAmp: 0.035, rotAmp: 0.05 });
    const b = breath(t, { seed: 61, period: 1.75, amp: 0.11 });
    const sw = sway(t, { seed: 61, period: 2.6, armAmp: 0.03, rotAmp: 0.006 });
    // 抬头那一刻是全镜的情绪落点，之后不再眨眼。
    // 眼睛 2.10 先睁大（0.16 s 过渡），眉毛 2.18 才跟上——「先看见，再反应过来」。
    const f = faceE1(t, [
      { at: 0.00, eyes: 'look', mouth: 'none' },
      { at: 2.10, eyes: 'wide', mouth: 'none', ramp: 0.16 },
      { at: 2.20, brow: 'up', ramp: 0.18 },
    ], {
      seed: 61, ramp: 0.16, blinkFrom: 0.3,
      blink: { slot: 1.5, jitter: 0.4, phase: 0.6 },
      noBlinkIn: [[1.98, 3.0]],
    });
    const cx = 620 + sw.rot * 190;
    const by = 830 + hl.rise * 22;
    const u = 22;
    groundShadow(ctx, cx, 832, u, { alpha: 0.2, w: 6.4 });

    clawd(ctx, {
      cx, by, u,
      color: P.orange,
      eyes: f.eyes,
      // 眼睛先到：2.02 起视线「跳」到招牌（之前一直看街面）
      look: f.blinking ? 0 : dart(t, [
        { t: 0.00, look: 0.32 },
        { t: 2.02, look: 0.82 },
      ], { dur: 0.11 }),
      mouth: f.mouth,
      brow: f.brow,
      browDy: f.browDy,
      seed: 61,
      bodyDy: b.bodyDy + 0.06 * hl.k,
      squash: (1 + 0.03 * hl.k) * b.squash * hl.squash,
      rot: sw.rot + hl.rot,
      legs: [0, -0.1, 0, -0.1],
      armR: -0.22 * hl.k + sw.armR, armL: -0.10 * hl.k + sw.armL,
    });

    // 视线落点：从脸到「自己名字那块牌子」的一串小点。眼睛先到，身体再到。
    sightDots(ctx, [cx + 5.2 * u, by - 6.2 * u], [m.hero.x + m.hero.w / 2, m.hero.y + m.hero.h * 0.62], {
      k: smooth((t - 2.02) / 0.34),
      n: 7, r: 4.6, alpha: 0.42, color: '#F1D9A8',
    });

    // 招牌的光落到身上（抬头那一刻最亮）
    const spill = m.heroOn > 0.5 ? smooth((t - 2.26) / 0.45) : 0;
    if (spill > 0) {
      glow(ctx, cx + 40, by - 6 * u, 300, 'rgba(246,201,126,0.45)', 0.42 * spill);
      // 头顶被上面的牌子照亮一条边：抬头这件事不只靠眼睛说
      glow(ctx, cx, by - 8.6 * u, 3.4 * u, 'rgba(255,240,208,0.55)', 0.30 * spill);
    }

    ctx.restore();
  },
};