import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
const HERE=path.dirname(fileURLToPath(import.meta.url)),LIB=process.env.LEMO_OPUSCAR_HOME||'C:/Users/Lenovo/lemo-opuscar';
const timeline=JSON.parse(fs.readFileSync(path.join(HERE,'timeline.json'),'utf8'));
const env={...process.env,PATH:path.resolve(HERE,'../../.tools/ffmpeg/bin')+path.delimiter+process.env.PATH,PLAYWRIGHT_CHROME:process.env.PLAYWRIGHT_CHROME||'C:/Users/Lenovo/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'};
const py=path.join(LIB,process.platform==='win32'?'.venv/Scripts/python.exe':'.venv/bin/python');
function run(cmd,args,capture=false){const r=spawnSync(cmd,args,{cwd:LIB,env,encoding:'utf8',stdio:capture?'pipe':'inherit',maxBuffer:32*1024*1024});if(r.error)throw r.error;if(r.status!==0)throw Error(`${cmd}: ${r.status}\n${r.stderr||''}`);return r;}
const core=(name,...args)=>run(process.execPath,[path.join(LIB,'core/render',name+'.mjs'),HERE,...args]);
fs.mkdirSync(path.join(HERE,'out'),{recursive:true});
const times=['0','1','2','3','4','5','6','7','8','9','10'];
core('still',...times);
run(py,[path.join(LIB,'core/render/sheet.py'),path.join(HERE,'contact-sheet.jpg'),...times.map(t=>path.join(HERE,'stills',`t_${t}.jpg`)),'--cols','3','--w','640']);
if(process.argv.includes('--stills'))process.exit(0);
core('video','--fps','24','--workers','3');
const source=path.resolve(HERE,timeline.source_file),video=path.join(HERE,'out/video.mp4'),out=path.join(HERE,'wo-xiang-chorus-preview.mp4');
run('ffmpeg',['-y','-hide_banner','-loglevel','warning','-i',video,'-ss',String(timeline.source_start),'-i',source,'-map','0:v:0','-map','1:a:0','-vf','scale=in_range=full:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709','-c:v','libx264','-preset','medium','-crf','13','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','aac','-b:a','256k','-ar','48000','-t',String(timeline.duration),'-movflags','+faststart',out]);
fs.writeFileSync(path.join(HERE,'out/probe.json'),run('ffprobe',['-v','error','-show_streams','-show_format','-of','json',out],true).stdout);
fs.writeFileSync(path.join(HERE,'captions.json'),JSON.stringify(timeline.captions));run(py,[path.join(LIB,'core/render/srt.py'),path.join(HERE,'captions.json'),path.join(HERE,'wo-xiang-chorus-preview.srt')]);
run('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss','6','-i',out,'-frames:v','1',path.join(HERE,'poster.png')]);
console.log('Completed:',out);
