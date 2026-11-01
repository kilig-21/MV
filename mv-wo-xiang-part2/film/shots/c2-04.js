import { dreamSky } from '../src/dream.js';
import { motes, horizonGlow } from '../src/scenes-chorus23.js';
import { ticketFloor } from '../src/polish-chorus-r2.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { block, glow, rng } from '../src/ink.js';
import { breath, beatInfo, beatPulse, beatMotes, downHit } from '../src/polish-chorus.js';
import { exprE3, withBlink, beatClock, dart } from '../src/expr-e3.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;

    // 脚边机位：地平线被推高，天只剩上面一条
    dreamSky(ctx, gt, { top: '#0D1924', mid: '#1A3340', low: '#274853', moonX: -400, moonY: -400, moonR: 1 });
    horizonGlow(ctx, 610, { alpha: 0.7 });

    // 身后一片压得很低的光，把巨大的身体从暗里托出来
    glow(ctx, 960, 470, 760, 'rgba(246,201,126,0.5)', 0.3);

    // 巨大的票面从脚下铺出去（透视）
    ticketFloor(ctx, gt, { farY: 592, nearY: 1188, farW: 1020, nearW: 2900, cx: 960, seed: 641 });

    const bi = beatInfo(gt);
    const dh = downHit(gt, 4);
    const pump = Math.exp(-bi.ph * 4);
    const tap = Math.sin(Math.PI * bi.ph);
    const b = breath(gt, 223, 1.2);

    // 强拍：先在票面上炸开圈，再让角色踩上去（圈在脚下，不压脸）
    beatPulse(ctx, 960, 916, gt, 1.7, { beatAlpha: 0.3, barAlpha: 0.62 });

    // 表情：强拍张嘴、弱拍收成笑；最后一拍眼睛亮一下。
    // 嘴型改走 expr 关键帧，落点仍然对在强拍上。
    const bc = beatClock(shot.t0);
    const e = withBlink(gt, 223, exprE3(t, [
      { t: 0.00, eyes: 'happy', mouth: 'smile' },
      { t: bc.b(0), eyes: 'happy', mouth: 'grin' },
      { t: bc.b(1), eyes: 'happy', mouth: 'smile' },
      { t: 1.38, eyes: 'sparkle', mouth: 'grin' },
    ]));
    const look = dart(t, [
      { t: 0.05, look: 0.15 }, { t: bc.b(0), look: -0.15 },
      { t: bc.b(1), look: 0.20 }, { t: 1.38, look: 0.05 },
    ]);

    // 近景大角色：u 拉到 86，脚踩在票面上
    const by = 902 - 3 * dh - b.y * 2;
    clawd(ctx, {
      cx: 960, by, u: 86,
      color: P.orange,
      ...e, blush: true,
      seed: 223,
      look,
      legs: [
        -pump * 0.5 - dh * 0.14, 0.30 - dh * 0.12,
        -tap * 0.46, 0.28 - tap * 0.1,
      ],
      squash: 1 + 0.05 * pump + 0.025 * dh,
    });

    beatMotes(ctx, 960, by - 330, gt, { n: 14, r0: 330, spread: 2.0, seed: 5 });

    // 前景：两张正在落下的票根，压住画面下缘
    const R = rng(1701);
    for (let i = 0; i < 2; i++) {
      const k = ((t * 1.6 + i * 0.5) % 1);
      const x = i === 0 ? 190 + k * 60 : 1730 - k * 50;
      const y = 1120 - k * 420;
      const s = 190 - i * 30;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.35 + i * 0.7 + Math.sin(t * 2 + i) * 0.12);
      ctx.globalAlpha = 0.92;
      block(ctx, -s / 2, -s * 0.28, s, s * 0.56, 12, '#E8D5B0', { stroke: P.ink, lw: 6, seed: 1710 + i, amp: 1.4 });
      for (let q = 1; q < 5; q++) {
        ctx.beginPath(); ctx.arc(-s / 2 + (s / 5) * q, -s * 0.28, 6, 0, Math.PI); ctx.closePath();
        ctx.fillStyle = '#232227'; ctx.fill();
      }
      ctx.fillStyle = 'rgba(120,100,70,0.45)';
      ctx.fillRect(-s * 0.34, -s * 0.02, s * 0.5, 4);
      ctx.restore();
    }

    motes(ctx, gt, 26, { alpha: 0.5, y0: 1080, speed: 150 });
  },
};