import { bedroom, bedBlanket } from '../src/scenes.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, lerp, poly } from '../src/ink.js';
import { breathe, sway, gesture } from '../src/polish-v1.js';
import { faceE1, dart } from '../src/expr-e1.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const d = shot.t1 - shot.t0;

    // 从上一镜的黑里慢慢亮起来（不是硬切）
    const wakeLight = smooth(t / 0.4);

    // 中景转近景：整幅轻微推近，带一点手持漂移
    const z = lerp(1.0, 1.13, smooth(t / d));
    ctx.save();
    ctx.translate(1400 + Math.sin(t * 0.8) * 3, 620);
    ctx.scale(z, z);
    ctx.translate(-1400, -620);

    const m = bedroom(ctx, gt, {});

    const br = breathe(t, 110, 23, { amp: 0.14 });
    // 睁眼之后身子轻轻一抬，是这一镜唯一的「醒」动作
    const wake = smooth((t - 0.78) / 0.16) * (1 - smooth((t - 1.15) / 0.35));
    const armGrip = gesture(t, 0.6, 0.18, { pre: 0.12, over: 0.06 }) * (1 - smooth((t - 1.0) / 0.3));
    const push = gesture(t, 1.70, 0.24, { pre: 0.16, over: 0.06 }) * (1 - smooth((t - 2.05) / 0.35));
    const sink = smooth((t - 2.02) / 0.5);

    // 切进来先闭眼，中间一次极轻的眼睑抽动（0.05 s 的小过渡，不是硬切）；
    // 0.80 睁开——wide 撑一下再慢慢垮回 tired，最后走神。
    const f = faceE1(t, [
      { at: 0.00, eyes: 'closed', mouth: 'none' },
      { at: 0.20, eyes: 'squint', mouth: 'none', brow: 'worried', ramp: 0.05 },  // 睡梦里的眼睑抽动
      { at: 0.28, eyes: 'closed', mouth: 'none', ramp: 0.05 },
      { at: 0.80, eyes: 'wide', mouth: 'none', ramp: 0.16 },                     // 睁开
      { at: 1.44, eyes: 'tired', mouth: 'none', ramp: 0.20 },
      { at: 2.02, eyes: 'dazed', mouth: 'flat', brow: 'worried', ramp: 0.22 },
    ], { seed: 110, ramp: 0.18, blinkFrom: 1.3, noBlinkIn: [[0.70, 1.12], [1.95, 2.45]] });

    // 视线：睁眼时先看天花板 → 向右上方转到海报并停住 → 垂回自己的手
    const look = f.blinking ? 0 : dart(t, [
      { t: 0.00, look: 0.15 },
      { t: 0.88, look: -0.95 },
      { t: 2.02, look: 0.10 },
    ], { dur: 0.12 });

    // 躺着：床上坐着的一小只，被子盖住下半身；呼吸带着被子起伏
    clawd(ctx, {
      cx: 1430, by: m.bed.top + 6 - br * 0.5 + wake * 2 + sink * 1.5, u: 23,
      color: P.orange,
      eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
      look,
      seed: 110,
      armL: -0.1 - 0.45 * armGrip - 0.6 * push,
      armR: sway(t, 111, { amp: 0.04 }) + wake * 0.1,
      legs: [0, -0.05, 0, -0.05],
      rot: -0.03 - 0.012 * smooth((t - 0.95) / 0.4) + 0.012 * sink,
      squash: 0.998 + wake * 0.012 - sink * 0.008,
    });

    // 被子：跟着呼吸和推被子的动作
    bedBlanket(ctx, m.bed, { y: m.bed.top - 60 + br * 0.6 - push * 8, h: 220 });

    // 海报上的街头灯光：慢慢扫过海报（车灯）
    const sweep = smooth((t - 1.25) / 1.2);
    ctx.save();
    ctx.beginPath();
    ctx.rect(m.poster.x, m.poster.y, m.poster.w, m.poster.h);
    ctx.clip();
    ctx.globalAlpha = 0.16 * (0.4 + 0.6 * Math.sin(sweep * Math.PI));
    poly(ctx, [
      [m.poster.x - 60 + sweep * 300, m.poster.y],
      [m.poster.x + 40 + sweep * 300, m.poster.y],
      [m.poster.x - 20 + sweep * 300, m.poster.y + m.poster.h],
      [m.poster.x - 120 + sweep * 300, m.poster.y + m.poster.h],
    ], { fill: '#F6C97E', stroke: false });
    ctx.restore();

    // 海报的光映在它眼里：随车灯扫过而亮一下（睁眼后才看得见）
    const reflect = smooth((t - 1.0) / 0.8) * (0.5 + 0.5 * Math.sin(t * 1.6 + 0.5));
    if (reflect > 0.05) {
      const ex = 1430;
      const ey = m.bed.top + 6 - br * 0.5 - 23 * 6.15;
      ctx.save();
      ctx.globalAlpha = 0.75 * reflect;
      ctx.fillStyle = P.lamp;
      for (const dx of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(ex + dx * 23 * 3 + 23 * 0.4, ey, 23 * 0.16, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 唱片那边先冒一点声波，接下一镜
    const pre = smooth((t - 2.3) / 0.45);
    if (pre > 0) {
      ctx.save();
      ctx.globalAlpha = 0.20 * pre;
      ctx.strokeStyle = P.lamp;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(m.record.x, m.record.y, 34, -Math.PI * 0.95, -Math.PI * 0.05);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(m.record.x, m.record.y, 52, -Math.PI * 0.9, -Math.PI * 0.1);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();

    // 从头一下的黑里亮起来
    if (wakeLight < 1) {
      ctx.save();
      ctx.globalAlpha = 0.85 * (1 - wakeLight);
      ctx.fillStyle = '#0C1116';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }
  },
};