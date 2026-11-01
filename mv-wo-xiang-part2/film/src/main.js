// 入口：按 query 选择「整段 / 单镜 / 样张 / 表情表」，暴露 window.READY / DUR / render
import { paper, bg } from './ink.js';
import { P } from './palette.js';
import { drawSubs } from './subtitles.js';
import { clawd } from './character.js';
import { expressionSheet, paletteSheet, paritySheet } from './sheets.js';
import { transitionFor } from './transitions.js';

const W = 1920, H = 1080;
const canvas = document.getElementById('film');
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext('2d');
ctx.textBaseline = 'middle';

const q = new URLSearchParams(location.search);
const data = await fetch('./data/shots-all.json').then(r => r.json());
const tl = await fetch('./data/timeline.json').then(r => r.json());
const lines = tl.lines;

const shots = data.shots;
const ready = await fetch('./data/modules.json').then(r => r.json()).catch(() => null);
for (const s of shots) {
  if (!s.module) continue;
  if (ready && !ready.includes(s.id)) { s.draw = null; continue; }   // 还没做的镜头：不请求，避免 404
  // 并行开发时某个镜头模块可能正在半成品状态；单个失败不该拖垮整页渲染
  try {
    const m = await import(new URL(s.module, document.baseURI).href + '?v=' + (data.version || '1'));
    s.draw = typeof m.default === 'function' ? m.default : m.default.draw;
  } catch (e) {
    console.warn('[shot failed]', s.id, e && e.message);
    s.draw = null;
  }
}

const byId = id => shots.find(s => s.id === id);

// 样张 = 正式镜头的一帧，避免另做一套画风
const SAMPLES = {
  1: { shot: 'v1-12', at: 42.7 },
  2: { shot: 'v1-01', at: 21.55 },
  3: { shot: 'v1-09', at: 36.22 },
  4: { sheet: 'expressions' },
  5: { shot: 'v1-18', at: 57.85 },
  6: { shot: 'v1-02', at: 22.6 },
  7: { shot: 'v1-15', at: 50.2 },
  8: { shot: 'v1-17', at: 55.4 },
  9: { sheet: 'parity' },
  10: { sheet: 'palette' },
};

let range = { t0: 0, t1: tl.duration };
let locked = null;
let sheet = null;

if (q.has('shot')) {
  const s = byId(q.get('shot'));
  if (!s) throw new Error('unknown shot ' + q.get('shot'));
  locked = s;
  range = { t0: s.t0, t1: s.t1 };
} else if (q.has('from')) {
  range = { t0: +q.get('from'), t1: +(q.get('to') || tl.duration) };
} else if (q.has('sample')) {
  const s = SAMPLES[+q.get('sample')];
  if (s.sheet) { sheet = s.sheet; range = { t0: 0, t1: 1 }; }
  else { locked = byId(s.shot); range = { t0: s.at, t1: s.at + 1 }; }
}

const fontSample = '我想呼风唤雨用奇妙旋律一日千里踩疯狂节奏遨游四海让音乐做舟睡在梦里醒在梦境他们说他变了歌词不再免费了';
await document.fonts.load(`500 46px NotoSansSC`, fontSample);
await document.fonts.load(`400 30px NotoSansSC`, fontSample);

const ABS = q.get('abs') === '1';

// 转场用离屏画布：把前后两镜各画一张，再按进度叠在一起
const offA = document.createElement('canvas'); offA.width = W; offA.height = H;
const offB = document.createElement('canvas'); offB.width = W; offB.height = H;
const actxA = offA.getContext('2d'), actxB = offB.getContext('2d');

// 每个镜头轻微放大 0.4% + 缓慢位移，模拟"镜头也在呼吸"。
// 放大留出的边距大于最大位移，所以不会露出画面外的空白。
const CAM = { zoom: 1.004, x: 2.2, y: 1.8 };
function camSeed(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return h / 997 * Math.PI * 2;
}
function drawShot(c, shot, gt) {
  const s = camSeed(shot.id || '');
  const ph = gt * 0.55 + s;
  const dx = Math.sin(ph) * CAM.x + Math.sin(ph * 0.37 + 1.7) * CAM.x * 0.5;
  const dy = Math.cos(ph * 0.83 + 0.6) * CAM.y;
  c.save();
  c.translate(W / 2, H / 2);
  c.scale(CAM.zoom, CAM.zoom);
  c.translate(-W / 2 + dx, -H / 2 + dy);
  shot.draw(c, gt, shot);
  c.restore();
}

function drawInto(c, shot, gt) {
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = 1;
  c.globalCompositeOperation = 'source-over';
  c.clearRect(0, 0, W, H);
  c.textBaseline = 'middle';
  drawShot(c, shot, gt);
}

function render(tLocal) {
  const gt = ABS ? tLocal : range.t0 + tLocal;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = P.night;
  ctx.fillRect(0, 0, W, H);

  if (sheet) {
    if (sheet === 'parity') paritySheet(ctx, gt);
    else if (sheet === 'palette') paletteSheet(ctx, gt);
    else expressionSheet(ctx, gt);
  } else {
    const idx = locked ? -1 : shots.findIndex(s => gt >= s.t0 && gt < s.t1);
    const shot = locked || (idx >= 0 ? shots[idx] : null);
    // 进入该镜的头 d 秒内，如果上一镜还画得出来，就叠化过去
    // （transition 字段描述的是上一镜"往下一镜怎么走"，所以取 shots[idx - 1]）
    const tr = (!locked && idx > 0) ? transitionFor(shots[idx - 1]) : null;
    const prev = tr && idx > 0 ? shots[idx - 1] : null;
    const p = tr ? Math.min(1, Math.max(0, (gt - shot.t0) / tr.d)) : 1;
    if (tr && prev && prev.draw && p < 1) {
      drawInto(actxA, prev, gt);
      drawInto(actxB, shot, gt);
      ctx.globalAlpha = 1;
      ctx.drawImage(offA, 0, 0);
      ctx.globalAlpha = p;
      ctx.drawImage(offB, 0, 0);
      ctx.globalAlpha = 1;
    } else if (shot && shot.draw) {
      // 单镜渲染（shot=）不加镜头漂移：角色对照要逐像素可比
      if (locked) shot.draw(ctx, gt, shot);
      else drawShot(ctx, shot, gt);
    } else fallback(gt);
  }
  if (!sheet) drawSubs(ctx, lines, gt);
  paper(ctx);
}

function fallback(gt) {
  bg(ctx, P.night);
  ctx.fillStyle = P.wallMid;
  ctx.font = '500 36px NotoSansSC';
  ctx.textAlign = 'center';
  ctx.fillText(String(gt.toFixed(2)) + 's 未分配镜头', 960, 540);
}

window.DUR = range.t1 - range.t0;
window.render = render;
window.SHOTS = shots;
window.READY = true;
render(0);