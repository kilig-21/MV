import { introCity } from '../src/scenes-outro.js';
import { creditPanelR2 } from '../src/scenes-outro-r2.js';
import { smooth } from '../src/ink.js';

// o-06a 制作名单：压暗的城市当底，暗色斜切框里四行信息依次浮上来
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;

    introCity(ctx, {
      scrollT: 0,
      litP: 1,
      zoom: 1.0 + 0.025 * smooth(t / d),
      fade: 0.66,
    });
    creditPanelR2(ctx, t);
  },
};