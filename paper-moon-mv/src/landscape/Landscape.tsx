import React from 'react';
import {AbsoluteFill,Audio,Composition,Folder,Sequence,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {Defs} from './PaperWorld';
import {Sail,Alone,Thoughts,Courage,Harbor,Goodbye,Gratitude,InYourEyes,End} from './Scenes';
import lyrics from './lyrics.json';

const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const SceneLayer:React.FC<{children:React.ReactNode;fade?:boolean}>=({children,fade=true})=>{
 const frame=useCurrentFrame();
 const opacity=fade?clamp(frame/10):1;
 return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};
const Lyrics=()=>{
 const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const ms=frame*1000/fps;
 const line=lyrics.find(l=>ms>=l.startMs && ms<l.endMs);
 if(!line)return null;
 const entrance=clamp((ms-line.startMs)/220), exit=clamp((line.endMs-ms)/220);
 const progress=clamp((ms-line.startMs)/(line.endMs-line.startMs));
 return <AbsoluteFill style={{justifyContent:'flex-end',alignItems:'center',paddingBottom:83,pointerEvents:'none'}}>
  <div style={{opacity:Math.min(entrance,exit),transform:`translateY(${(1-entrance)*16}px) scale(${.96+entrance*.04})`,position:'relative',padding:'16px 44px',background:'rgba(9,23,38,.72)',boxShadow:'0 8px 0 rgba(2,9,20,.25), 0 12px 28px rgba(0,0,0,.32)',border:'1px solid rgba(238,218,175,.3)',fontFamily:'Microsoft YaHei, sans-serif',fontSize:48,fontWeight:600,letterSpacing:4,color:'#f5ebd6',whiteSpace:'pre'}}>
   <span>{line.text}</span><span aria-hidden style={{position:'absolute',left:44,top:16,width:`calc((100% - 88px) * ${progress})`,overflow:'hidden',color:'#ffd78b',whiteSpace:'pre'}}>{line.text}</span>
  </div>
 </AbsoluteFill>;
};
const Film=()=>{const {fps}=useVideoConfig();const frame=useCurrentFrame();
 // Existing storyboard uses a 140 BPM beat grid; subtle motion follows it.
 const beat=60/140*fps;const phase=(frame%beat)/beat;const pulse=Math.exp(-phase*8);const zoom=1.012+0.008*pulse;
 return <AbsoluteFill style={{background:'#070f21'}}><Defs/><Audio src={staticFile('song.wav')}/><Audio src={staticFile('paper-effects.wav')} volume={.65}/>
 <AbsoluteFill style={{transform:`scale(${zoom})`,transformOrigin:'center'}}>
 <Sequence name="01 启航 · 六层浪" from={0} durationInFrames={118} premountFor={fps}><SceneLayer fade={false}><Sail/></SceneLayer></Sequence>
 <Sequence name="02 孤夜 · 灯火" from={108} durationInFrames={73} premountFor={fps}><SceneLayer><Alone/></SceneLayer></Sequence>
 <Sequence name="03 想着你 · 念想" from={171} durationInFrames={61} premountFor={fps}><SceneLayer><Thoughts/></SceneLayer></Sequence>
 <Sequence name="04 不惶恐 · 鲸跃" from={222} durationInFrames={100} premountFor={fps}><SceneLayer><Courage/></SceneLayer></Sequence>
 <Sequence name="05 人来人往 · 码头" from={312} durationInFrames={112} premountFor={fps}><SceneLayer><Harbor/></SceneLayer></Sequence>
 <Sequence name="06 离开 · 纸幕" from={414} durationInFrames={115} premountFor={fps}><SceneLayer><Goodbye/></SceneLayer></Sequence>
 <Sequence name="07 感谢 · 天灯" from={519} durationInFrames={97} premountFor={fps}><SceneLayer><Gratitude/></SceneLayer></Sequence>
 <Sequence name="08 你眼中 · 倒影" from={606} durationInFrames={76} premountFor={fps}><SceneLayer><InYourEyes/></SceneLayer></Sequence>
 <Sequence name="09 尾声 · 归月" from={672} durationInFrames={51} premountFor={fps}><SceneLayer><End/></SceneLayer></Sequence>
 </AbsoluteFill>
 <Lyrics/></AbsoluteFill>;
};
export const Landscape=()=> <><Composition id="PaperMoonLandscape" component={Film} width={1920} height={1080} fps={30} durationInFrames={723}/><Folder name="横屏分镜"><Composition id="Sail" component={()=> <><Defs/><Sail/></>} width={1920} height={1080} fps={30} durationInFrames={108}/><Composition id="Whale" component={()=> <><Defs/><Courage/></>} width={1920} height={1080} fps={30} durationInFrames={90}/></Folder></>;
