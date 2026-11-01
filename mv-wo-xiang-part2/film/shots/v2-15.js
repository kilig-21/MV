import { stage } from '../src/scenes.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, block, line } from '../src/ink.js';
import { breath, sway } from '../src/life.js';
import { face } from '../src/expr-e2.js';
import {
  dustMotes, sideLeg, wedgeMonitor, floorUplight, floorGloss,
  audienceRow, audienceFront,
} from '../src/detail-r2.js';

// 台下的七只：身高、站位、举手时机都不一样；看的方向也不齐
const FANS = [
  { x: 180, by: 1058, u: 12.4, c: P.sage, at: 0.7, side: -1, seed: 190, look: 0.25 },
  { x: 420, by: 1066, u: 13.6, c: P.lav, at: 1.5, side: 1, seed: 191, look: -0.7 },
  { x: 660, by: 1052, u: 12.0, c: P.pink, at: 0.35, side: -1, seed: 192, look: 0.15 },
  { x: 980, by: 1062, u: 13.2, c: P.lav, at: 1.9, side: 1, seed: 193, look: 0.3 },
  { x: 1220, by: 1050, u: 12.2, c: P.sage, at: 1.1, side: -1, seed: 194, look: 0.1 },
  { x: 1460, by: 1068, u: 13.8, c: P.pink, at: 0.55, side: 1, seed: 195, look: -0.55 },
  { x: 1700, by: 1056, u: 12.6, c: P.mustard, at: 1.7, side: -1, seed: 196, look: 0.35 },
];

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    stage(ctx, gt, { flash: 0 });

    // 近景侧幕：比后墙的幕布更暗，左右各压一道，画面才有前中后
    sideLeg(ctx, -1, { w: 132, color: '#4A2922', seed: 501 });
    sideLeg(ctx, 1, { w: 132, color: '#4A2922', seed: 502 });

    // 观众席后排：高低起伏的剪影，中间夹着举手机和侧头说话的
    audienceRow(ctx, {
      t, x0: 20, x1: 1900, n: 13, baseY: 1042,
      hMin: 92, hMax: 170, seed: 1201, phone: 0.3,
      color: '#080D11', rim: 'rgba(150,178,190,0.22)',
    });

    // 主唱：跟着两拍点头，左右手轮流举，最后一句把两手摊开
    const beat = Math.sin(t * Math.PI * 2 * 2.0);
    const nod = Math.abs(beat);
    const armSwitch = smooth((t - 0.6) / 0.3) * (1 - smooth((t - 1.6) / 0.3));
    const both = smooth((t - 1.55) / 0.35);
    const b = breath(t, { seed: 183, period: 1.2, amp: 0.12 });
    const s = sway(t, { seed: 183, period: 1.0, armAmp: 0.04 });
    // 主唱：一直笑眼，唱到「不是儿戏」那一句嘴才张开，一句唱完收回笑
    const e = face(t, [
      { t: 0.00, eyes: 'happy', mouth: 'grin' },
      { t: 1.18, mouth: 'o' },
      { t: 1.54, mouth: 'grin' },
    ], { ramp: 0.12, seed: 183, blink: false });
    clawd(ctx, {
      cx: 960,
      by: 800,
      u: 17,
      color: P.orange,
      ...e,
      seed: 183,
      bodyDy: b.bodyDy - nod * 0.12,
      squash: b.squash,
      armL: -0.5 - armSwitch * 0.45 - both * 0.2 + s.armL,
      armR: -0.5 - (1 - armSwitch) * 0.15 - both * 0.2 + s.armR,
      rot: -0.01 + nod * 0.02 + s.rot,
      legs: [0, -0.04 * nod, 0, -0.04 * nod],
    });

    // 麦克风架：靠近嘴部，让「说唱不是儿戏」有具体的舞台物件
    line(ctx, 1160, 780, 1160, 716, { seed: 205, lw: 6, color: P.ink });
    line(ctx, 1160, 716, 1110, 734, { seed: 206, lw: 5, color: P.ink });
    block(ctx, 1086, 724, 42, 30, 12, '#3A3A3E', { stroke: P.ink, lw: 3, seed: 207 });
    block(ctx, 1130, 770, 60, 12, 6, '#3A3A3E', { stroke: P.ink, lw: 3, seed: 208 });

    // 台面反光：追光池里几道很轻的横向高光
    floorGloss(ctx, { cx: 960, y: 806, w: 680, seed: 655 });

    // 舞台前沿的返送音箱：两只楔形，朝向主唱
    wedgeMonitor(ctx, 604, 826, 210, 74, 1, 601);
    wedgeMonitor(ctx, 1322, 832, 220, 78, -1, 621);

    // 地灯：左右各一盏，向上打一小束光，把台口照亮
    floorUplight(ctx, 366, 812, t, 631);
    floorUplight(ctx, 1556, 816, t, 641);

    // 台下：各举各的手，不齐
    FANS.forEach((p, i) => {
      const raise = smooth((t - p.at) / 0.3);
      const fan = breath(t, { seed: p.seed, period: 1.3 + (i % 3) * 0.25, amp: 0.12 });
      const fs = sway(t, { seed: p.seed, period: 2.0 + i * 0.2, armAmp: 0.05 });
      // 台下七只：抬手的动作本身不同步，眼型和嘴也各自 0.14 s 过渡，不会齐刷刷一起张
      const fe = face(t, [
        { t: 0.00, eyes: 'dot', mouth: 'none' },
        { t: p.at + 0.10, eyes: 'wide' },
        { t: p.at + 0.18, mouth: 'o' },
      ], { ramp: 0.14, seed: p.seed });
      clawd(ctx, {
        cx: p.x,
        by: p.by + (1 - raise) * 4,
        u: p.u,
        color: p.c,
        ...fe,
        look: p.look,
        seed: p.seed,
        bodyDy: fan.bodyDy,
        squash: fan.squash,
        armL: p.side < 0 ? -1.25 * raise + fs.armL : fs.armL,
        armR: p.side > 0 ? -1.25 * raise + fs.armR : fs.armR,
        rot: fs.rot,
      });
    });

    // 最前排只露头顶的剪影，压在彩色观众前面，把「台下」拉出纵深
    audienceFront(ctx, { t, baseY: 1122, xs: [140, 470, 760, 1110, 1380, 1640, 1850], seed: 1701 });

    // 空气里的浮尘：只在追光锥里被照出来，很轻
    dustMotes(ctx, { t, cx: 960, y0: 150, y1: 770, wTop: 140, wBot: 420, count: 62, seed: 991 });
  },
};