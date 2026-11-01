import { clawd } from '../src/character.js';
import { P } from '../src/palette.js';
import { block, line, glow, clamp, smooth } from '../src/ink.js';
import { nightStreaks } from '../src/scenes-intro.js';
import { breath, sway } from '../src/life.js';
import { glassEdge, glassSheen } from '../src/detail-r2.js';
import { faceE1, dart } from '../src/expr-e1.js';

// i-05 车窗近景：玻璃上映出坐在角落的角色；最后眨一下眼，切 v1-01
export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0, d = shot.t1 - shot.t0;

    // 车厢在减速：外面的灯越来越慢
    const u = clamp(t / d, 0, 1);
    const travel = 760 * t - 580 * d * (Math.pow(u, 3) - Math.pow(u, 4) / 2);

    // 窗框（近景，窗几乎占满）
    const wx = 150, wy = 96, ww = 1620, wh = 900;
    block(ctx, 0, 0, 1920, 1080, 0, '#2A2B2E');
    block(ctx, wx - 26, wy - 26, ww + 52, wh + 52, 22, '#C9B08A', { stroke: P.ink, lw: 8, seed: 31 });
    block(ctx, wx, wy, ww, wh, 10, '#0D1922', { seed: 32 });

    // 窗外夜城向后掠
    nightStreaks(ctx, wx, wy, ww, wh, travel / 520, { speed: 520, seed: 57 });
    nightStreaks(ctx, wx, wy, ww, wh, travel / 380, { speed: 380, seed: 91 });

    // 玻璃里的车厢内景：把一块黑分成「窗外夜城 / 车厢内景倒影 / 他自己的像」三层。
    // 灯管在上，座椅靠背在下，都往右上错开一点（倒影不会完全对齐）。
    ctx.save();
    ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
    ctx.translate(12, -5);

    // 上层：灯管与它的光
    ctx.globalAlpha = 0.22;
    block(ctx, wx + 90, wy + 52, ww - 180, 22, 11, '#F2E3C6', { seed: 3410 });
    ctx.globalAlpha = 1;
    glow(ctx, wx + ww / 2, wy + 64, 560, 'rgba(246,221,174,0.30)', 0.26);

    // 中层：座椅靠背一排（只给上缘，够读出「坐在车厢里」）
    ctx.globalAlpha = 0.20;
    ctx.fillStyle = '#3B4A50';
    ctx.fillRect(wx, wy + wh - 150, ww, 150);
    for (let i = 0; i < 4; i++) {
      block(ctx, wx + 54 + i * 402, wy + wh - 232, 300, 92, 24, '#3B4A50', { seed: 3420 + i });
    }
    // 他要坐的那条长椅坐垫：倒影有地方坐，才不是浮在玻璃里
    ctx.globalAlpha = 0.26;
    block(ctx, wx + 300, wy + wh - 146, 900, 40, 12, '#4E5A5E', { seed: 3431 });
    ctx.globalAlpha = 1;

    // 扶手横杆
    ctx.globalAlpha = 0.34;
    line(ctx, wx, wy + 146, wx + ww, wy + 138, { seed: 36, lw: 9, color: '#6E5F4C', amp: 1.2 });
    ctx.globalAlpha = 1;
    ctx.restore();

    // 倒影：角色坐在角落（脸落在窗高 55% 处，读完是「一个人映在玻璃里」）
    const sw = sway(t, { seed: 45, period: 4.2, armAmp: 0.012, rotAmp: 0.004 });
    const swx = Math.sin(t * 1.25) * 3 + Math.sin(t * 0.47 + 1.1) * 1.4;
    const b = breath(t, { seed: 45, period: 2.6, amp: 0.05 });
    // 3.27 s 的眨眼是这一镜的收尾（剧情点）；其余眨眼交给 faceE1 的节拍。
    // 表情两处：0.30 眼睛先离开地板、转到窗外（嘴不动），2.55 看出神以后慢慢松下来。
    const blinkAt = d - 0.62;
    const blinkBeat = t > blinkAt && t < blinkAt + 0.2;
    const f = faceE1(t, [
      { at: 0.00, eyes: 'dazed', mouth: 'none' },
      { at: 0.30, eyes: 'look', mouth: 'none', ramp: 0.20 },
      { at: 2.55, eyes: 'tired', mouth: 'none', ramp: 0.22 },
    ], {
      seed: 45, ramp: 0.20, blinkFrom: 0.55,
      blink: { slot: 1.6, jitter: 0.4, phase: 0.5 },
      noBlinkIn: [[blinkAt - 0.24, d]],
    });
    const eyes = blinkBeat ? 'closed' : f.eyes;
    const blinking = blinkBeat || f.blinking;
    // 视线是「停一下再跳过去」，不是匀速摇过去：地板 → 窗外 → 慢慢垂回
    const lookTo = blinkBeat ? 0 : dart(t, [
      { t: 0.00, look: -0.70 },
      { t: 0.30, look: 0.02 },
      { t: 2.58, look: -0.16 },
    ], { dur: 0.10 });
    const turn = smooth((t - 0.40) / 0.70);
    const reflect = (offX, offY, skew, alpha) => {
      ctx.save();
      ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
      ctx.globalAlpha = alpha;
      ctx.translate(offX, offY);
      ctx.transform(1, 0.008, skew, 1, 0, 0);
      clawd(ctx, {
        cx: 806 + swx + sw.rot * 200, by: 870, u: 46,
        color: P.orange,
        eyes,
        look: blinking ? 0 : lookTo,
        mouth: f.mouth,
        seed: 45,
        bodyDy: b.bodyDy,
        legs: [0, -0.12, 0, -0.12],
        squash: 0.995 * b.squash,
        rot: sw.rot + 0.026 * turn,
        armL: sw.armL, armR: sw.armR,
      });
      ctx.restore();
    };
    // 先一层更淡的鬼影，再压暗的主体：玻璃里的像不会完全对齐
    reflect(26, -13, -0.05, 0.10);
    reflect(14, -6, -0.035, 0.80);

    // 窗光在他的上缘压出一条暖边：倒影是被「外面的光」照出来的，不是贴在暗玻璃上
    ctx.save();
    ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
    ctx.globalAlpha = 0.5;
    glow(ctx, 806, 430, 380, 'rgba(196,224,230,0.30)', 0.13);
    ctx.restore();

    // 呼吸：玻璃上极轻的一层雾气，呼出后慢慢散掉（不抢倒影）
    const fog = smooth((t - 1.62) / 0.5) * (1 - smooth((t - 2.42) / 1.0));
    if (fog > 0.01) {
      ctx.save();
      ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
      ctx.globalAlpha = 0.075 * fog;
      const fg = ctx.createRadialGradient(806 + swx, 830, 30, 806 + swx, 830, 320 + 120 * fog);
      fg.addColorStop(0, 'rgba(228,238,240,0.95)');
      fg.addColorStop(0.55, 'rgba(228,238,240,0.45)');
      fg.addColorStop(1, 'rgba(228,238,240,0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.ellipse(806 + swx, 835, 320 + 150 * fog, 130 + 70 * fog, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // 玻璃把倒影压暗一点、压冷一点（比原来轻，脸要吃得到光）
    ctx.save();
    ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
    ctx.globalAlpha = 0.075;
    ctx.fillStyle = '#16303C';
    ctx.fillRect(wx, wy, ww, wh);
    ctx.restore();

    // 外面的灯条落在玻璃上的高光：比窗外的灯慢半拍，横向拉长
    glassSheen(ctx, wx, wy, ww, wh, travel, t, { seed: 2901 });

    // 偶尔掠过的站台灯
    ctx.save();
    ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
    const pass = 1900 - ((t * 720) % 2400);
    const pg = ctx.createLinearGradient(pass - 100, 0, pass + 100, 0);
    pg.addColorStop(0, 'rgba(220,235,235,0)');
    pg.addColorStop(0.5, 'rgba(220,235,235,0.16)');
    pg.addColorStop(1, 'rgba(220,235,235,0)');
    ctx.fillStyle = pg;
    ctx.fillRect(pass - 100, wy, 200, wh);
    ctx.restore();

    // 玻璃反光：两道斜高光
    ctx.save();
    ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
    ctx.globalAlpha = 0.10;
    ctx.fillStyle = '#DDEBF0';
    ctx.beginPath();
    ctx.moveTo(wx + 180, wy); ctx.lineTo(wx + 520, wy); ctx.lineTo(wx + 120, wy + wh); ctx.lineTo(wx - 220, wy + wh);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(wx + 780, wy); ctx.lineTo(wx + 900, wy); ctx.lineTo(wx + 500, wy + wh); ctx.lineTo(wx + 380, wy + wh);
    ctx.closePath(); ctx.fill();
    ctx.restore();

    // 窗框压线
    block(ctx, wx, wy, ww, wh, 10, null, { stroke: P.ink, lw: 7, seed: 33 });
    // 玻璃内缘：一圈冷边，像隔着一层玻璃在看
    glassEdge(ctx, wx, wy, ww, wh);
    // 车窗下沿一道街灯暖光，接 v1-01
    glow(ctx, 1560, wy + wh - 40, 420, 'rgba(246,201,126,0.35)', 0.35 * smooth((t - (d - 0.8)) / 0.8));
  },
};