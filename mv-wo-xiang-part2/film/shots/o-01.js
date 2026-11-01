import { cityHighway } from '../src/scenes-outro-r2.js';
import { smooth } from '../src/ink.js';

// o-01 城市高架：城市压在后景，末班车贴着镜头驶过，车窗连成一串流动的光
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;

    // 极缓推近 + 轻微跟随（幅度小到只当呼吸）
    const push = 1.02 + 0.035 * smooth(t / d);
    const pan = 12 * Math.sin(t * 0.42);
    ctx.save();
    ctx.translate(960, 650);
    ctx.scale(push, push);
    ctx.translate(-960 + pan, -650);
    cityHighway(ctx, { t, d });
    ctx.restore();
  },
};