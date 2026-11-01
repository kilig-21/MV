import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { block, line, glow, star, smooth, clamp, lerp } from '../src/ink.js';
import { breath, blink } from '../src/life.js';
import { face, glance, prep, sum, withBlink } from '../src/expr-e4.js';

// v3-16 我知道欲望总是让人无法拒绝
// 评审 B：主角整段 4.68 s 贴死右画框、右臂被切掉，橱窗只占 50%、两侧一大片空暗墙。
// 改法：橱窗左移并放大到画宽 60%（296–1452），主角完整落在 x=0.86（右臂离框 4% 留白），
// 伸出的短臂正好贴到玻璃；戒指的光环收到窗宽的 50%，不抢脸；右侧空墙补一盏壁灯、几道墙板缝。
const WIN = { x: 296, y: 150, w: 1156, h: 640 };
const RING = { x: WIN.x + WIN.w * 0.5, y: 470, r: 64 };

// 橱窗：窗框、里面的一圈暖光、戒指、底座、玻璃
function shopWindow(ctx, t) {
  // 后墙
  ctx.fillStyle = '#2E2620';
  ctx.fillRect(0, 0, 1920, 820);
  // 墙板竖缝：左边一条、右边两条，别让空墙是死平
  for (const x of [148, 1520, 1780]) {
    line(ctx, x, 60, x, 812, { seed: 4250 + x, lw: 2.5, color: '#3A3029', amp: 1.2, parts: 4 });
  }

  // 窗框（外框 + 内框）
  block(ctx, WIN.x - 22, WIN.y - 22, WIN.w + 44, WIN.h + 44, 8, '#3A2E28', { stroke: P.ink, lw: 8, seed: 2250 });

  // 窗内
  ctx.save();
  ctx.beginPath();
  ctx.rect(WIN.x, WIN.y, WIN.w, WIN.h);
  ctx.clip();
  ctx.fillStyle = '#241C18';
  ctx.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
  // 光：整幅窗唯一的暖源，半径 = 窗宽 50%，不铺满整扇
  const g = ctx.createRadialGradient(RING.x, RING.y, 10, RING.x, RING.y, WIN.w * 0.25);
  g.addColorStop(0, 'rgba(246,201,126,0.50)');
  g.addColorStop(0.55, 'rgba(246,201,126,0.16)');
  g.addColorStop(1, 'rgba(246,201,126,0)');
  ctx.fillStyle = g;
  ctx.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);

  // 底座
  block(ctx, RING.x - 78, 552, 156, 46, 6, '#2A211C', { stroke: P.ink, lw: 4, seed: 2252 });

  // 戒指
  ctx.beginPath();
  ctx.arc(RING.x, RING.y, RING.r, 0, Math.PI * 2);
  ctx.lineWidth = 17;
  ctx.strokeStyle = '#F1D9A8';
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.strokeStyle = P.ink;
  ctx.stroke();
  // 指环上的一点高光
  ctx.beginPath();
  ctx.arc(RING.x - RING.r * 0.62, RING.y - RING.r * 0.62, 9, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,246,225,0.9)';
  ctx.fill();
  // 宝石
  ctx.beginPath();
  ctx.arc(RING.x, RING.y - RING.r - 4, 19, 0, Math.PI * 2);
  ctx.fillStyle = '#E8A0A8';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = P.ink;
  ctx.stroke();

  // 玻璃的一道反光
  ctx.save();
  ctx.globalAlpha = 0.12;
  line(ctx, WIN.x + 150, WIN.y + WIN.h - 40, WIN.x + 640, WIN.y + 40, { seed: 3162, lw: 30, color: '#F7EFDD' });
  ctx.restore();
  ctx.restore();

  // 玻璃内缘
  ctx.save();
  ctx.globalAlpha = 0.4;
  block(ctx, WIN.x, WIN.y, WIN.w, WIN.h, 4, null, { stroke: P.ink, lw: 6, seed: 2251 });
  ctx.restore();

  // 台面
  block(ctx, 0, 820, 1920, 260, 0, '#4A3A32');
  line(ctx, 0, 820, 1920, 820, { seed: 2254, lw: 5, color: P.ink });

  // 右墙上一盏壁灯：主角站的地方不是一片死暗
  const fl = 0.85 + 0.15 * Math.sin(t * 3.1);
  glow(ctx, 1698, 300, 300, 'rgba(246,201,126,0.5)', 0.34 * fl);
  line(ctx, 1698, 240, 1698, 268, { seed: 2256, lw: 4, color: P.ink });
  block(ctx, 1666, 268, 64, 20, 6, '#2A211B', { stroke: P.ink, lw: 4, seed: 2257 });
}

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;

    // 一点慢推
    const z = lerp(1.0, 1.06, smooth(t / d));
    ctx.save();
    ctx.translate(960, 520);
    ctx.scale(z, z);
    ctx.translate(-960, -520);

    shopWindow(ctx, gt);

    // 戒指的呼吸光：只到窗宽 50%，别抢脸
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.6);
    glow(ctx, RING.x, RING.y, 170 + pulse * 42, 'rgba(246,201,126,0.55)', 0.55);

    const u = 25, by = 902;
    const walkIn = smooth(clamp(t / 0.95, 0, 1));
    const cx = lerp(1816, 1651, walkIn);

    // ---- 手的几次试探 ----
    // 第一次靠近 → 停住并明显收回一点 → 再靠近碰玻璃 → 轻压 → 最后又收回一点
    const reachA = smooth(clamp((t - 0.92) / 0.72, 0, 1));          // 第一次靠近
    const pull1 = smooth(clamp((t - 1.68) / 0.26, 0, 1));           // 停住后微微收回
    const reachB = smooth(clamp((t - 2.02) / 0.52, 0, 1));          // 再靠近
    const press = smooth(clamp((t - 3.42) / 0.22, 0, 1)) * (1 - smooth(clamp((t - 3.78) / 0.26, 0, 1)));
    const pull2 = smooth(clamp((t - 3.80) / 0.46, 0, 1));           // 最后收回一点，但不肯走

    // 0.42u ≈ 10 px 的收回、0.75u ≈ 19 px 的再靠近，肉眼读得出来
    const armUp = -1.10 * reachA + 0.42 * pull1 * reachA - 0.75 * reachB + 0.30 * pull2 * reachB
      - 0.05 * press + 0.02 * Math.sin(t * 2.2);
    const lean = -0.060 * reachA + 0.030 * pull1 * reachA - 0.045 * reachB + 0.020 * pull2 * reachB;
    const settleJ = t > 2.54 ? Math.sin((t - 2.54) * 7) * Math.max(0, 1 - (t - 2.54) * 2.4) * 0.6 : 0;

    const b = breath(t, { seed: 3940, period: 1.6, amp: 0.13, squashAmp: 0.011 });
    const sq = b.squash - settleJ * 0.004;

    // 短臂抵在玻璃上的位置（含身体倾斜）：指尖正好落在窗框右侧
    const lxp = -6.5 * u;
    const lyp = (-5 + armUp) * u;
    const tipX = cx + lxp * Math.cos(lean) - lyp * Math.sin(lean);
    const tipY = by + lxp * Math.sin(lean) + lyp * Math.cos(lean);

    // 玻璃里的倒影（镜面在窗框右缘）
    ctx.save();
    ctx.beginPath();
    ctx.rect(WIN.x, WIN.y, WIN.w, WIN.h);
    ctx.clip();
    ctx.globalAlpha = 0.09;
    ctx.filter = 'blur(3px)';
    clawd(ctx, {
      cx: 2 * (WIN.x + WIN.w) - cx, by, u,
      color: P.orange, flip: true, noInk: true,
      eyes: 'wide', mouth: 'o', seed: 3161,
      armR: armUp, rot: -lean,
    });
    ctx.restore();

    const eyeBlink = blink(t, { seed: 3940, enabled: t < 1.60 || (t > 2.36 && t < 3.42) });
    // 欲望 → 迟疑 → 又想要 → 还是迟疑：
    // 睁圆/o 是想要，眯起来/平嘴/眉垮下来是「这样对吗」。每次迟疑前眉先动（1.78 / 2.14 / 3.82）。
    const e = face(t, [
      { t: 0.00, eyes: 'wide', mouth: 'o', brow: 'up' },
      { t: 1.92, eyes: 'squint', mouth: 'flat', brow: 'worried' },
      { t: 2.28, eyes: 'wide', mouth: 'o', brow: 'up' },
      { t: 3.96, eyes: 'squint', mouth: 'flat', brow: 'worried' },
    ], 0.22);
    // 视线有落点：戒指（-0.5）→ 收回时移开（-0.15）→ 再回到戒指（-0.55）→ 最后又移开。
    const look = glance(t, [
      { t: 0.00, look: -0.50 },
      { t: 1.80, look: -0.15 },
      { t: 2.32, look: -0.55 },
      { t: 3.78, look: -0.55 },
      { t: 4.02, look: -0.10 },
    ], { dur: 0.11 });
    const eb = withBlink(e, eyeBlink);
    clawd(ctx, {
      cx, by, u,
      color: P.orange,
      ...eb,
      look,
      browDy: sum(prep(t, 1.78, { amp: 0.34 }), prep(t, 2.14, { amp: 0.34 }), prep(t, 3.82, { amp: 0.34 })),
      seed: 3160,
      armL: armUp,
      rot: lean,
      squash: sq,
      bodyDy: b.bodyDy,
      legs: [0, -0.06 * reachA, 0, -0.06 * reachA],
      sweat: reachA > 0.6,
    });

    // 手停在玻璃前：两次触碰，各漾开一圈
    const touches = [2.54, 3.55];
    for (const t0 of touches) {
      if (t < t0 || t > t0 + 1.0) continue;
      const life = (t - t0);
      const k = smooth(clamp(life / 0.10, 0, 1)) * (1 - smooth(clamp((life - 0.55) / 0.45, 0, 1)));
      ctx.save();
      ctx.globalAlpha = 0.58 * k;
      ctx.strokeStyle = 'rgba(241,217,168,0.95)';
      for (let i = 0; i < 2; i++) {
        const ph = clamp((life / 0.9) + i * 0.35, 0, 1);
        ctx.lineWidth = 3 * (1 - ph);
        ctx.beginPath();
        ctx.ellipse(tipX - 12, tipY, 26 + ph * 84, 16 + ph * 50, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      glow(ctx, tipX - 12, tipY, 140, 'rgba(246,201,126,0.75)', 0.6 * k);
    }

    // 戒指上的一点星芒
    const tw = 0.5 + 0.5 * Math.sin(t * 3.1);
    ctx.save();
    ctx.globalAlpha = 0.55 + 0.35 * tw;
    star(ctx, RING.x, RING.y - RING.r - 4, 26 + tw * 8, 6, 4, 'rgba(247,239,221,0.95)', 0.15);
    ctx.restore();

    ctx.restore();
  },
};