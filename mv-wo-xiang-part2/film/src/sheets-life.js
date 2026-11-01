// 表情总表：把 character.js 的全部 eyes / mouth / brow 取值排成一张可查的样张。
// 上半部分是 32 格大图（16 种眼型 + 8 种嘴型 + 8 组新组合），
// 下半部分是 16×8 全组合矩阵（每一格 = 一种 eyes × mouth）。
// 输出由 film/tools/render-life-sheet.mjs 截图为 film/out/contact-life-expressions.jpg。
import { P, FONT } from './palette.js';
import { block, line } from './ink.js';
import { clawd } from './character.js';

const W = 1920;
const HEADER = 170;
const A_Y = 230, B_Y = 1590, C_Y = 2310, D_Y = 3030;
const GRID_H = 320, MATRIX_ROW = 150, MATRIX_HEAD = 44;
const MATRIX_LEFT = 130, MATRIX_CW = 220;
const H = D_Y + MATRIX_HEAD + 16 * MATRIX_ROW + 46;

export const LIFE_SHEET_SIZE = { w: W, h: H };

const EYES = ['normal', 'wide', 'look', 'dot', 'happy', 'sad', 'tired', 'sparkle',
  'heart', 'closed', 'none', 'shock', 'squint', 'side', 'teary', 'dazed'];
const MOUTHS = ['none', 'smile', 'grin', 'o', 'wavy', 'flat', 'smirk', 'pout'];

const EYES_INFO = {
  normal: ['竖眼', '默认眼型'],
  wide: ['圆眼', '惊讶 / 害怕'],
  look: ['长竖眼', '注视 / 认真'],
  dot: ['点眼', '发呆 / 无语'],
  happy: ['笑眼', '开心'],
  sad: ['八字眼', '难过'],
  tired: ['横条眼', '疲惫'],
  sparkle: ['星芒眼', '发光 / 憧憬'],
  heart: ['爱心眼', '迷恋'],
  closed: ['闭眼', '睡觉 / 眨眼'],
  none: ['无眼', '极简 / 背影'],
  shock: ['震惊眼', '新增：眼白 + 缩瞳 + 压线'],
  squint: ['半眯眼', '新增：上眼睑压低'],
  side: ['侧目眼', '新增：眼球整体偏移'],
  teary: ['泪光眼', '新增：下缘亮线'],
  dazed: ['走神眼', '新增：瞳孔上翻失焦'],
};

const MOUTH_INFO = {
  none: ['无嘴', '默认'],
  smile: ['微笑', '常态'],
  grin: ['咧嘴笑', '大笑 / 得意'],
  o: ['圆嘴', '惊讶 / 发声'],
  wavy: ['波浪嘴', '委屈 / 尴尬'],
  flat: ['平嘴', '克制 / 无语'],
  smirk: ['坏笑', '新增：一侧嘴角上扬'],
  pout: ['嘟嘴', '新增：下唇微凸'],
};

function label(ctx, text, x, y, size = 26, color = P.ink, align = 'center', weight = 500) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function sectionTitle(ctx, text, y) {
  label(ctx, text, 120, y, 34, P.ink, 'left');
  line(ctx, 120, y + 26, 1800, y + 26, { seed: 1200 + y, lw: 2, color: 'rgba(167,142,108,0.55)', amp: 1 });
}

function figure(ctx, x, y, w, h, pose, seed) {
  block(ctx, x + 8, y + 8, w - 16, h - 16, 22, '#F7EFDD', { stroke: 'rgba(167,142,108,0.55)', lw: 3, seed });
  clawd(ctx, { cx: x + w / 2, by: y + h - 50, u: 15, color: P.orange, seed: seed + 1, ...pose });
}

/**
 * 画整张表情总表。
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} t 保留参数（与其它 sheet 的签名一致；本表为静帧）
 */
export function drawLifeExpressionSheet(ctx, t = 0) {
  // 本表比 1080 高，不能用 ink.js 的 bg()（它固定 1920×1080）
  ctx.fillStyle = P.cream;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < Math.ceil(H / 44); i++) {
    line(ctx, 0, 40 + i * 44, W, 40 + i * 44, { seed: 900 + i, lw: 1.2, color: 'rgba(167,142,108,0.14)', amp: 2 });
  }

  label(ctx, '表情总表 · 官方 15×16 骨架 · eyes / mouth / brow 全部取值', 120, 70, 44, P.ink, 'left');
  label(ctx, '角色比例不变：宽扁身体、两眼、两侧单段短臂、四只短脚。新增值只做加法，旧调用不受影响。',
    120, 116, 24, P.wallShade, 'left');
  line(ctx, 120, 146, 1800, 146, { seed: 950, lw: 3, color: P.ink, amp: 1 });

  // ── A. 16 种眼型 ──
  sectionTitle(ctx, 'A · 眼型 eyes（16 种，每种配一个自然的嘴）', A_Y - 42);
  const A_POSE = {
    normal: { mouth: 'smile' },
    wide: { mouth: 'o' },
    look: { mouth: 'flat', look: 0.5 },
    dot: { mouth: 'none' },
    happy: { mouth: 'grin', blush: true },
    sad: { mouth: 'wavy', brow: 'worried' },
    tired: { mouth: 'flat', brow: 'worried' },
    sparkle: { mouth: 'grin', blush: true },
    heart: { mouth: 'grin', blush: true },
    closed: { mouth: 'none' },
    none: { mouth: 'none' },
    shock: { mouth: 'o', brow: 'up' },
    squint: { mouth: 'flat', brow: 'worried' },
    side: { mouth: 'flat', look: 0.9 },
    teary: { mouth: 'wavy', brow: 'worried', sweat: true },
    dazed: { mouth: 'none' },
  };
  EYES.forEach((eye, i) => {
    const x = 120 + (i % 4) * 440, y = A_Y + Math.floor(i / 4) * GRID_H;
    figure(ctx, x, y, 420, GRID_H - 12, { eyes: eye, ...A_POSE[eye] }, 200 + i);
    const [name, desc] = EYES_INFO[eye];
    label(ctx, name, x + 210, y + 30, 26, P.ink);
    label(ctx, `eyes:'${eye}'`, x + 210, y + 58, 17, P.wallShade);
    label(ctx, desc, x + 210, y + GRID_H - 32, 17, P.wallShade);
  });

  // ── B. 8 种嘴型 ──
  sectionTitle(ctx, 'B · 嘴型 mouth（8 种，统一用 normal 眼型隔离嘴部）', B_Y - 42);
  MOUTHS.forEach((mouth, i) => {
    const x = 120 + (i % 4) * 440, y = B_Y + Math.floor(i / 4) * GRID_H;
    figure(ctx, x, y, 420, GRID_H - 12, { eyes: 'normal', look: 0.25, mouth }, 300 + i);
    const [name, desc] = MOUTH_INFO[mouth];
    label(ctx, name, x + 210, y + 30, 26, P.ink);
    label(ctx, `mouth:'${mouth}'`, x + 210, y + 58, 17, P.wallShade);
    label(ctx, desc, x + 210, y + GRID_H - 32, 17, P.wallShade);
  });

  // ── C. 新组合与眉型 ──
  sectionTitle(ctx, 'C · 组合与眉毛 brow（新值互相叠加，确认能读出来）', C_Y - 42);
  const COMBOS = [
    ['惊慌', { eyes: 'shock', mouth: 'o', brow: 'angry', sweat: true }],
    ['怀疑', { eyes: 'squint', mouth: 'smirk', brow: 'worried', look: 0.7 }],
    ['侧目', { eyes: 'side', mouth: 'flat', look: -0.9 }],
    ['委屈', { eyes: 'teary', mouth: 'wavy', brow: 'worried', sweat: true }],
    ['走神', { eyes: 'dazed', mouth: 'none', brow: 'up' }],
    ['撒娇', { eyes: 'teary', mouth: 'pout', brow: 'worried', blush: true }],
    ['得意', { eyes: 'happy', mouth: 'smirk', blush: true }],
    ['暴怒', { eyes: 'wide', mouth: 'grin', brow: 'angry' }],
  ];
  COMBOS.forEach(([name, pose], i) => {
    const x = 120 + (i % 4) * 440, y = C_Y + Math.floor(i / 4) * GRID_H;
    figure(ctx, x, y, 420, GRID_H - 12, pose, 400 + i);
    label(ctx, name, x + 210, y + 30, 26, P.ink);
    label(ctx, `${pose.eyes} × ${pose.mouth}${pose.brow ? ' × brow:' + pose.brow : ''}`, x + 210, y + 58, 16, P.wallShade);
  });

  // ── D. 16×8 全组合矩阵 ──
  sectionTitle(ctx, 'D · 全组合矩阵（行 = eyes，列 = mouth；每格一帧）', D_Y - 44);
  MOUTHS.forEach((mouth, c) => {
    label(ctx, mouth, MATRIX_LEFT + c * MATRIX_CW + MATRIX_CW / 2, D_Y + 20, 18, P.ink);
  });
  const gridTop = D_Y + MATRIX_HEAD;
  EYES.forEach((eye, r) => {
    const y = gridTop + r * MATRIX_ROW;
    label(ctx, eye, MATRIX_LEFT - 12, y + MATRIX_ROW / 2, 17, P.wallShade, 'right');
    MOUTHS.forEach((mouth, c) => {
      const x = MATRIX_LEFT + c * MATRIX_CW;
      if (r % 2 === 0) block(ctx, x + 2, y + 2, MATRIX_CW - 4, MATRIX_ROW - 4, 10, 'rgba(232,213,176,0.35)', { seed: 500 + r * 8 + c });
      clawd(ctx, {
        cx: x + MATRIX_CW / 2, by: y + MATRIX_ROW - 18, u: 6.2,
        color: P.orange, seed: 600 + r * 8 + c,
        eyes: eye, mouth, look: eye === 'side' ? 0.8 : 0,
      });
    });
  });

  line(ctx, 120, H - 30, 1800, H - 30, { seed: 952, lw: 2, color: 'rgba(167,142,108,0.5)', amp: 1 });
  label(ctx, '旧值全部保留；新值：eyes shock/squint/side/teary/dazed · mouth smirk/pout · brow angry。15×16 比例冻结。',
    W / 2, H - 14, 20, P.wallShade);
}