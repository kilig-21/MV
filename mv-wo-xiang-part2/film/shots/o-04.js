import { lowPlatform, slidingNewspaper } from '../src/scenes-outro-o4.js';
import { clawd, groundShadow } from '../src/character.js';
import { P } from '../src/palette.js';
import { lerp, smooth } from '../src/ink.js';
import { breath, blink, sway } from '../src/life.js';
import { eyesAt, bump } from '../src/fix-round3b.js';

// o-04 童年视角·站台边缘（236.00–247.00）
// 低机位（约角色身高一半）侧向看：他完整地站在站台线旁，轨道斜穿画面右下去隧道。
// 车尾灯在隧道里退掉；一张报纸被风推着从左下滑过；5.15 s 墙上那扇窗亮起来，
// 他抬眼、睁大眼、放下肩膀看它——把视线交给下一镜的亮窗。
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;

    // 极慢推近 + 轻微上摇，最后停稳
    const e = smooth(t / d);
    const s = 1.012 + 0.050 * e;
    ctx.save();
    ctx.translate(1160, 700);
    ctx.scale(s, s);
    ctx.translate(-1160, -700);
    ctx.translate(-6 * e, 8 * e);

    // ---- 场景 ----
    const { windowOn } = lowPlatform(ctx, { t });

    // ---- 他 ----
    const cx = 620, by = 890, u = 34;
    const b = breath(t, { seed: 441, period: 2.3, amp: 0.10 });
    const sw = sway(t, { seed: 441, period: 3.6, armAmp: 0.020, rotAmp: 0.004 });

    // 5.8 s 被窗光叫住：肩膀放下来一点，身体轻轻后仰，眼睛先到、头身再到
    const notice = smooth((t - 5.78) / 0.95);
    const settle = bump(t - 6.35, 0.75) * 0.5;
    const reach = bump(t - 8.95, 1.70) * 0.18;   // 最后向窗的方向抬一下右手，很轻
    const rot = 0.012 + sw.rot - 0.020 * notice;
    const bodyDy = b.bodyDy - 0.065 * notice + 0.02 * settle;
    const squash = b.squash * (1 - 0.010 * notice);

    // 嘴：平静 → 小小地“啊” → 笑
    const mouth = t < 5.60 ? 'flat'
      : t < 6.95 ? { a: 'flat', b: 'o', p: smooth((t - 5.60) / 0.30) }
      : t < 8.20 ? { a: 'o', b: 'smile', p: smooth((t - 6.95) / 0.65) }
      : 'smile';
    const brow = t < 5.62 ? null : { a: null, b: 'up', p: smooth((t - 5.62) / 0.34) };

    groundShadow(ctx, cx, by + 2, u, { alpha: 0.16, w: 5.4 });

    clawd(ctx, {
      cx, by, u,
      color: P.orange,
      seed: 441,
      eyes: 'none',
      mouth,
      brow,
      rot,
      bodyDy,
      squash,
      armL: sw.armL - 0.055 * notice,
      armR: sw.armR - 0.040 * notice - reach,
      legs: [0, 0, 0, 0],
    });

    // 视线：先顺着轨道看出去 → 被报纸带下去 → 回到轨道 → 窗亮后抬眼
    const yaw = t < 1.85 ? 0.50
      : t < 4.35 ? lerp(0.50, -0.30, smooth((t - 1.85) / 0.30)) + 0.38 * smooth((t - 2.45) / 1.55)
      : t < 5.45 ? lerp(0.08, 0.50, smooth((t - 4.35) / 0.55))
      : lerp(0.50, 0.30, smooth((t - 5.45) / 0.80));
    const pitch = t < 1.85 ? 0.10
      : t < 4.35 ? lerp(0.10, 0.55, smooth((t - 1.85) / 0.28)) - 0.10 * smooth((t - 2.45) / 1.55)
      : t < 5.45 ? lerp(0.35, 0.06, smooth((t - 4.35) / 0.55))
      : lerp(0.06, -0.95, smooth((t - 5.45) / 0.95));
    const lid = t < 1.85 ? 0.30
      : t < 4.35 ? 0.48
      : t < 5.45 ? lerp(0.48, 0.26, smooth((t - 4.35) / 0.55))
      : lerp(0.26, 0.06, smooth((t - 5.55) / 0.65));
    const wide = t < 5.45 ? 1.0
      : lerp(1.0, 1.30, smooth((t - 5.55) / 0.30)) - 0.12 * smooth((t - 6.35) / 1.4);
    const tick = t > 5.52 && t < 5.96;
    const eyeBlink = blink(t, { seed: 441, eyes: 'open', slot: 3.4, jitter: 0.9, phase: 0.7, enabled: t < 5.15 || t > 8.6 });

    eyesAt(ctx, {
      cx, by, u, rot, squash, body: P.orange,
      style: eyeBlink ? 'shut' : 'open',
      yaw, pitch, lid, wide, tick,
    });

    // 窗光落在他的右侧壳沿（只做光，不改身体）
    if (windowOn > 0.01) {
      ctx.save();
      ctx.translate(cx, by);
      if (rot) ctx.rotate(rot);
      ctx.scale(1 / squash, squash);
      ctx.globalAlpha = 0.20 * windowOn;
      ctx.strokeStyle = 'rgba(246,201,126,0.95)';
      ctx.lineCap = 'round';
      ctx.lineWidth = 0.13 * u;
      ctx.beginPath();
      ctx.moveTo(-4.5 * u, -8.85 * u);
      ctx.quadraticCurveTo(0, -9.35 * u, 5.1 * u, -8.75 * u);
      ctx.lineTo(5.5 * u, -8.2 * u);
      ctx.lineTo(5.5 * u, -3.7 * u);
      ctx.stroke();
      ctx.restore();
    }

    // ---- 前景报纸 ----
    slidingNewspaper(ctx, t);

    ctx.restore();
  },
};