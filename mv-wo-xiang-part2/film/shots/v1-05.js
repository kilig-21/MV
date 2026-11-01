import { drawer } from '../src/scenes2.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, clamp } from '../src/ink.js';
import { breathe, gesture } from '../src/polish-v1.js';
import { faceE1, dart } from '../src/expr-e1.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const d = shot.t1 - shot.t0;
    const m = drawer(ctx, gt);

    // 手臂：抬起预备 → 伸进抽屉 → 下压 → 松手 → 收回
    const reach = gesture(t, 0.26, 0.24, { pre: 0.16, over: 0.06, settle: 0.2 });
    const press = gesture(t, 0.52, 0.18, { pre: 0.12, over: 0.04, settle: 0.16 });
    const back = smooth((t - 0.76) / 0.34);
    const armL = -0.35 - 0.95 * reach * (1 - back * 0.86) - 0.2 * press * (1 - back);
    const idle = breathe(t, 86, 36, { amp: 0.12 });

    // 两处：伸手摸到相机（眼睛先到）→ 放下、抽屉合上前的疲惫
    const f = faceE1(t, [
      { at: 0.00, eyes: 'normal', mouth: 'none' },
      { at: 0.56, eyes: 'look', mouth: 'none', ramp: 0.16 },
      { at: 1.24, eyes: 'tired', mouth: 'none', ramp: 0.20 },
    ], { seed: 86, ramp: 0.18, blinkFrom: 0.3 });

    clawd(ctx, {
      cx: 2070, by: 1040 + idle * 0.4, u: 36,
      color: P.orange,
      eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
      seed: 86,
      armL,
      armR: 0,
      look: f.blinking ? 0 : dart(t, [
        { t: 0.00, look: -1.00 },
        { t: 0.60, look: -0.86 },
        { t: 1.20, look: -1.00 },
      ], { dur: 0.10 }),
    });

    // 放下时的一小团灰：不是特效，是抽屉里的旧灰
    const dust = clamp((t - 0.6) / 0.5, 0, 1);
    if (dust > 0 && dust < 1) {
      ctx.save();
      for (let i = 0; i < 6; i++) {
        const k = clamp((dust - i * 0.05) / 0.6, 0, 1);
        if (k <= 0) continue;
        ctx.globalAlpha = 0.22 * (1 - k);
        ctx.fillStyle = '#C6A57E';
        ctx.beginPath();
        ctx.arc(700 + i * 26 + Math.sin(i * 2.1 + t * 3) * 14, 760 - k * (26 + i * 7), 3 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 相机落定：一圈很轻的震动线
    const settle = Math.max(0, 1 - Math.abs(t - 0.72) / 0.12);
    if (settle > 0) {
      ctx.save();
      ctx.globalAlpha = 0.28 * settle;
      ctx.strokeStyle = P.ink;
      ctx.lineWidth = 3;
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(610 + dir * 96, 752);
        ctx.lineTo(610 + dir * 120, 758);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 抽屉关上：光被切成一条缝，缝最后消失
    const close = smooth((t - 1.08) / 0.55);
    if (close > 0) {
      ctx.save();
      ctx.globalAlpha = close;
      ctx.fillStyle = '#2A2320';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.globalAlpha = (1 - close) * 0.75;
      ctx.fillStyle = P.lamp;
      ctx.fillRect(150, 150, 1620, 60);
      // 被挤压的光缝
      ctx.globalAlpha = 0.55 * close;
      ctx.fillStyle = P.lamp;
      ctx.fillRect(150, 800 + 40 * close, 1620, Math.max(0, 22 * (1 - close)));
      ctx.restore();

      // 合上的「咔」：一次短促的暗部回弹
      const clack = Math.max(0, 1 - Math.abs(t - 1.52) / 0.1);
      if (clack > 0) {
        ctx.save();
        ctx.globalAlpha = 0.35 * clack;
        ctx.fillStyle = '#0C0A08';
        ctx.fillRect(0, 0, 1920, 1080);
        ctx.restore();
      }
    }
  },
};