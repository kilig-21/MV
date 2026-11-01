import { windowCity } from '../src/scenes-outro-r2.js';
import { clamp, lerp, smooth } from '../src/ink.js';

// o-05 回到城市：从一扇亮窗里看见他，镜头缓慢拉远，退到整栋楼
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;

    // 前 0.35 s 停住，之后用对数速度拉远（近处慢、远处快），最后 1 秒停稳
    const p = smooth(clamp((t - 0.35) / (d - 1.35), 0, 1));
    const z = Math.exp(lerp(Math.log(5.2), 0, p));
    const cx = lerp(1285, 1392, p);
    const cy = lerp(350, 600, p);

    ctx.save();
    ctx.translate(960, 540);
    ctx.scale(z, z);
    ctx.translate(-cx, -cy);
    windowCity(ctx, { t, d });
    ctx.restore();
  },
};