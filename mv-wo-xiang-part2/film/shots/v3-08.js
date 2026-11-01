import { familyTable } from '../src/scenes-verse3.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { clamp, lerp, smooth, glow, line } from '../src/ink.js';
import { bowl, bite } from '../src/scenes-verse3a.js';
import { steamSoft } from '../src/polish-v3.js';
import { breath } from '../src/life.js';
import { face, glance, prep as browPrep } from '../src/expr-e4.js';

// v3-08 只有家人才是神赐福的完美艺术
// 评审 A：三个人是同一张闭眼笑，2.66 秒没有一次睁眼、没有对视；菜夹到了妹妹碗里。
// 这里改成一条完整的动作链：
//   外公先下压一帧做预备 → 抬起 → 筷子一直连在手上 → 菜越过锅、落进 Clawd 的碗 →
//   手臂放下停在桌面；Clawd 睁眼看夹菜的人 0.4 s → 点头 → 再闭眼笑。
// 眼型/嘴型也分开：外公睁眼（看着碗）→ 闭眼笑；Clawd 睁眼 → 笑；妹妹始终闭眼笑（嘴里在嚼）。
const G = { cx: 1150, by: 702, u: 17 };    // 外公（绿）
const C = { cx: 680, by: 706, u: 22 };     // Clawd（橙）
const S = { cx: 1352, by: 708, u: 17 };    // 妹妹（粉）

const BOWL_C = { x: 800, y: 716, s: 38 };  // Clawd 的碗
const BOWL_G = { x: 1108, y: 712, s: 33 }; // 外公的碗
const BOWL_S = { x: 1296, y: 716, s: 33 }; // 妹妹的碗

// 外公左手（rig armL x=0，grip y=10）：夹菜时筷子从这只手出发
const HAND_X = G.cx - 7.5 * G.u;
const handY = a => G.by + (a - 5) * G.u;

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    familyTable(ctx, gt);

    // 全片最暖的一镜：桌上一大团暖光罩住三只螃蟹，光也在轻轻呼吸
    const warm = 0.5 + 0.5 * Math.sin(t * 0.9);
    glow(ctx, 960, 580, 820, 'rgba(246,201,126,0.6)', 0.34 + 0.05 * warm);
    glow(ctx, 960, 640, 340, 'rgba(246,201,126,0.7)', 0.26 + 0.05 * warm);

    // ---- 外公夹菜：预备（下压一帧）→ 抬起 → 端着走 → 放下停在桌面 ----
    const prep = smooth(clamp((t - 0.28) / 0.05, 0, 1)) * (1 - smooth(clamp((t - 0.36) / 0.05, 0, 1)));
    const up = smooth(clamp((t - 0.38) / 0.24, 0, 1));
    const carry = smooth(clamp((t - 0.60) / 0.34, 0, 1));
    const down = smooth(clamp((t - 1.30) / 0.46, 0, 1));
    const armA = 0.14 * prep + 0.10 * down - (1.02 + 0.18 * carry) * up * (1 - down);

    const bA = breath(t, { seed: 381, period: 1.35, amp: 0.15, squashAmp: 0.010 });
    const bB = breath(t, { seed: 382, period: 1.75, amp: 0.11, squashAmp: 0.008 });

    // 外公：端菜时睁着眼盯碗（不睁眼看不清夹到哪儿），放下后闭眼笑。
    // 视线在 1.52 先从碗上收回来看孙子，1.64 表情才彻底松开——视线带路。
    const gLook = glance(t, [
      { t: 0.00, look: -0.15 },
      { t: 0.52, look: -0.85 },     // 盯着 Clawd 的碗
      { t: 1.58, look: -0.10 },     // 放下筷子，转过来
    ], { dur: 0.13 });
    const gE = face(t, [
      { t: 0.00, eyes: 'normal', mouth: 'smile', brow: null },
      { t: 1.66, eyes: 'happy', mouth: 'grin', brow: null },
    ], 0.24);
    clawd(ctx, {
      cx: G.cx, by: G.by, u: G.u,
      color: P.sage,
      ...gE,
      look: gLook,
      blush: true,
      seed: 381, rot: -0.02 - 0.03 * up * (1 - down),
      armL: armA,
      legs: [0, -0.12, 0, -0.12],
      squash: bA.squash,
      bodyDy: bA.bodyDy,
    });

    // 妹妹：始终闭眼笑，但嘴里在嚼（四种眼型里她和 Clawd 的「笑」不是同一张脸）
    const turn = smooth(clamp((t - 1.02) / 0.30, 0, 1)) * (1 - smooth(clamp((t - 1.76) / 0.34, 0, 1)));
    clawd(ctx, {
      cx: S.cx, by: S.by, u: S.u,
      color: P.pink,
      eyes: 'happy',
      look: -0.55 - 0.25 * turn, mouth: 'smile', blush: true,
      seed: 382, rot: 0.02 - 0.055 * turn,
      legs: [0, -0.12, 0, -0.12],
      squash: bB.squash - 0.006 * Math.sin(t * 9),
      bodyDy: bB.bodyDy + 0.05 * Math.sin(t * 9),
    });

    // ---- 主角：睁眼看夹菜的人 → 点头 → 再闭眼笑 ----
    const mainB = breath(t, { seed: 3830, period: 1.15, amp: 0.13, squashAmp: 0.009 });
    // 全片最暖的一次对视：眼睛睁圆一点（wide 的米白眼白 + 高光，比 sparkle 收着），
    // 抬眼比睁眼早 2 帧；0.86 那一下 2 帧的闭眼是眨眼（快速路径，不进 expr）。
    const mainLook = glance(t, [
      { t: 0.00, look: 0.00 },
      { t: 1.04, look: 0.95 },      // 看外公
      { t: 1.58, look: 0.35 },      // 点头，收回一点
    ], { dur: 0.10 });
    const mainE = face(t, [
      { t: 0.00, eyes: 'happy', mouth: 'smile', brow: null },
      { t: 1.04, eyes: 'wide', mouth: 'o', brow: 'up' },
      { t: 1.32, eyes: 'normal', mouth: 'smile', brow: 'up' },
      { t: 1.64, eyes: 'happy', mouth: 'smile', brow: null },
    ], 0.14);
    const mainEyes = (t >= 0.86 && t < 0.94) ? { ...mainE, eyes: 'closed' } : mainE;
    // 点头：先沉下去，带回弹
    const nodIn = smooth(clamp((t - 1.52) / 0.20, 0, 1));
    const nodOut = smooth(clamp((t - 1.72) / 0.26, 0, 1));
    const nod = nodIn * (1 - nodOut);

    clawd(ctx, {
      cx: C.cx, by: C.by + Math.sin(t * Math.PI * 2 * 0.95 + 1.3) * 1.3 + 5 * nod, u: C.u,
      color: P.orange,
      ...mainEyes,
      look: mainLook,
      browDy: browPrep(t, 0.90, { amp: 0.30 }),
      blush: true,
      seed: 380, rot: -0.015 + 0.045 * mainLook + 0.04 * nod,
      squash: mainB.squash - 0.05 * nod,
      bodyDy: mainB.bodyDy + 0.42 * nod,
      legs: [0, -0.14, 0, -0.14],
      armL: 0.1 + 0.16 * nod, armR: -0.2,
    });

    // ---- 桌上的碗、锅，热气一直在动 ----
    bowl(ctx, BOWL_C.x, BOWL_C.y, BOWL_C.s, {});
    bowl(ctx, BOWL_G.x, BOWL_G.y, BOWL_G.s, {});
    bowl(ctx, BOWL_S.x, BOWL_S.y, BOWL_S.s, {});
    steamSoft(ctx, 960, 626, gt, { n: 7, h: 190, amp: 17, alpha: 0.80 });
    steamSoft(ctx, BOWL_G.x, BOWL_G.y - 8, gt + 0.9, { n: 2, h: 84, amp: 8, alpha: 0.34 });
    steamSoft(ctx, BOWL_S.x, BOWL_S.y - 6, gt + 1.7, { n: 2, h: 76, amp: 7, alpha: 0.30 });

    // ---- 夹过来的菜：一条抛物线，从外公的碗越过锅，落进 Clawd 的碗 ----
    const F = { t0: 0.66, t1: 1.28, x0: BOWL_G.x, y0: 664, x1: BOWL_C.x, y1: 686 };
    const k = clamp((t - F.t0) / (F.t1 - F.t0), 0, 1);
    if (t > F.t0 && k < 1) {
      const fx = lerp(F.x0, F.x1, k);
      const fy = lerp(F.y0, F.y1, k) - 150 * 4 * k * (1 - k);
      // 筷子：两根，从外公的手一直连到菜上——道具不会自己动
      const ga = 1 - smooth(clamp((k - 0.82) / 0.18, 0, 1));
      ctx.save();
      ctx.globalAlpha = 0.92 * ga;
      line(ctx, HAND_X, handY(armA), fx - 8, fy - 3, { seed: 385, lw: 6, color: P.ink, parts: 2 });
      line(ctx, HAND_X + 18, handY(armA) + 12, fx + 10, fy + 9, { seed: 386, lw: 6, color: P.ink, parts: 2 });
      ctx.restore();
      bite(ctx, fx, fy, 21, P.sage);
    }
    // 落进 Clawd 的碗里：碗里多一撮菜，热气冒一下
    if (t > F.t1) {
      bowl(ctx, BOWL_C.x, BOWL_C.y, BOWL_C.s, { fill2: P.sageDim });
      steamSoft(ctx, BOWL_C.x, BOWL_C.y - 10, gt + 0.4, { n: 2, h: 70, amp: 7, alpha: 0.30 });
    }

    // 最后一层极轻的暖色，把这一镜焐热
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.03 + 0.01 * warm;
    ctx.fillStyle = '#F6C97E';
    ctx.fillRect(0, 0, 1920, 1080);
    ctx.restore();
    void d;
  },
};