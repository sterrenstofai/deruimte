"""Foto's uit de NASA Image and Video Library (en één van ESO), zoals met de hand gekozen in
data/foto_keuze.json. Schrijft site/fotos/<slug>.webp (hooguit 1200 px) en site/data/fotos.json
met maker, credit, licentie, bronpagina en de uitleg over de kleur uit data/handwerk/.

NASA-beelden zijn meestal vrij te gebruiken met naamsvermelding, maar de credit kan een derde
noemen (ESA, een universiteit): die staat er dan letterlijk bij. Alleen standaardbibliotheek + Pillow.
"""
import io, json, re, time, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
UA = "de-ruimte/0.1 (github.com/sterrenstofai)"

def haal(url, ruw=False):
    for p in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=120) as r:
                b = r.read(); time.sleep(.5)
                return b if ruw else json.loads(b)
        except Exception as e:
            print("  opnieuw", url[:90], e); time.sleep(4 * (p + 1))
    raise RuntimeError(url)

def nasa(nid, groot=False):
    d = haal("https://images-api.nasa.gov/search?" + urllib.parse.urlencode({"nasa_id": nid}))["collection"]["items"][0]["data"][0]
    bestanden = haal(f"https://images-api.nasa.gov/asset/{urllib.parse.quote(nid)}")["collection"]["items"]
    urls = [b["href"].replace("http://", "https://") for b in bestanden]
    kies = next((u for s in (("~orig.jpg",) if groot else ()) + ("~large.jpg", "~medium.jpg", "~orig.jpg", "~orig.tif") for u in urls if u.endswith(s)), urls[0])
    credit = " ".join(x for x in (d.get("secondary_creator"), d.get("photographer")) if x).strip()
    m = re.search(r"Credit:?\s*([^\n<]{5,200}?)(?:\.\s|$)", d.get("description", ""))
    if m: credit = m.group(1).strip()
    return {"url": kies, "titel": d.get("title"), "datum": d.get("date_created", "")[:10], "credit": credit or "NASA",
            "pagina": f"https://images.nasa.gov/details/{urllib.parse.quote(nid)}", "bron": "NASA Image and Video Library",
            "licentie": "NASA-mediarichtlijnen: vrij te gebruiken met naamsvermelding"}

def eso(nid):
    return {"url": f"https://cdn.eso.org/images/large/{nid}.jpg", "titel": nid, "credit": "ESO/M. Montargès et al.",
            "pagina": f"https://www.eso.org/public/images/{nid}/", "bron": "ESO", "licentie": "CC BY 4.0"}

def snij(beeld, u):
    if u == "helder":  # rond het heldere deel (de maan in een zwarte lucht): zwaartepunt en straal van de heldere pixels
        g = beeld.convert("L"); k = 4
        klein = g.resize((g.width // k, g.height // k))
        pix = [(x, y) for y in range(klein.height) for x in range(klein.width) if klein.getpixel((x, y)) > 110]
        cx = sum(p[0] for p in pix) / len(pix) * k; cy = sum(p[1] for p in pix) / len(pix) * k
        r = (len(pix) / 3.1416) ** 0.5 * k * 1.35
        return beeld.crop((int(max(0, cx - r)), int(max(0, cy - r)), int(min(beeld.width, cx + r)), int(min(beeld.height, cy + r))))
    W, H = beeld.size
    return beeld.crop((int(u[0] * W), int(u[1] * H), int(u[2] * W), int(u[3] * H)))

def main():
    keuze = {k: v for k, v in json.loads((ROOT / "data" / "foto_keuze.json").read_text()).items() if not k.startswith("_")}
    doel = ROOT / "site" / "fotos"; doel.mkdir(parents=True, exist_ok=True)
    pad = ROOT / "site" / "data" / "fotos.json"
    oud = json.loads(pad.read_text()) if pad.exists() else {}
    uit = {}
    for slug, v in keuze.items():
        id_ = v.get("nasa_id") or v.get("eso")
        hand = json.loads((ROOT / "data" / "handwerk" / f"{slug}.json").read_text()).get("foto", {}) if (ROOT / "data" / "handwerk" / f"{slug}.json").exists() else {}
        if slug in oud and oud[slug].get("id") == id_ and (doel / f"{slug}.webp").exists():
            uit[slug] = {**oud[slug], "kleur": hand.get("kleur"), "uitleg": hand.get("uitleg")}; continue
        i = nasa(id_, v.get("uitsnede") == "helder") if "nasa_id" in v else eso(id_)
        beeld = Image.open(io.BytesIO(haal(i["url"], True))).convert("RGB")
        if v.get("uitsnede"): beeld = snij(beeld, v["uitsnede"])
        beeld.thumbnail((1200, 1200))
        beeld.save(doel / f"{slug}.webp", "WEBP", quality=82)
        uit[slug] = {"id": id_, **{k: i[k] for k in ("titel", "credit", "pagina", "bron", "licentie")}, "pad": f"/fotos/{slug}.webp",
                     "breed": beeld.width, "hoog": beeld.height, "uitsnede": bool(v.get("uitsnede")),
                     "kleur": hand.get("kleur"), "uitleg": hand.get("uitleg")}
        print(slug, id_, beeld.size, "|", i["credit"][:70])
    pad.write_text(json.dumps(uit, ensure_ascii=False, indent=1))

if __name__ == "__main__":
    main()
