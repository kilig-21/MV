import { dreamSky, sea, cloudBed, noteIcons } from '../src/dream.js';
import { clawd, zzz } from '../src/character.js';
import { P } from '../src/palette.js';
import { clamp } from '../src/ink.js';
import { keys, backOut, breath } from '../src/polish-chorus.js';
import { exprE3, withBlink, beatClock, dart, browAt } from '../src/expr-e3.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    dreamSky(ctx, gt, { moonX: 1400, moonY: 220, moonR: 62 });
    sea(ctx, gt, { y: 880 });

    cloudBed(ctx, 960, 720, 640, gt);

    // 躺下：先看一眼云床 → 坐下 → 半拍犹豫 → 这才躺平
    const settle = keys(t, [
      [0.00, 0], [0.55, 0.16], [1.00, 0.45], [1.22, 0.45], [1.85, 1.0, backOut],
    ]);
    const awake = clamp(1 - (t - 1.45) / 0.75, 0, 1);   // 1 醒着 → 0 睡着
    const b = breath(gt, 126, 0.65);
    const by = 768 + settle * 16 + Math.sin(gt * 1.2) * 4 + b.y * 2;
    const squash = 1 - settle * 0.09 + (1 - awake) * 0.02 * Math.sin(gt * 2 * Math.PI * 0.5);

    // 表情：看到云床的期待 → 坐下的放松 → 困 → 闭眼睡熟；
    // 「睡在梦里」这句里眼型一路软下去，没有一帧硬切。
    const bc = beatClock(shot.t0);
    const e = withBlink(gt, 127, exprE3(t, [
      { t: 0.00, eyes: 'wide', mouth: 'smile', brow: 'up' },
      { t: bc.b(1), eyes: 'normal', mouth: 'smile', brow: null },
      { t: bc.b(2), eyes: 'tired', mouth: 'flat' },
      { t: 2.12, eyes: 'closed', mouth: 'smile' },
      { t: bc.b(3), eyes: 'closed', mouth: 'flat' },
    ]));
    const browDy = browAt(t, [{ at: 0.10, dur: 0.34, amp: 0.14 }]);
    const look = dart(t, [
      { t: 0.05, look: 0.50 }, { t: 0.80, look: 0.12 }, { t: 1.50, look: 0.02 },
    ]);

    clawd(ctx, {
      cx: 960, by, u: 25,
      color: P.orange,
      ...e, browDy,
      seed: 126,
      blush: true,
      look,
      legs: [0, 0.1 + settle * 0.12, 0, 0.1 + settle * 0.12],
      armL: -0.15 + settle * -0.25,
      armR: -0.15 + settle * -0.25,
      rot: -0.02 * settle,
      squash,
    });

    if (t > 2.15) {
      zzz(ctx, 1130, 640 + Math.sin(gt * 0.8) * 4, 24, gt, clamp((t - 2.15) / 0.4, 0, 1) * 0.95, '#F1D9A8');
    }

    // 云被盖到身上，只露出上半身：让「躺下睡在云里」看得出来
    ctx.save();
    ctx.translate(960, 740 + settle * 8);
    ctx.fillStyle = '#F2E3C6'; ctx.strokeStyle = P.ink; ctx.lineWidth = 5;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 7; i++) {
      const px = -300 + (600 / 7) * i;
      const py = Math.sin(i * 1.25 + gt * 0.6) * 9 - 8;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    for (let i = 7; i >= 0; i--) {
      const px = -300 + (600 / 7) * i;
      const py = 66 + Math.sin(i * 1.1 + gt * 0.5) * 10;
      ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();

    noteIcons(ctx, gt, 6, 0.35);
  },
};