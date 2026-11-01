import { seaTop, islandTop, waveCrest, scraps, fgRain } from '../src/polish-chorus-r2.js';
import { motes } from '../src/scenes-chorus23.js';
import { clawd, groundShadow } from '../src/character.js';
import { P } from '../src/palette.js';
import { block, line, clamp } from '../src/ink.js';
import { backOut, breath, beatInfo } from '../src/polish-chorus.js';
import { exprE3, withBlink, dart, browAt } from '../src/expr-e3.js';

// 俯视的车票：从正上方看是一小块被撕边的票
function ticketRaft(ctx, x, y, w, h, gt, o = {}) {
  ctx.save();
  ctx.translate(x, y + Math.sin(gt * 1.1 + (o.phase || 0)) * 4);
  ctx.rotate(-0.04 + Math.sin(gt * 0.6) * 0.01);
  // 水下的影子
  ctx.fillStyle = 'rgba(9,24,32,0.35)';
  ctx.beginPath(); ctx.ellipse(0, 14, w * 0.56, h * 0.62, 0, 0, Math.PI * 2); ctx.fill();
  block(ctx, -w / 2, -h / 2, w, h, 16, o.color || '#E8D5B0', { stroke: P.ink, lw: 6, seed: o.seed || 151, amp: 1.4 });
  // 四周撕齿
  ctx.fillStyle = 'rgba(28,34,40,0.55)';
  const n = 10;
  for (let i = 1; i < n; i++) {
    const px = -w / 2 + (w / n) * i;
    ctx.beginPath(); ctx.arc(px, -h / 2, 6, 0, Math.PI, true); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(px, h / 2, 6, Math.PI, Math.PI * 2); ctx.closePath(); ctx.fill();
  }
  // 票根线 + 印章
  line(ctx, w * 0.24, -h / 2 + 10, w * 0.24, h / 2 - 10, { seed: 152, lw: 3, color: 'rgba(120,100,70,0.5)', amp: 1.2, parts: 4 });
  ctx.beginPath(); ctx.arc(w * 0.36, 0, 13, 0, Math.PI * 2);
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(214,96,116,0.8)'; ctx.stroke();
  ctx.restore();
}

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;

    // 俯拍：整个画面是海，没有地平线，也没有月亮
    seaTop(ctx, gt, { cx: 960, cy: 700 });

    // 岛从水里升起来：远近错开，先远后近
    const rise = (delay, dur) => backOut(clamp((t - delay) / dur, 0, 1), 0.8);
    islandTop(ctx, 300, 380, 1.5, rise(0.05, 1.6), gt, { seed: 731, fill: '#284650', top: '#3D6158' });
    islandTop(ctx, 1560, 300, 1.15, rise(0.35, 1.7), gt, { seed: 732, fill: '#2A4A52', top: '#42665C' });
    islandTop(ctx, 1210, 880, 0.9, rise(0.65, 1.6), gt, { seed: 733, fill: '#25434C', top: '#3B5E54' });
    islandTop(ctx, 560, 960, 0.7, rise(0.95, 1.5), gt, { seed: 734, fill: '#27464F', top: '#3D6158' });

    // 平台 = 海里的一个点
    ticketRaft(ctx, 960, 700, 520, 168, gt, { phase: 2, seed: 151 });

    const bi = beatInfo(gt);
    const pump = Math.exp(-bi.ph * 3.4);
    const dir = bi.inBar % 2 === 0 ? 1 : -1;
    const b = breath(gt, 224, 1.1);
    const sway = Math.sin(gt * 1.0) * 0.03 + dir * pump * 0.04;

    groundShadow(ctx, 960, 726, 26, { alpha: 0.3 });

    // 表情：岛的轮廓浮出来时 wide（惊讶），看清了才 sparkle；视线跟着岛一座座跳。
    const e = withBlink(gt, 224, exprE3(t, [
      { t: 0.00, eyes: 'wide', mouth: 'o', brow: 'up' },
      { t: 1.00, eyes: 'sparkle', mouth: 'grin', brow: null },
      { t: 2.30, eyes: 'happy', mouth: 'grin' },
      { t: 3.10, eyes: 'sparkle', mouth: 'smile' },
    ]));
    const browDy = browAt(t, [
      { at: 0.12, dur: 0.28, amp: 0.14 },
      { at: 0.40, dur: 0.26, amp: 0.10 },
    ]);
    // 岛从 0.05/0.35/0.65/0.95 秒依次升起，眼睛跟着一座座看过去
    const look = dart(t, [
      { t: 0.06, look: -0.50 }, { t: 0.38, look: 0.55 },
      { t: 0.96, look: 0.20 }, { t: 2.20, look: -0.10 },
    ]);

    clawd(ctx, {
      cx: 960, by: 700 + b.y * 3, u: 26,
      color: P.orange,
      ...e, browDy,
      seed: 224,
      look,
      rot: sway,
      armL: -0.5 - (dir > 0 ? pump * 0.5 : 0.15) + b.a * 0.05,
      armR: -0.5 - (dir < 0 ? pump * 0.5 : 0.15) - b.a * 0.05,
      squash: 1 + 0.02 * pump,
    });

    // 前景：最近的一道浪压住下缘
    waveCrest(ctx, 960, 968, 1760, gt, { seed: 735, fill: '#17343F' });
    waveCrest(ctx, 260, 1030, 1100, gt, { seed: 736, fill: '#122C37' });
    fgRain(ctx, gt, 12, { alpha: 0.18, dir: 0, seed: 621 });
    scraps(ctx, gt, 4, { speed: 120, seed: 815, y0: 200, span: 720 });
    motes(ctx, gt, 22, { alpha: 0.35, y0: 1040, speed: 90 });
  },
};