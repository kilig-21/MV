import { dreamSky, windLines } from '../src/dream.js';
import { cloudBank, motes, horizonGlow } from '../src/scenes-chorus23.js';
import { cityLine } from '../src/scenes.js';
import { groundShadow } from '../src/character.js';
import { P } from '../src/palette.js';
import { line, block, lerp } from '../src/ink.js';
import { beatInfo, breath } from '../src/polish-chorus.js';
import { clawdBack, runLimbs } from '../src/fix-round3c.js';

// c3 的「一日千里」：机位搬到角色背后跟拍。
// 前两遍都是侧面横向跟随，这一遍换成背面 + 透视票面 + 放射状速度线；
// 跑法也用 c3 的连绵冲刺（摆幅 0.80u，三遍里最大）。
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    const run = runLimbs('c3', t);
    const stride = run.c.phase;
    const v = run.c.v;
    const bi = beatInfo(gt);
    const vp = { x: 960, y: 600 };            // 灭点：票面尽头、地平线处

    // 天：越往前越亮，正前方压一条暖光带
    dreamSky(ctx, gt, { top: '#1B3343', mid: '#2C5666', low: '#3C6E7B', moonX: -400, moonY: -400, moonR: 1 });
    horizonGlow(ctx, vp.y, { alpha: 0.9 });

    // 正前方：远处的城（小、雾后），再远一点是云海
    ctx.save();
    ctx.globalAlpha = 0.9;
    cityLine(ctx, { y: vp.y + 6, seed: 413, scroll: gt * 90, color: '#1B3543', minH: 40, maxH: 120, win: '#E3B36A' });
    ctx.restore();
    ctx.save();
    const fog = ctx.createLinearGradient(0, vp.y - 160, 0, vp.y + 30);
    fog.addColorStop(0, 'rgba(47,85,102,0)');
    fog.addColorStop(1, 'rgba(47,85,102,0.6)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, vp.y - 160, 1920, 190);
    ctx.restore();
    cloudBank(ctx, 240, vp.y + 40, 0.8, { alpha: 0.5, fill: '#3F6270' });
    cloudBank(ctx, 1520, vp.y + 66, 1.0, { alpha: 0.45, fill: '#3A5C6A' });

    // 侧后方掠过的楼：从灭点两侧向镜头冲出来，越近越大、越暗
    const passTowers = () => {
      for (let side of [-1, 1]) {
        for (let i = 0; i < 2; i++) {
          const p = ((gt * 0.75 + i * 0.5 + (side > 0 ? 0.25 : 0)) % 1 + 1) % 1;
          const s = 0.25 + 2.4 * p * p;
          const x = vp.x + side * (140 + p * 1250);
          const w = 110 * s + 40;
          const top = vp.y - 60 - 260 * s;
          ctx.save();
          ctx.globalAlpha = Math.min(1, p * 3) * 0.95;
          block(ctx, x - w / 2, top, w, 1080 - top, 6, i ? '#0C1C25' : '#10242E', { stroke: P.ink, lw: 5, seed: 420 + i + (side > 0 ? 2 : 0) });
          // 窗灯：越近越少亮，避免抢戏
          for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 3; c++) {
              if ((r * 5 + c * 7 + i) % 4 === 0) {
                ctx.globalAlpha = 0.55 * Math.min(1, p * 3);
                ctx.fillStyle = '#E3B36A';
                ctx.fillRect(x - w * 0.3 + c * w * 0.26, top + 40 + r * 90, w * 0.12, w * 0.15);
              }
            }
          }
          ctx.restore();
        }
      }
    };

    // 票面透视：从灭点铺到画面外，人站在近处这一头
    const farY = vp.y + 40, nearY = 1200;
    const farW = 520, nearW = 3000;
    const depthK = k => k * k;
    const yAt = k => lerp(farY, nearY, depthK(k));
    const wAt = k => lerp(farW, nearW, depthK(k));

    // 票面
    ctx.beginPath();
    ctx.moveTo(vp.x - farW / 2, farY);
    ctx.lineTo(vp.x + farW / 2, farY);
    ctx.lineTo(vp.x + nearW / 2, nearY);
    ctx.lineTo(vp.x - nearW / 2, nearY);
    ctx.closePath();
    ctx.fillStyle = '#DCC9A4';
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = P.ink;
    ctx.stroke();

    // 印线跟着速度往镜头方向跑（k 由灭点向外增），读出「票面在脚下后退」
    const scroll = (gt * 0.42) % 1;
    ctx.save();
    ctx.globalAlpha = 0.55;
    for (let i = 0; i < 9; i++) {
      const k = ((i / 9 + scroll) % 1);
      const y = yAt(k), w = wAt(k);
      ctx.globalAlpha = 0.16 + 0.4 * k;
      line(ctx, vp.x - w / 2 + 30, y, vp.x + w / 2 - 30, y,
        { seed: 431 + i, lw: 2 + 4 * k, color: 'rgba(120,100,70,0.75)', amp: 1 + 2 * k, parts: 6 });
    }
    ctx.globalAlpha = 0.5;
    for (let i = -3; i <= 3; i++) {
      line(ctx, vp.x + i * 34, farY + 6, vp.x + i * 470, nearY,
        { seed: 450 + i, lw: 3, color: 'rgba(120,100,70,0.55)', amp: 1.4, parts: 5 });
    }
    // 票根撕线（右侧 1/4 处，随透视变宽）
    line(ctx, vp.x + farW * 0.26, farY + 4, vp.x + nearW * 0.26, nearY,
      { seed: 458, lw: 5, color: 'rgba(120,100,70,0.6)', amp: 1.6, parts: 8 });
    ctx.restore();

    // 票面尽头的撕齿
    ctx.fillStyle = 'rgba(28,34,40,0.6)';
    for (let i = 1; i < 9; i++) {
      const px = vp.x - farW / 2 + (farW / 9) * i;
      ctx.beginPath();
      ctx.arc(px, farY, 6, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
    }

    // 地面阴影：背面跟拍也要有落点
    groundShadow(ctx, 960, 882, 40 * 0.62, { alpha: 0.2, w: 5.4 });

    passTowers();

    // 放射速度线：从灭点往画面外冲
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + 0.16;
      const r0 = ((gt * 760 + i * 137) % 620) + 160;
      const r1 = r0 + 90 + 140 * ((i % 3) / 2);
      const x0 = vp.x + Math.cos(a) * r0, y0 = vp.y + Math.sin(a) * r0 * 0.62;
      const x1 = vp.x + Math.cos(a) * r1, y1 = vp.y + Math.sin(a) * r1 * 0.62;
      ctx.globalAlpha = 0.18 + 0.26 * Math.min(1, r1 / 760);
      line(ctx, x0, y0, x1, y1, { seed: 470 + i, lw: 3, color: i % 5 ? '#DCE9EC' : '#F6C97E', amp: 1.2 });
    }
    ctx.restore();

    // 角色：背面跟拍，正对前方（看不到脸）
    const bob = Math.abs(Math.sin(stride)) * 9 * v + 2 * Math.exp(-bi.ph * 4);
    const sway = Math.sin(stride * 0.5) * 5 * v;
    const b = breath(gt, 322, 0.9);

    clawdBack(ctx, {
      cx: 960 + sway, by: 882 - bob + b.y * 2.2, u: 40,
      color: P.orange,
      seed: 322,
      rot: 0.015 * Math.sin(stride * 0.5) + b.r * 0.01,
      legs: run.legs,
      armL: run.armL + b.a * 0.05,
      armR: run.armR - b.a * 0.05,
      squash: 1 + 0.02 * Math.abs(Math.sin(stride)),
    });

    // 前景飞过的纸屑与风
    motes(ctx, gt, 22, { alpha: 0.55, y0: 1080, speed: 460 });
    windLines(ctx, gt, 4, 0.10);
  },
};