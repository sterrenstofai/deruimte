"""Kaarten voor de draaiende bollen: ophalen, verkleinen tot 1024x512 en de lijst site/data/bollen.json maken.
Keuze, bron en licentie per hemellichaam staan in data/bollen_keuze.json (nagekeken in docs/bollen-datacheck.md)."""
import io, json, pathlib, urllib.request
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
LABEL = {"echt": "echte kleur", "benaderd": "kleur benaderd", "versterkt": "kleur versterkt", "vals": "valse kleur", "zwart-wit": "zwart-wit"}

def main():
    keuze = json.loads((ROOT / "data" / "bollen_keuze.json").read_text())["lijst"]
    uit_map = ROOT / "site" / "bollen"; uit_map.mkdir(parents=True, exist_ok=True)
    lijst = {}
    for k in keuze:
        req = urllib.request.Request(k["url"], headers={"User-Agent": "deruimte/1.0 (sterrenstof.ai)"})
        data = urllib.request.urlopen(req, timeout=120).read()
        Image.MAX_IMAGE_PIXELS = None
        img = Image.open(io.BytesIO(data)).convert("RGB").resize((1024, 512), Image.LANCZOS)
        pad = uit_map / f"{k['slug']}.jpg"
        img.save(pad, "JPEG", quality=82, optimize=True, progressive=True)
        lijst[k["slug"]] = {"pad": f"/bollen/{k['slug']}.jpg", "label": f"kaart · {LABEL[k['kleur']]}", "kleur": k["kleur"], "uitleg": k["uitleg"],
                            "maker": k["maker"], "licentie": k["licentie"], "bron": k["bron"], "kanteling": k.get("kanteling", 0), "begin": k.get("begin", 0.5)}
        print(f"{k['slug']}: {pad.stat().st_size // 1024} kB")
    (ROOT / "site" / "data" / "bollen.json").write_text(json.dumps(lijst, ensure_ascii=False, indent=1))

if __name__ == "__main__":
    main()
