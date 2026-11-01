import { shutterStreet } from '../src/scenes-intro.js';
import { carLightOnWall } from '../src/polish-intro-outro.js';
import { clamp, smooth } from '../src/ink.js';

// i-02 街角：卷帘门半开的便利店，路灯闪一下再稳定，地上有水光
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;

    // 路灯：0.55–1.05 秒抖两下，之后稳定
    let fl = 0;
    if (t > 0.55 && t < 1.05) {
      const k = (t - 0.55) / 0.5;
      fl = Math.pow(Math.abs(Math.sin(k * Math.PI * 3)), 0.5) * (1 - k);
    }
    const lamp = 1 - 0.82 * fl;

    shutterStreet(ctx, { t, lamp });

    // 灯的电流声：极轻的全屏明暗，稳定后消失
    if (fl > 0.05) {
      ctx.save();
      ctx.globalAlpha = 0.10 * fl;
      ctx.fillStyle = '#F6E3BC';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }

    // 收尾：一辆车从左边开过，车灯先扫到立面，再落到湿地面上（只做光，不做车）
    const cu = (t - 1.95) / 1.75;
    if (cu > -0.05 && cu < 1.05) {
      const uu = clamp(cu, 0, 1);
      const env = smooth(uu / 0.16) * (1 - smooth((uu - 0.72) / 0.28));
      // 墙面：宽光斑 + 更亮的灯罩边缘
      carLightOnWall(ctx, { x: -340 + uu * 2740, a: env });
      // 地面：车灯在湿地面上拉出的一团暖光（软椭圆，不是一道硬三角）
      const gx = -260 + uu * 2760;
      ctx.save();
      ctx.translate(gx, 972);
      ctx.scale(2.2, 1);
      const gg = ctx.createRadialGradient(0, 0, 0, 0, 0, 190);
      gg.addColorStop(0, `rgba(255,240,200,${0.22 * env})`);
      gg.addColorStop(0.55, `rgba(255,236,190,${0.10 * env})`);
      gg.addColorStop(1, 'rgba(255,236,190,0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(0, 0, 190, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  },
};
