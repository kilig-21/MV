import { dreamSky, sea, ticketPlatform, noteIcons } from '../src/dream.js';
import { clawd } from '../src/character.js';
import { soundWaves, headphones } from '../src/props.js';
import { P } from '../src/palette.js';
import { breath, beatInfo } from '../src/polish-chorus.js';
import { exprE3, withBlink, beatClock, dart, browAt } from '../src/expr-e3.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    dreamSky(ctx, gt, { moonX: 380, moonY: 200, moonR: 46 });
    sea(ctx, gt, { y: 840 });
    const py = ticketPlatform(ctx, 960, 840, 520, gt, { phase: 1, seed: 43 });

    const b = breath(gt, 121, 1.15);
    // 两拍一个起伏：c1 的动作是"试一下、等一下"，不是连续晃
    const bi = beatInfo(gt);
    const step = (bi.n % 2 === 0) ? 1 : 0.55;

    // 表情：先跟着耳机放松，抬眼看到音符时 wide 一下，再落回 normal。
    // 变化落在拍点上，靠 expr 过渡，不再每两拍硬切。
    const bc = beatClock(shot.t0);
    const e = withBlink(gt, 122, exprE3(t, [
      { t: 0.00, eyes: 'normal', mouth: 'smile' },
      { t: bc.b(0), eyes: 'wide', mouth: 'o', brow: 'up' },
      { t: bc.b(1), eyes: 'normal', mouth: 'smile', brow: null },
    ]));
    const browDy = browAt(t, [{ at: bc.b(0), dur: 0.26, amp: 0.18 }]);
    const look = dart(t, [
      { t: 0.02, look: -0.35 }, { t: bc.b(0), look: 0.15 },
      { t: bc.b(1), look: 0.45 }, { t: bc.b(2), look: 0.25 },
    ]);

    clawd(ctx, {
      cx: 960, by: py - 8 + b.y * 3.2,
      u: 27,
      color: P.orange,
      ...e, browDy, blush: true,
      seed: 121,
      // 手臂一上一下地试，像在跟着旋律打拍子又不太敢用力
      armL: -0.4 - 0.16 * step * (0.6 + 0.4 * b.a),
      armR: -0.4 + 0.06 * step * (0.6 - 0.4 * b.a),
      look,
      rot: 0.02 * b.r,
      squash: 1 + 0.012 * step * b.y,
    });
    headphones(ctx, 960, py - 8 - 9 * 27 + b.y * 3.2, 27, { color: P.teal });

    // 耳机里长出的音符绕成一圈，随拍一推一推
    noteIcons(ctx, gt, 14, 0.75 + 0.2 * step);
    soundWaves(ctx, 960, py - 8 - 6 * 27 + b.y * 3.2, 26, gt, { count: 4, color: 'rgba(241,217,168,0.5)' });
  },
};