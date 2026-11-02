"""Tweede bron voor posities: JPL Horizons (ssd.jpl.nasa.gov/api/horizons.api).
Per hemellichaam uit de testset: azimut en hoogte (zonder breking), RA/Dec van datum,
helderheid en verlicht deel, gezien vanaf PLEK, op drie momenten vanavond.
Horizons heeft geen CORS-header: dit kan alleen vanuit een script/Action, niet vanuit de browser.
Ook: baanelementen van Ceres en Halley uit de Small-Body Database (sbdb.api).
Schrijft uitkomsten/horizons.json en uitkomsten/sbdb.json."""
import json, time, urllib.parse, urllib.request
from pathlib import Path
from testset import HEMELLICHAMEN, PLEK, UA
UIT = Path(__file__).parent / "uitkomsten"
MOMENTEN = ["2026-11-02 17:00", "2026-11-02 19:00", "2026-11-02 21:00"]  # UTC = 18, 20, 22 uur in Nederland

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=120) as r:
        return json.load(r)

uit = {}
for key, naam, en, hid, soort in HEMELLICHAMEN:
    if not hid or key == "aarde":
        continue
    p = {"format": "json", "COMMAND": f"'{hid}'", "OBJ_DATA": "'NO'", "MAKE_EPHEM": "'YES'", "EPHEM_TYPE": "'OBSERVER'",
         "CENTER": "'coord@399'", "COORD_TYPE": "'GEODETIC'",
         "SITE_COORD": f"'{PLEK['lon']},{PLEK['lat']},{PLEK['hoogte_m']/1000}'",
         "TLIST": "'" + "' '".join(MOMENTEN) + "'", "TLIST_TYPE": "'CAL'", "TIME_TYPE": "'UT'",
         "QUANTITIES": "'2,4,9,10'", "ANG_FORMAT": "'DEG'", "APPARENT": "'AIRLESS'", "CSV_FORMAT": "'YES'", "EXTRA_PREC": "'YES'"}
    js = get("https://ssd.jpl.nasa.gov/api/horizons.api?" + urllib.parse.urlencode(p))
    res = js.get("result", "")
    rijen = []
    if "$$SOE" in res:
        kop = [c.strip() for c in res.split("$$SOE")[0].strip().splitlines()[-2].split(",")]
        for regel in res.split("$$SOE")[1].split("$$EOE")[0].strip().splitlines():
            rijen.append(dict(zip(kop, [c.strip() for c in regel.split(",")])))
    else:
        rijen = [{"fout": res[:600]}]
    uit[key] = rijen
    r0 = rijen[1] if len(rijen) > 1 else rijen[0]
    print(f'{key:10s}', {k: r0.get(k) for k in ("Date__(UT)__HR:MN", "Azimuth_(a-app)", "Elevation_(a-app)", "APmag", "T-mag", "Illu%")} if "fout" not in r0 else r0["fout"][:300])
    time.sleep(1)
(UIT / "horizons.json").write_text(json.dumps({"plek": PLEK, "momenten_utc": MOMENTEN, "uitkomsten": uit}, indent=1))
sb = {}
for s in ["1", "1P"]:
    sb[s] = get("https://ssd-api.jpl.nasa.gov/sbdb.api?" + urllib.parse.urlencode({"sstr": s, "phys-par": "1", "full-prec": "1"}))
    o = sb[s]["orbit"]; print(s, sb[s]["object"]["fullname"], "epoch", o["epoch"], [(e["name"], e["value"]) for e in o["elements"]][:9])
(UIT / "sbdb.json").write_text(json.dumps(sb, indent=1))
