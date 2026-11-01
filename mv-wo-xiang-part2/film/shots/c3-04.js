import { dreamSky, sea } from '../src/dream.js';
import { bigTicket, farMoon, skylineBelow, motes, horizonGlow } from '../src/scenes-chorus23.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { glow } from '../src/ink.js';
import { breath, beatPulse, beatMotes, downHit, barPhase } from '../src/polish-chorus.js';
import { expr } from '../src/life.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    dreamSky(ctx, gt, { top: '#1B3343', mid: '#2E5A6A', low: '#3F7280', moonX: -400, moonY: -400, moonR: 1 });
    farMoon(ctx, 1640, 150, 30, '#1E3B4B');
    sea(ctx, gt, { y: 980 });
    horizonGlow(ctx, 966, { alpha: 0.7 });
    skylineBelow(ctx, gt, { y: 1044, scroll: gt * 34 });

    const u = 62;
    const dh = downHit(gt, 3.4);

    // 脚踩在铺满画面的巨大票面上
    const top = bigTicket(ctx, 960, 916, 1800, gt, { phase: 2, seed: 244, h: 76 });
    const by = top + 8;
    const b = breath(gt, 323, 1.15);

    // 嘴跟着踩点一开一合（笑→咧嘴→笑→咧嘴）：前两下落在 92.5BPM 的拍点上
    // （local 0.30 / 0.95），最后一下提前到 1.50 做切点前的蓄势，免得
    // 咧嘴刚出现就被剪掉。三处都走 0.15 的过渡，不再是每个重拍硬切。
    const e = expr(t, [
      { t: 0.00, eyes: 'happy', mouth: 'smile' },
      { t: 0.30, mouth: 'grin' },
      { t: 0.95, mouth: 'smile' },
      { t: 1.50, mouth: 'grin' },
    ], { ramp: 0.15 });

    // c3 踩得最开、也最连：四脚不再按拍点停在原地，而是自己一直滚着踩，
    // 节拍只决定"沉多深"，不决定"什么时候动"
    const ph = gt * 21;
    clawd(ctx, {
      cx: 960, by: by - 4 * dh - b.y * 2, u,
      color: P.orange,
      ...e,
      blush: true,
      seed: 323,
      look: 0.1,
      legs: [
        Math.sin(ph) * 0.62 - dh * 0.14, 0.3 - dh * 0.12,
        Math.sin(ph + Math.PI * 0.8) * 0.62, 0.26,
      ],
      squash: 1 + 0.03 * Math.abs(Math.sin(ph)) + 0.03 * dh,
    });

    // 强弱拍：每拍小圈，每 4 拍一个大圈；大圈起拍时脚下的城跟着亮一下
    beatPulse(ctx, 960, by + 16, gt, 1.75, { beatAlpha: 0.3, barAlpha: 0.72 });

    const bp = barPhase(gt);
    const lit = Math.exp(-bp * 3.2);
    for (let i = 0; i < 12; i++) {
      glow(ctx, 200 + i * 150, 940, 130, 'rgba(246,201,126,0.45)', 0.10 + 0.22 * lit * (i % 3 === 0 ? 1 : 0.7));
    }

    beatMotes(ctx, 960, by - 210, gt, { n: 14, r0: 300, spread: 2.1, seed: 9 });

    motes(ctx, gt, 24, { alpha: 0.5, y0: 1060 });
  },
};