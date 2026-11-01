"""Compare the provided song and MV locally, without speech uploads."""
import json
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import fftconvolve

HERE=Path(__file__).resolve().parent
p=HERE/'out'/'alignment'
song,sr=sf.read(p/'song.wav')
mv,mv_sr=sf.read(p/'mv.wav')
assert sr==mv_sr
n=sr*3
energy=np.r_[0,np.cumsum(song*song)]
denom=np.sqrt(np.maximum(energy[n:]-energy[:-n],1e-12))
matches=[]
for t in [30,60,90,120,150,180,210,240]:
    q=mv[t*sr:t*sr+n]
    q=q-q.mean()
    cor=fftconvolve(song,q[::-1],mode='valid')/(denom*np.linalg.norm(q))
    i=int(np.argmax(np.abs(cor)))
    matches.append({'mv_seconds':t,'song_seconds':round(i/sr,4),'correlation':round(float(cor[i]),4)})
report={'sample_rate':sr,'matches':matches}
(p/'matches.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
