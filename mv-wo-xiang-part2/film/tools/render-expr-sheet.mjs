// 渲染表情过渡样张：film/expr-sheet/index.html → film/out/contact-expr-blend.jpg
// 逐帧实测条：film/expr-sheet/frames.html → film/out/expr-frames-shock.jpg
// 不影响主构建流程；需要时手动跑：
//   node mv-wo-xiang-part2/film/tools/render-expr-sheet.mjs [--frames]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILM = path.resolve(HERE, '..');
const LIB = process.env.LEMO_OPUSCAR_HOME || 'C:/Users/Lenovo/lemo-opuscar';
const EXE = process.env.PLAYWRIGHT_CHROME ||
  'C:/Users/Lenovo/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe';
const require = createRequire(path.join(LIB, 'package.json'));
const { chromium } = require('playwright-core');

const T = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ttf': 'font/ttf',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
};

const server = http.createServer((req, res) => {
  try {
    const url = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
    const file = path.resolve(FILM, '.' + path.sep + url.replace(/^\/+/, ''));
    if (file !== FILM && !file.startsWith(FILM + path.sep)) { res.writeHead(403); return res.end('outside'); }
    fs.readFile(file, (e, data) => {
      if (e) { res.writeHead(404); return res.end('not found'); }
      res.writeHead(200, { 'Content-Type': T[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      res.end(data);
    });
  } catch { res.writeHead(400); res.end('bad request'); }
});

await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const browser = await chromium.launch({
  executablePath: EXE,
  args: ['--enable-gpu', '--ignore-gpu-blocklist', '--font-render-hinting=none', '--force-color-profile=srgb'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('[pageerror]', e.message); process.exitCode = 1; });
  const frames = process.argv.includes('--frames');
  const pagePath = frames ? '/expr-sheet/frames.html' : '/expr-sheet/index.html';
  await page.goto(`http://127.0.0.1:${port}${pagePath}`);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  const { w, h } = await page.evaluate(() => window.SHEET_SIZE);
  await page.setViewportSize({ width: w, height: h });
  const out = path.join(FILM, frames ? 'out/expr-frames-shock.jpg' : 'out/contact-expr-blend.jpg');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.screenshot({ path: out, type: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: w, height: h } });
  console.log('sheet:', out, `${w}x${h}`);
} finally {
  await browser.close();
  server.close();
}