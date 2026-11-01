"""Original three-part score and frame-timed foley; no stock music or TTS."""
from pathlib import Path
import os,sys,json
import numpy as np
import soundfile as sf
HERE=Path(__file__).resolve().parent
LIB=Path(os.environ.get('LEMO_OPUSCAR_HOME',r'C:\Users\Lenovo\lemo-opuscar'))
sys.path.insert(0,str(LIB/'core'/'audio'))
import sfx
SR=48000
timeline=json.loads((HERE/'timeline.json').read_text(encoding='utf-8'))
N=round(timeline['duration']*SR);buf=np.zeros((N,2));rng=np.random.default_rng(98)
def add(x,at,gain=.1,pan=0):sfx.add(buf,np.asarray(x,dtype=np.float32),at,gain,pan)
def note(f,d=.45,kind=0):
 t=np.arange(round(d*SR))/SR;env=np.minimum(t/.005,1)*np.exp(-t/(.23 if kind<2 else .5))
 if kind==0:x=sum(a*np.sin(2*np.pi*f*n*t)*np.exp(-t*n*.4) for n,a in [(1,1),(2,.4),(3,.15),(4,.05)])
 elif kind==1:x=np.sin(2*np.pi*f*t+2*np.sin(2*np.pi*f*3*t)*np.exp(-t*12))
 else:x=np.sin(2*np.pi*f*t)+.22*np.sin(2*np.pi*f*2*t)+.1*np.sin(2*np.pi*f*3*t)
 return x*env
def kick():
 t=np.arange(round(.26*SR))/SR
 return np.sin(2*np.pi*(47*t+4*(1-np.exp(-t*32))))*np.exp(-t*22)
def quiet(at):return any(a<=at<b for a,b in timeline['silences'])
notes=[329.628,391.995,493.883,587.33,659.255,493.883,391.995,293.665]
for i in range(40):
 at=i*.5;part=0 if at<6 else 1 if at<12 else 2
 if quiet(at):continue
 add(note(notes[i%8],.65,part),at,.065,(-1)**i*.3)
 if part==0:
  add(note(82.407 if i%4<2 else 97.999,.4),at,.075)
  if i%2:add(note(notes[(i+2)%8]*.5,.28),at+.25,.04,.4)
 elif part==1:
  add(note(notes[(i+3)%8]*2,.8,1),at+.25,.035,(-1)**i*.6)
  if i%2==0:
   for f in [164.814,195.998,246.942]:add(note(f,1.2,2),at,.025)
 else:
  add(kick(),at,.14)
  add(note(82.407 if i%8<4 else 110, .6,2),at,.09)
  if at<18:
   add(sfx.hp(sfx.noise(.045),7000)*np.exp(-np.arange(2160)/SR*100),at+.25,.018,(-1)**i*.5)
# Projector motor, early print texture and footfalls follow visible movement.
t=np.arange(6*SR)/SR
motor=(np.sin(2*np.pi*47*t)+.25*np.sin(2*np.pi*94*t))*(.4+.6*(np.sin(2*np.pi*12*t)**8))
add(motor,0,.006)
for at in np.arange(.3,5.4,.27):add(sfx.step(.5),float(at),.055,(-1)**round(at*4)*.2)
for at in [6.2,6.6,7.0,7.4,9.8,10.2,10.6,11.0]:add(sfx.step(.45),at,.04)
for ev in timeline['events']:
 at,kind=ev['t'],ev['type']
 if kind in ['glint','catch']:add(sfx.ding(),at,.11)
 elif kind=='roll':
  for j in range(14):add(sfx.click(.65+j*.01),at+j*.105,.025)
 elif kind=='dodge':add(note(155.563,.25),at,.1)
 elif kind in ['paper','flutter','whoosh']:add(sfx.whoosh(.4),at,.075)
 elif kind in ['open','city']:add(sfx.thump(f=65),at,.17)
 elif kind=='jump':
  d=.35;tt=np.arange(round(d*SR))/SR;add(np.sin(2*np.pi*(320*tt+700*tt*tt))*np.sin(np.pi*tt/d),at,.055)
 elif kind=='land':add(sfx.thump(f=130),at,.14);add(sfx.clack(1.8),at,.045)
 elif kind=='glide':add(sfx.whoosh(1.0),at,.08)
 elif kind=='chord':
  for f in [164.814,246.942,329.628,391.995,493.883]:add(note(f,2.5,2),at,.05)
for a,b in timeline['silences']:buf[int(a*SR):int(b*SR)]*=.015
buf[-SR:]*=np.linspace(1,0,SR)[:,None]
buf=np.tanh(buf)
for channel in range(2):buf[:,channel]=sfx.limit(buf[:,channel],ceil=.12,look=.005)
out=HERE/'out';out.mkdir(exist_ok=True);sf.write(out/'mix.wav',buf,SR,subtype='PCM_24');print('Score:',out/'mix.wav')
