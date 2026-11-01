import { introCity } from '../src/scenes-outro.js';
import { clamp, smooth, glow } from '../src/ink.js';

// o-06b 窗灯一盏盏灭：最后留一点光，余晖散尽后压回 intro 第一帧的暗度
// 末帧必须与 i-01 第 0 帧逐像素一致（同一份 cityWindowsIO、scrollT=0、同样的 0.72 暗场）。
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;

    // 0.35 s → 7.55 s：全城熄灯；中右那扇压到最后
    const offP = smooth(clamp((t - 0.35) / 7.2, 0, 1));
    const res = introCity(ctx, { scrollT: 0, litP: 1, offP, offSpan: 7.2, zoom: 1, fade: 0 });

    // 最后一盏的余晖：先亮一下，再塌一次，才真的灭
    if (res && res.hero) {
      const on = smooth((t - 5.5) / 0.7);
      const left = clamp(1 - (t - 6.35) / 0.7, 0, 1);
      const dip = Math.exp(-Math.pow((t - 6.1) / 0.05, 2));
      const k = on * left * (1 - 0.9 * dip);
      if (k > 0.002) {
        glow(ctx, res.hero.x + 7, res.hero.y + 9, 140, 'rgba(246,201,126,0.6)', 0.65 * k * k);
      }
    }

    // 8.0 s 起压回 0.72 —— 与 i-01 第 0 帧同一档，首尾成环
    const fade = 0.72 * smooth(clamp((t - 8.0) / 0.8, 0, 1));
    if (fade > 0.002) {
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.fillStyle = '#08101A';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }
  },
};