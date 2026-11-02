"""Voegt de lagen samen tot de data die de site leest.

  data/kern.json          de vaste kern, met de hand gekozen
  data/ruw/               automatisch opgehaald (scripts/ruw_ophalen.py)
  data/handwerk/<slug>    met de hand: weetjes met bron, kleur van de foto, zin voor de kinderversie
  data/nagekeken.json     uitkomst van scripts/nakijken.py

Schrijft site/data/hemel.json, site/data/sterren.json en site/data/sterrenbeelden.json.
Getallen staan er al als Nederlandse tekst in ("12.756 km"), met per getal de bron.
Alleen standaardbibliotheek.
"""
import html, json, math, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RUW = ROOT / "data" / "ruw"
SITE = ROOT / "site" / "data"
G = 6.674e-20  # km^3 / (kg s^2)
AE_KM = 149_597_870.7

FS_URL = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/"
SUN_URL = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html"
SATS_PHYS = "https://ssd.jpl.nasa.gov/sats/phys_par/"
SATS_ELEM = "https://ssd.jpl.nasa.gov/sats/elem/"
SBDB = "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr="
WD = "https://www.wikidata.org/wiki/"

# met de hand, met bron: wat in geen van de tabellen staat
HAND = {
    "eris": [("Diameter", "ongeveer 2400 km", "https://science.nasa.gov/dwarf-planets/eris/", 2400)],
}
STERRENBEELD = {"sirius": "Grote Hond", "betelgeuze": "Orion", "vega": "Lier"}
STERRENBEELD_FIX = {"Scl": "Beeldhouwer", "Ari": "Ram", "Cnc": "Kreeft"}


def getal(x, dec=0):
    """Nederlandse notatie: punt voor duizendtallen, komma voor decimalen."""
    s = f"{x:,.{dec}f}".replace(",", "_").replace(".", ",").replace("_", ".")
    return s


def rond(x):
    """Afronden op een getal dat een mens kan lezen."""
    if x >= 100: return getal(round(x, -int(math.log10(x)) + 2))
    if x >= 10: return getal(x, 0) if abs(x - round(x)) < 0.05 else getal(x, 1)
    if x >= 1: return getal(x, 1)
    return getal(x, 2)


def tabel(pad):
    t = (RUW / pad).read_text(errors="replace")
    rijen = []
    for r in re.findall(r"<tr.*?</tr>", t, re.S | re.I):
        c = [re.sub(r"\s+", " ", html.unescape(re.sub(r"<.*?>", "", x))).strip() for x in re.findall(r"<t[dh].*?>(.*?)</t[dh]>", r, re.S | re.I)]
        if c: rijen.append(c)
    return rijen


def factsheet():
    fs = {}
    rijen = tabel("nasa_factsheet.html")
    kop = rijen[0][1:]
    for c in rijen[1:]:
        if not c[0]: continue
        for i, k in enumerate(kop):
            if i + 1 < len(c): fs.setdefault(k, {})[c[0]] = c[i + 1].replace(",", "").rstrip("*")
    return fs


def sats():
    phys, elem = {}, {}
    for c in tabel("jpl_sats_phys.html"):
        if len(c) >= 6 and c[2].isdigit():
            def num(x):
                try: return float(x.split()[0])
                except (ValueError, IndexError): return None
            phys[c[1]] = {"GM": num(c[3]), "R": num(c[4]), "rho": num(c[5])}
    for c in tabel("jpl_sats_elem.html"):
        if len(c) >= 14 and c[3].isdigit() and c[2] not in elem:
            elem[c[2]] = {"a": float(c[7].rstrip(".")), "P": float(c[13])}
    return phys, elem


def cijfer(naam, tekst, bron, **extra):
    return {"naam": naam, "tekst": tekst, "bron": bron, **extra}


def main():
    kern = json.loads((ROOT / "data" / "kern.json").read_text())["lijst"]
    wd = json.loads((RUW / "wikidata.json").read_text())
    sb = json.loads((RUW / "sbdb.json").read_text())
    nk = json.loads((ROOT / "data" / "nagekeken.json").read_text()) if (ROOT / "data" / "nagekeken.json").exists() else {}
    fotos = json.loads((SITE / "fotos.json").read_text()) if (SITE / "fotos.json").exists() else {}
    geluid = json.loads((SITE / "geluid.json").read_text()) if (SITE / "geluid.json").exists() else {}
    fs = factsheet()
    phys, elem = sats()
    aarde_d = float(fs["EARTH"]["Diameter (km)"])
    aarde_m = float(fs["EARTH"]["Mass (1024kg)"]) * 1e24

    uit = []
    for k in kern:
        s = k["slug"]
        hw_pad = ROOT / "data" / "handwerk" / f"{s}.json"
        hw = json.loads(hw_pad.read_text()) if hw_pad.exists() else {}
        w = wd.get(s) or {}
        c, schaal, baan = [], {}, {}

        if k.get("fs"):
            f = fs[k["fs"]]
            d = float(f["Diameter (km)"]); m = float(f["Mass (1024kg)"]) * 1e24
            schaal["diameter_km"] = d
            c.append(cijfer("Diameter", f"{getal(d)} km", FS_URL))
            if s != "aarde":
                c.append(cijfer("Zo breed als", f"{rond(d / aarde_d)} keer de aarde" if d > aarde_d else f"{getal(d / aarde_d * 100)} procent van de aarde", FS_URL))
                c.append(cijfer("Zo zwaar als", f"{rond(m / aarde_m)} keer de aarde" if m > aarde_m else f"{rond(m / aarde_m * 100)} procent van de aarde", FS_URL))
            c.append(cijfer("Zwaartekracht", f"{getal(float(f['Gravity (m/s2)']), 1)} m/s²", FS_URL))
            schaal["g"] = float(f["Gravity (m/s2)"])
            dag = float(f["Length of Day (hours)"])
            c.append(cijfer("Een dag", f"{rond(dag)} uur" if dag < 48 else f"{rond(dag / 24)} aardse dagen", FS_URL, uitleg="van zonsopkomst tot zonsopkomst"))
            if s != "maan":
                jr = float(f["Orbital Period (days)"])
                c.append(cijfer("Een jaar", f"{rond(jr)} aardse dagen" if jr < 800 else f"{rond(jr / 365.25)} aardse jaren", FS_URL, uitleg="één rondje om de zon"))
                afst = float(f["Distance from Sun (106 km)"])
                c.append(cijfer("Afstand tot de zon", f"{rond(afst)} miljoen km", FS_URL, uitleg="gemiddeld"))
                baan.update(a_km=afst * 1e6, periode_d=jr, e=float(f["Orbital Eccentricity"]), i=float(f["Orbital Inclination (degrees)"]))
            else:
                c.append(cijfer("Afstand tot de aarde", "384.400 km", FS_URL, uitleg="gemiddeld"))
                c.append(cijfer("Rondje om de aarde", "27,3 dagen", FS_URL))
                baan.update(a_km=384_400, periode_d=27.3, om="aarde")
            c.append(cijfer("Temperatuur", f"{getal(float(f['Mean Temperature (C)']))} °C", FS_URL, uitleg="gemiddeld"))
            if s != "maan":
                c.append(cijfer("Manen", f"{f['Number of Moons']}", FS_URL, uitleg="volgens NASA; er worden steeds nieuwe gevonden"))
        elif k.get("jpl"):
            p, e = phys[k["jpl"]], elem[k["jpl"]]
            d = 2 * p["R"]; m = p["GM"] / G; g = p["GM"] / p["R"] ** 2 * 1000
            schaal.update(diameter_km=d, g=g)
            c.append(cijfer("Diameter", f"{getal(d)} km", SATS_PHYS, uitleg="gemiddeld"))
            if d / aarde_d >= 0.01:
                c.append(cijfer("Zo breed als", f"{getal(d / aarde_d * 100)} procent van de aarde", SATS_PHYS))
            c.append(cijfer("Zwaartekracht", f"{getal(g, 2 if g < 1 else 1)} m/s²", SATS_PHYS, uitleg="uitgerekend uit massa en straal"))
            c.append(cijfer("Afstand tot " + {"aarde": "de aarde"}.get(k["ouder"], next(x["naam"] for x in kern if x["slug"] == k["ouder"])), f"{getal(e['a'])} km", SATS_ELEM, uitleg="gemiddeld"))
            per = e["P"]
            c.append(cijfer("Rondje om " + ("de aarde" if k["ouder"] == "aarde" else next(x["naam"] for x in kern if x["slug"] == k["ouder"])), f"{rond(per * 24)} uur" if per < 2 else f"{rond(per)} dagen", SATS_ELEM, uitleg="achteruit" if s == "triton" else None))
            baan.update(a_km=e["a"], periode_d=per, om=k["ouder"])
        elif s == "zon":
            rij = {r[0]: r[1] for r in tabel("nasa_sunfact.html") if len(r) >= 2}
            d = 2 * float(rij["Volumetric mean radius (km)"].replace(",", "").rstrip("."))
            schaal.update(diameter_km=d, g=float(rij["Surface gravity (eq.) (m/s2)"]))
            c.append(cijfer("Diameter", f"{getal(round(d, -3))} km", SUN_URL))
            c.append(cijfer("Zo breed als", f"{rond(d / aarde_d)} keer de aarde", SUN_URL))
            c.append(cijfer("Zo zwaar als", f"{rond(float(rij['Mass (1024 kg)'].replace(',', '').rstrip('.')) * 1e24 / aarde_m)} keer de aarde", SUN_URL))
            c.append(cijfer("Zwaartekracht", f"{getal(schaal['g'])} m/s²", SUN_URL, uitleg="aan het oppervlak"))
            c.append(cijfer("Afstand tot de aarde", "149,6 miljoen km", SUN_URL, uitleg="gemiddeld"))
            c.append(cijfer("Temperatuur", "5500 °C aan de buitenkant, 15 miljoen °C in het hart", SUN_URL, uitleg="5772 K en 1,571 × 10⁷ K"))
        elif k.get("sbdb"):
            o = sb[s]["orbit"]; el = {x["name"]: float(x["value"]) for x in o["elements"]}
            ph = {x["name"]: x["value"] for x in sb[s].get("phys_par", [])}
            url = SBDB + urllib_q(k["sbdb"])
            if "diameter" in ph:
                schaal["diameter_km"] = float(ph["diameter"])
                c.append(cijfer("Diameter", f"{getal(float(ph['diameter']), 1 if float(ph['diameter']) < 100 else 0)} km", url))
            for naam, tekst, bron, d in HAND.get(s, []):
                c.append(cijfer(naam, tekst, bron)); schaal["diameter_km"] = d
            if "rot_per" in ph:
                c.append(cijfer("Een dag", f"{getal(float(ph['rot_per']), 1)} uur", url, uitleg="één keer om zichzelf"))
            jr = el["per"]
            c.append(cijfer("Een jaar", f"{rond(jr)} aardse dagen" if jr < 800 else f"{rond(jr / 365.25)} aardse jaren", url, uitleg="één rondje om de zon"))
            c.append(cijfer("Afstand tot de zon", f"{rond(el['q'] * AE_KM / 1e6)} tot {rond(el['ad'] * AE_KM / 1e6)} miljoen km", url, uitleg="dichtstbij en verst weg"))
            baan.update(a_km=el["a"] * AE_KM, periode_d=jr, e=el["e"], i=el["i"],
                        kepler={"epoch_jd": float(o["epoch"]), **{x: el[x] for x in ("e", "a", "i", "om", "w", "tp", "n")}})
        elif k["soort"] == "ster":
            par = float(w["parallax_mas"]); lj = 1000 / par * 3.26156
            if s == "betelgeuze":  # de parallax van Hipparcos is hier onbetrouwbaar; ESO noemt meer dan 700 lichtjaar
                c.append(cijfer("Afstand", "500 tot 700 lichtjaar", "https://www.eso.org/public/news/eso2003/", uitleg="onzeker: Hipparcos mat ongeveer 500, ESO schrijft 'meer dan 700'"))
                c.append(cijfer("Het licht van vanavond vertrok", "honderden jaren geleden", "https://www.eso.org/public/news/eso2003/"))
            else:
                c.append(cijfer("Afstand", f"{rond(lj)} lichtjaar", WD + w["qid"], uitleg="uit de parallax gemeten door de satelliet Hipparcos"))
                c.append(cijfer("Het licht van vanavond vertrok", f"{rond(lj)} jaar geleden", WD + w["qid"]))
            if w.get("mag"): c.append(cijfer("Helderheid", f"{getal(float(w['mag']), 1)}", WD + w["qid"], uitleg="hoe lager, hoe helderder; de zwakste sterren die je ziet zijn ongeveer 6"))
            c.append(cijfer("Sterrenbeeld", STERRENBEELD[s], "https://www.iau.org/public/themes/constellations/"))
            baan["ster"] = {"ra": float(w["ra"]), "dec": float(w["dec"]), "parallax_mas": par}

        n = nk.get(s, {})
        item = {
            "slug": s, "naam": k["naam"], "titel": k["kort"], "soort": k["soort"], "ouder": k.get("ouder"), "nr": k.get("nr"),
            "ae": k.get("ae"), "qid": w.get("qid"), "wiki": w.get("nlwiki"),
            "kort": hw.get("kort", ""), "kinderzin": hw.get("kinderzin", ""),
            "weetjes": [{"tekst": x["tekst"], "bron": x["bron"]} for x in hw.get("weetjes", [])],
            "nagekeken": bool(hw) and n.get("alles", False), "nagekeken_datum": n.get("datum"),
            "cijfers": [{kk: vv for kk, vv in x.items() if vv is not None} for x in c],
            "schaal": schaal, "baan": baan,
            "foto": s if s in fotos else None, "geluid": geluid.get(s, []),
        }
        uit.append(item)
    for it in uit:  # manen bij hun planeet
        it["manen"] = [x["slug"] for x in uit if x["ouder"] == it["slug"] and x["soort"] == "maan"]
    SITE.mkdir(parents=True, exist_ok=True)
    (SITE / "hemel.json").write_text(json.dumps(uit, ensure_ascii=False, separators=(",", ":")))

    # sterren tot helderheid 5 (wat je in een donkere tuin kunt zien), met eigennamen
    st = json.loads((RUW / "d3_stars.6.json").read_text())
    namen = json.loads((RUW / "d3_starnames.json").read_text())
    sterren = []
    for f in st["features"]:
        mag = f["properties"]["mag"]
        if mag > 5: continue
        ra, dec = f["geometry"]["coordinates"]
        sterren.append([round(ra % 360, 3), round(dec, 3), mag, round(float(f["properties"].get("bv") or 0.6), 2), namen.get(str(f["id"]), {}).get("name", "")])
    (SITE / "sterren.json").write_text(json.dumps(sterren, ensure_ascii=False, separators=(",", ":")))
    lijnen = json.loads((RUW / "d3_constellations.lines.json").read_text())
    nl = json.loads((RUW / "sterrenbeelden_nl.json").read_text())
    sb_uit = {}
    for f in lijnen["features"]:
        a = f["id"]
        naam = STERRENBEELD_FIX.get(a) or (nl.get(a) or {}).get("nl") or a
        sb_uit[a] = {"nl": naam, "lijnen": [[[round(p[0] % 360, 2), round(p[1], 2)] for p in l] for l in f["geometry"]["coordinates"]]}
    (SITE / "sterrenbeelden.json").write_text(json.dumps(sb_uit, ensure_ascii=False, separators=(",", ":")))
    # de Melkweg: vijf lagen van zwak naar helder (d3-celestial), vereenvoudigd tot ongeveer een punt per graad
    import math
    mw = json.loads((RUW / "d3_mw.json").read_text())
    def hoek(a, b):
        r = math.radians
        c = math.sin(r(a[1])) * math.sin(r(b[1])) + math.cos(r(a[1])) * math.cos(r(b[1])) * math.cos(r(a[0] - b[0]))
        return math.degrees(math.acos(max(-1, min(1, c))))
    lagen = []
    for f in sorted(mw["features"], key=lambda f: f["id"]):
        ringen = []
        for poly in f["geometry"]["coordinates"]:
            for ring in poly:
                kort = [ring[0]]
                for q in ring[1:]:
                    if hoek(kort[-1], q) >= 0.8: kort.append(q)
                if len(kort) >= 4: ringen.append([[round(q[0] % 360, 1), round(q[1], 1)] for q in kort])
        lagen.append(ringen)
    (SITE / "melkweg.json").write_text(json.dumps(lagen, separators=(",", ":")))
    print(f"{len(uit)} hemellichamen ({sum(x['nagekeken'] for x in uit)} nagekeken), {len(sterren)} sterren, {len(sb_uit)} sterrenbeelden")


def urllib_q(s):
    from urllib.parse import quote
    return quote(s)


if __name__ == "__main__":
    main()
