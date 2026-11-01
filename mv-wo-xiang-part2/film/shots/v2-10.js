import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { block, line, poly, glow, lerp, smooth, clamp, rng } from '../src/ink.js';
import { breath, sway } from '../src/life.js';
import { face, dart } from '../src/expr-e2.js';
import { eyesAt, handAt, penTo, deskPlane, easeTo } from '../src/fix-round3b.js';

// v2-10 写词的书桌：换轴到桌子左后方、低机位。
// 台灯只露半截在左画框，光从左侧斜打到桌面；纸堆压在左前景，他在右中景埋头写。
// 笔尾永远压左短臂的握点上；纸上的字就是笔尖走过的轨迹（不再是道具自己动）。

const U = 26, BY = 690, CX0 = 1352;
const PEN_U = 12.5;

// 四行短句（歌词本来就不成段），中间抬两次头看灯：眼睛先到，身体再到
const LINES = [
  { t0: 0.10, t1: 0.56, n: 0.72 },
  { t0: 0.62, t1: 0.94, n: 0.52 },
  { t0: 1.28, t1: 1.62, n: 0.86 },
  { t0: 1.98, t1: 2.30, n: 0.60 },
];
const LIFTS = [{ a: 0.98, b: 1.24 }, { a: 1.66, b: 1.94 }];

function liftAt(t) {
  let v = 0;
  for (const L of LIFTS) v += smooth((t - L.a) / 0.18) * (1 - smooth((t - L.b) / 0.20));
  return clamp(v, 0, 1);
}

function lineAt(t) {
  let idx = 0, prog = 0, writing = false;
  for (let i = 0; i < LINES.length; i++) {
    const L = LINES[i];
    if (t < L.t0) { idx = i; break; }
    if (t <= L.t1) { idx = i; writing = true; prog = (t - L.t0) / (L.t1 - L.t0); break; }
    idx = i;
  }
  return { idx, prog, writing };
}

// 笔迹：四行、每行四个"字"，每个字在 14×20 的小格里由两三条笔画搭起来。
// 笔尖走的是当前字的中心，所以纸上的字是真的被这支笔写出来的。
const CELLS = 4, CW = 14, RH = 20;
const INK_X = 1050, INK_Y = 634;

function cellPos(row, k) {
  return { x: INK_X + k * CW, y: INK_Y + row * RH };
}

// 某一时刻的姿势。主绘制与"字的轨迹"共用同一套参数，笔尖和线不会错开。
function pose(ts, swayP) {
  const lift = liftAt(ts);
  const { idx, prog, writing } = lineAt(ts);
  const lineK = idx / (LINES.length - 1);
  const wristA = writing ? Math.sin(ts / 0.12 * Math.PI * 2) : 0;
  const wristB = writing ? Math.sin(ts / 0.24 * Math.PI * 2) : 0;
  const cx = CX0 + (writing ? (prog - 0.5) * 22 * (1 - lift) : 0) - lift * 10;
  const rot = -0.20 - lineK * 0.05 - lift * 0.07;
  const armL = 0.16 + lineK * 0.42 + wristA * 0.06 + wristB * 0.04 - lift * 0.45
    + (swayP ? swayP.armL : 0);
  const hand = handAt(cx, BY, U, rot, 'left', 1);
  // 这一行的第几个字：笔尖在那个字里走，两笔之间小幅抖
  const L = LINES[idx];
  const cellF = prog * CELLS * L.n;
  const cellK = Math.min(CELLS - 1, Math.floor(cellF));
  const cellP = clamp(cellF - cellK, 0, 1);
  const c = cellPos(idx, cellK);
  const want = {
    x: c.x + (cellP - 0.5) * CW * 0.7 + wristA * 0.9,
    y: c.y + wristB * 1.2,
  };
  const dx = want.x - hand.x, dy = want.y - hand.y;
  const len = Math.hypot(dx, dy) || 1;
  const reach = clamp(len, 34, 100);
  const tip = { x: hand.x + dx / len * reach, y: hand.y + dy / len * reach };
  return { lift, idx, prog, writing, cx, rot, armL, hand, tip, want };
}

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;

    // ---- 桌面：远边略微左高右低，机位挪到了桌子的左后方 ----
    deskPlane(ctx, { farL: 470, farR: 432, wall: '#3C302A', wallLow: '#332823', top: '#6A4A37', seed: 4000 });
    // 灯的光池：桌面被左侧的灯照亮，越往右越暗
    ctx.save();
    const pool = ctx.createRadialGradient(170, 430, 60, 170, 430, 1240);
    pool.addColorStop(0, 'rgba(246,201,126,0.40)');
    pool.addColorStop(0.45, 'rgba(246,201,126,0.13)');
    pool.addColorStop(1, 'rgba(246,201,126,0)');
    ctx.fillStyle = pool;
    ctx.fillRect(0, 0, 1920, 1080);
    ctx.restore();

    // ---- 墙上贴的几页词稿：把右上角的空墙填上 ----
    const R = rng(4020);
    for (let i = 0; i < 3; i++) {
      const x = 1462 + i * 148, y = 176 + (i % 2) * 58 + R() * 18;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((R() - 0.5) * 0.14);
      block(ctx, -60, -74, 120, 148, 3, i === 1 ? '#E8DCC4' : '#F2E3C6', { stroke: P.ink, lw: 3, seed: 4021 + i });
      for (let q = 0; q < 5; q++) line(ctx, -44, -50 + q * 23, 28 + R() * 30, -50 + q * 23, { seed: 4030 + i * 5 + q, lw: 2, color: '#B9A98D' });
      ctx.beginPath(); ctx.arc(0, -66, 5, 0, Math.PI * 2); ctx.fillStyle = '#D9A03F'; ctx.fill();
      ctx.restore();
    }

    // ---- 台灯：灯座落在桌面上，灯罩被左画框切掉一半 ----
    const lx = 132;
    block(ctx, lx - 66, 424, 132, 34, 10, '#5E4436', { stroke: P.ink, lw: 4, seed: 4010 });
    block(ctx, lx - 9, 104, 18, 322, 6, '#3A2C24', { stroke: P.ink, lw: 4, seed: 4011 });
    poly(ctx, [[lx - 138, 116], [lx + 138, 116], [lx + 86, 26], [lx - 86, 26]],
      { fill: '#D9A03F', stroke: P.ink, lw: 5, seed: 4012 });
    glow(ctx, lx + 40, 170, 700, 'rgba(246,201,126,0.5)', 0.5);
    ctx.save();
    ctx.globalAlpha = 0.07;
    poly(ctx, [[lx - 70, 130], [lx + 130, 130], [900, 1080], [240, 1080]], { fill: '#F6C97E', stroke: false });
    ctx.restore();

    // ---- 桌上：一只冷掉的杯子、两团废纸、一角旧笔记本 ----
    block(ctx, 838, 596, 82, 88, 10, '#E8DCC4', { stroke: P.ink, lw: 4, seed: 4040 });
    block(ctx, 844, 610, 70, 30, 6, '#4A3226', { seed: 4041 });
    ctx.beginPath(); ctx.lineWidth = 6; ctx.strokeStyle = P.ink;
    ctx.arc(926, 632, 24, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    for (const [cx2, cy2, s] of [[760, 664, 26], [822, 700, 19]]) {
      ctx.beginPath(); ctx.moveTo(cx2 - s, cy2);
      for (let i = 0; i < 7; i++) {
        const a = i / 7 * Math.PI * 2;
        ctx.lineTo(cx2 + Math.cos(a) * (s * (0.75 + 0.35 * ((i * 7) % 3))), cy2 + Math.sin(a) * s * 0.8);
      }
      ctx.closePath();
      ctx.fillStyle = '#E8DCC4'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = P.ink; ctx.stroke();
    }

    // ---- 正在写的那张纸 ----
    ctx.save();
    ctx.translate(1130, 620);
    ctx.rotate(-0.028);
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = P.ink;
    ctx.beginPath(); ctx.ellipse(10, 12, 190, 130, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    block(ctx, -176, -122, 352, 244, 4, '#E8DCC4', { stroke: P.ink, lw: 3, seed: 290 });
    for (let i = 0; i < 6; i++) {
      line(ctx, -152, -94 + i * 35, 152, -97 + i * 35, { seed: 291 + i, lw: 2, color: 'rgba(185,169,141,0.45)' });
    }
    ctx.restore();

    // ---- 已写完的纸：越摞越高，压在左前景 ----
    [0.98, 1.72, 2.34].forEach((t0, i) => {
      const k = smooth((t - t0) / 0.24);
      if (k <= 0) return;
      const px = 236 + i * 7, py = 704 - i * 17 - (1 - k) * 60;
      ctx.save();
      ctx.globalAlpha = 0.20;
      ctx.fillStyle = P.ink;
      ctx.beginPath(); ctx.ellipse(px + 254, py + 146, 258, 42, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      block(ctx, px, py, 500, 140, 4, i % 2 ? '#E8DCC4' : '#F2E3C6', { stroke: P.ink, lw: 3, seed: 1845 + i });
      for (let q = 0; q < 3; q++) {
        line(ctx, px + 36, py + 44 + q * 28, px + 424, py + 44 + q * 28, { seed: 1855 + i * 3 + q, lw: 2, color: '#B9A98D' });
      }
    });

    // ---- 他 ----
    const b = breath(t, { seed: 173, period: 1.75, amp: 0.12 });
    const s = sway(t, { seed: 173, period: 2.6, armAmp: 0.02 });
    const P0 = pose(t, s);
    const squash = b.squash;
    // 表情：一直在写，嘴不动；1.92 s 写到第二段末尾才抿一下（累），2.30 s 松开。
    const e = face(t, [
      { t: 0.00, mouth: 'none' },
      { t: 1.92, mouth: 'flat' },
      { t: 2.30, mouth: 'none' },
    ], { ramp: 0.18, blink: false });
    clawd(ctx, {
      cx: P0.cx, by: BY, u: U,
      color: P.orange,
      eyes: 'none',
      mouth: e.mouth,
      look: 0,
      seed: 173,
      bodyDy: b.bodyDy + 0.20 - P0.lift * 0.26,
      squash,
      armR: 0.14 + s.armR,
      armL: P0.armL,
      rot: P0.rot,
    });

    // 眼睛：整镜向下看纸；抬头那两次先抬眼看向左上的灯。
    // 眼睛用「啪」地跳上去/落回来（比脖子早 2 帧），身体仍走原来的 smooth lift。
    const eyeLift = Math.min(1, Math.max(0, dart(t, [
      { t: 0.00, look: 0 }, { t: 1.14, look: 1 }, { t: 1.40, look: 0 },
      { t: 1.82, look: 1 }, { t: 2.10, look: 0 },
    ], { dur: 0.10 })));
    const yaw = lerp(0.66, -0.66, eyeLift);
    const pitch = lerp(1.0, -0.85, eyeLift);
    const lid = lerp(0.32, 0.0, eyeLift);
    eyesAt(ctx, { cx: P0.cx, by: BY, u: U, rot: P0.rot, squash, body: P.orange, style: 'open', yaw, pitch, lid, wide: 0.94 });

    // ---- 字：每个字由两三条笔画搭起来，写完一个留一个 ----
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#3A3630';
    ctx.lineWidth = 2.2;
    LINES.forEach((L, i) => {
      if (t < L.t0) return;
      const end = t >= L.t1 ? 1 : (t - L.t0) / (L.t1 - L.t0);
      const lastCell = end * CELLS * L.n;
      for (let k = 0; k < CELLS; k++) {
        const part = clamp(lastCell - k, 0, 1);
        if (part <= 0) continue;
        const c = cellPos(i, k);
        glyph(ctx, c.x, c.y, i * 10 + k, part);
      }
    });
    ctx.restore();

    // ---- 笔：从手心画到笔尖，笔尖落在刚写的那一笔上 ----
    penTo(ctx, P0.hand, P0.tip, { minU: 9, maxU: 20, seed: 630 });
  },
};
// 一个「字」：两三条短笔画，part 是写完的比例（0→1 一笔一笔长出来）
function glyph(ctx, x, y, seed, part) {
  const R = rng(9100 + seed * 37);
  const marks = 2 + Math.floor(R() * 2);
  const total = part * marks;
  for (let i = 0; i < marks; i++) {
    const k = clamp(total - i, 0, 1);
    if (k <= 0) break;
    const off = (R() - 0.5) * 5;
    const w = (3.2 + R() * 3.0) * (0.4 + 0.6 * k);
    if (i % 2 === 0) {
      const y0 = y - 4 + i * 4 + off * 0.4;
      line(ctx, x - w, y0, x + w, y0 + (R() - 0.5) * 2, { seed: 9200 + seed * 13 + i, lw: 2.2, color: '#3A3630', amp: 0.3, parts: 2 });
    } else {
      const x0 = x + off;
      const h = (4 + R() * 4) * (0.4 + 0.6 * k);
      line(ctx, x0, y - h, x0 + (R() - 0.5) * 2, y + h, { seed: 9200 + seed * 13 + i, lw: 2.2, color: '#3A3630', amp: 0.3, parts: 2 });
    }
  }
}
