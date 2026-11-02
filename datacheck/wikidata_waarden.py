"""Alle waarden (met eenheid, kwalificatie 'bepaling' en bron ja/nee) voor een paar
kerneigenschappen, om ze naast de NASA Planetary Fact Sheet te leggen.
Schrijft uitkomsten/wikidata_waarden.json."""
import json, urllib.parse, urllib.request
from pathlib import Path
from testset import UA
UIT = Path(__file__).parent / "uitkomsten"
wd = json.loads((UIT / "wikidata.json").read_text())
qids = " ".join("wd:" + d["qid"] for d in wd.values())
Q = """SELECT ?item ?prop ?amount ?unitLabel ?qualLabel ?hasref WHERE {
  VALUES ?item { %s }
  VALUES (?p ?psv ?prop) { (p:P2067 psv:P2067 "massa") (p:P2120 psv:P2120 "straal") (p:P2386 psv:P2386 "diameter")
    (p:P7015 psv:P7015 "zwaartekracht") (p:P2076 psv:P2076 "temperatuur") (p:P2146 psv:P2146 "omlooptijd")
    (p:P2583 psv:P2583 "afstand tot aarde") (p:P2147 psv:P2147 "rotatietijd") }
  ?item ?p ?st . ?st ?psv ?vn . ?vn wikibase:quantityAmount ?amount ; wikibase:quantityUnit ?unit .
  ?unit rdfs:label ?unitLabel FILTER(LANG(?unitLabel)="en")
  OPTIONAL { ?st ?pq ?qual . ?qprop wikibase:qualifier ?pq . ?qual rdfs:label ?qualLabel FILTER(LANG(?qualLabel)="en") }
  BIND(EXISTS { ?st prov:wasDerivedFrom ?r } AS ?hasref)
}""" % qids
url = "https://query.wikidata.org/sparql?" + urllib.parse.urlencode({"query": Q, "format": "json"})
with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=180) as r:
    rows = json.load(r)["results"]["bindings"]
q2k = {d["qid"]: k for k, d in wd.items()}
uit = {}
for r in rows:
    k = q2k[r["item"]["value"].rsplit("/", 1)[-1]]
    e = uit.setdefault(k, {}).setdefault(r["prop"]["value"], [])
    rij = [float(r["amount"]["value"]), r["unitLabel"]["value"], r.get("qualLabel", {}).get("value"), r["hasref"]["value"] == "true"]
    if rij not in e: e.append(rij)
(UIT / "wikidata_waarden.json").write_text(json.dumps(uit, ensure_ascii=False, indent=1))
for k, e in uit.items():
    for p, vs in e.items():
        print(f"{k:10s} {p:17s}", "; ".join(f"{a:g} {u}" + (f" [{q}]" if q else "") + ("" if h else " (geen bron)") for a, u, q, h in vs))
