// 角色绘制：官方 Clawd 15×16 骨架 → 扁平手绘粗描边
// 比例、部件位置、挂载点全部来自 character-lock/official/rig.json，不得改动。
import { P } from './palette.js';
import { rr, rng, clamp, line } from './ink.js';

const RIG = {
  torso: [2, 6, 11, 7, 1.9],
  armL: [0, 9, 2, 2, 0.62],
  armR: [13, 9, 2, 2, 0.62],
  legs: [
    [3, 13, 1, 2, 0.5],
    [5, 13, 1, 2, 0.5],
    [9, 13, 1, 2, 0.5],
    [11, 13, 1, 2, 0.5],
  ],
};
const GRIP = { left: [0, 10], right: [15, 10] };
export const CHAR_UNITS = { w: 15, h: 16, baseY: 15, bodyTop: 6 };

// ---- 离屏缓冲（一个模块共用，顺序绘制）----
const buf = { mask: null, fill: null, ink: null, w: 0, h: 0 };
function ensure(size) {
  const n = Math.ceil(size);
  if (buf.w < n || buf.h < n) {
    const s = Math.max(n, 64);
    for (const k of ['mask', 'fill', 'ink']) {
      const c = document.createElement('canvas');
      c.width = s; c.height = s;
      buf[k] = c;
    }
    buf.w = s; buf.h = s;
  }
}
const RING = 26;
const RING_OFF = Array.from({ length: RING }, (_, i) => {
  const a = i / RING * Math.PI * 2;
  return [Math.cos(a), Math.sin(a)];
});

function heartPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x - s * 0.95, y - s * 0.35, x - s * 0.5, y - s * 1.05, x, y - s * 0.42);
  ctx.bezierCurveTo(x + s * 0.5, y - s * 1.05, x + s * 0.95, y - s * 0.35, x, y + s * 0.35);
  ctx.closePath();
}

/**
 * 画一只小螃蟹。
 * cx, by: 中心 x / 脚底基线 y（rig y=15）
 * u: 每 rig 单位多少像素（角色宽 15u，高 9u）
 */
export function clawd(ctx, o = {}) {
  const u = o.u || 26;
  const cx = o.cx ?? 960;
  const by = o.by ?? 800;
  const color = o.color || P.orange;
  const lwU = o.lw ?? 0.30;              // 描边宽度（单位 = 0.30u）
  const R = lwU * u;
  const amp = o.amp ?? Math.max(0.6, 0.018 * u);
  const seed = o.seed ?? 7;

  const wUnits = 15, hUnits = 16;
  const PAD = R + 6;
  const W = wUnits * u + PAD * 2, H = hUnits * u + PAD * 2;
  ensure(Math.max(W, H));

  const m = buf.mask.getContext('2d');
  m.setTransform(1, 0, 0, 1, 0, 0);
  m.clearRect(0, 0, buf.mask.width, buf.mask.height);
  m.fillStyle = '#ffffff';
  const X = rx => PAD + rx * u;
  const Y = ry => PAD + ry * u;

  const arms = [o.armL || 0, o.armR || 0];      // 单位偏移 y
  const lifts = o.legs || [0, 0, 0, 0];

  const parts = [];
  const [tx, ty, tw, th, tr] = RIG.torso;
  parts.push([tx, ty + (o.bodyDy || 0), tw, th, tr]);
  parts.push([RIG.armL[0], RIG.armL[1] + arms[0], RIG.armL[2], RIG.armL[3], RIG.armL[4]]);
  parts.push([RIG.armR[0], RIG.armR[1] + arms[1], RIG.armR[2], RIG.armR[3], RIG.armR[4]]);
  RIG.legs.forEach((L, i) => parts.push([L[0], L[1] + lifts[i], L[2], L[3], L[4]]));

  for (const [x, y, w, h, r] of parts) {
    rr(m, X(x), Y(y), w * u, h * u, r * u, seed + Math.round(x * 13 + y * 7), amp);
    m.fill();
  }

  const f = buf.fill.getContext('2d');
  f.setTransform(1, 0, 0, 1, 0, 0);
  f.clearRect(0, 0, buf.fill.width, buf.fill.height);
  f.drawImage(buf.mask, 0, 0);
  f.globalCompositeOperation = 'source-in';
  f.fillStyle = color;
  f.fillRect(0, 0, W, H);
  f.globalCompositeOperation = 'source-over';

  const k = buf.ink.getContext('2d');
  k.setTransform(1, 0, 0, 1, 0, 0);
  k.clearRect(0, 0, buf.ink.width, buf.ink.height);
  k.drawImage(buf.mask, 0, 0);
  k.globalCompositeOperation = 'source-in';
  k.fillStyle = P.ink;
  k.fillRect(0, 0, W, H);
  k.globalCompositeOperation = 'source-over';

  // 合成到主画布
  ctx.save();
  ctx.translate(cx, by);
  if (o.rot) ctx.rotate(o.rot);
  if (o.flip) ctx.scale(-1, 1);
  const sx = o.squash ? 1 / o.squash : 1;
  const sy = o.squash || 1;
  ctx.scale(sx, sy);
  const dx = -PAD - 7.5 * u;      // rig x=0 → -7.5u-PAD
  const dy = -PAD - 15 * u;      // rig y=0 → -15u-PAD
  if (!o.noInk) for (const [ox, oy] of RING_OFF) ctx.drawImage(buf.ink, dx + ox * R, dy + oy * R);
  ctx.drawImage(buf.fill, dx, dy);
  drawFace(ctx, { u, color, seed, ...o });
  ctx.restore();

  return { x: cx - 7.5 * u, y: by - 9 * u, w: 15 * u, h: 9 * u };
}

// ---- 表情 ----
// eyes / mouth / brow 除了原来的字符串，还接受混合值 { a, b, p }：
//   先以 1-p 的透明度画 a，再以 p 的透明度叠画 b；p<=0 等价于纯 a，p>=1 等价于纯 b。
// 字符串入参走的是完全没变的老路径（drawFace → paintFace 单次调用），逐像素不变。
const isBlend = v => v !== null && typeof v === 'object';

// 同一个绘制函数，按透明度画一次或叠画两次。
function drawBlended(ctx, val, draw) {
  if (val == null) return;
  if (typeof val !== 'object') { draw(val); return; }
  const a = val.a ?? null, b = val.b ?? null;
  let p = Number(val.p);
  p = Number.isFinite(p) ? (p <= 0 ? 0 : p >= 1 ? 1 : p) : 0;
  if (p === 0) { if (a != null) draw(a); return; }
  if (p === 1) { if (b != null) draw(b); return; }
  if (a != null) { ctx.save(); ctx.globalAlpha *= 1 - p; draw(a); ctx.restore(); }
  if (b != null) { ctx.save(); ctx.globalAlpha *= p; draw(b); ctx.restore(); }
}

// 有任何混合字段时，把脸拆成「眼 / 眉 / 嘴 / 腮红汗滴」四层各画一次。
// 四层互不重叠、也不依赖彼此的 canvas 状态，所以和单次顺序绘制的像素结果一致。
function drawFace(ctx, o) {
  const E = o.eyes, M = o.mouth, B = o.brow;
  if (!isBlend(E) && !isBlend(M) && !isBlend(B)) return paintFace(ctx, o);

  const eye = st => paintFace(ctx, { ...o, eyes: st, mouth: 'none', brow: null, blush: false, sweat: false });
  const brow = st => paintFace(ctx, { ...o, eyes: 'none', mouth: 'none', brow: st, blush: false, sweat: false });
  const mouth = st => paintFace(ctx, { ...o, eyes: 'none', mouth: st, brow: null, blush: false, sweat: false });
  const deco = () => paintFace(ctx, { ...o, eyes: 'none', mouth: 'none', brow: null });

  if (isBlend(E)) drawBlended(ctx, E, eye); else eye(E);
  if (isBlend(B)) drawBlended(ctx, B, brow); else if (B) brow(B);
  if (isBlend(M)) drawBlended(ctx, M, mouth); else mouth(M);
  if (o.blush || o.sweat) deco();
}

function paintFace(ctx, o) {
  const u = o.u;
  const look = (o.look || 0) * 0.28 * u;
  const ey = (9 - 15) * u;         // rig y 9
  const lx = (4.5 - 7.5) * u + look;
  const rx = (10.5 - 7.5) * u + look;
  const eyes = o.eyes || 'normal';
  const ink = P.ink;

  const bar = (x, h, w = 0.92 * u) => {
    ctx.beginPath();
    const hh = h * u;
    const r = Math.min(w, hh) / 2;
    ctx.roundRect(x - w / 2, ey - hh / 2, w, hh, r);
    ctx.fillStyle = ink;
    ctx.fill();
  };
  const circle = (x, rad, fill = ink) => {
    ctx.beginPath(); ctx.arc(x, ey, rad * u, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill();
  };
  const smileArc = (x, dir = 1) => {
    ctx.beginPath();
    ctx.lineWidth = 0.34 * u;
    ctx.lineCap = 'round';
    ctx.strokeStyle = ink;
    if (dir > 0) { ctx.arc(x, ey + 0.25 * u, 0.62 * u, Math.PI * 1.15, Math.PI * 1.85); }
    else { ctx.arc(x, ey + 0.25 * u, 0.62 * u, Math.PI * 1.15, Math.PI * 1.85); }
    ctx.stroke();
  };
  const tiltBar = (x, y, h, rot) => {
    ctx.save();
    const hh = h * u, w = 0.68 * u;
    const c = Math.cos(rot), s2 = Math.sin(rot);
    const px = [-w / 2, w / 2, w / 2, -w / 2], py = [-hh / 2, -hh / 2, hh / 2, hh / 2];
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const X = x + px[i] * c - py[i] * s2, Y = y + px[i] * s2 + py[i] * c;
      i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
    }
    ctx.closePath();
    ctx.fillStyle = ink; ctx.fill();
    ctx.restore();
  };
  const heartEye = (x) => {
    heartPath(ctx, x, ey + 0.35 * u, 0.95 * u);
    ctx.fillStyle = '#E0566E'; ctx.fill();
    ctx.lineWidth = 0.13 * u; ctx.strokeStyle = ink; ctx.stroke();
    // 高光
    ctx.beginPath();
    ctx.arc(x - 0.25 * u, ey - 0.28 * u, 0.12 * u, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,240,235,.85)'; ctx.fill();
  };

  switch (eyes) {
    case 'none':
      break;
    case 'happy':          // ^ ^
      smileArc(lx, 1); smileArc(rx, 1);
      break;
    case 'closed':         // 睡觉：一条横线 + 下弯
      for (const x of [lx, rx]) {
        ctx.beginPath();
        ctx.lineWidth = 0.26 * u; ctx.lineCap = 'round'; ctx.strokeStyle = ink;
        ctx.arc(x, ey - 0.15 * u, 0.55 * u, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
      }
      break;
    case 'heart':
      heartEye(lx); heartEye(rx);
      break;
    case 'wide':
      circle(lx, 0.72); circle(rx, 0.72);
      ctx.beginPath(); ctx.arc(lx + 0.22 * u, ey - 0.26 * u, 0.16 * u, 0, Math.PI * 2);
      ctx.fillStyle = P.cream; ctx.fill();
      ctx.beginPath(); ctx.arc(rx + 0.22 * u, ey - 0.26 * u, 0.16 * u, 0, Math.PI * 2);
      ctx.fillStyle = P.cream; ctx.fill();
      break;
    case 'tired':
      bar(lx, 1.05); bar(rx, 1.05);
      break;
    case 'sad':
      tiltBar(lx, ey, 1.8, 0.18);
      tiltBar(rx, ey, 1.8, -0.18);
      break;
    case 'dot':
      circle(lx, 0.42); circle(rx, 0.42);
      break;
    case 'sparkle':
      ctx.fillStyle = ink;
      for (const x of [lx, rx]) {
        ctx.beginPath();
        ctx.moveTo(x, ey - 0.85 * u);
        ctx.lineTo(x + 0.24 * u, ey - 0.12 * u);
        ctx.lineTo(x + 0.85 * u, ey + 0.1 * u);
        ctx.lineTo(x + 0.24 * u, ey + 0.3 * u);
        ctx.lineTo(x, ey + 1.0 * u);
        ctx.lineTo(x - 0.24 * u, ey + 0.3 * u);
        ctx.lineTo(x - 0.85 * u, ey + 0.1 * u);
        ctx.lineTo(x - 0.24 * u, ey - 0.12 * u);
        ctx.closePath(); ctx.fill();
      }
      break;
    case 'look':
      bar(lx, 1.9); bar(rx, 1.9);
      break;
    case 'shock':          // 震惊：白眼球 + 缩小的瞳孔 + 上方短压线
      for (const x of [lx, rx]) {
        ctx.beginPath();
        ctx.arc(x, ey + 0.04 * u, 0.78 * u, 0, Math.PI * 2);
        ctx.fillStyle = P.cream; ctx.fill();
        ctx.lineWidth = 0.13 * u; ctx.strokeStyle = ink; ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + 0.05 * u, ey + 0.06 * u, 0.29 * u, 0, Math.PI * 2);
        ctx.fillStyle = ink; ctx.fill();
        ctx.beginPath();
        ctx.lineWidth = 0.18 * u; ctx.lineCap = 'round'; ctx.strokeStyle = ink;
        ctx.moveTo(x - 0.5 * u, ey - 1.02 * u);
        ctx.lineTo(x + 0.5 * u, ey - 1.02 * u);
        ctx.stroke();
      }
      break;
    case 'squint':         // 怀疑/半眯：上眼睑压低，只露下半眼
      for (const x of [lx, rx]) {
        ctx.beginPath();
        ctx.moveTo(x - 0.62 * u, ey - 0.02 * u);
        ctx.quadraticCurveTo(x, ey + 1.0 * u, x + 0.62 * u, ey - 0.02 * u);
        ctx.closePath();
        ctx.fillStyle = ink; ctx.fill();
        ctx.beginPath();
        ctx.lineWidth = 0.22 * u; ctx.lineCap = 'round'; ctx.strokeStyle = ink;
        ctx.moveTo(x - 0.7 * u, ey - 0.13 * u);
        ctx.lineTo(x + 0.7 * u, ey - 0.13 * u);
        ctx.stroke();
      }
      break;
    case 'side': {         // 侧目：眼球与瞳孔整体偏向 look 的一侧，身体不动
      const dir = (o.look || 0) === 0 ? 1 : Math.sign(o.look);
      for (const x of [lx, rx]) {
        ctx.beginPath();
        ctx.ellipse(x + dir * 0.1 * u, ey + 0.02 * u, 0.58 * u, 0.72 * u, 0, 0, Math.PI * 2);
        ctx.fillStyle = P.cream; ctx.fill();
        ctx.lineWidth = 0.13 * u; ctx.strokeStyle = ink; ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + dir * 0.32 * u, ey + 0.03 * u, 0.23 * u, 0, Math.PI * 2);
        ctx.fillStyle = ink; ctx.fill();
      }
      break;
    }
    case 'teary':          // 委屈：正常眼型 + 下缘一条亮线
      bar(lx, 1.9); bar(rx, 1.9);
      for (const x of [lx, rx]) {
        ctx.beginPath();
        ctx.lineWidth = 0.14 * u; ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(198,234,242,0.95)';
        ctx.moveTo(x - 0.34 * u, ey + 0.7 * u);
        ctx.quadraticCurveTo(x, ey + 0.94 * u, x + 0.34 * u, ey + 0.7 * u);
        ctx.stroke();
      }
      break;
    case 'dazed':          // 走神：瞳孔上翻、不对焦
      for (const x of [lx, rx]) {
        ctx.beginPath();
        ctx.ellipse(x, ey + 0.02 * u, 0.58 * u, 0.72 * u, 0, 0, Math.PI * 2);
        ctx.fillStyle = P.cream; ctx.fill();
        ctx.lineWidth = 0.13 * u; ctx.strokeStyle = ink; ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + 0.07 * u, ey - 0.26 * u, 0.26 * u, 0, Math.PI * 2);
        ctx.fillStyle = ink; ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 0.16 * u, ey - 0.35 * u, 0.075 * u, 0, Math.PI * 2);
        ctx.fillStyle = P.cream; ctx.fill();
      }
      break;
    default:
      bar(lx, 1.9); bar(rx, 1.9);
  }

  // 眉毛
  // browDy：可选的整体上下偏移（rig 单位，负=向上），默认 0 → 与之前逐像素相同。
  // 配合 life.js 的 browLift() 做「抬起—落回」的微表情。
  if (o.brow) {
    const bdy = (o.browDy || 0) * u;
    for (const [x, s] of [[lx, -1], [rx, 1]]) {
      ctx.beginPath();
      ctx.lineWidth = 0.2 * u; ctx.lineCap = 'round'; ctx.strokeStyle = ink;
      if (o.brow === 'angry') {
        // 内低外高：内端（s 的反方向）压低，外端抬起
        ctx.moveTo(x - s * 0.55 * u, ey - 0.83 * u + bdy);
        ctx.lineTo(x + s * 0.55 * u, ey - 1.23 * u + bdy);
      } else {
        ctx.moveTo(x - 0.55 * u, ey - 1.05 * u - (o.brow === 'up' ? 0.1 * u : 0) + bdy);
        ctx.lineTo(x + 0.55 * u, ey - 1.05 * u + (o.brow === 'worried' ? 0.28 * u : -0.05 * u) + bdy);
      }
      ctx.stroke();
    }
  }

  // 嘴
  const my = (11.2 - 15) * u;
  const mouth = o.mouth || 'none';
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (mouth === 'smile') {
    ctx.beginPath(); ctx.lineWidth = 0.26 * u; ctx.strokeStyle = ink;
    ctx.arc(0, my - 0.4 * u, 0.72 * u, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
  } else if (mouth === 'grin') {
    ctx.beginPath();
    ctx.moveTo(-0.78 * u, my - 0.35 * u);
    ctx.quadraticCurveTo(0, my + 0.62 * u, 0.78 * u, my - 0.35 * u);
    ctx.quadraticCurveTo(0, my - 0.05 * u, -0.78 * u, my - 0.35 * u);
    ctx.closePath();
    ctx.fillStyle = ink; ctx.fill();
    // 舌头
    ctx.beginPath();
    ctx.ellipse(0, my + 0.18 * u, 0.32 * u, 0.16 * u, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#D9737F'; ctx.fill();
  } else if (mouth === 'o') {
    ctx.beginPath();
    ctx.ellipse(0, my - 0.1 * u, 0.3 * u, 0.4 * u, 0, 0, Math.PI * 2);
    ctx.fillStyle = ink; ctx.fill();
  } else if (mouth === 'wavy') {
    ctx.beginPath(); ctx.lineWidth = 0.22 * u; ctx.strokeStyle = ink;
    ctx.moveTo(-0.6 * u, my - 0.25 * u);
    ctx.quadraticCurveTo(-0.25 * u, my - 0.6 * u, 0, my - 0.25 * u);
    ctx.quadraticCurveTo(0.25 * u, my + 0.1 * u, 0.6 * u, my - 0.25 * u);
    ctx.stroke();
  } else if (mouth === 'flat') {
    ctx.beginPath(); ctx.lineWidth = 0.22 * u; ctx.strokeStyle = ink;
    ctx.moveTo(-0.5 * u, my - 0.15 * u); ctx.lineTo(0.5 * u, my - 0.15 * u); ctx.stroke();
  } else if (mouth === 'smirk') {
    // 一侧嘴角上扬：微笑弧 + 右嘴角翘起
    ctx.beginPath(); ctx.lineWidth = 0.22 * u; ctx.strokeStyle = ink;
    ctx.moveTo(-0.52 * u, my - 0.02 * u);
    ctx.quadraticCurveTo(0, my + 0.26 * u, 0.5 * u, my - 0.18 * u);
    ctx.stroke();
    ctx.beginPath(); ctx.lineWidth = 0.2 * u; ctx.strokeStyle = ink;
    ctx.moveTo(0.5 * u, my - 0.18 * u);
    ctx.lineTo(0.6 * u, my - 0.4 * u);
    ctx.stroke();
  } else if (mouth === 'pout') {
    // 下唇微凸：上唇轻压，下唇向下鼓
    ctx.beginPath(); ctx.lineWidth = 0.2 * u; ctx.strokeStyle = ink;
    ctx.moveTo(-0.42 * u, my - 0.2 * u);
    ctx.quadraticCurveTo(0, my - 0.32 * u, 0.42 * u, my - 0.2 * u);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-0.36 * u, my - 0.02 * u);
    ctx.quadraticCurveTo(0, my + 0.42 * u, 0.36 * u, my - 0.02 * u);
    ctx.closePath();
    ctx.fillStyle = ink; ctx.fill();
  }

  // 腮红
  if (o.blush) {
    for (const x of [-2.9, 2.9]) {
      ctx.beginPath();
      ctx.ellipse(x * u * 0.62, my - 0.55 * u, 0.86 * u, 0.5 * u, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(214,96,116,0.38)';
      ctx.fill();
    }
  }

  // 汗滴
  if (o.sweat) {
    ctx.beginPath();
    ctx.moveTo(3.9 * u, ey - 1.5 * u);
    ctx.quadraticCurveTo(4.55 * u, ey - 0.5 * u, 3.9 * u, ey - 0.35 * u);
    ctx.quadraticCurveTo(3.25 * u, ey - 0.5 * u, 3.9 * u, ey - 1.5 * u);
    ctx.fillStyle = '#8FBAC6'; ctx.strokeStyle = ink; ctx.lineWidth = 0.1 * u;
    ctx.fill(); ctx.stroke();
  }
}

// ---- 地面阴影：贴地，不是 3D 投影 ----
export function groundShadow(ctx, cx, by, u, o = {}) {
  ctx.save();
  ctx.globalAlpha = o.alpha ?? 0.16;
  ctx.fillStyle = o.color || P.ink;
  ctx.beginPath();
  ctx.ellipse(cx, by + u * 0.28, u * (o.w ?? 6.2), u * 0.66, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---- 道具附着 ----
export function grip(cx, by, u, side) {
  const gx = (side === 'left' ? GRIP.left[0] : GRIP.right[0]) - 7.5;
  const gy = (side === 'left' ? GRIP.left[1] : GRIP.right[1]) - 15;
  return { x: cx + gx * u, y: by + gy * u };
}

// ---- 特效 ----
export function zzz(ctx, x, y, u, t, alpha = 1, color = P.ink) {
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.6 + i * 0.33) % 1;
    const s = u * (1.15 + ph * 0.55);
    ctx.save();
    ctx.translate(x + i * u * 0.75 + ph * u * 0.9, y - i * u * 0.85 - ph * u * 1.5);
    ctx.globalAlpha = alpha * (1 - ph * 0.55);
    ctx.fillStyle = color;
    ctx.font = `500 ${Math.round(s)}px NotoSansSC`;
    ctx.fillText('Z', 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

export function heartFloat(ctx, x, y, s, color = '#E0566E', alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  heartPath(ctx, x, y, s);
  ctx.fillStyle = color; ctx.fill();
  ctx.lineWidth = s * 0.14; ctx.strokeStyle = P.ink; ctx.stroke();
  ctx.restore();
}

export function drop(ctx, x, y, s, color = '#8FBAC6') {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.quadraticCurveTo(x + s * 0.7, y, x, y + s * 0.25);
  ctx.quadraticCurveTo(x - s * 0.7, y, x, y - s);
  ctx.fillStyle = color; ctx.fill();
  ctx.lineWidth = s * 0.18; ctx.strokeStyle = P.ink; ctx.stroke();
  ctx.restore();
}