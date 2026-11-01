import { maze } from '../src/scenes-verse3.js';
import { clawd, groundShadow } from '../src/character.js';
import { P } from '../src/palette.js';
import { lerp, smooth, clamp, bg, glow } from '../src/ink.js';
import { walkLegs, walkBob, settle } from '../src/scenes-verse3a.js';
import { breath, blink, sway } from '../src/life.js';
import { face, glance, prep, withBlink } from '../src/expr-e4.js';
import {
  wire, acUnit, laundryLine, streetSign, flicker, puddle, barricade, alleyWallDetail,
  manhole, roadSeams, streetDebris,
} from '../src/detail-r2.js';

// v3-10 愤怒才不会让你升华只会让你迷路——高楼夹成的窄路，角色在路口转身，越走越偏
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;

    // 画面轻轻转起来（垫底色，转角不出空）
    const rot = -0.058 * smooth((t - 0.65) / 2.3);
    bg(ctx, '#141A20');
    ctx.save();
    ctx.translate(960, 620);
    ctx.rotate(rot);
    ctx.translate(-960, -620);

    maze(ctx, gt);

    // 墙上的窗：让窄路像真的夹在高楼之间
    const wins = [[70, 280], [150, 520], [64, 700], [250, 190], [300, 780],
      [1600, 250], [1740, 470], [1620, 640], [1830, 730], [1550, 370]];
    for (let i = 0; i < wins.length; i++) {
      const [wx, wy] = wins[i];
      ctx.save();
      ctx.globalAlpha = 0.28 + 0.14 * Math.sin(t * 1.4 + i * 1.7);
      ctx.fillStyle = i % 3 === 0 ? '#D9A03F' : '#8E7A50';
      ctx.fillRect(wx, wy, 15, 21);
      ctx.restore();
      if (i % 3 === 0) glow(ctx, wx + 7, wy + 10, 52, 'rgba(246,201,126,0.55)', 0.22);
    }

    // 墙上与空中的生活痕迹：排水管、雨棚、配电箱、空调外机
    alleyWallDetail(ctx, -1, t, { seed: 2301 });
    alleyWallDetail(ctx, 1, t, { seed: 2311 });
    acUnit(ctx, 262, 452, 88, 66, 1901);
    acUnit(ctx, 1512, 318, 94, 70, 1906);
    acUnit(ctx, 1596, 636, 82, 62, 1911);
    acUnit(ctx, 300, 690, 76, 58, 1916);
    // 晾衣绳与电线：横过胡同，把天空切成几段
    laundryLine(ctx, 1288, 388, 1524, 400, 42, 1920, t);
    laundryLine(ctx, 468, 296, 648, 312, 28, 1930, t);
    wire(ctx, -20, 246, 640, 232, 48, 1801, { double: true });
    wire(ctx, 640, 232, 1292, 248, 56, 1802);
    wire(ctx, 1292, 248, 1940, 236, 44, 1803, { double: true });
    // 路口的旧路牌：两块方向牌，牌面只有笔画
    streetSign(ctx, 470, 884, 196, 2001, { color: '#454A4F' });

    // 路尽头越来越黑
    const dark = smooth((t - 1.6) / 1.5);

    // 路尽头一盏远处的路灯：一直忽明忽暗，最后被黑吞掉
    const flick = 0.35 + 0.65 * flicker(t, 311);
    const lampA = Math.max(0, 1 - dark * 1.3) * flick;
    if (lampA > 0) {
      glow(ctx, 960, 520, 300, 'rgba(246,201,126,0.6)', 0.34 * lampA);
      ctx.save();
      ctx.globalAlpha = lampA;
      ctx.beginPath();
      ctx.arc(960, 520, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#F6C97E'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = P.ink; ctx.stroke();
      ctx.restore();
    }

    // 路面接缝、井盖、路边的小垃圾
    roadSeams(ctx, { cx: 960, yTop: 520, yBot: 1060, hTop: 250, hBot: 540, n: 5, seed: 2171 });
    // 地面的一点积水：倒着路灯和窗灯，湿漉漉的
    puddle(ctx, { x: 742, y: 982, w: 280, h: 34, seed: 2101, light: 0.30 * lampA, alpha: 0.7 });
    puddle(ctx, { x: 1178, y: 1016, w: 210, h: 26, seed: 2107, light: 0.22 * lampA, alpha: 0.62 });
    puddle(ctx, { x: 468, y: 934, w: 140, h: 18, seed: 2111, light: 0.18 * lampA, alpha: 0.55 });
    manhole(ctx, 748, 1042, 82, 2151);
    streetDebris(ctx, 640, 902, 22, 2181, { alpha: 0.85 });
    streetDebris(ctx, 1490, 972, 26, 2187, { alpha: 0.8 });

    // 走向深处 → 在路口转身 → 越走越偏
    const p1 = smooth(Math.min(t, 1.15) / 1.15);
    const p2 = smooth(Math.max(0, Math.min(t - 1.45, 1.25)) / 1.25);
    const x = p2 > 0 ? lerp(lerp(980, 898, p1), 1162, p2) : lerp(980, 898, p1);
    const y = p2 > 0 ? lerp(lerp(892, 840, p1), 830, p2) : lerp(892, 840, p1);
    const u = p2 > 0 ? lerp(lerp(26, 23, p1), 22, p2) : lerp(26, 23, p1);

    const turn = Math.sin(Math.PI * smooth((t - 1.12) / 0.5));   // 转身时歪一下
    const b = breath(t, { seed: 310, period: 1.4, amp: 0.13, squashAmp: 0.010 });
    const sw = sway(t, { seed: 310, period: 2.8, armAmp: 0.04 });
    // 迷路的表情：走神（dazed）→ 路口回头找路 → 惊觉（wide + 怒眉）→ 最后泄成 tired。
    // 「愤怒只会让你迷路」：怒在眉上，累在眼上。抬眉（2.48）是惊觉前的预备。
    const walking = (1 - smooth((t - 2.55) / 0.3));
    const ph = t * 11;
    const bob = walkBob(ph, 2.4) * walking;
    const squash = settle(t, 2.62, 9, 0.06);

    const look = glance(t, [
      { t: 0.00, look: -0.20 },
      { t: 0.55, look: 0.22 },
      { t: 1.28, look: -0.95 },     // 回头：来路
      { t: 1.78, look: 0.85 },      // 还是得往前
      { t: 2.72, look: 0.10 },      // 惊觉后收回中间
    ], { dur: 0.09 });
    const e = face(t, [
      { t: 0.00, eyes: 'dot', mouth: 'flat', brow: null },
      { t: 1.02, eyes: 'dazed', mouth: 'flat', brow: null },
      { t: 2.62, eyes: 'wide', mouth: 'wavy', brow: 'angry' },
      { t: 3.02, eyes: 'tired', mouth: 'flat', brow: 'angry' },
    ], 0.20);
    const eb = withBlink(e, blink(t, { seed: 310, enabled: t < 1.02 }));

    groundShadow(ctx, x, y + 3, u, { alpha: 0.2, w: 6 });
    clawd(ctx, {
      cx: x, by: y - bob, u,
      color: P.orange,
      ...eb,
      look,
      browDy: prep(t, 2.46, { amp: 0.42 }),
      seed: 310,
      rot: -0.14 * turn + Math.sin(t * 3.1) * 0.012 + sw.rot,
      squash: squash * b.squash,
      bodyDy: b.bodyDy,
      legs: walkLegs(ph, 0.26 * walking),
      armL: 0.16 * turn, armR: -0.16 * turn,
    });

    // 右侧去路被杂物挡住：他不是空着转身，是走到头了
    barricade(ctx, 1352, 886, 120, 2201);

    const g = ctx.createLinearGradient(0, 380, 0, 380 + 300 + 260 * dark);
    g.addColorStop(0, `rgba(8,12,15,${0.75 * dark})`);
    g.addColorStop(1, 'rgba(8,12,15,0)');
    ctx.fillStyle = g;
    ctx.fillRect(560, 380, 800, 560);
    ctx.restore();

    // 最后一层压暗：路把人吞掉
    if (dark > 0) {
      ctx.save();
      ctx.globalAlpha = 0.16 * dark;
      ctx.fillStyle = '#080C0F';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.restore();
    }
  },
};