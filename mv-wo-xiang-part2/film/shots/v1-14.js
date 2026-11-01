import { bedside } from '../src/scenes2.js';
import { clawd, groundShadow } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, clamp, lerp, block, line, glow } from '../src/ink.js';
import { breathe, sway, gesture, weightShift } from '../src/polish-v1.js';
import { lampGlow, carSweep, dustMotes } from '../src/detail-r2b.js';
import { faceE1, dart } from '../src/expr-e1.js';

// 床：这一镜原来只有一只瓶子和一次眨眼。补一张矮床（床头柜右侧），人物才「有地方坐下」。
function lowBed(ctx) {
  const bx = 930, top = 830, bw = 950;
  block(ctx, bx, top, bw, 70, 8, '#E0CDA8', { stroke: P.ink, lw: 6, seed: 4241 });     // 床垫
  block(ctx, bx, top + 70, bw, 40, 6, '#8E6A68', { stroke: P.ink, lw: 6, seed: 4242 }); // 床架
  for (const x of [bx + 30, bx + bw - 60]) block(ctx, x, top + 110, 26, 44, 4, '#5E4232', { stroke: P.ink, lw: 4, seed: 4260 + x });
  block(ctx, bx + bw - 70, top - 130, 60, 200, 6, '#7E5B45', { stroke: P.ink, lw: 6, seed: 4243 }); // 床头板
  block(ctx, bx + bw - 300, top - 54, 220, 58, 20, '#E8D5B0', { stroke: P.ink, lw: 5, seed: 4244 }); // 枕头
}

// 药瓶：和 bedside() 里那只同款，但位置可动。以瓶底中点为锚点。
function pillBottle(ctx, bx, by, rot = 0) {
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(rot);
  block(ctx, -65, -180, 130, 180, 20, '#D8CFB6', { stroke: P.ink, lw: 6, seed: 1240 });
  block(ctx, -75, -210, 150, 44, 14, '#4E8FA3', { stroke: P.ink, lw: 5, seed: 1241 });
  block(ctx, -45, -130, 90, 80, 6, '#E8D5B0', { seed: 1242 });
  ctx.fillStyle = '#2B2A2E'; ctx.font = '400 22px NotoSansSC';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('睡前 1 粒', 0, -90);
  ctx.restore();
}

// 盖掉场景里那只不动的药瓶（连同它身后的墙、床头柜面、墙缝和台灯光一起补回来），
// 之后由 pillBottle 按节拍摆放。
function clearSceneBottle(ctx) {
  ctx.save();
  ctx.beginPath(); ctx.rect(678, 428, 174, 232); ctx.clip();
  ctx.fillStyle = '#6E5A48'; ctx.fillRect(678, 428, 174, 192);
  ctx.fillStyle = '#7E5B45'; ctx.fillRect(678, 620, 174, 40);
  line(ctx, 690, 428, 690, 760, { seed: 1203, lw: 2, color: '#624F3E', amp: 2 });
  glow(ctx, 880, 360, 380, 'rgba(246,201,126,0.45)', 0.55);
  ctx.restore();
}

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const d = shot.t1 - shot.t0;
    const U = 26;
    bedside(ctx, gt);
    clearSceneBottle(ctx);
    lowBed(ctx);

    // 关灯进度：提前算，灯晕和屋里余光都要跟着一起灭
    const off = smooth((t - 2.20) / 0.35);

    // ---- 呼吸的光 ----
    lampGlow(ctx, t, {
      x: 880, y: 400, r: 820, period: 1.7, alpha: 0.10, swell: 0.55,
      fade: 1 - off * 0.94,
    });
    dustMotes(ctx, t, { x: 745, y: 350, w: 290, h: 380, count: 14, seed: 411, alpha: 0.22, rise: 6 });

    // 窗外偶尔一辆车：光带先扫过窗玻璃，再从窗框落到屋里一点余光
    if (off < 0.4) {
      carSweep(ctx, t, {
        x: 1252, y: 152, w: 476, h: 396,
        start: 0.13, dur: 0.64, dir: 1, peak: 0.34, band: 190, spill: 0.09,
      });
    }

    // 闹钟的红点在走
    const led = 0.5 + 0.5 * Math.sin(t * 6.3);
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.4 * led;
    ctx.fillStyle = '#E0566E';
    ctx.beginPath(); ctx.arc(604, 522, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // ---- 节拍 ----
    // 0.00–0.10 预备：重心先沉一下（2 帧）
    const pre = smooth(t / 0.06) * (1 - smooth((t - 0.06) / 0.22));
    // 0.10–0.50 侧身转向桌：眼睛先到（0.04），身体 0.12 才转
    const turn = smooth((t - 0.12) / 0.38);
    const cx = lerp(1120, 1010, turn);
    // 0.50–0.98 左臂抬起抓瓶：抬起前有一帧回压
    const reach = gesture(t, 0.66, 0.30, { pre: 0.14, over: 0.06, settle: 0.12 });
    // 1.10–1.40 仰头、身体上抬 0.08 u 再落下
    const tilt = smooth((t - 1.06) / 0.20) * (1 - smooth((t - 1.38) / 0.20));
    // 1.50–2.10 撑床坐下、整体下沉 0.3 u
    const sit = smooth((t - 1.50) / 0.50);
    // 1.45–1.68 吞咽：整个人停半拍
    const gulp = smooth((t - 1.42) / 0.07) * (1 - smooth((t - 1.60) / 0.10));

    let armL = -0.12 - 2.9 * reach;
    armL = lerp(armL, 0.02, smooth((t - 1.04) / 0.26));            // 拿到后放下来，瓶跟手落到胸前
    armL = lerp(armL, -0.10, smooth((t - 1.95) / 0.35));           // 坐下时手停住
    const armR = sway(t, 105, { amp: 0.05 }) + gulp * 0.06 + sit * 0.18;

    const by = 900 + sit * 7.8 - tilt * 2.0 + pre * 1.4;
    const breathAmp = 0.16 * (1 - gulp * 0.6);
    const bob = breathe(t, 104, U, { amp: breathAmp });
    const chest = Math.sin((t - 1.86) * Math.PI * 2 / 2.2) * 1.7 * smooth((t - 1.86) / 0.45);
    const shift = weightShift(t, 104, { amp: 2.2 });
    groundShadow(ctx, cx + shift, 1002, U, { alpha: 0.2 });

    // 表情：转向桌（眯眼盯药瓶）→ 仰头咽下（还眯着）→ 落座后才合上
    // 三个变化都走渐变，ramp 比别处慢——药这一拍是整段最重的一口气。
    const f = faceE1(t, [
      { at: 0.00, eyes: 'tired', mouth: 'none' },
      { at: 0.30, eyes: 'squint', mouth: 'flat', brow: 'worried', ramp: 0.20 },
      { at: 1.44, eyes: 'squint', mouth: 'none', ramp: 0.14 },
      { at: 2.02, eyes: 'closed', mouth: 'none', ramp: 0.24 },
    ], { seed: 104, ramp: 0.20, blinkFrom: 0.8, noBlinkIn: [[1.30, 1.72], [1.94, 2.60]] });

    // 视线：药瓶（左）→ 抓起来的手 → 嘴 → 闭眼前垂到地上
    const look = f.blinking ? 0 : dart(t, [
      { t: 0.00, look: -0.25 },
      { t: 0.14, look: -1.00 },
      { t: 1.10, look: -0.15 },
      { t: 1.44, look: 0.05 },
      { t: 2.00, look: -0.35 },
    ], { dur: 0.12 });

    clawd(ctx, {
      cx: cx + shift, by: by - bob - chest,
      u: U,
      color: P.orange,
      eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
      look,
      seed: 104,
      armL,
      armR,
      legs: [0, -0.02 - sit * 0.30, 0, -0.02 - sit * 0.26],
      rot: Math.sin(t * 0.9) * 0.005 + gulp * 0.012 - tilt * 0.035,
      squash: 0.998 - gulp * 0.02 - sit * 0.016 + chest * 0.0012,
    });

    // 被子：坐下之后盖住下半身（画在角色之后，才有「坐进去」的层次）
    if (sit > 0) {
      ctx.save();
      ctx.globalAlpha = 0.96;
      block(ctx, 936, 806 + 4 * sit, 700, 62, 14, '#B98A83', { stroke: P.ink, lw: 5, seed: 480 });
      block(ctx, 944, 806 + 4 * sit, 684, 30, 12, '#D9C6A4', { stroke: P.ink, lw: 4, seed: 481 });
      ctx.restore();
    }

    // ---- 药瓶：1.10 s 离开桌面，跟着手走，然后倾倒 ----
    const handX = cx - 6.6 * U + shift;
    const handY = by - 5 * U + armL * U + 0.55 * U;
    const attach = smooth((t - 1.02) / 0.16);
    const bx = lerp(765, handX, attach);
    const byB = lerp(650, handY, attach);
    const pour = smooth((t - 1.10) / 0.22);
    const rot = 1.30 * pour;
    pillBottle(ctx, bx, byB, rot);

    // 一粒药：从瓶口落到嘴里
    if (t > 1.30 && t < 1.62) {
      const k = clamp((t - 1.30) / 0.24, 0, 1);
      const mx = bx + 210 * Math.sin(rot);
      const my = byB - 210 * Math.cos(rot);
      const px = lerp(mx, cx, k);
      const py = lerp(my, by - 3.8 * U, k * k) - Math.sin(k * Math.PI) * 10;
      const show = k < 0.92 ? 1 : (k < 1 ? 0.5 : 0);
      if (show > 0) {
        ctx.save();
        ctx.globalAlpha = show;
        ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#F2E3C6'; ctx.fill();
        ctx.lineWidth = 2.5; ctx.strokeStyle = P.ink; ctx.stroke();
        ctx.restore();
      }
    }

    // 喉咙处很小的一下：吞咽的可见痕迹
    if (gulp > 0.1) {
      ctx.save();
      ctx.globalAlpha = 0.35 * gulp;
      ctx.strokeStyle = P.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, by - 3.2 * U, 9, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.restore();
    }

    // 关灯：房间暗下，窗外霓虹留一点
    if (off > 0) {
      ctx.save();
      ctx.globalAlpha = 0.62 * off;
      ctx.fillStyle = '#0C1218';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.globalAlpha = 0.5 * off;
      ctx.fillStyle = '#E0566E';
      ctx.fillRect(1260, 240, 90, 220);
      ctx.fillStyle = '#6FBFD0';
      ctx.fillRect(1440, 300, 160, 90);
      ctx.restore();
    }

    // 灯灭了之后，窗外又一辆车开过去：光扫过窗户，在暗屋里落下一点亮
    if (off > 0.2) {
      carSweep(ctx, t, {
        x: 1252, y: 152, w: 476, h: 396,
        start: 2.30, dur: 0.40, dir: 1, peak: 0.3 * off, band: 190, spill: 0.11,
      });
    }
  },
};