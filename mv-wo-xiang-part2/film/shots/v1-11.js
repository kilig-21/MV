import { bodyCloseup } from '../src/scenes2.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, glow, rr, clamp } from '../src/ink.js';
import { breatheSquash } from '../src/polish-v1.js';
import { faceE1, dart } from '../src/expr-e1.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const d = shot.t1 - shot.t0;
    bodyCloseup(ctx, gt);

    // 慢推 + 极轻的手持漂移
    const u = 36 + smooth(t / d) * 6;
    const cx = 960 + Math.sin(t * 0.9) * 2.4;
    const by = 880 + Math.sin(t * 0.7 + 1) * 1.5;
    const br = breatheSquash(t, 96, { period: 1.9 });

    // 低头看胸口：切进来就是含胸的姿势，线路亮到心口才直起来
    const dip = 1 - smooth((t - 1.12) / 0.42);

    // 肩背的一次轻微抽动：不是哭，是重量压了一下
    const shudder = Math.max(0, 1 - Math.abs(t - 1.84) / 0.14) * (0.5 + 0.5 * Math.sin(t * 40));

    // 睁眼是这个镜头的终点：线路亮到心口（≈1.05 s）之后才睁。
    // 不再是「3 帧硬切」——眼睑用 squint 停一下再完全抬起，看得出是睁开的动作。
    const f = faceE1(t, [
      { at: 0.00, eyes: 'closed', mouth: 'none' },
      { at: 1.16, eyes: 'squint', mouth: 'none', ramp: 0.10 },
      { at: 1.34, eyes: 'look', mouth: 'none', ramp: 0.12 },
      { at: 2.14, eyes: 'teary', mouth: 'flat', brow: 'worried', ramp: 0.22 },
      { at: 2.46, eyes: 'tired', mouth: 'none', ramp: 0.20 },
    ], { seed: 96, ramp: 0.16, noBlink: true });

    // 睁眼时先看胸口，再抬回平视；2.2 之后落回脚下。三下都是「看一眼」
    const look = dart(t, [
      { t: 0.00, look: 0.00 },
      { t: 1.34, look: 0.50 },
      { t: 2.24, look: -0.42 },
    ], { dur: 0.12 });

    clawd(ctx, {
      cx, by: by + dip * 5, u,
      color: P.orange,
      eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
      look,
      seed: 96,
      bodyDy: 0.10 * dip,
      armL: -0.15 + shudder * 0.08 - dip * 0.10,
      armR: -0.15 - shudder * 0.06 - dip * 0.10,
      rot: 0.019 * dip + Math.sin(t * 0.8) * 0.004 + shudder * 0.012,
      squash: br * (1 - 0.024 * dip) - shudder * 0.008,
    });

    // 旧耳机线缠在短臂上：线头随呼吸轻摆
    const swayWire = Math.sin(t * 1.5 + 0.6) * 0.12;
    ctx.save();
    ctx.strokeStyle = P.ink;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 7.2 * u, by - 5.2 * u);
    ctx.bezierCurveTo(cx - 8.6 * u, by - 2 * u, cx - 6.4 * u, by - 1.2 * u, cx - 7.4 * u + swayWire * u, by - 0.4 * u);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 7.2 * u, by - 5.2 * u);
    ctx.bezierCurveTo(cx + 8.8 * u, by - 2.6 * u, cx + 6.2 * u, by - 1.6 * u, cx + 7.6 * u - swayWire * u, by - 0.6 * u);
    ctx.stroke();
    ctx.restore();

    // 胸口透出地铁线路图的光：这一次按「呼吸一段段亮」——三条线各自起亮，
    // 每 0.25 s 亮一段，最后一段亮到心口时，才轮到睁眼。
    const segAt = [0.28, 0.53, 0.78];
    const seg = segAt.map(a => smooth((t - a) / 0.24));
    const on = Math.max(seg[0], seg[1], seg[2], 0);
    if (on > 0) {
      const x0 = cx - 4.8 * u, x1 = cx + 4.8 * u;
      const y0 = by - 4.5 * u, y1 = by - 1.9 * u;
      const W = x1 - x0, H = y1 - y0;

      ctx.save();
      rr(ctx, cx - 5.5 * u, by - 9 * u, 11 * u, 7 * u, 1.9 * u, 96, 0.8);
      ctx.clip();

      const lines = [
        [[0.08, 0.22], [0.34, 0.34], [0.34, 0.70], [0.92, 0.78]],
        [[0.16, 0.86], [0.16, 0.52], [0.62, 0.52], [0.86, 0.30]],
        [[0.5, 0.08], [0.5, 0.34], [0.74, 0.62]],
      ];
      // 每条线亮起来之后，一站一站往下走（按呼吸的节拍，一站 0.12 s）
      const drawLines = (lw, col, alpha, shift = 0) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = col;
        ctx.lineWidth = lw;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        lines.forEach((pts, k) => {
          const grow = clamp(seg[k] * 1.15 + shift, 0, 1);
          if (grow <= 0) return;
          const total = (pts.length - 1) * grow;
          const n = Math.floor(total);
          ctx.beginPath();
          for (let i = 0; i <= n; i++) {
            const [px, py] = pts[Math.min(i, pts.length - 1)];
            const X = x0 + W * px, Y = y0 + H * py;
            i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
          }
          const fr = total - n;
          if (n < pts.length - 1) {
            const a = pts[n], b = pts[n + 1];
            ctx.lineTo(x0 + W * (a[0] + (b[0] - a[0]) * fr), y0 + H * (a[1] + (b[1] - a[1]) * fr));
          }
          ctx.stroke();
        });
        ctx.restore();
      };
      // 一列光沿着线路走：让线路图“活着”
      const travel = (t * 0.55) % 1;
      drawLines(16, 'rgba(246,201,126,0.35)', 0.9 * on);
      drawLines(6, '#FFEFC8', 0.95 * on);
      drawLines(9, 'rgba(255,246,210,0.55)', Math.max(0, 0.6 - Math.abs(travel - 0.5) * 1.2), travel * 0.15);

      // 站点：跟着各自那一段的进度一盏盏亮
      ctx.save();
      ctx.globalAlpha = on;
      const stations = [
        [0.34, 0.34, 0], [0.34, 0.70, 0], [0.62, 0.52, 1],
        [0.16, 0.86, 1], [0.86, 0.30, 1], [0.74, 0.62, 2],
      ];
      stations.forEach(([px, py, k], i) => {
        const lit = clamp((seg[k] - 0.35 - i * 0.06) / 0.25, 0, 1);
        if (lit <= 0) return;
        const pulse = 0.75 + 0.25 * Math.sin(t * 2.2 - i * 0.9);
        ctx.beginPath();
        ctx.arc(x0 + W * px, y0 + H * py, 8 + lit * 2.4 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = '#FFF3D2'; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = P.orange; ctx.stroke();
      });
      ctx.restore();
      ctx.restore();

      // 心口的亮：最后一段亮到时最亮
      glow(ctx, cx, by - 5.2 * u, 6.4 * u, 'rgba(246,201,126,0.45)', 0.55 * on);
      // 光从胸口照上来，先把下巴和脸的下缘点亮——「他在看自己的胸口」这件事看得见
      glow(ctx, cx, by - 7.6 * u, 5.6 * u, 'rgba(255,236,196,0.36)', 0.30 * seg[2]);
    }
  },
};