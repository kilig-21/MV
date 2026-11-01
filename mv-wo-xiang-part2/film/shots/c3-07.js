import { dreamSky, noteIcons } from '../src/dream.js';
import { floatingIsland, quilt, farMoon, skylineBelow, motes, horizonGlow } from '../src/scenes-chorus23.js';
import { clawd, zzz } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, clamp } from '../src/ink.js';
import { keys, breath, float } from '../src/polish-chorus.js';
import { expr } from '../src/life.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    // 最高、最亮的一层：岛已经飘到城市上空，月挂在左边
    dreamSky(ctx, gt, { top: '#1D3748', mid: '#306072', low: '#447C89', moonX: -400, moonY: -400, moonR: 1 });
    farMoon(ctx, 380, 160, 48, '#223F4F');
    horizonGlow(ctx, 880, { alpha: 0.85 });
    skylineBelow(ctx, gt, { y: 1050, scroll: gt * 50 });

    // 脚下是城，岛浮在城上
    ctx.save();
    ctx.globalAlpha = 0.32;
    floatingIsland(ctx, 230, 540, 240, gt, { phase: 1, seed: 85 });
    floatingIsland(ctx, 1710, 490, 220, gt, { phase: 2, seed: 86 });
    ctx.restore();

    const push = 1 + 0.06 * smooth(t / d);
    ctx.save();
    ctx.translate(960, 540);
    ctx.scale(push, push);
    ctx.translate(-960, -540);

    const isle = floatingIsland(ctx, 960, 790, 1000, gt, { phase: 0, seed: 87, top: '#EDE3CC' });
    // c3 躺得最慢：先坐下、再一点点放平，像舍不得结束
    const sleep = keys(t, [[0.0, 0], [0.6, 0.35], [1.5, 0.72], [2.4, 1.0]]);
    const by = isle.topY + 4 + sleep * 12;
    const u = 34;
    const b = breath(gt, 326, 0.62);
    const f = float(gt, 326, 0.6);

    // 释然：先笑着看天，笑眼慢慢松成半睁（tired），再合上。
    // 两次过渡都比台词点早 0.2 秒开始，跟着身体放平一起走，不是到点才闭。
    const e = expr(t, [
      { t: 0.00, eyes: 'happy', mouth: 'smile' },
      { t: 1.35, eyes: 'tired' },
      { t: 2.25, eyes: 'closed' },
    ], { ramp: 0.20 });

    clawd(ctx, {
      cx: 960 + f.c * 2, by: by + b.y * 2.4, u,
      color: P.orange,
      ...e,
      seed: 326,
      blush: true,
      look: 0.15,
      legs: [0, 0.12, 0, 0.12],
      armL: -0.18 - 0.2 * sleep,
      armR: -0.18 - 0.2 * sleep,
      rot: -0.02 * sleep,
      squash: 1 - sleep * 0.05 + b.squash * 0.5,
    });
    quilt(ctx, 960, by + 10, 16.4 * u, 4.0 * u);

    if (t > 2.3) zzz(ctx, 1190, by - 9.5 * u, 34, gt, clamp((t - 2.3) / 0.5, 0, 1) * 0.95, '#F1D9A8');
    ctx.restore();

    noteIcons(ctx, gt, 8, 0.35);
    motes(ctx, gt, 30, { alpha: 0.5, y0: 1060 });
  },
};