"""Baangegevens (TLE) van het ISS voor de browser: site/data/iss.json.
Eerst CelesTrak (één keer per dag is ruim binnen hun regels: hooguit één download per update,
en meteen stoppen bij een fout), anders wheretheiss.at. Draait dagelijks in een GitHub Action.
De site zegt hoe oud de gegevens zijn: een TLE van een paar dagen oud is minder precies."""
import json, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = "de-ruimte/0.1 (github.com/sterrenstofai)"

def lees(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60) as r:
        if r.status != 200: raise RuntimeError(r.status)
        return r.read().decode()

def epoch(line1):
    jj, dag = int(line1[18:20]), float(line1[20:32])
    jaar = 2000 + jj if jj < 57 else 1900 + jj
    return datetime(jaar, 1, 1, tzinfo=timezone.utc).timestamp() + (dag - 1) * 86400

def main():
    uit = None
    try:
        t = lees("https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE").strip().splitlines()
        uit = {"naam": t[0].strip(), "line1": t[1].strip(), "line2": t[2].strip(), "bron": "CelesTrak"}
    except Exception as e:
        print("CelesTrak lukt niet:", e)
        j = json.loads(lees("https://api.wheretheiss.at/v1/satellites/25544/tles"))
        uit = {"naam": j["header"], "line1": j["line1"], "line2": j["line2"], "bron": "wheretheiss.at"}
    uit["epoch"] = epoch(uit["line1"])
    uit["opgehaald"] = time.time()
    (ROOT / "site" / "data" / "iss.json").write_text(json.dumps(uit, indent=1))
    print(uit["bron"], datetime.fromtimestamp(uit["epoch"], timezone.utc).isoformat())

if __name__ == "__main__":
    main()
