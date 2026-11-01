import {surface,r,path,hero,carriage} from './pixel-assets.js';
import {mulberry,clamp,lerp} from '/core/lib.js';
const timeline=await fetch('./timeline.json').then(r=>r.json());
await document.fonts.load('500 44px Lyric',timeline.captions.map(c=>c.text).join(''));
const canvas=document.querySelector('#film');canvas.width=640;canvas.height=360;const out=canvas.getContext('2d');out.imageSmoothingEnabled=false;
const world=surface(320,180),c=world.getContext('2d');c.imageSmoothingEnabled=false;
const rand=mulberry(98127),base=hero(),stars=Array.from({length:65},()=>({x:rand()*320,y:8+rand()*80,size:rand()<.12?2:1,p:rand()*6.28}));
const drops=Array.from({length:42},()=>({x:rand()*360,y:rand()*170,v:25+rand()*35,p:rand()*8}));
const waves=Array.from({length:90},()=>({x:rand()*360,y:100+rand()*53,w:2+rand()*12,v:2+rand()*6,p:rand()*6.28}));
const clouds=Array.from({length:8},()=>({x:-40+rand()*400,y:20+rand()*48,w:30+rand()*42,p:rand()*6.28}));
const bayer=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const s=(t,a,b)=>clamp((t-a)/(b-a),0,1),ease=x=>x*x*(3-2*x);
const textImages=timeline.captions.map(cue=>{const a=surface(640,44),d=a.getContext('2d');d.font='500 22px Lyric';d.textAlign='center';d.fillStyle='white';d.fillText(cue.text,320,31);const im=d.getImageData(0,0,640,44);for(let i=0;i<im.data.length;i+=4){im.data[i]=235;im.data[i+1]=222;im.data[i+2]=183;im.data[i+3]=im.data[i+3]>95?255:0;}d.putImageData(im,0,0);return {a,cue};});
function cloud(x,y,w,col){r(c,x,y,w,4,col);r(c,x+5,y-3,w-10,7,col);r(c,x+w*.25,y-5,w*.35,4,col);}
function night(t){
 const bands=['#101f35','#182b43','#213a50','#2e4a5d'];for(let y=0;y<180;y++){const k=Math.min(3,Math.floor(y/38));r(c,0,y,320,1,bands[k]);if(y%38>24&&k<3)for(let x=0;x<320;x++)if(bayer[(y%4)*4+x%4]<(y%38-24))r(c,x,y,1,1,bands[k+1]);}
 for(const st of stars){const q=Math.sin(t*.6+st.p),x=(st.x-t*.3+320)%320;r(c,x,st.y,st.size,st.size,q>.6?'#e8d7a8':q>-.2?'#a9bcb5':'#6a8b9a');if(st.size===2&&q>.75){r(c,x-1,st.y+1,4,1,'#c5cfb9');r(c,x+1,st.y-1,1,4,'#c5cfb9');}}
 r(c,253,22,8,9,'#ddcc9b');r(c,251,24,12,5,'#ddcc9b');r(c,257,21,7,6,'#182b43');
 for(const cl of clouds){const x=((cl.x-t*(.4+cl.w*.008)+400)%400)-50;cloud(x,cl.y,cl.w,'#29445b');cloud(x+7,cl.y+3,cl.w-14,'#304c62');}
 for(let i=0;i<22;i++){let x=((i*17-t*4)%374+374)%374-27,h=9+(i*13%24);r(c,x,99-h,10+(i%3)*3,h,'#20394c');if(i%3===0)r(c,x+3,103-h,1,2,'#b3aa89');}
 r(c,0,99,320,81,'#203b50');r(c,0,100,320,1,'#6b8a98');
 for(const w of waves){let y=w.y+Math.round(Math.sin(t*.7+w.p)),x=((w.x-t*w.v)%360+360)%360-20;r(c,x,y,w.w,1,w.y>125?'#42657a':'#38586e');if(Math.sin(t+w.p)>.6)r(c,x+2,y-1,Math.max(2,w.w*.45),1,'#8fa9ad');}
 for(let i=0;i<21;i++){let y=102+i*2.3,x=255+(y-102)*.32+Math.sin(t*.8+i)*3;r(c,x,y,3+i*.12,1,i%3?'#718b91':'#bcb994');}
}
function rain(t,amount,windowOnly=false){for(const d of drops){if(d.p>amount*8)continue;const step=Math.floor(t*12)/12;let x=((d.x-step*8)%360+360)%360-20,y=(d.y+step*d.v)%152;if(windowOnly&&(x<55||x>299||y<32||y>101))continue;r(c,x,y,1,3,'#88a4ae');r(c,x-1,y+3,1,2,'#587d91');}}
function boat(t,x,y){
 path(c,[[x-47,y],[x+55,y],[x+43,y+15],[x-32,y+16]],'#253b49');path(c,[[x-44,y+1],[x+51,y+1],[x+40,y+11],[x-30,y+12]],'#7c8170');r(c,x-39,y+2,82,2,'#c4bd93');r(c,x-28,y+8,66,2,'#536d72');r(c,x-25,y+12,55,1,'#344f60');
 path(c,[[x+29,y+1],[x+53,y-4],[x+43,y+11]],'#b6b294');path(c,[[x+29,y+1],[x+43,y+5],[x+43,y+11]],'#7b8d85');for(let i=0;i<7;i++)r(c,x-50-i*5,y+10+i%2,4+Math.sin(t*.7+i)*2,1,'#829ca3');
}
function actor(t,reveal,x,y){
 const a=surface(64,64),d=a.getContext('2d');d.drawImage(base,0,0);
 if([.8,4.9,8.25].some(v=>Math.abs(t-v)<.085))for(const xx of[23,44]){r(d,xx,23,3,8,'#db8c65');r(d,xx,28,3,1,'#302c2b');}
 if(reveal>.4){const k=Math.round(Math.sin(Math.floor(t*8)/8*3)*2);path(d,[[49,44],[55,45],[59+k,48],[56+k,51],[51,49]],'#42677c');r(d,55+k,49,3,1,'#9aafa9');}
 if(t>8.86&&Math.sin((t-8.86)*Math.PI*4)>.6){d.clearRect(15,44,12,12);d.drawImage(base,15,44,12,12,15,43,12,12);}
 c.drawImage(a,x,y+(Math.floor(t*8)%23<10?0:1));
}
function ripples(t){for(let i=0;i<12;i++){const q=(t-i*.375)%.5;if(q<0)continue;const life=q/.5,px=18+i*25,py=112+(i*11)%34,ww=Math.round(3+life*7);if(life<.82){r(c,px-ww/2,py,ww,1,'#5b8393');if(ww>5){r(c,px-ww/2-1,py+1,1,1,'#5b8393');r(c,px+ww/2,py+1,1,1,'#5b8393');}}}}
function notes(t,x,y){for(let i=0;i<5;i++){const q=t-3.4-i*.33;if(q<0||q>5)continue;const xx=x+50+q*12,yy=y+35-q*6+Math.sin(q*1.4+i)*3;r(c,xx,yy,3,2,'#d4c79d');r(c,xx+2,yy-5,1,6,'#d4c79d');r(c,xx+3,yy-5,2,1,'#d4c79d');}}
function draw(t){
 night(t);const reveal=ease(s(t,1.2,4.65));
 if(reveal<1){const train=carriage(t);for(let yy=0;yy<153;yy+=4)for(let xx=0;xx<320;xx+=4){const a=Math.floor(xx/4),b=Math.floor(yy/4),noise=((a*17+b*29)%31)/31,distance=Math.abs(xx-164)/220+Math.abs(yy-70)/210,threshold=.15+distance*.43+noise*.2;if(reveal<threshold)c.drawImage(train,xx,yy,4,4,xx,yy,4,4);}}
 const bob=Math.round(Math.sin(t*.85)*1.1),hx=Math.round(lerp(104,128,ease(s(t,2.4,5.5)))+44*ease(s(t,5.25,10.416667))),hy=Math.round(lerp(82,78,ease(s(t,2.4,5.5))))+bob;
 if(reveal>.25){c.save();const amount=s(reveal,.25,.72);c.beginPath();c.rect(0,Math.round(133-amount*8),320,30);c.clip();boat(t,hx+31,hy+56);c.restore();}
 actor(t,reveal,hx,hy);if(t<3.7)rain(t,s(t,.9,2.9),true);else{rain(t,.4);ripples(t);}if(t>3.4)notes(t,hx,hy);
 out.imageSmoothingEnabled=false;out.drawImage(world,0,0,640,360);
 r(out,34,306,572,46,'#152936');r(out,36,306,568,2,'#5e7979');r(out,36,350,568,2,'#5e7979');r(out,34,308,2,42,'#5e7979');r(out,604,308,2,42,'#5e7979');for(const x of[34,602]){r(out,x,306,4,4,'#c4bb94');r(out,x,348,4,4,'#c4bb94');}
 const entry=textImages.find(({cue})=>t>=cue.t0&&t<cue.t1)||textImages.at(-1);out.drawImage(entry.a,0,310);
}
window.DUR=timeline.duration;window.EV=[];window.render=draw;window.READY=true;draw(0);
