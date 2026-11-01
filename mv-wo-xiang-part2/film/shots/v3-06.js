import { roofAntenna } from '../src/scenes-verse3.js';
import { clawd, groundShadow } from '../src/character.js';
import { P } from '../src/palette.js';
import { glow, line, clamp, smooth } from '../src/ink.js';
import { settle } from '../src/scenes-verse3a.js';
import { breath, blink, sway } from '../src/life.js';
import { face, glance, prep, withBlink } from '../src/expr-e4.js';

// v3-06 如今他正在走向伟大你能感知讯号——天线上一圈圈信号扩散到城市，越过角色
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    const m = roofAntenna(ctx, gt);
    const ax = m.antennaX, ay = 330;

    // 信号圈：从天线顶一圈圈推向城市
    const ringAt = ph => 80 + ph * 1080;
    for (let i = 0; i < 4; i++) {
      const ph = (t * 0.45 + i / 4) % 1;
      const r = ringAt(ph);
      ctx.save();
      ctx.globalAlpha = (1 - ph) * 0.6;
      ctx.strokeStyle = '#F6C97E';
      ctx.lineWidth = Math.max(2.5, 9 - ph * 6);
      ctx.beginPath();
      ctx.arc(ax, ay, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 天线杆上一层薄薄的城市反光，不然杆子读不出来
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = '#F6C97E';
    ctx.fillRect(ax - 4, 330, 8, 510);
    ctx.restore();
    glow(ctx, ax, 340, 300, 'rgba(246,201,126,0.5)', 0.30);

    // 天线中段一层暖雾，暗色的横担才在夜里读得出来
    glow(ctx, ax, 520, 300, 'rgba(246,201,126,0.55)', 0.24);

    // 横担提亮一道，让天线读得出结构
    for (let i = 0; i < 4; i++) {
      line(ctx, 1130, 420 + i * 70, 1270, 420 + i * 70, { seed: 2120 + i, lw: 4, color: 'rgba(247,221,168,0.6)' });
    }
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#C9A24E';
    for (let i = 0; i < 4; i++) {
      for (const xx of [1130, 1270]) {
        ctx.beginPath(); ctx.arc(xx, 420 + i * 70, 6, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();

    // 角色站在天线旁，抬手接信号
    const u = 27, cx = 820, by = 842;
    const b = breath(t, { seed: 305, period: 1.45, amp: 0.16, squashAmp: 0.010 });
    const sw = sway(t, { seed: 305, period: 2.6, armAmp: 0.05 });
    const ringHit = settle(t, 1.02, 11, 0.05);      // 一圈扫过时轻轻一颤
    // 抬手不是一次到位：0.2 秒反向预备，再抬起来
    const lift = smooth(clamp((t - 0.10) / 0.55, 0, 1));
    const arm = -0.10 - 1.28 * lift + 0.05 * Math.sin(t * 3.1);
    // 信号扫过的零点几秒：先是睁圆（wide） → 眼睛里亮一下（sparkle）→ 收回 wide。
    // 眉先抬（0.86 的 browLift），视线 1.00 先转向天线再等表情跟上。
    const e = face(t, [
      { t: 0.00, eyes: 'wide', mouth: 'o', brow: 'up' },
      { t: 1.06, eyes: 'sparkle', mouth: 'smile', brow: 'up' },
      { t: 1.46, eyes: 'wide', mouth: 'smile', brow: 'up' },
    ], 0.14);
    const look = glance(t, [
      { t: 0.00, look: 0.85 },
      { t: 1.00, look: 0.62 },
    ], { dur: 0.09 });
    const eb = withBlink(e, blink(t, { seed: 305, enabled: !(t > 0.92 && t < 1.52) }));
    groundShadow(ctx, cx, by + 4, u, { alpha: 0.16, w: 6.2 });
    clawd(ctx, {
      cx: cx + sw.armL * 0, by: by + Math.sin(t * 2.6) * 1.6, u,
      color: P.orange,
      ...eb,
      look,
      browDy: prep(t, 0.88, { amp: 0.36 }),
      seed: 305, rot: 0.02 + sw.rot,
      squash: ringHit * b.squash,
      bodyDy: b.bodyDy,
      legs: [0, -0.08 + 0.02 * Math.sin(t * 2.2), 0, -0.08],
      armR: arm,
      armL: 0.12 + sw.armL,
    });

    // 最外那圈淡淡地掠过角色前面
    const phf = (t * 0.45) % 1;
    if (phf > 0.25) {
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.strokeStyle = '#F7DDA8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ax, ay, ringAt(phf), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 天线红灯呼吸
    const bl = 0.55 + 0.45 * Math.sin(t * 5.2);
    glow(ctx, ax, 316, 90, 'rgba(224,86,110,0.9)', 0.35 * bl);
    ctx.save();
    ctx.globalAlpha = 0.5 * bl;
    ctx.beginPath(); ctx.arc(ax, 316, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#E0566E'; ctx.fill();
    ctx.restore();
  },
};