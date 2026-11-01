import fs from 'node:fs';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
const HERE=path.dirname(fileURLToPath(import.meta.url));
process.env.PLAYWRIGHT_CHROME ||= 'C:/Users/Lenovo/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe';
const LIB=process.env.LEMO_OPUSCAR_HOME||'C:/Users/Lenovo/lemo-opuscar';
const {openDemo,closeServer}=await import(pathToFileURL(path.join(LIB,'core/render/page.mjs')));
const {browser,page}=await openDemo(HERE);const hashes={};
try{
 for(const t of[4.5,8.6,14.5,8.6,4.5,14.5]){
  await page.evaluate(t=>window.render(t),t);const hash=createHash('sha256').update(await page.screenshot({type:'png'})).digest('hex');
  if(hashes[t]&&hashes[t]!==hash)throw Error(`Frame ${t} depends on prior rendering`);hashes[t]=hash;
 }
 fs.writeFileSync(path.join(HERE,'out/determinism.json'),JSON.stringify({passed:true,hashes},null,2));console.log('PASS: repeat frames match across out-of-order renders');
}finally{await browser.close();closeServer();}
