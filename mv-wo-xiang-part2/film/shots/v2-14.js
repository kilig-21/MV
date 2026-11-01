import { P } from '../src/palette.js';
import { clawd } from '../src/character.js';
import { bg, smooth, glow } from '../src/ink.js';
import { breath, sway } from '../src/life.js';
import { face, dart } from '../src/expr-e2.js';
import { pulse } from '../src/polish-v2.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    bg(ctx, '#241E1A');
    glow(ctx, 960, 320, 760, 'rgba(246,201,126,0.22)', 0.6);
    // 话到嘴边：开口，又闭上；眼睛先躲开
    const open = smooth((t - 0.3) / 0.12) * (1 - smooth((t - 0.62) / 0.14));
    const away = smooth((t - 0.52) / 0.18);
    const gulp = pulse(t - 0.7, 0.26);
    const b = breath(t, { seed: 182, period: 2.0, amp: 0.12 });
    const s = sway(t, { seed: 182, period: 3.6, armAmp: 0.025 });
    // 近景：嘴张了一下（0.34 s）又闭上；眼先躲开（0.56 s），眉 3 帧后才皱（0.62 s）
    const e = face(t, [
      { t: 0.00, eyes: 'tired', mouth: 'flat', brow: null },
      { t: 0.34, mouth: 'o' },
      { t: 0.56, eyes: 'side' },
      { t: 0.62, brow: 'worried' },
      { t: 0.66, mouth: 'flat' },
    ], { ramp: 0.15, seed: 182 });
    clawd(ctx, {
      cx: 960,
      by: 980,
      u: 52,
      color: P.orange,
      ...e,
      look: dart(t, [{ t: 0, look: -0.25 }, { t: 0.58, look: -0.72 }, { t: 0.88, look: -0.62 }]),
      seed: 182,
      bodyDy: b.bodyDy + gulp * 0.06,
      squash: b.squash,
      armL: -0.1 - open * 0.25 + s.armL,
      armR: -0.1 - open * 0.25 + s.armR,
      rot: -0.006 + s.rot,
    });
  },
};