import { streetStore } from '../src/scenes.js';
import { clawd, groundShadow } from '../src/character.js';
import { phone } from '../src/props.js';
import { P } from '../src/palette.js';
import { clamp, lerp, smooth, easeOut } from '../src/ink.js';
import { breathe, sway, blink, gesture, bounce, walkCycle, weightShift, TAU } from '../src/polish-v1.js';
import { faceE1, dart } from '../src/expr-e1.js';

// 远处指指点点的剪影：两只各自有步频、相位和“走神”
function gossip(ctx, t, o) {
  const { cx, color, u, seed } = o;
  const bob = breathe(t, seed, u, { amp: 0.2 });
  const shift = weightShift(t, seed, { amp: 1.6 });
  // A：指到一半停下来看；B：一直指，偶尔连点两下
  const stopped = o.stopAt != null ? smooth((t - o.stopAt) / 0.2) : 0;
  const beat = Math.sin(t * TAU * (o.hz ?? 1.1) + (o.ph ?? 0))
    + (o.double ? 0.35 * Math.sin(t * TAU * (o.hz ?? 1.1) * 2.4 + 0.4) : 0);
  const point = lerp(-0.55 - beat * 0.16, -0.12, stopped);
  const lookAt = lerp(o.look ?? 1, 0.95, stopped);
  const rot = stopped * 0.03 + Math.sin(t * TAU * 0.24 + seed) * 0.006;
  const legs = stopped
    ? [0, 0, -0.05 - 0.03 * Math.sin(t * 5 + seed), 0]
    : [Math.sin(t * 9 + seed) * 0.06, 0, 0, Math.sin(t * 9 + seed + 1) * 0.06];

  groundShadow(ctx, cx + shift, 736, u, { alpha: 0.13, w: 6.2 });
  clawd(ctx, {
    cx: cx + shift, by: 730 - bob - (stopped ? 2 : 0), u,
    color, eyes: blink(t, seed) ? 'closed' : 'dot', mouth: 'none',
    seed,
    armR: point,
    armL: sway(t, seed + 5, { amp: 0.04 }),
    legs, rot, look: lookAt,
  });
}

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const d = shot.t1 - shot.t0;
    const m = streetStore(ctx, gt, {});

    // 两个剪影不同步：A 在 0.42 秒停下、放下手看它；B 继续指，带连点
    gossip(ctx, t, { cx: 240, color: '#2A3A44', u: 12, seed: 301, stopAt: 0.42, hz: 0.92, ph: 0.6, look: 1 });
    gossip(ctx, t, { cx: 420, color: '#33454F', u: 12, seed: 302, hz: 1.28, ph: 2.3, look: 1, double: true });

    // 走到自己倒影前：先重心后坐 → 快走 → 冲过一小步 → 回弹安定
    const wStart = 0.10, wDur = 0.46, land = wStart + wDur;
    let cx;
    if (t < wStart) cx = 1760 + 9 * smooth(t / wStart);
    else if (t < land) cx = lerp(1760, 1250, easeOut((t - wStart) / wDur));
    else cx = lerp(1250, 1240, easeOut(clamp((t - land) / 0.18, 0, 1)));
    const moving = t < land;
    const step = walkCycle(t, { hz: 11, amp: 0.22, bob: 3 });
    const landDip = bounce(t, land, { dur: 0.2, amp: 1 });
    const idleBob = breathe(t, 30, 20, { amp: 0.2 });
    const shift = weightShift(t, 30, { amp: 2.4 });
    const by = 738 - (moving ? step.bob : idleBob * 0.6) + landDip * 3.2;

    // 落地后还有一次轻微回弹：后脚趾先点一下
    const toe = moving ? 0 : bounce(t, land + 0.05, { dur: 0.28, amp: 1 }) * 0.06;
    const legs = moving ? step.legs : [0, -toe, 0, -toe * 0.6];

    groundShadow(ctx, cx + shift * 0.4, 740, 20, { alpha: 0.20, w: 6.4 });

    // 表情：走路专注 → 撞见自己的倒影（眼睛先睁大，嘴晚一帧）→ 看到通知、侧目读
    const f = faceE1(t, [
      { at: 0.00, eyes: 'look', mouth: 'flat' },
      { at: 0.64, eyes: 'wide', mouth: 'o', ramp: 0.12 },
      { at: 0.82, eyes: 'side', mouth: 'none', ramp: 0.14 },
    ], { seed: 30, ramp: 0.14, blinkFrom: 0.2 });

    // 视线先到，身体后到；停下之后是「看一眼—再看一眼」，不是匀速摇过去
    const look = moving ? -1 : dart(t, [
      { t: 0.00, look: -1 },
      { t: 0.74, look: 0.28 },
      { t: 0.86, look: 0.18 },
    ]);
    const lean = moving ? -0.02 : -0.014 * smooth((t - 0.7) / 0.22);

    clawd(ctx, {
      cx: cx + shift * 0.35, by: by, u: 20,
      color: P.orange,
      eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
      look,
      seed: 30,
      legs,
      rot: lean,
      squash: moving ? 1 : 0.988,
      armL: moving ? -step.legs[0] * 0.45 : sway(t, 31, { amp: 0.05 }),
      armR: moving ? -step.legs[1] * 0.45 : sway(t, 32, { amp: 0.05 }) - 0.3 * gesture(t, 0.80, 0.14, { pre: 0.1, over: 0.06 }),
    });

    // 玻璃上亮起手机通知的光：倒影先看它
    const notif = smooth((t - (d - 0.34)) / 0.3);
    if (notif > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(m.glass.x, m.glass.y, m.glass.w, m.glass.h);
      ctx.clip();
      ctx.globalAlpha = 0.75 * notif;
      phone(ctx, cx + 10, m.glass.y + m.glass.h - 190, 14, { glow: true, rot: -0.08 });
      ctx.restore();
      // 通知的呼吸光：两次很轻的脉冲，不是常亮
      const pulse = 0.10 + 0.035 * Math.sin((t - (d - 0.34)) * 18);
      ctx.save();
      ctx.globalAlpha = pulse * notif;
      ctx.fillStyle = P.lamp;
      ctx.fillRect(m.glass.x, m.glass.y, m.glass.w, m.glass.h);
      ctx.restore();
    }
  },
};