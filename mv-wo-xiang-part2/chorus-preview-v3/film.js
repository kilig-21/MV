import {surface,r,path,carriage} from './pixel-assets.js';
import {clawd} from './actor.js';
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
function captions(t){
 out.imageSmoothingEnabled=false;out.drawImage(world,0,0,640,360);r(out,34,306,572,46,'#152936');r(out,36,306,568,2,'#5e7979');r(out,36,350,568,2,'#5e7979');r(out,34,308,2,42,'#5e7979');r(out,604,308,2,42,'#5e7979');for(const x of[34,602]){r(out,x,306,4,4,'#c4bb94');r(out,x,348,4,4,'#c4bb94');}
 out.drawImage((textImages.find(({cue})=>t>=cue.t0&&t<cue.t1)||textImages.at(-1)).a,0,310);
}

// Note heads are actual landings. Their top surfaces and the sprite soles
// use the same world coordinates, including during the camera follow.
const platforms=[{x:72,y:126},{x:142,y:113},{x:218,y:126},{x:294,y:108},{x:370,y:122},{x:447,y:112},{x:523,y:127}];
const hops=[{a:0,b:1,start:4.65,end:5.25,height:29},{a:1,b:2,start:5.72,end:6.43,height:34},{a:2,b:3,start:6.82,end:7.45,height:38},{a:3,b:4,start:7.7,end:8.3,height:34},{a:4,b:5,start:8.57,end:9.14,height:37},{a:5,b:6,start:9.38,end:10.03,height:33}];
function position(t){
 let n=0,landedAt=-100;
 for(const h of hops){
  if(t<h.start)break;
  if(t<h.end){const u=s(t,h.start,h.end),a=platforms[h.a],b=platforms[h.b];return {x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u)-h.height*4*u*(1-u),air:true,u};}
  n=h.b;landedAt=h.end;
 }
 const p=platforms[n],after=t-landedAt;
 const next=hops.find(h=>h.start>t),prep=next?E(t,next.start-.15,next.start):0;
 return {x:p.x,y:p.y,air:false,squash:after<.15?.94+.06*E(after,0,.15):1-.035*prep};
}
function musicPlatform(p,t,i,scroll){
 const x=Math.round(p.x-scroll),y=p.y,q=E(t,3.65+i*.14,4.10+i*.14),pos=position(t),active=Math.abs(pos.x-p.x)<2&&!pos.air;
 if(q<=0)return;
 const color=active?'#efdbab':'#b4ba9f',edge=active?'#829c94':'#587c84';
 r(c,x-19,y,38,3,color);r(c,x-22,y+3,44,4,color);r(c,x-19,y+7,38,3,edge);r(c,x-12,y+10,24,2,'#3f6578');
 // Stem and flag stay outside the full character silhouette.
 r(c,x+32,y-32,3,35,color);r(c,x+23,y+3,12,3,color);r(c,x+35,y-32,13,3,color);r(c,x+45,y-29,3,8,color);
 r(c,x-14,y+16,28,1,'#4a7082');
 if(active){r(c,x-23,y+19,46,1,'#78969d');r(c,x-17,y+22,34,1,'#466e83');}
}
function train(t){
 c.drawImage(carriage(t),0,0);const awake=E(t,.3,1.3);clawd(c,110,131,{scale:1.12,eyes:t<.5?'tired':t<1.8?'normal':'wide',look:t>1?1:0,squash:.98+.02*awake});
 rain(t,.4);
 const q=E(t,.65,3.58);for(let i=0;i<4;i++){const x=158+i*19,y=61+i*11;const yy=y+Math.sin(t*1.4+i)*2;r(c,x,yy,2,3,q>.3?'#d7d6b3':'#93aeb5');if(t>2.2)note(x,yy,1,'#d7d6b3');}
}
function dream(t){
 const p=position(t),scroll=Math.max(0,p.x-108);
 sky(t,scroll*.7);
 // Keep the full compact character visible throughout every jump.
 for(let i=0;i<platforms.length;i++)musicPlatform(platforms[i],t,i,scroll);
 const happy=t>=8.3;
 clawd(c,p.x-scroll,p.y,{scale:1.08,eyes:happy?'happy':t<5.72?'wide':'normal',look:happy?0:1,tuck:p.air?Math.sin(p.u*Math.PI):0,squash:p.squash||1});
 if(t<4.55){note(157,73+Math.sin(t*2)*2,1.3);}

}
function poseSheet(){
 r(c,0,0,320,180,'#20394c');
 clawd(c,61,77,{scale:1.2,eyes:'normal'});clawd(c,163,77,{scale:1.2,eyes:'tired'});clawd(c,261,77,{scale:1.2,eyes:'wide'});
 clawd(c,61,158,{scale:1.2,eyes:'normal',tuck:1});clawd(c,163,158,{scale:1.2,eyes:'normal',squash:.96});clawd(c,261,158,{scale:1.2,eyes:'happy'});
 out.drawImage(world,0,0,640,360);
}
function draw(t){c.setTransform(1,0,0,1,0,0);r(c,0,0,320,180,'#182b43');if(new URLSearchParams(location.search).has('poses')){poseSheet();return;}if(t<3.58)train(t);else dream(t);captions(t);}
window.DUR=timeline.duration;window.EV=[];window.render=draw;window.READY=true;draw(0);
