import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
const HERE=path.dirname(fileURLToPath(import.meta.url)),LIB=process.env.LEMO_OPUSCAR_HOME||'C:/Users/Lenovo/lemo-opuscar';
const timeline=JSON.parse(fs.readFileSync(path.join(HERE,'timeline.json'),'utf8'));
const env={...process.env,PATH:path.resolve(HERE,'../.tools/ffmpeg/bin')+path.delimiter+process.env.PATH,LEMO_OPUSCAR_HOME:LIB,PLAYWRIGHT_CHROME:process.env.PLAYWRIGHT_CHROME||'C:/Users/Lenovo/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'};
const py=path.join(LIB,process.platform==='win32'?'.venv/Scripts/python.exe':'.venv/bin/python');
function run(cmd,args,capture=false){const r=spawnSync(cmd,args,{cwd:LIB,env,encoding:'utf8',stdio:capture?'pipe':'inherit',maxBuffer:32*1024*1024});if(r.error)throw r.error;if(r.status!==0)throw Error(`${cmd}: ${r.status}\n${r.stderr||''}`);return r;}
const core=(name,...args)=>run(process.execPath,[path.join(LIB,'core/render',name+'.mjs'),HERE,...args]);
fs.mkdirSync(path.join(HERE,'out'),{recursive:true});
if(!process.argv.includes('--master')){
 core('events');
 const times=['0.5','1.5','2.8','4.5','6.5','7.8','8.6','9.5','10.8','12.5','14.5','16.5','18.5','20.5','21.5'];
 core('still',...times);
 core('readcheck');
 run(py,[path.join(LIB,'core/render/sheet.py'),path.join(HERE,'contact-sheet.jpg'),...times.map(t=>path.join(HERE,'stills',`t_${t}.jpg`)),'--cols','3','--w','640']);
 fs.copyFileSync(path.join(HERE,'stills/t_16.5.jpg'),path.join(HERE,'poster.jpg'));
 if(process.argv.includes('--stills'))process.exit(0);
 run(py,[path.join(HERE,'mix.py')]);
 core('video','--fps','24','--workers','3');
}
const video=path.join(HERE,'out/video.mp4'),audio=path.join(HERE,'out/mix.wav'),out=path.join(HERE,'clawd-worlds.mp4');
const stats=run('ffmpeg',['-hide_banner','-nostats','-i',audio,'-af','loudnorm=I=-14:TP=-1.8:LRA=11:print_format=json','-f','null','-'],true).stderr;
const found=stats.match(/\{\s*"input_i"[\s\S]*?\}/);if(!found)throw Error('No loudness measurement');const m=JSON.parse(found[0]);
const af=`loudnorm=I=-14:TP=-1.8:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true:print_format=json`;
run('ffmpeg',['-y','-hide_banner','-loglevel','info','-i',video,'-i',audio,'-map','0:v:0','-map','1:a:0','-vf','scale=in_range=full:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709','-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-af',af,'-c:a','aac','-b:a','192k','-ar','48000','-t',String(timeline.duration),'-movflags','+faststart',out]);
fs.writeFileSync(path.join(HERE,'out/probe.json'),run('ffprobe',['-v','error','-show_streams','-show_format','-of','json',out],true).stdout);
fs.writeFileSync(path.join(HERE,'captions.json'),JSON.stringify(timeline.captions));run(py,[path.join(LIB,'core/render/srt.py'),path.join(HERE,'captions.json'),path.join(HERE,'clawd-worlds.srt')]);
console.log('Completed:',out);
