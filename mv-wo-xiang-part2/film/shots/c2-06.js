import { dreamSky, sea, paperBoat } from '../src/dream.js';
import { motes, horizonGlow, cloudBank } from '../src/scenes-chorus23.js';
import { distantCity, noteMark, waveCrest, scraps } from '../src/polish-chorus-r2.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { line, curve, clamp, lerp, smooth } from '../src/ink.js';
import { breath, beatInfo } from '../src/polish-chorus.js';
import { exprE3, withBlink, dart } from '../src/expr-e3.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;

    // 纵深：天在上，远城一条，海在中，舟压在最前
    dreamSky(ctx, gt, { top: '#0F1C28', mid: '#1D3746', low: '#2B4E5C', moonX: 1600, moonY: 120, moonR: 34 });
    horizonGlow(ctx, 676, { alpha: 0.6 });
    distantCity(ctx, gt, { y: 668, scroll: gt * 22, alpha: 0.85, seed: 1051 });
    sea(ctx, gt, { y: 690 });

    // 天上压两条低云，别让上半屏空着
    cloudBank(ctx, 340, 470, 0.85, { alpha: 0.2, fill: '#24434F' });
    cloudBank(ctx, 1540, 380, 0.7, { alpha: 0.16, fill: '#22414C' });

    // 海面上的雾带：把远城和近舟分开
    ctx.save();
    const fog = ctx.createLinearGradient(0, 640, 0, 780);
    fog.addColorStop(0, 'rgba(60,105,120,0)');
    fog.addColorStop(0.55, 'rgba(60,105,120,0.36)');
    fog.addColorStop(1, 'rgba(60,105,120,0)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, 640, 1920, 140);
    ctx.restore();

    // 前景的舟：船头从左边探进来，船身被画面下缘切掉
    const k = smooth(t / (d * 0.7));
    const bx = lerp(400, 520, k), by = lerp(950, 920, k);
    paperBoat(ctx, bx, by, 460, gt);
    const deckY = by;

    // 音乐从舟尾飘向远城：越远越小
    for (let i = 0; i < 7; i++) {
      const kk = ((gt * 0.16 + i / 7) % 1);
      const nx = 1140 + kk * 620;
      const ny = deckY - 70 - kk * 250 + Math.sin(gt * 0.9 + i) * 10;
      noteMark(ctx, nx, ny, 13 * (0.45 + kk * 0.8), i % 2 ? P.pink : P.lamp, Math.sin(gt + i) * 0.2);
    }

    // 角色站在船头，中景大小
    const bi = beatInfo(gt);
    const pump = Math.exp(-bi.ph * 3.6);
    const b = breath(gt, 225, 1.05);

    // 表情：跟着旋律从微笑到张开嘴；最后眼睛亮一下。
    // 视线从船尾的音符移到远处的城。
    const e = withBlink(gt, 225, exprE3(t, [
      { t: 0.00, eyes: 'happy', mouth: 'smile' },
      { t: 0.55, eyes: 'happy', mouth: 'grin' },
      { t: 1.15, eyes: 'sparkle', mouth: 'grin' },
    ]));
    const look = dart(t, [
      { t: 0.05, look: 0.55 }, { t: 0.88, look: 0.20 }, { t: 1.22, look: 0.50 },
    ]);

    clawd(ctx, {
      cx: 950, by: deckY + 2 + b.y * 2.5,
      u: 25,
      color: P.orange,
      ...e,
      blush: true,
      seed: 225,
      look,
      rot: -0.05 + 0.03 * Math.sin(gt * 1.4) + 0.015 * pump,
      legs: [0, -0.18, 0, -0.18],
      armL: -0.35 - 0.5 * pump,
      armR: -0.15 - 0.3 * pump,
      squash: 1 - 0.02 * pump,
    });

    // 前景：船头的浪 + 近处的音符，挡住船脚，纵深才立得住
    waveCrest(ctx, 700, 1036, 1050, gt, { seed: 741, fill: '#16323E', alpha: 0.95 });
    noteMark(ctx, 1250 + Math.sin(gt * 0.9) * 10, 1042, 40, 'rgba(241,217,168,0.28)', -0.4);
    noteMark(ctx, 220, 980, 28, 'rgba(232,160,168,0.22)', 0.5);

    scraps(ctx, gt, 4, { speed: 90, seed: 817, y0: 320, span: 600 });
    motes(ctx, gt, 20, { alpha: 0.35, y0: 1040, speed: 80 });
  },
};