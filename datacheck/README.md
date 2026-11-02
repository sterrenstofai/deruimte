# Datacheck fase 1

Draaien vanuit deze map. Python 3 (standaardbibliotheek; `skyfield_check.py` heeft `pip install skyfield` nodig) en Node 22 (`npm install` voor astronomy-engine en satellite.js).

| Script | Wat | Uitkomst |
|---|---|---|
| `testset.py` | de twintig hemellichamen en de plek (Enschede) | |
| `wikidata_sparql.py` | Q-nummer, Nederlandse naam, foto (P18), per eigenschap: aantal waarden en hoeveel met bron | `uitkomsten/wikidata.json` |
| `wikidata_waarden.py` | alle waarden met eenheid en kwalificatie voor massa, straal, zwaartekracht enz. | `uitkomsten/wikidata_waarden.json` |
| `vergelijk_factsheet.py` | Wikidata naast de NASA Planetary Fact Sheet (eerst `curl` de pagina naar `uitkomsten/nasa_factsheet.html`) | `uitkomsten/vergelijking_factsheet.json` |
| `nasa_beeld.py` | NASA Image and Video Library: treffers, tekeningen, valse kleuren, makers van buiten NASA; en audio | `uitkomsten/nasa_beeld.json` |
| `horizons.py` | JPL Horizons: azimut en hoogte op drie momenten vanavond; baanelementen Ceres en Halley | `uitkomsten/horizons.json`, `uitkomsten/sbdb.json` |
| `posities.mjs` | astronomy-engine en satellite.js naast Horizons | `uitkomsten/posities.json` |
| `skyfield_check.py` | derde bron (Skyfield + DE421): sterren, ISS-overgangen, op- en ondergang | `uitkomsten/skyfield.json` |
| `vanavond.mjs` | de proef "wat zie je vanavond" in gewone taal, vergeleken met Skyfield | `uitkomsten/vanavond.json` |
| `iss_nu.mjs` | ISS nu: satellite.js naast wheretheiss.at | `uitkomsten/iss_nu.json` |
| `sterrenbeelden.py` | Nederlandse namen en P18 van de sterrenbeelden in Wikidata | `uitkomsten/sterrenbeelden.json` |

Met de hand: `uitkomsten/geluid.json` (geluid per hemellichaam) en `uitkomsten/voorwaarden.md` (licenties en voorwaarden per bron, met citaten).

`iss_tle.json` komt van `https://api.wheretheiss.at/v1/satellites/25544/tles` (2 november 2026).
