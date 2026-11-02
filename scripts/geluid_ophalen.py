"""Geluiden uit data/geluid_keuze.json naar site/klanken/<slug>.mp3 (mono, 96 kbit/s, hooguit 60 s).
Alleen waar host niet false is. Schrijft site/data/geluid.json. Heeft ffmpeg nodig.
Omzetten naar mp3 en inkorten is een bewerking; bij CC BY mag dat, met vermelding."""
import json, subprocess, tempfile, urllib.request
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
UA = "Mozilla/5.0 (de-ruimte; github.com/sterrenstofai)"
keuze = {k: v for k, v in json.loads((ROOT / "data" / "geluid_keuze.json").read_text()).items() if not k.startswith("_")}
doel = ROOT / "site" / "klanken"; doel.mkdir(parents=True, exist_ok=True)
uit = {}
for slug, lijst in keuze.items():
    uit[slug] = []
    for n, g in enumerate(lijst):
        g = dict(g)
        if g.get("host", True):
            naam = f"{slug}{'' if n == 0 else '-' + str(n)}.mp3"
            if not (doel / naam).exists():
                with tempfile.NamedTemporaryFile(suffix=Path(g["bestand"]).suffix) as t:
                    t.write(urllib.request.urlopen(urllib.request.Request(g["bestand"], headers={"User-Agent": UA}), timeout=120).read()); t.flush()
                    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", t.name, "-t", "60", "-ac", "1", "-b:a", "96k", str(doel / naam)], check=True)
            duur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(doel / naam)], capture_output=True, text=True).stdout)
            g.update(pad=f"/klanken/{naam}", duur=round(duur, 1), ingekort=duur >= 59.5)
        uit[slug].append(g)
        print(slug, g.get("pad", "(link)"), g.get("duur", ""))
(ROOT / "site" / "data" / "geluid.json").write_text(json.dumps(uit, ensure_ascii=False, indent=1))
