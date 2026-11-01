import { airport } from '../src/scenes2.js';
import { clawd, groundShadow } from '../src/character.js';
import { suitcase } from '../src/props.js';
import { P } from '../src/palette.js';
import { smooth, clamp, lerp, easeOut, block, line } from '../src/ink.js';
import { breathe, sway, blink, bounce, walkCycle, weightShift } from '../src/polish-v1.js';
import { faceE1, dart } from '../src/expr-e1.js';

// 走动轨迹：带起步预备、末端过冲、停稳
function pathX(t, o) {
  const start = o.start, dur = o.dur, from = o.from, to = o.to, over = o.over ?? 12;
  if (t <= start - 0.1) return from;
  if (t < start) return from + over * 0.5 * smooth((t - (start - 0.1)) / 0.1);   // 起步前重心后坐
  if (t < start + dur) return lerp(from, to - over, easeOut((t - start) / dur));
  return lerp(to - over, to, easeOut(clamp((t - start - dur) / 0.2, 0, 1)));
}

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const d = shot.t1 - shot.t0;

    // 很轻的镜头推进（整幅缩放），不是只移角色
    const z = 1 + 0.018 * smooth(t / d);
    ctx.save();
    ctx.translate(960, 540); ctx.scale(z, z);
    ctx.translate(-960 - 10 * smooth(t / d), -540);

    airport(ctx, gt);

    // ---- 背景旅客：各自步频、方向、停留 ----
    // A：从左边慢跑过去，一直没看主角
    {
      const x = 240 + t * 138 + Math.sin(t * 2.1) * 6;
      const step = walkCycle(t, { hz: 10.5, amp: 0.18, bob: 2.2 });
      clawd(ctx, {
        cx: x, by: 772 - step.bob, u: 12, color: P.sage, seed: 401,
        eyes: blink(t, 401) ? 'closed' : 'normal', mouth: 'none', look: 1,
        legs: step.legs,
        armL: -0.1 + Math.sin(t * 9) * 0.1, armR: -0.1 - Math.sin(t * 9) * 0.1,
      });
    }
    // B：从右边走来，1.1 秒时停下来看手机，1.5 秒再走
    {
      const s = t < 1.1 ? t : (t < 1.55 ? 1.1 : t - 0.45);
      const x = 1760 - 96 * s;
      const stopped = t >= 1.1 && t < 1.55;
      const step = walkCycle(t, { hz: 9.4, amp: stopped ? 0.02 : 0.17, bob: stopped ? 0 : 2 });
      const bf = faceE1(t, [
        { at: 0.00, eyes: 'normal', mouth: 'none' },
        { at: 1.10, eyes: 'look', mouth: 'flat', ramp: 0.12 },
        { at: 1.55, eyes: 'normal', mouth: 'none', ramp: 0.12 },
      ], { seed: 402, ramp: 0.12, blinkFrom: 0.3 });
      clawd(ctx, {
        cx: x, by: 744 - step.bob, u: 11, color: P.lav, seed: 402,
        eyes: bf.eyes, mouth: bf.mouth,
        look: stopped ? 0 : -1,
        legs: step.legs,
        armL: stopped ? -0.5 : -0.1 + Math.sin(t * 8 + 1) * 0.1,
        rot: stopped ? 0.02 : 0,
      });
      if (stopped) {
        const k = smooth((t - 1.12) / 0.14);
        const px = x - 44, py = 744 - 38;
        block(ctx, px - 22 * k, py - 34 * k, 44 * k, 68 * k, 8, '#2C2F36', { stroke: P.ink, lw: 3, seed: 403 });
        block(ctx, px - 16 * k, py - 27 * k, 32 * k, 54 * k, 5, '#DCE9EC', { seed: 404 });
      }
    }
    // C：坐在候机椅上翻报纸，翻页和主角无关
    {
      const bob = breathe(t, 405, 14, { amp: 0.16 });
      clawd(ctx, {
        cx: 1652, by: 714 - bob, u: 14, color: P.mustard, seed: 405,
        eyes: blink(t, 405) ? 'closed' : 'tired', mouth: 'none', brow: 'worried', look: 0.2,
        legs: [0, -0.12, 0, -0.12],
        armL: -0.35, armR: -0.35,
      });
      const turn = smooth((t - 1.25) / 0.16) * (1 - smooth((t - 1.5) / 0.2));
      ctx.save();
      ctx.translate(1652, 714 - 92);
      ctx.scale(1 - turn * 0.35, 1);
      block(ctx, -52, -46, 104, 74, 3, '#E8DCC4', { stroke: P.ink, lw: 3, seed: 406 });
      for (let i = 0; i < 3; i++) line(ctx, -42, -32 + i * 16, 42, -32 + i * 16, { seed: 407 + i, lw: 1.5, color: '#A79E8A' });
      ctx.restore();
    }

    // ---- 主角 ----
    const walk = { start: 0.12, dur: 0.86, from: 800, to: 1170, over: 14 };
    const cx = pathX(t, walk);
    const landAt = walk.start + walk.dur;
    const moving = t < landAt;
    const step = walkCycle(t, { hz: 9.2, amp: 0.2, bob: 3 });
    const landDip = bounce(t, landAt, { dur: 0.24, amp: 1 });
    const idle = breathe(t, 82, 22, { amp: 0.18 });
    const by = 792 - (moving ? step.bob : idle) + landDip * 3.4;
    const shift = weightShift(t, 82, { amp: 2.6 });

    groundShadow(ctx, cx + shift * 0.4, 794, 22, { alpha: 0.2 });

    // 行李箱跟在半步之后：起停都晚一点、晃一下
    const lagX = pathX(t - 0.07, walk);
    const lagMoving = t - 0.07 < landAt;
    const wheelKick = lagMoving ? Math.sin(t * 34) * 1.2 : bounce(t, landAt + 0.08, { dur: 0.3, amp: 1 }) * 2;
    suitcase(ctx, lagX + 300 + (lagMoving ? 0 : 4), 790 - (lagMoving ? step.bob * 0.5 : 0) + wheelKick, 15, {});

    const f = faceE1(t, [
      { at: 0.00, eyes: 'normal', mouth: 'flat' },
      { at: 1.02, eyes: 'wide', mouth: 'o', ramp: 0.12 },       // 看见窗外的飞机
      { at: 1.38, eyes: 'normal', mouth: 'none', ramp: 0.16 },
      { at: 1.98, eyes: 'tired', mouth: 'flat', brow: 'worried', ramp: 0.20 },
    ], { seed: 82, ramp: 0.16, blinkFrom: 0.5 });

    // 视线：走路看前方 → 落地那一下甩到窗外 → 掠过飞机 → 低头看手里的登机牌
    const look = f.blinking ? 0 : dart(t, [
      { t: 0.00, look: -0.55 },
      { t: 0.98, look: -0.85 },
      { t: 1.02, look: 0.45 },
      { t: 1.45, look: -0.20 },
      { t: 2.08, look: 0.62 },
    ], { dur: 0.09 });

    const armSwing = moving ? Math.sin(t * 9.2) * 0.12 : sway(t, 83, { amp: 0.05 });
    const holdCard = smooth((t - 1.9) / 0.35);
    // 行李牌翻面：为下一镜的合同做接续
    const flip = smooth((t - 2.3) / 0.18);
    const handY = by + (10 + (-0.3 * holdCard) - 15) * 22;
    const handX = cx + 7.5 * 22;

    clawd(ctx, {
      cx: cx + shift * 0.4, by, u: 22,
      color: P.orange,
      eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
      look,
      seed: 82,
      legs: moving ? step.legs : [0, -0.05, 0, -0.02],
      rot: moving ? -0.012 : -0.008 * smooth((t - 1.0) / 0.4),
      armL: moving ? -armSwing : sway(t, 84, { amp: 0.06 }),
      armR: moving ? armSwing : -0.3 * holdCard - 0.05,
      squash: moving ? 1 : 0.99,
    });

    if (holdCard > 0) {
      ctx.save();
      ctx.translate(handX, handY);
      ctx.rotate(-0.12);
      ctx.scale(1 - flip * 1.9, 1);
      ctx.globalAlpha = Math.min(1, holdCard * 1.4);
      const w = 90, h = 58;
      block(ctx, -w / 2, -h / 2, w, h, 4, flip > 0.5 ? '#E8DCC4' : '#F2E3C6', { stroke: P.ink, lw: 4, seed: 408 });
      if (flip <= 0.5) {
        ctx.fillStyle = '#2B2A2E'; ctx.font = '700 20px NotoSansSC'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('LAX', 0, -6);
        line(ctx, -30, 12, 30, 12, { seed: 409, lw: 2, color: '#A79E8A' });
      } else {
        // 翻到背面：一小段合同条款，衔接下一镜
        for (let i = 0; i < 3; i++) line(ctx, -34, -12 + i * 14, 34, -12 + i * 14, { seed: 410 + i, lw: 2, color: '#A79E8A' });
      }
      ctx.restore();
    }

    ctx.restore();
  },
};