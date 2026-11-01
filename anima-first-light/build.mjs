import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const HERE=path.dirname(fileURLToPath(import.meta.url));
const LIB=process.env.LEMO_OPUSCAR_HOME||'C:/Users/Lenovo/lemo-opuscar';
const ffbin=path.resolve(HERE,'../.tools/ffmpeg/bin');
const browser=process.env.PLAYWRIGHT_CHROME||'C:/Users/Lenovo/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe';
const env={...process.env,PATH:ffbin+path.delimiter+process.env.PATH,PLAYWRIGHT_CHROME:browser,LEMO_OPUSCAR_HOME:LIB};
const py=process.platform==='win32'?path.join(LIB,'.venv/Scripts/python.exe'):path.join(LIB,'.venv/bin/python');
function run(cmd,args,capture=false){const r=spawnSync(cmd,args,{cwd:LIB,env,encoding:'utf8',stdio:capture?'pipe':'inherit',maxBuffer:16*1024*1024});if(r.error)throw r.error;if(r.status!==0)throw Error(`${cmd} failed (${r.status})\n${r.stderr||''}`);return r;}
const core=(name,...args)=>run(process.execPath,[path.join(LIB,'core/render',name+'.mjs'),HERE,...args]);
fs.mkdirSync(path.join(HERE,'out'),{recursive:true});
const times=['0.5','1.5','2.5','4.0','5.5','6.5','7.5','8.5','9.5','10.5','11.5','14.5'];
if(!process.argv.includes('--master')){
core('events');
core('still',...times);
core('readcheck');
const images=times.map(t=>path.join(HERE,'stills',`t_${t}.jpg`));
run(py,[path.join(LIB,'core/render/sheet.py'),path.join(HERE,'contact-sheet.jpg'),...images,'--cols','3','--w','640']);
fs.copyFileSync(path.join(HERE,'stills/t_11.5.jpg'),path.join(HERE,'poster.jpg'));
if(process.argv.includes('--stills'))process.exit(0);
run(py,[path.join(HERE,'mix.py')]);
core('video','--fps','24','--workers','3');
}
const video=path.join(HERE,'out/video.mp4'),audio=path.join(HERE,'out/mix.wav'),out=path.join(HERE,'anima-first-light.mp4');
// Windows-native equivalent of the repository's two-pass mux.sh; zero film grain.
const stats=run('ffmpeg',['-hide_banner','-nostats','-i',audio,'-af','loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json','-f','null','-'],true).stderr;
const match=stats.match(/\{\s*"input_i"[\s\S]*?\}/);if(!match)throw Error('Missing loudness measurement');
const m=JSON.parse(match[0]);
const af=`loudnorm=I=-14:TP=-1.2:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true:print_format=json`;
run('ffmpeg',['-y','-hide_banner','-loglevel','info','-i',video,'-i',audio,'-map','0:v:0','-map','1:a:0','-vf','scale=in_range=full:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709','-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-af',af,'-c:a','aac','-b:a','192k','-ar','48000','-t','15','-movflags','+faststart',out]);
const probe=run('ffprobe',['-v','error','-show_format','-show_streams','-of','json',out],true).stdout;
fs.writeFileSync(path.join(HERE,'out/probe.json'),probe);
console.log('Completed:',out);
