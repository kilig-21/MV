import { roofCity, roofDeck, crossingBirds, HERO_X, ROOF_Y, HERO_U } from '../src/fix-round3d.js';
import { clawd, groundShadow } from '../src/character.js';
import { P } from '../src/palette.js';
import { lerp, clamp, glow, smooth } from '../src/ink.js';
import { breath, blink, sway } from '../src/life.js';
import { face, glance, withBlink } from '../src/expr-e4.js';

// v3-11 无论你身处何方
// 评审 B：机位降到屋顶高度——天空只留 35%，城市压到中景，左下近景屋顶，
// 主角站近景屋脊、x=35%、占画高 15%；空天里四只鸟从左掠过。
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    const p = clamp(t / d, 0, 1);

    // 极慢横移：城市 14px，前景屋顶 2 倍视差
    const dx = lerp(-14, 14, p);
    const dxFg = dx * 2.0;

    ctx.save();
    ctx.translate(-dx, 0);
    roofCity(ctx, { t: gt, seed: 143, moon: [1584, 92, 38], deck: false });
    crossingBirds(ctx, gt - 166.41);
    ctx.restore();

    // 近景屋顶：角色脚下这一层，比城市走得更快
    roofDeck(ctx, { dx: dxFg, t: gt });

    // 楼群顶上的城市光雾：把中景和近景屋顶再分开一层
    ctx.save();
    ctx.globalAlpha = 0.10 * smooth(clamp(t / 0.4, 0, 1));
    ctx.fillStyle = 'rgba(246,201,126,1)';
    ctx.fillRect(0, 700, 1920, 110);
    ctx.restore();

    const cx = HERO_X + dxFg, by = ROOF_Y;
    const b = breath(t, { seed: 3130, period: 1.5, amp: 0.17, squashAmp: 0.012 });
    const sw = sway(t, { seed: 3130, period: 2.7, armAmp: 0.05 });

    // 城市的光从背后托住他
    glow(ctx, cx, by - HERO_U * 5, HERO_U * 9, 'rgba(246,201,126,0.42)', 0.34);
    groundShadow(ctx, cx, by, HERO_U, { alpha: 0.30, w: 5.4 });

    // 「无论身处何方」——视线从脚下抬到城市线上，正好跟上一群掠过的鸟。
    // dot 眼读不出方向，所以先让视线抬出去（0.34），最后 4 帧眼型才落回 normal：
    // 这一下同时接住 v3-12 开头的 normal，两镜之间不跳。
    const look = glance(t, [
      { t: 0.00, look: 0.20 },
      { t: 0.34, look: 0.52 },
    ], { dur: 0.10 });
    const e = face(t, [
      { t: 0.00, eyes: 'dot', mouth: 'none', brow: null },
      { t: 0.46, eyes: 'normal', mouth: 'none', brow: null },
    ], 0.20);
    const eb = withBlink(e, blink(t, { seed: 3130 }));

    clawd(ctx, {
      cx: cx + sw.armL * 2, by, u: HERO_U,
      color: P.orange,
      ...eb,
      look,
      seed: 3130,
      legs: [0, -0.12, 0, -0.12],
      armL: sw.armL, armR: sw.armR, rot: sw.rot,
      squash: b.squash, bodyDy: b.bodyDy,
    });
  },
};