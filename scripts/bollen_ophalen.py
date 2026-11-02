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
    Image.MAX_IMAGE_PIXELS = None
    haal = lambda url: Image.open(io.BytesIO(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "deruimte/1.0 (sterrenstof.ai)"}), timeout=300).read())).convert("RGB")
    for k in keuze:
        bron = haal(k["url"])
        pad = uit_map / f"{k['slug']}.jpg"
        bron.resize((1024, 512), Image.LANCZOS).save(pad, "JPEG", quality=82, optimize=True, progressive=True)
        # voor de grote bol op de detailpagina: 2048 breed, als er een scherpe genoeg bron is
        groot_bron = haal(k["url_groot"]) if k.get("url_groot") else bron
        groot = None
        if groot_bron.width >= 2048:
            groot = f"/bollen/{k['slug']}-groot.jpg"
            groot_bron.resize((2048, 1024), Image.LANCZOS).save(uit_map / f"{k['slug']}-groot.jpg", "JPEG", quality=80, optimize=True, progressive=True)
        lijst[k["slug"]] = {"pad": f"/bollen/{k['slug']}.jpg", "groot": groot or f"/bollen/{k['slug']}.jpg", "label": f"kaart · {LABEL[k['kleur']]}", "kleur": k["kleur"], "uitleg": k["uitleg"],
                            "maker": k["maker"], "licentie": k["licentie"], "bron": k["bron"], "kanteling": k.get("kanteling", 0), "begin": k.get("begin", 0.5)}
        print(f"{k['slug']}: {pad.stat().st_size // 1024} kB" + (f", groot {(uit_map / (k['slug'] + '-groot.jpg')).stat().st_size // 1024} kB" if groot else ""))
    (ROOT / "site" / "data" / "bollen.json").write_text(json.dumps(lijst, ensure_ascii=False, indent=1))

if __name__ == "__main__":
    main()
