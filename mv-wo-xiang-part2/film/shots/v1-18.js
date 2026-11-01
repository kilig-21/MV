import { bedroom, bedBlanket } from '../src/scenes.js';
import { clawd } from '../src/character.js';
import { soundWaves } from '../src/props.js';
import { P } from '../src/palette.js';
import { smooth, lerp, poly } from '../src/ink.js';
import { breathe, sway, gesture } from '../src/polish-v1.js';
import { faceE1, dart } from '../src/expr-e1.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const d = shot.t1 - shot.t0;
    const s = smooth(t / d);

    // 评审 B：v1-17 / v1-18 是同一间屋、同一机位、同一站位。这一镜直接换轴：
// 从床尾往唱片机那边慢推（起点就已经是偏左的取景，切进来就看得出换了机位）。
    const z = 1.10 + 0.24 * s;
    ctx.save();
    ctx.translate(820, 780);
    ctx.scale(z, z);
    ctx.translate(-820, -780);

    const m = bedroom(ctx, gt, {});

    // 唱片在转：一道很轻的高光在盘面上走
    const spin = (t * 0.9) % 1;
    ctx.save();
    ctx.beginPath(); ctx.arc(m.record.x, m.record.y, 40, 0, Math.PI * 2); ctx.clip();
    ctx.globalAlpha = 0.10;
    ctx.strokeStyle = P.lamp;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(m.record.x - 40, m.record.y - 20 + spin * 40);
    ctx.lineTo(m.record.x + 40, m.record.y - 26 + spin * 40);
    ctx.stroke();
    ctx.restore();

    // 声波从唱片升起
    soundWaves(ctx, m.record.x, m.record.y, 15, gt, { count: 6 });
    // 朝床这边多压过来两层：这个声音是给它的
    ctx.save();
    ctx.globalAlpha = 0.16;
    for (let i = 0; i < 2; i++) {
      const k = ((t * 0.35 + i * 0.5) % 1);
      ctx.beginPath();
      ctx.lineWidth = 4 * (1 - k * 0.5);
      ctx.strokeStyle = P.lamp;
      ctx.arc(m.record.x, m.record.y, 120 + k * 460, -Math.PI * 0.62, -Math.PI * 0.06);
      ctx.stroke();
    }
    ctx.restore();

    // Black God：从唱片长出的声波剪影，不具象成人；会呼吸、会朝床倾
    // （声波柱整体右移，新的取景才不会把它切在画外）
    const rise = smooth((t - 0.25) / 1.2);
    const pulse = 0.82 + 0.18 * Math.sin(t * 1.35);
    if (rise > 0) {
      ctx.save();
      ctx.globalAlpha = 0.40 * rise;
      ctx.strokeStyle = P.ink;
      ctx.lineCap = 'round';
      ctx.translate(150, 0);
      ctx.rotate(0.05 * rise);          // 整体朝床的方向倾
      for (let i = 0; i < 9; i++) {
        const x = 60 + i * 30;
        const h = (96 + Math.sin(t * 2.1 + i * 1.1) * 44 + i * 22) * rise * pulse;
        ctx.lineWidth = 11 + (i % 3) * 2;
        ctx.beginPath();
        ctx.moveTo(x, 770);
        ctx.lineTo(x + i * 1.5, 770 - h);
        ctx.stroke();
      }
      // 最中间一条有一点暖色芯
      ctx.globalAlpha = 0.40 * rise;
      ctx.strokeStyle = '#C9A96E';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(200, 770);
      ctx.lineTo(206, 770 - (200 + Math.sin(t * 1.8) * 46) * rise);
      ctx.stroke();
      ctx.restore();

      // 影子向床爬：越到后面越近
      const creep = smooth((t - 0.9) / 1.3);
      ctx.save();
      ctx.globalAlpha = 0.22 * rise * (0.4 + 0.6 * creep);
      poly(ctx, [
        [170, 800], [570 + creep * 260, 800], [650 + creep * 300, 1080], [110, 1080],
      ], { fill: '#080D12', stroke: false });
      ctx.restore();
    }

    // 坐在床上：看着，不笑；呼吸在压迫感最强时停半拍
    const shock = smooth((t - 1.42) / 0.12) * (1 - smooth((t - 1.9) / 0.3));
    const br = breathe(t, 70, 24, { amp: 0.14 * (1 - shock * 0.6) });
    const grip = gesture(t, 1.5, 0.2, { pre: 0.14, over: 0.05 }) * (1 - smooth((t - 2.0) / 0.3));
    const recoil = smooth((t - 1.45) / 0.16) * (1 - smooth((t - 1.95) / 0.3));

    const f = faceE1(t, [
      { at: 0.00, eyes: 'normal', mouth: 'flat' },
      { at: 1.42, eyes: 'wide', mouth: 'o', ramp: 0.10 },        // 影子立起来
      { at: 1.90, eyes: 'tired', mouth: 'flat', brow: 'worried', ramp: 0.22 },
      { at: 2.50, eyes: 'dazed', mouth: 'none', ramp: 0.22 },
    ], { seed: 70, ramp: 0.18, blinkFrom: 0.9, noBlinkIn: [[1.38, 1.98], [2.4, 2.8]] });

    const look = f.blinking ? 0 : dart(t, [
      { t: 0.00, look: -0.90 },
      { t: 1.32, look: -0.65 },
      { t: 2.18, look: 0.15 },
    ], { dur: 0.12 });

    const u = lerp(26, 22, s);
    const by = m.bed.top + 6 - br;
    clawd(ctx, {
      cx: 1430 - recoil * 8, by: by + recoil * 3, u,
      color: P.orange,
      eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
      look,
      seed: 70,
      armL: -0.08 - 0.5 * grip,
      armR: sway(t, 71, { amp: 0.04 }) + recoil * 0.1,
      legs: [0, -0.04, 0, -0.04],
      rot: -0.03 - recoil * 0.015 + smooth((t - 2.2) / 0.4) * 0.02,
      squash: 0.998 - shock * 0.012 + recoil * 0.01,
    });

    // 被子盖住下半身
    bedBlanket(ctx, m.bed, { y: m.bed.top - 60 + br * 0.5, h: 220 });

    // 海报灯光映进眼睛
    const sparkle = smooth((t - 0.7) / 0.9) * (0.6 + 0.4 * Math.sin(t * 1.5 + 0.4));
    if (sparkle > 0.05) {
      ctx.save();
      ctx.globalAlpha = 0.85 * sparkle;
      ctx.fillStyle = P.lamp;
      for (const dx of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(1430 - recoil * 8 + dx * u * 3 + u * 0.4, by + recoil * 3 - u * 6.15, u * 0.16, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.restore();

    // 最后半秒压暗，收进夜色
    const dim = smooth((t - (d - 0.7)) / 0.6);
    if (dim > 0) {
      ctx.save();
      ctx.globalAlpha = 0.55 * dim;
      ctx.fillStyle = '#0E1720';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }
  },
};