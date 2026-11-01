import { dreamSky, sea, ticketPlatform } from '../src/dream.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { line, block } from '../src/ink.js';
import { BEAT, breath } from '../src/polish-chorus.js';
import { runLimbs } from '../src/fix-round3c.js';
import { exprE3, withBlink, dart } from '../src/expr-e3.js';

// c1 的跑法：两拍冲、一拍收力滑行（节奏型在 fix-round3c.js 里定义）。
// 这一遍是「试探」：滑行段手脚都收住，表情回到平视；冲起来才瞪眼张嘴。
// 摆幅 0.48u（= 评审 0.12u × 4）；三遍副歌里最小。
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    const run = runLimbs('c1', t);
    const ph = run.c.dist;                   // 背景滚动距离（∫v dt）
    const v = run.c.v;

    dreamSky(ctx, gt, {});
    sea(ctx, gt, { y: 880 });

    // 远处的城在倒退
    ctx.save();
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 14; i++) {
      const x = ((i * 180 - ph * 900) % 2400 + 2400) % 2400 - 240;
      const h = 90 + (i * 37) % 160;
      block(ctx, x, 880 - h, 120, h, 4, '#2A4A57', { seed: 300 + i });
    }
    ctx.restore();

    // 车票平台快速后退
    for (let i = 0; i < 5; i++) {
      const x = ((i * 520 - ph * 620) % 2600 + 2600) % 2600 - 340;
      ticketPlatform(ctx, x, 880, 300, gt, { phase: i, seed: 50 + i });
    }

    // 跑：四脚交替 + 两只短臂与腿反相前后摆 + 身体前倾、每步上下起伏
    const stride = run.c.phase;
    const bob = Math.abs(Math.sin(stride)) * 9 * (0.35 + 0.65 * v);
    const lean = -0.02 - 0.12 * v;           // 全速时 ≈ 8°
    const b = breath(gt, 122);

    // 表情：跟着「两拍冲、一拍滑行」的节奏走，冲起来 wide+grin，收力时 normal+smile。
    // 关键帧落在动作的周期边界上（0.1 + n×2 拍），用 expr 过渡，不再按阈值硬切。
    const CYC = BEAT * 2;
    const PH0 = 0.1;                       // 与 fix-round3c 的 c1 节奏同相位
    const kf = [{ t: 0.0, eyes: 'wide', mouth: 'grin' }];
    const lookKf = [{ t: 0.0, look: 0.90 }];
    for (let c = 0; ; c++) {
      const sprint = PH0 + c * CYC;
      const glide = sprint + CYC * 0.72;
      if (glide > d) break;
      kf.push({ t: glide, eyes: 'normal', mouth: 'smile' });
      lookKf.push({ t: glide, look: 0.42 });
      if (sprint + CYC <= d) {
        kf.push({ t: sprint + CYC, eyes: 'wide', mouth: 'grin' });
        lookKf.push({ t: sprint + CYC, look: 0.88 });
      }
    }
    kf.sort((a, b) => a.t - b.t);
    const e = withBlink(gt, 123, exprE3(t, kf));
    // 视线：冲刺时看前方，滑行时收回来瞥一眼脚下
    const look = dart(t, lookKf);

    clawd(ctx, {
      cx: 900, by: 872 - bob + b.y * 2.4, u: 25,
      color: P.orange,
      ...e,
      seed: 122,
      rot: lean,
      look,
      legs: run.legs,
      armL: run.armL + b.a * 0.04,
      armR: run.armR - b.a * 0.04,
      squash: 1 + 0.02 * Math.abs(Math.sin(stride)) * v,
    });

    // 速度线：跟着速度一起收放，滑行时几乎消失
    ctx.save();
    ctx.globalAlpha = 0.12 + 0.28 * v;
    for (let i = 0; i < 10; i++) {
      const y = 300 + i * 60;
      const x = ((ph * 1400 + i * 220) % 2400) - 300;
      line(ctx, x, y, x + 160, y, { seed: 700 + i, lw: 3, color: '#DCE9EC' });
    }
    ctx.restore();
  },
};