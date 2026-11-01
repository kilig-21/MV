import { clawd } from '../src/character.js';
import { headphones } from '../src/props.js';
import { P } from '../src/palette.js';
import { block, line, poly, smooth, lerp, clamp, curve, glow } from '../src/ink.js';
import { breath, sway } from '../src/life.js';
import { face, prep, dart, styleSwap } from '../src/expr-e2.js';
import { pulse } from '../src/polish-v2.js';
import { eyesAt, easeTo } from '../src/fix-round3b.js';

// v2-17 骄傲：机位换轴 30°，站到屋子右侧墙角斜看过去——海报变成画面主体，
// 父亲与同事错开半个身位、一大一小。父亲先看海报（下巴先低一帧做预备），
// 再抬眼看、张嘴说；两下拍同事肩膀；同事跟着抬头。两人的眼型必须分得开。

const POSTER = { x: 1150, y: 112, w: 646, h: 616 };

// 儿子海报（画在这里，尺寸由本镜决定；里面的 Clawd 仍按官方 15×16 比例）
function poster(ctx, x, y, w, h) {
  const seed = 2600;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(-0.008);
  ctx.translate(-(x + w / 2), -(y + h / 2));
  block(ctx, x - 16, y - 16, w + 32, h + 32, 6, '#8E6A52', { stroke: P.ink, lw: 8, seed });
  // 米色卡纸衬边：一眼看出这是"印出来的海报"，不是窗户
  block(ctx, x, y, w, h, 2, '#E8DCC4', { stroke: P.ink, lw: 4, seed: seed + 8 });
  block(ctx, x + 18, y + 18, w - 36, h - 36, 2, '#25373F', { stroke: P.ink, lw: 4, seed: seed + 1 });
  ctx.save();
  ctx.beginPath(); ctx.rect(x + 18, y + 18, w - 36, h - 36); ctx.clip();
  // 海报里的暖色背景光
  glow(ctx, x + w * 0.48, y + h * 0.5, w * 0.62, 'rgba(246,201,126,0.5)', 0.5);
  // 舞台光
  poly(ctx, [[x + w * 0.18, y], [x + w * 0.54, y], [x + w * 0.36, y + h], [x - w * 0.05, y + h]],
    { fill: 'rgba(246,201,126,0.16)', stroke: false });
  // 舞台边
  block(ctx, x, y + h * 0.80, w, h * 0.2, 0, '#22343C', { seed: seed + 2 });
  const pu = (w * 0.56) / 15;
  clawd(ctx, {
    cx: x + w * 0.48, by: y + h * 0.84, u: pu,
    color: P.orange, eyes: 'happy', mouth: 'grin', blush: true, seed: seed + 3,
    armL: -1.25, armR: -0.15,
  });
  // 麦克风
  // 麦克风握在举起的那只短臂上（就是画面左侧那只手）
  const mx = x + w * 0.48 - pu * 7.5;
  const my = y + h * 0.84 - pu * 8.3;
  block(ctx, mx - pu * 0.6, my, pu * 1.2, pu * 3.4, pu * 0.55, '#2C2F36',
    { stroke: P.ink, lw: Math.max(3, pu * 0.2), seed: seed + 4 });
  block(ctx, mx - pu * 0.8, my - pu * 1.3, pu * 1.6, pu * 1.3, pu * 0.6, '#C9A46B',
    { stroke: P.ink, lw: Math.max(3, pu * 0.2), seed: seed + 5 });
  // 标题条
  block(ctx, x + w * 0.1, y + h * 0.885, w * 0.5, h * 0.034, 4, '#F2E3C6', { seed: seed + 6 });
  block(ctx, x + w * 0.1, y + h * 0.935, w * 0.32, h * 0.021, 4, 'rgba(242,227,198,0.7)', { seed: seed + 7 });
  ctx.restore();
  // 玻璃反光
  ctx.save();
  ctx.globalAlpha = 0.09;
  poly(ctx, [[x + 40, y + h], [x + w * 0.36, y], [x + w * 0.46, y], [x + w * 0.14, y + h]],
    { fill: '#DDEEF2', stroke: false });
  ctx.restore();
  ctx.restore();
}

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    // 极慢推进海报：镜头自己也在靠近，整镜不会是一张死图
    const push = 1.0 + 0.055 * smooth(t / d);
    ctx.save();
    ctx.translate(1500, 420);
    ctx.scale(push, push);
    ctx.translate(-1500, -420);

    // ---- 墙角：左墙正面、右墙稍亮（海报挂在这面），地面线跟着抬高 ----
    ctx.fillStyle = '#87694F'; ctx.fillRect(0, 0, 1920, 1080);
    for (let i = 0; i < 8; i++) line(ctx, i * 240, 0, i * 240, 1080, { seed: 4200 + i, lw: 2, color: '#7B5F47', amp: 2 });
    ctx.fillStyle = '#96755A'; ctx.fillRect(1092, 0, 828, 1080);
    for (let i = 0; i < 4; i++) line(ctx, 1180 + i * 200, 0, 1180 + i * 200, 1080, { seed: 4210 + i, lw: 2, color: '#8A6A4F', amp: 2 });
    line(ctx, 1092, 0, 1092, 1080, { seed: 4219, lw: 6, color: P.ink });
    // 地面
    block(ctx, 0, 884, 1920, 196, 0, '#5E4636');
    line(ctx, 0, 884, 1092, 884, { seed: 4220, lw: 6, color: P.ink });
    line(ctx, 1092, 866, 1920, 820, { seed: 4221, lw: 6, color: P.ink });

    // ---- 左墙上的两张家常照片 + 挂衣钩：把左边的空墙填住 ----
    for (let i = 0; i < 2; i++) {
      const fx = 150 + i * 168, fy = 286 + i * 26;
      block(ctx, fx, fy, 126, 152, 3, '#5E4636', { stroke: P.ink, lw: 5, seed: 4230 + i });
      block(ctx, fx + 12, fy + 12, 102, 128, 2, '#E8DCC4', { seed: 4240 + i });
      ctx.beginPath(); ctx.arc(fx + 46, fy + 62, 19, 0, Math.PI * 2); ctx.fillStyle = i ? '#93AE7C' : '#DE886D'; ctx.fill();
      ctx.beginPath(); ctx.arc(fx + 46, fy + 104, 26, 0, Math.PI * 2); ctx.fillStyle = i ? '#93AE7C' : '#DE886D'; ctx.fill();
      ctx.beginPath(); ctx.arc(fx + 78, fy + 74, 15, 0, Math.PI * 2); ctx.fillStyle = '#E8A0A8'; ctx.fill();
      ctx.beginPath(); ctx.arc(fx + 78, fy + 104, 21, 0, Math.PI * 2); ctx.fillStyle = '#E8A0A8'; ctx.fill();
    }
    // ---- 海报（这一镜的主体）----
    poster(ctx, POSTER.x, POSTER.y, POSTER.w, POSTER.h);
    const lit = smooth((t - 0.35) / 0.7);
    glow(ctx, POSTER.x + POSTER.w / 2, POSTER.y + POSTER.h * 0.5, 520, 'rgba(246,201,126,0.5)', 0.20 + 0.22 * lit);

    // ---- 父亲：左、近、大 ----
    const chin = pulse(t - 0.10, 0.14);                  // 预备：下巴先低一下
    const turn = smooth((t - 0.26) / 0.22);              // 身体转向海报（眼睛用 fg，早 0.10 s）
    const turnBody = smooth((t - 0.36) / 0.26);          // 身体后到
    const tap1 = pulse(t - 1.00, 0.16);
    const tap2 = pulse(t - 1.28, 0.16);
    const tap = tap1 + tap2;
    const proud = smooth((t - 1.72) / 0.3);
    const bf = breath(t, { seed: 202, period: 2.0, amp: 0.12 });
    const sf = sway(t, { seed: 202, period: 3.3, armAmp: 0.028 });
    const rotF = 0.02 + turnBody * 0.13 + tap * 0.015 + bf.bodyDy * 0.02 + sf.rot;
    // 父亲：先抿笑看海报 → 0.30 s 眉抬起来做预备 → 0.66 s 张嘴说 → 1.54 s 收回笑
    const ef = face(t, [
      { t: 0.00, mouth: 'smile', brow: null },
      { t: 0.30, brow: 'up' },
      { t: 0.66, mouth: 'o' },
      { t: 1.54, mouth: 'smile' },
    ], { ramp: 0.14, seed: 202, blink: false });
    const cxF = 476 + turnBody * 12;
    const byF = 872;
    const uF = 31;
    const squashF = bf.squash;
    clawd(ctx, {
      cx: cxF, by: byF, u: uF, color: P.sage, seed: 202,
      eyes: 'none',
      mouth: ef.mouth,
      brow: ef.brow,
      browDy: prep(t, [0.66], { antic: 0.12, dur: 0.30, amp: 0.28 }),
      blush: true,
      look: 0,
      bodyDy: bf.bodyDy - chin * 0.16 - turnBody * 0.16 + tap * 0.03,
      squash: squashF,
      armR: -0.05 - turnBody * 0.90 + tap * 1.45 + sf.armR,
      armL: 0.10 + sf.armL,
      rot: rotF,
    });
    // 下巴先低一帧做预备 → 眼睛「啪」地转向海报 → 头才跟过去（眼比头早 0.10 s）
    const fg = clamp(dart(t, [{ t: 0.00, look: 0 }, { t: 0.36, look: 1 }], { dur: 0.10 }), 0, 1);
    eyesAt(ctx, {
      cx: cxF, by: byF, u: uF, rot: rotF, squash: squashF, body: P.sage,
      style: 'open',
      yaw: lerp(0.15, 0.86, fg),
      pitch: lerp(0.30, -0.92, fg) + chin * 0.2,
      lid: lerp(0.30, 0.0, fg) * (1 - proud * 0.4),
      wide: 0.96 + proud * 0.08,
    });

    // ---- 同事：右、远、小半号 ----
    const collar = smooth((t - 1.14) / 0.20);
    const follow = smooth((t - 1.24) / 0.22);
    const bob = Math.sin(t * Math.PI * 2 * 1.05);
    const bc = breath(t, { seed: 203, period: 2.4, amp: 0.10 });
    const sc = sway(t, { seed: 203, period: 2.2, armAmp: 0.022 });
    const rotC = 0.01 + follow * 0.11 + sc.rot;
    // 同事：本来笑着耷眼 → 跟着抬头，嘴 1.36 s 张开，眼睛同一拍换成「睁着」
    const ec = face(t, [
      { t: 0.00, mouth: 'none' },
      { t: 1.36, mouth: 'o' },
    ], { ramp: 0.14, blink: false });
    const cxC = 930 + follow * 8;
    const byC = 858;
    const uC = 26;
    const squashC = bc.squash;
    clawd(ctx, {
      cx: cxC, by: byC, u: uC, color: '#9A9498', seed: 203,
      eyes: 'none',
      mouth: ec.mouth,
      look: 0,
      bodyDy: bc.bodyDy + bob * 0.09 * (1 - follow) - collar * 0.10,
      squash: squashC,
      armL: sc.armL - collar * 0.5, armR: sc.armR - collar * 0.45,
      rot: rotC,
    });
    // 耳机一直在头上（上一镜戴上，这一镜没摘）
    headphones(ctx, cxC, byC - 9 * uC, uC, { color: P.tealDeep });
    const cg = clamp(dart(t, [{ t: 0.00, look: 0 }, { t: 1.32, look: 1 }], { dur: 0.10 }), 0, 1);
    eyesAt(ctx, {
      cx: cxC, by: byC, u: uC, rot: rotC, squash: squashC, body: '#9A9498',
      style: styleSwap(t, 1.34, 'smile', 'open'),
      yaw: lerp(0.0, 0.74, cg),
      pitch: lerp(0.1, -0.86, cg),
      lid: 0,
      wide: 0.92 + cg * 0.12,
    });
    ctx.restore();
  },
};
