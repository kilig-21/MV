import { introCity } from '../src/scenes-outro.js';
import { clamp, smooth, glow } from '../src/ink.js';

// o-06 窗灯一盏盏灭：最后一盏灭掉以后留一点余晖，再压到 intro 第一帧的暗度
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;

    // 0.7s → 8.7s：全城熄灯；0.95 那扇压到最后
    const offP = smooth(clamp((t - 0.7) / 8.0, 0, 1));
    const res = introCity(ctx, { scrollT: 0, litP: 1, offP, offSpan: 8.0, zoom: 1.0 });

    // 最后一盏的余晖：它成了全城最后一盏，光反而显得更亮；灭了以后余晖再散
    if (res && res.hero) {
      const on = smooth((t - 6.72) / 0.72);
      const left = clamp(1 - (t - 7.72) / 0.85, 0, 1);
      // 将灭未灭：7.36 s 前后先塌一次，再回一口气，才真的灭
      const dip = Math.exp(-Math.pow((t - 7.36) / 0.055, 2));
      const k = on * left * (1 - 0.9 * dip);
      if (k > 0.002) {
        glow(ctx, res.hero.x + 7, res.hero.y + 9, 130, 'rgba(246,201,126,0.6)', 0.6 * k * k);
      }
    }

    // 从名单切进来先暗半拍；最后压到 0.72——与 i-01 第 0 帧同一档，首尾成环
    const rise = 0.55 * (1 - smooth(t / 0.8));
    const fade = 0.72 * smooth(clamp((t - 8.45) / 1.0, 0, 1));
    const ov = 1 - (1 - rise) * (1 - fade);
    if (ov > 0.002) {
      ctx.save();
      ctx.globalAlpha = ov;
      ctx.fillStyle = '#08101A';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }
  },
};