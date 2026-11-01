// 梦境：副歌用。幻想元素都由生活物件长出（车票、明信片、耳机线、被子、唱片）
import { P } from './palette.js';
import { block, line, poly, curve, rr, rng, glow, star, bg, clamp, lerp, smooth } from './ink.js';

export function dreamSky(ctx, t, o = {}) {
  const top = o.top || '#12202C', mid = o.mid || '#23414F', low = o.low || '#2F5566';
  const g = ctx.createLinearGradient(0, 0, 0, 900);
  g.addColorStop(0, top);
  g.addColorStop(0.55, mid);
  g.addColorStop(1, low);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
  const R = rng(o.seed || 7);
  for (let i = 0; i < 46; i++) {
    const x = R() * 1920, y = R() * 620, s = R() < 0.85 ? 2 : 3;
    ctx.globalAlpha = 0.25 + R() * 0.35;
    ctx.fillStyle = R() < 0.3 ? P.lamp : P.cream;
    ctx.fillRect(x, y, s, s);
  }
  ctx.globalAlpha = 1;
  // 月牙
  const mx = o.moonX ?? 1560, my = o.moonY ?? 180, mr = o.moonR ?? 56;
  ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fillStyle = '#EBDDB4'; ctx.fill();
  ctx.beginPath(); ctx.arc(mx - mr * 0.5, my - mr * 0.18, mr * 0.9, 0, Math.PI * 2); ctx.fillStyle = mid; ctx.fill();
  ctx.beginPath(); ctx.arc(mx, my, mr, Math.PI * 0.36, Math.PI * 1.72);
  ctx.lineWidth = 4; ctx.strokeStyle = P.ink; ctx.stroke();
}

export function sea(ctx, t, o = {}) {
  const y0 = o.y ?? 760;
  ctx.fillStyle = '#24424F'; ctx.fillRect(0, y0, 1920, 1080 - y0);
  for (let i = 0; i < 5; i++) {
    const y = y0 + 30 + i * 56;
    ctx.beginPath();
    for (let x = -20; x <= 1940; x += 80) {
      const yy = y + Math.sin((x * 0.008) + t * 0.8 + i) * 7;
      x === -20 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    }
    ctx.lineWidth = 3.5; ctx.strokeStyle = i % 2 ? 'rgba(190,220,225,0.22)' : 'rgba(240,220,180,0.18)';
    ctx.stroke();
  }
}

// 漂浮的车票平台
export function ticketPlatform(ctx, x, y, w, t, o = {}) {
  const bob = Math.sin(t * 1.2 + (o.phase || 0)) * 6;
  const yy = y + bob;
  ctx.save();
  ctx.translate(x, yy);
  ctx.rotate((o.rot || 0) + Math.sin(t * 0.7 + (o.phase || 0)) * 0.012);
  block(ctx, -w / 2, -18, w, 36, 8, o.color || '#E8D5B0', { stroke: P.ink, lw: 5, seed: o.seed || 11 });
  // 撕口
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(-w / 2 + 14 + i * 14, -18, 4, 0, Math.PI, true);
    ctx.fillStyle = '#24424F'; ctx.fill();
  }
  line(ctx, -w / 2 + 22, 2, w / 2 - 22, 2, { seed: (o.seed || 11) + 1, lw: 2, color: 'rgba(120,100,70,0.5)' });
  ctx.restore();
  return yy;
}

// 由明信片折成的小舟
export function paperBoat(ctx, x, y, s, t) {
  const bob = Math.sin(t * 1.5) * 5;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate(Math.sin(t * 0.8) * 0.03);
  const w = s;
  poly(ctx, [[-w, 0], [w, 0], [w * 0.62, w * 0.52], [-w * 0.62, w * 0.52]],
    { fill: '#F2E3C6', stroke: P.ink, lw: 5, seed: 21 });
  poly(ctx, [[0, -w * 0.72], [w * 0.42, 0], [-w * 0.42, 0]],
    { fill: '#E8A0A8', stroke: P.ink, lw: 5, seed: 22 });
  // 邮票
  block(ctx, -w * 0.72, -w * 0.18, w * 0.28, w * 0.24, 3, P.pink, { stroke: P.ink, lw: 3, seed: 23 });
  ctx.restore();
}

export function windLines(ctx, t, n = 6, alpha = 0.5) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#DCE9EC';
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const y = 180 + i * 120;
    const off = ((t * 220 + i * 190) % 2600) - 300;
    ctx.beginPath();
    ctx.lineWidth = 3 + (i % 3);
    for (let x = 0; x < 420; x += 40) {
      const px = off + x;
      const py = y + Math.sin((px * 0.01) + t * 2 + i) * 18;
      x === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

export function rainLines(ctx, t, n = 60) {
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = '#9FC3CE';
  ctx.lineWidth = 3;
  const R = rng(31);
  for (let i = 0; i < n; i++) {
    const sp = 900 + R() * 500;
    const x = ((R() * 2200 + t * 120) % 2200) - 140;
    const y = ((R() * 1200 + t * sp) % 1200) - 60;
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x - 14, y + 46);
    ctx.stroke();
  }
  ctx.restore();
}

export function noteIcons(ctx, t, n = 10, alpha = 0.8) {
  const R = rng(47);
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let i = 0; i < n; i++) {
    const bx = R() * 1920, by = 120 + R() * 700;
    const x = bx + Math.sin(t * 0.9 + i) * 40;
    const y = by - ((t * 40 + i * 70) % 320);
    ctx.fillStyle = i % 3 ? '#EBDDB4' : '#E8A0A8';
    ctx.beginPath(); ctx.ellipse(x, y, 13, 10, -0.35, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x + 10, y - 52, 5, 50);
    ctx.beginPath();
    ctx.moveTo(x + 15, y - 52);
    ctx.quadraticCurveTo(x + 40, y - 44, x + 28, y - 26);
    ctx.quadraticCurveTo(x + 33, y - 42, x + 15, y - 44);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// 云床：被子从床上长出来
export function cloudBed(ctx, x, y, w, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#E6DCC6';
  ctx.strokeStyle = P.ink;
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) {
    const px = -w / 2 + (w / 6) * i;
    const py = Math.sin(i * 1.3 + t * 0.6) * 12;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  for (let i = 6; i >= 0; i--) {
    const px = -w / 2 + (w / 6) * i;
    const py = 70 + Math.sin(i * 1.1 + t * 0.5) * 14;
    ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// 节拍圈
export function beatRings(ctx, x, y, t, u = 1) {
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const k = ((t * 0.9 + i / 3) % 1);
    ctx.beginPath();
    ctx.globalAlpha = (1 - k) * 0.5;
    ctx.lineWidth = 4 * (1 - k * 0.5);
    ctx.strokeStyle = '#F1D9A8';
    ctx.ellipse(x, y, (40 + k * 190) * u, (14 + k * 60) * u, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}