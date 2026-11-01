import { carriage } from '../src/scenes.js';
import { lampOff, seatNewspaper, paperCup } from '../src/scenes-outro.js';
import { hangStraps } from '../src/scenes-outro-r2.js';
import { clamp, lerp, smooth } from '../src/ink.js';

// o-02 空车厢：车在减速，镜头在车厢里缓慢横移；五根灯管一格格灭
const LAMPS = [190, 570, 950, 1330, 1710];
// 熄灭时刻不等距：1.05 / 2.60 / 4.25 / 5.90 / 7.55
const OFF_AT = [1.05, 2.60, 4.25, 5.90, 7.55];
const STUT = [0.50, 0.42, 0.60, 0.38, 0.72];

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;

    // 车厢里缓慢横移：1.06 倍留出移动余量，整镜只走 80 px
    const pan = lerp(-46, 34, smooth(t / d));
    ctx.save();
    ctx.translate(960, 540);
    ctx.scale(1.06, 1.06);
    ctx.translate(-960 + pan, -540);

    // 车在减速：850 → 20 px/s
    const scroll = 850 * t - 30 * t * t;
    carriage(ctx, gt, { scroll });

    // 吊环随减速慢慢摆稳
    hangStraps(ctx, t, { tilt: -0.06 * (1 - smooth(t / 6.5)) });

    // 座位上忘下的报纸、过道里滚动的纸杯
    seatNewspaper(ctx, 700, 700, t, { seed: 41, rot: -0.09 });
    if (t > 4.2) {
      const fall = smooth((t - 4.4) / 1.1);
      const roll = clamp(t - 5.4, 0, 3.0);
      paperCup(ctx, 1470 - roll * 26, 944, -1.35 * fall, 0.9);
    }

    // 五根灯管依次灭：先抖一阵，再死掉
    const states = LAMPS.map((x, i) => {
      const offAt = OFF_AT[i];
      if (t >= offAt) return 1;
      if (t > offAt - STUT[i]) {
        const s = (t - (offAt - STUT[i])) / STUT[i];
        // 中间那根先「假死」一下，又回一口气才真灭
        if (i === 2 && s > 0.5 && s < 0.64) return 0.04;
        const f = Math.sin(t * (48 + i * 11) + i * 2.1) * 0.5 + 0.5;
        if (f > 0.66) return 0.44;
        if (f > 0.40) return 0.10;
        return 0;
      }
      return 0;
    });

    // 还亮着的灯：一束光锥落到车厢里
    LAMPS.forEach((x, i) => {
      if (states[i] >= 0.2) return;
      const g = ctx.createLinearGradient(0, 110, 0, 820);
      g.addColorStop(0, 'rgba(246,201,126,0.15)');
      g.addColorStop(0.5, 'rgba(246,201,126,0.07)');
      g.addColorStop(1, 'rgba(246,201,126,0)');
      ctx.save();
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x - 64, 118); ctx.lineTo(x + 64, 118);
      ctx.lineTo(x + 252, 820); ctx.lineTo(x - 252, 820);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    });

    let offCount = 0;
    LAMPS.forEach((x, i) => {
      lampOff(ctx, x, 110, states[i], 210 + i);
      if (states[i] >= 1) offCount++;
    });

    // 每灭一根，整节车厢暗一层
    const dim = offCount * 0.05 + 0.06 * smooth((t - (d - 2.6)) / 2.6);
    if (dim > 0.002) {
      ctx.save();
      ctx.globalAlpha = dim;
      ctx.fillStyle = '#08101A';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }

    // 灯全灭以后，窗外城市的冷光落到地板上
    if (offCount >= 5) {
      ctx.save();
      ctx.globalAlpha = 0.07 * smooth((t - 7.9) / 1.2);
      ctx.fillStyle = '#9FC3CE';
      ctx.fillRect(70, 770, 1790, 310);
      ctx.restore();
    }

    ctx.restore();
  },
};