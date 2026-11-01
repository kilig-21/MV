import { dreamSky, sea, ticketPlatform, windLines, rainLines } from '../src/dream.js';
import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth } from '../src/ink.js';
import { BEAT, keys, backOut, breath, beatPulse } from '../src/polish-chorus.js';
import { exprE3, withBlink, beatClock, dart, browAt } from '../src/expr-e3.js';

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;
    dreamSky(ctx, gt, {});
    sea(ctx, gt, { y: 820 });
    const py = ticketPlatform(ctx, 960, 820, 460, gt, { phase: 0, seed: 41 });

    // 云从两边聚过来：先试探，到 2.3 秒才真的压满
    const gather = keys(t, [[0, 0.05], [0.9, 0.35], [1.5, 0.42], [2.3, 1.0]]);
    for (let i = 0; i < 3; i++) {
      const x = 300 + i * 660 + Math.sin(gt * 0.5 + i) * 20;
      const y = 170 + i * 40 - gather * 10;
      ctx.save();
      ctx.globalAlpha = 0.3 + 0.3 * gather;
      ctx.fillStyle = i % 2 ? '#4A6A78' : '#40606E';
      ctx.beginPath();
      ctx.ellipse(x, y, 200 + i * 40, 70, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 120, y + 20, 150, 56, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    windLines(ctx, gt, 7, 0.22 + 0.48 * gather);
    rainLines(ctx, gt, Math.round(30 + 70 * gather));

    // ── 抬手呼风：第一阶段只抬到四成，停两帧（犹豫），再抬手到位 ──
    // 反向预备 0.1s → 抬到 0.38 → 停 0.09s → 冲到位并过冲 → 回落
    const raise = keys(t, [
      [0.00, 0.05],
      [0.12, -0.10],
      [0.34, -0.38],
      [0.43, -0.38],          // 半拍犹豫：手停在半路
      [0.82, -0.96, backOut],
      [1.05, -0.84],
    ]);
    // 到位之后不停住：两拍一次的小推挤 + 用力的细微抖，手臂一直在使劲
    const strain = 0.10 * smooth((t - 0.9) / 0.4) * Math.sin((t - 0.9) * 2 * Math.PI / (BEAT * 2));
    const tremble = 0.022 * smooth((t - 0.85) / 0.5) * Math.sin(t * 27);

    const b = breath(gt, 120);
    const lift = Math.sin(t * 2.2) * 3 + b.y * 3.4;
    // 预备：先沉一下再起
    const squash = keys(t, [[0, 1.0], [0.16, 1.05], [0.5, 0.99], [0.9, 0.975], [1.3, 1.0]]);

    // 表情：试探着呼风——wide（期待）与 normal（不确定）交替，
    // 手停在半路时收一下，风真的起来才张一下嘴，云聚满才放松。
    const bc = beatClock(shot.t0);
    const e = withBlink(gt, 121, exprE3(t, [
      { t: 0.00, eyes: 'wide', mouth: 'flat', brow: 'up' },
      { t: bc.b(0), eyes: 'normal', mouth: 'flat' },
      { t: bc.b(1), eyes: 'wide', mouth: 'o' },
      { t: bc.b(3), eyes: 'normal', mouth: 'smile', brow: null },
    ]));
    const browDy = browAt(t, [{ at: bc.b(1) + 0.10, dur: 0.30, amp: 0.16 }]);
    // 视线：先看自己举起的手，再抬眼看向聚过来的云
    const look = dart(t, [
      { t: 0.05, look: 0.10 }, { t: 0.38, look: -0.30 },
      { t: 0.95, look: -0.15 }, { t: 1.75, look: 0.35 }, { t: 2.90, look: 0.15 },
    ]);

    clawd(ctx, {
      cx: 960, by: py - 8 + lift, u: 26,
      color: P.orange,
      ...e, browDy, blush: true,
      seed: 120,
      armL: raise + strain + tremble + b.a * 0.05,
      armR: raise - strain * 0.7 - tremble + 0.05 * b.a,
      look,
      rot: -0.02 + b.r * 0.01,
      squash,
    });

    // 节拍圈：每拍小圈，每 4 拍一次大圈（强弱拍分开）
    beatPulse(ctx, 960, py + 10, gt, 0.72, { beatAlpha: 0.26, barAlpha: 0.5 });
  },
};