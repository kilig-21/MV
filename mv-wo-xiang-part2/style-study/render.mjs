import fs from 'node:fs';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url));const LIB=process.env.LEMO_OPUSCAR_HOME||'C:/Users/Lenovo/lemo-opuscar';
process.env.PLAYWRIGHT_CHROME ||= 'C:/Users/Lenovo/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe';
const {openDemo,closeServer}=await import(pathToFileURL(path.join(LIB,'core/render/page.mjs')));
try{for(const mode of['pixel','hd']){const {browser,page}=await openDemo(HERE,{q:'mode='+mode});try{await page.evaluate(()=>window.render(0));await page.screenshot({type:'png',path:path.join(HERE,mode==='pixel'?'A-pure-pixel.png':'B-hd-2d.png')});console.log('Rendered',mode);}finally{await browser.close();}}}finally{closeServer();}
