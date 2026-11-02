"""Derde bron, los van astronomy-engine en Horizons: Skyfield (MIT) met JPL-efemeride DE421.
1) sterren (Poolster, Sirius, Betelgeuze) op de drie momenten, met dezelfde RA/Dec (Wikidata/Hipparcos);
2) ISS-overgangen vanavond met dezelfde TLE (uitkomsten/iss_tle.json), en of het ISS dan in de zon staat.
3) op- en ondergang van zon, maan en planeten.
Schrijft uitkomsten/skyfield.json. Downloadt de421.bsp (17 MB) naar de scratch-map, niet in de repo."""
import json, os
from pathlib import Path
from skyfield.api import load, wgs84, Star, EarthSatellite
from skyfield import almanac
UIT = Path(__file__).parent / "uitkomsten"
hz = json.loads((UIT / "horizons.json").read_text())
P = hz["plek"]
ld = load.__class__(os.environ.get("SKYFIELD_DATA", "/tmp/skyfield"))
ts = ld.timescale()
eph = ld("de421.bsp")
aarde = eph["earth"]
plek = wgs84.latlon(P["lat"], P["lon"], elevation_m=P["hoogte_m"])
waar = aarde + plek
STER = {"poolster": (37.95456067, 89.26410897), "sirius": (101.287155333, -16.716115861), "betelgeuze": (88.792938991, 7.407063995)}
uit = {"sterren": {}, "iss": [], "op_onder": {}}
for k, (ra, dec) in STER.items():
    s = Star(ra_hours=ra / 15, dec_degrees=dec)
    uit["sterren"][k] = []
    for m in hz["momenten_utc"]:
        t = ts.utc(*[int(x) for x in m.replace("-", " ").replace(":", " ").split()])
        alt, az, _ = waar.at(t).observe(s).apparent().altaz()
        uit["sterren"][k].append({"utc": m, "az": az.degrees, "hoogte": alt.degrees})
    print(k, [(round(x["az"], 3), round(x["hoogte"], 3)) for x in uit["sterren"][k]])
tle = json.loads((UIT / "iss_tle.json").read_text())
iss = EarthSatellite(tle["line1"], tle["line2"], "ISS", ts)
t0, t1 = ts.utc(2026, 11, 2, 15), ts.utc(2026, 11, 3, 6)
tijden, gebeurt = iss.find_events(plek, t0, t1, altitude_degrees=10.0)
naam = ["op (10°)", "hoogste punt", "onder (10°)"]
for t, e in zip(tijden, gebeurt):
    alt, az, _ = (iss - plek).at(t).altaz()
    zon_alt = waar.at(t).observe(eph["sun"]).apparent().altaz()[0].degrees
    zonnig = iss.at(t).is_sunlit(eph)
    uit["iss"].append({"utc": t.utc_iso(), "wat": naam[e], "az": round(az.degrees, 1), "hoogte": round(alt.degrees, 1),
                       "zon_hoogte": round(zon_alt, 1), "iss_in_zon": bool(zonnig)})
    print("ISS", t.utc_iso(), naam[e], round(az.degrees), round(alt.degrees), "zon", round(zon_alt, 1), "iss in zon", zonnig)
for k, b in {"zon": "sun", "maan": "moon", "mercurius": "mercury", "venus": "venus", "mars": "mars", "jupiter": "jupiter barycenter",
             "saturnus": "saturn barycenter"}.items():
    f = almanac.risings_and_settings(eph, eph[b], plek)
    tt, yy = almanac.find_discrete(ts.utc(2026, 11, 2, 0), ts.utc(2026, 11, 3, 12), f)
    uit["op_onder"][k] = [{"utc": t.utc_iso(), "wat": "op" if y else "onder"} for t, y in zip(tt, yy)]
    print(k, [(x["wat"], x["utc"][5:16]) for x in uit["op_onder"][k]])
t = ts.utc(2026, 11, 2, 19)
print("maanfase (graden)", almanac.moon_phase(eph, t).degrees, "verlicht", almanac.fraction_illuminated(eph, "moon", t))
(UIT / "skyfield.json").write_text(json.dumps(uit, indent=1))
