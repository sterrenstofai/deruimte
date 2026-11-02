"""NASA Image and Video Library (images-api.nasa.gov, CORS open): per hemellichaam de
eerste 100 beelden. Telt hoe vaak de beschrijving zegt dat het een tekening/impressie is,
of valse/versterkte kleuren heeft, en hoe vaak er een niet-NASA-maker in de credit staat
(dan is het mogelijk geen publiek domein). Schrijft uitkomsten/nasa_beeld.json.
Woorden-telling is een grove indicatie: elke foto moet je alsnog zelf bekijken."""
import json, re, time, urllib.parse, urllib.request
from pathlib import Path
from testset import HEMELLICHAMEN, UA
UIT = Path(__file__).parent / "uitkomsten"
ZOEK = {"zon": "sun SDO", "maan": "moon", "aarde": "earth from space", "halley": "comet halley",
        "poolster": "polaris star", "betelgeuze": "betelgeuse", "sirius": "sirius star",
        "iss": "international space station", "europa": "europa moon jupiter", "titan": "titan saturn moon",
        "io": "io jupiter moon", "ceres": "ceres dawn"}
TEKENING = re.compile(r"artist'?s? (concept|impression|rendering|illustration)|illustration|rendering|animation|artist concept|simulated|simulation|computer[- ]generated|conceptual image", re.I)
VALS = re.compile(r"false[- ]colou?r|enhanced[- ]colou?r|exaggerated colou?r|color[- ]enhanced|representative colou?r|processed to enhance", re.I)
NIET_NASA = re.compile(r"\b(ESA|ESO|Getty|AP Photo|Reuters|Kevin M\.? Gill|Gerald Eichst|Seán Doran|Bjorn J[oó]nsson|Ted Stryk|Roscosmos|JAXA|CNES|Caltech/ (?!JPL)|copyright|©)", re.I)
uit = {}
for key, naam, en, _, _ in HEMELLICHAMEN:
    q = ZOEK.get(key, en)
    url = "https://images-api.nasa.gov/search?" + urllib.parse.urlencode({"q": q, "media_type": "image", "page_size": 100})
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60) as r:
        js = json.load(r)["collection"]
    items = js["items"]
    n_teken = n_vals = n_derde = 0
    voorbeelden = []
    for it in items:
        m = it["data"][0]
        tekst = " ".join(str(m.get(f, "")) for f in ("title", "description", "description_508", "keywords"))
        credit = " ".join(str(m.get(f, "")) for f in ("photographer", "secondary_creator", "center"))
        t = bool(TEKENING.search(tekst)); v = bool(VALS.search(tekst)); d = bool(NIET_NASA.search(credit + " " + tekst[:4000]))
        n_teken += t; n_vals += v; n_derde += d
        if len(voorbeelden) < 6:
            voorbeelden.append({"id": m["nasa_id"], "titel": m.get("title", "")[:90], "datum": m.get("date_created", "")[:10],
                                "credit": credit.strip()[:80], "tekening": t, "valse_kleur": v, "derde": d})
    uit[key] = {"zoek": q, "totaal": js.get("metadata", {}).get("total_hits"), "bekeken": len(items),
                "tekening": n_teken, "valse_kleur": n_vals, "derde_partij": n_derde, "voorbeelden": voorbeelden}
    print(f'{key:11s} {q:28s} treffers={uit[key]["totaal"]!s:>6s} bekeken={len(items):3d} tekening={n_teken:3d} valse_kleur={n_vals:3d} derde={n_derde:3d}')
    time.sleep(1)
# geluid
geluid = {}
for q in ["sonification", "Voyager plasma sound", "sounds of space", "Juno Waves", "Perseverance microphone Mars sound", "Cassini radio Saturn sound", "InSight marsquake sound", "Chandra sonification"]:
    url = "https://images-api.nasa.gov/search?" + urllib.parse.urlencode({"q": q, "media_type": "audio", "page_size": 100})
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60) as r:
        items = json.load(r)["collection"]["items"]
    geluid[q] = [{"id": i["data"][0]["nasa_id"], "titel": i["data"][0].get("title", "")[:100], "datum": i["data"][0].get("date_created", "")[:10]} for i in items]
    print(f"geluid {q!r}: {len(items)}", [g["titel"][:50] for g in geluid[q][:5]])
    time.sleep(1)
(UIT / "nasa_beeld.json").write_text(json.dumps({"beeld": uit, "geluid": geluid}, ensure_ascii=False, indent=1))
