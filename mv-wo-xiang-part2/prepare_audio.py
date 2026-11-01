"""Convert the user-supplied local NCM, without network calls or source changes."""
from pathlib import Path
import sys,types,json,hashlib,shutil,io

HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE.parent/'.tools'/'ncm-deps'))
# ncmdump-py still imports imghdr, removed in Python 3.13. Use Pillow only for
# the compatible image-header query; audio processing is the upstream library.
from PIL import Image
compat=types.ModuleType('imghdr')
def image_type(file=None,h=None):
    try:
        with Image.open(io.BytesIO(h) if h else file) as im:
            return {'JPEG':'jpeg','PNG':'png','GIF':'gif','WEBP':'webp'}.get(im.format)
    except Exception:
        return None
compat.what=image_type
sys.modules['imghdr']=compat
from ncmdump import NeteaseCloudMusicFile

class LocalNCM(NeteaseCloudMusicFile):
    def _try_get_cover_data(self):
        return self._cover_data_size  # Never fetch album artwork from a server.

def sha256(path):
    with Path(path).open('rb') as f:
        return hashlib.file_digest(f,'sha256').hexdigest()

source=Path(sys.argv[1])
lyrics=Path(sys.argv[2])
assets=HERE/'assets';assets.mkdir(exist_ok=True,parents=True)
source_hash=sha256(source)
ncm=LocalNCM(source)
ncm.decrypt()
output=ncm._dump_music(assets/'source-audio')
# Export audio only. Embedded artwork is unnecessary for MV timing and some
# NCM covers have incomplete MIME headers that confuse media probes.
if output.suffix.lower()=='.flac':
    from mutagen.flac import FLAC
    tags=FLAC(output)
    tags.clear_pictures()
    tags.save()
if source_hash!=sha256(source):
    raise RuntimeError('Source file changed during conversion')
shutil.copyfile(lyrics,assets/'lyrics.lrc')
report={'converter':'ncmdump-py 1.1.6','source':str(source),'source_sha256':source_hash,
        'source_unchanged':True,'audio_file':str(output),'audio_sha256':sha256(output),
        'embedded_format':ncm.music_metadata.format,'network_used_for_conversion':False}
(HERE/'audio-preparation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'output':str(output),'format':ncm.music_metadata.format,'source_unchanged':True},ensure_ascii=False))
