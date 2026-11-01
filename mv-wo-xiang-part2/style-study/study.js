import * as THREE from 'three';
import {makePost} from '/core/three/post.js';
import {mulberry} from '/core/lib.js';
const W=innerWidth,H=innerHeight;
const lyric='他会循环播放伴随你的每个日夜';
const mode=new URLSearchParams(location.search).get('mode')||'pixel';
await Promise.all([500,700].map(w=>document.fonts.load(`${w} 44px Lyric`,lyric)));
function surface(w,h){const a=document.createElement('canvas');a.width=w;a.height=h;return a;}
function r(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function path(c,p,color){c.fillStyle=color;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
const palette=['#152a39','#1e3545','#2c4a55','#385a62','#567979','#809a8d','#aab5a0','#e8d4a2'];
function hero(){
 const a=surface(64,64),c=a.getContext('2d');
 // Original pixel rig following the requested Clawd silhouette. Blue scarf
 // and wired headphones distinguish the listener from the songwriter.
 r(c,8,14,47,29,'#713f35');r(c,10,12,43,33,'#713f35');
 r(c,10,14,43,28,'#cb7756');r(c,11,14,41,3,'#e8a578');r(c,11,17,37,22,'#db8c65');r(c,48,18,5,22,'#b65f48');
 r(c,12,40,39,3,'#ac5845');
 r(c,4,26,5,14,'#713f35');r(c,5,27,4,10,'#c47856');r(c,55,27,5,13,'#713f35');r(c,55,27,4,10,'#d68c64');
 for(const [x,col]of[[15,'#bc684c'],[22,'#e2956c'],[42,'#bc684c'],[49,'#d68c64']]){r(c,x,43,5,12,'#713f35');r(c,x+1,43,4,10,col);}
 // Downward gaze, without cartoon tears or a large theatrical expression.
 r(c,23,23,3,8,'#302c2b');r(c,44,23,3,8,'#302c2b');r(c,24,23,1,2,'#9e7f63');r(c,45,23,1,2,'#9e7f63');
 r(c,9,40,45,4,'#35576b');r(c,12,41,36,2,'#618193');r(c,44,43,7,10,'#42677c');r(c,45,44,2,7,'#6e8996');r(c,43,52,8,1,'#9aafa9');
 r(c,10,11,43,2,'#263338');r(c,8,13,3,18,'#263338');r(c,52,13,3,18,'#263338');r(c,5,24,7,10,'#263338');r(c,53,24,7,10,'#263338');r(c,6,26,4,6,'#75918e');r(c,55,26,3,6,'#75918e');
 // Wire trails into a small music player resting in its hand.
 r(c,57,34,1,13,'#293d47');r(c,53,46,5,1,'#293d47');r(c,50,47,4,6,'#203947');r(c,51,48,2,2,'#c3d0b5');r(c,51,51,1,1,'#d49f6d');
 return a;
}
const sprite=hero();
function exterior(w=320,h=120){
 const a=surface(w,h),c=a.getContext('2d'),rand=mulberry(1206);
 r(c,0,0,w,h,palette[0]);
 for(let y=0;y<h*.7;y++){const col=y<h*.20?'#172d40':y<h*.43?'#203c4d':'#2b4856';r(c,0,y,w,1,col);if(y%3===0)for(let x=0;x<w;x+=2)if(rand()<.3)r(c,x,y,1,1,'#223a4b');}
 for(let i=0;i<27;i++){let x=rand()*w,y=rand()*h*.43;r(c,x,y,1,1,i%3?'#9ebdb9':'#e9d7a8');if(i%7===0){r(c,x-1,y,3,1,'#c6d9c5');r(c,x,y-1,1,3,'#c6d9c5');}}
 const moonX=w*.78,moonY=h*.18;r(c,moonX,moonY,5,6,'#e3d8b0');r(c,moonX-1,moonY+1,7,4,'#e3d8b0');r(c,moonX+3,moonY,3,3,'#203c4d');
 for(let layer=0;layer<2;layer++)for(let i=0;i<25;i++){let x=i*w/24+(rand()-.5)*7,bw=7+rand()*10,bh=12+rand()*(layer?34:25),by=h*.74;r(c,x,by-bh,bw,bh,layer?'#28414c':'#345260');for(let yy=by-bh+4;yy<by-2;yy+=5)for(let xx=x+2;xx<x+bw-1;xx+=4)if(rand()<.4)r(c,xx,yy,1,2,rand()<.65?'#bdab81':'#6e9997');}
 r(c,0,h*.74,w,h*.26,'#203c4d');for(let i=0;i<90;i++){let x=rand()*w,y=h*.75+rand()*h*.24;r(c,x,y,2+rand()*8,1,i%3?'#446a70':'#8baca2');}
 // A faint railway reflection begins turning into a route over water.
 for(let i=0;i<36;i++){let p=i/36,x=w*.63+p*w*.34,y=h*.96-p*p*h*.37;r(c,x,y,3,1,'#a8bcb0');r(c,x,y+4*(1-p),3,1,'#718f90');if(i%3===0)r(c,x,y,1,5*(1-p),'#bdc7ac');}
 return a;
}
const panorama=exterior();
const frame=document.querySelector('#frame'),overlay=document.querySelector('#overlay');
function pixelText(c,text,x,y,size=11){
 const a=surface(320,24),d=a.getContext('2d');d.font=`700 ${size}px Lyric`;d.textAlign='center';d.fillStyle='white';d.fillText(text,160,size+2);
 const im=d.getImageData(0,0,320,24);for(let i=0;i<im.data.length;i+=4){im.data[i]=235;im.data[i+1]=222;im.data[i+2]=183;im.data[i+3]=im.data[i+3]>100?255:0;}d.putImageData(im,0,0);c.drawImage(a,x-160,y-size-2);
}
function purePixel(){
 frame.width=320;frame.height=180;overlay.style.display='none';const c=frame.getContext('2d');c.imageSmoothingEnabled=false;
 r(c,0,0,320,180,'#182e3b');
 // Ceiling, sidewall and door recesses establish a lived-in carriage.
 path(c,[[0,0],[320,0],[320,15],[0,23]],'#263f49');r(c,0,16,320,115,'#718b83');r(c,0,20,320,3,'#b3b9a0');r(c,0,119,320,20,'#4b6b69');
 r(c,50,27,253,77,'#1b303c');r(c,53,30,247,71,'#a4b19c');r(c,55,32,243,67,'#263e49');c.drawImage(panorama,55,32,243,67);
 r(c,53,29,249,2,'#bdc4a8');r(c,52,101,251,4,'#344e54');r(c,54,105,249,2,'#9da895');r(c,180,30,5,73,'#6f8b82');r(c,181,31,2,70,'#c0c6aa');
 // Sparse window reflections, built from indexed colours rather than blur.
 for(let y=35;y<75;y++)for(let x=62;x<95;x++)if((x+y)%9===0)r(c,x,y,1,1,'#4b6970');
 r(c,68,37,45,1,'#64837f');r(c,201,37,60,1,'#64837f');
 r(c,0,25,43,119,'#34525a');r(c,3,28,35,111,'#5a7876');r(c,7,32,27,60,'#203e4c');r(c,9,34,23,55,'#294c59');r(c,7,95,27,2,'#9da995');r(c,18,104,3,15,'#b5bba6');r(c,20,105,1,13,'#5d7672');
 r(c,46,109,260,5,'#304a52');r(c,47,114,258,17,'#456d73');r(c,47,115,258,2,'#8ba59a');r(c,46,130,260,7,'#2d4c58');r(c,48,131,257,2,'#557d81');
 for(let x=50;x<302;x+=32){r(c,x,116,1,13,'#34585f');r(c,x+2,118,27,1,'#537e80');}for(let x=55;x<300;x+=58)r(c,x,137,3,9,'#243e49');
 path(c,[[0,144],[320,135],[320,180],[0,180]],'#293e49');for(let y=148;y<180;y+=7)r(c,0,y,320,1,'#36515b');for(const x of[20,95,175,245,300])path(c,[[x,141],[x+1,141],[x+25,180],[x+23,180]],'#3c5660');
 // Small overhead lamps and their corresponding reflected patches.
 r(c,61,11,59,2,'#d6c99b');r(c,63,12,55,2,'#f0dcab');r(c,211,7,71,2,'#f0dcab');
 r(c,56,1,1,15,'#49636a');r(c,123,0,1,14,'#49636a');
 r(c,226,15,3,140,'#263d46');r(c,227,15,1,140,'#c2c7ac');r(c,228,17,1,137,'#66877e');
 for(const x of[78,106,254,280]){r(c,x,15,1,11,'#788d7e');r(c,x-3,26,7,1,'#b8b99a');r(c,x-4,27,1,4,'#b8b99a');r(c,x+3,27,1,4,'#b8b99a');r(c,x-3,31,6,1,'#b8b99a');}
 // Listener: fixed sprite pixels, not a smoothed three-dimensional mascot.
 r(c,103,132,67,4,'#203845');c.drawImage(sprite,104,82,64,64);
 r(c,181,128,18,12,'#263d46');r(c,183,129,15,10,'#69776d');r(c,184,132,13,1,'#a4a68c');r(c,187,125,7,1,'#a4a68c');r(c,186,126,1,4,'#a4a68c');r(c,194,126,1,4,'#a4a68c');
 // Full lyric, with pixel-glyph edges and restrained original UI framing.
 r(c,17,153,286,23,'#152936');r(c,18,153,284,1,'#5e7979');r(c,18,175,284,1,'#5e7979');r(c,17,154,1,21,'#5e7979');r(c,302,154,1,21,'#5e7979');
 for(const x of[17,301]){r(c,x,153,2,2,'#c4bb94');r(c,x,174,2,2,'#c4bb94');}
 // CJK gets a 2x text grid; the scene remains 320x180. This preserves crisp
 // square-pixel glyphs without crushing complex Chinese characters into 11px.
 const drawn=surface(320,180);drawn.getContext('2d').drawImage(frame,0,0);frame.width=640;frame.height=360;c.imageSmoothingEnabled=false;c.drawImage(drawn,0,0,640,360);
 const textLayer=surface(640,44),d=textLayer.getContext('2d');d.font='500 22px Lyric';d.textAlign='center';d.fillStyle='white';d.fillText(lyric,320,31);
 const glyphs=d.getImageData(0,0,640,44);for(let i=0;i<glyphs.data.length;i+=4){glyphs.data[i]=235;glyphs.data[i+1]=222;glyphs.data[i+2]=183;glyphs.data[i+3]=glyphs.data[i+3]>95?255:0;}d.putImageData(glyphs,0,0);c.drawImage(textLayer,0,310);
 return ()=>{};
}
function texture(canvas){const t=new THREE.CanvasTexture(canvas);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;return t;}
function textile(base,seed=5){const a=surface(64,64),c=a.getContext('2d'),rand=mulberry(seed);r(c,0,0,64,64,base);for(let i=0;i<500;i++){r(c,rand()*64,rand()*64,1,1,i%2?'#567979':'#71918a');}return texture(a);}
function hd(){
 frame.style.display='none';overlay.width=W;overlay.height=H;
 const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(W,H);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.10;document.body.prepend(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#1b2e3e');scene.fog=new THREE.Fog('#263b48',13,37);
 const camera=new THREE.PerspectiveCamera(43,W/H,.1,80);camera.position.set(4.5,3.9,7.7);camera.lookAt(-.8,1.8,-1.55);
 const mat=(color,roughness=.8)=>new THREE.MeshStandardMaterial({color,roughness});
 const steel=mat('#7c918b',.4),wall=mat('#5b7776'),trim=mat('#294955'),dark=mat('#182f3c'),wood=mat('#566d6b');
 function box(w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;}
 function pole(x,z){const o=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,4.4,12),steel);o.position.set(x,2.1,z);o.castShadow=true;scene.add(o);}
 const ambient=new THREE.HemisphereLight('#bdd7d6','#243c50',1.15);scene.add(ambient);
 const moon=new THREE.DirectionalLight('#a9ced9',1.1);moon.position.set(-2,5,-8);scene.add(moon);
 const practical=new THREE.PointLight('#f4d7a4',38,13,2);practical.position.set(-1,4.05,.1);practical.castShadow=true;practical.shadow.mapSize.set(1024,1024);practical.shadow.bias=-.0007;practical.shadow.normalBias=.02;scene.add(practical);
 const fill=new THREE.PointLight('#d1d9ca',15,10,2);fill.position.set(-1.2,2.7,3);scene.add(fill);
 const blue=new THREE.PointLight('#76b3c4',10,9);blue.position.set(4,2.4,-1.3);scene.add(blue);
 box(18,.18,12,mat('#243c47',.44),0,-.12,1.5);box(18,.25,5,trim,0,4.3,-.8);
 for(let i=0;i<24;i++)box(.018,.003,10,mat('#3c5560'),-8+i*.7,-.022,1.4);for(let i=0;i<8;i++)box(17,.003,.012,mat('#344c56'),0,-.018,-2+i*1.0);
 // Wall is built around actual window openings, so the exterior has depth.
 box(18,1.12,.20,wall,0,.55,-2.4);box(18,.62,.20,wall,0,3.96,-2.4);
 for(const x of[-7.5,-3.55,.65,4.85,8])box(.32,2.9,.32,steel,x,2.25,-2.4);
 const outside=new THREE.Mesh(new THREE.PlaneGeometry(18,6),new THREE.MeshBasicMaterial({map:texture(panorama)}));outside.position.set(.3,2.5,-4.8);scene.add(outside);
 for(const center of[-5.55,-1.45,2.75,6.55]){
  box(3.9,.065,.15,steel,center,1.17,-2.22);box(3.9,.055,.15,steel,center,3.66,-2.22);
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(3.8,2.4),new THREE.MeshPhysicalMaterial({color:'#769b9d',transparent:true,opacity:.075,roughness:.18,depthWrite:false}));glass.position.set(center,2.42,-2.29);scene.add(glass);
  box(3.3,.018,.018,new THREE.MeshBasicMaterial({color:'#779c9b'}),center,3.32,-2.20);
 }
 const seat=new THREE.MeshStandardMaterial({map:textile('#527a7e'),roughness:.95});
 box(14,.35,1.15,trim,0,.70,-1.4);box(14,.12,1.14,seat,0,.91,-1.4);box(14,.78,.15,seat,0,1.38,-2.02);box(14,.045,.08,steel,0,1.80,-1.98);
 for(let x=-6.4;x<7;x+=1.15){box(.025,.77,.02,trim,x,1.38,-1.92);box(.025,.012,1.0,trim,x,.977,-1.4);}
 for(const x of[-6,-3,0,3,6])box(.09,.65,.13,trim,x,.3,-1.4);
 // Small door frame at one end; handles, ribbed vent and luggage are quiet details.
 box(1.6,3.9,.16,trim,-8.0,1.9,-2.15);box(1.38,3.6,.06,wood,-8.0,1.9,-2.03);box(.9,1.7,.04,dark,-8,2.55,-1.97);box(.045,.55,.04,steel,-7.55,1.45,-1.94);
 for(let i=0;i<20;i++)box(.035,.28,.03,trim,-6+i*.16,.36,-2.24);
 for(const x of[-4.5,4.1])pole(x,.32);
 const lampMat=new THREE.MeshStandardMaterial({color:'#eadab4',emissive:'#f2d4a0',emissiveIntensity:1.35});for(const x of[-4,2.8]){box(4.1,.07,.32,dark,x,4.11,-.6);box(3.9,.035,.23,lampMat,x,4.06,-.6);}
 for(const x of[-3.2,-1.7,1.7,3.2]){box(.025,.52,.025,steel,x,3.76,-.3);const loop=new THREE.Mesh(new THREE.TorusGeometry(.14,.024,6,4),steel);loop.rotation.z=Math.PI/4;loop.position.set(x,3.38,-.3);scene.add(loop);}
 // Billboard sprite keeps its actual low-resolution square pixels in the lit set.
 // A seated sprite uses a body layer on the cushion and a leg/scarf layer
 // just before the seat lip. One flat plane would either clip the feet or float.
 const upper=surface(64,64),lower=surface(64,64);upper.getContext('2d').drawImage(sprite,0,0);upper.getContext('2d').clearRect(0,44,64,20);lower.getContext('2d').drawImage(sprite,0,0);lower.getContext('2d').clearRect(0,0,64,44);
 const actorMap=texture(upper);const actor=new THREE.Mesh(new THREE.PlaneGeometry(2.25,2.25),new THREE.MeshStandardMaterial({map:actorMap,transparent:true,alphaTest:.5,side:THREE.DoubleSide,roughness:1}));actor.position.set(-1.45,1.35,-1.2);actor.rotation.y=.15;actor.castShadow=true;actor.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:actorMap,alphaTest:.5});scene.add(actor);
 const legMap=texture(lower),legs=new THREE.Mesh(new THREE.PlaneGeometry(2.25,2.25),new THREE.MeshStandardMaterial({map:legMap,transparent:true,alphaTest:.5,side:THREE.DoubleSide,roughness:1}));legs.position.copy(actor.position);legs.position.z+=.65;legs.rotation.copy(actor.rotation);legs.castShadow=true;legs.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:legMap,alphaTest:.5});scene.add(legs);
 // Soft printed contact shade under the sprite, plus real sprite shadows.
 box(.65,.48,.32,mat('#6c776d'),.8,1.18,-1.20);box(.68,.05,.35,mat('#8e9783'),.8,1.43,-1.2);const handle=new THREE.Mesh(new THREE.TorusGeometry(.12,.018,6,12,Math.PI),steel);handle.position.set(.8,1.5,-1.2);scene.add(handle);
 const post=makePost(renderer,scene,camera,W,H,{ssaa:1,ao:true,aoAmt:.65,aoRadius:.16});post.dof.focus=camera.position.distanceTo(actor.position);post.dof.aper=48;post.dof.maxCoc=7;post.bloom.strength=.21;post.bloom.threshold=1.1;post.vig.uniforms.amt.value=.38;post.vig.uniforms.warm.value=.12;
 return ()=>{
  post.composer.render();const c=overlay.getContext('2d');c.setTransform(W/1920,0,0,H/1080,0,0);c.clearRect(0,0,1920,1080);
  // The lyric panel borrows the set's pale brass and dark blue, without an
  // unrelated karaoke colour or an oversize pop caption.
  c.fillStyle='rgba(16,34,46,.90)';c.fillRect(250,925,1420,100);c.strokeStyle='rgba(188,190,159,.65)';c.lineWidth=1;c.strokeRect(251,926,1418,98);
  c.fillStyle='#d6cfa8';for(const x of[250,1667])for(const y of[925,1022])c.fillRect(x,y,3,3);
  c.font='500 44px Lyric';c.textAlign='center';c.fillStyle='#ece2c5';c.fillText(lyric,960,991);
 };
}
const render=mode==='pixel'?purePixel():hd();
window.render=render;window.DUR=1;window.READY=true;render(0);
