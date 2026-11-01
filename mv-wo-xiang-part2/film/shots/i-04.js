import { carriage } from '../src/scenes.js';
import { P } from '../src/palette.js';
import { block, line, clamp, smooth, lerp, easeOut } from '../src/ink.js';

// i-04 车厢内：空车厢、灯管闪、座位上有别人留下的报纸；车门开，风把报纸吹起来
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    const m = carriage(ctx, gt, { scroll: gt * 26 });

    // 灯管闪两下（开门前）
    const dim = (t > 0.42 && t < 0.58) || (t > 0.72 && t < 0.81) ? 0.22 : 0;

    // 风不是匀速推：门一开先探一下，然后两次大的，最后一次把报纸整个卷走
    const gustAt = (a, up, down) => smooth((t - a) / up) * (1 - smooth((t - a - up) / down));
    const g1 = gustAt(1.40, 0.14, 0.36);
    const g2 = gustAt(2.22, 0.18, 0.52);
    const g3 = gustAt(2.92, 0.24, 1.20);
    const windNow = clamp(g1 * 0.6 + g2 * 0.85 + g3, 0, 1.4);

    // 位移是「走—停—走」的台阶，不是一条匀速坡
    const s1 = easeOut(clamp((t - 1.46) / 0.50, 0, 1));
    const s2 = easeOut(clamp((t - 2.28) / 0.46, 0, 1));
    const s3 = easeOut(clamp((t - 2.98) / 0.80, 0, 1));
    const blow = clamp(0.16 * s1 + 0.34 * s2 + 0.50 * s3, 0, 1);
    // 风里的细颤：只在有风的时候出现
    const tremor = windNow * (Math.sin(t * 23.1) * 0.018 + Math.sin(t * 41.7 + 1.3) * 0.011);
    const px = lerp(680, 322, blow) + Math.sin(t * 3.1) * 14 * blow + tremor * 520;
    const py = lerp(688, 232, blow) - Math.sin(blow * Math.PI) * 58 + tremor * 260;
    // 翻页：一阵风翻一下，节奏是碎的
    const flapK = clamp((0.35 * g1 + 0.60 * g2 + 0.95 * g3) * (0.55 + 0.45 * Math.sin(t * 18.3 + 0.4)), 0, 1);
    const rot = -0.06 + blow * 1.32 + 0.14 * g1 + 0.24 * g2 + 0.36 * g3 + windNow * 0.06 * Math.sin(t * 15.7 + 0.6);

    // 车门：从中间向两侧滑开
    const open = easeOut(clamp((t - 1.35) / 0.6, 0, 1));
    const doorX = 1210, doorY = 186, doorW = 210, doorH = 540, mid = doorX + doorW / 2;
    const gap = doorW * open;

    if (gap > 0.5) {
      // 门外：站台/夜里的隧道，冷光
      ctx.save();
      ctx.beginPath(); ctx.rect(doorX, doorY, doorW, doorH); ctx.clip();
      ctx.fillStyle = '#16262F'; ctx.fillRect(doorX, doorY, doorW, doorH);
      // 站台墙面
      ctx.fillStyle = '#3E6873'; ctx.fillRect(doorX, doorY + doorH * 0.62, doorW, doorH * 0.38);
      ctx.fillStyle = '#8FA9A2'; ctx.fillRect(doorX, doorY + doorH * 0.62, doorW, 8);
      // 站台地面 + 黄线
      ctx.fillStyle = '#5E514E'; ctx.fillRect(doorX, doorY + doorH * 0.74, doorW, doorH * 0.26);
      ctx.fillStyle = '#C9A24E'; ctx.fillRect(doorX, doorY + doorH * 0.74, doorW, 5);
      // 掠过的灯
      const sx = doorX + ((t * 240) % doorW);
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#E9F0E4';
      ctx.fillRect(sx, doorY + 40, 30, doorH - 120);
      ctx.globalAlpha = 0.18;
      ctx.fillRect(sx - 14, doorY + 20, 58, doorH - 80);
      ctx.restore();

      // 两扇门叶滑进墙里（裁在门洞内）
      ctx.save();
      ctx.beginPath(); ctx.rect(doorX, doorY, doorW, doorH); ctx.clip();
      const halfW = doorW / 2;
      for (const side of [-1, 1]) {
        const x = side < 0 ? mid - gap / 2 - halfW : mid + gap / 2;
        block(ctx, x, doorY, halfW, doorH, 4, '#DCC49C', { stroke: P.ink, lw: 6, seed: 91 + side });
        block(ctx, x + halfW * 0.3, doorY + 232, halfW * 0.4, 132, 6, '#3E7C92', { stroke: P.ink, lw: 4, seed: 93 + side });
        // 门缝阴影
        const edge = side < 0 ? x + halfW - 3 : x;
        ctx.fillStyle = 'rgba(35,34,39,0.28)';
        ctx.fillRect(edge, doorY, 3, doorH);
      }
      ctx.restore();
      block(ctx, doorX, doorY, doorW, doorH, 4, null, { stroke: P.ink, lw: 6, seed: 95 });
    }

    // 门里漏进来的冷光落到地面
    if (open > 0) {
      ctx.save();
      ctx.globalAlpha = 0.10 * open;
      ctx.fillStyle = '#9FC3CE';
      ctx.beginPath();
      ctx.moveTo(doorX, 726); ctx.lineTo(doorX + doorW, 726);
      ctx.lineTo(doorX + doorW + 260, 1080); ctx.lineTo(doorX - 260, 1080);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    // 风线：只在起风的那几拍出现
    if (open > 0.2) {
      ctx.save();
      for (let i = 0; i < 6; i++) {
        const yy = 240 + i * 90 + Math.sin(t * 7 + i) * 8;
        const x0 = doorX - 20 - ((t * (500 + i * 60) + i * 180) % 900);
        ctx.globalAlpha = open * (0.06 + 0.30 * Math.min(1, windNow)) * (0.7 + 0.3 * Math.sin(i * 2.1));
        line(ctx, x0, yy, x0 - (70 + 60 * Math.min(1, windNow)), yy - 6, { seed: 300 + i, lw: 2.4, color: '#DDE9EA', amp: 1.2 });
      }
      ctx.restore();
    }

    // 报纸（折页 + 几行灰字；右半页会被风吹得翻起来）
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rot);
    block(ctx, -92, -58, 184, 116, 4, '#EDE4D0', { stroke: P.ink, lw: 4, seed: 41 });
    line(ctx, 0, -56, 0, 56, { seed: 44, lw: 2, color: '#B9AC93' });
    for (let r = 0; r < 5; r++) {
      ctx.fillStyle = '#A99C84';
      ctx.fillRect(-74, -40 + r * 18, 58, 5);
    }
    ctx.fillStyle = '#8E8170';
    ctx.fillRect(-74, -52, 52, 8);
    if (flapK > 0.04) {
      // 右半页向中缝折过去：水平压缩，背面略亮
      ctx.save();
      ctx.beginPath(); ctx.rect(1, -62, 96, 124); ctx.clip();
      ctx.scale(Math.max(0.05, 1 - 0.82 * flapK), 1);
      block(ctx, 0, -58, 92, 116, 4, flapK > 0.25 ? '#F4EDDC' : '#EDE4D0', { stroke: P.ink, lw: 4, seed: 41 });
      for (let r = 0; r < 5; r++) {
        ctx.fillStyle = '#A99C84';
        ctx.fillRect(12, -40 + r * 18, 66, 5);
      }
      ctx.restore();
    }
    ctx.restore();

    if (dim > 0) {
      ctx.save();
      ctx.globalAlpha = dim;
      ctx.fillStyle = '#0C141A';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }
  },
};
