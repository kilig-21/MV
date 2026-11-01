// verse3 打磨轮的共用小动作。
// 呼吸 / 眨眼 / 视线 / 小动作统一走 src/life.js（角色生命感系统）；
// 这里只放 life.js 没有的东西：几条动作曲线、热气、声波。
import { clamp, smooth, lerp } from './ink.js';

// ---- 预备—过量—回落 ----
// easeOutBack：到位时过冲 3–6% 再回落。用在抬臂、转头、迈步这类有意图的动作上。
export function backOut(k, s = 1.26) {
  k = clamp(k, 0, 1) - 1;
  return k * k * ((s + 1) * k + s) + 1;
}

// 带反向预备的到位曲线：k<prep 时先往反方向压一点，再冲到位、过冲、安定。
export function prepOut(k, prep = 0.14, over = 0.12) {
  k = clamp(k, 0, 1);
  if (k < prep) return -over * (k / prep);
  const q = (k - prep) / (1 - prep);
  if (q < 0.72) return lerp(-over, 1 + over * 0.6, smooth(q / 0.72));
  return lerp(1 + over * 0.6, 1, smooth((q - 0.72) / 0.28));
}

// 一次「停一下」的时间额度：给队列里某个人的步速做减法用。
// 幅值 0.4 时，中点导数为 1，速度刚好放到 0，不会倒着走。
export function holdAmount(t, t0, span = 0.6, amp = 0.4) {
  return amp * smooth((t - t0) / span);
}

// ---- 热气：几缕各自速度、各自摆动，一直在动 ----
export function steamSoft(ctx, x, y, t, o = {}) {
  const n = o.n ?? 5;
  const h = o.h ?? 150;
  const amp = o.amp ?? 14;
  const col = o.color || 'rgba(240,228,205,0.9)';
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const sp = 0.38 + (i % 3) * 0.10;
    const ph = (t * sp + i * 0.37) % 1;
    const yy = y - ph * h;
    const xx = x + Math.sin(ph * 4.4 + i * 2.3 + t * 0.55) * amp * (0.35 + ph);
    ctx.globalAlpha = (o.alpha ?? 0.62) * Math.sin(ph * Math.PI) * (0.78 + 0.22 * Math.sin(t * 1.6 + i * 1.7));
    ctx.lineWidth = 3.0 + 3.6 * (1 - ph);
    ctx.strokeStyle = col;
    ctx.beginPath();
    ctx.moveTo(xx, yy);
    ctx.quadraticCurveTo(xx + amp * 0.9 * (1 - ph), yy - h * 0.22, xx - amp * 0.55, yy - h * 0.4);
    ctx.stroke();
  }
  ctx.restore();
}

// ---- 声波：周期与透明度都会呼吸 ----
export function ripplesBreath(ctx, x, y, t, o = {}) {
  const n = o.count ?? 4;
  const period = o.period ?? 2.1;
  const start = o.start ?? 0;
  if (t <= start) return;
  const r0 = o.r0 ?? 120, r1 = o.r1 ?? 1600;
  const flat = o.flat ?? 0.66;
  for (let i = 0; i < n; i++) {
    const wob = 1 + 0.06 * Math.sin(i * 2.1 + 1.3);
    const ph = (((t - start) / (period * wob)) + i / n) % 1;
    const r = r0 + ph * (r1 - r0);
    const breathe = 0.76 + 0.24 * Math.sin(t * 1.9 + i * 1.31);
    ctx.save();
    ctx.globalAlpha = Math.pow(1 - ph, 1.35) * (o.alpha ?? 0.34) * breathe;
    ctx.strokeStyle = o.color || 'rgba(246,201,126,0.85)';
    ctx.lineWidth = (o.lw ?? 6) * (1 - ph * 0.5) * (0.9 + 0.1 * Math.sin(t * 2.2 + i));
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * flat, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}