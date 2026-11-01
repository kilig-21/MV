import { dreamSky, sea, paperBoat, noteIcons, ticketPlatform } from '../src/dream.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { lerp, smooth, clamp } from '../src/ink.js';
import { keys, backOut, breath } from '../src/polish-chorus.js';
import { exprE3, withBlink, beatClock, dart, browAt } from '../src/expr-e3.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    dreamSky(ctx, gt, {});
    sea(ctx, gt, { y: 800 });

    // 明信片折成小舟，从画面左下漂到中间
    const k = smooth(t / (d * 0.7));
    const bx = lerp(260, 900, k);
    const by = lerp(920, 828, k);
    paperBoat(ctx, bx, by, 210, gt);

    // 右岸：先站在一小张票上，起跳后再撤掉
    const jump = clamp((t - 1.85) / 0.5, 0, 1);
    if (jump < 0.35) {
      ctx.save();
      ctx.globalAlpha = 1 - jump / 0.35;
      ticketPlatform(ctx, 1440, 866, 280, gt, { phase: 3, seed: 47 });
      ctx.restore();
    }

    // 起跳前：看船靠近（wide）→ 前倾量距离 → 半拍收回（犹豫）→ 再蹲下起跳
    const lean = keys(t, [
      [0.0, 0], [0.95, 0.5], [1.22, 1.0], [1.42, 0.25], [1.62, 0.85], [1.85, 0.15],
    ]);
    const hop = backOut(clamp((t - 1.85) / 0.5, 0, 1), 0.6);
    const land = t > 2.35 ? Math.exp(-(t - 2.35) * 5) : 0;
    const wobble = land * Math.sin((t - 2.35) * 22) * 0.06;

    const cx = lerp(1440, bx + 26, hop);
    const cy = lerp(860, by + 26, hop) - Math.sin(hop * Math.PI) * 165 + wobble * 40;
    const b = breath(gt, 125);

    // 表情：看船靠近（wide）→ 估距离（normal）→ 半拍收回（wide+o，犹豫）→
    // 起跳时眉抬起来 → 落地才笑开。每一步都走 expr 过渡。
    const bc = beatClock(shot.t0);
    const e = withBlink(gt, 126, exprE3(t, [
      { t: 0.00, eyes: 'wide', mouth: 'flat' },
      { t: bc.b(1), eyes: 'normal', mouth: 'flat' },
      { t: bc.b(2), eyes: 'wide', mouth: 'o', brow: 'up' },
      { t: bc.b(3), eyes: 'happy', mouth: 'grin', brow: null },
      { t: bc.b(4), eyes: 'happy', mouth: 'smile' },
    ]));
    const browDy = browAt(t, [{ at: 1.90, dur: 0.30, amp: 0.12 }]);
    const sweat = t > 1.30 && t < 1.78 ? true : (t > 2.35 && t < 2.75);
    const look = dart(t, [
      { t: 0.05, look: -0.85 }, { t: 1.30, look: -0.20 },
      { t: 1.85, look: 0.10 }, { t: 2.40, look: 0.00 },
    ]);

    clawd(ctx, {
      cx, by: cy + b.y * 2.4, u: 19,
      color: P.orange,
      ...e, browDy, sweat, blush: true,
      seed: 125,
      look,
      rot: -0.05 * lean + 0.03 * Math.sin(hop * Math.PI) + wobble,
      // 起跳时脚蹬直、上臂抬起；落地后张一下保持平衡
      legs: [0, -0.18 - 0.22 * lean, 0, -0.18 - 0.22 * lean],
      armL: -0.15 - 0.35 * lean + 0.9 * Math.sin(hop * Math.PI) + 0.4 * land,
      armR: -0.15 - 0.35 * lean * 0.6 + 0.7 * Math.sin(hop * Math.PI) + 0.4 * land,
      squash: 1 + 0.02 * lean - 0.06 * Math.sin(hop * Math.PI) + 0.05 * land,
    });

    noteIcons(ctx, gt, 8, 0.5);
  },
};