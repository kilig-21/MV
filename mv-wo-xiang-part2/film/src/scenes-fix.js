// c1/v2 审查后补的小场景（不改动 scenes-verse2.js 等共享模块）。
// v2-16 / v2-17 暖色回忆里右墙上的海报：原本是人形剪影，这里换成官方比例的 Clawd，
// 让「父亲指着儿子的海报」这件事看得见。
import { clawd } from './character.js';
import { block, glow } from './ink.js';
import { P } from './palette.js';

export function sonPoster(ctx, o = {}) {
  const x = 1320, y = 160, w = 300, h = 380;
  // 盖住旧的人形剪影，只留原外框
  block(ctx, x + 10, y + 10, w - 20, h - 20, 4, '#18262F', { seed: 2500 });
  // 灯打在海报上的暖光
  glow(ctx, x + w / 2, y + 250, 250, 'rgba(246,201,126,0.40)', o.glow ?? 0.6);
  // 米色内框
  block(ctx, x + 20, y + 20, w - 40, h - 40, 3, null,
    { stroke: 'rgba(242,227,198,0.55)', lw: 3, seed: 2501 });
  // 海报主角：橙色 Clawd，官方 15×16 比例，不拉长肢体
  clawd(ctx, {
    cx: x + w / 2, by: y + h - 32, u: 15,
    color: P.orange, eyes: 'happy', mouth: 'grin', blush: true, seed: 2502,
    armL: -0.5, armR: -0.5,
  });
  // 海报标题条
  block(ctx, x + 46, y + h - 30, 150, 11, 4, '#F2E3C6', { seed: 2503 });
  block(ctx, x + 46, y + h - 15, 92, 8, 3, 'rgba(242,227,198,0.65)', { seed: 2504 });
}