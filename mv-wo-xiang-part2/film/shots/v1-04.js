import { deskRoom } from '../src/scenes2.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, block, line, glow } from '../src/ink.js';
import { breathe, sway, gesture, weightShift } from '../src/polish-v1.js';
import { faceE1, dart } from '../src/expr-e1.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const d = shot.t1 - shot.t0;
    deskRoom(ctx, gt);

    // 屏幕的冷光落在桌上和它身上；扣下手机后这层光退掉
    const screenOn = 1 - smooth((t - 1.18) / 0.35);
    glow(ctx, 1365, 560, 620, 'rgba(205,231,238,0.30)', 0.25 + 0.35 * screenOn);
    glow(ctx, 1365, 560, 300, 'rgba(205,231,238,0.45)', 0.18 * screenOn);

    const f = faceE1(t, [
      { at: 0.00, eyes: 'look', mouth: 'none' },
      { at: 0.26, eyes: 'wide', mouth: 'o', ramp: 0.12 },        // 看到余额的瞬间
      { at: 1.16, eyes: 'tired', mouth: 'flat', ramp: 0.18 },
      { at: 2.24, eyes: 'dazed', mouth: 'none', brow: 'worried', ramp: 0.22 },
    ], { seed: 84, ramp: 0.18, blinkFrom: 0.9 });

    // 伸右手：先预备 → 推 → 收回；每个动作都有尾巴
    const reach = gesture(t, 0.64, 0.22, { pre: 0.14, over: 0.06 });
    const push = gesture(t, 1.02, 0.16, { pre: 0.12, over: 0.05 });
    const back = smooth((t - 1.34) / 0.32);
    const armR = -0.08 - 0.78 * reach * (1 - back * 0.8) - 0.26 * push * (1 - back * 0.9);

    // 呼气：肩膀落下去一点，身体慢慢沉
    const exhale = smooth((t - 1.7) / 0.55);
    const bob = breathe(t, 84, 20, { amp: 0.2 });
    const shift = weightShift(t, 84, { amp: 2.2 });
    // 视线：余额 → 桌面 → 那碗没拆的泡面（左边）
    const look = f.blinking ? 0 : dart(t, [
      { t: 0.00, look: 0.92 },
      { t: 0.26, look: 0.95 },
      { t: 1.20, look: 0.80 },
      { t: 2.18, look: -0.85 },
    ], { dur: 0.10 });

    clawd(ctx, {
      cx: 960 + shift + exhale * 2, by: 400 - bob + exhale * 2.2,
      u: 20,
      color: P.orange,
      eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
      look,
      seed: 84,
      armR,
      armL: sway(t, 85, { amp: 0.05 }),
      rot: 0.014 * smooth((t - 0.5) / 0.3) * (1 - smooth((t - 1.2) / 0.3)),
      squash: 1 - exhale * 0.012,
    });

    // 手机被扣下：先盖住场景里的那部，再画一部能动、会轻轻一磕的
    const dim = smooth((t - 1.3) / 0.4);
    if (dim > 0) {
      ctx.save();
      // 遮住原手机所在的桌面
      ctx.fillStyle = '#A87E5E';
      ctx.fillRect(1246, 416, 240, 388);
      for (const y of [420, 530, 640, 750]) line(ctx, 1246, y, 1486, y, { seed: 780 + y, lw: 2, color: '#96704F', amp: 2 });

      const tilt = -0.035 * dim + Math.sin((t - 1.3) * 26) * 0.02 * (1 - dim);
      ctx.translate(1365, 610);
      ctx.rotate(tilt);
      ctx.translate(-1365, -610 - 4 * dim);
      block(ctx, 1260, 430, 210, 360, 26, '#2C2F36', { stroke: P.ink, lw: 6, seed: 800 });
      block(ctx, 1276, 448, 178, 324, 16, '#2C2F36', { stroke: P.ink, lw: 3, seed: 801 });
      // 扣下的一线反光
      ctx.save();
      ctx.globalAlpha = 0.10 * dim;
      ctx.fillStyle = '#DCE9EC';
      ctx.fillRect(1284, 462, 60, 296);
      ctx.restore();
      ctx.restore();

      // 「咔」的一声：很短的一下震动线
      const hit = Math.max(0, 1 - Math.abs(t - 1.42) / 0.09);
      if (hit > 0) {
        ctx.save();
        ctx.globalAlpha = 0.5 * hit;
        ctx.strokeStyle = P.ink;
        ctx.lineWidth = 4;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1]]) {
          ctx.beginPath();
          ctx.moveTo(1470 + dx * 10, 780 + dy * 10);
          ctx.lineTo(1470 + dx * 26, 780 + dy * 20);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // 合同下露出旧相机的一角 —— 衔接到抽屉那一镜
    const peek = smooth((t - 1.96) / 0.4);
    if (peek > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(770, 640, 120, 180);
      ctx.clip();
      ctx.globalAlpha = 0.95 * peek;
      ctx.translate(760, 742);
      ctx.rotate(0.16);
      block(ctx, -40, -30, 120, 86, 12, '#2C2F36', { stroke: P.ink, lw: 5, seed: 872 });
      ctx.beginPath(); ctx.arc(48, 14, 28, 0, Math.PI * 2); ctx.fillStyle = '#3A3D44'; ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = P.ink; ctx.stroke();
      ctx.restore();
    }
  },
};