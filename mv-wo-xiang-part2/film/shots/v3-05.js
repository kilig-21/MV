import { clawd, groundShadow } from '../src/character.js';
import { breath, blink, sway } from '../src/life.js';
import { face, glance, prep, withBlink } from '../src/expr-e4.js';
import { P } from '../src/palette.js';
import { clamp, lerp, smooth, glow } from '../src/ink.js';
import { walkLegs, walkBob, settle, subwayRoute, tunnelWarm } from '../src/scenes-verse3a.js';

// v3-05 他曾在地下留有光辉领你寻宝——墙上旧地铁图随角色走过一段段亮起
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    const m = tunnelWarm(ctx, gt);
    const map = m.map;

    // 角色自左向右走过，脚不歇
    const p = smooth(clamp((t - 0.15) / 1.65, 0, 1));
    const x = lerp(500, 1080, p);
    const by = 896;
    const walking = 1 - smooth((t - 1.78) / 0.18);
    const ph = t * 10;
    const bob = walkBob(ph, 2.6) * walking;
    const squash = settle(t, 1.8, 9, 0.06);

    // 地图线路跟着它亮：到地图右端时正好走完
    const rp = clamp((x - 620) / 420, 0, 1);
    subwayRoute(ctx, map, rp, t);

    // 走到哪亮到哪
    const k = 0.3 + 0.55 * rp;
    glow(ctx, map.x + map.w * 0.5, map.y + map.h * 0.55, 460, 'rgba(246,201,126,0.8)', 0.26 * k);

    // 角色
    groundShadow(ctx, x, by + 4, 23, { alpha: 0.2, w: 6 });
    // 视线顺着地图从近端扫到远端（落点：亮起来的线路），末尾才抬眼看尽头的收藏光
    const look = glance(t, [
      { t: 0.00, look: 0.40 },
      { t: 1.62, look: -0.75 },
      { t: 2.02, look: -0.55 },
    ], { dur: 0.10 });
    const b = breath(t, { seed: 304, period: 1.45, amp: 0.14, squashAmp: 0.010 });
    const sw = sway(t, { seed: 304, period: 2.7, armAmp: 0.045 });
    // 自问的尾巴：眯着眼看地图 → 找到路后松开 → 尽头那点亮起来时睁圆（wide + o）
    const e = face(t, [
      { t: 0.00, eyes: 'squint', mouth: 'none', brow: null },
      { t: 1.58, eyes: 'normal', mouth: 'none', brow: null },
      { t: 2.02, eyes: 'wide', mouth: 'o', brow: 'up' },
    ], 0.18);
    const eb = withBlink(e, blink(t, { seed: 304, enabled: t < 1.66 }));
    clawd(ctx, {
      cx: x, by: by - bob, u: 23,
      color: P.orange,
      look,
      ...eb,
      browDy: prep(t, 1.86, { amp: 0.32 }),
      seed: 304, rot: -0.015 + sw.rot,
      squash: squash * b.squash,
      bodyDy: b.bodyDy,
      legs: walkLegs(ph, 0.26 * walking),
      armL: 0.1 * walking + sw.armL, armR: -0.1 * walking + sw.armR,
    });

    // 地图的光落在它身上
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, x, by - 24 * 5, 300, 'rgba(241,217,168,0.55)', 0.16 * k);
    ctx.restore();
  },
};