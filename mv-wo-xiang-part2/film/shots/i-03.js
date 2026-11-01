import { subwayPlatform } from '../src/scenes-intro.js';
import { clamp, smooth } from '../src/ink.js';

// i-03 空站台：隧道口亮起车头灯，越来越近
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;

    // 车头灯：一路加速靠近，最后 0.36 秒再明显窜一下（进站的最后一段）
    const e = clamp((t - 0.30) / (d - 0.66), 0, 1);
    const surge = smooth(clamp((t - (d - 0.36)) / 0.36, 0, 1));
    const head = clamp(Math.pow(e, 2.0) * 0.66 + Math.pow(surge, 1.4) * 0.34, 0, 1);

    // 灯管：开场闪两下；车进站时随电压轻微抖动（偶尔一下更明显）
    let flick = 0;
    if (t > 1.05 && t < 1.45) flick = (Math.sin((t - 1.05) * 42) > -0.1 ? 1 : 0);
    const near = smooth((t - (d - 2.7)) / 2.3);
    const spike = Math.pow(Math.max(0, Math.sin(t * 7.3 + 0.4)), 8);
    flick = clamp(flick + near * (0.07 + 0.30 * spike + 0.05 * Math.sin(t * 27.7)), 0, 0.62);

    subwayPlatform(ctx, { t, head, flick });

    // 越近，整帧被车灯压亮；光也在轻微呼吸
    if (head > 0.4) {
      const k = smooth((head - 0.4) / 0.6);
      const breath = 1 + 0.08 * Math.sin(t * 25.3) * k;
      ctx.save();
      ctx.globalAlpha = 0.16 * k * breath;
      ctx.fillStyle = '#FFEBC0';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }
  },
};
