import { carriage } from '../src/scenes.js';
import { wakeFlash } from '../src/scenes-chorus23.js';
import { clawd } from '../src/character.js';
import { note } from '../src/props.js';
import { P } from '../src/palette.js';
import { glow, smooth } from '../src/ink.js';
import { breath } from '../src/polish-chorus.js';
import { expr, eyeDart } from '../src/life.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    const m = carriage(ctx, gt, { scroll: 760 + gt * 30 });
    const wake = smooth(t / 0.85);

    // 梦里剩下的几个音符从窗口淡出
    const fade = Math.max(0, 1 - wake * 0.9);
    if (fade > 0.02) {
      ctx.save();
      ctx.globalAlpha = 0.55 * fade;
      note(ctx, 250, 300, 26, '#EBDDB4');
      note(ctx, 420, 214, 20, '#E8A0A8');
      note(ctx, 336, 392, 16, '#EBDDB4');
      ctx.restore();
    }

    // 慢慢推近，把全片收在这一张脸上
    const push = 1 + 0.04 * smooth(t / d);
    ctx.save();
    ctx.translate(420, 560);
    ctx.scale(push, push);
    ctx.translate(-420, -560);

    const u = 19, cx = 392, by = m.seatY + 46;
    const b = breath(gt, 327, 0.8);

    // c3 睁得最慢：闭 → 半睁（tired）→ 全睁，两段过渡合起来约 0.5 秒；
    // 睁开后先望向窗外，再把目光收回车厢里——醒在梦境，舍不得走。
    // 四处变化（睁眼 / 望向窗外 / 收回来 / 嘴角）都是渐变，不会硬切。
    const e = expr(t, [
      { t: 0.00, eyes: 'closed', mouth: 'none' },
      { t: 0.46, eyes: 'tired' },
      { t: 0.80, eyes: 'normal', mouth: 'smile' },
      { t: 1.18, eyes: 'side' },
      { t: 1.62, eyes: 'normal' },
    ], { ramp: 0.18 });

    clawd(ctx, {
      cx, by: by + b.y * 1.6, u,
      color: P.orange,
      ...e,
      blush: true,
      seed: 327,
      // 先动眼：睁眼后约 0.1 秒头才微微转过去
      look: eyeDart(t, [
        { t: 0.62, look: 0.08 },
        { t: 1.18, look: 0.88 },
        { t: 1.62, look: 0.20 },
      ], { dur: 0.12, overshoot: 0.12 }),
      rot: -0.01 * smooth((t - 0.9) / 0.5),
      legs: [0, -0.16, 0, -0.16],
      squash: 1 + (1 - wake) * 0.02,
    });

    // 窗口的暖光收在角色身上，闭合到 v1-12 的车厢
    glow(ctx, cx, by - 5 * u, 360, 'rgba(246,201,126,0.5)', 0.45 * (1 - wake * 0.5));
    ctx.restore();

    wakeFlash(ctx, t, { dur: 0.85, peak: 0.95 });
  },
};