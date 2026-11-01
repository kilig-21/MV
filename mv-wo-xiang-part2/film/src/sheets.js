// 技术样张：表情表 / 换色表。用于验证「表情不面瘫、多角色只换色」
import { P, CAST, FONT } from './palette.js';
import { block, line, bg, star } from './ink.js';
import { clawd, zzz, heartFloat } from './character.js';

function label(ctx, text, x, y, size = 26, color = P.wallShade, align = 'center') {
  ctx.fillStyle = color;
  ctx.font = `500 ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

export function expressionSheet(ctx, t) {
  bg(ctx, P.cream);
  // 纸底细纹
  for (let i = 0; i < 24; i++) line(ctx, 0, 40 + i * 44, 1920, 40 + i * 44, { seed: 900 + i, lw: 1.2, color: 'rgba(167,142,108,0.16)', amp: 2 });

  label(ctx, '表情库 · 官方 15×16 骨架 · 只改眼睛、嘴、腮红', 120, 78, 40, P.ink, 'left');
  line(ctx, 120, 108, 1800, 108, { seed: 950, lw: 3, color: P.ink, amp: 1 });

  const cells = [
    ['normal', { eyes: 'normal', mouth: 'smile' }, '日常'],
    ['happy', { eyes: 'happy', mouth: 'grin', blush: true }, '笑眼'],
    ['heart', { eyes: 'heart', mouth: 'grin', blush: true }, '爱心眼'],
    ['sleep', { eyes: 'closed', mouth: 'none', zzz: true }, '睡觉'],
    ['wide', { eyes: 'wide', mouth: 'o' }, '惊讶'],
    ['tired', { eyes: 'tired', mouth: 'flat', brow: 'worried' }, '疲惫'],
    ['sad', { eyes: 'sad', mouth: 'wavy', brow: 'worried' }, '难过'],
    ['sparkle', { eyes: 'sparkle', mouth: 'grin', blush: true }, '发光'],
  ];
  const cols = 4, cw = 400, ch = 400, x0 = 270, y0 = 320;
  cells.forEach(([id, pose, name], i) => {
    const cx = x0 + (i % cols) * cw, cy = y0 + Math.floor(i / cols) * ch;
    block(ctx, cx - 180, cy - 160, 360, 300, 24, '#F7EFDD', { stroke: 'rgba(167,142,108,0.55)', lw: 3, seed: 960 + i });
    clawd(ctx, { cx: cx + 4, by: cy + 84, u: 20, color: P.orange, seed: 30 + i, ...pose });
    if (pose.zzz) zzz(ctx, cx + 132, cy - 30, 30, t, 1);
    if (id === 'heart') { heartFloat(ctx, cx - 118, cy - 92, 24, '#E0566E', 0.95); heartFloat(ctx, cx + 122, cy - 58, 17, '#E0566E', 0.8); }
    label(ctx, name, cx, cy + 156, 26, P.ink);
  });

  line(ctx, 120, 1010, 1800, 1010, { seed: 951, lw: 2, color: 'rgba(167,142,108,0.5)', amp: 1 });
  label(ctx, '轮廓 = 官方 base 并集描边；眼睛数 2；四脚数 4；两臂数 2；无肘、膝、手掌、鞋', 960, 1046, 24, P.wallShade);
}

export function paletteSheet(ctx, t) {
  bg(ctx, P.cream);
  label(ctx, '多角色换色 · 同一身体 · 只换色 + 小配饰', 120, 78, 40, P.ink, 'left');
  line(ctx, 120, 108, 1800, 108, { seed: 970, lw: 3, color: P.ink, amp: 1 });
  const colors = Object.entries(CAST);
  const cols = 4, cw = 400, ch = 340, x0 = 280, y0 = 340;
  colors.forEach(([name, color], i) => {
    const cx = x0 + (i % cols) * cw, cy = y0 + Math.floor(i / cols) * ch;
    const acc = name === 'clawd' ? { eyes: 'normal', mouth: 'smile' }
      : name === 'green' ? { eyes: 'closed', mouth: 'none', zzz: true }
      : name === 'yellow' ? { eyes: 'happy', mouth: 'grin', blush: true }
      : name === 'pink' ? { eyes: 'heart', mouth: 'grin', blush: true }
      : name === 'lavender' ? { eyes: 'wide', mouth: 'o' }
      : { eyes: 'tired', mouth: 'flat' };
    clawd(ctx, { cx: cx + 4, by: cy + 70, u: 20, color, seed: 40 + i, ...acc });
    label(ctx, name, cx, cy + 112, 26, P.ink);
    label(ctx, color.toUpperCase(), cx, cy + 146, 20, P.wallShade);
  });
  label(ctx, '比例、部件位置、挂载点完全一致；换色只改 torso/arm/leg 填色', 960, 1040, 24, P.wallShade);
}

// 轮廓校验用：白底黑角色，不带描边，便于和官方 base 做 IoU
export function paritySheet(ctx, t) {
  bg(ctx, '#ffffff');
  clawd(ctx, { cx: 500, by: 900, u: 16, color: '#000000', noInk: true, eyes: 'none', mouth: 'none', seed: 1 });
}
