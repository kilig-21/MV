import { wishWindow } from '../src/scenes-verse2.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { block, line, easeOut } from '../src/ink.js';
import { breath, sway } from '../src/life.js';
import { pulse } from '../src/polish-v2.js';
import { face, prep, dart } from '../src/expr-e2.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const m = wishWindow(ctx, gt);
    // 五张纸条：一张接一张从上方落下，落定时轻弹一下
    let nods = 0;
    for (let i = 0; i < 5; i++) {
      const t0 = i * 0.22;
      const k = easeOut((t - t0) / 0.32);
      if (k <= 0) continue;
      const land = (t - t0 - 0.32) / 0.12;
      const bounce = land > 0 && land < 1 ? -Math.sin(land * Math.PI) * 5 : 0;
      const x = 520 + i * 128;
      const y = m.sillY - 50 - 150 * (1 - k) + bounce;
      block(ctx, x, y, 92, 60, 3, '#F2E3C6', { stroke: P.ink, lw: 3, seed: 240 + i, amp: 1 });
      line(ctx, x + 16, y + 34, x + 72, y + 34, { seed: 250 + i, lw: 2, color: '#B9A98D' });
      nods += pulse(t - t0 - 0.36, 0.26);
    }
    // 他不急着做什么，只是看着愿望一张张摆好，最后轻轻笑一下
    // 表情：前 1.2 s 平静 → 眉毛先抬 3 帧做预备 → 1.32 s 眼弯嘴笑（0.16 s 过渡）
    const e = face(t, [
      { t: 0.00, eyes: 'normal', mouth: 'none' },
      { t: 1.20, brow: 'up' },
      { t: 1.32, eyes: 'happy', mouth: 'smile' },
      { t: 1.72, brow: null },
    ], { ramp: 0.16, seed: 130 });
    // 五张纸条从左上落到窗台，视线跟着最靠右的那张跳三次，不是匀速扫
    const look = dart(t, [{ t: 0, look: -0.9 }, { t: 0.55, look: -0.72 }, { t: 1.10, look: -0.5 }]);
    const b = breath(t, { seed: 130, period: 1.55, amp: 0.16 });
    const s = sway(t, { seed: 130, armAmp: 0.04, rotAmp: 0.006 });
    clawd(ctx, {
      cx: 1300 + Math.sin(t * 1.05) * 3,
      by: m.sillY + 46,
      u: 22,
      color: P.orange,
      ...e,
      browDy: prep(t, [1.32], { antic: 0.12, dur: 0.30, amp: 0.32 }),
      look,
      seed: 130,
      bodyDy: b.bodyDy,
      squash: b.squash,
      armL: -0.5 - 0.06 * Math.min(1, nods) + s.armL,
      rot: Math.sin(t * 0.85) * 0.012 - 0.05 * Math.min(1, nods) + s.rot,
      blush: t > 1.32,
    });
  },
};