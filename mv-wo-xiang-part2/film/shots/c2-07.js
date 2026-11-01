import { islandTopView, cloudPuff } from '../src/polish-chorus-r2.js';
import { motes, pillow, quilt } from '../src/scenes-chorus23.js';
import { clawd, zzz } from '../src/character.js';
import { P } from '../src/palette.js';
import { glow, clamp, smooth } from '../src/ink.js';
import { keys, breath } from '../src/polish-chorus.js';
import { exprE3, withBlink, dart } from '../src/expr-e3.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;

    // 俯拍：不画地平线，整块画面是一层云海，岛浮在云上
    ctx.fillStyle = '#162B36';
    ctx.fillRect(0, 0, 1920, 1080);
    for (let i = 0; i < 7; i++) {
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = i % 2 ? '#2C4A56' : '#24414D';
      ctx.beginPath();
      ctx.ellipse(((i * 380 + gt * 12) % 2200) - 140, 120 + (i % 3) * 260, 420, 130, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // 云层里透出的一点冷光
    glow(ctx, 420, 240, 520, 'rgba(190,220,225,0.5)', 0.12);
    glow(ctx, 1500, 820, 560, 'rgba(246,201,126,0.5)', 0.1);

    // 岛外还有两座小的，告诉观众这是一片浮岛
    islandTopView(ctx, 210, 210, 330, 190, gt, { seed: 941, rim: '#2C4A44', top: '#5B7150' });
    islandTopView(ctx, 1720, 890, 300, 180, gt, { seed: 942, rim: '#2C4A44', top: '#5B7150' });

    // 主岛慢慢推近
    const push = 1 + 0.05 * smooth(t / d);
    ctx.save();
    ctx.translate(960, 600);
    ctx.scale(push, push);
    ctx.translate(-960, -600);

    islandTopView(ctx, 960, 640, 1260, 610, gt, { seed: 943 });

    // 枕头
    pillow(ctx, 960, 470, 420, 78);

    // 躺下：比 c1 干脆，几乎立刻倒
    const sleep = keys(t, [[0.0, 0.08], [0.5, 0.7], [1.1, 1.0]]);
    const by = 782 + sleep * 14;
    const u = 40;
    const b = breath(gt, 226, 0.7);

    // 表情：第二遍更笃定——笑着看一眼枕头，几乎立刻软下来闭眼。
    const e = withBlink(gt, 226, exprE3(t, [
      { t: 0.00, eyes: 'happy', mouth: 'grin' },
      { t: 0.55, eyes: 'happy', mouth: 'smile' },
      { t: 1.05, eyes: 'tired', mouth: 'smile' },
      { t: 1.50, eyes: 'closed', mouth: 'smile' },
      { t: 2.30, eyes: 'closed', mouth: 'flat' },
    ]));
    const look = dart(t, [
      { t: 0.05, look: 0.40 }, { t: 0.70, look: 0.05 }, { t: 1.45, look: 0.00 },
    ]);

    clawd(ctx, {
      cx: 960, by: by + b.y * 2.2,
      u,
      color: P.orange,
      ...e,
      seed: 226,
      blush: true,
      look,
      legs: [0, 0.14, 0, 0.14],
      armL: -0.2 - 0.18 * sleep,
      armR: -0.2 - 0.18 * sleep,
      squash: 1 - sleep * 0.05 + b.squash * 0.5,
    });

    // 被子盖到腿上
    quilt(ctx, 960, by + 6, 16.4 * u, 4.0 * u);

    // 云被盖住身体：两团云从两侧压过来，最后盖住腰以下
    cloudPuff(ctx, 830, by + 12 + Math.sin(gt * 0.8) * 4, 1.15, gt, { alpha: 0.9 * (0.35 + 0.65 * sleep) });
    cloudPuff(ctx, 1100, by + 28 + Math.sin(gt * 0.9 + 1) * 5, 1.25, gt, { alpha: 0.85 * (0.3 + 0.7 * sleep) });
    if (t > 1.5) zzz(ctx, 1210, by - 8.6 * u, 34, gt, clamp((t - 1.5) / 0.4, 0, 1) * 0.9, '#F1D9A8');

    // 前景：贴在镜头前的一角云，压住下缘
    cloudPuff(ctx, 340, 1010 + Math.sin(gt * 0.6) * 10, 2.1, gt, { alpha: 0.75, fill: '#C6D1C8' });
    cloudPuff(ctx, 1600, 1030 + Math.sin(gt * 0.7 + 1) * 9, 1.8, gt, { alpha: 0.7, fill: '#BFCBC2' });
    ctx.restore();

    motes(ctx, gt, 20, { alpha: 0.35, y0: 1060, speed: 60 });

    // 尾段白光起：给下一镜「醒」留一条自然的接缝
    const flash = smooth((t - (d - 0.34)) / 0.34);
    if (flash > 0) {
      ctx.save();
      ctx.globalAlpha = flash * 0.9;
      ctx.fillStyle = '#F1D9A8';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }
  },
};