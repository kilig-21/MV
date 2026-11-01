import { doorway } from '../src/scenes2.js';
import { clawd, groundShadow } from '../src/character.js';
import { letter } from '../src/props.js';
import { P } from '../src/palette.js';
import { smooth, clamp, rng, block } from '../src/ink.js';
import { breathe, sway, gesture, bounce, weightShift } from '../src/polish-v1.js';
import { faceE1, dart } from '../src/expr-e1.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const d = shot.t1 - shot.t0;
    doorway(ctx, gt);

    // 门缝的光：一直有、轻轻呼吸
    ctx.save();
    ctx.globalAlpha = 0.28 + 0.05 * Math.sin(t * 2.4);
    ctx.fillStyle = P.lamp;
    ctx.fillRect(620, 790, 680, 7);
    ctx.restore();

    // ---- 明信片：每张有自己的滑入节奏，落地有回弹 ----
    const R = rng(4242);
    const cards = Array.from({ length: 11 }, (_, i) => ({
      at: 0.08 + i * 0.19 + R() * 0.08,
      x: 640 + R() * 360,
      rot: (R() * 2 - 1) * 0.5,
      col: ['#F2E3C6', '#E8A0A8', '#BFD2D6', '#E0CDA8'][i % 4],
      drop: 40 + i * 16 + R() * 20,
      size: 15 + R() * 4,
    }));
    cards.forEach((c, i) => {
      const k = clamp((t - c.at) / 0.34, 0, 1);
      if (k <= 0) return;
      const e = 1 - Math.pow(1 - k, 3);
      const over = Math.max(0, Math.sin((t - c.at) * 6) * Math.exp(-(t - c.at) * 5)) * 0.05;
      const y = 792 + (e + over) * c.drop;
      // 落地后的一点点侧摆
      const wob = Math.sin((t - c.at) * 9 + i) * 0.05 * (1 - smooth((t - c.at) / 0.5));
      if (y > 800) {
        ctx.save();
        ctx.globalAlpha = 0.10;
        ctx.fillStyle = P.ink;
        ctx.beginPath();
        ctx.ellipse(c.x + 6, Math.min(y, 990) + 18, c.size * 2.6, c.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      letter(ctx, c.x, Math.min(y, 986), c.size, { rot: c.rot + wob, color: c.col, seed: i, stamp: true });
    });

    // ---- 礼物盒：盖子在 1.35 秒掀开，里面还有一张 ----
    {
      const open = smooth((t - 1.35) / 0.32);
      const bx = 1548, by = 1008;
      block(ctx, bx, by - 138, 208, 138, 8, '#B98A83', { stroke: P.ink, lw: 6, seed: 960 });
      block(ctx, bx + 92, by - 138, 26, 138, 2, '#D9A03F', { seed: 961 });
      ctx.save();
      ctx.translate(bx + 104, by - 138);
      ctx.rotate(-0.42 * open);
      ctx.translate(0, -open * 26);
      block(ctx, -112, -34, 224, 38, 6, '#C99A93', { stroke: P.ink, lw: 5, seed: 962 });
      block(ctx, -14, -34, 28, 38, 2, '#D9A03F', { seed: 963 });
      ctx.restore();
      if (open > 0.2) {
        ctx.save();
        ctx.globalAlpha = open;
        ctx.fillStyle = 'rgba(246,201,126,0.35)';
        ctx.fillRect(bx + 20, by - 140, 168, 22);
        ctx.restore();
        const pop = clamp((t - 1.55) / 0.4, 0, 1);
        if (pop > 0) {
          letter(ctx, bx + 104, by - 150 - pop * 26 + bounce(t, 1.9, { dur: 0.3, amp: 1 }) * 5, 18,
            { rot: -0.18, color: '#F2E3C6', seed: 964, stamp: true });
        }
      }
    }

    // ---- 主角：坐在纸堆里，不是开心，是被淹没 ----
    const buried = clamp((t - 1.25) / 0.7, 0, 1);
    const reach = gesture(t, 1.42, 0.24, { pre: 0.14, over: 0.06 });
    const liftCard = smooth((t - 1.92) / 0.35);
    const bob = breathe(t, 91, 24, { amp: 0.18 });
    const shift = weightShift(t, 91, { amp: 2.2 });
    const sink = smooth((t - 1.8) / 0.5);

    const f = faceE1(t, [
      { at: 0.00, eyes: 'normal', mouth: 'flat' },
      { at: 0.54, eyes: 'wide', mouth: 'o', ramp: 0.13 },        // 一张卡片飞到他旁边
      { at: 1.32, eyes: 'tired', mouth: 'flat', brow: 'worried', ramp: 0.18 },
      { at: 2.34, eyes: 'dazed', mouth: 'none', ramp: 0.22 },
    ], { seed: 91, ramp: 0.18, blinkFrom: 0.95, noBlinkIn: [[0.50, 0.62]] });

    groundShadow(ctx, 1320 + shift, 1012, 24, { alpha: 0.14, w: 7 });

    clawd(ctx, {
      cx: 1320 + shift, by: 1010 - bob + sink * 3, u: 24,
      color: P.orange,
      eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
      look: f.blinking ? 0 : dart(t, [
        { t: 0.00, look: -1.00 },
        { t: 0.56, look: -0.82 },
        { t: 1.30, look: 0.10 },
        { t: 2.10, look: -0.45 },
      ], { dur: 0.10 }),
      seed: 91,
      armL: -0.05 - 0.5 * reach * (1 - liftCard * 0.5),
      armR: sway(t, 99, { amp: 0.05 }),
      legs: [0, -0.1 + Math.sin(t * 2.6) * 0.04, 0, -0.1 + Math.sin(t * 2.6 + 1) * 0.04],
      squash: 0.995 - sink * 0.006,
    });

    // 手里那张：抬起来看，又放下
    if (reach > 0.3) {
      const hx = 1320 + shift - 7.2 * 24 - 6;
      const hy = 1010 - bob - 5 * 24 + (-0.05 - 0.5 * reach) * 24 + 34 - liftCard * 12;
      ctx.save();
      ctx.globalAlpha = Math.min(1, (reach - 0.3) * 3);
      ctx.translate(hx, hy);
      ctx.rotate(-0.25 - liftCard * 0.1);
      const flip = smooth((t - 2.2) / 0.14);
      ctx.scale(1, (1 - liftCard * 0.25) * (1 - flip * 1.8));
      letter(ctx, 0, 0, 17, { color: flip > 0.5 ? '#F6C97E' : '#F2E3C6', seed: 100, stamp: flip < 0.5 });
      ctx.restore();
      // 卡片边缘接住一点舞台的暖光
      const catchLight = smooth((t - 1.95) / 0.3);
      if (catchLight > 0) {
        ctx.save();
        ctx.globalAlpha = 0.35 * catchLight;
        ctx.fillStyle = P.lamp;
        ctx.beginPath();
        ctx.arc(hx + 8, hy - 6, 16 + Math.sin(t * 6) * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 四脚被纸埋住：卡片抬起来一点，又被压回去
    if (buried > 0) {
      letter(ctx, 1180, 1032 - Math.sin(t * 2.2) * 2, 16, { rot: 0.2, color: '#F2E3C6', seed: 92, stamp: true });
      letter(ctx, 1436, 1040, 16, { rot: -0.25, color: '#E8A0A8', seed: 93, stamp: true });
      letter(ctx, 1268, 1052, 14, { rot: 0.08, color: '#BFD2D6', seed: 94 });
    }
  },
};