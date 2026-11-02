"""Nederlandse namen van de 88 IAU-sterrenbeelden in Wikidata (instance of Q8928, met IAU-afkorting P3083?
nee: P1813 korte naam is te wisselend; we nemen items met eigenschap 'IAU-afkorting' niet, maar tellen
alle items 'sterrenbeeld' met een IAU-verwijzing). Plus: lijnen uit Stellarium (western) en d3-celestial.
Schrijft uitkomsten/sterrenbeelden.json."""
import json, urllib.parse, urllib.request
from pathlib import Path
from testset import UA
UIT = Path(__file__).parent / "uitkomsten"
Q = """SELECT ?item ?en ?nl ?afk ?img WHERE {
  ?item wdt:P31 wd:Q8928 ; wdt:P1813 ?afk . FILTER(STRLEN(STR(?afk)) = 3)
  ?item rdfs:label ?en FILTER(LANG(?en)="en")
  OPTIONAL { ?item rdfs:label ?nl FILTER(LANG(?nl)="nl") }
  OPTIONAL { ?item wdt:P18 ?img }
}"""
url = "https://query.wikidata.org/sparql?" + urllib.parse.urlencode({"query": Q, "format": "json"})
rows = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=120))["results"]["bindings"]
uit = {}
for r in rows:
    a = r["afk"]["value"]
    uit.setdefault(a, {"en": r["en"]["value"], "nl": r.get("nl", {}).get("value"), "img": r.get("img", {}).get("value")})
print("sterrenbeelden met 3-letterafkorting:", len(uit), "met nl-naam:", sum(1 for v in uit.values() if v["nl"]))
for a in ["UMa", "UMi", "Cas", "Ori", "Cyg", "Leo", "Lyr", "CMa"]:
    print(a, uit.get(a))
(UIT / "sterrenbeelden.json").write_text(json.dumps(uit, ensure_ascii=False, indent=1))
