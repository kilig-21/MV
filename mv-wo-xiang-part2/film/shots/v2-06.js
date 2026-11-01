import { oldRoom } from '../src/scenes-verse2.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth } from '../src/ink.js';
import { breath, sway } from '../src/life.js';
import { face, prep, dart } from '../src/expr-e2.js';
import { pulse, gesture } from '../src/polish-v2.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;

    // 外公：慢半拍。抬手比孙子晚，点头比说话晚，停的时候比孙子久
    const nod1 = pulse(t - 1.02, 0.34);
    const nod2 = pulse(t - 1.96, 0.34);
    const raise = gesture(t - 0.44, { antic: 0.22, dur: 0.52, over: 0.04 });
    const press = gesture(t - 1.56, { antic: 0.14, dur: 0.3, over: 0.03 });
    const lower = smooth((t - 2.12) / 0.3);
    const bg = breath(t, { seed: 150, period: 1.85, amp: 0.18 });
    const sg = sway(t, { seed: 150, period: 3.2, armAmp: 0.03 });
    oldRoom(ctx, gt);
    // 外公：一直半垂着眼慢慢说，2.30 s 眼睛才弯起来（0.18 s 过渡），眉 0.16 s 前先抬
    const eg = face(t, [
      { t: 0.00, eyes: 'tired', mouth: 'smile' },
      { t: 2.14, brow: 'up' },
      { t: 2.30, eyes: 'happy' },
    ], { ramp: 0.18, seed: 150 });
    clawd(ctx, {
      cx: 680 + Math.sin(t * 0.55 + 0.2) * 1.5,
      by: 895,
      u: 24,
      color: P.sage,
      ...eg,
      browDy: prep(t, [2.30], { antic: 0.14, dur: 0.34, amp: 0.30 }),
      blush: t > 2.30,
      seed: 150,
      bodyDy: bg.bodyDy + 0.14 * (nod1 + nod2) + 0.08 * lower,
      squash: bg.squash,
      armL: 0.12 + sg.armL,
      armR: -2.2 * raise + 0.7 * press + 1.5 * lower + sg.armR,
      rot: -0.015 + 0.02 * raise + 0.05 * (nod1 + nod2) - 0.01 * lower + sg.rot,
    });

    // 孙子：听。呼吸比外公快，点头比外公晚 0.7 秒；不看镜头
    const lookUp = smooth((t - 0.82) / 0.2) * (1 - smooth((t - 1.48) / 0.22));
    const nod3 = pulse(t - 1.72, 0.3);
    const answer = smooth((t - 2.24) / 0.25);
    const bs = breath(t, { seed: 151, period: 1.15, amp: 0.14 });
    const ss = sway(t, { seed: 151, period: 2.0, armAmp: 0.04 });
    // 孙子：闭着眼听 → 0.84 s 睁开看外公 → 点头时又闭 → 2.36 s 才笑（每次 0.14 s 过渡）
    const es = face(t, [
      { t: 0.00, eyes: 'closed', mouth: 'none' },
      { t: 0.84, eyes: 'normal' },
      { t: 1.78, eyes: 'closed' },
      { t: 1.98, eyes: 'normal' },
      { t: 2.36, mouth: 'smile' },
    ], { ramp: 0.14, seed: 151, guard: 0.10 });
    clawd(ctx, {
      cx: 1220 + Math.sin(t * 0.75 + 1.6) * 2,
      by: 900,
      u: 21,
      color: P.orange,
      ...es,
      // 睁眼那一刻视线已经在外公身上（0.86 到位），不是睁眼后再平移
      look: dart(t, [{ t: 0, look: -0.15 }, { t: 0.86, look: -0.95 }, { t: 1.46, look: -0.15 }]),
      seed: 151,
      bodyDy: bs.bodyDy + 0.12 * nod3 + answer * 0.06,
      squash: bs.squash,
      rot: 0.05 - lookUp * 0.05 + 0.03 * nod3 + ss.rot,
      armL: 0.05 + ss.armL,
      armR: 0.08 - answer * 0.12 + ss.armR,
    });
  },
};