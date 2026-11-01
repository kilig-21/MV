import { chalkWall } from '../src/scenes-verse3.js';
import { chalkChild, chalkCrab, rainStreaks, wetRuns, clipWashBelow } from '../src/scenes-verse3b.js';
import { P } from '../src/palette.js';
import { glow, rng, clamp, smooth, lerp } from '../src/ink.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    const p = clamp(t / d, 0, 1);
    chalkWall(ctx, gt);

    // 雨水先把墙的上半截打湿、压暗
    ctx.save();
    ctx.globalAlpha = 0.10 + 0.22 * smooth(p);
    ctx.fillStyle = '#161C20';
    ctx.fillRect(0, 0, 1920, 240);
    ctx.restore();

    const childX = 780, baseY = 706;
    const crabX = 1090, crabBy = 712;

    // 留一层极淡的粉笔印：冲掉之后「只剩轮廓」
    chalkChild(ctx, childX, baseY, 1.55, 0.11 + 0.05 * smooth(p));
    chalkCrab(ctx, crabX, crabBy, 14, 0.11 + 0.05 * smooth(p));

    // 完整的粉笔画：被下移的湿痕一点点擦掉。
    // 擦除的边沿不是一条直线，还随时间轻轻抖动——像水真的在往下爬
    const wipeY = lerp(300, 760, smooth(p)) + Math.sin(t * 1.7) * 5 + Math.sin(t * 4.3 + 1.2) * 2.4;
    const chalkA = lerp(0.95, 0.36, smooth(p));
    ctx.save();
    clipWashBelow(ctx, wipeY);
    chalkChild(ctx, childX, baseY, 1.55, chalkA);
    chalkCrab(ctx, crabX, crabBy, 14, chalkA * 0.95);
    ctx.restore();

    // 擦掉的地方往下淌水
    wetRuns(ctx, t, { seed: 3312 });
    // 墙角的粉笔灰沉下去
    const R = rng(3160);
    ctx.save();
    for (let i = 0; i < 26; i++) {
      const x = 600 + R() * 560;
      const y0 = 640 + R() * 200;
      const sp = 40 + R() * 70;
      const y = y0 + ((t * sp + R() * 120) % 220);
      ctx.globalAlpha = 0.10 + R() * 0.14;
      ctx.fillStyle = '#E7DDC8';
      ctx.beginPath();
      ctx.arc(x, y, 1.6 + R() * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 雨
    rainStreaks(ctx, t, { seed: 3301, n: 160, color: 'rgba(186,214,224,0.95)' });

    // 画着的两个人被雨笼着的一小片光
    glow(ctx, 900, 520, 420, 'rgba(176,204,214,0.30)', 0.30);
  },
};