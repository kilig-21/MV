import {surface,r} from './pixel-assets.js';

// One compact silhouette: no articulated elbows, knees, palms or shoes.
// Body 48x31, side arms 5x11, four feet 4x8. The complete sprite hops.
export function clawd(c,x,sole,{scale=1,eyes='normal',look=0,tuck=0,squash=1}={}){
 const a=surface(64,53),d=a.getContext('2d');
 const footY=39-Math.round(tuck*2);
 for(const [i,fx]of[0,1,2,3].map((i)=>[i,[17,24,41,48][i]])){
  r(d,fx,footY,4,8,'#a65a43');r(d,fx+1,footY,3,7,i%2?'#dd8c65':'#c77956');
 }
 r(d,5,22,5,11,'#a65a43');r(d,6,22,4,10,'#d1835e');
 r(d,56,22,5,11,'#a65a43');r(d,56,22,4,10,'#da8962');
 r(d,9,9,48,31,'#a65a43');r(d,10,9,46,30,'#d97757');
 r(d,11,10,43,2,'#e7a17a');r(d,11,12,40,25,'#dd8863');r(d,52,12,4,26,'#c66d50');
 // Existing A accessories remain small and do not change the body outline.
 r(d,11,37,44,3,'#42677c');r(d,13,37,39,1,'#71919b');r(d,47,40,4,5,'#42677c');
 r(d,11,7,44,2,'#293d47');r(d,9,9,2,16,'#293d47');r(d,55,9,2,16,'#293d47');
 r(d,7,20,5,9,'#293d47');r(d,8,22,3,5,'#75918e');r(d,54,20,5,9,'#293d47');r(d,55,22,3,5,'#75918e');
 for(const ex of[22,43]){
  if(eyes==='happy'){r(d,ex-1,22,1,3,'#272727');r(d,ex,21,2,1,'#272727');r(d,ex+2,22,1,3,'#272727');}
  else if(eyes==='tired'){r(d,ex,24,3,4,'#272727');}
  else if(eyes==='blink'){r(d,ex,25,3,1,'#272727');}
  else {r(d,ex+look,eyes==='wide'?18:20,3,eyes==='wide'?10:8,'#272727');}
 }
 const w=Math.round(64*scale),h=Math.round(53*scale*squash);
 c.imageSmoothingEnabled=false;
 c.drawImage(a,Math.round(x-w/2),Math.round(sole-47*scale*squash),w,h);
}
