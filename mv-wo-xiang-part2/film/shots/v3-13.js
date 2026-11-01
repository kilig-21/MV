import { crowdUniform } from '../src/scenes-verse3.js';
import { clawd, groundShadow } from '../src/character.js';
import { phone } from '../src/props.js';
import { P } from '../src/palette.js';
import { glow, star, line, block, clamp, smooth, rng } from '../src/ink.js';
import { breath, blink } from '../src/life.js';
import { face, glance, prep } from '../src/expr-e4.js';

// 一排人，但每个人都不同：步频、相位、身高、朝向、快慢都各自一套。
// 评审 A：整排灰螃蟹步态同步、个头一致，像一条传送带。
// 改法：每只比前一只晚 0.08 s 相位（phOff），个头以 22.8 为基准 ±4%，
// 腿的摆幅提一档，灰螃蟹之间不再同帧迈同一条腿。
const WALKERS = (() => {
  const R = rng(8813);
  const tones = ['#9A9498', '#8F8A8C', '#A6A0A2', '#868286', '#AEA7A4'];
  const out = [];
  let x = -230;
  for (let i = 0; i < 8; i++) {
    const cad = 6.3 + R() * 2.0;      // 步频
    out.push({
      i,
      x0: x,
      v: 74 + R() * 26,               // 步速：有人快半步，有人慢半步
      cad,
      ph0: R() * Math.PI * 2,         // 各自的起步相位
      phOff: i * 0.08 * cad,          // 每只再错开 0.08 s（换成弧度）
      u: 22.8 * (1 + ((i % 5) - 2) * 0.02),   // 个头 ±4%
      byOff: (R() * 2 - 1) * 7,       // 整排不成一条水平线
      tone: tones[Math.floor(R() * tones.length)],
      rot: (R() * 2 - 1) * 0.055,
      look: (R() * 2 - 1) * 0.5,
      eyes: R() < 0.34 ? 'dot' : 'normal',
      mouth: R() < 0.22 ? 'flat' : 'none',
      back: R() < 0.18,               // 背对镜头的那只
      phone: false,
      // 「慢半步 / 快半步」：用累积时间额度做，速度平滑变化，不会倒着走
      holdAmp: (R() * 2 - 1) * 0.30,
      holdStart: 0.7 + R() * 0.4,
      orange: false,
    });
    x += 214 + R() * 62;              // 间距不等
  }
  const o = out[4];
  o.orange = true; o.u = 25.2; o.v = 84; o.eyes = 'normal'; o.mouth = 'flat';
  o.back = false; o.holdAmp = 0.10;
  // 一个低头看手机的（不看路），走得比谁都慢
  out[2].phone = true; out[2].eyes = 'dot'; out[2].look = -0.2; out[2].holdAmp = 0.52;
  out[2].holdStart = 0.62;
  // 一个背对镜头走的
  out[6].back = true;
  // 橙色那只右后方的那位：个子小一点、侧头看它，不挡橙色
  out[5].u = 21.2; out[5].x0 += 26;
  return out;
})();

// 后排：缩一号、慢一点、颜色更暗，补出纵深——同样各自走各自的
const BACK_ROW = (() => {
  const R = rng(8821);
  const out = [];
  let x = -120;
  for (let i = 0; i < 6; i++) {
    out.push({
      x0: x,
      v: 58 + R() * 20,
      cad: 5.4 + R() * 1.6,
      ph0: R() * Math.PI * 2,
      u: 13.2 + R() * 2.2,
      byOff: (R() * 2 - 1) * 7,
      tone: '#7C787C',
      rot: (R() * 2 - 1) * 0.05,
      look: (R() * 2 - 1) * 0.4,
      eyes: R() < 0.4 ? 'dot' : 'normal',
      back: R() < 0.2,
    });
    x += 268 + R() * 86;
  }
  return out;
})();

function walkPose(t, w) {
  const ph = t * w.cad + w.ph0 - (w.phOff || 0);
  const bob = Math.abs(Math.sin(ph)) * (2.6 + w.u * 0.04);
  const legs = [
    Math.sin(ph) * 0.32, -Math.sin(ph) * 0.32,
    Math.sin(ph + 1.08) * 0.32, -Math.sin(ph + 1.08) * 0.32,
  ];
  return { ph, bob, legs };
}

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    crowdUniform(ctx, gt);

    // 墙上挂着的三盏夜灯：给这片大墙一点纵深
    for (const lx of [430, 960, 1490]) {
      line(ctx, lx, 0, lx, 236, { seed: 3145 + lx, lw: 3.5, color: P.ink });
      block(ctx, lx - 44, 236, 88, 18, 6, '#1E252B', { stroke: P.ink, lw: 4, seed: 3146 + lx });
      ctx.beginPath();
      ctx.arc(lx, 254, 12, 0, Math.PI, 0);
      ctx.fillStyle = '#D9A03F'; ctx.fill();
      ctx.lineWidth = 3.5; ctx.strokeStyle = P.ink; ctx.stroke();
      glow(ctx, lx, 268, 220, 'rgba(246,201,126,0.45)', 0.45);
    }

    // 路面：从墙脚 (736) 一直铺到画框底，把背景里那几排方块螃蟹整个收干净
    block(ctx, 0, 736, 1920, 344, 0, '#2C343A');
    line(ctx, 0, 736, 1920, 736, { seed: 3147, lw: 3, color: '#3E4A50', amp: 1 });
    block(ctx, 0, 900, 1920, 180, 0, '#232B30');
    line(ctx, 0, 900, 1920, 900, { seed: 3148, lw: 4, color: '#121A1F' });
    line(ctx, 0, 906, 1920, 906, { seed: 3149, lw: 2, color: '#3A464C', amp: 1 });

    // ---- 后排：更小、更远，压住画面的纵深 ----
    for (const w of BACK_ROW) {
      const { bob, legs } = walkPose(t, w);
      const cx = w.x0 + w.v * t;
      if (cx < -260 || cx > 2180) continue;
      const bb = breath(t, { seed: 9300 + w.x0 / 7, period: 1.5, amp: 0.12, squashAmp: 0.007 });
      clawd(ctx, {
        cx, by: 802 - bob + w.byOff,
        u: w.u,
        color: w.tone,
        eyes: w.back ? 'none' : w.eyes,
        look: w.look,
        mouth: 'none',
        seed: 8800 + w.x0,
        rot: w.rot,
        legs,
        squash: bb.squash,
        bodyDy: bb.bodyDy,
      });
    }

    // ---- 前排：每个人都不一样 ----
    const BASE = 900;
    const orange = WALKERS.find(w => w.orange);
    const ocx = orange.x0 + orange.v * t - orange.v * 0.10 * smooth((t - 0.7) / 0.5);

    // 橙色那只身上的光：先铺一层光晕
    const on = smooth(clamp((t - 0.45) / 0.9, 0, 1));
    // 走两步（约 0.8 s）之后，轮廓光提亮一档、眼睛带高光
    const rim = smooth(clamp((t - 0.82) / 0.26, 0, 1));
    // 「别让俗套掩盖锋芒」：先是一张平脸跟着人群走 → 被旁边人看一眼后，嘴角才慢慢松开。
    // 不悲情：只是很小的一个笑，眉先抬（0.94 的预备），1.06 才成形。
    const orangeE = face(t, [
      { t: 0.00, eyes: 'normal', mouth: 'flat', brow: null },
      { t: 1.06, eyes: 'normal', mouth: 'smile', brow: 'up' },
    ], 0.22);
    // 视线：看前方 → 感到右边的目光，偏一下 → 收回前方。落点都是具体的人/路。
    const orangeLook = glance(t, [
      { t: 0.00, look: 0.10 },
      { t: 1.32, look: 0.42 },
      { t: 1.86, look: 0.10 },
    ], { dur: 0.10 });
    const orangeBrow = prep(t, 0.94, { amp: 0.28 });
    if (on > 0) {
      ctx.save();
      ctx.globalAlpha = on;
      glow(ctx, ocx, 798, 250, 'rgba(246,201,126,0.75)', 0.72);
      ctx.restore();
    }

    for (const w of WALKERS) {
      const { ph, bob, legs } = walkPose(t, w);
      // 「慢半步 / 快半步」：平滑地吃掉或找补一点时间，不会突然跳
      const lost = w.v * w.holdAmp * smooth((t - w.holdStart) / 0.6);
      const cx = w.x0 + w.v * t - lost;
      if (cx < -340 || cx > 2260) continue;

      // 橙色那只旁边，有一个人会侧头看它一眼
      const turn = (w.i === 5)
        ? smooth(clamp((t - 1.12) / 0.24, 0, 1)) * (1 - smooth(clamp((t - 1.82) / 0.32, 0, 1)))
        : 0;

      const flick = blink(t, { seed: 9100 + w.i, phase: w.i * 0.37, eyes: w.eyes });
      let eyes = w.eyes;
      let look = w.look;
      let rot = w.rot;
      let mouth = w.mouth;
      if (w.back) { eyes = 'none'; mouth = 'none'; look = 0; }
      if (w.phone) { eyes = 'dot'; mouth = 'none'; look = -0.35; }
      if (turn > 0) {
        // 先动眼睛，身体慢半拍跟过来
        look = w.look * (1 - turn) - 1.15 * turn;
        rot = w.rot + (-0.11) * turn;
        if (turn > 0.45) eyes = 'normal';
      }
      if (flick && eyes !== 'none') eyes = 'closed';

      const body = breath(t, { seed: 9200 + w.i, period: 1.35 + (w.i % 4) * 0.12, amp: 0.13, squashAmp: 0.008 });
      groundShadow(ctx, cx, BASE + w.byOff, w.u, { alpha: 0.11, w: 5.6 });

      const wby = BASE - bob + w.byOff;
      // 轮廓光：先垫一层放大 7.5% 的暖色剪影，再把人画在上面，边缘就亮了一圈
      if (w.orange && rim > 0) {
        ctx.save();
        ctx.globalAlpha = 0.55 * rim;
        clawd(ctx, {
          cx, by: wby, u: w.u * 1.026,
          color: 'rgba(247,221,168,1)', noInk: true,
          eyes: 'none', mouth: 'none',
          seed: 3144, legs, rot: 0.015,
          squash: body.squash, bodyDy: body.bodyDy,
        });
        ctx.restore();
      }

      clawd(ctx, {
        cx,
        by: wby,
        u: w.u,
        color: w.orange ? P.orange : w.tone,
        ...(w.orange
          ? { ...orangeE, look: orangeLook, browDy: orangeBrow }
          : { eyes, look, mouth, brow: false }),
        seed: w.orange ? 3141 : 9100 + w.i,
        legs,
        rot: w.orange ? 0.015 : rot,
        squash: body.squash,
        bodyDy: body.bodyDy,
      });

      // 橙色那只眼里的高光：和灰螃蟹的实心点眼分开
      if (w.orange && rim > 0.3) {
        const u = w.u, look0 = orangeLook * 0.28 * u;
        const ey = wby - 6 * u;
        ctx.save();
        ctx.globalAlpha = smooth(clamp((rim - 0.3) / 0.5, 0, 1));
        ctx.fillStyle = 'rgba(255,247,228,0.95)';
        for (const ex of [-3 * u + look0, 3 * u + look0]) {
          ctx.beginPath();
          ctx.arc(cx + ex - 0.12 * u, ey - 0.14 * u, 0.17 * u, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 低头看手机的那只：手机压在脸前，屏幕亮着
      if (w.phone) {
        phone(ctx, cx + 0.4 * w.u, BASE - bob + w.byOff - 4.2 * w.u, 6.2, {
          rot: 0.22, screen: '#DCE9EC', glow: true,
        });
        glow(ctx, cx + 0.4 * w.u, BASE - bob + w.byOff - 4.2 * w.u, 60, 'rgba(205,231,238,0.55)', 0.4);
      }

      // 侧头看橙色那只的人：眼里有一点反应
      if (turn > 0.55) {
        glow(ctx, cx - 2 * w.u, BASE - bob + w.byOff - 6 * w.u, 46, 'rgba(246,201,126,0.5)', 0.28 * turn);
      }
    }

    // 星芒在橙色那只旁边，不在身上
    if (on > 0) {
      ctx.save();
      ctx.globalAlpha = on;
      const tw = 0.6 + 0.4 * Math.sin(t * 3.4);
      star(ctx, ocx + 152, 700, 20 + 4 * tw, 6, 4, 'rgba(247,221,168,0.9)', 0.2);
      star(ctx, ocx - 160, 752, 13, 4, 4, 'rgba(247,221,168,0.8)', 0.5);
      ctx.restore();
    }
    void d;
  },
};