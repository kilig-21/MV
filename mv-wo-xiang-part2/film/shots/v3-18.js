import { gramophone } from '../src/scenes-verse3.js';
import { soundWaves } from '../src/props.js';
import { P } from '../src/palette.js';
import { block, line, glow, poly, smooth, clamp, lerp } from '../src/ink.js';
import { ripplesBreath } from '../src/polish-v3.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;

    // 近景，慢推
    const z = lerp(1.18, 1.25, smooth(t / d));
    ctx.save();
    ctx.translate(1000, 640);
    ctx.scale(z, z);
    ctx.translate(-1000, -640);

    gramophone(ctx, gt);

    // 小灯（房间只有这一盏）：接触不良，轻轻闪
    const lampFlick = 1 - 0.16 * Math.abs(Math.sin(t * 11.3)) * (0.5 + 0.5 * Math.sin(t * 2.1));
    block(ctx, 574, 690, 52, 16, 4, '#6E5340', { stroke: P.ink, lw: 3, seed: 3180 });
    line(ctx, 600, 690, 600, 656, { seed: 3181, lw: 4, color: P.ink });
    poly(ctx, [[556, 656], [644, 656], [626, 612], [574, 612]], { fill: '#D9A03F', stroke: P.ink, lw: 4, seed: 3182 });
    glow(ctx, 600, 650, 260, 'rgba(246,201,126,0.45)', 0.5 * lampFlick);

    // 唱片在转：转速不是机器的匀，带着极轻的 wow
    ctx.save();
    ctx.translate(900, 660);
    ctx.rotate(t * 2.4 + 0.10 * Math.sin(t * 1.5) + 0.035 * Math.sin(t * 5.7));
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 30, Math.sin(a) * 30);
      ctx.lineTo(Math.cos(a) * 82, Math.sin(a) * 82);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(241,217,168,0.35)';
      ctx.stroke();
    }
    ctx.restore();

    // 唱针落下：抬着 → 落到唱片上
    const drop = smooth(clamp((t - 0.42) / 0.36, 0, 1));
    const px = 1100, py = 620;
    // 针落下去之后还会轻轻弹一下才咬住纹路
    const needleSettle = drop >= 1
      ? Math.sin(clamp((t - 0.78) / 0.30, 0, 1) * Math.PI * 2.2) * 4 * Math.exp(-(t - 0.78) * 6)
      : 0;
    const ex = lerp(1186, 928, drop);
    const ey = lerp(462, 692, drop) - needleSettle;
    // 转轴底座
    ctx.beginPath();
    ctx.arc(px, py, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#3A2E28'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = P.ink; ctx.stroke();
    line(ctx, px, py, ex, ey, { seed: 3183, lw: 11, color: P.ink, amp: 0.4, parts: 2 });
    line(ctx, px, py, ex, ey, { seed: 3184, lw: 6, color: '#8A7762', amp: 0.4, parts: 2 });
    ctx.beginPath();
    ctx.arc(ex, ey, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#3A2E28'; ctx.fill();
    ctx.lineWidth = 3.5; ctx.strokeStyle = P.ink; ctx.stroke();

    // 针尖接触时的一点顿挫
    if (drop > 0.9) {
      const k = (t - 0.78);
      glow(ctx, 928, 692, 110, 'rgba(246,201,126,0.55)', Math.max(0, 0.6 - k * 1.2));
    }

    // 声波从喇叭口出来
    if (t > 0.82) {
      // 声波一圈圈，间隔和亮度都在呼吸
      ripplesBreath(ctx, 1310, 548, t - 0.82, {
        count: 5, period: 0.62, r0: 26, r1: 190, flat: 0.62,
        alpha: 0.7, lw: 5, color: 'rgba(241,217,168,0.85)',
      });
    }

    ctx.restore();
  },
};