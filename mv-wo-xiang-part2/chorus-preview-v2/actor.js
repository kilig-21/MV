import {surface,r,path} from './pixel-assets.js';
const mix=(a,b,p)=>a+(b-a)*p;
function limb(c,a,b,w,edge,fill){
 const n=Math.max(1,Math.ceil(Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]))));
 for(let k=0;k<=n;k++){const x=mix(a[0],b[0],k/n),y=mix(a[1],b[1],k/n);r(c,x-(w+2)/2,y-(w+2)/2,w+2,w+2,edge);}
 for(let k=0;k<=n;k++){const x=mix(a[0],b[0],k/n),y=mix(a[1],b[1],k/n);r(c,x-w/2,y-w/2,w,w,fill);}
}
export function rig(p={}){
 const image=surface(112,104),c=image.getContext('2d');c.imageSmoothingEnabled=false;
 const angle=p.lean||0,sy=p.squash||1,dy=p.bodyDy||0;
 const tr=([x,y])=>{x-=56;y=(y-48)*sy;return [56+x*Math.cos(angle)-y*Math.sin(angle),48+x*Math.sin(angle)+y*Math.cos(angle)+dy];};
 const quad=(x,y,w,h,col)=>path(c,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(tr),col);
 const run=p.run||0,phase=p.phase||0,raise=p.raise||0,balance=p.balance||0,poke=p.poke||0;
 const feet=[];
 for(let i=0;i<4;i++){
  const phaseI=phase+(i%2)*Math.PI,custom=p.feet?.[i]||[0,0];
  const end=[([39,47,65,73][i])+Math.sin(phaseI)*5*run+custom[0],77-Math.max(0,Math.cos(phaseI))*8*run+custom[1]];
  const hip=tr([40+i*(32/3),61]);
  const knee=[mix(hip[0],end[0],.45)+(i<2?-1:1),mix(hip[1],end[1],.55)];
  limb(c,hip,knee,4,'#713f35',i%2?'#da8a62':'#b96b4f');limb(c,knee,end,4,'#713f35',i%2?'#da8a62':'#b96b4f');
  r(c,end[0]-3,end[1]-1,7,4,'#713f35');r(c,end[0]-2,end[1]-1,5,2,i%2?'#e29b70':'#c67756');feet.push(end);
 }
 // Scarf streams behind the torso, with its tail separate from the hands.
 const wind=p.wind||0,tail=tr([72,61]);
 path(c,[tail,[tail[0]-4-wind*10,tail[1]+3],[tail[0]-12-wind*12,tail[1]+2+Math.sin(phase*.5)*2],[tail[0]-9-wind*10,tail[1]+7],[tail[0]+1,tail[1]+6]],'#42677c');
 const shoulders=[tr([32,44]),tr([80,44])];
 const leftElbow=[mix(27,18,balance),mix(55,43,balance)+Math.sin(phase)*4*run];
 const leftHand=[mix(29,8,balance),mix(64,37,balance)+Math.sin(phase)*6*run];
 const rightElbow=[mix(85,89,raise),mix(55,51,raise)-poke*5-Math.sin(phase)*3*run];
 const rightHand=[mix(82,101,raise),mix(64,42,raise)-poke*10-Math.sin(phase)*6*run];
 if(balance>.2){rightElbow[0]=mix(rightElbow[0],94,balance);rightElbow[1]=mix(rightElbow[1],43,balance);rightHand[0]=mix(rightHand[0],104,balance);rightHand[1]=mix(rightHand[1],36,balance);}
 for(const [shoulder,elbow,hand,front]of[[shoulders[0],leftElbow,leftHand,false],[shoulders[1],rightElbow,rightHand,true]]){
  limb(c,shoulder,elbow,4,'#713f35',front?'#db8c65':'#b9674b');limb(c,elbow,hand,4,'#713f35',front?'#e29b70':'#c17756');
  r(c,hand[0]-4,hand[1]-2,9,6,'#713f35');r(c,hand[0]-3,hand[1]-2,7,4,front?'#e8a578':'#c87957');
 }
 // Body contour, clay side plane, scarf and headphones retain A's identity.
 quad(32,32,48,31,'#713f35');quad(34,33,44,28,'#cb7756');quad(35,33,42,3,'#e8a578');quad(35,36,37,22,'#db8c65');quad(73,37,5,22,'#b65f48');quad(35,59,41,3,'#ac5845');
 quad(33,60,46,4,'#35576b');quad(36,61,38,2,'#618193');quad(73,64,6,8,'#42677c');quad(74,65,2,6,'#6e8996');
 quad(34,29,44,2,'#263338');quad(31,31,3,20,'#263338');quad(79,31,3,20,'#263338');quad(28,42,7,12,'#263338');quad(79,42,7,12,'#263338');quad(29,44,4,7,'#75918e');quad(81,44,3,7,'#75918e');
 const eyes=p.eyes||'normal',look=p.look||0;
 for(const [i,x]of[[0,45],[1,66]]){
  if(eyes==='tired'){quad(x,47+(i===1?1:0),4,4,'#302c2b');quad(x-1,45+(i===1?1:0),6,2,'#b9694e');}
  else if(eyes==='wide'){quad(x-1,40,5,11,'#302c2b');quad(x,41,1,3,'#b9b59b');}
  else if(eyes==='happy'){quad(x-1,45,2,4,'#302c2b');quad(x,43,3,2,'#302c2b');quad(x+2,45,2,4,'#302c2b');}
  else if(eyes==='blink'){quad(x-1,48,5,1,'#302c2b');}
  else if(eyes==='curious'){quad(x+look,42-i,3+i,8+i*2,'#302c2b');quad(x+look+1,43-i,1,2,'#9e9c84');}
  else{quad(x+look,43,3,8,'#302c2b');quad(x+look+1,44,1,2,'#9e7f63');}
 }
 // Cable and pocket player stay below the face and never cross its eyes.
 const cable=tr([82,53]);limb(c,cable,tr([78,67]),1,'#293d47','#293d47');quad(75,66,5,7,'#203947');quad(76,67,3,2,'#c3d0b5');quad(76,71,1,1,'#d49f6d');
 return {image,hand:rightHand,feet,eyeCenter:tr([57,45])};
}
export function drawRig(c,p,x,y,scale=1){const actor=rig(p);c.imageSmoothingEnabled=false;c.drawImage(actor.image,Math.round(x),Math.round(y),Math.round(112*scale),Math.round(104*scale));return {hand:[x+actor.hand[0]*scale,y+actor.hand[1]*scale],feet:actor.feet.map(([fx,fy])=>[x+fx*scale,y+fy*scale]),eyes:[x+actor.eyeCenter[0]*scale,y+actor.eyeCenter[1]*scale]};}
