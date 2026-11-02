"""Posities van ruimtesondes uit JPL Horizons (mag niet vanuit de website: alleen hier, in een Action).
Schrijft site/data/sondes.json met per sonde:
  - route: heliocentrische posities (ecliptica J2000, AE) elke 30 dagen, van de lancering tot nu (of tot het einde)
  - nu: per dag, van gisteren tot over 62 dagen, de plek aan de hemel gezien vanuit het middelpunt van de aarde
        (RA/Dec J2000, graden) en de afstand tot de aarde (km). De site rekent daarmee in de browser verder.
Draait maandelijks. Eén vraag tegelijk, met een pauze."""
import json, time, urllib.parse, urllib.request
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = "de-ruimte/0.1 (github.com/sterrenstofai)"
AE_KM = 149_597_870.7
SONDES = {  # slug: (Horizons-ID, begin route, einde of None)
    "voyager-1": ("-31", "1977-09-08", None),
    "voyager-2": ("-32", "1977-08-23", None),
    "new-horizons": ("-98", "2006-01-21", None),
    "juno": ("-61", "2011-08-07", None),
    "jwst": ("-170", "2021-12-27", None),
    "cassini": ("-82", "1997-10-17", "2017-09-14"),
}

def vraag(p):
    p = {"format": "json", "OBJ_DATA": "'NO'", "MAKE_EPHEM": "'YES'", "CSV_FORMAT": "'YES'", **p}
    url = "https://ssd.jpl.nasa.gov/api/horizons.api?" + urllib.parse.urlencode(p)
    for poging in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=120) as r:
                res = json.load(r)["result"]
            time.sleep(1.5)
            if "$$SOE" not in res: raise RuntimeError(res[:300])
            return [[c.strip() for c in l.split(",")] for l in res.split("$$SOE")[1].split("$$EOE")[0].strip().splitlines()]
        except Exception as e:
            print("  opnieuw:", e); time.sleep(5 * (poging + 1))
    raise RuntimeError("Horizons gaf geen antwoord")

def main():
    vandaag = date.today()
    uit = {"opgehaald": vandaag.isoformat(), "sondes": {}}
    for slug, (hid, begin, einde) in SONDES.items():
        stop = einde or vandaag.isoformat()
        rijen = vraag({"COMMAND": f"'{hid}'", "EPHEM_TYPE": "'VECTORS'", "CENTER": "'500@10'", "START_TIME": f"'{begin}'", "STOP_TIME": f"'{stop}'",
                       "STEP_SIZE": "'30d'", "VEC_TABLE": "'1'", "OUT_UNITS": "'AU-D'", "REF_PLANE": "'ECLIPTIC'"})
        route = [[r[1].split()[1], round(float(r[2]), 4), round(float(r[3]), 4), round(float(r[4]), 4)] for r in rijen]
        s = {"horizons": hid, "route": route}
        if not einde:
            nu = vraag({"COMMAND": f"'{hid}'", "EPHEM_TYPE": "'OBSERVER'", "CENTER": "'500@399'", "START_TIME": f"'{vandaag - timedelta(days=1)}'",
                        "STOP_TIME": f"'{vandaag + timedelta(days=62)}'", "STEP_SIZE": "'1d'", "QUANTITIES": "'1,20'", "ANG_FORMAT": "'DEG'"})
            s["nu"] = [[r[0].split()[0], round(float(r[3]), 5), round(float(r[4]), 5), round(float(r[5]) * AE_KM)] for r in nu]
        uit["sondes"][slug] = s
        print(slug, len(route), "routepunten", f"nu {s['nu'][1][3] / 1e9:.2f} miljard km" if "nu" in s else "(afgelopen)")
    (ROOT / "site" / "data" / "sondes.json").write_text(json.dumps(uit, separators=(",", ":")))

if __name__ == "__main__":
    main()
