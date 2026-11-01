import { ringStage } from '../src/scenes-verse3b.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { glow, poly, star, smooth, clamp, lerp, easeIn } from '../src/ink.js';
import { breath, blink } from '../src/life.js';
import { face, glance, prep, withBlink } from '../src/expr-e4.js';
import { prepOut } from '../src/polish-v3.js';

// 一枚戒指：flat=true 时躺在地上
function drawRing(ctx, x, y, s, flat) {
  const rx = s * (flat ? 1.05 : 0.82), ry = s * (flat ? 0.42 : 0.82);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.lineWidth = s * 0.34;
  ctx.strokeStyle = '#F1D9A8';
  ctx.stroke();
  ctx.lineWidth = s * 0.11;
  ctx.strokeStyle = P.ink;
  ctx.stroke();
  // 宝石
  ctx.beginPath();
  ctx.arc(x, y - ry * (flat ? 0.55 : 1.0), s * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = '#E8A0A8'; ctx.fill();
  ctx.lineWidth = s * 0.07; ctx.strokeStyle = P.ink; ctx.stroke();
  ctx.restore();
}

// v3-17 但不要尝试与恶魔去交换那副对戒
// 两只螃蟹的呼吸幅度不同（左边沉、右边浅而快）。
// 戒指落下后，右边那只要先往前探一下、再往后跳——后退有预备。
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    ringStage(ctx, gt);

    const uL = 30, uR = 30;
    const lx = 700, rx0 = 1210;
    const by = 886;

    // ---- 两只的呼吸不是一个幅度 ----
    const bL = breath(t, { seed: 3170, period: 1.95, amp: 0.19, squashAmp: 0.014 });
    const bR = breath(t, { seed: 3172, period: 1.25, amp: 0.085, squashAmp: 0.006 });

    // ---- 右螃蟹：先探身，再跳开 ----
    // prepOut 前段是反向预备：0.88–1.02 先往戒指那边探，然后才是后退
    const retreat = prepOut(clamp((t - 0.96) / 0.40, 0, 1), 0.18, 0.10);
    const rx = rx0 + 152 * Math.max(0, retreat);
    const leap = clamp((t - 1.02) / 0.34, 0, 1);
    const hop = Math.sin(leap * Math.PI) * 13 * (1 - retreat * 0.55);
    const peek = smooth(clamp((t - 0.86) / 0.12, 0, 1)) * (1 - smooth(clamp((t - 1.00) / 0.08, 0, 1)));

    // 影子：落戒之前合成一个，落戒之后散开
    const split = smooth(clamp((t - 1.0) / 0.22, 0, 1));
    ctx.save();
    ctx.globalAlpha = 0.34 * (1 - 0.55 * split);
    ctx.fillStyle = P.ink;
    ctx.beginPath();
    ctx.ellipse(955, 894, lerp(480, 310, split), 42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (split > 0) {
      ctx.save();
      ctx.globalAlpha = 0.30 * split;
      ctx.fillStyle = P.ink;
      ctx.beginPath(); ctx.ellipse(lx, 894, 196, 36, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(rx, 894, 196 - hop * 2, 36 - hop, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // ---- 左边那只：先看，戒指落下后轻轻后仰 ----
    const lReact = smooth(clamp((t - 1.12) / 0.22, 0, 1));
    const lBlink = blink(t, { seed: 3170, eyes: 'look' });
    // 落点上：它一直看着中间的戒指；戒指落地后视线轻轻收一点（0.6 → 0.38）
    const lLook = glance(t, [
      { t: 0.00, look: 0.60 },
      { t: 1.06, look: 0.38 },
    ], { dur: 0.12 });
    clawd(ctx, {
      cx: lx + 6 * lReact, by,
      u: uL,
      color: P.lav,
      eyes: lBlink || 'look', look: lLook, brow: 'worried',
      mouth: 'flat', seed: 3170,
      armL: -0.10 * lReact, armR: 0.08 * lReact,
      rot: 0.012 * lReact,
      squash: bL.squash,
      bodyDy: bL.bodyDy,
      legs: [0, -0.04, 0, -0.04],
    });
    const topL = by - 9 * uL;
    for (const dx of [-1.55, 1.55]) {
      poly(ctx, [
        [lx + dx * uL - 16, topL + 12],
        [lx + dx * uL + 2, topL - 46],
        [lx + dx * uL + 18, topL + 12],
      ], { fill: P.ink, seed: 3171 + dx * 10 });
    }

    // ---- 右边：主角，伸手又收回 ----
    const rBlink = blink(t, {
      seed: 3172,
      enabled: !(t > 0.82 && t < 1.42),
    });
    // 视线：看戒指（在左边，-0.55）→ 探身时更近（-0.75）→ 戒指落地、后退时移开（0.10）。
    // 眉在 0.90 先抬（预备），1.02 惊（shock + up），1.38 才是委屈（teary + worried）。
    const rLook = glance(t, [
      { t: 0.00, look: -0.55 },
      { t: 0.88, look: -0.75 },
      { t: 1.20, look: -0.80 },
      { t: 1.52, look: 0.10 },
    ], { dur: 0.10 });
    const e = face(t, [
      { t: 0.00, eyes: 'wide', mouth: 'o', brow: null },
      { t: 1.02, eyes: 'shock', mouth: 'o', brow: 'up' },
      { t: 1.38, eyes: 'teary', mouth: 'wavy', brow: 'worried' },
    ], 0.18);
    const eb = withBlink(e, rBlink);
    clawd(ctx, {
      cx: rx, by: by - hop,
      u: uR,
      color: P.orange,
      ...eb,
      look: rLook,
      browDy: prep(t, 0.90, { amp: 0.40 }),
      seed: 3172,
      rot: -0.055 * Math.max(0, retreat) + 0.03 * peek,
      legs: [0, -0.14 * Math.abs(hop) / 13, 0, -0.14 * Math.abs(hop) / 13],
      squash: bR.squash - Math.abs(hop) * 0.002,
      bodyDy: bR.bodyDy,
      armL: -0.16 * peek - 0.10 * lReact,
      armR: -0.18 * peek,
    });

    // 戒指：先浮在两人中间，然后落下去
    const dropP = clamp((t - 0.58) / 0.42, 0, 1);
    const landY = 848;
    const floatY = 646 + Math.sin(t * 3.4) * 9;
    let ry = lerp(floatY, landY, easeIn(dropP));
    if (dropP >= 1) {
      const b = (t - 1.0) / 0.14;
      ry = landY - Math.max(0, Math.sin(clamp(b, 0, 1) * Math.PI)) * 26;
    }
    const flat = dropP > 0.98;
    glow(ctx, 960, ry, 210, 'rgba(246,201,126,0.6)', 0.5 + 0.15 * Math.sin(t * 4));
    drawRing(ctx, 960, ry, flat ? 106 : 96, flat);

    // 落下时的一点光屑
    if (t > 1.0 && t < 1.35) {
      const k = (t - 1.0) / 0.35;
      ctx.save();
      ctx.globalAlpha = (1 - k) * 0.8;
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI * (0.15 + i * 0.14);
        star(ctx, 960 + Math.cos(a) * (80 + k * 90), 850 + Math.sin(a) * (30 + k * 40), 9, 3, 4, '#F7EFDD', a);
      }
      ctx.restore();
    }
    void d;
  },
};