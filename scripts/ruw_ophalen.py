"""Haalt de ruwe data op voor de vaste kern en zet die in data/ruw/.
Draait maandelijks in een GitHub Action, en kan ook met de hand.

- NASA Planetary Fact Sheet (nssdc.gsfc.nasa.gov): planeten, de maan, Pluto
- JPL: fysieke gegevens en banen van manen (ssd.jpl.nasa.gov/sats/)
- JPL Small-Body Database (sbdb.api): Ceres, Eris, kometen; baanelementen voor de browser
- Wikidata (één SPARQL-vraag): Q-nummer, Nederlandse naam, nl-Wikipedia, en voor sterren RA/Dec, parallax, helderheid

Alleen standaardbibliotheek. Horizons en SBDB mogen niet vanuit de website (JPL-voorwaarden), dus hier.
"""
import json, time, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RUW = ROOT / "data" / "ruw"
UA = "de-ruimte/0.1 (github.com/sterrenstofai)"

def haal(url, ruw=False):
    for poging in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=120) as r:
                b = r.read()
                time.sleep(1)  # één vraag tegelijk, rustig aan
                return b if ruw else json.loads(b)
        except Exception as e:
            print("  opnieuw:", url[:80], e)
            time.sleep(5 * (poging + 1))
    raise RuntimeError(url)

def main():
    RUW.mkdir(parents=True, exist_ok=True)
    kern = json.loads((ROOT / "data" / "kern.json").read_text())["lijst"]
    (RUW / "nasa_factsheet.html").write_bytes(haal("https://nssdc.gsfc.nasa.gov/planetary/factsheet/", True))
    (RUW / "nasa_sunfact.html").write_bytes(haal("https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html", True))
    # sterren en lijnen van sterrenbeelden: d3-celestial (Olaf Frohn, BSD-3-Clause)
    D3 = "https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/"
    for f in ("stars.6.json", "constellations.lines.json", "starnames.json", "mw.json"):
        (RUW / f"d3_{f}").write_bytes(haal(D3 + f, True))
    # Nederlandse namen van de sterrenbeelden
    q88 = """SELECT ?afk ?nl ?en WHERE { ?item wdt:P31 wd:Q8928 ; wdt:P1813 ?afk . FILTER(STRLEN(STR(?afk)) = 3)
      ?item rdfs:label ?en FILTER(LANG(?en)="en") OPTIONAL { ?item rdfs:label ?nl FILTER(LANG(?nl)="nl") } }"""
    r88 = haal("https://query.wikidata.org/sparql?" + urllib.parse.urlencode({"query": q88, "format": "json"}))["results"]["bindings"]
    (RUW / "sterrenbeelden_nl.json").write_text(json.dumps({r["afk"]["value"]: {"nl": r.get("nl", {}).get("value"), "en": r["en"]["value"]} for r in r88}, ensure_ascii=False, indent=1))
    (RUW / "jpl_sats_phys.html").write_bytes(haal("https://ssd.jpl.nasa.gov/sats/phys_par/", True))
    (RUW / "jpl_sats_elem.html").write_bytes(haal("https://ssd.jpl.nasa.gov/sats/elem/", True))
    sb = {}
    for k in kern:
        if k.get("sbdb"):
            sb[k["slug"]] = haal("https://ssd-api.jpl.nasa.gov/sbdb.api?" + urllib.parse.urlencode({"sstr": k["sbdb"], "phys-par": "1", "full-prec": "1"}))
    (RUW / "sbdb.json").write_text(json.dumps(sb, indent=1))
    # Wikidata: label -> item met de meeste Wikipedia's, alleen hemellichamen (draait om iets, of staat in een sterrenbeeld)
    labels = " ".join('"%s"@en' % k["en"].replace('"', '\\"') for k in kern)
    q = """SELECT ?label ?item ?sites ?nl ?nlwiki ?ra ?dec ?par ?mag WHERE {
      VALUES ?label { %s }
      ?item rdfs:label ?label ; wikibase:sitelinks ?sites .
      FILTER EXISTS { { ?item wdt:P397 [] } UNION { ?item wdt:P59 [] } UNION { ?item wdt:P31 wd:Q5871 } }
      OPTIONAL { ?item rdfs:label ?nl FILTER(LANG(?nl)="nl") }
      OPTIONAL { ?nlwiki schema:about ?item ; schema:isPartOf <https://nl.wikipedia.org/> }
      OPTIONAL { ?item wdt:P6257 ?ra } OPTIONAL { ?item wdt:P6258 ?dec } OPTIONAL { ?item wdt:P2214 ?par }
      OPTIONAL { ?item wdt:P1215 ?mag }
    }""" % labels
    rijen = haal("https://query.wikidata.org/sparql?" + urllib.parse.urlencode({"query": q, "format": "json"}))["results"]["bindings"]
    wd = {}
    for r in rijen:
        lab = r["label"]["value"]
        s = int(r["sites"]["value"])
        if lab in wd and wd[lab]["sites"] > s:
            continue
        v = lambda x: r.get(x, {}).get("value")
        if lab in wd and wd[lab]["sites"] == s:
            continue  # eerste rij van hetzelfde item houden
        wd[lab] = {"qid": v("item").rsplit("/", 1)[-1], "sites": s, "nl": v("nl"), "nlwiki": v("nlwiki"),
                   "ra": v("ra"), "dec": v("dec"), "parallax_mas": v("par"), "mag": v("mag")}
    uit = {k["slug"]: wd.get(k["en"]) for k in kern}
    (RUW / "wikidata.json").write_text(json.dumps(uit, ensure_ascii=False, indent=1))
    for k, v in uit.items():
        print(f"{k:14s}", v and v["qid"], v and v["nl"])

if __name__ == "__main__":
    main()
