// 表情过渡样张：验证 clawd() 的表情混合值 + life.js 的 expr / browLift / eyeDart。
// 输出由 film/tools/render-expr-sheet.mjs 截图为 film/out/contact-expr-blend.jpg。
//
// 上半部分：6 组表情对，每组在 0.18 秒内过渡，抽「过渡前 / 25% / 50% / 75% / 过渡后」5 帧。
// 下半部分：eyeDart（跳看）与 browLift（眉毛抬起—落回）两条时间轴。
import { P, FONT } from './palette.js';
import { block, line } from './ink.js';
import { clawd } from './character.js';
import { expr, browLift, eyeDart } from './life.js';

const W = 1920;
const LEFT = 120;
const RIGHT = 1800;
const CW = 360, CH = 244;        // 每格宽/每行高（行标题在格子正上方，不再占左右栏）
const COLS = 5, ROWS = 6;
const GRID_Y = 206;
const STRIP_Y = GRID_Y + ROWS * CH + 52;
const STRIP_H = 250;
const H = STRIP_Y + STRIP_H * 2 + 40;

export const EXPR_SHEET_SIZE = { w: W, h: H };

const RAMP = 0.18;
const KEY_T = 1.0;               // 关键帧时刻：t>=1.0 已经是 to 的那套表情

const GROUPS = [
  { title: '眼白出现', from: { eyes: 'normal', mouth: 'flat' }, to: { eyes: 'wide', mouth: 'o' },
    note: 'normal → wide ＋ flat → o：最容易看出叠画发灰的组合' },
  { title: '收起惊讶', from: { eyes: 'wide', mouth: 'o' }, to: { eyes: 'normal', mouth: 'smile' },
    note: 'wide → normal ＋ o → smile：回落的过渡' },
  { title: '半眯起疑', from: { eyes: 'normal', mouth: 'flat' }, to: { eyes: 'squint', mouth: 'smirk' },
    note: 'normal → squint ＋ flat → smirk' },
  { title: '笑到难过', from: { eyes: 'happy', mouth: 'grin', blush: true }, to: { eyes: 'sad', mouth: 'wavy', brow: 'worried' },
    note: 'happy → sad ＋ grin → wavy ＋ 眉毛淡入' },
  { title: '震惊', from: { eyes: 'normal', mouth: 'flat' }, to: { eyes: 'shock', mouth: 'o', brow: 'up' },
    note: 'normal → shock：眼白 + 缩瞳 + 压线一次到位' },
  { title: '嘴眉一起变', from: { eyes: 'normal', mouth: 'smirk', brow: 'up' }, to: { eyes: 'squint', mouth: 'grin', brow: 'angry' },
    note: '嘴和眉同时过渡，三段各走各的' },
];

function label(ctx, text, x, y, size = 24, color = P.ink, align = 'center', weight = 500) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

// 过渡窗口内的 5 个采样时刻：0% / 25% / 50% / 75% / 100%
const FRACS = [0, 0.25, 0.5, 0.75, 1];
const times = FRACS.map(f => +(KEY_T - RAMP * (1 - f)).toFixed(4));

function cell(ctx, x, y, w, h, pose, seed, u = 11.5) {
  block(ctx, x + 6, y + 6, w - 12, h - 12, 20, '#F7EFDD',
    { stroke: 'rgba(167,142,108,0.55)', lw: 3, seed });
  clawd(ctx, { cx: x + w / 2, by: y + h - 34, u, color: P.orange, seed, ...pose });
}

/**
 * 画整张表情过渡样张。
 * @param {CanvasRenderingContext2D} ctx
 */
export function drawExprBlendSheet(ctx) {
  ctx.fillStyle = P.cream;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < Math.ceil(H / 44); i++) {
    line(ctx, 0, 40 + i * 44, W, 40 + i * 44, { seed: 900 + i, lw: 1.2, color: 'rgba(167,142,108,0.14)', amp: 2 });
  }

  label(ctx, '表情过渡样张 · 同一只螃蟹在 6 组表情之间做 0.18 秒过渡', LEFT, 62, 42, P.ink, 'left');
  label(ctx, 'clawd() 的 eyes / mouth / brow 接受 { a, b, p }：先以 1-p 画 a，再以 p 叠画 b。每格写着这一帧实际的 p。',
    LEFT, 108, 23, P.wallShade, 'left');
  line(ctx, LEFT, 140, 1800, 140, { seed: 950, lw: 3, color: P.ink, amp: 1 });

  // 列头
  const COLS_TXT = ['过渡前', '25%', '50%', '75%', '过渡后'];
  for (let c = 0; c < COLS; c++) {
    const x = LEFT + c * CW + CW / 2;
    label(ctx, COLS_TXT[c], x, 172, 24, P.ink);
    label(ctx, `${times[c].toFixed(3)}s`, x, 196, 17, P.wallShade);
  }

  const keys = g => [{ t: 0, ...g.from }, { t: KEY_T, ...g.to }];

  GROUPS.forEach((g, r) => {
    const y = GRID_Y + r * CH;
    label(ctx, `${r + 1}· ${g.title}   ${g.from.eyes} → ${g.to.eyes}`, LEFT, y + 14, 26, P.ink, 'left');
    label(ctx, g.note, LEFT, y + 38, 16, P.wallShade, 'left', 400);

    for (let c = 0; c < COLS; c++) {
      const x = LEFT + c * CW;
      const e = expr(times[c], keys(g), { ramp: RAMP });
      cell(ctx, x, y + 50, CW, CH - 58, e, 500 + r * 10 + c);
      const p = e.eyes && typeof e.eyes === 'object' ? e.eyes.p : (c === 0 ? 0 : 1);
      label(ctx, `p=${p.toFixed(2)}`, x + CW / 2, y + CH - 22, 15, P.wallShade, 'center', 400);
    }
  });

  // ── 下半部分 A：eyeDart ──
  const dartKeys = [{ t: 0, look: 0 }, { t: 0.6, look: 0.9 }, { t: 1.3, look: -0.7 }];
  const dartT = [0.20, 0.52, 0.56, 0.60, 0.90, 1.26];
  strip(ctx, STRIP_Y, 'eyeDart：0.08 秒跳过去，中间停住',
    '停在 0.52，0.52–0.60 跳到 look=0.9，停到 1.22，1.22–1.30 跳到 look=-0.7',
    dartT, t => {
      const look = eyeDart(t, dartKeys);
      return { pose: { eyes: 'normal', mouth: 'flat', look }, text: `${t.toFixed(2)}s · look=${look.toFixed(2)}` };
    }, 900);

  // ── 下半部分 B：browLift ──
  const browT = [0.06, 0.12, 0.20, 0.28, 0.38, 0.50];
  strip(ctx, STRIP_Y + STRIP_H, 'browLift：眉毛抬起再落回（给 clawd 的 browDy）',
    "brow:'up' 固定，只有 browDy 在动 —— at=0.1s, dur=0.4s, amp=0.4u（负值=向上）",
    browT, t => {
      const dy = browLift(t, { at: 0.1, dur: 0.4, amp: 0.4 });
      return { pose: { eyes: 'normal', mouth: 'flat', brow: 'up', browDy: dy }, text: `${t.toFixed(2)}s · browDy=${dy.toFixed(2)}u` };
    }, 950);
}

// 一行时间轴：标题 + 说明 + N 格（每格一只螃蟹 + 一行参数）
function strip(ctx, y, title, sub, times, make, seed0) {
  line(ctx, LEFT, y - 18, RIGHT, y - 18, { seed: seed0 + 60, lw: 2, color: 'rgba(167,142,108,0.55)', amp: 1 });
  label(ctx, title, LEFT, y + 6, 26, P.ink, 'left');
  label(ctx, sub, LEFT, y + 30, 16, P.wallShade, 'left', 400);
  const n = times.length, w = (RIGHT - LEFT) / n;
  times.forEach((t, i) => {
    const x = LEFT + i * w;
    const { pose, text } = make(t);
    cell(ctx, x + 4, y + 48, w - 8, STRIP_H - 72, pose, seed0 + i, 14);
    label(ctx, text, x + w / 2, y + STRIP_H - 36, 15, P.wallShade, 'center', 400);
  });
}