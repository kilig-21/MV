import { gym } from '../src/scenes2.js';
import { clawd, drop, heartFloat } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth } from '../src/ink.js';
import { bounce } from '../src/polish-v1.js';
import { faceE1, dart } from '../src/expr-e1.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const d = shot.t1 - shot.t0;
    const m = gym(ctx, gt);

    // 越跑越慢：步频从 13 降到 10.4，步幅也变小
    const ph = t < 1.1 ? t * 13 : 1.1 * 13 + (t - 1.1) * 10.4;
    const fatigue = smooth((t - 1.9) / 0.6);
    const amp = 0.28 - fatigue * 0.11;
    const slip = smooth((t - 0.78) / 0.07) * (1 - smooth((t - 0.9) / 0.12));
    const catchUp = bounce(t, 0.98, { dur: 0.26, amp: 1 });
    const runBob = Math.abs(Math.sin(ph)) * (6 - fatigue * 2.6);
    const by = m.beltY + 6 - runBob + slip * 8 - catchUp * 2;

    // 跑步机皮带在脚下走
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#3A4247';
    for (let i = 0; i < 9; i++) {
      const x = 1000 + ((t * 230 + i * 96) % 760);
      ctx.fillRect(x, 552, 34, 5);
    }
    ctx.restore();

    // 表情：累 → 打滑 → 倔 → 更累
    const f = faceE1(t, [
      { at: 0.00, eyes: 'tired', mouth: 'wavy' },
      { at: 0.78, eyes: 'wide', mouth: 'o', ramp: 0.10 },
      { at: 1.05, eyes: 'tired', mouth: 'flat', brow: 'angry', ramp: 0.18 },
      { at: 2.30, eyes: 'squint', mouth: 'pout', ramp: 0.20 },
    ], { seed: 106, ramp: 0.18, blinkFrom: 0.55, noBlinkIn: [[0.74, 1.06]] });

    const look = f.blinking ? 0 : dart(t, [
      { t: 0.00, look: 0.10 },
      { t: 1.64, look: 0.90 },
      { t: 2.02, look: 0.15 },
    ], { dur: 0.11 });

    const flail = slip * 0.45 + catchUp * 0.12;
    clawd(ctx, {
      cx: 1250 + Math.sin(ph * 2) * 1.2, by, u: 24,
      color: P.orange,
      eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
      look,
      seed: 106,
      legs: [
        Math.sin(ph) * amp + slip * 0.3,
        -Math.sin(ph) * amp - slip * 0.16,
        Math.sin(ph + 1.2) * amp,
        -Math.sin(ph + 1.2) * amp - catchUp * 0.08,
      ],
      armL: -0.2 + Math.sin(ph) * 0.18 - flail,
      armR: -0.2 - Math.sin(ph) * 0.18 - flail,
      rot: slip * 0.03 - 0.004 * fatigue,
      squash: 1 + slip * 0.02 - catchUp * 0.008 + Math.sin(ph * 2) * 0.006,
    });

    // 汗：三股，节奏不同，落到底消失
    for (let i = 0; i < 3; i++) {
      const k = ((t * (0.85 + i * 0.12) + i * 0.31) % 1);
      const dx = 140 + i * 26 + k * (30 + i * 8);
      drop(ctx, 1250 + dx, by - 120 + k * (250 - i * 30), 8 * (1 - k * 0.35));
    }
    // 打滑那一下的一滴大汗
    if (slip > 0.2) {
      ctx.save(); ctx.globalAlpha = 0.8 * slip;
      drop(ctx, 1250 - 92, by - 150 - slip * -6, 11);
      ctx.restore();
    }

    // 计时器数字跳，心率小图标跟着跳
    const sec = 47 + Math.floor(t);
    ctx.save();
    ctx.fillStyle = '#8FE0C8';
    ctx.font = '700 54px NotoSansSC';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('00:' + String(sec).padStart(2, '0'), 1560, 385);
    ctx.restore();
    const beat = Math.max(0, 1 - Math.abs(((t * 1.25) % 1) - 0.3) / 0.28);
    heartFloat(ctx, 1476, 372, 11 + beat * 3, '#E0566E', 0.55 + beat * 0.4);

    // 镜子里只有它自己：比本体慢半拍，模糊、发灰
    ctx.save();
    ctx.beginPath(); ctx.rect(m.mirror.x, m.mirror.y, m.mirror.w, m.mirror.h); ctx.clip();
    ctx.globalAlpha = 0.20;
    ctx.filter = 'blur(4px)';
    const mph = (t - 0.1) < 1.1 ? (t - 0.1) * 13 : 1.1 * 13 + (t - 0.1 - 1.1) * 10.4;
    clawd(ctx, {
      cx: 420, by: 620 - Math.abs(Math.sin(mph)) * 4, u: 22,
      color: '#E8B49E',
      eyes: f.eyes, mouth: f.mouth, brow: f.brow,
      look: -0.2,
      seed: 107,
      legs: [
        Math.sin(mph) * amp, -Math.sin(mph) * amp,
        Math.sin(mph + 1.2) * amp, -Math.sin(mph + 1.2) * amp,
      ],
      armL: -0.2 + Math.sin(mph) * 0.18,
      armR: -0.2 - Math.sin(mph) * 0.18,
      squash: 1 + Math.sin(mph * 2) * 0.006,
    });
    ctx.restore();

    // 最后把目光引向屏幕：为下一镜的手机留一口气
    const green = smooth((t - 2.15) / 0.5);
    if (green > 0) {
      ctx.save();
      ctx.globalAlpha = 0.10 * green;
      ctx.fillStyle = '#8FE0C8';
      ctx.fillRect(1380, 300, 380, 260);
      ctx.restore();
    }
  },
};