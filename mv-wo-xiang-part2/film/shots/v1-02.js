import { phonePaywall } from '../src/scenes2.js';
import { clawd, groundShadow } from '../src/character.js';
import { P } from '../src/palette.js';
import { smooth, block, glow, clamp } from '../src/ink.js';
import { breathe, sway, gesture, backOut, bounce, weightShift } from '../src/polish-v1.js';
import { faceE1, dart } from '../src/expr-e1.js';
import { framedScene } from '../src/fix-round3a.js';

// 屏幕取景：评审 B 指这条特写里主角被画框切掉一条边、屏幕与角色之间留大片死黑。
// 把整块手机屏放大到画宽 54%、整体右移到角色旁边；角色完整落在左 1/10。
const VIEW = { scale: 1.24, tx: 190, ty: -14, ax: 960, ay: 520 };

export default {
  draw(ctx, gt, shot) {
    const t = gt - shot.t0;
    const d = shot.t1 - shot.t0;

    // 屏幕之外的死黑先铺掉，再画放大后的屏幕
    ctx.fillStyle = '#101720';
    ctx.fillRect(0, 0, 1920, 1080);
    const map = framedScene(ctx, c => phonePaywall(c, gt), VIEW);

    // 屏幕光落在角色身上，随点击和弹层轻微起伏
    glow(ctx, 1120, 600, 880, 'rgba(190,220,232,0.20)', 0.55 + 0.05 * Math.sin(t * 5));

    // 两次点击：都有抬手前的预备、点到时的过冲、点完的回弹
    let tap = 0;
    for (const at of [0.28, 0.54]) {
      if (t <= at - 0.12) continue;
      let g = gesture(t, at, 0.10, { pre: 0.10, settle: 0.10, over: 0.12 });
      g -= 0.32 * smooth((t - at - 0.10) / 0.12);   // 点完手落回一半
      tap = Math.max(tap, clamp(g, -0.2, 1.1));
    }

    // 第二层弹出来后：手垂下去，人往后缩（眼睛先到 0.06 s，身体 0.10 s 才动）
    const pop = smooth((t - 0.78) / 0.26);
    const drop = smooth((t - 0.80) / 0.30);
    const recoil = smooth((t - 0.84) / 0.16);
    const shake = Math.sin((t - 0.86) * 55) * 2.4 * (1 - smooth((t - 0.86) / 0.22));

    const bob = breathe(t, 80, 30, { amp: 0.2 });
    const shift = weightShift(t, 80, { amp: 3.2 });

    // 三拍：价格刺一下 → 点了关闭没反应 → 又弹一层、垮下来
    const f = faceE1(t, [
      { at: 0.00, eyes: 'look', mouth: 'flat' },
      { at: 0.20, eyes: 'wide', mouth: 'o', ramp: 0.12 },
      { at: 0.56, eyes: 'squint', mouth: 'flat', ramp: 0.14 },
      { at: 0.86, eyes: 'shock', mouth: 'o', ramp: 0.11 },
      { at: 1.06, eyes: 'tired', mouth: 'wavy', brow: 'worried', ramp: 0.18 },
    ], { seed: 80, ramp: 0.14, blinkFrom: 0.38, noBlinkIn: [[0.80, 1.02]] });

    // 屏幕在右边：视线基本钉在屏幕上，只在弹层出来那一刻「往后一缩」
    const look = f.blinking ? 0 : dart(t, [
      { t: 0.00, look: 1.00 },
      { t: 0.56, look: 0.96 },
      { t: 0.88, look: 0.86 },
      { t: 1.06, look: 0.55 },
    ], { dur: 0.10 });

    // 角色完整落在左 1/10：手臂外缘 = 192，右缘 582，与屏幕外框（约 599）留 17 px
    const cx = 387 + shift + shake - recoil * 8;
    groundShadow(ctx, cx, 1012, 26, { alpha: 0.18 });

    clawd(ctx, {
      cx,
      by: 1010 - bob + recoil * 4 + bounce(t, 0.88, { dur: 0.24, amp: 1 }) * 2,
      u: 26,
      color: P.orange,
      eyes: f.eyes, mouth: f.mouth, brow: f.brow, browDy: f.browDy,
      look,
      seed: 80,
      armR: -0.14 - 0.86 * tap * (1 - drop * 0.72),
      armL: sway(t, 81, { amp: 0.05 }) + recoil * 0.12,
      rot: -0.022 * recoil,
      squash: 1 - recoil * 0.018 + bounce(t, 0.88, { dur: 0.24, amp: 1 }) * 0.008,
    });

    // 点击落在「关闭」上的小涟漪（跟着屏幕一起放大、移位）
    const ring = (at) => {
      const k = clamp((t - at) / 0.26, 0, 1);
      if (k <= 0 || k >= 1) return;
      ctx.save();
      ctx.globalAlpha = 0.55 * (1 - k);
      ctx.strokeStyle = P.cream;
      ctx.lineWidth = 5 * (1 - k) + 1;
      ctx.beginPath();
      ctx.arc(map.x(1090), map.y(728), (24 + 46 * k) * map.scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };
    ring(0.38);
    ring(0.64);

    // 点「关闭」后，又弹出一层（带过冲和弹出来的轻微晃动）
    if (pop > 0) {
      const s = 0.72 + 0.28 * backOut(pop, 1.5);
      const k = s * VIEW.scale;
      ctx.save();
      ctx.globalAlpha = pop;
      // 弹层后面的原页面压暗
      ctx.fillStyle = 'rgba(12,16,24,0.28)';
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.translate(map.x(960) + shake, map.y(640));
      ctx.scale(k, k);
      block(ctx, -330, -150, 660, 300, 18, '#1E2430', { stroke: P.ink, lw: 5, seed: 1440 });
      ctx.fillStyle = P.subText; ctx.font = '500 36px NotoSansSC'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('再听一遍？', 0, -60);
      ctx.font = '400 26px NotoSansSC';
      ctx.fillText('完整版歌词需要会员', 0, -10);
      block(ctx, -130, 40, 260, 70, 12, '#D9A03F', { stroke: P.ink, lw: 4, seed: 1441 });
      ctx.fillStyle = '#2B2A2E'; ctx.font = '500 30px NotoSansSC';
      ctx.fillText('开通', 0, 78);
      ctx.restore();
    }

    // 屏幕顶端滑进一张 LAX 航班卡：把下一镜的机场提前递过去（同样跟着屏幕缩放）
    const fly = smooth((t - 1.12) / 0.2);
    if (fly > 0) {
      const y = 150 - (1 - fly) * 60;
      ctx.save();
      ctx.globalAlpha = fly;
      ctx.translate(map.x(980), map.y(y));
      ctx.scale(VIEW.scale, VIEW.scale);
      block(ctx, 0, 0, 320, 92, 14, '#E8DCC4', { stroke: P.ink, lw: 4, seed: 1450 });
      block(ctx, 22, 24, 52, 44, 8, '#4E8FA3', { stroke: P.ink, lw: 3, seed: 1451 });
      ctx.fillStyle = '#2B2A2E'; ctx.font = '700 30px NotoSansSC';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('LAX · 23:40', 92, 34);
      ctx.fillStyle = '#6E6658'; ctx.font = '400 20px NotoSansSC';
      ctx.fillText('登机口 B12', 92, 64);
      ctx.restore();
    }
  },
};