"""Kaarten voor de draaiende bollen: ophalen, verkleinen tot 1024x512 en de lijst site/data/bollen.json maken.
Keuze, bron en licentie per hemellichaam staan in data/bollen_keuze.json (nagekeken in docs/bollen-datacheck.md)."""
import io, json, pathlib, urllib.request
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
LABEL = {"echt": "echte kleur", "benaderd": "kleur benaderd", "versterkt": "kleur versterkt", "vals": "valse kleur", "zwart-wit": "zwart-wit"}

def temperatuur_uit_bv(bv):
    """Ballesteros (2012): temperatuur van een ster uit de kleurindex B-V."""
    return 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62))

def kleur_uit_temperatuur(t):
    """Kleur van een gloeiend lichaam (zwarte straler), benadering van Tanner Helland; helderste kanaal op 255."""
    import math
    t /= 100
    r = 255 if t <= 66 else 329.698727446 * ((t - 60) ** -0.1332047592)
    g = 99.4708025861 * math.log(t) - 161.1195681661 if t <= 66 else 288.1221695283 * ((t - 60) ** -0.0755148492)
    b = 255 if t >= 66 else (0 if t <= 19 else 138.5177312231 * math.log(t - 10) - 305.0447927307)
    c = [max(0, min(255, v)) for v in (r, g, b)]
    m = max(c)
    return [round(v * 255 / m) for v in c]

def ringen(r, pad):
    """Ringen van Saturnus: hoe dicht, per afstand, uit de radiometing van Cassini (PDS, CORSS_8001, Rev007E, 10 km).
    Doorzichtigheid = 1 - e^(-tau); waar het signaal helemaal werd tegengehouden (tau boven de drempel): dicht."""
    import math
    rijen = []
    for regel in (ROOT / "data" / "ruw" / "cassini_rss_ringen_tau.tab").read_text().splitlines():
        v = [float(x) for x in regel.split(",")]
        rijen.append((v[0], v[6], v[8]))
    N = 1024
    som, aantal = [0.0] * N, [0] * N
    for straal, tau, drempel in rijen:
        if not r["binnen_km"] <= straal < r["buiten_km"]: continue
        i = int((straal - r["binnen_km"]) / (r["buiten_km"] - r["binnen_km"]) * N)
        dicht = 0.97 if tau >= drempel else 1 - math.exp(-max(0.0, tau))
        som[i] += dicht; aantal[i] += 1
    img = Image.new("RGBA", (N, 1))
    for i in range(N):
        a = som[i] / aantal[i] if aantal[i] else 0
        img.putpixel((i, 0), (*r["rgb"], round(a * 255)))
    img.save(pad)
    return {"pad": "/bollen/" + pad.name, "binnen": r["binnen_km"] / r["straal_km"], "buiten": r["buiten_km"] / r["straal_km"]}

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
    # zonder kaart: een egale bol in de kleur van een echte foto of uit metingen
    fotos = json.loads((ROOT / "site" / "data" / "fotos.json").read_text())
    for k in json.loads((ROOT / "data" / "bollen_keuze.json").read_text()).get("egaal", []):
        rgb = k.get("rgb") or kleur_uit_temperatuur(k["temperatuur"] if "temperatuur" in k else temperatuur_uit_bv(k["bv"]))
        Image.new("RGB", (64, 32), tuple(rgb)).save(uit_map / f"{k['slug']}.png")
        bron = fotos[k["foto"]]["pagina"] if k.get("foto") else k["bron"]
        item = {"pad": f"/bollen/{k['slug']}.png", "groot": f"/bollen/{k['slug']}.png", "label": k["label"], "kleur": "egaal", "uitleg": k["uitleg"],
                "maker": k["maker"], "licentie": k["licentie"], "bron": bron, "kanteling": k.get("kanteling", 0), "helling": k.get("helling", 0), "begin": 0.5,
                "gloeit": k.get("soort") == "ster"}
        if k.get("ringen"):
            item["ringen"] = ringen(k["ringen"], uit_map / f"{k['slug']}-ringen.png")
        lijst[k["slug"]] = item
        print(f"{k['slug']}: egaal {rgb}")
    (ROOT / "site" / "data" / "bollen.json").write_text(json.dumps(lijst, ensure_ascii=False, indent=1))

if __name__ == "__main__":
    main()
