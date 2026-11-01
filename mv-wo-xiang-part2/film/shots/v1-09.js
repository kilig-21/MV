import { stage } from '../src/scenes.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { lerp, smooth, poly } from '../src/ink.js';
import { breathe, sway, gesture, release, bounce } from '../src/polish-v1.js';
import { faceE1, dart } from '../src/expr-e1.js';

// 闪光脉冲：不是连续闪，是几下快门
function pulse(t) {
  const beats = [0.05, 0.32, 0.52, 0.86, 1.12];
  let v = 0;
  for (const b of beats) {
    const dt = t - b;
    if (dt >= 0 && dt < 0.10) v = Math.max(v, Math.pow(1 - dt / 0.10, 0.7));
  }
  return v;
}

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const d = shot.t1 - shot.t0;
    const s = smooth(t / d);
    const fl = pulse(t);

    stage(ctx, gt, { flash: fl });

    const cx = 960;
    const by = 800;
    const u = lerp(22, 16, s);          // 缓慢拉远：角色在画面里越来越小

    // 拉长的影子：朝观众方向
    ctx.save();
    ctx.globalAlpha = 0.42;
    poly(ctx, [[cx - u * 5, by], [cx + u * 5, by], [cx + u * 8.4, by + u * 3.6], [cx - u * 8.4, by + u * 3.6]],
      { fill: '#0A1014', stroke: false });
    ctx.restore();

    // 表演：先冲台下挥手、笑；快门密集之后笑慢慢收掉
    const wave = gesture(t, 0.16, 0.2, { pre: 0.12, over: 0.08 }) * release(t, 0.6, 0.24, { pre: 0.1 });
    const bob = breathe(t, 50, u, { amp: 0.18 });
    const dip = fl * 1.6 + bounce(t, 0.9, { dur: 0.24, amp: 1 }) * 0.8;

    const f = faceE1(t, [
      { at: 0.00, eyes: 'happy', mouth: 'smirk' },
      { at: 0.95, eyes: 'tired', mouth: 'flat', ramp: 0.20 },     // 笑慢慢收掉
      { at: 1.18, brow: 'worried', ramp: 0.16 },
    ], { seed: 50, ramp: 0.20, blush: true, noBlinkIn: [[0.9, 1.36]] });

    // 冲台下：眼睛在人群里看两下，不礼貌地盯着一个点
    const look = f.blinking ? 0 : dart(t, [
      { t: 0.00, look: -0.22 },
      { t: 0.42, look: 0.18 },
      { t: 0.92, look: -0.05 },
    ], { dur: 0.10 });

    clawd(ctx, {
      cx, by: by - bob + dip, u,
      color: P.orange,
      eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy, blush: f.blush,
      seed: 50,
      look,
      armR: -0.35 - wave * 0.85,
      armL: -0.2 + sway(t, 51, { amp: 0.05 }),
      legs: [0, 0, 0, -0.04],
      rot: -0.006 * s + wave * 0.01,
      squash: 1 - dip * 0.004,
    });

    // 光从上方压下来：先亮后暗，唱到「光鲜」时最亮
    const on = smooth(t / 0.4) * (1 - 0.25 * s);
    ctx.save();
    ctx.globalAlpha = 0.10 * on;
    ctx.fillStyle = P.lamp;
    ctx.fillRect(0, 0, 1920, 860);
    ctx.restore();

    // 快门打在角色身上：一层很短的提亮，不做光斑
    if (fl > 0) {
      ctx.save();
      ctx.globalAlpha = 0.12 * fl;
      ctx.fillStyle = '#FFF6DE';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }

    // 最后一拍：笑收掉后，顶灯压暗一点，为下一镜的排练室让路
    const dim = smooth((t - 1.18) / 0.18);
    if (dim > 0) {
      ctx.save();
      ctx.globalAlpha = 0.18 * dim;
      ctx.fillStyle = '#0B1116';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }
  },
};