import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {lerp,clamp,mulberry} from '/core/lib.js';
const timeline=await fetch('./timeline.json').then(r=>r.json());
const W=innerWidth,H=innerHeight,rand=mulberry(271027),scene=new T.Scene();
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setSize(W,H);renderer.setPixelRatio(1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.outputColorSpace=T.SRGBColorSpace;
document.body.prepend(renderer.domElement);
const overlay=document.querySelector('#overlay');overlay.width=W;overlay.height=H;const ctx=overlay.getContext('2d');
const camera=new T.PerspectiveCamera(39,W/H,.1,180);
const ambient=new T.HemisphereLight('#fff4d8','#6f6761',2.1);scene.add(ambient);
const key=new T.DirectionalLight('#fff1d1',4);key.position.set(-5,10,9);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-16;key.shadow.camera.right=16;key.shadow.camera.top=14;key.shadow.camera.bottom=-12;key.shadow.bias=-.0005;key.shadow.normalBias=.025;key.shadow.radius=3;scene.add(key);
const rim=new T.DirectionalLight('#f2d8c4',2);rim.position.set(8,5,-7);scene.add(rim);
const fill=new T.PointLight('#ffd8b0',20,26);fill.position.set(0,4,5);scene.add(fill);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new T.Vector2(W,H),.25,.6,.9);composer.addPass(bloom);composer.addPass(new OutputPass());
const mat=(color,roughness=.85,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
const emit=(color,power=1)=>new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:power,roughness:.35});
function mesh(g,m,parent,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(p,w,h,d,m,x=0,y=0,z=0){return mesh(new T.BoxGeometry(w,h,d),m,p,x,y,z);}
function round(p,w,h,d,r,m,x=0,y=0,z=0){return mesh(new RoundedBoxGeometry(w,h,d,4,r),m,p,x,y,z);}
function cyl(p,top,bot,h,m,x=0,y=0,z=0,n=24){return mesh(new T.CylinderGeometry(top,bot,h,n),m,p,x,y,z);}
const worlds=[new T.Group(),new T.Group(),new T.Group()];worlds.forEach(g=>scene.add(g));
const clay=mat('#d97757',.56),claySide=mat('#b86046',.7),eye=mat('#171717',.22),highlight=mat('#f3ac84',.55);
const hero=new T.Group();scene.add(hero);
const body=new T.Group();hero.add(body);round(body,3.7,2.35,.92,.19,clay,0,2.05,0);
const eyes=[];for(const x of[-.86,.86]){const g=new T.Group();g.position.set(x,2.26,.487);body.add(g);round(g,.19,.62,.065,.045,eye);round(g,.045,.13,.02,.012,mat('#716459',.2),-.042,.18,.038);eyes.push(g);}
const arms=[];for(const side of[-1,1]){const pivot=new T.Group();pivot.position.set(side*1.88,2.4,0);body.add(pivot);round(pivot,.48,1.08,.65,.10,clay,side*.12,-.45,0);arms.push(pivot);}
const feet=[];for(let i=0;i<4;i++){const pivot=new T.Group();pivot.position.set([-1.18,-.65,.65,1.18][i],.9,0);hero.add(pivot);round(pivot,.37,.90,.57,.085,i%2?clay:claySide,0,-.45,0);feet.push(pivot);}
const hat=new T.Group();body.add(hat);cyl(hat,1.2,1.2,.10,eye,0,3.3,0,48);const crown=round(hat,1.75,.65,1.25,.3,eye,0,3.6,0);box(hat,1.8,.14,1.29,mat('#655449'),0,3.38,0);
// A small piece of light is the continuous prop, not a substitute for the character.
const spark=new T.Group();scene.add(spark);const sparkMesh=round(spark,.25,.25,.25,.025,emit('#ffde9f',3));const sparkLight=new T.PointLight('#ffd38b',7,5);spark.add(sparkLight);
const sparkRing=mesh(new T.TorusGeometry(.30,.018,8,32),emit('#ffd38b',1),spark);sparkRing.rotation.x=.6;
// 01. Silent-era miniature street: sepia architecture, slate roofs and a rolling reel.
const silent=worlds[0],stone=mat('#95846a'),pale=mat('#c4b397'),dark=mat('#35302c'),roof=mat('#554a3a');
box(silent,80,.3,38,stone,0,-.28,-5);box(silent,80,.14,5,mat('#b2a187'),0,-.055,0);
for(let r=0;r<4;r++)for(let i=0;i<36;i++)box(silent,1.23,.035,.75,(i+r)%2?mat('#a5947b'):stone,-25+i*1.4+(r%2)*.7,.03,-2+r*.85);
for(let i=0;i<14;i++){let x=-26+i*4.3,h=3.8+rand()*5,z=-8-rand()*5;box(silent,3.7,h,3,pale,x,h/2,z);box(silent,4,.25,3.3,dark,x,h+.15,z);box(silent,3.95,.28,3.4,roof,x,h-.35,z);for(let row=0;row<Math.floor(h/1.4);row++)for(let col=0;col<2;col++){box(silent,.7,.95,.09,dark,x-.8+col*1.6,.9+row*1.4,z+1.56);box(silent,.68,.04,.12,pale,x-.8+col*1.6,.9+row*1.4,z+1.63);}}
for(let i=0;i<9;i++){const x=-20+i*5.5;cyl(silent,.055,.09,5.8,dark,x,2.9,-4,12);box(silent,1.0,.08,.08,dark,x+.42,5.75,-4);const lamp=round(silent,.58,.8,.58,.05,mat('#e9dfcb'),x+.8,5.3,-4);box(silent,.8,.1,.8,dark,x+.8,5.8,-4);}
const reel=new T.Group();silent.add(reel);const reelMat=mat('#3e3930',.35,.6);for(const z of[-.21,.21]){const disk=cyl(reel,.95,.95,.08,reelMat,0,1,z,48);disk.rotation.x=Math.PI/2;for(let j=0;j<5;j++){const a=j*Math.PI*2/5;cyl(reel,.20,.20,.105,mat('#b4a68d'),Math.cos(a)*.55,1+Math.sin(a)*.55,z+.06,16).rotation.x=Math.PI/2;}}cyl(reel,.5,.5,.40,dark,0,1,0,32).rotation.x=Math.PI/2;reel.children.forEach(o=>o.position.y-=1);
// 02. Folded paper stage on an actual open book and walnut table.
const paper=worlds[1],paperMat=mat('#f7efdc'),green=mat('#53775d'),leaf=mat('#94ac86'),pink=mat('#dca492'),edge=mat('#e1d5b9');
box(paper,80,.8,80,mat('#694737'),0,-1.05,-2);round(paper,26,.30,18,.13,mat('#4c6255'),0,-.55,-1);box(paper,25.7,.23,17.7,edge,0,-.31,-1);box(paper,12.7,.15,17.5,paperMat,-6.4,-.12,-1);box(paper,12.7,.15,17.5,paperMat,6.4,-.12,-1);box(paper,.07,.18,17.5,mat('#b7aa90'),0,-.1,-1);
// River printed on the page; stepping stones have visible pale card edges.
const water=mat('#7eb1ba',.9);box(paper,3.2,.026,17.1,water,0,.013,-1);for(let i=0;i<18;i++)box(paper,.25+rand()*.8,.03,.035,mat('#bfdee1'),-.9+rand()*1.8,.033,-8+rand()*15);
for(const x of[-1.2,0,1.2])round(paper,.78,.12,1.05,.12,pale,x,.12,0);
const trees=[];
function paperTree(x,z,h,col){const tree=new T.Group();tree.position.set(x,0,z);paper.add(tree);box(tree,.18,h*.6,.10,mat('#89735c'),0,h*.3,0);const shape=new T.Shape();shape.moveTo(-h*.34,h*.24);shape.lineTo(0,h);shape.lineTo(h*.34,h*.24);shape.closePath();const g=new T.ExtrudeGeometry(shape,{depth:.08,bevelEnabled:false});const card=mesh(g,mat(col),tree);card.castShadow=true;const fold=new T.Shape();fold.moveTo(0,h*.24);fold.lineTo(0,h);fold.lineTo(h*.34,h*.24);fold.closePath();mesh(new T.ShapeGeometry(fold),mat('#c1caa4'),tree,0,0,.095);box(tree,h*.42,.04,.26,paperMat,0,.025,.06);trees.push(tree);}
for(let i=0;i<24;i++){const x=-12+rand()*24,z=-8+rand()*5;if(Math.abs(x)<2.7&&z>-5)continue;paperTree(x,z,3.5+rand()*4,['#6d8b71','#8da583','#b0bb8e','#d8b19b'][i%4]);}
for(const x of[-10,-7,7,11])paperTree(x,3.3,4.3,x<0?'#63806b':'#9eaf80');
const sun=cyl(paper,1.4,1.4,.08,mat('#e2bd7d'),5,6,-8,48);sun.rotation.x=Math.PI/2;
const moth=new T.Group();paper.add(moth);const wingShape=new T.Shape();wingShape.moveTo(0,0);wingShape.lineTo(.8,.55);wingShape.lineTo(.55,-.35);wingShape.closePath();const wings=[];for(const side of[-1,1]){const wing=mesh(new T.ShapeGeometry(wingShape),new T.MeshStandardMaterial({color:side<0?'#e6b49d':'#efd3ab',side:T.DoubleSide}),moth);wing.scale.x=side;wings.push(wing);}box(moth,.06,.4,.08,mat('#927154'));
// 03. Neon rooftop: high-density layered skyline, illuminated windows, railings and reflected strips.
const city=worlds[2],night=mat('#22283c',.3,.4),concrete=mat('#35435b',.62),cyan=emit('#49cbe6',2),magenta=emit('#ee62a4',1.8),warm=emit('#f2c785',1.2);
box(city,100,.5,65,night,0,-.5,-14);box(city,30,.35,10,mat('#334059',.22,.45),0,-.08,0);box(city,30,.09,.18,cyan,0,.15,-4.9);box(city,30,.09,.18,magenta,0,.15,4.9);
const windows=[];
for(let i=0;i<40;i++){const x=-43+rand()*86,z=-8-rand()*35,h=3+rand()*21,w=2+rand()*3.4;box(city,w,h,2.8,mat(['#18203a','#24314b','#30334c'][i%3]),x,h/2,z);box(city,w+.1,.12,2.9,i%3?cyan:magenta,x,h+.03,z);for(let y=1;y<h-.6;y+=1.25)for(let dx=-w/2+.35;dx<w/2-.1;dx+=.65){if(rand()<.22)continue;const o=box(city,.23,.49,.055,rand()<.65?cyan:warm,x+dx,y,z+1.44);windows.push(o);}}
for(let i=0;i<22;i++){const x=-15+i*1.4;box(city,.05,1.0,.05,concrete,x,.7,-4.5);}box(city,30,.065,.065,cyan,0,1.25,-4.5);
for(let i=0;i<15;i++){const x=-12+rand()*24;box(city,.10,.012,1.1+rand()*2.5,i%2?cyan:magenta,x,.102,-3+rand()*7);}
const platform=new T.Group();city.add(platform);round(platform,5.3,.26,2.5,.18,mat('#526179',.25,.6),0,.03,0);box(platform,4.7,.06,.08,cyan,0,-.03,1.24);for(const x of[-1.8,1.8]){cyl(platform,.24,.42,.22,cyan,x,-.22,0);}
const moon=mesh(new T.SphereGeometry(1.3,24,16),emit('#d7def5',.6),city,12,17,-35);
const snowGeo=new T.BufferGeometry(),snowPositions=new Float32Array(180*3);for(let i=0;i<180;i++){snowPositions[i*3]=-22+rand()*44;snowPositions[i*3+1]=rand()*18;snowPositions[i*3+2]=-12+rand()*22;}const snowBase=snowPositions.slice();snowGeo.setAttribute('position',new T.BufferAttribute(snowPositions,3));const snow=new T.Points(snowGeo,new T.PointsMaterial({color:'#dbe1ec',size:.035,transparent:true,opacity:.7}));city.add(snow);
// Soft floating dust provides atmospheric depth without masking the subject.
const ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};const seg=(t,a,b)=>clamp((t-a)/(b-a),0,1);
const V=(x,y,z)=>new T.Vector3(x,y,z);
function pose(t,walk=0,jump=0,wave=0){
 hero.scale.set(1,1,1);hero.rotation.set(0,0,0);body.rotation.set(0,0,0);body.position.set(0,0,0);
 const phase=t*11;body.position.y=Math.abs(Math.sin(phase))*.09*walk;body.rotation.z=Math.sin(phase)*.025*walk;
 feet.forEach((p,i)=>{p.rotation.x=Math.sin(phase+(i%2)*Math.PI)*.55*walk;p.rotation.z=0;p.position.y=.9+Math.max(0,Math.sin(phase+(i%2)*Math.PI))*.16*walk;});
 arms.forEach((p,i)=>{p.rotation.z=(i===0?-1:1)*(.12+wave*.95);p.rotation.x=Math.sin(phase+i*Math.PI)*.3*walk;});
 if(wave){arms[1].rotation.z=1.7+Math.sin(t*9)*.35*wave;}
 const blink=[1.1,3.6,6.4,10.7,13.2,16.8,19.4].some(v=>Math.abs(t-v)<.075);eyes.forEach(p=>p.scale.y=blink?.12:1);
}
function cameraAt(pos,target,fov=39){camera.position.copy(pos);camera.lookAt(target);camera.fov=fov;camera.updateProjectionMatrix();}
function draw(t){
 const phase=t<6?0:t<12?1:2,u=t-phase*6;
 worlds.forEach((g,i)=>g.visible=i===phase);hat.visible=phase===0;
 scene.background=new T.Color(phase===0?'#c8b99e':phase===1?'#e8dfcd':'#171a30');
 scene.fog=new T.Fog(phase===0?'#c8b99e':phase===1?'#e8dfcd':'#171a30',phase===2?28:25,phase===2?90:70);
 ambient.intensity=phase===2?1.25:2.1;ambient.color.set(phase===2?'#adb8df':'#fff1d5');
 key.color.set(phase===2?'#ffd2aa':'#fff0d4');key.intensity=phase===2?3.2:4;rim.color.set(phase===2?'#d057ba':'#ede4c9');rim.intensity=phase===2?4:1.7;
 fill.color.set(phase===2?'#ffd7b4':'#f8dbb1');fill.intensity=phase===2?35:14;
 bloom.strength=phase===2?.55:.12;bloom.threshold=phase===2?.75:1.2;
 pose(t,phase===0?1:phase===1?(u<1.6||u>4?1:.2):.12,0,phase===2&&u>4?1:phase===1&&u>4?.7:0);
 if(phase===0){
  const x=-3+u*1.05;hero.position.set(x,0,0);hero.rotation.y=-.12;
  if(u<2){hero.rotation.y=lerp(-.20,.18,ease(u/2));cameraAt(V(x+3.8,4.3,12-u*.55),V(x,1.8,0));}
  else if(u<4){cameraAt(V(x+4.8,2.8,11.5),V(x+.5,1.5,0),43);const dodge=Math.sin(seg(u,2.3,3.4)*Math.PI);body.rotation.z=-dodge*.22;hero.position.z=-dodge*.65;arms[0].rotation.z=.2+dodge*.8;}
  else cameraAt(V(x+4.8,4.1,13.2),V(x+1,1.9,0),40);
  reel.position.set(lerp(7,-8,seg(u,1.6,4)),1,1.5);reel.rotation.z=u*3.0;
  spark.position.set(x+3+Math.sin(u*1.5)*.6,3.6+Math.sin(u*2)*.45,.3);
 }
 if(phase===1){
  let x=lerp(-5.2,-2.2,ease(u/1.8)),y=0;
  if(u>=2.1&&u<3.5){let p=seg(u,2.1,3.5);x=lerp(-2.2,2.4,p);y=Math.sin(p*Math.PI)*2.4;hero.rotation.z=-.08;feet.forEach((f,i)=>{f.rotation.z=(i<2?-1:1)*.28;});arms[0].rotation.z=-.8;arms[1].rotation.z=.8;}
  if(u>=1.85&&u<2.1){const q=seg(u,1.85,2.1);hero.scale.set(1+q*.1,1-q*.14,1);}
  if(u>=3.5){x=lerp(2.4,5.2,seg(u,3.5,6));const q=Math.sin(seg(u,3.5,3.85)*Math.PI);hero.scale.set(1+q*.12,1-q*.16,1);}
  hero.position.set(x,y,.0);hero.rotation.y=.08;
  trees.forEach((tree,i)=>{tree.rotation.x=-(1-ease(seg(u,.03+(i%4)*.1,.65+(i%4)*.1)))*1.3;tree.rotation.z=Math.sin(t*1.4+i)*.018;});
  moth.position.set(x+2,4.8+Math.sin(u*2)*.6,-.4);wings.forEach((w,i)=>w.rotation.y=Math.sin(t*12)*(i?1:-1)*.9);
  spark.position.set(x+2.7,4.0+Math.sin(u*1.8)*.5,.2);
  if(u<2)cameraAt(V(x+7,7.8,13.8),V(x,1.4,-1),43);
  else if(u<4)cameraAt(V(x+4.1,4.6+y*.28,12),V(x+.3,2+y*.45,0),42);
  else cameraAt(V(x+5-3*seg(u,4,6),4.7,12),V(x,2,0),39);
 }
 if(phase===2){
  const x=lerp(-5,4.2,ease(seg(u,0,5.5)));const hover=.36+Math.sin(t*2)*.075;
  hero.position.set(x,hover+.18,0);hero.rotation.y=-.10;platform.position.set(x,hover,0);
  spark.position.set(x+lerp(3.5,2.7,ease(seg(u,1.6,4))),lerp(4.2,3.25,ease(seg(u,1.6,4)))+Math.sin(t*3)*.08,.5);
  if(u<2)cameraAt(V(x+4.8,3.7,13.4+u*.6),V(x+.3,2.0,0),40);
  else if(u<4)cameraAt(V(x+4,4.3,12.8),V(x+.3,2.2,0),39);
  else if(u<6)cameraAt(V(x+3.0,4.1,lerp(12.8,10.5,ease(seg(u,4,6)))),V(x+.3,2.2,0),39);
  else {hero.rotation.y=lerp(-.1,.12,ease(seg(u,6,7)));cameraAt(V(x+1.8,3.6,12.5),V(x-1.6,2,0),43);}
  windows.forEach((o,i)=>{o.visible=i%4!==0||u>2+(i%7)*.25;});
  const arr=snow.geometry.attributes.position.array;for(let i=0;i<180;i++){arr[i*3+1]=(snowBase[i*3+1]+24-t*.8)%18;}snow.geometry.attributes.position.needsUpdate=true;
 }
 spark.rotation.set(t*.6,t*.7,t*.4);sparkRing.rotation.y=t*1.6;
 key.target.position.set(hero.position.x,1,0);scene.add(key.target);fill.position.x=hero.position.x+1;
 composer.render();
 ctx.setTransform(W/1920,0,0,H/1080,0,0);ctx.clearRect(0,0,1920,1080);
 // Cinemascope mattes and a quiet optical vignette.
 const vg=ctx.createRadialGradient(960,500,250,960,540,1130);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.40)');ctx.fillStyle=vg;ctx.fillRect(0,0,1920,1080);
 if(phase===0){const frame=Math.floor(t*24);ctx.fillStyle=`rgba(255,235,195,${.018+.014*Math.sin(frame*1.7)})`;ctx.fillRect(0,0,1920,1080);ctx.strokeStyle='rgba(245,228,195,.14)';ctx.lineWidth=1;for(let i=0;i<3;i++){const x=(frame*13+i*577)%1920;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+5,1080);ctx.stroke();}}
 ctx.fillStyle='#111016';ctx.fillRect(0,0,1920,92);ctx.fillRect(0,988,1920,92);
 ctx.fillStyle='#e7d8b8';ctx.font='400 25px Film';ctx.fillText(`${phase+1} / 3`,96,62);ctx.font='700 25px Film';ctx.fillText('ANIMA',1690,62);
 if(t>=18){const p=ease(seg(t,18,18.4));ctx.save();ctx.beginPath();ctx.rect(110,360,1000*p,360);ctx.clip();ctx.fillStyle='#f8ecd4';ctx.font='900 74px Film';ctx.fillText('让想法，',110,470);ctx.fillText('动起来。',110,580);ctx.restore();}
 // Brief foreground shutter at the cuts. It is a moving object, not a dissolve.
 for(const cut of[6,12]){if(Math.abs(t-cut)<.22){const p=(t-(cut-.22))/.44;ctx.fillStyle=cut===6?'#312b24':'#18362d';const x=lerp(-2000,1920,p);ctx.fillRect(x,92,2000,896);}}
}
window.DUR=timeline.duration;window.EV=timeline.events;window.TEXTS=t=>[{id:'chapter',text:`${t<6?1:t<12?2:3} / 3`,x0:96,y0:25,x1:240,y1:75},{id:'name',text:'ANIMA',x0:1690,y0:25,x1:1840,y1:75},...(t>=18.4?[{id:'title',text:'让想法，动起来。',x0:110,y0:380,x1:790,y1:620}]:[])];
await Promise.all([400,700,900].map(w=>document.fonts.load(`${w} 74px Film`,'ANIMA让想法，动起来。123/')));
window.render=draw;window.READY=true;draw(0);
