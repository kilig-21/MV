import { roofCity, roofDeck, crossingBirds, HERO_X, ROOF_Y, HERO_U } from '../src/fix-round3d.js';
import { clawd, groundShadow } from '../src/character.js';
import { P } from '../src/palette.js';
import { lerp, clamp, glow, smooth } from '../src/ink.js';
import { breath, blink, sway } from '../src/life.js';
import { face, glance, withBlink } from '../src/expr-e4.js';

// v3-12 无论这世界有多疯狂
// 评审 B：v3-12 的旋转保留，但前景屋顶反向视差移动，和城市拉开两层。
// 机位/主角位置与 v3-11 接得上（x=35%、占画高 15%），两镜靠"平摇"与"倾斜+推近"分开。
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    const k = clamp(t / d, 0, 1);

    // 世界：倾角 0 → 0.12 rad（约 7°），越转越快；同时很轻地推近
    const ang = 0.12 * k * k;
    const sc = lerp(1.0, 1.10, smooth(k));

    ctx.save();
    ctx.translate(960, 860);
    ctx.rotate(ang);
    ctx.scale(sc, sc);
    ctx.translate(-960, -860);
    roofCity(ctx, { t: gt, seed: 143, moon: [1584, 92, 38], deck: false });
    crossingBirds(ctx, gt - 166.41);

    // 一片夜云压过月亮：世界倾斜时，别让月亮被画框切一半
    ctx.save();
    ctx.globalAlpha = 0.88;
    ctx.fillStyle = '#1B3444';
    for (const [ox, oy, rx, ry] of [[-150, 10, 190, 54], [-20, -6, 210, 46], [120, 14, 170, 52], [-300, 22, 150, 40], [250, 4, 130, 42]]) {
      ctx.beginPath();
      ctx.ellipse(1584 + ox, 96 + oy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // 云的下缘更亮一点，别像一块糊掉的暗斑
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#24425A';
    for (const [ox, oy, rx, ry] of [[-120, 28, 170, 20], [40, 22, 190, 18], [-280, 34, 130, 14]]) {
      ctx.beginPath();
      ctx.ellipse(1584 + ox, 96 + oy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.restore();

    // 前景屋顶反向视差：世界顺时针倾，屋顶向左滑
    const dxFg = -30 * smooth(clamp((t - 0.05) / 0.9, 0, 1));
    roofDeck(ctx, { dx: dxFg, t: gt });

    const cx = HERO_X + dxFg, by = ROOF_Y;
    const b = breath(t, { seed: 3131, period: 1.4, amp: 0.16, squashAmp: 0.012 });
    const sw = sway(t, { seed: 3131, period: 2.5, armAmp: 0.05 });
    // 世界在转，他慢慢看走眼：normal → dazed 用 0.22 秒沉下去；视线先飘开 3 帧。
    const e = face(t, [
      { t: 0.00, eyes: 'normal', mouth: 'flat', brow: null },
      { t: 0.96, eyes: 'dazed', mouth: 'flat', brow: null },
    ], 0.22);
    const eb = withBlink(e, blink(t, { seed: 3131, enabled: t < 0.6 }));
    const look = glance(t, [
      { t: 0.00, look: 0.00 },
      { t: 0.64, look: 0.35 },
    ], { dur: 0.10 });

    glow(ctx, cx, by - HERO_U * 5, HERO_U * 7, 'rgba(246,201,126,0.45)', 0.22);
    groundShadow(ctx, cx, by, HERO_U, { alpha: 0.30, w: 5.4, color: '#000000' });

    clawd(ctx, {
      cx: cx + sw.armL * 2, by, u: HERO_U,
      color: P.orange,
      ...eb,
      look,
      seed: 3131,
      armL: sw.armL, armR: sw.armR,
      // 世界在转，他只是站着；呼吸和很轻的重心侧倾给一点点活着的感觉
      rot: sw.rot,
      squash: b.squash,
      bodyDy: b.bodyDy,
    });

    // 世界倾斜时，给角色身后一点很轻的暖光，把轴心托出来
    ctx.save();
    ctx.globalAlpha = 0.06 * smooth(k);
    glow(ctx, cx, by - HERO_U * 6, HERO_U * 17, 'rgba(246,201,126,0.6)', 1);
    ctx.restore();
  },
};