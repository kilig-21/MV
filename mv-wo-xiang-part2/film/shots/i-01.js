import { nightSky, stars, moon, cityLine } from '../src/scenes.js';
import { cityWindowsLit } from '../src/scenes-intro.js';
import { P } from '../src/palette.js';
import { clamp, smooth, lerp, rng } from '../src/ink.js';

// i-01 夜城远景：镜头极慢横移，窗灯一盏盏亮；没有人
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    const p = clamp(t / (d - 0.4), 0, 1);

    nightSky(ctx, {});
    stars(ctx, { n: 42, h: 470, seed: 5 });
    moon(ctx, 330, 168, 50, P.sky);

    // 远景两层楼群（复用 scenes.cityLine），随镜头缓慢左移
    cityLine(ctx, { y: 650, seed: 21, minH: 120, maxH: 280, color: '#12222D', scroll: t * 10 });
    cityLine(ctx, { y: 742, seed: 34, minH: 70, maxH: 180, color: '#152A35', scroll: t * 16 });

    // 近一层：窗灯按各自时刻依次亮
    cityWindowsLit(ctx, { litP: p, litSpan: d, y: 828, scroll: t * 24, seed: 71 });

    // 城市底部的冷雾与零星街灯
    ctx.save();
    ctx.globalAlpha = 0.5;
    const haze = ctx.createLinearGradient(0, 790, 0, 1080);
    haze.addColorStop(0, 'rgba(40,65,79,0)');
    haze.addColorStop(1, 'rgba(28,48,60,0.85)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, 790, 1920, 290);
    ctx.restore();
    const R = rng(902);
    for (let i = 0; i < 7; i++) {
      const x = ((R() * 2200 - t * 28) % 2200 + 2200) % 2200 - 140;
      const y = 860 + R() * 170;
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#E3B36A';
      ctx.fillRect(x, y, 10, 4);
      ctx.globalAlpha = 0.10;
      ctx.beginPath(); ctx.arc(x + 5, y + 2, 26, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 开场从暗里浮出来
    const rise = 1 - smooth(t / 1.1);
    if (rise > 0) {
      ctx.save();
      ctx.globalAlpha = 0.72 * rise;
      ctx.fillStyle = '#08101A';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }
  },
};
