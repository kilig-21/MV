// 前奏 / hook 专用场景：城市窗灯、卷帘门夜街、地铁站台、招牌墙、窗外灯箱。
// 只补 scenes.js 里没有的；天空、星星、月亮、楼群、车厢仍用 scenes.js。
import { P } from './palette.js';
import { block, line, poly, curve, rng, glow, clamp, lerp, smooth } from './ink.js';
import { nightSky, stars, moon, cityLine, floorPlane } from './scenes.js';
import { cityWindowsIO } from './polish-intro-outro.js';

// ---------------- i-01 城市窗灯：一盏盏亮 ----------------
// 打磨后与 o-06 共用 polish-intro-outro.cityWindowsIO：起亮时刻成簇、亮度与
// 起亮速度各自不同、少数窗亮一下就灭，且与尾奏共用同一份楼群数据（首尾成环）。
export function cityWindowsLit(ctx, o = {}) {
  return cityWindowsIO(ctx, o);
}

// ---------------- i-02 街角：卷帘门半开的便利店 + 路灯 + 水光 ----------------
export function shutterStreet(ctx, o = {}) {
  const t = o.t ?? 0;
  const lamp = o.lamp ?? 1;          // 路灯亮度 0..1
  const sx = 880, sy = 268, sw = 800, sh = 432;
  const openH = sh * 0.44;           // 卷帘门抬起后露出的高度

  nightSky(ctx, { y: 0, h: 720 });
  stars(ctx, { n: 16, h: 240, seed: 9 });
  moon(ctx, 1660, 128, 40, P.sky);
  cityLine(ctx, { y: 622, seed: 47, minH: 110, maxH: 250, color: '#12242F' });
  cityLine(ctx, { y: 700, seed: 55, minH: 60, maxH: 160, color: '#172D39' });

  // 人行道 / 路缘 / 湿路面
  block(ctx, 0, 700, 1920, 150, 0, '#7E625E');
  block(ctx, 0, 700, 1920, 24, 0, '#997B74', { stroke: P.ink, lw: 4, seed: 41 });
  for (let i = 0; i < 7; i++) line(ctx, i * 300 + 60, 726, i * 300 + 120, 850, { seed: 50 + i, lw: 1.8, color: '#6A4C47', amp: 1 });
  block(ctx, 0, 850, 1920, 18, 0, '#8E7168', { stroke: P.ink, lw: 4, seed: 43 });
  block(ctx, 0, 866, 1920, 214, 0, '#333B42', { seed: 44 });
  // 路面：湿光 + 车道线
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#9FC3CE';
  ctx.fillRect(0, 880, 1920, 60);
  ctx.restore();
  for (let i = 0; i < 9; i++) block(ctx, 40 + i * 240, 1006, 100, 10, 4, '#8E8578', { seed: 46 + i });

  // 店内（只画露出的下半截）
  ctx.save();
  ctx.beginPath(); ctx.rect(sx, sy, sw, sh); ctx.clip();
  ctx.fillStyle = '#4A4038'; ctx.fillRect(sx, sy, sw, sh);
  ctx.fillStyle = '#8A7250'; ctx.fillRect(sx, sy + sh - openH - 40, sw, openH + 40);
  // 货架：简单两层，商品只做色块
  for (let r = 0; r < 2; r++) {
    const yy = sy + sh - openH + 34 + r * 92;
    block(ctx, sx + 60, yy, sw - 260, 64, 3, '#6E5A44', { stroke: P.ink, lw: 4, seed: 80 + r });
    for (let c = 0; c < 6; c++) {
      const R = rng(92 + r * 10 + c);
      ctx.fillStyle = ['#D9A03F', '#A8C48C', '#E8A0A8', '#4E8FA3', '#F2E3C6'][Math.floor(R() * 5)];
      ctx.fillRect(sx + 82 + c * 74, yy + 14, 32, 36);
    }
  }
  // 收银台的一角
  block(ctx, sx + sw - 200, sy + sh - 122, 170, 122, 6, '#6E5038', { stroke: P.ink, lw: 5, seed: 121 });
  ctx.restore();
  block(ctx, sx, sy, sw, sh, 6, null, { stroke: P.ink, lw: 7, seed: 130 });

  // 卷帘门：放下 56%，底缘横杆
  const shutH = sh - openH;
  const shutG = ctx.createLinearGradient(sx, sy, sx, sy + shutH);
  shutG.addColorStop(0, '#9AA0A2');
  shutG.addColorStop(1, '#7E8487');
  ctx.fillStyle = shutG; ctx.fillRect(sx + 4, sy + 4, sw - 8, shutH);
  for (let y = sy + 26; y < sy + shutH - 8; y += 28) {
    line(ctx, sx + 8, y, sx + sw - 8, y, { seed: 140 + Math.round(y), lw: 2, color: '#6C7275', amp: 0.8, parts: 4 });
  }
  block(ctx, sx + 2, sy + shutH - 18, sw - 4, 22, 6, '#5E6467', { stroke: P.ink, lw: 5, seed: 149 });
  // 门缝漏出的一道暖光
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = P.lamp;
  ctx.fillRect(sx + 4, sy + shutH + 4, sw - 8, 10);
  ctx.restore();

  // 招牌：挂在门楣上
  block(ctx, sx + sw / 2 - 150, sy - 80, 300, 68, 10, '#E8D5B0', { stroke: P.ink, lw: 7, seed: 141 });
  ctx.fillStyle = '#2F4A54';
  ctx.font = '500 40px NotoSansSC';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('24H', sx + sw / 2, sy - 45);
  glow(ctx, sx + sw / 2, sy - 46, 240, 'rgba(246,201,126,0.30)', 0.35);

  // 水光：人行道上的水洼
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(690, 792, 260, 34, -0.01, 0, Math.PI * 2);
  ctx.ellipse(1040, 812, 200, 26, 0.015, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(74,96,106,0.72)';
  ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(160,185,195,0.35)'; ctx.stroke();
  ctx.restore();
  // 路灯在水洼里的倒影：竖向波纹
  ctx.save();
  ctx.globalAlpha = 0.55 * lamp;
  ctx.fillStyle = '#E9C685';
  for (let i = 0; i < 7; i++) {
    const yy = 772 + i * 12;
    const ww = 30 + Math.sin(t * 1.6 + i * 0.9) * 14;
    ctx.fillRect(414 - ww / 2, yy, ww, 5);
  }
  ctx.restore();
  // 湿路面上店光的长倒影：越往下越淡
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const xx = sx + 120 + i * 150;
    const ww = 92 + Math.sin(t * 1.1 + i) * 18;
    const gg = ctx.createLinearGradient(0, 890, 0, 1070);
    gg.addColorStop(0, i % 2 ? 'rgba(233,198,133,0.18)' : 'rgba(232,213,176,0.15)');
    gg.addColorStop(1, 'rgba(233,198,133,0)');
    ctx.fillStyle = gg;
    ctx.fillRect(xx - 20, 890, ww, 180);
  }
  ctx.restore();
  // 涟漪
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const ph = ((t * 0.42 + i * 0.37) % 1);
    ctx.globalAlpha = (1 - ph) * 0.26;
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = '#B7CBD2';
    ctx.beginPath();
    ctx.ellipse(620 + i * 90, 792, 18 + ph * 74, 4 + ph * 12, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // 路灯
  line(ctx, 340, 306, 340, 726, { seed: 150, lw: 10, color: P.ink });
  line(ctx, 340, 312, 392, 296, { seed: 152, lw: 7, color: P.ink });
  block(ctx, 366, 274, 96, 26, 12, lamp > 0.5 ? P.lamp : '#6E6A5E', { stroke: P.ink, lw: 6, seed: 151 });
  if (lamp > 0.02) {
    glow(ctx, 414, 300, 360, 'rgba(246,201,126,0.55)', 0.55 * lamp);
    ctx.save();
    const beam = ctx.createLinearGradient(0, 300, 0, 800);
    beam.addColorStop(0, `rgba(246,201,126,${0.10 * lamp})`);
    beam.addColorStop(1, 'rgba(246,201,126,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(378, 300); ctx.lineTo(450, 300); ctx.lineTo(760, 800); ctx.lineTo(150, 800);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  return { sx, sy, sw, sh, shutH, openH, lampX: 414, lampY: 300 };
}
// ---------------- i-03 地铁站台：空站台 + 隧道车头灯 ----------------
export function subwayPlatform(ctx, o = {}) {
  const t = o.t ?? 0;
  const head = clamp(o.head ?? 0, 0, 1);   // 车头灯靠近程度
  const flick = o.flick ?? 0;              // 灯管闪一下
  const tx = 1580, ty = 520;               // 隧道深处车头灯的位置

  // 天花
  ctx.fillStyle = '#2C3438'; ctx.fillRect(0, 0, 1920, 120);
  ctx.fillStyle = '#3A4448'; ctx.fillRect(0, 120, 1920, 18);

  // 墙面：上部瓷砖 + 下部蓝绿护墙
  ctx.fillStyle = '#BDB7A3'; ctx.fillRect(0, 138, 1920, 622);
  for (let r = 0; r < 6; r++) line(ctx, 0, 138 + r * 74, 1920, 138 + r * 74, { seed: 600 + r, lw: 1.6, color: '#A9A38F', amp: 0.6, parts: 8 });
  for (let c = 0; c < 12; c++) line(ctx, c * 160, 138, c * 160, 558, { seed: 620 + c, lw: 1.6, color: '#A9A38F', amp: 0.6 });
  block(ctx, 0, 558, 1920, 202, 0, '#3F7079', { stroke: P.ink, lw: 4, seed: 640 });
  line(ctx, 0, 558, 1920, 558, { seed: 641, lw: 3, color: '#2F5A62' });
  line(ctx, 0, 578, 1920, 578, { seed: 642, lw: 2, color: '#5D8A90' });

  // 线路图
  block(ctx, 300, 250, 440, 200, 8, '#F1E5C9', { stroke: P.ink, lw: 6, seed: 650 });
  ctx.save();
  ctx.beginPath(); ctx.rect(300, 250, 440, 200); ctx.clip();
  line(ctx, 340, 380, 700, 380, { seed: 651, lw: 6, color: '#4E8FA3', amp: 0.4 });
  line(ctx, 520, 300, 520, 420, { seed: 652, lw: 5, color: '#C98A6E', amp: 0.3 });
  for (let i = 0; i < 8; i++) {
    ctx.beginPath(); ctx.arc(340 + i * 52, 380, 6, 0, Math.PI * 2);
    ctx.fillStyle = i === 3 ? P.mustard : '#F1E5C9'; ctx.fill();
    ctx.lineWidth = 2.4; ctx.strokeStyle = P.ink; ctx.stroke();
  }
  ctx.restore();

  // 站名牌（不写站名，只用色块）
  block(ctx, 1080, 168, 320, 76, 8, '#2F4A54', { stroke: P.ink, lw: 5, seed: 660 });
  for (let i = 0; i < 3; i++) block(ctx, 1120 + i * 86, 196, 54, 20, 6, '#9FB4B8', { seed: 661 + i });

  // 长椅（脚落在站台地面上）
  const bx = 140, by = 700;
  block(ctx, bx, by - 92, 340, 30, 8, '#5C8C99', { stroke: P.ink, lw: 5, seed: 670 });
  block(ctx, bx, by - 54, 340, 22, 6, '#7FA5AC', { stroke: P.ink, lw: 5, seed: 671 });
  for (const x of [bx + 30, bx + 280]) {
    line(ctx, x, by - 40, x, by + 60, { seed: 672 + x, lw: 6, color: P.ink });
    line(ctx, x + 20, by + 60, x - 24, by + 60, { seed: 673 + x, lw: 5, color: P.ink });
  }

  // 站台地面 + 安全黄线
  block(ctx, 0, 760, 1920, 320, 0, '#6E5C58');
  line(ctx, 0, 760, 1920, 760, { seed: 680, lw: 4, color: P.ink });
  for (let i = 0; i < 8; i++) line(ctx, i * 260, 760, i * 260 - 120, 1080, { seed: 681 + i, lw: 1.8, color: '#5C4A46', amp: 1 });
  block(ctx, 0, 890, 1920, 22, 0, '#C9A24E');
  block(ctx, 0, 912, 1920, 10, 0, '#8A6E38');

  // 隧道口：混凝土拱圈 + 越往里越黑
  block(ctx, 1346, 150, 574, 610, 16, '#7E7C74', { stroke: P.ink, lw: 7, seed: 690 });
  ctx.save();
  ctx.beginPath(); ctx.rect(1372, 186, 548, 574); ctx.clip();
  ctx.fillStyle = '#0A1116'; ctx.fillRect(1372, 186, 548, 574);
  const deep = ctx.createLinearGradient(1372, 0, 1920, 0);
  deep.addColorStop(0, 'rgba(36,56,66,0.85)');
  deep.addColorStop(0.5, 'rgba(10,18,23,0.9)');
  deep.addColorStop(1, 'rgba(4,8,10,1)');
  ctx.fillStyle = deep; ctx.fillRect(1372, 186, 548, 574);
  // 隧道壁上的小灯
  for (let i = 0; i < 4; i++) {
    ctx.globalAlpha = 0.45 - i * 0.09;
    ctx.fillStyle = '#C9B98E';
    ctx.fillRect(1416 + i * 56, 252 - i * 6, 24, 9);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  block(ctx, 1372, 186, 548, 574, 12, null, { stroke: P.ink, lw: 6, seed: 692 });
  // 隧道里的一小段轨道
  line(ctx, 1430, 760, 1590, 640, { seed: 693, lw: 4, color: '#3A4A50', amp: 0.6 });
  line(ctx, 1520, 760, 1640, 640, { seed: 694, lw: 4, color: '#3A4A50', amp: 0.6 });
  // 红色信号灯
  ctx.beginPath(); ctx.arc(1400, 300, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#C0564E'; ctx.fill();
  ctx.lineWidth = 2.4; ctx.strokeStyle = P.ink; ctx.stroke();

  // 车头：越来越近
  if (head > 0.01) {
    const a = clamp(head * 1.2, 0, 1);
    const w = lerp(46, 520, Math.pow(head, 1.35));
    const h = w * 0.92;
    ctx.save();
    ctx.beginPath(); ctx.rect(1372, 186, 548, 574); ctx.clip();
    const bTop = 746 - h;   // 车头坐在隧道地面上
    block(ctx, tx - w / 2, bTop, w, h, w * 0.12, '#121A20', { stroke: P.ink, lw: 5, seed: 696 });
    // 目的地灯带
    block(ctx, tx - w * 0.26, bTop + h * 0.08, w * 0.52, h * 0.07, w * 0.02, '#E9B96E', { seed: 698 });
    // 风挡
    block(ctx, tx - w * 0.32, bTop + h * 0.22, w * 0.64, h * 0.3, w * 0.05, '#243C46', { stroke: P.ink, lw: 3, seed: 697 });
    // 车门缝
    line(ctx, tx, bTop + h * 0.55, tx, bTop + h, { seed: 699, lw: 3, color: '#060A0C' });
    const r = Math.max(3, w * 0.055);
    for (const dx of [-w * 0.2, w * 0.2]) {
      ctx.beginPath(); ctx.arc(tx + dx, bTop + h * 0.68, r * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,244,210,0.35)'; ctx.fill();
      ctx.beginPath(); ctx.arc(tx + dx, bTop + h * 0.68, r, 0, Math.PI * 2);
      ctx.fillStyle = '#FFF4D2'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = P.ink; ctx.stroke();
    }
    ctx.restore();
    glow(ctx, tx, bTop + h * 0.6, 280 + w * 2.0, 'rgba(255,235,190,0.85)', 0.5 * a);
    // 洞口的反射光落到地面
    ctx.save();
    const spill = ctx.createLinearGradient(0, 760, 0, 1080);
    spill.addColorStop(0, `rgba(255,235,190,${0.16 * a})`);
    spill.addColorStop(1, 'rgba(255,235,190,0)');
    ctx.fillStyle = spill;
    ctx.beginPath();
    ctx.moveTo(1360, 760); ctx.lineTo(1920, 760); ctx.lineTo(1920, 1080); ctx.lineTo(1260, 1080);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    // 墙面被照亮（柔和径向）
    glow(ctx, 1500, 500, 780, 'rgba(255,227,174,0.55)', 0.22 * a);
  }

  // 吊灯管
  for (let i = 0; i < 3; i++) {
    const x = 260 + i * 560;
    line(ctx, x, 0, x, 66, { seed: 700 + i, lw: 3, color: '#20282C', amp: 0.6 });
    const on = 1 - (i === 1 ? flick : 0);
    block(ctx, x - 86, 66, 172, 16, 8, on > 0.4 ? '#E9F0E4' : '#7A827C', { stroke: P.ink, lw: 4, seed: 710 + i });
    if (on > 0.4) glow(ctx, x, 78, 260, 'rgba(226,240,232,0.38)', 0.45 * on);
  }

  return { tunnelX: tx, tunnelY: ty, floorY: 760, bench: { x: bx, y: by } };
}

// ---------------- hook1 招牌墙：一块块点亮 ----------------
// 六块各走各的：起亮时刻不平均（长—短—短—停—短），起亮速度、抖动次数、
// 相位都不同；最后那块（名字的形状）通电时带一点电流抖。
const SIGN_CFG = [
  { onAt: 0.26, rise: 0.26, stut: 1, seed: 3 },
  { onAt: 0.96, rise: 0.34, stut: 1, seed: 8 },
  { onAt: 1.21, rise: 0.46, stut: 3, seed: 5 },   // 这块最犹豫
  { onAt: 2.14, rise: 0.58, stut: 4, seed: 11, hero: true },
  { onAt: 1.60, rise: 0.18, stut: 1, seed: 2 },   // 干脆，一下就亮
  { onAt: 1.86, rise: 0.30, stut: 2, seed: 7 },
];
function signSpark(t, cfg) {
  if (t < cfg.onAt) return 0;
  const since = t - cfg.onAt;
  if (since > cfg.rise + 0.6) return 1;
  let a = 1;
  if (since < cfg.rise) {
    const k = since / cfg.rise;
    a = 0.16 + 0.84 * smooth(k);
    // 镇流器抖动：次数与节奏按块不同
    const f = Math.sin(since * (26 + cfg.seed * 3.1) + cfg.seed * 1.7);
    const gate = -0.35 + (cfg.stut / (cfg.stut + 1)) * 0.45;
    if (f < gate) a *= 0.22;
    else if (f < gate + 0.3) a *= 0.62;
    if (a < 0.1) a = 0.1;   // 不是全黑，是「没吃上电」
  } else {
    // 通电后的一点点电流余抖（最后那块最明显）
    const post = since - cfg.rise;
    const amp = cfg.hero ? 0.17 : 0.04;
    if (post < 0.6) a = 1 - amp * (1 - post / 0.6) * (0.5 + 0.5 * Math.sin(post * 52 + cfg.seed));
  }
  return clamp(a, 0, 1);
}
function barText(ctx, x, y, w, h, seed, color) {
  const R = rng(seed);
  for (let i = 0; i < 3; i++) {
    const bw = w * (0.4 + R() * 0.45);
    block(ctx, x + (w - bw) / 2, y + h * (0.22 + i * 0.24), bw, Math.max(6, h * 0.1), h * 0.05, color, { seed: seed + i });
  }
}
function nameGlyph(ctx, cx, cy, s, color) {
  // 名字的形状：不写真实文字，只用笔画构成一个可辨的「字」骨架
  block(ctx, cx - s * 0.09, cy - s * 0.52, s * 0.18, s * 0.98, s * 0.09, color, { seed: 771 });
  block(ctx, cx - s * 0.46, cy - s * 0.16, s * 0.92, s * 0.15, s * 0.07, color, { seed: 772 });
  block(ctx, cx - s * 0.34, cy + s * 0.34, s * 0.68, s * 0.13, s * 0.06, color, { seed: 773 });
  block(ctx, cx + s * 0.22, cy - s * 0.66, s * 0.34, s * 0.34, s * 0.05, color, { seed: 774 });
  block(ctx, cx + s * 0.31, cy - s * 0.57, s * 0.16, s * 0.16, s * 0.03, '#C9605A', { seed: 775 });
}

export function signWall(ctx, o = {}) {
  const t = o.t ?? 0;
  const zoomY = o.zoomY ?? 0;   // 仅影响返回，镜头负责缩放

  // 夜空 / 远景楼群
  nightSky(ctx, { y: 0, h: 520 });
  stars(ctx, { n: 14, h: 210, seed: 21 });
  cityLine(ctx, { y: 470, seed: 63, minH: 80, maxH: 200, color: '#12242F' });

  // 立面
  ctx.fillStyle = '#24343D'; ctx.fillRect(0, 120, 1920, 600);
  for (let i = 0; i < 7; i++) line(ctx, 0, 190 + i * 86, 1920, 190 + i * 86, { seed: 730 + i, lw: 2, color: '#1E2C34', amp: 1, parts: 6 });
  block(ctx, 0, 120, 1920, 22, 0, '#2F4048', { stroke: P.ink, lw: 4, seed: 726 });

  // 底层店面：暗玻璃 + 一扇亮着的门
  for (let i = 0; i < 5; i++) {
    const x = 40 + i * 380;
    block(ctx, x, 498, 320, 202, 6, '#16232A', { stroke: P.ink, lw: 5, seed: 900 + i });
    ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#8FB0B8';
    ctx.fillRect(x + 20, 520, 120, 160); ctx.restore();
    if (i === 1 || i === 3) {
      block(ctx, x + 212, 522, 92, 178, 5, '#1A2226', { stroke: P.ink, lw: 5, seed: 909 + i });
      block(ctx, x + 222, 530, 72, 170, 3, '#D8AA64', { stroke: P.ink, lw: 4, seed: 910 + i });
      block(ctx, x + 222, 530, 72, 54, 3, 'rgba(255,240,210,0.30)', { seed: 911 + i });
      glow(ctx, x + 258, 620, 200, 'rgba(246,201,126,0.32)', 0.38);
      // 灯光洒到人行道
      const pool = ctx.createLinearGradient(0, 700, 0, 810);
      pool.addColorStop(0, 'rgba(246,201,126,0.22)');
      pool.addColorStop(1, 'rgba(246,201,126,0)');
      ctx.save();
      ctx.fillStyle = pool;
      ctx.beginPath();
      ctx.moveTo(x + 210, 700); ctx.lineTo(x + 306, 700); ctx.lineTo(x + 360, 810); ctx.lineTo(x + 156, 810);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    block(ctx, x - 10, 486, 340, 16, 4, '#2E3F48', { stroke: P.ink, lw: 4, seed: 920 + i });
  }

  // 人行道 → 路缘 → 路面
  block(ctx, 0, 700, 1920, 380, 0, '#6E5652');
  block(ctx, 0, 700, 1920, 20, 0, '#8A6C66', { stroke: P.ink, lw: 4, seed: 727 });
  for (let i = 0; i < 9; i++) line(ctx, i * 230 + 40, 720, i * 230 - 40, 872, { seed: 800 + i, lw: 1.6, color: '#5E4744', amp: 1 });
  block(ctx, 0, 872, 1920, 16, 0, '#8E7168', { stroke: P.ink, lw: 4, seed: 729 });
  block(ctx, 0, 888, 1920, 192, 0, '#333B42', { seed: 728 });
  ctx.save(); ctx.globalAlpha = 0.14; ctx.fillStyle = '#9FC3CE';
  ctx.fillRect(0, 900, 1920, 40); ctx.restore();

  const signs = [
    { x: 80,  y: 168, w: 260, h: 140, face: '#E8D5B0', ink: '#2F4A54' },
    { x: 392, y: 336, w: 220, h: 112, face: '#4E8FA3', ink: '#F2E3C6' },
    { x: 662, y: 150, w: 240, h: 150, face: '#C98A6E', ink: '#F7EFDD' },
    { x: 946, y: 206, w: 356, h: 330, face: '#2F4A54', ink: '#F1D9A8', hero: true },
    { x: 1370, y: 352, w: 232, h: 122, face: '#B9A6D9', ink: '#262D3A' },
    { x: 1650, y: 176, w: 220, h: 148, face: '#93AE7C', ink: '#20302A' },
  ];

  signs.forEach((sg, i) => {
    const on = signSpark(t, SIGN_CFG[i]);
    // 支架
    block(ctx, sg.x + sg.w * 0.5 - 8, sg.y + sg.h, 16, 24, 3, '#1B2A32', { seed: 740 + i });
    // 底板
    block(ctx, sg.x - 10, sg.y - 10, sg.w + 20, sg.h + 20, 10, '#1A262D', { stroke: P.ink, lw: 6, seed: 750 + i });
    // 面
    block(ctx, sg.x, sg.y, sg.w, sg.h, 8, on > 0.02 ? sg.face : '#39434A', { stroke: P.ink, lw: 5, seed: 760 + i });
    if (on > 0.02) {
      // 亮面：叠一点暖白，低饱和；亮度跟着镇流器的抖
      ctx.save();
      ctx.globalAlpha = 0.16 * on;
      ctx.fillStyle = '#FFF6DE';
      ctx.fillRect(sg.x, sg.y, sg.w, sg.h);
      ctx.restore();
      if (sg.hero) nameGlyph(ctx, sg.x + sg.w / 2, sg.y + sg.h / 2, sg.h * 0.62, on > 0.5 ? sg.ink : '#6E6A5E');
      else barText(ctx, sg.x + sg.w * 0.1, sg.y + sg.h * 0.18, sg.w * 0.8, sg.h * 0.64, 800 + i, on > 0.5 ? sg.ink : '#6E6A5E');
      if (on > 0.5) glow(ctx, sg.x + sg.w / 2, sg.y + sg.h / 2, sg.hero ? 520 : 300, sg.hero ? 'rgba(246,201,126,0.42)' : 'rgba(246,201,126,0.22)', (sg.hero ? 0.55 : 0.4) * on);
    }
  });

  return { signs, hero: signs[3], heroOn: signSpark(t, SIGN_CFG[3]), zoomY };
}

// ---------------- i-05 / h2 车窗外掠过的夜城 ----------------
export function nightStreaks(ctx, x, y, w, h, t, o = {}) {
  const speed = o.speed ?? 520;
  const seed = o.seed ?? 51;
  const SPAN = 2600;
  const R = rng(seed);
  const win = (wx, sp) => ((wx - t * speed * sp) % SPAN + SPAN) % SPAN - 340;

  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = '#0D1922'; ctx.fillRect(x, y, w, h);

  // 远楼
  for (let i = 0; i < 16; i++) {
    const wx = R() * SPAN, bw = 70 + R() * 110, bh = 90 + R() * 190;
    const bx = win(wx, 0.5);
    if (bx > x + w) continue;
    ctx.fillStyle = i % 2 ? '#13242E' : '#172A35';
    ctx.fillRect(bx, y + h - bh - 30, bw, bh + 30);
    for (let k = 0; k < 5; k++) if (R() < 0.5) {
      ctx.fillStyle = 'rgba(227,179,106,0.7)';
      ctx.fillRect(bx + 10 + (k % 2) * 24, y + h - bh - 10 + Math.floor(k / 2) * 26, 8, 11);
    }
  }
  // 近处灯条：横向拖影
  for (let i = 0; i < 26; i++) {
    const wx = R() * SPAN, yy = y + 40 + R() * (h - 80);
    const len = 40 + R() * 120, col = R() < 0.6 ? '#E3B36A' : '#9FC3CE';
    const bx = win(wx, 1.35);
    ctx.globalAlpha = 0.45 + R() * 0.4;
    ctx.fillStyle = col;
    ctx.fillRect(bx, yy, len, 5 + R() * 4);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ---------------- h2 站名灯箱 ----------------
export function stationBox(ctx, x, y, w, h, seed, k = 1) {
  const R = rng(seed);
  block(ctx, x - 10, y - 10, w + 20, h + 20, 8, '#16232B', { stroke: P.ink, lw: 5, seed: seed + 1 });
  block(ctx, x, y, w, h, 6, k > 0.02 ? '#E7EFE7' : '#7E8A86', { stroke: P.ink, lw: 4, seed: seed + 2 });
  if (k > 0.02) {
    ctx.save();
    ctx.globalAlpha = 0.85 * k;
    // 站名：抽象笔画，宽度不一
    let xx = x + w * 0.12;
    for (let i = 0; i < 3; i++) {
      const bw = w * (0.14 + R() * 0.1);
      block(ctx, xx, y + h * 0.3, bw, h * 0.4, 4, '#2F4A54', { seed: seed + 10 + i });
      block(ctx, xx + bw * 0.2, y + h * 0.42, bw * 0.6, h * 0.06, 2, '#E7EFE7', { seed: seed + 20 + i });
      xx += bw + w * 0.06;
    }
    ctx.restore();
    glow(ctx, x + w / 2, y + h / 2, Math.max(w, h) * 0.9, 'rgba(226,240,220,0.4)', 0.5 * k);
  }
  return { x, y, w, h };
}
