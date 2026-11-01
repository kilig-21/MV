"""Original deterministic minimal electronic score using repository foley helpers."""
import json, os, sys
from pathlib import Path
import numpy as np
import soundfile as sf

HERE=Path(__file__).resolve().parent
LIB=Path(os.environ.get('LEMO_OPUSCAR_HOME', r'C:\Users\Lenovo\lemo-opuscar'))
sys.path.insert(0,str(LIB/'core'/'audio'))
import sfx
timeline=json.loads((HERE/'timeline.json').read_text(encoding='utf-8'))
SR=48000
N=int(timeline['duration']*SR)
buf=np.zeros((N,2),dtype=np.float64)
rng=np.random.default_rng(2710)
def add(x,at,gain=1,pan=0):sfx.add(buf,np.asarray(x,dtype=np.float32),at,gain,pan)
def tone(f,d=.25):
    t=np.arange(round(d*SR))/SR
    return (np.sin(2*np.pi*f*t)+.25*np.sin(2*np.pi*2*f*t))*np.exp(-t/ .10)*np.minimum(t/.003,1)
def kick():
    t=np.arange(int(.22*SR))/SR
    return np.sin(2*np.pi*(48*t+4*(1-np.exp(-t*30))))*np.exp(-t*24)
def hat():
    t=np.arange(int(.045*SR))/SR
    return sfx.hp(rng.standard_normal(len(t)),6500)*np.exp(-t*120)
def quiet(at):return any(a<=at<b for a,b in timeline['silences'])
for i in range(1,28):
    at=i*.5
    if quiet(at):continue
    add(kick(),at,.20)
    add(tone(110 if i%8<4 else 146.832,d=.32),at,.15)
    if at>=4:add(hat(),at+.25,.018,(-1)**i*.35)
    if at>=1.5:
        notes=[440,554.365,659.255,830.609,659.255,554.365]
        add(tone(notes[i%6],.35),at,.06,(-1)**i*.45)
        if 4<=at<6.5 or 9<=at<11:add(tone(notes[(i+2)%6]*.5,.18),at+.25,.035,(-1)**(i+1)*.3)
for ev in timeline['events']:
    at,kind=ev['t'],ev['type']
    if kind=='stamp':add(sfx.thump(f=95),at,.23);add(sfx.clack(.85),at,.18)
    elif kind=='snap':add(sfx.clack(1.25),at,.08,(at%1-.5)*.5)
    elif kind=='line':add(sfx.hp(sfx.noise(.22),4000)*np.linspace(.05,0,10560),at,.18)
    elif kind=='paper':add(sfx.whoosh(.35),at,.035)
    elif kind=='cut':add(sfx.click(1.5),at,.10)
    elif kind=='lead':add(tone(830.609,.45),at,.04,.4)
    elif kind=='glide':
        t=np.arange(int(SR*.95))/SR
        glide=np.sin(2*np.pi*(330*t+110*t*t))*np.sin(np.pi*t/.95)**2
        add(glide,at,.065)
# Chord arrives on final title. Short tails, no stock samples or borrowed melody.
for f in [220,277.183,329.628,440]:add(tone(f,1.8),11,.055)
for a,b in timeline['silences']:
    a0,b0=int(a*SR),int(b*SR);buf[a0:b0]*=.01
# Very quiet mechanical room tone; two gaps remain near-silent.
bed=sfx.lp(rng.standard_normal(N),1800)*.00006
buf+=bed[:,None]
buf[-2400:]*=np.linspace(1,0,2400)[:,None]
buf=np.tanh(buf*.8)
for channel in range(2):
    buf[:,channel]=sfx.limit(buf[:,channel],ceil=.085,look=.004)
out=HERE/'out';out.mkdir(exist_ok=True)
sf.write(out/'mix.wav',buf,SR,subtype='PCM_24')
print('Original score and synchronized foley:',out/'mix.wav')
