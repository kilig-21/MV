import { dreamSky, windLines } from '../src/dream.js';
import { motes } from '../src/scenes-chorus23.js';
import { scraps, fgRain } from '../src/polish-chorus-r2.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { block, line, rng, smooth, glow } from '../src/ink.js';
import { beatInfo, breath } from '../src/polish-chorus.js';
import { runLimbs } from '../src/fix-round3c.js';
import { exprE3, withBlink, dart } from '../src/expr-e3.js';

// 一层会以 speed 向左掠过的楼。不同层给不同速度，就有了视差。
function buildingLayer(ctx, gt, o) {
  const R = rng(o.seed);
  const total = o.total ?? 3400;
  const step = o.step ?? 260;
  const n = Math.ceil(total / step) + 1;
  for (let i = 0; i < n; i++) {
    const h = o.minH + R() * (o.maxH - o.minH);
    const w = o.wMin + R() * (o.wMax - o.wMin);
    const x = ((i * step - gt * o.speed) % total + total) % total - (o.margin ?? 400);
    const baseY = o.y;
    ctx.fillStyle = o.color;
    ctx.fillRect(x, baseY - h, w, h + 8);
    // 窗灯
    const cols = Math.floor(w / 40), rows = Math.floor(h / 46);
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (R() < (o.winP ?? 0.24)) {
          ctx.globalAlpha = 0.5 + R() * 0.4;
          ctx.fillStyle = o.win || '#E3B36A';
          ctx.fillRect(x + 12 + c * 40, baseY - h + 16 + r * 46, 10, 13);
        }
      }
    }
    ctx.globalAlpha = 1;
    // 屋顶水塔/天线，剪影里加一点信息
    if (o.props && R() < 0.4) {
      ctx.fillStyle = o.color;
      ctx.fillRect(x + w * 0.3, baseY - h - 22, 26, 22);
      ctx.fillRect(x + w * 0.3 + 10, baseY - h - 40, 4, 20);
    }
  }
}

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    const bi = beatInfo(gt);
    const pump = Math.exp(-bi.ph * 3.2);
    // 第二遍的跑法：「碎步—大跨」。一拍里两下碎步，拍尾拉开一次大跨。
    const run = runLimbs('c2', t);
    const stride = run.c.phase;
    const speed = 1.1 + 2.4 * smooth(t / d) + 0.25 * pump;

    // 夜景压暗，不画月亮：这一镜的主角是掠过的楼
    dreamSky(ctx, gt, { top: '#0E1A25', mid: '#1A3340', low: '#26454F', moonX: -400, moonY: -400, moonR: 1 });

    // 远层：小、慢、灰
    ctx.save();
    ctx.globalAlpha = 0.75;
    buildingLayer(ctx, gt, { y: 806, speed: 120 * speed, minH: 90, maxH: 200, wMin: 70, wMax: 130, step: 190, seed: 331, color: '#17303C', winP: 0.18, margin: 260 });
    ctx.restore();
    // 中层
    buildingLayer(ctx, gt, { y: 880, speed: 420 * speed, minH: 150, maxH: 320, wMin: 110, wMax: 190, step: 280, seed: 332, color: '#142C38', winP: 0.26, margin: 320, props: true });
    // 近层：大、快、最暗
    buildingLayer(ctx, gt, { y: 972, speed: 980 * speed, minH: 240, maxH: 480, wMin: 170, wMax: 280, step: 420, seed: 333, color: '#0F2530', winP: 0.3, margin: 420 });

    // 街面：一条被速度拉直的暗带
    ctx.fillStyle = '#0C1A23';
    ctx.fillRect(0, 972, 1920, 108);

    // 平台只剩边缘：脚下一条被撕过的票边，随镜头往后滑
    ctx.save();
    ctx.translate(960, 1002);
    ctx.rotate(-0.012);
    ctx.fillStyle = '#E8D5B0';
    ctx.fillRect(-1400, -18, 4200, 44);
    ctx.fillStyle = '#232227';
    ctx.fillRect(-1400, 26, 4200, 6);
    // 撕齿：一排小半圆，跟着速度往左跑
    ctx.fillStyle = '#0C1A23';
    const off = (gt * 1100) % 70;
    for (let x = -1400 - off; x < 2800; x += 70) {
      ctx.beginPath(); ctx.arc(x, -18, 9, 0, Math.PI, true); ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    // 角色：左三分之一，前方留出跑道
    // 碎步—大跨的起伏比第一遍大：碎步是短促的小顶，大跨那一下整个人被抬起来。
    const bounce = Math.abs(Math.sin(stride)) * 17 * run.c.v + 4 * pump;
    const b = breath(gt, 222, 1.2);

    // 表情：跑得熟练——happy 打底，大跨那一下 wide 发力，楼全亮起来才 sparkle。
    // 视线跟着掠过的楼左右看，不钉死在镜头上。
    const e = withBlink(gt, 222, exprE3(t, [
      { t: 0.00, eyes: 'happy', mouth: 'grin' },
      { t: 1.20, eyes: 'wide', mouth: 'grin' },
      { t: 2.10, eyes: 'happy', mouth: 'grin' },
      { t: 2.90, eyes: 'sparkle', mouth: 'grin' },
      { t: 3.45, eyes: 'sparkle', mouth: 'smile' },
    ]));
    const look = dart(t, [
      { t: 0.05, look: 0.32 }, { t: 1.10, look: -0.10 },
      { t: 2.20, look: 0.55 }, { t: 3.10, look: 0.30 },
    ]);

    clawd(ctx, {
      cx: 730, by: 984 - bounce + b.y * 2.4, u: 33,
      color: P.orange,
      ...e,
      seed: 222,
      look,
      // 前倾比第一遍更深，大跨时再压一点
      rot: -0.05 - 0.12 * run.c.v - 0.02 * pump,
      legs: run.legs,
      armL: run.armL + b.a * 0.04,
      armR: run.armR - b.a * 0.04,
      squash: 1 + 0.035 * pump,
    });

    // 速度线：贴着角色高度横飞
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.12 * pump;
    for (let i = 0; i < 13; i++) {
      const y = 240 + i * 56;
      const x = ((gt * 1900 * speed + i * 240) % 2800) - 380;
      line(ctx, x, y, x + 210, y, { seed: 720 + i, lw: 3, color: '#DCE9EC' });
    }
    ctx.restore();

    // 前景：楼角从画面左边擦过去（比角色快一档），再飘几片纸
    for (let i = 0; i < 3; i++) {
      const rx = 480 - (((gt * 1500 + i * 440) % 1320));
      if (rx < -20) continue;
      ctx.save();
      // 楼体 + 顶上的女儿墙和水箱，读作"贴着镜头的一栋楼"
      ctx.fillStyle = '#0B1C25';
      ctx.fillRect(rx - 320, 236, 320, 800);
      ctx.fillRect(rx - 320, 214, 320, 26);
      ctx.fillRect(rx - 250, 150, 54, 66);
      ctx.fillRect(rx - 240, 126, 34, 30);
      ctx.strokeStyle = P.ink;
      ctx.lineWidth = 5;
      ctx.strokeRect(rx - 320, 214, 320, 822);
      ctx.strokeRect(rx - 250, 150, 54, 66);
      // 一排排窗，只有两三扇亮着
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 3; c++) {
          const lit = (r * 7 + c * 5 + i * 3) % 4 === 0;
          ctx.fillStyle = lit ? 'rgba(227,179,106,0.8)' : 'rgba(24,44,54,0.9)';
          ctx.fillRect(rx - 288 + c * 86, 300 + r * 76, 40, 48);
        }
      }
      ctx.restore();
    }
    scraps(ctx, gt, 5, { speed: 520, seed: 813, y0: 260, span: 620 });
    fgRain(ctx, gt, 10, { alpha: 0.22, dir: -1, seed: 619 });

    // 前景：头顶掠过的电线和一盏吊灯，把画面上缘也撑住
    ctx.save();
    ctx.strokeStyle = P.ink;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-40, 120);
    ctx.quadraticCurveTo(520, 236, 1050, 140);
    ctx.quadraticCurveTo(1520, 60, 1980, 150);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-40, 188);
    ctx.quadraticCurveTo(600, 292, 1980, 208);
    ctx.stroke();
    line(ctx, 1290, 168, 1290, 256, { seed: 749, lw: 4, color: P.ink, amp: 0.6 });
    block(ctx, 1264, 256, 52, 34, 12, P.lamp, { stroke: P.ink, lw: 5, seed: 750, amp: 0.8 });
    glow(ctx, 1290, 300, 250, 'rgba(246,201,126,0.5)', 0.3);
    ctx.restore();

    motes(ctx, gt, 30, { alpha: 0.4, y0: 1040, speed: 240 });
    windLines(ctx, gt, 5, 0.12);
  },
};