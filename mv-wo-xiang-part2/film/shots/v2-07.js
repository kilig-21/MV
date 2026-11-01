import { streetCrowd } from '../src/scenes-verse2.js';
import { clawd } from '../src/character.js';
import { phone, letter } from '../src/props.js';
import { P } from '../src/palette.js';
import { smooth, clamp, block, line } from '../src/ink.js';
import { breath, blink, sway, expr } from '../src/life.js';
import { pulse } from '../src/polish-v2.js';
import { eyesAt, easeTo, bump } from '../src/fix-round3b.js';

// 满街的忙人等馅饼。
// 三条反应链，绝不齐：
//   左 3 只先抬头（0.28 / 0.40 / 0.52，每只错开 0.12）
//   中 4 只晚 0.4 秒（0.68 / 0.80 / 0.92 / 1.04），其中一只侧身躲开落下的传单
//   右 2 只全程低头看手机（"忙人"本意）
// 另外两只伸手去接、没接住 —— 肩膀垮下来。

const CROWD = [
  // ---- 左 ----
  { x: 104, by: 908, u: 15.2, c: P.sage, react: 0.28, rot: 0.05, yaw: -0.30, seed: 161, mode: 'up' },
  { x: 330, by: 872, u: 13.6, c: P.lav, react: 0.40, rot: 0.10, yaw: -0.15, seed: 162, mode: 'up', reach: 1.52, bag: true },
  { x: 556, by: 912, u: 16.0, c: P.pink, react: 0.52, rot: -0.06, yaw: 0.22, seed: 163, mode: 'up', yawn: 0.86 },
  // ---- 中（晚 0.4 s）----
  { x: 764, by: 860, u: 13.4, c: P.mustard, react: 0.68, rot: 0.07, yaw: 0.05, seed: 164, mode: 'up' },
  { x: 950, by: 898, u: 14.9, c: P.sage, react: 0.80, rot: -0.08, yaw: -0.35, seed: 165, mode: 'up', dodge: 1.48 },
  { x: 1132, by: 874, u: 14.2, c: P.lav, react: 0.92, rot: 0.11, yaw: 0.30, seed: 166, mode: 'up', reach: 1.66 },
  { x: 1306, by: 910, u: 16.4, c: P.pink, react: 1.04, rot: 0.03, yaw: 0.08, seed: 167, mode: 'up' },
  // ---- 右：一直低头看手机 ----
  { x: 1552, by: 888, u: 15.0, c: P.mustard, react: -1, rot: -0.03, yaw: 0.0, seed: 169, mode: 'phone' },
  { x: 1752, by: 872, u: 13.9, c: P.lav, react: -1, rot: 0.04, yaw: 0.0, seed: 170, mode: 'phone' },
];

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    streetCrowd(ctx, gt);

    // 传单：各自不同的下落速度与摆动，不同时到地
    for (let i = 0; i < 7; i++) {
      const spd = 0.38 + (i % 3) * 0.08;
      const k = (t * spd + i / 7) % 1;
      const x = 520 + i * 145 + Math.sin(i * 2.1 + t * 1.3) * 90;
      const y = 210 + k * 600;
      letter(ctx, x, y, 12, {
        rot: Math.sin(t * 1.7 + i * 1.9) * 0.7,
        color: '#E8D5B0', seed: i, stamp: true,
      });
    }

    CROWD.forEach((p, i) => {
      const b = breath(t, { seed: p.seed, period: 1.24 + (i % 4) * 0.29, amp: 0.13 + (i % 3) * 0.03 });
      const s = sway(t, { seed: p.seed, period: 2.2 + (i % 5) * 0.34, armAmp: 0.045 });
      const y0 = p.by, u = p.u;
      let eyes = 'open';
      let pitch = 0.15, yaw = p.yaw, lid = 0.12, wide = 0.92;
      let bodyDy = 0, armL = 0.06, armR = 0.06;
      let rot = p.rot;
      let legs = [0, 0, 0, 0];

      if (p.mode === 'phone') {
        // 一直低头，拇指在屏幕上动；传单落在头顶也不抬
        yaw = 0.1 * Math.sin(t * 1.6 + i);
        pitch = 1.05;
        lid = 0.34;
        bodyDy = 0.34;
        armL = -0.22; armR = -0.22;
        legs = [0, -0.06, 0, -0.06];
        rot += 0.02;
      } else {
        // 抬头：眼睛先到（0.10 s），身体后到（0.16 s）
        const kUp = smooth((t - p.react) / 0.20);
        const kBody = smooth((t - p.react - 0.10) / 0.24);
        // 到位的过冲，再回一点
        const over = bump(t - p.react - 0.16, 0.22) * 0.18;
        const up = clamp(kUp + over, 0, 1.15);
        pitch = 0.15 - up * 0.95;
        yaw = p.yaw + up * (i % 2 ? 0.18 : -0.12);
        lid = 0.12 * (1 - up);
        wide = 0.92 + 0.16 * up;
        bodyDy = 0.10 - up * 0.30;
        armL = 0.06 - up * 0.55;
        armR = 0.06 - up * 0.35;
        rot = p.rot + up * (i % 2 ? 0.04 : -0.03);

        // 打哈欠的那只：抬头前先张嘴、抬手
        if (p.yawn) {
          const yw = pulse(t - p.yawn, 0.6);
          eyes = yw > 0.15 ? 'shut' : eyes;
          armL = -0.4 - 1.2 * yw + (armL + 0.4) * (1 - yw);
          bodyDy -= 0.3 * yw;
        }

        // 伸手去接：手举到最高 → 没接住 → 肩膀垮下来
        if (p.reach) {
          const up1 = smooth((t - p.reach) / 0.16);
          const down1 = smooth((t - p.reach - 0.42) / 0.30);
          const miss = up1 * (1 - down1);
          const slump = smooth((t - p.reach - 0.46) / 0.34);
          armL = armL * (1 - miss) + (-1.75) * miss + slump * 0.55;
          armR = armR * (1 - miss) + (-1.55) * miss + slump * 0.45;
          bodyDy += -0.10 * miss + slump * 0.34;
          rot += -0.05 * miss + slump * 0.03;
          pitch = pitch * (1 - down1) + (down1 * 1.05);
          lid += down1 * 0.42;
          wide = wide * (1 - down1) + 0.86 * down1;
          yaw *= (1 - slump * 0.7);
        }

        // 侧身躲传单
        if (p.dodge) {
          const d0 = smooth((t - p.dodge) / 0.14);
          const d1 = smooth((t - p.dodge - 0.26) / 0.30);
          const d = d0 * (1 - d1);
          rot += 0.26 * d;
          bodyDy += 0.22 * d;
          armL = armL * (1 - d) + (-0.9) * d;
          armR = armR * (1 - d) + (-1.1) * d;
          pitch += 0.5 * d;
          wide += 0.2 * d;
        }
      }

      // 嘴：不走阈值硬切。抬头/打哈欠/伸手去接各有自己的关键帧，0.14 s 过渡。
      // 一群人同时张嘴会齐，所以每只的时间点本来就不同。
      const mk = [{ t: 0, mouth: 'none' }];
      if (p.yawn) mk.push({ t: p.yawn, mouth: 'o' }, { t: p.yawn + 0.62, mouth: 'none' });
      if (p.react >= 0 && i % 3 === 0) mk.push({ t: p.react + 0.12, mouth: 'o' });
      if (p.reach) mk.push({ t: p.reach + 0.10, mouth: 'o' }, { t: p.reach + 0.52, mouth: 'flat' });
      const mouth = expr(t, mk, { ramp: 0.14 }).mouth;

      // 木箱上的人高出一截
      if (p.crate) {
        block(ctx, p.x - 46, y0 - 2, 92, 34, 4, '#6E5038', { stroke: P.ink, lw: 4, seed: 1785 });
        block(ctx, p.x - 40, y0 + 4, 80, 8, 2, '#8A6A4A', { seed: 1786 });
      }

      const squash = b.squash;
      const cx = p.x + Math.sin(t * (0.8 + (i % 5) * 0.1) + p.seed) * 2.2;
      clawd(ctx, {
        cx, by: y0, u,
        color: p.c,
        eyes: 'none',
        look: 0,
        mouth,
        seed: p.seed,
        bodyDy: bodyDy + b.bodyDy,
        squash,
        armL: armL + s.armL,
        armR: armR + s.armR,
        rot: rot + s.rot,
        legs,
      });
      // 眼睛：带俯仰 —— 抬眼才是真的在看天上
      const shut = blink(t, { seed: p.seed, eyes: 'open', slot: 2.6, jitter: 0.8 });
      eyesAt(ctx, {
        cx, by: y0, u, rot: rot + s.rot, squash, body: p.c,
        style: shut || eyes === 'shut' ? 'shut' : 'open',
        yaw, pitch, lid, wide,
      });

      // 低头翻包的人：一只布袋挂在他手边
      if (p.bag) {
        block(ctx, p.x + u * 1.6, y0 - u * 3.4, u * 2.4, u * 3.0, u * 0.4, '#B98A83', { stroke: P.ink, lw: Math.max(3, u * 0.18), seed: 1787 });
        line(ctx, p.x + u * 2.0, y0 - u * 3.4, p.x + u * 2.5, y0 - u * 4.4, { seed: 1788, lw: 3, color: P.ink });
        line(ctx, p.x + u * 3.2, y0 - u * 3.4, p.x + u * 2.9, y0 - u * 4.4, { seed: 1789, lw: 3, color: P.ink });
      }
      // 手机：贴在手边，屏幕朝自己
      if (p.mode === 'phone') {
        phone(ctx, p.x + u * 1.45, y0 - u * 4.0 + bodyDy * u, u * 0.52, {
          rot: 0.2 + Math.sin(t * 2.2) * 0.03, screen: '#BFD8DE', glow: false,
        });
      }
    });
  },
};