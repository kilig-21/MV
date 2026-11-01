import { carriage } from '../src/scenes.js';
import { wakeFlash } from '../src/scenes-chorus23.js';
import { glassOverlay } from '../src/polish-chorus-r2.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { glow, smooth, rng, block, line } from '../src/ink.js';
import { breath } from '../src/polish-chorus.js';
import { exprE3, withBlink, dart } from '../src/expr-e3.js';

// 贴在玻璃上的雨珠：在焦点里，算是前景
function glassDrops(ctx, t, o = {}) {
  const R = rng(o.seed || 1901);
  const x0 = o.x ?? 400, y0 = o.y ?? 0, w = o.w ?? 1140, h = o.h ?? 930;
  ctx.save();
  for (let i = 0; i < 12; i++) {
    const x = x0 + R() * w;
    const base = y0 + R() * h;
    const sp = 16 + R() * 26;
    const y = y0 + ((base + t * sp) % h);
    const s = 4 + R() * 9;
    ctx.globalAlpha = 0.5 + R() * 0.3;
    ctx.fillStyle = 'rgba(220,233,236,0.55)';
    ctx.beginPath();
    ctx.ellipse(x, y, s * 0.7, s, 0, 0, Math.PI * 2);
    ctx.fill();
    // 拖尾
    ctx.globalAlpha *= 0.5;
    ctx.fillRect(x - s * 0.18, y, s * 0.36, Math.min(70, 6 + t * sp * 0.4));
  }
  ctx.restore();
}

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;

    // 贴近车窗：把车厢放大 2.15 倍，取左侧那扇窗
    ctx.save();
    ctx.translate(960, 520);
    ctx.scale(2.15, 2.15);
    ctx.translate(-330, -430);
    carriage(ctx, gt, { scroll: 520 + gt * 26 });
    ctx.restore();

    // 窗外打进来的冷光，落在玻璃这一侧
    glow(ctx, 960, 300, 700, 'rgba(159,195,206,0.5)', 0.16);

    // 左边补一条车厢墙，别让窗框外侧发黑
    block(ctx, -10, 0, 392, 1080, 0, '#DFC8A0', { seed: 2311, amp: 1.2 });
    line(ctx, 392, 0, 392, 1080, { seed: 2312, lw: 4, color: '#C6AE86', amp: 1.6 });

    const u = 48, cx = 780, by = 900;

    // 睁眼：第二段不慌，先半睁再全开（ramp 0.12，约 3 帧一步），
    // 看清是车窗后才笑开。
    const e = withBlink(gt, 227, exprE3(t, [
      { t: 0.00, eyes: 'closed', mouth: 'none' },
      { t: 0.42, eyes: 'closed', mouth: 'none' },
      { t: 0.55, eyes: 'tired', mouth: 'none' },
      { t: 0.70, eyes: 'wide', mouth: 'o' },
      { t: 1.28, eyes: 'happy', mouth: 'smile' },
    ], { ramp: 0.12 }));
    const b = breath(gt, 227, 1.05);
    const wake = smooth(t / 0.5);
    const nod = t > 1.28 ? Math.exp(-(t - 1.28) * 5) * Math.sin((t - 1.28) * 13) : 0;

    clawd(ctx, {
      cx, by: by + b.y * 1.6 + nod * 2,
      u,
      color: P.orange,
      ...e, blush: true,
      seed: 227,
      // 眼睛先动：睁眼后视线飘向窗外的灯
      look: dart(t, [
        { t: 0.02, look: 0.08 }, { t: 0.95, look: 0.50 }, { t: 1.55, look: 0.35 },
      ], { dur: 0.10 }),
      legs: [0, -0.16, 0, -0.16],
      squash: 1 + (1 - wake) * 0.03 + nod * 0.02,
    });

    // 梦的余辉
    glow(ctx, cx, by - 5 * u, 380, 'rgba(246,201,126,0.5)', 0.42 * (1 - wake * 0.6));

    // 玻璃在角色前面：反光带、灯斑、水珠
    glassOverlay(ctx, gt, { x: 398, y: -6, w: 1124, h: 930 });
    glassDrops(ctx, gt, { x: 400, y: 0, w: 1120, h: 920 });

    // 白光从上一镜的梦里接过来
    wakeFlash(ctx, t, { dur: 0.5, peak: 0.92 });
  },
};