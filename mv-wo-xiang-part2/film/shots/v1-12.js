import { carriage } from '../src/scenes.js';
import { clawd, groundShadow } from '../src/character.js';
import { headphones, phone as phoneProp, note } from '../src/props.js';
import { P } from '../src/palette.js';
import { smooth, clamp, block } from '../src/ink.js';
import { breathe, sway, weightShift } from '../src/polish-v1.js';
import { faceE1, dart } from '../src/expr-e1.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const d = shot.t1 - shot.t0;
    const m = carriage(ctx, gt, { scroll: gt * 34 });

    const u = 18;
    const cx = 372;
    const swayCar = Math.sin(t * 1.25 + 0.4);
    const bob = breathe(t, 11, u, { amp: 0.16 }) + swayCar * 1.2;
    const by = m.seatY + 46 - bob;
    const shift = weightShift(t, 11, { amp: 2 });
    const slump = smooth((t - 0.15) / 0.6) * (1 - smooth((t - 0.95) / 0.3));
    const lift = smooth((t - 1.0) / 0.3) * (1 - smooth((t - 1.85) / 0.3));
    const drop = smooth((t - 2.0) / 0.35);

    // 情绪三拍：低头（累）→ 抬眼（走神看窗外）→ 又垂下（认了，闭眼）
    const f = faceE1(t, [
      { at: 0.00, eyes: 'tired', mouth: 'none' },
      { at: 1.02, eyes: 'dazed', mouth: 'none', ramp: 0.22 },
      { at: 1.96, eyes: 'tired', mouth: 'none', ramp: 0.22 },
      { at: 2.42, eyes: 'closed', mouth: 'none', ramp: 0.24 },
    ], { seed: 11, ramp: 0.22, blinkFrom: 0.55, noBlinkIn: [[0.95, 1.35], [1.95, 2.66]] });

    const look = dart(t, [
      { t: 0.00, look: 0.15 },
      { t: 1.02, look: 0.95 },
      { t: 2.02, look: 0.15 },
    ], { dur: 0.11 });

    groundShadow(ctx, cx, m.seatY + 30, u, { alpha: 0.14, w: 6.8 });

    // 车窗里先有一层它的映影：比本体淡，跟着本体走
    const wins = m.windows;
    const refl = fallOff(t);
    ctx.save();
    ctx.beginPath(); ctx.rect(wins[0].x, wins[0].y, wins[0].w, wins[0].h); ctx.clip();
    ctx.globalAlpha = 0.20 + refl * 0.03;
    clawd(ctx, {
      cx: cx - 6, by: 605 - bob * 0.4, u: 13,
      color: '#9FC3CE', noInk: true,
      eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
      look: -look * 0.7,
      seed: 12,
      squash: 0.99,
    });
    ctx.restore();

    clawd(ctx, {
      cx: cx + shift * 0.5, by: by + slump * 2.2 - lift * 2.6 + drop * 2.4,
      u,
      color: P.orange,
      eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
      look,
      seed: 11,
      legs: [0, -0.16, 0, -0.16],
      rot: Math.sin(t * 1.25 + 0.4) * 0.006 + slump * 0.02 - lift * 0.012 + drop * 0.018,
      squash: 0.992 - slump * 0.008 - drop * 0.012 + lift * 0.004,
    });
    headphones(ctx, cx + shift * 0.5, by - 9 * u + slump * 2.2 - lift * 2.6 + drop * 2.4, u, { color: P.tealDeep });

    // 耳机里漏出来的一点音乐：很轻，只有一颗
    if (t < 1.2) {
      ctx.save();
      ctx.globalAlpha = 0.20 * smooth(t / 0.4) * (1 - smooth((t - 0.8) / 0.4));
      note(ctx, cx + 5 * u + Math.sin(t * 2) * 6, by - 11 * u - t * 12, 0.9, P.lamp);
      ctx.restore();
    }

    // ---- 对座：睡着的那只 ----
    {
      const sbob = Math.sin(t * 1.05 + 1.1) * 2.2 + breathe(t, 21, 17, { amp: 0.14 });
      const twitch = Math.max(0, 1 - Math.abs(t - 1.95) / 0.14);
      clawd(ctx, {
        cx: 880, by: m.seatY + 48 - sbob, u: 17,
        color: P.sage, eyes: 'closed', mouth: 'none', blush: true, seed: 21,
        legs: [0, -0.16, 0, -0.16],
        armL: -0.1 - twitch * 0.06, armR: -0.1,
        rot: Math.sin(t * 1.05 + 1.1) * 0.01 + twitch * 0.015,
      });
    }
    // ---- 对座：看手机的那只，有自己的节奏 ----
    {
      const pbob = breathe(t, 22, 17, { amp: 0.16 });
      const glance = smooth((t - 1.45) / 0.25) * (1 - smooth((t - 1.85) / 0.3));
      const fg = faceE1(t, [
        { at: 0.00, eyes: 'look', mouth: 'none' },
        { at: 1.45, eyes: 'side', mouth: 'none', ramp: 0.12 },
        { at: 1.85, eyes: 'look', mouth: 'flat', ramp: 0.14 },
      ], { seed: 22, ramp: 0.12, blinkFrom: 0.7 });
      clawd(ctx, {
        cx: 1060, by: m.seatY + 50 - pbob, u: 17,
        color: P.lav, eyes: fg.eyes, mouth: fg.mouth, brow: fg.brow, seed: 22,
        look: -0.85,
        legs: [0, -0.16, 0, -0.16],
        armL: -0.45, armR: -0.05,
        rot: Math.sin(t * 1.4 + 2) * 0.006,
      });
      phoneProp(ctx, 1060 - 4.2 * 17, m.seatY + 50 - pbob - 3.2 * 17, 6, { rot: 0.12, screen: '#C9DADE', glow: true });
    }
    // ---- 车门边站着的一只：背对，扶着立杆 ----
    {
      const sb = breathe(t, 23, 16, { amp: 0.14 });
      clawd(ctx, {
        cx: 1470, by: 760 - sb, u: 16,
        color: P.mustard, eyes: 'none', mouth: 'none', seed: 23,
        flip: true,
        armL: -0.1, armR: -0.7,
        legs: [0, -0.03, 0, -0.03],
        rot: Math.sin(t * 1.1 + 0.7) * 0.008,
      });
    }

    // 到站前的减速光扫过：窗外的灯变密，为下一镜的人群铺路
    const p = clamp((t - 2.1) / 0.6, 0, 1);
    if (p > 0) {
      ctx.save();
      ctx.globalAlpha = 0.12 * p;
      ctx.fillStyle = P.lamp;
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.globalAlpha = 0.10 * p;
      ctx.fillStyle = '#CFE6EA';
      for (const w of wins) ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.restore();
    }
  },
};

// 映影在窗上偶尔被隧道的灯带扫一下
function fallOff(t) {
  return (Math.sin(t * 3.1) + 1) / 2;
}