import { clawd } from '../src/character.js';
import { letter } from '../src/props.js';
import { P } from '../src/palette.js';
import { block, line, poly, glow, clamp, lerp, smooth } from '../src/ink.js';
import { breath, sway } from '../src/life.js';
import { face, dart } from '../src/expr-e2.js';
import { pulse } from '../src/polish-v2.js';
import { lampGlow, dustMotes, rebound } from '../src/detail-r2b.js';
import { eyesAt, deskPlane, easeTo } from '../src/fix-round3b.js';

// v2-09 木盒：机位换到盒子的右前方、略微俯视，灯不在画里（光从右上斜进来）。
// 他在左边，右手伸进盒子；先看信，再盖上，最后手停在盖上 —— 眼睛永远先于身体。

const BX = 470, BY = 430, BW = 930, BH = 330;      // 盒身（近景俯拍，盒子占满画面中部）
const CX = 306, CY = 806, U = 28;                  // 他在左画框，右手伸进盒子

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    const push = 1.0 + 0.05 * smooth(t / d);
    ctx.save();
    ctx.translate(900, 560);
    ctx.scale(push, push);
    ctx.translate(-900, -560);

    // ---- 桌面：从右上打光，远边在左低右高 ----
    deskPlane(ctx, { farL: 296, farR: 258, wall: '#3E332C', wallLow: '#352B25', top: '#6A4A37', seed: 4100, sheen: false });
    // 右上角斜进来的暖光（台灯在画外）
    glow(ctx, 1800, 90, 980, 'rgba(246,201,126,0.5)', 0.42);
    lampGlow(ctx, t, { x: 1800, y: 90, r: 1200, period: 1.7, alpha: 0.10, swell: 0.6, phase: 0.31 });
    dustMotes(ctx, t, { x: 1240, y: 60, w: 640, h: 560, count: 20, seed: 731, alpha: 0.28, rise: 6 });

    // ---- 桌上零散：几页没写完的纸，压在左边 ----
    for (let i = 0; i < 3; i++) {
      block(ctx, 60 + i * 9, 706 - i * 18, 300, 116, 3, i % 2 ? '#E8DCC4' : '#F2E3C6',
        { stroke: P.ink, lw: 3, seed: 4110 + i });
    }

    // ---- 木盒 ----
    block(ctx, BX, BY, BW, BH, 10, '#6E4A34', { stroke: P.ink, lw: 6, seed: 270 });
    block(ctx, BX + 26, BY + 26, BW - 52, BH - 52, 6, '#4E3428', { seed: 271 });
    line(ctx, BX + 30, BY + 96, BX + BW - 30, BY + 96, { seed: 274, lw: 2, color: 'rgba(94,62,44,0.7)' });
    line(ctx, BX + 30, BY + 222, BX + BW - 30, BY + 222, { seed: 275, lw: 2, color: 'rgba(94,62,44,0.7)' });
    // 盒子四角的铁包角
    for (const [dx, dy] of [[BX + 8, BY + 8], [BX + BW - 46, BY + 8], [BX + 8, BY + BH - 46], [BX + BW - 46, BY + BH - 46]]) {
      block(ctx, dx, dy, 38, 38, 6, '#5E4436', { stroke: P.ink, lw: 3, seed: 4120 + dx });
    }

    // 盒子在桌面上的一点投影
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = P.ink;
    ctx.beginPath(); ctx.ellipse(BX + BW / 2 + 18, BY + BH + 26, BW * 0.54, 44, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // 信：放进盒子，往里按了一下
    const press = pulse(t - 0.62, 0.34);
    letter(ctx, 900, BY + 150 + press * 8, 34, { rot: -0.06, color: '#F2E3C6', seed: 272, stamp: true });

    // 盒盖：掀开时是后缘上一条透视压扁的板（不是一块立在空中的木板），合上时铺满盒面
    const close = smooth((t - 1.32) / 0.42);
    const settle = rebound(t, 1.74, 0.055, 26, 0.13);
    const lidH = 104 + 212 * close;
    const inset = 74 * (1 - close);
    const lidY = BY - 96 * (1 - close) - (1 - close) * 8 + settle * 40;
    poly(ctx, [
      [BX + inset, lidY], [BX + BW - inset, lidY],
      [BX + BW - inset * 0.25, lidY + lidH], [BX + inset * 0.25, lidY + lidH],
    ], { fill: close > 0.85 ? '#7E5B45' : '#6A4B39', stroke: P.ink, lw: 6, seed: 273 });
    if (close > 0.4) {
      const k = (close - 0.4) / 0.6;
      line(ctx, BX + 44, lidY + lidH * 0.34, BX + BW - 44, lidY + lidH * 0.34, { seed: 276, lw: 3, color: 'rgba(94,62,44,0.55)' });
      line(ctx, BX + 44, lidY + lidH * 0.74, BX + BW - 44, lidY + lidH * 0.74, { seed: 277, lw: 3, color: 'rgba(94,62,44,0.55)' });
      ctx.save();
      ctx.globalAlpha = k;
      block(ctx, BX + BW / 2 - 40, lidY + lidH * 0.42, 80, 44, 9, '#8A6A4A', { stroke: P.ink, lw: 4, seed: 278 });
      ctx.restore();
    }

    // ---- 他 ----
    // 视线：先看信（0–0.6）→ 跟他按下去 → 盒盖合上后仍看着盒子 → 2.4 s 才垂下眼
    // 垂眼是一次「啪」的落定（0.18 s），不是匀速滑下去；比脸的表情早 2 帧
    const lookDown = Math.min(1, Math.max(0, dart(t, [{ t: 0, look: 1 }, { t: 2.44, look: 0 }], { dur: 0.18 })));
    const hand = smooth((t - 0.18) / 0.22) * (1 - smooth((t - 1.46) / 0.30));
    const linger = pulse(t - 1.98, 0.26) + pulse(t - 2.22, 0.18);
    const sad = smooth((t - 2.45) / 0.32);
    const b = breath(t, { seed: 172, period: 1.9, amp: 0.13 });
    const s = sway(t, { seed: 172, period: 2.8, armAmp: 0.025 });
    const rot = 0.10 + hand * 0.05 + b.bodyDy * 0.02 + sad * 0.02 + s.rot;
    // 表情：嘴一直是平的；心事压下去以后（2.46 s）眉才慢慢皱起来，嘴松开
    const e = face(t, [
      { t: 0.00, mouth: 'flat', brow: null },
      { t: 2.46, mouth: 'none', brow: 'worried' },
    ], { ramp: 0.20, blink: false });
    const squash = b.squash;
    const cx = CX + hand * 18 + linger * 5;
    const by = CY - hand * 6;
    clawd(ctx, {
      cx, by, u: U,
      color: P.orange,
      eyes: 'none',
      mouth: e.mouth,
      brow: e.brow,
      look: 0,
      seed: 172,
      bodyDy: b.bodyDy + 0.22 - hand * 0.20 + linger * 0.08,
      squash,
      armR: 0.06 + hand * 1.75 + s.armR + linger * 0.10,
      armL: 0.12 + s.armL,
      rot,
    });
    eyesAt(ctx, {
      cx, by, u: U, rot, squash, body: P.orange, style: 'open',
      yaw: 0.72 - hand * 0.12 + (1 - lookDown) * 0.1,
      pitch: lerp(0.55, 1.0, lookDown) - hand * 0.08,
      lid: 0.18 + sad * 0.34 + (1 - lookDown) * 0.1,
      wide: 0.92,
    });
    ctx.restore();
  },
};
