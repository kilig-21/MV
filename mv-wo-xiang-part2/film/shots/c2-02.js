import { dreamSky } from '../src/dream.js';
import { noteSprout, motes } from '../src/scenes-chorus23.js';
import { bokehCity, noteOrbit, noteMark } from '../src/polish-chorus-r2.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, glow } from '../src/ink.js';
import { beatInfo, breath } from '../src/polish-chorus.js';
import { exprE3, withBlink, beatClock, dart } from '../src/expr-e3.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;

    // 贴地仰拍：不画平台，脚下只剩一条地缝，城市被甩到身后虚掉
    dreamSky(ctx, gt, { top: '#101D29', mid: '#1C3543', low: '#2A4A59', moonX: -400, moonY: -400, moonR: 1 });
    bokehCity(ctx, gt, { y: 980, seed: 501 });

    // 地：低机位只看到一条压扁的地面
    ctx.fillStyle = '#152832';
    ctx.fillRect(0, 966, 1920, 114);
    ctx.fillStyle = '#1E3A47';
    ctx.fillRect(0, 966, 1920, 10);

    // 角色背后的暖光，把轮廓从虚掉的城里拉出来
    glow(ctx, 960, 760, 620, 'rgba(246,201,126,0.55)', 0.28);

    const bi = beatInfo(gt);
    const pump = Math.exp(-bi.ph * 3.6);
    const dir = bi.inBar % 2 === 0 ? 1 : -1;
    const b = breath(gt, 221);
    const push = 1 + 0.06 * smooth(t / d);
    const rise = -6 * pump;

    const cx = 960, by = 1008 - 4 * pump + b.y * 3.2;
    const u = 52;

    // 音符绕成环：后半圈在角色身后
    const phase = gt * 0.55;
    const ring = { cx, cy: 720, rx: 610, ry: 300, t: gt, n: 12, size: 23, ring: true };
    noteOrbit(ctx, ring, phase, false);

    // 表情：跟着缠绕的音符走——第一拍笑开，第二拍眼睛亮起来。
    // 视线不钉在镜头上，跟着手和最近的音符左右跳。
    const bc = beatClock(shot.t0);
    const e = withBlink(gt, 221, exprE3(t, [
      { t: 0.00, eyes: 'happy', mouth: 'smile' },
      { t: bc.b(0), eyes: 'happy', mouth: 'grin' },
      { t: bc.b(1), eyes: 'sparkle', mouth: 'grin' },
    ]));
    const look = dart(t, [
      { t: 0.04, look: -0.20 }, { t: bc.b(0), look: 0.45 },
      { t: bc.b(1), look: -0.30 }, { t: bc.b(2), look: 0.15 },
    ]);

    clawd(ctx, {
      cx, by, u,
      color: P.orange,
      ...e, blush: true,
      seed: 221,
      look,
      armL: -0.34 - 0.55 * (dir > 0 ? pump : 0.3) + b.a * 0.05,
      armR: -0.34 - 0.55 * (dir < 0 ? pump : 0.3) - b.a * 0.05,
      rot: 0.018 * dir * pump,
      squash: 1 - 0.012 * pump,
    });

    // 音符从身体里长出来
    noteSprout(ctx, cx, by, u, t, { n: 9, delay: 0.02, stagger: 0.055, grow: 0.5, spread: 0.4 });

    // 前半圈：最近的几个音会挡住身体，环才立起来
    noteOrbit(ctx, ring, phase, true);

    // 前景：摄影机贴着的一颗虚焦灯 + 一个擦过下缘的大音符
    for (let i = 3; i >= 1; i--) {
      ctx.beginPath();
      ctx.arc(200, 1010, i * 82, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(246,201,126,${0.05 * (4 - i)})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(1760, 940, i * 70, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,160,168,${0.04 * (4 - i)})`;
      ctx.fill();
    }
    noteMark(ctx, 1650 + Math.sin(gt * 0.9) * 16, 1010, 54, 'rgba(241,217,168,0.22)', -0.5);
    noteMark(ctx, 250 + Math.sin(gt * 0.7) * 12, 880, 34, 'rgba(232,160,168,0.16)', 0.3);

    motes(ctx, gt, 30, { alpha: 0.4, y0: 1080, speed: 150 });
  },
};