// 检查窗灯节拍：复刻 polish-intro-outro.cityWindowsIO 的 RNG 生成顺序，
// 打印起亮阈值 th 与熄灭阈值 offAt 的分布，确认「不是等距」。
// 用法：node film/tools/window-rhythm.mjs
import { rng, hash } from '../src/ink.js';

const seed = 71;
const R = rng(seed);
let wx = -160, i = 0, k = 0;
const ths = [];
while (wx < 2500) {
  const w = 130 + R() * 150;
  const h = 150 + R() * 320;
  if (R() < 0.5) { /* 水箱 */ }
  if (R() < 0.4) { /* 天线 */ }
  const cols = Math.max(1, Math.floor((w - 30) / 54));
  const rows = Math.max(1, Math.floor((h - 52) / 62));
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    const a0 = R(), b0 = R(), c0 = R(), d0 = R(), e0 = R();
    let th;
    if (a0 < 0.21) th = 0.02 + b0 * 0.12;
    else if (a0 < 0.47) th = 0.23 + b0 * 0.27;
    else if (a0 < 0.76) th = 0.57 + b0 * 0.25;
    else th = 0.85 + b0 * 0.14;
    ths.push({ th, blip: e0 < 0.13 });
    k++;
  }
  wx += w + 16 + R() * 26;
  i++;
}
const offs = ths.map((_, j) => {
  const r0 = hash(seed * 3 + 11, j), r1 = hash(seed * 5 + 19, j);
  if (r0 < 0.20) return 0.02 + r1 * 0.07;
  if (r0 < 0.46) return 0.19 + r1 * 0.26;
  if (r0 < 0.71) return 0.53 + r1 * 0.20;
  return 0.76 + r1 * 0.17;
});
const gaps = arr => {
  const a = [...arr].sort((x, y) => x - y);
  return a.slice(1).map((v, n) => v - a[n]);
};
const stats = a => {
  const m = a.reduce((s, v) => s + v, 0) / a.length;
  const sd = Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length);
  return { mean: m, sd, min: Math.min(...a), max: Math.max(...a) };
};
const on = stats(ths.map(x => x.th));
const off = stats(offs);
const onGaps = gaps(ths.map(x => x.th));
const offGaps = gaps(offs);
console.log('windows', ths.length, 'blip', ths.filter(x => x.blip).length);
console.log('起亮阈值 th  mean', on.mean.toFixed(3), 'sd', on.sd.toFixed(3), 'min', on.min.toFixed(3), 'max', on.max.toFixed(3));
console.log('相邻起亮间隔(阈值差) mean', stats(onGaps).mean.toFixed(4), 'sd', stats(onGaps).sd.toFixed(4));
console.log('熄灭阈值 offAt mean', off.mean.toFixed(3), 'sd', off.sd.toFixed(3), 'min', off.min.toFixed(3), 'max', off.max.toFixed(3));
console.log('相邻熄灭间隔(阈值差) mean', stats(offGaps).mean.toFixed(4), 'sd', stats(offGaps).sd.toFixed(4), 'min', stats(offGaps).min.toFixed(4), 'max', stats(offGaps).max.toFixed(4));
// 直方图：每 0.1 的阈值桶里各有多少窗（等距铺开的话每桶近似相等）
const hist = xs => {
  const b = Array(10).fill(0);
  for (const v of xs) b[Math.min(9, Math.floor(v * 10))]++;
  return b.join(' ');
};
console.log('起亮直方图(0.1 桶)', hist(ths.map(x => x.th)));
console.log('熄灭直方图(0.1 桶)', hist(offs));