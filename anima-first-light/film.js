import {lerp, clamp} from '/core/lib.js';
const timeline=await fetch('./timeline.json').then(r=>r.json());
const canvas=document.querySelector('canvas'), c=canvas.getContext('2d');
canvas.width=innerWidth;canvas.height=innerHeight;
const P='#f2f0ea',K='#141414',R='#ed3d26',G='#d8d6cf',L='#e7e5de';
const s=(t,a,b)=>clamp((t-a)/(b-a),0,1);
// Invert the specified cubic-bezier x, rather than approximating it with a spring.
function ease(x){let lo=0,hi=1,u=.5;for(let i=0;i<18;i++){u=(lo+hi)/2;const q=3*(1-u)**2*u*.7+3*(1-u)*u*u*.2+u**3;if(q<x)lo=u;else hi=u;}return 3*(1-u)*u*u+u**3;}
const e=(t,a,b)=>ease(s(t,a,b));
function rect(x,y,w,h,col=K){c.fillStyle=col;c.fillRect(x,y,w,h);}
function line(x,y,xx,yy,col=G,w=1){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();}
function text(v,x,y,size=28,weight=400,col=K){c.fillStyle=col;c.font=`${weight} ${size}px Film`;c.letterSpacing=size>=90?`${-size*.025}px`:'0px';c.fillText(v,x,y);c.letterSpacing='0px';}
function reveal(v,x,y,size,weight,t,a,b,w=1500){c.save();c.beginPath();c.rect(x-5,y-size*1.25,w,size*1.6);c.clip();text(v,x,y+(1-e(t,a,b))*size*1.7,size,weight);c.restore();}
function grid(t){const p=s(t,.25,1);for(let i=0;i<=12;i++)line(96+i*144,96,96+i*144,96+888*p);for(let j=0;j<=7;j++)line(96,96+j*120,96+1728*p,96+j*120);}
function camera(cx,cy,z=1,a=0){c.translate(960,540);c.scale(z,z);c.rotate(a);c.translate(-cx,-cy);}
const glyphs={A:['01110','11011','11011','11111','11011','11011','11011'],N:['11001','11101','11101','11011','11011','11011','11001'],I:['111','010','010','010','010','010','111'],M:['11011','11111','11111','11011','11011','11011','11011']};
const targets=[];let gx=96;for(const letter of 'ANIMA'){const glyph=glyphs[letter];glyph.forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')targets.push({x:gx+x*54,y:300+y*54,w:55,h:55});}));gx+=(glyph[0].length+1)*54;}
const bars=targets.map((target,i)=>({x:866+(i%6)*144,y:216+Math.floor(i/6)%4*144,w:120,h:96,target}));
function baseBars(t){bars.forEach((b,i)=>{const col=i%6,row=Math.floor(i/6)%4;const arrival=1+(col+row)%4*.5;const p=e(t,arrival-.25,arrival);if(i>=24)return;rect(b.x,b.y,b.w,b.h*p,i%5===0?G:K);});}
function header(t){line(96,96,1824,96,K);text('ANIMA',96,72,24,700);text('01 / 01',1660,72,24);line(96,936,1824,936,K);text('15 / 24',96,982,22);text('120',1740,982,22);}
function draw(t){
 c.setTransform(canvas.width/1920,0,0,canvas.height/1080,0,0);rect(0,0,1920,1080,P);
 if(t<10.75){
  c.save();
  // Four distinct moves: push, horizontal pan, pull-back and quarter-turn.
  let cx=960,cy=540,z=1,rot=0;
  if(t<3){z=lerp(1,1.09,e(t,1.5,2.5));cx=lerp(960,1008,e(t,1.5,2.5));}
  else if(t<7){cx=lerp(1008,960,e(t,3,3.5));z=lerp(1.09,1,e(t,3,3.5));}
  else if(t<9){cx=lerp(960,1010,e(t,7,7.5));z=lerp(1,.43,e(t,7.5,8));rot=-Math.PI/2*e(t,8,8.5);}
  else {cx=lerp(1010,960,e(t,9,9.5));z=lerp(.43,1,e(t,9,9.75));rot=-Math.PI/2*(1-e(t,9,9.75));}
  camera(cx,cy,z,rot);grid(t);
  if(t<7.5)baseBars(t);
  if(t>=4&&t<7.5){for(let i=0;i<6;i++){const p=e(t,3.75+i*.25,4+i*.25);rect(866+i*144,720,120,96*p,i%2?G:K);}}
  if(t>=7.5){bars.forEach((b,i)=>{const p=e(t,7.5+(i%12)*.125,9.5+(i%5)*.125);const target=b.target;rect(lerp(b.x,target.x,p),lerp(b.y,target.y,p),lerp(b.w,target.w,p),lerp(b.h,target.h,p),K);});}
  // The only coloured object is the protagonist, and its escape is linear.
  let rx=720,ry=336,rw=120;
  if(t<.5){rw=lerp(24,120,e(t,0,.25));rx=720+(120-rw)/2;ry=336+(120-rw)/2;}
  if(t>=6.75){const p=s(t,6.75,8);rx=lerp(720,1550,p);ry=336-Math.sin(p*Math.PI)*230;}
  if(t>=9){const p=e(t,9,10.5);rx=lerp(1550,1656,p);ry=lerp(336,240,p);}
  rect(rx,ry,rw,rw,R);c.restore();
 }
 // Editorial text remains outside the moving camera so it stays readable.
 if(t<3.5){text('01',96,300,180,900);reveal('从一个点',104,780,76,700,t,.25,.5);}
 else if(t<7.5){text('02',96,300,180,900);reveal('让秩序生长',104,780,76,700,t,3.5,3.75);}
 if(t>=10.75){const p=e(t,10.75,11);c.save();c.beginPath();c.rect(0,0,1920*p,1080);c.clip();rect(0,0,1920,1080,P);text('ANIMA',80,595,365,900);rect(1656,250,144,144,R);text('让想法，动起来。',106,750,76,700);c.restore();}
 header(t);
}
window.DUR=timeline.duration;window.EV=timeline.events;
window.TEXTS=t=>{
 const list=[{id:'name',text:'ANIMA',x0:96,y0:40,x1:260,y1:80},{id:'edition',text:'01 / 01',x0:1660,y0:40,x1:1800,y1:80},{id:'fps',text:'15 / 24',x0:96,y0:950,x1:240,y1:990},{id:'tempo',text:'120',x0:1740,y0:950,x1:1810,y1:990}];
 if(t>=.5&&t<3.5)list.push({id:'line1',text:'从一个点',x0:104,y0:680,x1:450,y1:800});
 if(t>=3.75&&t<7.5)list.push({id:'line2',text:'让秩序生长',x0:104,y0:680,x1:550,y1:800});
 if(t>=11)list.push({id:'end-title',text:'ANIMA',x0:80,y0:200,x1:1540,y1:620},{id:'end-line',text:'让想法，动起来。',x0:106,y0:650,x1:850,y1:780});
 return list;
};
await Promise.all([400,700,900].map(w=>document.fonts.load(`${w} 76px Film`,'ANIMA从一个点让秩序生长想法动起来。，')));
window.render=draw;window.READY=true;draw(0);
// Optional real-time preview; offline frame renderers omit ?preview=1.
if(new URLSearchParams(location.search).has('preview')){let zero;const run=ms=>{zero??=ms;draw(((ms-zero)/1000)%15);requestAnimationFrame(run);};requestAnimationFrame(run);}
