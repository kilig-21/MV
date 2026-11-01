// 构建 CLI：单镜 stills / 单镜 mp4 / 片段 / contact sheet / 合片
// 用法：
//   node film/build.mjs samples
//   node film/build.mjs stills --shot v1-12 --times 0,0.8,1.6,2.4
//   node film/build.mjs shot v1-12
//   node film/build.mjs cut --from 20.97 --to 59.44 --name animatic-verse1
//   node film/build.mjs film
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');                 // ALLCODE/Anima
const LIB = process.env.LEMO_OPUSCAR_HOME || 'C:/Users/Lenovo/lemo-opuscar';
const FF = path.join(ROOT, '.tools/ffmpeg/bin');
const ENV = {
  ...process.env,
  PATH: FF + path.delimiter + process.env.PATH,
  PLAYWRIGHT_CHROME: process.env.PLAYWRIGHT_CHROME ||
    'C:/Users/Lenovo/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe',
};
const PY = path.join(LIB, process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python');

function run(cmd, args, { capture = false, allowFail = false } = {}) {
  const r = spawnSync(cmd, args, { cwd: LIB, env: ENV, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit', maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw r.error;
  if (r.status !== 0 && !allowFail) {
    console.error(`\nFAILED: ${path.basename(cmd)} ${args.slice(0, 6).join(' ')}\n${(r.stderr || '').slice(-2000)}`);
    process.exit(1);
  }
  return r;
}
const core = (name, ...args) => run(process.execPath, [path.join(LIB, 'core/render', name + '.mjs'), HERE, ...args]);
const ff = (args, opt) => run('ffmpeg', args, opt);
const probe = file => JSON.parse(run('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], { capture: true }).stdout);

const argv = process.argv.slice(2);
const cmd = argv[0];
const opt = (k, d = null) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const has = k => argv.includes(k);
const outDir = path.join(HERE, 'out');
fs.mkdirSync(outDir, { recursive: true });

// 镜头清单 = shots.json（基线）+ data/shots-extra/*.json（各段并行开发时的增量片段）。
// 同 id 时片段覆盖基线，这样不同段落可以各写各的文件，不必抢同一个 shots.json。
function loadShots() {
  const base = JSON.parse(fs.readFileSync(path.join(HERE, 'shots.json'), 'utf8'));
  const dir = path.join(HERE, 'data/shots-extra');
  const merged = new Map(base.shots.map(s => [s.id, s]));
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
      const frag = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      for (const s of frag.shots || frag) merged.set(s.id, s);
    }
  }
  return { ...base, shots: [...merged.values()].sort((a, b) => a.t0 - b.t0) };
}
const data = loadShots();
const shots = data.shots;
const byId = id => shots.find(s => s.id === id);
const source = path.resolve(ROOT, 'mv-wo-xiang-part2/assets/source-audio.flac');

// 同步给页面用的数据：时间轴副本 + 已存在的镜头模块清单
// （页面挂在 /@film/ 下，读不到上一级目录；只能在构建时拷进去）
function syncData() {
  const dataDir = path.join(HERE, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.copyFileSync(path.resolve(HERE, '../timeline/timeline.json'), path.join(dataDir, 'timeline.json'));
  fs.writeFileSync(path.join(dataDir, 'shots-all.json'), JSON.stringify({ version: data.version || '1', shots }));
  const ready = shots.filter(s => s.module && fs.existsSync(path.join(HERE, s.module))).map(s => s.id);
  fs.writeFileSync(path.join(dataDir, 'modules.json'), JSON.stringify(ready));
}
syncData();

function mux(video, name, t0, dur) {
  const out = path.join(outDir, name + '.mp4');
  ff(['-y', '-hide_banner', '-loglevel', 'warning',
    '-i', video,
    '-ss', String(t0), '-i', source,
    '-map', '0:v:0', '-map', '1:a:0',
    '-vf', 'scale=in_range=full:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p',
    '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-c:a', 'aac', '-b:a', '256k', '-ar', '48000',
    '-t', String(dur), '-movflags', '+faststart', out]);
  fs.writeFileSync(path.join(outDir, name + '.probe.json'), JSON.stringify(probe(out), null, 1));
  console.log('muxed:', out);
  return out;
}

function sheet(name, files, cols = 3, w = 640) {
  if (!files.length) return;
  run(PY, [path.join(LIB, 'core/render/sheet.py'), path.join(outDir, name), ...files, '--cols', String(cols), '--w', String(w)]);
  console.log('sheet:', path.join(outDir, name));
}

if (cmd === 'parity') {
  const dir = path.join(outDir, 'sample-09');
  fs.mkdirSync(dir, { recursive: true });
  core('still', '0', '--q', 'sample=9', '--out', dir, '--prefix', 's');
  run(PY, [path.join(HERE, 'tools/parity.py'), path.join(dir, 's0.jpg')]);
  process.exit(0);
}

if (cmd === 'samples') {
  const ids = [1, 2, 3, 5];
  const files = [];
  for (const id of ids) {
    const dir = path.join(outDir, `sample-${String(id).padStart(2, '0')}`);
    fs.mkdirSync(dir, { recursive: true });
    core('still', '0', '--q', `sample=${id}`, '--out', dir, '--prefix', 's');
    files.push(path.join(dir, 's0.jpg'));
  }
  for (const kw of [4, 10]) {
    const dir4 = path.join(outDir, `sample-${String(kw).padStart(2, '0')}`);
    fs.mkdirSync(dir4, { recursive: true });
    core('still', '0', '--q', `sample=${kw}`, '--out', dir4, '--prefix', 's');
    files.push(path.join(dir4, 's0.jpg'));
  }
  sheet('contact-samples.jpg', files, 2, 960);

} else if (cmd === 'stills') {
  const id = opt('--shot');
  const s = byId(id);
  if (!s) throw new Error('unknown shot ' + id);
  const times = (opt('--times') || '0').split(',');
  const dir = path.join(outDir, 'stills-' + id);
  fs.mkdirSync(dir, { recursive: true });
  core('still', ...times, '--q', `shot=${id}`, '--out', dir, '--prefix', `t_`);
  sheet(`contact-${id}.jpg`, times.map(t => path.join(dir, `t_${t}.jpg`)), 3, 640);

} else if (cmd === 'parity-shot') {
  const id = argv[1];
  const s = byId(id);
  if (!s || !s.char) throw new Error('shot or char meta missing: ' + id);
  const dir = path.join(outDir, 'parity-stills');
  fs.mkdirSync(dir, { recursive: true });
  const at = String(s.char.parityAt);
  core('still', at, '--q', `shot=${id}`, '--out', dir, '--prefix', id + '_');
  run(PY, [path.join(HERE, 'tools/shot_parity.py'), path.join(dir, `${id}_${at}.jpg`),
    path.join(outDir, `parity-${id}.png`), id,
    String(s.char.cx), String(s.char.by), String(s.char.u), at]);

} else if (cmd === 'shot') {
  const id = argv[1];
  const s = byId(id);
  if (!s) throw new Error('unknown shot ' + id);
  const raw = path.join(outDir, `raw-${id}.mp4`);
  core('video', '--fps', '24', '--workers', '3', '--q', `shot=${id}`, '--out', raw);
  mux(raw, `shot-${id}`, s.t0, s.t1 - s.t0);
  fs.unlinkSync(raw);

} else if (cmd === 'cut') {
  const from = +opt('--from', 0), to = +opt('--to', 281.551771);
  const name = opt('--name', `cut-${from}-${to}`);
  const raw = path.join(outDir, `raw-${name}.mp4`);
  core('video', '--fps', '24', '--workers', '3', '--q', `from=${from}&to=${to}`, '--out', raw);
  mux(raw, name, from, to - from);
  fs.unlinkSync(raw);

} else if (cmd === 'film') {
  const raw = path.join(outDir, 'raw-film.mp4');
  core('video', '--fps', '24', '--workers', '3', '--out', raw);
  mux(raw, 'wo-xiang-part2', 0, 281.551771);
  fs.unlinkSync(raw);

} else if (cmd === 'still-range') {
  const from = +opt('--from', 0), to = +opt('--to', 1), step = +opt('--step', 1);
  const name = opt('--name', 'range');
  const dir = path.join(outDir, 'stills-' + name);
  fs.mkdirSync(dir, { recursive: true });
  core('still', '--range', `${from}:${to}:${step}`, '--q', `from=${from}&to=${to}&abs=1`, '--out', dir, '--prefix', 't_');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg')).sort().map(f => path.join(dir, f));
  sheet(`contact-${name}.jpg`, files, 3, 480);

} else {
  console.log('usage: node build.mjs samples | stills --shot ID --times a,b,c | shot ID | cut --from A --to B --name N | film | still-range');
  process.exit(2);
}