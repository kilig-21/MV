import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { block, line, glow, clamp, smooth, rng } from '../src/ink.js';
import { nightStreaks, stationBox } from '../src/scenes-intro.js';
import { breath, sway } from '../src/life.js';
import { faceE1, dartTrack } from '../src/expr-e1.js';

// h2-01 车厢·窗：站名灯箱一个个掠过，映在脸上，眼睛跟着移动
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;

    const wy = 128, wh = 636;          // 车窗带
    const faceX = 1420, faceY = 750;   // 角色眼睛位置

    // 车厢内：顶棚 + 车窗
    block(ctx, 0, 0, 1920, 1080, 0, '#2A2B2A', { seed: 200 });
    glow(ctx, 960, 96, 420, 'rgba(246,201,126,0.35)', 0.4);
    block(ctx, 0, wy, 1920, wh, 0, '#0D1922', { seed: 202 });

    // 窗外：先压暗的夜城，再让灯箱成为唯一亮物
    nightStreaks(ctx, 0, wy, 1920, wh, t * 0.9, { speed: 300, seed: 63 });
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#0A141A';
    ctx.fillRect(0, wy, 1920, wh);
    ctx.restore();

    // 站名灯箱：从右向左掠过 —— 速度有快慢，间距也不等（不是匀速等距的循环）
    const BASE = 560, AMP = 0.42, OM = 2.2, PH = 1.2;
    const travel = tt => BASE * (tt - (AMP / OM) * (Math.cos(OM * tt + PH) - Math.cos(PH)));
    const TR = travel(t);
    const SPEED_NOW = BASE * (1 + AMP * Math.sin(OM * t + PH));
    const SPAN = 4700, OFF = -760;

    const R = rng(880);
    const pos = [];
    let acc = 900;
    for (let i = 0; i < 6; i++) {
      pos.push({ world: acc, bw: 360 + R() * 130, by: 286 + R() * 54, seed: 900 + i * 17 });
      acc += 540 + R() * 330;              // 间距 540–870 px，不等
    }
    const boxX = (i, tr) => ((pos[i].world - tr) % SPAN + SPAN) % SPAN + OFF;

    const boxes = [];
    for (let i = 0; i < pos.length; i++) {
      const x = boxX(i, TR), bw = pos[i].bw, by = pos[i].by;
      if (x > 2010 || x + bw < -90) continue;
      // 运动拖影：长度跟着当前速度变
      ctx.save();
      ctx.globalAlpha = 0.18;
      stationBox(ctx, x + SPEED_NOW * 0.06, by, bw, 182, pos[i].seed, 0.5);
      ctx.restore();
      stationBox(ctx, x, by, bw, 182, pos[i].seed, 1);
      boxes.push({ c: x + bw / 2, x, bw, by });
    }

    // 窗框
    line(ctx, 0, wy, 1920, wy, { seed: 205, lw: 8, color: P.ink, amp: 1 });
    line(ctx, 0, wy + wh, 1920, wy + wh, { seed: 206, lw: 8, color: P.ink, amp: 1 });
    block(ctx, 0, wy, 26, wh, 0, '#C9B08A', { stroke: P.ink, lw: 5, seed: 207 });
    block(ctx, 1894, wy, 26, wh, 0, '#C9B08A', { stroke: P.ink, lw: 5, seed: 208 });
    block(ctx, 604, wy, 22, wh, 0, '#C9B08A', { stroke: P.ink, lw: 5, seed: 209 });
    block(ctx, 1252, wy, 22, wh, 0, '#C9B08A', { stroke: P.ink, lw: 5, seed: 210 });

    // 眼睛跟随：用 0.1 秒前的灯箱位置形成迟滞
    const lookAtBox = s => {
      const tr = travel(Math.max(0, s - 0.10));
      let best = null;
      for (let i = 0; i < pos.length; i++) {
        const lx = boxX(i, tr) + pos[i].bw / 2;
        if (best === null || Math.abs(lx - faceX) < Math.abs(best - faceX)) best = lx;
      }
      return clamp((best - faceX) / 440, -1, 1);
    };

    // 角色：近景，坐在窗边。夜班车上的困——眼睛走神，只有灯箱掠过时跟着转。
    // 表情两拍：1.55 眼睛从发愣抬成「看」；2.20 又散掉（看了也白看）。
    const f = faceE1(t, [
      { at: 0.00, eyes: 'dazed', mouth: 'flat' },
      { at: 1.55, eyes: 'look', mouth: 'flat', ramp: 0.22 },
      { at: 2.20, eyes: 'dazed', mouth: 'flat', ramp: 0.24 },
    ], { seed: 73, ramp: 0.22, blinkFrom: 0.3, blink: { slot: 1.9, jitter: 0.5, phase: 0.35 } });

    const b = breath(t, { seed: 73, period: 1.65, amp: 0.09 });
    const sw = sway(t, { seed: 73, period: 2.9, armAmp: 0.02, rotAmp: 0.004 });
    const u = 42;
    clawd(ctx, {
      cx: faceX + Math.sin(t * 0.9) * 2 + sw.rot * 160, by: 1002, u,
      color: P.orange,
      eyes: f.eyes,
      // 跟着灯箱，但是「看一眼—再看一眼」：每 0.32 s 才更新一次视线，不是匀速云台
      look: f.blinking ? 0 : dartTrack(t, lookAtBox, { step: 0.32, until: 3.2, lag: 0.12 }),
      mouth: f.mouth,
      brow: f.brow,
      browDy: f.browDy,
      seed: 73,
      bodyDy: b.bodyDy,
      squash: 0.99 * b.squash,
      rot: sw.rot,
      armL: sw.armL, armR: sw.armR,
      legs: [0, -0.1, 0, -0.1],
    });

    // 灯箱扫过时落到脸上的一层光
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const b of boxes) {
      const k = Math.exp(-Math.pow((b.c - faceX) / 300, 2));
      if (k < 0.02) continue;
      const g = ctx.createLinearGradient(b.c - 280, 0, b.c + 280, 0);
      g.addColorStop(0, 'rgba(226,240,220,0)');
      g.addColorStop(0.5, `rgba(226,240,220,${0.14 * k})`);
      g.addColorStop(1, 'rgba(226,240,220,0)');
      ctx.fillStyle = g;
      ctx.fillRect(b.c - 280, 300, 560, 740);
    }
    ctx.restore();

    void faceY;
    void smooth;
  },
};
