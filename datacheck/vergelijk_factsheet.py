"""Legt Wikidata naast de NASA Planetary Fact Sheet (nssdc.gsfc.nasa.gov/planetary/factsheet/)
voor massa, diameter, zwaartekracht, omlooptijd en aantal manen (P398 telt ook ringen e.d.).
Leest uitkomsten/nasa_factsheet.html (eerst downloaden met curl), schrijft uitkomsten/vergelijking_factsheet.json."""
import json, re, html
from pathlib import Path
UIT = Path(__file__).parent / "uitkomsten"
t = (UIT / "nasa_factsheet.html").read_text()
fs = {}
for r in re.findall(r"<tr.*?</tr>", t, re.S | re.I):
    c = [html.unescape(re.sub(r"<.*?>", "", x)).strip().replace(",", "").rstrip("*") for x in re.findall(r"<t[dh].*?>(.*?)</t[dh]>", r, re.S | re.I)]
    if c and c[0]: fs[c[0]] = c[1:]
kol = ["mercurius", "venus", "aarde", "maan", "mars", "jupiter", "saturnus", "uranus", "neptunus", "pluto"]
ww = json.loads((UIT / "wikidata_waarden.json").read_text())
wd = json.loads((UIT / "wikidata.json").read_text())
F = {"Yg": 1e21, "kg": 1, "solar": None}
def massa_kg(vs):
    for a, u, q, h in vs:
        if u == "yottagram": return a * 1e21
        if u == "kilogram": return a
        if u == "ronnagram": return a * 1e24
def eerste(vs, eenheid, voorkeur=None):
    kand = [v for v in vs if v[1] == eenheid]
    if voorkeur:
        for v in kand:
            if v[2] == voorkeur: return v[0]
    return kand[0][0] if kand else None
uit = {}
print(f'{"":10s} {"massa 10^24 kg":>22s} {"diameter km":>18s} {"g m/s2":>14s} {"omloop d":>18s} {"manen":>10s}')
for i, k in enumerate(kol):
    w = ww.get(k, {})
    m = massa_kg(w.get("massa", []))
    d = eerste(w.get("diameter", []), "kilometre")
    g = eerste(w.get("zwaartekracht", []), "metre per square second")
    o = eerste(w.get("omlooptijd", []), "day")
    manen = wd[k]["eigenschappen"].get("P398", {}).get("n", 0)
    n = {"massa": float(fs["Mass (1024kg)"][i]), "diameter": float(fs["Diameter (km)"][i]),
         "g": float(fs["Gravity (m/s2)"][i]), "omloop": float(fs["Orbital Period (days)"][i]),
         "manen": int(fs["Number of Moons"][i])}
    uit[k] = {"wikidata": {"massa": m and m / 1e24, "diameter": d, "g": g, "omloop": o, "P398": manen}, "nasa": n}
    f = lambda x: "-" if x is None else f"{x:g}"
    print(f'{k:10s} {f(m and m/1e24):>10s} {n["massa"]:>10g}  {f(d):>8s} {n["diameter"]:>8g}  {f(g):>6s} {n["g"]:>6g}  {f(o):>8s} {n["omloop"]:>8g}  {manen:>4d} {n["manen"]:>4d}')
(UIT / "vergelijking_factsheet.json").write_text(json.dumps(uit, indent=1))
