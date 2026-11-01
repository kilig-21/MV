import { skyCloud } from '../src/scenes-verse2.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, block, line, glow, poly, clamp } from '../src/ink.js';
import { breath, sway } from '../src/life.js';
import { face, dart } from '../src/expr-e2.js';
import { eyesAt, cloudSlab, easeTo, c01 } from '../src/fix-round3b.js';

// v2-03 城市上空：他抬头看那盏暖色的灯，云带压过来，灯被盖住又露出来。
// 云改成两层横向云带（上暗下亮、边缘 1–2 px 抖动），下面露出灯杆与灯头，光从灯头往外打。
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    const m = skyCloud(ctx, gt);
    const lampX = m.lamp.x, lampY = m.lamp.y;

    // ---- 路灯：灯头（skyCloud 已画的那个暖色圆）+ 灯杆 + 灯罩 ----
    // 杆从屋顶竖上来，灯头朝上，光往上打 —— 所以他"想看见的太阳"其实是这盏灯
    block(ctx, lampX - 11, lampY + 34, 22, 931 - lampY - 34, 8, '#26363F',
      { stroke: P.ink, lw: 5, seed: 2110 });
    block(ctx, lampX - 34, 931 - 26, 68, 26, 6, '#1B2A32', { stroke: P.ink, lw: 4, seed: 2111 });
    // 灯罩：压在灯头上方
    poly(ctx, [[lampX - 74, lampY - 44], [lampX + 74, lampY - 44], [lampX + 40, lampY - 104], [lampX - 40, lampY - 104]],
      { fill: '#33454E', stroke: P.ink, lw: 5, seed: 2112 });
    block(ctx, lampX - 8, lampY - 112, 16, 10, 4, '#26363F', { stroke: P.ink, lw: 3, seed: 2113 });
    // 灯杆上的两圈铁箍
    line(ctx, lampX - 11, 640, lampX + 11, 640, { seed: 2114, lw: 3, color: '#14232A' });
    line(ctx, lampX - 11, 806, lampX + 11, 806, { seed: 2115, lw: 3, color: '#14232A' });

    // 光从灯头往上铺：两道很淡的扇形
    ctx.save();
    ctx.globalAlpha = 0.16;
    poly(ctx, [[lampX - 46, lampY - 14], [lampX + 46, lampY - 14], [lampX + 210, 40], [lampX - 210, 40]],
      { fill: '#F6C97E', stroke: false });
    ctx.restore();

    // ---- 云：两层横向云带，从右往左飘过灯 ----
    const ax = 1500 - smooth(t / d) * 2400;      // 上层云带左端
    const cover = clamp(
      smooth((lampX - ax) / 260) * smooth((ax + 1000 - lampX) / 260), 0, 1);
    // 下层云带稍晚、稍低、亮一点
    const bx = ax - 300;
    cloudSlab(ctx, { x0: bx, x1: bx + 1180, yTop: 432, h: 236, seed: 2140, fill: '#2A3F4C', light: '#3E5969', alpha: 0.92, rim: '#6D8794', rimAlpha: 0.14, phase: 1.1 });
    cloudSlab(ctx, { x0: ax, x1: ax + 1000, yTop: 264, h: 224, seed: 2130, fill: '#22343F', light: '#31495A', alpha: 0.96, rim: '#5C7684', rimAlpha: 0.18 });
    // 云被灯从下往上照到的一小片暖边（只在没盖住灯的时候）
    ctx.save();
    ctx.globalAlpha = 0.20 * (1 - cover);
    glow(ctx, lampX, lampY + 130, 320, 'rgba(246,201,126,0.6)', 1);
    ctx.restore();

    // 被遮住时：城市暗一档
    if (cover > 0.01) {
      ctx.save();
      ctx.globalAlpha = 0.30 * cover;
      ctx.fillStyle = '#0A151C';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }

    // ---- 屋顶：抬高到画面下缘 0.86 的地面线上 ----
    block(ctx, 0, 929, 790, 151, 0, '#132029', { seed: 205 });
    line(ctx, 0, 930, 790, 930, { seed: 206, lw: 4, color: '#2C4652' });
    block(ctx, 596, 902, 96, 28, 4, '#1A2A33', { stroke: P.ink, lw: 3, seed: 207 });   // 屋顶的通气口

    // ---- 他：眼睛先到，身体再到 ----
    // 云压下来 → 先垂眼（0.08 s）→ 身体才沉（0.12 s 后）→ 云开 → 先抬眼 → 再挺身
    const sink = easeTo(t, 0, 1, 0.92, 0.34) - easeTo(t, 0, 1, 1.80, 0.30);
    const lift = easeTo(t, 0, 1, 1.88, 0.24);
    const dimNow = c01(sink) * (1 - c01(lift));
    const b = breath(t, { seed: 205, period: 1.7, amp: 0.13 });
    const s = sway(t, { seed: 205, armAmp: 0.03 });
    const rot = 0.05 + dimNow * 0.05 - lift * 0.02 + s.rot;
    const cx = 330, by = 931, u = 24;
    const squash = b.squash;
    // 表情：云压下来时不是「啪」一下变苦脸 —— 0.16 s 过渡进 flat/皱眉，灯露出来再松开
    const e = face(t, [
      { t: 0.00, mouth: 'none', brow: null },
      { t: 0.92, brow: 'worried' },           // 3 帧预备：眉先皱
      { t: 1.06, mouth: 'flat' },             // 嘴才跟上
      { t: 1.98, mouth: 'o', brow: null },
    ], { ramp: 0.16, blink: false });
    // 视线：抬眼盯着灯 → 云盖住时视线啪地掉下来 → 云开时再啪地抬回去
    // （1.0 是消化性的中间点，不回到完全垂眼，所以云开的「抬回去」才读得出来）
    const up = clamp(dart(t, [{ t: 0.10, look: 1 }, { t: 1.10, look: 0.25 }, { t: 1.96, look: 0.98 }], { dur: 0.14 }), 0, 1);
    const pitch = 0.75 - 1.6 * up;
    clawd(ctx, {
      cx, by, u,
      color: P.orange,
      eyes: 'none',
      mouth: e.mouth,
      brow: e.brow,
      browDy: dart(t, [{ t: 0.10, look: 0 }, { t: 0.94, look: -0.30 }, { t: 1.40, look: 0 }], { dur: 0.12 }),
      look: 0,
      rot,
      bodyDy: b.bodyDy + dimNow * 0.24 - lift * 0.06,
      squash,
      seed: 205,
      armL: -0.1 - lift * 0.45 + s.armL,
      armR: 0.06 + s.armR,
    });
    eyesAt(ctx, {
      cx, by, u, rot, squash, body: P.orange,
      style: 'open',
      yaw: 0.55 - dimNow * 0.25,
      pitch,                       // 负 = 抬眼看向灯
      lid: dimNow * 0.34,
      wide: 1 + lift * 0.12,
    });
  },
};