import { gramophone } from '../src/scenes-verse3.js';
import { soundWaves, note } from '../src/props.js';
import {
  cityLightsOn, buildingFacade, buildingWindows, streetBand,
  nightSkyline,
} from '../src/scenes-verse3b.js';
import { ripplesBreath } from '../src/polish-v3.js';
import { breath } from '../src/life.js';
import { face, glance, prep } from '../src/expr-e4.js';
import { clawd, groundShadow } from '../src/character.js';
import { P } from '../src/palette.js';
import { nightSky, stars } from '../src/scenes.js';
import { rr, glow, line, smooth, clamp, lerp } from '../src/ink.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;

    // 一路拉远：从唱片的近景，退到整栋楼、整座城
    const k = smooth(clamp((t - 0.3) / 3.2, 0, 1));
    const s = lerp(1.65, 0.22, k);
    const fx = 960;
    const fy = lerp(620, 388, k);
    const rx = fx - 900 * s, ry = fy - 660 * s, rw = 1920 * s, rh = 1080 * s;

    const facadeA = smooth(clamp((1.0 - s) / 0.25, 0, 1));

    // ---- 夜色与城 ----
    nightSky(ctx, { y: 0, h: 1080, top: '#0C1822', mid: '#152833', low: '#1D3744' });
    stars(ctx, { n: 38, h: 520, seed: 151 });
    nightSkyline(ctx);
    cityLightsOn(ctx, t, { from: 1.7, to: 3.5, horizon: 884, seed: 3190 });

    // ---- 楼：拉远后房间成为它顶层的一扇窗 ----
    buildingFacade(ctx, facadeA);
    buildingWindows(ctx, t, facadeA, { cx: 960, cy: 388, start: 2.2 });
    if (facadeA > 0) {
      ctx.save();
      ctx.globalAlpha = facadeA;
      streetBand(ctx, 1012);
      ctx.restore();
    }

    // ---- 房间（剖面）：一直在转的唱片 ----
    ctx.save();
    ctx.beginPath();
    ctx.rect(rx, ry, rw, rh);
    ctx.clip();
    ctx.fillStyle = '#171310';
    ctx.fillRect(rx, ry, rw, rh);
    ctx.translate(fx, fy);
    ctx.scale(s, s);
    ctx.translate(-900, -660);

    gramophone(ctx, gt);
    // 唱片细纹跟着转：转速有极细微的不匀（wow & flutter），不是机器一样匀
    const spin = t * 2.1 + 0.13 * Math.sin(t * 1.35) + 0.045 * Math.sin(t * 5.3 + 1.1);
    ctx.save();
    ctx.translate(900, 660);
    ctx.rotate(spin);
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2 + 0.02 * Math.sin(t * 3.1 + i);
      const r0 = 30 + 1.2 * Math.sin(t * 4.2 + i * 1.7);
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      ctx.lineTo(Math.cos(a) * 82, Math.sin(a) * 82);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(241,217,168,0.35)';
      ctx.stroke();
    }
    ctx.restore();
    // 循环播放的声波：一圈一圈有呼吸感
    ripplesBreath(ctx, 1310, 548, t, {
      count: 5, period: 1.35, r0: 34, r1: 300, flat: 0.62,
      alpha: 0.55, lw: 4, color: 'rgba(241,217,168,0.75)',
    });

    // 桌上的灯，一圈一圈照着
    glow(ctx, 900, 620, 460, 'rgba(246,201,126,0.4)', 0.5 + 0.12 * Math.sin(t * 2.6));
    ctx.restore();

    // ---- 窗框：房间变成亮着的窗 ----
    const frameA = smooth(clamp((0.98 - s) / 0.2, 0, 1));
    if (frameA > 0) {
      ctx.save();
      ctx.globalAlpha = frameA;
      // 窗台的光溢到楼下
      glow(ctx, fx, ry + rh + 40, rw * 0.55, 'rgba(246,201,126,0.6)', 0.20);
      rr(ctx, rx - 12, ry - 12, rw + 24, rh + 24, 8, 3430, 1);
      ctx.lineWidth = 14; ctx.strokeStyle = P.ink; ctx.lineJoin = 'round'; ctx.stroke();
      rr(ctx, rx + 4, ry + 4, rw - 8, rh - 8, 4, 3431, 1);
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(246,201,126,0.75)'; ctx.stroke();
      ctx.restore();
    }

    // ---- 声波越过窗户，包住整栋楼：周期和亮度都会呼吸 ----
    ripplesBreath(ctx, fx, fy, t, {
      start: 0.95, period: 2.1, count: 4, r0: 120, r1: 1600,
      flat: 0.66, alpha: 0.34, lw: 6, color: 'rgba(246,201,126,0.85)',
    });

    // 窗外，一直听着的那个人
    const manA = smooth(clamp((0.62 - s) / 0.12, 0, 1));
    if (manA > 0) {
      const mb = breath(t, { seed: 3195, period: 1.65, amp: 0.16, squashAmp: 0.012 });
      // 结尾抬头看自己那扇亮着的窗：闭眼 → 睁眼 → 仰头，和 h1-01 的抬头成对
      const up = smooth(clamp((t - 3.05) / 0.45, 0, 1));
      // 留声机的释然：闭着眼听 → 睁圆眼、张嘴抬头。视线先抬到左上角那扇窗（3.18），
      // 眉 3.12 先抬一下；0.24 秒的过渡，收尾不硬切。
      const look = glance(t, [
        { t: 0.00, look: 0.00 },
        { t: 3.18, look: -0.45 },
      ], { dur: 0.12 });
      const e = face(t, [
        { t: 0.00, eyes: 'closed', mouth: 'smile', brow: null },
        { t: 3.34, eyes: 'wide', mouth: 'o', brow: 'up' },
      ], 0.24);
      ctx.save();
      ctx.globalAlpha = manA;
      groundShadow(ctx, 1652, 1014, 16, { alpha: 0.28, w: 5.4 });
      clawd(ctx, {
        cx: 1652 + 1.6 * Math.sin(t * 1.1), by: 1014 - up * 1.6, u: 16,
        color: P.orange,
        ...e,
        look,
        browDy: prep(t, 3.12, { amp: 0.34 }),
        seed: 3195,
        legs: [0, -0.1, 0, -0.1],
        squash: mb.squash + up * 0.01,
        bodyDy: mb.bodyDy - up * 0.5,
        rot: 0.02 * Math.sin(t * 0.85 + 0.6) - up * 0.055,
      });
      ctx.restore();
    }

    // 飘出来的音符
    if (s < 0.7) {
      const na = smooth(clamp((0.7 - s) / 0.15, 0, 1));
      for (let i = 0; i < 2; i++) {
        const ph = ((t * 0.32 + i * 0.5) % 1);
        ctx.save();
        ctx.globalAlpha = na * (1 - ph) * 0.6;
        note(ctx, rx + rw * (0.18 + i * 0.12) + Math.sin(ph * 6) * 12,
          ry + rh * 0.35 - ph * 160, 14, '#F1D9A8');
        ctx.restore();
      }
    }

    // 收尾的一点点暖光
    ctx.save();
    ctx.globalAlpha = 0.16 * facadeA;
    glow(ctx, 960, 470, 760, 'rgba(246,201,126,0.5)', 1);
    ctx.restore();
  },
};