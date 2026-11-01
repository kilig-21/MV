import { emptyVenue } from '../src/scenes-verse2.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, glow, block } from '../src/ink.js';
import { breath, sway } from '../src/life.js';
import { face, prep, dart } from '../src/expr-e2.js';
import { pulse } from '../src/polish-v2.js';

// 空场里残留的几盏壁灯，一盏一盏灭
const LAMPS = [
  { x: 300, y: 300, off: 0.45 },
  { x: 1620, y: 300, off: 0.95 },
  { x: 1180, y: 210, off: 1.35 },
];

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    emptyVenue(ctx, gt);

    // 壁灯：暖色一点点退掉，比顶灯先灭
    LAMPS.forEach((L, i) => {
      const k = 1 - smooth((t - L.off) / 0.35);
      if (k <= 0) return;
      ctx.save();
      ctx.globalAlpha = 0.65 * k;
      glow(ctx, L.x, L.y, 240, 'rgba(246,201,126,0.45)', 0.6);
      block(ctx, L.x - 22, L.y - 10, 44, 20, 6, '#D9C08A', { stroke: P.ink, lw: 3, seed: 1990 + i });
      ctx.restore();
    });

    // 顶灯在最后暗下去，只剩他头顶这一圈
    const dim = smooth((t - 1.55) / 0.8);
    if (dim > 0) {
      ctx.save();
      ctx.globalAlpha = 0.5 * dim;
      ctx.fillStyle = '#0A0F14';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
      glow(ctx, 960, 260, 420, 'rgba(246,201,126,0.55)', 0.55 * (1 - 0.35 * dim));
    }

    // 光柱里的灰：让空场有空气
    for (let i = 0; i < 12; i++) {
      const px = 760 + ((i * 97 + t * (6 + i % 3 * 3)) % 400);
      const py = 260 + ((i * 61 + t * (10 + i % 4 * 4)) % 520);
      ctx.save();
      ctx.globalAlpha = 0.10 + (i % 3) * 0.04;
      ctx.fillStyle = '#F1D9A8';
      ctx.beginPath();
      ctx.arc(px, py, 1.6 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 他：慢慢看一圈空椅子，最后低头；没有观众，也没有表演。
    // 视线是「看一处—停住—再看下一处」，不是匀速扫；最后落下来时眼才变累。
    const look = dart(t, [
      { t: 0.00, look: 0 }, { t: 0.86, look: -0.85 },
      { t: 1.56, look: 0.65 }, { t: 2.26, look: -0.30 },
    ], { dur: 0.16 });
    const exhale = pulse(t - 1.95, 0.5);
    const b = breath(t, { seed: 204, period: 2.1, amp: 0.12 });
    const s = sway(t, { seed: 204, period: 4.0, armAmp: 0.03 });
    // 表情：最后 2.10 s 眼皮才落下来（0.20 s 过渡）；2.02 s 眉先压一下做预备
    const e = face(t, [
      { t: 0.00, eyes: 'normal', mouth: 'flat', brow: null },
      { t: 2.02, brow: 'worried' },
      { t: 2.10, eyes: 'tired' },
    ], { ramp: 0.20, seed: 204 });
    clawd(ctx, {
      cx: 960 + Math.sin(t * 0.55) * 2,
      by: 800,
      u: 19,
      color: P.orange,
      ...e,
      browDy: prep(t, [2.10], { antic: 0.12, dur: 0.32, amp: 0.26 }),
      look,
      seed: 204,
      bodyDy: b.bodyDy + exhale * 0.14,
      squash: b.squash,
      armL: s.armL,
      armR: s.armR,
      rot: exhale * 0.02 + s.rot,
    });
  },
};