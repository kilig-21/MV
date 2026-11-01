import { dreamSky, sea } from '../src/dream.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth } from '../src/ink.js';
import { breath, beatPulse, beatMotes } from '../src/polish-chorus.js';
import { exprE3, dart, browAt } from '../src/expr-e3.js';

// c1 的「踩疯狂节奏」：大特写。每一拍给一次读得出的踩踏：
// 抬腿 → 落下压缩 → 嘴在落点张开；4 拍里嘴型 闭→张→闭→张，第 3 拍单眼眨。
// 表情每两次踩踏换一次（发力 wide+o / 收住 tired+flat），全部走 expr 过渡，
// 眉毛保持下压、靠 browDy 在落点弹一下——不再整段一张脸不动。
const STOMP = 0.39;                 // 四次踩踏，1.56 s 内正好铺满
const u = 48;

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;

    dreamSky(ctx, gt, { moonX: 1700, moonY: 160, moonR: 44 });
    sea(ctx, gt, { y: 844 });

    // 踩踏节拍：左右两对腿交替，各自在落点前 0.32 s 抬到最高，落点瞬间砸下
    const CYC = STOMP * 2;                              // 每对腿 0.78 s 踩一次
    const base = t - 0.12;                              // 左对第一次落点 t=0.12
    const la = (((base % CYC) + CYC) % CYC);
    const lb = ((((base - STOMP) % CYC) + CYC) % CYC);
    const liftOf = p => (p < 0.04 ? 0 : p > CYC - 0.32 ? smooth((p - (CYC - 0.32)) / 0.32) : 0);
    const liftA = liftOf(la), liftB = liftOf(lb);       // 左对 / 右对
    const since = (((base % STOMP) + STOMP) % STOMP);   // 距最近一次落点
    const idx = Math.floor(base / STOMP);
    const compress = Math.exp(-since * 10);             // 每 0.39 s 一次压缩
    // 落点那一下的嘴交给 expr 关键帧；第 3 拍加单眼眨
    const wink = idx === 2 && since < 0.22;

    const by = 844 + 0.10 * u * compress;
    const bobBreath = breath(gt, 123).y * 2;
    const lift = -0.32;
    const legs = [
      lift * liftA + 0.02 * compress, lift * liftA + 0.02 * compress,
      lift * liftB + 0.02 * compress, lift * liftB + 0.02 * compress,
    ];

    // 每两次踩踏换一次表情：第 2、4 次落点发力（wide + 张嘴），中间收住
    const e = exprE3(t, [
      { t: 0.00, eyes: 'tired', mouth: 'flat', brow: 'angry' },
      { t: 0.51, eyes: 'wide', mouth: 'o' },
      { t: 0.90, eyes: 'tired', mouth: 'flat' },
      { t: 1.29, eyes: 'wide', mouth: 'o' },
    ]);
    const browDy = browAt(t, [
      { at: 0.51, dur: 0.24, amp: 0.12 },
      { at: 1.29, dur: 0.24, amp: 0.12 },
    ]);
    const look = dart(t, [
      { t: 0.02, look: -0.10 }, { t: 0.50, look: -0.30 },
      { t: 1.00, look: 0.06 }, { t: 1.40, look: -0.22 },
    ]);

    clawd(ctx, {
      cx: 960, by: by + bobBreath, u,
      color: P.orange,
      ...e, browDy,
      blush: true,
      seed: 123,
      look,
      legs,
      squash: 1 + 0.075 * compress,
    });

    // 单眼眨：第 3 拍，把左眼盖成一条闭合弧
    if (wink) {
      const ey = by - 6 * u + bobBreath;
      const lx = 960 - 3 * u;
      ctx.save();
      ctx.fillStyle = P.orange;                 // 先盖掉原来的横条眼
      ctx.fillRect(lx - 0.62 * u, ey - 0.75 * u, 1.24 * u, 1.5 * u);
      ctx.strokeStyle = P.ink;
      ctx.lineWidth = 0.26 * u;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(lx, ey - 0.1 * u, 0.55 * u, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
      ctx.restore();
    }

    // 落点扬起的尘/水花：四道短弧，随压缩一起消失
    if (compress > 0.25) {
      ctx.save();
      ctx.globalAlpha = compress * 0.5;
      ctx.strokeStyle = '#CFE6E9';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      const side = idx % 2 === 0 ? -1 : 1;
      for (let i = 0; i < 4; i++) {
        const a = -0.5 + i * 0.34;
        const x0 = 960 + side * (2.6 + i * 0.5) * u;
        ctx.beginPath();
        ctx.moveTo(x0, by + 2);
        ctx.lineTo(x0 + Math.cos(a) * 0.9 * u, by + 2 - Math.sin(a) * 0.55 * u);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 节拍圈：每拍一圈，每 4 拍一次大圈
    beatPulse(ctx, 960, by + 22, gt, 1.15, { beatAlpha: 0.30, barAlpha: 0.62 });
    beatMotes(ctx, 960, by - 150, gt, { n: 8, r0: 190, spread: 1.4, seed: 3 });
  },
};