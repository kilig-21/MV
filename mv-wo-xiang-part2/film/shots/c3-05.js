import { dreamSky, sea } from '../src/dream.js';
import { citySea, cloudBank, farMoon, motes, horizonGlow } from '../src/scenes-chorus23.js';
import { P } from '../src/palette.js';
import { line, block, smooth } from '../src/ink.js';
import { backOut, breath, float } from '../src/polish-chorus.js';
import { clawdSilhouette } from '../src/fix-round3c.js';

// c3 的「遨游四海」：全片最远的一镜，改成侧向剪影。
// 不再是居中对称的正面小点：角色压到右三分之一、迎着月亮与海天光带，
// 全身是暗剪影，只有上缘一道暖轮廓光和一只亮眼读朝向。
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;

    // 比前两镜都亮的一层天；地平线压到六成，海占大半
    dreamSky(ctx, gt, { top: '#1B3343', mid: '#2E5A6A', low: '#4B7F88', moonX: -400, moonY: -400, moonR: 1 });
    farMoon(ctx, 430, 330, 54, '#2C5A6A');
    sea(ctx, gt, { y: 660 });
    horizonGlow(ctx, 656, { alpha: 1 });
    // 地平线本身再压一条细亮线，剪影才有可衬的底
    line(ctx, 0, 658, 1920, 658, { seed: 471, lw: 4, color: 'rgba(246,201,126,0.55)', amp: 0.8 });

    // 城直接站在水里，倒影一路拖到画面底下
    citySea(ctx, gt, { y: 700, scroll: gt * 110, minH: 50, maxH: 130, seed: 65 });

    // 月亮在水面的倒影
    ctx.save();
    ctx.globalAlpha = 0.22;
    for (let i = 0; i < 7; i++) {
      line(ctx, 400 + (i % 3) * 12, 702 + i * 32, 460 - (i % 3) * 8, 702 + i * 32,
        { seed: 470 + i, lw: 5, color: '#EBDDB4', amp: 2 });
    }
    ctx.restore();

    // 平台下的薄云，交代「高」
    cloudBank(ctx, 700, 470, 0.42, { alpha: 0.30, fill: '#5A8390' });
    cloudBank(ctx, 1500, 520, 0.5, { alpha: 0.26, fill: '#5A8390' });

    const pull = 1.04 - 0.04 * smooth(t / d);
    ctx.save();
    ctx.translate(960, 540);
    ctx.scale(pull, pull);
    ctx.translate(-960, -540);

    // 角色压到右三分之一；脚下是一张小的撕边票，全部做剪影
    const cx = 1380, by = 672;
    const f = float(gt, 324, 0.70);
    const b = breath(gt, 324, 0.8);
    const open = backOut(Math.min(1, t / 1.1), 0.8);

    // 票：暗色剪影 + 暖上缘
    ctx.save();
    ctx.translate(cx, by + 6);
    ctx.rotate(-0.03 + Math.sin(gt * 0.7) * 0.008);
    block(ctx, -95, -16, 190, 26, 7, '#2B2327', { stroke: P.ink, lw: 4, seed: 245, amp: 1 });
    ctx.fillStyle = 'rgba(246,201,126,0.6)';
    ctx.fillRect(-95, -16, 190, 4);
    ctx.fillStyle = '#1B3343';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(-95 + 16 + i * 15, -16, 3.4, 0, Math.PI, true);
      ctx.fill();
    }
    ctx.restore();

    // 侧向剪影：面朝左（月亮与海天光带那一侧），双臂张开到最满
    clawdSilhouette(ctx, {
      cx: cx + f.c * 5, by: by + f.s * 3 + b.y * 2 + 2, u: 24,
      faceDir: -1,
      seed: 324,
      rot: -0.08 + Math.sin(gt * 0.9) * 0.022,
      // 前臂伸向月亮、后臂垂在身后：侧身读得出来
      armL: -0.55 - 0.90 * open + 0.06 * f.s2,
      armR: 0.15 + 0.10 * f.s2,
      legs: [0.06, -0.04, -0.06, 0.05],
      // 略窄略高：剪影看起来是侧身，而不是正对镜头
      squash: 1.16 - 0.02 * Math.abs(f.s),
      mouth: 'none',
    });

    // 身后拖一道风：从右往左掠
    ctx.save();
    ctx.globalAlpha = 0.28;
    for (let i = 0; i < 6; i++) {
      const y = 430 + i * 46 + Math.sin(gt * 1.1 + i) * 6;
      const x = ((gt * 620 + i * 300) % 2600) - 300;
      line(ctx, x + 260, y, x + 700, y, { seed: 760 + i, lw: 3, color: '#DCE9EC', amp: 1.2 });
    }
    ctx.restore();
    ctx.restore();

    motes(ctx, gt, 26, { alpha: 0.45, y0: 1000 });
  },
};