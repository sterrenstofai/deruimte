"""Eén SPARQL-vraag aan Wikidata voor de hele testset: Nederlandse naam en
beschrijving, nl-Wikipedia, afbeelding (P18), en per eigenschap of er een waarde
is en of die waarde een bron (referentie) heeft. Losse API-vragen geven 429.
Zoekt op Engels label; bij meerdere items: het item met de meeste Wikipedia's.
Schrijft uitkomsten/wikidata.json."""
import json, urllib.parse, urllib.request
from pathlib import Path
from testset import HEMELLICHAMEN, UA

UIT = Path(__file__).parent / "uitkomsten"
EIGENSCHAPPEN = {
    "P2067": "massa", "P2120": "straal", "P2386": "diameter", "P2054": "dichtheid",
    "P2076": "temperatuur", "P7015": "zwaartekracht aan oppervlak", "P2233": "halve lange as",
    "P2146": "omlooptijd", "P2147": "rotatietijd", "P2583": "afstand tot aarde",
    "P1215": "schijnbare helderheid", "P575": "ontdekt (datum)", "P61": "ontdekker",
    "P398": "manen/kind", "P397": "draait om", "P59": "sterrenbeeld", "P215": "spectraalklasse",
    "P18": "afbeelding", "P51": "geluid", "P4896": "3D-model", "P367": "astronomisch symbool",
}

def vraag(q):
    url = "https://query.wikidata.org/sparql?" + urllib.parse.urlencode({"query": q, "format": "json"})
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.load(r)["results"]["bindings"]

labels = " ".join('"%s"@en' % en.replace('"', '\\"') for _, _, en, _, _ in HEMELLICHAMEN)
# stap 1: label -> kandidaat-items met aantal sitelinks
kand = vraag("""SELECT ?label ?item ?sites WHERE {
  VALUES ?label { %s }
  ?item rdfs:label ?label ; wikibase:sitelinks ?sites .
}""" % labels)
items = {}
for r in kand:
    lab, q, s = r["label"]["value"], r["item"]["value"].rsplit("/", 1)[-1], int(r["sites"]["value"])
    if lab not in items or s > items[lab][1]:
        items[lab] = (q, s)

qids = " ".join("wd:" + q for q, _ in items.values())
props = " ".join("wdt:" + p for p in EIGENSCHAPPEN)
# stap 2: per item de basis
basis = vraag("""SELECT ?item ?nl ?nldesc ?nlwiki ?img ?sites WHERE {
  VALUES ?item { %s }
  ?item wikibase:sitelinks ?sites .
  OPTIONAL { ?item rdfs:label ?nl FILTER(LANG(?nl)="nl") }
  OPTIONAL { ?item schema:description ?nldesc FILTER(LANG(?nldesc)="nl") }
  OPTIONAL { ?nlwiki schema:about ?item ; schema:isPartOf <https://nl.wikipedia.org/> }
  OPTIONAL { ?item wdt:P18 ?img }
}""" % qids)
# stap 3: per item en eigenschap: aantal waarden, aantal met referentie, een voorbeeldwaarde met eenheid
stmts = vraag("""SELECT ?item ?prop (COUNT(DISTINCT ?st) AS ?n) (COUNT(DISTINCT ?stref) AS ?nref)
  (SAMPLE(?v) AS ?voorbeeld) (SAMPLE(?unitLabel) AS ?eenheid) WHERE {
  VALUES ?item { %s }
  VALUES ?wdt { %s }
  ?prop wikibase:directClaim ?wdt ; wikibase:claim ?p ; wikibase:statementProperty ?ps ;
        wikibase:statementValue ?psv .
  ?item ?p ?st . ?st ?ps ?v .
  OPTIONAL { ?st ?psv ?vn . ?vn wikibase:quantityUnit ?unit .
             ?unit rdfs:label ?unitLabel FILTER(LANG(?unitLabel)="en") }
  OPTIONAL { ?st prov:wasDerivedFrom ?ref . BIND(?st AS ?stref) }
} GROUP BY ?item ?prop""" % (qids, props))

uit = {}
q2key = {}
for key, naam, en, _, soort in HEMELLICHAMEN:
    q, s = items.get(en, (None, 0))
    q2key[q] = key
    uit[key] = {"naam": naam, "en": en, "qid": q, "sitelinks": s, "eigenschappen": {}, "img": []}
for r in basis:
    k = q2key[r["item"]["value"].rsplit("/", 1)[-1]]
    d = uit[k]
    d["nl"] = r.get("nl", {}).get("value"); d["nldesc"] = r.get("nldesc", {}).get("value")
    d["nlwiki"] = r.get("nlwiki", {}).get("value")
    img = r.get("img", {}).get("value")
    if img and img not in d["img"]:
        d["img"].append(img)
for r in stmts:
    k = q2key[r["item"]["value"].rsplit("/", 1)[-1]]
    p = r["prop"]["value"].rsplit("/", 1)[-1]
    v = r.get("voorbeeld", {}).get("value", "")
    uit[k]["eigenschappen"][p] = {"naam": EIGENSCHAPPEN[p], "n": int(r["n"]["value"]),
        "met_bron": int(r["nref"]["value"]), "voorbeeld": v[:80], "eenheid": r.get("eenheid", {}).get("value")}
(UIT / "wikidata.json").write_text(json.dumps(uit, ensure_ascii=False, indent=1))
for k, d in uit.items():
    e = d["eigenschappen"]
    tot = sum(x["n"] for p, x in e.items() if p not in ("P18",))
    ref = sum(x["met_bron"] for p, x in e.items() if p not in ("P18",))
    print(f'{k:11s} {d["qid"]:9s} {d["sitelinks"]:4d} nl={d.get("nl")!s:22.22s} props={len(e):2d} waarden={tot:3d} met_bron={ref:3d} img={len(d["img"])}')
