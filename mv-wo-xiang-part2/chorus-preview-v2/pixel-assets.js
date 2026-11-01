import {mulberry} from '/core/lib.js';
export function surface(w,h){const a=document.createElement('canvas');a.width=w;a.height=h;return a;}
export function r(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
export function path(c,p,color){c.fillStyle=color;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
const palette=['#152a39','#1e3545','#2c4a55','#385a62','#567979','#809a8d','#aab5a0','#e8d4a2'];
export function hero(){
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
export function carriage(t){const a=surface(320,180),c=a.getContext('2d');c.imageSmoothingEnabled=false;
 r(c,0,0,320,180,'#182e3b');
 // Ceiling, sidewall and door recesses establish a lived-in carriage.
 path(c,[[0,0],[320,0],[320,15],[0,23]],'#263f49');r(c,0,16,320,115,'#718b83');r(c,0,20,320,3,'#b3b9a0');r(c,0,119,320,20,'#4b6b69');
 r(c,50,27,253,77,'#1b303c');r(c,53,30,247,71,'#a4b19c');r(c,55,32,243,67,'#263e49');c.save();c.beginPath();c.rect(55,32,243,67);c.clip();const dx=Math.floor(t*10)%243;c.drawImage(panorama,55-dx,32,243,67);c.drawImage(panorama,298-dx,32,243,67);c.restore();
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

return a;}
