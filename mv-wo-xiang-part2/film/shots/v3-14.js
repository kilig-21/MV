import { queue } from '../src/scenes-verse3.js';
import { clawd, grip } from '../src/character.js';
import { suitcase, phone } from '../src/props.js';
import { P } from '../src/palette.js';
import { block, glow, line, poly, smooth, clamp } from '../src/ink.js';
import { breath, blink } from '../src/life.js';
import { face, glance, prep, withBlink } from '../src/expr-e4.js';

// v3-14 当你拿起公文包挤进上班队列
// 队伍保留「整齐」当压迫感，但整队有起伏：有人接电话、有人看表、每个人脚底都不一样高。
// 主角拎包的手抬高；抬头看楼顶时停 0.15 秒，再继续走。

// 队伍：速度一致（整齐），但相位、身高、小动作各不相同（呼吸）
const Q = [
  { i: 0, u: 16.6, ph: 0.00, by: 0, act: 'walk' },
  { i: 1, u: 17.4, ph: 0.22, by: -6, act: 'watch' },
  { i: 2, u: 16.2, ph: 0.41, by: -1, act: 'call' },
  { i: 3, u: 17.0, ph: 0.63, by: -5, act: 'walk' },
  { i: 4, u: 16.8, ph: 0.81, by: -2, act: 'walk' },
  { i: 5, u: 17.2, ph: 1.02, by: -4, act: 'walk' },
  { i: 6, u: 16.4, ph: 1.21, by: 0, act: 'walk' },
  { i: 7, u: 17.6, ph: 1.44, by: -3, act: 'walk' },
];

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    queue(ctx, gt);

    // 楼面：窗、门楣、门口的一线光
    for (let i = 0; i < 3; i++) {
      block(ctx, 578 + i * 280, 430, 150, 86, 3, '#22343D', { stroke: P.ink, lw: 4, seed: 3154 + i });
      if (i === 1) {
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = '#E3B36A';
        ctx.fillRect(586 + i * 280, 438, 134, 70);
        ctx.restore();
      }
    }
    // 窗里也有人：两三盏灯在熄与亮之间
    for (let i = 0; i < 3; i++) {
      const on = 0.35 + 0.25 * Math.sin(t * 0.9 + i * 2.1);
      ctx.save();
      ctx.globalAlpha = 0.22 + 0.18 * on;
      ctx.fillStyle = '#C9975A';
      ctx.fillRect(600 + i * 280 + 18, 462, 24, 30);
      ctx.restore();
    }
    block(ctx, 736, 526, 448, 34, 4, '#223039', { stroke: P.ink, lw: 4, seed: 3157 });
    glow(ctx, 960, 560, 260, 'rgba(246,201,126,0.35)', 0.45);

    // 楼顶檐口：抬头看的那条线
    block(ctx, 512, 356, 896, 30, 4, '#1B2830', { stroke: P.ink, lw: 4, seed: 3150 });
    const beacon = 0.5 + 0.5 * Math.sin(t * 4.2);
    ctx.save();
    ctx.globalAlpha = 0.55 + 0.35 * beacon;
    ctx.beginPath();
    ctx.arc(1290, 372, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#E0566E'; ctx.fill();
    ctx.restore();
    line(ctx, 1290, 386, 1290, 430, { seed: 3151, lw: 3, color: P.ink });

    // 上班队列：每只都拎着公文包，走进中间那扇门
    const N = Q.length, step = 162;
    const phBase = t * 7.0;
    for (const q of Q) {
      let cx = -150 + q.i * step + t * 78;
      if (cx > 1150) cx -= N * step;
      if (cx < -320 || cx > 2140) continue;
      // 越靠后越小，队伍有纵深；每个人还有一点自己的摇摆与呼吸
      const ph = phBase + q.ph;
      const bob = Math.abs(Math.sin(ph)) * 2.1;
      const breathe = Math.sin(t * 2.6 + q.ph * 2.3) * 0.9;
      const sway = Math.sin(t * 1.5 + q.i * 1.7) * 1.4;
      const by = 900 - bob - (q.i % 2) * 4 - q.by + breathe;
      const legs = [
        Math.sin(ph) * 0.24, -Math.sin(ph) * 0.24,
        Math.sin(ph + 1.15) * 0.24, -Math.sin(ph + 1.15) * 0.24,
      ];
      const dark = smooth(clamp((cx - 870) / 170, 0, 1));
      const walkBreath = breath(t, { seed: 9450 + q.i, phase: q.ph, amp: 0.10, squashAmp: 0.006 });

      // 各自的走神：接电话、看表
      let armL = 0, armR = -0.22, look = 0, eyes = 'dot', rot = 0.02 + Math.sin(t * 0.8 + q.i) * 0.01;
      if (q.act === 'call') {
        armL = -1.34; look = -0.25; rot = 0.05;
      } else if (q.act === 'watch') {
        armR = -1.15; look = 0.45;
        eyes = blink(t, { seed: 9400 + q.i, eyes: 'dot', phase: q.ph }) || 'dot';
      } else {
        eyes = blink(t, { seed: 9400 + q.i, eyes: 'dot', phase: q.ph }) || 'dot';
      }

      ctx.save();
      ctx.globalAlpha = 1 - dark * 0.94;
      clawd(ctx, {
        cx: cx + sway, by, u: q.u,
        color: '#8F8A8F',
        eyes, mouth: 'none',
        seed: 3152 + q.i,
        legs,
        rot,
        armL, armR,
        squash: walkBreath.squash,
        bodyDy: walkBreath.bodyDy,
      });

      const g = grip(cx + sway, by, q.u, 'right');
      // 拎着包的那条短臂抬起来一点，包就不再拖在地上
      if (q.act === 'call') {
        phone(ctx, cx + sway - 4.6 * q.u, by - 7.0 * q.u, 5.4, { rot: -0.35, screen: '#DCE9EC' });
      } else if (q.act === 'watch') {
        // 手腕上的表，抬到眼前：表盘亮一点，暗处也读得出来
        const wy = g.y - 1.35 * q.u;
        glow(ctx, g.x + 5, wy + 7, 44, 'rgba(241,217,168,0.55)', 0.5);
        block(ctx, g.x - 5, wy, 20, 15, 4, '#F1D9A8', { stroke: P.ink, lw: 3, seed: 9410 + q.i });
        line(ctx, g.x + 5, wy + 7, g.x + 5, wy + 2, { seed: 9420 + q.i, lw: 2, color: P.ink });
        line(ctx, g.x + 5, wy + 7, g.x + 10, wy + 9, { seed: 9430 + q.i, lw: 2, color: P.ink });
      } else {
        suitcase(ctx, g.x + q.u * 0.3, g.y - 0.22 * q.u + q.u * 0.5, q.u * 0.42, {});
      }
      ctx.restore();
    }

    // ---- 主角：拎着包走进来，停住抬头看楼顶，停住 0.15 秒，再继续走 ----
    const walkIn = smooth(clamp(t / 0.55, 0, 1));
    const stopping = smooth(clamp((t - 0.50) / 0.20, 0, 1));
    const resuming = smooth(clamp((t - 1.54) / 0.30, 0, 1));
    const walking = (1 - stopping) + resuming;

    // 抬头：0.78 起，1.04 到位；1.04–1.24 是那 0.15 秒以上的停顿；1.24 之后放下
    const lookUp = smooth(clamp((t - 0.78) / 0.26, 0, 1)) * (1 - smooth(clamp((t - 1.24) / 0.30, 0, 1)));

    const cx = 520 + 46 * walkIn + 132 * resuming;
    const ph = phBase + 0.3;
    const bob = Math.abs(Math.sin(ph)) * 2.4 * walking;
    const by = 902 - bob;

    // 拎包的手抬高：走路时随步伐轻轻摆
    const bagLift = -0.58 + 0.10 * Math.sin(ph) * walking;

    const mainBreath = breath(t, { seed: 9480, period: 1.5, amp: 0.14 });

    // 楼顶的灯落在它身上：抬头这件事看得见
    if (lookUp > 0) {
      ctx.save();
      ctx.globalAlpha = 0.10 * lookUp;
      ctx.fillStyle = P.lamp;
      ctx.beginPath();
      ctx.moveTo(1252, 388);
      ctx.lineTo(1330, 388);
      ctx.lineTo(690, 760);
      ctx.lineTo(470, 760);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      glow(ctx, 1290, 372, 320, 'rgba(246,201,126,0.55)', 0.6 * lookUp);

      // 一道极淡的视线：从脸抬到楼顶的航空灯
      ctx.save();
      ctx.globalAlpha = 0.5 * lookUp;
      ctx.fillStyle = '#F1D9A8';
      const fx = cx + 6 * 26, fy = by - 6.5 * 26;
      for (let i = 1; i <= 5; i++) {
        const k = i / 6;
        ctx.beginPath();
        ctx.arc(fx + (1282 - fx) * k, fy + (396 - fy) * k, 3.4 - k * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    const mainBlink = blink(t, { seed: 9470, enabled: !(t > 0.80 && t < 1.60) });
    // 抬头看楼顶：视线 0.80 先抬（比表情早 3 帧），眉抬一下做预备，
    // 眼睛 1.04 睁圆、嘴张成 o；1.56 收回平常的走路脸。不是硬切。
    const look = glance(t, [
      { t: 0.00, look: 0.10 },
      { t: 0.82, look: 0.32 },      // 楼顶航空灯
      { t: 1.62, look: 0.10 },
    ], { dur: 0.11 });
    const e = face(t, [
      { t: 0.00, eyes: 'normal', mouth: 'flat', brow: null },
      { t: 1.04, eyes: 'wide', mouth: 'o', brow: 'up' },
      { t: 1.58, eyes: 'normal', mouth: 'flat', brow: null },
    ], 0.18);
    const eb = withBlink(e, mainBlink);
    clawd(ctx, {
      cx, by, u: 26,
      color: P.orange,
      ...eb,
      look,
      browDy: prep(t, 0.90, { amp: 0.34 }),
      seed: 3153,
      legs: walking > 0.02 ? [
        Math.sin(ph) * 0.24, -Math.sin(ph) * 0.24,
        Math.sin(ph + 1.15) * 0.24, -Math.sin(ph + 1.15) * 0.24,
      ] : [0, -0.06, 0, -0.06],
      rot: -0.02 - 0.055 * lookUp,
      squash: mainBreath.squash,
      bodyDy: mainBreath.bodyDy,
      armR: bagLift,
      armL: -0.10 * walking,
    });
    const g = grip(cx, by, 26, 'right');
    suitcase(ctx, g.x + 9, g.y + bagLift * 26 + 12, 10, {});
    void d;
  },
};