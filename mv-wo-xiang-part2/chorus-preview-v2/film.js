import {surface,r,path,carriage} from './pixel-assets.js';
import {rig,drawRig} from './actor.js';
import {mulberry,clamp,lerp} from '/core/lib.js';
const timeline=await fetch('./timeline.json').then(r=>r.json());await document.fonts.load('500 44px Lyric',timeline.captions.map(c=>c.text).join('')+'疲惫察觉惊喜好奇失衡开心');
const canvas=document.querySelector('#film');canvas.width=640;canvas.height=360;const out=canvas.getContext('2d');out.imageSmoothingEnabled=false;
const world=surface(320,180),c=world.getContext('2d');c.imageSmoothingEnabled=false;
const rnd=mulberry(98127),stars=Array.from({length:65},()=>({x:rnd()*350,y:6+rnd()*77,p:rnd()*6})),drops=Array.from({length:38},()=>({x:rnd()*320,y:rnd()*180,v:27+rnd()*25}));
const waves=Array.from({length:65},()=>({x:rnd()*350,y:109+rnd()*41,w:3+rnd()*13,p:rnd()*6}));
const s=(t,a,b)=>clamp((t-a)/(b-a),0,1),ease=q=>q*q*(3-2*q),E=(t,a,b)=>ease(s(t,a,b));
const positive=(n,d)=>(n%d+d)%d;
const textImages=timeline.captions.map(cue=>{const a=surface(640,44),d=a.getContext('2d');d.font='500 22px Lyric';d.textAlign='center';d.fillStyle='white';d.fillText(cue.text,320,31);const im=d.getImageData(0,0,640,44);for(let i=0;i<im.data.length;i+=4){im.data[i]=235;im.data[i+1]=222;im.data[i+2]=183;im.data[i+3]=im.data[i+3]>95?255:0;}d.putImageData(im,0,0);return {a,cue};});
function note(x,y,size=1,color='#ddcea3'){r(c,x,y,3*size,2*size,color);r(c,x+2*size,y-6*size,size,7*size,color);r(c,x+3*size,y-6*size,3*size,size,color);}
function twinkle(x,y,q=1){r(c,x-2*q,y,5*q,q,'#e8d5a3');r(c,x,y-2*q,q,5*q,'#e8d5a3');}
function rain(t,amount=.6){for(let i=0;i<drops.length*amount;i++){const d=drops[i],tt=Math.floor(t*12)/12,x=positive(d.x-tt*9,336)-8,y=positive(d.y+tt*d.v,153);r(c,x,y,1,4,'#799bab');r(c,x-1,y+4,1,2,'#4f748c');}}
function sky(t,scroll=0){
 r(c,0,0,320,180,'#182b43');r(c,0,49,320,49,'#213a50');r(c,0,98,320,82,'#203b50');
 for(const st of stars){const x=positive(st.x-scroll*.04-t*.2,350)-15;r(c,x,st.y,1,1,Math.sin(t*.7+st.p)>.4?'#e5d2a6':'#8ca8b2');}
 for(let i=0;i<5;i++){const x=positive(i*83-scroll*.12-t*.6,410)-50,y=30+(i*17)%40;r(c,x,y,48,4,'#29445b');r(c,x+7,y-4,31,7,'#29445b');r(c,x+15,y-6,15,4,'#304c62');}
 r(c,264,18,8,9,'#ddcc9b');r(c,262,20,12,5,'#ddcc9b');r(c,268,17,7,6,'#182b43');
 for(let i=0;i<22;i++){const x=positive(i*18-scroll*.32,390)-35,h=8+i*11%24;r(c,x,102-h,12,h,'#284451');for(let k=0;k<3;k++)if((k+i)%3===0)r(c,x+3,105-h+k*5,1,2,'#b9af89');}
 r(c,0,103,320,1,'#648391');for(const w of waves){const x=positive(w.x-scroll*.6-t*2,350)-15,y=w.y+Math.round(Math.sin(t*.6+w.p));r(c,x,y,w.w,1,'#3c6177');if(Math.sin(t+w.p)>.6)r(c,x+2,y-1,4,1,'#7e9ca5');}
}
function palmLight(x,y,t){const radius=4+Math.floor(Math.sin(t*4)*1.3);r(c,x-radius,y-1,radius*2+1,2,'#b4ba9b');r(c,x-1,y-3,3,6,'#e3d6ad');r(c,x,y-5,1,2,'#f0e5bc');}
function opening(t){
 c.drawImage(carriage(t),0,0);const q=E(t,.30,1.05),pose={eyes:t<.42?'tired':t<.82?'curious':'wide',bodyDy:lerp(2,0,q),lean:lerp(.04,-.04,q),raise:q*.85,wind:.2+q*.5,look:1};
 const a=drawRig(c,pose,80,59,1);rain(t,.25);const [hx,hy]=a.hand;if(t>.72){r(c,hx,hy-3,2,2,'#d7d8b0');r(c,hx+1,hy-8,1,3,'#a7c0bc');}
 // Motion starts before the close-up so the receiving hand leads the cut.
}
function closeRain(t){
 const train=carriage(t);c.drawImage(train,45,24,190,100,0,0,320,169);rain(t,.6);
 const receive=E(t,1.25,1.7),settle=E(t,2.5,3.5);const a=drawRig(c,{eyes:t<2.35?'wide':'curious',lean:lerp(-.055,.045,settle),raise:.9+.1*receive,bodyDy:-1,look:1,wind:.5},-8,0,2);
 const [hx,hy]=a.hand;const fall=positive(t-1.35,1.05);if(fall<.66){const y=lerp(13,hy-5,fall/.66);r(c,hx,y,2,4,'#c5d8d3');r(c,hx+1,y-3,1,3,'#87abb8');}else{palmLight(hx,hy-4,t);r(c,hx-7,hy-4,2,1,'#d5d9b4');r(c,hx+6,hy-6,2,1,'#d5d9b4');}
}
function melody(t){
 sky(t,0);const poke=E(t,3.7,4.1)*(1-E(t,4.18,4.55));
 const a=drawRig(c,{eyes:t<4.2?'curious':'wide',lean:.055,raise:1,poke,look:1,wind:.6},-8,0,2);
 const origin=[194,lerp(80,60,E(t,3.58,3.85))],move=E(t,4.12,5.25);const nx=lerp(origin[0],294,move),ny=lerp(origin[1],98,move);
 if(t<3.82)palmLight(origin[0],origin[1],t);else note(nx,ny,1.5);
 if(t>4.1){for(let i=0;i<5;i++){const q=E(t,4.18+i*.12,4.70+i*.12);if(q<=0)continue;const x=218+i*22,y=83+i*8;r(c,x,y,Math.max(1,18*q),3,'#b5ba9e');r(c,x,y+3,Math.max(1,18*q),2,'#577e89');}}
 if(t>4.0&&t<4.3)twinkle(a.hand[0]+2,a.hand[1]-8);
}
function road(t){
 const u=t-5.25,travel=190*E(t,5.6,8.86);sky(t,travel);
 // Broad, distinct paving blocks and landmarks pass the subject, making distance legible.
 for(let i=-3;i<15;i++){const x=i*34-travel*.78;r(c,x,134,29,4,'#b3b499');r(c,x,138,29,8,'#486d7b');r(c,x+3,136,23,1,'#d5c9a2');}
 for(let i=0;i<5;i++){const x=90+i*122-travel*.9;r(c,x,66,2,68,'#6f8b89');r(c,x-6,62,15,4,'#c9c6a0');r(c,x-3,67,9,5,'#e2d0a3');r(c,x+2,73,1,50,'#3d6171');}
 const hx=28+travel*.22,hy=54;let p={eyes:'curious',look:1,wind:1,phase:u*10,run:.55};
 if(t<5.85)p={eyes:'curious',look:1,lean:.025,feet:[[0,0],[0,-5*s(t,5.25,5.85)],[0,0],[0,0]],balance:.1,wind:.8};
 else if(t<6.65)p={...p,lean:.05,run:.75,bodyDy:-Math.abs(Math.sin(u*10))*2};
 else if(t<7.25){const q=Math.sin(s(t,6.65,7.25)*Math.PI);p={eyes:'wide',lean:-.22*q,balance:.95,feet:[[8,-5],[4,0],[-5,0],[-4,-2]],bodyDy:1+q,wind:1.1};}
 else if(t<7.75){const q=E(t,7.25,7.75);p={eyes:'curious',lean:-.06*(1-q),balance:1-q,wind:.9,feet:[[0,0],[0,0],[0,0],[0,0]]};}
 else p={eyes:t>8.35?'happy':'curious',look:1,wind:1,phase:u*12,run:.8,lean:.06,bodyDy:-Math.abs(Math.sin(u*12))*2,balance:.15};
 drawRig(c,p,hx,hy,1);
 // The guiding note stays ahead; its row becomes the next scene's rhythm tiles.
 note(hx+115,111+Math.sin(t*2)*3,1);for(let j=0;j<3;j++)r(c,hx+108-j*7,124,3,1,'#a6b5a5');
}
function dancePose(t){const q=(t-8.86)*Math.PI*6,step=Math.sin(q),happy=t>=9.3;return {eyes:happy?'happy':'curious',lean:Math.sin(q*.5)*.10,balance:.55+.15*Math.sin(q+.7),bodyDy:-Math.abs(step)*2,squash:.94+.06*Math.abs(Math.cos(q)),feet:[[-2,-Math.max(0,step)*7],[0,-Math.max(0,step)*5],[2,-Math.max(0,-step)*7],[0,-Math.max(0,-step)*5]],wind:.8,phase:q};}
function tiles(t,close=false){
 sky(t,190);const top=close?116:136;for(let i=0;i<7;i++){const x=(close?-8:52)+i*(close?48:31),hot=(i%2===Math.floor((t-8.98)*6)%2);r(c,x,top,close?43:27,4,hot?'#e3d3a5':'#9cae9e');r(c,x,top+4,close?43:27,13,hot?'#557e87':'#335769');r(c,x+3,top+6,close?36:20,1,'#7b9e9f');if(hot){r(c,x+3,top+20,close?37:21,1,'#87a4aa');r(c,x+8,top+23,close?27:11,1,'#527e90');}}
}
function feetShot(t){tiles(t,true);const a=rig(dancePose(t));c.drawImage(a.image,20,54,76,30,18,20,284,112);}
function happyShot(t){tiles(t,false);drawRig(c,dancePose(t),96,32,1.3);for(let i=0;i<3;i++){const q=positive(t*1.4+i*.38,1);r(c,211+i*9,103-q*17,1,2,'#c6c8a6');}note(239,83,1);}
function captions(t){
 out.imageSmoothingEnabled=false;out.drawImage(world,0,0,640,360);r(out,34,306,572,46,'#152936');r(out,36,306,568,2,'#5e7979');r(out,36,350,568,2,'#5e7979');r(out,34,308,2,42,'#5e7979');r(out,604,308,2,42,'#5e7979');for(const x of[34,602]){r(out,x,306,4,4,'#c4bb94');r(out,x,348,4,4,'#c4bb94');}
 out.drawImage((textImages.find(({cue})=>t>=cue.t0&&t<cue.t1)||textImages.at(-1)).a,0,310);
}
function poseSheet(){
 r(c,0,0,320,180,'#20394c');const cases=[{eyes:'tired',bodyDy:2},{eyes:'curious',look:1,raise:.4},{eyes:'wide',raise:1,lean:-.05},{eyes:'curious',raise:1,poke:1,lean:.055},{eyes:'wide',balance:1,lean:-.2},{...dancePose(9.8),eyes:'happy'}];
 cases.forEach((p,i)=>drawRig(c,p,(-7+(i%3)*107),-8+Math.floor(i/3)*86,.95));out.drawImage(world,0,0,640,360);
}
function draw(t){c.setTransform(1,0,0,1,0,0);r(c,0,0,320,180,'#182b43');if(new URLSearchParams(location.search).has('poses')){poseSheet();return;}if(t<1.25)opening(t);else if(t<3.58)closeRain(t);else if(t<5.25)melody(t);else if(t<8.86)road(t);else if(t<9.3)feetShot(t);else happyShot(t);captions(t);}
window.DUR=timeline.duration;window.EV=[];window.render=draw;window.READY=true;draw(0);
