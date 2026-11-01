import { blockedDoor } from '../src/scenes-verse3.js';
import { clawd, groundShadow } from '../src/character.js';
import { P } from '../src/palette.js';
import { lerp, smooth, clamp, glow, poly } from '../src/ink.js';
import { walkLegs, walkBob, settle } from '../src/scenes-verse3a.js';
import { breath, blink } from '../src/life.js';
import { face, glance, prep, withBlink } from '../src/expr-e4.js';

// v3-09 也许会有人给你阻挠但你要记住
// 挡路者不是摆设：它在呼吸、在换重心、在把身子压过来。
// 主角：瞳孔先缩（1.34）→ 0.1 秒后身体后仰（1.44）→ 才后退（1.70）。
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    blockedDoor(ctx, gt);

    // 墙上一点暖灯，别让整镜掉进暗部
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#F6C97E';
    ctx.fillRect(0, 0, 1920, 900);
    ctx.restore();
    glow(ctx, 960, 240, 760, 'rgba(246,201,126,0.55)', 0.20);

    // ---- 挡路者：一直在动 ----
    const raise = smooth(clamp((t - 1.22) / 0.50, 0, 1));
    const press = smooth(clamp((t - 0.70) / 0.95, 0, 1));
    const shift = Math.sin(t * 2 * Math.PI * 0.42 + 1.1) * 9;        // 重心左右移
    const bCx = 960 - 46 * raise + shift;
    const bB = breath(t, { seed: 3910, period: 1.75, amp: 0.18, squashAmp: 0.016 });
    const bBlink = blink(t, { seed: 3910, eyes: 'look', enabled: t < 1.9 });

    // 地上的长影先铺开，跟着它一起缓慢移动
    ctx.save();
    ctx.globalAlpha = 0.34 * press;
    poly(ctx, [[bCx - 100, 900], [bCx + 120, 900], [bCx - 220, 1020], [bCx - 460, 1020]],
      { fill: P.ink, stroke: false });
    ctx.restore();

    clawd(ctx, {
      cx: bCx, by: 896 + Math.sin(t * 2 * Math.PI * 0.68 + 0.5) * 0.9, u: 38,
      color: '#3A3540',
      eyes: bBlink || 'look',
      look: -0.55,
      mouth: 'flat',
      seed: 390,
      rot: -0.02 - 0.05 * raise + Math.sin(t * 2 * Math.PI * 0.42) * 0.012,
      squash: bB.squash,
      bodyDy: bB.bodyDy,
      legs: [0, -0.06, 0, -0.06],
      armL: -1.05 * raise + 0.06 * Math.sin(t * 1.3),
      armR: 0.1 - 0.08 * Math.sin(t * 1.1 + 0.6),
    });

    // ---- 主角 ----
    const walkP = smooth(clamp(t / 1.30, 0, 1));
    const walking = 1 - smooth(clamp((t - 1.26) / 0.12, 0, 1));
    const leanBack = smooth(clamp((t - 1.44) / 0.17, 0, 1));     // 身体落后 0.1 秒
    const back = smooth(clamp((t - 1.70) / 0.40, 0, 1));         // 然后才是后退

    const x = lerp(150, 520, walkP) - 36 * back;
    const by = 895;
    const mainB = breath(t, { seed: 3920, period: 1.3, amp: 0.14, squashAmp: 0.010 });
    const ph = t * 10.5;
    const bob = walkBob(ph, 2.6) * walking;
    const squash = settle(t, 1.32, 10, 0.08) * (1 - 0.03 * back);
    // 后仰：先往上抬一点，再往后倒
    const lift = 4 * Math.sin(Math.PI * clamp((t - 1.40) / 0.28, 0, 1));

    groundShadow(ctx, x, by + 4, 25, { alpha: 0.17, w: 6 });

    // 先惊（shock：白眼球 + 缩小的瞳孔），再委屈（teary），最后才后退。
    // 眉先抬（1.24 的预备）→ 1.36 睁圆 → 1.72 眼睛发湿、眉垮下来。全程 0.18 秒过渡，不硬切。
    const look = glance(t, [
      { t: 0.00, look: 0.55 },
      { t: 1.30, look: 0.88 },      // 挡路者
      { t: 1.78, look: 0.72 },
    ], { dur: 0.10 });
    const e = face(t, [
      { t: 0.00, eyes: 'normal', mouth: 'none', brow: null },
      { t: 1.36, eyes: 'shock', mouth: 'o', brow: 'up' },
      { t: 1.72, eyes: 'teary', mouth: 'wavy', brow: 'worried' },
    ], 0.18);
    const eb = withBlink(e, blink(t, { seed: 3920, enabled: t < 1.28 }));
    clawd(ctx, {
      cx: x, by: by - bob - lift, u: 25,
      color: P.orange,
      ...eb,
      look,
      browDy: prep(t, 1.24, { amp: 0.40 }),
      seed: 391,
      rot: -0.01 + 0.075 * leanBack,
      squash,
      bodyDy: mainB.bodyDy,
      legs: walkLegs(ph, 0.26 * walking),
    });


    // 影子压在身上：角色身上一层柔和的压暗 + 四周的暗
    if (press > 0) {
      glow(ctx, x + 30, by - 115, 340, 'rgba(10,8,12,0.8)', 0.30 * press);
      glow(ctx, x + 40, by - 120, 620, 'rgba(10,8,12,0.55)', 0.26 * press);
    }
    void d;
  },
};