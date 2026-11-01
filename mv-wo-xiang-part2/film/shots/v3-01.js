import { splitWorld } from '../src/scenes-verse3.js';
import { clawd, groundShadow } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, glow, clamp, lerp } from '../src/ink.js';
import { breath } from '../src/life.js';
import { face, glance, prep } from '../src/expr-e4.js';
import { walkLegs, settle } from '../src/scenes-verse3a.js';

// v3-01 他到底属于哪？——站在两半世界的分割线上，左右看，两边都不属于它
// 评审 B：全片信息量最大的一镜只有 0.79 秒，分割线一闪就没。
// 这里不改时间码，而是把「合拢」写到镜尾之后：v3-01→v3-02 是 0.50 s 叠化，
// 分镜表里 v3-01 的 transition 已改成「分割线的光 → 叠化合一」触发它。
// 同时拉大左右两半的明度差：左边压成深夜的冷暗，右边加一束从画框外打进来的舞台侧光。
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    splitWorld(ctx, gt);

    // 合拢进度：镜尾之前是 0，进入 v3-02 的那 0.5 s 里 0 → 1
    const close = smooth(clamp((t - d) / 0.5, 0, 1));

    // ---- 左半：城市的夜，压冷压暗 ----
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, 960, 1080);
    ctx.clip();
    ctx.fillStyle = `rgba(4,10,18,${0.44 * (1 - 0.7 * close)})`;
    ctx.fillRect(0, 0, 960, 1080);
    ctx.restore();

    // ---- 右半：舞台，暖起来 ----
    ctx.save();
    ctx.beginPath();
    ctx.rect(960, 0, 960, 1080);
    ctx.clip();
    ctx.fillStyle = `rgba(246,201,126,${0.18 * (1 - 0.55 * close)})`;
    ctx.fillRect(960, 0, 960, 1080);

    // 一束侧光：从右画框外斜打进来，落在舞台地面
    const lamp = ctx.createLinearGradient(1900, 210, 1080, 900);
    lamp.addColorStop(0, 'rgba(247,221,168,0.95)');
    lamp.addColorStop(0.45, 'rgba(246,201,126,0.42)');
    lamp.addColorStop(1, 'rgba(246,201,126,0)');
    ctx.globalAlpha = 0.42 * (1 - 0.45 * close);
    ctx.fillStyle = lamp;
    ctx.beginPath();
    ctx.moveTo(1908, 196);
    ctx.lineTo(1908, 392);
    ctx.lineTo(1204, 946);
    ctx.lineTo(1058, 946);
    ctx.closePath();
    ctx.fill();
    // 灯口本身：右画框边上一个亮点，交代光从哪来
    ctx.globalAlpha = 0.75 * (1 - 0.4 * close);
    glow(ctx, 1908, 292, 260, 'rgba(247,221,168,0.9)', 0.9);
    ctx.restore();

    // 先看左、再看右，最后收回中间（0.79 秒，动作要快但不断）
    // 眼睛先动，身体晚 0.08 秒才跟过去（视线带路）；视线落在左街 / 右舞台 / 自己脚下
    const b = breath(t, { seed: 301, period: 1.3, amp: 0.12, squashAmp: 0.008 });
    const look = glance(t, [
      { t: 0.00, look: 0 },
      { t: 0.10, look: -1.15 },     // 左边：城市的夜
      { t: 0.38, look: 1.10 },      // 右边：舞台侧幕
      { t: 0.68, look: 0.05 },      // 收回来，谁也不是
    ], { dur: 0.09 });
    const l = smooth(clamp((t - 0.04) / 0.16, 0, 1)) * (1 - smooth((t - 0.24) / 0.10));
    const r = smooth(clamp((t - 0.34) / 0.16, 0, 1)) * (1 - smooth((t - 0.60) / 0.09));
    const lB = smooth((t - 0.07) / 0.18) * (1 - smooth((t - 0.29) / 0.11));
    const rB = smooth((t - 0.39) / 0.18) * (1 - smooth((t - 0.62) / 0.10));
    const lean = -0.05 * lB + 0.05 * rB;
    const shuffle = Math.abs(l - r) > 0.25 ? 1 : 0;
    const ph = t * 15;
    const bob = Math.sin(t * 2.4) * 1.2;
    const squash = settle(t, 0.66, 10, 0.055);

    // 自问：先眯着打量两边，最后放松成走神（squint → dazed），嘴从平线爬到不安的波浪。
    // 0.44 的抬眉是 dazed 前的预备；视线先动（0.38）比表情（0.54）早 4 帧。
    const e = face(t, [
      { t: 0.00, eyes: 'squint', mouth: 'flat', brow: null },
      { t: 0.26, eyes: 'squint', mouth: 'flat', brow: 'worried' },
      { t: 0.54, eyes: 'dazed', mouth: 'wavy', brow: 'worried' },
    ], 0.18);

    groundShadow(ctx, 960, 896, 32, { alpha: 0.15, w: 6.4 });
    clawd(ctx, {
      cx: 960, by: 890 + bob, u: 32,
      color: P.orange,
      ...e,
      look,
      browDy: prep(t, 0.44, { amp: 0.28 }),
      seed: 301, rot: lean, squash: squash * b.squash,
      bodyDy: b.bodyDy,
      legs: walkLegs(ph, 0.10 * shuffle),
      armL: -0.15 * lB, armR: -0.15 * rB,
    });

    // 右半舞台地面上有一圈侧光，让“舞台侧幕”读得出来
    glow(ctx, 1480, 880, 420, 'rgba(246,201,126,0.55)', 0.15 + 0.08 * (1 - close));
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = P.lamp;
    ctx.beginPath();
    ctx.ellipse(1480, 880, 300, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ---- 分割线：镜内亮起；镜尾之后（进 v3-02 的 0.5 s）慢慢合拢 ----
    const lit = smooth((t - 0.46) / 0.26);
    if (lit > 0) {
      const widen = smooth(clamp(close / 0.85, 0, 1));
      glow(ctx, 960, 560, 560 + 280 * widen, 'rgba(241,217,168,0.55)', 0.34 * lit * (1 - 0.55 * widen));
      // 缝里透出的光随合拢变宽变淡：不是一刀切掉，是被光吃掉
      const bw = 4 + 11 * widen;
      ctx.save();
      ctx.globalAlpha = (0.55 + 0.2 * widen) * lit * (1 - 0.78 * widen);
      ctx.fillStyle = '#F6E3B4';
      ctx.fillRect(960 - bw, 0, bw * 2, 1080);
      ctx.restore();
      if (close > 0) {
        // 光从缝里往两侧铺开，两半的明度差一起收掉
        const half = lerp(70, 1080, close);
        const spill = ctx.createLinearGradient(960 - half, 0, 960 + half, 0);
        spill.addColorStop(0, 'rgba(246,227,180,0)');
        spill.addColorStop(0.5, `rgba(246,227,180,${0.30 * (1 - close * 0.45)})`);
        spill.addColorStop(1, 'rgba(246,227,180,0)');
        ctx.save();
        ctx.globalAlpha = lit;
        ctx.fillStyle = spill;
        ctx.fillRect(960 - half, 0, half * 2, 1080);
        ctx.restore();
        // 舞台的光越过缝、压到左边这条街上：左半跟着暖起来
        const g2 = ctx.createLinearGradient(980, 0, 340, 0);
        g2.addColorStop(0, `rgba(246,227,180,${0.22 * close})`);
        g2.addColorStop(1, 'rgba(246,227,180,0)');
        ctx.save();
        ctx.globalAlpha = lit;
        ctx.fillStyle = g2;
        ctx.fillRect(340, 0, 640, 1080);
        ctx.restore();
      }
    }
  },
};